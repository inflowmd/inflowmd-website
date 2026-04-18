import { google } from "googleapis";
import { getGoogleAuth } from "./auth";
import { currentPeriod, previousPeriod, monthsBack, monthLabel, monthKeyFromDate } from "./dates";
import { friendlyPageName } from "./pageNames";

const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

export interface GSCKeyword {
  keyword: string;
  position: number;
  previousPosition: number | null;
  change: number;
  clicks: number;
  impressions: number;
  ctr: number;
  page: string;
  pageUrl: string;
}

export interface GSCMonth {
  month: string;
  clicks: number;
  impressions: number;
}

export interface GSCTopPage {
  page: string;
  pageUrl: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCTotals {
  clicks: number;
  impressions: number;
  avgCtr: number;
  avgPosition: number;
}

export interface SearchConsoleData {
  keywords: GSCKeyword[];
  trend: { months: GSCMonth[] };
  topPages: GSCTopPage[];
  totals: GSCTotals;
  previousTotals: GSCTotals;
  period: { current: { startDate: string; endDate: string }; previous: { startDate: string; endDate: string } };
}

function requireSiteUrl(): string {
  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) {
    throw new Error("GSC_SITE_URL is not set");
  }
  return siteUrl;
}

export async function fetchSearchConsoleData(): Promise<SearchConsoleData> {
  const auth = getGoogleAuth(SCOPES);
  const searchconsole = google.searchconsole({ version: "v1", auth });
  const siteUrl = requireSiteUrl();

  const current = currentPeriod(28);
  const previous = previousPeriod(28);
  const trend = monthsBack(7);

  const [keywordsCurrent, keywordsPrevious, trendRaw, topPagesRaw] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: current.startDate,
        endDate: current.endDate,
        dimensions: ["query", "page"],
        rowLimit: 50,
        dataState: "all",
      },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: previous.startDate,
        endDate: previous.endDate,
        dimensions: ["query", "page"],
        rowLimit: 100,
        dataState: "all",
      },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: trend.startDate,
        endDate: trend.endDate,
        dimensions: ["date"],
        dataState: "all",
        rowLimit: 1000,
      },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: current.startDate,
        endDate: current.endDate,
        dimensions: ["page"],
        rowLimit: 20,
        dataState: "all",
      },
    }),
  ]);

  // Build previous-position lookup
  const prevLookup = new Map<string, number>();
  for (const row of keywordsPrevious.data.rows ?? []) {
    const [q, p] = row.keys ?? [];
    if (!q || !p) continue;
    prevLookup.set(`${q}||${p}`, row.position ?? 0);
  }

  const keywords: GSCKeyword[] = (keywordsCurrent.data.rows ?? []).map((row) => {
    const [query, page] = row.keys ?? ["", ""];
    const prev = prevLookup.get(`${query}||${page}`) ?? null;
    const pos = Math.round((row.position ?? 0) * 10) / 10;
    const prevPos = prev !== null ? Math.round(prev * 10) / 10 : null;
    const change = prev !== null ? Math.round((prev - (row.position ?? 0)) * 10) / 10 : 0;
    return {
      keyword: query,
      position: pos,
      previousPosition: prevPos,
      change,
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: Math.round((row.ctr ?? 0) * 1000) / 10, // percentage with one decimal
      page: friendlyPageName(page),
      pageUrl: page,
    };
  });

  // Group trend by month
  const monthAgg = new Map<string, { clicks: number; impressions: number }>();
  for (const row of trendRaw.data.rows ?? []) {
    const date = row.keys?.[0];
    if (!date) continue;
    const key = monthKeyFromDate(date);
    const existing = monthAgg.get(key) ?? { clicks: 0, impressions: 0 };
    existing.clicks += row.clicks ?? 0;
    existing.impressions += row.impressions ?? 0;
    monthAgg.set(key, existing);
  }
  const months: GSCMonth[] = Array.from(monthAgg.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, vals]) => ({ month: monthLabel(key), ...vals }));

  const topPages: GSCTopPage[] = (topPagesRaw.data.rows ?? []).map((row) => {
    const pageUrl = row.keys?.[0] ?? "";
    return {
      page: friendlyPageName(pageUrl),
      pageUrl,
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: Math.round((row.ctr ?? 0) * 1000) / 10,
      position: Math.round((row.position ?? 0) * 10) / 10,
    };
  });

  const totals = aggregateTotals(keywordsCurrent.data.rows ?? []);
  const previousTotals = aggregateTotals(keywordsPrevious.data.rows ?? []);

  return {
    keywords,
    trend: { months },
    topPages,
    totals,
    previousTotals,
    period: { current, previous },
  };
}

function aggregateTotals(
  rows: { clicks?: number | null; impressions?: number | null; ctr?: number | null; position?: number | null }[],
): GSCTotals {
  let clicks = 0;
  let impressions = 0;
  let posSum = 0;
  let posCount = 0;
  for (const row of rows) {
    clicks += row.clicks ?? 0;
    impressions += row.impressions ?? 0;
    if (row.position) {
      posSum += row.position;
      posCount += 1;
    }
  }
  const avgCtr = impressions ? Math.round((clicks / impressions) * 1000) / 10 : 0;
  const avgPosition = posCount ? Math.round((posSum / posCount) * 10) / 10 : 0;
  return { clicks, impressions, avgCtr, avgPosition };
}
