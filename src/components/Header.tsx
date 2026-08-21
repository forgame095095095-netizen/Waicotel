import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Scale, 
  LogOut,
  FileText
} from 'lucide-react';
import { UserProfile, Kotel } from '../types';
import { playButtonTap } from '../utils/audio';

interface HeaderProps {
  user: UserProfile;
  kotels?: Kotel[];
  activeTab: 'dashboard' | 'baraban' | 'profile' | 'contract' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'baraban' | 'profile' | 'contract' | 'admin') => void;
  onOpenSharia: () => void;
  onLogout: () => void;
  pendingRequestsCount?: number;
  pendingRegistrationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  kotels,
  activeTab,
  setActiveTab,
  onOpenSharia,
  onLogout,
  pendingRequestsCount = 0,
  pendingRegistrationsCount = 0,
}) => {
  const isAdmin = user.role === 'admin' || user.phone === '+7 (999) 000-00-00';

  const getTierName = (score: number) => {
    if (score >= 120) return { name: 'Золотой уровень', short: 'Золотой', color: 'text-amber-300 border-amber-400/40 bg-amber-950/40' };
    if (score >= 90) return { name: 'Серебряный уровень', short: 'Серебряный', color: 'text-slate-200 border-slate-400/40 bg-slate-800/40' };
    if (score >= 60) return { name: 'Надежный уровень', short: 'Надежный', color: 'text-emerald-300 border-emerald-400/40 bg-emerald-950/40' };
    return { name: 'Базовый уровень', short: 'Базовый', color: 'text-amber-500 border-amber-500/40 bg-amber-950/40' };
  };

  const tier = getTierName(user.amanaScore || 75);
  const isTier2 = user.verificationTier === 2 && user.verificationStatus === 'verified';

  return (
    <header className="sticky top-0 z-40 border-b border-[#d4af37]/20 bg-[#070d0b]/90 backdrop-blur-md">
      
      {/* Top Islamic Sub-header */}
      <div className="bg-gradient-to-r from-[#062c22] via-[#0b4234] to-[#062c22] border-b border-[#d4af37]/15 py-1.5 px-3 sm:px-6 lg:px-8 text-xs font-medium text-emerald-100">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-[11px] font-semibold tracking-wide">
              0% РИБА
            </span>
            <span className="text-emerald-200/90 text-xs">
              Вай Котел • Исламская P2P система сбережений с поручительством Кафаля
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { playButtonTap(); onOpenSharia(); }}
              className="flex items-center gap-1 text-xs text-[#d4af37] hover:text-[#fef08a] transition-colors underline decoration-dotted cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Фетва & Шариат</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => { playButtonTap(); if (!isAdmin) setActiveTab('dashboard'); }}
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

            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold font-display tracking-tight text-white group-hover:text-[#fef08a] transition-colors">
                Вай Котел
              </span>
              {isAdmin && (
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Панель Администратора
                </span>
              )}
            </div>
          </div>

          {/* Navigation Tabs (Only for regular client users) */}
          {!isAdmin && (
            <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 p-1 rounded-xl bg-[#0b1b16]/80 border border-[#d4af37]/20">
              <button
                onClick={() => { playButtonTap(); setActiveTab('dashboard'); }}
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-[#d4af37]/25 to-[#d4af37]/15 text-[#fef08a] border border-[#d4af37]/40 shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
                }`}
              >
                Котлы и Взносы
              </button>
              <button
                onClick={() => { playButtonTap(); setActiveTab('baraban'); }}
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-[#d4af37]/25 to-[#d4af37]/15 text-[#fef08a] border border-[#d4af37]/40 shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
                }`}
              >
                Рейтинг и Кабинет
              </button>
              <button
                onClick={() => { playButtonTap(); setActiveTab('contract'); }}
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'contract'
                    ? 'bg-gradient-to-r from-[#d4af37]/25 to-[#d4af37]/15 text-[#fef08a] border border-[#d4af37]/40 shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
                }`}
              >
                Договор
              </button>
            </nav>
          )}

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* User Details */}
            <div
              onClick={() => { if (!isAdmin) { playButtonTap(); setActiveTab('profile'); } }}
              className={`flex items-center gap-2 p-1.5 pr-2 rounded-xl bg-[#0b1b16] border border-slate-800 transition-all ${
                !isAdmin ? 'cursor-pointer hover:border-[#d4af37]/50' : ''
              }`}
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
                    {(user?.fullName || 'У').slice(0, 1).toUpperCase()}
                  </div>
                )}
                {isTier2 && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#d4af37] border border-[#070d0b] flex items-center justify-center text-[8px] text-black font-bold" title="Уровень 2 (300k+) Верифицирован">
                    ★
                  </span>
                )}
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {user?.fullName}
                </div>
                <div className="text-[10px] font-mono truncate max-w-[120px] text-emerald-400">
                  {user?.phone}
                </div>
              </div>
            </div>

            {/* Amana Trust Badge (for regular users) */}
            {!isAdmin && (
              <div 
                onClick={() => { playButtonTap(); setActiveTab('profile'); }}
                className={`cursor-pointer hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all hover:scale-[1.02] ${tier.color}`}
                title={`Рейтинг Аманат: ${user.amanaScore}/150 (${tier.name})`}
              >
                <div className="w-5 h-5 rounded-md bg-black/40 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shrink-0">
                  <Award className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold font-mono text-white">
                  {user.amanaScore}
                </span>
              </div>
            )}

            {/* LOGOUT BUTTON */}
            <button
              onClick={() => { playButtonTap(); onLogout(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              title="Выйти из учетной записи"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Bar (Client Only) */}
        {!isAdmin && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80 gap-1 overflow-x-auto">
            <button
              onClick={() => { playButtonTap(); setActiveTab('dashboard'); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Котлы
            </button>
            <button
              onClick={() => { playButtonTap(); setActiveTab('baraban'); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
                activeTab === 'baraban'
                  ? 'bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Жеребьевка
            </button>
            <button
              onClick={() => { playButtonTap(); setActiveTab('profile'); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Кабинет
            </button>
            <button
              onClick={() => { playButtonTap(); setActiveTab('contract'); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'contract'
                  ? 'bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Договор
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
