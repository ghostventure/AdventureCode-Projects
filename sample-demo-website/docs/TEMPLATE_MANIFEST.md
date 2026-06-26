# Template Manifest

Last updated: 2026-05-26

## Purpose

This folder is a default full-force website template for future leased client
sites. It provides the platform, data, security, user, manager, workflow,
communication, reliability, quality, and visual placeholder foundations before
client-specific content and provider integrations are added.

The current public GUI is positioned as a broad home services marketplace for
repairs, installations, maintenance, handyman-style requests, estimates,
scheduling, and service history.

Client-specific services, copy, brand assets, imagery, legal language, and
provider integrations are intentionally deferred until a client leases the
template.

## Firebase Context

- Firebase account: `blacklionmediastudio@gmail.com`
- Firebase project ID: `sample-demo-website-2026`
- Firebase project number: `778970398987`
- Hosting target URL: `https://sample-demo-website-2026.web.app`
- Current deploy mode: static Firebase Hosting with `firebase.static.json` and
  generated `deploy-static/`
- Full framework deploy note: `firebase.json` deployment needs
  billing-enabled Cloud Functions/Cloud Run/Cloud Build/Artifact Registry

## Core Stack

- Next.js App Router
- React
- Firebase client SDK
- Firestore rules and indexes
- Zod validation
- Lucide React icons
- Playwright smoke tests
- Axe accessibility tests

## Main Commands

```sh
npm install
npm run dev
npm run lint
npm run audit
npm run test:rules
npm run test:a11y
npm run build
npm run smoke
npm run verify
npm run build:static
npm run deploy
npm run deploy:static
npm run deploy:rules
```

## Routes

- `/`: public landing page, home-services placeholder GUI, and b-roll showcase
- `/auth`: basic sign-in/sign-up page plus auth and account lifecycle components
- `/client`: client account/workspace components plus dashboard summary, onboarding, service catalog, service package detail, agreement placeholder, media gallery, support ticket, notification preferences, form states, empty states, print/export preview, archive/history
- `/users`: user database, user profile, and manager/user records
- `/manager`: manager workspace, command center, project detail, service catalog, quote review, support/media, and manager profile components
- `/admin`: admin and security controls plus setup checklist, module matrix, legal review, print/export, archive/history
- `/operations`: workflow UI surfaces plus state variants, loading variants, error recovery, mobile previews/navigation, demo seed switcher
- `/operations-quality`: QA, release, runbook, and quality operations
- `/data-workflow`: data models, workflow states, approvals, jobs, reports
- `/communication`: messages, notifications, email queue, webhooks
- `/platform`: feature flags, consent, SEO, exports, maintenance, environment contract, tenant customization, theme swatches, lease presets, setup checklist, module matrix, data retention, template comparison
- `/security`: tamper-resistant controls and hardening status
- `/health`: health, readiness, deployment status, error recovery, reliability, retry, circuit breaker, incident panels
- `/privacy`: privacy and consent boilerplate plus legal review and retention visibility
- `/terms`: terms boilerplate plus legal review and template-vs-leased comparison
- `/data-request`: data access/delete/export request boilerplate
- `/maintenance`: maintenance mode page

## API Routes

- `/api/health`: health plus environment/reliability snapshot
- `/api/live`: liveness probe
- `/api/ready`: readiness probe
- `/api/status`: dependency/status response
- `/api/rate-limit-preview`: rate-limit header preview
- `/api/contact-preview`: contact intake preview with notification/email job
- `/api/webhook-preview`: webhook event preview
- `/api/workflow-preview`: workflow transition preview
- `/api/data-job-preview`: import/export job preview
- `/api/quality-preview`: quality gate/score preview
- `/api/runbook-preview`: runbook preview
- `/api/profile-preview`: user profile completion/governance preview
- `/api/manager-profile-preview`: manager profile preview

## Security And Hardening

- Security headers in `next.config.mjs`
- Shared security header contract in `lib/template-hardening.mjs`
- Content Security Policy baseline
- `X-Powered-By` disabled
- Production browser source maps disabled
- Immutable cache headers for Next static assets
- No-store cache headers for placeholder API routes
- Same-origin opener/resource policies and origin isolation headers
- Workspace/API middleware trace headers for local framework mode
- Tamper guard for traversal-style paths and sensitive/debug query keys
- Route access policy in `lib/route-access-policy.js`
- Active framework-mode access enforcement in `middleware.js` for protected
  pages and preview APIs
- Static-demo access gate in `app/components/RouteAccessGate.jsx` so anonymous
  visitors do not see client, manager, admin, workflow, health, security, or
  platform page content
- Static deploy overwrites protected route HTML with a sign-in-required shell so
  prerendered protected payloads are not published on Firebase Hosting
- Demo auth role signal in `app/components/SessionProvider.jsx` for local
  placeholder sign-in until Firebase Auth sessions and claims are wired
- Static deploy now emits only public-safe API placeholders:
  `/api/contact-preview`, `/api/health`, and `/api/live`
- Access control audit in `docs/ACCESS_CONTROL_AUDIT_2026-05-25.md`
- Firebase deploy scripts pinned to project and account
- Firestore deny-by-default fallback
- Role-aware manager/client rules
- `npm audit --audit-level=moderate`
- Global error boundaries
- Offline banner
- 10-minute inactivity sign-out signal across all pages

## Dexterity Optimization

- Swap-ready component structure for client brand, copy, modules, and service labels
- Provider-free visual demo mode for billing, email, SMS, analytics, and webhooks
- Direct route access for client, manager, admin, security, platform, and health surfaces
- Consolidated static deploy bundle script at `scripts/build-static-deploy.mjs`
- `npm run deploy:static` builds, regenerates `deploy-static/`, and deploys Firebase Hosting
- Visible tamper resistance and dexterity panels on `/security`
- Global page text wrapping in `app/globals.css` for long labels, route text,
  buttons, nav controls, footer links, and compact card copy across breakpoints
- Consolidated shared action styles in `app/globals.css` so landing CTAs, API
  shortcut links, button rows, and control chips use one styling contract
- Reliability probe payload builders live in `lib/reliability.js` and are reused
  by `/api/live`, `/api/ready`, and `/api/status`

## Data And Auth Foundation

- User roles: `client`, `manager`
- User statuses: `active`, `invited`, `paused`, `archived`
- Firestore user contract in `lib/user-database.js`
- Firebase client helper in `lib/firebase-client.js`
- Firebase Auth adapter in `lib/auth-adapter.js`
- Auth/account helpers in `lib/auth-account.js`
- Protected route wrapper
- Role router helper
- Firestore CRUD service factory
- Firebase Storage helper

## User Profile Layer

Installed user profile components and data helpers:

- Profile completion scoring
- Avatar/profile photo metadata
- Contact preferences
- Address book
- Alternate contacts
- Billing metadata placeholder without card storage
- Identity verification status
- Account activity feed model
- Privacy/data controls
- Profile attachments
- Manager assignment history
- Tags and segments
- Duplicate profile detection
- Delegated access
- Profile version snapshots
- Field-level permissions
- Profile review queue
- Custom profile fields
- Household/company account grouping
- Data retention policy helper
- Profile import mapper

## Manager Profile Layer

Installed manager-specific profile helpers and panels:

- Manager permission scopes
- Team/department assignment
- Workload and capacity
- Escalation role
- Approval authority limits
- Manager audit summary
- Delegation/substitute manager
- Managed accounts list
- Availability calendar
- Access review status

## Platform Modules

- Basic GUI layer with module groups, summary stats, and preview API shortcuts
- Feature flags
- Maintenance mode
- Audit events
- Analytics event wrapper
- Rate-limit helper
- Consent policy
- Email adapter/templates
- Content model
- SEO/Open Graph/schema helpers
- Backup/export manifest
- Invitation flow
- Session audit
- Environment validator

## Lease-Ready Visual Placeholder Layer

Installed in `app/components/LeasingTemplateComponents.jsx` with shared data in
`lib/component-data.js`.

- Client dashboard summary
- Manager command center summary
- Service catalog and service package detail
- Quote review and approval preview
- Project detail
- Client onboarding wizard
- Tenant customization controls
- Lease setup checklist
- Module enable/disable matrix
- Document/signature placeholder
- Support ticket
- Media/gallery review
- Notification preferences
- Demo story mode and demo seed switcher
- Deployment status panel
- Component metadata and inventory panels
- Client lease presets
- Theme preset swatches
- Role-specific empty states
- Print/export preview states
- Archive/history view
- Help/FAQ
- Legal review status
- Data retention controls
- Template mode vs leased mode comparison
- Demo walkthrough controls
- Loading shimmer variants
- Mobile navigation states
- Error recovery variants

This layer is intentionally provider-free. Billing, email, SMS, analytics,
webhooks, and other external APIs are shown as disabled, optional, pending, or
visual-only until selected for a leased client.

## Reliability Modules

- Reliability targets
- Dependency snapshot
- Retry/backoff helper
- Circuit breaker helper
- Error budget calculator
- Incident record helper
- Graceful degradation plan
- Structured logging and trace IDs

## Communication Modules

- Communication channels
- Conversations
- Messages
- Notifications
- Email queue records
- Status updates
- Delivery receipts
- Webhook events

## Data And Workflow Modules

- Collection registry
- Workflow status model
- Transition map
- Workflow item helper
- Approval requests
- Import/export data jobs
- Automation rules
- Report definitions

## Operations And Quality Modules

- Quality gates
- Release readiness
- Quality scoring
- Change control
- Runbooks
- Quality findings
- Post-launch monitors

## Firestore Support Collections

The rules currently cover:

- `users`
- `auditLogs`
- `invitations`
- `consents`
- `contentRevisions`
- `loginHistory`
- `deviceSessions`
- `claimSyncRequests`
- `conversations`
- `messages`
- `notifications`
- `deliveryReceipts`
- `webhookEvents`
- `requests`
- `workItems`
- `workflowEvents`
- `approvals`
- `dataJobs`
- `automationRules`
- `reports`
- `qualityFindings`
- `releaseRecords`
- `changeRequests`
- `runbooks`
- `postLaunchMonitors`
- `profileActivities`
- `profileAttachments`
- `managerAssignments`
- `delegatedAccess`
- `duplicateProfileSignals`
- `profileVersions`
- `profileReviewQueue`
- `customProfileFields`
- `accountGroups`
- `profileRetentionPolicies`
- `profileImportJobs`
- `managerProfiles`
- `managerDelegations`
- `managerAccessReviews`
- `managerAuditSummaries`

## Boilerplates

Reusable files in `templates/`:

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
- UI/GUI template folder at `templates/ui-gui/`
- Default portal skin at `templates/ui-gui/default-portal/`
- Home/pro split search skin at `templates/ui-gui/home-pro-split-search/`
- Luxe remodel marketplace skin at `templates/ui-gui/luxe-remodel-marketplace/`
- Pro network blueprint skin at `templates/ui-gui/pro-network-blueprint/`
- Active GUI registry at `templates/ui-gui/active-template.json`
- App-facing GUI registry at `lib/gui-template-registry.js`

Visible global footer preview:

- `app/components/GlobalNonstickFooter.jsx`
- Mounted in `app/components/AppShell.jsx`
- Styled in `app/globals.css`
- Dark full-width footer band
- Normal document flow, no sticky or fixed positioning
- Desktop width accounts for the right-side nav rail
- Reusable footer starter source remains in
  `templates/boilerplates/nonstick-footer.jsx` and
  `templates/boilerplates/nonstick-compact-footer.jsx`

## Local Imagery

Home services b-roll assets:

- `public/images/home-services/kitchen-cabinet-repair.webp`
- `public/images/home-services/light-fixture-install.webp`
- `public/images/home-services/walkway-pressure-wash.webp`
- `public/images/home-services/sink-plumbing-repair.webp`

Only the optimized WebP files are kept in the project and included in static
Hosting deploys. The larger generated PNG originals are not project assets.

Rendering surfaces:

- Landing hero image in `app/components/BasicLanding.jsx`
- Homepage b-roll showcase in `app/components/HomeServiceBroll.jsx`
- Global route-level b-roll strip mounted from `app/components/AppShell.jsx`
- Shared b-roll metadata in `lib/home-service-broll.js`

Static deploy support:

- `scripts/build-static-deploy.mjs` copies the `public/` folder into
  `deploy-static/`.
- `next.config.mjs` sets `images.unoptimized = true` so local assets are served
  directly on static Firebase Hosting without a Next image optimizer runtime.

## Theme Awareness

Day/Night theme system:

- `app/components/ThemeToggle.jsx`
- Mounted in `app/components/TopNav.jsx`
- Early boot script in `app/layout.jsx`
- Theme token overrides in `app/globals.css`
- Persistent storage key: `sample-demo-theme`

Behavior:

- Defaults to system dark preference when no saved setting exists.
- Persists explicit Day/Night choice in `localStorage`.
- Applies `data-theme="day"` or `data-theme="night"` to the root document.
- Updates `color-scheme` for browser-native controls.
- Adapts shared tokens for page background, panels, nav, hero overlays, b-roll
  strip, footer band, soft surfaces, and shadows.

## Tests

- `tests/routes.spec.js`: route and API smoke coverage
- `tests/accessibility.spec.js`: Axe accessibility checks
- `tests/firestore-rules.test.mjs`: static Firestore rule contract coverage

Latest verified result:

- Firestore rule checks: 11 passed
- Playwright tests: 34 passed
- npm audit: 0 vulnerabilities
