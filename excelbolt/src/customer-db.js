import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { normalizeWorkspace, sanitizeProfile } from "./app-state.js";

const buildWorkspaceSummary = (workspace) => ({
  plan: workspace.currentPlan,
  activeTab: workspace.tab,
  connectorCount: workspace.connected.length,
  favoriteCount: workspace.favorites.length,
  recentExportCount: workspace.recentExports.length,
  notifications: workspace.notifications,
  darkMode: workspace.darkMode,
});

const buildSecuritySummary = (profile) => ({
  hasCompany: !!profile.company,
  emailDomain: profile.email.includes("@") ? profile.email.split("@")[1] : "",
});

export const buildCustomerDocument = (profileInput, workspaceInput, timestamps = {}) => {
  const profile = sanitizeProfile(profileInput);
  const workspace = normalizeWorkspace(workspaceInput);
  const now = new Date().toISOString();

  return {
    ...profile,
    workspace,
    workspaceSummary: buildWorkspaceSummary(workspace),
    security: buildSecuritySummary(profile),
    createdAt: timestamps.createdAt || now,
    updatedAt: timestamps.updatedAt || now,
  };
};

export const loadCustomerRecord = async (uid, fallbackProfile = {}) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return {
      profile: sanitizeProfile(fallbackProfile),
      workspace: normalizeWorkspace({}),
      raw: null,
    };
  }

  const data = snap.data();
  return {
    profile: sanitizeProfile(data),
    workspace: normalizeWorkspace(data.workspace),
    raw: data,
  };
};

export const saveCustomerRecord = async (uid, { profile, workspace }, options = {}) => {
  const payload = buildCustomerDocument(profile, workspace, options.timestamps);
  await setDoc(doc(db, "users", uid), payload, { merge: options.merge !== false });
  return payload;
};

export const createCustomerBackup = async (uid, { profile, workspace, reason = "manual" }) => {
  const payload = buildCustomerDocument(profile, workspace);
  await addDoc(collection(db, "users", uid, "backups"), {
    profile: sanitizeProfile(payload),
    workspace: payload.workspace,
    workspaceSummary: payload.workspaceSummary,
    reason,
    createdAt: new Date().toISOString(),
  });
  return payload;
};
