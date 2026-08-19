import React, { useState } from 'react';
import { Plus, Sparkles, Users, Calendar, ShieldCheck, AlertTriangle, Check, ArrowRight, ListOrdered, Shuffle, Briefcase, FileCheck2, UserCheck } from 'lucide-react';
import { Kotel, UserProfile, QueueType } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';
import { TrustBadges } from './TrustBadges';

interface CreateKotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onCreateKotel: (newKotel: Kotel) => void;
  onRequireTier2Verification?: () => void;
}

const MIN_CONTRIBUTION = 10000;
const MAX_CONTRIBUTION = 300000;
const CONTRIBUTION_STEP = 5000;
const MAX_POOL_LIMIT = 3000000;
const MONTH_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const PRESET_CONTRIBUTIONS = [10000, 25000, 50000, 100000, 150000, 200000, 300000];

export const CreateKotelModal: React.FC<CreateKotelModalProps> = ({
  isOpen,
  onClose,
  user,
  onCreateKotel,
  onRequireTier2Verification,
}) => {
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState<number>(30000);
  const [totalMembers, setTotalMembers] = useState<number>(10);
  const [paymentDeadlineDay, setPaymentDeadlineDay] = useState<number>(15);
  const [startDate, setStartDate] = useState('01.11.2026');
  const [queueType, setQueueType] = useState<QueueType>('manual');
  const [creatorSlot, setCreatorSlot] = useState<number>(1);
  const [requireOccupationVerified, setRequireOccupationVerified] = useState<boolean>(true);

  if (!isOpen) return null;

  const totalPool = monthlyContribution * totalMembers;
  const isPoolExceeded = totalPool > MAX_POOL_LIMIT;
  const isHighValue = totalPool >= 300000;
  const isTier2 = user.verificationTier === 2 && user.verificationStatus === 'verified';

  // Ensure creatorSlot stays within 1..totalMembers
  const effectiveCreatorSlot = Math.min(creatorSlot, totalMembers);

  // Yellow zone: 3 days after deadline
  const yellowZoneStart = paymentDeadlineDay + 1;
  const yellowZoneEnd = paymentDeadlineDay + 3;
  const overdueDay = paymentDeadlineDay + 4;

  const handleStepContribution = (delta: number) => {
    playButtonTap();
    setMonthlyContribution((prev) => {
      const nextVal = prev + delta;
      return Math.min(MAX_CONTRIBUTION, Math.max(MIN_CONTRIBUTION, nextVal));
    });
  };

  const handleSetMaxValidContribution = () => {
    playButtonTap();
    const maxValid = Math.floor(MAX_POOL_LIMIT / totalMembers / CONTRIBUTION_STEP) * CONTRIBUTION_STEP;
    setMonthlyContribution(Math.min(MAX_CONTRIBUTION, Math.max(MIN_CONTRIBUTION, maxValid)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPoolExceeded) return;
    
    // Check Tier 2 requirement for >= 300,000 pools
    if (isHighValue && !isTier2) {
      playButtonTap();
      if (onRequireTier2Verification) {
        onRequireTier2Verification();
      }
      return;
    }

    playButtonTap();

    const isManual = queueType === 'manual';

    const created: Kotel = {
      id: `kotel_custom_${Date.now()}`,
      inviteCode: `VK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title || `Вай Котел «${purpose ? purpose.slice(0, 25) : 'Целевой'}»`,
      purpose: purpose || 'Взаимные целевые сбережения без процентов',
      monthlyContribution,
      totalPool,
      totalMembers,
      currentCycleMonth: 1,
      totalMonths: totalMembers,
      startDate: startDate || '01.11.2026',
      paymentDeadlineDay,
      gracePeriodDeadlineDay: yellowZoneEnd,
      status: 'gathering',
      drawCompleted: false,
      queueType,
      minimumAmanaScore: monthlyContribution >= 100000 ? 110 : monthlyContribution >= 50000 ? 90 : 60,
      isUserJoined: true,
      userDrawNumber: isManual ? effectiveCreatorSlot : null,
      adminName: user.fullName,
      adminPhone: user.phone,
      adminAvatarUrl: user.avatarUrl,
      adminOccupation: user.occupation,
      isAdminOccupationVerified: user.isOccupationVerified,
      isAdminPassportVerified: user.isPassportVerified,
      requireOccupationVerified,
      members: [
        {
          id: user.id,
          name: `${user.fullName} (Вы • Организатор)`,
          phone: user.phone,
          city: user.city,
          avatarUrl: user.avatarUrl,
          occupation: user.occupation,
          isOccupationVerified: user.isOccupationVerified,
          isPassportVerified: user.isPassportVerified,
          drawNumber: isManual ? effectiveCreatorSlot : null,
          monthStatus: 'pending',
          paidAmount: 0,
          amanaScore: user.amanaScore,
          isGuarantorConfirmed: true,
          guarantorName: user.guarantorName,
          guarantorPhone: user.guarantorPhone,
          isCurrentUser: true,
        },
      ],
    };

    onCreateKotel(created);
    playSuccessChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10">
      <div className="relative w-full max-w-xl bg-[#091511] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-200 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Создать новый Вай Котел
              </h3>
              <p className="text-xs text-emerald-400">
                Организация беспроцентной кассы взаимопомощи
              </p>
            </div>
          </div>

          <button
            onClick={() => { playButtonTap(); onClose(); }}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Organizer Trust Preview Block */}
        <div className="mb-4 bg-[#071d16] p-3 sm:p-3.5 rounded-xl border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#fef08a] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Статус доверия организатора (Вы):
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
              Подтвержденный организатор ✓
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-xl object-cover border-2 border-[#d4af37] bg-slate-900 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-emerald-950 border border-[#d4af37]/40 flex items-center justify-center font-bold text-[#fef08a] shrink-0">
                {user.fullName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="space-y-1 overflow-hidden">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="truncate">{user.fullName}</span>
                <span className="text-[10px] text-slate-400 font-normal shrink-0">({user.city})</span>
              </div>

              <TrustBadges
                occupation={user.occupation || 'Предприниматель / Бизнесмен'}
                isOccupationVerified={user.isOccupationVerified}
                isPassportVerified={user.isPassportVerified}
                isGuarantorVerified={user.isGuarantorVerified}
                amanaScore={user.amanaScore}
                compact={true}
                showLabels={true}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Title & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Название пула / группы *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Авто-Котел «Серло»"
                className="w-full bg-[#06120e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4af37] placeholder:text-slate-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Цель накоплений *
              </label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Например: Покупка авто / Ремонт / Бизнес"
                className="w-full bg-[#06120e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4af37] placeholder:text-slate-500 transition-colors"
              />
            </div>
          </div>

          {/* Monthly Contribution: Range 10,000 - 300,000 with step 5,000 */}
          <div className="bg-[#061410] p-4 sm:p-4.5 rounded-xl border border-slate-700/80 shadow-md space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-200 font-bold text-xs">
                  Ежемесячный взнос с каждого участника:
                </label>
                <span className="text-[11px] text-slate-400">
                  Шаг: 5 000 ₽ (от 10 000 ₽ до 300 000 ₽)
                </span>
              </div>

              <div className="text-right">
                <span className="text-lg sm:text-xl font-bold font-mono-nums text-[#fef08a]">
                  {monthlyContribution.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-[11px] text-slate-400 block">/ месяц</span>
              </div>
            </div>

            {/* Stepper + Slider */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleStepContribution(-CONTRIBUTION_STEP)}
                disabled={monthlyContribution <= MIN_CONTRIBUTION}
                className="w-10 h-10 shrink-0 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base disabled:opacity-40 flex items-center justify-center transition-colors border border-slate-700/70 shadow-sm"
                title="-5 000 ₽"
              >
                -
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min={MIN_CONTRIBUTION}
                  max={MAX_CONTRIBUTION}
                  step={CONTRIBUTION_STEP}
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full accent-[#d4af37] bg-slate-800 h-2.5 rounded-lg cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => handleStepContribution(CONTRIBUTION_STEP)}
                disabled={monthlyContribution >= MAX_CONTRIBUTION}
                className="w-10 h-10 shrink-0 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base disabled:opacity-40 flex items-center justify-center transition-colors border border-slate-700/70 shadow-sm"
                title="+5 000 ₽"
              >
                +
              </button>
            </div>

            {/* Preset quick chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 mr-1 font-medium">Быстрый выбор:</span>
              {PRESET_CONTRIBUTIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { playButtonTap(); setMonthlyContribution(preset); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-nums font-semibold transition-all ${
                    monthlyContribution === preset
                      ? 'bg-[#d4af37] text-black shadow-md font-bold'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                  }`}
                >
                  {(preset / 1000).toFixed(0)}k ₽
                </button>
              ))}
            </div>
          </div>

          {/* Month / Member Count Selector: 3 to 12 */}
          <div className="bg-[#061410] p-4 sm:p-4.5 rounded-xl border border-slate-700/80 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-200 font-bold text-xs">
                  Срок котла / Количество участников:
                </label>
                <span className="text-[11px] text-slate-400">
                  Выбор от 3 до 12 месяцев (1 участник = 1 месяц получения)
                </span>
              </div>
              <span className="text-sm sm:text-base font-bold font-mono-nums text-emerald-300">
                {totalMembers} мес. ({totalMembers} чел.)
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
              {MONTH_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { playButtonTap(); setTotalMembers(m); }}
                  className={`py-2 rounded-xl text-xs font-bold font-mono-nums transition-all ${
                    totalMembers === m
                      ? 'bg-emerald-600 text-white shadow-md border border-emerald-400'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {m}м
                </button>
              ))}
            </div>
          </div>

          {/* Queue Distribution Method: Manual Order vs Wheel Lot */}
          <div className="bg-[#061410] p-4 sm:p-4.5 rounded-xl border border-slate-700/80 shadow-md space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Способ распределения очереди выплат:</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Выберите: ручной выбор мест по порядку или честный жребий на Барабане
                </span>
              </div>
            </div>

            {/* Two Main Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Manual Queue Selection */}
              <button
                type="button"
                onClick={() => { playButtonTap(); setQueueType('manual'); }}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  queueType === 'manual'
                    ? 'bg-[#0d2a20] border-[#d4af37] shadow-md ring-1 ring-[#d4af37]'
                    : 'bg-[#091712] border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      queueType === 'manual' ? 'bg-[#d4af37] text-black font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <ListOrdered className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Ручной выбор очереди</div>
                      <div className="text-[10px] text-emerald-400 font-medium">По порядку / бронь мест</div>
                    </div>
                  </div>
                  {queueType === 'manual' && (
                    <span className="w-5 h-5 rounded-full bg-[#d4af37] text-black flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Вы занимаете свое место (напр. 1-е), а каждый следующий участник сам выбирает свободный номер в очереди.
                </p>
              </button>

              {/* Option 2: Baraban Wheel Draw */}
              <button
                type="button"
                onClick={() => { playButtonTap(); setQueueType('baraban'); }}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  queueType === 'baraban'
                    ? 'bg-[#0d2a20] border-[#d4af37] shadow-md ring-1 ring-[#d4af37]'
                    : 'bg-[#091712] border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      queueType === 'baraban' ? 'bg-[#d4af37] text-black font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Shuffle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Барабан (Жеребьевка)</div>
                      <div className="text-[10px] text-amber-400 font-medium">Случайный жребий</div>
                    </div>
                  </div>
                  {queueType === 'baraban' && (
                    <span className="w-5 h-5 rounded-full bg-[#d4af37] text-black flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Очередность определяется беспристрастным вращением Барабана после набора всех {totalMembers} участников.
                </p>
              </button>
            </div>

            {/* If Manual: Creator Selects Their Own Slot */}
            {queueType === 'manual' && (
              <div className="p-3.5 bg-[#091a14] rounded-xl border border-emerald-500/30 space-y-2.5 mt-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white">
                    Ваше место в очереди (как создателя котла):
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37] text-black font-bold font-mono-nums text-xs">
                    #{effectiveCreatorSlot}-е место ({effectiveCreatorSlot}-й месяц)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from({ length: totalMembers }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => { playButtonTap(); setCreatorSlot(num); }}
                      className={`w-9 h-9 rounded-xl text-xs font-bold font-mono-nums transition-all flex items-center justify-center ${
                        effectiveCreatorSlot === num
                          ? 'bg-[#d4af37] text-black shadow-md ring-2 ring-[#fef08a]'
                          : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-emerald-300/90">
                  💡 Вы получите пул выплат на <strong>{effectiveCreatorSlot}-й месяц</strong>. Второй участник сможет занять 2-е место или любое другое свободное.
                </p>
              </div>
            )}
          </div>

          {/* Payment Deadline Day & 3-Zone Grace Period System */}
          <div className="bg-[#061410] p-4 sm:p-4.5 rounded-xl border border-slate-700/80 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-200 font-bold text-xs flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>День месяца для внесения взноса:</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Организатор выбирает любой день месяца (от 1 до 28)
                </span>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-bold font-mono-nums text-[#fef08a]">
                  {paymentDeadlineDay}-е число
                </span>
                <span className="text-[10px] text-slate-400 block">каждого месяца</span>
              </div>
            </div>

            {/* Range Slider & Quick Day Presets */}
            <div className="space-y-2.5 pt-1">
              <input
                type="range"
                min={1}
                max={28}
                step={1}
                value={paymentDeadlineDay}
                onChange={(e) => setPaymentDeadlineDay(Number(e.target.value))}
                className="w-full accent-[#d4af37] bg-slate-800 h-2.5 rounded-lg cursor-pointer"
              />
              
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 mr-1 font-medium">Популярные дни:</span>
                {[1, 5, 10, 15, 20, 25].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { playButtonTap(); setPaymentDeadlineDay(d); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-nums font-semibold transition-all ${
                      paymentDeadlineDay === d
                        ? 'bg-[#d4af37] text-black shadow-sm font-bold'
                        : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {d}-е
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Zone Rules Breakdown Visualizer */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                
                {/* Green Zone */}
                <div className="bg-[#041710] border border-emerald-500/40 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Срок в графике</span>
                  </div>
                  <div className="text-white font-semibold">
                    До {paymentDeadlineDay}-го числа (23:59)
                  </div>
                  <div className="text-[10px] text-emerald-300/80 mt-0.5">
                    +10..+15 баллов рейтинга ВК
                  </div>
                </div>

                {/* Yellow Zone */}
                <div className="bg-[#1a1405] border border-amber-500/50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Желтая зона (3 дня)</span>
                  </div>
                  <div className="text-white font-semibold">
                    {yellowZoneStart}–{yellowZoneEnd}-е число
                  </div>
                  <div className="text-[10px] text-amber-200/80 mt-0.5">
                    Льготная оплата без штрафов
                  </div>
                </div>

                {/* Red Zone (Overdue) */}
                <div className="bg-[#1f0909] border border-rose-500/50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Просрочка (на 4-й день)</span>
                  </div>
                  <div className="text-white font-semibold">
                    С {overdueDay}-го числа
                  </div>
                  <div className="text-[10px] text-rose-300/80 mt-0.5">
                    -30 баллов и звонок поручителю
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Calculated Pool Banner & Max Pool Limit Check (3,000,000 ₽) */}
          <div className={`p-4 rounded-xl border transition-all ${
            isPoolExceeded
              ? 'bg-rose-950/70 border-rose-500/60 text-rose-200'
              : 'bg-gradient-to-r from-[#0b241d] to-[#071914] border-[#d4af37]/40'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-slate-300 block text-[11px]">
                  Итоговый размер пула (на руки каждому):
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl sm:text-2xl font-extrabold font-mono-nums ${
                    isPoolExceeded ? 'text-rose-400' : 'text-[#fef08a]'
                  }`}>
                    {totalPool.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (лимит до 3 000 000 ₽)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-xs font-bold font-mono-nums">
                  0% Риба
                </span>
              </div>
            </div>

            {/* Progress to max limit 3,000,000 */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3 border border-slate-700/60">
              <div
                className={`h-full rounded-full transition-all ${
                  isPoolExceeded ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-[#d4af37]'
                }`}
                style={{ width: `${Math.min(100, (totalPool / MAX_POOL_LIMIT) * 100)}%` }}
              ></div>
            </div>

            {/* Error / Warning if pool exceeds 3,000,000 */}
            {isPoolExceeded && (
              <div className="mt-3 pt-2.5 border-t border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Пул превышает максимальный лимит 3 000 000 ₽!</span>
                </div>
                <button
                  type="button"
                  onClick={handleSetMaxValidContribution}
                  className="px-2.5 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-bold text-[11px] underline"
                >
                  Скорректировать
                </button>
              </div>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Планируемая дата старта:
            </label>
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="01.11.2026"
              className="w-full bg-[#06120e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* Trust Filter Toggle */}
          <div 
            onClick={() => { playButtonTap(); setRequireOccupationVerified(!requireOccupationVerified); }}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              requireOccupationVerified 
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200' 
                : 'bg-slate-900/50 border-slate-800 text-slate-400'
            }`}
          >
            <input
              type="checkbox"
              checked={requireOccupationVerified}
              onChange={() => {}}
              className="mt-0.5 accent-[#d4af37] cursor-pointer"
            />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-white block mb-0.5">
                🛡️ Фильтр надежности: Требовать подтвержденную деятельность и паспорт
              </span>
              <span className="text-slate-300">
                Вступать смогут только верифицированные участники со статусом надежности и подтвержденным доходом.
              </span>
            </div>
          </div>

          {/* Tier 2 requirement notice for pools >= 300,000 */}
          {isHighValue && !isTier2 && (
            <div className="bg-gradient-to-r from-[#20180a] to-[#12231c] p-3.5 rounded-xl border border-[#d4af37]/60 text-[11px] text-amber-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">
                  🛡️ Пул 300 000+ ₽ требует верификации (Уровень 2)
                </strong>
                <span className="text-slate-300">
                  По правилам безопасности платформы, для создания котла с пулом от 300 000 ₽ необходимо указать поручителя (Кафила) и подтвердить паспорт. При нажатии на кнопку откроется окно верификации.
                </span>
              </div>
            </div>
          )}

          <div className="bg-[#061410] p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Вы становитесь модератором группы. Жеребьевка на Барабане проводится после набора всех {totalMembers} участников.</span>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => { playButtonTap(); onClose(); }}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPoolExceeded}
              className={`px-6 py-2.5 rounded-xl font-bold disabled:opacity-40 shadow-lg transition-all flex items-center gap-2 ${
                isHighValue && !isTier2
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white'
                  : 'bg-[#d4af37] text-black hover:bg-[#f59e0b]'
              }`}
            >
              {isHighValue && !isTier2 && <ShieldCheck className="w-4 h-4" />}
              <span>{isHighValue && !isTier2 ? 'Пройти верификацию (Ур. 2)' : 'Создать и открыть набор'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

