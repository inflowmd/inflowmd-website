export type Severity = "critical" | "high" | "medium" | "low";

export type GradeCategory = {
  label: string;
  grade: string; // A, B, C, D, F, +/- allowed
  note?: string; // short subtle explanation of the grade
};

export type Finding = {
  id: string;
  title: string;
  severity: Severity;
  consequence: string; // one-sentence line shown on the collapsed card (executive layer)
  summary: string; // full clinical summary shown when expanded
  detail?: string; // extra explanation, plain prose
  evidence?: {
    quote?: string; // verbatim text from the audited site
    url?: string; // where to see it
    label?: string; // label under the URL, e.g. "Homepage" or "sitemap.xml"
    quotes?: { quote: string; url?: string; label?: string }[]; // multi-quote support
  };
  notes?: string; // trailing consequence line — bolded interpretation
};

export type ForkItem = { label: string };
export type Fork = {
  quickFixes: ForkItem[];
  quickFixesNote: string;
  foundation: ForkItem[];
  foundationNote: string;
};

export type AdditionalTeaser = {
  severity: Severity;
  title: string; // finding name only — no evidence text ships in the DOM
};

export type SerpEntry = {
  rank: number;
  name: string;
  rating: string;
  reviews: number;
  category: string;
  status: string;
  isSubject?: boolean; // highlights the audited practice's row
};

export type MarketFact = {
  id: string;
  title: string;
  fact: string;
  cost: string;
};

export type MarketPosition = {
  eyebrow: string;
  title: string;
  subline: string;
  contextLine?: string;
  serpCaption: string;
  serp: SerpEntry[];
  facts: MarketFact[];
  throughLine: string;
};

export type Outcome = {
  fix: string;
  means: string;
};

export type ShowdownGauge = { label: string; theirs: number; ours: number };
export type ShowdownRow = { label: string; theirs: string; ours: string };

export type Showdown = {
  theirName: string; // e.g. "vein-ity.com"
  theirCaption: string; // "Your site today"
  ourName: string; // "inflowmd.com"
  ourCaption: string; // "An InflowMD build — our own site"
  gauges: ShowdownGauge[]; // PSI-style score rings
  metrics: ShowdownRow[]; // FCP / Speed Index rows
  rows: ShowdownRow[]; // ✗ vs ✓ build-quality rows
  note: string; // measurement methodology + dates
  payoffStat: string; // the bold headline stat, e.g. "Every second of load time is a 7% drop in conversions."
  payoffLine: string; // the plain-language "so what" that ties speed → patients
  payoffSource: string; // attribution for the stat
  liveExample?: { url: string; name: string; blurb: string }; // a real live site we built
};

export type WhatWorksItem = {
  title: string;
  detail: string;
};

export type PerformanceRow = {
  page: string;
  form: "mobile" | "desktop";
  performance: number;
  fcp?: string; // First Contentful Paint
  si?: string; // Speed Index
  imageWeight?: string;
  renderBlocking?: string;
};

export type BenchmarkStat = {
  stat: string; // e.g. "100ms → 7% drop"
  detail: string;
  source: string;
};

export type ComparisonRow = {
  metric: string;
  theirs: string;
  ours: string;
  win?: "ours" | "theirs" | "tie";
};

export type ContentErrorRow = {
  quote: string; // verbatim from the site
  where: string; // page + section
};

export type HeroKpi = {
  value: string; // e.g. "D+", "52/100", "0", "17", "Page 2+"
  label: string;
  note: string;
  tone?: "critical" | "warn" | "muted";
};

export type AuditData = {
  slug: string;
  practice: {
    name: string;
    domain: string;
    ownerName: string;
    ownerTitle: string;
    location: string;
  };
  auditDate: string; // human-friendly, e.g. "July 7, 2026"
  overallGrade: string; // "D+", "C-", etc.
  headline: string; // one-line summary under the grade
  categories: GradeCategory[];
  whatWorks: {
    items: WhatWorksItem[];
    honestCaveat: string;
  };
  findings: Finding[];
  performance: {
    rows: PerformanceRow[];
    translation: string; // "practice terms" line
    benchmarks: BenchmarkStat[];
  };
  rootCause: string; // one paragraph
  standard: {
    intro: string;
    points: string[];
    proofPoints?: { label: string; value: string }[];
  };
  heroKpis: HeroKpi[];
  heroMessagingLine: string; // additional messaging line under the hero sub-line
  contentErrorRows: ContentErrorRow[];
  execFive: string[]; // ordered list of finding IDs to render as the top-5 executive layer
  fork: Fork;
  additionalCount: number; // e.g. 32 — count shown on the gated locked block
  additionalTeasers: AdditionalTeaser[]; // finding NAMES only for the locked-block skeleton rows
  summaryRow: { theirs: string; ours: string }; // extra row appended to the comparison table
  market: MarketPosition; // "Where you stand" competitive section
  outcomes: Outcome[]; // "What changes when the foundation is rebuilt"
  guaranteeLine: string; // calibration sentence closing the outcomes section
  showdown?: Showdown; // PSI-style side-by-side near the top of the page
  comparison: ComparisonRow[];
  cta: {
    fullReportMailto: string;
    walkthroughUrl: string;
  };
  methodologyNote: string;
};
