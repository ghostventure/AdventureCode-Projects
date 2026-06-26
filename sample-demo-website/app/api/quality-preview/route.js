import { NextResponse } from "next/server";
import { calculateQualityScore, createQualityChecklist, qualityGates } from "../../../lib/operations-quality";

export function GET() {
  const checklist = createQualityChecklist();
  const score = calculateQualityScore(qualityGates.map((gate) => ({ key: gate.key, status: "passed" })));

  return NextResponse.json({
    ok: true,
    checklist,
    score
  });
}
