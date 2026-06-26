import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  signInWithEmailAndPassword, sendPasswordResetEmail,
  updatePassword, reauthenticateWithCredential, reauthenticateWithPopup, EmailAuthProvider,
} from "firebase/auth";
// Define required environment variables list
const requiredVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID"
];

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check for missing variables
const missingVars = requiredVars.filter(varName => {
  const val = import.meta.env[varName];
  return !val || val === "" || val.includes("placeholder");
});



// Check if credentials are properly provided - fail fast
const isValidConfig = missingVars.length === 0;

if (!isValidConfig) {
  const errorMsg = "CRITICAL FIREBASE ERROR: Firebase configuration is missing or invalid! " +
    "Verify that the necessary VITE_FIREBASE_* keys are declared in your .env file or environment parameters. " +
    `Missing/Invalid variables: ${missingVars.join(", ")}`;
  console.error(errorMsg);
  if (typeof window !== "undefined") {
    alert?.(errorMsg);
  }
  throw new Error(errorMsg);
}

// Dynamic initialization to avoid re-binding errors across HMR refresh
export const app = getApps().length === 0 
  ? initializeApp(firebaseConfig)
  : getApp();



export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Maps Firebase Auth error codes to human-readable messages.
export function getFriendlyAuthError(err: any): string {
  const code = String(err?.code || "");
  switch (code) {
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/requires-recent-login":
      return "Please re-enter your current password to continue.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    default:
      return err?.message || "An unexpected error occurred. Please try again.";
  }
}

// Email + password login via Firebase Auth directly (no Cloud Functions needed).
export async function signInAdminWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

// ── Password-reset rate limit ────────────────────────────────────────────────
// One request per 15 minutes, enforced at the API call layer (localStorage)
// so the Firebase endpoint is never hit even if the UI is bypassed.
const RESET_RL_KEY = "ds_pwd_reset_ts";
const RESET_RL_MS  = 15 * 60 * 1000; // 15 minutes in ms

/** Returns remaining cooldown in milliseconds (0 = no cooldown). */
export function getPasswordResetCooldownMs(): number {
  const ts = localStorage.getItem(RESET_RL_KEY);
  if (!ts) return 0;
  const elapsed = Date.now() - parseInt(ts, 10);
  return Math.max(0, RESET_RL_MS - elapsed);
}

/** Sends a Firebase Auth password reset email, guarded by a 15-min rate limit. */
export async function callAdminForgotPassword(email: string): Promise<void> {
  const cooldown = getPasswordResetCooldownMs();
  if (cooldown > 0) {
    const mins = Math.ceil(cooldown / 60_000);
    throw new Error(
      `Rate limited — please wait ${mins} minute${mins !== 1 ? "s" : ""} before requesting another reset link.`
    );
  }
  await sendPasswordResetEmail(auth, email);
  localStorage.setItem(RESET_RL_KEY, Date.now().toString());
}

// Returns true if the current user signed in with Google (no email/password provider).
export function isGoogleOnlyUser(): boolean {
  const user = auth.currentUser;
  if (!user) return false;
  return !user.providerData.some((p) => p.providerId === "password");
}

// Re-authenticates via Google popup then sets the new password.
export async function adminReauthGoogleAndChangePassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated.");
  await reauthenticateWithPopup(user, googleProvider);
  await updatePassword(user, newPassword);
}

// Re-authenticates with current email/password then sets the new password.
export async function adminReauthAndChangePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user?.email) throw new Error("Not authenticated.");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

// Google login utility matching DealSchool admin specs
export async function signInAdminWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Auth helper login exception: ", error);
    throw error;
  }
}

// Sign out utility
export async function logOutAdmin() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Auth helper logout exception: ", error);
    throw error;
  }
}
