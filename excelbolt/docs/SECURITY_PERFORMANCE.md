# Security And Performance Pass

## Security

- Firebase auth now uses browser-local persistence so sessions survive refreshes without custom token handling.
- Firestore now initializes with `ignoreUndefinedProperties` and persistent local cache for safer writes and offline recovery.
- Firestore rules now validate the allowed user profile shape instead of allowing arbitrary document writes.
- Firebase Hosting now serves stricter security headers:
  - `Strict-Transport-Security`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Content-Security-Policy`
- Login flows now enforce a client-side lockout window after repeated failures and support password reset emails.
- App Check is wired as an opt-in path through `VITE_APP_CHECK_SITE_KEY`.
- Admin UI access is now gated by `VITE_ADMIN_EMAILS`. This is a UI barrier, not a substitute for backend authorization.
- Spreadsheet export generation now escapes XML and neutralizes formula-style cell prefixes to reduce spreadsheet injection risk.

## Performance

- The main app is lazy-loaded from `src/main.jsx` behind a lightweight Suspense fallback.
- Vite now splits vendor chunks so Firebase and React code do not ship as one monolith.
- A service worker and manifest are included for faster repeat loads and better resilience when the network drops.
- Service-worker cache version is currently `excelbolt-static-v2` to reduce stale-shell issues after deploys.
- Workspace state and recent exports are cached locally, reducing cold-start friction after refresh.
- Background assistance now runs in a dedicated Web Worker (`src/background-plugin-worker.js`) so UI interactions remain responsive during helper execution.

## Useful User Features Added

- Persistent workspace preferences:
  - active tab
  - plan selection
  - connector state
  - dark mode
  - favorites
  - notification count
- Recent exports history is now real app state instead of a static table.
- Recovery backups can be downloaded from the dashboard, security settings, and danger zone.

## Customer Database Improvements

- Customer document reads and writes now run through `src/customer-db.js`.
- The main `/users/{uid}` record now stores:
  - sanitized profile fields
  - normalized workspace state
  - `workspaceSummary` for lighter operational reads
  - `security` summary metadata
- Recovery snapshots now write to `/users/{uid}/backups/{backupId}` instead of inflating the main customer document.

## Background Plugin API + ExcelJet Bridge

- `src/background-plugin-api.js` provides a request/response API to the worker with promise-based calls.
- `src/background-plugin-worker.js` provides modular helper plugins:
  - formula assistant
  - connector advisor
  - export planner
  - support triage
- `src/exceljet-kb.js` optionally pulls external encyclopedia context via:
  - `VITE_EXCELJET_KB_URL`
  - `VITE_EXCELJET_KB_KEY`
- Help -> Assistant can run plugins in background and merge external context without exposing implementation details to casual users.
