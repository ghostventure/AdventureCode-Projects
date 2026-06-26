# Deploy Log - 2026-04-12

## Release scope

- Installed and recorded additional dependency waves, including the latest 40-item expansion.
- Added mechanics feature-flag scaffolding for:
  - Schema Registry
  - Data Lineage
  - Reconciliation
  - Dead-letter Queue
- Applied dexterity and GUI optimizations in `excelbolt.jsx`:
  - shortcut safety and coverage (`Cmd/Ctrl+F`, `Cmd/Ctrl+E`, `Cmd/Ctrl+B`, `Cmd/Ctrl+Shift+S`)
  - connector search focus routing
  - skip-link + focus-visible upgrades
  - reduced-motion handling
  - hover/interaction polish on major cards

## Build

- Command: `npm run build`
- Result: success

## Deploy

- Command: `npx firebase-tools deploy --only hosting --project excelbolt`
- Result: success
- Hosting URL: `https://excelbolt.web.app`
- Console: `https://console.firebase.google.com/project/excelbolt/overview`
