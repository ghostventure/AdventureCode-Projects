export const SESSION_TIMEOUT_MINUTES = 10;
export const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;
export const SESSION_WARNING_MS = 60 * 1000;
export const SESSION_CHANNEL_NAME = "sample-demo-session";

export function getSessionDeadline(now = Date.now()) {
  return now + SESSION_TIMEOUT_MS;
}

export function getRemainingSessionMs(deadline, now = Date.now()) {
  return Math.max(0, deadline - now);
}

export function isSessionExpired(deadline, now = Date.now()) {
  return getRemainingSessionMs(deadline, now) === 0;
}
