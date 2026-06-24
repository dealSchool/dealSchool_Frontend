/**
 * emailTemplates.tsx — DealSchool transactional email templates
 *
 * All templates in one file, built with React Email components.
 * Each exported render* function accepts typed data and returns an HTML string.
 *
 * Templates:
 *  1. renderAppReceivedCandidate   — to applicant after submitting form
 *  2. renderAppReceivedAdmin       — to admin on new application
 *  3. renderContactInquiryAdmin    — to admin on contact form submission
 *  4. renderAppUnderReview         — to applicant when admin clicks "Auditing"
 *  5. renderInterviewInvited       — to applicant when admin clicks "Invite Interview"
 *  6. renderAppDeclined            — to applicant when admin clicks "Decline"
 *  7. renderPaymentLinkEmail       — to applicant when accepted (Razorpay payment link)
 *  8. renderPaymentReceiptEmail    — to applicant after successful payment
 *  9. renderAdminPasswordReset     — to admin for forgot-password flow
 * 10. renderAdminOTP               — to admin for change-password OTP
 */

import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
  Heading,
  Preview,
  Button,
} from "@react-email/components";
import { renderToStaticMarkup } from "react-dom/server";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const GOLD = "#D4A62A";
const NAVY = "#152238";
const CREAM = "#FCFAF6";
const DARK = "#111111";

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Allows only http/https URLs to prevent javascript: injection in hrefs */
function safeHref(url: string | undefined | null): string {
  const s = String(url ?? "").trim();
  return s.startsWith("http://") || s.startsWith("https://") ? s : "#";
}

/** Renders a React Email component tree to an HTML string */
function renderEmail(element: React.ReactElement): string {
  return renderToStaticMarkup(element);
}

// ─── Shared layout ────────────────────────────────────────────────────────────

const bodyStyle: React.CSSProperties = {
  backgroundColor: CREAM,
  margin: 0,
  padding: 0,
  fontFamily: "Georgia, serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 600,
  margin: "0 auto",
  padding: "32px",
  border: "1px solid rgba(17,17,17,0.1)",
};

function DsHeader() {
  return (
    <Section
      style={{
        borderBottom: `2px solid ${GOLD}`,
        paddingBottom: 12,
        marginBottom: 24,
      }}
    >
      <Heading
        as="h2"
        style={{
          fontStyle: "italic",
          margin: 0,
          color: NAVY,
          fontFamily: "Georgia, serif",
          fontSize: 20,
        }}
      >
        DEALSCHOOL
      </Heading>
      <Text
        style={{
          fontFamily: "monospace",
          fontSize: 8,
          letterSpacing: 2,
          color: GOLD,
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Middha Ventures Family Office Desk
      </Text>
    </Section>
  );
}

function DsFooter({ helpEmail = "hello@dealschool.in" }: { helpEmail?: string }) {
  return (
    <>
      <Hr style={{ borderColor: "rgba(17,17,17,0.1)", margin: "32px 0 16px" }} />
      <Text
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          color: "#888888",
          lineHeight: "1.5",
          margin: 0,
        }}
      >
        Questions? Write to us at{" "}
        <Link href={`mailto:${helpEmail}`} style={{ color: GOLD }}>
          {helpEmail}
        </Link>
        <br />
        <strong>Admissions Desk &amp; General Partners</strong>
        <br />
        Middha Ventures Family Office
      </Text>
    </>
  );
}

function EmailBase({
  children,
  preview,
}: {
  children: React.ReactNode;
  preview?: string;
}) {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <DsHeader />
          {children}
          <DsFooter />
        </Container>
      </Body>
    </Html>
  );
}

/** Reusable key-value row for data tables inside emails */
function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td
        style={{
          padding: "8px 0",
          fontWeight: "bold",
          width: 170,
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          textTransform: "uppercase",
          fontSize: 10,
          color: "#555555",
          fontFamily: "sans-serif",
          verticalAlign: "top",
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "8px 0",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          fontSize: 13,
          fontFamily: "sans-serif",
          color: DARK,
          verticalAlign: "top",
        }}
      >
        {value}
      </td>
    </tr>
  );
}

/** Section heading used in admin notification emails */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        margin: "20px 0 6px 0",
        color: NAVY,
        borderBottom: "1px solid #f0f0f0",
        paddingBottom: 4,
        fontSize: 11,
        fontFamily: "sans-serif",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        fontWeight: "bold",
      }}
    >
      {children}
    </Text>
  );
}

// ─── Template 1: Application Received — Candidate ─────────────────────────────

export interface AppReceivedCandidateData {
  fullName: string;
  currentStatus: string;
  affiliationLabel: string;
  affiliationValue: string;
  primaryReason: string;
}

function AppReceivedCandidateEmail({
  fullName,
  currentStatus,
  affiliationLabel,
  affiliationValue,
  primaryReason,
}: AppReceivedCandidateData) {
  return (
    <EmailBase preview="Your DealSchool Fellowship application has been received.">
      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        Dear <strong>{fullName}</strong>,
      </Text>

      <Text
        style={{
          fontSize: 14,
          lineHeight: "1.6",
          fontStyle: "italic",
          color: "#555555",
          background: "rgba(212,166,42,0.05)",
          padding: "12px",
          borderLeft: `2px solid ${GOLD}`,
        }}
      >
        &ldquo;Built for those who want a seat at the table, not a seat in the
        classroom.&rdquo;
      </Text>

      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        We have successfully received your enrollment credentials and sector thesis focus for the
        fellowship program. Our GP partners are actively evaluating early-stage venture resumes for
        our upcoming Cohort.
      </Text>

      <Text
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          margin: "20px 0 8px 0",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: GOLD,
        }}
      >
        Resume Confirmation Snapshot:
      </Text>

      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 24 }}
      >
        <tbody>
          <DataRow label="Alignment" value={currentStatus} />
          <DataRow label={affiliationLabel} value={affiliationValue} />
          <DataRow
            label="Primary Motivation"
            value={
              <span style={{ color: GOLD, fontWeight: "bold" }}>{primaryReason}</span>
            }
          />
        </tbody>
      </table>

      <Text style={{ fontSize: 13, lineHeight: "1.6", color: "#666666" }}>
        No further operational actions are required on your side. Nominated fellows will be paired
        with interview parameters within Navi Mumbai or remotely.
      </Text>
    </EmailBase>
  );
}

export function renderAppReceivedCandidate(data: AppReceivedCandidateData): string {
  return renderEmail(<AppReceivedCandidateEmail {...data} />);
}

// ─── Template 2: Application Received — Admin ─────────────────────────────────

export interface AppReceivedAdminData {
  fullName: string;
  email: string;
  mobileNumber: string;
  city: string;
  linkedinUrl: string;
  currentStatus: string;
  // Status-specific optional fields
  collegeName?: string;
  degree?: string;
  graduationYear?: string;
  currentRole?: string;
  companyName?: string;
  yearsOfExperience?: string;
  degreeEducationalBackground?: string;
  startupName?: string;
  industrySector?: string;
  startupLinkedinProfile?: string;
  areaOfWork?: string;
  freelancerLinkedinProfile?: string;
  otherStatusSpecify?: string;
  // Objective & assessment
  primaryReason: string;
  primaryReasonOther?: string;
  discoverySource: string;
  discoverySourceOther?: string;
  resumeUrl: string;
  assessmentQ1: string;
  assessmentQ2: string;
  assessmentQ3: string;
}

function StatusDetailsRows({ data }: { data: AppReceivedAdminData }) {
  const s = data.currentStatus;

  if (s === "Student") {
    return (
      <>
        <DataRow label="College Name" value={data.collegeName ?? "—"} />
        <DataRow label="Degree Course" value={data.degree ?? "—"} />
        <DataRow label="Graduation Year" value={data.graduationYear ?? "—"} />
      </>
    );
  }
  if (s === "Recent Graduate (0–2 years of experience)") {
    return (
      <>
        <DataRow label="Current Role" value={data.currentRole ?? "—"} />
        <DataRow label="Company Name" value={data.companyName ?? "—"} />
        <DataRow label="Graduation Year" value={data.graduationYear ?? "—"} />
        <DataRow
          label="Degree / Background"
          value={data.degreeEducationalBackground ?? "—"}
        />
      </>
    );
  }
  if (s === "Working Professional") {
    return (
      <>
        <DataRow label="Current Role" value={data.currentRole ?? "—"} />
        <DataRow label="Company Name" value={data.companyName ?? "—"} />
        <DataRow label="Experience" value={data.yearsOfExperience ?? "—"} />
      </>
    );
  }
  if (s === "Founder") {
    return (
      <>
        <DataRow label="Startup Name" value={data.startupName ?? "—"} />
        <DataRow label="Industry / Domain" value={data.industrySector ?? "—"} />
        <DataRow
          label="Startup LinkedIn"
          value={
            <Link href={safeHref(data.startupLinkedinProfile)} style={{ color: GOLD }}>
              {data.startupLinkedinProfile ?? "—"}
            </Link>
          }
        />
      </>
    );
  }
  if (s === "Freelancer") {
    return (
      <>
        <DataRow label="Area of Work" value={data.areaOfWork ?? "—"} />
        <DataRow label="Experience" value={data.yearsOfExperience ?? "—"} />
        <DataRow
          label="LinkedIn Profile"
          value={
            <Link href={safeHref(data.freelancerLinkedinProfile)} style={{ color: GOLD }}>
              {data.freelancerLinkedinProfile ?? "—"}
            </Link>
          }
        />
      </>
    );
  }
  if (s === "Other") {
    return <DataRow label="Other Detail" value={data.otherStatusSpecify ?? "—"} />;
  }
  return null;
}

function AppReceivedAdminEmail(data: AppReceivedAdminData) {
  const primaryDisplay =
    data.primaryReason === "Other"
      ? data.primaryReasonOther ?? "Other Purpose"
      : data.primaryReason;
  const discoveryDisplay =
    data.discoverySource === "Other"
      ? data.discoverySourceOther ?? "Other"
      : data.discoverySource;

  return (
    <Html>
      <Head />
      <Preview>New fellowship application from {data.fullName}</Preview>
      <Body style={{ ...bodyStyle, fontFamily: "sans-serif" }}>
        <Container
          style={{ ...containerStyle, border: "1px solid #dddddd", borderRadius: 4 }}
        >
          <Heading
            as="h3"
            style={{
              color: NAVY,
              borderBottom: `2px solid ${GOLD}`,
              paddingBottom: 10,
              marginBottom: 20,
              fontSize: 16,
            }}
          >
            New Candidate Admission Application &amp; Resume Received
          </Heading>

          <Text style={{ fontSize: 15, marginBottom: 15 }}>
            <strong>Candidate Name:</strong> {data.fullName}
          </Text>

          <SectionLabel>1. Core Coordinates</SectionLabel>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <DataRow label="Mobile" value={data.mobileNumber} />
              <DataRow label="Email" value={data.email} />
              <DataRow label="City" value={data.city} />
              <DataRow
                label="LinkedIn"
                value={
                  <Link href={safeHref(data.linkedinUrl)} style={{ color: GOLD }}>
                    {data.linkedinUrl}
                  </Link>
                }
              />
            </tbody>
          </table>

          <SectionLabel>2. Alignment Profile: {data.currentStatus}</SectionLabel>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <StatusDetailsRows data={data} />
            </tbody>
          </table>

          <SectionLabel>3. Objective &amp; Support</SectionLabel>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <DataRow label="Primary Reason" value={primaryDisplay} />
              <DataRow label="Discovery Channel" value={discoveryDisplay} />
              <DataRow
                label="Resume"
                value={
                  <Link href={safeHref(data.resumeUrl)} style={{ color: GOLD, fontWeight: "bold" }}>
                    View Candidate Resume
                  </Link>
                }
              />
            </tbody>
          </table>

          <SectionLabel>4. Underwriting Assessments</SectionLabel>

          <Section
            style={{
              backgroundColor: CREAM,
              borderLeft: `3px solid ${GOLD}`,
              padding: 12,
              marginTop: 10,
            }}
          >
            <Text
              style={{ margin: "0 0 6px 0", fontWeight: "bold", color: NAVY, fontSize: 11 }}
            >
              Scenario Response (Fast growth but high cash-burn marketing):
            </Text>
            <Text style={{ margin: 0, color: "#333333", fontStyle: "italic", fontSize: 13 }}>
              &ldquo;{data.assessmentQ1}&rdquo;
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: CREAM,
              borderLeft: `3px solid ${GOLD}`,
              padding: 12,
              marginTop: 12,
            }}
          >
            <Text
              style={{ margin: "0 0 6px 0", fontWeight: "bold", color: NAVY, fontSize: 11 }}
            >
              10-Year ₹10 Lakhs Thesis Segment:
            </Text>
            <Text style={{ margin: 0, color: "#333333", fontStyle: "italic", fontSize: 13 }}>
              &ldquo;{data.assessmentQ2}&rdquo;
            </Text>
          </Section>

          <Text style={{ fontSize: 13, marginTop: 12 }}>
            <strong>What matters most in early-stage:</strong>{" "}
            <span
              style={{
                backgroundColor: NAVY,
                color: "white",
                padding: "2px 8px",
                borderRadius: 3,
                fontFamily: "monospace",
                fontSize: 11,
                fontWeight: "bold",
              }}
            >
              {data.assessmentQ3}
            </span>
          </Text>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0 12px" }} />
          <Text style={{ fontSize: 11, color: "#888888", fontFamily: "monospace" }}>
            Notification sent by DealSchool triggers. Review, update status, or initiate
            interviews in the Admin dashboard.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function renderAppReceivedAdmin(data: AppReceivedAdminData): string {
  return renderEmail(<AppReceivedAdminEmail {...data} />);
}

// ─── Template 3: Contact Inquiry — Admin ──────────────────────────────────────

export interface ContactInquiryAdminData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function ContactInquiryAdminEmail({ name, email, subject, message }: ContactInquiryAdminData) {
  return (
    <Html>
      <Head />
      <Preview>
        New inquiry from {name}: {subject}
      </Preview>
      <Body style={{ ...bodyStyle, fontFamily: "sans-serif" }}>
        <Container
          style={{ ...containerStyle, border: "1px solid #dddddd", borderRadius: 4 }}
        >
          <Heading
            as="h3"
            style={{
              color: NAVY,
              borderBottom: "1px solid #111111",
              paddingBottom: 10,
              marginBottom: 20,
              fontSize: 16,
            }}
          >
            New Support Inquiry Ticket Created
          </Heading>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <DataRow label="Sender Name" value={name} />
              <DataRow label="Sender Email" value={email} />
              <DataRow label="Subject" value={subject} />
            </tbody>
          </table>

          <Section
            style={{
              backgroundColor: "#fafafa",
              border: "1px solid #eeeeee",
              padding: 16,
              marginTop: 20,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                margin: "0 0 8px 0",
                fontSize: 11,
                color: "#888888",
                fontFamily: "monospace",
                textTransform: "uppercase",
              }}
            >
              Inquiry Message:
            </Text>
            <Text
              style={{
                fontSize: 13,
                whiteSpace: "pre-wrap",
                lineHeight: "1.6",
                margin: 0,
                color: "#333333",
              }}
            >
              {message}
            </Text>
          </Section>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0 12px" }} />
          <Text style={{ fontSize: 11, color: "#888888", fontFamily: "monospace" }}>
            Inspect ticket queues, resolve, or archive messages in the Admin Portal.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function renderContactInquiryAdmin(data: ContactInquiryAdminData): string {
  return renderEmail(<ContactInquiryAdminEmail {...data} />);
}

// ─── Template 4: Application Under Review — Candidate ────────────────────────

export interface AppUnderReviewData {
  fullName: string;
}

function AppUnderReviewEmail({ fullName }: AppUnderReviewData) {
  return (
    <EmailBase preview="Your DealSchool application is now under review.">
      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        Dear <strong>{fullName}</strong>,
      </Text>

      <Section
        style={{
          background: "rgba(212,166,42,0.06)",
          borderLeft: `3px solid ${GOLD}`,
          padding: "14px 16px",
          marginBottom: 20,
        }}
      >
        <Text style={{ margin: 0, fontSize: 14, color: NAVY, fontWeight: "bold" }}>
          Your application is now under review.
        </Text>
      </Section>

      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        Our GP team has begun evaluating your fellowship application. This stage involves a thorough
        review of your background, sector thesis, and the underwriting assessments you submitted.
      </Text>

      <Text style={{ fontSize: 13, lineHeight: "1.6", color: "#555555" }}>
        You will receive an update once the review is complete — either an invitation to the
        interview stage, or a final decision. No action is required from your side at this time.
      </Text>

      <Text style={{ fontSize: 13, lineHeight: "1.6", color: "#666666" }}>
        We appreciate your patience and your interest in the DealSchool Fellowship.
      </Text>
    </EmailBase>
  );
}

export function renderAppUnderReview(data: AppUnderReviewData): string {
  return renderEmail(<AppUnderReviewEmail {...data} />);
}

// ─── Template 5: Interview Invited — Candidate ───────────────────────────────

export interface InterviewInvitedData {
  fullName: string;
}

function InterviewInvitedEmail({ fullName }: InterviewInvitedData) {
  return (
    <EmailBase preview="You've been invited to interview for the DealSchool Fellowship.">
      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        Dear <strong>{fullName}</strong>,
      </Text>

      <Section
        style={{
          background: "rgba(212,166,42,0.08)",
          borderLeft: `3px solid ${GOLD}`,
          padding: "14px 16px",
          marginBottom: 20,
        }}
      >
        <Text style={{ margin: 0, fontSize: 15, color: NAVY, fontWeight: "bold" }}>
          Congratulations — you have been shortlisted for an interview.
        </Text>
      </Section>

      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        Your application has cleared the initial review stage and you have been selected to
        advance in the DealSchool Fellowship selection process. Our team will reach out shortly
        to schedule your interview.
      </Text>

      <Text style={{ fontSize: 13, lineHeight: "1.6", color: "#555555" }}>
        The interview will focus on your analytical thinking, investment thesis, and alignment
        with the DealSchool Fellowship's objectives. It may be conducted in-person in Navi Mumbai
        or remotely, based on your location.
      </Text>

      <Text style={{ fontSize: 13, lineHeight: "1.6", color: "#666666" }}>
        Please ensure your contact details on file are current. We look forward to speaking with
        you.
      </Text>
    </EmailBase>
  );
}

export function renderInterviewInvited(data: InterviewInvitedData): string {
  return renderEmail(<InterviewInvitedEmail {...data} />);
}

// ─── Template 6: Application Declined — Candidate ────────────────────────────

export interface AppDeclinedData {
  fullName: string;
}

function AppDeclinedEmail({ fullName }: AppDeclinedData) {
  return (
    <EmailBase preview="An update on your DealSchool Fellowship application.">
      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        Dear <strong>{fullName}</strong>,
      </Text>

      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        Thank you for your interest in the DealSchool Fellowship Program and for the time you
        invested in your application.
      </Text>

      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        After careful deliberation, our GP partners have determined that your profile is not the
        right fit for the current cohort. This is not a reflection of your capability — the
        program is highly selective and many strong candidates are not selected each round.
      </Text>

      <Section
        style={{
          backgroundColor: "rgba(17,17,17,0.03)",
          border: "1px solid rgba(17,17,17,0.08)",
          padding: "14px 16px",
          marginTop: 8,
          marginBottom: 20,
        }}
      >
        <Text style={{ margin: 0, fontSize: 13, color: "#555555", lineHeight: "1.6" }}>
          We encourage you to continue developing your investment thesis and to apply again in a
          future cohort. The DealSchool community remains open to exceptional candidates who
          continue to grow.
        </Text>
      </Section>

      <Text style={{ fontSize: 13, lineHeight: "1.6", color: "#666666" }}>
        We appreciate your engagement with DealSchool and wish you the very best in your journey
        ahead.
      </Text>
    </EmailBase>
  );
}

export function renderAppDeclined(data: AppDeclinedData): string {
  return renderEmail(<AppDeclinedEmail {...data} />);
}

// ─── Template 7: Payment Link — Candidate (Accept / Fellow) ──────────────────

export interface PaymentLinkEmailData {
  fullName: string;
  linkUrl: string;
  feeDisplay: string;
}

function PaymentLinkEmail({ fullName, linkUrl, feeDisplay }: PaymentLinkEmailData) {
  return (
    <EmailBase
      preview={`Complete your DealSchool Fellowship enrollment — pay ${feeDisplay} now.`}
    >
      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        Dear <strong>{fullName}</strong>,
      </Text>

      <Section
        style={{
          background: "rgba(212,166,42,0.08)",
          borderLeft: `3px solid ${GOLD}`,
          padding: "14px 16px",
          marginBottom: 20,
        }}
      >
        <Text style={{ margin: 0, fontSize: 14, color: DARK }}>
          Congratulations — you have been <strong>accepted</strong> into the DealSchool
          Fellowship Program. To secure your seat in the cohort, please complete your enrollment
          fee payment using the secure link below.
        </Text>
      </Section>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12,
          margin: "24px 0",
          fontFamily: "sans-serif",
        }}
      >
        <tbody>
          <DataRow
            label="Program Fee"
            value={<strong style={{ color: NAVY }}>{feeDisplay}</strong>}
          />
          <DataRow
            label="Payment Mode"
            value="Secure Online Payment (UPI / Cards / Net Banking)"
          />
        </tbody>
      </table>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button
          href={safeHref(linkUrl)}
          style={{
            display: "inline-block",
            backgroundColor: NAVY,
            color: GOLD,
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: "bold",
            letterSpacing: 2,
            textTransform: "uppercase",
            textDecoration: "none",
            padding: "16px 40px",
            border: `1px solid ${GOLD}`,
          }}
        >
          Pay {feeDisplay} Now →
        </Button>
      </Section>

      <Section
        style={{
          background: "rgba(220,38,38,0.06)",
          border: "1px solid rgba(220,38,38,0.2)",
          padding: "12px",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <Text
          style={{ margin: 0, fontSize: 12, color: "#B91C1C", fontFamily: "sans-serif" }}
        >
          ⚠ This payment link expires in <strong>15 minutes</strong>. If it expires, contact us
          for a new link.
        </Text>
      </Section>

      <Text style={{ fontSize: 13, lineHeight: "1.6", color: "#555555" }}>
        Once payment is confirmed, your seat in the upcoming cohort will be reserved and you will
        receive a confirmation email with onboarding details.
      </Text>
    </EmailBase>
  );
}

export function renderPaymentLinkEmail(data: PaymentLinkEmailData): string {
  return renderEmail(<PaymentLinkEmail {...data} />);
}

// ─── Template 8: Payment Receipt — Candidate ─────────────────────────────────

export interface PaymentReceiptEmailData {
  applicantName: string;
  feeDisplay: string;
  rzpPaymentId: string;
}

function PaymentReceiptEmail({
  applicantName,
  feeDisplay,
  rzpPaymentId,
}: PaymentReceiptEmailData) {
  return (
    <EmailBase preview="Payment confirmed — your DealSchool Fellowship seat is reserved.">
      <Section
        style={{
          background: "rgba(21,134,52,0.06)",
          borderLeft: "3px solid #15803d",
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text style={{ margin: 0, fontSize: 15, color: "#15803d", fontWeight: "bold" }}>
          ✓ Payment Confirmed — Your seat is reserved.
        </Text>
      </Section>

      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        Dear <strong>{applicantName}</strong>,
      </Text>
      <Text style={{ fontSize: 14, lineHeight: "1.6", color: DARK }}>
        Your enrollment fee of <strong>{feeDisplay}</strong> has been received. You are now
        officially a DealSchool Fellow for the upcoming cohort.
      </Text>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12,
          margin: "24px 0",
          fontFamily: "sans-serif",
        }}
      >
        <tbody>
          <DataRow
            label="Razorpay Payment ID"
            value={
              <span style={{ fontFamily: "monospace", fontSize: 11, color: NAVY }}>
                {rzpPaymentId}
              </span>
            }
          />
          <DataRow label="Amount Paid" value={<strong>{feeDisplay}</strong>} />
          <DataRow
            label="Status"
            value={
              <span style={{ color: "#15803d", fontWeight: "bold" }}>Confirmed</span>
            }
          />
        </tbody>
      </table>

      <Text style={{ fontSize: 13, lineHeight: "1.6", color: "#555555" }}>
        Our admissions team will be in touch shortly with onboarding details, session schedule,
        and your cohort portal access. Keep this email as your payment receipt.
      </Text>
    </EmailBase>
  );
}

export function renderPaymentReceiptEmail(data: PaymentReceiptEmailData): string {
  return renderEmail(<PaymentReceiptEmail {...data} />);
}

// ─── Template 9: Admin Password Reset ────────────────────────────────────────

export interface AdminPasswordResetData {
  resetLink: string;
}

function AdminPasswordResetEmail({ resetLink }: AdminPasswordResetData) {
  return (
    <Html>
      <Head />
      <Preview>DealSchool Admin Portal — password reset link inside.</Preview>
      <Body style={bodyStyle}>
        <Container
          style={{ ...containerStyle, border: "1px solid #e0e0e0", borderRadius: 4 }}
        >
          <Section
            style={{ borderBottom: `2px solid ${GOLD}`, paddingBottom: 10, marginBottom: 20 }}
          >
            <Heading
              as="h2"
              style={{ fontStyle: "italic", margin: 0, color: NAVY, fontSize: 18 }}
            >
              DEALSCHOOL
            </Heading>
            <Text
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                letterSpacing: 2,
                color: GOLD,
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Admin Portal Security
            </Text>
          </Section>

          <Heading as="h3" style={{ color: NAVY, margin: "0 0 12px 0", fontSize: 16 }}>
            Password Reset Request
          </Heading>

          <Text style={{ color: "#444444", fontSize: 13, lineHeight: "1.6" }}>
            A password reset was requested for the DealSchool Admin Portal. Click the button
            below to set a new password.
          </Text>

          <Text style={{ color: "#888888", fontSize: 11 }}>
            This link expires in <strong>15 minutes</strong>.
          </Text>

          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            <Button
              href={safeHref(resetLink)}
              style={{
                display: "inline-block",
                backgroundColor: NAVY,
                color: GOLD,
                padding: "14px 28px",
                textDecoration: "none",
                fontWeight: "bold",
                fontFamily: "monospace",
                letterSpacing: 1,
                textTransform: "uppercase",
                fontSize: 11,
              }}
            >
              Reset Password →
            </Button>
          </Section>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0 12px" }} />
          <Text style={{ color: "#999999", fontSize: 11 }}>
            If you did not request this, ignore this email. Your password will remain unchanged.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function renderAdminPasswordReset(data: AdminPasswordResetData): string {
  return renderEmail(<AdminPasswordResetEmail {...data} />);
}

// ─── Template 10: Admin OTP — Change Password ────────────────────────────────

export interface AdminOTPData {
  otpCode: string;
}

function AdminOTPEmail({ otpCode }: AdminOTPData) {
  return (
    <Html>
      <Head />
      <Preview>Your DealSchool Admin Portal OTP for password change.</Preview>
      <Body style={bodyStyle}>
        <Container
          style={{ ...containerStyle, border: "1px solid #e0e0e0", borderRadius: 4 }}
        >
          <Section
            style={{ borderBottom: `2px solid ${GOLD}`, paddingBottom: 10, marginBottom: 20 }}
          >
            <Heading
              as="h2"
              style={{ fontStyle: "italic", margin: 0, color: NAVY, fontSize: 18 }}
            >
              DEALSCHOOL
            </Heading>
            <Text
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                letterSpacing: 2,
                color: GOLD,
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Admin Portal Security
            </Text>
          </Section>

          <Heading as="h3" style={{ color: NAVY, margin: "0 0 12px 0", fontSize: 16 }}>
            Change Password Verification
          </Heading>

          <Text style={{ color: "#444444", fontSize: 13, lineHeight: "1.6" }}>
            Your one-time password (OTP) to confirm the password change:
          </Text>

          <Section
            style={{
              padding: 20,
              background: "#ffffff",
              border: `2px solid ${GOLD}`,
              margin: "16px 0",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: 36,
                fontFamily: "monospace",
                letterSpacing: 12,
                color: GOLD,
                textAlign: "center",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              {otpCode}
            </Text>
          </Section>

          <Text style={{ color: "#888888", fontSize: 12, textAlign: "center" }}>
            Valid for <strong>10 minutes</strong>. Do not share this with anyone.
          </Text>

          <Hr style={{ borderColor: "#eeeeee", margin: "24px 0 12px" }} />
          <Text style={{ color: "#999999", fontSize: 11 }}>
            If you did not request this, please review your account security immediately.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function renderAdminOTP(data: AdminOTPData): string {
  return renderEmail(<AdminOTPEmail {...data} />);
}
