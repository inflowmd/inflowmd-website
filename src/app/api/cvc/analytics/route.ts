import { NextResponse } from "next/server";
import { fetchAnalyticsData } from "@/lib/google/analytics";
import { isAuthenticated } from "@/lib/cvc/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await fetchAnalyticsData();
    return NextResponse.json({ data, lastUpdated: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
