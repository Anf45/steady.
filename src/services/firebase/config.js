import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

function getMissingEnvVars() {
  return requiredEnvVars.filter((key) => !import.meta.env[key]);
}

function createFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

export function isFirebaseConfigured() {
  return getMissingEnvVars().length === 0;
}

export function getFirebaseConfigError() {
  const missingEnvVars = getMissingEnvVars();

  if (missingEnvVars.length === 0) {
    return null;
  }

  return `Firebase is not set up yet. Missing environment variables: ${missingEnvVars.join(", ")}.`;
}

export function requireFirebaseSetup() {
  const configError = getFirebaseConfigError();

  if (configError) {
    throw new Error(configError);
  }
}

export const firebaseConfig = isFirebaseConfigured() ? createFirebaseConfig() : null;
export const firebaseApp = firebaseConfig ? initializeApp(firebaseConfig) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
