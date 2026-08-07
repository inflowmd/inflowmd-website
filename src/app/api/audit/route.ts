import { NextResponse } from "next/server";
import { normalizeUrl, runAudit } from "@/lib/runAudit";
import { getCached } from "@/lib/cache";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

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

  // Pre-warmed hit: return immediately, preserving the original fetchedAt so
  // the reader can see when it was actually measured.
  if (!force) {
    const cached = getCached(url);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": "no-store", "X-Audit-Source": "cache" },
      });
    }
  }

  const result = await runAudit(url);

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store", "X-Audit-Source": "live" },
  });
}
