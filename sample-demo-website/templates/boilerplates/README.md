# Boilerplates

Reusable starter templates for future websites built from this foundation.

These files are intentionally generic. Copy the pattern into a new route or component, then apply the website-specific brand, industry content, and final UI direction.

## Included

- `route-page.jsx`: standard workspace page route
- `component-card.jsx`: reusable card component pattern
- `protected-route.jsx`: auth guard placeholder pattern
- `firestore-service.js`: Firestore read/write service shape
- `form-schema.js`: Zod form validation shape
- `api-route.js`: basic API route shape
- `nonstick-layout-shell.jsx`: normal-flow page shell with main and aside regions
- `nonstick-action-row.jsx`: non-sticky action controls for form and workflow pages
- `nonstick-section-index.jsx`: in-page section links without sticky positioning
- `nonstick-footer.jsx`: full global non-stick footer with brand, link groups, and legal links
- `nonstick-compact-footer.jsx`: compact global non-stick footer for simpler pages
- `nonstick-layout.css`: shared responsive non-stick layout contract

## Non-Stick Footer Notes

The copy-ready footer starters above should stay in normal document flow. Do
not add `position: sticky` or `position: fixed` to footer boilerplates unless a
future client explicitly requests that behavior.

The live demo preview is mounted separately through
`app/components/GlobalNonstickFooter.jsx` and uses a dark full-width background
band so the footer boilerplate surface is visually obvious on every route.
