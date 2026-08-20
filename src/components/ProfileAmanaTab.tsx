import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  PhoneCall, 
  FileText, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  Download,
  Settings,
  Briefcase,
  FileCheck2,
  Camera,
  Check,
  UserPlus,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { UserProfile, AmanaScoreLog } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { TrustBadges } from './TrustBadges';

interface ProfileAmanaTabProps {
  user: UserProfile;
  amanaLogs: AmanaScoreLog[];
  onOpenSharia: () => void;
  onOpenOnboarding: () => void;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenTier2Verification?: () => void;
  onSwitchToAdmin?: () => void;
}

export const ProfileAmanaTab: React.FC<ProfileAmanaTabProps> = ({
  user,
  amanaLogs,
  onOpenSharia,
  onOpenOnboarding,
  onUpdateUser,
  onOpenTier2Verification,
  onSwitchToAdmin,
}) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  const isVerified = user.verificationStatus === 'verified' || user.verificationTier === 2;
  const isPending = user.verificationStatus === 'pending';

  const getTierInfo = (score: number) => {
    if (score >= 120) {
      return {
        name: 'Золотой уровень ВК',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        maxLimit: 'До 1 500 000 ₽',
        privileges: 'Доступ ко всем инвестиционным и авто-котлам, приоритет при жеребьевке',
      };
    }
    if (score >= 90) {
      return {
        name: 'Серебряный уровень ВК',
        badge: 'bg-slate-400/20 text-slate-200 border-slate-400/40',
        maxLimit: 'До 600 000 ₽',
        privileges: 'Доступ к стандартным и бизнес-котлам',
      };
    }
    return {
      name: 'Базовый ВК',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      maxLimit: 'До 300 000 ₽ (без поручителя)',
      privileges: 'Доступ к стандартным пулам до 300 000 ₽',
    };
  };

  const tier = getTierInfo(user.amanaScore);

  const handleDownloadCertificate = () => {
    playButtonTap();
    playSuccessChime();
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 3000);
  };

  const handleOpenVerification = () => {
    playButtonTap();
    if (onOpenTier2Verification) {
      onOpenTier2Verification();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. User Profile & Guarantor Header */}
      <div className="bg-[#091712] border border-[#d4af37]/35 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Avatar & Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#d4af37] shadow-xl bg-slate-900"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#103a2e] to-[#081b15] border-2 border-[#d4af37] flex items-center justify-center text-2xl sm:text-3xl font-bold font-brand text-[#fef08a] shadow-xl">
                  {user.fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
              
              <button
                onClick={() => { playButtonTap(); setIsSettingsModalOpen(true); }}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#d4af37] border-2 border-[#091712] flex items-center justify-center text-xs font-bold text-black shadow-md hover:scale-110 transition-transform"
                title="Сменить фото и настройки"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${tier.badge}`}>
                  {tier.name}
                </span>
                
                {isVerified ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                    Верифицирован 🛡️ (Ур. 2)
                  </span>
                ) : isPending ? (
                  <span 
                    onClick={handleOpenVerification}
                    className="text-xs text-amber-300 font-semibold flex items-center gap-1 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 cursor-pointer hover:bg-amber-900 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    На проверке ⏳
                  </span>
                ) : (
                  <span 
                    onClick={handleOpenVerification}
                    className="text-xs text-slate-300 font-medium flex items-center gap-1 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700 cursor-pointer hover:border-[#d4af37] hover:text-[#fef08a] transition-colors"
                  >
                    <span>Базовый (Лимит 300k)</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
                {user.fullName}
              </h1>

              {/* Occupation and Trust Badges */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <TrustBadges
                  occupation={user.occupation}
                  isOccupationVerified={user.isOccupationVerified}
                  isPassportVerified={user.isPassportVerified}
                  isGuarantorVerified={user.isGuarantorVerified || isVerified}
                  amanaScore={user.amanaScore}
                />
              </div>

              {user.occupationDetails && (
                <p className="text-xs text-slate-300">
                  <span className="text-slate-500">Организация / Бизнес:</span> <strong>{user.occupationDetails}</strong>
                </p>
              )}

              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pt-0.5">
                <span>{user.city}</span>
                <span>•</span>
                <span>{user.phone}</span>
                <span>•</span>
                <span className="text-slate-300 font-mono">ID: VK-095-2026</span>
              </div>
            </div>
          </div>

          {/* Right Side: Quick Action Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => { playButtonTap(); setIsSettingsModalOpen(true); }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950 to-[#0d2a20] border border-[#d4af37]/40 text-[#fef08a] hover:bg-emerald-900 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Settings className="w-4 h-4 text-[#d4af37]" />
              Редактировать анкету
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED SECTION: «Поручитель и Верификация» (Guarantor & Tier 2 Status) */}
      {/* ========================================================================= */}
      <div className="bg-[#091712] border border-[#d4af37]/35 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#103b2e] to-[#071511] border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37]">
              <ShieldCheck className="w-5 h-5 text-[#fef08a]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                Поручитель и Верификация (Уровень 2)
              </h2>
              <p className="text-xs text-slate-400">
                Шариатский институт Кафаля (поручительства) для доступа к пулам свыше 300 000 ₽
              </p>
            </div>
          </div>

          {/* Badge indicator */}
          <div>
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Верифицирован 🛡️ (Лимит снят)</span>
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold shadow-sm animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>На проверке у администратора ⏳</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/40 text-[#fef08a] text-xs font-bold shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Требуется для сумм 300k+</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Card Content depending on status */}
        {isVerified ? (
          /* STATE A: VERIFIED (TIER 2) */
          <div className="bg-gradient-to-br from-[#051a13] to-[#092b1e] border border-emerald-500/40 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Поручитель (Кафил): {user.guarantorName || 'Даудов Ибрагим Ахмедович'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    SMS Подтверждено ✓
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex flex-wrap gap-4 pt-1">
                  <span>Степень родства: <strong className="text-white">{user.guarantorRelation || 'Брат'}</strong></span>
                  <span>Телефон: <strong className="text-emerald-300 font-mono">{user.guarantorPhone || '+7 (928) 714-33-22'}</strong></span>
                  <span>Паспорт поручителя: <strong className="text-slate-200 font-mono">Проверен ✓</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenVerification}
                  className="px-4 py-2 rounded-xl bg-[#091f17] border border-[#d4af37]/40 hover:border-[#d4af37] text-xs font-bold text-[#fef08a] transition-all flex items-center gap-1.5 hover:bg-[#0e2c21]"
                >
                  <span>Изменить данные поручителя</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300/90 flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                Золотой щит активен • Вам доступно создание и вступление в любые авто- и бизнес-котлы (до 1 500 000 ₽)
              </span>
              <span className="text-slate-400 text-[11px]">
                Одобрено: {user.verificationApprovedAt || '2026 г.'}
              </span>
            </div>
          </div>
        ) : isPending ? (
          /* STATE B: PENDING MODERATION */
          <div className="bg-gradient-to-br from-[#1c1404] to-[#120e03] border border-amber-500/45 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-sm font-bold text-amber-200">
                    Заявка на верификацию находится на рассмотрении
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Данные поручителя и сканы паспортов отправлены. Ожидайте подтверждения (1–3 часа).
                </p>
                <div className="text-xs text-slate-300 flex flex-wrap gap-4 pt-1 font-mono">
                  <span>Поручитель: <strong className="text-white">{user.guarantorName || 'Даудов Ибрагим Ахмедович'}</strong></span>
                  <span>Телефон: <strong className="text-amber-300">{user.guarantorPhone || '+7 (928) 714-33-22'}</strong></span>
                  <span>Статус: <strong className="text-amber-400">⏳ Ожидает модерации</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenVerification}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>Проверить заявку</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {onSwitchToAdmin && (
                  <button
                    type="button"
                    onClick={() => { playButtonTap(); onSwitchToAdmin(); }}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span>Перейти в Админ-панель</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* STATE C: UNVERIFIED (TIER 1) */
          <div className="bg-gradient-to-br from-[#0c1e17] via-[#081711] to-[#141d08] border border-[#d4af37]/40 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-sm font-bold text-[#fef08a]">
                    Лимит базового уровня: до 300 000 ₽
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Для снятия лимита в 300 000 ₽ и участия в крупных автомобильных и бизнес-пулах добавьте поручителя (Кафила) и пройдите быструю верификацию по SMS и паспорту.
                </p>
                <div className="flex items-center gap-3 text-xs text-emerald-400 pt-1">
                  <span>✓ 100% Онлайн</span>
                  <span>•</span>
                  <span>✓ SMS-подтверждение</span>
                  <span>•</span>
                  <span>✓ +20 баллов рейтинга Аманат</span>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleOpenVerification}
                  className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Пройти верификацию (Уровень 2)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Trust Badges & Verification Methods */}
      <div className="bg-[#091712] border border-[#d4af37]/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Подтверждение надежности и доверия в Вай Котел
            </h3>
            <p className="text-xs text-slate-400">
              Способы верификации, которые видят другие участники при вступлении в котел
            </p>
          </div>

          <button
            onClick={() => { playButtonTap(); setIsSettingsModalOpen(true); }}
            className="text-xs text-[#d4af37] hover:underline font-semibold flex items-center gap-1"
          >
            Настроить значки →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Item 1: Occupation */}
          <div className="p-4 rounded-xl bg-[#061410] border border-emerald-500/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <strong className="text-xs text-white">Деятельность</strong>
                {user.isOccupationVerified && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    ✓ Проверена
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                {user.occupation || 'Предприниматель / Бизнесмен'}
              </p>
              <span className="text-[10px] text-slate-400 block">
                Подтверждает платежеспособность и стабильный источник дохода
              </span>
            </div>
          </div>

          {/* Item 2: Passport */}
          <div 
            onClick={handleOpenVerification}
            className="p-4 rounded-xl bg-[#061410] border border-blue-500/30 flex items-start gap-3 cursor-pointer hover:border-blue-400 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-300 border border-blue-500/40 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <strong className="text-xs text-white">Паспортные данные</strong>
                {user.isPassportVerified || isVerified ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                    ✓ Проверен
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Не проверен
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                Паспорт РФ верифицирован
              </p>
              <span className="text-[10px] text-slate-400 block">
                Защита от анонимности и гарантия чистоты договора
              </span>
            </div>
          </div>

          {/* Item 3: Guarantor Kafil */}
          <div 
            onClick={handleOpenVerification}
            className="p-4 rounded-xl bg-[#061410] border border-amber-500/30 flex items-start gap-3 cursor-pointer hover:border-amber-400 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <strong className="text-xs text-white">Гарант (Кафаля)</strong>
                {isVerified ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                    ✓ Закреплен
                  </span>
                ) : isPending ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                    ⏳ На проверке
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Не закреплен
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                {user.guarantorName || 'Даудов Ибрагим Ахмедович'}
              </p>
              <span className="text-[10px] text-slate-400 block">
                Солидарная ответственность по исламскому праву
              </span>
            </div>
          </div>

          {/* Item 4: Amana Score */}
          <div className="p-4 rounded-xl bg-[#061410] border border-[#d4af37]/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0c3125] text-[#fef08a] border border-[#d4af37]/40 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <strong className="text-xs text-white">Рейтинг Аманат</strong>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/30 font-bold">
                  {user.amanaScore} б.
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 font-semibold">
                {tier.name}
              </p>
              <span className="text-[10px] text-slate-400 block">
                {user.completedKotelsCount} успешно завершенных котлов без срывов
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Amana Trust Score Visual Gauge & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gauge Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#091712] border border-[#d4af37]/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#d4af37]" />
                  Индекс доверия ВК
                </h3>
                <p className="text-xs text-slate-400">
                  Социально-репутационный индекс честности в системе
                </p>
              </div>
            </div>

            {/* Score Display */}
            <div className="text-center py-4 space-y-2">
              <div className="inline-flex flex-col items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br from-[#0c3125] to-[#071711] border-4 border-[#d4af37] shadow-2xl shadow-[#d4af37]/20">
                <span className="text-4xl font-extrabold font-mono-nums text-[#fef08a]">
                  {user.amanaScore}
                </span>
                <span className="text-xs text-slate-400 font-medium">из 150 макс.</span>
              </div>

              <div className="text-base font-bold text-white mt-2">
                {tier.name}
              </div>
              <p className="text-xs text-emerald-300 max-w-xs mx-auto">
                {tier.privileges}. Максимальный доступный пул: <strong>{tier.maxLimit}</strong>
              </p>
            </div>

            {/* Trust Meter Progress */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0 (Базовый)</span>
                <span>90 (Серебряный)</span>
                <span>150 (Золотой)</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-[#d4af37] rounded-full transition-all duration-700"
                  style={{ width: `${(user.amanaScore / 150) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Sharia compliance note */}
          <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] text-slate-400 bg-[#061410] p-3 rounded-xl">
            <span className="text-[#fef08a] font-semibold block mb-0.5">Принцип Исламской финансовой этики:</span>
            Вай Котел не взимает штрафов в рублях (чтобы не нарушать запрет на Риба). Ответственность регулируется снижением рейтинга ВК и поручительством.
          </div>
        </div>

        {/* Scoring Rules Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-[#091712] border border-[#d4af37]/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white font-display">
              Правила начисления и списания баллов ВК
            </h3>
            <span className="text-xs text-slate-400">0% Риба</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Rule 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#061410] border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
                  +15
                </div>
                <div>
                  <strong className="text-white block">Досрочный взнос</strong>
                  <span className="text-slate-400">Оплата взноса заранее (за 3–5 дней до установленного срока котла)</span>
                </div>
              </div>
              <span className="text-emerald-400 font-bold font-mono-nums shrink-0">+15 баллов</span>
            </div>

            {/* Rule 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#061410] border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
                  +10
                </div>
                <div>
                  <strong className="text-white block">Оплата строго в срок</strong>
                  <span className="text-slate-400">Внесение взноса в день планового срока котла (до 23:59)</span>
                </div>
              </div>
              <span className="text-emerald-400 font-bold font-mono-nums shrink-0">+10 баллов</span>
            </div>

            {/* Rule 3 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#061410] border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
                  +20
                </div>
                <div>
                  <strong className="text-white block">Верификация поручителя (Кафаля)</strong>
                  <span className="text-slate-400">Закрепление поручителя по SMS и подтверждение паспорта (Уровень 2)</span>
                </div>
              </div>
              <span className="text-emerald-400 font-bold font-mono-nums shrink-0">+20 баллов</span>
            </div>

            {/* Rule 4 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#061410] border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
                  +25
                </div>
                <div>
                  <strong className="text-white block">Успешное завершение полного котла</strong>
                  <span className="text-slate-400">Завершение всех месяцев цикла (3–12 мес.) без срывов графика</span>
                </div>
              </div>
              <span className="text-emerald-400 font-bold font-mono-nums shrink-0">+25 баллов</span>
            </div>

            {/* Rule 5: Yellow zone */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#141208] border border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold">
                  0
                </div>
                <div>
                  <strong className="text-amber-200 block">Желтая зона (3 дня льготы)</strong>
                  <span className="text-slate-400">Оплата в течение 3 дней после срока (без начисления бонуса скорости)</span>
                </div>
              </div>
              <span className="text-amber-400 font-bold font-mono-nums shrink-0">Без бонуса</span>
            </div>

            {/* Rule 6: Overdue penalty */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#170a0a] border border-rose-500/30">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center justify-center font-bold">
                  -30
                </div>
                <div>
                  <strong className="text-rose-200 block">Просрочка (на 4-й день после срока)</strong>
                  <span className="text-slate-400">На 4-й день включается просрочка, звонок поручителю и блокировка</span>
                </div>
              </div>
              <span className="text-rose-400 font-bold font-mono-nums shrink-0">-30 баллов</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. VK Rating History Logs */}
      <div className="bg-[#091712] border border-[#d4af37]/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white font-display">
              История транзакций рейтинга ВК
            </h3>
            <p className="text-xs text-slate-400">
              Все начисления за пунктуальность, верификацию и своевременные взносы
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {amanaLogs.map((log) => (
            <div key={log.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  log.type === 'bonus'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                }`}>
                  {log.type === 'bonus' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>

                <div>
                  <div className="font-semibold text-white">
                    {log.reason}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{log.kotelTitle}</span>
                    <span>•</span>
                    <span>{log.date}</span>
                  </div>
                </div>
              </div>

              <div className="font-mono-nums font-bold text-sm shrink-0">
                {log.type === 'bonus' ? (
                  <span className="text-emerald-400">+{log.points}</span>
                ) : (
                  <span className="text-rose-400">-{log.points}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Completed Kotels History */}
      <div className="bg-[#091712] border border-[#d4af37]/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white font-display">
              Завершенные котлы (Архив сбережений)
            </h3>
            <p className="text-xs text-slate-400">
              Успешно пройденные циклы без нарушений и задержек
            </p>
          </div>
          <button
            onClick={handleDownloadCertificate}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{copiedContract ? 'Сертификат сформирован ✓' : 'Сертификат доверия'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#061410] border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                ✓ Завершен (12 из 12 мес)
              </span>
              <span className="text-xs text-slate-400">Май 2025 — Май 2026</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Вай Котел Резерв №2</h4>
              <p className="text-xs text-slate-400">Семейный целевой фонд (50 000 ₽ / мес)</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Полученный пул:</span>
              <strong className="text-[#fef08a] font-mono-nums">600 000 ₽ (0% Риба)</strong>
            </div>
          </div>

          <div className="bg-[#061410] border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                ✓ Завершен (6 из 6 мес)
              </span>
              <span className="text-xs text-slate-400">Июль 2024 — Январь 2025</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Вай Котел Резерв №1</h4>
              <p className="text-xs text-slate-400">Стартовый пул сбережений (20 000 ₽ / мес)</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Полученный пул:</span>
              <strong className="text-[#fef08a] font-mono-nums">120 000 ₽ (0% Риба)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <ProfileSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        onSaveProfile={onUpdateUser}
      />

    </div>
  );
};
