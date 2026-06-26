const memoryBuckets = new Map();

export function createRateLimitKey(parts = []) {
  return parts.filter(Boolean).join(":").toLowerCase();
}

export function checkMemoryRateLimit(key, { limit = 5, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const bucket = memoryBuckets.get(key) ?? { count: 0, resetAt: now + windowMs };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  bucket.count += 1;
  memoryBuckets.set(key, bucket);

  return {
    allowed: bucket.count <= limit,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: new Date(bucket.resetAt).toISOString()
  };
}

export function createRateLimitHeaders(result) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": result.resetAt
  };
}
