import { isFeatureEnabled } from "./feature-flags";

export function getMaintenanceState(overrides = {}) {
  const enabled = isFeatureEnabled("maintenanceMode", overrides);

  return {
    enabled,
    message: enabled
      ? "This site is temporarily in maintenance mode."
      : "Maintenance mode is available and currently off.",
    checkedAt: new Date().toISOString()
  };
}
