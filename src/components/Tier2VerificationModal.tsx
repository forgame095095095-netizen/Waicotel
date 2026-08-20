import React, { useState, useRef } from 'react';
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
  Scale,
  RefreshCw,
  X
} from 'lucide-react';
import { UserProfile, RelationType, VerificationRequest } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface Tier2VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  targetPoolTitle?: string;
  targetPoolAmount?: number;
  onSubmitVerification?: (request: VerificationRequest, updatedUser: UserProfile) => void;
  onSubmitRequest?: (request: VerificationRequest, updatedUser: UserProfile) => void;
  onFastApprove?: (updatedUser?: UserProfile) => void;
}

// Utility to format phone with +7 (9XX) XXX-XX-XX mask
const formatPhoneMask = (input: string): string => {
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';
  
  // Normalize starting digit
  let normalizedDigits = digits;
  if (normalizedDigits.startsWith('7') || normalizedDigits.startsWith('8')) {
    normalizedDigits = normalizedDigits.substring(1);
  }
  
  // Cut to 10 digits
  normalizedDigits = normalizedDigits.substring(0, 10);
  
  let formatted = '+7';
  if (normalizedDigits.length > 0) {
    formatted += ' (' + normalizedDigits.substring(0, 3);
  }
  if (normalizedDigits.length >= 3) {
    formatted += ') ' + normalizedDigits.substring(3, 6);
  }
  if (normalizedDigits.length >= 6) {
    formatted += '-' + normalizedDigits.substring(6, 8);
  }
  if (normalizedDigits.length >= 8) {
    formatted += '-' + normalizedDigits.substring(8, 10);
  }
  return formatted;
};

export const Tier2VerificationModal: React.FC<Tier2VerificationModalProps> = ({
  isOpen,
  onClose,
  user,
  targetPoolTitle = 'Грозный Авто-Котел №4',
  targetPoolAmount = 360000,
  onSubmitVerification,
  onSubmitRequest,
  onFastApprove,
}) => {
  const submitHandler = onSubmitVerification || onSubmitRequest;

  const [currentStep, setCurrentStep] = useState<'intro' | 'guarantor' | 'passports' | 'contract' | 'submitted' | 'approved'>(
    user?.verificationStatus === 'pending' ? 'submitted' : user?.verificationStatus === 'verified' ? 'approved' : 'guarantor'
  );

  // Guarantor fields
  const [guarantorName, setGuarantorName] = useState(user?.guarantorName || 'Даудов Ибрагим Ахмедович');
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

  // Hidden file inputs
  const userFileInputRef = useRef<HTMLInputElement | null>(null);
  const guarantorFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPhoneMask(raw);
    setGuarantorPhone(formatted);
    setIsGuarantorSmsVerified(false);
    setGuarantorSmsSent(false);
  };

  const handleSendGuarantorSms = () => {
    if (!guarantorPhone || guarantorPhone.length < 10) return;
    setIsSendingSms(true);
    playButtonTap();
    setTimeout(() => {
      setIsSendingSms(false);
      setGuarantorSmsSent(true);
      setGuarantorOtpCode('4821'); // Auto pre-fill simulation for user convenience
    }, 600);
  };

  const handleVerifyGuarantorOtp = () => {
    if (guarantorOtpCode.length < 4) return;
    playSuccessChime();
    setIsGuarantorSmsVerified(true);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      playButtonTap();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setter(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
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
        isSmsConfirmed: isGuarantorSmsVerified || true,
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

    if (submitHandler) {
      submitHandler(newRequest, updatedUser);
    }
    
    // Close modal to immediately return user to dashboard/profile with toast notification
    onClose();
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
      amanaScore: Math.max(user?.amanaScore || 0, 125),
      hasSignedContract: true,
    };

    if (onFastApprove) {
      onFastApprove(updatedUser);
    }
    setCurrentStep('approved');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10">
      <div className="relative w-full max-w-2xl bg-[#091511] border border-[#d4af37]/45 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-200 my-auto">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#103b2e] to-[#071511] border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#fef08a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/40 text-[10px] font-bold uppercase">
                  Уровень 2 • Снятие лимита 300 000 ₽
                </span>
                <span className="text-xs text-emerald-400 font-medium font-mono-nums">
                  до {targetPoolAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-display mt-0.5">
                {currentStep === 'intro' && 'Верификация для пулов от 300 000 ₽'}
                {currentStep === 'guarantor' && 'Верификация поручителя (Кафил)'}
                {currentStep === 'passports' && 'Паспорта заявителя и поручителя'}
                {currentStep === 'contract' && 'Договор поручительства Аманат'}
                {currentStep === 'submitted' && 'Заявка на проверке у администратора ⏳'}
                {currentStep === 'approved' && 'Верификация (Уровень 2) подтверждена! 🛡️'}
              </h2>
            </div>
          </div>

          <button
            onClick={() => { playButtonTap(); onClose(); }}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Step Tabs */}
        {currentStep !== 'submitted' && currentStep !== 'approved' && (
          <div className="grid grid-cols-3 gap-1.5 mb-6 bg-[#04100c] p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => { playButtonTap(); setCurrentStep('guarantor'); }}
              className={`py-2 px-2 rounded-xl text-center font-semibold transition-all flex items-center justify-center gap-1.5 ${
                currentStep === 'guarantor' 
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>1. Поручитель</span>
              {isGuarantorSmsVerified && <Check className="w-3.5 h-3.5 text-emerald-950 font-bold" />}
            </button>

            <button
              onClick={() => { playButtonTap(); setCurrentStep('passports'); }}
              className={`py-2 px-2 rounded-xl text-center font-semibold transition-all flex items-center justify-center gap-1.5 ${
                currentStep === 'passports' 
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>2. Паспорта</span>
            </button>

            <button
              onClick={() => { playButtonTap(); setCurrentStep('contract'); }}
              className={`py-2 px-2 rounded-xl text-center font-semibold transition-all flex items-center justify-center gap-1.5 ${
                currentStep === 'contract' 
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>3. Договор</span>
            </button>
          </div>
        )}

        {/* STEP 1: GUARANTOR & SMS CONFIRMATION */}
        {currentStep === 'guarantor' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#051711] to-[#0a271d] border border-[#d4af37]/30 p-3.5 rounded-2xl text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2 text-[#fef08a] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                <span>Шариатское поручительство (Кафаля)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Для участия в котлах с пулом свыше 300 000 ₽ укажите совершеннолетнего поручителя. На его номер отправляется проверочный SMS-код.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Guarantor Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  ФИО поручителя:
                </label>
                <input
                  type="text"
                  value={guarantorName}
                  onChange={(e) => setGuarantorName(e.target.value)}
                  placeholder="Даудов Ибрагим Ахмедович"
                  className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Guarantor Relation */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Кем приходится:
                </label>
                <select
                  value={guarantorRelation}
                  onChange={(e) => setGuarantorRelation(e.target.value as RelationType)}
                  className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Брат">Брат</option>
                  <option value="Отец">Отец</option>
                  <option value="Дядя">Дядя</option>
                  <option value="Друг">Друг</option>
                  <option value="Близкий друг">Близкий друг</option>
                  <option value="Коллега">Коллега</option>
                  <option value="Родственник">Родственник</option>
                </select>
              </div>
            </div>

            {/* Guarantor Phone + Send SMS */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Номер телефона поручителя:
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={guarantorPhone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (928) 000-00-00"
                  className="flex-1 bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3.5 py-2.5 rounded-xl text-xs text-white font-mono focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendGuarantorSms}
                  disabled={isSendingSms || isGuarantorSmsVerified}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isGuarantorSmsVerified
                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                      : guarantorSmsSent
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black shadow-md'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isGuarantorSmsVerified
                      ? 'Подтвержден ✓'
                      : guarantorSmsSent
                      ? 'Код отправлен'
                      : 'Отправить SMS поручителю'}
                  </span>
                </button>
              </div>
            </div>

            {/* SMS 4-Digit Code Confirmation Box */}
            {guarantorSmsSent && !isGuarantorSmsVerified && (
              <div className="bg-[#030e0a] border border-amber-500/50 p-3.5 rounded-2xl space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-amber-300">
                  <span className="font-semibold">Введите 4-значный SMS-код из сообщения:</span>
                  <button
                    type="button"
                    onClick={() => { playButtonTap(); setGuarantorOtpCode('4821'); }}
                    className="text-[11px] text-[#fef08a] underline decoration-dotted hover:text-white"
                  >
                    Тест-код: <strong>4821</strong>
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={guarantorOtpCode}
                    onChange={(e) => setGuarantorOtpCode(e.target.value)}
                    placeholder="4821"
                    className="w-36 bg-[#091511] border border-[#d4af37] text-center font-mono font-bold text-base text-[#fef08a] px-3 py-2 rounded-xl focus:outline-none tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyGuarantorOtp}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold text-xs hover:opacity-90 transition-all shadow-md"
                  >
                    Подтвердить код
                  </button>
                </div>
              </div>
            )}

            {isGuarantorSmsVerified && (
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 shadow-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="block text-white">Номер поручителя подтвержден!</strong>
                  <span className="text-[11px] text-emerald-300/90">
                    {guarantorPhone} • Согласие зафиксировано в протоколе Вай Котел
                  </span>
                </div>
              </div>
            )}

            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => { playButtonTap(); onClose(); }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Отмена
              </button>

              <button
                type="button"
                onClick={() => { playButtonTap(); setCurrentStep('passports'); }}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <span>Далее: Паспортные данные</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PASSPORTS (USER + GUARANTOR) */}
        {currentStep === 'passports' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* User Passport Card */}
              <div className="bg-[#051711] border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#d4af37]" />
                    <span>Паспорт участника:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {user?.fullName || 'Мансур Умаров'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                    Серия и номер:
                  </label>
                  <input
                    type="text"
                    value={userPassportSeries}
                    onChange={(e) => setUserPassportSeries(e.target.value)}
                    placeholder="96 14 883921"
                    className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3 py-2 rounded-xl text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                    Кем выдан:
                  </label>
                  <input
                    type="text"
                    value={userPassportIssuedBy}
                    onChange={(e) => setUserPassportIssuedBy(e.target.value)}
                    placeholder="МВД по Чеченской Республике"
                    className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Upload Zone */}
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                    Фото / скан паспорта:
                  </label>
                  <input
                    type="file"
                    ref={userFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setUserPassportPhoto)}
                  />
                  <div 
                    onClick={() => userFileInputRef.current?.click()}
                    className="group relative rounded-xl border border-dashed border-[#d4af37]/50 bg-[#020b08] p-2.5 flex items-center gap-3 cursor-pointer hover:border-[#d4af37] transition-all"
                  >
                    <img
                      src={userPassportPhoto}
                      alt="User Passport"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <strong className="text-xs text-emerald-400 block font-semibold truncate">
                        passport_user.jpg
                      </strong>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Upload className="w-3 h-3 text-[#d4af37]" />
                        <span>Нажмите для смены файла</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantor Passport Card */}
              <div className="bg-[#051711] border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Паспорт поручителя:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[120px]">
                    {guarantorName}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                    Серия и номер:
                  </label>
                  <input
                    type="text"
                    value={guarantorPassportSeries}
                    onChange={(e) => setGuarantorPassportSeries(e.target.value)}
                    placeholder="96 11 445102"
                    className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3 py-2 rounded-xl text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                    Кем выдан:
                  </label>
                  <input
                    type="text"
                    value={guarantorPassportIssuedBy}
                    onChange={(e) => setGuarantorPassportIssuedBy(e.target.value)}
                    placeholder="МВД по Чеченской Республике"
                    className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Upload Zone */}
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                    Фото / скан паспорта:
                  </label>
                  <input
                    type="file"
                    ref={guarantorFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setGuarantorPassportPhoto)}
                  />
                  <div 
                    onClick={() => guarantorFileInputRef.current?.click()}
                    className="group relative rounded-xl border border-dashed border-[#d4af37]/50 bg-[#020b08] p-2.5 flex items-center gap-3 cursor-pointer hover:border-[#d4af37] transition-all"
                  >
                    <img
                      src={guarantorPassportPhoto}
                      alt="Guarantor Passport"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <strong className="text-xs text-emerald-400 block font-semibold truncate">
                        passport_guarantor.jpg
                      </strong>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Upload className="w-3 h-3 text-[#d4af37]" />
                        <span>Нажмите для смены файла</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => { playButtonTap(); setCurrentStep('guarantor'); }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Назад
              </button>

              <button
                type="button"
                onClick={() => { playButtonTap(); setCurrentStep('contract'); }}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <span>Далее: Шариатский договор</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONTRACT & FINAL SUBMISSION */}
        {currentStep === 'contract' && (
          <div className="space-y-4">
            <div className="bg-[#030e0a] border border-[#d4af37]/30 rounded-2xl p-4 max-h-48 overflow-y-auto text-xs text-slate-300 space-y-2.5">
              <div className="font-bold text-[#fef08a] border-b border-slate-800 pb-1.5 flex items-center justify-between">
                <span>ДОГОВОР ПОРУЧИТЕЛЬСТВА (КАФАЛЯ) И ШАРИАТСКОГО АМАНАТА</span>
                <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">0% РИБА</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-300">
                1. Настоящим заявитель <strong>{user?.fullName || 'Мансур Умаров'}</strong> и поручитель (Кафил) <strong>{guarantorName}</strong> ({guarantorRelation}) подтверждают добровольное участие в исламской кассе взаимопомощи «Вай Котел».
              </p>
              <p className="leading-relaxed text-[11px] text-slate-300">
                2. Поручитель несет солидарную моральную и финансовую ответственность за соблюдение графика взносов до 15-го числа каждого месяца.
              </p>
              <p className="leading-relaxed text-[11px] text-slate-300">
                3. Стороны подтверждают отсутствие процентных ставок (Риба), скрытых комиссий и штрафных пени. Все взносы являются беспроцентным займом взаимопомощи (Кард аль-Хасан).
              </p>
            </div>

            <div className="space-y-2 bg-[#051711] p-3.5 rounded-2xl border border-slate-800">
              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-[#d4af37] focus:ring-0 cursor-pointer"
                />
                <span>Я принимаю условия шариатского договора и подтверждаю достоверность паспортов.</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeKafilahResponsibility}
                  onChange={(e) => setAgreeKafilahResponsibility(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-[#d4af37] focus:ring-0 cursor-pointer"
                />
                <span>Поручитель <strong>{guarantorName}</strong> уведомил о своем согласии по SMS.</span>
              </label>
            </div>

            {/* Digital Signature */}
            <div className="bg-[#051711] border border-slate-800 p-3.5 rounded-2xl space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                Электронная цифровая подпись заявителя (ФИО):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Мансур Умаров"
                  className="flex-1 bg-[#030e0a] border border-[#d4af37]/60 font-serif italic text-sm text-[#fef08a] px-3.5 py-2 rounded-xl focus:outline-none"
                />
                <span className="px-3 py-2 bg-slate-900 border border-slate-700 text-[10px] font-mono text-emerald-400 rounded-xl flex items-center">
                  SHA-256 ✓
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-3 flex items-center justify-between gap-2.5 flex-wrap border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => { playButtonTap(); setCurrentStep('passports'); }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Назад
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {/* 1-Click Demo Approval button */}
                <button
                  type="button"
                  onClick={handleInstantDemoApprove}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold hover:bg-emerald-900 transition-all flex items-center gap-1.5 shadow-md"
                  title="Мгновенное одобрение для тестирования"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>⚡ Одобрить сразу (Демо)</span>
                </button>

                {/* Primary Submit Button */}
                <button
                  type="button"
                  disabled={!agreeTerms || !agreeKafilahResponsibility}
                  onClick={handleSubmitToAdmin}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black font-bold text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>Отправить на проверку</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUBMITTED VIEW (WHEN RE-OPENED IN PENDING STATUS) */}
        {currentStep === 'submitted' && (
          <div className="py-5 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-950/30">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1 font-display">
                Заявка находится на проверке у администратора ⏳
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Данные поручителя и сканы паспортов отправлены. Ожидайте подтверждения (1–3 часа).
              </p>
            </div>

            <div className="bg-[#051711] border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 max-w-md mx-auto space-y-2 text-left">
              <div className="flex justify-between text-[11px] pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">Поручитель (Кафил):</span>
                <strong className="text-white">{guarantorName} ({guarantorRelation})</strong>
              </div>
              <div className="flex justify-between text-[11px] pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">Телефон поручителя:</span>
                <span className="text-slate-200 font-mono">{guarantorPhone}</span>
              </div>
              <div className="flex justify-between text-[11px] pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">SMS-код:</span>
                <span className="text-emerald-400 font-bold">Подтвержден ✓</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Статус рассмотрения:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>В ожидании модерации</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
              <button
                type="button"
                onClick={handleInstantDemoApprove}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Одобрить сейчас (Демо)</span>
              </button>
              
              <button
                type="button"
                onClick={() => { playButtonTap(); setCurrentStep('guarantor'); }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
              >
                Изменить данные
              </button>

              <button
                type="button"
                onClick={() => { playButtonTap(); onClose(); }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all"
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
                <span>Верифицирован 🛡️ (Уровень 2)</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1 font-display">
                Ограничение 300 000 ₽ успешно снято!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Золотой щит верификации активен. Вам начислено +20 баллов рейтинга Аманат и открыт полный доступ к крупным автомобильным и бизнес-котлам.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => { playSuccessChime(); onClose(); }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold text-xs sm:text-sm shadow-lg hover:opacity-95 transition-all"
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
