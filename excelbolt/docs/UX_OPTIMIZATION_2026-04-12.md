# Dexterity and GUI Optimization (2026-04-12)

## What changed

Target file:

- `excelbolt.jsx`

## Dexterity Improvements

- Hardened keyboard shortcut handling to avoid collisions while typing in inputs/textareas/contentEditable.
- Added direct shortcuts:
  - `Cmd/Ctrl+F`: jump to Connectors and focus connector search.
  - `Cmd/Ctrl+E`: jump to Templates (new export flow).
  - `Cmd/Ctrl+B`: enable batch export mode from keyboard.
  - `Cmd/Ctrl+Shift+S`: trigger sync for all connected sources.
- Updated command palette actions to include connector-search focus action (`Cmd/Ctrl+F`).
- Added skip-link support to jump directly to main content.

## GUI Improvements

- Added consistent `:focus-visible` rings for interactive controls.
- Added tactile button active state (`translateY(1px)`) for clearer click feedback.
- Added lightweight hover elevation treatment to major cards (`.eb-card-hover`).
- Added reduced-motion fallback (`prefers-reduced-motion`) to disable heavy animation when requested by user/system preference.

## Accessibility / UX outcomes

- Faster keyboard-only navigation between tabs and actions.
- Improved discoverability of command routing and search entry point.
- Better focus visibility and interaction confidence across light/dark modes.
