import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, requireFirebaseSetup } from "./config";
import { createUserProfile } from "../userService";

function getAuthInstance() {
  requireFirebaseSetup();
  return auth;
}

export function subscribeToAuthChanges(callback) {
  const authInstance = getAuthInstance();
  return onAuthStateChanged(authInstance, callback);
}

export async function registerWithEmail({ displayName, email, password }) {
  const authInstance = getAuthInstance();
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);

  await updateProfile(userCredential.user, { displayName });
  await createUserProfile(userCredential.user.uid, {
    displayName,
    email: userCredential.user.email ?? email,
  });

  return userCredential;
}

export async function loginWithEmail({ email, password }) {
  const authInstance = getAuthInstance();
  return signInWithEmailAndPassword(authInstance, email, password);
}

export async function logoutUser() {
  const authInstance = getAuthInstance();
  return signOut(authInstance);
}

export function getReadableAuthError(error) {
  const errorMessages = {
    "auth/email-already-in-use": "That email is already being used.",
    "auth/invalid-credential": "The email or password is not correct.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/missing-password": "Please enter your password.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/weak-password": "Password should be at least 6 characters long.",
  };

  return errorMessages[error?.code] ?? error?.message ?? "Something went wrong. Please try again.";
}
