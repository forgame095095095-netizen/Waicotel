import React, { useState } from 'react';
import { ShieldCheck, UserCheck, PhoneCall, Clock, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, FileText, Check } from 'lucide-react';
import { UserProfile, RelationType } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [step, setStep] = useState<'form' | 'contract' | 'pending' | 'success'>(
    user.verificationStatus === 'pending' ? 'pending' : user.verificationStatus === 'verified' ? 'success' : 'form'
  );

  const [fullName, setFullName] = useState(user.fullName || 'Мансур Умаров');
  const [phone, setPhone] = useState(user.phone || '+7 (928) 095-77-88');
  const [city, setCity] = useState(user.city || 'г. Грозный');
  const [guarantorName, setGuarantorName] = useState(user.guarantorName || 'Ислам Умаров');
  const [guarantorPhone, setGuarantorPhone] = useState(user.guarantorPhone || '+7 (928) 714-33-22');
  const [guarantorRelation, setGuarantorRelation] = useState<RelationType>(user.guarantorRelation || 'Брат');
  
  const [agreeContract, setAgreeContract] = useState(true);
  const [agreeGuarantorCall, setAgreeGuarantorCall] = useState(true);
  const [isSimulatingApproval, setIsSimulatingApproval] = useState(false);

  if (!isOpen) return null;

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonTap();
    setStep('contract');
  };

  const handleSignContract = () => {
    playButtonTap();
    const updated: UserProfile = {
      ...user,
      fullName,
      phone,
      city,
      guarantorName,
      guarantorPhone,
      guarantorRelation,
      verificationStatus: 'pending',
      verificationSubmittedAt: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      hasSignedContract: true,
      amanaScore: 100, // Starter score
    };
    onUpdateUser(updated);
    setStep('pending');
  };

  const handleFastTrackApproval = () => {
    setIsSimulatingApproval(true);
    playButtonTap();
    setTimeout(() => {
      setIsSimulatingApproval(false);
      const updated: UserProfile = {
        ...user,
        fullName,
        phone,
        city,
        guarantorName,
        guarantorPhone,
        guarantorRelation,
        verificationStatus: 'verified',
        verificationApprovedAt: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        amanaScore: 125,
        hasSignedContract: true,
      };
      onUpdateUser(updated);
      playSuccessChime();
      setStep('success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10">
      <div className="relative w-full max-w-2xl bg-[#091511] border border-[#d4af37]/30 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-200 my-auto">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                {step === 'form' && 'Верификация участника и поручителя'}
                {step === 'contract' && 'Договор ВК (0% Риба)'}
                {step === 'pending' && 'Проверка администратором'}
                {step === 'success' && 'Верификация успешно пройдена!'}
              </h2>
              <p className="text-xs text-emerald-300/80">
                Wai Kotel — система взаимного доверия без процентов и риба
              </p>
            </div>
          </div>

          <button
            onClick={() => { playButtonTap(); onClose(); }}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-emerald-950/50 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* STEP 1: Registration Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="bg-[#0b1e18] p-4 rounded-xl border border-emerald-500/20 text-xs text-emerald-200/90 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <span>
                Для участия в ротационных котлах требуется подтвержденный поручитель (Кафил). В Исламе поручительство гарантирует своевременность выплат и чистоту намерений всех участников.
              </span>
            </div>

            {/* Section 1: Personal info */}
            <div>
              <h3 className="text-sm font-semibold text-[#fef08a] mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#d4af37]" />
                1. Ваши личные данные
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ФИО (Полностью) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Например: Мансур Умаров"
                    className="w-full bg-[#06120e] border border-slate-700/80 focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Основной телефон *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (928) 000-00-00"
                    className="w-full bg-[#06120e] border border-slate-700/80 focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Город / Населенный пункт *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="г. Грозный"
                    className="w-full bg-[#06120e] border border-slate-700/80 focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Guarantor info */}
            <div className="border-t border-slate-800/80 pt-5">
              <h3 className="text-sm font-semibold text-[#fef08a] mb-3 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#d4af37]" />
                2. Обязательный поручитель (Кафил / Гарант)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Степень родства *
                  </label>
                  <select
                    value={guarantorRelation}
                    onChange={(e) => setGuarantorRelation(e.target.value as RelationType)}
                    className="w-full bg-[#06120e] border border-slate-700/80 focus:border-[#d4af37] rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors"
                  >
                    <option value="Брат">Брат</option>
                    <option value="Отец">Отец</option>
                    <option value="Дядя">Дядя</option>
                    <option value="Родственник">Родственник</option>
                    <option value="Близкий друг">Близкий друг</option>
                    <option value="Коллега">Коллега / Партнер</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ФИО поручителя *
                  </label>
                  <input
                    type="text"
                    required
                    value={guarantorName}
                    onChange={(e) => setGuarantorName(e.target.value)}
                    placeholder="Например: Ислам Умаров"
                    className="w-full bg-[#06120e] border border-slate-700/80 focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Телефон поручителя (для проверочного звонка) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guarantorPhone}
                    onChange={(e) => setGuarantorPhone(e.target.value)}
                    placeholder="+7 (928) 700-00-00"
                    className="w-full bg-[#06120e] border border-slate-700/80 focus:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Администратор свяжется с поручителем по телефону или WhatsApp для подтверждения согласия поручительства.
                  </p>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreeGuarantorCall}
                  onChange={(e) => setAgreeGuarantorCall(e.target.checked)}
                  required
                  className="mt-0.5 rounded text-[#d4af37] focus:ring-0 bg-black border-slate-700"
                />
                <span>
                  Я подтверждаю, что поручитель предупрежден и согласен подтвердить мою благонадежность при звонке модератора.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { playButtonTap(); onClose(); }}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#d4af37] text-black hover:bg-[#f59e0b] shadow-lg shadow-[#d4af37]/20 flex items-center gap-2 transition-all"
              >
                <span>Далее: Шариатский договор</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Digital VK Contract */}
        {step === 'contract' && (
          <div className="space-y-6">
            <div className="bg-[#06130f] border border-[#d4af37]/30 rounded-xl p-4.5 max-h-72 overflow-y-auto text-xs leading-relaxed space-y-3 text-slate-300">
              <div className="text-center pb-2 border-b border-[#d4af37]/20">
                <h4 className="text-sm font-bold text-[#fef08a] font-brand tracking-wide">
                  ДОГОВОР ВЗАИМНОГО БЕСПРОЦЕНТНОГО СБЕРЕЖЕНИЯ (ВАЙ КОТЕЛ)
                </h4>
                <p className="text-[11px] text-emerald-400">Система коллективной взаимопомощи «Wai Kotel»</p>
              </div>

              <p>
                <strong>1. Предмет договора:</strong> Участники добровольно объединяются в группу взаимных сбережений (Вай Котел). Каждый участник обязуется своевременно вносить ежемесячный взнос в общий фонд в строгом соответствии с графиком.
              </p>
              <p>
                <strong>2. Принцип беспроцентного займа (0% Риба):</strong> Все взаиморасчеты производятся без процентов, комиссий, страховок или скрытых платежей. Сумма внесенных средств в точности равна сумме получаемого пула.
              </p>
              <p>
                <strong>3. Сроки и льготный период:</strong> Основной срок внесения взноса — <strong>15 число</strong> каждого расчетного месяца. Льготный период без штрафов — до <strong>19 числа</strong>.
              </p>
              <p>
                <strong>4. Поручительство (Кафаля):</strong> Указанный поручитель ({guarantorName}, {guarantorPhone}) несет субсидиарную моральную и финансовую ответственность за соблюдение графика выплат в соответствии с нормами Шариата.
              </p>
              <p>
                <strong>5. Жеребьевка (Барабан):</strong> Очередность получения пула определяется справедливой открытой жеребьевкой или взаимным согласием всех участников.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-[#0b241d]/70 p-3.5 rounded-xl border border-emerald-500/30 text-xs text-slate-200">
              <input
                type="checkbox"
                checked={agreeContract}
                onChange={(e) => setAgreeContract(e.target.checked)}
                className="rounded text-[#d4af37] focus:ring-0 bg-black border-slate-600"
              />
              <span>
                Я, <strong>{fullName}</strong>, внимательно ознакомлен с условиями Договора ВК, принимаю обязательства беспроцентного займа и подтверждаю электронную подпись.
              </span>
            </label>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => { playButtonTap(); setStep('form'); }}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Назад к анкете
              </button>
              <button
                type="button"
                disabled={!agreeContract}
                onClick={handleSignContract}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black hover:opacity-90 disabled:opacity-50 shadow-lg shadow-[#d4af37]/20 flex items-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Подписать и отправить на модерацию</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Pending Admin Approval (1-3 hrs) */}
        {step === 'pending' && (
          <div className="text-center py-6 space-y-6">
            <div className="relative w-20 h-20 mx-auto rounded-full bg-amber-950/40 border-2 border-amber-400/40 flex items-center justify-center text-amber-300">
              <Clock className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-ping"></div>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">
                Заявка отправлена на модерацию
              </h3>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                Статус: Ожидает подтверждения администратором (1–3 часа)
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-2">
                Администратор проверяет указанный номер поручителя <strong>{guarantorPhone}</strong> ({guarantorName}). После подтверждения звонком ваш статус обновится до «Верифицирован».
              </p>
            </div>

            {/* Verification checklist items */}
            <div className="bg-[#061410] border border-slate-800 rounded-xl p-4 text-left max-w-md mx-auto space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Электронный договор ВК подписан</span>
              </div>
              <div className="flex items-center gap-2.5 text-amber-300">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Проверочный звонок поручителю ({guarantorRelation})</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px]">3</div>
                <span>Активация базового рейтинга ВК (125 баллов)</span>
              </div>
            </div>

            {/* Fast Track Simulator for quick testing */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="bg-[#0b241c]/50 p-3 rounded-xl border border-[#d4af37]/20 max-w-md mx-auto mb-4">
                <p className="text-[11px] text-[#fef08a] mb-2 font-medium">
                  ⚡ Тестовый режим мгновенного одобрения:
                </p>
                <button
                  type="button"
                  disabled={isSimulatingApproval}
                  onClick={handleFastTrackApproval}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  {isSimulatingApproval ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Симуляция одобрения администратором...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Одобрить заявку мгновенно (Симулятор модератора)</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => { playButtonTap(); onClose(); }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Закрыть и перейти к просмотру каталога
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-950/60 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-xl shadow-emerald-900/30">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-display">
                Поздравляем, {user.fullName}!
              </h3>
              <p className="text-xs text-emerald-300 font-medium">
                Поручитель {user.guarantorName} подтвержден. Вам присвоен рейтинг ВК 125 баллов.
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Вам открыт полный доступ к вступлению в активные ротационные котлы и участию в Барабане жеребьевки.
              </p>
            </div>

            <button
              onClick={() => { playButtonTap(); onClose(); }}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold text-sm shadow-xl shadow-[#d4af37]/25 hover:opacity-95 transition-all"
            >
              Перейти в личный кабинет
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
