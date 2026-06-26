# Sample Demo Website

## 2026-06-26 GitHub Upload Note

- Uploaded Sample Demo Website to GitHub repository `https://github.com/PlugzTech/AdventureCode-Projects`.
- Repository subfolder: `sample-demo-website/`.
- The GitHub copy is source-focused. It intentionally excludes local dependencies, build output, static deploy output, Firebase cache, test artifacts, temporary files, local environment files, local databases, keys, and archives.
- `.env.example` is retained as a safe setup reference.
- The GitHub repository is currently public, so do not commit credentials, private customer data, local databases, unpublished templates, or operational secrets.

## Firebase Project Lookup

Lookup date: 2026-05-23

The Firebase project was found under the same Firebase CLI account used for the Black Lion Media Studio project.

## Verified Firebase Account

- Account: `blacklionmediastudio@gmail.com`

## Sample Demo Website Project

- Display name: `sample-demo-website-2026`
- Project ID: `sample-demo-website-2026`
- Project number: `778970398987`
- Resource location ID: `[Not specified]`

## Related Black Lion Project In Same Account

- Display name: `Black Lion Studios`
- Project ID: `black-lion-media-studio`
- Project number: `842520208813`
- Resource location ID: `[Not specified]`

## Verification Command

```sh
npx firebase-tools projects:list --account blacklionmediastudio@gmail.com
```

The command returned two projects total for this account:

- `black-lion-media-studio`
- `sample-demo-website-2026`

## Platform Baseline

Created a functioning Next.js App Router platform in this folder on 2026-05-23.

- Framework: Next.js
- Runtime UI: React
- Initial route: `/`
- Firebase target: `sample-demo-website-2026`
- Firebase account: `blacklionmediastudio@gmail.com`

## Hardening Added

- Security headers and content security policy in `next.config.mjs`
- Disabled `X-Powered-By`
- Disabled production browser source maps
- Immutable cache headers for Next static assets
- ESLint flat config using the Next core-web-vitals plugin
- `npm run audit` dependency security check
- `postcss` override to resolve the moderate transitive advisory
- Pinned deploy scripts with explicit Firebase project and account

## Verification

The following checks passed after hardening:

```sh
npm run lint
npm run audit
npm run build
```

Local dev server URL used during setup:

```text
http://127.0.0.1:3010
```

## User Database Installation

Installed a Firestore-ready user database foundation for clients and managers.

- Added Firebase web SDK dependency.
- Added `.env.example` for public Firebase client configuration.
- Added `lib/firebase-client.js` for Firebase app and Firestore initialization.
- Added `lib/user-database.js` for roles, statuses, field contract, sample records, normalization, and validation.
- Added `/users` route to view the client and manager model.
- Added reusable user UI components in `app/components`.
- Added `firestore.rules` with owner and active-manager access controls.
- Added `firestore.indexes.json` for role/status/display name user queries.
- Updated `firebase.json` to include Firestore rules and indexes.
- Added `npm run deploy:rules` for deploying Firestore rules and indexes.

## UX Navigation Installation

Installed reusable navigation components before the final UI pass.

- Added `lucide-react` for standard interface icons.
- Added `lib/navigation.js` as the route registry.
- Added `AppShell`, `TopNav`, and `NavOverview` components.
- Wrapped the app in the shell from `app/layout.jsx`.
- Added placeholder routes for `/operations`, `/manager`, and `/security`.
- Kept styling functional and responsive so final visual design can happen later.

## Smoke Test - 2026-05-23

Ran a connection and fault sweep after installing the user database and UX navigation.

Checks passed:

```sh
npm run lint
npm run audit
npm run build
```

Production server smoke test:

```text
http://127.0.0.1:3011/
```

Route status results:

- `/` returned HTTP 200
- `/users` returned HTTP 200
- `/operations` returned HTTP 200
- `/manager` returned HTTP 200
- `/security` returned HTTP 200
- `/does-not-exist` returned HTTP 404

Header checks confirmed:

- Content security policy present
- Referrer policy present
- Content type sniffing protection present
- Frame blocking present
- Permissions policy present
- Static CSS served with immutable cache headers

Config checks:

- `package.json` parsed successfully
- `firebase.json` parsed successfully
- `firestore.indexes.json` parsed successfully
- Firebase CLI resolved project `sample-demo-website-2026`
- Firestore rules compiled successfully during Firebase CLI dry run

Fault found and resolved:

- The long-running dev server on port `3010` returned intermittent HTTP 500 responses after dependency and Next config changes.
- Cause: stale generated `.next` server state in the running dev process.
- Resolution: stopped the stale dev server, cleared `.next`, rebuilt from scratch, and smoke-tested using a clean production server on port `3011`.

Firebase dry-run note:

- Command used: `npx firebase-tools deploy --only firestore:rules,firestore:indexes --project sample-demo-website-2026 --account blacklionmediastudio@gmail.com --dry-run`
- Result: Firestore rules compiled successfully and no rules/index deployment was released.
- During dry-run preparation, Firebase CLI initialized required Firestore project prerequisites for `sample-demo-website-2026`.

## Domain-Neutral Component Installation

Installed the broad UX/client/manager/admin component layer while intentionally leaving client-specific service components for a later pass.

New routes:

- `/auth`
- `/client`
- `/admin`

Expanded routes:

- `/operations`
- `/manager`
- `/security`

Installed component groups:

- Auth shell
- Role router preview
- Breadcrumbs
- Command/search menu preview
- Toast notifications
- Modal/drawer preview
- Empty, loading, and error states
- Client profile, property profile, request form, scheduler, messages, invoice status, documents, and account history
- Manager dashboard, directory filters, intake queue, estimate builder, scheduler, assignment board, task checklist, status pipeline, activity log, and permissions
- Account status controls, invite flow, audit log viewer, rule status panel, session timeout warning, and sensitive action confirmation

Verification after installation:

```sh
npm run lint
npm run audit
npm run build
```

Route smoke test on `http://127.0.0.1:3011`:

- `/` returned HTTP 200
- `/auth` returned HTTP 200
- `/client` returned HTTP 200
- `/users` returned HTTP 200
- `/operations` returned HTTP 200
- `/manager` returned HTTP 200
- `/admin` returned HTTP 200
- `/security` returned HTTP 200
- `/does-not-exist` returned HTTP 404

## Additional Domain-Neutral Platform Installation

Installed the remaining general platform infrastructure outside the client-specific service layer.

Added:

- `zod` validation dependency
- `@playwright/test` smoke-test dependency
- Form schemas and shared validation helper
- Auth role-routing model
- Firestore read helper functions
- Local audit event helper
- Local analytics event helper
- Data table component
- Calendar board component
- Kanban board component
- File upload preview
- Export action preview
- Health/environment components
- `/health` page
- `/api/health` route
- `sitemap.js`
- `robots.js`
- middleware placeholder for future protected-route guards
- Playwright route smoke test suite

The client-specific service component set is still intentionally deferred.

Final verification:

```sh
npm run verify
```

Result:

- ESLint passed with zero warnings.
- npm audit reported zero vulnerabilities.
- Next production build passed.
- Playwright route smoke suite passed: 11 tests.

## Global Inactivity Sign-Out

Installed a reusable global inactivity session signal.

- Timeout: 10 minutes of no activity
- Activity sources: click, keydown, mousemove, scroll, touchstart, visibility changes
- Broadcasts activity/sign-out events across tabs with `BroadcastChannel`
- Wraps all pages through `SessionProvider` in the app shell
- Exposes session state through `useSessionSignal`
- Shows status and manual sign-out/reset controls in the top navigation
- Current implementation provides the template signal and UI hook; once real Firebase Auth is wired, the `signOut` callback should call Firebase Auth sign-out before redirecting.

## Boilerplate Installation

Installed reusable boilerplates for future sites in `templates/`.

- Route page boilerplate
- Component card boilerplate
- Protected route boilerplate
- Firestore service boilerplate
- Form schema boilerplate
- API route boilerplate
- New site checklist
- Deploy checklist
- Firebase sign-out snippet

## Production-Readiness Component Installation

Installed the additional production-readiness template components.

- Firebase Auth adapter for sign-in, account creation, password reset, auth-state watch, and sign-out
- Protected route wrapper ready for Firebase Auth roles/claims
- Firestore CRUD service factory
- Firebase Storage upload helper
- Notification center
- Paginated data table
- Offline connection banner
- Global route error boundary and application global error fallback
- Firestore rules template tests

The auth/storage/CRUD helpers are intentionally safe when Firebase environment values are missing; they expose the integration shape without requiring credentials during template verification.

## Full-Force Template Component Installation

Installed the additional reusable platform pieces for future website builds.

- Feature flags and maintenance mode adapter
- Audit-log expansion for auth, user, security, content, export, and consent events
- Rate-limit helper plus `/api/rate-limit-preview`
- Consent categories, privacy boilerplate, terms boilerplate, and data request route
- Email notification adapter with invite, password reset, client notice, and manager alert templates
- Content model adapter for pages, media, FAQs, navigation, and announcements
- SEO metadata, local business schema, and FAQ schema helpers
- Backup/export manifest utilities
- Manager invitation helper
- Session activity audit helper
- Typed environment contract validator
- Firestore rules for audit logs, invitations, consents, and content revisions
- `/platform`, `/privacy`, `/terms`, `/data-request`, and `/maintenance` routes
- Axe-powered accessibility test suite

## Auth/Account Lifecycle Installation

Installed the missing reusable Auth/Acct pieces.

- Email verification adapter and visible verification gate
- Password change adapter and form preview
- Recent-login reauthentication adapter
- MFA and passkey placeholder model
- Device/session management model
- Login history event model
- Custom claims sync helper
- Invite acceptance helper
- Client and manager onboarding checklist helper
- Recent-login gate helper for sensitive actions
- Firebase Auth error mapper for user-safe messages
- Firestore rules for login history, device sessions, and claim sync requests

## Reliability Layer Installation

Installed the reusable reliability foundation.

- Reliability target model for uptime, page latency, API latency, and error budget
- Dependency status snapshot helper
- Liveness endpoint at `/api/live`
- Readiness endpoint at `/api/ready`
- Status endpoint at `/api/status`
- Expanded `/api/health` response with environment and reliability data
- HEAD health response for lightweight uptime probes
- Retry and bounded exponential backoff helper
- Circuit breaker state helper
- Error budget calculator
- Incident record helper
- Graceful degradation plan helper
- Structured log and request trace helpers
- Reliability panels on `/health`

## Communication Layer Installation

Installed the reusable communication foundation.

- Communication channel model for email, SMS, portal messages, webhooks, and system alerts
- Conversation and message record helpers
- Notification record helper
- Status update helper
- Delivery receipt helper
- Webhook event helper
- Expanded email templates with contact confirmation and status update messages
- Communication center route at `/communication`
- Contact preview endpoint at `/api/contact-preview`
- Webhook preview endpoint at `/api/webhook-preview`
- Firestore rules for conversations, messages, notifications, delivery receipts, and webhook events

## Data and Workflow Layer Installation

Installed the reusable data and workflow foundation.

- Collection registry for requests, work items, approvals, imports, exports, and reports
- Workflow status model and constrained transition map
- Workflow item creation helper
- Workflow transition helper with transition events
- Approval request helper
- Data import/export job helper
- Automation rule helper
- Report definition helper
- Data/workflow center route at `/data-workflow`
- Workflow preview endpoint at `/api/workflow-preview`
- Data job preview endpoint at `/api/data-job-preview`
- Firestore rules for requests, work items, workflow events, approvals, data jobs, automation rules, and reports

## Operations and Quality Layer Installation

Installed the reusable operations and quality foundation.

- Quality gate registry for lint, audit, rules, build, smoke, accessibility, and content review
- Quality checklist helper
- Quality score calculator
- Release record helper
- Change request helper
- Runbook helper and default runbook topics
- Quality finding helper
- Post-launch monitor helper
- Operations/quality route at `/operations-quality`
- Quality preview endpoint at `/api/quality-preview`
- Runbook preview endpoint at `/api/runbook-preview`
- Firestore rules for quality findings, release records, change requests, runbooks, and post-launch monitors

## User Profile Component Installation

Installed the reusable user profile foundation.

- Profile completion scoring helper
- Avatar/profile photo metadata helper with fallback initials
- Contact preferences helper for email, SMS, phone, portal, and category preferences
- Address book helper for service, billing, mailing, and multi-property records
- Alternate contact helper
- Billing metadata helper without card storage
- Identity verification status helper
- Profile activity helper
- Privacy control state helper
- Profile attachment helper
- Manager assignment history helper
- Tags and segments registry
- Duplicate profile signal helper
- Delegated access helper
- Profile preview endpoint at `/api/profile-preview`
- User profile component panel on `/users`
- Firestore rules for profile activities, attachments, manager assignments, delegated access, and duplicate profile signals

## User Profile Governance Installation

Installed the remaining user profile governance pieces.

- Profile version snapshot helper
- Field-level permission helper for client-editable and manager-only fields
- Profile review queue helper
- Custom profile field definition helper
- Household/company account grouping helper
- Profile data retention policy helper
- Profile import mapper for CSV/client migration rows
- User database field contract extended for custom fields, account group ID, and retention policy
- `/api/profile-preview` expanded with version, review, retention, and import mapping data
- `/users` expanded with governance component panels
- Firestore rules for profile versions, review queue, custom fields, account groups, retention policies, and import jobs

## Manager Profile Installation

Installed the reusable manager profile foundation.

- Manager permissions profile helper
- Team and department assignment helper
- Workload and capacity helper
- Escalation role helper
- Approval authority limits helper
- Manager audit summary helper
- Delegation and substitute manager helper
- Managed accounts list helper
- Manager availability calendar helper
- Access review status helper
- Manager profile preview endpoint at `/api/manager-profile-preview`
- Manager profile component panels on `/manager`
- User database field contract extended with `managerProfile`
- Firestore rules for manager profiles, delegations, access reviews, and audit summaries

## Documentation Consolidation

Consolidated the project documentation after the full template build-out.

- README now links to the durable documentation index.
- Added `docs/TEMPLATE_MANIFEST.md` with the full installed module inventory.
- Added `docs/NEW_SITE_HANDOFF.md` with future-site clone and launch steps.
- Added `docs/VERIFICATION_REPORT.md` with latest verification status.
- Current local preview URL: `http://127.0.0.1:3012`
- Latest verification command: `npm run verify`
- Latest verification result: ESLint passed, npm audit found 0 vulnerabilities, Firestore rules tests passed with 11 checks, production build passed, and Playwright passed 32 tests.

## Basic GUI Layer Installation

Installed a simple placeholder GUI layer connecting the template modules.

- Added `lib/gui-layer.js` for dashboard summary stats, module groups, and preview API shortcuts.
- Added `app/components/TemplateDashboard.jsx`.
- Replaced the starter home page with a functional module dashboard at `/`.
- Added basic responsive dashboard styles in `app/globals.css`.
- The GUI intentionally stays plain and placeholder-oriented so future websites can replace the final visual design.

## Basic Landing And Auth Page Installation

Installed a basic public landing and sign-in/sign-up page.

- Added `app/components/BasicLanding.jsx`.
- Updated `/` with a plain landing section, sign-in/sign-up actions, readiness panel, and the existing module dashboard below.
- Updated `AuthShell` into two basic placeholder forms: sign in and sign up.
- Kept the existing auth lifecycle panels below the basic forms.
- Updated route smoke expectations for the new landing headline.

## Lease-Ready Component Expansion - 2026-05-25

Expanded the installed visual placeholder layer so the template feels like a
fully functioning leased-client portal without enabling billing, outbound
email/SMS, analytics, webhooks, or other provider APIs.

- Added `app/components/LeasingTemplateComponents.jsx`.
- Expanded shared demo data in `lib/component-data.js`.
- Added client dashboard summary and manager command center summary.
- Added service catalog, service package detail, quote review, project detail,
  onboarding wizard, tenant customization, lease setup checklist, module matrix,
  document/signature placeholder, support ticket, media gallery, notification
  preferences, demo story mode, demo seed switcher, and deployment status.
- Added later polish panels for component metadata, component inventory, lease
  presets, theme swatches, role-specific empty states, print/export previews,
  archive/history, help/FAQ, legal review status, data retention controls,
  template-vs-leased comparison, walkthrough controls, loading variants, mobile
  navigation states, and error recovery variants.
- Mounted the expanded panels across `/`, `/client`, `/manager`, `/platform`,
  `/operations`, `/admin`, `/users`, `/privacy`, `/terms`, and `/health`.
- Added `docs/REVISIT_NOTES_2026-05-25.md` as the current pause/revisit note.
- Updated `README.md`, `docs/TEMPLATE_MANIFEST.md`, and
  `docs/VERIFICATION_REPORT.md`.

Verification after the expansion:

- `npm run lint` passed.
- `npm run build` passed.
- Local route checks returned `200` for `/`, `/client`, `/platform`,
  `/operations`, `/admin`, `/users`, `/privacy`, and `/terms`.
- Earlier route checks during the same component pass returned `200` for
  `/manager` and `/health`.

## Static Firebase Deployment - 2026-05-25

Deployed the current visual template to Firebase Hosting without enabling
billing-dependent framework infrastructure.

- Added `firebase.static.json` for no-billing static Hosting deployment.
- Generated `deploy-static/` from the Next production build output.
- Added static placeholder JSON files under `deploy-static/api/` for preview
  API routes.
- Deployed to `https://sample-demo-website-2026.web.app`.
- Verified live `/`, `/client`, `/platform`, `/api/health`, and `/api/status`.

Full Firebase framework deployment through `firebase.json` is still blocked
until the project has billing enabled, because Next framework hosting requires
Cloud Functions, Cloud Run, Cloud Build, and Artifact Registry.

Known follow-up:

- Full `npm run verify`, accessibility checks, screenshot QA, and smoke
  assertions for the new panels still need to be run or added.
- Consider a structured component registry and optional `/components` route
  before the next major expansion.

## Tamper Resistance And Dexterity Pass - 2026-05-25

Hardened the default template while keeping it provider-free and billing-free.

- Added `lib/template-hardening.mjs` as the shared security and dexterity
  contract.
- Consolidated Next security headers through the shared hardening module.
- Expanded Firebase static Hosting headers with same-origin resource policy,
  origin isolation, cross-domain policy blocking, and no-store API cache
  behavior.
- Added middleware request tracing and tamper-query rejection for local/full
  framework mode.
- Added visible tamper resistance and dexterity optimization panels to
  `/security`.
- Added `scripts/build-static-deploy.mjs`, `npm run build:static`, and
  `npm run deploy:static` to regenerate and deploy the static visual demo
  consistently.
- Added smoke assertions for guarded-route trace headers and blocked
  debug/sensitive query keys.

Verification:

- `npm run lint` passed.
- `npm run audit` passed with 0 vulnerabilities.
- `npm run test:rules` passed.
- `npm run build` passed.
- `npm run build:static` passed.
- `npm run smoke` passed with 34 Playwright checks.
- `npm run deploy:static` passed.
- Live `/` returned HTTP 200 with the no-cache HTML policy after deploy.
- `npm run deploy:static` passed.
- Live `/` returned HTTP 200 with the no-cache HTML policy after deploy.

Deployment:

- Static Firebase Hosting redeployed successfully to
  `https://sample-demo-website-2026.web.app`.
- Live `/security` returned HTTP 200 with the new tamper/dexterity panels.
- Live `/api/health` returned HTTP 200 with `Cache-Control: no-store` and the
  expanded security headers.

## UI/GUI Template Folder - 2026-05-25

Added a dedicated folder for swappable client interface skins.

- Created `templates/ui-gui/README.md`.
- Created `templates/ui-gui/default-portal/`.
- Added starter `theme.json`, `tokens.css`, `README.md`, and
  `preview-notes.md`.
- Updated README and template manifest references.

This keeps UI/GUI customization separate from the core platform, security,
data, auth, and provider-placeholder layers.

## Home Pro Split Search GUI - 2026-05-25

Added a marketplace-style GUI skin based on the supplied home-services
reference pattern.

- Created `templates/ui-gui/home-pro-split-search/`.
- Added static preview, style source, theme metadata, implementation notes, and
  plug-and-play mapping.
- Added `templates/ui-gui/registry.json` and
  `templates/ui-gui/active-template.json`.
- Added `lib/gui-template-registry.js` for app-facing active-template metadata.
- Layered the active skin onto `app/components/BasicLanding.jsx` and
  `app/globals.css`.
- Added a platform panel showing the active plug n play GUI skin.

The skin keeps the reference structure and professional marketplace feel while
avoiding the reference site's exact brand, logo, copy, and imagery.

## Additional GUI Variants - 2026-05-25

Added two more available plug n play GUI skins:

- `templates/ui-gui/luxe-remodel-marketplace/`
- `templates/ui-gui/pro-network-blueprint/`

Both include README, theme metadata, CSS, static preview, implementation notes,
and plug-and-play mapping. The active app skin remains
`home-pro-split-search` until intentionally switched.

## Access Control Audit - 2026-05-25

Audited the public static demo routes for the later real-auth production pass.

- Added `docs/ACCESS_CONTROL_AUDIT_2026-05-25.md`.
- Added `lib/route-access-policy.js`.
- Updated `lib/auth-model.js` so `canAccessRoute` delegates to the shared route
  policy.
- Classified `/`, `/auth`, legal pages, maintenance, sanitized health/live
  probes, and contact intake as public.
- Classified `/client` and profile data as client-authenticated.
- Classified `/manager`, `/users`, `/operations`, `/operations-quality`,
  `/data-workflow`, `/communication`, `/health`, and related preview APIs as
  manager/admin.
- Classified `/admin`, `/platform`, `/security`, rate-limit previews, and
  data-job/export previews as admin/owner.
- Classified readiness and webhook intake as system-auth/signature-gated.

The current static demo remains public for template review. These
recommendations are the access contract for the later Firebase Auth/session
claim wiring pass.

## Public Home Services Retheme - 2026-05-25

Shifted the public template from a landscaping-specific direction into a broad
home services marketplace.

- Updated the public landing hero to focus on repairs, installs, handyman-style
  home projects, saved project details, photo uploads, estimates, scheduling,
  messages, and service history.
- Updated the pro signup incentive copy to emphasize booked service requests,
  faster quotes, appointment holds, and clean communication threads.
- Updated the visible navigation brand to `Home Services`.
- Updated browser metadata to `Home Services Portal`.
- Removed visible landscaping language from app copy and current docs.
- Updated the active `home-pro-split-search` UI skin metadata and preview copy.
- Added a top site notice: "This is a demo presentation website hosted by
  Black Lion Studios."

## Global Right-Rail Navigation Fix - 2026-05-25

Made the right-side sticky navigation behavior global across the demo template
instead of only applying on very wide screens.

- Updated `app/globals.css` so the right-side nav rail activates at all
  non-mobile widths above `820px`.
- Added a responsive side-nav width variable so medium desktop/tablet layouts
  get the same right-rail behavior without forcing the full wide-desktop rail.
- Preserved the mobile top-menu behavior at `820px` and below.
- Confirmed the shared `AppShell` and `TopNav` are still the single global nav
  path for the landing, auth, client, user, operations, quality, platform,
  manager, admin, legal, health, and maintenance pages.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run smoke` passed with 34 Playwright checks.
- `npm run build:static` regenerated the static hosting bundle.

Deployment:

- Static Firebase Hosting redeployed successfully to
  `https://sample-demo-website-2026.web.app`.
- Live browser smoke at `1000x800` confirmed `.top-nav` is `position: fixed`,
  `right: 0px`, and visually placed on the right rail for:
  `/`, `/auth`, `/client`, `/users`, `/operations`, `/operations-quality`,
  `/platform`, `/data-request`, `/data-workflow`, `/communication`, `/manager`,
  `/admin`, `/security`, `/health`, `/privacy`, `/terms`, and `/maintenance`.

## Global Non-Stick Boilerplate Installation - 2026-05-25

Installed reusable global non-stick layout starters for future leased-client
pages that should stay in normal document flow.

- Added `templates/boilerplates/nonstick-layout-shell.jsx`.
- Added `templates/boilerplates/nonstick-action-row.jsx`.
- Added `templates/boilerplates/nonstick-section-index.jsx`.
- Added `templates/boilerplates/nonstick-layout.css`.
- Added `lib/nonstick-boilerplates.js` as the app-facing manifest.
- Added `app/components/NonstickBoilerplatePanel.jsx` to expose the installed
  boilerplates on the homepage inventory.
- Updated `README.md`, `docs/TEMPLATE_MANIFEST.md`, and
  `templates/boilerplates/README.md`.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build:static` passed.
- `npm run smoke` passed with 34 Playwright checks.
- `deploy-static/index.html` contains the new `Global non-stick boilerplates`
  homepage panel.

Deployment:

- Initial sandboxed Firebase API request failed.
- Retried `npm run deploy:static` with approved network access.
- Static Firebase Hosting redeployed successfully to
  `https://sample-demo-website-2026.web.app`.
- Live host returned HTTP 200 with the deployed security headers after release.

## Global Non-Stick Footer Boilerplates - 2026-05-25

Added footer starters to the global non-stick boilerplate family.

- Added `templates/boilerplates/nonstick-footer.jsx`.
- Added `templates/boilerplates/nonstick-compact-footer.jsx`.
- Expanded `templates/boilerplates/nonstick-layout.css` with normal-flow footer
  layout utilities.
- Updated `lib/nonstick-boilerplates.js` so the homepage boilerplate inventory
  includes `NonstickFooter` and `NonstickCompactFooter`.
- Updated `README.md`, `docs/TEMPLATE_MANIFEST.md`, and
  `templates/boilerplates/README.md`.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build:static` passed.
- `npm run smoke` passed with 34 Playwright checks.
- Static Firebase Hosting redeployed successfully to
  `https://sample-demo-website-2026.web.app`.

## Dark Global Footer Background - 2026-05-25

Updated the visible global non-stick footer preview so it reads as a distinct
footer band instead of blending into the page background.

- Updated `.global-nonstick-footer` in `app/globals.css` to use a dark
  full-width background.
- Kept footer content constrained inside the full-width band.
- Kept the footer in normal document flow with `position: static`.
- Preserved desktop right-rail spacing so the footer does not sit underneath
  the fixed side navigation.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build:static` passed.
- `npm run smoke` passed with 34 Playwright checks.
- Static Firebase Hosting redeployed successfully to
  `https://sample-demo-website-2026.web.app`.
- Live headers returned HTTP 200 with
  `Cache-Control: no-cache, max-age=0, must-revalidate`.

## Home Services B-Roll Imagery - 2026-05-25

Added local home-services b-roll imagery throughout the static demo.

- Generated four project-bound raster assets for:
  cabinet repair, light fixture installation, exterior pressure washing, and
  under-sink plumbing repair.
- Copied generated assets into `public/images/home-services/`.
- Converted the rendered assets to WebP for page-weight control.
- Removed the redundant project PNG copies after WebP conversion; the source
  generations remain in Codex's generated image store.
- Added `lib/home-service-broll.js` as the shared image metadata registry.
- Added `app/components/HomeServiceBroll.jsx` with:
  homepage b-roll showcase and global route-level b-roll strip.
- Updated `app/components/BasicLanding.jsx` so the hero uses real service
  imagery instead of CSS-only placeholder art.
- Updated `app/components/AppShell.jsx` so the b-roll strip appears across the
  template.
- Updated `next.config.mjs` with `images.unoptimized = true` because the static
  Firebase Hosting deployment does not run the Next image optimizer.
- Updated `scripts/build-static-deploy.mjs` so `public/` assets are copied into
  `deploy-static/`.

Rendered WebP assets:

- `public/images/home-services/kitchen-cabinet-repair.webp`
- `public/images/home-services/light-fixture-install.webp`
- `public/images/home-services/walkway-pressure-wash.webp`
- `public/images/home-services/sink-plumbing-repair.webp`

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build:static` passed.
- `npm run smoke` passed with 34 Playwright checks.
- `deploy-static/images/home-services/` contains all four WebP assets.
- Static Firebase Hosting redeployed successfully to
  `https://sample-demo-website-2026.web.app`.
- Live WebP asset URLs returned HTTP 200 with `content-type: image/webp`.

## Redundancy Consolidation - 2026-05-26

Audited the recent non-stick/footer/b-roll additions for obvious duplication
and consolidated the low-risk items.

- Removed redundant project PNG copies from `public/images/home-services/`
  after confirming the rendered site only references WebP assets.
- Regenerated `deploy-static/` so only the four WebP b-roll files are deployed.
- Reduced Firebase Hosting deploy file count from 91 files to 87 files.
- Confirmed live WebP asset URL returns HTTP 200 with `content-type: image/webp`.
- Confirmed the old PNG asset URL now returns HTTP 404.
- Consolidated `docs/VERIFICATION_REPORT.md` from repeated deploy sections
  into one current verification section plus short historical checkpoints.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build:static` passed.
- `npm run smoke` passed with 34 Playwright checks.
- `npm run deploy:static` passed.

## Day/Night Theme Awareness - 2026-05-26

Added global theme awareness to the static demo.

- Added `app/components/ThemeToggle.jsx`.
- Mounted the Day/Night toggle in `app/components/TopNav.jsx`.
- Added an early boot script in `app/layout.jsx` so the root document receives
  the saved or preferred theme before the app shell renders.
- Added day and night token sets in `app/globals.css`.
- Adapted shared shell surfaces including body background, nav, panels, hero
  overlays, b-roll strip, footer band, warning/error surfaces, and shadows.
- Stored explicit user preference under `sample-demo-theme`.
- Default behavior follows `prefers-color-scheme` when no saved preference
  exists.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build:static` passed.
- Static output contains `sample-demo-theme`, `data-theme="day"`,
  `.theme-toggle`, and `[data-theme=night]`.
- `npm run smoke` passed with 34 Playwright checks.
- `npm run deploy:static` passed.
- Live `/` returned HTTP 200 with the no-cache HTML policy after deploy.

Cache correction:

- Updated `firebase.static.json` so the HTML surface uses
  `Cache-Control: no-cache, max-age=0, must-revalidate`.
- Redeployed Firebase Hosting again so the visible footer boilerplate preview
  is not hidden behind the previous one-hour default HTML cache.
- Live headers now return HTTP 200 with the no-cache HTML policy.

## Page Text Wrapping - 2026-05-26

Added global text wrapping safeguards so long labels, route copy, footer links,
navigation text, and compact control labels stay inside their page containers.

- Updated `app/globals.css` with global `min-width: 0` and
  `overflow-wrap: anywhere` safeguards.
- Added explicit wrapping support for brand text, nav links, theme toggle text,
  buttons, segmented controls, badges, pills, and compact action rows.
- Kept button-like controls stable with normal wrapping, centered text, and a
  tighter line height instead of allowing long words to force horizontal
  overflow.
- Confirmed the static CSS bundle includes `overflow-wrap`, `white-space:
  normal`, and `min-width: 0` wrapping markers.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build:static` passed.
- `npm run smoke` passed with 34 Playwright checks.

## Follow-Up Redundancy Consolidation - 2026-05-26

Ran another narrow consolidation pass after the page-wrapping work.

- Merged landing CTA, API shortcut link, button row, chip, and segmented-control
  styling into the shared action/control CSS contract in `app/globals.css`.
- Collapsed duplicate desktop right-rail width rules for the global b-roll strip
  and global footer.
- Removed the `white-space: nowrap` navigation override from the active
  `home-pro-split-search` GUI template so template previews follow the wrapping
  contract.
- Added shared reliability probe payload builders in `lib/reliability.js`.
- Updated `/api/live`, `/api/ready`, and `/api/status` to reuse those helpers
  instead of repeating response object shapes in each route.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build:static` passed.
- `npm run smoke` passed with 34 Playwright checks.
- `npm run deploy:static` passed.
- Live `/` returned HTTP 200 with the no-cache HTML policy after deploy.

## Access-Control Enforcement - 2026-05-26

Moved the route access policy from planning-only to active enforcement for the
demo template.

- Added `app/components/RouteAccessGate.jsx` to hide protected static-demo page
  content from anonymous users.
- Wrapped the shared app shell in `RouteAccessGate`.
- Kept the public landing/auth/legal/data-request/maintenance surfaces visible.
- Hid the internal homepage module dashboard unless a manager/admin demo role is
  active.
- Updated `TopNav` so anonymous users only see public navigation items.
- Added demo role controls to `AuthShell` for client, manager, and admin
  placeholder sessions until real Firebase Auth sessions/claims are wired.
- Updated `middleware.js` so framework-mode protected pages redirect to
  `/auth?next=...` and protected preview APIs return 401 without an allowed
  demo role.
- Expanded middleware coverage to communication, data-workflow,
  operations-quality, and health routes.
- Updated `scripts/build-static-deploy.mjs` so static Hosting only emits
  public-safe API placeholders for `/api/contact-preview`, `/api/health`, and
  `/api/live`.
- Removed the internal template module dashboard payload from the public
  homepage.
- Updated `scripts/build-static-deploy.mjs` to overwrite protected static route
  HTML with a sign-in-required shell before Firebase deploy.
- Updated smoke tests to verify anonymous protected-route redirects, authorized
  demo-role route access, and protected API 401 responses.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build:static` passed.
- `npm run smoke` passed with 34 Playwright checks.
- Static bundle audit confirmed protected page headings are absent outside
  `_next`, protected pages contain sign-in-required HTML, and only public API
  placeholders are emitted.
- `npm run deploy:static` passed.
- Live `/client` renders the sign-in-required static shell.
- Live `/api/status` returns HTTP 404 because the protected placeholder is no
  longer emitted by the static deploy bundle.
- Live `/api/health` remains HTTP 200 with `Cache-Control: no-store, max-age=0`.

## Visible Global Footer Boilerplate Preview - 2026-05-25

Corrected the footer boilerplate visibility gap after the initial install only
placed the footer starters in source files and the homepage inventory.

- Added `app/components/GlobalNonstickFooter.jsx`.
- Updated `app/components/AppShell.jsx` so the global non-stick footer
  boilerplate preview appears at the bottom of every route.
- Updated `app/globals.css` with normal-flow footer styling and desktop
  right-rail spacing.
- Confirmed `deploy-static/index.html` contains:
  `Footer boilerplates`,
  `Global non-stick footer starters are installed`, and
  `NonstickFooter + NonstickCompactFooter`.

Verification:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run build:static` passed.
- `npm run smoke` passed with 34 Playwright checks.
- Static Firebase Hosting redeployed successfully to
  `https://sample-demo-website-2026.web.app`.
