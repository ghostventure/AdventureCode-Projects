# CLTCH Next Foundation - 2026-04-22

## Summary

CLTCH.NTWRK now has a Next.js foundation while preserving the existing static HTML app and mobile wrapper path.

The migration uses a catch-all Next route to serve the current CLTCH pages and assets from the repo root. This keeps the current website behavior intact while adding `next dev`, `next build`, and `next start` as the new local web runtime.

## Added

- `next.config.js`
  - baseline Next config with unoptimized image handling
- `app/[[...path]]/route.js`
  - catch-all route handler for existing CLTCH pages and assets
  - supports `/`, extensionless page routes like `/host`, direct HTML routes like `/host.html`, and static assets like `/site-init.js`
  - blocks deployment/internal folders such as `.next`, `android`, `ios`, `functions`, `docs`, `node_modules`, and `release`
- package scripts:
  - `npm run dev`
  - `npm run build`
  - `npm run start`
  - `npm run clean`
- dependencies:
  - `next`
  - `react`
  - `react-dom`

## Preserved

- Existing Firebase Hosting static deploy path remains `npm run deploy:hosting`.
- Existing Capacitor/mobile path remains `npm run build:mobile`, `npm run sync:android`, and `npm run sync:ios`.
- Existing HTML, CSS, JS, Firebase client helpers, Firestore rules, and Cloud Functions were not rewritten.

## Verified

- `node --check app/[[...path]]/route.js` passed.
- `npm run build` passed.
- `npm run start -- --hostname 127.0.0.1 --port 3100` served the Next app.
- Local Next smoke returned:
  - `/` -> `200`
  - `/host` -> `200`
  - `/musician-profile.html` -> `200`
  - `/site-init.js` -> `200`
  - `/cltch-boilerplate.css` -> `200`
  - `/manifest.webmanifest` -> `200`
  - `/does-not-exist` -> `404`
- `npm run build:mobile` passed after the Next migration.

## Current Notes

This is the first migration step. CLTCH now runs on Next locally, but production Hosting still uses the existing static Firebase Hosting deploy until a Next host or Firebase Functions adapter is added for CLTCH.
