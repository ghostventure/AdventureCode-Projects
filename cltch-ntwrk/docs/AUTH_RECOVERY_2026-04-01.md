# CLTCH.NTWRK Auth Recovery Notes

Last updated: 2026-04-01

This note records the auth failure that made CLTCH.NTWRK appear to require `Ctrl+Shift+R` before sign-in would work, plus the fixes that were kept.

## Main symptoms

- Sign-up initially failed because the root `auth.html` page was still using older role-routing behavior.
- Password verification emails appeared inconsistent because verification-send failures were being swallowed in the UI.
- Sign-in sometimes appeared to hang on the auth page until a hard refresh was used.
- A later cleanup pass briefly caused the auth page to refresh repeatedly.

## Root causes

### 1. Root auth flow drifted from the newer mobile-web flow

- The root `auth.html` had older auth behavior than `mobile-web/auth.html`.
- Role persistence and `/users/{uid}` summary writes were missing on some paths.
- Result: users could authenticate but still land in inconsistent routing states.

### 2. Verification flow errors were hidden

- `sendEmailVerification(...)` failures were caught and ignored.
- Result: the page could tell users to check their inbox even when Firebase had rejected the send.

### 3. Browser-side stale code, not Firebase credential failure

- The big clue was that `Ctrl+Shift+R` fixed sign-in immediately.
- That meant old client state was surviving between loads.
- The original service-worker strategy and asset caching kept stale auth/dashboard code alive after deploys.

### 4. Over-aggressive cleanup created a reload loop

- A temporary auth-page cleanup script plus `Clear-Site-Data` headers caused the page to keep wiping the flag that should have stopped the reload.
- Result: the auth page refreshed continuously.

## Final state kept in production

### Auth behavior

- Root `auth.html` now uses the stronger role-aware auth flow.
- Password sign-up sends verification and returns the user to sign-in.
- Password sign-in reloads the Firebase user before checking `emailVerified`.
- Protected host and performer pages also reload the Firebase user before enforcing verification.
- Password users must verify before protected app access.

### Session controls

- Protected pages auto-sign-out after 5 minutes of inactivity.
- Auth and protected pages show clearer reason-based status messages, including verification and idle-timeout states.
- Idle timeout now also stores a safe same-role resume target, so users can return to the interrupted protected page after signing in again.

### Post-recovery workflow hardening

- Host/performer mode switching is now centralized in `app/mode-switch.js` so redirect behavior does not drift page by page.
- Shared dirty-form warnings now protect the host post form and both profile forms from accidental navigation loss.
- Performer accepted gigs now remain visible in both:
  - the upcoming gigs list on `musician-dashboard.html`
  - the calendar-backed `bookedDates` view on `musician-profile.html`
- Future accepted gigs can now be canceled from the performer upcoming list, which reopens the gig and removes it from the performer's booked calendar state.

### Security rules

- Firestore rules now require verified authenticated users for protected owner writes and gig access.

### Cache and platform state

- HTML, `site-init.js`, `sw.js`, and `/app/**` are served with `Cache-Control: no-store`.
- The website no longer uses an active offline caching service worker for production auth flows.
- `site-init.js` now unregisters any existing service workers instead of registering one.
- `sw.js` is retained only as a self-unregistering cleanup worker in case old clients still request it.

## Files involved

- `auth.html`
- `host.html`
- `host-profile.html`
- `musician-dashboard.html`
- `musician-profile.html`
- `app/firebase-client.js`
- `app/user-db.js`
- `site-init.js`
- `sw.js`
- `firestore.rules`
- `firebase.json`

## Do not reintroduce without care

- Do not add back aggressive `Clear-Site-Data` headers on every HTML response.
- Do not add auth-page reload loops for cache cleanup.
- Do not re-enable an offline-first service worker on CLTCH auth/dashboard pages without a versioning and cache-busting plan that is tested against sign-in, sign-out, and post-deploy flows.

## First things to check if auth starts hanging again

1. Confirm whether normal refresh fails but `Ctrl+Shift+R` works.
2. If yes, suspect stale browser-served code before suspecting Firebase auth itself.
3. Check whether a service worker is registered for `cltch-ntwrk.web.app`.
4. Confirm current Hosting cache headers in `firebase.json`.
5. Confirm the root `auth.html` is the page being served and not a stale cached copy.
