# EstateHat Operations

## Main commands

Web development:

```bash
npm run dev
```

Production web build:

```bash
npm run build
```

Firebase deploy:

```bash
npm run deploy:hosting
```

Functions only deploy:

```bash
npm run deploy:functions
```

Full backend + Hosting deploy:

```bash
npm run deploy:backend
```

iOS sync:

```bash
npm run sync:ios
```

Open Xcode:

```bash
npm run open:ios
```

Desktop development:

```bash
npm run dev:desktop
```

Desktop build:

```bash
npm run build:desktop
```

Windows packaging attempt:

```bash
npm run dist:win
```

Native wrapper sync note:

- Run `npm run sync:android` and `npm run sync:ios` sequentially, not in parallel.
- Parallel sync attempts can collide inside the shared Next export path and leave one native wrapper with an incomplete copied bundle.

## Hosting

- Hosting config file: `firebase.json`
- Firebase project alias: `.firebaserc`
- Public deploy target: `out/`
- Live site: `https://estatehat.web.app`
- Rollback procedure: `docs/failsafe/ROLLBACK_NOTES.md`
- Latest verified deploy: 2026-04-29 (`npm run deploy:hosting`).
- Latest verified Android wrapper sync: 2026-04-29 (`npm run sync:android`).
- Latest verified iOS wrapper sync: 2026-04-29 (`npm run sync:ios`).
- Canonical public routes:
  - `/`
  - `/signin`
  - `/about`
  - `/help`
  - `/faq`
  - `/press`
  - `/terms`
  - `/privacy`
  - `/accessibility`
  - `/dmca`
- Compatibility routes:
  - `/start` -> `/`
  - `/login` -> `/signin`
  - `/auth` -> `/signin`
  - `/public?page=...` -> matching direct public route
- Redirect behavior:
  - post-sign-in navigation to `/home` is handled through Next router replacement
  - Hosting uses clean URLs so direct requests to `/home` resolve to the exported route
- Deploy note:
  - Hosting-only deploy currently warns that `apiHealth`, `apiSessionBootstrap`, and `stripeApi` do not resolve to valid function endpoints.
  - Full Functions deploy currently fails until the Firebase `estatehat` project is upgraded to Blaze, because Google Cloud APIs for Cloud Functions / Cloud Build / Artifact Registry cannot be enabled on the current plan.

## Native locations

- iOS project: `ios/App/App.xcodeproj`
- Electron entrypoint: `electron/main.cjs`

## Special role accounts

The application contains reserved profile mapping for special operational accounts in `src/backend.js`.

Mapped roles:

- `administrator@estatehat.com` -> `admin`
- `webmaster.login@estatehat.com` -> `webmaster`

Passwords are not stored in repository docs.

## Profile data model

- User records live in the Firestore `users` collection.
- Profile writes are merge-based through `ensureUserProfile()` and `saveUserProfile()` in `src/backend.js`.
- Current schema version: `14`
- Managed profile areas now include:
  - base identity/contact fields
  - `security`
  - `verification`
  - `trust`
  - `legal`
  - `compliance`
  - `userDatabase`
  - `payoutFramework`
  - `verifiedBilling`
    - `referralIncentive` tracks referral code, credits, earned free months, applied free months, and the 12 month cap.
- Backend routes staged in repo:
  - `GET /api/health`
  - `GET /api/session/bootstrap`
  - `POST /api/stripe/...`
- See `docs/PROFILE_SECURITY_NOTES.md` for the current profile surface and persisted fields.
- See `docs/PLATFORM_DOCUMENTATION.md` for full current product/legal scope.

## Performance-related files

- `public/sw.js`
- `public/manifest.webmanifest`
- `public/icons/estatehat-icon.svg`
- `ios/App/App/public/sw.js`

## Cache invalidation note

- Current web service-worker cache keys:
  - `estatehat-app-v2`
  - `estatehat-runtime-v2`
- If a stale shell appears in Chrome after a deploy, clear site data or unregister the previous service worker once, then reload.

## Current UX baseline

- Post-login default page: `Hat Board` (`view = "dashboard"`).
- Universal Search route: `search`.
- Notification Center route: `notifications`.
- Document Vault route: `documents`.
- Offer Composer route: `offer`.
- Tour Scheduler route: `tours`.
- Property Comparison route: `compare`.
- Transaction Timeline route: `milestones`.
- Admin Workbench route: `admin-workbench`.
- Legal/back routes point to Hat Board.
- FAQ scope route: `faq` (FAQ & Scope page).
- Primary legal routes:
  - `terms`
  - `privacy`
  - `accessibility`
  - `dmca`

## Data integrity rule

- Do not display mock people, transactions, documents, compliance flags, or professional matches as live production data.
- Screens without a connected backend feed should show an empty connected-state.
- Current local-only mechanics:
  - `estatehat-offers-v1`
  - `estatehat-tours-v1`
  - `estatehat-vault-uploads-v1`
- Verified User referral credits are profile-persisted user state. Do not seed fake referral credits; record only verified referrals.

## Generated output

- Web build: `out/`
- Windows packaging output: `release/`

## Fallback artifact locations

- Older EstateHat source artifact: `/home/sniper-lion-main/Documents/EstateHat_files/estatehat-platform.jsx`
- Older EstateHat HTML/source artifact: `/home/sniper-lion-main/Documents/EstateHat_files/EstateHat_platform.html`
- Older CRA-era EstateHat project: `/home/sniper-lion-main/Documents/EstateHat_files/estatehat/`
