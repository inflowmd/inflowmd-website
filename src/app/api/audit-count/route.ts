import { NextResponse } from "next/server";
import { getAuditCount } from "@/lib/auditCounter";

/**
 * How many unique practices have been audited live at the event.
 *
 * The booth poster polls this every 30 seconds and renders nothing below the
 * display threshold, so a null (store unreachable) and a small number both
 * end the same way on screen: an empty corner rather than a wrong claim.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const count = await getAuditCount();
  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store" } }
  );
}
