# Sample Demo Website

Reusable Next.js and Firebase website template. This project is intentionally
domain-neutral at the platform layer so the base can be leased and customized
for future client websites.

The current demo is meant to feel fully functioning as a visual placeholder
portal. Billing, outbound email/SMS, analytics, webhooks, and other external
provider integrations remain disabled until a leasing client selects and
configures those services.

## Firebase Context

- Firebase account: `blacklionmediastudio@gmail.com`
- Firebase project ID: `sample-demo-website-2026`
- Firebase project number: `778970398987`

## Local Commands

```sh
npm install
npm run dev
npm run build
npm run build:static
npm run verify
npm run deploy
npm run deploy:static
npm run deploy:rules
```

Current local preview URL when the dev server is running:

```text
http://127.0.0.1:3012
```

## Documentation Index

- [Template Manifest](docs/TEMPLATE_MANIFEST.md): full inventory of installed routes, APIs, libraries, rules, and template layers.
- [New Site Handoff](docs/NEW_SITE_HANDOFF.md): checklist for cloning this template into a future website.
- [Verification Report](docs/VERIFICATION_REPORT.md): latest verification status and commands.
- [Revisit Notes 2026-05-25](docs/REVISIT_NOTES_2026-05-25.md): latest component expansion, verification status, known gaps, and parked ideas.
- [Access Control Audit 2026-05-25](docs/ACCESS_CONTROL_AUDIT_2026-05-25.md): public, client, manager, admin, and system-only route recommendations.
- [Project Notes](PROJECT_NOTES.md): chronological setup and installation record.
- [UI/GUI Templates](templates/ui-gui/README.md): swappable client interface skins and starter theme structure.

## Current Status

- Base framework: Next.js App Router
- Initial route: `/`
- Basic landing layer: `/` provides the public home-services landing page and b-roll showcase. Internal module dashboards stay behind protected routes.
- Basic auth page: `/auth` provides sign-in and sign-up placeholder forms.
- Deployment target: Firebase project `sample-demo-website-2026`
- Live Firebase status: static visual demo is deployed at `https://sample-demo-website-2026.web.app`.
- Deployment mode: static Firebase Hosting via `firebase.static.json` and `deploy-static` because the project does not have billing enabled for Cloud Functions/Cloud Run framework hosting.
- Live global footer: non-stick footer boilerplate preview is mounted in the shared app shell and uses a dark full-width background band.
- Home services b-roll: local WebP imagery is installed for repairs, fixture installation, exterior maintenance, and plumbing repair; the images appear in the landing hero, homepage b-roll section, and global visual strip.
- Theme mode: global Day/Night toggle is installed in the shared navigation, persists to `localStorage`, respects system dark preference on first load, and updates shared CSS tokens across the shell.
- Page text wrapping: global wrapping safeguards keep long labels, route text, buttons, and compact nav/footer copy inside their containers across mobile and desktop breakpoints.
- Consolidation status: shared action/link CSS now covers landing CTAs, API shortcut links, and control chips; reliability probe payloads are centralized in `lib/reliability.js`; GUI template nav wrapping no longer uses a separate nowrap override.
- Access control: public users can reach the landing/auth/legal/data-request/maintenance surfaces; client, manager, admin, health, platform, security, workflow, user, and protected preview API surfaces require a demo role or real-auth replacement. Static Hosting overwrites protected route HTML with a sign-in-required shell.
- HTML cache policy: Firebase Hosting serves the HTML surface with `Cache-Control: no-cache, max-age=0, must-revalidate` so visible UI updates are not hidden behind the previous one-hour default cache.
- Tamper resistance: centralized security header contract, same-origin resource policy, no-store placeholder APIs, guarded-route request tracing, and middleware rejection for obvious tamper/debug query patterns.
- Access control policy: `lib/route-access-policy.js` classifies public, client, manager, admin, and system-only routes; `middleware.js` enforces it in framework mode, and `RouteAccessGate` enforces the visible static demo shell.
- Dexterity optimization: swap-ready UI structure, directly reachable operator routes, provider-free demos, and a consolidated static deploy script.
- Active plug n play GUI: `home-pro-split-search`, with additional `luxe-remodel-marketplace` and `pro-network-blueprint` variants available in `templates/ui-gui/`.
- Public positioning: broad home services marketplace for handyman-style repairs, installations, maintenance, estimates, scheduling, and service history.
- Firebase config: `.firebaserc` and `firebase.json`
- Latest verification after the access-control pass: `npm run lint`, `npm run build`, `npm run build:static`, and `npm run smoke` completed successfully
- User database route: `/users`
- UX navigation routes: `/`, `/users`, `/auth`, `/client`, `/operations`, `/manager`, `/admin`, `/security`
- Platform routes: `/platform`, `/privacy`, `/terms`, `/data-request`, `/maintenance`
- Communication route: `/communication`
- Data/workflow route: `/data-workflow`
- Operations/quality route: `/operations-quality`
- Manager profile preview API: `/api/manager-profile-preview`
- Full local verification command: `npm run verify`
- Latest full verification coverage was rerun on 2026-05-25 as separate commands after the tamper-resistance pass. Screenshot QA is the remaining visual verification gap before the UI pass.

## Hardening Baseline

- Security headers are defined in `next.config.mjs`.
- Browser source maps are disabled for production.
- `X-Powered-By` is disabled.
- Static Next assets use immutable cache headers.
- `npm run verify` runs linting, high-severity audit checks, and production build.
- Deployment scripts pin both project ID and Firebase account.
- `postcss` is pinned through `overrides` to avoid the moderate advisory present in the transitive Next dependency tree.

## User Database

The user database foundation is Firestore-ready and role-aware.

- Collection: `users`
- Roles: `client`, `manager`
- Statuses: `active`, `invited`, `paused`, `archived`
- Shared model: `lib/user-database.js`
- Firebase client helper: `lib/firebase-client.js`
- Security rules: `firestore.rules`
- Indexes: `firestore.indexes.json`
- UI route: `/users`

Managers can read and manage user records when their own user document has role `manager` and status `active`. Clients can read their own user record. All other Firestore access is denied by default.

## UX Navigation Components

Navigation is installed as reusable infrastructure, not final UI polish.

- Route registry: `lib/navigation.js`
- App shell: `app/components/AppShell.jsx`
- Top navigation: `app/components/TopNav.jsx`
- Homepage nav overview: `app/components/NavOverview.jsx`
- Placeholder routes: `/operations`, `/manager`, `/security`

## Installed Component Layer

Installed non-client-specific components for the platform foundation.

- Auth shell, role routing preview, session/loading/error/empty states
- Auth/account lifecycle: email verification, password change, MFA/passkey placeholders, device sessions, login history, claims sync, invite acceptance, onboarding, recent-login gates, auth error mapping
- User profile lifecycle: completion scoring, avatar metadata, contact preferences, address book, alternate contacts, billing metadata, identity status, account activity, privacy controls, attachments, manager assignments, tags, duplicate detection, delegated access
- User profile governance: version history, field-level permissions, review queue, custom fields, account grouping, retention policy, import mapping
- Breadcrumbs, command/search preview, toast stack, modal/drawer preview
- Client profile, property profile, request form, appointment scheduler, message thread, invoice status, documents, account history
- Manager dashboard, directory filters, intake queue, estimate builder, job scheduler, assignment board, task checklist, status pipeline, activity log, permissions panel
- Manager profile lifecycle: permissions, team assignment, workload capacity, escalation role, approval limits, audit summary, delegation, managed accounts, availability, access review
- Admin/security controls, invite flow, audit log, rule status, session warning, sensitive-action confirmation
- Lease-ready visual placeholders: service catalog, service package detail, quote review, project detail, onboarding wizard, tenant customization, document/signature state, support ticket, media gallery, notification preferences, client dashboard summary, manager command center, lease setup checklist, module enable matrix, form/empty/loading/error variants, mobile previews, demo seed switcher, deployment status, component inventory, lease presets, theme swatches, legal review, data retention controls, walkthrough controls, archive/history, help/FAQ, and template-vs-leased comparison

Client-specific services, copy, brand assets, imagery, legal language, and final workflows are intentionally deferred until a client leases the template.

## Additional Platform Components

Installed the remaining domain-neutral infrastructure components.

- Zod validation schemas for invites and requests
- Firebase Auth role-routing model
- Firestore read helper functions
- Data table
- Calendar board
- Kanban board
- File upload preview
- CSV/PDF export action preview
- Environment readiness panel
- Health check page and `/api/health`
- Reliability endpoints: `/api/live`, `/api/ready`, `/api/status`
- Sitemap and robots generation
- Route middleware placeholder for future session guards
- Playwright route smoke tests
- Firebase Auth adapter
- Protected route wrapper
- Firestore CRUD service factory
- Firebase Storage upload helper
- Notification center
- Paginated data table
- Offline/connection banner
- Global route error boundaries
- Firestore rules template tests
- Feature flags and maintenance mode adapter
- Rate-limit helper and preview API route
- Consent/privacy/terms/data-request boilerplate
- Email notification adapter
- Content model adapter
- SEO/schema helper utilities
- Backup/export manifest utilities
- Role invitation helper
- Session activity audit helper
- Accessibility smoke tests with Axe
- Reliability utilities for retry/backoff, circuit breakers, error budgets, incidents, graceful degradation, and structured logs
- Communication utilities for conversations, messages, notifications, email queue records, delivery receipts, webhook events, and status updates
- Data/workflow utilities for collection registry, state transitions, approvals, import/export jobs, automation rules, and reporting definitions
- Operations/quality utilities for QA gates, release readiness, runbooks, change control, quality findings, scoring, and post-launch monitors
- User profile utilities for completion, avatars, preferences, addresses, contacts, identity, privacy, attachments, assignments, tags, duplicates, and delegated access
- User profile governance utilities for snapshots, controlled edits, manager review, custom fields, account groups, retention, and import mapping
- Manager profile utilities for permission scopes, teams, workload, escalation, approval authority, audit summaries, delegation, managed accounts, availability, and access review

Run the full local verification:

```sh
npm run verify
```

Run only accessibility checks:

```sh
npm run test:a11y
```

Deploy the no-billing static visual demo:

```sh
npm run deploy:static
```

Full Next.js framework deployment through `firebase.json` requires Cloud
Functions, Cloud Build, Artifact Registry, and Cloud Run. Google blocked those
services on this project because no billing account is attached, so the current
public demo is intentionally static with placeholder API JSON files.

## Boilerplates

Reusable boilerplates live in `templates/`.

- Route page starter
- Component card starter
- Protected route placeholder
- Firestore service starter
- Zod form schema starter
- API route starter
- Global non-stick layout shell starter
- Global non-stick action row starter
- Global non-stick section index starter
- Global non-stick footer starter
- Global non-stick compact footer starter
- Shared non-stick layout CSS contract
- New-site checklist
- Deploy checklist
- Firebase sign-out snippet
- UI/GUI template skins in `templates/ui-gui/`

The visible footer preview is installed globally through
`app/components/GlobalNonstickFooter.jsx` and mounted by
`app/components/AppShell.jsx`. It is intentionally normal-flow and non-sticky.
The reusable copy-ready footer starters remain in `templates/boilerplates/`.

## B-Roll Imagery

Local home-services b-roll assets live in `public/images/home-services/`.

- `kitchen-cabinet-repair.webp`: landing hero and repairs imagery
- `light-fixture-install.webp`: installation imagery
- `walkway-pressure-wash.webp`: exterior maintenance imagery
- `sink-plumbing-repair.webp`: plumbing service-call imagery

Only optimized WebP files are kept in the project and deployed. The original
generated PNGs remain in Codex's generated image store for reference, while the
rendered site uses WebP paths through `lib/home-service-broll.js`.
`scripts/build-static-deploy.mjs` copies `public/` into `deploy-static/` so the
WebP assets are included in Firebase Hosting deploys.

## Theme Mode

Day/Night theme support is global.

- `app/components/ThemeToggle.jsx`: client-side toggle in the shared nav
- `app/layout.jsx`: early theme boot script to avoid a wrong-theme flash
- `app/globals.css`: day/night CSS token sets and shared component adaptation
- Storage key: `sample-demo-theme`

If no saved preference exists, the site follows `prefers-color-scheme`. Once the
toggle is used, the selected day or night mode persists across routes.

## Notes

The content security policy currently allows inline scripts and eval because Next.js needs those allowances in development and in some generated runtime paths. Tighten this later after the final production behavior and third-party integrations are known.
