import React from 'react';
import { ShieldCheck, Award, Sparkles, Scale, AlertCircle, RefreshCw, Bell } from 'lucide-react';
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
  onOpenSmsAuth: () => void;
  onResetDemoData: () => void;
  onSwitchUserMode?: (mode: 'tier1' | 'pending' | 'tier2' | 'admin') => void;
  pendingRequestsCount?: number;
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
  onResetDemoData,
  onSwitchUserMode,
  pendingRequestsCount = 2,
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
  const overdueDay = deadlineDay + 4;

  // Check if current date is within 3 days of deadline or in yellow/overdue zone
  const todayDate = new Date().getDate();
  const daysUntilDue = deadlineDay - todayDate;
  const isApproachingOrOverdue = (daysUntilDue < 3 && daysUntilDue >= 0) || (todayDate > deadlineDay);
  
  const userMember = activeKotel?.members.find(m => m.isCurrentUser || m.id === user.id);
  const isPaidThisMonth = userMember?.monthStatus === 'paid' || userMember?.monthStatus === 'payout_received';
  const hasDueNotification = isApproachingOrOverdue && !isPaidThisMonth;

  const isTier2 = user.verificationTier === 2 && user.verificationStatus === 'verified';
  const isPending = user.verificationStatus === 'pending';

  return (
    <header className="sticky top-0 z-40 border-b border-[#d4af37]/20 bg-[#070d0b]/90 backdrop-blur-md">
      {/* Top Islamic Sharia Notice Ribbon & Sandbox Switcher */}
      <div className="bg-gradient-to-r from-[#062c22] via-[#0b4234] to-[#062c22] border-b border-[#d4af37]/15 py-1.5 px-3 sm:px-6 lg:px-8 text-xs font-medium text-emerald-100">
        <div className="flex items-center gap-2 sm:gap-3 max-w-7xl mx-auto w-full justify-between flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-[11px] font-semibold tracking-wide">
              0% РИБА
            </span>
            <span className="hidden lg:inline text-emerald-200/90 text-xs">
              Исламская система ротационных сбережений • 2 уровня верификации (Кард аль-Хасан)
            </span>
          </div>

          {/* Quick Sandbox / Demo Mode Switcher */}
          {onSwitchUserMode && (
            <div className="flex items-center gap-1 bg-black/40 border border-[#d4af37]/30 rounded-lg p-0.5 text-[10px]">
              <span className="text-slate-400 px-1 hidden sm:inline">Демо:</span>
              <button
                onClick={() => onSwitchUserMode('tier1')}
                className={`px-1.5 py-0.5 rounded font-medium transition-all ${
                  !isTier2 && !isPending
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Переключить на Уровень 1: Стандарт (<300k)"
              >
                👤 Ур. 1
              </button>
              <button
                onClick={() => onSwitchUserMode('pending')}
                className={`px-1.5 py-0.5 rounded font-medium transition-all ${
                  isPending
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Переключить на статус: В ожидании одобрения"
              >
                ⏳ В ожидании
              </button>
              <button
                onClick={() => onSwitchUserMode('tier2')}
                className={`px-1.5 py-0.5 rounded font-medium transition-all ${
                  isTier2
                    ? 'bg-[#d4af37] text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Переключить на Уровень 2: Верифицирован (300k+)"
              >
                🛡️ Ур. 2 (300k+)
              </button>
              <button
                onClick={() => onSwitchUserMode('admin')}
                className={`px-1.5 py-0.5 rounded font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-emerald-300 hover:text-white'
                }`}
                title="Открыть панель администратора"
              >
                👑 Админ
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => { playButtonTap(); onOpenSharia(); }}
              className="flex items-center gap-1.5 text-xs text-[#d4af37] hover:text-[#fef08a] transition-colors underline decoration-dotted underline-offset-2"
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Шариатский стандарт и договор</span>
              <span className="sm:hidden">Договор</span>
            </button>
            <button
              onClick={() => { playButtonTap(); onResetDemoData(); }}
              title="Сбросить тестовые данные"
              className="text-emerald-400/70 hover:text-emerald-200 transition-colors p-1"
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

          {/* Navigation Tabs */}
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
            
            {/* Dedicated Admin Portal Tab */}
            <button
              onClick={() => { playButtonTap(); setActiveTab('admin'); }}
              className={`px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-emerald-500 text-black shadow-md font-bold'
                  : 'text-emerald-300 hover:text-white hover:bg-emerald-950/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Админ-портал</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Status & VK Score Widget */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Payment Due Notification Bell Icon */}
            <button
              onClick={() => { playButtonTap(); setActiveTab('dashboard'); }}
              title={hasDueNotification ? 'Срочно: приближается срок взноса 15-го числа!' : 'Уведомления о платежах'}
              className={`relative p-2 rounded-xl border transition-all ${
                hasDueNotification
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-lg shadow-rose-900/30 animate-pulse'
                  : 'bg-[#0b1b16] border-slate-800 text-slate-300 hover:text-white hover:border-[#d4af37]/40'
              }`}
            >
              <Bell className="w-4 h-4" />
              {hasDueNotification && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#070d0b]"></span>
              )}
            </button>

            {/* User Profile Avatar with verified indicator */}
            <div
              onClick={() => { playButtonTap(); setActiveTab('profile'); }}
              className="cursor-pointer flex items-center gap-2 group p-1 pr-1.5 sm:pr-2 rounded-xl bg-[#0b1b16] border border-slate-800 hover:border-[#d4af37]/50 transition-all"
              title="Перейти в личный кабинет и настройки"
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
                <div className="text-[9px] text-slate-400 truncate max-w-[90px]">
                  {user?.occupation?.split('/')[0]?.trim() || 'Участник'}
                </div>
              </div>
            </div>

            {/* VK Trust Score Badge */}
            <div 
              onClick={() => { playButtonTap(); setActiveTab('profile'); }}
              className={`cursor-pointer flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl border transition-all hover:scale-[1.02] ${tier.color}`}
              title={`Рейтинг Аманат: ${user.amanaScore}/150 (${tier.name})`}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-black/40 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 leading-tight">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">ВК:</span>
                  <span className="text-xs sm:text-sm font-bold font-mono-nums text-white">
                    {user.amanaScore}
                  </span>
                </div>
                <div className="text-[9px] font-semibold tracking-wide whitespace-nowrap opacity-90 leading-tight">
                  <span className="hidden xl:inline">{tier.name}</span>
                  <span className="xl:hidden">{tier.short}</span>
                </div>
              </div>
            </div>

            {/* Verification Status Pill Button */}
            {isTier2 ? (
              <button
                onClick={() => { playButtonTap(); onOpenTier2Verification(); }}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/80 to-[#0e2a20] border border-[#d4af37]/60 text-[#fef08a] text-xs font-semibold hover:border-[#d4af37] transition-all whitespace-nowrap"
                title="Уровень 2 (300k+) подтвержден"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden sm:inline">Уровень 2</span>
                <span className="sm:hidden">Ур. 2</span>
              </button>
            ) : isPending ? (
              <button
                onClick={() => { playButtonTap(); onOpenTier2Verification(); }}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-semibold animate-pulse hover:bg-amber-900/60 transition-all whitespace-nowrap"
                title="Заявка 2-го уровня находится в ожидании проверки администратора"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">В ожидании (300k+)</span>
                <span className="sm:hidden">В ожидании</span>
              </button>
            ) : (
              <button
                onClick={() => { playButtonTap(); onOpenTier2Verification(); }}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black text-xs font-bold hover:from-[#e5bd46] hover:to-[#d97706] shadow-sm transition-all whitespace-nowrap"
                title="Пройти верификацию с поручителем для открытия пулов от 300 000 ₽"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Уровень 2 (300k+)</span>
                <span className="sm:hidden">Ур. 2 (300k+)</span>
              </button>
            )}
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
            {pendingRequestsCount > 0 && (
              <span className="px-1 py-0.1 rounded-full bg-amber-400 text-black text-[9px]">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
