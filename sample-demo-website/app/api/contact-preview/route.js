import { NextResponse } from "next/server";
import { createNotification } from "../../../lib/communication";
import { createEmailJob } from "../../../lib/email-adapter";
import { contactFormSchema, validateWithSchema } from "../../../lib/forms";
import { checkMemoryRateLimit, createRateLimitHeaders, createRateLimitKey } from "../../../lib/rate-limit";

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkMemoryRateLimit(createRateLimitKey(["contact-preview", ip]), { limit: 10 });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate-limited" },
      { status: 429, headers: createRateLimitHeaders(rateLimit) }
    );
  }

  const body = await request.json();
  const validation = validateWithSchema(contactFormSchema, body);

  if (!validation.ok) {
    return NextResponse.json({ ok: false, errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json(
    {
      ok: true,
      notification: createNotification({
        userId: "manager-preview",
        title: "New contact message",
        body: validation.data.message,
        actionUrl: "/communication"
      }),
      emailJob: createEmailJob({
        template: "contactConfirmation",
        to: validation.data.email,
        payload: validation.data
      })
    },
    { headers: createRateLimitHeaders(rateLimit) }
  );
}
