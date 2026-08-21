import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Phone, 
  UserCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  LogIn,
  UserPlus
} from 'lucide-react';
import { UserProfile, RelationType } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface AuthGatewayScreenProps {
  usersDb: UserProfile[];
  onSuccessLogin: (user: UserProfile) => void;
  onSuccessRegister: (newUser: UserProfile) => void;
  onOpenSharia: () => void;
}

// Phone number mask formatter
const formatPhoneMask = (input: string): string => {
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';
  
  let normalized = digits;
  if (normalized.startsWith('7') || normalized.startsWith('8')) {
    normalized = normalized.substring(1);
  }
  normalized = normalized.substring(0, 10);
  
  let formatted = '+7';
  if (normalized.length > 0) {
    formatted += ' (' + normalized.substring(0, 3);
  }
  if (normalized.length >= 3) {
    formatted += ') ' + normalized.substring(3, 6);
  }
  if (normalized.length >= 6) {
    formatted += '-' + normalized.substring(6, 8);
  }
  if (normalized.length >= 8) {
    formatted += '-' + normalized.substring(8, 10);
  }
  return formatted;
};

const normalizePhone = (p: string) => p.replace(/\D/g, '');

const RELATION_OPTIONS: RelationType[] = [
  'Брат',
  'Отец',
  'Дядя',
  'Друг',
  'Близкий друг',
  'Коллега',
  'Родственник',
];

const CITIES = ['г. Грозный', 'г. Аргун', 'г. Гудермес', 'г. Шали', 'г. Урус-Мартан', 'г. Курчалой', 'Другой город'];

export const AuthGatewayScreen: React.FC<AuthGatewayScreenProps> = ({
  usersDb,
  onSuccessLogin,
  onSuccessRegister,
  onOpenSharia,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginSmsStep, setLoginSmsStep] = useState(false);
  const [loginSmsCode, setLoginSmsCode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGuarantorPhone, setRegGuarantorPhone] = useState('');
  const [regGuarantorRelation, setRegGuarantorRelation] = useState<RelationType>('Брат');
  const [regGuarantorName, setRegGuarantorName] = useState('');
  const [regCity, setRegCity] = useState('г. Грозный');
  const [regOccupation, setRegOccupation] = useState('Предприниматель / Торговля');
  const [regSmsStep, setRegSmsStep] = useState(false);
  const [regSmsCode, setRegSmsCode] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [duplicatePhoneError, setDuplicatePhoneError] = useState<string | null>(null);

  // Check if entered number is admin special number
  const isAdminPhone = (phone: string) => {
    const norm = normalizePhone(phone);
    return norm === '79990000000' || norm === '9990000000' || phone.includes('999') && phone.includes('000-00-00');
  };

  // 1. Handlers for Login
  const handleRequestLoginSms = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const normalized = normalizePhone(loginPhone);
    if (normalized.length < 10) {
      setLoginError('Введите корректный номер телефона (10 цифр)');
      return;
    }

    if (isAdminPhone(loginPhone)) {
      playButtonTap();
      setLoginSmsStep(true);
      return;
    }

    const existing = usersDb.find(
      (u) => normalizePhone(u.phone) === normalized || u.phone.includes(normalized.slice(-10))
    );

    if (!existing) {
      setLoginError('Пользователь с таким номером не найден. Пожалуйста, пройдите регистрацию.');
      return;
    }

    playButtonTap();
    setLoginSmsStep(true);
  };

  const handleConfirmLoginSms = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (loginSmsCode.trim().length < 4) {
      setLoginError('Введите 4-значный SMS-код');
      return;
    }

    // Special Admin login check
    if (isAdminPhone(loginPhone)) {
      const adminUser: UserProfile = {
        id: 'admin_root',
        fullName: 'Главный Администратор',
        phone: '+7 (999) 000-00-00',
        city: 'г. Грозный',
        occupation: 'Администрация платформы Вай Котел',
        occupationDetails: 'Служба модерации и верификации',
        role: 'admin',
        registrationStatus: 'approved',
        registeredAt: '2026-01-01 00:00',
        registrationApprovedAt: '2026-01-01 00:00',
        verificationTier: 2,
        isOccupationVerified: true,
        isPassportVerified: true,
        isPhoneVerified: true,
        isGuarantorVerified: true,
        isGuarantorSmsConfirmed: true,
        guarantorName: 'Шариатский совет',
        guarantorPhone: '+7 (999) 000-00-01',
        guarantorRelation: 'Родственник',
        verificationStatus: 'verified',
        amanaScore: 150,
        totalSaved: 1000000,
        completedKotelsCount: 10,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        hasSignedContract: true,
        bio: 'Административный доступ',
      };
      playSuccessChime();
      onSuccessLogin(adminUser);
      return;
    }

    const normalized = normalizePhone(loginPhone);
    const existing = usersDb.find(
      (u) => normalizePhone(u.phone) === normalized || u.phone.includes(normalized.slice(-10))
    );

    if (existing) {
      playSuccessChime();
      onSuccessLogin(existing);
    } else {
      setLoginError('Ошибка входа. Пользователь не найден.');
    }
  };

  // 2. Handlers for Registration
  const handleRequestRegisterSms = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setDuplicatePhoneError(null);

    if (!regFullName.trim() || regFullName.trim().split(' ').length < 2) {
      setRegError('Укажите полные Фамилию и Имя заявителя');
      return;
    }

    const normUserPhone = normalizePhone(regPhone);
    if (normUserPhone.length < 10) {
      setRegError('Введите корректный основной номер телефона');
      return;
    }

    const normGuarantorPhone = normalizePhone(regGuarantorPhone);
    if (normGuarantorPhone.length < 10) {
      setRegError('Введите корректный резервный номер поручителя');
      return;
    }

    if (normUserPhone === normGuarantorPhone) {
      setRegError('Номер поручителя не может совпадать с вашим личным номером');
      return;
    }

    // STRICT DUPLICATE CHECK IN LOCALSTORAGE USERS DB
    const alreadyExists = usersDb.some(
      (u) => normalizePhone(u.phone) === normUserPhone || u.phone.includes(normUserPhone.slice(-10))
    );

    if (alreadyExists) {
      setDuplicatePhoneError('Этот номер уже зарегистрирован. Пожалуйста, перейдите на вкладку «Вход»');
      playButtonTap();
      return;
    }

    playButtonTap();
    setRegSmsStep(true);
  };

  const handleConfirmRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regSmsCode.trim().length < 4) {
      setRegError('Введите 4-значный проверочный SMS-код');
      return;
    }

    const nowStr = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const newId = `user_${Date.now()}`;

    const newUser: UserProfile = {
      id: newId,
      fullName: regFullName.trim(),
      phone: regPhone.startsWith('+7') ? regPhone : formatPhoneMask(regPhone),
      city: regCity,
      occupation: regOccupation,
      role: 'user',
      registrationStatus: 'pending', // 🛑 Must be pending per specification
      registeredAt: `Сегодня, ${nowStr}`,
      verificationTier: 1,
      isOccupationVerified: false,
      isPassportVerified: false,
      isPhoneVerified: true,
      isGuarantorVerified: false,
      isGuarantorSmsConfirmed: false,
      guarantorName: regGuarantorName.trim() || `${regGuarantorRelation} (${regFullName.split(' ')[0]})`,
      guarantorPhone: regGuarantorPhone.startsWith('+7') ? regGuarantorPhone : formatPhoneMask(regGuarantorPhone),
      guarantorRelation: regGuarantorRelation,
      verificationStatus: 'pending',
      amanaScore: 75,
      totalSaved: 0,
      completedKotelsCount: 0,
      hasSignedContract: true,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
    };

    playSuccessChime();
    onSuccessRegister(newUser);
  };

  return (
    <div className="min-h-screen bg-[#06100c] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Decorative Radiance */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#d4af37]/10 via-emerald-950/20 to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-900/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-[#d4af37]/25 bg-[#081712]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#12382b] to-[#0a2019] border-2 border-[#d4af37] flex items-center justify-center text-[#fef08a] shadow-lg shadow-emerald-950/50">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-brand font-extrabold text-lg sm:text-xl tracking-tight text-white">
                WAI <span className="text-[#d4af37]">KOTEL</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fef08a] text-[10px] font-extrabold uppercase">
                0% Риба
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/90 hidden sm:block">
              Исламская система взаимных P2P ссуд и накоплений (Вай Котел)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => { playButtonTap(); onOpenSharia(); }}
            className="px-3.5 py-1.5 rounded-xl bg-[#0b241a] hover:bg-[#103426] border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span>Фетва и Шариат</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        
        {/* Hero Title & Value Proposition */}
        <div className="text-center space-y-2 mb-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Единый шлюз авторизации и регистрации</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Вход в систему <span className="text-[#fef08a]">«Вай Котел»</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Беспроцентные целевые сбережения для честных братьев и сестер с гарантией поручительства Кафаля
          </p>
        </div>

        {/* Central Auth Box */}
        <div className="w-full max-w-xl bg-[#091712] border-2 border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 text-slate-200 relative overflow-hidden">
          
          {/* Tab Switcher: [ Вход ] | [ Регистрация ] */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#050f0c] border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                playButtonTap();
                setActiveTab('login');
                setLoginError(null);
                setLoginSmsStep(false);
              }}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Вход по номеру</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playButtonTap();
                setActiveTab('register');
                setRegError(null);
                setDuplicatePhoneError(null);
                setRegSmsStep(false);
              }}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Регистрация</span>
            </button>
          </div>

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <div className="space-y-5">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span>{loginError}</span>
                    {loginError.includes('регистрацию') && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('register');
                          setRegPhone(loginPhone);
                          setLoginError(null);
                        }}
                        className="block mt-1.5 text-[#fef08a] font-bold underline hover:text-white"
                      >
                        Перейти к регистрации с этим номером →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!loginSmsStep ? (
                <form onSubmit={handleRequestLoginSms} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Номер телефона:
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#d4af37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(formatPhoneMask(e.target.value))}
                        placeholder="+7 (928) 000-00-00"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#05110d] border border-slate-700 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-white text-sm font-mono tracking-wider outline-none"
                        required
                        autoFocus
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      На указанный номер будет отправлен проверочный код
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#d4af37] hover:bg-[#f59e0b] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <span>Получить SMS-код</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmLoginSms} className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
                    <span>SMS-код отправлен на <strong className="font-mono text-white">{loginPhone}</strong></span>
                    <button
                      type="button"
                      onClick={() => setLoginSmsStep(false)}
                      className="text-[#d4af37] underline hover:text-white"
                    >
                      Изменить
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Введите 4-значный SMS-код:
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={loginSmsCode}
                      onChange={(e) => setLoginSmsCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • •"
                      className="w-full text-center py-3 rounded-xl bg-[#05110d] border-2 border-[#d4af37] text-white text-2xl font-mono tracking-widest outline-none focus:ring-2 focus:ring-[#d4af37]"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Подтвердить и войти</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: REGISTRATION FORM */}
          {activeTab === 'register' && (
            <div className="space-y-5">
              
              {/* Duplicate Phone Error Banner */}
              {duplicatePhoneError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/90 border-2 border-rose-500 text-rose-100 text-xs flex items-start gap-2.5 shadow-lg animate-bounce">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="block text-white text-sm">Номер уже зарегистрирован</strong>
                    <p className="text-rose-200">
                      Пользователь с номером <strong>{regPhone}</strong> уже есть в системе.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginPhone(regPhone);
                        setActiveTab('login');
                        setDuplicatePhoneError(null);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs mt-1 hover:bg-amber-300 transition-all cursor-pointer"
                    >
                      <span>Перейти ко входу →</span>
                    </button>
                  </div>
                </div>
              )}

              {regError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {!regSmsStep ? (
                <form onSubmit={handleRequestRegisterSms} className="space-y-3.5 text-xs">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      ФИО заявителя (как в паспорте): <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <UserCheck className="w-4 h-4 text-[#d4af37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Умаров Мансур Русланович"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#05110d] border border-slate-700 focus:border-[#d4af37] text-white text-xs outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Main Phone */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Основной номер телефона: <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#d4af37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(formatPhoneMask(e.target.value));
                          setDuplicatePhoneError(null);
                        }}
                        placeholder="+7 (928) 000-00-00"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#05110d] border border-slate-700 focus:border-[#d4af37] text-white text-xs font-mono outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Guarantor Section */}
                  <div className="p-3.5 rounded-2xl bg-[#05100c] border border-[#d4af37]/30 space-y-3">
                    <div className="flex items-center gap-2 text-[#fef08a] font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                      <span>Данные поручителя (Кафила):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">
                          Кем приходится (Связь): <span className="text-rose-400">*</span>
                        </label>
                        <select
                          value={regGuarantorRelation}
                          onChange={(e) => setRegGuarantorRelation(e.target.value as RelationType)}
                          className="w-full px-3 py-2 rounded-xl bg-[#081812] border border-slate-700 focus:border-[#d4af37] text-white text-xs outline-none"
                        >
                          {RELATION_OPTIONS.map((rel) => (
                            <option key={rel} value={rel}>{rel}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">
                          ФИО поручителя:
                        </label>
                        <input
                          type="text"
                          value={regGuarantorName}
                          onChange={(e) => setRegGuarantorName(e.target.value)}
                          placeholder="Ислам Умаров"
                          className="w-full px-3 py-2 rounded-xl bg-[#081812] border border-slate-700 focus:border-[#d4af37] text-white text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">
                        Резервный номер поручителя: <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={regGuarantorPhone}
                          onChange={(e) => setRegGuarantorPhone(formatPhoneMask(e.target.value))}
                          placeholder="+7 (928) 111-22-33"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#081812] border border-slate-700 focus:border-[#d4af37] text-white text-xs font-mono outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* City & Occupation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">
                        Город / Населенный пункт:
                      </label>
                      <select
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#05110d] border border-slate-700 focus:border-[#d4af37] text-white text-xs outline-none"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">
                        Род деятельности:
                      </label>
                      <input
                        type="text"
                        value={regOccupation}
                        onChange={(e) => setRegOccupation(e.target.value)}
                        placeholder="Торговля, IT, Строительство"
                        className="w-full px-3 py-2 rounded-xl bg-[#05110d] border border-slate-700 focus:border-[#d4af37] text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 transition-all cursor-pointer mt-2"
                  >
                    <span>Продолжить и отправить заявку</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmRegister} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#05100c] border border-emerald-500/40 text-xs text-slate-200 space-y-2">
                    <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Подтверждение номера телефона</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Мы отправили проверочный код на номер <strong className="text-white font-mono">{regPhone}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Введите 4-значный SMS-код:
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={regSmsCode}
                      onChange={(e) => setRegSmsCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • •"
                      className="w-full text-center py-3 rounded-xl bg-[#05110d] border-2 border-[#d4af37] text-white text-2xl font-mono tracking-widest outline-none focus:ring-2 focus:ring-[#d4af37]"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Отправить заявку на рассмотрение</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Sharia Guarantee Footer Note */}
        <div className="mt-8 flex items-center gap-4 text-xs text-slate-400 max-w-xl text-center">
          <Scale className="w-5 h-5 text-[#d4af37] shrink-0" />
          <span>
            Вай Котел действует в строгом соответствии с исламским правом: 0% скрытых процентов (Риба), целевые фонды и социальная ответственность Кафаля.
          </span>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#d4af37]/20 bg-[#06110d] py-4 px-4 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-brand font-bold text-[#d4af37]">WAI KOTEL</span> — Сервис исламских целевых сбережений
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>Стандарты AAOIFI</span>
            <span>•</span>
            <span>г. Грозный, 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
