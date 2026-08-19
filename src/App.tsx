import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { BarabanWheel } from './components/BarabanWheel';
import { ProfileAmanaTab } from './components/ProfileAmanaTab';
import { AdminReviewPortal } from './components/AdminReviewPortal';
import { Tier2VerificationModal } from './components/Tier2VerificationModal';
import { SmsAuthModal } from './components/SmsAuthModal';
import { KotelDetailModal } from './components/KotelDetailModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ShariaModal } from './components/ShariaModal';
import { ReceiptUploadModal } from './components/ReceiptUploadModal';
import { CreateKotelModal } from './components/CreateKotelModal';
import { ShareKotelModal } from './components/ShareKotelModal';
import { INITIAL_USER, INITIAL_KOTELS, INITIAL_AMANA_LOGS, INITIAL_VERIFICATION_REQUESTS } from './data/initialData';
import { UserProfile, Kotel, KotelMember, PaymentStatus, AmanaScoreLog, VerificationRequest } from './types';
import { playButtonTap, playSuccessChime } from './utils/audio';
import { Scale, CheckCircle2, Shield, Heart, HelpCircle, Phone } from 'lucide-react';

export default function App() {
  // Local storage persisted state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('wai_kotel_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

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

  // Active Screen / Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'baraban' | 'profile' | 'contract' | 'admin'>('dashboard');
  const [selectedKotelForBarabanId, setSelectedKotelForBarabanId] = useState<string>('kotel_02'); // Default to ready for draw kotel

  // Modals
  const [selectedKotelDetailId, setSelectedKotelDetailId] = useState<string | null>(null);
  const [receiptUploadData, setReceiptUploadData] = useState<{ kotelId: string; memberId: string } | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isShariaOpen, setIsShariaOpen] = useState(false);
  const [isCreateKotelOpen, setIsCreateKotelOpen] = useState(false);
  const [shareKotelTarget, setShareKotelTarget] = useState<Kotel | null>(null);
  const [isTier2VerificationOpen, setIsTier2VerificationOpen] = useState(false);
  const [isSmsAuthOpen, setIsSmsAuthOpen] = useState(false);
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
      localStorage.setItem('wai_kotel_user', JSON.stringify(user));
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

  // Handle URL deep-linking (?kotel=VK-7701 or kotel_01)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const kotelParam = urlParams.get('kotel');
      if (kotelParam) {
        const target = kotels.find(
          (k) =>
            k.inviteCode?.toLowerCase() === kotelParam.toLowerCase() ||
            k.id?.toLowerCase() === kotelParam.toLowerCase() ||
            k.inviteCode?.toLowerCase().replace(/[^a-z0-9]/g, '') === kotelParam.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        if (target) {
          setSelectedKotelDetailId(target.id);
          showToast(`Открыт котел «${target.title}» по ссылке-приглашению!`);
        }
      }
    } catch {}
  }, []);

  // Handle Tier 2 modal trigger with target pool
  const handleOpenTier2Modal = (poolTitle?: string, poolAmount?: number) => {
    if (poolTitle && poolAmount) {
      setTier2TargetPool({ title: poolTitle, amount: poolAmount });
    } else {
      setTier2TargetPool({ title: 'Групповой целевой фонд', amount: 300000 });
    }
    setIsTier2VerificationOpen(true);
  };

  // Handler: Join Kotel (Checking Tier 2 requirement >= 300,000)
  const handleJoinKotel = (kotelId: string, preferredSlot?: number) => {
    const targetKotel = kotels.find((k) => k.id === kotelId);
    const isTier2 = user.verificationTier === 2 && user.verificationStatus === 'verified';

    if (targetKotel && targetKotel.totalPool >= 300000 && !isTier2) {
      handleOpenTier2Modal(targetKotel.title, targetKotel.totalPool);
      return;
    }

    if (user.verificationStatus === 'pending') {
      showToast('Ваша заявка на верификацию находится на рассмотрении у администратора (В ожидании).');
    }

    let assignedSlotNumber: number | null = null;
    let joinedKotelTitle = '';

    setKotels((prev) =>
      prev.map((k) => {
        if (k.id === kotelId) {
          joinedKotelTitle = k.title;
          const isAlreadyIn = k.members.some((m) => m.id === user.id);
          if (isAlreadyIn) return k;

          const isManual = k.queueType === 'manual';
          const occupiedSlots = new Set(k.members.map((m) => m.drawNumber).filter((n): n is number => typeof n === 'number'));

          if (isManual) {
            if (preferredSlot && preferredSlot >= 1 && preferredSlot <= k.totalMembers && !occupiedSlots.has(preferredSlot)) {
              assignedSlotNumber = preferredSlot;
            } else {
              // Find lowest free slot 1..totalMembers
              for (let i = 1; i <= k.totalMembers; i++) {
                if (!occupiedSlots.has(i)) {
                  assignedSlotNumber = i;
                  break;
                }
              }
            }
          }

          const newMember: KotelMember = {
            id: user.id,
            name: `${user.fullName} (Вы)`,
            phone: user.phone,
            city: user.city,
            drawNumber: assignedSlotNumber,
            monthStatus: 'pending',
            paidAmount: 0,
            amanaScore: user.amanaScore,
            isGuarantorConfirmed: true,
            guarantorName: user.guarantorName,
            guarantorPhone: user.guarantorPhone,
            isCurrentUser: true,
          };

          const updatedMembers = [...k.members, newMember];
          const isFull = updatedMembers.length >= k.totalMembers;

          let newStatus = k.status;
          let drawCompleted = k.drawCompleted;

          if (isFull) {
            if (isManual) {
              newStatus = 'active';
              drawCompleted = true;
            } else {
              newStatus = 'draw_ready';
              drawCompleted = false;
            }
          }

          return {
            ...k,
            members: updatedMembers,
            isUserJoined: true,
            userDrawNumber: assignedSlotNumber ?? k.userDrawNumber,
            status: newStatus,
            drawCompleted,
          };
        }
        return k;
      })
    );

    playSuccessChime();
    if (assignedSlotNumber !== null) {
      showToast(`Вы успешно вступили в «${joinedKotelTitle}» и заняли #${assignedSlotNumber}-е место в очереди!`);
    } else {
      showToast('Вы успешно присоединились к группе! Ждем заполнения всех мест для жеребьевки.');
    }
  };

  // Handler: Submit Verification Request from Tier2 Modal -> Admin Queue
  const handleSubmitVerificationRequest = (newRequest: VerificationRequest, updatedUser: UserProfile) => {
    setVerificationRequests((prev) => [
      newRequest,
      ...prev.filter((r) => r.id !== newRequest.id && r.userId !== updatedUser.id),
    ]);
    setUser(updatedUser);
    playSuccessChime();
    showToast('Заявка отправлена на проверку! Статус: «В ожидании». Вы можете перейти в Админ-панель для одобрения.');
  };

  // Handler: Admin approves request
  const handleApproveRequest = (requestId: string) => {
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
    if (targetReq && (targetReq.userId === user.id || targetReq.userPhone === user.phone || user.verificationStatus === 'pending')) {
      setUser((prev) => ({
        ...prev,
        verificationTier: 2,
        verificationStatus: 'verified',
        isGuarantorVerified: true,
        isPassportVerified: true,
        isGuarantorSmsConfirmed: true,
        verificationApprovedAt: nowStr,
        amanaScore: Math.min(150, Math.max(prev.amanaScore, 125)),
      }));
      playSuccessChime();
      showToast(`Заявка пользователя «${targetReq.userName}» одобрена! Присвоен статус «Уровень 2» ★`);
    } else {
      playSuccessChime();
      showToast(`Заявка #${requestId} успешно одобрена в панели администратора!`);
    }
  };

  // Handler: Admin rejects request
  const handleRejectRequest = (requestId: string, reason: string) => {
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
    if (targetReq && (targetReq.userId === user.id || targetReq.userPhone === user.phone)) {
      setUser((prev) => ({
        ...prev,
        verificationStatus: 'rejected',
      }));
    }
    showToast(`Заявка отклонена. Причина зафиксирована.`);
  };

  // Handler: Demo mode switcher (Уровень 1, В ожидании, Уровень 2, Админ)
  const handleSwitchUserMode = (mode: 'tier1' | 'pending' | 'tier2' | 'admin') => {
    playButtonTap();
    if (mode === 'tier1') {
      setUser((prev) => ({
        ...prev,
        verificationTier: 1,
        verificationStatus: 'unverified',
        isGuarantorVerified: false,
        isPassportVerified: false,
        amanaScore: 75,
      }));
      showToast('Режим переключен: Базовый участник (Уровень 1)');
    } else if (mode === 'pending') {
      setUser((prev) => ({
        ...prev,
        verificationTier: 1,
        verificationStatus: 'pending',
        isGuarantorVerified: false,
        isPassportVerified: true,
        verificationSubmittedAt: 'Сегодня, 14:00',
        amanaScore: 85,
      }));
      showToast('Режим переключен: Заявка подана (В ожидании одобрения)');
    } else if (mode === 'tier2') {
      setUser((prev) => ({
        ...prev,
        verificationTier: 2,
        verificationStatus: 'verified',
        isGuarantorVerified: true,
        isPassportVerified: true,
        isGuarantorSmsConfirmed: true,
        verificationApprovedAt: 'Сегодня, 14:15',
        amanaScore: 125,
      }));
      showToast('Режим переключен: Полная верификация (Уровень 2 ★)');
    } else if (mode === 'admin') {
      setActiveTab('admin');
      showToast('Открыт Админ-портал проверки заявок');
    }
  };

  // Handler: Apply Draw Results from Baraban
  const handleApplyDrawResults = (kotelId: string, updatedMembers: KotelMember[]) => {
    setKotels((prev) =>
      prev.map((k) => {
        if (k.id === kotelId) {
          const userMember = updatedMembers.find((m) => m.isCurrentUser || m.id === user.id);
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

    // Give bonus Amana points
    setUser((prev) => ({
      ...prev,
      amanaScore: Math.min(150, prev.amanaScore + 15),
      totalSaved: prev.totalSaved + (kotels.find((k) => k.id === kotelId)?.monthlyContribution || 30000),
    }));

    // Add log
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

  // Reset demo data
  const handleResetDemoData = () => {
    localStorage.removeItem('wai_kotel_user');
    localStorage.removeItem('wai_kotel_pools');
    localStorage.removeItem('wai_kotel_logs');
    localStorage.removeItem('wai_kotel_requests');
    setUser(INITIAL_USER);
    setKotels(INITIAL_KOTELS);
    setAmanaLogs(INITIAL_AMANA_LOGS);
    setVerificationRequests(INITIAL_VERIFICATION_REQUESTS);
    playSuccessChime();
    showToast('Тестовые данные сброшены к начальным значениям');
  };

  const pendingRequestsCount = verificationRequests.filter((r) => r.status === 'pending').length;
  const selectedKotelForDetail = kotels.find((k) => k.id === selectedKotelDetailId);

  return (
    <div className="min-h-screen bg-[#070d0b] text-slate-100 flex flex-col justify-between selection:bg-[#d4af37]/30 selection:text-[#fef08a]">
      
      {/* Global Header */}
      <Header
        user={user}
        kotels={kotels}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSharia={() => setIsShariaOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenTier2Verification={() => handleOpenTier2Modal()}
        onOpenSmsAuth={() => setIsSmsAuthOpen(true)}
        onSwitchUserMode={handleSwitchUserMode}
        onResetDemoData={handleResetDemoData}
        pendingRequestsCount={pendingRequestsCount}
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
                  <strong>4. Электронная подпись:</strong> Договор закреплен двухфакторным SMS-подтверждением участника {user.fullName} ({user.phone}) и поручителя {user.guarantorName} ({user.guarantorPhone}).
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setIsShariaOpen(true)}
                  className="text-xs text-[#d4af37] hover:underline font-semibold"
                >
                  Читать подробное богословское заключение (Фетву) →
                </button>

                <button
                  onClick={() => { playButtonTap(); showToast('Договор экспортирован в PDF'); }}
                  className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f59e0b] transition-all"
                >
                  Скачать копию договора
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Admin Review Portal */}
        {activeTab === 'admin' && (
          <AdminReviewPortal
            requests={verificationRequests}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onSelectKotel={(title) => {
              const found = kotels.find((k) => k.title.toLowerCase().includes(title.toLowerCase()));
              if (found) {
                setSelectedKotelDetailId(found.id);
              } else {
                setActiveTab('dashboard');
              }
            }}
            currentUser={user}
          />
        )}

      </main>

      {/* Modals Container */}
      {selectedKotelForDetail && (
        <KotelDetailModal
          isOpen={!!selectedKotelDetailId}
          onClose={() => setSelectedKotelDetailId(null)}
          kotel={selectedKotelForDetail}
          onJoinKotel={handleJoinKotel}
          onOpenReceiptUpload={(kotelId, memberId) => setReceiptUploadData({ kotelId, memberId })}
          onOpenBaraban={(kotelId) => {
            setSelectedKotelDetailId(null);
            setSelectedKotelForBarabanId(kotelId);
            setActiveTab('baraban');
          }}
          onUpdateMemberStatus={handleUpdateMemberStatus}
          onOpenShareKotel={(kotel) => setShareKotelTarget(kotel)}
        />
      )}

      {shareKotelTarget && (
        <ShareKotelModal
          isOpen={!!shareKotelTarget}
          onClose={() => setShareKotelTarget(null)}
          kotel={shareKotelTarget}
        />
      )}

      {receiptUploadData && (
        <ReceiptUploadModal
          isOpen={!!receiptUploadData}
          onClose={() => setReceiptUploadData(null)}
          kotel={kotels.find((k) => k.id === receiptUploadData.kotelId) || kotels[0]}
          memberId={receiptUploadData.memberId}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        user={user}
        onUpdateUser={(updated) => {
          setUser(updated);
          showToast('Анкета обновлена!');
        }}
      />

      <ShariaModal
        isOpen={isShariaOpen}
        onClose={() => setIsShariaOpen(false)}
        userName={user.fullName}
      />

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

      {/* Tier 2 Progressive Verification Modal */}
      <Tier2VerificationModal
        isOpen={isTier2VerificationOpen}
        onClose={() => setIsTier2VerificationOpen(false)}
        user={user}
        targetPoolTitle={tier2TargetPool?.title}
        targetPoolAmount={tier2TargetPool?.amount}
        onSubmitVerification={handleSubmitVerificationRequest}
        onFastApprove={() => {
          setIsTier2VerificationOpen(false);
          // Find or create request then approve
          const existingReq = verificationRequests.find((r) => r.userId === user.id);
          if (existingReq) {
            handleApproveRequest(existingReq.id);
          } else {
            setUser((prev) => ({
              ...prev,
              verificationTier: 2,
              verificationStatus: 'verified',
              isGuarantorVerified: true,
              isPassportVerified: true,
              isGuarantorSmsConfirmed: true,
              amanaScore: 125,
            }));
            showToast('Уровень 2 успешно подтвержден!');
          }
        }}
      />

      {/* SMS Auth Modal */}
      <SmsAuthModal
        isOpen={isSmsAuthOpen}
        onClose={() => setIsSmsAuthOpen(false)}
        currentUser={user}
        phone={user.phone}
        onSuccessLogin={(updated) => {
          setUser(updated);
          showToast('Вы успешно вошли и подтвердили номер телефона!');
        }}
        onSuccess={() => {
          setUser((prev) => ({
            ...prev,
            isPhoneVerified: true,
          }));
          showToast('Номер телефона успешно подтвержден по SMS!');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-[#d4af37]/20 bg-[#06110d] py-6 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-brand font-bold text-[#d4af37]">WAI KOTEL</span>
            <span>— Исламская P2P система ротационных сбережений (Вай Котел)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <button onClick={() => setIsShariaOpen(true)} className="hover:text-slate-300 transition-colors">
              Стандарты AAOIFI
            </button>
            <span>•</span>
            <button onClick={() => setIsShariaOpen(true)} className="hover:text-slate-300 transition-colors">
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
