export function createAnalyticsEvent(name, payload = {}) {
  return {
    name,
    payload,
    createdAt: new Date().toISOString()
  };
}

export function trackLocalEvent(name, payload = {}) {
  return createAnalyticsEvent(name, {
    source: "local-preview",
    ...payload
  });
}
