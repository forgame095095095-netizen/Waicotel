import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Eye, 
  FileText, 
  Scale, 
  Award, 
  Sparkles, 
  AlertTriangle,
  ZoomIn,
  MessageSquare,
  Lock,
  ArrowRight,
  UserPlus,
  Users,
  LogOut,
  Check,
  Building,
  KeyRound
} from 'lucide-react';
import { VerificationRequest, UserProfile } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface AdminReviewPortalProps {
  usersDb: UserProfile[];
  onApproveUserRegistration: (userId: string) => void;
  onRejectUserRegistration: (userId: string, reason: string) => void;
  onSwitchToUser: (user: UserProfile) => void;
  requests: VerificationRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onSelectKotel?: (kotelTitle: string) => void;
  currentUser: UserProfile;
  onExitAdmin?: () => void;
}

export const AdminReviewPortal: React.FC<AdminReviewPortalProps> = ({
  usersDb = [],
  onApproveUserRegistration,
  onRejectUserRegistration,
  onSwitchToUser,
  requests = [],
  onApproveRequest,
  onRejectRequest,
  onSelectKotel,
  currentUser,
  onExitAdmin,
}) => {
  // Main sub-tabs for Admin
  const [adminSection, setAdminSection] = useState<'registrations' | 'verifications' | 'all_users'>('registrations');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Verification Request state
  const [inspectingRequest, setInspectingRequest] = useState<VerificationRequest | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ title: string; url: string; meta: string } | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Нечеткий скан паспорта или блики на фото');
  const [customRejectNote, setCustomRejectNote] = useState('');

  // User registration rejection state
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [userRejectReason, setUserRejectReason] = useState('Некорректный номер телефона или неподтвержденный поручитель');

  // Filtered pending users
  const pendingUsers = usersDb.filter(u => u.registrationStatus === 'pending');
  const approvedUsers = usersDb.filter(u => u.registrationStatus === 'approved');
  const pendingTier2Requests = requests.filter(r => r.status === 'pending');

  const filteredUsers = usersDb.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.guarantorPhone.toLowerCase().includes(q) ||
      u.guarantorName?.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q)
    );
  });

  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.userName.toLowerCase().includes(q) ||
      r.userPhone.toLowerCase().includes(q) ||
      r.guarantor.name.toLowerCase().includes(q) ||
      r.guarantor.phone.toLowerCase().includes(q) ||
      r.targetPoolTitle?.toLowerCase().includes(q)
    );
  });

  // Handlers for Registration approval
  const handleApproveUser = (userId: string) => {
    playSuccessChime();
    onApproveUserRegistration(userId);
  };

  const handleConfirmRejectUser = () => {
    if (!rejectingUserId) return;
    playButtonTap();
    onRejectUserRegistration(rejectingUserId, userRejectReason);
    setRejectingUserId(null);
  };

  // Handlers for Tier 2 verification
  const handleApproveTier2 = (reqId: string) => {
    playSuccessChime();
    onApproveRequest(reqId);
    if (inspectingRequest?.id === reqId) {
      setInspectingRequest((prev) => prev ? { ...prev, status: 'approved', reviewedAt: 'Только что' } : null);
    }
  };

  const handleConfirmRejectTier2 = () => {
    if (!rejectingRequestId) return;
    playButtonTap();
    const finalReason = customRejectNote ? `${rejectReason} (${customRejectNote})` : rejectReason;
    onRejectRequest(rejectingRequestId, finalReason);
    if (inspectingRequest?.id === rejectingRequestId) {
      setInspectingRequest((prev) => prev ? { ...prev, status: 'rejected', rejectionReason: finalReason, reviewedAt: 'Только что' } : null);
    }
    setRejectingRequestId(null);
    setCustomRejectNote('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner & KPI Metrics */}
      <div className="bg-gradient-to-r from-[#071d15] via-[#0d2a20] to-[#071d15] border border-[#d4af37]/35 rounded-3xl p-5 sm:p-7 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shadow-inner">
              <ShieldCheck className="w-6 h-6 text-[#fef08a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold uppercase">
                  ПАНЕЛЬ АДМИНИСТРАТОРА
                </span>
                <span className="text-xs text-slate-400">
                  Спец-номер: <strong className="text-emerald-400 font-mono">+7 (999) 000-00-00</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                Управление заявками и базой данных «Вай Котел»
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onExitAdmin && (
              <button
                type="button"
                onClick={() => {
                  playButtonTap();
                  onExitAdmin();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Выйти</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-[#04100c] border border-slate-800 p-1.5 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/70 border border-amber-500/40 text-amber-300 rounded-lg font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Новых заявок: {pendingUsers.length}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 rounded-lg font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Верификаций 300k+: {pendingTier2Requests.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => { playButtonTap(); setAdminSection('registrations'); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              adminSection === 'registrations'
                ? 'bg-[#d4af37] text-black shadow-lg shadow-amber-900/30'
                : 'bg-[#051410] border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>1. Новые заявки на регистрацию ({pendingUsers.length})</span>
            {pendingUsers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { playButtonTap(); setAdminSection('verifications'); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              adminSection === 'verifications'
                ? 'bg-[#d4af37] text-black shadow-lg shadow-amber-900/30'
                : 'bg-[#051410] border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Верификация 300k+ (Tier 2) ({pendingTier2Requests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { playButtonTap(); setAdminSection('all_users'); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              adminSection === 'all_users'
                ? 'bg-[#d4af37] text-black shadow-lg shadow-amber-900/30'
                : 'bg-[#051410] border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. База всех пользователей ({usersDb.length})</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-[#091511] border border-slate-800 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по ФИО, номеру телефона заявителя или поручителя..."
            className="w-full bg-[#040e0b] border border-slate-700/80 pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* SECTION 1: PENDING USER REGISTRATIONS TABLE */}
      {adminSection === 'registrations' && (
        <div className="bg-[#091712] border border-[#d4af37]/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#d4af37]" />
                <span>Заявки на регистрацию, ожидающие проверки (Статус: pending)</span>
              </h2>
              <p className="text-xs text-slate-400">
                После нажатия [ Одобрить ] пользователь получает доступ к главному экрану и Дашборду.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-950/80 border border-amber-500/50 text-amber-300 rounded-full text-xs font-bold font-mono">
              Ожидают: {pendingUsers.length}
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-[#05110d] rounded-2xl border border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
              <h3 className="text-base font-bold text-white">Все новые заявки рассмотрены!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Новые пользователи со статусом <strong>pending</strong> появятся здесь сразу после заполнения формы регистрации.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-[#040e0b] text-slate-400 uppercase text-[11px] border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3 px-4">ФИО заявителя</th>
                    <th className="py-3 px-4">Основной телефон</th>
                    <th className="py-3 px-4">Поручитель (Кафил)</th>
                    <th className="py-3 px-4">Кем приходится</th>
                    <th className="py-3 px-4">Дата подачи</th>
                    <th className="py-3 px-4">Статус</th>
                    <th className="py-3 px-4 text-right">Действия администратора</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-[#d4af37]/40 flex items-center justify-center text-[#fef08a] font-bold text-xs">
                            {user.fullName.slice(0, 1)}
                          </div>
                          <div>
                            <div>{user.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{user.city || 'г. Грозный'} • {user.occupation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                        {user.phone}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#fef08a]">
                        <div>{user.guarantorPhone}</div>
                        {user.guarantorName && <div className="text-[10px] text-slate-400">{user.guarantorName}</div>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                          {user.guarantorRelation || 'Брат'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {user.registeredAt || 'Сегодня'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 text-[10px] font-bold animate-pulse">
                          ⏳ На проверке
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveUser(user.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer hover:scale-105"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Одобрить</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRejectingUserId(user.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-semibold text-xs transition-all cursor-pointer"
                          >
                            Отклонить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: TIER 2 VERIFICATIONS (300k+) */}
      {adminSection === 'verifications' && (
        <div className="bg-[#091712] border border-[#d4af37]/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                <span>Заявки на верификацию пулов от 300 000 ₽ (Уровень 2 🛡️)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Проверка паспортов участников, подтверждения SMS Кафила (поручителя) и шариатского договора.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-full text-xs font-bold font-mono">
              Заявок: {filteredRequests.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#05110d] border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-[#d4af37]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-[#d4af37]/40 flex items-center justify-center text-[#fef08a] font-bold text-sm">
                      {req.userName.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{req.userName}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{req.userPhone}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    req.status === 'approved'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : req.status === 'rejected'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse'
                  }`}>
                    {req.status === 'approved' ? '✓ Одобрено (Ур. 2)' : req.status === 'rejected' ? '✕ Отклонено' : '⏳ На проверке'}
                  </span>
                </div>

                <div className="bg-[#020b08] p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Целевой фонд:</span>
                    <strong className="text-emerald-400">{req.targetPoolTitle || '300 000+ ₽'} ({req.targetPoolAmount?.toLocaleString('ru-RU')} ₽)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Поручитель (Кафил):</span>
                    <span className="text-[#fef08a] font-semibold">{req.guarantor.name} ({req.guarantor.relation}) • {req.guarantor.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Паспортные данные:</span>
                    <span className="text-slate-300 font-mono">{req.userPassport.seriesNumber}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Подано: {req.submittedAt}</span>
                  {req.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApproveTier2(req.id)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Присвоить Ур. 2 🛡️
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingRequestId(req.id)}
                        className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-500/40 text-xs rounded-xl hover:bg-rose-900 cursor-pointer"
                      >
                        Отклонить
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold">Статус зафиксирован</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: ALL USERS IN LOCALSTORAGE DATABASE */}
      {adminSection === 'all_users' && (
        <div className="bg-[#091712] border border-[#d4af37]/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#d4af37]" />
                <span>База данных пользователей (localStorage: wai_kotel_users_db)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Все зарегистрированные аккаунты. Нажмите «Войти под этим пользователем», чтобы мгновенно протестировать его вид.
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-800 text-slate-200 rounded-full text-xs font-bold font-mono">
              Всего в БД: {usersDb.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-[#040e0b] text-slate-400 uppercase text-[11px] border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">Пользователь</th>
                  <th className="py-3 px-4">Номер телефона</th>
                  <th className="py-3 px-4">Поручитель</th>
                  <th className="py-3 px-4">Статус регистрации</th>
                  <th className="py-3 px-4">Уровень верификации</th>
                  <th className="py-3 px-4">Рейтинг ВК</th>
                  <th className="py-3 px-4 text-right">Тестирование</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-[#d4af37]/40 flex items-center justify-center text-[#fef08a] font-bold text-xs">
                          {user.fullName.slice(0, 1)}
                        </div>
                        <div>
                          <div>{user.fullName} {user.id === currentUser.id ? '(Текущий)' : ''}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{user.city} • {user.occupation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">
                      {user.phone}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div>{user.guarantorPhone}</div>
                      <div className="text-[10px] text-slate-400">{user.guarantorRelation}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.registrationStatus === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : user.registrationStatus === 'rejected'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}>
                        {user.registrationStatus === 'approved' ? '✓ Одобрен' : user.registrationStatus === 'rejected' ? '✕ Отклонен' : '⏳ В ожидании'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        user.verificationTier === 2 && user.verificationStatus === 'verified'
                          ? 'bg-[#d4af37]/20 text-[#fef08a] border border-[#d4af37]/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {user.verificationTier === 2 && user.verificationStatus === 'verified' ? '★ Уровень 2 (300k+)' : 'Уровень 1 (<300k)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#fef08a]">
                      {user.amanaScore}/150
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          playButtonTap();
                          onSwitchToUser(user);
                        }}
                        className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-[#d4af37] hover:text-black border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
                      >
                        Войти под этим аккаунтом →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject User Registration Modal */}
      {rejectingUserId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 flex justify-center items-center">
          <div className="bg-[#091511] border border-rose-500/50 rounded-2xl p-6 max-w-md w-full space-y-4 text-slate-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Отклонить заявку на регистрацию</span>
            </h3>
            <p className="text-xs text-slate-300">
              Укажите причину отклонения. Пользователь увидит это уведомление при попытке входа.
            </p>
            <textarea
              value={userRejectReason}
              onChange={(e) => setUserRejectReason(e.target.value)}
              rows={3}
              className="w-full bg-[#030e0a] border border-slate-700 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingUserId(null)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
              >
                Подтвердить отклонение
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Tier 2 Verification Modal */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 flex justify-center items-center">
          <div className="bg-[#091511] border border-rose-500/50 rounded-2xl p-6 max-w-md w-full space-y-4 text-slate-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Отклонить верификацию 300k+</span>
            </h3>
            <p className="text-xs text-slate-300">
              Укажите причину отклонения верификации:
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#030e0a] border border-slate-700 p-2.5 rounded-xl text-xs text-white focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectTier2}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
