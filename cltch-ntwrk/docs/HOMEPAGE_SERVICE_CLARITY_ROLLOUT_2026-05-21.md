# CLTCH.NTWRK Homepage Service Clarity Rollout

Date: 2026-05-21

## Purpose

Tighten the public homepage so a new host or performer can understand what CLTCH.NTWRK helps them do before signing up.

## Changes

- Added a `Built for real event needs` homepage section covering four practical service lanes:
  - Musicians and DJs
  - Photo and video
  - Models and hosts
  - Creative event help
- Added a `Less guessing after the match` homepage section that explains the booking-room operating details CLTCH should keep visible after a match.
- Added responsive card/grid CSS for the new homepage sections.
- Synced the public-site changes into `mobile-web` with `npm run build:mobile`.

## Files Updated

- `index.html`
- `mobile-web/index.html`
- `docs/DOCS_INDEX.md`
- `docs/PROJECT_STATUS.md`

## Validation

- `npm run build:mobile`
- `npm run build`
- `npm run deploy:hosting`
- Live `curl` check confirmed the new `Built for real event needs` and `Less guessing after the match` sections are present at `https://cltch-ntwrk.web.app/`.

## Deploy Note

Firebase Hosting deployed successfully. The CLI repeated existing warnings that configured `/api/...` rewrites do not currently have valid Function endpoints in the project; that is consistent with the known Functions/Blaze limitation documented in `PROJECT_STATUS.md` and did not block Hosting release.

## Deployment Target

- Firebase Hosting project/site: `cltch-ntwrk`
- Live URL: `https://cltch-ntwrk.web.app`
