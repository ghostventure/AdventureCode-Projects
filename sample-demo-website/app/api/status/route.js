import { createStatusProbePayload } from "../../../lib/reliability";

export function GET() {
  return Response.json(createStatusProbePayload());
}
