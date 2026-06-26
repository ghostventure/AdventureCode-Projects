import { createCircuitState, recordCircuitFailure } from "../../lib/circuit-breaker";
import {
  calculateErrorBudget,
  createIncidentRecord,
  createReliabilitySnapshot,
  getDegradedModePlan
} from "../../lib/reliability";
import { defaultRetryPolicy, getRetryDelay } from "../../lib/retry-policy";
import { createLogEvent } from "../../lib/structured-logger";

export function ReliabilitySnapshotPanel() {
  const snapshot = createReliabilitySnapshot();

  return (
    <section className="component-card">
      <p className="component-label">Reliability snapshot</p>
      <h2>{snapshot.status}</h2>
      <p>{snapshot.dependencies.length} dependencies are tracked for health and status reporting.</p>
    </section>
  );
}

export function RetryPolicyPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Retry/backoff</p>
      <h2>{defaultRetryPolicy.attempts} attempts</h2>
      <p>Next retry delay preview: {getRetryDelay(2)}ms with bounded exponential backoff.</p>
    </section>
  );
}

export function CircuitBreakerPanel() {
  const state = recordCircuitFailure(createCircuitState({ failureCount: 4 }));

  return (
    <section className="component-card warning-card">
      <p className="component-label">Circuit breaker</p>
      <h2>{state.status}</h2>
      <p>Dependency calls can fail closed after repeated faults and recover after a cooldown.</p>
    </section>
  );
}

export function ErrorBudgetPanel() {
  const budget = calculateErrorBudget({ totalRequests: 10000, failedRequests: 3 });

  return (
    <section className="component-card">
      <p className="component-label">Error budget</p>
      <h2>{budget.remainingBudgetPercent.toFixed(2)}%</h2>
      <p>Request failure budgets are modeled for future reporting and alerting.</p>
    </section>
  );
}

export function DegradedModePanel() {
  return (
    <section className="component-card">
      <p className="component-label">Graceful degradation</p>
      <div className="split-list">
        {getDegradedModePlan().map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}

export function IncidentPanel() {
  const incident = createIncidentRecord({ title: "Preview dependency incident" });

  return (
    <section className="component-card">
      <p className="component-label">Incident record</p>
      <h2>{incident.status}</h2>
      <p>{incident.title}</p>
    </section>
  );
}

export function StructuredLogPanel() {
  const event = createLogEvent({ message: "Reliability event preview", context: { route: "/health" } });

  return (
    <section className="component-card">
      <p className="component-label">Structured logging</p>
      <h2>{event.level}</h2>
      <p>Trace ID: {event.traceId.slice(0, 8)}</p>
    </section>
  );
}
