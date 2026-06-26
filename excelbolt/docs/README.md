# ExcelBolt Documentation

Use `PROJECT_STATUS.md` first for the current live state, cache-version notes, and latest deploy summary.

- `SECURITY_PERFORMANCE.md`: current hardening and speed improvements.
- `HANDOFF_2026-04-17.md`: latest landing page, route, build, deploy, chunking, service-worker, CSP, and smoke-test notes.
- `failsafe/RECOVERY_GUIDE.md`: workspace backup and restore steps.

Keep Firebase secrets and production-only site keys out of this repo. If you enable App Check, set `VITE_APP_CHECK_SITE_KEY` locally or in your deployment environment.
If you want the admin console visible only to approved operators, set `VITE_ADMIN_EMAILS` to a comma-separated email allowlist.

## ExcelJet Knowledge Bridge

ExcelBolt can use ExcelJet as an external template encyclopedia via the background plugin assistant.

- `src/exceljet-kb.js` fetches optional context from an external endpoint.
- `excelbolt.jsx` attaches this context to assistant plugin runs.
- `src/background-plugin-worker.js` merges that context into suggestions.

Optional environment variables:

- `VITE_EXCELJET_KB_URL=https://your-exceljet-endpoint.example/api/template-kb`
- `VITE_EXCELJET_KB_KEY=optional_bearer_token`
