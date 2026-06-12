import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
console.log("DIAGNOSTIC - import.meta.env:", import.meta.env);
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

// Check for placeholder profile to notify developer or UI if needed
export const isUsingPlaceholder = false;

// Dynamic initialization to avoid re-binding errors across HMR refresh
export const app = getApps().length === 0 
  ? initializeApp(firebaseConfig)
  : getApp();



export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Diagnostic Trace Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function getFriendlyFirestoreError(error: any): string {
  if (!error) return "An unknown database error occurred.";
  const code = error.code || "";
  const msg = error.message || "";
  
  switch (code) {
    case "permission-denied":
      return "Permission denied (permission-denied). Please verify your firestore.rules authorize writes for this collection.";
    case "unavailable":
      return "The database service is temporarily unavailable (unavailable). Please check your internet connection or try again later.";
    case "deadline-exceeded":
      return "The operation deadline was exceeded (deadline-exceeded). Please try submitting again.";
    case "unauthenticated":
      return "User is unauthenticated (unauthenticated). Please sign in or check authentication credentials.";
    case "network-request-failed":
      return "Network connection failed (network-request-failed). Please check your internet connection.";
    case "resource-exhausted":
      return "Database quota or storage resource exhausted (resource-exhausted). Please check usage limits.";
    default:
      if (msg.toLowerCase().includes("timeout")) {
        return "Network timeout. Check connection credentials or firestore.rules permission limits.";
      }
      return msg || "An internal error occurred during submission.";
  }
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
