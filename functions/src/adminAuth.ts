import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as bcrypt from "bcryptjs";
import * as nodemailer from "nodemailer";
import * as crypto from "crypto";
import { renderAdminPasswordReset, renderAdminOTP } from "./emailTemplates";

const ADMIN_EMAIL = "admin@dealschool.in";
const ADMIN_UID = "admin-dealschool";
const BCRYPT_ROUNDS = 12;

function getMailTransporter() {
  const smtpPassword = process.env.ADMIN_SMTP_PASSWORD;
  if (!smtpPassword) {
    throw new HttpsError("internal", "SMTP credentials not configured. Set ADMIN_SMTP_PASSWORD secret.");
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: ADMIN_EMAIL,
      pass: smtpPassword,
    },
  });
}

async function ensureFirebaseAuthUser(): Promise<void> {
  try {
    await admin.auth().updateUser(ADMIN_UID, {
      email: ADMIN_EMAIL,
      emailVerified: true,
      displayName: "Admin",
    });
  } catch (e: any) {
    if (e.code === "auth/user-not-found") {
      await admin.auth().createUser({
        uid: ADMIN_UID,
        email: ADMIN_EMAIL,
        emailVerified: true,
        displayName: "Admin",
      });
    } else {
      throw e;
    }
  }
}

async function ensureAdminCredentials(): Promise<void> {
  const db = admin.firestore();
  const credRef = db.collection("adminCredentials").doc(ADMIN_EMAIL);
  const snap = await credRef.get();
  if (!snap.exists) {
    const hash = await bcrypt.hash("Satraplaza@2026", BCRYPT_ROUNDS);
    await credRef.set({
      email: ADMIN_EMAIL,
      passwordHash: hash,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    logger.info("Admin credentials seeded with default password.");
  }
}

// Cloud Function 1: Email + Password login → returns a Firebase Custom Token
export const adminEmailLogin = onCall({ cors: true }, async (request) => {
  const { email, password } = request.data as { email?: string; password?: string };

  if (!email || !password) {
    throw new HttpsError("invalid-argument", "Email and password are required.");
  }
  if (email !== ADMIN_EMAIL) {
    throw new HttpsError("permission-denied", "Unauthorized email address.");
  }

  await ensureAdminCredentials();
  await ensureFirebaseAuthUser();

  const db = admin.firestore();
  const credSnap = await db.collection("adminCredentials").doc(ADMIN_EMAIL).get();
  if (!credSnap.exists) {
    throw new HttpsError("internal", "Admin credentials record missing.");
  }

  const { passwordHash } = credSnap.data() as { passwordHash: string };
  const isValid = await bcrypt.compare(password, passwordHash);
  if (!isValid) {
    logger.warn("Admin login failed: invalid password attempt.");
    throw new HttpsError("unauthenticated", "Invalid email or password.");
  }

  const customToken = await admin.auth().createCustomToken(ADMIN_UID, {
    role: "admin",
    adminEmail: ADMIN_EMAIL,
  });

  logger.info("Admin email login successful.");
  return { customToken };
});

// Cloud Function 2: Send password reset link to admin email
export const adminForgotPassword = onCall(
  { cors: true },
  async (request) => {
    const { email } = request.data as { email?: string };

    if (email !== ADMIN_EMAIL) {
      throw new HttpsError("permission-denied", "Unauthorized email address.");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const db = admin.firestore();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.collection("adminPasswordResetTokens").doc(token).set({
      email: ADMIN_EMAIL,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const appUrl = process.env.APP_URL || "https://dealschool.in";
    const resetLink = `${appUrl}/admin?resetToken=${token}`;

    const transporter = getMailTransporter();
    await transporter.sendMail({
      from:    `"DealSchool Admin" <${ADMIN_EMAIL}>`,
      to:      ADMIN_EMAIL,
      subject: "DealSchool Admin Portal — Password Reset Link",
      html:    renderAdminPasswordReset({ resetLink }),
    });

    logger.info("Admin password reset email sent.");
    return { success: true };
  }
);

// Cloud Function 3: Consume reset token and save new bcrypt-hashed password
export const adminResetPassword = onCall({ cors: true }, async (request) => {
  const { token, newPassword } = request.data as { token?: string; newPassword?: string };

  if (!token || !newPassword) {
    throw new HttpsError("invalid-argument", "Reset token and new password are required.");
  }
  if (newPassword.length < 8) {
    throw new HttpsError("invalid-argument", "Password must be at least 8 characters.");
  }

  const db = admin.firestore();
  const tokenSnap = await db.collection("adminPasswordResetTokens").doc(token).get();
  if (!tokenSnap.exists) {
    throw new HttpsError("not-found", "Reset link not found or already used.");
  }

  const tokenData = tokenSnap.data() as { expiresAt: admin.firestore.Timestamp };
  if (new Date() > tokenData.expiresAt.toDate()) {
    await db.collection("adminPasswordResetTokens").doc(token).delete();
    throw new HttpsError("deadline-exceeded", "Reset link has expired. Please request a new one.");
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await db.collection("adminCredentials").doc(ADMIN_EMAIL).update({
    passwordHash: newHash,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection("adminPasswordResetTokens").doc(token).delete();

  logger.info("Admin password reset successfully via token.");
  return { success: true };
});

// Cloud Function 4: Change password — step "verify" checks current pwd and sends OTP,
//                                      step "confirm" validates OTP and saves new password
export const adminChangePassword = onCall(
  { cors: true },
  async (request) => {
    const { step, currentPassword, newPassword, otp } = request.data as {
      step?: string;
      currentPassword?: string;
      newPassword?: string;
      otp?: string;
    };

    const db = admin.firestore();

    if (step === "verify") {
      if (!currentPassword) {
        throw new HttpsError("invalid-argument", "Current password is required.");
      }

      const credSnap = await db.collection("adminCredentials").doc(ADMIN_EMAIL).get();
      if (!credSnap.exists) {
        throw new HttpsError("not-found", "Admin credentials not found.");
      }

      const isValid = await bcrypt.compare(
        currentPassword,
        (credSnap.data() as { passwordHash: string }).passwordHash
      );
      if (!isValid) {
        throw new HttpsError("unauthenticated", "Current password is incorrect.");
      }

      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      const otpHash = await bcrypt.hash(otpCode, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await db.collection("adminChangePasswordOTPs").doc(ADMIN_EMAIL).set({
        otpHash,
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const transporter = getMailTransporter();
      await transporter.sendMail({
        from:    `"DealSchool Admin" <${ADMIN_EMAIL}>`,
        to:      ADMIN_EMAIL,
        subject: "DealSchool Admin Portal — Change Password OTP",
        html:    renderAdminOTP({ otpCode }),
      });

      logger.info("Change password OTP sent.");
      return { success: true, message: "OTP sent to admin@dealschool.in" };
    }

    if (step === "confirm") {
      if (!otp || !newPassword) {
        throw new HttpsError("invalid-argument", "OTP and new password are required.");
      }
      if (newPassword.length < 8) {
        throw new HttpsError("invalid-argument", "Password must be at least 8 characters.");
      }

      const otpSnap = await db.collection("adminChangePasswordOTPs").doc(ADMIN_EMAIL).get();
      if (!otpSnap.exists) {
        throw new HttpsError("not-found", "No pending OTP found. Please start the process again.");
      }

      const otpData = otpSnap.data() as { otpHash: string; expiresAt: admin.firestore.Timestamp };
      if (new Date() > otpData.expiresAt.toDate()) {
        await db.collection("adminChangePasswordOTPs").doc(ADMIN_EMAIL).delete();
        throw new HttpsError("deadline-exceeded", "OTP has expired. Please start the process again.");
      }

      const isOtpValid = await bcrypt.compare(otp, otpData.otpHash);
      if (!isOtpValid) {
        throw new HttpsError("unauthenticated", "Invalid OTP. Please try again.");
      }

      const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
      await db.collection("adminCredentials").doc(ADMIN_EMAIL).update({
        passwordHash: newHash,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await db.collection("adminChangePasswordOTPs").doc(ADMIN_EMAIL).delete();

      logger.info("Admin password changed successfully.");
      return { success: true };
    }

    throw new HttpsError("invalid-argument", "Invalid step. Must be 'verify' or 'confirm'.");
  }
);
