"use client";

import { useState, type ComponentType } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Search,
  MapPin,
  Eye,
  Phone,
  MousePointer,
  FileText,
  Globe,
  Shield,
  Zap,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

export interface DashboardProps {
  overview: {
    sessions: number;
    sessionsChange: number | null;
    users: number;
    bounceRate: number;
    avgDuration: number;
  };
  gscTotals: {
    clicks: number;
    impressions: number;
    avgCtr: number;
    avgPosition: number;
  };
  organicSessions: number;
  organicSessionsChange: number | null;
  traffic: Array<{
    month: string;
    organic: number;
    direct: number;
    referral: number;
    other: number;
    sessions: number;
  }>;
  devices: Array<{ name: string; value: number }>;
  keywords: Array<{
    keyword: string;
    position: number;
    change: number;
    impressions: number;
    clicks: number;
    page: string;
  }>;
  blogPosts: Array<{
    title: string;
    pagePath: string;
    sessions: number;
    avgTime: string;
    impressions: number;
    ctr: number;
  }>;
  gbp: {
    monthly: Array<{
      month: string;
      views: number;
      searches: number;
      calls: number;
      directions: number;
      website: number;
    }>;
    searchQueries: Array<{ query: string; impressions: number }>;
    reviews: {
      averageRating: number | null;
      totalCount: number | null;
      newThisQuarter: number | null;
    };
    totals: {
      views: number;
      viewsChange: number | null;
      calls: number;
      callsChange: number | null;
      directions: number;
      directionsChange: number | null;
      website: number;
      websiteChange: number | null;
    };
  };
  siteHealth: {
    pageSpeedMobile: string | null;
    sslActive: boolean;
    indexedPages: number | null;
    blogPostsLive: number;
  };
  lastUpdated: string;
  periodLabel: string;
}

const COLORS = ["#006284", "#23bcba", "#0a7a9a"];
const CHART_BLUE = "#006284";
const CHART_TEAL = "#23bcba";
const CHART_MID = "#0a7a9a";

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type IconType = ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
}: {
  icon: IconType;
  label: string;
  value: string;
  change?: number | null;
  changeLabel?: string;
}) {
  const hasChange = change !== undefined && change !== null;
  const positive = hasChange ? (change as number) > 0 : false;
  const zero = hasChange ? (change as number) === 0 : false;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: "#e8f4f8" }}>
          <Icon size={18} style={{ color: CHART_BLUE }} />
        </div>
        {hasChange && (
          <div
            className={`flex items-center text-sm font-semibold ${
              positive ? "text-emerald-600" : zero ? "text-gray-400" : "text-red-500"
            }`}
          >
            {positive ? (
              <ArrowUpRight size={14} />
            ) : zero ? (
              <Minus size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            <span className="ml-0.5">{Math.abs(change as number)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
      {changeLabel && <div className="text-xs text-gray-400 mt-0.5">{changeLabel}</div>}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const bg =
    rank <= 3
      ? "bg-emerald-100 text-emerald-700"
      : rank <= 10
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${bg}`}>
      {rank}
    </span>
  );
}

function PositionChange({ change }: { change: number }) {
  if (change === 0)
    return (
      <span className="text-gray-400 text-sm flex items-center justify-center">
        <Minus size={12} className="mr-1" />—
      </span>
    );
  const positive = change > 0;
  return (
    <span
      className={`text-sm flex items-center justify-center font-medium ${
        positive ? "text-emerald-600" : "text-red-500"
      }`}
    >
      {positive ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
      {positive ? "+" : ""}
      {change}
    </span>
  );
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "keywords", label: "Keyword Rankings" },
  { id: "content", label: "Blog Performance" },
  { id: "local", label: "Local SEO" },
  { id: "gbp", label: "Google Business" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Dashboard(props: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const {
    overview,
    gscTotals,
    organicSessions,
    organicSessionsChange,
    traffic,
    devices,
    keywords,
    blogPosts,
    gbp,
    siteHealth,
    lastUpdated,
    periodLabel,
  } = props;

  const topKeywords = [...keywords].sort((a, b) => a.position - b.position).slice(0, 5);
  const topThree = keywords.filter((k) => k.position <= 3).length;
  const topTen = keywords.filter((k) => k.position <= 10).length;
  const blogSessions = blogPosts.reduce((s, p) => s + p.sessions, 0);
  const blogImpressions = blogPosts.reduce((s, p) => s + p.impressions, 0);
  const blogAvgCtr =
    blogImpressions > 0
      ? Math.round(
          (blogPosts.reduce((s, p) => s + (p.ctr * p.impressions) / 100, 0) / blogImpressions) * 1000,
        ) / 10
      : 0;

  const latestGbpMonth = gbp.monthly[gbp.monthly.length - 1];
  const maxQueryImpressions = gbp.searchQueries[0]?.impressions ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comprehensive Vein Care</h1>
              <p className="text-sm text-gray-500 mt-1">
                SEO Performance Dashboard — Dr. Subhajit Datta | Marion, OH
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">Report Period</div>
              <div className="text-sm text-gray-500">{periodLabel}</div>
              <div className="text-xs text-gray-400 mt-1">Last updated {formatTimestamp(lastUpdated)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#006284] text-[#006284]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Sessions"
                value={formatNumber(overview.sessions)}
                change={overview.sessionsChange}
                changeLabel="vs. prior period"
              />
              <StatCard
                icon={Search}
                label="Organic Sessions"
                value={formatNumber(organicSessions)}
                change={organicSessionsChange}
                changeLabel="Google Analytics"
              />
              <StatCard
                icon={Eye}
                label="Search Impressions"
                value={formatNumber(gscTotals.impressions)}
                changeLabel="Google Search Console (28d)"
              />
              <StatCard
                icon={MousePointer}
                label="Avg. CTR"
                value={`${gscTotals.avgCtr}%`}
                changeLabel={`Avg. position ${gscTotals.avgPosition}`}
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Organic Traffic Growth</h2>
              <p className="text-sm text-gray-500 mb-4">Monthly sessions by traffic source</p>
              {traffic.length === 0 ? (
                <EmptyChart message="No traffic data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={traffic}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="organic"
                      stackId="1"
                      stroke={CHART_BLUE}
                      fill={CHART_BLUE}
                      fillOpacity={0.6}
                      name="Organic"
                    />
                    <Area
                      type="monotone"
                      dataKey="direct"
                      stackId="1"
                      stroke={CHART_TEAL}
                      fill={CHART_TEAL}
                      fillOpacity={0.5}
                      name="Direct"
                    />
                    <Area
                      type="monotone"
                      dataKey="referral"
                      stackId="1"
                      stroke={CHART_MID}
                      fill={CHART_MID}
                      fillOpacity={0.4}
                      name="Referral"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Device Breakdown</h2>
                <p className="text-sm text-gray-500 mb-4">Where patients are browsing from</p>
                {devices.length === 0 ? (
                  <EmptyChart message="No device data yet" />
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={devices}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {devices.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => `${v}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center space-x-6 mt-2 flex-wrap">
                      {devices.map((d, i) => (
                        <div key={d.name} className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-sm text-gray-600">
                            {d.name} ({d.value}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Top Ranking Keywords</h2>
                <p className="text-sm text-gray-500 mb-4">Current Google position</p>
                {topKeywords.length === 0 ? (
                  <EmptyState message="No keyword data yet" />
                ) : (
                  <div className="space-y-3">
                    {topKeywords.map((kw) => (
                      <div key={kw.keyword} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                          <RankBadge rank={Math.round(kw.position)} />
                          <span className="text-sm text-gray-700 truncate">{kw.keyword}</span>
                        </div>
                        <PositionChange change={kw.change} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Health Snapshot</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <HealthCard
                  icon={Zap}
                  label="Page Speed (Mobile)"
                  value={siteHealth.pageSpeedMobile ?? "—"}
                  color="text-yellow-600"
                  bg="bg-yellow-50"
                />
                <HealthCard
                  icon={Shield}
                  label="Security (SSL)"
                  value={siteHealth.sslActive ? "Active" : "Inactive"}
                  color={siteHealth.sslActive ? "text-emerald-600" : "text-red-600"}
                  bg={siteHealth.sslActive ? "bg-emerald-50" : "bg-red-50"}
                />
                <HealthCard
                  icon={Globe}
                  label="Indexed Pages"
                  value={siteHealth.indexedPages !== null ? String(siteHealth.indexedPages) : "—"}
                  color="text-blue-600"
                  bg="bg-blue-50"
                />
                <HealthCard
                  icon={FileText}
                  label="Blog Posts Live"
                  value={String(siteHealth.blogPostsLive)}
                  color="text-purple-600"
                  bg="bg-purple-50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "keywords" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Search} label="Tracked Keywords" value={String(keywords.length)} />
              <StatCard icon={TrendingUp} label="In Top 3" value={String(topThree)} />
              <StatCard icon={Eye} label="In Top 10" value={String(topTen)} />
              <StatCard
                icon={TrendingUp}
                label="Avg. Position"
                value={String(gscTotals.avgPosition)}
                changeLabel="Lower is better"
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Keyword Rankings</h2>
                <p className="text-sm text-gray-500">
                  Current 28-day Google positions and movement vs. prior 28-day period
                </p>
              </div>
              {keywords.length === 0 ? (
                <EmptyState message="No keyword data yet. Check back after Search Console begins collecting queries." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Keyword
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          Position
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          Change
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          Impressions
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          Clicks
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Landing Page
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {keywords.map((kw) => (
                        <tr key={`${kw.keyword}-${kw.page}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{kw.keyword}</td>
                          <td className="px-6 py-4 text-center">
                            <RankBadge rank={Math.round(kw.position)} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <PositionChange change={kw.change} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-center">
                            {kw.impressions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-center">{kw.clicks}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{kw.page}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={FileText} label="Blog Pages With Traffic" value={String(blogPosts.length)} />
              <StatCard icon={Users} label="Blog Sessions" value={formatNumber(blogSessions)} />
              <StatCard icon={Eye} label="Blog Impressions" value={formatNumber(blogImpressions)} />
              <StatCard icon={MousePointer} label="Avg. CTR" value={`${blogAvgCtr}%`} />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Blog Traffic by Post</h2>
              <p className="text-sm text-gray-500 mb-4">Sessions driven by each published blog post</p>
              {blogPosts.length === 0 ? (
                <EmptyChart message="No blog traffic yet" />
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(250, blogPosts.length * 40)}>
                  <BarChart data={blogPosts.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="title" tick={{ fontSize: 11 }} width={220} />
                    <Tooltip />
                    <Bar dataKey="sessions" fill={CHART_BLUE} radius={[0, 4, 4, 0]} name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Post Details</h2>
              </div>
              {blogPosts.length === 0 ? (
                <EmptyState message="No blog pages in analytics yet." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Post Title
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          Sessions
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          Impressions
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          CTR
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                          Avg. Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {blogPosts.map((post) => (
                        <tr key={post.pagePath} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{post.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-center font-semibold">
                            {post.sessions}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-center">
                            {post.impressions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-center">{post.ctr}%</td>
                          <td className="px-6 py-4 text-sm text-gray-600 text-center">{post.avgTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "local" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Eye}
                label={latestGbpMonth ? `Map/Search Views (${latestGbpMonth.month})` : "Profile Views"}
                value={formatNumber(gbp.totals.views)}
                change={gbp.totals.viewsChange}
                changeLabel="vs. earliest month tracked"
              />
              <StatCard
                icon={Search}
                label={latestGbpMonth ? `Search Impressions (${latestGbpMonth.month})` : "Search Impressions"}
                value={formatNumber(latestGbpMonth?.searches ?? 0)}
              />
              <StatCard
                icon={Phone}
                label="Calls (latest month)"
                value={formatNumber(gbp.totals.calls)}
                change={gbp.totals.callsChange}
              />
              <StatCard
                icon={MapPin}
                label="Direction Requests"
                value={formatNumber(gbp.totals.directions)}
                change={gbp.totals.directionsChange}
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Local Visibility Trend</h2>
              <p className="text-sm text-gray-500 mb-4">Google Business Profile views over time</p>
              {gbp.monthly.length === 0 ? (
                <EmptyChart message="No GBP data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={gbp.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke={CHART_BLUE}
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                      name="Profile Views"
                    />
                    <Line
                      type="monotone"
                      dataKey="searches"
                      stroke={CHART_TEAL}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Search Impressions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Local Rank Tracking</h3>
              <p className="text-sm text-gray-600">
                Geo-specific map-pack rank tracking (by neighborhood) is not available from the Google APIs. A
                dedicated local rank tracker can be integrated here in a future iteration.
              </p>
            </div>
          </div>
        )}

        {activeTab === "gbp" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Eye}
                label="Profile Views (latest)"
                value={formatNumber(gbp.totals.views)}
                change={gbp.totals.viewsChange}
                changeLabel="vs. earliest month"
              />
              <StatCard
                icon={Phone}
                label="Phone Calls (latest)"
                value={formatNumber(gbp.totals.calls)}
                change={gbp.totals.callsChange}
                changeLabel="vs. earliest month"
              />
              <StatCard
                icon={MapPin}
                label="Direction Requests"
                value={formatNumber(gbp.totals.directions)}
                change={gbp.totals.directionsChange}
                changeLabel="vs. earliest month"
              />
              <StatCard
                icon={Globe}
                label="Website Clicks"
                value={formatNumber(gbp.totals.website)}
                change={gbp.totals.websiteChange}
                changeLabel="vs. earliest month"
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Patient Actions from Google Business Profile
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Monthly calls, direction requests, and website clicks
              </p>
              {gbp.monthly.length === 0 ? (
                <EmptyChart message="No GBP data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gbp.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="calls" fill={CHART_BLUE} name="Calls" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="directions" fill={CHART_TEAL} name="Directions" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="website" fill={CHART_MID} name="Website Clicks" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Search Queries Driving Profile Views</h2>
              <p className="text-sm text-gray-500 mb-4">
                Top queries patients use to find Comprehensive Vein Care on Google
              </p>
              {gbp.searchQueries.length === 0 ? (
                <EmptyState message="No search query data yet" />
              ) : (
                <div className="space-y-3">
                  {gbp.searchQueries.map((q) => {
                    const pct = maxQueryImpressions > 0 ? Math.round((q.impressions / maxQueryImpressions) * 100) : 0;
                    return (
                      <div key={q.query}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{q.query}</span>
                          <span className="text-sm text-gray-500">{q.impressions.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: CHART_BLUE }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {(gbp.reviews.averageRating !== null ||
              gbp.reviews.totalCount !== null ||
              gbp.reviews.newThisQuarter !== null) && (
              <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Review Snapshot</h2>
                <div className="flex items-center space-x-8 flex-wrap gap-y-4">
                  {gbp.reviews.averageRating !== null && (
                    <div>
                      <div className="text-3xl font-bold text-emerald-700">{gbp.reviews.averageRating}</div>
                      <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                  )}
                  {gbp.reviews.totalCount !== null && (
                    <div>
                      <div className="text-3xl font-bold text-emerald-700">{gbp.reviews.totalCount}</div>
                      <div className="text-sm text-gray-600">Total Reviews</div>
                    </div>
                  )}
                  {gbp.reviews.newThisQuarter !== null && (
                    <div>
                      <div className="text-3xl font-bold text-emerald-700">+{gbp.reviews.newThisQuarter}</div>
                      <div className="text-sm text-gray-600">New This Quarter</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Comprehensive Vein Care SEO Dashboard — Powered by InflowMD
          </p>
          <div className="text-xs text-gray-400">
            Session duration: {formatDuration(overview.avgDuration)} · Bounce rate: {overview.bounceRate}%
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: IconType;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-lg p-4`}>
      <Icon size={18} className={`${color} mb-2`} />
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-64 flex items-center justify-center border border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="p-8 text-center text-sm text-gray-500">{message}</div>;
}
