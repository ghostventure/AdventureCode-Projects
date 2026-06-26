export const guiSummaryStats = [
  { label: "Routes", value: "17", detail: "Primary pages wired into the app shell" },
  { label: "APIs", value: "13", detail: "Preview, health, workflow, and profile endpoints" },
  { label: "Rule checks", value: "11", detail: "Firestore rule contract checks" },
  { label: "Smoke tests", value: "32", detail: "Playwright route and API checks" }
];

export const guiModuleGroups = [
  {
    title: "Account Layer",
    links: [
      { label: "Auth", href: "/auth", detail: "Sign-in, reset, account lifecycle" },
      { label: "Users", href: "/users", detail: "User database and profile plugins" },
      { label: "Client", href: "/client", detail: "Client workspace placeholders" },
      { label: "Manager", href: "/manager", detail: "Manager workspace and profile controls" }
    ]
  },
  {
    title: "Operations Layer",
    links: [
      { label: "Operations", href: "/operations", detail: "Queues, schedules, tasks" },
      { label: "Data and Workflow", href: "/data-workflow", detail: "State machines, jobs, reports" },
      { label: "Operations Quality", href: "/operations-quality", detail: "Runbooks, releases, QA gates" },
      { label: "Communication", href: "/communication", detail: "Messages, notifications, webhooks" }
    ]
  },
  {
    title: "Platform Layer",
    links: [
      { label: "Platform", href: "/platform", detail: "Flags, SEO, exports, consent" },
      { label: "Admin", href: "/admin", detail: "Security and admin controls" },
      { label: "Security", href: "/security", detail: "Hardening and tamper resistance" },
      { label: "Health", href: "/health", detail: "Readiness and reliability" }
    ]
  },
  {
    title: "Policy Layer",
    links: [
      { label: "Privacy", href: "/privacy", detail: "Privacy boilerplate" },
      { label: "Terms", href: "/terms", detail: "Terms boilerplate" },
      { label: "Data Request", href: "/data-request", detail: "Data rights intake" },
      { label: "Maintenance", href: "/maintenance", detail: "Maintenance mode placeholder" }
    ]
  }
];

export const guiApiLinks = [
  { label: "Health", href: "/api/health" },
  { label: "Ready", href: "/api/ready" },
  { label: "Status", href: "/api/status" },
  { label: "Profile", href: "/api/profile-preview" },
  { label: "Manager Profile", href: "/api/manager-profile-preview" }
];
