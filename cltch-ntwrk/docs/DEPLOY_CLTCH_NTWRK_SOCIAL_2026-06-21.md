# CLTCH.NTWRK Social Deploy - 2026-06-21

## Summary

Deployed the CLTCH.NTWRK static site to Firebase project and Hosting site `cltch-ntwrk-social` using `blacklionmediastudio@gmail.com`.

## Target Changes

- Updated `.firebaserc` default project from `cltch-ntwrk` to `cltch-ntwrk-social`.
- Updated `firebase.json` Hosting site from `cltch-ntwrk` to `cltch-ntwrk-social`.
- Updated `npm run deploy:hosting` to deploy to `cltch-ntwrk-social` with `blacklionmediastudio@gmail.com`.
- Fixed `scripts/guard-deploy.mjs` so paths with spaces decode correctly before comparing the repo root.
- Updated the guard to require `cltch-ntwrk-social`.

## Blaze-Blocked Features

The new Firebase project is not on Blaze, so Functions, Firestore database creation, and Storage setup are not available yet.

Actions taken:

- Removed live Hosting API rewrites for `/api/**` until Functions can deploy.
- Disabled backend API calls in `app/backend-api.js` with a Blaze-required message.
- Greyed out and disabled Stripe/Plaid controls in host and musician profile pages.
- Left manual payout/payment fields available.
- Updated Functions CORS/default host references for future `cltch-ntwrk-social` backend deployment.

## Firebase App And Realtime Database Follow-Up

After Realtime Database was enabled on `blacklionmediastudio@gmail.com`, the project exposed RTDB instance `cltch-ntwrk-social-default-rtdb`.

Follow-up completed:

- Created Firebase Web app `CLTCH.NTWRK` in project `cltch-ntwrk-social`.
- New Web App ID: `1:566614252202:web:88a72b40379c0f7716ced3`.
- Updated `app/firebase-client.js` from the old `cltch-ntwrk` Firebase config to the new `cltch-ntwrk-social` config.
- Added `databaseURL: https://cltch-ntwrk-social-default-rtdb.firebaseio.com` to the client config.
- Added `database.rules.json` with deny-by-default Realtime Database rules.
- Added the `database.rules.json` deploy target to `firebase.json`.
- Deployed RTDB rules to `cltch-ntwrk-social-default-rtdb`.
- Redeployed Hosting after the Firebase client config update.
- Live `https://cltch-ntwrk-social.web.app/app/firebase-client.js` includes `cltch-ntwrk-social` and the RTDB URL, and no longer includes `cltch-ntwrk.firebaseapp.com`.

Note: CLTCH currently uses Firestore in the frontend and Functions backend. Realtime Database is available on the project, but the current app code does not use RTDB paths yet.

## Retry After Environment Change

After the Firebase environment type was changed, deploys were retried:

- `functions,firestore,storage`: still blocked because Firebase Storage has not been set up in the project.
- `functions,firestore`: still blocked because Firestore database creation reports billing is required.
- `functions`: still blocked because Cloud Functions requires the Blaze pay-as-you-go plan to enable Cloud Build/Artifact Registry.
- `database`: succeeded and released locked RTDB rules to `cltch-ntwrk-social-default-rtdb`.

## Deploy And Verification

- `node --check app/backend-api.js` passed.
- `node --check app/stripe-connect.js` passed.
- `node --check functions/index.js` passed.
- JSON validation passed for `firebase.json`, `.firebaserc`, and `package.json`.
- `node scripts/guard-deploy.mjs` passed.
- `npm run deploy:hosting` completed successfully.
- Live `https://cltch-ntwrk-social.web.app/` returned HTTP 200.
- Live homepage contained `CLTCH.NTWRK` and dispatch-app copy.
- Live `host-profile.html` and `musician-profile.html` contain disabled Blaze-required Stripe/Plaid controls.
- Live `/api/health` returns static 404 because backend rewrites are intentionally disabled until Blaze is enabled.
- Live Firebase client config now points at `cltch-ntwrk-social`.

## Old Hosting Disable

Disabled old Solid Art Hosting site:

- Account: `solidartentertainment@gmail.com`
- Project: `cltch-ntwrk`
- Site: `cltch-ntwrk`
- Command: `npx firebase-tools hosting:disable --site cltch-ntwrk --project cltch-ntwrk --account solidartentertainment@gmail.com --force`

Verification:

- `https://cltch-ntwrk.web.app/` returned HTTP 404 after disable.

## Follow-Up When Blaze Is Enabled

1. Enable Blaze billing on `cltch-ntwrk-social`.
2. Initialize Firestore and Storage if those products are still required.
3. Restore Hosting API rewrites in `firebase.json`.
4. Set required function environment variables: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, optional `STRIPE_PLATFORM_BASE_URL`, `PLAID_CLIENT_ID`, `PLAID_SECRET`, and `PLAID_ENV`.
5. Deploy `functions`, `firestore`, `storage`, and `hosting`.
6. Re-enable Stripe/Plaid controls after live `/api/health`, Stripe config, and Plaid link-token smoke checks pass.
