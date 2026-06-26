import { NextResponse } from "next/server";
import { createDataJob } from "../../../lib/data-workflow";

export async function POST(request) {
  const body = await request.json();

  return NextResponse.json({
    ok: true,
    job: createDataJob({
      type: body.type || "export",
      collection: body.collection || "requests",
      requestedBy: body.requestedBy || "manager-preview"
    })
  });
}
