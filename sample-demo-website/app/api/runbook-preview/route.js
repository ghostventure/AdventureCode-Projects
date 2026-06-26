import { NextResponse } from "next/server";
import { createRunbook } from "../../../lib/operations-quality";

export async function POST(request) {
  const body = await request.json();

  return NextResponse.json({
    ok: true,
    runbook: createRunbook({
      title: body.title || "Deploy rollback",
      steps: body.steps || ["Confirm incident", "Rollback release", "Verify health"]
    })
  });
}
