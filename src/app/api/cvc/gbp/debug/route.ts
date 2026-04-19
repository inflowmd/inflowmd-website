import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/cvc/session";
import { getAccessToken, MissingCredentialsError } from "@/lib/google/auth";

export const dynamic = "force-dynamic";

const SCOPES = ["https://www.googleapis.com/auth/business.manage"];

const DAILY_METRICS = [
  "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
  "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
  "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
  "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
  "CALL_CLICKS",
  "WEBSITE_CLICKS",
  "BUSINESS_DIRECTION_REQUESTS",
];

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawLocation = process.env.GBP_LOCATION ?? "";
  const location = rawLocation.startsWith("locations/") ? rawLocation : `locations/${rawLocation}`;

  if (!rawLocation) {
    return NextResponse.json({ error: "GBP_LOCATION not set" }, { status: 500 });
  }

  let token: string;
  try {
    token = await getAccessToken(SCOPES);
  } catch (err) {
    if (err instanceof MissingCredentialsError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to get access token", detail: errorMessage(err) },
      { status: 500 },
    );
  }

  // End date = yesterday (today's data is often empty / has latency).
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCMonth(start.getUTCMonth() - 6);
  start.setUTCDate(1);

  const dailyParams = new URLSearchParams();
  for (const m of DAILY_METRICS) dailyParams.append("dailyMetrics", m);
  dailyParams.set("dailyRange.startDate.year", String(start.getUTCFullYear()));
  dailyParams.set("dailyRange.startDate.month", String(start.getUTCMonth() + 1));
  dailyParams.set("dailyRange.startDate.day", String(start.getUTCDate()));
  dailyParams.set("dailyRange.endDate.year", String(end.getUTCFullYear()));
  dailyParams.set("dailyRange.endDate.month", String(end.getUTCMonth() + 1));
  dailyParams.set("dailyRange.endDate.day", String(end.getUTCDate()));

  const dailyUrl = `https://businessprofileperformance.googleapis.com/v1/${location}:fetchMultiDailyMetricsTimeSeries?${dailyParams.toString()}`;

  const monthlyParams = new URLSearchParams();
  monthlyParams.set("monthlyRange.startMonth.year", String(start.getUTCFullYear()));
  monthlyParams.set("monthlyRange.startMonth.month", String(start.getUTCMonth() + 1));
  monthlyParams.set("monthlyRange.endMonth.year", String(end.getUTCFullYear()));
  monthlyParams.set("monthlyRange.endMonth.month", String(end.getUTCMonth() + 1));
  const keywordsUrl = `https://businessprofileperformance.googleapis.com/v1/${location}/searchkeywords/impressions/monthly?${monthlyParams.toString()}`;

  const [dailyResult, keywordsResult] = await Promise.all([
    callApi(dailyUrl, token),
    callApi(keywordsUrl, token),
  ]);

  return NextResponse.json({
    location,
    dateRange: {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    },
    daily: {
      url: dailyUrl,
      ...dailyResult,
    },
    keywords: {
      url: keywordsUrl,
      ...keywordsResult,
    },
  });
}

async function callApi(
  url: string,
  token: string,
): Promise<{ status: number; ok: boolean; body: unknown }> {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const text = await res.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      // leave as text
    }
    return { status: res.status, ok: res.ok, body };
  } catch (err) {
    return { status: 0, ok: false, body: { error: errorMessage(err) } };
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
