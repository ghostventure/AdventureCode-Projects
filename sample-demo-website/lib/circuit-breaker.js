export const circuitBreakerDefaults = Object.freeze({
  failureThreshold: 5,
  recoveryAfterMs: 60_000
});

export function createCircuitState(overrides = {}) {
  return {
    status: "closed",
    failureCount: 0,
    openedAt: null,
    ...overrides
  };
}

export function recordCircuitSuccess(state) {
  return {
    ...state,
    status: "closed",
    failureCount: 0,
    openedAt: null
  };
}

export function recordCircuitFailure(state, policy = circuitBreakerDefaults) {
  const failureCount = state.failureCount + 1;
  const shouldOpen = failureCount >= policy.failureThreshold;

  return {
    ...state,
    failureCount,
    status: shouldOpen ? "open" : "closed",
    openedAt: shouldOpen ? new Date().toISOString() : state.openedAt
  };
}

export function canAttemptCircuit(state, policy = circuitBreakerDefaults, now = Date.now()) {
  if (state.status !== "open") return true;
  if (!state.openedAt) return false;

  return now - new Date(state.openedAt).getTime() >= policy.recoveryAfterMs;
}
