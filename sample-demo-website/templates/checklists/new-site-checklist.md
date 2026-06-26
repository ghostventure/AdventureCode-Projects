# New Site Checklist

Use this when creating a future website from this template.

## Foundation

- Set Firebase project ID in `.firebaserc`.
- Set deploy scripts in `package.json`.
- Add Firebase web app config to `.env.local`.
- Confirm `npm run verify` passes.

## Security

- Review CSP for the final third-party services.
- Deploy Firestore rules and indexes.
- Add Firebase Auth sign-out to the session provider.
- Add protected-route enforcement for client, manager, and admin pages.
- Run route smoke tests before deploy.

## Product Layer

- Add industry-specific routes.
- Add industry-specific components.
- Replace placeholder copy.
- Add real imagery/assets.
- Run final accessibility and mobile checks.
