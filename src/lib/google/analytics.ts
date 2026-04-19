import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { MissingCredentialsError, getServiceAccountCredentials } from "./auth";
import { monthLabel } from "./dates";
import { friendlyPageName } from "./pageNames";

export interface GATrafficMonth {
  month: string;
  organic: number;
  direct: number;
  referral: number;
  other: number;
  sessions: number;
}

export interface GADevice {
  name: string;
  value: number;
}

export interface GATopPage {
  title: string;
  pagePath: string;
  sessions: number;
  avgTime: string;
  bounceRate: number;
}

export interface GAOverview {
  sessions: number;
  sessionsChange: number | null;
  users: number;
  newUsers: number;
  bounceRate: number;
  avgDuration: number;
}

export interface AnalyticsData {
  traffic: { months: GATrafficMonth[]; totals: { sessions: number; change: number | null } };
  devices: GADevice[];
  topPages: GATopPage[];
  overview: GAOverview;
}

function getClient(): BetaAnalyticsDataClient {
  const creds = getServiceAccountCredentials();
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key,
    },
  });
}

function requireProperty(): string {
  const property = process.env.GA4_PROPERTY_ID;
  if (!property) {
    throw new MissingCredentialsError(["GA4_PROPERTY_ID"]);
  }
  return property.startsWith("properties/") ? property : `properties/${property}`;
}

const CHANNEL_BUCKETS: Record<string, "organic" | "direct" | "referral" | "other"> = {
  "Organic Search": "organic",
  Direct: "direct",
  Referral: "referral",
};

function bucketChannel(channel: string): "organic" | "direct" | "referral" | "other" {
  return CHANNEL_BUCKETS[channel] ?? "other";
}

function secondsToClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const client = getClient();
  const property = requireProperty();

  const [trafficResp, deviceResp, blogResp, overviewResp] = await Promise.all([
    client.runReport({
      property,
      dateRanges: [{ startDate: "210daysAgo", endDate: "today" }],
      dimensions: [{ name: "yearMonth" }, { name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "yearMonth" } }],
    }),
    client.runReport({
      property,
      dateRanges: [{ startDate: "210daysAgo", endDate: "today" }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
    }),
    client.runReport({
      property,
      dateRanges: [{ startDate: "210daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [
        { name: "sessions" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 50,
    }),
    client.runReport({
      property,
      dateRanges: [
        { startDate: "210daysAgo", endDate: "today", name: "current" },
        { startDate: "420daysAgo", endDate: "211daysAgo", name: "previous" },
      ],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    }),
  ]);

  // Traffic: group by month, split channels
  const trafficByMonth = new Map<string, GATrafficMonth>();
  for (const row of trafficResp[0].rows ?? []) {
    const yearMonth = row.dimensionValues?.[0]?.value ?? "";
    const channel = row.dimensionValues?.[1]?.value ?? "";
    const sessions = Number(row.metricValues?.[0]?.value ?? 0);
    const bucket = bucketChannel(channel);
    const key = yearMonth;
    const existing = trafficByMonth.get(key) ?? {
      month: monthLabel(yearMonth),
      organic: 0,
      direct: 0,
      referral: 0,
      other: 0,
      sessions: 0,
    };
    existing[bucket] += sessions;
    existing.sessions += sessions;
    trafficByMonth.set(key, existing);
  }
  const months = Array.from(trafficByMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  // Devices as percentages
  const deviceRows = deviceResp[0].rows ?? [];
  const deviceTotals = deviceRows.map((r) => ({
    name: (r.dimensionValues?.[0]?.value ?? "other").replace(/^\w/, (c) => c.toUpperCase()),
    sessions: Number(r.metricValues?.[0]?.value ?? 0),
  }));
  const deviceSum = deviceTotals.reduce((s, d) => s + d.sessions, 0) || 1;
  const devices: GADevice[] = deviceTotals
    .map((d) => ({ name: d.name, value: Math.round((d.sessions / deviceSum) * 100) }))
    .sort((a, b) => b.value - a.value);

  // Top pages — caller decides how to slice (blog vs page) using isBlogPath
  const topPages: GATopPage[] = (blogResp[0].rows ?? []).map((r) => {
    const pagePath = r.dimensionValues?.[0]?.value ?? "";
    const pageTitle = r.dimensionValues?.[1]?.value ?? "";
    const sessions = Number(r.metricValues?.[0]?.value ?? 0);
    const avgDuration = Number(r.metricValues?.[1]?.value ?? 0);
    const bounceRate = Number(r.metricValues?.[2]?.value ?? 0);
    return {
      title: pageTitle || friendlyPageName(pagePath),
      pagePath,
      sessions,
      avgTime: secondsToClock(avgDuration),
      bounceRate: Math.round(bounceRate * 1000) / 10,
    };
  });

  // Overview: current + prior period
  const rows = overviewResp[0].rows ?? [];
  const current = rows.find((r) => r.dimensionValues?.[0]?.value === "current");
  const previous = rows.find((r) => r.dimensionValues?.[0]?.value === "previous");
  const cur = {
    sessions: Number(current?.metricValues?.[0]?.value ?? 0),
    users: Number(current?.metricValues?.[1]?.value ?? 0),
    newUsers: Number(current?.metricValues?.[2]?.value ?? 0),
    bounceRate: Number(current?.metricValues?.[3]?.value ?? 0),
    avgDuration: Number(current?.metricValues?.[4]?.value ?? 0),
  };
  const prev = {
    sessions: Number(previous?.metricValues?.[0]?.value ?? 0),
  };
  const sessionsChange = prev.sessions
    ? Math.round(((cur.sessions - prev.sessions) / prev.sessions) * 100)
    : null;

  const overview: GAOverview = {
    sessions: cur.sessions,
    sessionsChange,
    users: cur.users,
    newUsers: cur.newUsers,
    bounceRate: Math.round(cur.bounceRate * 1000) / 10,
    avgDuration: Math.round(cur.avgDuration),
  };

  return {
    traffic: { months, totals: { sessions: cur.sessions, change: sessionsChange } },
    devices,
    topPages,
    overview,
  };
}
