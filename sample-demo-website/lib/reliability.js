export const reliabilityTargets = Object.freeze({
  uptimePercent: 99.9,
  apiP95Ms: 750,
  pageP95Ms: 1800,
  errorBudgetPercent: 0.1
});

export const dependencyList = [
  { key: "next", label: "Next.js application", required: true },
  { key: "firebaseAuth", label: "Firebase Auth", required: true },
  { key: "firestore", label: "Firestore", required: true },
  { key: "storage", label: "Firebase Storage", required: false },
  { key: "email", label: "Email provider", required: false },
  { key: "analytics", label: "Analytics provider", required: false }
];

export function createReliabilitySnapshot(overrides = {}) {
  const now = new Date().toISOString();

  return {
    ok: overrides.ok ?? true,
    status: overrides.status || "operational",
    generatedAt: now,
    targets: reliabilityTargets,
    dependencies: dependencyList.map((dependency) => ({
      ...dependency,
      status: overrides.dependencies?.[dependency.key] || "not-configured"
    }))
  };
}

export function createLiveProbePayload() {
  return {
    ok: true,
    live: true,
    checkedAt: new Date().toISOString()
  };
}

export function createReadyProbePayload(environment, snapshot = createReliabilitySnapshot()) {
  return {
    ok: snapshot.ok,
    ready: snapshot.ok,
    environment,
    checkedAt: snapshot.generatedAt
  };
}

export function createStatusProbePayload(snapshot = createReliabilitySnapshot()) {
  return {
    ok: snapshot.ok,
    status: snapshot.status,
    dependencies: snapshot.dependencies,
    degradedModePlan: getDegradedModePlan(),
    checkedAt: snapshot.generatedAt
  };
}

export function calculateErrorBudget({ totalRequests = 0, failedRequests = 0 } = {}) {
  if (totalRequests <= 0) {
    return {
      totalRequests,
      failedRequests,
      failureRate: 0,
      remainingBudgetPercent: reliabilityTargets.errorBudgetPercent
    };
  }

  const failureRate = (failedRequests / totalRequests) * 100;

  return {
    totalRequests,
    failedRequests,
    failureRate,
    remainingBudgetPercent: Math.max(0, reliabilityTargets.errorBudgetPercent - failureRate)
  };
}

export function createIncidentRecord({ title, severity = "low", status = "investigating", owner = "manager" }) {
  return {
    title,
    severity,
    status,
    owner,
    openedAt: new Date().toISOString()
  };
}

export function getDegradedModePlan() {
  return [
    "Keep public pages online",
    "Disable nonessential writes",
    "Queue email and export work",
    "Show user-safe status messaging",
    "Record audit and incident events"
  ];
}
