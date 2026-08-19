import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Upload, 
  Eye, 
  Phone, 
  DollarSign, 
  Sparkles, 
  Users, 
  FileText,
  Send,
  ListOrdered,
  Shuffle,
  UserPlus,
  Share2
} from 'lucide-react';
import { Kotel, KotelMember, PaymentStatus, UserProfile } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';
import { TrustBadges } from './TrustBadges';

interface KotelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kotel: Kotel;
  user?: UserProfile;
  onJoinKotel?: (kotelId: string, preferredSlot?: number) => void;
  onRequireTier2Verification?: () => void;
  onOpenReceiptUpload: (kotelId: string, memberId: string) => void;
  onOpenBaraban: (kotelId: string) => void;
  onUpdateMemberStatus: (kotelId: string, memberId: string, newStatus: PaymentStatus) => void;
  onOpenShareKotel?: (kotel: Kotel) => void;
}

export const KotelDetailModal: React.FC<KotelDetailModalProps> = ({
  isOpen,
  onClose,
  kotel,
  user,
  onJoinKotel,
  onRequireTier2Verification,
  onOpenReceiptUpload,
  onOpenBaraban,
  onUpdateMemberStatus,
  onOpenShareKotel,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(kotel.currentCycleMonth || 1);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [reminderSentMemberId, setReminderSentMemberId] = useState<string | null>(null);

  if (!isOpen) return null;

  const isTier2 = user?.verificationTier === 2 && user?.verificationStatus === 'verified';
  const isHighValue = kotel.totalPool >= 300000;

  const handleSafeJoinSlot = (slotNum?: number) => {
    playButtonTap();
    if (isHighValue && !isTier2) {
      if (onRequireTier2Verification) {
        onRequireTier2Verification();
      }
      return;
    }
    if (onJoinKotel) {
      onJoinKotel(kotel.id, slotNum);
    }
  };

  const isManual = kotel.queueType === 'manual';

  // Calculate stats
  const totalPaidMembers = kotel.members.filter((m) => m.monthStatus === 'paid' || m.monthStatus === 'payout_received').length;
  const totalCollectedAmount = totalPaidMembers * kotel.monthlyContribution;
  const progressPercent = Math.round((totalCollectedAmount / kotel.totalPool) * 100);

  // Current recipient
  const recipientMember = kotel.members.find((m) => m.drawNumber === selectedMonth) || kotel.members[0];

  // Map of slots in manual mode
  const occupiedSlotsMap = new Map<number, KotelMember>();
  kotel.members.forEach((m) => {
    if (typeof m.drawNumber === 'number') {
      occupiedSlotsMap.set(m.drawNumber, m);
    }
  });

  const handleCopyPhone = (phone: string) => {
    playButtonTap();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleSendGuarantorReminder = (memberId: string) => {
    playButtonTap();
    setReminderSentMemberId(memberId);
    playSuccessChime();
    setTimeout(() => setReminderSentMemberId(null), 3000);
  };

  const filteredMembers = kotel.members.filter((m) => {
    if (filterStatus === 'paid') return m.monthStatus === 'paid' || m.monthStatus === 'payout_received';
    if (filterStatus === 'grace_period') return m.monthStatus === 'grace_period';
    if (filterStatus === 'overdue') return m.monthStatus === 'overdue';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10">
      <div className="relative w-full max-w-5xl bg-[#091511] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-200 my-auto flex flex-col justify-between">
        
        {/* Top Header */}
        <div>
          <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-xs font-bold">
                  0% Риба
                </span>
                
                {isManual ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Ручной выбор очереди</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5">
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Барабан (Жеребьевка)</span>
                  </span>
                )}

                <span className="text-xs text-emerald-400 font-medium">
                  {kotel.purpose}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                {kotel.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Invite Code & Share Button */}
              {onOpenShareKotel && (
                <button
                  onClick={() => { playButtonTap(); onOpenShareKotel(kotel); }}
                  className="px-3 py-1.5 rounded-xl bg-[#0e2c22] border border-[#d4af37]/50 text-[#fef08a] hover:bg-[#133b2e] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                  title="Поделиться ссылкой или кодом"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Поделиться ({kotel.inviteCode})</span>
                </button>
              )}

              {!isManual && !kotel.drawCompleted && (
                <button
                  onClick={() => { playButtonTap(); onOpenBaraban(kotel.id); }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black text-xs font-bold flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Барабан жеребьевки</span>
                </button>
              )}

              {!kotel.isUserJoined && onJoinKotel && (
                <button
                  onClick={() => { playButtonTap(); onJoinKotel(kotel.id); }}
                  className="px-3 py-1.5 rounded-xl bg-[#d4af37] hover:bg-[#f59e0b] text-black text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Вступить в котел</span>
                </button>
              )}

              <button
                onClick={() => { playButtonTap(); onClose(); }}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-[#061410] border border-slate-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-0.5">Общий пул выплаты</span>
              <span className="text-base sm:text-lg font-bold text-[#fef08a] font-mono-nums">
                {(kotel.totalPool).toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <div className="bg-[#061410] border border-slate-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-0.5">Ежемесячный взнос</span>
              <span className="text-base sm:text-lg font-bold text-white font-mono-nums">
                {(kotel.monthlyContribution).toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <div className="bg-[#061410] border border-slate-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-0.5">Текущий цикл</span>
              <span className="text-base sm:text-lg font-bold text-emerald-300 font-mono-nums">
                Месяц {kotel.currentCycleMonth} из {kotel.totalMonths}
              </span>
            </div>

            <div className="bg-[#061410] border border-slate-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-0.5">Собрано в этом месяце</span>
              <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono-nums">
                {(totalCollectedAmount).toLocaleString('ru-RU')} ₽ <span className="text-xs text-slate-400">({progressPercent}%)</span>
              </span>
            </div>
          </div>

          {/* Organizer Trust & Activity Banner */}
          <div className="bg-[#051610] border border-[#d4af37]/35 rounded-xl p-3.5 sm:p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0e3528] to-[#081f18] border border-[#d4af37]/50 flex items-center justify-center font-bold text-sm text-[#fef08a] shadow-inner shrink-0">
                {kotel.adminName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{kotel.adminName}</span>
                  <span className="text-[10px] text-[#fef08a] bg-[#d4af37]/20 px-2 py-0.5 rounded-full border border-[#d4af37]/40 font-semibold">
                    Организатор котла
                  </span>
                  {kotel.requireOccupationVerified && (
                    <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      ✓ Фильтр верификации активен
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Деятельность: <strong className="text-slate-100">{kotel.adminOccupation || 'Предприниматель / Торговля'}</strong>
                </div>
              </div>
            </div>

            <TrustBadges
              occupation={kotel.adminOccupation || 'Организатор'}
              isOccupationVerified={kotel.isAdminOccupationVerified ?? true}
              isPassportVerified={kotel.isAdminPassportVerified ?? true}
              isGuarantorVerified={true}
              compact={false}
              showLabels={true}
            />
          </div>

          {/* Manual Mode: Slot Selection Banner if user not yet joined */}
          {isManual && !kotel.isUserJoined && onJoinKotel && (
            <div className="bg-gradient-to-r from-[#0d2a20] via-[#091f17] to-[#0d2a20] border border-[#d4af37]/40 rounded-xl p-4 mb-6 shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-[#d4af37]" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Выберите свое место в очереди для вступления:
                    </h4>
                    <p className="text-xs text-slate-300">
                      Нажмите на любой свободный номер, чтобы зафиксировать месяц получения пула
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  Свободно мест: {kotel.totalMembers - kotel.members.length} из {kotel.totalMembers}
                </span>
              </div>

              {/* Slot buttons grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-12 gap-2">
                {Array.from({ length: kotel.totalMonths }, (_, idx) => idx + 1).map((slotNum) => {
                  const occupiedMember = occupiedSlotsMap.get(slotNum);
                  const isTaken = !!occupiedMember;

                  if (isTaken) {
                    return (
                      <div
                        key={slotNum}
                        className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center opacity-60 cursor-not-allowed"
                        title={`Занято: ${occupiedMember?.name}`}
                      >
                        <div className="text-[10px] text-slate-400 font-mono-nums">#{slotNum}</div>
                        <div className="text-[10px] font-bold text-slate-300 truncate mt-0.5">
                          {occupiedMember?.name?.split(' ')[0]}
                        </div>
                        <span className="text-[9px] text-rose-400/80 block">Занято</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slotNum}
                      onClick={() => handleSafeJoinSlot(slotNum)}
                      className="p-2 rounded-xl bg-[#041d14] hover:bg-[#072c1f] border border-emerald-500/40 hover:border-[#d4af37] text-center transition-all group shadow-sm hover:scale-105"
                      title={`Занять ${slotNum}-е место`}
                    >
                      <div className="text-[10px] text-[#fef08a] font-mono-nums font-bold">#{slotNum}</div>
                      <div className="text-[10px] font-bold text-emerald-300 group-hover:text-[#fef08a] mt-0.5">
                        Свободно
                      </div>
                      <span className="text-[9px] text-emerald-400 block group-hover:underline">Занять →</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Deadlines & Grace Period Banner (Custom Day + 3 days yellow zone + 4th day overdue) */}
          {(() => {
            const deadlineDay = kotel.paymentDeadlineDay || 15;
            const yellowEndDay = kotel.gracePeriodDeadlineDay || (deadlineDay + 3);
            const overdueDay = deadlineDay + 4;
            return (
              <div className="bg-gradient-to-r from-[#0d2a20] via-[#09221a] to-[#0d2a20] border border-[#d4af37]/30 rounded-xl p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <span>График взносов за текущий расчетный период</span>
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
                        <span className="text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Срок в графике: <strong>{deadlineDay}-е число (23:59)</strong>
                        </span>
                        <span className="text-amber-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Желтая зона (3 дня): <strong>{deadlineDay + 1}–{yellowEndDay}-е число</strong>
                        </span>
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Просрочка (4-й день): с {overdueDay}-го числа
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full sm:w-44 shrink-0">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono-nums">
                      <span>Оплатили: {totalPaidMembers}/{kotel.totalMembers}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-[#d4af37] to-emerald-400 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Current Month Payout Recipient Card */}
          {recipientMember && (
            <div className="bg-[#0b1f18] border border-emerald-500/30 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#f59e0b] text-black font-bold flex flex-col items-center justify-center shadow-lg">
                  <span className="text-[10px] uppercase font-semibold">Очередь</span>
                  <span className="text-base font-mono-nums leading-none">#{recipientMember.drawNumber || selectedMonth}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#d4af37] block">
                    💰 Получатель пула в этом месяце (Месяц {selectedMonth}):
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {recipientMember.name}
                    {recipientMember.isCurrentUser && (
                      <span className="px-2 py-0.5 text-[10px] bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 rounded-full">
                        Это Вы!
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {recipientMember.city} • Поручитель: {recipientMember.guarantorName} ({recipientMember.guarantorPhone})
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-5">
                <span className="text-[11px] text-slate-400 block">Сумма к получению (0% комиссии):</span>
                <span className="text-lg sm:text-xl font-bold font-mono-nums text-[#fef08a]">
                  {(kotel.totalPool).toLocaleString('ru-RU')} ₽
                </span>
                <div className="text-[11px] text-emerald-400 font-medium">
                  {totalPaidMembers === kotel.totalMembers ? '✓ Все взносы собраны, готово к выплате' : `Собрано ${(totalCollectedAmount).toLocaleString('ru-RU')} ₽`}
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs for Queue Table */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-[#06120e] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === 'all' ? 'bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Все ({kotel.members.length})
              </button>
              <button
                onClick={() => setFilterStatus('paid')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === 'paid' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Оплачено ({kotel.members.filter((m) => m.monthStatus === 'paid' || m.monthStatus === 'payout_received').length})
              </button>
              <button
                onClick={() => setFilterStatus('grace_period')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === 'grace_period' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Льготный период ({kotel.members.filter((m) => m.monthStatus === 'grace_period').length})
              </button>
              <button
                onClick={() => setFilterStatus('overdue')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === 'overdue' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Просрочено ({kotel.members.filter((m) => m.monthStatus === 'overdue').length})
              </button>
            </div>

            <span className="text-xs text-slate-400">
              Модератор группы: <strong className="text-slate-200">{kotel.adminName}</strong>
            </span>
          </div>

          {/* Queue & Status Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#06120e]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#091a14] border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Очередь</th>
                  <th className="py-3 px-3">Участник и деятельность</th>
                  <th className="py-3 px-3">Поручитель (Кафил)</th>
                  <th className="py-3 px-3">Рейтинг</th>
                  <th className="py-3 px-3">Статус за {selectedMonth}-й мес.</th>
                  <th className="py-3 px-3 text-right">Чек / Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isManual && filterStatus === 'all' ? (
                  Array.from({ length: kotel.totalMonths }, (_, idx) => idx + 1).map((slotNum) => {
                    const member = occupiedSlotsMap.get(slotNum);
                    const isRecipient = slotNum === selectedMonth;

                    if (!member) {
                      return (
                        <tr key={`slot_${slotNum}`} className="hover:bg-[#081a13]/60 transition-colors">
                          {/* Draw Order */}
                          <td className="py-3 px-3">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-mono-nums font-bold text-xs border border-dashed border-emerald-500/40 text-emerald-300 bg-slate-900/50">
                              #{slotNum}
                            </div>
                          </td>

                          {/* Empty Slot Info */}
                          <td className="py-3 px-3">
                            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>Свободное место #{slotNum}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Выплата пула на {slotNum}-й месяц
                            </div>
                          </td>

                          {/* Guarantor Info */}
                          <td className="py-3 px-3 text-slate-500">—</td>

                          {/* Amana Trust Score */}
                          <td className="py-3 px-3 text-slate-500">—</td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs">
                              Доступно для выбора
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-3 text-right">
                            {!kotel.isUserJoined && onJoinKotel ? (
                              <button
                                onClick={() => { playButtonTap(); onJoinKotel(kotel.id, slotNum); }}
                                className="px-3 py-1.5 rounded-lg bg-[#d4af37] hover:bg-[#f59e0b] text-black font-bold text-xs shadow-md transition-all"
                              >
                                Занять #{slotNum}-е место
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500">Ожидает участника</span>
                            )}
                          </td>
                        </tr>
                      );
                    }

                    const isPaid = member.monthStatus === 'paid' || member.monthStatus === 'payout_received';

                    return (
                      <tr
                        key={member.id}
                        className={`hover:bg-[#0b211a]/40 transition-colors ${
                          member.isCurrentUser ? 'bg-[#0d2a20]/40 font-medium' : ''
                        }`}
                      >
                        {/* Draw Order */}
                        <td className="py-3 px-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono-nums font-bold text-xs ${
                            isRecipient
                              ? 'bg-[#d4af37] text-black'
                              : 'bg-slate-900 border border-slate-700 text-slate-300'
                          }`}>
                            #{slotNum}
                          </div>
                        </td>

                        {/* Member Info with Occupation & Trust Badges */}
                        <td className="py-3 px-3">
                          <div className="flex items-start gap-2.5">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-lg object-cover border border-[#d4af37]/40 shrink-0 mt-0.5"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-[#07241b] border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {member.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                                <span className="truncate">{member.name}</span>
                                {member.isCurrentUser && (
                                  <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                                    Вы
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <TrustBadges
                                  occupation={member.occupation || 'Участник'}
                                  isOccupationVerified={member.isOccupationVerified ?? true}
                                  isPassportVerified={member.isPassportVerified ?? true}
                                  isGuarantorVerified={member.isGuarantorVerified ?? true}
                                  compact={true}
                                  showLabels={false}
                                />
                                <span className="text-[10px] text-slate-400">
                                  {member.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Guarantor Info */}
                        <td className="py-3 px-3">
                          <div className="text-slate-200 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{member.guarantorName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {member.guarantorPhone}
                          </div>
                        </td>

                        {/* Amana Trust Score */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs font-mono-nums font-semibold">
                            {member.amanaScore}
                          </span>
                        </td>

                        {/* Payment Status Badges */}
                        <td className="py-3 px-3">
                          {member.monthStatus === 'paid' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Оплачено ({member.paidAt || '15 авг'})</span>
                            </span>
                          )}

                          {member.monthStatus === 'payout_received' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-[#fef08a] text-xs font-medium">
                              <DollarSign className="w-3.5 h-3.5 text-[#d4af37]" />
                              <span>Пул выплачен</span>
                            </span>
                          )}

                          {member.monthStatus === 'grace_period' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-medium">
                              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span>Льготный период</span>
                            </span>
                          )}

                          {member.monthStatus === 'overdue' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-medium">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Просрочено ❌</span>
                            </span>
                          )}

                          {member.monthStatus === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Ожидает оплаты</span>
                            </span>
                          )}
                        </td>

                        {/* Action / Receipt button */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {member.receiptUrl ? (
                              <button
                                onClick={() => { playButtonTap(); setSelectedReceiptUrl(member.receiptUrl!); }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
                                <span>Чек</span>
                              </button>
                            ) : member.isCurrentUser ? (
                              <button
                                onClick={() => { playButtonTap(); onOpenReceiptUpload(kotel.id, member.id); }}
                                className="px-3 py-1 rounded-lg bg-[#d4af37] text-black text-xs font-bold hover:bg-[#f59e0b] flex items-center gap-1 shadow-md transition-all"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Внести взнос</span>
                              </button>
                            ) : member.monthStatus === 'overdue' || member.monthStatus === 'grace_period' ? (
                              <button
                                onClick={() => handleSendGuarantorReminder(member.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 hover:bg-rose-900 text-rose-200 text-xs font-medium flex items-center gap-1 transition-all"
                              >
                                <Send className="w-3 h-3" />
                                <span>{reminderSentMemberId === member.id ? 'Отправлено ✓' : 'Напомнить Кафилу'}</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  filteredMembers.map((member) => {
                    const isRecipient = member.drawNumber === selectedMonth;
                    const isPaid = member.monthStatus === 'paid' || member.monthStatus === 'payout_received';

                    return (
                      <tr
                        key={member.id}
                        className={`hover:bg-[#0b211a]/40 transition-colors ${
                          member.isCurrentUser ? 'bg-[#0d2a20]/40 font-medium' : ''
                        }`}
                      >
                        {/* Draw Order */}
                        <td className="py-3 px-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono-nums font-bold text-xs ${
                            isRecipient
                              ? 'bg-[#d4af37] text-black'
                              : 'bg-slate-900 border border-slate-700 text-slate-300'
                          }`}>
                            {member.drawNumber ? `#${member.drawNumber}` : '—'}
                          </div>
                        </td>

                        {/* Member Info with Occupation & Trust Badges */}
                        <td className="py-3 px-3">
                          <div className="flex items-start gap-2.5">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-lg object-cover border border-[#d4af37]/40 shrink-0 mt-0.5"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-[#07241b] border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {member.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                                <span className="truncate">{member.name}</span>
                                {member.isCurrentUser && (
                                  <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                                    Вы
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <TrustBadges
                                  occupation={member.occupation || 'Участник'}
                                  isOccupationVerified={member.isOccupationVerified ?? true}
                                  isPassportVerified={member.isPassportVerified ?? true}
                                  isGuarantorVerified={member.isGuarantorVerified ?? true}
                                  compact={true}
                                  showLabels={false}
                                />
                                <span className="text-[10px] text-slate-400">
                                  {member.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Guarantor Info */}
                        <td className="py-3 px-3">
                          <div className="text-slate-200 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{member.guarantorName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {member.guarantorPhone}
                          </div>
                        </td>

                        {/* Amana Trust Score */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-xs font-mono-nums font-semibold">
                            {member.amanaScore}
                          </span>
                        </td>

                        {/* Payment Status Badges */}
                        <td className="py-3 px-3">
                          {member.monthStatus === 'paid' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Оплачено ({member.paidAt || '15 авг'})</span>
                            </span>
                          )}

                          {member.monthStatus === 'payout_received' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-[#fef08a] text-xs font-medium">
                              <DollarSign className="w-3.5 h-3.5 text-[#d4af37]" />
                              <span>Пул выплачен</span>
                            </span>
                          )}

                          {member.monthStatus === 'grace_period' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-medium">
                              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span>Льготный период</span>
                            </span>
                          )}

                          {member.monthStatus === 'overdue' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-medium">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Просрочено ❌</span>
                            </span>
                          )}

                          {member.monthStatus === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Ожидает оплаты</span>
                            </span>
                          )}
                        </td>

                        {/* Action / Receipt button */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {member.receiptUrl ? (
                              <button
                                onClick={() => { playButtonTap(); setSelectedReceiptUrl(member.receiptUrl!); }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
                                <span>Чек</span>
                              </button>
                            ) : member.isCurrentUser ? (
                              <button
                                onClick={() => { playButtonTap(); onOpenReceiptUpload(kotel.id, member.id); }}
                                className="px-3 py-1 rounded-lg bg-[#d4af37] text-black text-xs font-bold hover:bg-[#f59e0b] flex items-center gap-1 shadow-md transition-all"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Внести взнос</span>
                              </button>
                            ) : member.monthStatus === 'overdue' || member.monthStatus === 'grace_period' ? (
                              <button
                                onClick={() => handleSendGuarantorReminder(member.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 hover:bg-rose-900 text-rose-200 text-xs font-medium flex items-center gap-1 transition-all"
                              >
                                <Send className="w-3 h-3" />
                                <span>{reminderSentMemberId === member.id ? 'Отправлено ✓' : 'Напомнить Кафилу'}</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Касса взаимопомощи защищена правилами системы Вай Котел (0% Риба)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { playButtonTap(); onClose(); }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
            >
              Закрыть
            </button>
          </div>
        </div>

      </div>

      {/* Receipt Image Modal Preview */}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative bg-[#061410] border border-[#d4af37]/40 rounded-2xl p-5 max-w-md w-full shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#d4af37]" />
                Квитанция перевода взноса
              </h3>
              <button
                onClick={() => setSelectedReceiptUrl(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-700 my-3 bg-black">
              <img
                src={selectedReceiptUrl}
                alt="Чек об оплате"
                className="w-full h-auto max-h-80 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="bg-[#0b241d] p-3 rounded-xl border border-emerald-500/30 text-xs text-left text-slate-300 space-y-1 mb-4">
              <div><strong>Статус проверки:</strong> <span className="text-emerald-400 font-semibold">Подтверждено модератором ✓</span></div>
              <div><strong>Сумма взноса:</strong> {(kotel.monthlyContribution).toLocaleString('ru-RU')} ₽</div>
              <div><strong>Назначение:</strong> Пополнение общего фонда (0% Риба)</div>
            </div>

            <button
              onClick={() => setSelectedReceiptUrl(null)}
              className="w-full py-2.5 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f59e0b] transition-all"
            >
              Закрыть просмотр
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
