# CLTCH.NTWRK Mobile Setup

This project now includes Capacitor scaffolding for both iOS and Android so the existing CLTCH.NTWRK site can run as native-wrapped mobile apps.

## Files

- `package.json`
- `capacitor.config.json`
- `scripts/sync-mobile-web.mjs`
- `ios/` after `npx cap add ios`
- `android/` after `npx cap add android`
- `mobile-web/` generated from the current static site
- `scripts/sync-mobile-web.mjs` now mirrors root-site `.html`, `.css`, `.js`, and `.webmanifest` files automatically instead of relying on a hand-maintained page list

## Commands

- `npm run build:mobile`
  Builds the mobile web bundle by copying the current static site into `mobile-web/`.
- `npm run sync:ios`
  Rebuilds `mobile-web/` and syncs web assets into the iOS project.
- `npm run sync:android`
  Rebuilds `mobile-web/` and syncs web assets into the Android project.
- `npm run sync:mobile`
  Rebuilds and syncs both native projects.
- `npm run open:ios`
  Opens the iOS project in Xcode.
- `npm run open:android`
  Opens the Android project in Android Studio.

## Native Handoff

### iOS

1. Run `npm run sync:ios`.
   Current status: completed successfully on 2026-04-01 after the latest CLTCH feature rollout.
2. Open `ios/App/App.xcworkspace` in Xcode.
3. Set your Apple team, signing, app icons, and launch assets.
4. Build on a simulator or device.

### Android

1. Run `npm run sync:android`.
2. Open `android/` in Android Studio.
3. Set your signing config, app icons, and splash assets.
4. Build debug and release variants there.

## Notes

- The native apps mirror the current CLTCH.NTWRK site because they wrap the same static pages.
- The current iOS wrapper sync includes the live performer workspace pages:
  - `musician-matched-gigs.html`
  - `gig-radar.html`
  - `musician-profile.html`
- The current iOS wrapper sync also includes:
  - `booking.html`
  - `support.html`
  - shared dexterity behavior from `site-init.js`
  - shared interaction styling from `cltch-boilerplate.css`
- Firebase web SDK usage remains in the web layer, so existing auth and Firestore flows continue to run inside the native webview.
- Native store submission, signing, push setup, and final icon/splash asset replacement still need to be done on your Apple and Google accounts.
- Native wrapper folders are intentionally excluded from Firebase Hosting deploys through `firebase.json` so they do not break Spark-plan website deployments.
- Separate full-native alternates also exist in `native-ios-swift/` and `native-android-kotlin/`; those are documented in their own README files and in `docs/NATIVE_DATABASE_SYNC.md`.
