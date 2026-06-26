export const ACCESS_LEVELS = Object.freeze({
  PUBLIC: "public",
  AUTHENTICATED: "authenticated",
  CLIENT: "client",
  MANAGER: "manager",
  ADMIN: "admin",
  SYSTEM: "system"
});

export const routeAccessPolicy = Object.freeze([
  { pattern: "/", access: ACCESS_LEVELS.PUBLIC, note: "Public marketing GUI only; hide internal module dashboard in leased production." },
  { pattern: "/auth", access: ACCESS_LEVELS.PUBLIC, note: "Sign-in, sign-up, invite acceptance, reset, and verification entry." },
  { pattern: "/privacy", access: ACCESS_LEVELS.PUBLIC, note: "Public legal page." },
  { pattern: "/terms", access: ACCESS_LEVELS.PUBLIC, note: "Public legal page." },
  { pattern: "/data-request", access: ACCESS_LEVELS.PUBLIC, note: "Public privacy/data request intake." },
  { pattern: "/maintenance", access: ACCESS_LEVELS.PUBLIC, note: "Public status placeholder when site is unavailable." },
  { pattern: "/client", access: ACCESS_LEVELS.CLIENT, note: "Requires signed-in client; managers may impersonate only with audit controls." },
  { pattern: "/manager", access: ACCESS_LEVELS.MANAGER, note: "Requires signed-in manager or admin." },
  { pattern: "/admin", access: ACCESS_LEVELS.ADMIN, note: "Requires signed-in admin/owner." },
  { pattern: "/users", access: ACCESS_LEVELS.MANAGER, note: "User directory and profile records must not be anonymous." },
  { pattern: "/operations", access: ACCESS_LEVELS.MANAGER, note: "Queues, scheduling, files, and operational tables require staff access." },
  { pattern: "/operations-quality", access: ACCESS_LEVELS.MANAGER, note: "QA, releases, runbooks, and findings require staff access." },
  { pattern: "/data-workflow", access: ACCESS_LEVELS.MANAGER, note: "Workflow, automation, reports, imports, and exports require staff access." },
  { pattern: "/communication", access: ACCESS_LEVELS.MANAGER, note: "Conversations, notifications, email queues, and webhooks require staff access." },
  { pattern: "/platform", access: ACCESS_LEVELS.ADMIN, note: "Flags, tenants, GUI registry, exports, SEO, and provider setup require admin access." },
  { pattern: "/security", access: ACCESS_LEVELS.ADMIN, note: "Security controls, audit status, and environment readiness require admin access." },
  { pattern: "/health", access: ACCESS_LEVELS.MANAGER, note: "Visual reliability dashboard should be staff-only; keep public APIs sanitized." },
  { pattern: "/api/health", access: ACCESS_LEVELS.PUBLIC, note: "Public-safe sanitized health response only." },
  { pattern: "/api/live", access: ACCESS_LEVELS.PUBLIC, note: "Public liveness probe." },
  { pattern: "/api/contact-preview", access: ACCESS_LEVELS.PUBLIC, note: "Public lead/contact intake, rate-limited and validated." },
  { pattern: "/api/ready", access: ACCESS_LEVELS.SYSTEM, note: "Restrict to uptime monitors, admin, or hosting allowlist." },
  { pattern: "/api/status", access: ACCESS_LEVELS.MANAGER, note: "Dependency details should be staff-only." },
  { pattern: "/api/rate-limit-preview", access: ACCESS_LEVELS.ADMIN, note: "Debug/preview endpoint should be admin-only." },
  { pattern: "/api/profile-preview", access: ACCESS_LEVELS.CLIENT, note: "Profile data must be current user or authorized manager only." },
  { pattern: "/api/manager-profile-preview", access: ACCESS_LEVELS.MANAGER, note: "Manager metadata must be manager/admin only." },
  { pattern: "/api/workflow-preview", access: ACCESS_LEVELS.MANAGER, note: "Workflow mutation preview must be staff-only." },
  { pattern: "/api/data-job-preview", access: ACCESS_LEVELS.ADMIN, note: "Import/export job creation must be admin-only." },
  { pattern: "/api/quality-preview", access: ACCESS_LEVELS.MANAGER, note: "Quality and release status should be staff-only." },
  { pattern: "/api/runbook-preview", access: ACCESS_LEVELS.MANAGER, note: "Runbook creation should be staff-only." },
  { pattern: "/api/webhook-preview", access: ACCESS_LEVELS.SYSTEM, note: "Webhook intake must require signature verification or system token." }
]);

export function getAccessPolicyForPath(pathname) {
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  return routeAccessPolicy.find((entry) => normalizedPath === entry.pattern || normalizedPath.startsWith(`${entry.pattern}/`));
}

export function isPublicPath(pathname) {
  const policy = getAccessPolicyForPath(pathname);
  return !policy || policy.access === ACCESS_LEVELS.PUBLIC;
}

export function canRoleAccessPath(role, pathname) {
  const policy = getAccessPolicyForPath(pathname);

  if (!policy || policy.access === ACCESS_LEVELS.PUBLIC) return true;
  if (policy.access === ACCESS_LEVELS.AUTHENTICATED) return Boolean(role);
  if (policy.access === ACCESS_LEVELS.CLIENT) return role === "client" || role === "manager" || role === "admin";
  if (policy.access === ACCESS_LEVELS.MANAGER) return role === "manager" || role === "admin";
  if (policy.access === ACCESS_LEVELS.ADMIN) return role === "admin";
  if (policy.access === ACCESS_LEVELS.SYSTEM) return role === "system" || role === "admin";

  return false;
}

