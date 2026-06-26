import { validateEnvironmentContract } from "../../../lib/env";
import { createReadyProbePayload } from "../../../lib/reliability";

export function GET() {
  const environment = validateEnvironmentContract();

  return Response.json(createReadyProbePayload(environment));
}
