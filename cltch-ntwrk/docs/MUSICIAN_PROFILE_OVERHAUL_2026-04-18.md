# CLTCH Performer Profile Overhaul - 2026-04-18

Updated `musician-profile.html` so the performer profile feels cleaner, easier to scan, and less like a long stack of disconnected blocks.

## What Changed

- Reworked the top profile hero into a performer setup panel with direct shortcuts:
  - Edit setup
  - Open gigs
  - Find requests
- Converted dashboard rows into responsive grid cards.
- Tightened the profile dashboard styling with smaller radii and calmer borders.
- Converted the profile form into a two-column desktop layout.
- Updated form sections and inner paired fields to wrap with responsive grid behavior like the matched-gigs page.
- Kept heavy sections such as Availability and Payout full-width.
- Added phone fallbacks so form sections, action links, availability buttons, and save button stack cleanly.
- Replaced inline draft/auth account notes with a reusable profile note row.
- Fixed the completion counter so the visible `dashCompletionValue` updates correctly.

## Files

- `musician-profile.html`
- `mobile-web/musician-profile.html`

## Verification

- Extracted module script from `musician-profile.html` and `node --check` passed.
- `npm run build:mobile` passed.
- Extracted module script from `mobile-web/musician-profile.html` and `node --check` passed.
- `npm run sync:android` passed.
- `npm run sync:ios` passed.
- `npm run deploy:hosting` passed.
- Live smoke confirmed the deployed `musician-profile.html` includes the new hero actions, profile note row, two-column form CSS, and fixed completion value hooks.
- Host and performer profile wrapping was corrected again after matched-gigs comparison:
  - host grouped rows now use responsive grid wrapping
  - performer dashboard cards, form sections, and inner rows now use responsive grid wrapping
  - mobile mirror checks passed
  - hosting deploy passed
  - live smoke confirmed the root host and performer profile pages serve the new wrap rules

## Recovery Notes

- Main profile styling is still local to `musician-profile.html`.
- The completion value is shown by `#dashCompletionValue`.
- The dashboard refresh path is `renderProfileDashboard()`.
- Rebuild `mobile-web` after editing this page.
