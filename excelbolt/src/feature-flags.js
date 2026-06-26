const toBool = (value, fallback = false) => {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
};

export const featureFlags = {
  sentry: toBool(import.meta.env.VITE_FEATURE_SENTRY),
  queryDevtools: toBool(import.meta.env.VITE_FEATURE_QUERY_DEVTOOLS),
  appCheck: toBool(import.meta.env.VITE_FEATURE_APP_CHECK, true),
  commandPalette: toBool(import.meta.env.VITE_FEATURE_COMMAND_PALETTE),
  spreadsheetGrid: toBool(import.meta.env.VITE_FEATURE_SPREADSHEET_GRID),
  formulas: toBool(import.meta.env.VITE_FEATURE_FORMULAS),
  dndBuilder: toBool(import.meta.env.VITE_FEATURE_DND_BUILDER),
  localDb: toBool(import.meta.env.VITE_FEATURE_LOCAL_DB),
  charts: toBool(import.meta.env.VITE_FEATURE_CHARTS),
  templateVersioning: toBool(import.meta.env.VITE_FEATURE_TEMPLATE_VERSIONING),
  auditTimeline: toBool(import.meta.env.VITE_FEATURE_AUDIT_TIMELINE),
  approvalWorkflow: toBool(import.meta.env.VITE_FEATURE_APPROVAL_WORKFLOW),
  schemaRegistry: toBool(import.meta.env.VITE_FEATURE_SCHEMA_REGISTRY),
  dataLineage: toBool(import.meta.env.VITE_FEATURE_DATA_LINEAGE),
  reconciliation: toBool(import.meta.env.VITE_FEATURE_RECONCILIATION),
  deadLetterQueue: toBool(import.meta.env.VITE_FEATURE_DEAD_LETTER_QUEUE),
};

export const isEnabled = (flagName) => Boolean(featureFlags[flagName]);
