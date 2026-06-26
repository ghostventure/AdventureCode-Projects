export const qualityGates = [
  { key: "lint", label: "Lint", required: true },
  { key: "audit", label: "Dependency audit", required: true },
  { key: "rules", label: "Firestore rules tests", required: true },
  { key: "build", label: "Production build", required: true },
  { key: "smoke", label: "Route smoke tests", required: true },
  { key: "a11y", label: "Accessibility checks", required: true },
  { key: "content-review", label: "Content review", required: false }
];

export const runbookTemplates = [
  "Deploy rollback",
  "Auth outage",
  "Firestore rules failure",
  "Contact form failure",
  "Performance degradation",
  "Security incident"
];

export function createQualityChecklist({ releaseId = "preview-release", gates = qualityGates } = {}) {
  return {
    releaseId,
    gates: gates.map((gate) => ({
      ...gate,
      status: "pending"
    })),
    createdAt: new Date().toISOString()
  };
}

export function calculateQualityScore(results = []) {
  if (results.length === 0) {
    return { score: 0, passed: 0, total: 0 };
  }

  const passed = results.filter((result) => result.status === "passed").length;

  return {
    score: Math.round((passed / results.length) * 100),
    passed,
    total: results.length
  };
}

export function createReleaseRecord({ version, summary, owner = "manager", status = "draft" }) {
  return {
    version,
    summary,
    owner,
    status,
    createdAt: new Date().toISOString()
  };
}

export function createChangeRequest({ title, risk = "medium", requestedBy = "manager" }) {
  return {
    title,
    risk,
    requestedBy,
    status: "review",
    requestedAt: new Date().toISOString()
  };
}

export function createRunbook({ title, steps = [] }) {
  return {
    title,
    steps,
    status: "active",
    updatedAt: new Date().toISOString()
  };
}

export function createQualityFinding({ title, severity = "medium", area = "operations" }) {
  return {
    title,
    severity,
    area,
    status: "open",
    createdAt: new Date().toISOString()
  };
}

export function createPostLaunchMonitor({ name, signal, threshold }) {
  return {
    name,
    signal,
    threshold,
    status: "watching",
    createdAt: new Date().toISOString()
  };
}
