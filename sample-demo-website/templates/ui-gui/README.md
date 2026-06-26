# UI/GUI Templates

Drop client-specific interface skins here. Each folder should be a swappable UI
package that can be applied to the default platform without changing the core
data, auth, security, workflow, or provider-placeholder layers.

## Folder Contract

Use one folder per client or reusable design direction:

```text
templates/ui-gui/
  default-portal/
    README.md
    theme.json
    tokens.css
    preview-notes.md
  home-pro-split-search/
    README.md
    theme.json
    style.css
    preview.html
    implementation-notes.md
    plug-and-play.json
  luxe-remodel-marketplace/
    README.md
    theme.json
    style.css
    preview.html
    implementation-notes.md
    plug-and-play.json
  pro-network-blueprint/
    README.md
    theme.json
    style.css
    preview.html
    implementation-notes.md
    plug-and-play.json
  registry.json
  active-template.json
```

## What Belongs Here

- Brand palettes and typography tokens
- Layout direction for landing, portal, dashboard, and manager views
- Component styling notes
- Client-specific navigation labels
- Placeholder imagery direction
- Accessibility and responsive notes
- Screenshots or preview references when available

## What Does Not Belong Here

- Firebase credentials
- Billing provider keys
- Email/SMS/API secrets
- Firestore rule changes
- Core data models
- Provider integration code

Those stay in the platform layer and are only wired during a leased-client
customization pass.

## Swap Process

1. Pick or copy a UI/GUI template folder.
2. Update `theme.json` for the client brand.
3. Apply `tokens.css` values into the app stylesheet or a client-specific skin.
4. Replace placeholder copy, imagery, and labels.
5. Run verification before deploy.

## Current Active GUI

The active GUI skin is `home-pro-split-search`.

Available variants:

- `default-portal`
- `home-pro-split-search`
- `luxe-remodel-marketplace`
- `pro-network-blueprint`

It is registered in:

- `templates/ui-gui/registry.json`
- `templates/ui-gui/active-template.json`
- `lib/gui-template-registry.js`

It is currently layered onto:

- `app/components/BasicLanding.jsx`
- `app/globals.css`
