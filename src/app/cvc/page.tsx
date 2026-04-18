import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import Dashboard, { type DashboardProps } from "@/components/cvc/Dashboard";
import { logoutAction } from "./actions";
import { isAuthenticated } from "@/lib/cvc/session";
import { fetchSearchConsoleData, type SearchConsoleData } from "@/lib/google/searchConsole";
import { fetchAnalyticsData, type AnalyticsData } from "@/lib/google/analytics";
import { fetchGbpData, type GBPData } from "@/lib/google/gbp";

export const metadata: Metadata = {
  title: "CVC Dashboard",
  description: "SEO performance dashboard for Comprehensive Vein Care",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const CACHE_TTL = 60 * 60 * 6; // 6 hours

const getCachedSearchConsole = unstable_cache(fetchSearchConsoleData, ["cvc", "search-console"], {
  revalidate: CACHE_TTL,
  tags: ["cvc-search-console"],
});
const getCachedAnalytics = unstable_cache(fetchAnalyticsData, ["cvc", "analytics"], {
  revalidate: CACHE_TTL,
  tags: ["cvc-analytics"],
});
const getCachedGbp = unstable_cache(fetchGbpData, ["cvc", "gbp"], {
  revalidate: CACHE_TTL,
  tags: ["cvc-gbp"],
});

export default async function CVCPage() {
  if (!(await isAuthenticated())) {
    return <LoginForm />;
  }

  const [gsc, ga, gbp, errors] = await loadData();

  if (errors.length > 0 && !gsc && !ga && !gbp) {
    return <SetupError messages={errors} />;
  }

  const props = assembleDashboardProps(gsc, ga, gbp);

  return (
    <div className="relative">
      <form action={logoutAction} className="absolute top-4 right-4 z-10">
        <button
          type="submit"
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Sign out
        </button>
      </form>
      <Dashboard {...props} />
      {errors.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-900">Partial data warning</p>
            <ul className="mt-2 text-xs text-yellow-800 list-disc list-inside space-y-1">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

async function loadData(): Promise<
  [SearchConsoleData | null, AnalyticsData | null, GBPData | null, string[]]
> {
  const errors: string[] = [];
  const results = await Promise.allSettled([
    getCachedSearchConsole(),
    getCachedAnalytics(),
    getCachedGbp(),
  ]);
  const [gscR, gaR, gbpR] = results;
  const gsc = gscR.status === "fulfilled" ? gscR.value : null;
  if (gscR.status === "rejected") errors.push(`Search Console: ${errorMessage(gscR.reason)}`);
  const ga = gaR.status === "fulfilled" ? gaR.value : null;
  if (gaR.status === "rejected") errors.push(`Analytics: ${errorMessage(gaR.reason)}`);
  const gbp = gbpR.status === "fulfilled" ? gbpR.value : null;
  if (gbpR.status === "rejected") errors.push(`Google Business: ${errorMessage(gbpR.reason)}`);
  return [gsc, ga, gbp, errors];
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function assembleDashboardProps(
  gsc: SearchConsoleData | null,
  ga: AnalyticsData | null,
  gbp: GBPData | null,
): DashboardProps {
  const traffic = ga?.traffic.months ?? [];
  const organicSessions = traffic.reduce((s, m) => s + m.organic, 0);

  const keywords = (gsc?.keywords ?? []).map((k) => ({
    keyword: k.keyword,
    position: k.position,
    change: k.change,
    impressions: k.impressions,
    clicks: k.clicks,
    page: k.page,
  }));

  // Merge GA blog posts with GSC page-level impressions for CTR calculation
  const gscByPath = new Map<string, { impressions: number; clicks: number }>();
  for (const p of gsc?.topPages ?? []) {
    try {
      const path = new URL(p.pageUrl).pathname;
      gscByPath.set(path, { impressions: p.impressions, clicks: p.clicks });
    } catch {
      gscByPath.set(p.pageUrl, { impressions: p.impressions, clicks: p.clicks });
    }
  }
  const blogPosts = (ga?.blogPosts ?? []).map((p) => {
    const gscInfo = gscByPath.get(p.pagePath) ?? { impressions: 0, clicks: 0 };
    const ctr = gscInfo.impressions > 0 ? Math.round((gscInfo.clicks / gscInfo.impressions) * 1000) / 10 : 0;
    return {
      title: p.title,
      pagePath: p.pagePath,
      sessions: p.sessions,
      avgTime: p.avgTime,
      impressions: gscInfo.impressions,
      ctr,
    };
  });

  const overview = ga?.overview ?? {
    sessions: 0,
    sessionsChange: null,
    users: 0,
    newUsers: 0,
    bounceRate: 0,
    avgDuration: 0,
  };

  const gscTotals = gsc?.totals ?? {
    clicks: 0,
    impressions: 0,
    avgCtr: 0,
    avgPosition: 0,
  };

  const gbpData = gbp ?? {
    monthly: [],
    searchQueries: [],
    reviews: { averageRating: null, totalCount: null, newThisQuarter: null },
    totals: {
      views: 0,
      viewsChange: null,
      calls: 0,
      callsChange: null,
      directions: 0,
      directionsChange: null,
      website: 0,
      websiteChange: null,
    },
  };

  const periodLabel = describePeriod(traffic.map((m) => m.month));

  const blogPostsLive = countPathsStartingWith(gsc?.topPages ?? [], "/blog/");

  return {
    overview,
    gscTotals,
    organicSessions,
    organicSessionsChange: null,
    traffic,
    devices: ga?.devices ?? [],
    keywords,
    blogPosts,
    gbp: gbpData,
    siteHealth: {
      pageSpeedMobile: null,
      sslActive: true,
      indexedPages: gsc?.topPages.length ?? null,
      blogPostsLive,
    },
    lastUpdated: new Date().toISOString(),
    periodLabel,
  };
}

function describePeriod(monthLabels: string[]): string {
  if (monthLabels.length === 0) return "Last 7 months";
  if (monthLabels.length === 1) return monthLabels[0];
  return `${monthLabels[0]} — ${monthLabels[monthLabels.length - 1]}`;
}

function countPathsStartingWith(pages: { pageUrl: string }[], prefix: string): number {
  const paths = new Set<string>();
  for (const p of pages) {
    try {
      const path = new URL(p.pageUrl).pathname;
      if (path.startsWith(prefix)) paths.add(path);
    } catch {
      if (p.pageUrl.startsWith(prefix)) paths.add(p.pageUrl);
    }
  }
  return paths.size;
}

function SetupError({ messages }: { messages: string[] }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-xl font-bold text-gray-900">Dashboard setup required</h1>
        <p className="text-sm text-gray-600 mt-2">
          The dashboard is wired up, but it can&apos;t reach the Google APIs yet. Complete the one-time setup:
        </p>
        <ol className="list-decimal list-inside text-sm text-gray-700 mt-4 space-y-1">
          <li>Create a Google Cloud service account and download the JSON key.</li>
          <li>
            Enable the <em>Search Console</em>, <em>Analytics Data</em>, and <em>Business Profile Performance</em>{" "}
            APIs for that project.
          </li>
          <li>
            Grant the service account access to the property (Full on Search Console, Viewer on GA4, Manager on
            GBP).
          </li>
          <li>Set the required environment variables on Vercel.</li>
        </ol>
        <div className="mt-4 text-xs bg-red-50 border border-red-200 rounded p-3 text-red-700 space-y-1">
          {messages.map((m, i) => (
            <div key={i}>{m}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
