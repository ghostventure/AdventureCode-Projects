# CLTCH.NTWRK System Baseline

Last updated: 2026-04-02

This document is the consolidated recovery and baseline reference for the current live CLTCH.NTWRK website.

Use this first when something feels broken before changing auth, routing, Firestore rules, or dashboard behavior.

## Canonical live targets

- Firebase project: `cltch-ntwrk`
- Live Hosting URL: `https://cltch-ntwrk.web.app`
- Default Firebase CLI project in this repo: `.firebaserc` -> `cltch-ntwrk`
- Preferred deploy command: `npm run deploy:hosting`
- Preferred iOS wrapper sync command: `npm run sync:ios`
- `npm run deploy:hosting` now runs `scripts/guard-deploy.mjs` first and must be executed from the CLTCH repo root.
- Do not deploy CLTCH by hand from another repo with `firebase-tools deploy --project cltch-ntwrk`; that was the exact failure mode that pushed EstateHat output onto CLTCH Hosting.

## Canonical performer routes

These are the intended performer workspace pages:

- `musician-matched-gigs.html`
  - canonical page for `My Matched Gigs`
- `gig-radar.html`
  - canonical page for `Gig Radar`
- `musician-profile.html`
  - canonical page for `My Profile`

## Legacy performer route

- `musician-dashboard.html` still exists as a legacy route and still boots the performer dashboard code.
- It should be treated as compatibility surface, not the preferred page to link from the profile tabs.
- Current profile tab links in `musician-profile.html` point to:
  - `musician-matched-gigs.html`
  - `gig-radar.html`
  - `musician-profile.html`

## Auth and session guarantees

- Password users must verify email before protected access.
- Protected pages reload Firebase user state before enforcing `emailVerified`.
- Protected pages install the shared idle-session logic from `app/idle-logout.js`.
- Idle timeout is 5 minutes.
- A 1-minute warning appears before forced sign-out.
- Idle sign-out stores a same-role resume target for safe return after valid re-authentication.
- Website service-worker caching is intentionally disabled for the auth/dashboard path because stale cached code caused sign-in hangs and hard-refresh dependence.

## Protected pages that must stay aligned

These pages currently enforce verified auth and shared idle logout:

- `host.html`
- `host-profile.html`
- `musician-profile.html`
- `musician-dashboard.html`
- `musician-matched-gigs.html`
- `gig-radar.html`
- `performer-view.html`
- `support.html`

If one of these drifts from the others, auth behavior will become inconsistent again.

## Firestore structure in live use

- `users/{uid}`
  - canonical lightweight user summary
- `userRoles/{uid}`
  - active role persistence
- `hosts/{uid}`
  - host profile
- `musicians/{uid}`
  - performer profile
- `gigs/{gigId}`
  - booking pipeline and match source of truth

## Current performance boundaries

- `musicians/{uid}.bookedDates`
  - bounded rolling calendar cache only
  - not the long-term booking history source of truth
- Shared query builders live in `app/gig-queries.js`
- Performer tier thresholds live in `app/performer-tier.js`
  - `Junior` by default
  - `Senior` after 5 `B` or above ratings
  - `Rising Star` after 20 `A` or above ratings
  - `Sensei` after 30 `A` or above ratings
  - `GOAT` after 200 `A` or above ratings
  - `Masterclass` after 500 `A` or above ratings
- Business Class is gated behind performer tier:
  - only `Senior` and above may request it
  - only `businessClassActive == true` should display the verified icon to hosts
- Open gig feeds are bounded to upcoming gigs and capped
- Accepted performer gig reads are date-ordered and capped
- Host gig reads are ordered by `createdAt` and capped
- Host match-count reads narrow by `performerType` when possible

## Current dexterity layer

- Shared interaction layer lives in:
  - `site-init.js`
  - `cltch-boilerplate.css`
- Current shared dexterity behaviors:
  - sticky header
  - stronger `focus-visible` states
  - minimum 44px touch targets for key nav controls
  - skip-to-content link
  - floating quick dock for top actions
  - lightweight quick-jump palette for pages, tabs, and major actions
  - keyboard shortcuts:
    - `Alt+1/2/3` quick navigation
    - `/` focus first search field or open the quick-jump palette
    - `Ctrl/Cmd+K` open the quick-jump palette
    - `Esc` blur active field or close the quick-jump palette
- Shared guided assistant also lives in `site-init.js`
  - opens as a lightweight help drawer
  - provides page-specific next-step guidance
  - includes a short checklist, direct action chips, and quick-question topic buttons
  - remembers the last help topic picked on each page
  - is intentionally not a free-form chatbot

## Current Gig Radar capabilities

- `gig-radar.html` is the canonical incoming-opportunity feed for performers.
- Current live Radar features include:
  - search
  - queue filters
  - saved gigs
  - sort by best match, soonest, or highest pay
  - radar summary cards for best match, urgent gigs, saved gigs, and actionable-now gigs
  - fit insight copy on each gig card
  - match-purity filtering that suppresses already-booked, blocked-date, unavailable, and weak-fit gigs before they render

## Firestore indexes now expected by the live site

- open gig feed:
  - `status + date + createdAt`
- accepted performer bookings:
  - `acceptedBy + status + date`
- host gig queue:
  - `hostId + createdAt`
- available performers:
  - `available + performerType`

If these indexes are removed or drift from query code, the live app will slow down or fail with Firestore index errors.

## Things that are intentionally true right now

- Plaid code exists but is not active on the live website path.
- A Stripe Connect scaffold now exists in `functions/index.js`, but it is not wired into the live CLTCH UI yet.
- The intended future automated surcharge path is Stripe Connect destination charges with Express connected accounts.
- `support.html` is a signed-in diagnostics page, not a public support page.
- `performer-view.html` is protected, not public.
- Service workers are intentionally not active for the website auth/dashboard flow.
- The Capacitor iOS wrapper mirrors the root site through `scripts/sync-mobile-web.mjs` and should not depend on a stale manual file allowlist.

## Do not casually undo these

- Do not re-enable general website service-worker caching without a controlled auth regression pass.
- Do not remove verified-email gating for password users.
- Do not turn `bookedDates` back into unbounded embedded history.
- Do not broaden open-gig listeners back to unconstrained `status == open` reads without date bounds.
- Do not remove explicit Firebase project targeting from deploy commands.

## Fast smoke checklist

1. Sign up with email/password.
2. Verify email.
3. Sign in.
4. Open `My Profile`.
5. Open `My Matched Gigs`.
6. Open `Gig Radar`.
7. Wait for idle warning.
8. Confirm timeout and re-login resume.
9. Confirm performer pages no longer require hard refresh.
10. Confirm host and performer pages still load under verified auth only.
