# CLTCH Sticky Tile and Card Table Cleanup

Date: 2026-05-22

## Scope

This pass keeps the guided assistant as the only persistent viewport helper and moves the shared quick action dock back into the page flow. It also extends the card-table wrapping system so common card groups fit into responsive columns instead of forcing awkward overflow or uneven stacking.

## Implemented Changes

- Updated `.cltch-quickdock` in `cltch-boilerplate.css` from a fixed bottom viewport rail to an in-page responsive action row.
- Kept `.cltch-assistant` fixed so the assistant remains available while users move through pages.
- Adjusted mobile quickdock and quick-palette spacing now that the quickdock no longer occupies the bottom viewport.
- Renamed the Loaded Kit items that implied floating or sticky tile behavior:
  - `Sticky Event-Day Footer` is now `Event-Day Action Footer`.
  - `Shortlist Floating Tray` is now `Shortlist Tray`.
- Added shared card-fit table CSS for repeated card grids:
  - role grids
  - demo grids
  - platform grids
  - contact grids
  - FAQ grids
  - analytics grids
  - command grids
  - operations grids
  - service lane grids
- Added child overflow guards so cards, media, and embedded content stay inside their table columns.
- Added a mobile fallback so those card tables collapse cleanly to one column on narrow screens.
- Tightened the card table after visual review so card groups use denser columns, lower padding, less forced row height, and smaller oversized role/process cards.
- Reworked `musician-matched-gigs.html` specifically after follow-up review:
  - Added page-level compact overrides after the shared stylesheet.
  - Reduced masthead, summary, stats, right-rail, and card-table bulk.
  - Converted matched queue rows from inline-styled loose blocks into real compact `.matched-gig-card` cards.
  - Updated the shared card-table counter so matched gig cards count correctly.
- Rebalanced `musician-matched-gigs.html` again after the page still read too left-heavy:
  - Removed the narrow left-content/right-rail split.
  - Let the primary performer sections span the full page width.
  - Converted the former rail into a full-width four-card control deck so the center and right side carry visual weight.
- Corrected the follow-up grid bug where old ID rules still forced the former rail panels to span the full row one at a time.
- Locked matched/upcoming/radar card tables on this page to responsive multi-column layouts even if a saved card-table state was previously set to list view.
- Reworked the desktop performer page into a 12-column dense grid so each section fills the highest available open space instead of stacking full-width rows.
- Adjusted the desktop performer card rhythm to three cards per row so matched, upcoming, radar, review, stats, and control cards have enough width and do not look squeezed.
- Replaced the 12-column shell with a true three-column dense desktop grid after review showed the page still read as too many columns.
- Final accepted direction:
  - `musician-matched-gigs.html` should use a true three-column desktop grid, not a 12-column shell.
  - Card tables on that page should hold to three cards per row on desktop, two columns on tablet, and one column on phone.
  - The layout should keep the "bubbles to the top" behavior by using dense grid placement, but it should not over-pack cards into skinny columns.
  - The accepted visual target is balanced page weight with useful empty space, not left-heavy stacking or squeezed micro-cards.

## Files Changed

- `cltch-boilerplate.css`
- `site-init.js`
- `mobile-web/cltch-boilerplate.css` after mobile sync
- `mobile-web/site-init.js` after mobile sync
- `musician-matched-gigs.html`
- `mobile-web/musician-matched-gigs.html` after mobile sync

## Validation

- `npm run build:mobile`
- `npm run build`
- `npm run deploy:hosting`
- Live CSS and runtime checks after deploy:
  - `https://cltch-ntwrk.web.app/cltch-boilerplate.css`
  - `https://cltch-ntwrk.web.app/site-init.js`
  - `https://cltch-ntwrk.web.app/musician-matched-gigs.html`
- Final live source check confirmed:
  - no remaining `repeat(12, ...)` shell rule on `musician-matched-gigs.html`
  - desktop card tables use `repeat(3, minmax(0, 1fr))`

## Operational Notes

- The assistant remains the only intended sticky/persistent helper.
- Modal overlays, access panels, toasts, skip links, and the quick-jump palette still use fixed positioning where appropriate because they are transient controls, not sticky tiles.
- The card-table rule is centralized in the shared stylesheet so future page cards can opt into `.cltch-card-fit-table` or `.card-table` without adding new one-off layout code.
- Future CLTCH dashboard layout work should check the actual rendered page before assuming shared CSS is winning; `musician-matched-gigs.html` has strong page-level overrides and browser-saved card-table states can change the perceived result.
