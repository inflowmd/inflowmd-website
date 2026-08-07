/**
 * In-memory sliding-window rate limiter.
 *
 * Scoped to a single serverless instance, which is adequate here: the booth
 * runs in one region at small scale, and the limit exists to stop abuse of the
 * outbound fetcher rather than to enforce a precise quota. Under concurrency
 * the effective ceiling is per-instance, so the real limit can be a multiple of
 * the configured one — acceptable for this threat model, not for billing.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
/** Stops the map growing without bound if the process is long-lived. */
const MAX_TRACKED_KEYS = 5_000;

const hits = new Map<string, number[]>();

export interface RateLimitVerdict {
  allowed: boolean;
  remaining: number;
  /** Seconds until the caller may retry. */
  retryAfter: number;
}

function prune(now: number): void {
  if (hits.size <= MAX_TRACKED_KEYS) return;
  for (const [key, times] of hits) {
    const live = times.filter((t) => now - t < WINDOW_MS);
    if (live.length === 0) hits.delete(key);
    else hits.set(key, live);
  }
}

export function rateLimit(
  key: string,
  limit: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS
): RateLimitVerdict {
  const now = Date.now();
  prune(now);

  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    const oldest = recent[0];
    hits.set(key, recent);
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  recent.push(now);
  hits.set(key, recent);
  return { allowed: true, remaining: limit - recent.length, retryAfter: 0 };
}

/** Test helper — clears all tracked windows. */
export function resetRateLimit(): void {
  hits.clear();
}

/** Best-effort client IP from proxy headers. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
