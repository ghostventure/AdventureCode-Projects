# CLTCH.NTWRK SwiftUI Alternate

This folder contains an alternate native iOS implementation for `CLTCH.NTWRK` built in SwiftUI.

## What is here

- `project.yml`
  An XcodeGen project spec for producing a real Xcode project on a Mac.
- `CLTCHNTWRKSwift/`
  App source files, models, services, and SwiftUI views.

## Current scope

This is now a stronger native parity shell with:

- a launch flow
- role-aware session state
- an auth shell
- host and performer dashboard metrics
- a native queue or radar tab depending on role
- booking lists plus booking-detail timeline sheets
- profile facts and support diagnostics tabs
- a mock data service that can be replaced with real Firebase-backed services

## What this native pass now mirrors from CLTCH

- host ops metrics and next-action cards
- performer radar and matched-gig concepts
- booking timeline progress
- support and runtime diagnostics concepts
- role-aware navigation structure

This still does **not** have live Firebase parity yet. It mirrors the current product structure with native mock data so the real backend integration can land on a better UI foundation.

## Generate the Xcode project

On a Mac:

1. Install Xcode.
2. Install XcodeGen if needed.
3. From this folder, run `xcodegen generate`.
4. Open the generated `.xcodeproj` in Xcode.

## Next integration steps

1. Add `GoogleService-Info.plist`.
2. Replace `PreviewSessionService` with Firebase Auth and Firestore services that follow [docs/NATIVE_DATABASE_SYNC.md](/home/sniper-lion-main/Documents/CLTCH.NTWRK/docs/NATIVE_DATABASE_SYNC.md).
3. Add native forms and mutations for host posting, performer profile editing, and booking actions.
4. Add native app icons and launch assets.
5. Configure signing and archive from Xcode.

This alternate app is separate from the Capacitor wrapper already scaffolded elsewhere in the repo.
