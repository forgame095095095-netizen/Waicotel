import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  UserCheck, 
  AlertCircle,
  Clock,
  UserPlus,
  LogIn,
  KeyRound,
  Scale
} from 'lucide-react';
import { UserProfile, RelationType } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface SmsAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (user: UserProfile) => void;
  onSuccessRegister?: (user: UserProfile) => void;
  onOpenAdminLogin?: () => void;
  usersDb: UserProfile[];
  initialMode?: 'login' | 'register';
}

// Utility to normalize phones for strict duplicate checks (e.g. +7 928 095-77-88 -> 79280957788)
export const normalizePhoneNumber = (phoneStr: string): string => {
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    return '7' + digits.slice(1);
  }
  return digits;
};

export const SmsAuthModal: React.FC<SmsAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  onSuccessRegister,
  onOpenAdminLogin,
  usersDb = [],
  initialMode = 'login',
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorRelation, setGuarantorRelation] = useState<RelationType>('Брат');
  const [city, setCity] = useState('г. Грозный');
  const [occupation, setOccupation] = useState('Предприниматель');

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDuplicatePhone, setIsDuplicatePhone] = useState(false);

  // Target user found on login
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setStep('form');
      setErrorMessage('');
      setIsDuplicatePhone(false);
      setOtpCode('');
      if (initialMode === 'register') {
        setPhone('+7 (928) ');
        setGuarantorPhone('+7 (928) ');
      }
    }
  }, [isOpen, initialMode]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  // Handle Form Submit: Validation & Duplicate Phone Check
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsDuplicatePhone(false);

    const normPhone = normalizePhoneNumber(phone);
    if (!normPhone || normPhone.length < 10) {
      setErrorMessage('Пожалуйста, укажите полный номер телефона (не менее 10 цифр)');
      return;
    }

    if (authMode === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('Пожалуйста, укажите ФИО (Имя и Фамилию)');
        return;
      }

      const normGuarantor = normalizePhoneNumber(guarantorPhone);
      if (!normGuarantor || normGuarantor.length < 10) {
        setErrorMessage('Пожалуйста, укажите резервный номер поручителя (Кафила)');
        return;
      }

      if (normPhone === normGuarantor) {
        setErrorMessage('Основной номер и номер поручителя не могут совпадать');
        return;
      }

      // Check duplicate phone in database
      const existingUser = usersDb.find(u => normalizePhoneNumber(u.phone) === normPhone);
      if (existingUser) {
        setIsDuplicatePhone(true);
        setErrorMessage('Этот номер уже зарегистрирован. Пожалуйста, войдите в аккаунт.');
        return;
      }

      playButtonTap();
      setStep('otp');
      setTimer(45);
      setCanResend(false);
    } else {
      // Login Mode: Check if user exists
      const existingUser = usersDb.find(u => normalizePhoneNumber(u.phone) === normPhone);
      if (!existingUser) {
        setErrorMessage('Пользователь с таким номером не найден в базе. Пожалуйста, зарегистрируйтесь.');
        return;
      }

      setMatchedUser(existingUser);
      playButtonTap();
      setStep('otp');
      setTimer(45);
      setCanResend(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMessage('Введите 4-значный проверочный SMS-код');
      return;
    }

    setIsVerifying(true);
    playButtonTap();

    setTimeout(() => {
      setIsVerifying(false);
      playSuccessChime();

      if (authMode === 'register') {
        const nowStr = new Date().toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const newUser: UserProfile = {
          id: `user_${Date.now()}`,
          fullName: fullName.trim(),
          phone: phone.trim(),
          city: city.trim() || 'г. Грозный',
          occupation: occupation.trim() || 'Предприниматель',
          registrationStatus: 'pending', // PENDING APPROVAL SCREEN WILL BLOCK DASHBOARD
          registeredAt: `Сегодня, ${nowStr.split(',')[1]?.trim() || '12:00'}`,
          verificationTier: 1,
          isOccupationVerified: false,
          isPassportVerified: false,
          isPhoneVerified: true,
          isGuarantorVerified: false,
          guarantorName: guarantorName.trim() || `Поручитель (${guarantorRelation})`,
          guarantorPhone: guarantorPhone.trim(),
          guarantorRelation: guarantorRelation,
          verificationStatus: 'pending',
          amanaScore: 75,
          totalSaved: 0,
          completedKotelsCount: 0,
          hasSignedContract: true,
        };

        setStep('success');
        setTimeout(() => {
          if (onSuccessRegister) {
            onSuccessRegister(newUser);
          }
          onClose();
        }, 1200);
      } else {
        // Login success
        const target = matchedUser || usersDb.find(u => normalizePhoneNumber(u.phone) === normalizePhoneNumber(phone)) || usersDb[0];
        setStep('success');
        setTimeout(() => {
          if (onSuccessLogin && target) {
            onSuccessLogin(target);
          }
          onClose();
        }, 1000);
      }
    }, 600);
  };

  const handleUseTestOtp = () => {
    playButtonTap();
    setOtpCode('1234');
    setErrorMessage('');
  };

  const handleFillDemoUser = (user: UserProfile) => {
    playButtonTap();
    setPhone(user.phone);
    setErrorMessage('');
    setIsDuplicatePhone(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10">
      <div className="relative w-full max-w-lg bg-[#091511] border-2 border-[#d4af37]/45 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-200 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950/90 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shadow-inner">
              {authMode === 'register' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                {step === 'form' && (authMode === 'register' ? 'Регистрация в «Вай Котел»' : 'Вход в аккаунт (SMS)')}
                {step === 'otp' && 'Подтверждение SMS-кода'}
                {step === 'success' && (authMode === 'register' ? 'Заявка отправлена!' : 'Успешный вход!')}
              </h2>
              <p className="text-xs text-slate-400">
                {step === 'form' && (authMode === 'register' ? 'Создание учетной записи с поручителем' : 'Введите номер телефона для получения SMS-кода')}
                {step === 'otp' && `Код отправлен на номер ${phone}`}
                {step === 'success' && 'Переход в систему...'}
              </p>
            </div>
          </div>

          <button
            onClick={() => { playButtonTap(); onClose(); }}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Auth Mode Switcher Tabs (Only on form step) */}
        {step === 'form' && (
          <div className="flex rounded-2xl bg-[#04100c] p-1 border border-slate-800 mb-4">
            <button
              type="button"
              onClick={() => {
                playButtonTap();
                setAuthMode('login');
                setErrorMessage('');
                setIsDuplicatePhone(false);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Вход по номеру</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playButtonTap();
                setAuthMode('register');
                setErrorMessage('');
                setIsDuplicatePhone(false);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Новая регистрация</span>
            </button>
          </div>
        )}

        {/* STEP 1: FORM (LOGIN OR REGISTRATION) */}
        {step === 'form' && (
          <form onSubmit={handleProceedToOtp} className="space-y-4">
            
            {/* LOGIN MODE VIEW */}
            {authMode === 'login' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Основной номер телефона:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#d4af37] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (928) 095-77-88"
                      className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] pl-10 pr-3.5 py-2.5 rounded-xl text-sm text-white font-mono focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Quick login helper with existing DB users */}
                <div className="bg-[#04120e] border border-slate-800 p-3 rounded-2xl space-y-2">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    Зарегистрированные пользователи в базе (нажмите для быстрого ввода):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {usersDb.slice(0, 4).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleFillDemoUser(u)}
                        className="px-2.5 py-1 rounded-lg bg-[#020b08] border border-slate-700 hover:border-[#d4af37] text-[11px] text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <span className={`w-2 h-2 rounded-full ${u.registrationStatus === 'approved' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        <span>{u.fullName.split(' ')[0]}</span>
                        <span className="font-mono text-[10px] text-slate-400">({u.phone.slice(-5)})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* REGISTRATION MODE VIEW */}
            {authMode === 'register' && (
              <div className="space-y-3">
                <div className="bg-[#051711] border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>После регистрации ваша заявка поступит на модерацию администратору (обычно 1–3 часа).</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ФИО заявителя (Имя и Фамилия): <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Например: Алихан Дудаев"
                    className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3.5 py-2 rounded-xl text-xs sm:text-sm text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Основной телефон: <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#d4af37] absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setIsDuplicatePhone(false);
                          setErrorMessage('');
                        }}
                        placeholder="+7 (928) 123-45-67"
                        className={`w-full bg-[#030e0a] border pl-9 pr-3 py-2 rounded-xl text-xs font-mono text-white focus:outline-none ${
                          isDuplicatePhone ? 'border-rose-500 bg-rose-950/20' : 'border-slate-700 focus:border-[#d4af37]'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Резервный номер (Поручитель): <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={guarantorPhone}
                        onChange={(e) => setGuarantorPhone(e.target.value)}
                        placeholder="+7 (928) 987-65-43"
                        className="w-full bg-[#030e0a] border border-slate-700 focus:border-amber-400 pl-9 pr-3 py-2 rounded-xl text-xs font-mono text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Кем приходится поручитель:
                    </label>
                    <select
                      value={guarantorRelation}
                      onChange={(e) => setGuarantorRelation(e.target.value as RelationType)}
                      className="w-full bg-[#030e0a] border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Брат">Брат</option>
                      <option value="Отец">Отец</option>
                      <option value="Дядя">Дядя</option>
                      <option value="Друг">Друг</option>
                      <option value="Близкий друг">Близкий друг</option>
                      <option value="Коллега">Коллега</option>
                      <option value="Родственник">Родственник</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Город проживания:
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="г. Грозный"
                      className="w-full bg-[#030e0a] border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Род деятельности (профессия):
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Например: Предприниматель / Торговля"
                    className="w-full bg-[#030e0a] border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* DUPLICATE PHONE / GENERAL ERROR ALERT */}
            {errorMessage && (
              <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                isDuplicatePhone
                  ? 'bg-rose-950/80 border-rose-500/80 text-rose-200 shadow-lg shadow-rose-950/40'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
                {isDuplicatePhone && (
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">Хотите войти с этим номером?</span>
                    <button
                      type="button"
                      onClick={() => {
                        playButtonTap();
                        setAuthMode('login');
                        setErrorMessage('');
                        setIsDuplicatePhone(false);
                      }}
                      className="px-3 py-1 bg-[#d4af37] text-black font-bold rounded-lg text-xs hover:bg-[#f59e0b] cursor-pointer"
                    >
                      Перейти ко входу →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black shadow-emerald-950/30'
                  : 'bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black shadow-amber-900/30'
              }`}
            >
              <span>{authMode === 'register' ? 'Зарегистрироваться (Отправить на проверку)' : 'Получить SMS-код для входа'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: OTP CODE VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-[#051711] border border-slate-700 p-3.5 rounded-2xl text-center space-y-2">
              <span className="text-xs text-slate-300 block">
                Мы отправили 4-значный проверочный код на номер:
              </span>
              <strong className="text-sm font-mono text-emerald-400 block">
                {phone}
              </strong>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleUseTestOtp}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold hover:bg-emerald-900 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Вставить тестовый код: <strong>1234</strong></span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
                Введите 4-значный код из SMS:
              </label>
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • •"
                className="w-full bg-[#030e0a] border border-[#d4af37]/60 focus:border-[#fef08a] py-3 text-center text-2xl tracking-[0.5em] font-mono font-bold text-[#fef08a] rounded-2xl focus:outline-none shadow-inner"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {timer > 0 ? `Повтор через ${timer} сек.` : 'Код не пришел?'}
                </span>
              </div>

              <button
                type="button"
                disabled={!canResend}
                onClick={() => {
                  setTimer(45);
                  setCanResend(false);
                  playButtonTap();
                }}
                className={`font-semibold transition-colors ${
                  canResend
                    ? 'text-[#d4af37] hover:text-[#fef08a] cursor-pointer'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                Отправить код еще раз
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-3.5 py-3 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Назад
              </button>
              <button
                type="submit"
                disabled={isVerifying}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Проверка кода...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Подтвердить и продолжить</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {authMode === 'register' ? 'Заявка на регистрацию принята!' : 'Вход успешно выполнен!'}
              </h3>
              <p className="text-xs text-slate-300">
                {authMode === 'register' 
                  ? 'Статус заявки: «На рассмотрении (Pending)». Ожидайте подтверждения.'
                  : 'Загрузка профиля и графика сборов...'}
              </p>
            </div>
          </div>
        )}

        {/* Admin Login Portal Shortcut in footer */}
        {onOpenAdminLogin && step === 'form' && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Вы модератор сервиса?</span>
            <button
              type="button"
              onClick={() => {
                playButtonTap();
                onClose();
                onOpenAdminLogin();
              }}
              className="text-[#d4af37] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Вход для Администратора (admin)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
