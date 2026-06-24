import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import * as crypto from "crypto";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import { Resend } from "resend";
import Razorpay from "razorpay";
import {
  renderAppReceivedCandidate,
  renderAppReceivedAdmin,
  renderContactInquiryAdmin,
  renderAppUnderReview,
  renderInterviewInvited,
  renderAppDeclined,
  renderPaymentLinkEmail,
  renderPaymentReceiptEmail,
} from "./emailTemplates";

admin.initializeApp();

const CANDIDATE_SENDER = "DealSchool <fellows@dealschool.in>";
const ADMIN_SENDER    = "DealSchool Engine <alerts@dealschool.in>";
const CONTACT_SENDER  = "DealSchool HelpDesk <alerts@dealschool.in>";

// ---------------------------------------------------------------------------
// TRIGGER: onNewApplication
// Fires on new document in applications/{applicationId}.
// Sends candidate confirmation email + admin notification email.
// ---------------------------------------------------------------------------
export const onNewApplication = onDocumentCreated(
  {
    document: "applications/{applicationId}",
    secrets: ["RESEND_API_KEY", "ADMIN_EMAIL"],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    if (!data) return;

    logger.info("Application received", { applicationId: snap.id });

    const emailSent     = data.emailSent     === true;
    const adminNotified = data.adminNotified === true;

    if (emailSent && adminNotified) {
      logger.info("Already processed. Skipping.", { applicationId: snap.id });
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY secret is not configured.");
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@dealschool.in";
    const resend = new Resend(resendApiKey);

    const {
      fullName, mobileNumber, email, linkedinUrl, city, currentStatus,
      collegeName, degree, graduationYear, currentRole, companyName,
      degreeEducationalBackground, yearsOfExperience, startupName,
      industrySector, startupLinkedinProfile, areaOfWork, freelancerLinkedinProfile,
      otherStatusSpecify, primaryReason, primaryReasonOther,
      assessmentQ1, assessmentQ2, assessmentQ3, resumeLink, resumeUrl,
      discoverySource, discoverySourceOther,
    } = data;

    // Derive affiliation display from applicant type
    let affiliationLabel = "Affiliation Detail";
    let affiliationValue = "Core Curriculum";
    if (currentStatus === "Student") {
      affiliationLabel = "College / University";
      affiliationValue = String(collegeName || "Unspecified College");
    } else if (
      currentStatus === "Working Professional" ||
      currentStatus === "Recent Graduate (0–2 years of experience)"
    ) {
      affiliationLabel = "Organization / Company";
      affiliationValue = String(companyName || "Unspecified Company");
    } else if (currentStatus === "Founder") {
      affiliationLabel = "Founded Venture";
      affiliationValue = String(startupName || "Unspecified Startup");
    }

    // 1. Candidate confirmation
    if (!emailSent) {
      try {
        if (!email) throw new Error("Missing candidate email in payload.");

        await resend.emails.send({
          from: CANDIDATE_SENDER,
          to: String(email),
          subject: "Resume Received | DealSchool Fellowship Underwriting",
          html: renderAppReceivedCandidate({
            fullName:        String(fullName || ""),
            currentStatus:   String(currentStatus || ""),
            affiliationLabel,
            affiliationValue,
            primaryReason:
              primaryReason === "Other"
                ? String(primaryReasonOther || "Other Purpose")
                : String(primaryReason || ""),
          }),
        });

        logger.info("Candidate email sent", { applicationId: snap.id, email });
      } catch (err: any) {
        logger.error("Candidate email failed", { error: err.message || err, applicationId: snap.id });
        throw err;
      }
      try {
        await snap.ref.update({ emailSent: true });
      } catch (flagErr: any) {
        logger.warn("Could not set emailSent flag", { error: flagErr.message || flagErr });
      }
    }

    // 2. Admin notification
    if (!adminNotified) {
      try {
        await resend.emails.send({
          from: ADMIN_SENDER,
          to: adminEmail,
          subject: `[Admissions] New Fellowship Application: ${String(fullName || "")}`,
          html: renderAppReceivedAdmin({
            fullName:          String(fullName || ""),
            email:             String(email || ""),
            mobileNumber:      String(mobileNumber || ""),
            city:              String(city || ""),
            linkedinUrl:       String(linkedinUrl || ""),
            currentStatus:     String(currentStatus || ""),
            collegeName,
            degree,
            graduationYear,
            currentRole,
            companyName,
            yearsOfExperience,
            degreeEducationalBackground,
            startupName,
            industrySector,
            startupLinkedinProfile,
            areaOfWork,
            freelancerLinkedinProfile,
            otherStatusSpecify,
            primaryReason:       String(primaryReason || ""),
            primaryReasonOther,
            discoverySource:     String(discoverySource || ""),
            discoverySourceOther,
            resumeUrl:           String(resumeLink || resumeUrl || ""),
            assessmentQ1:        String(assessmentQ1 || ""),
            assessmentQ2:        String(assessmentQ2 || ""),
            assessmentQ3:        String(assessmentQ3 || ""),
          }),
        });

        logger.info("Admin notification sent", { applicationId: snap.id, adminEmail });
      } catch (err: any) {
        logger.error("Admin email failed", { error: err.message || err, applicationId: snap.id });
        throw err;
      }
      try {
        await snap.ref.update({ adminNotified: true });
      } catch (flagErr: any) {
        logger.warn("Could not set adminNotified flag", { error: flagErr.message || flagErr });
      }
    }
  }
);

// ---------------------------------------------------------------------------
// TRIGGER: onApplicationStatusChange
// Fires on every application document update.
// Sends personalised email to the applicant when admin changes status to:
//   under_review      → "Auditing" button
//   interview_invited → "Invite Interview" button
//   declined          → "Decline" button
// "accepted" is handled separately by onApplicationAccepted.
// ---------------------------------------------------------------------------
export const onApplicationStatusChange = onDocumentUpdated(
  {
    document: "applications/{applicationId}",
    secrets: ["RESEND_API_KEY"],
  },
  async (event) => {
    const before = event.data?.before?.data();
    const after  = event.data?.after?.data();
    if (!before || !after) return;

    const prevStatus = before.status;
    const newStatus  = after.status;

    if (prevStatus === newStatus) return;

    const handledStatuses = ["under_review", "interview_invited", "declined"];
    if (!handledStatuses.includes(newStatus)) return;

    // One idempotency flag per status to prevent duplicate sends on retries
    const flagField = `${newStatus}EmailSent`;
    if (after[flagField] === true) {
      logger.info(`${flagField} already set, skipping`, { applicationId: event.params.applicationId });
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) throw new Error("RESEND_API_KEY not configured.");

    const applicantEmail = after.email;
    const fullName       = String(after.fullName || "Applicant");

    if (!applicantEmail) {
      logger.error("onApplicationStatusChange: missing email", { applicationId: event.params.applicationId });
      return;
    }

    const resend = new Resend(resendApiKey);
    let subject = "";
    let html    = "";

    if (newStatus === "under_review") {
      subject = "Your DealSchool Application is Now Under Review";
      html    = renderAppUnderReview({ fullName });
    } else if (newStatus === "interview_invited") {
      subject = "You've Been Invited to Interview — DealSchool Fellowship";
      html    = renderInterviewInvited({ fullName });
    } else {
      subject = "DealSchool Fellowship Application — Update";
      html    = renderAppDeclined({ fullName });
    }

    try {
      await resend.emails.send({
        from:    CANDIDATE_SENDER,
        to:      String(applicantEmail),
        subject,
        html,
      });
      logger.info(`${newStatus} email sent`, {
        applicationId: event.params.applicationId,
        email: applicantEmail,
      });
    } catch (err: any) {
      logger.error(`${newStatus} email failed`, {
        error: err.message || err,
        applicationId: event.params.applicationId,
      });
      throw err;
    }

    try {
      await event.data!.after.ref.update({ [flagField]: true });
    } catch (flagErr: any) {
      logger.warn(`Could not set ${flagField}`, { error: flagErr.message || flagErr });
    }
  }
);

// ---------------------------------------------------------------------------
// RAZORPAY HELPERS
// ---------------------------------------------------------------------------

function getRazorpay(): Razorpay {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

async function isAdminUser(uid: string, email: string, emailVerified: boolean): Promise<boolean> {
  if (!emailVerified) return false;
  if (email === "admin@dealschool.in") return true;
  const snap = await admin.firestore().collection("admins").doc(uid).get();
  return snap.exists;
}

async function createAndSendPaymentLink(applicationId: string): Promise<void> {
  const db     = admin.firestore();
  const appRef = db.collection("applications").doc(applicationId);

  // Optimistic lock — only one execution proceeds
  let alreadyProcessing = false;
  await db.runTransaction(async (t) => {
    const doc = await t.get(appRef);
    const d   = doc.data();
    if (!d || d.paymentStatus) {
      alreadyProcessing = true;
      return;
    }
    t.update(appRef, { paymentStatus: "processing" });
  });

  if (alreadyProcessing) {
    logger.info("Payment link already being processed or exists", { applicationId });
    return;
  }

  const appSnap = await appRef.get();
  const appData = appSnap.data();
  if (!appData) {
    logger.error("Application document not found after lock", { applicationId });
    await appRef.update({ paymentStatus: "error" });
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    await appRef.update({ paymentStatus: "error" });
    throw new Error("RESEND_API_KEY is not configured");
  }

  const feePaise   = parseInt(process.env.FELLOWSHIP_FEE_PAISE || "10000", 10);
  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000/";

  let paymentLink: any;
  try {
    const rzp        = getRazorpay();
    const expiryUnix = Math.floor(Date.now() / 1000) + 900; // 15 minutes

    paymentLink = await rzp.paymentLink.create({
      amount:       feePaise,
      currency:     "INR",
      description:  "DealSchool Fellowship Program Fee",
      reference_id: applicationId,
      expire_by:    expiryUnix,
      customer: {
        name:    String(appData.fullName     || ""),
        email:   String(appData.email        || ""),
        contact: String(appData.mobileNumber || ""),
      },
      notify:          { sms: false, email: false },
      reminder_enable: false,
      callback_url:    appBaseUrl,
      callback_method: "get",
      notes: {
        applicationId,
        source: "dealschool-auto",
      },
    });
  } catch (rzpErr: any) {
    logger.error("Razorpay payment link creation failed", { applicationId, error: rzpErr.message || rzpErr });
    await appRef.update({ paymentStatus: "error" });
    return;
  }

  const linkId:  string = paymentLink.id;
  const linkUrl: string = paymentLink.short_url;
  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date((paymentLink.expire_by as number) * 1000)
  );

  await db.collection("payments").doc(applicationId).set({
    applicationId,
    applicantName:     appData.fullName     || "",
    applicantEmail:    appData.email        || "",
    applicantPhone:    appData.mobileNumber || "",
    amount:            feePaise,
    currency:          "INR",
    rzpPaymentLinkId:  linkId,
    rzpPaymentLinkUrl: linkUrl,
    status:            "link_created",
    expiresAt,
    processedWebhookIds: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await appRef.update({
    paymentStatus:     "link_sent",
    rzpPaymentLinkId:  linkId,
    paymentLinkSentAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt:         admin.firestore.FieldValue.serverTimestamp(),
  });

  const resend     = new Resend(resendApiKey);
  const feeDisplay = `₹${(feePaise / 100).toFixed(0)}`;

  try {
    await resend.emails.send({
      from:    CANDIDATE_SENDER,
      to:      String(appData.email),
      subject: "Your DealSchool Fellowship Offer — Action Required",
      html:    renderPaymentLinkEmail({
        fullName:   String(appData.fullName || ""),
        linkUrl,
        feeDisplay,
      }),
    });
    await db.collection("payments").doc(applicationId).update({
      emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    logger.info("Payment link email sent", { applicationId, email: appData.email });
  } catch (emailErr: any) {
    // Email failure is non-fatal — payment link still exists in Firestore
    logger.error("Payment link email failed", { applicationId, error: emailErr.message || emailErr });
  }
}

async function sendPaymentConfirmationEmail(
  applicantEmail: string,
  applicantName: string,
  rzpPaymentId: string,
  feePaise: number
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  const resend     = new Resend(resendApiKey);
  const feeDisplay = `₹${(feePaise / 100).toFixed(0)}`;

  try {
    await resend.emails.send({
      from:    CANDIDATE_SENDER,
      to:      applicantEmail,
      subject: "Payment Confirmed — Welcome to DealSchool!",
      html:    renderPaymentReceiptEmail({ applicantName, feeDisplay, rzpPaymentId }),
    });
    logger.info("Payment confirmation email sent", { applicantEmail, rzpPaymentId });
  } catch (err: any) {
    logger.error("Payment confirmation email failed", { error: err.message || err });
  }
}

// ---------------------------------------------------------------------------
// TRIGGER: onApplicationAccepted
// Creates Razorpay payment link when admin transitions status to "accepted".
// ---------------------------------------------------------------------------
export const onApplicationAccepted = onDocumentUpdated(
  {
    document: "applications/{applicationId}",
    secrets: ["RESEND_API_KEY", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "FELLOWSHIP_FEE_PAISE", "APP_BASE_URL"],
  },
  async (event) => {
    const before = event.data?.before;
    const after  = event.data?.after;
    if (!before || !after) return;

    const beforeData = before.data();
    const afterData  = after.data();
    if (!beforeData || !afterData) return;

    if (beforeData.status === "accepted" || afterData.status !== "accepted") return;

    if (afterData.paymentStatus) {
      logger.info("onApplicationAccepted: paymentStatus already set, skipping", {
        applicationId: event.params.applicationId,
        paymentStatus: afterData.paymentStatus,
      });
      return;
    }

    logger.info("onApplicationAccepted: creating payment link", { applicationId: event.params.applicationId });

    try {
      await createAndSendPaymentLink(event.params.applicationId);
    } catch (err: any) {
      logger.error("onApplicationAccepted: unhandled error", {
        applicationId: event.params.applicationId,
        error: err.message || err,
      });
    }
  }
);

// ---------------------------------------------------------------------------
// FUNCTION: razorpayWebhook
// Receives payment events from Razorpay.
// Events to enable in Razorpay Dashboard: payment_link.paid | payment_link.expired
// ---------------------------------------------------------------------------
export const razorpayWebhook = onRequest(
  {
    secrets: ["RAZORPAY_WEBHOOK_SECRET", "RESEND_API_KEY", "FELLOWSHIP_FEE_PAISE"],
    cors: false,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const rawBody = (req as any).rawBody as Buffer | undefined;
    if (!rawBody) {
      logger.error("razorpayWebhook: rawBody unavailable");
      res.status(400).send("No body");
      return;
    }

    const incomingSig = req.headers["x-razorpay-signature"] as string | undefined;
    if (!incomingSig) {
      logger.warn("razorpayWebhook: missing signature header");
      res.status(400).send("Missing signature");
      return;
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSig   = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    let sigValid = false;
    try {
      const expectedBuf = Buffer.from(expectedSig, "hex");
      const incomingBuf = Buffer.from(incomingSig, "hex");
      sigValid =
        expectedBuf.length === incomingBuf.length &&
        crypto.timingSafeEqual(expectedBuf, incomingBuf);
    } catch {
      sigValid = false;
    }

    if (!sigValid) {
      logger.warn("razorpayWebhook: signature verification failed");
      res.status(400).send("Invalid signature");
      return;
    }

    const event         = req.body as any;
    const eventType:      string = event.event || "";
    const webhookEventId: string = event.id    || "";

    logger.info("razorpayWebhook: received event", { eventType, webhookEventId });

    if (eventType === "payment_link.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const linkEntity    = event.payload?.payment_link?.entity;

      if (!paymentEntity || !linkEntity) {
        logger.error("razorpayWebhook: malformed payload", { eventType });
        res.status(200).send("OK");
        return;
      }

      const rzpPaymentId:     string = paymentEntity.id;
      const rzpPaymentLinkId: string = linkEntity.id;
      const applicationId:    string = linkEntity.notes?.applicationId || linkEntity.reference_id || "";
      const paidAmountPaise:  number = paymentEntity.amount;

      if (!applicationId) {
        logger.error("razorpayWebhook: applicationId missing in notes", { rzpPaymentLinkId });
        res.status(200).send("OK");
        return;
      }

      const db         = admin.firestore();
      const paymentRef = db.collection("payments").doc(applicationId);
      const appRef     = db.collection("applications").doc(applicationId);

      const paymentSnap = await paymentRef.get();
      if (paymentSnap.exists) {
        const existing = paymentSnap.data()!;
        if ((existing.processedWebhookIds as string[]).includes(webhookEventId)) {
          logger.info("razorpayWebhook: duplicate event, skipping", { webhookEventId });
          res.status(200).send("OK");
          return;
        }
        if (existing.status === "paid") {
          logger.info("razorpayWebhook: already paid, skipping", { applicationId });
          res.status(200).send("OK");
          return;
        }
      }

      // Cross-verify with Razorpay API before marking paid
      try {
        const rzp         = getRazorpay();
        const linkDetails = await rzp.paymentLink.fetch(rzpPaymentLinkId);
        const feePaise    = parseInt(process.env.FELLOWSHIP_FEE_PAISE || "10000", 10);

        if (linkDetails.status !== "paid" || (linkDetails.amount as number) !== feePaise) {
          logger.warn("razorpayWebhook: API verification failed", {
            apiStatus:      linkDetails.status,
            apiAmount:      linkDetails.amount,
            expectedAmount: feePaise,
            webhookAmount:  paidAmountPaise,
          });
          res.status(200).send("OK");
          return;
        }
      } catch (verifyErr: any) {
        logger.error("razorpayWebhook: Razorpay API verification threw", { error: verifyErr.message || verifyErr });
        res.status(200).send("OK");
        return;
      }

      await db.runTransaction(async (t) => {
        t.set(
          paymentRef,
          {
            rzpPaymentId,
            status:    "paid",
            paidAt:    admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            processedWebhookIds: admin.firestore.FieldValue.arrayUnion(webhookEventId),
          },
          { merge: true }
        );
        t.set(
          appRef,
          {
            paymentStatus: "paid",
            rzpPaymentId,
            paidAt:    admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      });

      logger.info("razorpayWebhook: payment marked as paid", { applicationId, rzpPaymentId });

      const appSnap = await appRef.get();
      const appData = appSnap.data();
      if (appData?.email) {
        const feePaise = parseInt(process.env.FELLOWSHIP_FEE_PAISE || "10000", 10);
        await sendPaymentConfirmationEmail(
          String(appData.email),
          String(appData.fullName || "Fellow"),
          rzpPaymentId,
          feePaise
        );
      }

    } else if (eventType === "payment_link.expired") {
      const linkEntity = event.payload?.payment_link?.entity;
      if (!linkEntity) {
        res.status(200).send("OK");
        return;
      }

      const applicationId: string =
        linkEntity.notes?.applicationId || linkEntity.reference_id || "";
      if (!applicationId) {
        res.status(200).send("OK");
        return;
      }

      const db = admin.firestore();
      await db.collection("payments").doc(applicationId).set(
        { status: "expired", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      await db.collection("applications").doc(applicationId).set(
        { paymentStatus: "expired", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      logger.info("razorpayWebhook: payment link expired", { applicationId });
    }

    res.status(200).send("OK");
  }
);

// ---------------------------------------------------------------------------
// FUNCTION: resendPaymentLink
// Admin-callable to regenerate a payment link for expired/errored applications.
// ---------------------------------------------------------------------------
export const resendPaymentLink = onCall(
  {
    secrets: ["RESEND_API_KEY", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "FELLOWSHIP_FEE_PAISE", "APP_BASE_URL"],
  },
  async (request) => {
    if (!request.auth || !request.auth.token.email_verified) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const authorized = await isAdminUser(
      request.auth.uid,
      request.auth.token.email || "",
      request.auth.token.email_verified
    );
    if (!authorized) {
      throw new HttpsError("permission-denied", "Admin access required.");
    }

    const { applicationId } = request.data as { applicationId?: string };
    if (!applicationId || typeof applicationId !== "string") {
      throw new HttpsError("invalid-argument", "applicationId is required.");
    }

    const db      = admin.firestore();
    const appSnap = await db.collection("applications").doc(applicationId).get();
    if (!appSnap.exists) {
      throw new HttpsError("not-found", "Application not found.");
    }

    const appData = appSnap.data()!;
    if (appData.status !== "accepted") {
      throw new HttpsError("failed-precondition", "Application must be in accepted status.");
    }

    const allowedPaymentStatuses = ["expired", "error", "failed", "link_sent"];
    if (appData.paymentStatus && !allowedPaymentStatuses.includes(appData.paymentStatus)) {
      throw new HttpsError(
        "failed-precondition",
        `Cannot resend — current payment status: ${appData.paymentStatus}`
      );
    }

    await db.collection("applications").doc(applicationId).update({ paymentStatus: null });

    try {
      await createAndSendPaymentLink(applicationId);
    } catch (err: any) {
      throw new HttpsError("internal", `Failed to create payment link: ${err.message}`);
    }

    return { success: true };
  }
);

// ---------------------------------------------------------------------------
// TRIGGER: onNewContactMessage
// Fires on new document in contacts/{contactId}.
// Sends admin notification email for contact form submissions.
// ---------------------------------------------------------------------------
export const onNewContactMessage = onDocumentCreated(
  {
    document: "contacts/{contactId}",
    secrets: ["RESEND_API_KEY", "ADMIN_EMAIL"],
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    if (!data) return;

    logger.info("Contact inquiry received", { contactId: snap.id });

    if (data.adminNotified === true) {
      logger.info("Already processed. Skipping.", { contactId: snap.id });
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY secret is not configured.");
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@dealschool.in";
    const resend     = new Resend(resendApiKey);
    const { name, email, subject, message } = data;

    try {
      await resend.emails.send({
        from:    CONTACT_SENDER,
        to:      adminEmail,
        subject: `[Inquiry Ticket] From ${String(name || "")}: ${String(subject || "")}`,
        html:    renderContactInquiryAdmin({
          name:    String(name    || ""),
          email:   String(email   || ""),
          subject: String(subject || ""),
          message: String(message || ""),
        }),
      });
      logger.info("Admin notification sent", { contactId: snap.id, adminEmail });
    } catch (err: any) {
      logger.error("Contact email failed", { error: err.message || err, contactId: snap.id });
      throw err;
    }

    try {
      await snap.ref.update({ adminNotified: true });
    } catch (flagErr: any) {
      logger.warn("Could not set adminNotified flag", { error: flagErr.message || flagErr });
    }
  }
);
