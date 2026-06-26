export const defaultRetryPolicy = Object.freeze({
  attempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 2500,
  jitterMs: 100
});

export function getRetryDelay(attempt, policy = defaultRetryPolicy) {
  const exponentialDelay = policy.baseDelayMs * 2 ** Math.max(0, attempt - 1);
  return Math.min(policy.maxDelayMs, exponentialDelay + policy.jitterMs);
}

export async function retryAsync(task, policy = defaultRetryPolicy) {
  let lastError;

  for (let attempt = 1; attempt <= policy.attempts; attempt += 1) {
    try {
      return await task({ attempt });
    } catch (error) {
      lastError = error;

      if (attempt === policy.attempts) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, getRetryDelay(attempt, policy)));
    }
  }

  throw lastError;
}
