# Stripe Connect Setup

Last updated: 2026-04-28

This file documents the prepared but inactive Stripe scaffold for CLTCH.NTWRK.

## Goal

Collect the host payment, retain CLTCH.NTWRK's 2% platform surcharge, and route performer payout through Stripe Connect.

Recommended model:

- Stripe Connect
- Express connected accounts for performers
- Destination charges
- `application_fee_amount` for CLTCH.NTWRK's 2% surcharge

## Why this model

- It matches CLTCH.NTWRK's marketplace flow
- The host can pay a single total
- The performer payout can be transferred to a connected account
- CLTCH.NTWRK can retain the 2% platform fee in a controlled way
- Apple Pay and Google Pay can be supported through Stripe's payment flow later

## Current repo scaffold

Prepared backend endpoints live in `functions/index.js`:

- `stripeConfig`
- `stripeCreateConnectedAccount`
- `stripeCreateOnboardingLink`
- `stripeCreateHostCheckoutIntent`

The `functions/package.json` dependency list now includes `stripe`.

Prepared front-end touchpoints:

- `app/backend-api.js`
- `app/stripe-connect.js`
- `musician-profile.html`
  - performer-facing Stripe onboarding button
  - currently stays disabled until Stripe config exists
- `host-profile.html`
  - host-facing automated checkout readiness status
  - currently reports platform-readiness only

## Environment variables expected

These are not set in the repo.

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PLATFORM_BASE_URL`

Recommended `STRIPE_PLATFORM_BASE_URL` value for production:

- `https://cltch-ntwrk.web.app`

## Firestore shape used by the scaffold

Connected accounts are stored under:

- `stripeAccounts/{uid}/roles/{role}`

Current stored fields:

- `accountId`
- `role`
- `uid`
- `chargesEnabled`
- `payoutsEnabled`
- `detailsSubmitted`
- `createdAt`
- `updatedAt`

Gig-side Stripe prep fields written by the scaffold:

- `stripeCheckoutPreparedAt`
- `stripePaymentIntentId`
- `stripeConnectedAccountId`

## Current backend status

- Static Hosting now has `/api/...` rewrites prepared in `firebase.json` for the Stripe endpoints.
- `app/stripe-connect.js` now resolves through `app/backend-api.js`, which can fall back to direct Cloud Functions URLs if same-origin `/api` is unavailable.
- Additional backend utility endpoints now exist for:
  - `apiHealth`
  - `apiSessionBootstrap`

## Current limitations

- This scaffold is not wired into live CLTCH website UI yet
- It is intentionally inactive until the correct Stripe account is identified
- The current Firebase project still has Cloud Functions deployment limits on the existing plan, so function activation may require Blaze
- The live site still only models and discloses the 2% fee. It does not auto-collect it yet

## Handoff steps once the correct Stripe account is identified

1. Confirm the CLTCH business Stripe account
2. Add `STRIPE_SECRET_KEY`
3. Add `STRIPE_PUBLISHABLE_KEY`
4. Confirm CLTCH payout bank details in Stripe
5. Deploy Cloud Functions in the `cltch-ntwrk` Firebase project
6. Wire performer onboarding from `musician-profile.html`
7. Wire host checkout from `host.html` / `booking.html`
8. Test host payment, performer payout, and 2% fee retention end to end

## Notes

- Plaid remains separate from this plan and is not the preferred path for the marketplace surcharge flow
- Business logic should continue to treat the 2% fee as a platform fee, not performer pay
