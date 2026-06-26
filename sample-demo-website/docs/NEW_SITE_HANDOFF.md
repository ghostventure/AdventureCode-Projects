# New Site Handoff

Use this when cloning the template into a future website.

## 1. Copy The Template

Copy this folder into the new website folder, then update:

- `package.json` name
- `README.md` title and Firebase context
- `.firebaserc`
- `firebase.json` hosting target if needed
- `.env.example`
- `app/layout.jsx` metadata
- `app/sitemap.js` base URL
- `app/robots.js` host/sitemap URL

## 2. Configure Firebase

Create or select the Firebase project, then update:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

Deploy rules only after reviewing the collection contract:

```sh
npm run deploy:rules
```

## 3. Pick The Site Modules

Keep or customize these reusable layers:

- Auth/account
- Client workspace
- User database
- User profile
- Manager profile
- Manager workspace
- Communication
- Data/workflow
- Operations/quality
- Reliability/health
- Privacy/legal
- Platform controls

Remove only after confirming no route, rule, or test still references the module.

## 4. Add Domain UI

The template intentionally avoids final website UI. For a future site:

- Replace placeholder copy.
- Add brand design tokens.
- Add real imagery/assets.
- Add domain-specific landing and service pages.
- Keep the platform routes available for admin/manager setup unless the site does not need them.

## 5. Wire Real Integrations

Template adapters exist but real provider wiring is still per-site:

- Firebase Auth credentials
- Firestore production data
- Firebase Storage rules and upload paths
- Email provider
- SMS provider if used
- Analytics provider
- Webhook providers
- Backup/export storage
- Error reporting provider

## 6. Review Security

Before production:

- Tighten Content Security Policy once third-party scripts are known.
- Review Firestore rules for the final data model.
- Confirm manager/admin custom claims strategy.
- Connect the 10-minute idle sign-out callback to real Firebase Auth sign-out.
- Confirm delete/export privacy request handling.
- Confirm rate-limit backend storage if traffic may exceed one server instance.

## 7. Verify

Run:

```sh
npm run verify
```

Expected checks:

- ESLint
- npm audit
- Firestore rule contract tests
- Next production build
- Playwright route/API smoke tests
- Axe critical accessibility checks

## 8. Deploy

After verification:

```sh
npm run deploy
```

For rules only:

```sh
npm run deploy:rules
```

## 9. Final Handoff

Document:

- Firebase project/account
- Local preview URL
- Live URL
- Enabled modules
- Disabled/deferred modules
- Required environment variables
- Last `npm run verify` result
- Any provider credentials not stored in repo

