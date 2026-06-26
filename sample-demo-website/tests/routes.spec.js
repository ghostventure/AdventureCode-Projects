import { expect, test } from "@playwright/test";

const publicRoutes = [
  ["/", "Book trusted help for repairs, installs, and home projects."],
  ["/auth", "Auth and UX state components are installed"],
  ["/privacy", "Privacy and consent boilerplate is installed"],
  ["/terms", "Terms boilerplate is installed"],
  ["/data-request", "Data request boilerplate is installed"],
  ["/maintenance", "Maintenance mode boilerplate is installed"]
];

const protectedRoutes = [
  ["/client", "client", "Client account components are installed"],
  ["/users", "manager", "Client and manager accounts are modeled separately"],
  ["/operations", "manager", "Workflow components are installed"],
  ["/operations-quality", "manager", "Operations and quality components are installed"],
  ["/data-workflow", "manager", "Data and workflow components are installed"],
  ["/communication", "manager", "Communication components are installed"],
  ["/manager", "manager", "Manager operations components are installed"],
  ["/admin", "admin", "Admin and security components are installed"],
  ["/security", "admin", "Tamper-resistant controls are tracked here"],
  ["/platform", "admin", "Reusable production controls are installed"],
  ["/health", "manager", "Health and environment checks are installed"]
];

async function authorizePage(page, role) {
  await page.context().addCookies([
    {
      name: "sample-demo-role",
      value: role,
      domain: "127.0.0.1",
      path: "/",
      sameSite: "Lax"
    }
  ]);
  await page.addInitScript((demoRole) => {
    window.localStorage.setItem("sample-demo-role", demoRole);
  }, role);
}

for (const [route, heading] of publicRoutes) {
  test(`${route} renders`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.locator("[data-session-state]")).toBeVisible();
  });
}

for (const [route, role, heading] of protectedRoutes) {
  test(`${route} requires auth and renders for ${role}`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(`/auth\\?next=${encodeURIComponent(route)}`));
    await expect(page.getByRole("heading", { name: "Auth and UX state components are installed" })).toBeVisible();

    await authorizePage(page, role);
    const response = await page.goto(route);

    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.locator("[data-session-state]")).toBeVisible();
  });
}

test("health api returns ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["cache-control"]).toContain("no-store");
  const body = await response.json();
  expect(body).toEqual(expect.objectContaining({ ok: true, status: "operational" }));
  expect(body.reliability.dependencies.length).toBeGreaterThan(0);
});

test("guarded routes include tamper-resistant trace headers", async ({ page }) => {
  await authorizePage(page, "client");
  const response = await page.goto("/client");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["x-template-mode"]).toBe("provider-free-static-ready");
  expect(response.headers()["x-template-route"]).toBe("/client");
  expect(response.headers()["x-request-id"]).toBeTruthy();
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("tamper guard rejects sensitive preview query keys", async ({ request }) => {
  const response = await request.get("/api/health?debug=1");
  expect(response.status()).toBe(400);
  expect(response.headers()["x-template-mode"]).toBe("provider-free-static-ready");

  const body = await response.json();
  expect(body).toEqual(expect.objectContaining({ ok: false, status: "blocked" }));
});

test("reliability endpoints return status", async ({ request }) => {
  const live = await request.get("/api/live");
  const ready = await request.get("/api/ready", { headers: { "x-demo-auth-role": "admin" } });
  const status = await request.get("/api/status", { headers: { "x-demo-auth-role": "manager" } });

  expect(live.ok()).toBeTruthy();
  expect(ready.ok()).toBeTruthy();
  expect(status.ok()).toBeTruthy();

  const statusBody = await status.json();
  expect(statusBody).toEqual(expect.objectContaining({ status: "operational" }));
  expect(statusBody.dependencies.length).toBeGreaterThan(0);
});

test("rate limit preview api returns headers", async ({ request }) => {
  const response = await request.get("/api/rate-limit-preview", { headers: { "x-demo-auth-role": "admin" } });
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["x-ratelimit-limit"]).toBe("20");
});

test("communication preview apis return queued work", async ({ request }) => {
  const contact = await request.post("/api/contact-preview", {
    data: {
      name: "Client Preview",
      email: "client@example.com",
      message: "This is a reusable communication preview message."
    }
  });
  const webhook = await request.post("/api/webhook-preview", {
    headers: { "x-demo-auth-role": "admin" },
    data: {
      provider: "test-provider",
      eventType: "message.delivered",
      payload: { id: "preview" }
    }
  });

  expect(contact.ok()).toBeTruthy();
  expect(webhook.ok()).toBeTruthy();

  const contactBody = await contact.json();
  const webhookBody = await webhook.json();

  expect(contactBody).toEqual(expect.objectContaining({ ok: true }));
  expect(contactBody.emailJob.status).toBe("queued");
  expect(webhookBody.event.status).toBe("received");
});

test("data workflow preview apis return jobs", async ({ request }) => {
  const workflow = await request.post("/api/workflow-preview", {
    headers: { "x-demo-auth-role": "manager" },
    data: {
      title: "Preview work",
      ownerId: "manager-preview",
      status: "new",
      nextStatus: "triage"
    }
  });
  const dataJob = await request.post("/api/data-job-preview", {
    headers: { "x-demo-auth-role": "admin" },
    data: {
      type: "export",
      collection: "requests",
      requestedBy: "manager-preview"
    }
  });

  expect(workflow.ok()).toBeTruthy();
  expect(dataJob.ok()).toBeTruthy();

  const workflowBody = await workflow.json();
  const dataJobBody = await dataJob.json();

  expect(workflowBody.workflow.status).toBe("triage");
  expect(dataJobBody.job.status).toBe("queued");
});

test("operations quality preview apis return controls", async ({ request }) => {
  const quality = await request.get("/api/quality-preview", { headers: { "x-demo-auth-role": "manager" } });
  const runbook = await request.post("/api/runbook-preview", {
    headers: { "x-demo-auth-role": "manager" },
    data: {
      title: "Preview runbook",
      steps: ["Check health", "Notify manager"]
    }
  });

  expect(quality.ok()).toBeTruthy();
  expect(runbook.ok()).toBeTruthy();

  const qualityBody = await quality.json();
  const runbookBody = await runbook.json();

  expect(qualityBody.score.score).toBe(100);
  expect(runbookBody.runbook.status).toBe("active");
});

test("profile preview api returns completion state", async ({ request }) => {
  const response = await request.get("/api/profile-preview", { headers: { "x-demo-auth-role": "client" } });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();

  expect(body.profile.completion.percent).toBeGreaterThan(0);
  expect(body.profile.avatar.initials).toBeTruthy();
  expect(body.profile.identity.emailVerified).toBeTruthy();
  expect(body.profile.review.status).toBe("pending-review");
  expect(body.profile.imported.email).toBe("avery@example.com");
});

test("manager profile preview api returns manager metadata", async ({ request }) => {
  const response = await request.get("/api/manager-profile-preview", { headers: { "x-demo-auth-role": "manager" } });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();

  expect(body.managerProfile.permissions.level).toBe("lead");
  expect(body.managerProfile.workload.capacityPercent).toBe(48);
  expect(body.managerProfile.managedAccounts.count).toBe(2);
  expect(body.managerProfile.accessReview.status).toBe("scheduled");
});

test("protected preview APIs reject anonymous requests", async ({ request }) => {
  const status = await request.get("/api/status");
  const profile = await request.get("/api/profile-preview");
  const dataJob = await request.post("/api/data-job-preview", { data: { type: "export" } });

  expect(status.status()).toBe(401);
  expect(profile.status()).toBe(401);
  expect(dataJob.status()).toBe(401);
});

test("missing route returns 404", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response.status()).toBe(404);
});
