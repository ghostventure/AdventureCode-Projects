# CLTCH Backend API Enrichment

Date: 2026-04-28

## Scope

Strengthened the practical backend boundary for CLTCH.NTWRK so the web shell is no longer dependent on an implied `/api` layer that did not fully exist on static Hosting.

Primary files:

- `functions/index.js`
- `firebase.json`
- `app/backend-api.js`
- `app/stripe-connect.js`

## What changed

### 1. Added backend utility endpoints

New Firebase HTTPS functions:

- `apiHealth`
  - lightweight health/status check
  - reports Firestore availability and whether Stripe/Plaid env configuration exists
- `apiSessionBootstrap`
  - authenticated bootstrap endpoint for the signed-in user
  - returns:
    - `users/{uid}` summary
    - `userRoles/{uid}`
    - host and musician profile snapshots
    - Stripe connected-account status for host and musician roles
    - Plaid item linkage status

### 2. Added Hosting `/api` rewrites

Static Firebase Hosting now maps these paths to functions:

- `/api/health`
- `/api/session/bootstrap`
- `/api/stripe/config`
- `/api/stripe/create-connected-account`
- `/api/stripe/create-onboarding-link`
- `/api/stripe/create-host-checkout-intent`
- `/api/plaid/create-link-token`
- `/api/plaid/exchange-public-token`

### 3. Added a shared backend client helper

New browser helper:

- `app/backend-api.js`

This helper:

- resolves same-origin `/api/...` paths when available
- falls back to direct Cloud Functions URLs when needed
- improves behavior for wrapper contexts and any environment where `/api` is not locally mounted

### 4. Updated Stripe frontend calls

`app/stripe-connect.js` now uses the shared backend client helper instead of assuming same-origin `/api` always exists.

## Why this matters

Before this pass, the repo had usable Stripe/Plaid Cloud Functions, but the frontend still assumed an API layer that was not guaranteed on the live static Hosting path or native wrapper contexts.

This pass closes that gap by making the backend callable in both directions:

- Firebase Hosting can route `/api/...` to functions
- browser code can fall back directly to the deployed function URLs

## Verification

- `node --check app/backend-api.js` (pass)
- `node --check app/stripe-connect.js` (pass)
- `node --check functions/index.js` (pass)
- `npm run build:mobile` (pass)
- `npm run deploy:hosting` (pass)

## Deployment status

- Hosting deploy succeeded to `https://cltch-ntwrk.web.app`.
- Full `functions,hosting` deploy is currently blocked because the Firebase project is not on the Blaze plan.
- Firebase returned the blocker while trying to enable required APIs for Functions deployment:
  - `cloudbuild.googleapis.com`
  - `artifactregistry.googleapis.com`
- As a result:
  - the frontend/backend bridge changes are live on Hosting
  - the new `apiHealth` and `apiSessionBootstrap` functions are present in repo code but are not live until Firebase billing is upgraded and Functions are deployed

## Notes

- No new npm packages were required for this backend pass.
- This change improves backend completeness in-repo, but live function activation still depends on Firebase Functions deployment in the `cltch-ntwrk` project and valid Stripe/Plaid environment secrets.
