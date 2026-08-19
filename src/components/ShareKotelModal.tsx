import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Coins, 
  MessageSquare, 
  Send, 
  QrCode, 
  FileText,
  ListOrdered,
  Shuffle
} from 'lucide-react';
import { Kotel } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';
import { TrustBadges } from './TrustBadges';

interface ShareKotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  kotel: Kotel;
}

export const ShareKotelModal: React.FC<ShareKotelModalProps> = ({
  isOpen,
  onClose,
  kotel,
}) => {
  const [copiedType, setCopiedType] = useState<'all' | 'link' | 'code' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'friendly' | 'short' | 'sharia'>('friendly');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0].split('#')[0] : '';
  const shareUrl = `${currentUrl}?kotel=${kotel.inviteCode || kotel.id}`;
  const freeSpots = Math.max(0, kotel.totalMembers - kotel.members.length);

  // Template 1: Friendly / Family & Friends
  const friendlyText = `🤝 Ассаламу Алейкум!

Приглашаю тебя в наш халяльный Вай Котел:
🏛 «${kotel.title}»
🎯 Цель: ${kotel.purpose}

💰 Ежемесячный взнос: ${(kotel.monthlyContribution).toLocaleString('ru-RU')} ₽
🏆 Общий пул на руки: ${(kotel.totalPool).toLocaleString('ru-RU')} ₽ (${kotel.totalMonths} мес.)
👥 Мест: ${kotel.totalMembers} чел. (свободно ${freeSpots} ${freeSpots === 1 ? 'место' : 'мест'})
⚡ Очередь: ${kotel.queueType === 'manual' ? 'Ручной выбор места в очереди' : 'Случайный жребий на Барабане'}
👤 Организатор: ${kotel.adminName} (${kotel.adminOccupation || 'Деятельность подтверждена ✓'})

🕌 100% Халяль: 0% Риба, без банковских процентов и скрытых переплат.
🛡️ Проверенные участники, паспортная верификация и гарантия Кафила.

📲 Переходи по прямой ссылке, чтобы занять свое место:
${shareUrl}

Или введи код котла в поиске: ${kotel.inviteCode}`;

  // Template 2: Short Promo for Stories & Chat Broadcasts
  const shortText = `🔥 Набираем участников в халяльный Вай Котел «${kotel.title}»!
💰 Взнос: ${(kotel.monthlyContribution).toLocaleString('ru-RU')} ₽/мес → Пул: ${(kotel.totalPool).toLocaleString('ru-RU')} ₽
👤 Организатор: ${kotel.adminName} [${kotel.adminOccupation || 'Проверен'}]
✅ 0% Риба | Без процентов | Свободно мест: ${freeSpots}
👉 Вступай по ссылке: ${shareUrl}
🔑 Код котла: ${kotel.inviteCode}`;

  // Template 3: Sharia & Trust Focused
  const shariaText = `📜 Исламская касса взаимопомощи (Вай Котел) «${kotel.title}»

Сбор целевых средств без процентов и кредитов (0% Риба).
• Взнос: ${(kotel.monthlyContribution).toLocaleString('ru-RU')} ₽ в месяц
• Выплата на руки: ${(kotel.totalPool).toLocaleString('ru-RU')} ₽
• Срок: ${kotel.totalMonths} месяцев (${freeSpots} мест свободно)
• Организатор: ${kotel.adminName} (${kotel.adminOccupation || 'Деятельность подтверждена'})
• Проверка: Паспортная верификация и поручительство (Кафил)

Прямая ссылка для вступления:
${shareUrl}
(Код приглашения: ${kotel.inviteCode})`;

  const getActiveText = () => {
    if (selectedTemplate === 'short') return shortText;
    if (selectedTemplate === 'sharia') return shariaText;
    return friendlyText;
  };

  const handleCopy = (text: string, type: 'all' | 'link' | 'code') => {
    playSuccessChime();
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2500);
  };

  const handleShareWhatsApp = () => {
    playButtonTap();
    const text = encodeURIComponent(getActiveText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    playButtonTap();
    const text = encodeURIComponent(getActiveText());
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#091f17] border border-[#d4af37]/40 rounded-2xl p-5 sm:p-7 shadow-2xl overflow-hidden my-auto text-slate-200">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#fef08a] shadow-inner">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-display">
                Поделиться и пригласить в котел
              </h3>
              <p className="text-xs text-slate-300">
                Отправьте прямую ссылку или код друзьям, семье и в чаты
              </p>
            </div>
          </div>
          <button
            onClick={() => { playButtonTap(); onClose(); }}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Visual Promo Banner Preview (Карточка котла для рекламы и рассылки) */}
        <div className="relative z-10 mb-5 bg-gradient-to-br from-[#0c2e22] via-[#092219] to-[#04140e] border-2 border-[#d4af37]/60 rounded-2xl p-4 sm:p-5 shadow-xl overflow-hidden">
          {/* Header of banner */}
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37] text-black text-xs font-bold font-mono-nums shadow-sm">
                0% Риба
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-medium">
                Вай Котел
              </span>
            </div>
            
            {/* Quick Code Badge */}
            <div className="flex items-center gap-1.5 bg-black/60 border border-[#d4af37]/40 px-3 py-1 rounded-xl">
              <span className="text-[11px] text-slate-400">Код котла:</span>
              <strong className="text-sm text-[#fef08a] font-mono-nums tracking-wider">{kotel.inviteCode}</strong>
            </div>
          </div>

          <h4 className="text-lg sm:text-xl font-bold text-white font-display mb-1">
            {kotel.title}
          </h4>
          <p className="text-xs text-emerald-300/90 line-clamp-1 mb-4">
            🎯 {kotel.purpose}
          </p>

          {/* Key Parameters Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
            <div className="bg-[#051711]/90 border border-slate-700/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Взнос в месяц</span>
              <strong className="text-sm sm:text-base font-bold text-white font-mono-nums">
                {(kotel.monthlyContribution).toLocaleString('ru-RU')} ₽
              </strong>
            </div>
            <div className="bg-[#051711]/90 border border-slate-700/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Общий пул</span>
              <strong className="text-sm sm:text-base font-bold text-[#fef08a] font-mono-nums">
                {(kotel.totalPool).toLocaleString('ru-RU')} ₽
              </strong>
            </div>
            <div className="bg-[#051711]/90 border border-slate-700/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Свободно мест</span>
              <strong className="text-sm sm:text-base font-bold text-emerald-400 font-mono-nums">
                {freeSpots} из {kotel.totalMembers}
              </strong>
            </div>
            <div className="bg-[#051711]/90 border border-slate-700/80 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Очередь</span>
              <strong className="text-xs font-bold text-slate-200 flex items-center gap-1 mt-0.5 truncate">
                {kotel.queueType === 'manual' ? (
                  <>
                    <ListOrdered className="w-3 h-3 text-[#d4af37] shrink-0" />
                    <span>По выбору</span>
                  </>
                ) : (
                  <>
                    <Shuffle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Барабан</span>
                  </>
                )}
              </strong>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-slate-800/80 pt-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#0d2e24] border border-[#d4af37]/50 flex items-center justify-center text-[10px] font-bold text-[#fef08a]">
                {kotel.adminName.slice(0, 1)}
              </div>
              <div>
                <span className="text-xs font-semibold text-white">{kotel.adminName}</span>
                <span className="text-[10px] text-slate-400 block">{kotel.adminOccupation || 'Организатор'}</span>
              </div>
            </div>

            <TrustBadges
              occupation={kotel.adminOccupation || 'Организатор'}
              isOccupationVerified={kotel.isAdminOccupationVerified ?? true}
              isPassportVerified={kotel.isAdminPassportVerified ?? true}
              isGuarantorVerified={true}
              compact={true}
              showLabels={false}
            />
          </div>
        </div>

        {/* 2. Direct Link Box with 1-Click Copy */}
        <div className="relative z-10 bg-[#051610] p-3.5 rounded-2xl border border-slate-700/80 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Прямая ссылка для быстрого входа:</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-mono-nums">
              Сразу открывает этот котел
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#020b08] border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono text-emerald-300 truncate select-all">
              {shareUrl}
            </div>
            <button
              onClick={() => handleCopy(shareUrl, 'link')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0 ${
                copiedType === 'link'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-[#d4af37] text-black hover:bg-[#f59e0b]'
              }`}
            >
              {copiedType === 'link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'link' ? 'Скопировано!' : 'Копировать'}</span>
            </button>
          </div>
        </div>

        {/* 3. Text Template Selector & Preview */}
        <div className="relative z-10 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Готовый рекламный текст для отправки:</span>
            </label>
            <div className="flex items-center gap-1 bg-[#051610] p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { playButtonTap(); setSelectedTemplate('friendly'); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedTemplate === 'friendly' ? 'bg-[#d4af37] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Друзьям
              </button>
              <button
                type="button"
                onClick={() => { playButtonTap(); setSelectedTemplate('short'); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedTemplate === 'short' ? 'bg-[#d4af37] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Короткий
              </button>
              <button
                type="button"
                onClick={() => { playButtonTap(); setSelectedTemplate('sharia'); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedTemplate === 'sharia' ? 'bg-[#d4af37] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Официальный
              </button>
            </div>
          </div>

          <div className="bg-[#04120d] border border-slate-700/80 rounded-2xl p-3.5 text-xs text-slate-200 whitespace-pre-line font-sans leading-relaxed max-h-44 overflow-y-auto select-all shadow-inner">
            {getActiveText()}
          </div>
        </div>

        {/* 4. Action Buttons (WhatsApp, Telegram, Copy Full Text) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Copy Full Text */}
          <button
            onClick={() => handleCopy(getActiveText(), 'all')}
            className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              copiedType === 'all'
                ? 'bg-emerald-500 text-black'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
            }`}
          >
            {copiedType === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-[#d4af37]" />}
            <span>{copiedType === 'all' ? 'Текст скопирован!' : 'Копировать весь текст'}</span>
          </button>

          {/* Share to WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="p-3 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#20bd5a] text-black flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>В WhatsApp</span>
          </button>

          {/* Share to Telegram */}
          <button
            onClick={handleShareTelegram}
            className="p-3 rounded-xl font-bold text-xs bg-[#229ED9] hover:bg-[#1e8cc0] text-white flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>В Telegram</span>
          </button>
        </div>
      </div>
    </div>
  );
};
