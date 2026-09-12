/**
 * Firebase Configuration and Initialization for WeCare Health
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// User's provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCS0EGMFEQ2Pzzbnn-UvTKLFPjLyCnTjqA",
  authDomain: "wecare-165d7.firebaseapp.com",
  projectId: "wecare-165d7",
  storageBucket: "wecare-165d7.firebasestorage.app",
  messagingSenderId: "405789302147",
  appId: "1:405789302147:web:aa1d9987e70ab9c140aab6",
  measurementId: "G-Q2HJXY96QM"
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore Database
export const db = getFirestore(app);

export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Graceful fallback if analytics is blocked or unsupported
  });
}

/**
 * Diagnostic helper to check if Firestore reads and writes are accepted by security rules
 */
export async function testFirestoreRules(): Promise<{ ok: boolean; message: string; code?: string }> {
  try {
    const testDoc = doc(db, "_connection_test", "ping");
    await setDoc(testDoc, { ping: Date.now(), timestamp: new Date().toISOString() });
    return { ok: true, message: "Firestore connection active & security rules permit writes." };
  } catch (err: any) {
    return {
      ok: false,
      code: err.code,
      message:
        err.code === "permission-denied"
          ? "Cloud Firestore returned PERMISSION_DENIED. Your Firebase Console rules are blocking client writes. Update rules in Firebase Console -> Firestore Database -> Rules to 'allow read, write: if true;' (or if request.auth != null) and click Publish."
          : `Firestore error: ${err.message}`,
    };
  }
}
