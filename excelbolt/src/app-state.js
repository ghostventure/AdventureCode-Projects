const WORKSPACE_KEY = "excelbolt.workspace.v1";
const AUTH_GUARD_KEY = "excelbolt.auth-guard.v1";

export const DEFAULT_RECENT_EXPORTS = [
  { id: "seed-1", name: "Q1_2026_PnL.xls", template: "Monthly P&L Statement", date: "Mar 22", rows: 342, sheets: 4, size: "248 KB", status: "Complete" },
  { id: "seed-2", name: "March_Sales.xls", template: "Sales Dashboard", date: "Mar 21", rows: 1205, sheets: 4, size: "1.1 MB", status: "Complete" },
  { id: "seed-3", name: "Inventory_Mar.xls", template: "Inventory Tracker", date: "Mar 20", rows: 89, sheets: 3, size: "56 KB", status: "Complete" },
  { id: "seed-4", name: "Cust_Q1.xls", template: "Customer Report", date: "Mar 19", rows: 567, sheets: 4, size: "410 KB", status: "Complete" },
];

export const DEFAULT_WORKSPACE = {
  tab: "dashboard",
  currentPlan: "pro",
  usage: { exports: 18, connectors: 3, rowsThisMonth: 14200 },
  connected: ["quickbooks", "stripe", "shopify"],
  notifications: 3,
  darkMode: false,
  favorites: ["monthly-pnl", "sales-dashboard"],
  recentExports: DEFAULT_RECENT_EXPORTS,
  lastSavedAt: null,
};

const isBrowser = () => typeof window !== "undefined";

const clampNumber = (value, min, max, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
};

const sanitizeString = (value, maxLength = 120) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export const sanitizeProfile = (profile = {}) => ({
  name: sanitizeString(profile.name, 80),
  firstName: sanitizeString(profile.firstName, 40),
  lastName: sanitizeString(profile.lastName, 40),
  email: sanitizeString(profile.email, 120).toLowerCase(),
  company: sanitizeString(profile.company, 80),
});

export const normalizeRecentExports = (recentExports) => {
  if (!Array.isArray(recentExports) || recentExports.length === 0) {
    return DEFAULT_RECENT_EXPORTS;
  }

  return recentExports
    .slice(0, 12)
    .map((item, index) => ({
      id: sanitizeString(item.id, 40) || `export-${index}`,
      name: sanitizeString(item.name, 120) || `Export_${index + 1}.xls`,
      template: sanitizeString(item.template, 80) || "Template",
      date: sanitizeString(item.date, 40) || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      rows: clampNumber(item.rows, 0, 250000, 0),
      sheets: clampNumber(item.sheets, 1, 24, 1),
      size: sanitizeString(item.size, 20) || "Unknown",
      status: sanitizeString(item.status, 20) || "Complete",
    }));
};

export const normalizeWorkspace = (candidate = {}) => ({
  tab: sanitizeString(candidate.tab, 24) || DEFAULT_WORKSPACE.tab,
  currentPlan: sanitizeString(candidate.currentPlan, 24) || DEFAULT_WORKSPACE.currentPlan,
  usage: {
    exports: clampNumber(candidate?.usage?.exports, 0, 5000, DEFAULT_WORKSPACE.usage.exports),
    connectors: clampNumber(candidate?.usage?.connectors, 0, 1000, DEFAULT_WORKSPACE.usage.connectors),
    rowsThisMonth: clampNumber(candidate?.usage?.rowsThisMonth, 0, 5000000, DEFAULT_WORKSPACE.usage.rowsThisMonth),
  },
  connected: Array.isArray(candidate.connected)
    ? candidate.connected.filter((item) => typeof item === "string").slice(0, 30)
    : DEFAULT_WORKSPACE.connected,
  notifications: clampNumber(candidate.notifications, 0, 99, DEFAULT_WORKSPACE.notifications),
  darkMode: !!candidate.darkMode,
  favorites: Array.isArray(candidate.favorites)
    ? candidate.favorites.filter((item) => typeof item === "string").slice(0, 20)
    : DEFAULT_WORKSPACE.favorites,
  recentExports: normalizeRecentExports(candidate.recentExports),
  lastSavedAt: typeof candidate.lastSavedAt === "string" ? candidate.lastSavedAt : null,
});

export const loadWorkspace = () => {
  if (!isBrowser()) return DEFAULT_WORKSPACE;
  try {
    const raw = window.localStorage.getItem(WORKSPACE_KEY);
    if (!raw) return DEFAULT_WORKSPACE;
    return normalizeWorkspace(JSON.parse(raw));
  } catch {
    return DEFAULT_WORKSPACE;
  }
};

export const saveWorkspace = (workspace) => {
  if (!isBrowser()) return;
  const next = normalizeWorkspace({
    ...workspace,
    lastSavedAt: new Date().toISOString(),
  });
  window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(next));
};

export const downloadWorkspaceBackup = (payload) => {
  if (!isBrowser()) return;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = `excelbolt-backup-${new Date().toISOString().slice(0, 10)}.json`;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const loadAuthGuard = () => {
  if (!isBrowser()) return { failures: 0, lockedUntil: 0 };
  try {
    const raw = window.localStorage.getItem(AUTH_GUARD_KEY);
    if (!raw) return { failures: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw);
    return {
      failures: clampNumber(parsed.failures, 0, 20, 0),
      lockedUntil: clampNumber(parsed.lockedUntil, 0, 9999999999999, 0),
    };
  } catch {
    return { failures: 0, lockedUntil: 0 };
  }
};

export const saveAuthGuard = (state) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_GUARD_KEY, JSON.stringify({
    failures: clampNumber(state.failures, 0, 20, 0),
    lockedUntil: clampNumber(state.lockedUntil, 0, 9999999999999, 0),
  }));
};

export const clearAuthGuard = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_GUARD_KEY);
};

export const buildExportRecord = (template, rows, sheets) => {
  const safeTemplate = sanitizeString(template?.name, 80) || "Export";
  const safeRows = clampNumber(rows, 0, 250000, 0);
  const safeSheets = clampNumber(sheets, 1, 24, 1);
  const approxBytes = Math.max(28 * 1024, safeRows * safeSheets * 38);
  const size = approxBytes > 1024 * 1024
    ? `${(approxBytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(approxBytes / 1024)} KB`;

  return {
    id: `export-${Date.now()}`,
    name: `${safeTemplate.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xls`,
    template: safeTemplate,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    rows: safeRows,
    sheets: safeSheets,
    size,
    status: "Complete",
  };
};
