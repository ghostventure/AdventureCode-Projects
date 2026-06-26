# Access Control Audit - 2026-05-25

## Current State

The live Firebase Hosting demo is static, but the anonymous visual surface now
follows the production access split. Public users can review the marketing,
auth, legal, data-request, maintenance, and sanitized public API surfaces.
Client, manager, admin, workflow, health, security, platform, user-directory,
and protected preview API surfaces require a demo role in the placeholder shell
or the real Firebase Auth replacement.

Framework-mode requests are enforced by `middleware.js`. Static Hosting cannot
run middleware, so the visible static shell uses `RouteAccessGate`, the public
homepage no longer includes internal dashboard content, protected route HTML is
overwritten with a sign-in-required shell, and the static deploy bundle only
emits public-safe API placeholders.

## Public In Leased Production

- `/`: public marketing GUI only. The internal template module dashboard should
  be hidden or moved behind staff access for production clients.
- `/auth`: sign in, sign up, invite acceptance, password reset, verification.
- `/privacy`: public legal page.
- `/terms`: public legal page.
- `/data-request`: public privacy/data request intake.
- `/maintenance`: public maintenance placeholder.
- `/api/health`: public only if sanitized.
- `/api/live`: public liveness probe.
- `/api/contact-preview`: public contact/lead intake if rate-limited and
  validated.
- `/robots.txt`
- `/sitemap.xml`

## Should Require Client Login

- `/client`
- `/api/profile-preview`

Notes:

- Managers/admins may view client records only through explicit permissions and
  audit logging.
- Client profile APIs must scope to the current authenticated user.

## Should Require Manager Or Admin Login

- `/manager`
- `/users`
- `/operations`
- `/operations-quality`
- `/data-workflow`
- `/communication`
- `/health`
- `/api/status`
- `/api/manager-profile-preview`
- `/api/workflow-preview`
- `/api/quality-preview`
- `/api/runbook-preview`

Notes:

- These pages expose queues, user records, workflow state, messages, runbooks,
  quality gates, operational status, and manager metadata.
- They are useful for template demos but should not be anonymous in leased
  production.

## Should Require Admin/Owner Login

- `/admin`
- `/platform`
- `/security`
- `/api/rate-limit-preview`
- `/api/data-job-preview`

Notes:

- These surfaces expose tenant settings, GUI registry, feature flags, provider
  readiness, security controls, exports, data jobs, audit views, and setup
  status.

## Should Require System Auth Or Signature Verification

- `/api/ready`
- `/api/webhook-preview`

Notes:

- Readiness can expose deployment/environment detail and should be limited to
  monitors, allowlisted infrastructure, or admins.
- Webhook intake must require signed provider payloads or a system token before
  any real integration is enabled.

## Route Policy File

The route access contract is recorded in:

```text
lib/route-access-policy.js
```

The current `canAccessRoute` helper delegates to that policy. Middleware,
navigation filtering, and the static shell gate all consume the same policy.
Real leased deployments should replace the demo role signal with Firebase Auth
sessions/claims and provider-appropriate server/API guards.
