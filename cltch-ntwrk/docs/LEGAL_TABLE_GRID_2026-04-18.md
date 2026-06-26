# CLTCH Legal Table Grid - 2026-04-18

Terms and Privacy were restyled from card-like policy blocks into a cleaner table-grid format.

## What Changed

- `scripts/legal-components.js` now groups each legal heading and its content into a row.
- Each row uses:
  - left side: section title
  - right side: section details
- `cltch-boilerplate.css` now styles legal pages with a bordered document table instead of product cards.
- Mobile phones stack each legal row with the title above the details.

## Files

- `scripts/legal-components.js`
- `cltch-boilerplate.css`
- `mobile-web/scripts/legal-components.js`
- `mobile-web/cltch-boilerplate.css`

## Verification

- `node --check scripts/legal-components.js` passed.
- Visual smoke caught and fixed the first table grouping bug where headings could separate from their body copy.
- Live smoke confirmed the deployed legal script groups each heading with its body copy before building the table grid.

## Recovery Notes

- Terms and Privacy both call `window.LegalComponents.initPolicyLayout()`.
- The legal page table shell is `.legal-table-grid`.
- Row title cells use `.legal-section-title`.
- Row detail cells use `.legal-section-body`.
- Rebuild `mobile-web` after changing shared legal CSS or script files.
