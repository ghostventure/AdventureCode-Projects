import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const VALID_ROLES = new Set(["musician", "host"]);

function cleanString(value, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function normalizeRole(role, fallback = "musician") {
  return VALID_ROLES.has(role) ? role : fallback;
}

export function buildOneId(uid) {
  const cleanUid = cleanString(uid, 128).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleanUid ? `CLTCH-${cleanUid.slice(0, 10)}` : "";
}

export function buildUserSummary(uid, data = {}) {
  const role = normalizeRole(data.role, "musician");
  const displayName = cleanString(data.displayName, 80);
  const city = cleanString(data.city, 80);
  const state = cleanString(data.state, 40);
  const status = cleanString(data.status, 24) || "active";
  const profileRoute = role === "host" ? "host-profile.html" : "musician-profile.html";
  const dashboardRoute = role === "host" ? "host.html" : "musician-matched-gigs.html";

  return {
    uid: cleanString(uid, 128),
    oneId: cleanString(data.oneId, 32) || buildOneId(uid),
    role,
    email: cleanString(data.email, 160).toLowerCase(),
    displayName,
    city,
    state,
    status,
    profileComplete: !!data.profileComplete,
    payoutReady: !!data.payoutReady,
    authProvider: cleanString(data.authProvider, 40),
    profileRoute,
    dashboardRoute,
    ...(data.authLastSignInAt ? { authLastSignInAt: data.authLastSignInAt } : {}),
    ...(data.authLastSignOutAt ? { authLastSignOutAt: data.authLastSignOutAt } : {}),
    ...(data.authLastPasswordResetAt ? { authLastPasswordResetAt: data.authLastPasswordResetAt } : {}),
    updatedAt: serverTimestamp(),
    ...(data.createdAt ? { createdAt: data.createdAt } : {})
  };
}

export async function readUserSummary(db, uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function writeUserSummary(db, uid, data, merge = true) {
  const payload = buildUserSummary(uid, data);
  await setDoc(doc(db, "users", uid), payload, { merge });
  return payload;
}

export async function ensureRoleRecord(db, uid, role) {
  const safeRole = normalizeRole(role, "musician");
  await setDoc(doc(db, "userRoles", uid), { role: safeRole, updatedAt: serverTimestamp() }, { merge: true });
  return safeRole;
}

export async function persistActiveRole(db, uid, role, data = {}) {
  const safeRole = await ensureRoleRecord(db, uid, role);
  await writeUserSummary(db, uid, { ...data, role: safeRole }, true);
  return safeRole;
}

export async function recordAuthEvent(db, user, type, data = {}) {
  if (!user?.uid) return;
  const providerId = user.providerData?.[0]?.providerId || "";
  const payload = {
    email: user.email || "",
    authProvider: providerId,
    ...data
  };
  if (type === "sign_in") payload.authLastSignInAt = serverTimestamp();
  if (type === "sign_out") payload.authLastSignOutAt = serverTimestamp();
  if (type === "password_reset") payload.authLastPasswordResetAt = serverTimestamp();
  await writeUserSummary(db, user.uid, payload, true);
}
