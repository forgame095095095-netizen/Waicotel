import React, { useState, useRef } from 'react';
import { 
  User, 
  Camera, 
  Upload, 
  Briefcase, 
  FileCheck2, 
  ShieldCheck, 
  Phone, 
  UserCheck, 
  Sparkles, 
  Check, 
  X,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
];

const POPULAR_OCCUPATIONS = [
  'Предприниматель / Бизнесмен',
  'Маркетолог / Таргетолог',
  'IT-специалист / Разработчик',
  'Врач / Стоматолог',
  'Строительство / Недвижимость',
  'Автобизнес / Логистика',
  'Торговля / Опт и Розница',
  'Юрист / Консалтинг',
  'Преподаватель / Образование',
  'Финансы / Бухгалтерия'
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
}) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity] = useState(user.city);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || PRESET_AVATARS[0]);
  const [occupation, setOccupation] = useState(user.occupation || 'Предприниматель / Бизнесмен');
  const [occupationDetails, setOccupationDetails] = useState(user.occupationDetails || '');
  const [isOccupationVerified, setIsOccupationVerified] = useState(user.isOccupationVerified ?? true);
  const [isPassportVerified, setIsPassportVerified] = useState(user.isPassportVerified ?? true);
  const [isGuarantorVerified, setIsGuarantorVerified] = useState(user.isGuarantorVerified ?? true);
  const [bio, setBio] = useState(user.bio || '');
  
  const [customOccupation, setCustomOccupation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
          setIsUploading(false);
          setUploadSuccess(true);
          playSuccessChime();
          setTimeout(() => setUploadSuccess(false), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    playButtonTap();
    setAvatarUrl(url);
  };

  const handleSelectOccupationPreset = (occ: string) => {
    playButtonTap();
    setOccupation(occ);
    setCustomOccupation('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonTap();
    playSuccessChime();

    const finalOccupation = customOccupation.trim() ? customOccupation.trim() : occupation;

    const updatedUser: UserProfile = {
      ...user,
      fullName,
      phone,
      city,
      avatarUrl,
      occupation: finalOccupation,
      occupationDetails,
      isOccupationVerified,
      isPassportVerified,
      isGuarantorVerified,
      bio,
    };

    onSaveProfile(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#091511] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-200 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Настройки профиля и значков доверия
              </h3>
              <p className="text-xs text-emerald-400">
                Фотография, подтверждение деятельности и статус надежности
              </p>
            </div>
          </div>

          <button
            onClick={() => { playButtonTap(); onClose(); }}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Photo / Avatar Upload */}
          <div className="bg-[#06120e] p-4 rounded-xl border border-slate-800 space-y-3.5">
            <label className="text-xs font-bold text-[#fef08a] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#d4af37]" />
              Фотография профиля (Аватар)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Current Avatar Preview */}
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-[#d4af37] shadow-xl bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-[10px] text-white transition-opacity font-medium"
                >
                  <Upload className="w-4 h-4 mb-0.5 text-[#d4af37]" />
                  Сменить
                </button>
              </div>

              {/* Upload Action & Presets */}
              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => { playButtonTap(); fileInputRef.current?.click(); }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-900 transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                    Загрузить фото с устройства
                  </button>

                  {uploadSuccess && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Фото загружено!
                    </span>
                  )}
                </div>

                {/* Preset Options */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5">
                    Или выберите готовый аватар:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(url)}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                          avatarUrl === url
                            ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40 scale-105'
                            : 'border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Profession & Occupation (Чем занимается) */}
          <div className="bg-[#06120e] p-4 rounded-xl border border-slate-800 space-y-3.5">
            <label className="text-xs font-bold text-[#fef08a] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#d4af37]" />
              Сфера деятельности и профессия (Чем вы занимаетесь)
            </label>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_OCCUPATIONS.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => handleSelectOccupationPreset(occ)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    occupation === occ && !customOccupation
                      ? 'bg-[#d4af37] text-black font-bold shadow-md shadow-[#d4af37]/20 scale-102'
                      : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Своя должность или деятельность:
                </label>
                <input
                  type="text"
                  value={customOccupation}
                  onChange={(e) => setCustomOccupation(e.target.value)}
                  placeholder="Например: Владелец автосалона"
                  className="w-full bg-[#081511] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Название бизнеса / Организация / Бренд:
                </label>
                <input
                  type="text"
                  value={occupationDetails}
                  onChange={(e) => setOccupationDetails(e.target.value)}
                  placeholder="Например: Сеть магазинов «Кавказ Трейд»"
                  className="w-full bg-[#081511] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Trust & Verification Options (Значки надежности для участников) */}
          <div className="bg-[#06120e] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#fef08a] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                Значки доверия и верификации в котлах
              </label>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                Отображаются в карточках котлов
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Badge 1: Occupation Verified */}
              <div 
                onClick={() => { playButtonTap(); setIsOccupationVerified(!isOccupationVerified); }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isOccupationVerified 
                    ? 'bg-emerald-950/70 border-emerald-500/60 shadow-md shadow-emerald-950/50' 
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Briefcase className="w-4 h-4 text-[#d4af37]" />
                    <span>Деятельность</span>
                  </div>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isOccupationVerified ? 'bg-emerald-500 text-black font-bold' : 'bg-slate-800 text-slate-500'
                  }`}>
                    ✓
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Статус: <strong>{isOccupationVerified ? 'Подтверждена' : 'Не подтверждена'}</strong>. Повышает доверие участников при сборе.
                </p>
              </div>

              {/* Badge 2: Passport Verified */}
              <div 
                onClick={() => { playButtonTap(); setIsPassportVerified(!isPassportVerified); }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isPassportVerified 
                    ? 'bg-blue-950/70 border-blue-500/60 shadow-md shadow-blue-950/50' 
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                    <FileCheck2 className="w-4 h-4 text-blue-400" />
                    <span>Паспорт РФ</span>
                  </div>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isPassportVerified ? 'bg-blue-500 text-black font-bold' : 'bg-slate-800 text-slate-500'
                  }`}>
                    ✓
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Статус: <strong>{isPassportVerified ? 'Проверен' : 'Не проверен'}</strong>. Личность удостоверена.
                </p>
              </div>

              {/* Badge 3: Guarantor Verified */}
              <div 
                onClick={() => { playButtonTap(); setIsGuarantorVerified(!isGuarantorVerified); }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isGuarantorVerified 
                    ? 'bg-amber-950/70 border-amber-500/60 shadow-md shadow-amber-950/50' 
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>Поручитель</span>
                  </div>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isGuarantorVerified ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-500'
                  }`}>
                    ✓
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Статус: <strong>{isGuarantorVerified ? 'Кафил подтвержден' : 'Требуется'}</strong> ({user.guarantorName}).
                </p>
              </div>

            </div>
          </div>

          {/* Section 4: Basic Info & Bio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                ФИО Участника:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-[#081511] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Город:
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full bg-[#081511] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => { playButtonTap(); onClose(); }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] text-black font-bold text-xs shadow-lg shadow-[#d4af37]/20 hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Сохранить профиль и значки
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
