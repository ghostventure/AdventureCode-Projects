import { getAuth, signOut } from "firebase/auth";
import { getFirebaseClientApp } from "../../lib/firebase-client";

export async function signOutFirebaseUser() {
  const auth = getAuth(getFirebaseClientApp());
  await signOut(auth);
}
