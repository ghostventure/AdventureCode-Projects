export function createLogEvent({ level = "info", message, context = {}, traceId } = {}) {
  return {
    level,
    message,
    context,
    traceId: traceId || crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
}

export function createRequestTrace(request) {
  return {
    traceId: request?.headers?.get("x-request-id") || crypto.randomUUID(),
    path: request?.nextUrl?.pathname || "unknown",
    method: request?.method || "GET"
  };
}
