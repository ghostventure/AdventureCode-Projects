export const auditCategories = Object.freeze({
  AUTH: "auth",
  USER: "user",
  SECURITY: "security",
  SYSTEM: "system",
  CONTENT: "content",
  EXPORT: "export",
  CONSENT: "consent"
});

export function createAuditEvent({ category, action, actor = "system", target = "platform", status = "recorded" }) {
  return {
    id: `${category}-${action}`.toLowerCase().replaceAll(" ", "-"),
    category,
    action,
    actor,
    target,
    status,
    createdAt: new Date().toISOString()
  };
}
