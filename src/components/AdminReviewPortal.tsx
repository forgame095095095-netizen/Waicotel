import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Phone, 
  PhoneCall, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  Scale, 
  Award, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle,
  ZoomIn,
  MessageSquare,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { VerificationRequest, UserProfile } from '../types';
import { playButtonTap, playSuccessChime } from '../utils/audio';

interface AdminReviewPortalProps {
  requests: VerificationRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onSelectKotel?: (kotelTitle: string) => void;
  currentUser: UserProfile;
}

export const AdminReviewPortal: React.FC<AdminReviewPortalProps> = ({
  requests,
  onApproveRequest,
  onRejectRequest,
  onSelectKotel,
  currentUser,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingRequest, setInspectingRequest] = useState<VerificationRequest | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ title: string; url: string; meta: string } | null>(null);
  
  // Rejection modal
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Нечеткий скан паспорта или блики на фото');
  const [customRejectNote, setCustomRejectNote] = useState('');

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesTab = filterTab === 'all' ? true : r.status === filterTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      r.userName.toLowerCase().includes(q) ||
      r.userPhone.toLowerCase().includes(q) ||
      r.guarantor.name.toLowerCase().includes(q) ||
      r.guarantor.phone.toLowerCase().includes(q) ||
      r.targetPoolTitle?.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const totalVolume = requests.reduce((acc, r) => acc + (r.targetPoolAmount || 0), 0);

  const handleApprove = (reqId: string) => {
    playSuccessChime();
    onApproveRequest(reqId);
    if (inspectingRequest?.id === reqId) {
      setInspectingRequest((prev) => prev ? { ...prev, status: 'approved', reviewedAt: 'Только что' } : null);
    }
  };

  const handleConfirmReject = () => {
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
    <div className="space-y-6">
      
      {/* Top Banner & KPI Metrics */}
      <div className="bg-gradient-to-r from-[#071d15] via-[#0d2a20] to-[#071d15] border border-[#d4af37]/30 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shadow-inner">
              <ShieldCheck className="w-6 h-6 text-[#fef08a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                  ПАНЕЛЬ АДМИНИСТРАТОРА
                </span>
                <span className="text-xs text-slate-400">
                  Сверка Кафилов и Паспортов 300k+
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                Центр модерации и верификации Вай Котел
              </h1>
            </div>
          </div>

          {/* Quick status pill */}
          <div className="flex items-center gap-2 bg-[#04100c] border border-slate-800 p-2 rounded-xl text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/70 border border-amber-500/40 text-amber-300 rounded-lg font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>Ожидают: {pendingCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 rounded-lg font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Одобрено: {approvedCount}</span>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#d4af37]/20">
          <div className="bg-[#04120e]/80 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400 block">Всего заявок (Ур. 2)</span>
            <strong className="text-lg sm:text-xl font-bold text-white font-mono">
              {requests.length}
            </strong>
          </div>

          <div className="bg-[#04120e]/80 border border-amber-500/30 p-3 rounded-xl">
            <span className="text-[11px] text-amber-300/80 block">В ожидании решения</span>
            <strong className="text-lg sm:text-xl font-bold text-amber-400 font-mono">
              {pendingCount}
            </strong>
          </div>

          <div className="bg-[#04120e]/80 border border-emerald-500/30 p-3 rounded-xl">
            <span className="text-[11px] text-emerald-300/80 block">Золотой статус (Уровень 2)</span>
            <strong className="text-lg sm:text-xl font-bold text-emerald-400 font-mono">
              {approvedCount}
            </strong>
          </div>

          <div className="bg-[#04120e]/80 border border-[#d4af37]/30 p-3 rounded-xl">
            <span className="text-[11px] text-[#fef08a]/80 block">Общий лимит пулов</span>
            <strong className="text-lg sm:text-xl font-bold text-[#fef08a] font-mono">
              {(totalVolume / 1000000).toFixed(1)} млн ₽
            </strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#091511] border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => { playButtonTap(); setFilterTab('pending'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filterTab === 'pending'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>В ожидании</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-black text-amber-400 rounded-full text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { playButtonTap(); setFilterTab('all'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterTab === 'all'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Все заявки ({requests.length})
          </button>

          <button
            onClick={() => { playButtonTap(); setFilterTab('approved'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterTab === 'approved'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Одобренные</span>
          </button>

          <button
            onClick={() => { playButtonTap(); setFilterTab('rejected'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              filterTab === 'rejected'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Отклоненные</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по ФИО или телефону..."
            className="w-full bg-[#030e0a] border border-slate-700 focus:border-[#d4af37] pl-9 pr-3 py-1.5 rounded-xl text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-[#091511] border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">
              Заявок по выбранному фильтру нет
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Все поступившие заявки обработаны модераторами, либо измените параметры поиска.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            return (
              <div
                key={req.id}
                className={`bg-[#091511] border rounded-2xl p-4 sm:p-5 transition-all space-y-4 ${
                  isPending
                    ? 'border-amber-500/50 shadow-lg shadow-amber-950/20'
                    : isApproved
                    ? 'border-emerald-500/30'
                    : 'border-rose-900/40 opacity-80'
                }`}
              >
                {/* Request Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {req.userAvatar ? (
                        <img
                          src={req.userAvatar}
                          alt={req.userName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-[#d4af37]/40"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-[#d4af37]/40 flex items-center justify-center font-bold text-sm text-[#fef08a]">
                          {req.userName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {req.userName}
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">
                          {req.userPhone}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{req.userCity}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{req.userOccupation || 'Участник'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Target Pool */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    {req.targetPoolTitle && (
                      <div className="px-2.5 py-1 rounded-lg bg-[#04120e] border border-slate-800 text-[11px] text-slate-300">
                        Целевой котел: <strong className="text-[#fef08a]">{req.targetPoolTitle}</strong> ({req.targetPoolAmount?.toLocaleString('ru-RU')} ₽)
                      </div>
                    )}

                    {isPending && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>В ожидании</span>
                      </span>
                    )}

                    {isApproved && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Одобрен (Ур. 2)</span>
                      </span>
                    )}

                    {isRejected && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Отклонен</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Inspection Grid: Guarantor + Passports Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  
                  {/* Card 1: Guarantor Info */}
                  <div className="bg-[#051711] border border-slate-800/90 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#fef08a] border-b border-slate-800 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Поручитель (Кафил)</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {req.guarantor.relation}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-white font-semibold">{req.guarantor.name}</div>
                      <div className="text-slate-300 font-mono text-[11px]">{req.guarantor.phone}</div>
                    </div>

                    <div className="p-2 rounded-lg bg-[#020b08] border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SMS-код подтвержден</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{req.guarantor.smsConfirmedAt || 'Сегодня'}</span>
                    </div>
                  </div>

                  {/* Card 2: User Passport */}
                  <div className="bg-[#051711] border border-slate-800/90 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Паспорт заявителя</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {req.userPassport.seriesNumber}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 truncate">
                      {req.userPassport.issuedBy || 'МВД по Чеченской Республике'}
                    </div>

                    {/* Passport Scan Thumbnail with Zoom */}
                    <div 
                      onClick={() => {
                        playButtonTap();
                        setZoomedImage({
                          title: `Паспорт заявителя: ${req.userName}`,
                          url: req.userPassport.photoUrl,
                          meta: `${req.userPassport.seriesNumber} • ${req.userPassport.issuedBy || 'МВД по ЧР'}`
                        });
                      }}
                      className="group relative rounded-lg border border-slate-700 bg-black overflow-hidden h-20 cursor-pointer flex items-center justify-center"
                    >
                      <img
                        src={req.userPassport.photoUrl}
                        alt="Паспорт заявителя"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-all opacity-85 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center gap-1 text-[11px] font-semibold text-white">
                        <ZoomIn className="w-3.5 h-3.5 text-[#fef08a]" />
                        <span>Увеличить скан</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Guarantor Passport */}
                  <div className="bg-[#051711] border border-slate-800/90 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-1.5">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Паспорт поручителя</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {req.guarantor.passport.seriesNumber}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 truncate">
                      {req.guarantor.passport.issuedBy || 'МВД по Чеченской Республике'}
                    </div>

                    {/* Passport Scan Thumbnail with Zoom */}
                    <div 
                      onClick={() => {
                        playButtonTap();
                        setZoomedImage({
                          title: `Паспорт поручителя: ${req.guarantor.name} (${req.guarantor.relation})`,
                          url: req.guarantor.passport.photoUrl,
                          meta: `${req.guarantor.passport.seriesNumber} • ${req.guarantor.passport.issuedBy || 'МВД по ЧР'}`
                        });
                      }}
                      className="group relative rounded-lg border border-slate-700 bg-black overflow-hidden h-20 cursor-pointer flex items-center justify-center"
                    >
                      <img
                        src={req.guarantor.passport.photoUrl}
                        alt="Паспорт поручителя"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-all opacity-85 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center gap-1 text-[11px] font-semibold text-white">
                        <ZoomIn className="w-3.5 h-3.5 text-[#fef08a]" />
                        <span>Увеличить скан</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Digital Signature & Contract Verification Ribbon */}
                <div className="bg-[#030e0a] border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Договор Кафаля подписан:</span>
                        <span className="font-serif italic text-[#fef08a]">{req.contractSignature}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Хэш соглашения: {req.signatureHash || 'SHA256:8f9a21b3...'} • {req.contractSignedAt}
                      </div>
                    </div>
                  </div>

                  {req.rejectionReason && (
                    <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Причина отказа: {req.rejectionReason}</span>
                    </div>
                  )}

                  {/* Actions for Admin */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => { playButtonTap(); setRejectingRequestId(req.id); }}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/70 border border-rose-500/40 hover:bg-rose-900 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Отклонить</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(req.id)}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f59e0b] hover:from-[#e5bd46] hover:to-[#d97706] text-black text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Одобрить (Уровень 2)</span>
                        </button>
                      </>
                    )}

                    {!isPending && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isApproved) {
                            setRejectingRequestId(req.id);
                          } else {
                            handleApprove(req.id);
                          }
                        }}
                        className="text-xs text-slate-400 hover:text-white underline decoration-dotted"
                      >
                        {isApproved ? 'Отозвать верификацию' : 'Пересмотреть и одобрить'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* LIGHTBOX MODAL FOR ZOOMING PASSPORT SCANS */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-4 flex justify-center items-center">
          <div className="relative max-w-3xl w-full bg-[#091511] border border-[#d4af37]/40 rounded-2xl p-5 shadow-2xl text-slate-200 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {zoomedImage.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {zoomedImage.meta}
                </p>
              </div>
              <button
                onClick={() => setZoomedImage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-black border border-slate-800 max-h-[70vh] flex items-center justify-center">
              <img
                src={zoomedImage.url}
                alt="Zoomed Scan"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[68vh] object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Документ защищен протоколом шифрования Вай Котел</span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
              >
                Закрыть просмотр
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON DIALOG MODAL */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-4 flex justify-center items-center">
          <div className="relative max-w-md w-full bg-[#091511] border border-rose-500/40 rounded-2xl p-5 shadow-2xl text-slate-200 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Отклонение заявки Tier 2</span>
              </div>
              <button
                onClick={() => setRejectingRequestId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-300">
                Выберите причину отклонения:
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#030e0a] border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Нечеткий скан паспорта или блики на фото">Нечеткий скан паспорта или блики на фото</option>
                <option value="Поручитель не подтвердил согласие по телефону">Поручитель не подтвердил согласие по телефону</option>
                <option value="Несоответствие данных заявителя и паспорта">Несоответствие данных заявителя и паспорта</option>
                <option value="Требуется замена поручителя на близкого родственника">Требуется замена поручителя на близкого родственника</option>
                <option value="Иная причина">Иная причина</option>
              </select>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Комментарий для участника (опционально):
                </label>
                <textarea
                  value={customRejectNote}
                  onChange={(e) => setCustomRejectNote(e.target.value)}
                  placeholder="Например: Пожалуйста, загрузите разворот паспорта при дневном освещении без пальцев на кадре..."
                  rows={3}
                  className="w-full bg-[#030e0a] border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                className="px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
              >
                Отклонить заявку
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
