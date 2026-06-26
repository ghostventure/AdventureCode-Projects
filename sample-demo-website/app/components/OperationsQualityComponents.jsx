import {
  calculateQualityScore,
  createChangeRequest,
  createPostLaunchMonitor,
  createQualityChecklist,
  createQualityFinding,
  createReleaseRecord,
  createRunbook,
  qualityGates,
  runbookTemplates
} from "../../lib/operations-quality";

export function QualityGatePanel() {
  const checklist = createQualityChecklist();

  return (
    <section className="component-card">
      <p className="component-label">Quality gates</p>
      <div className="split-list">
        {checklist.gates.map((gate) => (
          <span key={gate.key}>{gate.label}: {gate.required ? "required" : "optional"}</span>
        ))}
      </div>
    </section>
  );
}

export function QualityScorePanel() {
  const score = calculateQualityScore(qualityGates.map((gate) => ({ key: gate.key, status: "passed" })));

  return (
    <section className="component-card">
      <p className="component-label">Quality score</p>
      <h2>{score.score}%</h2>
      <p>{score.passed} of {score.total} gates passed in the preview model.</p>
    </section>
  );
}

export function ReleaseReadinessPanel() {
  const release = createReleaseRecord({
    version: "0.1.0",
    summary: "Reusable template baseline"
  });

  return (
    <section className="component-card">
      <p className="component-label">Release readiness</p>
      <h2>{release.status}</h2>
      <p>{release.version}: {release.summary}</p>
    </section>
  );
}

export function ChangeControlPanel() {
  const change = createChangeRequest({
    title: "Template configuration change",
    risk: "low"
  });

  return (
    <section className="component-card">
      <p className="component-label">Change control</p>
      <h2>{change.status}</h2>
      <p>{change.title}: {change.risk} risk</p>
    </section>
  );
}

export function RunbookPanel() {
  const runbook = createRunbook({
    title: "Deploy rollback",
    steps: ["Confirm incident", "Pause deploys", "Rollback release", "Verify health"]
  });

  return (
    <section className="component-card">
      <p className="component-label">Runbooks</p>
      <h2>{runbook.status}</h2>
      <p>{runbookTemplates.length} default runbook topics are registered.</p>
    </section>
  );
}

export function QualityFindingPanel() {
  const finding = createQualityFinding({
    title: "Preview quality finding",
    severity: "low"
  });

  return (
    <section className="component-card">
      <p className="component-label">QA findings</p>
      <h2>{finding.status}</h2>
      <p>{finding.title}: {finding.severity}</p>
    </section>
  );
}

export function PostLaunchMonitorPanel() {
  const monitor = createPostLaunchMonitor({
    name: "Contact API latency",
    signal: "p95",
    threshold: "750ms"
  });

  return (
    <section className="component-card">
      <p className="component-label">Post-launch monitor</p>
      <h2>{monitor.status}</h2>
      <p>{monitor.name}: {monitor.signal} under {monitor.threshold}</p>
    </section>
  );
}
