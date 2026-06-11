
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


// Strict validation
const missingVars: string[] = [];

if (!firebaseConfig.apiKey)
  missingVars.push("VITE_FIREBASE_API_KEY");

if (!firebaseConfig.authDomain)
  missingVars.push("VITE_FIREBASE_AUTH_DOMAIN");

if (!firebaseConfig.projectId)
  missingVars.push("VITE_FIREBASE_PROJECT_ID");

if (!firebaseConfig.storageBucket)
  missingVars.push("VITE_FIREBASE_STORAGE_BUCKET");

if (!firebaseConfig.messagingSenderId)
  missingVars.push("VITE_FIREBASE_MESSAGING_SENDER_ID");

if (!firebaseConfig.appId)
  missingVars.push("VITE_FIREBASE_APP_ID");

if (missingVars.length > 0) {
  throw new Error(
    `Firebase configuration missing: ${missingVars.join(", ")}`
  );
}

// Initialize Firebase
export const app =
  getApps().length === 0
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

// Check for placeholder profile to notify developer or UI if needed
export const isUsingPlaceholder = false;

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
