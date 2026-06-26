export const consentCategories = [
  { key: "required", label: "Required", required: true },
  { key: "analytics", label: "Analytics", required: false },
  { key: "marketing", label: "Marketing", required: false }
];

export const legalBoilerplate = {
  privacyUpdated: "2026-05-23",
  termsUpdated: "2026-05-23",
  controller: "Site owner to be configured per future website",
  contactEmail: "privacy@example.com"
};

export function createConsentRecord({ userId = "anonymous", accepted = ["required"] } = {}) {
  return {
    userId,
    accepted: Array.from(new Set(["required", ...accepted])),
    version: legalBoilerplate.privacyUpdated,
    capturedAt: new Date().toISOString()
  };
}
