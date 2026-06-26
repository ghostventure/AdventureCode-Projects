import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirebaseClientApp, hasFirebaseClientConfig } from "./firebase-client";

export function getFirebaseStorage() {
  if (!hasFirebaseClientConfig()) {
    return null;
  }

  return getStorage(getFirebaseClientApp());
}

export async function uploadTemplateFile(path, file) {
  const storage = getFirebaseStorage();
  if (!storage) throw new Error("Firebase Storage is not configured.");

  const fileRef = ref(storage, path);
  const snapshot = await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    path: snapshot.ref.fullPath,
    downloadUrl
  };
}
