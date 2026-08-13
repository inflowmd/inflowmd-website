import { NextResponse, after } from "next/server";
import { normalizeUrl, runAudit } from "@/lib/runAudit";
import { recordAudit } from "@/lib/auditCounter";
import { getCached } from "@/lib/cache";
import { assertSafeUrl } from "@/lib/ssrfGuard";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { UNAUTHENTICATED_WARNING, resolveApiKey } from "@/lib/pagespeed";

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

  // Surfaced here as well as at the call site: if the Vercel environment
  // variable ever goes missing, this is the line that says so in production
  // logs instead of the route quietly degrading to anonymous quota. Checked
  // only on the live path — a cache hit never touches PageSpeed.
  if (!resolveApiKey()) {
    console.error(`${UNAUTHENTICATED_WARNING} Route: /api/audit, target: ${url}`);
  }

  const result = await runAudit(url);

  // Booth counter: unique domains audited LIVE at the event.
  //
  // after(), not a bare floating promise. The visitor should not wait on a
  // GitHub round trip for a number on a poster, but on Vercel the function is
  // frozen the moment the response is sent — a `void recordAudit(...)` was
  // silently killed mid-flight and nothing was ever recorded in production.
  // after() is the supported way to keep the work alive past the response.
  after(async () => {
    await recordAudit(url).catch(() => {});
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
      "X-Audit-Source": "live",
      "X-RateLimit-Remaining": String(limit.remaining),
    },
  });
}
