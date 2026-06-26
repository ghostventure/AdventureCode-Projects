# Verification Report

Last updated: 2026-05-26

## Current Verification

Latest accepted state: static Firebase Hosting demo with home services WebP
b-roll imagery, global non-stick footer preview, no-cache HTML policy, static
deploy support for `public/` assets, global Day/Night theme support, and page
text wrapping safeguards. The latest consolidation pass centralizes shared
action/link CSS and reliability probe payload builders. Protected page/API
surfaces now enforce the route access policy in framework mode and hide
protected content in the static demo shell. Static deploy also replaces
protected route HTML with a sign-in-required shell so protected prerender
payloads are not published. The theme toggle is installed in the shared
navigation and persisted with `localStorage`. Redundant PNG project copies were
removed during the 2026-05-26 consolidation pass.

Commands passed:

```sh
npm run lint
npm run build
npm run build:static
npm run smoke
npm run deploy:static
```

Results:

- ESLint passed with zero warnings.
- Next production build completed successfully.
- Static bundle generation completed successfully.
- Playwright smoke suite passed 34 checks.
- Firebase Hosting deployed successfully to `sample-demo-website-2026`.
- Static deploy contains only public API placeholders and sign-in-required HTML
  for protected routes.
- Static CSS contains the wrapping safeguards for `overflow-wrap`,
  `white-space: normal`, and `min-width: 0`.
- Shared CSS no longer contains the GUI template `white-space: nowrap`
  navigation override.
- Smoke tests verify anonymous redirects for protected pages, authorized demo
  role access for client/manager/admin routes, and 401 responses for protected
  preview APIs without a demo role.

Live URL:

```text
https://sample-demo-website-2026.web.app
```

Live checks:

- `/`: HTTP 200 with `Cache-Control: no-cache, max-age=0, must-revalidate`
- `/images/home-services/kitchen-cabinet-repair.webp`: HTTP 200, `image/webp`
- `/images/home-services/walkway-pressure-wash.webp`: HTTP 200, `image/webp`
- `/images/home-services/kitchen-cabinet-repair.png`: HTTP 404 after PNG cleanup
- Security headers are present on the static Hosting response.
- Deployed HTML contains the early `sample-demo-theme` boot script and
  `data-theme="day"` default marker.
- Deployed CSS contains `[data-theme=night]` token overrides and
  `.theme-toggle` styling.

## Current Assets

Rendered local b-roll assets:

- `deploy-static/images/home-services/kitchen-cabinet-repair.webp`
- `deploy-static/images/home-services/light-fixture-install.webp`
- `deploy-static/images/home-services/walkway-pressure-wash.webp`
- `deploy-static/images/home-services/sink-plumbing-repair.webp`

The large generated PNG copies were removed from the project after WebP
conversion. The original generations remain in Codex's generated-image store;
only WebP files are project assets and deploy artifacts.

## Current Surfaces

- Landing hero: real home-services b-roll image.
- Homepage: b-roll showcase using all four local WebP assets.
- Homepage access: public homepage no longer includes the internal template
  module dashboard payload.
- Global shell: b-roll strip across routes.
- Global footer: dark full-width non-stick footer boilerplate preview.
- Theme system: Day/Night toggle in shared nav, root `data-theme`, persisted
  `sample-demo-theme` preference, and system dark preference fallback.
- Text wrapping: global CSS keeps long copy, labels, controls, and compact
  route text from forcing horizontal overflow.
- Access control: public routes stay visible; protected pages render through
  `RouteAccessGate`; framework APIs are guarded by middleware role checks.
- Static API bundle: only public-safe placeholders are emitted for
  `/api/contact-preview`, `/api/health`, and `/api/live`.
- Protected static pages: `/client`, `/manager`, `/admin`, `/users`,
  `/operations`, `/operations-quality`, `/data-workflow`, `/communication`,
  `/platform`, `/security`, and `/health` publish sign-in-required HTML only.
- Consolidated probes: `/api/live`, `/api/ready`, and `/api/status` reuse
  payload builders from `lib/reliability.js`.
- Static deploy: `scripts/build-static-deploy.mjs` copies `public/` into
  `deploy-static/`.
- Static image compatibility: `next.config.mjs` sets `images.unoptimized = true`
  so Firebase Hosting does not depend on a Next image optimizer runtime.

## Historical Checkpoints

- Plug n play GUI pass: lint, build, static build, and smoke passed; route/API
  coverage was aligned for the static demo.
- Global right-rail navigation pass: nav rail verified across public static
  pages at desktop width.
- Global non-stick boilerplate pass: layout shell, action row, section index,
  footer, compact footer, and shared CSS contract installed.
- Footer visibility pass: `GlobalNonstickFooter` mounted in `AppShell` so footer
  boilerplates are visible on every route.
- Footer styling pass: footer preview moved onto a dark full-width background.
- HTML cache correction: Firebase Hosting HTML changed from the default
  one-hour cache to `no-cache, max-age=0, must-revalidate`.
- B-roll imagery pass: local WebP imagery installed and deployed.
- Theme awareness pass: Day/Night toggle, early boot script, and shared
  day/night CSS tokens installed and deployed.
- Page wrapping pass: global text wrapping and button/control line wrapping
  installed and verified in the static CSS bundle.
- Follow-up consolidation pass: shared action/link CSS merged for CTA/API/control
  surfaces, GUI nowrap override removed, and reliability probe payloads moved
  into shared helpers.
- Access-control enforcement pass: route policy moved from advisory to active
  middleware/static-shell enforcement, auth page gained demo role controls, and
  protected API placeholders were removed from the static deploy bundle.
- Static source hardening pass: public homepage internal dashboard removed and
  protected static route HTML overwritten before Firebase deploy.

## Route/API Coverage

Smoke tests cover the main routes plus API previews:

- `/`
- `/auth`
- `/client`
- `/users`
- `/operations`
- `/operations-quality`
- `/data-workflow`
- `/communication`
- `/manager`
- `/admin`
- `/security`
- `/platform`
- `/health`
- `/privacy`
- `/terms`
- `/data-request`
- `/maintenance`
- `/api/health`
- `/api/live`
- `/api/ready`
- `/api/status`
- `/api/rate-limit-preview`
- `/api/contact-preview`
- `/api/webhook-preview`
- `/api/workflow-preview`
- `/api/data-job-preview`
- `/api/quality-preview`
- `/api/runbook-preview`
- `/api/profile-preview`
- `/api/manager-profile-preview`

## Known Notes

- Static Firebase Hosting is the active no-billing demo path.
- Full Next.js framework deployment through `firebase.json` requires Cloud
  Functions, Cloud Build, Artifact Registry, and Cloud Run; those services are
  blocked while the Firebase project has no billing account attached.
- The CSP still allows inline scripts/eval for Next.js development/runtime
  compatibility and should be tightened during final production integration.
- Some adapters are intentionally preview-safe until real provider credentials
  are added.
- The template is not currently a git repository.
