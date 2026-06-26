import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { getUserDatabase } from "../../lib/firebase-client";

const COLLECTION_NAME = "collectionName";

export async function listRecords() {
  const snapshot = await getDocs(collection(getUserDatabase(), COLLECTION_NAME));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getRecord(id) {
  const snapshot = await getDoc(doc(getUserDatabase(), COLLECTION_NAME, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function createRecord(values) {
  return addDoc(collection(getUserDatabase(), COLLECTION_NAME), {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateRecord(id, values) {
  return updateDoc(doc(getUserDatabase(), COLLECTION_NAME, id), {
    ...values,
    updatedAt: serverTimestamp()
  });
}
