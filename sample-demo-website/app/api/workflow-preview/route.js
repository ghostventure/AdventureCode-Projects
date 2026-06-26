import { NextResponse } from "next/server";
import { createWorkflowItem, transitionWorkflow } from "../../../lib/data-workflow";

export async function POST(request) {
  const body = await request.json();
  const item = createWorkflowItem({
    title: body.title || "Preview workflow item",
    ownerId: body.ownerId || "manager-preview",
    status: body.status || "new"
  });
  const result = transitionWorkflow(item, body.nextStatus || "triage", body.actorId || "manager-preview");

  return NextResponse.json({
    ok: result.ok,
    workflow: result.item,
    event: result.event || null,
    error: result.error || null
  }, { status: result.ok ? 200 : 400 });
}
