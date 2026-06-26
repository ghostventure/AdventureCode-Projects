# Components and Mechanics Installed (2026-04-12)

## Install Summary

ExcelBolt now includes three install waves completed on April 12, 2026:

- Initial wave: 20 packages.
- Second wave: 30 requested items (27 npm packages + 3 product mechanics scaffolded).
- Third wave: 40 requested items (36 npm packages + 4 product mechanics scaffolded).

## Third Wave (Latest 40 Request)

### Runtime packages installed

- @xyflow/react
- react-resizable-panels
- @monaco-editor/react
- monaco-editor
- xstate
- @xstate/react
- @tiptap/react
- @tiptap/starter-kit
- lexical
- @lexical/react
- @tanstack/react-table
- react-virtuoso
- @mui/x-data-grid
- framer-motion
- @react-pdf/renderer
- pdf-lib
- jspdf
- react-markdown
- remark-gfm
- @floating-ui/react
- react-use
- usehooks-ts
- clsx
- dayjs
- rrule
- p-queue
- bullmq
- comlink
- workbox-window
- localforage
- idb
- nanoid
- uuid

### Dev/tooling packages installed

- vite-plugin-pwa
- axe-core
- @axe-core/playwright

## Mechanics Scaffold Added From Third Wave

These were represented in code as feature flags and mechanics toggles:

- Schema Registry
- Data Lineage
- Reconciliation
- Dead-letter Queue

## Feature Flags Available

Set in `.env.local` as needed:

- `VITE_FEATURE_SENTRY=true`
- `VITE_SENTRY_DSN=...`
- `VITE_SENTRY_TRACE_SAMPLE_RATE=0.1`
- `VITE_FEATURE_QUERY_DEVTOOLS=true`
- `VITE_FEATURE_COMMAND_PALETTE=true`
- `VITE_FEATURE_SPREADSHEET_GRID=true`
- `VITE_FEATURE_FORMULAS=true`
- `VITE_FEATURE_DND_BUILDER=true`
- `VITE_FEATURE_LOCAL_DB=true`
- `VITE_FEATURE_CHARTS=true`
- `VITE_FEATURE_APP_CHECK=true` (defaults to true)
- `VITE_FEATURE_TEMPLATE_VERSIONING=true`
- `VITE_FEATURE_AUDIT_TIMELINE=true`
- `VITE_FEATURE_APPROVAL_WORKFLOW=true`
- `VITE_FEATURE_SCHEMA_REGISTRY=true`
- `VITE_FEATURE_DATA_LINEAGE=true`
- `VITE_FEATURE_RECONCILIATION=true`
- `VITE_FEATURE_DEAD_LETTER_QUEUE=true`

## Core Wiring Notes

- `src/main.jsx`: React Query provider + observability bootstrap.
- `src/bootstrap/query-client.js`: baseline query client defaults.
- `src/bootstrap/observability.js`: optional Sentry init.
- `src/feature-flags.js`: consolidated feature flag registry.
- `src/mechanics.js`: lazy-load + mechanics toggle bridge.
- `src/firebase.js`: App Check respects feature flag + site key.

## Script Inventory

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run test`
- `npm run test:watch`
- `npm run test:e2e`
- `npm run storybook`
- `npm run build-storybook`

## Security / Audit Notes

- Dependency tree currently reports vulnerabilities from transitive packages.
- Use `npm audit` to inspect and triage before a strict production freeze.
