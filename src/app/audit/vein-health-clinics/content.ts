/**
 * Vein Health Clinics — audit page copy.
 *
 * EVERY FIGURE ON THIS PAGE COMES FROM research/veinhealthclinics.md
 * (Passes 1 and 2, both dated August 28, 2026). Nothing here is inferred,
 * estimated, or carried over from another practice's audit. If a fact was not
 * verified in that file it is absent from this file — that is why there is no
 * competitor comparison, no local pack, no paid-media section, no review
 * counts, and no directory scan percentages.
 *
 * TONE. No blame — not of the practice, not of whoever maintains the site,
 * who may well read this. The failure is architectural and generational: a
 * presence assembled in layers over years, by different hands, with nothing
 * forcing the layers to agree. The strengths are real and are named first.
 *
 * SPEED. Reported in words. Two passes on August 28 returned 57 and 56; the
 * page says "mid-to-high fifties" and never presents one figure as fixed.
 * No before/after, no comparison, and the August 18 cached score is not
 * referenced anywhere.
 */

export type Tone = "critical" | "warn" | "positive";

export type Stat = { value: string; label: string; tone: Tone };

export type FindingBlock = {
  id: string;
  tone: Tone;
  tag?: string;
  title: string;
  subhead?: string;
  body: string[];
  meaning?: string;
  table?: TableBlock;
};

export type TableBlock = {
  caption?: string;
  columns: string[];
  rows: { cells: string[]; highlight?: boolean }[];
};

export const practice = {
  name: "Vein Health Clinics",
  owner: "Dr. Obinna Nwobi",
  domain: "veinhealthclinics.com",
  location: "Central Florida",
  auditDate: "August 28, 2026",
};

export const meta = {
  /** Absolute — the root layout would otherwise append "| InflowMD" and put
      our name on his document and on the PDF he saves from it. */
  title: "Vein Health Clinics — Practice Audit",
  eyebrow: "Practice Audit · Prepared for Dr. Obinna Nwobi",
  h1: "Vein Health Clinics",
  lede: "A complete look at your website and at the web presence around it — what a patient encounters on the way to you, what is already built correctly, and where the layers have stopped agreeing with each other.",
  metaRow: [
    { label: "Prepared by", value: "Clayton Peterson, InflowMD" },
    { label: "Date", value: "August 28, 2026" },
    { label: "Market", value: "Central Florida · five offices" },
    { label: "Scope", value: "Site, federal records, directories, profiles, domains" },
  ],
  verifiedLine:
    "Every figure on this page was verified by hand on August 28, 2026 — against your own live site, the federal NPPES registry at npiregistry.cms.hhs.gov, and the directory profiles named in each section.",
};

export const nav = [
  { id: "verdict", label: "Verdict" },
  { id: "website", label: "Website" },
  { id: "presence", label: "Web Presence" },
  { id: "plan", label: "The Build & Plan" },
  { id: "investment", label: "Investment" },
];

/* ============================================================
   THE SHORT VERSION
   ============================================================ */

export const summary = {
  eyebrow: "The short version",
  verdictLine:
    "Patients can find you. **What they cannot do is book.**",
  scores: [
    { value: "86", label: "AI readiness" },
    { value: "89", label: "Search readiness" },
    { value: "50s", label: "Speed" },
  ],
  scoresNote:
    "Measured August 28, 2026. Speed sits in the mid-to-high fifties across two passes.",
  findings: [
    "The booking forms do not render. Across 23 controlled page loads — cold and warm cache, desktop and mobile — no usable form appeared.",
    "Your website and the federal record disagree about where the practice is: two federal locations are missing from the site, three offices on the site have no federal record, and Oviedo has two different addresses.",
    "Two separate live websites carry the practice's identity, sharing your physician and your phone numbers.",
  ],
  recommendation: {
    label: "Recommended",
    tier: "Growth",
    price: "$1,200",
    per: "/ month",
    note: "Summit rate, 20% off, locked twelve months.",
  },
  readMore: "Read the evidence",
};

export const criticalStrip = {
  title: "The three that cost you patients this week",
  lines: [
    "A patient who wants a screening and does not happen to land on /online-scheduler/ has no working way to ask for one.",
    "Five of your seven booking buttons point at a page anchor that does not exist, so clicking them does nothing at all.",
    "Federal records send patients to two addresses your website never mentions, and directories re-read those records on a cycle.",
  ],
};

/* ============================================================
   VERDICT
   ============================================================ */

export const verdict = {
  title: "The verdict",
  paragraphs: [
    "You are not losing patients because anyone did bad work. You are losing them because of **when** this presence was built, and how many hands built it, rather than **who** built it.",
    "A page-builder site is a stack of decisions made at different times by different people, and nothing in the platform forces those decisions to agree with each other. Add a landing page and nothing links to it. Open an office and the federal record keeps the old one. Launch a second site for a campaign and it never gets retired. Over several years a practice's presence quietly becomes several presences wearing one name — and here that is not a metaphor. **There are two live websites, a funnel subdomain, five published offices, and a federal record that agrees with exactly one of them.**",
  ],
  pullquote:
    "One practice, appearing to the internet as several. Every finding in this document is a version of that one sentence.",
  closing:
    "And underneath it, the fundamentals are in better shape than the surface suggests. **All five of your federal organization records carry the correct, specific vascular-surgery taxonomy** — not the generic surgery code most practices are filed under — with Dr. Nwobi as authorized official on every one. Structured data is present on **all 57 pages with zero parse errors**. There are **no orphan pages**. Pinch-zoom is not disabled, which matters more than it sounds for a patient in their sixties. And there is a **real, working scheduler** at /online-scheduler/. Somebody did careful work here. What is missing is a single source of truth that every one of those surfaces reads from.",
  stats: [
    { value: "0", label: "usable booking forms across 23 controlled page loads", tone: "critical" },
    { value: "5 of 7", label: "booking buttons pointing at an anchor that does not exist", tone: "critical" },
    { value: "2", label: "live websites carrying the practice's identity", tone: "critical" },
    { value: "5 of 5", label: "federal records filed with the correct vascular taxonomy", tone: "positive" },
  ] as Stat[],
  footnote:
    "Every figure on this page was verified by hand on August 28, 2026, against your live site, the federal NPPES registry, and the third-party profiles named in each section. Where something could not be verified, this document says so rather than estimating it.",
};

/* ============================================================
   01 — THE WEBSITE AUDIT
   ============================================================ */

export const engine = {
  eyebrow: "InflowMD audit engine · measured August 28, 2026",
  headline: "The scores are good.",
  headlineAccent: "The expensive problems are not things a score can see.",
  lede: "Two of these three are strong, and they are honestly earned — the content is thorough and the pages are readable to search engines and to AI assistants. Read them the right way, though: automated tools score what they can measure. Whether a booking form renders, whether a federal record matches the front door, whether a second website is competing with the first — none of that is checkable by any automated tool, including ours. **A high score is a reason to look harder, not a reason to stop.**",
  scores: [
    { score: 86, label: "AI readiness", note: "11 of 11 checks verified · InflowMD analysis" },
    { score: 89, label: "Search readiness", note: "9 of 9 checks verified · InflowMD analysis" },
  ],
  speed: {
    label: "Speed",
    value: "Mid-to-high fifties",
    note: "Google PageSpeed Insights · two passes on August 28, 2026 returned 57 and 56. PSI varies run to run, so this is reported as a range rather than a single figure.",
    metrics: [
      { label: "Largest Contentful Paint", value: "13.35s", note: "The main content arriving. Identical across both passes. Google calls anything over 4s poor.", tone: "critical" as Tone },
      { label: "First Contentful Paint", value: "8.1s", note: "The first pixel of the page.", tone: "critical" as Tone },
      { label: "Speed Index", value: "8.4–8.95s", note: "How quickly the page fills in overall, across the two passes.", tone: "critical" as Tone },
      { label: "Total Blocking Time", value: "0–6ms", note: "Good. The page is not busy blocking taps.", tone: "positive" as Tone },
      { label: "Cumulative Layout Shift", value: "0", note: "Good. The page holds still while it loads.", tone: "positive" as Tone },
    ],
  },
  translation:
    "In practice terms: a patient on a phone waits about thirteen seconds for the main content of your page to appear. The page is stable and responsive once it arrives — the problem is purely how long the arrival takes.",
  platformNote:
    "The platform is WordPress with the Elementor page builder and a custom theme. That is a normal, well-maintained configuration of its generation.",
};

export const websiteSection = {
  title: "The website audit",
  sub: "What we found on veinhealthclinics.com, in plain English — what it means and what it costs.",
};

export const websiteFindings: FindingBlock[] = [
  {
    id: "forms",
    tone: "critical",
    tag: "Verified across 23 controlled page loads",
    title: "The booking forms do not render",
    subhead: "Nine booking widgets are in the page markup; none of them reaches the screen",
    body: [
      "Nine LeadConnector booking and contact widgets exist in your pages. All nine sit inside Elementor **popup templates** set to `display: none`, and their real addresses are parked in a `data-lazy-src` attribute for WP Rocket to swap in later. A container that never enters the viewport never trips the lazy-load observer — so the widgets stay at zero by zero pixels and never activate. The markup is all correct. The two pieces simply cancel each other out.",
      "We tested this carefully rather than once: **23 controlled loads — cold cache and warm cache, desktop and mobile viewport, a full page scroll on every load, twenty-second waits, and exit-intent tested explicitly and ruled out. Zero usable forms in 23 loads.**",
      "Said plainly, because it matters: on two occasions across roughly 25 total loads a form *did* appear. Neither could be reproduced under controlled conditions, and we could not establish what triggered them. **We are not claiming the forms never work — we are reporting that they did not work on 23 straight attempts.**",
      "**/online-scheduler/ is the one page that reliably produces a working form.**",
    ],
    meaning:
      "A patient who reads a treatment page, decides they want a screening, and does not happen to find their way to /online-scheduler/ has no working way to ask for one. They are the most qualified visitor on the site, and the button in front of them does nothing.",
  },
  {
    id: "ctas",
    tone: "critical",
    title: "Five of your seven booking buttons point at an anchor that does not exist",
    subhead: "They target #book, and no element with that name is on the page",
    body: [
      "We enumerated every booking call to action on the site. Seven of them. **Five target a `#book` anchor — and no element with that id or name exists on the destination page.** On the homepage that is “Book An Appointment” and “FREE VEIN SCREENING”; on the contact page it is “FREE VEIN SCREENING” at desktop width and “Book a Free Vein Screening” at mobile width; on the scheduler page it is “Book a Free Vein Screening”.",
      "Clicked as a patient would click them, at both viewports: **no popup opens and no form appears.** On mobile the address bar simply gains `#book`; on desktop the page reloads itself.",
      "The two that do reach somewhere real: “CLICK HERE TO BOOK YOUR APPOINTMENT” goes to /online-scheduler/, which works, and “YES, I’M READY, LET’S BOOK ME IN!” goes to the services index.",
    ],
    meaning:
      "This is the same story as the finding above, seen from the other side. The path a convinced patient takes is the path that fails, and it fails silently — nothing errors, nothing tells them to try again. They conclude the practice did not want to hear from them.",
  },
  {
    id: "policies",
    tone: "warn",
    title: "No privacy policy or terms page could be found",
    subhead: "On a site that collects patient contact details and stated symptoms",
    body: [
      "No link containing “privacy”, “terms”, “HIPAA”, “notice” or “accessibility” appears on the homepage, the contact page or the patient-information page. There is no privacy-policy or terms URL among the 57 pages in your sitemap, and the usual addresses were checked directly.",
      "Two privacy policies *are* reachable from the property, but neither is yours — they belong to vendors whose widgets are embedded in the pages.",
    ],
    meaning:
      "A practice collecting names, phone numbers and stated symptoms is expected to publish how it handles them. This is a page to write once, not a project.",
  },
  {
    id: "schema",
    tone: "warn",
    title: "The site tells Google it is a health-and-beauty business",
    subhead: "No MedicalClinic and no LocalBusiness markup anywhere on the site",
    body: [
      "Structured data is genuinely well done here — present on **all 57 pages, with zero parse errors**, including FAQ markup on 24 pages and Physician markup on three. That is better than most practices we measure.",
      "The gap is which kind of business it declares. The single business node on the site is typed **`HealthAndBeautyBusiness`**. There is no `MedicalClinic`, no `MedicalBusiness` and no `LocalBusiness` type anywhere.",
    ],
    meaning:
      "Structured data is the machine-readable label a search engine and an AI assistant read before they read your words. Right now that label files a five-location vascular surgery practice on the same shelf as a salon. It does not stop you ranking — it does make it harder to be the answer when someone asks an assistant for a vein specialist.",
  },
  {
    id: "orphan-lps",
    tone: "warn",
    title: "Five aesthetics landing pages are live but outside the sitemap",
    subhead: "EmSculpt, fat reduction, skin tightening, skin resurfacing, dermal fillers",
    body: [
      "Each returns 200, each is linked from exactly one page, and none of the five appears in your sitemap. An entire body-contouring service line exists as landing pages that search engines are not being told about.",
    ],
    meaning:
      "A page missing from the sitemap is a page found late or not at all. If those services are worth having pages for, they are worth being findable.",
  },
  {
    id: "404s",
    tone: "warn",
    title: "Three internal links point at pages that no longer exist",
    subhead: "Low reach, and quick to fix",
    body: [
      "`/contactus/` (linked from 3 pages), `/services/pelvic-congestion/` (1 page) and `/services/peripheral-artery-disease/` (1 page) all return 404. The last one matters most: `/services/peripheral-artery-disease-florida/` exists and is fine, so this is an old address still being linked. One malformed link, `/job-opening/&`, was also found.",
      "Worth recording what is *not* broken, since it is the more common problem: your 57 sitemap URLs all return 200, there are **no orphan pages**, and `/contact` and `/contact/` both redirect correctly.",
    ],
  },
];

export const crowns = {
  title: "What is already right",
  lead: "These are not consolation prizes — several are things we rarely find in this specialty.",
  items: [
    { title: "All five federal records carry the correct vascular taxonomy", detail: "The specific vascular-surgery code on every organization record, not the generic surgery code most practices are filed under, with Dr. Nwobi as authorized official on each." },
    { title: "Structured data on all 57 pages, zero parse errors", detail: "Including FAQ markup on 24 pages. The markup is clean — it is the business type that needs correcting." },
    { title: "No orphan pages", detail: "Every page in the sitemap is linked from somewhere on the site. That does not happen by accident." },
    { title: "Pinch-zoom is not disabled", detail: "No maximum-scale restriction in the viewport settings — which matters for a patient base that reads by zooming in." },
    { title: "A real, working scheduler", detail: "/online-scheduler/ reliably produces a usable booking form. The capability is already there and already paid for." },
    { title: "Every page has a written H1", detail: "No template defaults left behind anywhere across 57 pages." },
  ],
};

/* ============================================================
   02 — THE WEB PRESENCE SCAN
   ============================================================ */

export const presenceSection = {
  title: "The web presence scan",
  sub: "Your website is one surface. This is everything else a patient touches on the way to you — the federal record, the directories that read it, the profiles and the other domains. Most practices have never been shown this.",
};

export const addressProblem = {
  title: "The address problem — start here",
  body: "This is the upstream one, and you can check every line of it yourself at **npiregistry.cms.hhs.gov**. Your organization records are filed under the legal name **Vascular Health Institute Inc**, with Dr. Nwobi as authorized official — five records in all, every one carrying the correct vascular-surgery taxonomy.",
  table: {
    caption: "The federal record against the website, August 28, 2026",
    columns: ["Location", "On the website", "In the federal record", "Agree?"],
    rows: [
      { cells: ["Winter Haven", "1121 1st St S", "1121 1ST ST S", "Yes"], highlight: true },
      { cells: ["Oviedo", "1000 Executive Dr Ste 8", "1410 W BROADWAY ST STE 105", "No — two different addresses"] },
      { cells: ["Winter Park", "—", "4355 BEAR GULLY RD", "Federal only"] },
      { cells: ["Ocoee", "—", "572 OCOEE COMMERCE PKWY", "Federal only"] },
      { cells: ["Winter Garden", "301 SW Crown Point Rd Ste 140", "—", "Website only"] },
      { cells: ["Port St. Lucie", "1801 SE Hillmoor Dr Ste C-208", "—", "Website only"] },
      { cells: ["Ocala", "1830 SE 18th Ave Ste 3", "—", "Website only"] },
    ],
  } as TableBlock,
  mechanism:
    "The mechanism, without any accusation in it: healthcare directories ingest the federal NPPES registry automatically, and they re-pull from it on a cycle. So a directory corrected by hand is corrected until the next re-pull, and then it quietly reverts. **This is why the same wrong addresses keep reappearing after somebody has already fixed them.** It is not carelessness downstream; it is the order the work has to be done in.",
  cost:
    "The cost in patients is the simplest on this page: a patient is sent to an address you do not practise at. They do not call to tell you — they go somewhere else.",
  note: "We scanned the full organization population of the Winter Garden, Port St. Lucie and Ocala ZIP codes and found no federal record for those three offices. A record filed under another name in a ZIP we did not scan would not have surfaced.",
};

export const domains = {
  title: "Two live websites carry the practice's identity",
  body: [
    "**veinhealthclinics.com** and **vascularhealthcenter.com** are both live, both indexable, and both yours — the same physician, the same platform, and shared phone numbers, including the toll-free number and the Ocala and Port St. Lucie lines.",
    "Neither is doing anything wrong on its own. The problem is arithmetic: everything that makes a domain rank — links, mentions, the trust a search engine builds up over years — is counted per domain. Two domains carrying one practice split that in half, and each half competes with the other for the same searches. A patient who lands on the wrong one gets a different impression of the same practice.",
  ],
  subdomainTitle: "And a funnel page on a subdomain",
  subdomain: [
    "A GoHighLevel/ClinicGrower assessment funnel — “Complimentary Online Vein Assessment” — lives on a `winterhaven.` subdomain and is **linked from 32 of the 57 pages** on the main site. The subdomain root returns 404. The page has no title tag, no robots meta and no canonical tag.",
    "It is not a duplicate of the main site — it is one standalone page on a different platform. **Whether search engines have indexed it, we could not verify**, so this page does not claim either way. What can be said is that nothing on it prevents indexing, and 32 of your pages link to it.",
  ],
};

export const directories = {
  title: "What the directories say",
  body: "Read this one with its sample size attached. **Eleven publishers were touched and five were fully readable.** Yelp, ZoomInfo and Healthgrades could not be read from our network — those are recorded as could-not-verify, and this document does not characterise what is in them.",
  stats: [
    { value: "6", label: "distinct spellings of the practice name in circulation", tone: "warn" },
    { value: "8", label: "distinct phone numbers", tone: "warn" },
    { value: "9", label: "distinct addresses", tone: "warn" },
    { value: "5 of 11", label: "publishers fully readable — the rest could not be verified", tone: "warn" },
  ] as Stat[],
  findings: [
    {
      id: "shared-phone",
      tone: "warn",
      title: "One toll-free number is the thread running through everything",
      body: [
        "The same toll-free number appears sitewide, on **all five federal records**, on both domains, and on Doximity.",
        "Aggregators commonly de-duplicate business records by phone number, which makes a single shared number the precondition for two offices being merged into one listing. **Stated carefully: that is a precondition, not an observed effect.** We did not find a merged listing, and this page does not claim one exists.",
      ],
    },
    {
      id: "name-drift",
      tone: "warn",
      title: "Six versions of the practice name are in circulation",
      body: [
        "Vein Health Clinics · Vein Health Clinics | Florida Vein Care Specialists · Vein Health Clinic Winterhaven · Vein Health Clinics Ocoee · Vein Health Clinics: Obinna Nwobi, MD · and the legal entity, Vascular Health Institute Inc.",
        "Each one arrived for a good reason at the time. Together they read to a search engine as several businesses rather than one practice with five offices.",
      ],
    },
  ] as FindingBlock[],
};

export const profiles = {
  title: "Duplicate Google profiles",
  body: [
    "Alongside the practice listings there are **two practitioner-level Google profiles** at addresses that are not among your five published offices. One of those addresses — 572 Ocoee Commerce Pkwy — is a **real federal record location** that the website does not mention. The other matches neither the federal record nor the site.",
    "Separately, four profiles you own carry **four different Google categories** between them.",
  ],
  meaning:
    "A duplicate profile splits review equity: patients leave reviews wherever they happen to land, so the reputation you have earned accumulates in two places instead of compounding in one. It is close to invisible from the inside, because the profile you check is the one that looks fine. Category consistency matters for the same reason — the category is one of the strongest signals deciding which businesses Google shows for a treatment search.",
  omitted:
    "Review counts, ratings, recency and reply behaviour are deliberately absent from this page: they were not part of what we verified, and we would rather leave a gap than fill it with an estimate.",
};

/* ============================================================
   03 — THE BUILD AND THE PLAN
   ============================================================ */

export const thesis = {
  title: "One source of truth",
  sub: "The argument for a rebuild here is not that the site looks dated. It is that nothing on it is authoritative over anything else.",
  intro: "Your own site states the strategy, and states it well:",
  quote:
    "We provide excellent guidance and education for our patients, ensuring they have a thorough understanding of their condition and treatment options.",
  body: [
    "That is exactly right for this specialty. Vein disease is the condition patients research for weeks before they call, and a practice that teaches them earns the appointment. Your content already does that work — 57 pages, structured data on all of them, an education library that scores 86 on AI readiness and 89 on search readiness.",
    "The break is between the teaching and the asking. A patient reads, decides, reaches for the button — and the button points at an anchor that is not there. Meanwhile the same practice appears to the internet as five offices on one site, two more on a federal record, two live domains, a funnel subdomain, six name spellings and nine addresses. **Every one of those surfaces was correct on the day it was made. None of them is responsible for staying correct.**",
    "So the architecture we would build is not a redesign. It is one place where the practice's name, its addresses, its phone numbers and its booking path are defined once, and every surface — pages, schema, profiles, campaign funnels — reads from that one definition. The kind of failure in this document then becomes structurally impossible rather than merely fixed: a booking button cannot point at a missing anchor when there is one booking component, and an office cannot exist on the site but not in the record when both read the same list.",
  ],
  closing:
    "The content is the expensive part and you already own it. What we would supply is the layer underneath it that keeps it all agreeing with itself.",
};

export const plan = {
  title: "What we would do",
  sub: "Ordered by what recovers patients fastest, not by what is most impressive.",
  spine:
    "**Phase one is worth doing whoever does it.** Those three items are the ones costing you appointments this week, and none of them requires a rebuild or a relationship with us — if you take nothing else from this document, take that page.",
  phases: [
    {
      name: "Phase one — make booking work again",
      timeframe: "Days, not weeks",
      outcome: "A patient who decides to book can actually book.",
      steps: [
        "**Get the forms rendering.** The nine booking widgets are correct; they are trapped in hidden popup containers that never trigger their own lazy-load. Either surface them inline or fix the trigger.",
        "**Repoint the five booking buttons** that target a `#book` anchor which does not exist — or add the anchor. Five of seven CTAs, on the homepage, the contact page and the scheduler page.",
        "**Correct the federal NPPES record** so the two federal-only locations and the Oviedo address match reality. Everything downstream re-pulls from here, so this goes first or the directory work will not hold.",
      ],
    },
    {
      name: "Phase two — one source of truth",
      timeframe: "The rebuild",
      outcome: "Every surface reads the practice's details from one definition.",
      steps: [
        "**Consolidate onto a single domain architecture**, with permanent redirects from the second domain so nothing that has been earned is thrown away.",
        "**Correct the medical schema** — a real MedicalClinic and LocalBusiness identity per office, replacing the single health-and-beauty node, and the five aesthetics landing pages brought into the sitemap.",
        "**Consolidate the directories and the duplicate profiles**, in the right order — federal record first, then the publishers that read it, then the duplicate Google profiles and the category alignment.",
      ],
    },
    {
      name: "Phase three — keep it true",
      timeframe: "Ongoing",
      outcome: "The corrections hold, and the education library starts compounding.",
      steps: [
        "**Finish the content-level items the audit flagged** — the meta descriptions, the image descriptions and the AI-assistant readability work, across a library that already scores well.",
        "**Monitor the citations** so a federal or directory record that drifts is caught rather than rediscovered in the next audit.",
        "**Reporting in plain language** — calls, forms, bookings and rankings, monthly, so the booking path is never again something nobody is watching.",
      ],
    },
  ],
  punchList:
    "Smaller items go on a punch list we would walk through together rather than decide now: the three internal 404s and the malformed link, the missing privacy and terms pages, the funnel subdomain's missing title tag, and the two Google profiles at addresses that appear on no current record.",
  guarantee:
    "One thing we will not do is promise you a number. The rebuild is engineered toward a booking path that works on every load, a single authoritative record of the practice, and materially faster delivery of the content you already have — and it is measured afterwards by the same audit that produced this page.",
};

/* ============================================================
   04 — INVESTMENT
   ============================================================ */

export const investment = {
  title: "Investment",
  sub: "One monthly figure. The build is included, not billed separately.",
  summitNote:
    "Summit pricing, held for practices we met at the HPS Vein Practice Growth Summit.",
  ratesNote:
    "Published rates are the ones on inflowmd.com/pricing. $500 is our floor and does not move; above it we are holding 20% for twelve months, with setup waived.",
  rationale:
    "**Why Growth, plainly:** the expensive problems in this document are not website problems. The federal record, the second domain and the duplicate profiles all sit outside what a website rebuild touches — and they are the ones sending patients to the wrong address and splitting your reputation in two. Growth is the tier where that work is included alongside the rebuild.",
  inclusionsTitle: "In every tier",
  inclusions: [
    "Rebuild on one architecture",
    "Hosting, maintenance, security and ongoing development",
    "Google Business Profile management",
    "Monthly reporting",
  ],
  inclusionsNote:
    "Everything beyond these four is tier-specific and named on the card that carries it.",
  tiers: [
    {
      name: "Essentials",
      published: "$500",
      rate: "$500",
      savings: "Our floor — this price does not move.",
      includes: [
        "Rebuild on one architecture",
        "Hosting, security and ongoing development",
        "Google Business Profile setup",
        "Monthly reporting",
      ],
      limitation:
        "This fixes the website. It does not touch the federal record, the directory errors, the unclaimed profiles or the second domain — the things this audit found most of.",
    },
    {
      name: "Visibility",
      published: "$900",
      rate: "$720",
      badge: "20% OFF",
      savings: "You save $180/mo — rate locked 12 months",
      inherits: "Everything in Essentials, plus",
      includes: [
        "Federal record correction, then the directories that read it",
        "Managed citations across all five locations",
        "Duplicate profile consolidation and category alignment",
        "Local SEO",
        "Review strategy",
      ],
    },
    {
      name: "Growth",
      published: "$1,500",
      rate: "$1,200",
      badge: "20% OFF",
      recommended: true,
      savings: "You save $300/mo — rate locked 12 months",
      inherits: "Everything in Visibility, plus",
      includes: [
        "Custom architecture — one source of truth, single-domain consolidation",
        "Correct medical schema across every location",
        "Keyword optimization",
        "2 patient-education posts per month",
        "AI-search optimization",
        "Monthly SEO reporting",
      ],
    },
    {
      name: "Full Engine",
      published: "$2,500",
      rate: "$2,000",
      badge: "20% OFF",
      savings: "You save $500/mo — rate locked 12 months",
      term: "$6,000 over the term",
      inherits: "Everything in Growth, plus",
      includes: [
        "Google Ads management",
        "Conversion tracking",
        "Landing page optimization",
        "Quarterly strategy review",
      ],
      limitation: "Management only — ad spend is paid directly to Google, never through us.",
    },
  ],
  reviewNote:
    "Review strategy is included from Visibility upward. We have said nothing here about reputation software, because we do not know what you already own and would rather ask than assume.",
};

export const closing = {
  title: "Where this goes next",
  paragraphs: [
    "**This audit is yours regardless of what you decide.** The Phase One items are worth doing whoever does them — the forms, the five booking buttons and the federal record are costing you appointments this week, and none of them requires us. If it is useful, we are glad to walk whoever maintains the site through the findings, in detail, with no expectation attached.",
    "If the architecture argument is interesting, the next step is a working session: we go through this page together, you tell us where we have read the practice wrong, and we put a formal proposal and a timeline in front of you.",
  ],
  signature: {
    name: "Clayton Peterson · InflowMD",
    email: "clayton@inflowmd.com",
    site: "inflowmd.com",
  },
};

export const footer = {
  line: "Prepared by InflowMD for Dr. Obinna Nwobi, Vein Health Clinics, Central Florida. Confidential. August 28, 2026.",
  methodology:
    "Site walk, engine scores, federal records and directory profiles all verified by hand on August 28, 2026. Speed measured by Google PageSpeed Insights across two passes and reported as a range; search and AI readiness analyzed by InflowMD. Directory and profile data change continuously. Where a check could not be completed from our network, this document records it as unverified rather than estimating it.",
};
