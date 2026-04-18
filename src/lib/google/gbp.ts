import { MissingCredentialsError, getAccessToken } from "./auth";
import { monthLabel } from "./dates";

const SCOPES = ["https://www.googleapis.com/auth/business.manage"];

const DAILY_METRICS = [
  "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
  "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
  "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
  "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
  "CALL_CLICKS",
  "WEBSITE_CLICKS",
  "BUSINESS_DIRECTION_REQUESTS",
] as const;

type DailyMetric = (typeof DAILY_METRICS)[number];

export interface GBPMonth {
  month: string;
  views: number;
  searches: number; // impressions on search surfaces
  calls: number;
  directions: number;
  website: number;
}

export interface GBPSearchQuery {
  query: string;
  impressions: number;
}

export interface GBPReviews {
  averageRating: number | null;
  totalCount: number | null;
  newThisQuarter: number | null;
}

export interface GBPTotals {
  views: number;
  viewsChange: number | null;
  calls: number;
  callsChange: number | null;
  directions: number;
  directionsChange: number | null;
  website: number;
  websiteChange: number | null;
}

export interface GBPData {
  monthly: GBPMonth[];
  searchQueries: GBPSearchQuery[];
  reviews: GBPReviews;
  totals: GBPTotals;
}

function requireLocation(): string {
  const loc = process.env.GBP_LOCATION;
  if (!loc) throw new MissingCredentialsError(["GBP_LOCATION"]);
  return loc.startsWith("locations/") ? loc : `locations/${loc}`;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function toDateParts(d: Date): DateParts {
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

interface FetchMultiDailyMetricsResponse {
  multiDailyMetricTimeSeries?: Array<{
    dailyMetricTimeSeries?: Array<{
      dailyMetric?: DailyMetric;
      timeSeries?: {
        datedValues?: Array<{ date?: DateParts; value?: string }>;
      };
    }>;
  }>;
}

interface SearchKeywordsResponse {
  searchKeywordsCounts?: Array<{
    searchKeyword?: string;
    insightsValue?: { value?: string; threshold?: string };
  }>;
}

function monthKey(date: DateParts): string {
  return `${date.year}${String(date.month).padStart(2, "0")}`;
}

export async function fetchGbpData(): Promise<GBPData> {
  const location = requireLocation();
  const token = await getAccessToken(SCOPES);

  const end = new Date();
  const start = new Date(end);
  start.setUTCMonth(start.getUTCMonth() - 6);
  start.setUTCDate(1);

  const params = new URLSearchParams();
  for (const m of DAILY_METRICS) params.append("dailyMetrics", m);
  const s = toDateParts(start);
  const e = toDateParts(end);
  params.set("dailyRange.startDate.year", String(s.year));
  params.set("dailyRange.startDate.month", String(s.month));
  params.set("dailyRange.startDate.day", String(s.day));
  params.set("dailyRange.endDate.year", String(e.year));
  params.set("dailyRange.endDate.month", String(e.month));
  params.set("dailyRange.endDate.day", String(e.day));

  const metricsUrl = `https://businessprofileperformance.googleapis.com/v1/${location}:fetchMultiDailyMetricsTimeSeries?${params.toString()}`;

  const [metricsRes, searchQueries, reviews] = await Promise.all([
    fetch(metricsUrl, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (r): Promise<FetchMultiDailyMetricsResponse> => {
      if (!r.ok) {
        throw new Error(`GBP metrics request failed: ${r.status} ${await r.text()}`);
      }
      return r.json();
    }),
    fetchSearchKeywords(location, token, start, end),
    fetchReviews(),
  ]);

  // Group by month
  const monthMap = new Map<string, GBPMonth>();
  for (const series of metricsRes.multiDailyMetricTimeSeries ?? []) {
    for (const mts of series.dailyMetricTimeSeries ?? []) {
      const metric = mts.dailyMetric;
      if (!metric) continue;
      for (const dv of mts.timeSeries?.datedValues ?? []) {
        if (!dv.date) continue;
        const key = monthKey(dv.date);
        const existing = monthMap.get(key) ?? {
          month: monthLabel(key),
          views: 0,
          searches: 0,
          calls: 0,
          directions: 0,
          website: 0,
        };
        const val = parseInt(dv.value ?? "0", 10);
        applyMetric(existing, metric, val);
        monthMap.set(key, existing);
      }
    }
  }

  const monthly = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  const totals = buildTotals(monthly);

  return {
    monthly,
    searchQueries,
    reviews,
    totals,
  };
}

function applyMetric(month: GBPMonth, metric: DailyMetric, val: number) {
  switch (metric) {
    case "BUSINESS_IMPRESSIONS_DESKTOP_MAPS":
    case "BUSINESS_IMPRESSIONS_MOBILE_MAPS":
      month.views += val;
      break;
    case "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH":
    case "BUSINESS_IMPRESSIONS_MOBILE_SEARCH":
      month.views += val;
      month.searches += val;
      break;
    case "CALL_CLICKS":
      month.calls += val;
      break;
    case "WEBSITE_CLICKS":
      month.website += val;
      break;
    case "BUSINESS_DIRECTION_REQUESTS":
      month.directions += val;
      break;
  }
}

function buildTotals(monthly: GBPMonth[]): GBPTotals {
  const last = monthly[monthly.length - 1];
  const first = monthly[0];
  if (!last) {
    return {
      views: 0,
      viewsChange: null,
      calls: 0,
      callsChange: null,
      directions: 0,
      directionsChange: null,
      website: 0,
      websiteChange: null,
    };
  }
  const pctChange = (cur: number, prev: number) =>
    prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null;
  return {
    views: last.views,
    viewsChange: first ? pctChange(last.views, first.views) : null,
    calls: last.calls,
    callsChange: first ? pctChange(last.calls, first.calls) : null,
    directions: last.directions,
    directionsChange: first ? pctChange(last.directions, first.directions) : null,
    website: last.website,
    websiteChange: first ? pctChange(last.website, first.website) : null,
  };
}

async function fetchSearchKeywords(
  location: string,
  token: string,
  start: Date,
  end: Date,
): Promise<GBPSearchQuery[]> {
  const params = new URLSearchParams();
  params.set("monthlyRange.startMonth.year", String(start.getUTCFullYear()));
  params.set("monthlyRange.startMonth.month", String(start.getUTCMonth() + 1));
  params.set("monthlyRange.endMonth.year", String(end.getUTCFullYear()));
  params.set("monthlyRange.endMonth.month", String(end.getUTCMonth() + 1));
  const url = `https://businessprofileperformance.googleapis.com/v1/${location}/searchkeywords/impressions/monthly?${params.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`GBP search keywords request failed: ${res.status} ${await res.text()}`);
  }
  const data: SearchKeywordsResponse = await res.json();
  const agg = new Map<string, number>();
  for (const item of data.searchKeywordsCounts ?? []) {
    const q = item.searchKeyword ?? "";
    if (!q) continue;
    const raw = item.insightsValue?.value ?? item.insightsValue?.threshold ?? "0";
    agg.set(q, (agg.get(q) ?? 0) + parseInt(raw, 10));
  }
  return Array.from(agg.entries())
    .map(([query, impressions]) => ({ query, impressions }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);
}

async function fetchReviews(): Promise<GBPReviews> {
  // Reviews via GBP/Places API requires additional setup (Places API key or v4 API access).
  // For now, source from env vars so the dashboard can display a manually maintained snapshot.
  const avg = process.env.GBP_REVIEWS_AVERAGE;
  const total = process.env.GBP_REVIEWS_TOTAL;
  const newQ = process.env.GBP_REVIEWS_NEW_THIS_QUARTER;
  return {
    averageRating: avg ? parseFloat(avg) : null,
    totalCount: total ? parseInt(total, 10) : null,
    newThisQuarter: newQ ? parseInt(newQ, 10) : null,
  };
}
