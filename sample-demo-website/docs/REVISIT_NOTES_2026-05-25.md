# Revisit Notes - 2026-05-25

## Current Intent

This project is a reusable leased-client website template. It should feel fully
functioning as a visual demo while keeping billing, outbound email/SMS,
analytics, webhooks, and other provider API integrations disabled until a client
leases and customizes the portal.

The installed components are placeholders by design. They should be reachable,
credible, and complete enough to demonstrate the client, manager, admin,
platform, workflow, communication, legal, and reliability surfaces without
pretending that external providers are connected.

## Latest Component Expansion

Added and mounted a lease-ready component layer in
`app/components/LeasingTemplateComponents.jsx` with shared placeholder data in
`lib/component-data.js`.

Major installed panels:

- Client dashboard summary
- Manager command center summary
- Service catalog and service package detail
- Quote review and approval preview
- Project detail
- Client onboarding wizard
- Tenant customization
- Lease setup checklist
- Module enable/disable matrix
- Document/signature placeholder
- Support ticket
- Media/gallery review
- Notification preferences
- Demo story mode
- Demo seed switcher
- Deployment status
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

## Mounted Routes

- `/`: template dashboard, demo story, inventory, metadata, lease presets,
  mode comparison, walkthrough, seed switcher, deployment status
- `/client`: client dashboard, onboarding, services, requests, scheduling,
  messages, notification preferences, billing-disabled status, documents,
  agreement placeholder, media, support, form states, empty states, archive,
  print/export, file upload/storage, history
- `/manager`: manager command center, project detail, service catalog, quote
  review, estimates, schedule, media, support, task/status flow, profile panels
- `/platform`: tenant customization, theme swatches, lease presets, template
  comparison, setup checklist, module matrix, retention, platform controls
- `/operations`: demo seed switcher, form states, empty states, loading
  variants, error recovery, mobile previews/navigation, queues, tables, kanban
- `/admin`: setup checklist, module matrix, legal review, print/export,
  archive/history, audit/security controls
- `/users`: role empty states, archive/history, retention controls, profile
  lifecycle/governance panels
- `/privacy`: legal review and data retention panels
- `/terms`: legal review and template-vs-leased comparison panels
- `/health`: deployment status and error recovery panels

## Verification Performed

Commands run after the latest component expansion:

```sh
npm run lint
npm run build
```

Both passed.

The dev server was restarted after each production build because `next build`
rewrites `.next`, which can make an already-running `next dev` process serve
stale dev-bundler state.

Local route checks returned `200` for:

- `/`
- `/client`
- `/platform`
- `/operations`
- `/admin`
- `/users`
- `/privacy`
- `/terms`

Earlier route checks during the same component pass also returned `200` for:

- `/manager`
- `/health`

## Deployment Update

After reauthenticating the Firebase CLI, full Firebase framework deployment
through `firebase.json` reached the Next.js framework packaging step but then
failed because Cloud Functions API was disabled. Attempting to enable the
required Cloud services showed the project has no billing account, which blocks
Cloud Functions, Cloud Run, Cloud Build, Artifact Registry, and Container
Registry activation.

The visual demo was deployed with static Firebase Hosting instead:

```sh
npx firebase-tools deploy --config firebase.static.json --only hosting --project sample-demo-website-2026 --account blacklionmediastudio@gmail.com
```

Live URL:

```text
https://sample-demo-website-2026.web.app
```

Static placeholder JSON files were generated under `deploy-static/api/` so
dashboard preview API links return provider-free placeholder responses instead
of Firebase 404 pages.

Verified live after deploy:

- `/`: HTTP 200
- `/client`: HTTP 200
- `/platform`: HTTP 200
- `/api/health`: HTTP 200 static placeholder JSON
- `/api/status`: HTTP 200 static placeholder JSON

## Global Navigation Update

The sticky menu has been moved into a global right-side rail for all non-mobile
template pages.

- `app/globals.css` now activates the right-side nav rail above `820px`.
- The rail width is responsive, so medium desktop/tablet pages use the same
  placement without requiring the old very-wide `1180px` breakpoint.
- Mobile and narrow tablet screens still use the top collapsible menu.
- The fix applies through the shared `AppShell` and `TopNav`, covering Users,
  Auth, Client, Operations, Quality, and the rest of the static template pages.

Verified live after deploy with a browser-level smoke test at `1000x800`:

- `/`
- `/auth`
- `/client`
- `/users`
- `/operations`
- `/operations-quality`
- `/platform`
- `/data-request`
- `/data-workflow`
- `/communication`
- `/manager`
- `/admin`
- `/security`
- `/health`
- `/privacy`
- `/terms`
- `/maintenance`

Each route returned HTTP 200 and rendered `.top-nav` as `position: fixed` with
`right: 0px`.

## Tamper Resistance And Dexterity Update

Added after the static deployment pass:

- Shared hardening contract in `lib/template-hardening.mjs`
- Expanded Next and Firebase static security headers
- No-store cache behavior for placeholder API routes
- Middleware request tracing and tamper-query rejection for local/full
  framework mode
- Visible tamper resistance and dexterity optimization panels on `/security`
- Consolidated static deployment helper at `scripts/build-static-deploy.mjs`
- `npm run build:static` and `npm run deploy:static`

Verification after this pass:

- `npm run lint`
- `npm run audit`
- `npm run test:rules`
- `npm run build`
- `npm run build:static`
- `npm run smoke` with 34 Playwright checks

The live static demo was redeployed and verified at
`https://sample-demo-website-2026.web.app/security`.

## Known Gaps

- Full Firebase framework SSR/API deployment still requires a billing-enabled
  project.
- Screenshot-based visual QA was not performed after the final component pass.
- Smoke tests still do not assert the new panel headings, so a future change
  could remove these panels without failing route-only tests.
- There is no dedicated `/components` inventory route yet. Inventory panels are
  present on `/` and `/platform`.
- There is no structured component registry file yet with route, category,
  purpose, and provider-status metadata.

## Parked Lower-Priority Ideas

Potential later additions, after deploy/docs/full verification:

- Interactive state toggles for empty/loading/error/success states
- Search/filter inside a dedicated component inventory route
- Route-level demo script notes for sales walkthroughs
- Per-client copy slot map
- Provider readiness matrix for billing, email, SMS, storage, auth, analytics,
  and webhooks
- Mock permission scenarios for client, manager, admin, archived, and invited
  users
- Data model visual map for users, requests, files, messages, approvals, and
  audit logs
- Import/export sample file previews
- Audit trail detail drawer
- Inline validation examples
- Localization placeholders and copy-length stress examples
- Timezone/service-area controls
- SLA/status badges
- Announcement/banner center
- Release notes/changelog panel

Even lower-priority future ideas:

- Keyboard shortcut palette examples
- Saved manager queue views
- Favorite/pinned clients
- Bulk action toolbar mockup
- Calendar density modes
- Kanban swimlanes
- Table column customization
- Advanced sort/group controls
- Avatar/persona variants
- File annotation mockups
- Image comparison slider placeholder
- Map/service-area visual placeholder
- Checklist template library
- Reusable note templates
- Client satisfaction/NPS placeholder
- Referral/invite tracking placeholder
- Coupon/promo visual placeholder without billing
- Multi-location/business-unit selector
- White-label domain readiness panel
- Backup restore preview
- System activity feed
- Admin impersonation warning placeholder
- Consent history timeline
- Risk/compliance scorecard
- Data breach/incident notice placeholder
- Offline draft queue
- PWA install prompt placeholder
- Browser/device compatibility panel

## Recommended Resume Order

1. Run screenshot QA on desktop/mobile before the UI pass.
2. Add smoke assertions for the new component headings.
3. Consider a structured component registry and optional `/components` route.
4. Continue UI/brand swap work using the current static deployed baseline.
5. Attach billing and retry full Firebase framework deploy only if SSR/API
   behavior becomes necessary.
