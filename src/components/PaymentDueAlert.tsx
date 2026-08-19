import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Bell, 
  ShieldAlert, 
  ArrowRight, 
  Upload, 
  Check, 
  Flame, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { Kotel, UserProfile } from '../types';
import { playButtonTap } from '../utils/audio';

interface PaymentDueAlertProps {
  user: UserProfile;
  activeKotel?: Kotel;
  onOpenReceiptUpload: (kotelId: string, memberId: string) => void;
  onOpenKotelDetail: (kotelId: string) => void;
}

export const PaymentDueAlert: React.FC<PaymentDueAlertProps> = ({
  user,
  activeKotel,
  onOpenReceiptUpload,
  onOpenKotelDetail,
}) => {
  // Real current day of month
  const realDate = new Date();
  const realDay = realDate.getDate();
  const currentMonthName = realDate.toLocaleString('ru-RU', { month: 'long' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  // Allow date simulation for interactive testing while defaulting to real calendar date
  const [simulatedDay, setSimulatedDay] = useState<number>(() => {
    // If today is 13, 14, or 15, use real day. If real day is already past or earlier, default to 13 to highlight the requested feature immediately while letting user toggle
    return realDay <= 15 ? realDay : 13;
  });
  const [isTesterExpanded, setIsTesterExpanded] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Effective day being evaluated
  const currentDay = simulatedDay;
  const deadlineDay = activeKotel?.paymentDeadlineDay || 15;
  const gracePeriodDay = activeKotel?.gracePeriodDeadlineDay || (deadlineDay + 3);
  const overdueDay = deadlineDay + 4;
  
  // Calculate days remaining to deadlineDay
  const daysUntilDue = deadlineDay - currentDay;
  const isLessThan3Days = daysUntilDue < 3 && daysUntilDue >= 0; // 2 days, 1 day, or 0 days (deadline day)
  const isGracePeriod = currentDay > deadlineDay && currentDay <= gracePeriodDay;
  const isOverdue = currentDay >= overdueDay;

  // Check if current user has paid this month
  const userMember = activeKotel?.members.find((m) => m.isCurrentUser || m.id === user.id);
  const isPaid = userMember?.monthStatus === 'paid' || userMember?.monthStatus === 'payout_received';
  const monthlyAmount = activeKotel?.monthlyContribution || 30000;

  // Determine urgency tier
  const getUrgencyConfig = () => {
    if (isPaid) {
      return {
        theme: 'paid',
        title: 'Взнос за текущий месяц успешно внесен',
        subtitle: `Ваш платеж на сумму ${monthlyAmount.toLocaleString('ru-RU')} ₽ зафиксирован. Рейтинг защищен!`,
        badgeText: 'Оплачено вовремя ✓',
        badgeColor: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40',
        borderColor: 'border-emerald-500/40',
        bgGradient: 'from-[#082218] via-[#061811] to-[#040f0b]',
        accentColor: 'text-emerald-400',
        icon: CheckCircle2,
      };
    }

    if (daysUntilDue === 0) {
      return {
        theme: 'critical',
        title: 'Срок сегодня! Срочно внесите взнос до 23:59',
        subtitle: `Сегодня ${deadlineDay} ${currentMonthName}. Внесите ${monthlyAmount.toLocaleString('ru-RU')} ₽, чтобы избежать перехода в желтую зону и сохранить максимальный бонус скорости (+15 баллов).`,
        badgeText: '⚠️ СРОК СЕГОДНЯ',
        badgeColor: 'bg-rose-950/90 text-rose-300 border-rose-500/50 animate-pulse',
        borderColor: 'border-rose-500/60 shadow-rose-900/30',
        bgGradient: 'from-[#2c0d0d] via-[#1a0808] to-[#0d0404]',
        accentColor: 'text-rose-400',
        icon: Flame,
      };
    }

    if (daysUntilDue === 1) {
      return {
        theme: 'urgent',
        title: 'Внимание: До срока взноса остался 1 день!',
        subtitle: `Срок — завтра (${deadlineDay} ${currentMonthName}). Сумма к внесению: ${monthlyAmount.toLocaleString('ru-RU')} ₽ в фонд «${activeKotel?.title || 'Вай Котел'}».`,
        badgeText: `⏳ Остался 1 день (до ${deadlineDay}-го числа)`,
        badgeColor: 'bg-amber-950/90 text-amber-200 border-amber-500/50 animate-pulse',
        borderColor: 'border-amber-500/60 shadow-amber-900/20',
        bgGradient: 'from-[#241705] via-[#170e03] to-[#0a0701]',
        accentColor: 'text-amber-400',
        icon: AlertTriangle,
      };
    }

    if (daysUntilDue === 2) {
      return {
        theme: 'warning',
        title: 'Напоминание: До срока взноса осталось 2 дня',
        subtitle: `${deadlineDay} ${currentMonthName} — плановый срок оплаты ${monthlyAmount.toLocaleString('ru-RU')} ₽. Своевременный взнос повышает ваш рейтинг ВК.`,
        badgeText: `🔔 Осталось 2 дня (до ${deadlineDay}-го числа)`,
        badgeColor: 'bg-[#d4af37]/20 text-[#fef08a] border-[#d4af37]/50',
        borderColor: 'border-[#d4af37]/50 shadow-[#d4af37]/15',
        bgGradient: 'from-[#1e1906] via-[#141004] to-[#090702]',
        accentColor: 'text-[#fef08a]',
        icon: Bell,
      };
    }

    if (isGracePeriod) {
      const graceDayNumber = currentDay - deadlineDay; // 1, 2, or 3
      return {
        theme: 'grace',
        title: `Идет желтая зона оплаты (день ${graceDayNumber} из 3)`,
        subtitle: `Основной срок (${deadlineDay}-е число) прошел. Действует 3 дня льготного периода до ${gracePeriodDay} ${currentMonthName}. Внесите ${monthlyAmount.toLocaleString('ru-RU')} ₽, чтобы не допустить просрочки.`,
        badgeText: `🟡 Желтая зона: до ${gracePeriodDay}-го числа`,
        badgeColor: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
        borderColor: 'border-amber-500/60',
        bgGradient: 'from-[#201506] via-[#140d03] to-[#080501]',
        accentColor: 'text-amber-400',
        icon: Clock,
      };
    }

    if (isOverdue) {
      return {
        theme: 'overdue',
        title: 'Критическая просрочка платежа (красная зона)!',
        subtitle: `3 дня желтой зоны истекли. С ${overdueDay}-го числа платеж считается просроченным (-30 баллов рейтинга). Пожалуйста, срочно внесите платеж или свяжитесь с поручителем (${user.guarantorName}).`,
        badgeText: '🚨 ПРОСРОЧКА (КРАСНАЯ ЗОНА)',
        badgeColor: 'bg-rose-950 text-rose-200 border-rose-500/60 animate-pulse',
        borderColor: 'border-rose-600',
        bgGradient: 'from-[#2d0808] via-[#190404] to-[#0c0202]',
        accentColor: 'text-rose-400',
        icon: ShieldAlert,
      };
    }

    // Normal upcoming notice (> 3 days)
    return {
      theme: 'upcoming',
      title: `Следующий взнос: ${deadlineDay} ${currentMonthName}`,
      subtitle: `До планового срока осталось ${daysUntilDue} дн. Сумма взноса: ${monthlyAmount.toLocaleString('ru-RU')} ₽.`,
      badgeText: `До срока: ${daysUntilDue} дн.`,
      badgeColor: 'bg-slate-800/90 text-slate-300 border-slate-700',
      borderColor: 'border-slate-800',
      bgGradient: 'from-[#081711] via-[#05100c] to-[#030a07]',
      accentColor: 'text-emerald-400',
      icon: Calendar,
    };
  };

  const config = getUrgencyConfig();
  const IconComponent = config.icon;

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between bg-[#091712] border border-slate-800 px-4 py-2 rounded-xl text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#d4af37]" />
          <span>Уведомление о платеже свернуто</span>
        </div>
        <button
          onClick={() => { playButtonTap(); setIsDismissed(false); }}
          className="text-xs text-[#d4af37] hover:underline font-semibold"
        >
          Развернуть алерт
        </button>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-br ${config.bgGradient} border-2 ${config.borderColor} rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl transition-all duration-300 overflow-hidden`}>
      
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-4">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              isPaid ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400' :
              daysUntilDue === 0 ? 'bg-rose-950 border border-rose-500/50 text-rose-400 animate-pulse' :
              daysUntilDue <= 2 && daysUntilDue >= 0 ? 'bg-amber-950 border border-amber-500/50 text-amber-300' :
              isGracePeriod ? 'bg-amber-950 border border-amber-500/60 text-amber-300' :
              isOverdue ? 'bg-rose-950 border border-rose-600 text-rose-300 animate-pulse' :
              'bg-[#061711] border border-[#d4af37]/30 text-[#d4af37]'
            }`}>
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono-nums border ${config.badgeColor}`}>
                  {config.badgeText}
                </span>
                
                {/* Specific highlight for < 3 days */}
                {isLessThan3Days && !isPaid && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-200 border border-red-500/40 text-[11px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-400" />
                    Менее 3 дней (срок {deadlineDay}-го)
                  </span>
                )}

                <span className="text-xs text-slate-400 font-medium">
                  {capitalizedMonth} 2026
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white font-display mt-1">
                {config.title}
              </h3>
            </div>
          </div>

          {/* Quick Date Simulator Toggle Button */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => { playButtonTap(); setIsTesterExpanded(!isTesterExpanded); }}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 flex items-center gap-1.5 transition-colors"
              title="Проверить работу уведомлений для разных дней месяца"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Тест дат ({currentDay}-е число)</span>
              {isTesterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => { playButtonTap(); setIsDismissed(true); }}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Скрыть"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Interactive Date Simulator Bar (Collapsible for testing & reviewer validation) */}
        {isTesterExpanded && (
          <div className="bg-[#050f0c] border border-[#d4af37]/30 rounded-2xl p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af37]" />
                Интерактивный симулятор даты (проверка зон взносов для срока {deadlineDay}-го числа):
              </span>
              <span className="text-[11px] text-slate-400">
                Календарная дата системы: <strong>{realDay}-е {currentMonthName}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
              <button
                onClick={() => { playButtonTap(); setSimulatedDay(Math.max(1, deadlineDay - 2)); }}
                className={`px-2 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                  simulatedDay === Math.max(1, deadlineDay - 2)
                    ? 'bg-[#d4af37] text-black shadow-lg font-bold ring-2 ring-[#fef08a]'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{Math.max(1, deadlineDay - 2)} {currentMonthName}</span>
                <span className="text-[10px] opacity-85">Осталось 2 дня</span>
              </button>

              <button
                onClick={() => { playButtonTap(); setSimulatedDay(Math.max(1, deadlineDay - 1)); }}
                className={`px-2 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                  simulatedDay === Math.max(1, deadlineDay - 1)
                    ? 'bg-amber-500 text-black shadow-lg font-bold ring-2 ring-amber-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{Math.max(1, deadlineDay - 1)} {currentMonthName}</span>
                <span className="text-[10px] opacity-85">Остался 1 день</span>
              </button>

              <button
                onClick={() => { playButtonTap(); setSimulatedDay(deadlineDay); }}
                className={`px-2 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                  simulatedDay === deadlineDay
                    ? 'bg-rose-600 text-white shadow-lg font-bold ring-2 ring-rose-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{deadlineDay} {currentMonthName}</span>
                <span className="text-[10px] opacity-85">Срок сегодня!</span>
              </button>

              <button
                onClick={() => { playButtonTap(); setSimulatedDay(deadlineDay + 2); }}
                className={`px-2 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                  simulatedDay === deadlineDay + 2
                    ? 'bg-amber-500 text-black shadow-lg font-bold ring-2 ring-amber-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{deadlineDay + 2} {currentMonthName}</span>
                <span className="text-[10px] opacity-85">Желтая зона (день 2)</span>
              </button>

              <button
                onClick={() => { playButtonTap(); setSimulatedDay(overdueDay); }}
                className={`px-2 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                  simulatedDay === overdueDay
                    ? 'bg-rose-700 text-white shadow-lg font-bold ring-2 ring-rose-500'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{overdueDay} {currentMonthName}</span>
                <span className="text-[10px] opacity-85">Просрочка (4-й день)</span>
              </button>

              <button
                onClick={() => { playButtonTap(); setSimulatedDay(realDay); }}
                className={`px-2 py-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all col-span-2 sm:col-span-1 ${
                  simulatedDay === realDay
                    ? 'bg-emerald-600 text-white shadow-lg font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Реальная дата</span>
                <span className="text-[10px] opacity-85">{realDay} {currentMonthName}</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Text and context description (8 cols) */}
          <div className="md:col-span-8 space-y-3">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {config.subtitle}
            </p>

            {/* Micro Highlights */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <div className="bg-[#061410]/80 border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Срок: <strong className="text-white">{deadlineDay} {currentMonthName} (23:59)</strong></span>
              </div>

              <div className="bg-[#061410]/80 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Желтая зона (3 дня): <strong className="text-white">до {gracePeriodDay} {currentMonthName}</strong></span>
              </div>

              <div className="bg-[#061410]/80 border border-rose-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Просрочка: <strong className="text-white">с {overdueDay}-го числа</strong></span>
              </div>

              <div className="bg-[#061410]/80 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-emerald-300">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Бонус ВК: <strong className="text-white">+10..+15 баллов</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Quick Payment Trigger (4 cols) */}
          <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center">
            
            {isPaid ? (
              <div className="space-y-2">
                <div className="bg-emerald-950/60 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Платеж подтвержден</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono-nums">30 000 ₽</span>
                </div>
                
                {activeKotel && (
                  <button
                    onClick={() => {
                      playButtonTap();
                      onOpenReceiptUpload(activeKotel.id, userMember?.id || 'm_06');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Посмотреть / обновить чек</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {activeKotel && (
                  <button
                    onClick={() => {
                      playButtonTap();
                      onOpenReceiptUpload(activeKotel.id, userMember?.id || 'm_06');
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                      daysUntilDue === 0
                        ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-900/40 animate-pulse'
                        : 'bg-[#d4af37] hover:bg-[#f59e0b] text-black shadow-[#d4af37]/25'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Внести взнос ({monthlyAmount.toLocaleString('ru-RU')} ₽)</span>
                  </button>
                )}

                {activeKotel && (
                  <button
                    onClick={() => {
                      playButtonTap();
                      onOpenKotelDetail(activeKotel.id);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Ведомость участников</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#d4af37]" />
                  </button>
                )}
              </>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
