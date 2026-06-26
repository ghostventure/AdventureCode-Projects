import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword
} from "firebase/auth";
import { getFirebaseClientApp, hasFirebaseClientConfig } from "./firebase-client";
import { getRouteForRole } from "./auth-model";

export function getFirebaseAuth() {
  if (!hasFirebaseClientConfig()) {
    return null;
  }

  return getAuth(getFirebaseClientApp());
}

export function watchAuthState(callback) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback({ user: null, ready: true, configured: false });
    return () => {};
  }

  return onAuthStateChanged(auth, (user) => {
    callback({ user, ready: true, configured: true });
  });
}

export async function signInWithEmail(email, password) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth is not configured.");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function createAccountWithEmail(email, password) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth is not configured.");
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function requestPasswordReset(email) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth is not configured.");
  return sendPasswordResetEmail(auth, email);
}

export async function requestEmailVerification(user) {
  if (!user) throw new Error("A signed-in user is required.");
  return sendEmailVerification(user);
}

export async function changeCurrentPassword(newPassword) {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) throw new Error("A signed-in user is required.");
  return updatePassword(auth.currentUser, newPassword);
}

export async function reauthenticateWithPassword(email, password) {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) throw new Error("A signed-in user is required.");
  const credential = EmailAuthProvider.credential(email, password);
  return reauthenticateWithCredential(auth.currentUser, credential);
}

export async function signOutCurrentUser() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

export function getPostLoginRoute(userRecord) {
  return getRouteForRole(userRecord?.role);
}
