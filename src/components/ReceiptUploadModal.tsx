import React, { useState } from 'react';
import { Upload, CheckCircle2, FileText, Sparkles, Building2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { Kotel } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface ReceiptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  kotel: Kotel;
  memberId: string;
  onConfirmPayment: (kotelId: string, memberId: string, receiptData: { bankName: string; transactionNumber: string; receiptUrl: string }) => void;
}

export const ReceiptUploadModal: React.FC<ReceiptUploadModalProps> = ({
  isOpen,
  onClose,
  kotel,
  memberId,
  onConfirmPayment,
}) => {
  const [bankName, setBankName] = useState('Сбербанк');
  const [transactionNumber, setTransactionNumber] = useState(`TXN-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [previewImage, setPreviewImage] = useState<string>('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonTap();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      playSuccessChime();

      onConfirmPayment(kotel.id, memberId, {
        bankName,
        transactionNumber,
        receiptUrl: previewImage,
      });

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10">
      <div className="relative w-full max-w-lg bg-[#091511] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-200 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Внесение взноса и чек
              </h3>
              <p className="text-xs text-emerald-400">
                {kotel.title} ({(kotel.monthlyContribution).toLocaleString('ru-RU')} ₽)
              </p>
            </div>
          </div>

          <button
            onClick={() => { playButtonTap(); onClose(); }}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Чек успешно прикреплен!</h4>
              <p className="text-xs text-emerald-300 mt-1">
                Взнос {(kotel.monthlyContribution).toLocaleString('ru-RU')} ₽ зафиксирован. Вам начислено <strong>+15 баллов рейтинга ВК</strong> за своевременность.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Amount Banner */}
            <div className="bg-[#061410] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Сумма взноса за текущий месяц:</span>
                <span className="text-xl font-bold font-mono-nums text-[#fef08a]">
                  {(kotel.monthlyContribution).toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-xs font-bold">
                0% комиссий
              </span>
            </div>

            {/* Bank Selector */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Банк отправителя:
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-[#06120e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
              >
                <option value="Сбербанк">Сбербанк (СБП / Онлайн)</option>
                <option value="Т-Банк">Т-Банк (Тинькофф)</option>
                <option value="ВТБ">ВТБ</option>
                <option value="Альфа-Банк">Альфа-Банк</option>
                <option value="Наличный расчет">Наличными модератору группы</option>
              </select>
            </div>

            {/* Transaction Number */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Номер операции / Код перевода:
              </label>
              <input
                type="text"
                value={transactionNumber}
                onChange={(e) => setTransactionNumber(e.target.value)}
                className="w-full bg-[#06120e] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono-nums focus:border-[#d4af37]"
              />
            </div>

            {/* Image Preview & Upload Trigger */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Скриншот квитанции / чека:
              </label>
              
              <div className="border border-dashed border-slate-700 bg-[#06120e] rounded-xl p-3 text-center space-y-2">
                {previewImage ? (
                  <div className="relative inline-block">
                    <img
                      src={previewImage}
                      alt="Превью чека"
                      className="w-32 h-32 object-cover rounded-lg border border-slate-600 mx-auto"
                    />
                    <div className="text-[10px] text-emerald-400 mt-1">Чек готов к отправке ✓</div>
                  </div>
                ) : (
                  <div className="py-4">
                    <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-1" />
                    <span className="text-slate-400 text-[11px] block">Перетащите скриншот чека сюда</span>
                  </div>
                )}

                <label className="inline-block px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
                  <span>Выбрать другой файл</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Sharia reminder */}
            <div className="bg-[#0b241c]/50 p-3 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Оплата направляется напрямую в общий пул участников Кард аль-Хасан.</span>
            </div>

            {/* Submit buttons */}
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
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-[#d4af37]/20 flex items-center gap-1.5 transition-all"
              >
                {isSubmitting ? 'Отправка...' : 'Подтвердить взнос'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
