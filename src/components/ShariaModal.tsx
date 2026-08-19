import React, { useState } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Award, 
  Download, 
  Check,
  Percent
} from 'lucide-react';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface ShariaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const ShariaModal: React.FC<ShariaModalProps> = ({
  isOpen,
  onClose,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState<'contract' | 'rules' | 'faq'>('contract');
  const [copiedContract, setCopiedContract] = useState(false);

  if (!isOpen) return null;

  const handleCopyContract = () => {
    playButtonTap();
    playSuccessChime();
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10">
      <div className="relative w-full max-w-4xl bg-[#091511] border border-[#d4af37]/40 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-200 my-auto flex flex-col justify-between">
        
        {/* Header */}
        <div>
          <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0e3327] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-lg">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-xs font-bold font-mono-nums">
                    0% Риба • Халяль
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">
                    Стандарты AAOIFI №19 (0% Риба)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Шариатское соответствие и Договор «ВК»
                </h2>
              </div>
            </div>

            <button
              onClick={() => { playButtonTap(); onClose(); }}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Navigation Pills inside modal */}
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => { playButtonTap(); setActiveTab('contract'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'contract'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Электронный договор ВК</span>
            </button>
            <button
              onClick={() => { playButtonTap(); setActiveTab('rules'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Принципы системы (0% Риба)</span>
            </button>
            <button
              onClick={() => { playButtonTap(); setActiveTab('faq'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'faq'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Шариатские вопросы и ответы</span>
            </button>
          </div>

          {/* TAB 1: Digital Contract Text */}
          {activeTab === 'contract' && (
            <div className="space-y-4">
              <div className="bg-[#06120e] border border-[#d4af37]/25 rounded-2xl p-5 text-xs text-slate-300 space-y-3 leading-relaxed max-h-96 overflow-y-auto">
                <div className="text-center pb-3 border-b border-[#d4af37]/20">
                  <h3 className="text-sm font-bold text-[#fef08a] font-brand uppercase tracking-wider">
                    ТИПОВОЙ ДОГОВОР БЕСПРОЦЕНТНОГО ВЗАИМНОГО СБЕРЕЖЕНИЯ (ВАЙ КОТЕЛ)
                  </h3>
                  <p className="text-[11px] text-emerald-400 mt-0.5">В соответствии с нормами исламского финансового права</p>
                </div>

                <p>
                  <strong>1. Общие положения и природа сделки:</strong> Данный договор регулирует добровольное объединение физических лиц в кассу взаимопомощи (Вай Котел / ROSCA). Операции квалифицируются как беспроцентный заем во благо с последующим встречным предоставлением займа в порядке определенной жеребьевки.
                </p>

                <p>
                  <strong>2. Категорический запрет Риба (ссудного процента):</strong> Любые проценты, надбавки к основной сумме, плата за пользование деньгами или скрытые комиссии строго запрещены. Сумма, выплаченная каждым участником в течение полного цикла, в точности равна сумме полученного пула.
                </p>

                <p>
                  <strong>3. График платежей и периоды:</strong>
                  <br />• <strong>Основной срок:</strong> до 15-го числа каждого месяца включительно.
                  <br />• <strong>Льготный период (без денежных штрафов):</strong> с 16 по 19 число. В данный период не начисляются пени, однако снижается внутренний рейтинг ВК.
                  <br />• <strong>Просрочка:</strong> после 19-го числа наступает ответственность поручителя (Кафила).
                </p>

                <p>
                  <strong>4. Институт поручительства (Кафаля / Даман):</strong> Каждый участник обязан предоставить совершеннолетнего благонадежного поручителя, который несет субсидиарную ответственность за исполнение финансовых обязательств заемщика.
                </p>

                <p>
                  <strong>5. Жеребьевка (Барабан):</strong> Очередность выплат распределяется открытой честной жеребьевкой без преимуществ для кого-либо, либо по добровольному взаимному согласию участников группы.
                </p>
              </div>

              <div className="flex items-center justify-between bg-[#0c241c] p-4 rounded-xl border border-emerald-500/30 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Электронно подписано пользователем: <strong>{userName}</strong> (Верифицировано по SMS)</span>
                </div>
                <button
                  onClick={handleCopyContract}
                  className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f59e0b] transition-all flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{copiedContract ? 'Договор скопирован ✓' : 'Скачать PDF'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Sharia Rules */}
          {activeTab === 'rules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#061410] border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
                  0%
                </div>
                <h4 className="text-sm font-bold text-[#fef08a]">Кард аль-Хасан (Добропорядочный заем)</h4>
                <p className="text-slate-300 leading-relaxed">
                  В Исламе предоставление беспроцентного займа ближнему является высоко вознаграждаемым праведным делом. Все участники по очереди выступают кредиторами и заемщиками друг для друга.
                </p>
              </div>

              <div className="bg-[#061410] border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
                  🛡️
                </div>
                <h4 className="text-sm font-bold text-[#fef08a]">Кафаля (Институт поручительства)</h4>
                <p className="text-slate-300 leading-relaxed">
                  Поручитель (Кафил) гарантирует добросовестность участника. Это древнейший исламский инструмент защиты общего фонда без залога и ростовщических процентов.
                </p>
              </div>

              <div className="bg-[#061410] border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
                  ⚖️
                </div>
                <h4 className="text-sm font-bold text-[#fef08a]">Отсутствие денежных пеней</h4>
                <p className="text-slate-300 leading-relaxed">
                  Взимание денежных штрафов за задержку займа запрещено нормами Шариата (так как любая выгода от долга является Риба). Дисциплина регулируется только социальным рейтингом Аманат.
                </p>
              </div>

              <div className="bg-[#061410] border border-slate-800 p-4 rounded-2xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
                  🎲
                </div>
                <h4 className="text-sm font-bold text-[#fef08a]">Справедливая жеребьевка (Куръа)</h4>
                <p className="text-slate-300 leading-relaxed">
                  Барабан жеребьевки распределяет очередность открыто и случайным образом, устраняя разногласия и споры между братьями (отсутствие гарара и майсира).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3 text-xs">
              <div className="bg-[#061410] border border-slate-800 p-4 rounded-xl space-y-1">
                <h4 className="font-bold text-white">Разрешена ли система «Котел» (Джам'ийя) в Исламе?</h4>
                <p className="text-slate-300 leading-relaxed">
                  Да, абсолютное большинство современных исламских ученых (включая Постоянный комитет фетв КСА и Академию Исламского фикха при ОИС) признали ротационные сберегательные ассоциации дозволенными (халяль), поскольку в них отсутствует процентный прирост.
                </p>
              </div>

              <div className="bg-[#061410] border border-slate-800 p-4 rounded-xl space-y-1">
                <h4 className="font-bold text-white">Что происходит, если участник задерживает взнос?</h4>
                <p className="text-slate-300 leading-relaxed">
                  С 16 по 19 число действует льготный период (снижается рейтинг Аманат на 10 баллов). Если взнос не внесен до 19-го, модератор обращается к поручителю, который обязан закрыть взнос в силу договора Кафаля.
                </p>
              </div>

              <div className="bg-[#061410] border border-slate-800 p-4 rounded-xl space-y-1">
                <h4 className="font-bold text-white">Берет ли платформа «Wai Kotel» процент от собранного пула?</h4>
                <p className="text-slate-300 leading-relaxed">
                  Нет, платформа не удерживает ни 1% от пула накоплений. Все 100% средств переходят получателю очереди в полном объеме.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Вай Котел — этика и чистота взаимных финансов</span>
          </span>
          <button
            onClick={() => { playButtonTap(); onClose(); }}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Понятно, закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
