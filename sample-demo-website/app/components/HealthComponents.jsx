import { getEnvReadiness } from "../../lib/env";
import { createReliabilitySnapshot } from "../../lib/reliability";

export function EnvironmentReadiness() {
  const readiness = getEnvReadiness();

  return (
    <section className="component-card">
      <p className="component-label">Environment validation</p>
      <div className="split-list">
        {readiness.map((item) => (
          <span key={item.key}>{item.key}: {item.ready ? "ready" : "missing"}</span>
        ))}
      </div>
    </section>
  );
}

export function HealthCheckPanel() {
  const snapshot = createReliabilitySnapshot();

  return (
    <section className="component-card">
      <p className="component-label">Health check</p>
      <h2>{snapshot.ok ? "OK" : "Review"}</h2>
      <p>Application health, readiness, liveness, and reliability checks are available from API routes.</p>
    </section>
  );
}
