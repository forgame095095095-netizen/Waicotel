import React from 'react';
import { 
  ShieldCheck, 
  Briefcase, 
  FileCheck2, 
  UserCheck, 
  Award, 
  CheckCircle,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface TrustBadgesProps {
  occupation?: string;
  isOccupationVerified?: boolean;
  isPassportVerified?: boolean;
  isGuarantorVerified?: boolean;
  verificationTier?: 1 | 2;
  verificationStatus?: 'tier1_basic' | 'pending' | 'verified' | 'rejected' | 'unregistered';
  amanaScore?: number;
  compact?: boolean;
  showLabels?: boolean;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({
  occupation,
  isOccupationVerified = true,
  isPassportVerified = true,
  isGuarantorVerified = true,
  verificationTier = 2,
  verificationStatus = 'verified',
  amanaScore = 125,
  compact = false,
  showLabels = true,
}) => {
  const isTier2 = verificationTier === 2 && verificationStatus === 'verified';
  const isPending = verificationStatus === 'pending';

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        {/* Tier Shield Badge */}
        {isTier2 ? (
          <span 
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-950/90 to-[#1b3d2f] border border-[#d4af37]/70 text-[#fef08a] text-[10px] font-bold shadow-sm"
            title="Уровень 2: Золотой щит верификации (пулы 300k+ ₽ открыты)"
          >
            <ShieldCheck className="w-2.5 h-2.5 text-[#d4af37]" />
            {showLabels && <span>Ур. 2 (300k+)</span>}
          </span>
        ) : isPending ? (
          <span 
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-medium"
            title="Заявка 2-го уровня в ожидании одобрения администратора"
          >
            <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
            {showLabels && <span>В ожидании (300k+)</span>}
          </span>
        ) : (
          <span 
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-medium"
            title="Уровень 1: Стандартный участник (лимит до 300k ₽)"
          >
            <ShieldCheck className="w-2.5 h-2.5 text-slate-400" />
            {showLabels && <span>Ур. 1 (&lt;300k)</span>}
          </span>
        )}

        {occupation && (
          <span 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-200 border border-slate-700 text-[10px] font-medium"
            title={`Деятельность: ${occupation}`}
          >
            <Briefcase className="w-2.5 h-2.5 text-[#d4af37]" />
            <span className="truncate max-w-[110px]">{occupation}</span>
            {isOccupationVerified && (
              <span className="text-emerald-400 font-bold" title="Деятельность проверена">✓</span>
            )}
          </span>
        )}

        {isOccupationVerified && (
          <span 
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-medium"
            title="Деятельность и статус подтверждены"
          >
            <Briefcase className="w-2.5 h-2.5 text-emerald-400" />
            {showLabels && <span>Деятельность ✓</span>}
          </span>
        )}

        {isPassportVerified && (
          <span 
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-950/80 border border-blue-500/40 text-blue-300 text-[10px] font-medium"
            title="Паспортные данные проверены"
          >
            <FileCheck2 className="w-2.5 h-2.5 text-blue-400" />
            {showLabels && <span>Паспорт ✓</span>}
          </span>
        )}

        {isGuarantorVerified && (
          <span 
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-medium"
            title="Поручитель (Кафил) подтвержден"
          >
            <UserCheck className="w-2.5 h-2.5 text-amber-400" />
            {showLabels && <span>Кафил ✓</span>}
          </span>
        )}

        {amanaScore !== undefined && amanaScore >= 120 && (
          <span 
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#fef08a] text-[10px] font-bold"
            title={`Высокий рейтинг Аманат: ${amanaScore} баллов`}
          >
            <Award className="w-2.5 h-2.5 text-[#d4af37]" />
            <span>{amanaScore}</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Tier 2 Gold Shield Badge */}
      {isTier2 ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-950/90 via-[#103024] to-amber-950/90 border border-[#d4af37] text-xs text-[#fef08a] shadow-md">
          <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="font-bold">Уровень 2: Золотой щит (300k+)</span>
        </div>
      ) : isPending ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 text-xs text-amber-300">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold">Уровень 2: В ожидании одобрения</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Уровень 1: Стандарт (лимит &lt;300 000 ₽)</span>
        </div>
      )}

      {/* Occupation Badge */}
      {occupation && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#071d16] border border-emerald-500/40 text-xs text-emerald-300">
          <Briefcase className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="font-semibold">{occupation}</span>
          {isOccupationVerified && (
            <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
              Подтверждено ✓
            </span>
          )}
        </div>
      )}

      {/* Passport Badge */}
      {isPassportVerified && (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0a182b] border border-blue-500/40 text-xs text-blue-300">
          <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Паспорт проверен</span>
        </div>
      )}

      {/* Guarantor Badge */}
      {isGuarantorVerified && (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#221808] border border-amber-500/40 text-xs text-amber-300">
          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Кафил подтвержден</span>
        </div>
      )}

      {/* Amana Trust Badge */}
      {amanaScore !== undefined && (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0e2c22] border border-[#d4af37]/40 text-xs text-[#fef08a]">
          <Award className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Аманат {amanaScore} б.</span>
        </div>
      )}
    </div>
  );
};
