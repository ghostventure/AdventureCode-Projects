# CLTCH Tile / Widget Wrap - 2026-04-18

Updated the shared CLTCH layout so tile and widget areas use the page width instead of forcing long single-column scrolling.

## What Changed

- Changed shared feature tiles to use responsive `auto-fit` columns.
- Changed the CLTCH Dispatch Kit item list into a responsive tile grid.
- Dispatch Kit tools now wrap into multiple columns on larger screens.
- Added page-specific wrapping for `gig-radar.html`:
  - analytics cards
  - radar summary cards
  - upcoming booking cards
  - live request cards
  - review cards
- Added page-specific wrapping for `host-profile.html`:
  - host profile form fields
  - payment setup fields
- Tightened `host-profile.html` again so grouped field rows use the same responsive grid wrapping as matched gigs.
- Tightened `musician-profile.html` so dashboard cards, form sections, and inner field rows use responsive grid wrapping instead of holding rigid columns.
- Added shared wrapping for legal pages:
  - Terms policy sections
  - Privacy policy sections
  - full-width intro copy with wrapped section cards underneath
- Reworked Terms and Privacy again from card-style sections into a cleaner table-grid format:
  - section titles in the left column
  - policy details in the right column
  - bordered document rows instead of product cards
  - one-column table rows on phones
- Dispatch Kit tools still collapse to one clean column on phones.
- Kept long text protected with existing overflow wrapping.

## Files

- `cltch-boilerplate.css`
- `gig-radar.html`
- `host-profile.html`
- `musician-profile.html`
- `terms.html`
- `privacy.html`
- `mobile-web/cltch-boilerplate.css`
- `mobile-web/gig-radar.html`
- `mobile-web/host-profile.html`
- `mobile-web/musician-profile.html`
- `mobile-web/terms.html`
- `mobile-web/privacy.html`
- Android wrapper web assets
- iOS wrapper web assets

## Verification

- `npm run build:mobile` passed.
- `npm run sync:android` passed.
- `npm run sync:ios` passed.
- Terms and Privacy legal wrapping was included in the mobile mirror and wrapper sync.
- Host and performer profile wrapping was rechecked in root and mobile mirrors; root/mobile script extraction passed syntax checks.
- Android and iOS wrappers were resynced after the host/performer profile wrapping correction.
- `npm run deploy:hosting` passed after the host/performer profile wrapping correction.
- Live smoke confirmed root `host-profile.html` and `musician-profile.html` serve the new responsive wrap rules.

## Recovery Notes

- The Dispatch Kit grid is controlled by `#cltchComponentList` in `cltch-boilerplate.css`.
- The shared quick action tiles are controlled by `.cltch-feature-grid`.
- Terms and Privacy wrapping is controlled by `.legal-layout` and `.legal-section` in `cltch-boilerplate.css`.
- The legal table format is controlled by `.legal-table-grid`, `.legal-section-title`, and `.legal-section-body`.
- `scripts/legal-components.js` builds the Terms/Privacy table rows from each `h2` and its following content.
- After CSS edits, rerun `npm run build:mobile` so `mobile-web` does not drift.
