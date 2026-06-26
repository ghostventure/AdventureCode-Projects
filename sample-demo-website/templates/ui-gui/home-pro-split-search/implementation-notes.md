# Implementation Notes

## App Targets

Apply this skin to:

- `app/page.jsx`
- `app/components/BasicLanding.jsx`
- `app/components/TopNav.jsx`
- `app/globals.css`

## Component Mapping

- `market-header` maps to the global top navigation.
- `consumer-panel` maps to the public landing hero.
- `finder-form` maps to the service/request starter UI.
- `quick-links` maps to service catalog shortcuts.
- `pro-panel` maps to provider-free manager/pro onboarding and signup preview.

## Integration Rules

- Do not use the reference site's logo, copy, or image.
- Use a licensed or client-provided interior/project image for the hero image
  slot when a client is selected.
- Keep billing and outbound provider integrations disabled in template mode.
- Keep the search and signup forms visual-only until the client-specific data
  flow is approved.

## Verification

Run these after applying the skin to the app:

```sh
npm run lint
npm run build
npm run smoke
```

