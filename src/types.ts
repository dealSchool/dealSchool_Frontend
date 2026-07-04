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

  status: "pending" | "under_review" | "interview_invited" | "accepted" | "declined" | "cancelled";
  createdAt: any;
  updatedAt: any;

  // Payment fields — written only by Cloud Functions (admin SDK)
  paymentStatus?: "link_sent" | "processing" | "error" | "expired" | "failed" | "paid" | "refund_pending" | "refunded" | "refund_failed";
  rzpPaymentLinkId?: string;   // Razorpay lnk_XXXX
  rzpPaymentLinkUrl?: string;
  rzpPaymentId?: string;       // Razorpay pay_XXXX after successful payment
  paymentLinkSentAt?: any;
  paidAt?: any;

  // Cancellation / refund fields — set by POST /api/applications/[id]/cancel
  cancelledAt?: any;
  cancellationReason?: string;
  refundPercent?: number; // 0, 50, or 100
  rzpRefundId?: string;
}

export interface CohortSettings {
  startDate: string;   // ISO-8601
  feePaise: number;
  feeInRupees: number;
  feeDisplay: string;  // e.g. "₹1000"
}

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

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "archived";
  createdAt: any;
}
