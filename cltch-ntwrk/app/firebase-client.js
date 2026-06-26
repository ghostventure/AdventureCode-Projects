import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { browserLocalPersistence, getAuth, setPersistence } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBHq80odiaKiw3ZtIwpFOeQbRPigWAukdE",
  authDomain: "cltch-ntwrk-social.firebaseapp.com",
  projectId: "cltch-ntwrk-social",
  databaseURL: "https://cltch-ntwrk-social-default-rtdb.firebaseio.com",
  storageBucket: "cltch-ntwrk-social.firebasestorage.app",
  messagingSenderId: "566614252202",
  appId: "1:566614252202:web:88a72b40379c0f7716ced3",
  measurementId: "G-MXED1B5BQX"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (err) {
  console.warn("Firestore persistent cache unavailable, falling back to default cache.", err);
  firestoreInstance = initializeFirestore(app, {
    ignoreUndefinedProperties: true
  });
}

export const db = firestoreInstance;

setPersistence(auth, browserLocalPersistence).catch(() => {
  // Non-fatal on browsers that restrict persistent storage.
});
