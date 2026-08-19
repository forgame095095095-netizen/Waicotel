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
  Clock
} from 'lucide-react';
import { UserProfile } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface SmsAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (user: UserProfile) => void;
  onSuccess?: () => void;
  currentUser?: UserProfile;
  phone?: string;
}

export const SmsAuthModal: React.FC<SmsAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  onSuccess,
  currentUser,
  phone: initialPhone,
}) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [fullName, setFullName] = useState(currentUser?.fullName || 'Мансур Умаров');
  const [phone, setPhone] = useState(currentUser?.phone || initialPhone || '+7 (928) 095-77-88');
  const [city, setCity] = useState(currentUser?.city || 'г. Грозный');
  const [occupation, setOccupation] = useState(currentUser?.occupation || 'Предприниматель / Торговля');
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMessage('Пожалуйста, укажите корректный номер телефона');
      return;
    }
    setErrorMessage('');
    playButtonTap();
    setStep('otp');
    setTimer(45);
    setCanResend(false);
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMessage('Введите 4-значный код из SMS');
      return;
    }

    setIsVerifying(true);
    playButtonTap();

    setTimeout(() => {
      setIsVerifying(false);
      playSuccessChime();
      
      const updatedUser: UserProfile = {
        ...(currentUser || {}),
        id: currentUser?.id || 'user_main_01',
        fullName: fullName.trim() || currentUser?.fullName || 'Мансур Умаров',
        phone: phone.trim() || currentUser?.phone || '+7 (928) 095-77-88',
        city: city.trim() || currentUser?.city || 'г. Грозный',
        occupation: occupation.trim() || currentUser?.occupation || 'Предприниматель',
        isPhoneVerified: true,
        verificationTier: currentUser?.verificationTier || 1,
        verificationStatus: currentUser?.verificationStatus || 'unverified',
        isGuarantorVerified: currentUser?.isGuarantorVerified || false,
        amanaScore: Math.max(currentUser?.amanaScore || 75, 85),
      } as UserProfile;

      setStep('success');
      setTimeout(() => {
        if (onSuccessLogin) {
          onSuccessLogin(updatedUser);
        }
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1200);
    }, 800);
  };

  const handleUseTestOtp = () => {
    playButtonTap();
    setOtpCode('1234');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10">
      <div className="relative w-full max-w-md bg-[#091511] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-200 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/90 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                {step === 'phone' && 'Вход / Регистрация (Уровень 1)'}
                {step === 'otp' && 'Подтверждение SMS-кода'}
                {step === 'success' && 'Успешная авторизация!'}
              </h2>
              <p className="text-xs text-slate-400">
                {step === 'phone' && 'Базовый доступ к пулам до 300 000 ₽'}
                {step === 'otp' && `Код отправлен на ${phone}`}
                {step === 'success' && 'Добро пожаловать в Вай Котел'}
              </p>
            </div>
          </div>

          <button
            onClick={() => { playButtonTap(); onClose(); }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Input Phone & Details */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="bg-[#051711] border border-[#d4af37]/20 p-3.5 rounded-xl text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                <span>Уровень 1 (Базовая регистрация)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Введите номер телефона. После подтверждения по SMS вам будет присвоен статус <strong>«Стандартный участник»</strong> для пулов до 300 000 ₽.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ваше Имя и Фамилия:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Мансур Умаров"
                className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3.5 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                required
              />
            </div>

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
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Город:
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="г. Грозный"
                  className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Деятельность:
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Предприниматель"
                  className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
            >
              <span>Получить SMS-код подтверждения</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Input SMS OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="bg-[#051711] border border-slate-700/80 p-3.5 rounded-xl text-center space-y-2">
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
                  className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium hover:bg-emerald-900 transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#d4af37]" />
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
                className="w-full bg-[#030e0a] border border-[#d4af37]/60 focus:border-[#fef08a] py-3 text-center text-2xl tracking-[0.5em] font-mono font-bold text-[#fef08a] rounded-xl focus:outline-none shadow-inner"
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

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Проверка SMS-кода...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Подтвердить и войти (Уровень 1)</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success State */}
        {step === 'success' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Телефон успешно подтвержден!
              </h3>
              <p className="text-xs text-slate-300">
                Присвоен статус <strong>«Стандартный участник (Уровень 1)»</strong>
              </p>
            </div>

            <div className="p-3 bg-[#051711] border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              ✓ Доступно создание и вступление в пулы до 300 000 ₽
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
