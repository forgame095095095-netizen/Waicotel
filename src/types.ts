export type VerificationTier = 1 | 2;

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export type VerificationStatus = 'tier1_basic' | 'pending' | 'verified' | 'rejected' | 'unregistered';

export type PaymentStatus = 'paid' | 'grace_period' | 'overdue' | 'payout_received' | 'pending';

export type RelationType = 'Брат' | 'Отец' | 'Дядя' | 'Друг' | 'Близкий друг' | 'Коллега' | 'Родственник';

export interface PassportData {
  seriesNumber: string; // e.g. "96 14 883921"
  issuedBy?: string; // e.g. "МВД по Чеченской Республике"
  issueDate?: string; // e.g. "12.04.2021"
  photoUrl: string; // Passport scan/photo image URL
}

export interface GuarantorVerificationData {
  name: string;
  phone: string;
  relation: RelationType;
  isSmsConfirmed: boolean;
  smsConfirmedAt?: string;
  passport: PassportData;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userCity: string;
  userAvatar?: string;
  userOccupation?: string;
  targetPoolTitle?: string;
  targetPoolAmount?: number;
  userPassport: PassportData;
  guarantor: GuarantorVerificationData;
  contractSignedAt: string;
  contractSignature: string; // Typed or drawn digital signature
  signatureHash?: string; // e.g. "SHA256:8f9a...3c12"
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  reviewerNotes?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  occupation: string; // e.g. "Предприниматель / Бизнесмен", "Маркетолог", "IT-специалист"
  occupationDetails?: string; // e.g. "Магазин одежды «Кавказ Трейд»", "Digital-агентство"
  registrationStatus: RegistrationStatus; // 'pending' | 'approved' | 'rejected'
  registeredAt?: string;
  registrationApprovedAt?: string;
  registrationRejectionReason?: string;
  verificationTier: VerificationTier; // Tier 1 (Basic <300k) or Tier 2 (High-Value 300k+)
  isOccupationVerified: boolean; // Verification badge for activity
  isPassportVerified: boolean; // Passport ID verified
  isPhoneVerified: boolean; // SMS phone verified
  isGuarantorVerified: boolean; // Kafil guarantor verified
  isGuarantorSmsConfirmed?: boolean;
  guarantorName: string;
  guarantorPhone: string;
  guarantorRelation: RelationType;
  userPassport?: PassportData;
  guarantorPassport?: PassportData;
  verificationStatus: VerificationStatus;
  verificationSubmittedAt?: string;
  verificationApprovedAt?: string;
  rejectionReason?: string;
  amanaScore: number; // 0 - 150
  totalSaved: number;
  completedKotelsCount: number;
  avatarUrl?: string;
  hasSignedContract: boolean;
  bio?: string;
}

export interface AmanaScoreLog {
  id: string;
  date: string;
  kotelTitle: string;
  points: number;
  type: 'bonus' | 'penalty' | 'neutral';
  reason: string;
  category: 'speed_payment' | 'on_time' | 'guarantor_verified' | 'grace_period' | 'overdue' | 'registration';
}

export type QueueType = 'baraban' | 'manual';

export interface KotelMember {
  id: string;
  name: string;
  phone: string;
  city: string;
  avatarUrl?: string;
  occupation?: string;
  isOccupationVerified?: boolean;
  isPassportVerified?: boolean;
  isGuarantorVerified?: boolean;
  drawNumber: number | null; // Position 1..N assigned by Baraban or manual slot selection
  monthStatus: PaymentStatus;
  paidAmount: number;
  paidAt?: string;
  receiptUrl?: string;
  amanaScore: number;
  isGuarantorConfirmed: boolean;
  guarantorName: string;
  guarantorPhone: string;
  isCurrentUser?: boolean;
}

export interface Kotel {
  id: string;
  inviteCode: string; // e.g. "VK-7701" for easy sharing and friend lookup
  title: string;
  purpose: string; // e.g. "Автомобильный фонд", "Семейный резерв", "Хадж и Умра", "Ремонт и стройка"
  monthlyContribution: number; // e.g. 30,000 ₽
  totalPool: number; // e.g. 360,000 ₽
  totalMembers: number; // e.g. 12
  currentCycleMonth: number; // e.g. 4
  totalMonths: number; // e.g. 12
  startDate: string;
  paymentDeadlineDay: number; // Day 15
  gracePeriodDeadlineDay: number; // Day 19
  status: 'gathering' | 'draw_ready' | 'active' | 'completed';
  drawCompleted: boolean;
  queueType: QueueType; // 'baraban' (random lot) or 'manual' (choose slot in order)
  currentRecipientMemberId?: string;
  minimumAmanaScore: number;
  members: KotelMember[];
  isUserJoined: boolean;
  userDrawNumber?: number | null;
  adminName: string;
  adminPhone: string;
  adminAvatarUrl?: string;
  adminOccupation?: string;
  isAdminOccupationVerified?: boolean;
  isAdminPassportVerified?: boolean;
  requireOccupationVerified?: boolean; // Creator can require verified occupation for joiners
}

export interface PaymentReceipt {
  id: string;
  kotelId: string;
  memberId: string;
  memberName: string;
  amount: number;
  bankName: string;
  transactionNumber: string;
  uploadedAt: string;
  imageUrl?: string;
  status: 'verified' | 'pending' | 'rejected';
}
