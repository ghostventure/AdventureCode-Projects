import { createLiveProbePayload } from "../../../lib/reliability";

export function GET() {
  return Response.json(createLiveProbePayload());
}
