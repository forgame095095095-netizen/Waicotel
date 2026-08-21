import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { BarabanWheel } from './components/BarabanWheel';
import { ProfileAmanaTab } from './components/ProfileAmanaTab';
import { AdminReviewPortal } from './components/AdminReviewPortal';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { AuthGatewayScreen } from './components/AuthGatewayScreen';
import { Tier2VerificationModal } from './components/Tier2VerificationModal';
import { KotelDetailModal } from './components/KotelDetailModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ShariaModal } from './components/ShariaModal';
import { ReceiptUploadModal } from './components/ReceiptUploadModal';
import { CreateKotelModal } from './components/CreateKotelModal';
import { ShareKotelModal } from './components/ShareKotelModal';
import { 
  INITIAL_REGISTERED_USERS, 
  INITIAL_KOTELS, 
  INITIAL_AMANA_LOGS, 
  INITIAL_VERIFICATION_REQUESTS 
} from './data/initialData';
import { 
  UserProfile, 
  Kotel, 
  KotelMember, 
  PaymentStatus, 
  AmanaScoreLog, 
  VerificationRequest 
} from './types';
import { playButtonTap, playSuccessChime } from './utils/audio';
import { Scale, CheckCircle2 } from 'lucide-react';

export default function App() {
  // 1. Users Database in localStorage
  const [usersDb, setUsersDb] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('wai_kotel_users_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_REGISTERED_USERS;
    } catch {
      return INITIAL_REGISTERED_USERS;
    }
  });

  // 2. Currently Active User (null means not logged in -> Auth Gateway Screen)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('wai_kotel_user');
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  // 3. Kotels, Logs, Verification Requests in localStorage
  const [kotels, setKotels] = useState<Kotel[]>(() => {
    try {
      const saved = localStorage.getItem('wai_kotel_pools');
      return saved ? JSON.parse(saved) : INITIAL_KOTELS;
    } catch {
      return INITIAL_KOTELS;
    }
  });

  const [amanaLogs, setAmanaLogs] = useState<AmanaScoreLog[]>(() => {
    try {
      const saved = localStorage.getItem('wai_kotel_logs');
      return saved ? JSON.parse(saved) : INITIAL_AMANA_LOGS;
    } catch {
      return INITIAL_AMANA_LOGS;
    }
  });

  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    try {
      const saved = localStorage.getItem('wai_kotel_requests');
      return saved ? JSON.parse(saved) : INITIAL_VERIFICATION_REQUESTS;
    } catch {
      return INITIAL_VERIFICATION_REQUESTS;
    }
  });

  // Active Screen / Tab for logged in user
  const [activeTab, setActiveTab] = useState<'dashboard' | 'baraban' | 'profile' | 'contract' | 'admin'>('dashboard');
  const [selectedKotelForBarabanId, setSelectedKotelForBarabanId] = useState<string>('kotel_02');

  // Modals
  const [selectedKotelDetailId, setSelectedKotelDetailId] = useState<string | null>(null);
  const [receiptUploadData, setReceiptUploadData] = useState<{ kotelId: string; memberId: string } | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isShariaOpen, setIsShariaOpen] = useState(false);
  const [isCreateKotelOpen, setIsCreateKotelOpen] = useState(false);
  const [shareKotelTarget, setShareKotelTarget] = useState<Kotel | null>(null);
  const [isTier2VerificationOpen, setIsTier2VerificationOpen] = useState(false);
  const [tier2TargetPool, setTier2TargetPool] = useState<{ title: string; amount: number } | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('wai_kotel_users_db', JSON.stringify(usersDb));
    } catch {}
  }, [usersDb]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('wai_kotel_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('wai_kotel_user');
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('wai_kotel_pools', JSON.stringify(kotels));
    } catch {}
  }, [kotels]);

  useEffect(() => {
    try {
      localStorage.setItem('wai_kotel_logs', JSON.stringify(amanaLogs));
    } catch {}
  }, [amanaLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('wai_kotel_requests', JSON.stringify(verificationRequests));
    } catch {}
  }, [verificationRequests]);

  // Handler: Login Success
  const handleSuccessLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'admin' || loggedInUser.phone === '+7 (999) 000-00-00') {
      setActiveTab('admin');
      showToast(`Вы авторизованы как Администратор системы (+7 (999) 000-00-00)`);
    } else {
      setActiveTab('dashboard');
      if (loggedInUser.registrationStatus === 'pending') {
        showToast(`Вы вошли в систему. Ваша заявка находится на рассмотрении модератором.`);
      } else {
        showToast(`Добро пожаловать в Вай Котел, ${loggedInUser.fullName}!`);
      }
    }
  };

  // Handler: Register Success
  const handleSuccessRegister = (newUser: UserProfile) => {
    setUsersDb((prev) => [newUser, ...prev]);
    setUser(newUser);
    setActiveTab('dashboard');
    showToast(`Заявка успешно отправлена на рассмотрение администратору!`);
  };

  // Handler: Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('wai_kotel_user');
    playButtonTap();
    showToast('Вы вышли из учетной записи');
  };

  // Handler: Refresh user status from DB
  const handleRefreshUserStatus = () => {
    if (!user) return;
    const latest = usersDb.find((u) => u.id === user.id || u.phone === user.phone);
    if (latest) {
      setUser(latest);
      if (latest.registrationStatus === 'approved') {
        playSuccessChime();
        showToast('Поздравляем! Ваша заявка одобрена администратором!');
      } else {
        showToast('Статус: По-прежнему «На рассмотрении». Ожидайте проверки модератором.');
      }
    }
  };

  // Handler: Join Kotel
  const handleJoinKotel = (kotelId: string, customSlot?: number) => {
    if (!user) return;

    if (user.registrationStatus === 'pending') {
      showToast('Ваша заявка находится на рассмотрении. Доступ откроется после одобрения.');
      return;
    }

    const targetKotel = kotels.find((k) => k.id === kotelId);
    if (!targetKotel) return;

    // Check Tier 2 requirement
    if (targetKotel.requiresTier2 && (user.verificationTier < 2 || user.verificationStatus !== 'verified')) {
      handleOpenTier2Modal(targetKotel.title, targetKotel.monthlyContribution);
      return;
    }

    // Assign slot
    const occupiedDrawNumbers = targetKotel.members.map((m) => m.drawNumber).filter(Boolean) as number[];
    let assignedNumber = customSlot;
    if (!assignedNumber) {
      for (let i = 1; i <= targetKotel.totalMembers; i++) {
        if (!occupiedDrawNumbers.includes(i)) {
          assignedNumber = i;
          break;
        }
      }
    }
    if (!assignedNumber) assignedNumber = targetKotel.members.length + 1;

    const newMember: KotelMember = {
      id: `member_${Date.now()}`,
      name: user.fullName,
      phone: user.phone,
      city: user.city,
      occupation: user.occupation,
      isOccupationVerified: user.isOccupationVerified,
      isPassportVerified: user.isPassportVerified,
      isGuarantorVerified: user.isGuarantorVerified,
      drawNumber: assignedNumber,
      monthStatus: 'pending',
      paidAmount: 0,
      isCurrentUser: true,
      avatarUrl: user.avatarUrl,
      amanaScore: user.amanaScore,
      guarantorName: user.guarantorName || 'Кафил',
      guarantorPhone: user.guarantorPhone || '',
      isGuarantorConfirmed: user.isGuarantorVerified,
    };

    setKotels((prev) =>
      prev.map((k) => {
        if (k.id === kotelId) {
          const updatedMembers = [...k.members, newMember];
          const newStatus = updatedMembers.length >= k.totalMembers ? 'draw_ready' : 'gathering';
          return {
            ...k,
            members: updatedMembers,
            isUserJoined: true,
            userDrawNumber: assignedNumber,
            status: newStatus,
          };
        }
        return k;
      })
    );

    playSuccessChime();
    showToast(`Вы успешно вступили в «${targetKotel.title}» (Очередь #${assignedNumber})!`);
  };

  // Handler: Moderator excludes member from Kotel before start
  const handleExcludeMember = (kotelId: string, memberId: string) => {
    let excludedName = '';
    let freedSlot: number | null = null;

    setKotels((prev) =>
      prev.map((k) => {
        if (k.id === kotelId) {
          const targetMember = k.members.find((m) => m.id === memberId);
          if (targetMember) {
            excludedName = targetMember.name;
            freedSlot = targetMember.drawNumber;
          }

          const updatedMembers = k.members.filter((m) => m.id !== memberId);
          const isUserJoined = user ? updatedMembers.some((m) => m.isCurrentUser || m.id === user.id) : false;
          const newStatus = updatedMembers.length < k.totalMembers && k.status === 'draw_ready' ? 'gathering' : k.status;

          return {
            ...k,
            members: updatedMembers,
            isUserJoined,
            status: newStatus,
          };
        }
        return k;
      })
    );

    playButtonTap();
    if (freedSlot) {
      showToast(`Участник «${excludedName || 'Участник'}» исключен из котла. Место #${freedSlot} освобождено!`);
    } else {
      showToast(`Участник «${excludedName || 'Участник'}» успешно исключен из котла.`);
    }
  };

  // Handler: Update Member status directly
  const handleUpdateMemberStatus = (kotelId: string, memberId: string, newStatus: PaymentStatus) => {
    setKotels((prev) =>
      prev.map((k) => {
        if (k.id === kotelId) {
          const updatedMembers = k.members.map((m) => (m.id === memberId ? { ...m, monthStatus: newStatus } : m));
          return { ...k, members: updatedMembers };
        }
        return k;
      })
    );
  };

  // Handler: Create new Kotel
  const handleCreateKotel = (newKotel: Kotel) => {
    setKotels((prev) => [newKotel, ...prev]);
    showToast(`Котел «${newKotel.title}» успешно создан! Открыт набор участников.`);
  };

  // Handler: Open Tier 2 Modal
  const handleOpenTier2Modal = (poolTitle = 'Премиум котел (300k+)', poolAmount = 300000) => {
    setTier2TargetPool({ title: poolTitle, amount: poolAmount });
    setIsTier2VerificationOpen(true);
  };

  // Handler: Submit Tier 2 Verification Request
  const handleSubmitVerificationRequest = (requestData: Omit<VerificationRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReqId = `req_${Date.now()}`;
    const nowStr = new Date().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newRequest: VerificationRequest = {
      ...requestData,
      id: newReqId,
      submittedAt: nowStr,
      status: 'pending',
    };

    setVerificationRequests((prev) => [newRequest, ...prev]);
    if (user) {
      setUser((prev) => (prev ? { ...prev, verificationStatus: 'pending' } : null));
    }

    playSuccessChime();
    showToast('Заявка на верификацию 300k+ отправлена на проверку администратору!');
  };

  // Handler: Admin approves user registration
  const handleApproveUserRegistration = (userId: string) => {
    const nowStr = new Date().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setUsersDb((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, registrationStatus: 'approved', registrationApprovedAt: nowStr } : u))
    );

    if (user && user.id === userId) {
      setUser((prev) => (prev ? { ...prev, registrationStatus: 'approved', registrationApprovedAt: nowStr } : null));
    }

    playSuccessChime();
    showToast(`Заявка пользователя одобрена! Участник получил доступ к Дашборду.`);
  };

  // Handler: Admin rejects user registration
  const handleRejectUserRegistration = (userId: string, reason: string) => {
    setUsersDb((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, registrationStatus: 'rejected', rejectionReason: reason } : u))
    );

    if (user && user.id === userId) {
      setUser((prev) => (prev ? { ...prev, registrationStatus: 'rejected', rejectionReason: reason } : null));
    }

    playButtonTap();
    showToast(`Заявка отклонена. Причина зафиксирована в базе.`);
  };

  // Handler: Admin approves Tier 2 request
  const handleApproveTier2Request = (requestId: string) => {
    const nowStr = new Date().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved', reviewedAt: nowStr } : r))
    );

    const targetReq = verificationRequests.find((r) => r.id === requestId);
    if (targetReq) {
      setUsersDb((prev) =>
        prev.map((u) => {
          if (u.id === targetReq.userId || u.phone === targetReq.userPhone) {
            return {
              ...u,
              verificationTier: 2,
              verificationStatus: 'verified',
              isGuarantorVerified: true,
              isPassportVerified: true,
              isGuarantorSmsConfirmed: true,
              verificationApprovedAt: nowStr,
              amanaScore: Math.min(150, Math.max(u.amanaScore, 125)),
            };
          }
          return u;
        })
      );

      if (user && (user.id === targetReq.userId || user.phone === targetReq.userPhone)) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                verificationTier: 2,
                verificationStatus: 'verified',
                isGuarantorVerified: true,
                isPassportVerified: true,
                isGuarantorSmsConfirmed: true,
                verificationApprovedAt: nowStr,
                amanaScore: Math.min(150, Math.max(prev.amanaScore, 125)),
              }
            : null
        );
      }
      playSuccessChime();
      showToast(`Заявка пользователя «${targetReq.userName}» одобрена! Присвоен статус «Верифицирован 🛡️»`);
    }
  };

  // Handler: Admin rejects Tier 2 request
  const handleRejectTier2Request = (requestId: string, reason: string) => {
    const nowStr = new Date().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected', rejectionReason: reason, reviewedAt: nowStr } : r))
    );

    const targetReq = verificationRequests.find((r) => r.id === requestId);
    if (targetReq && user && (targetReq.userId === user.id || targetReq.userPhone === user.phone)) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: 'rejected',
            }
          : null
      );
    }
    showToast(`Заявка отклонена. Причина зафиксирована.`);
  };

  // Handler: Apply Draw Results from Baraban
  const handleApplyDrawResults = (kotelId: string, updatedMembers: KotelMember[]) => {
    setKotels((prev) =>
      prev.map((k) => {
        if (k.id === kotelId) {
          const userMember = user ? updatedMembers.find((m) => m.isCurrentUser || m.id === user.id) : null;
          return {
            ...k,
            members: updatedMembers,
            drawCompleted: true,
            status: 'active',
            userDrawNumber: userMember?.drawNumber || k.userDrawNumber,
          };
        }
        return k;
      })
    );

    playSuccessChime();
    showToast('Результаты жеребьевки зафиксированы в графике выплат!');
  };

  // Handler: Confirm Payment / Receipt Upload
  const handleConfirmPayment = (
    kotelId: string,
    memberId: string,
    receiptData: { bankName: string; transactionNumber: string; receiptUrl: string }
  ) => {
    setKotels((prev) =>
      prev.map((k) => {
        if (k.id === kotelId) {
          const updatedMembers = k.members.map((m) => {
            if (m.id === memberId) {
              return {
                ...m,
                monthStatus: 'paid' as PaymentStatus,
                paidAmount: k.monthlyContribution,
                paidAt: 'Сегодня, 15:30',
                receiptUrl: receiptData.receiptUrl,
              };
            }
            return m;
          });
          return { ...k, members: updatedMembers };
        }
        return k;
      })
    );

    if (user) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              amanaScore: Math.min(150, prev.amanaScore + 15),
              totalSaved: prev.totalSaved + (kotels.find((k) => k.id === kotelId)?.monthlyContribution || 30000),
            }
          : null
      );
    }

    const newLog: AmanaScoreLog = {
      id: `log_${Date.now()}`,
      date: 'Сегодня',
      kotelTitle: kotels.find((k) => k.id === kotelId)?.title || 'Вай Котел',
      points: 15,
      type: 'bonus',
      reason: 'Досрочный взнос в общий фонд зафиксирован квитанцией',
      category: 'speed_payment',
    };
    setAmanaLogs((prev) => [newLog, ...prev]);

    showToast('Взнос подтвержден! Вам начислено +15 баллов рейтинга Аманат');
  };

  const pendingRequestsCount = verificationRequests.filter((r) => r.status === 'pending').length;
  const pendingRegistrationsCount = usersDb.filter((u) => u.registrationStatus === 'pending').length;
  const selectedKotelForDetail = kotels.find((k) => k.id === selectedKotelDetailId);

  // 🛑 SCREEN 1: AUTH GATEWAY (If not authenticated)
  if (!user) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0d2a20] border-2 border-[#d4af37] text-[#fef08a] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
        )}
        <AuthGatewayScreen
          usersDb={usersDb}
          onSuccessLogin={handleSuccessLogin}
          onSuccessRegister={handleSuccessRegister}
          onOpenSharia={() => setIsShariaOpen(true)}
        />
        {/* Sharia Modal */}
        <ShariaModal
          isOpen={isShariaOpen}
          onClose={() => setIsShariaOpen(false)}
          userName="Участник"
        />
      </>
    );
  }

  const isAdmin = user.role === 'admin' || user.phone === '+7 (999) 000-00-00';
  const isUserPending = user.registrationStatus === 'pending';

  return (
    <div className="min-h-screen bg-[#070d0b] text-slate-100 flex flex-col justify-between selection:bg-[#d4af37]/30 selection:text-[#fef08a]">
      
      {/* Global Header */}
      <Header
        user={user}
        kotels={kotels}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSharia={() => setIsShariaOpen(true)}
        onLogout={handleLogout}
        pendingRequestsCount={pendingRequestsCount}
        pendingRegistrationsCount={pendingRegistrationsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0d2a20] border-2 border-[#d4af37] text-[#fef08a] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* 🛑 SCREEN 3: ADMIN PORTAL (Only for Admin special number +7 999 000-00-00) */}
        {isAdmin ? (
          <AdminReviewPortal
            usersDb={usersDb}
            onApproveUserRegistration={handleApproveUserRegistration}
            onRejectUserRegistration={handleRejectUserRegistration}
            onSwitchToUser={(targetUser) => {
              setUser(targetUser);
              setActiveTab('dashboard');
              showToast(`Переключено на профиль: ${targetUser.fullName}`);
            }}
            requests={verificationRequests}
            onApproveRequest={handleApproveTier2Request}
            onRejectRequest={handleRejectTier2Request}
            onSelectKotel={(title) => {
              const found = kotels.find((k) => k.title.toLowerCase().includes(title.toLowerCase()));
              if (found) {
                setSelectedKotelDetailId(found.id);
              }
            }}
            currentUser={user}
            onExitAdmin={handleLogout}
          />
        ) : isUserPending ? (
          /* 🛑 PENDING APPROVAL SCREEN (If regular user registration status is pending) */
          <PendingApprovalScreen
            user={user}
            onRefreshStatus={handleRefreshUserStatus}
            onLogout={handleLogout}
          />
        ) : (
          /* 🛑 SCREEN 2: MAIN DASHBOARD (For approved users) */
          <>
            {/* Tab 1: Dashboard & Available Pools */}
            {activeTab === 'dashboard' && (
              <DashboardTab
                user={user}
                kotels={kotels}
                onOpenKotelDetail={(id) => setSelectedKotelDetailId(id)}
                onOpenBaraban={(id) => {
                  setSelectedKotelForBarabanId(id);
                  setActiveTab('baraban');
                }}
                onOpenCreateKotel={() => setIsCreateKotelOpen(true)}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
                onOpenTier2Verification={() => handleOpenTier2Modal()}
                onOpenSharia={() => setIsShariaOpen(true)}
                onJoinKotel={handleJoinKotel}
                onOpenReceiptUpload={(kotelId, memberId) => setReceiptUploadData({ kotelId, memberId })}
                onOpenShareKotel={(kotel) => setShareKotelTarget(kotel)}
              />
            )}

            {/* Tab 2: Interactive Baraban Wheel */}
            {activeTab === 'baraban' && (
              <BarabanWheel
                kotels={kotels}
                selectedKotelId={selectedKotelForBarabanId}
                onSelectKotel={(id) => setSelectedKotelForBarabanId(id)}
                onApplyDrawResults={handleApplyDrawResults}
                onOpenKotelDetail={(id) => setSelectedKotelDetailId(id)}
              />
            )}

            {/* Tab 3: User Profile & Amana Rating History */}
            {activeTab === 'profile' && (
              <ProfileAmanaTab
                user={user}
                amanaLogs={amanaLogs}
                onOpenSharia={() => setIsShariaOpen(true)}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
                onUpdateUser={(updated) => {
                  setUser(updated);
                  setUsersDb((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
                  showToast('Профиль и данные верификации успешно обновлены!');
                }}
              />
            )}

            {/* Tab 4: Direct Contract View */}
            {activeTab === 'contract' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-[#091712] border border-[#d4af37]/35 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white font-display">
                          Договор Вай Котел (ВК)
                        </h2>
                        <p className="text-xs text-emerald-400">
                          Исламская система взаимных беспроцентных ссуд и накоплений
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      ✓ Действующий
                    </span>
                  </div>

                  <div className="bg-[#06120e] p-5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-3.5 leading-relaxed">
                    <p>
                      <strong>1. Суть Вай Котел:</strong> Участники Вай Котла формируют неделимый беспроцентный целевой фонд. Каждый участник поочередно получает всю собранную сумму пула без комиссий и надбавок.
                    </p>
                    <p>
                      <strong>2. Обязательство по срокам:</strong> Каждый участник обязуется своевременно вносить взнос до 15-го числа каждого месяца. Допускается льготный период до 19-го числа без денежных штрафов.
                    </p>
                    <p>
                      <strong>3. Социальная гарантия Кафаля:</strong> В случае неплатежеспособности участника его поручитель (Кафил) обязуется исполнить обязательство в полном объеме.
                    </p>
                    <p>
                      <strong>4. Электронная подпись:</strong> Договор закреплен SMS-подтверждением участника {user.fullName} ({user.phone}) и поручителя {user.guarantorName || 'Кафил'} ({user.guarantorPhone}).
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setIsShariaOpen(true)}
                      className="text-xs text-[#d4af37] hover:underline font-semibold cursor-pointer"
                    >
                      Читать подробное богословское заключение (Фетву) →
                    </button>

                    <button
                      onClick={() => { playButtonTap(); showToast('Договор экспортирован в PDF'); }}
                      className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f59e0b] transition-all cursor-pointer"
                    >
                      Скачать копию договора
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* Kotel Detail Modal */}
      {selectedKotelForDetail && user && (
        <KotelDetailModal
          isOpen={!!selectedKotelForDetail}
          onClose={() => setSelectedKotelDetailId(null)}
          kotel={selectedKotelForDetail}
          user={user}
          onJoinKotel={handleJoinKotel}
          onOpenReceiptUpload={(kotelId, memberId) => setReceiptUploadData({ kotelId, memberId })}
          onOpenBaraban={(kotelId) => {
            setSelectedKotelDetailId(null);
            setSelectedKotelForBarabanId(kotelId);
            setActiveTab('baraban');
          }}
          onUpdateMemberStatus={handleUpdateMemberStatus}
          onExcludeMember={handleExcludeMember}
          onOpenShareKotel={(kotel) => setShareKotelTarget(kotel)}
        />
      )}

      {/* Share Kotel Modal */}
      {shareKotelTarget && (
        <ShareKotelModal
          isOpen={!!shareKotelTarget}
          onClose={() => setShareKotelTarget(null)}
          kotel={shareKotelTarget}
        />
      )}

      {/* Receipt Upload Modal */}
      {receiptUploadData && (
        <ReceiptUploadModal
          isOpen={!!receiptUploadData}
          onClose={() => setReceiptUploadData(null)}
          kotel={kotels.find((k) => k.id === receiptUploadData.kotelId) || kotels[0]}
          memberId={receiptUploadData.memberId}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* Onboarding Modal */}
      {user && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          user={user}
          onUpdateUser={(updated) => {
            setUser(updated);
            setUsersDb((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            showToast('Анкета обновлена!');
          }}
        />
      )}

      {/* Sharia Modal */}
      <ShariaModal
        isOpen={isShariaOpen}
        onClose={() => setIsShariaOpen(false)}
        userName={user?.fullName || 'Участник'}
      />

      {/* Create Kotel Modal */}
      {user && (
        <CreateKotelModal
          isOpen={isCreateKotelOpen}
          onClose={() => setIsCreateKotelOpen(false)}
          user={user}
          onCreateKotel={handleCreateKotel}
          onRequireTier2Verification={() => {
            setIsCreateKotelOpen(false);
            handleOpenTier2Modal('Создаваемый пул (300k+)', 300000);
          }}
        />
      )}

      {/* Tier 2 Progressive Verification Modal */}
      {user && (
        <Tier2VerificationModal
          isOpen={isTier2VerificationOpen}
          onClose={() => setIsTier2VerificationOpen(false)}
          user={user}
          targetPoolTitle={tier2TargetPool?.title}
          targetPoolAmount={tier2TargetPool?.amount}
          onSubmitVerification={handleSubmitVerificationRequest}
          onFastApprove={() => {
            setIsTier2VerificationOpen(false);
            const existingReq = verificationRequests.find((r) => r.userId === user.id);
            if (existingReq) {
              handleApproveTier2Request(existingReq.id);
            } else {
              setUser((prev) =>
                prev
                  ? {
                      ...prev,
                      verificationTier: 2,
                      verificationStatus: 'verified',
                      isGuarantorVerified: true,
                      isPassportVerified: true,
                      isGuarantorSmsConfirmed: true,
                      amanaScore: 125,
                    }
                  : null
              );
              showToast('Уровень 2 успешно подтвержден!');
            }
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#d4af37]/20 bg-[#06110d] py-6 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-brand font-bold text-[#d4af37]">WAI KOTEL</span>
            <span>— Исламская P2P система ротационных сбережений (Вай Котел)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <button onClick={() => setIsShariaOpen(true)} className="hover:text-slate-300 transition-colors cursor-pointer">
              Стандарты AAOIFI
            </button>
            <span>•</span>
            <button onClick={() => setIsShariaOpen(true)} className="hover:text-slate-300 transition-colors cursor-pointer">
              0% Риба и Гарантия ВК
            </button>
            <span>•</span>
            <span>г. Грозный, 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
