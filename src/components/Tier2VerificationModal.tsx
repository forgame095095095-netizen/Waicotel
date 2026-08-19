import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Check, 
  Upload, 
  Image as ImageIcon,
  Send,
  Lock,
  Eye,
  FileCheck2,
  Scale
} from 'lucide-react';
import { UserProfile, RelationType, VerificationRequest } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface Tier2VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  targetPoolTitle?: string;
  targetPoolAmount?: number;
  onSubmitRequest: (request: VerificationRequest, updatedUser: UserProfile) => void;
  onFastApprove: (updatedUser: UserProfile) => void;
}

export const Tier2VerificationModal: React.FC<Tier2VerificationModalProps> = ({
  isOpen,
  onClose,
  user,
  targetPoolTitle = 'Грозный Авто-Котел №4',
  targetPoolAmount = 360000,
  onSubmitRequest,
  onFastApprove,
}) => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'guarantor' | 'passports' | 'contract' | 'submitted' | 'approved'>(
    user?.verificationStatus === 'pending' ? 'submitted' : user?.verificationStatus === 'verified' ? 'approved' : 'intro'
  );

  // Guarantor fields
  const [guarantorName, setGuarantorName] = useState(user?.guarantorName || 'Ислам Умаров');
  const [guarantorPhone, setGuarantorPhone] = useState(user?.guarantorPhone || '+7 (928) 714-33-22');
  const [guarantorRelation, setGuarantorRelation] = useState<RelationType>(user?.guarantorRelation || 'Брат');
  
  // Guarantor SMS confirmation
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [guarantorSmsSent, setGuarantorSmsSent] = useState(false);
  const [guarantorOtpCode, setGuarantorOtpCode] = useState('');
  const [isGuarantorSmsVerified, setIsGuarantorSmsVerified] = useState(user?.isGuarantorSmsConfirmed ?? false);

  // Passport Data - User
  const [userPassportSeries, setUserPassportSeries] = useState(user?.userPassport?.seriesNumber || '96 14 883921');
  const [userPassportIssuedBy, setUserPassportIssuedBy] = useState(user?.userPassport?.issuedBy || 'МВД по Чеченской Республике');
  const [userPassportPhoto, setUserPassportPhoto] = useState(user?.userPassport?.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80');

  // Passport Data - Guarantor
  const [guarantorPassportSeries, setGuarantorPassportSeries] = useState(user?.guarantorPassport?.seriesNumber || '96 11 445102');
  const [guarantorPassportIssuedBy, setGuarantorPassportIssuedBy] = useState(user?.guarantorPassport?.issuedBy || 'МВД по Чеченской Республике');
  const [guarantorPassportPhoto, setGuarantorPassportPhoto] = useState(user?.guarantorPassport?.photoUrl || 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=600&auto=format&fit=crop&q=80');

  // Contract Signature
  const [signatureName, setSignatureName] = useState(user?.fullName || 'Мансур Умаров');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeKafilahResponsibility, setAgreeKafilahResponsibility] = useState(true);

  if (!isOpen) return null;

  const handleSendGuarantorSms = () => {
    setIsSendingSms(true);
    playButtonTap();
    setTimeout(() => {
      setIsSendingSms(false);
      setGuarantorSmsSent(true);
    }, 600);
  };

  const handleVerifyGuarantorOtp = () => {
    if (guarantorOtpCode.length < 4) return;
    playSuccessChime();
    setIsGuarantorSmsVerified(true);
  };

  const handleSubmitToAdmin = () => {
    playSuccessChime();
    
    const signatureHash = `SHA256:${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
    const nowStr = new Date().toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const newRequest: VerificationRequest = {
      id: `req_${Date.now()}`,
      userId: user?.id || 'user_main_01',
      userName: user?.fullName || 'Мансур Умаров',
      userPhone: user?.phone || '+7 (928) 095-77-88',
      userCity: user?.city || 'г. Грозный',
      userAvatar: user?.avatarUrl,
      userOccupation: user?.occupation || 'Предприниматель',
      targetPoolTitle,
      targetPoolAmount,
      userPassport: {
        seriesNumber: userPassportSeries,
        issuedBy: userPassportIssuedBy,
        photoUrl: userPassportPhoto,
      },
      guarantor: {
        name: guarantorName,
        phone: guarantorPhone,
        relation: guarantorRelation,
        isSmsConfirmed: true,
        smsConfirmedAt: nowStr,
        passport: {
          seriesNumber: guarantorPassportSeries,
          issuedBy: guarantorPassportIssuedBy,
          photoUrl: guarantorPassportPhoto,
        },
      },
      contractSignedAt: nowStr,
      contractSignature: signatureName,
      signatureHash,
      status: 'pending',
      submittedAt: nowStr,
      reviewerNotes: 'Заявка на верификацию 2-го уровня для участия в пуле от 300 000 ₽.',
    };

    const updatedUser: UserProfile = {
      ...user,
      guarantorName,
      guarantorPhone,
      guarantorRelation,
      isGuarantorSmsConfirmed: true,
      userPassport: {
        seriesNumber: userPassportSeries,
        issuedBy: userPassportIssuedBy,
        photoUrl: userPassportPhoto,
      },
      guarantorPassport: {
        seriesNumber: guarantorPassportSeries,
        issuedBy: guarantorPassportIssuedBy,
        photoUrl: guarantorPassportPhoto,
      },
      verificationStatus: 'pending',
      verificationSubmittedAt: nowStr,
      hasSignedContract: true,
    };

    onSubmitRequest(newRequest, updatedUser);
    setCurrentStep('submitted');
  };

  const handleInstantDemoApprove = () => {
    playSuccessChime();
    const nowStr = new Date().toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const updatedUser: UserProfile = {
      ...user,
      verificationTier: 2,
      verificationStatus: 'verified',
      isGuarantorVerified: true,
      isPassportVerified: true,
      isOccupationVerified: true,
      isGuarantorSmsConfirmed: true,
      guarantorName,
      guarantorPhone,
      guarantorRelation,
      verificationApprovedAt: nowStr,
      amanaScore: Math.max(user.amanaScore, 125),
      hasSignedContract: true,
    };

    onFastApprove(updatedUser);
    setCurrentStep('approved');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10">
      <div className="relative w-full max-w-2xl bg-[#091511] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-200 my-auto">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#103b2e] to-[#071511] border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shadow-inner">
              <ShieldCheck className="w-5 h-5 text-[#fef08a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-[10px] font-bold uppercase">
                  Уровень 2 • Пулы 300k+ ₽
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  {targetPoolAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display mt-0.5">
                {currentStep === 'intro' && 'Верификация для пулов от 300 000 ₽'}
                {currentStep === 'guarantor' && 'Шаг 1: Поручитель (Кафил) & SMS'}
                {currentStep === 'passports' && 'Шаг 2: Паспорта заявителя и поручителя'}
                {currentStep === 'contract' && 'Шаг 3: Договор поручительства Аманат'}
                {currentStep === 'submitted' && 'Заявка в ожидании проверки'}
                {currentStep === 'approved' && 'Верификация (Уровень 2) подтверждена!'}
              </h2>
            </div>
          </div>

          <button
            onClick={() => { playButtonTap(); onClose(); }}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress Tracker */}
        {currentStep !== 'submitted' && currentStep !== 'approved' && (
          <div className="flex items-center justify-between gap-1 mb-6 bg-[#04100c] p-2 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setCurrentStep('intro')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition-all ${
                currentStep === 'intro' ? 'bg-[#d4af37] text-black font-bold' : 'text-slate-400'
              }`}
            >
              Инфо
            </button>
            <span className="text-slate-600">→</span>
            <button
              onClick={() => setCurrentStep('guarantor')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition-all ${
                currentStep === 'guarantor' ? 'bg-[#d4af37] text-black font-bold' : 'text-slate-400'
              }`}
            >
              1. Поручитель
            </button>
            <span className="text-slate-600">→</span>
            <button
              onClick={() => setCurrentStep('passports')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition-all ${
                currentStep === 'passports' ? 'bg-[#d4af37] text-black font-bold' : 'text-slate-400'
              }`}
            >
              2. Паспорта
            </button>
            <span className="text-slate-600">→</span>
            <button
              onClick={() => setCurrentStep('contract')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition-all ${
                currentStep === 'contract' ? 'bg-[#d4af37] text-black font-bold' : 'text-slate-400'
              }`}
            >
              3. Договор
            </button>
          </div>
        )}

        {/* STEP 0: INTRO & HIGH-VALUE POOL TRIGGER EXPLANATION */}
        {currentStep === 'intro' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-950/70 via-[#132a1f] to-amber-950/70 border border-[#d4af37]/40 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#fef08a] font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-[#d4af37]" />
                <span>Ограничение суммы: требуется статус Уровень 2</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Вы пытаетесь открыть или вступить в котел с общим пулом <strong>{targetPoolAmount.toLocaleString('ru-RU')} ₽</strong>.
                В соответствии с шариатскими стандартами и регламентом безопасности сервиса «Вай Котел», суммы свыше 300 000 ₽ требуют подтверждения поручителя и паспортной верификации.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#051711] border border-slate-800 p-3 rounded-xl space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Поручитель (Кафил)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Мгновенное подтверждение номера телефона близкого поручителя по SMS
                </p>
              </div>

              <div className="bg-[#051711] border border-slate-800 p-3 rounded-xl space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Сверка паспортов</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Безопасная загрузка скана паспорта заявителя и поручителя
                </p>
              </div>

              <div className="bg-[#051711] border border-slate-800 p-3 rounded-xl space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#fef08a]" />
                  <span>Договор Аманат</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Электронная подпись шариатского договора взаимопомощи
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => { playButtonTap(); onClose(); }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Вернуться к малым пулам
              </button>

              <button
                type="button"
                onClick={() => { playButtonTap(); setCurrentStep('guarantor'); }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Начать верификацию (Уровень 2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: GUARANTOR & SMS CONFIRMATION */}
        {currentStep === 'guarantor' && (
          <div className="space-y-4">
            <div className="bg-[#051711] border border-slate-800 p-3 rounded-xl text-xs text-slate-300">
              Укажите близкого родственника или надежного человека, который выступает вашим поручителем (Кафилом). Мы отправим ему SMS-код для подтверждения согласия.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ФИО Поручителя (Кафила):
                </label>
                <input
                  type="text"
                  value={guarantorName}
                  onChange={(e) => setGuarantorName(e.target.value)}
                  placeholder="Ислам Умаров"
                  className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Кем приходится:
                </label>
                <select
                  value={guarantorRelation}
                  onChange={(e) => setGuarantorRelation(e.target.value as RelationType)}
                  className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="Брат">Брат</option>
                  <option value="Отец">Отец</option>
                  <option value="Дядя">Дядя</option>
                  <option value="Родственник">Родственник</option>
                  <option value="Близкий друг">Близкий друг</option>
                  <option value="Коллега">Коллега / Партнер</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Номер телефона поручителя:
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={guarantorPhone}
                  onChange={(e) => {
                    setGuarantorPhone(e.target.value);
                    setIsGuarantorSmsVerified(false);
                    setGuarantorSmsSent(false);
                  }}
                  placeholder="+7 (928) 714-33-22"
                  className="flex-1 bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3 py-2 rounded-xl text-xs text-white font-mono focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendGuarantorSms}
                  disabled={isSendingSms || isGuarantorSmsVerified}
                  className="px-3 py-2 rounded-xl bg-[#0d2a20] border border-[#d4af37]/40 text-[#fef08a] hover:bg-[#133b2e] text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{isGuarantorSmsVerified ? 'Подтвержден ✓' : guarantorSmsSent ? 'Код отправлен' : 'Отправить SMS'}</span>
                </button>
              </div>
            </div>

            {/* Guarantor SMS OTP Box */}
            {guarantorSmsSent && !isGuarantorSmsVerified && (
              <div className="bg-[#030e0a] border border-amber-500/40 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-300">
                  <span>Введите SMS-код, полученный поручителем:</span>
                  <button
                    type="button"
                    onClick={() => { playButtonTap(); setGuarantorOtpCode('7777'); }}
                    className="text-[10px] text-[#fef08a] underline"
                  >
                    Тест-код: <strong>7777</strong>
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={guarantorOtpCode}
                    onChange={(e) => setGuarantorOtpCode(e.target.value)}
                    placeholder="7777"
                    className="w-32 bg-[#091511] border border-[#d4af37] text-center font-mono font-bold text-sm text-[#fef08a] px-3 py-1.5 rounded-lg focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyGuarantorOtp}
                    className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f59e0b] transition-all"
                  >
                    Подтвердить
                  </button>
                </div>
              </div>
            )}

            {isGuarantorSmsVerified && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Номер поручителя {guarantorPhone} успешно верифицирован по SMS!</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('intro')}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Назад
              </button>

              <button
                type="button"
                onClick={() => { playButtonTap(); setCurrentStep('passports'); }}
                className="py-2.5 px-5 rounded-xl bg-[#d4af37] text-black font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#f59e0b] transition-all"
              >
                <span>Далее: Паспорта</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PASSPORTS USER & GUARANTOR */}
        {currentStep === 'passports' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* User Passport Card */}
              <div className="bg-[#051711] border border-slate-800 p-3.5 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Паспорт заявителя:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-normal">Мансур Умаров</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Серия и номер:
                  </label>
                  <input
                    type="text"
                    value={userPassportSeries}
                    onChange={(e) => setUserPassportSeries(e.target.value)}
                    placeholder="96 14 883921"
                    className="w-full bg-[#030e0a] border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Кем выдан:
                  </label>
                  <input
                    type="text"
                    value={userPassportIssuedBy}
                    onChange={(e) => setUserPassportIssuedBy(e.target.value)}
                    placeholder="МВД по Чеченской Республике"
                    className="w-full bg-[#030e0a] border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white"
                  />
                </div>

                {/* Upload Dropzone Preview */}
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Скан главной страницы:
                  </label>
                  <div className="relative rounded-lg border border-dashed border-[#d4af37]/40 bg-[#020b08] p-2 flex items-center gap-2.5">
                    <img
                      src={userPassportPhoto}
                      alt="User Passport"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded border border-slate-700 shrink-0"
                    />
                    <div className="text-[10px] text-slate-400 leading-tight">
                      <strong className="text-emerald-400 block font-semibold">passport_umarov_m.jpg</strong>
                      <span>Загружено • Проверено</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantor Passport Card */}
              <div className="bg-[#051711] border border-slate-800 p-3.5 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Паспорт поручителя:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-normal">{guarantorName}</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Серия и номер:
                  </label>
                  <input
                    type="text"
                    value={guarantorPassportSeries}
                    onChange={(e) => setGuarantorPassportSeries(e.target.value)}
                    placeholder="96 11 445102"
                    className="w-full bg-[#030e0a] border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Кем выдан:
                  </label>
                  <input
                    type="text"
                    value={guarantorPassportIssuedBy}
                    onChange={(e) => setGuarantorPassportIssuedBy(e.target.value)}
                    placeholder="МВД по Чеченской Республике"
                    className="w-full bg-[#030e0a] border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white"
                  />
                </div>

                {/* Upload Dropzone Preview */}
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Скан главной страницы:
                  </label>
                  <div className="relative rounded-lg border border-dashed border-[#d4af37]/40 bg-[#020b08] p-2 flex items-center gap-2.5">
                    <img
                      src={guarantorPassportPhoto}
                      alt="Guarantor Passport"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded border border-slate-700 shrink-0"
                    />
                    <div className="text-[10px] text-slate-400 leading-tight">
                      <strong className="text-emerald-400 block font-semibold">passport_guarantor.jpg</strong>
                      <span>Загружено • Проверено</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('guarantor')}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Назад
              </button>

              <button
                type="button"
                onClick={() => { playButtonTap(); setCurrentStep('contract'); }}
                className="py-2.5 px-5 rounded-xl bg-[#d4af37] text-black font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#f59e0b] transition-all"
              >
                <span>Далее: Договор Аманат</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONTRACT & SIGNATURE */}
        {currentStep === 'contract' && (
          <div className="space-y-4">
            <div className="bg-[#030e0a] border border-[#d4af37]/30 rounded-xl p-3.5 max-h-44 overflow-y-auto text-xs text-slate-300 space-y-2">
              <div className="font-bold text-[#fef08a] border-b border-slate-800 pb-1 flex items-center justify-between">
                <span>ДОГОВОР ПОРУЧИТЕЛЬСТВА (КАФАЛЯ) И ШАРИАТСКОГО АМАНАТА</span>
                <span className="text-[10px] text-emerald-400">0% РИБА</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-300">
                1. Настоящим заявитель <strong>{user.fullName}</strong> и поручитель (Кафил) <strong>{guarantorName}</strong> ({guarantorRelation}) подтверждают добровольное участие в исламской кассе взаимопомощи «Вай Котел».
              </p>
              <p className="leading-relaxed text-[11px] text-slate-300">
                2. Поручитель несет солидарную моральную и финансовую ответственность за соблюдение графика взносов до 15-го числа каждого месяца.
              </p>
              <p className="leading-relaxed text-[11px] text-slate-300">
                3. Стороны подтверждают отсутствие процентных ставок (Риба), скрытых комиссий и штрафных пени. Все взносы являются беспроцентным целевым займом взаимопомощи (Кадр Хасан).
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-[#d4af37] focus:ring-0"
                />
                <span>Я принимаю условия шариатского договора и подтверждаю достоверность документов.</span>
              </label>

              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeKafilahResponsibility}
                  onChange={(e) => setAgreeKafilahResponsibility(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-[#d4af37] focus:ring-0"
                />
                <span>Поручитель {guarantorName} уведомлен по SMS и дал согласие на поручительство.</span>
              </label>
            </div>

            {/* Digital Signature Block */}
            <div className="bg-[#051711] border border-slate-800 p-3 rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Электронная цифровая подпись (ФИО):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Мансур Умаров"
                  className="flex-1 bg-[#030e0a] border border-[#d4af37]/60 font-serif italic text-sm text-[#fef08a] px-3 py-1.5 rounded-lg focus:outline-none"
                />
                <span className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-[10px] font-mono text-emerald-400 rounded-lg flex items-center">
                  SHA-256 ✓
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setCurrentStep('passports')}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Назад
              </button>

              <div className="flex items-center gap-2">
                {/* Fast Track Approve for testing/demo */}
                <button
                  type="button"
                  onClick={handleInstantDemoApprove}
                  className="px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold hover:bg-emerald-900 transition-all flex items-center gap-1"
                  title="Мгновенное одобрение для демонстрации"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Мгновенный тест (Уровень 2)</span>
                </button>

                <button
                  type="button"
                  disabled={!agreeTerms || !agreeKafilahResponsibility}
                  onClick={handleSubmitToAdmin}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold text-xs flex items-center gap-1.5 shadow-md hover:opacity-95 transition-all disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>Отправить на проверку</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUBMITTED / UNDER ADMIN REVIEW */}
        {currentStep === 'submitted' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Заявка в ожидании проверки у Администратора
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Все данные, паспорта и SMS-подтверждение поручителя успешно переданы модераторам в Админ-панель. В вашем профиле статус изменен на «В ожидании».
              </p>
            </div>

            <div className="bg-[#051711] border border-slate-800 p-3 rounded-xl text-xs text-slate-300 max-w-md mx-auto space-y-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Заявитель:</span>
                <strong className="text-white">{user.fullName}</strong>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Поручитель:</span>
                <strong className="text-white">{guarantorName} ({guarantorRelation})</strong>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>SMS поручителя:</span>
                <span className="text-emerald-400 font-semibold">Подтверждено ✓</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Текущий статус:</span>
                <span className="text-amber-400 font-bold">⏳ В ожидании одобрения</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleInstantDemoApprove}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black text-xs font-bold shadow-md hover:opacity-90"
              >
                Одобрить сейчас (Режим демонстрации)
              </button>
              <button
                type="button"
                onClick={() => { playButtonTap(); onClose(); }}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: VERIFIED & APPROVED TIER 2 */}
        {currentStep === 'approved' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1b3d2f] to-[#0d2a20] border-2 border-[#d4af37] flex items-center justify-center text-[#fef08a] mx-auto shadow-xl shadow-amber-950/40">
              <ShieldCheck className="w-9 h-9 text-[#d4af37]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Уровень 2 • Подтвержден</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1 font-display">
                Доступ к пулам от 300 000 ₽ открыт!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Вам выдан Золотой щит верификации и начислено +20 баллов рейтинга Аманат за проверенного поручителя.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => { playSuccessChime(); onClose(); }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold text-xs sm:text-sm shadow-lg hover:opacity-95"
              >
                Перейти к выбору и созданию котлов
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
