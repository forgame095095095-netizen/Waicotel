import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  Users, 
  TrendingUp, 
  Award, 
  FileCheck, 
  HelpCircle,
  Percent,
  Check,
  ListOrdered,
  Shuffle,
  Wallet,
  Search,
  Share2,
  KeyRound,
  Copy
} from 'lucide-react';
import { Kotel, UserProfile } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';
import { PaymentDueAlert } from './PaymentDueAlert';
import { TrustBadges } from './TrustBadges';

interface DashboardTabProps {
  user: UserProfile;
  kotels: Kotel[];
  onOpenKotelDetail: (kotelId: string) => void;
  onOpenBaraban: (kotelId: string) => void;
  onOpenCreateKotel: () => void;
  onOpenOnboarding: () => void;
  onOpenTier2Verification: () => void;
  onOpenSharia: () => void;
  onJoinKotel: (kotelId: string) => void;
  onOpenReceiptUpload: (kotelId: string, memberId: string) => void;
  onOpenShareKotel: (kotel: Kotel) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  user,
  kotels,
  onOpenKotelDetail,
  onOpenBaraban,
  onOpenCreateKotel,
  onOpenOnboarding,
  onOpenTier2Verification,
  onOpenSharia,
  onJoinKotel,
  onOpenReceiptUpload,
  onOpenShareKotel,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | '30k' | '50k' | '100k' | '10k'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inviteInput, setInviteInput] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  
  const isTier2 = user.verificationTier === 2 && user.verificationStatus === 'verified';
  const isPending = user.verificationStatus === 'pending';

  // Interactive Calculator State
  const [calcTargetAmount, setCalcTargetAmount] = useState<number>(360000);
  const [calcMonths, setCalcMonths] = useState<number>(12);
  const calcMonthlyPayment = Math.round(calcTargetAmount / calcMonths);
  const standardBankCreditOverpay = Math.round(calcTargetAmount * 0.28); // 28% typical bank interest

  // Handle safe join checking Tier 2 requirement
  const handleSafeJoinKotel = (kotel: Kotel) => {
    playButtonTap();
    if (kotel.totalPool >= 300000 && !isTier2) {
      onOpenTier2Verification();
      return;
    }
    onJoinKotel(kotel.id);
  };

  // Active Kotel joined by user
  const activeUserKotel = kotels.find((k) => k.isUserJoined) || kotels[0];
  const userMember = activeUserKotel?.members.find((m) => m.isCurrentUser);

  // User's joined active kotels & total monthly payment obligation
  const userJoinedKotels = kotels.filter(
    (k) => k.isUserJoined || k.members.some((m) => m.id === user.id || m.isCurrentUser)
  );
  const activeJoinedKotels = userJoinedKotels.filter((k) => k.status !== 'completed');
  const totalMonthlyCommitment = activeJoinedKotels.reduce((sum, k) => sum + k.monthlyContribution, 0);

  const handleQuickCopyCode = (e: React.MouseEvent, kotel: Kotel) => {
    e.stopPropagation();
    playSuccessChime();
    navigator.clipboard.writeText(kotel.inviteCode);
    setCopiedCodeId(kotel.id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleLookupInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    playButtonTap();
    
    let code = inviteInput.trim();
    if (code.includes('kotel=')) {
      const match = code.match(/kotel=([^&]+)/);
      if (match) code = decodeURIComponent(match[1]);
    }
    
    const found = kotels.find(
      (k) =>
        k.inviteCode?.toLowerCase() === code.toLowerCase() ||
        k.id?.toLowerCase() === code.toLowerCase() ||
        k.inviteCode?.toLowerCase().replace(/[^a-z0-9]/g, '') === code.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    
    if (found) {
      onOpenKotelDetail(found.id);
      setInviteInput('');
    } else {
      setSearchQuery(code);
    }
  };

  const filteredKotels = kotels.filter((k) => {
    // Filter by contribution tab
    if (selectedFilter === '30k' && k.monthlyContribution !== 30000) return false;
    if (selectedFilter === '50k' && k.monthlyContribution !== 50000) return false;
    if (selectedFilter === '100k' && k.monthlyContribution !== 100000) return false;
    if (selectedFilter === '10k' && k.monthlyContribution !== 10000) return false;

    // Filter by search query (title, purpose, code, organizer)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = k.title.toLowerCase().includes(q);
      const matchPurpose = k.purpose.toLowerCase().includes(q);
      const matchCode = k.inviteCode?.toLowerCase().includes(q);
      const matchAdmin = k.adminName.toLowerCase().includes(q);
      return matchTitle || matchPurpose || matchCode || matchAdmin;
    }

    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Top User Profile & Amana Trust Score Header Card */}
      <div className="relative bg-gradient-to-br from-[#0a231b] via-[#091b15] to-[#06120e] border border-[#d4af37]/35 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* User Info & Verified Guarantor */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {user.verificationStatus === 'verified' ? 'Личность и поручитель верифицированы' : 'Ожидает верификации'}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#fef08a] text-xs font-bold font-mono-nums">
                0% Риба
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-display tracking-tight">
                Мир вам, {user?.fullName || 'Мансур Умаров'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                Ваша исламская касса взаимопомощи. Накопления без банковских процентов, скрытых комиссий и с гарантией надежного поручительства.
              </p>
            </div>

            {/* Guarantor strip */}
            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
              <span className="text-slate-400">Поручитель (Кафил):</span>
              <strong className="text-white flex items-center gap-1">
                {user?.guarantorName || 'Ислам Умаров'} ({user?.guarantorRelation || 'Брат'})
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </strong>
              <span className="text-slate-500">• {user?.guarantorPhone || '+7 (928) 714-33-22'}</span>
            </div>
          </div>

          {/* Key Metrics Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 shrink-0">
            
            {/* VK Trust Score Metric */}
            <div className="bg-[#061711]/90 border border-[#d4af37]/30 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Рейтинг</span>
                <Award className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#fef08a] font-mono-nums">
                {user.amanaScore}<span className="text-sm text-slate-400 font-normal">/150</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wide uppercase mt-1">
                Золотой уровень ВК ✓
              </span>
            </div>

            {/* Total Saved without Riba */}
            <div className="bg-[#061711]/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Накоплено всего</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono-nums">
                {(user.totalSaved).toLocaleString('ru-RU')} ₽
              </div>
              <span className="text-[10px] text-slate-400">
                Завершено: {user.completedKotelsCount} котла
              </span>
            </div>

            {/* Total Monthly Payment Obligation across all Active Kotels */}
            <div className="bg-[#061711]/90 border border-emerald-500/30 p-4 rounded-2xl flex flex-col justify-between col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
                <span>Ежемесячно к оплате</span>
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-300 font-mono-nums">
                {(totalMonthlyCommitment).toLocaleString('ru-RU')} ₽
              </div>
              <span className="text-[10px] text-emerald-400/90 font-medium">
                {activeJoinedKotels.length > 0 
                  ? `Со всех ${activeJoinedKotels.length} ${activeJoinedKotels.length === 1 ? 'активного котла' : 'активных котлов'}` 
                  : 'Нет активных взносов'}
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* 2. Progressive Verification Banner */}
      {!isTier2 && (
        <div className="relative bg-gradient-to-r from-[#171c10] via-[#20180a] to-[#12231c] border-2 border-[#d4af37]/60 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center shrink-0 text-[#d4af37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                  {isPending ? 'Заявка в ожидании проверки' : 'Уровень 1 (Стандарт)'}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {isPending ? 'Администратор сверяет данные паспорта' : 'Лимит участия: до 300 000 ₽'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {isPending ? (
                  'Ваша заявка с поручителем и паспортом находится в ожидании проверки администратором. После одобрения откроются пулы от 300 000 ₽ до 1 200 000 ₽.'
                ) : (
                  'Для создания или участия в крупных котлах с пулом от 300 000 ₽ пройдите 2-й уровень верификации (укажите поручителя-Кафила и загрузите фото паспорта).'
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => { playButtonTap(); onOpenTier2Verification(); }}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isPending ? 'Статус заявки (В ожидании)' : 'Верификация (Уровень 2)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Monthly Payment Due Alert Banner */}
      <PaymentDueAlert
        user={user}
        activeKotel={activeUserKotel}
        onOpenReceiptUpload={onOpenReceiptUpload}
        onOpenKotelDetail={onOpenKotelDetail}
      />

      {/* 3. Active Kotel Hero Widget */}
      {activeUserKotel && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                Ваш текущий активный котел
              </h2>
            </div>
            <button
              onClick={() => { playButtonTap(); onOpenKotelDetail(activeUserKotel.id); }}
              className="text-xs text-[#d4af37] hover:text-[#fef08a] font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Открыть ведомость участников</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#091712] border-2 border-[#d4af37]/35 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Details (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] text-[11px] font-bold border border-[#d4af37]/40">
                      {(activeUserKotel.monthlyContribution).toLocaleString('ru-RU')} ₽ / месяц
                    </span>
                    <span className="text-xs text-slate-400">
                      Целевой пул: <strong className="text-white">{(activeUserKotel.totalPool).toLocaleString('ru-RU')} ₽</strong> ({activeUserKotel.totalMembers} участников)
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                    {activeUserKotel.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {activeUserKotel.purpose}
                  </p>
                </div>

                {/* Monthly Progress Bar */}
                <div className="space-y-2 bg-[#06120e] p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      Текущий прогресс: Месяц {activeUserKotel.currentCycleMonth} из {activeUserKotel.totalMonths}
                    </span>
                    <span className="font-mono-nums font-bold text-emerald-400">
                      {Math.round((activeUserKotel.currentCycleMonth / activeUserKotel.totalMonths) * 100)}%
                    </span>
                  </div>
                  
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#d4af37] via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${(activeUserKotel.currentCycleMonth / activeUserKotel.totalMonths) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Старт: {activeUserKotel.startDate}</span>
                    <span>Собрано: {activeUserKotel.members.filter((m) => m.monthStatus === 'paid' || m.monthStatus === 'payout_received').length * activeUserKotel.monthlyContribution} / {activeUserKotel.totalPool} ₽</span>
                  </div>
                </div>

                {/* Deadlines notice */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Срок оплаты: <strong>15 августа</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Льготный период: <strong>до 19 августа</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Side User Payout Position Card (5 cols) */}
              <div className="lg:col-span-5 bg-[#0d2a20] border border-[#d4af37]/40 rounded-xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div>
                    <span className="text-[10px] text-[#d4af37] uppercase font-bold tracking-wider block">
                      Ваша очередь получения пула:
                    </span>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-[#d4af37] text-black font-mono-nums flex items-center justify-center font-bold text-sm">
                        #{activeUserKotel.userDrawNumber || 6}
                      </span>
                      <span>Месяц {activeUserKotel.userDrawNumber || 6} (Октябрь)</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-300 block">Сумма выплаты</span>
                    <span className="text-lg font-bold font-mono-nums text-[#fef08a]">
                      {(activeUserKotel.totalPool).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                {/* User Payment Status Card */}
                <div className="flex items-center justify-between bg-[#061410] p-3 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Статус вашего взноса:</span>
                    <strong className="text-emerald-300 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Оплачено за август (30 000 ₽)
                    </strong>
                  </div>
                  <button
                    onClick={() => { playButtonTap(); onOpenReceiptUpload(activeUserKotel.id, userMember?.id || 'm_06'); }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                  >
                    Обновить чек
                  </button>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => { playButtonTap(); onOpenKotelDetail(activeUserKotel.id); }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Users className="w-4 h-4 text-[#d4af37]" />
                    <span>Таблица очереди</span>
                  </button>
                  <button
                    onClick={() => { playButtonTap(); onOpenBaraban(activeUserKotel.id); }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#f59e0b] flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Барабан</span>
                  </button>
                  <button
                    onClick={() => { playButtonTap(); onOpenShareKotel(activeUserKotel); }}
                    className="py-2.5 px-3 rounded-xl bg-[#0d2a20] border border-[#d4af37]/50 text-[#fef08a] hover:bg-[#133b2e] text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all shrink-0"
                    title="Пригласить или поделиться ссылкой"
                  >
                    <Share2 className="w-4 h-4 text-[#d4af37]" />
                    <span>Пригласить</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. Catalog of Available Kotels to Join */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <span>Доступные Вай Котлы для участия</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                {filteredKotels.length} открыто
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Вступайте в группы накоплений с подтвержденными участниками и чистой репутацией Аманат
            </p>
          </div>

          {/* Create Kotel Button */}
          <button
            onClick={() => { playButtonTap(); onOpenCreateKotel(); }}
            className="px-4 py-2.5 rounded-xl bg-[#0e2c22] border border-[#d4af37]/40 text-[#fef08a] hover:bg-[#133b2e] text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-auto shadow-md"
          >
            <Plus className="w-4 h-4 text-[#d4af37]" />
            <span>Создать свой Вай Котел</span>
          </button>
        </div>

        {/* Search & Direct Invite Code Lookup Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#071913] p-3.5 rounded-2xl border border-slate-800 shadow-md">
          {/* Quick Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по названию, цели, организатору или коду..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#030d09] border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Invite Code or Link Quick Join Form */}
          <form onSubmit={handleLookupInvite} className="md:col-span-6 flex items-center gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-[#d4af37] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Вставить код (напр. VK-7701) или ссылку..."
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                className="w-full bg-[#030d09] border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#fef08a] placeholder:text-slate-500 focus:outline-none focus:border-[#d4af37] font-mono-nums"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold text-xs hover:opacity-90 transition-all shadow-md shrink-0 flex items-center gap-1.5"
            >
              <span>Найти котел</span>
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => { playButtonTap(); setSelectedFilter('all'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === 'all'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-[#091712] border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Все пулы ({kotels.length})
          </button>
          <button
            onClick={() => { playButtonTap(); setSelectedFilter('30k'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === '30k'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-[#091712] border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            30 000 ₽/мес
          </button>
          <button
            onClick={() => { playButtonTap(); setSelectedFilter('50k'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === '50k'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-[#091712] border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            50 000 ₽/мес (Бизнес)
          </button>
          <button
            onClick={() => { playButtonTap(); setSelectedFilter('100k'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === '100k'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-[#091712] border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            100 000 ₽/мес (Хадж)
          </button>
        </div>

        {/* Kotel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredKotels.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-[#091712] border border-slate-800 rounded-3xl p-6">
              <KeyRound className="w-8 h-8 text-[#d4af37] mx-auto mb-2 opacity-60" />
              <h3 className="text-base font-bold text-white mb-1">Котлы по запросу не найдены</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Проверьте правильность кода или сбросьте фильтры, чтобы увидеть все доступные котлы.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedFilter('all'); }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Показать все котлы
              </button>
            </div>
          ) : (
            filteredKotels.map((kotel) => {
              const isJoined = kotel.isUserJoined;
              const isReadyForDraw = kotel.status === 'draw_ready';
              const isGathering = kotel.status === 'gathering';

              return (
                <div
                  key={kotel.id}
                  className={`bg-[#091712] rounded-2xl border transition-all duration-300 flex flex-col justify-between p-5 hover:border-[#d4af37]/60 hover:shadow-xl ${
                    isJoined ? 'border-[#d4af37]/50 bg-[#0b2019]' : 'border-slate-800/80'
                  }`}
                >
                  <div>
                    {/* Card Header & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-xs font-mono-nums font-bold">
                          {(kotel.monthlyContribution).toLocaleString('ru-RU')} ₽/мес
                        </span>
                        {kotel.totalPool >= 300000 && (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-950 to-amber-900 border border-[#d4af37]/60 text-[#fef08a] text-[10px] font-bold shadow-sm" title="Требуется верификация 2-го уровня (поручитель + паспорт)">
                            🛡️ 300k+ (Ур. 2)
                          </span>
                        )}
                      </div>

                      {isJoined ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                          ✓ Вы #{kotel.userDrawNumber ? `${kotel.userDrawNumber}-й` : 'участвуете'}
                        </span>
                      ) : isReadyForDraw ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[11px] font-bold animate-pulse">
                          🎲 Готов к жеребьевке
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px]">
                          Идет набор ({kotel.members.length}/{kotel.totalMembers})
                        </span>
                      )}
                    </div>

                    {/* Invite Code Quick Copy & Queue Type Badge */}
                    <div className="flex items-center justify-between gap-1.5 mb-2.5 flex-wrap">
                      {kotel.queueType === 'manual' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium">
                          <ListOrdered className="w-3 h-3 text-[#d4af37]" />
                          <span>По выбору ({kotel.totalMembers - kotel.members.length} мест)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                          <Shuffle className="w-3 h-3 text-[#d4af37]" />
                          <span>Барабан ({kotel.totalMembers} чел)</span>
                        </span>
                      )}

                      {/* Quick Code Badge */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickCopyCode(e, kotel)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#04120d] border border-[#d4af37]/30 text-[10px] text-[#fef08a] hover:bg-slate-800 font-mono-nums transition-colors"
                        title="Скопировать код котла"
                      >
                        <KeyRound className="w-3 h-3 text-[#d4af37]" />
                        <span>{kotel.inviteCode}</span>
                        {copiedCodeId === kotel.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Title & Purpose */}
                    <h3 className="text-lg font-bold text-white font-display line-clamp-1">
                      {kotel.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1 min-h-[32px]">
                      {kotel.purpose}
                    </p>

                    {/* Organizer Trust & Activity Banner */}
                    <div className="flex items-center justify-between gap-2 mt-2.5 mb-2 bg-[#051410] px-2.5 py-1.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-[#0d2a20] border border-[#d4af37]/40 flex items-center justify-center text-[10px] font-bold text-[#fef08a] shrink-0">
                          {kotel.adminName.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 block leading-none">Организатор:</span>
                          <span className="text-xs font-semibold text-white truncate block">
                            {kotel.adminName}
                          </span>
                        </div>
                      </div>

                      <TrustBadges
                        occupation={kotel.adminOccupation || 'Бизнесмен / Организатор'}
                        isOccupationVerified={kotel.isAdminOccupationVerified ?? true}
                        isPassportVerified={kotel.isAdminPassportVerified ?? true}
                        isGuarantorVerified={true}
                        compact={true}
                        showLabels={false}
                      />
                    </div>

                    {/* Trust Requirement Pill if applicable */}
                    {kotel.requireOccupationVerified && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/40 text-[10px] text-emerald-300 font-medium">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Требуется подтвержденная деятельность</span>
                        </span>
                      </div>
                    )}

                    {/* Metrics Bento inside card */}
                    <div className="grid grid-cols-2 gap-2 my-4 bg-[#06120e] p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Пул выплаты:</span>
                        <span className="text-sm font-bold text-[#fef08a] font-mono-nums">
                          {(kotel.totalPool).toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Срок цикла:</span>
                        <span className="text-sm font-bold text-white font-mono-nums">
                          {kotel.totalMonths} мес. ({kotel.totalMembers} чел)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Требуемый рейтинг:</span>
                        <span className="text-xs font-semibold text-emerald-400">
                          {kotel.minimumAmanaScore}+ баллов
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Дата старта:</span>
                        <span className="text-xs font-semibold text-slate-200">
                          {kotel.startDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => { playButtonTap(); onOpenKotelDetail(kotel.id); }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                    >
                      Подробнее
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => { playButtonTap(); onOpenShareKotel(kotel); }}
                      className="p-2.5 rounded-xl bg-[#061711] border border-[#d4af37]/40 text-[#fef08a] hover:bg-[#0c2e22] text-xs font-bold transition-all shadow-sm shrink-0"
                      title="Поделиться котлом (ссылка и красивый текст)"
                    >
                      <Share2 className="w-4 h-4 text-[#d4af37]" />
                    </button>

                    {isJoined ? (
                      <button
                        onClick={() => { playButtonTap(); onOpenKotelDetail(kotel.id); }}
                        className="py-2.5 px-3 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
                      >
                        Ведомость
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSafeJoinKotel(kotel)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1 ${
                          kotel.totalPool >= 300000 && !isTier2
                            ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
                            : 'bg-[#d4af37] hover:bg-[#f59e0b] text-black'
                        }`}
                        title={kotel.totalPool >= 300000 && !isTier2 ? 'Пул 300k+: Требуется верификация Tier 2' : 'Вступить в котел'}
                      >
                        {kotel.totalPool >= 300000 && !isTier2 && <ShieldCheck className="w-3.5 h-3.5" />}
                        <span>{kotel.totalPool >= 300000 && !isTier2 ? 'Вступить (300k+)' : 'Вступить'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Islamic P2P Savings Calculator (0% Riba vs Standard Loan) */}
      <div className="bg-[#091812] border border-[#d4af37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="text-center space-y-1">
            <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-xs font-bold inline-flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" />
              Калькулятор чистых сбережений (0% Риба)
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              Рассчитайте сумму и выгоду без единого рубля процентов
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mx-auto">
              В отличие от банковских кредитов с переплатой 20–30%, в системе Вай Котел вы возвращаете ровно столько, сколько получили.
            </p>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#06120e] p-6 rounded-2xl border border-slate-800">
            
            {/* Amount Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Желаемая сумма пула:</span>
                <span className="text-base font-bold font-mono-nums text-[#fef08a]">
                  {calcTargetAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <input
                type="range"
                min="30000"
                max="3000000"
                step="10000"
                value={calcTargetAmount}
                onChange={(e) => setCalcTargetAmount(Number(e.target.value))}
                className="w-full accent-[#d4af37] bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>30 000 ₽</span>
                <span>1 500 000 ₽</span>
                <span>3 000 000 ₽</span>
              </div>
            </div>

            {/* Months Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Количество участников / месяцев:</span>
                <span className="text-base font-bold font-mono-nums text-white">
                  {calcMonths} месяцев
                </span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => { playButtonTap(); setCalcMonths(m); }}
                    className={`py-1.5 rounded-lg text-[11px] font-bold font-mono-nums transition-all ${
                      calcMonths === m
                        ? 'bg-[#d4af37] text-black shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}м
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Comparison Cards: Wai Kotel vs Bank Credit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Wai Kotel (Halal 0%) */}
            <div className="bg-gradient-to-br from-[#0c3326] to-[#082219] border-2 border-[#d4af37] p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded bg-[#d4af37]/30 text-[#fef08a] text-xs font-bold">
                  Вай Котел (Халяль)
                </span>
                <span className="text-xs text-emerald-300 font-bold">0% ПЕРЕПЛАТ</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-300">Ваш ежемесячный взнос:</span>
                <div className="text-2xl sm:text-3xl font-bold font-mono-nums text-white">
                  {calcMonthlyPayment.toLocaleString('ru-RU')} ₽ <span className="text-xs text-slate-400">/ мес</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Переплата банку: <strong>0 ₽</strong> (Полное соответствие Шариату)</span>
              </div>
            </div>

            {/* Standard Bank Loan */}
            <div className="bg-[#121617] border border-slate-800 p-5 rounded-2xl opacity-80">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30 text-xs font-bold">
                  Банковский кредит (Риба)
                </span>
                <span className="text-xs text-rose-400 font-medium">Ставка ~28% годовых</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">Платеж с процентами:</span>
                <div className="text-xl sm:text-2xl font-bold font-mono-nums text-slate-300">
                  {Math.round((calcTargetAmount + standardBankCreditOverpay) / calcMonths).toLocaleString('ru-RU')} ₽ <span className="text-xs text-slate-500">/ мес</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Лишняя переплата банку: <strong>+{standardBankCreditOverpay.toLocaleString('ru-RU')} ₽</strong></span>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
