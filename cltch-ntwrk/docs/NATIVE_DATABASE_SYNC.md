# CLTCH.NTWRK Native Database Sync Contract

This document aligns the native iOS and Android alternates with the current live CLTCH.NTWRK Firebase backend.

## Firebase Project

- Project ID: `cltch-ntwrk`
- Auth domain: `cltch-ntwrk.firebaseapp.com`
- Storage bucket: `cltch-ntwrk.firebasestorage.app`

## Primary Firestore Collections

- `users/{uid}`
  Canonical summary record used for role routing and profile summary state.
- `userRoles/{uid}`
  Lightweight role mapping.
- `hosts/{uid}`
  Host profile and payout configuration.
- `musicians/{uid}`
  Performer profile, payout configuration, availability, and booking state.
- `musicians/{uid}/reviews/{reviewId}`
  Host-created musician reviews.
- `gigs/{gigId}`
  Booking pipeline, host gig postings, accepted musician info, payout breakdown, and review state.

## Native Mapping Rules

The native alternates should keep the same responsibility split:

- `users`
  Fast bootstrap summary for session restore, role resolution, and dashboard header data.
- `hosts`
  Source of truth for host profile details.
- `musicians`
  Source of truth for performer profile details and availability.
- `gigs`
  Source of truth for booking pipeline and transaction state.

## Role Handling

- Host users map to role `host`
- Performer users map to role `musician`
- Native login should eventually resolve role from `users/{uid}` first, then fall back to `userRoles/{uid}`

## Current Native Status

The native SwiftUI and Kotlin projects are intentionally not wired to Firebase SDKs yet. They now match the same backend contract in their service layer and models so the future hookup can target the live website database without changing the overall data shape.
