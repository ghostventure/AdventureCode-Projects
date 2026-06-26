import { NextResponse } from "next/server";
import { createWebhookEvent } from "../../../lib/communication";

export async function POST(request) {
  const body = await request.json();

  return NextResponse.json({
    ok: true,
    event: createWebhookEvent({
      provider: body.provider || "preview",
      eventType: body.eventType || "event.received",
      payload: body.payload || {}
    })
  });
}
