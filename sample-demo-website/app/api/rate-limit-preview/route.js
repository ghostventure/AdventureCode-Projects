import { NextResponse } from "next/server";
import { checkMemoryRateLimit, createRateLimitHeaders, createRateLimitKey } from "../../../lib/rate-limit";

export function GET(request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const result = checkMemoryRateLimit(createRateLimitKey(["preview", ip]), { limit: 20 });

  return NextResponse.json(
    { ok: result.allowed, rateLimit: result },
    {
      status: result.allowed ? 200 : 429,
      headers: createRateLimitHeaders(result)
    }
  );
}
