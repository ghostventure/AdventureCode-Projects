# CLTCH GUI, Security, Accessibility Rollout

Date: 2026-04-08  
Scope: CLTCH.NTWRK website + mobile-web + iOS/Android Capacitor asset parity

## Summary

This rollout added new user-facing mechanics and hardening focused on:

- faster navigation for casual users
- fewer repeated clicks to reach common actions
- stronger accessibility controls
- clearer runtime status feedback
- tighter hosting security headers
- synchronized delivery across web, mobile-web, iOS, and Android wrappers

## Implemented Changes

## 1) Shared GUI and flow improvements

Files:

- `site-init.js`
- `cltch-boilerplate.css`
- `index.html`

Implemented:

- Added recent-page resume actions in the Feature Hub micro-tools:
  - stores recent pages in local storage
  - surfaces "Resume <Page>" actions beneath primary actions
  - keeps advanced/micro actions grouped under major actions
- Added a global accessibility control panel:
  - text scale: `Default`, `Large`, `XL`
  - high contrast toggle
  - reset control
  - persisted per user device via local storage
- Added quick dock runtime status pill:
  - shows `Active` when online
  - shows `Offline` when network is unavailable
  - shows warning state for non-HTTPS contexts outside localhost
- Added runtime hardening for external links:
  - enforces `rel="noopener noreferrer"` on `target="_blank"` anchors
- Refined quick-jump palette signal quality:
  - excludes internal panel controls from command results
  - prevents noisy/duplicate labels in quick-jump options

## 2) Landing experience overhaul

File:

- `index.html`

Implemented:

- rebuilt home page structure to feel stronger for casual users
- introduced clear dual-entry cards (`Host Workspace`, `Performer Workspace`)
- added "How it works in 3 steps" section
- added high-level capability highlights
- kept route paths aligned with existing auth and workspace flows

## 3) Hosting security hardening

File:

- `firebase.json`

Added response headers:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-Permitted-Cross-Domain-Policies: none`

Existing CSP/HSTS/etc. were preserved.

## 4) Mobile/native parity

Built and synced so the same behavior ships to wrappers:

- `mobile-web/*`
- `ios/App/App/public/*`
- `android/app/src/main/assets/public/*`

Parity was validated for updated shared assets (`site-init.js`, CSS, and home page).

## Validation and Test Record

## Syntax/config checks

Executed:

- `node --check site-init.js`
- `node --check scripts/sync-mobile-web.mjs`
- `node -e "JSON.parse(fs.readFileSync('firebase.json','utf8'))"`

Result: passed.

## Inline module checks

All top-level HTML `type="module"` blocks were extracted and syntax-checked.

Result: `10` inline module script blocks passed.

## Build and sync checks

Executed:

- `npm run build:mobile`
- `npm run sync:ios`
- `npm run sync:android`

Result: passed.

## Route smoke checks (served locally)

Validated page load/body presence and successful local serving for:

- `index.html`
- `auth.html`
- `host.html`
- `host-profile.html`
- `musician-profile.html`
- `musician-matched-gigs.html`
- `gig-radar.html`
- `booking.html`
- `faq.html`
- `privacy.html`
- `terms.html`
- `support.html`

Result: passed.

## Headless DOM checks for new mechanics

Validated on rendered DOM:

- `cltchAccessPanel` present
- `cltchStatusPill` present
- quick dock present on auth/home routes

Result: passed.  
Note: Chromium headless emitted sandbox/GPU shared-memory warnings in this environment, but assertions completed successfully.

## Deployment Record

Command:

- `npm run deploy:hosting`

Result:

- deploy guard passed
- Firebase Hosting deploy completed successfully for project `cltch-ntwrk`
- live URL: `https://cltch-ntwrk.web.app`

## Operational Note

When running iOS and Android syncs, execute them serially if both commands call `build:mobile`, to avoid race conditions on the shared `mobile-web` output directory.
