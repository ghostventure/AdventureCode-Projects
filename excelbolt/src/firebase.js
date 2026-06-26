import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { featureFlags } from "./feature-flags.js";

const firebaseConfig = {
  projectId: "excelbolt",
  appId: "1:41167364006:web:874519bab66af4ef1ff967",
  storageBucket: "excelbolt.firebasestorage.app",
  apiKey: "AIzaSyC44y4WXAx4uECx6ksvBjcczdekf2p-Ens",
  authDomain: "excelbolt.firebaseapp.com",
  messagingSenderId: "41167364006",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = (() => {
  try {
    return initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    return getFirestore(app);
  }
})();
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const configureAuthPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.warn("Auth persistence setup failed", error);
  }
};

const appCheckKey = import.meta.env.VITE_APP_CHECK_SITE_KEY;

if (featureFlags.appCheck && appCheckKey) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    console.warn("App Check initialization skipped", error);
  }
}
