import { featureFlags } from "./feature-flags.js";

// Lazy-load optional systems so baseline startup stays unchanged.
export const loadSpreadsheetStack = async () => {
  if (!featureFlags.spreadsheetGrid && !featureFlags.formulas) return null;

  const [grid, formulas] = await Promise.all([
    featureFlags.spreadsheetGrid ? import("ag-grid-react") : Promise.resolve(null),
    featureFlags.formulas ? import("hyperformula") : Promise.resolve(null),
  ]);

  return {
    grid,
    formulas,
  };
};

export const loadImportExportStack = async () => {
  const [xlsx, papaparse] = await Promise.all([import("xlsx"), import("papaparse")]);
  return { xlsx, papaparse };
};

export const loadBuilderStack = async () => {
  if (!featureFlags.dndBuilder) return null;
  const [dndCore, dndSortable] = await Promise.all([
    import("@dnd-kit/core"),
    import("@dnd-kit/sortable"),
  ]);
  return { dndCore, dndSortable };
};

export const loadCommandPalette = async () => {
  if (!featureFlags.commandPalette) return null;
  return import("cmdk");
};

export const loadCharts = async () => {
  if (!featureFlags.charts) return null;
  return import("recharts");
};

export const loadLocalDb = async () => {
  if (!featureFlags.localDb) return null;
  const [dexie, idb] = await Promise.all([import("dexie"), import("idb-keyval")]);
  return { dexie, idb };
};

export const loadGovernanceMechanics = async () => ({
  templateVersioning: featureFlags.templateVersioning,
  auditTimeline: featureFlags.auditTimeline,
  approvalWorkflow: featureFlags.approvalWorkflow,
  schemaRegistry: featureFlags.schemaRegistry,
  dataLineage: featureFlags.dataLineage,
  reconciliation: featureFlags.reconciliation,
  deadLetterQueue: featureFlags.deadLetterQueue,
});
