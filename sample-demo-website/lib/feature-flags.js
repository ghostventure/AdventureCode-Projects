export const defaultFeatureFlags = Object.freeze({
  clientPortal: true,
  managerPortal: true,
  fileUploads: true,
  analytics: false,
  maintenanceMode: false,
  publicLeadForms: true,
  roleInvites: true
});

export function resolveFeatureFlags(overrides = {}) {
  return {
    ...defaultFeatureFlags,
    ...overrides,
    maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" || Boolean(overrides.maintenanceMode),
    analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" || Boolean(overrides.analytics)
  };
}

export function isFeatureEnabled(flag, overrides = {}) {
  return Boolean(resolveFeatureFlags(overrides)[flag]);
}
