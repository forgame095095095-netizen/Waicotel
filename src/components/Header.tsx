import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Scale, 
  AlertCircle, 
  RefreshCw, 
  Bell, 
  KeyRound, 
  UserPlus, 
  LogIn, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { UserProfile, Kotel } from '../types';
import { playButtonTap } from '../utils/audio';

interface HeaderProps {
  user: UserProfile;
  kotels?: Kotel[];
  activeTab: 'dashboard' | 'baraban' | 'profile' | 'contract' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'baraban' | 'profile' | 'contract' | 'admin') => void;
  onOpenSharia: () => void;
  onOpenOnboarding: () => void;
  onOpenTier2Verification: () => void;
  onOpenSmsAuth: (mode?: 'login' | 'register') => void;
  onOpenAdminLogin: () => void;
  onResetDemoData: () => void;
  onSwitchUserMode?: (mode: 'tier1' | 'pending' | 'tier2' | 'admin') => void;
  pendingRequestsCount?: number;
  pendingRegistrationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  kotels,
  activeTab,
  setActiveTab,
  onOpenSharia,
  onOpenOnboarding,
  onOpenTier2Verification,
  onOpenSmsAuth,
  onOpenAdminLogin,
  onResetDemoData,
  onSwitchUserMode,
  pendingRequestsCount = 2,
  pendingRegistrationsCount = 1,
}) => {
  const getTierName = (score: number) => {
    if (score >= 120) return { name: 'Золотой уровень', short: 'Золотой', color: 'text-amber-300 border-amber-400/40 bg-amber-950/40' };
    if (score >= 90) return { name: 'Серебряный уровень', short: 'Серебряный', color: 'text-slate-200 border-slate-400/40 bg-slate-800/40' };
    if (score >= 60) return { name: 'Надежный уровень', short: 'Надежный', color: 'text-emerald-300 border-emerald-400/40 bg-emerald-950/40' };
    return { name: 'Базовый уровень', short: 'Базовый', color: 'text-amber-500 border-amber-500/40 bg-amber-950/40' };
  };

  const tier = getTierName(user.amanaScore);

  const activeKotel = kotels?.find(k => k.isUserJoined) || kotels?.[0];
  const deadlineDay = activeKotel?.paymentDeadlineDay || 15;

  const todayDate = new Date().getDate();
  const daysUntilDue = deadlineDay - todayDate;
  const isApproachingOrOverdue = (daysUntilDue < 3 && daysUntilDue >= 0) || (todayDate > deadlineDay);
  
  const userMember = activeKotel?.members.find(m => m.isCurrentUser || m.id === user.id);
  const isPaidThisMonth = userMember?.monthStatus === 'paid' || userMember?.monthStatus === 'payout_received';
  const hasDueNotification = isApproachingOrOverdue && !isPaidThisMonth;

  const isTier2 = user.verificationTier === 2 && user.verificationStatus === 'verified';
  const isPendingRegistration = user.registrationStatus === 'pending';
  const isApprovedRegistration = user.registrationStatus === 'approved';
  const isPendingTier2 = user.verificationStatus === 'pending';

  return (
    <header className="sticky top-0 z-40 border-b border-[#d4af37]/20 bg-[#070d0b]/90 backdrop-blur-md">
      {/* Top Testing Scenario Bar & Islamic notice */}
      <div className="bg-gradient-to-r from-[#062c22] via-[#0b4234] to-[#062c22] border-b border-[#d4af37]/15 py-1.5 px-3 sm:px-6 lg:px-8 text-xs font-medium text-emerald-100">
        <div className="flex items-center gap-2 sm:gap-3 max-w-7xl mx-auto w-full justify-between flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-[11px] font-semibold tracking-wide">
              0% РИБА
            </span>
            <span className="hidden lg:inline text-emerald-200/90 text-xs">
              Вай Котел • Исламская P2P система сбережений с проверкой Кафила (поручителя)
            </span>
          </div>

          {/* Test Scenario Quick Toolbar */}
          <div className="flex items-center gap-1.5 bg-black/50 border border-[#d4af37]/40 rounded-xl p-1 text-[11px]">
            <span className="text-slate-400 px-1 font-semibold hidden md:inline">Сценарий:</span>
            
            {/* Step 1: Register */}
            <button
              onClick={() => { playButtonTap(); onOpenSmsAuth('register'); }}
              className="px-2 py-0.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Шаг 1: Зарегистрировать нового пользователя (проверка блокировки дубликатов)"
            >
              <UserPlus className="w-3 h-3" />
              <span>1. Регистрация</span>
            </button>

            {/* Step 2: Pending switch */}
            <button
              onClick={() => onSwitchUserMode && onSwitchUserMode('pending')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isPendingRegistration
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300'
              }`}
              title="Шаг 2: Экран ожидания одобрения с песчаными часами"
            >
              <Clock className="w-3 h-3" />
              <span>2. Ожидание ⏳</span>
            </button>

            {/* Step 3: Admin Login */}
            <button
              onClick={() => { playButtonTap(); onOpenAdminLogin(); }}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'bg-[#0f241a] hover:bg-[#163a2a] border border-[#d4af37]/60 text-[#fef08a]'
              }`}
              title="Шаг 3: Вход для Администратора (admin / admin123)"
            >
              <KeyRound className="w-3 h-3" />
              <span>3. Вход Админа (admin123)</span>
              {(pendingRegistrationsCount > 0 || pendingRequestsCount > 0) && (
                <span className="px-1 py-0.1 bg-amber-400 text-black text-[9px] rounded-full font-mono">
                  {pendingRegistrationsCount + pendingRequestsCount}
                </span>
              )}
            </button>

            {/* Step 4: Approved Dashboard */}
            <button
              onClick={() => onSwitchUserMode && onSwitchUserMode('tier1')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isApprovedRegistration && activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Шаг 4: Главный экран Дашборда (после одобрения)"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>4. Дашборд</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { playButtonTap(); onOpenSharia(); }}
              className="hidden sm:flex items-center gap-1 text-xs text-[#d4af37] hover:text-[#fef08a] transition-colors underline decoration-dotted"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Фетва & Договор</span>
            </button>
            <button
              onClick={() => { playButtonTap(); onResetDemoData(); }}
              title="Сбросить локальную базу и демо-данные"
              className="text-emerald-400/80 hover:text-emerald-200 transition-colors p-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => { playButtonTap(); setActiveTab('dashboard'); }}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#103b2e] via-[#0c241c] to-[#071511] border border-[#d4af37]/40 flex items-center justify-center shadow-md shadow-black/40 group-hover:border-[#d4af37] transition-all">
              <div className="absolute inset-0 bg-[#d4af37]/10 rounded-xl blur-sm group-hover:bg-[#d4af37]/20 transition-all"></div>
              <span className="relative text-[#d4af37] font-brand text-base sm:text-lg font-bold tracking-wider">
                VK
              </span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#070d0b] flex items-center justify-center text-[8px] font-bold text-black">
                ✓
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold font-display tracking-tight text-white group-hover:text-[#fef08a] transition-colors">
                Вай Котел
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Only available if user is approved or in admin) */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 p-1 rounded-xl bg-[#0b1b16]/80 border border-[#d4af37]/20">
            <button
              onClick={() => { playButtonTap(); setActiveTab('dashboard'); }}
              className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#d4af37]/25 to-[#d4af37]/15 text-[#fef08a] border border-[#d4af37]/40 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
              }`}
            >
              Котлы и Взносы
            </button>
            <button
              onClick={() => { playButtonTap(); setActiveTab('baraban'); }}
              className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'baraban'
                  ? 'bg-gradient-to-r from-[#d4af37]/25 to-[#d4af37]/15 text-[#fef08a] border border-[#d4af37]/40 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Жеребьевка</span>
            </button>
            <button
              onClick={() => { playButtonTap(); setActiveTab('profile'); }}
              className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#d4af37]/25 to-[#d4af37]/15 text-[#fef08a] border border-[#d4af37]/40 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
              }`}
            >
              Рейтинг и Кабинет
            </button>
            <button
              onClick={() => { playButtonTap(); setActiveTab('contract'); }}
              className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === 'contract'
                  ? 'bg-gradient-to-r from-[#d4af37]/25 to-[#d4af37]/15 text-[#fef08a] border border-[#d4af37]/40 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
              }`}
            >
              Договор
            </button>
            
            {/* Prominent Admin Portal Tab */}
            <button
              onClick={() => { playButtonTap(); setActiveTab('admin'); }}
              className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-md font-bold'
                  : 'text-emerald-300 hover:text-white hover:bg-emerald-950/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Админ-панель</span>
              {(pendingRegistrationsCount > 0 || pendingRequestsCount > 0) && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-bold">
                  {pendingRegistrationsCount + pendingRequestsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Noticeable Admin Login Button in the Corner */}
            <button
              onClick={() => { playButtonTap(); onOpenAdminLogin(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#081812] border border-[#d4af37]/50 text-[#fef08a] text-xs font-bold hover:bg-[#0c241b] hover:border-[#d4af37] transition-all shadow-sm cursor-pointer"
              title="Вход для Администратора сервиса (Логин: admin, Пароль: admin123)"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Вход для Администратора</span>
              <span className="sm:hidden">Админ</span>
            </button>

            {/* Auth / Switch account button */}
            <button
              onClick={() => { playButtonTap(); onOpenSmsAuth('login'); }}
              className="p-2 rounded-xl bg-[#0b1b16] border border-slate-800 text-slate-300 hover:text-white hover:border-[#d4af37]/50 transition-all"
              title="Войти или зарегистрировать другой номер"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
            </button>

            {/* User Profile Avatar with status */}
            <div
              onClick={() => { playButtonTap(); setActiveTab('profile'); }}
              className="cursor-pointer flex items-center gap-2 group p-1 pr-1.5 sm:pr-2 rounded-xl bg-[#0b1b16] border border-slate-800 hover:border-[#d4af37]/50 transition-all"
              title={`Пользователь: ${user.fullName} (${user.registrationStatus === 'pending' ? 'На рассмотрении' : 'Одобрен'})`}
            >
              <div className="relative">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.fullName || 'Пользователь'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-cover border border-[#d4af37]/60"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#0d2e24] border border-[#d4af37]/60 flex items-center justify-center font-bold text-xs text-[#fef08a]">
                    {(user?.fullName || 'Мансур').slice(0, 2).toUpperCase()}
                  </div>
                )}
                {isTier2 && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#d4af37] border border-[#070d0b] flex items-center justify-center text-[8px] text-black font-bold" title="Уровень 2 (300k+) Верифицирован">
                    ★
                  </span>
                )}
              </div>

              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-white group-hover:text-[#fef08a] transition-colors truncate max-w-[90px]">
                  {(user?.fullName || 'Пользователь').split(' ')[0]}
                </div>
                <div className="text-[9px] font-mono truncate max-w-[90px] text-emerald-400">
                  {user.phone.slice(-5)}
                </div>
              </div>
            </div>

            {/* VK Trust Score Badge */}
            <div 
              onClick={() => { playButtonTap(); setActiveTab('profile'); }}
              className={`cursor-pointer flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all hover:scale-[1.02] ${tier.color}`}
              title={`Рейтинг Аманат: ${user.amanaScore}/150 (${tier.name})`}
            >
              <div className="w-6 h-6 rounded-lg bg-black/40 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 leading-tight">
                  <span className="text-[10px] text-slate-400 font-medium">ВК:</span>
                  <span className="text-xs font-bold font-mono-nums text-white">
                    {user.amanaScore}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80 gap-1 overflow-x-auto">
          <button
            onClick={() => { playButtonTap(); setActiveTab('dashboard'); }}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Котлы
          </button>
          <button
            onClick={() => { playButtonTap(); setActiveTab('baraban'); }}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
              activeTab === 'baraban'
                ? 'bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Жеребьевка
          </button>
          <button
            onClick={() => { playButtonTap(); setActiveTab('profile'); }}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Кабинет
          </button>
          <button
            onClick={() => { playButtonTap(); setActiveTab('contract'); }}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'contract'
                ? 'bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Договор
          </button>
          <button
            onClick={() => { playButtonTap(); setActiveTab('admin'); }}
            className={`px-2 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
              activeTab === 'admin'
                ? 'bg-emerald-500 text-black'
                : 'text-emerald-400'
            }`}
          >
            <span>Админ</span>
            {(pendingRegistrationsCount > 0 || pendingRequestsCount > 0) && (
              <span className="px-1 py-0.1 rounded-full bg-amber-400 text-black text-[9px]">
                {pendingRegistrationsCount + pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
