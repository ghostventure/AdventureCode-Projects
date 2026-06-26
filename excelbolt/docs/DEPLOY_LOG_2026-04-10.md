# Deploy Log - 2026-04-10

## Scope

- Validate ExcelBolt after background plugin API and ExcelJet knowledge bridge changes.
- Deploy to Firebase Hosting production.
- Confirm production responses and key security headers.

## Commands run

1. Build:

```bash
npm run build
```

Result: success.

2. Local preview smoke:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
curl -I http://127.0.0.1:4173/
curl -I http://127.0.0.1:4173/help
curl -I http://127.0.0.1:4173/assets/background-plugin-worker-DfhYkZmT.js
```

Result: all checks returned `HTTP 200`.

3. Deploy:

```bash
firebase deploy --only hosting --project excelbolt
```

Result: deploy completed successfully.

4. Production verification:

```bash
curl -I https://excelbolt.web.app/
curl -I https://excelbolt.web.app/assets/background-plugin-worker-DfhYkZmT.js
```

Result: both returned `HTTP 200`.

## Production endpoint

- `https://excelbolt.web.app`

## Security header verification summary

Confirmed present on production responses:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Permissions-Policy`
- `Referrer-Policy`

## Notes

- Worker filename hash may change on future builds.
- If stale UI appears after deployment, clear service worker/site data once and reload.
