import { NextResponse } from "next/server";
import { normalizeUrl, runAudit } from "@/lib/runAudit";
import { getCached } from "@/lib/cache";
import { assertSafeUrl } from "@/lib/ssrfGuard";
import { clientIp, rateLimit } from "@/lib/rateLimit";

/**
 * 150s ceiling. PageSpeed alone can take the better part of a minute on a
 * heavy site; the previous 60s budget killed the function mid-run and handed
 * the caller a dead connection instead of a report.
 */
export const maxDuration = 150;
export const dynamic = "force-dynamic";

/**
 * Neutral rejection. The caller learns the address was refused and nothing
 * else — an SSRF probe must not be able to read internal topology out of our
 * error messages.
 */
const REFUSED = { error: "That address could not be audited." };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const payload = (body ?? {}) as { url?: unknown; force?: unknown };

  if (typeof payload.url !== "string") {
    return NextResponse.json({ error: "A 'url' string is required." }, { status: 400 });
  }

  const url = normalizeUrl(payload.url);
  if (!url) {
    return NextResponse.json(
      { error: "That does not look like a valid website address." },
      { status: 400 }
    );
  }

  const force = payload.force === true;

  // Cache hits are served before any limiting or outbound work: they make no
  // network request, so they carry no abuse risk, and the booth picker must
  // never be throttled.
  if (!force) {
    const cached = getCached(url);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": "no-store", "X-Audit-Source": "cache" },
      });
    }
  }

  // From here we make outbound requests on the caller's behalf, so both the
  // rate limit and the SSRF guard apply.
  const limit = rateLimit(clientIp(request));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(limit.retryAfter),
        },
      }
    );
  }

  // Fail fast on internal targets. fetchHtml re-checks every redirect hop, so
  // this is the outer of two layers rather than the only one.
  const verdict = await assertSafeUrl(url);
  if (!verdict.ok) {
    return NextResponse.json(REFUSED, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const result = await runAudit(url);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
      "X-Audit-Source": "live",
      "X-RateLimit-Remaining": String(limit.remaining),
    },
  });
}
