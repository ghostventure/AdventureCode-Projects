import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { getUserDatabase, hasFirebaseClientConfig } from "./firebase-client";
import { USER_COLLECTION } from "./user-database";

export async function getUserById(uid) {
  if (!hasFirebaseClientConfig()) return null;

  const snapshot = await getDoc(doc(getUserDatabase(), USER_COLLECTION, uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function getUsersByStatus(status, maxResults = 25) {
  if (!hasFirebaseClientConfig()) return [];

  const usersQuery = query(
    collection(getUserDatabase(), USER_COLLECTION),
    where("status", "==", status),
    orderBy("displayName", "asc"),
    limit(maxResults)
  );
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map((item) => item.data());
}
