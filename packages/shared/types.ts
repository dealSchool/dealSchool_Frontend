export interface JourneyStage {
  id: string;
  num: string;
  title: string;
  duration: string;
  summary: string;
  focusAreas: string[];
  skillsAcquired: string[];
}

export interface Mentor {
  name: string;
  role: string;
  firm: string;
  background: string;
  monochromeImage: string;
  details: string;
}

export interface MemoPage {
  title: string;
  tag: string;
  content: string;
  evidence: string[];
  metricLabel?: string;
  metricVal?: string;
}

export interface FellowshipApplication {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  linkedinUrl?: string;
  city: string;
  currentStatus: string;

  // Student conditional fields
  collegeName?: string;
  degree?: string;
  graduationYear?: string;

  // Recent Graduate conditional fields
  currentRole?: string;
  companyName?: string;
  degreeEducationalBackground?: string;

  // Working Professional conditional fields
  yearsOfExperience?: string;

  // Founder conditional fields
  startupName?: string;
  industrySector?: string;
  startupLinkedinProfile?: string;

  // Freelancer conditional fields
  areaOfWork?: string;
  freelancerLinkedinProfile?: string;

  // Other conditional fields
  otherStatusSpecify?: string;

  primaryReason: string;
  primaryReasonOther?: string;

  assessmentQ1: string;
  assessmentQ2: string;
  assessmentQ3: string;

  resumeUrl?: string; // Backward compatibility with older records
  resumeLink: string; // The user-provided URL to their resume
  discoverySource: string;
  discoverySourceOther?: string;

  status: "pending" | "under_review" | "interview_invited" | "interview_completed" | "accepted" | "declined" | "cancelled";
  cohort?: number; // which cohort this application belongs to (1, 2, 3…) — set by the backend, never by the client
  createdAt: any;
  updatedAt: any;

  // Payment fields — written only by Cloud Functions (admin SDK)
  paymentStatus?: "link_sent" | "processing" | "error" | "expired" | "failed" | "paid" | "refund_pending" | "refunded" | "refund_failed";
  paymentOrderId?: string;
  paymentLinkId?: string;
  paymentLinkUrl?: string;
  paymentLinkSentAt?: any;
  paidAt?: any;

  // Cancellation / refund fields — set by POST /api/applications/[id]/cancel
  cancelledAt?: any;
  cancellationReason?: string;
  refundPercent?: number; // 0, 50, or 100
  rzpRefundId?: string;
}

// Response shape of GET /applications/:id (admin-only) — full doc plus linked payment record
export interface ApplicationPaymentInfo {
  id: string;
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  cohort?: number;
  amount: number; // paise
  currency: string;
  paymentLinkId: string;
  paymentLinkUrl: string;
  status: string;
  expiresAt: any;
  refundId?: string;
  createdAt: any;
  updatedAt: any;
  emailSentAt?: any;
}

export interface ApplicationDetailResponse {
  application: FellowshipApplication;
  payment: ApplicationPaymentInfo | null;
}

// A form-fill-in-progress record from GET /applications/draft — never appears in /applications
export interface DraftApplication {
  id: string;
  mobileNumber: string;
  email: string;
  currentStep: number; // 1-5, last step successfully saved
  formData: Record<string, unknown>;
  status: "in_progress";
  cohort?: number;
  label: "in_progress" | "abandoned"; // "abandoned" once 24h+ have passed with no step saved
  createdAt: any;
  updatedAt: any;
}

export interface DraftCounts {
  step1: number;
  step2: number;
  step3: number;
  step4: number;
  step5: number;
}

export interface DraftsResponse {
  drafts: DraftApplication[];
  hasMore: boolean;
  nextCursor: string | null;
  counts?: DraftCounts; // only present on first page (no `after` param)
}

export interface CohortSettings {
  cohort?: number;       // the cohort these settings describe (the active one unless ?cohort= was passed)
  name?: string;         // e.g. "Cohort 2"
  isActive?: boolean;
  activeCohort?: number;
  seats?: number | null;
  startDate: string;   // ISO-8601
  feePaise: number;
  feeInRupees: number;
  feeDisplay: string;  // e.g. "₹1000"
}

// One row of GET /cohorts — feeds the cohort filter dropdown
export interface CohortInfo {
  cohort: number;
  name: string;
  isActive: boolean;
  startDate: string;   // ISO-8601
  seats: number | null;
  feeInRupees: number;
  feeDisplay: string;
}

export interface CohortsResponse {
  activeCohort: number;
  cohorts: CohortInfo[];
}

export type PaymentMode = "sandbox" | "live";

export interface PaymentRecord {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  amount: number;           // in paise
  currency: string;
  rzpPaymentLinkId: string;
  rzpPaymentLinkUrl: string;
  rzpPaymentId?: string;
  status: "link_created" | "paid" | "expired" | "failed";
  expiresAt: any;
  processedWebhookIds: string[];
  emailSentAt?: any;
  paidAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface ContactReply {
  message: string;
  sentAt: any;
  repliedBy: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "archived" | "replied";
  cohort?: number;
  replies?: ContactReply[];
  createdAt: any;
}

export interface BrochureRequest {
  id: string;
  name: string;
  contact: string;
  email: string;
  city: string;
  ip: string;
  cohort?: number;
  createdAt: any;
  updatedAt: any;
}
