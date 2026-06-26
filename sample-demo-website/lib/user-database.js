export const USER_ROLES = Object.freeze({
  CLIENT: "client",
  MANAGER: "manager"
});

export const USER_STATUSES = Object.freeze({
  ACTIVE: "active",
  INVITED: "invited",
  PAUSED: "paused",
  ARCHIVED: "archived"
});

export const USER_COLLECTION = "users";

export const userFields = Object.freeze({
  uid: "Firebase Auth uid",
  role: "client or manager",
  status: "active, invited, paused, or archived",
  displayName: "Visible full name",
  email: "Primary contact email",
  phone: "Optional contact phone",
  companyName: "Optional organization name",
  propertyAddress: "Client service address",
  servicePlan: "Client home services plan",
  managerScope: "Manager assignment scope",
  managerProfile: "Manager permissions, team, workload, approval, delegation, and access review metadata",
  profileCompletion: "Derived completion state for onboarding",
  avatar: "Profile photo metadata or fallback initials",
  contactPreferences: "Email, SMS, phone, and portal preferences",
  addresses: "Service, billing, mailing, and property addresses",
  alternateContacts: "Emergency or secondary contacts",
  billingProfile: "Payment-safe billing metadata",
  identityStatus: "Email, phone, MFA, and manager verification state",
  tags: "Profile tags and segments",
  customFields: "Future-site profile fields outside the base schema",
  accountGroupId: "Household or company account grouping key",
  retentionPolicy: "Archive and deletion policy metadata",
  notes: "Internal manager notes",
  createdAt: "Server timestamp",
  updatedAt: "Server timestamp"
});

export const sampleUsers = [
  {
    uid: "client-demo-001",
    role: USER_ROLES.CLIENT,
    status: USER_STATUSES.ACTIVE,
    displayName: "Avery Coleman",
    email: "avery@example.com",
    phone: "(555) 012-0148",
    companyName: "",
    propertyAddress: "Residential property",
    servicePlan: "Seasonal garden and lawn care",
    managerScope: "",
    notes: "Interested in spring cleanup and recurring maintenance."
  },
  {
    uid: "client-demo-002",
    role: USER_ROLES.CLIENT,
    status: USER_STATUSES.INVITED,
    displayName: "Marisol Reed",
    email: "marisol@example.com",
    phone: "(555) 012-0192",
    companyName: "Reed Properties",
    propertyAddress: "Rental portfolio",
    servicePlan: "Multi-property maintenance review",
    managerScope: "",
    notes: "Needs an estimate before onboarding."
  },
  {
    uid: "manager-demo-001",
    role: USER_ROLES.MANAGER,
    status: USER_STATUSES.ACTIVE,
    displayName: "Jordan Price",
    email: "jordan@example.com",
    phone: "(555) 012-0177",
    companyName: "Home Services Portal",
    propertyAddress: "",
    servicePlan: "",
    managerScope: "Client intake, estimates, scheduling, and account reviews",
    managerProfile: {
      team: "operations",
      level: "lead",
      maxActive: 25
    },
    notes: "Primary manager account for operational workflows."
  }
];

export function isManager(user) {
  return user?.role === USER_ROLES.MANAGER;
}

export function isClient(user) {
  return user?.role === USER_ROLES.CLIENT;
}

export function getUsersByRole(role, users = sampleUsers) {
  return users.filter((user) => user.role === role);
}

export function getUserCounts(users = sampleUsers) {
  return users.reduce(
    (counts, user) => {
      counts.total += 1;
      counts[user.role] = (counts[user.role] || 0) + 1;
      counts[user.status] = (counts[user.status] || 0) + 1;
      return counts;
    },
    { total: 0, client: 0, manager: 0, active: 0, invited: 0, paused: 0, archived: 0 }
  );
}

export function normalizeUserRecord(user) {
  return {
    uid: String(user.uid || "").trim(),
    role: user.role,
    status: user.status || USER_STATUSES.INVITED,
    displayName: String(user.displayName || "").trim(),
    email: String(user.email || "").trim().toLowerCase(),
    phone: String(user.phone || "").trim(),
    companyName: String(user.companyName || "").trim(),
    propertyAddress: String(user.propertyAddress || "").trim(),
    servicePlan: String(user.servicePlan || "").trim(),
    managerScope: String(user.managerScope || "").trim(),
    managerProfile: user.managerProfile || null,
    notes: String(user.notes || "").trim()
  };
}

export function validateUserRecord(user) {
  const normalized = normalizeUserRecord(user);
  const errors = [];

  if (!normalized.uid) errors.push("uid is required");
  if (!Object.values(USER_ROLES).includes(normalized.role)) errors.push("role is invalid");
  if (!Object.values(USER_STATUSES).includes(normalized.status)) errors.push("status is invalid");
  if (!normalized.displayName) errors.push("displayName is required");
  if (!normalized.email || !normalized.email.includes("@")) errors.push("valid email is required");

  if (normalized.role === USER_ROLES.CLIENT && !normalized.servicePlan) {
    errors.push("servicePlan is required for client users");
  }

  if (normalized.role === USER_ROLES.MANAGER && !normalized.managerScope) {
    errors.push("managerScope is required for manager users");
  }

  return {
    ok: errors.length === 0,
    errors,
    user: normalized
  };
}
