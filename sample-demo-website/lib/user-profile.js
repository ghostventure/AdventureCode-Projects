export const profileRequiredFields = ["displayName", "email", "phone", "propertyAddress", "servicePlan"];

export const communicationPreferenceTypes = ["transactional", "operations", "marketing"];

export const profileTags = ["lead", "active-client", "paused", "vip", "commercial", "residential", "internal-review"];

export const profileFieldPermissions = Object.freeze({
  displayName: { clientEditable: true, managerEditable: true },
  email: { clientEditable: false, managerEditable: true },
  phone: { clientEditable: true, managerEditable: true },
  propertyAddress: { clientEditable: true, managerEditable: true },
  servicePlan: { clientEditable: false, managerEditable: true },
  managerScope: { clientEditable: false, managerEditable: true },
  tags: { clientEditable: false, managerEditable: true },
  notes: { clientEditable: false, managerEditable: true }
});

export function calculateProfileCompletion(profile, requiredFields = profileRequiredFields) {
  const completed = requiredFields.filter((field) => Boolean(String(profile[field] || "").trim()));

  return {
    completed: completed.length,
    total: requiredFields.length,
    percent: Math.round((completed.length / requiredFields.length) * 100),
    missing: requiredFields.filter((field) => !completed.includes(field))
  };
}

export function createAvatarProfile({ userId, photoUrl = "", displayName = "" }) {
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return {
    userId,
    photoUrl,
    initials: initials || "U",
    status: photoUrl ? "uploaded" : "fallback",
    updatedAt: new Date().toISOString()
  };
}

export function createContactPreferences({ userId, email = true, sms = false, phone = false, portal = true } = {}) {
  return {
    userId,
    channels: { email, sms, phone, portal },
    categories: communicationPreferenceTypes.reduce((preferences, category) => {
      preferences[category] = category !== "marketing";
      return preferences;
    }, {}),
    updatedAt: new Date().toISOString()
  };
}

export function createAddressBook({ userId, addresses = [] }) {
  return {
    userId,
    addresses,
    updatedAt: new Date().toISOString()
  };
}

export function createAlternateContact({ userId, name, relationship = "alternate", phone = "", email = "" }) {
  return {
    userId,
    name,
    relationship,
    phone,
    email,
    status: "active",
    createdAt: new Date().toISOString()
  };
}

export function createBillingProfile({ userId, billingName, billingEmail }) {
  return {
    userId,
    billingName,
    billingEmail,
    paymentProviderCustomerId: "",
    savedPaymentMethods: [],
    status: "metadata-only",
    updatedAt: new Date().toISOString()
  };
}

export function createIdentityStatus({ userId, emailVerified = false, phoneVerified = false, mfaEnabled = false, managerApproved = false }) {
  return {
    userId,
    emailVerified,
    phoneVerified,
    mfaEnabled,
    managerApproved,
    updatedAt: new Date().toISOString()
  };
}

export function createProfileActivity({ userId, action, actorId = userId, detail = "" }) {
  return {
    userId,
    action,
    actorId,
    detail,
    createdAt: new Date().toISOString()
  };
}

export function createPrivacyControlState({ userId, consentVersion = "2026-05-23" }) {
  return {
    userId,
    canExportData: true,
    canRequestDeletion: true,
    consentVersion,
    updatedAt: new Date().toISOString()
  };
}

export function createProfileAttachment({ userId, name, type = "document", storagePath = "" }) {
  return {
    userId,
    name,
    type,
    storagePath,
    status: "pending-review",
    uploadedAt: new Date().toISOString()
  };
}

export function createManagerAssignment({ userId, managerId, reason = "primary account owner" }) {
  return {
    userId,
    managerId,
    reason,
    status: "active",
    assignedAt: new Date().toISOString()
  };
}

export function createDuplicateProfileSignal({ sourceUserId, possibleDuplicateUserId, confidence = 0.5 }) {
  return {
    sourceUserId,
    possibleDuplicateUserId,
    confidence,
    status: "review",
    createdAt: new Date().toISOString()
  };
}

export function createDelegatedAccess({ accountId, delegateUserId, role = "viewer" }) {
  return {
    accountId,
    delegateUserId,
    role,
    status: "active",
    createdAt: new Date().toISOString()
  };
}

export function createProfileVersion({ userId, snapshot, changedBy = userId, changeReason = "profile update" }) {
  return {
    userId,
    snapshot,
    changedBy,
    changeReason,
    versionedAt: new Date().toISOString()
  };
}

export function canEditProfileField({ field, actorRole = "client", isOwner = false }) {
  const permission = profileFieldPermissions[field];
  if (!permission) return false;
  if (actorRole === "manager") return permission.managerEditable;
  return isOwner && permission.clientEditable;
}

export function createProfileReviewItem({ userId, field, proposedValue, submittedBy = userId }) {
  return {
    userId,
    field,
    proposedValue,
    submittedBy,
    status: "pending-review",
    submittedAt: new Date().toISOString()
  };
}

export function createCustomFieldDefinition({ key, label, type = "text", required = false, managerOnly = false }) {
  return {
    key,
    label,
    type,
    required,
    managerOnly,
    status: "active",
    createdAt: new Date().toISOString()
  };
}

export function createAccountGroup({ groupId, name, type = "household", memberIds = [] }) {
  return {
    groupId,
    name,
    type,
    memberIds,
    status: "active",
    createdAt: new Date().toISOString()
  };
}

export function createRetentionPolicy({ profileType = "client", archiveAfterDays = 1095, deleteAfterDays = 2555 }) {
  return {
    profileType,
    archiveAfterDays,
    deleteAfterDays,
    action: "archive-then-delete",
    updatedAt: new Date().toISOString()
  };
}

export function mapImportedProfile(row = {}) {
  return {
    displayName: String(row.displayName || row.name || "").trim(),
    email: String(row.email || "").trim().toLowerCase(),
    phone: String(row.phone || "").trim(),
    propertyAddress: String(row.propertyAddress || row.address || "").trim(),
    servicePlan: String(row.servicePlan || row.plan || "").trim(),
    tags: String(row.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  };
}
