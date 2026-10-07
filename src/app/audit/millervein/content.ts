/**
 * Miller Vein — audit page copy.
 *
 * EVERY FIGURE ON THIS PAGE COMES FROM research/millervein.md (all checks
 * dated October 6, 2026). Nothing here is inferred, estimated, or carried
 * over from another practice's audit. Where a check could not be completed,
 * the page says so rather than filling the gap.
 *
 * TONE — the hard constraint on this document. Dr. Miller launched a brand
 * new website weeks ago and paid another firm to build it. Nothing on this
 * page criticises that build or the people who made it, and nothing implies
 * he chose badly. That is not diplomacy; it is accurate. The engine scores
 * the new site well, the AI crawlers are open, the schema is rich, and the
 * real-world delivered speed is the fastest of the three sites measured.
 * The argument of this document is that the website was never the half of
 * the problem that is costing him patients.
 *
 * SPEED — the most important honesty call here. The lab test returns a
 * 21.56s LCP; Google's real-user field data for the same site returns 2.02s,
 * inside the good band and the best of the three sites measured. Claiming
 * patients wait twenty-one seconds would be false and would be caught
 * immediately by his COO or his developer. The page reports the measured
 * score, states the field data beside it, and never makes the twenty-one
 * second claim.
 *
 * THE BRIEF WAS WRONG ON TWO POINTS, both corrected here: the practice has
 * EIGHT locations, not three, and the staging environment's AI-crawler block
 * did NOT ship to production. The second was expected to be the headline
 * finding. It does not exist, and the page says so as a strength.
 */

export type Tone = "critical" | "warn" | "positive";

export type Stat = { value: string; label: string; tone: Tone };

export type TableBlock = {
  caption?: string;
  columns: string[];
  rows: { cells: string[]; highlight?: boolean }[];
};

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

export const practice = {
  name: "Miller Vein",
  owner: "Dr. Jeffrey Miller",
  domain: "millervein.com",
  location: "Michigan",
  auditDate: "October 6, 2026",
};

export const meta = {
  /** Absolute — the root layout's "%s | InflowMD" template would otherwise
      put our name on his document and on the PDF he saves from it. */
  title: "Miller Vein — Practice Audit",
  eyebrow: "Practice Audit · Prepared for Dr. Jeffrey Miller",
  h1: "Miller Vein",
  lede: "A look at the new site, at the eight-clinic presence around it, and at the one of those two that is still costing you patients.",
  metaRow: [
    { label: "Prepared by", value: "Clayton Peterson, InflowMD" },
    { label: "Date", value: "October 6, 2026" },
    { label: "Market", value: "Michigan · eight clinics" },
    { label: "Scope", value: "Site, federal records, directories, reviews, competitors" },
  ],
  verifiedLine:
    "Every figure on this page was verified by hand on October 6, 2026 — against your live site, the federal NPPES registry at npiregistry.cms.hhs.gov, the directory profiles named in each section, and live audit runs of two competitors.",
};

export const nav = [
  { id: "verdict", label: "Verdict" },
  { id: "website", label: "The New Site" },
  { id: "presence", label: "Web Presence" },
  { id: "plan", label: "The Plan" },
  { id: "investment", label: "Investment" },
];

/* ============================================================
   THE SHORT VERSION
   ============================================================ */

export const summary = {
  eyebrow: "The short version",
  verdictLine: "The new site is good. **The eight-clinic presence around it is not.**",
  scores: [
    { value: "90", label: "AI readiness" },
    { value: "83", label: "Search readiness" },
    { value: "54", label: "Speed" },
  ],
  scoresNote:
    "Measured October 6, 2026 against the live production site. Speed is the lab score — your real-user field data is better than both competitors we measured.",
  findings: [
    "The AI-crawler block you saw on the staging build did not ship. Production allows GPTBot, ClaudeBot, PerplexityBot and Google-Extended, and you publish an llms.txt. That is ahead of most of this specialty.",
    "A federal record last updated in 2019 still calls a Novi address “Miller Vein — Dearborn,” at the wrong suite — and the directories that read that record have put one of your physicians at a competitor.",
    "Your single largest pool of Google reviews — 785 of them — is attached to a Novi address that is not your Novi clinic.",
  ],
  recommendation: {
    price: "$2,000",
    per: "/ month",
    what: "Full Engine — rebuild, SEO, ads and the presence work",
    note: "Published rate $2,500. Rate locked twelve months.",
  },
  readMore: "Read the evidence",
};

export const criticalStrip = {
  title: "The three that are costing you patients right now",
  lines: [
    "Vitals lists Dr. Bannon — your Troy physician — as practising at Metro Vein Centers, because her federal record says she practises alone, in a different specialty, at an address that is not yours.",
    "785 Google reviews, your biggest single pool, sit on a profile pointing at 46325 W 12 Mile Rd — not your Novi clinic at 25500 Meadowbrook.",
    "Four of your five findable location profiles are unclaimed, so nobody can correct them or reply to a review on them.",
  ],
};

/* ============================================================
   VERDICT
   ============================================================ */

export const verdict = {
  title: "The verdict",
  paragraphs: [
    "Start with the part that matters most, because it reverses what you were told at the summit: **the AI-assistant block you audited on the staging build did not ship to production.** We checked robots.txt directly. GPTBot, ClaudeBot, PerplexityBot and Google-Extended are all allowed, and the site publishes an llms.txt file, which almost nothing in this specialty does. Whatever that setting was, it was a staging setting, and it stayed there.",
    "So the new site is not the problem. It scores 90 on AI readiness and 83 on search readiness, it carries twenty-one types of machine-readable medical schema, and its real-world delivered speed is the **fastest of the three vein sites we measured today**. Someone built you a good website.",
    "The problem is that a website is one of two halves, and the rebuild only ever touched one of them. **Underneath it sits a federal record last updated in 2019, a physician on your staff whom the directories have assigned to a competitor, 785 reviews pointing at an address you left, and seven of your eight clinics with no organizational record at all.** None of that is a website defect. None of it was your developer's job. And none of it got better when the new site went live.",
  ],
  pullquote:
    "You bought a new front door. What is behind it is still the filing system from 2019 — and that is the half patients get routed through before they ever reach the door.",
  closing:
    "Said plainly: the build is not what we would change. **We would keep it, finish the four small things the engine flagged, and spend the real effort on the eight-clinic presence the rebuild could not reach.** That is the half you told us you would be evaluating — not the build, but the rest of the service around it.",
  stats: [
    { value: "90 / 83", label: "AI and search readiness on the new site — ahead of the regional competitor", tone: "positive" },
    { value: "2019", label: "last update to the federal record that routes your directory listings", tone: "critical" },
    { value: "785", label: "Google reviews attached to a Novi address that is not your Novi clinic", tone: "critical" },
    { value: "7 of 8", label: "clinics with no organization record in the federal registry", tone: "critical" },
  ] as Stat[],
  footnote:
    "Every figure on this page was verified by hand on October 6, 2026, against your live site, the federal NPPES registry and the third-party profiles named in each section. Where something could not be verified, this document says so rather than estimating it.",
};

/* ============================================================
   01 — THE NEW SITE
   ============================================================ */

export const engine = {
  eyebrow: "InflowMD audit engine · measured October 6, 2026",
  headline: "The new site measures well.",
  headlineAccent: "We are not going to pretend otherwise.",
  lede: "These are live scores against production, run today. Two of the three are strong and honestly earned. Read them the right way, though: an automated tool scores what it can reach. Whether a federal record matches your front door, whether a directory has filed your physician under a competitor, whether your reviews are pointing at a building you left — none of that is checkable by any automated tool, including ours. **A good score is a reason to look wider, not a reason to stop.**",
  scores: [
    { score: 90, label: "AI readiness", note: "11 of 11 checks verified · InflowMD analysis" },
    { score: 83, label: "Search readiness", note: "9 of 9 checks verified · InflowMD analysis" },
  ],
  speed: {
    label: "Speed",
    value: "54",
    note: "Google PageSpeed Insights · measured October 6, 2026. PSI varies run to run, so treat this as a band rather than a decimal.",
    metrics: [
      { label: "Field data — real Chrome users", value: "LCP 2.02s", note: "GOOD, and the fastest of the three vein sites we measured today. This is what your actual patients experience.", tone: "positive" as Tone },
      { label: "Lab — Largest Contentful Paint", value: "21.56s", note: "Measured on a deliberately throttled simulated phone. This is not what typical patients experience — see the note below.", tone: "critical" as Tone },
      { label: "Lab — First Contentful Paint", value: "8.36s", note: "Same throttled conditions.", tone: "critical" as Tone },
      { label: "Total Blocking Time", value: "185ms", note: "Good. The page is not busy blocking taps.", tone: "positive" as Tone },
      { label: "Cumulative Layout Shift", value: "0", note: "Perfect. The page holds completely still while it loads.", tone: "positive" as Tone },
    ],
  },
  translation:
    "**The speed number needs reading carefully, and we would rather explain it than weaponise it.** The lab test runs a simulated phone on a deliberately throttled connection, and under those conditions something on the homepage takes a very long time to settle — 21.56 seconds. But Google also collects real-user data from actual Chrome visitors, and on that measure your Largest Contentful Paint is **2.02 seconds, inside Google's good band, and faster than both competitors we measured.** So: your patients are not waiting twenty-one seconds. What the lab score does tell you is that there is something heavy on the homepage that punishes anyone on a genuinely poor connection — and that Google's own Lighthouse-based scoring sees the throttled number, not the real one. It is worth fixing. It is not an emergency, and anyone who tells you it is has not looked at the field data.",
  platformNote:
    "The platform is WordPress on WP Engine, built on a child theme. That is a normal, well-maintained configuration, and the measurements above are what it is delivering.",
};

export const websiteSection = {
  title: "The new site",
  sub: "What the engine found on millervein.com — the strengths first, because they are the larger part of the story, then the handful of things left on the table.",
};

export const websiteFindings: FindingBlock[] = [
  {
    id: "crawlers",
    tone: "positive",
    tag: "Verified directly in robots.txt, October 6, 2026",
    title: "The AI block did not ship — and you are ahead of your field",
    subhead: "This is the finding you asked us to check first, and the answer is good news",
    body: [
      "At the summit you audited the staging build and it was blocking AI assistants. **That did not reach production.** Your live robots.txt carries a standard Yoast block with an open `Disallow:` line and a sitemap reference. GPTBot, ClaudeBot, PerplexityBot and Google-Extended are **all allowed**.",
      "Beyond that, the site **publishes an llms.txt file** — a newer standard that tells AI assistants how to read and summarise a site. Almost no vein practice we measure has one. It is a large part of why AI readiness comes in at 90.",
      "The schema is genuinely rich too: **twenty-one machine-readable types**, including MedicalClinic, MedicalBusiness, MedicalOrganization and LocalBusiness. That is the correct medical vocabulary, not a generic business tag.",
    ],
    meaning:
      "When a patient asks ChatGPT or Perplexity for a vein specialist in Michigan, your site is readable, quotable and correctly labelled as a medical practice. That was not true of the staging build you tested, and it is not true of one of the two competitors we measured today.",
  },
  {
    id: "duplicate-urls",
    tone: "warn",
    tag: "Verified by direct fetch on three URL patterns",
    title: "Every location page answers at three different addresses",
    subhead: "The old URL structure was never redirected, so it is still live alongside the new one",
    body: [
      "Taking Dearborn as the example, all three of these return a **200 with the full page**, and none of them redirects:",
      "`/locations/dearborn/` — the canonical address · `/dearborn` — root-level · `/detroit-metro-locations/dearborn/` — the **legacy structure from the previous site**, still serving.",
      "The `rel=canonical` tags are set correctly on all three, pointing at `/locations/dearborn/`. That is the right call and it mitigates most of the damage. But a canonical is a hint to a search engine, not an instruction — and crawl budget is spent on all three either way.",
      "Separately, the old WP Engine staging host still resolves. It currently serves a robots.txt that disallows crawling, and we found no pages indexed under it, so this is **not an active problem today** — it simply has not been decommissioned.",
    ],
    meaning:
      "This is a migration leftover rather than a design mistake, and it is the kind of thing that is cheap to fix now and expensive to find later. Permanent redirects from the two legacy patterns to the canonical one, and the staging environment retired.",
  },
  {
    id: "engine-warns",
    tone: "warn",
    title: "Four small things the engine flagged",
    subhead: "Genuinely small — this is the whole list",
    body: [
      "**Two competing main headings** on the homepage. “Michigan’s #1 Choice For Superior Vein Care” and “Your Legs Shouldn’t Hold You Back.” are both marked as the page's primary heading, which muddies what the page is about.",
      "**Heading levels skip**, jumping from a level-2 heading straight to a level-6. Screen readers and AI assistants both use that outline to work out how sections relate.",
      "**The search description is 159 characters** and will be trimmed mid-sentence in results.",
      "**A redirect hop** from `millervein.com` to `www.millervein.com` adds a step before the page starts loading.",
      "That is the complete list of non-passing checks across both gauges. Everything else — HTTPS, canonical, mobile viewport, social preview, image descriptions, page title, content depth, crawler access — passed.",
    ],
    meaning:
      "An afternoon of work between them, and worth doing. We are listing them for completeness, not because they are what this document is about.",
  },
];

export const crowns = {
  title: "What the new build got right",
  lead: "Worth stating explicitly, because the rest of this document is about everything the build could not reach — and that is not the same as the build being weak.",
  items: [
    { title: "All four major AI crawlers allowed", detail: "GPTBot, ClaudeBot, PerplexityBot and Google-Extended, verified in production robots.txt. The staging block did not ship." },
    { title: "llms.txt published", detail: "An emerging standard most practices have never heard of. It is a real edge and it is already live." },
    { title: "Twenty-one schema types, correctly medical", detail: "MedicalClinic, MedicalBusiness, MedicalOrganization and LocalBusiness among them — the right vocabulary for a practice." },
    { title: "The best real-world speed of the three sites measured", detail: "Field LCP of 2.02 seconds against 2.2s and 2.59s for the two competitors we ran today." },
    { title: "Layout shift of zero", detail: "The page does not move under a patient's thumb while it loads. Most practice sites cannot say that." },
    { title: "Pinch-zoom left enabled", detail: "No maximum-scale restriction — which matters more than it sounds for a patient base that reads by zooming in." },
  ],
};

/* ============================================================
   02 — THE WEB PRESENCE SCAN
   ============================================================ */

export const presenceSection = {
  title: "The web presence scan",
  sub: "Your website is one surface. This is the other one — the federal record, the directories that read it automatically, the review profiles and the phone numbers. A rebuild does not touch any of it, and most practices have never been shown it.",
};

export const addressProblem = {
  title: "The federal record — start here, because everything downstream reads from it",
  body: "You can check every line of this yourself at **npiregistry.cms.hhs.gov**. Your own individual record is in good shape and we want to say so first: **Dr. Miller's NPI was last updated on March 6, 2026**, and carries seven practice locations that match your site. That is better maintained than most. The problem is the records around it.",
  table: {
    caption: "The federal records behind Miller Vein, checked October 6, 2026",
    columns: ["Record", "What it says", "Last updated", "Status"],
    rows: [
      { cells: ["Dr. Jeffrey Miller (individual)", "Seven locations, all matching the site", "March 6, 2026", "Current"], highlight: true },
      { cells: ["“MILLER VEIN — DEARBORN” (org)", "A Novi address — at Suite 105, not 215", "November 5, 2019", "Wrong city, wrong suite"] },
      { cells: ["Advanced Vein Therapies PLLC (parent)", "Diagnostic Radiology, no vein code at all", "February 15, 2019", "Wrong specialty"] },
      { cells: ["Dr. Krista Bannon (Troy)", "Rochester Hills, Detroit, Southfield — no Miller Vein address", "March 28, 2019", "Not your practice"] },
      { cells: ["The other seven clinics", "No organization record exists", "—", "Absent"] },
      { cells: ["Holland", "No federal footprint of any kind", "—", "Absent"] },
    ],
  } as TableBlock,
  mechanism:
    "The mechanism, with no accusation in it: healthcare directories ingest the federal registry automatically and **re-pull from it on a cycle**. So a directory corrected by hand stays corrected until the next re-pull, and then it quietly reverts to whatever the federal record says. **This is why the same wrong entries keep reappearing after somebody has already fixed them.** It is not carelessness downstream — it is the order the work has to be done in. Federal record first, or the directory work does not hold.",
  cost:
    "The most expensive single line in that table is the one named for a city it is not in. A record called “Miller Vein — Dearborn,” carrying a Novi street address at the wrong suite number, last touched in 2019 — and every directory that reads the registry inherits it.",
  note: "One more, stated plainly because it is odd: the phone number on your own website — (877) 432-2184 — appears in **no federal record at all**. Every federal record carries 248-344-9110. Both are yours; they simply have never been reconciled.",
};

export const domains = {
  title: "What the directories did with a 2019 record",
  body: [
    "This is the part that is hard to see from the inside, because the profile you check is the one that looks fine. We verified the ingestion chain at both ends — the stale federal strings appear verbatim downstream.",
    "**Vitals lists Dr. Krista Bannon — your Troy physician — under the practice name “Metro Vein Centers.”** Her specialty reads “Surgery,” which is the federal taxonomy code read literally, and the addresses shown are Rochester Hills and a Dearborn address belonging to Metro Vein Centers. Her federal record says she is a sole proprietor practising at addresses that are not yours, so that is what the directory published.",
    "**Sharecare lists her under “Seton Health Corporation of Southeastern Michigan”** — a third, unrelated employer.",
    "**Sharecare lists Dr. Miller under “A1 Home Health Care,”** a real and unrelated home-health business that happens to occupy the same Novi building and suite number. That profile carries zero reviews.",
    "**WebMD still carries Dr. Bannon under her former name**, as a general surgeon — a direct ingestion of the former-name field still sitting on her federal record. WebMD also holds two separate practice records for Miller Vein.",
  ],
  subdomainTitle: "And the smaller drift around it",
  subdomain: [
    "**Six versions of the practice name** are in circulation, and **three different phone numbers** are presented as the main line: (877) 432-2184, (248) 344-9110 and (877) 250-7533.",
    "The Better Business Bureau still carries a **Troy address you have left** — 230 W. Maple Rd — against your current 4550 Investment Dr.",
    "Healthgrades, Facebook and most of Yelp could not be read from our network. Those are recorded as **could-not-verify**, and this document does not characterise what is in them.",
  ],
};

export const directories = {
  title: "The reviews — the asset is real, and some of it is in the wrong place",
  body: "You have earned a genuinely large and genuinely excellent review base. We confirmed **2,014 Google reviews across five of your eight locations**, rated 4.9 and 5.0. Your own site claims over 3,000, which is plausible — we simply could not locate profiles for the other three clinics, so we are reporting what we verified rather than what we assume.",
  stats: [
    { value: "785", label: "reviews on a Novi profile pointing at an address you no longer occupy", tone: "critical" },
    { value: "4 of 5", label: "location profiles unclaimed — they cannot be corrected or replied to", tone: "critical" },
    { value: "2,014", label: "Google reviews confirmed across five locations, at 4.9–5.0", tone: "positive" },
    { value: "4.3", label: "rating on the corporate-office profile, competing with your 4.9s", tone: "warn" },
  ] as Stat[],
  findings: [
    {
      id: "stale-novi",
      tone: "critical",
      title: "Your largest pool of reviews is anchored to the wrong building",
      body: [
        "The Novi profile carries **785 reviews at 4.9** — the biggest single concentration you have, roughly 39% of everything we confirmed. It is attached to **46325 W 12 Mile Rd, Ste 150, Novi 48377**.",
        "Your Novi clinic is at **25500 Meadowbrook Rd, Suite 215, Novi 48375**. Different street, different suite, different ZIP.",
        "That same W 12 Mile address appears elsewhere with **three different suite numbers** across three sources — 150, 335, and none at all.",
      ],
      meaning:
        "Review equity is the hardest thing in local search to buy and the easiest thing to strand. Eight hundred reviews pointing at a building you left is eight hundred reviews working for an address instead of for you — and a patient who follows them arrives at the wrong place.",
    },
    {
      id: "unclaimed",
      tone: "critical",
      title: "Four of five location profiles are unclaimed",
      body: [
        "Only Troy is claimed. Novi, Macomb, Auburn Hills and the Farmington Hills corporate office are not.",
        "An unclaimed profile cannot be corrected, cannot respond to a review, and leaves its address and phone fields open to third-party edits.",
        "The corporate office profile is its own small problem: **4.3 stars from 4 reviews**, against 4.9 and 5.0 at every actual clinic. It is an administrative address competing for brand-name searches with your worst rating attached.",
      ],
      meaning:
        "This is the cheapest work in this entire document and among the highest-return. Claiming a profile is free and takes an afternoon; what it unlocks is the ability to fix everything else about it.",
    },
  ] as FindingBlock[],
};

export const profiles = {
  title: "Where you stand against the field",
  body: [
    "We ran two competitors through the same engine on the same day, so these are like-for-like rather than remembered.",
    "**Against the regional player, you are well clear.** Metro Vein Centers scores **52 on AI readiness** against your 90 — they are barely readable to an AI assistant, and you publish an llms.txt. On search readiness you are level at 83.",
    "**Against the national player, there is a real gap and it is worth naming.** Center for Vein Restoration scores **97 on AI readiness and 94 on search readiness**, against your 90 and 83. They sit at the identical speed score you do. Their real-world speed is slower than yours — field LCP of 2.59 seconds against your 2.02.",
  ],
  meaning:
    "Read together: the rebuild moved you decisively past the regional competition and within reach of the national one. The remaining gap to Center for Vein Restoration is not a build gap — it is eleven points of search readiness and seven of AI readiness, which is content structure and markup work on a site that is already well made. That is the ceiling the new site put within reach, and nobody is currently working toward it.",
  omitted:
    "Google Business Profile owner-side data — categories, services menus, posting and reply behaviour — is deliberately absent from this page. We could not verify it from outside the account, and we would rather leave a gap than fill it with an assumption.",
};

/* ============================================================
   03 — THE PLAN
   ============================================================ */

export const thesis = {
  title: "Two halves, one of them unowned",
  sub: "The argument here is not that your site needs replacing. It is that the half of your presence nobody was hired to maintain is now the half losing you patients.",
  intro: "Your own site states the position plainly, and it is the right one:",
  quote: "Michigan's physician-led vein practice, with eight clinics across Metro Detroit and West Michigan.",
  body: [
    "Eight clinics is the whole story. A single-location practice can survive a messy federal record, because there is only one address to get wrong. **Eight locations is eight addresses, eight phone listings, eight review profiles and eight sets of directory entries — and exactly one organization record exists for any of them, filed under the wrong city.**",
    "That is why the rebuild, however good, could not move the needle on this. A website is authoritative over itself. It is not authoritative over the federal registry, over Vitals, over Sharecare, over a Google profile nobody claimed, or over 785 reviews attached to a building you left. Those surfaces read from somewhere else — and right now that somewhere else was last updated in 2019.",
    "So what we would build is not a replacement for what you just bought. **It is the layer underneath it**: one definition of the practice — name, eight addresses, phone numbers, providers, specialties — that the federal record, the directories, the profiles and the site all read from, with somebody responsible for it staying true. The failure mode in this document then becomes structurally impossible rather than repeatedly fixed.",
  ],
  closing:
    "You already own the expensive parts: the clinics, the reviews, the content and now a good website. What is missing is the connective layer that keeps all eight locations telling the internet the same story.",
};

export const plan = {
  title: "What we would do",
  sub: "Ordered by what recovers patients fastest, not by what is most impressive.",
  spine:
    "**Phase one is worth doing whoever does it.** Those three items are the ones costing you appointments this month, none of them requires a rebuild, and none of them requires a relationship with us. If you take nothing else from this document, take that phase.",
  phases: [
    {
      name: "Phase one — stop the misrouting",
      timeframe: "Days, not weeks",
      outcome: "Patients searching for you find you, at the right address, under your own name.",
      steps: [
        "**Correct the federal NPPES records.** The “Miller Vein — Dearborn” record that carries a Novi address at the wrong suite, the parent entity filed under diagnostic radiology with no vein code, and Dr. Bannon's record, which currently puts her at three addresses that are not yours. Everything downstream re-pulls from here, so this goes first or nothing else holds.",
        "**Claim the four unclaimed location profiles.** Free, fast, and it is the precondition for correcting anything else about them.",
        "**Resolve the Novi review profile.** 785 reviews are attached to an address you no longer occupy; that needs to be merged or redirected to the current clinic rather than left stranded.",
      ],
    },
    {
      name: "Phase two — one definition of the practice",
      timeframe: "Weeks",
      outcome: "All eight clinics tell the internet the same thing.",
      steps: [
        "**Organization records for the seven clinics that have none**, including Holland, which has no federal footprint at all — each with the correct phlebology and vascular taxonomy rather than the generic radiology code.",
        "**Reconcile the two phone numbers and the six name variants** across the registry, the directories and the site, so aggregators stop treating one practice as several businesses.",
        "**Clean the directory layer in the right order** — the federal record first, then the publishers that read it, then the profiles that do not: Vitals, Sharecare, WebMD's duplicate practice records and the former-name profile, and the stale BBB address.",
      ],
    },
    {
      name: "Phase three — finish what the rebuild started",
      timeframe: "Ongoing",
      outcome: "The corrections hold, and the new site reaches the ceiling it is already close to.",
      steps: [
        "**Close the four engine items and the duplicate URLs** — the competing H1s, the heading-level skip, the trimmed meta description, permanent redirects from the two legacy URL patterns, and the staging host retired.",
        "**Work the gap to the national competitor** — the eleven points of search readiness and seven of AI readiness that separate you from Center for Vein Restoration, on a site that is already well built.",
        "**Monitor the citations** so a federal or directory record that drifts is caught in the month it happens rather than rediscovered in the next audit.",
      ],
    },
  ],
  punchList:
    "Smaller items go on a punch list we would walk through together rather than decide now: the third-party provider-match subdomain carrying a parallel set of physician pages, the scraper sites publishing invented composite scores against your brand name, the 4.3-star corporate-office profile, and the handful of Doximity profiles we could not disambiguate.",
  guarantee:
    "One thing we will not do is promise you a number. The work above is engineered toward a single authoritative record of all eight clinics, review equity that compounds at the addresses you actually occupy, and a site that reaches the ceiling it is already near — and it is measured afterwards by the same audit that produced this page.",
};

/* ============================================================
   04 — INVESTMENT
   ============================================================ */

export const investment = {
  title: "Investment",
  sub: "The published ladder is at inflowmd.com/pricing. This is the tier that fits eight locations, at the rate we are holding.",
  packageName: "Full Engine",
  price: "$2,000",
  per: "/ month",
  published: "$2,500",
  savings: "You save $500/mo — rate locked twelve months",
  split: [
    { label: "Published rate", value: "$2,500 / month" },
    { label: "Your rate, locked twelve months", value: "$2,000 / month" },
  ],
  subline:
    "Rate locked twelve months. Setup waived. $6,000 over the term against the published rate.",
  groups: [
    {
      title: "The website and the search work",
      items: [
        "Keep and finish the current build, or rebuild — your call, and we would argue for keeping it",
        "The four engine items, the duplicate URL patterns and the staging retirement",
        "Correct medical schema across all eight locations",
        "Content and markup work toward the national competitor's search and AI scores",
        "Hosting, security and ongoing development",
      ],
    },
    {
      title: "The presence work the rebuild could not reach",
      items: [
        "Federal NPPES correction — the organization records, the parent entity and the physician records",
        "Organization records created for the seven clinics that have none",
        "Directory and citation cleanup across the publishers that read the federal registry",
        "Google Business Profile claiming, correction and review-equity consolidation",
        "Monthly reporting in plain language — calls, forms, bookings and rankings",
      ],
    },
    {
      title: "Google Ads",
      items: [
        "Campaign build and management",
        "Landing page alignment across the eight clinics",
        "Conversion tracking",
        "Ongoing optimization and monthly reporting",
      ],
    },
  ],
  adSpendTitle: "Ad spend",
  adSpend: [
    "Ad spend is paid directly to Google, never through InflowMD. The account and its history stay yours.",
    "Across eight markets a budget is a sequencing decision rather than a single number — in practice it means starting with the two or three clinics with the most headroom and expanding as the numbers justify it.",
  ],
  limitation:
    "What this does not cover: the practice's own staff time for anything requiring credentialled access — signing into the federal registry as the authorized official, or approving a Google profile claim at an address only you can receive mail at. We prepare and submit; some of those steps need your signature rather than ours.",
  deadline: "This rate is held through October 20, 2026.",
};

export const closing = {
  title: "Where this goes next",
  paragraphs: [
    "**This audit is yours regardless of what you decide.** Phase one is worth doing whoever does it — the federal records, the four unclaimed profiles and the stranded Novi reviews are costing you patients this month, and none of it requires us. If it is useful, we are glad to walk whoever maintains your site and your listings through these findings in detail, with no expectation attached.",
    "You told us at the summit to come back in a month, and that if the new site worked but the rest of the service did not, we were next. The site works. **This document is about the rest of it** — and we would rather show you that distinction honestly than pretend the build was the problem.",
    "If the argument holds, the next step is a working session: we go through this page together with you and Deb, you tell us where we have read the practice wrong, and we put a formal proposal and a timeline in front of you.",
  ],
  signature: {
    name: "Clayton Peterson · InflowMD",
    email: "clayton@inflowmd.com",
    site: "inflowmd.com",
  },
};

export const footer = {
  line: "Prepared by InflowMD for Dr. Jeffrey Miller, Miller Vein, Michigan. Confidential. October 6, 2026.",
  methodology:
    "Site walk, engine scores, federal records, directory profiles and competitor runs all verified by hand on October 6, 2026. Speed measured by Google PageSpeed Insights, reported with both its lab and field figures; search and AI readiness analyzed by InflowMD. Federal records checked directly at npiregistry.cms.hhs.gov. Directory and review data change continuously. Where a check could not be completed from our network — Healthgrades, Facebook, most of Yelp, and Google Business Profile owner-side data — this document records it as unverified rather than estimating it.",
};
