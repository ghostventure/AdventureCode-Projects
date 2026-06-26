# CLTCH.NTWRK Android Native Alternate

This folder contains a separate native Android implementation for `CLTCH.NTWRK` using Kotlin and Jetpack Compose.

## Included

- Gradle Kotlin DSL project files
- Compose app shell
- role-aware login flow
- host and performer dashboard metrics
- native queue or radar tab depending on role
- booking pipeline screen with detail and timeline state
- profile facts and support diagnostics screens
- mock repository layer ready to swap for Firebase-backed data sources

## What this native pass now mirrors from CLTCH

- host ops metrics and next-action cards
- performer radar and matched-gig concepts
- booking timeline progress
- support and runtime diagnostics concepts
- role-aware navigation structure

This still does not have live Firebase parity yet. It mirrors the current product structure with native mock data so real backend wiring can be added on a stronger UI foundation.

## Open in Android Studio

1. Open this `native-android-kotlin` folder in Android Studio.
2. Let Gradle sync.
3. Add `google-services.json` later when Firebase wiring begins.
4. Replace the mock repository with real backend services that follow [docs/NATIVE_DATABASE_SYNC.md](/home/sniper-lion-main/Documents/CLTCH.NTWRK/docs/NATIVE_DATABASE_SYNC.md).
5. Add native forms and mutations for host posting, performer profile editing, and booking actions.
6. Add signing, icons, and release config as needed.

This alternate app is separate from the Capacitor Android wrapper already added elsewhere in the repo.
