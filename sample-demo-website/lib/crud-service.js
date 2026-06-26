import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where
} from "firebase/firestore";
import { getUserDatabase, hasFirebaseClientConfig } from "./firebase-client";

export function createCrudService(collectionName) {
  function assertReady() {
    if (!hasFirebaseClientConfig()) {
      throw new Error("Firestore is not configured.");
    }
  }

  return {
    async list({ pageSize = 25, cursor = null, filters = [], sort = ["createdAt", "desc"] } = {}) {
      assertReady();
      const constraints = [
        ...filters.map((filter) => where(filter.field, filter.operator, filter.value)),
        orderBy(sort[0], sort[1]),
        limit(pageSize)
      ];

      if (cursor) constraints.push(startAfter(cursor));

      const snapshot = await getDocs(query(collection(getUserDatabase(), collectionName), ...constraints));
      return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    },

    async get(id) {
      assertReady();
      const snapshot = await getDoc(doc(getUserDatabase(), collectionName, id));
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
    },

    async create(values) {
      assertReady();
      return addDoc(collection(getUserDatabase(), collectionName), {
        ...values,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    },

    async update(id, values) {
      assertReady();
      return updateDoc(doc(getUserDatabase(), collectionName, id), {
        ...values,
        updatedAt: serverTimestamp()
      });
    },

    async archive(id) {
      assertReady();
      return updateDoc(doc(getUserDatabase(), collectionName, id), {
        status: "archived",
        updatedAt: serverTimestamp()
      });
    },

    async remove(id) {
      assertReady();
      return deleteDoc(doc(getUserDatabase(), collectionName, id));
    }
  };
}
