export const authAccountFeatures = [
  "Email verification",
  "Password change",
  "MFA/passkey placeholders",
  "Session and device management",
  "Login history",
  "Custom claims sync",
  "Invite acceptance",
  "Onboarding checklist",
  "Recent-login gate",
  "Auth error mapping"
];

export const mfaMethods = [
  { key: "sms", label: "SMS code", status: "placeholder" },
  { key: "totp", label: "Authenticator app", status: "placeholder" },
  { key: "passkey", label: "Passkey", status: "placeholder" }
];

export function mapAuthError(error) {
  const code = typeof error === "string" ? error : error?.code;
  const messages = {
    "auth/invalid-credential": "The email or password was not accepted.",
    "auth/too-many-requests": "Too many attempts. Wait before trying again.",
    "auth/requires-recent-login": "Sign in again before making this change.",
    "auth/email-already-in-use": "An account already exists for this email.",
    "auth/weak-password": "Use a stronger password before continuing."
  };

  return messages[code] || "The account action could not be completed.";
}

export function createLoginHistoryEvent({ uid, method = "password", ip = "unknown", userAgent = "unknown" }) {
  return {
    uid,
    method,
    ip,
    userAgent,
    createdAt: new Date().toISOString()
  };
}

export function createDeviceSession({ uid, deviceName = "Current device", trusted = false }) {
  return {
    uid,
    deviceName,
    trusted,
    status: "active",
    lastSeenAt: new Date().toISOString()
  };
}

export function syncRoleClaims(userRecord) {
  return {
    uid: userRecord.uid,
    claims: {
      role: userRecord.role,
      status: userRecord.status,
      managerScope: userRecord.managerScope || []
    },
    source: "firestore-users"
  };
}

export function createInviteAcceptance({ invitationId, email, displayName }) {
  return {
    invitationId,
    email,
    displayName,
    status: "accepted",
    acceptedAt: new Date().toISOString()
  };
}

export function getOnboardingChecklist(role = "client") {
  const base = ["Verify email", "Complete profile", "Review account settings"];

  if (role === "manager") {
    return [...base, "Confirm manager permissions", "Review audit responsibilities"];
  }

  return [...base, "Add service address", "Confirm communication preference"];
}

export function requiresRecentLogin(action) {
  return ["change-password", "delete-account", "export-data", "change-role", "disable-mfa"].includes(action);
}
