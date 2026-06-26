import { getEnvReadiness } from "../../../lib/env";
import { createReliabilitySnapshot } from "../../../lib/reliability";
import { createLogEvent, createRequestTrace } from "../../../lib/structured-logger";

export function GET() {
  const envReadiness = getEnvReadiness();
  const snapshot = createReliabilitySnapshot();

  return Response.json({
    ok: snapshot.ok,
    service: "sample-demo-website",
    status: snapshot.status,
    environment: envReadiness,
    reliability: snapshot,
    timestamp: new Date().toISOString()
  });
}

export function HEAD(request) {
  createLogEvent({
    message: "health-head",
    context: createRequestTrace(request)
  });

  return new Response(null, { status: 204 });
}
