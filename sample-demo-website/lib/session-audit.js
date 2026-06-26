import { auditCategories, createAuditEvent } from "./audit-log";

export function createSessionAuditEvent({ action, actor = "anonymous", status = "recorded" }) {
  return createAuditEvent({
    category: auditCategories.AUTH,
    action,
    actor,
    target: "session",
    status
  });
}
