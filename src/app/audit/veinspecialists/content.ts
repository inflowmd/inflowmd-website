/**
 * Vein Specialists — audit page copy.
 *
 * TONE, and it governs every line in this file. Patty Magnant is Head of
 * Marketing and built the search program herself. It scored 100 — the only
 * perfect search-readiness score across roughly sixty vein and vascular
 * practices we have measured. She will read every word of this.
 *
 * So: the failure here is GENERATIONAL, a function of when the platform was
 * built. Not who built it, not who maintains it, not the vendor. Nothing in
 * this file speculates about a vendor's conduct, and nothing frames the
 * rebuild as replacing her work — the rebuild exists to PROTECT it. If an
 * edit ever makes a sentence read as "you have been doing this wrong",
 * that edit is wrong.
 *
 * EVIDENCE. Every figure below traces to a named check on a named date:
 * the site walk and ads to August 27–28, 2026; the listing scans, the NPPES
 * records and the engine scores to August 28, 2026. Anything that could not
 * be verified is absent rather than estimated — there is no local pack and
 * no competitor comparison on this page for exactly that reason.
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
  name: "Vein Specialists",
  owner: "Dr. Joseph Magnant",
  domain: "weknowveins.com",
  location: "Fort Myers & Bonita Springs",
  auditDate: "August 28, 2026",
};

export const meta = {
  /** Absolute: the root layout appends "| InflowMD", and this document is his. */
  title: "Vein Specialists — Practice Audit",
  eyebrow: "Practice Audit · Prepared for Dr. Joseph Magnant",
  h1: "Vein Specialists",
  lede: "A complete look at your website and your web presence — what patients encounter on the way to you, what is already working better than anyone else in the field, and what the platform underneath it can no longer deliver.",
  metaRow: [
    { label: "Prepared by", value: "Clayton Peterson, InflowMD" },
    { label: "Date", value: "August 28, 2026" },
    { label: "Market", value: "Fort Myers & Bonita Springs" },
    { label: "Scope", value: "Site, listings, reviews, paid media, federal records" },
  ],
  verifiedLine:
    "Verified by hand: site walk and paid campaign, August 27–28, 2026. Directory scans, NPPES records and engine scores, August 28, 2026.",
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
  verdictLine: "Patients can find you. **Then they leave.**",
  scores: [
    { value: "90", label: "AI readiness" },
    { value: "100", label: "Search readiness" },
    { value: "46", label: "Speed" },
  ],
  scoresNote:
    "The 100 is the only perfect search-readiness score across roughly sixty vein and vascular practices we have measured.",
  findings: [
    "Your search and content program is the best we have measured in this field. The platform it runs on takes 15.75 seconds to deliver the main content on a phone.",
    "The screening button at the end of your interior content pages points to a page that no longer exists. The main funnel — header, hero and exit popup — works.",
    "Both federal NPI records still carry a 2008 address, and the directories that ingest them keep republishing it.",
  ],
  recommendation: {
    label: "Recommended",
    tier: "Full Engine",
    price: "$2,000",
    per: "/ month",
    note: "Summit rate, 20% off, locked twelve months.",
  },
  readMore: "Read the evidence",
};

export const criticalStrip = {
  title: "The three that cost you patients this week",
  lines: [
    "A phone visitor waits 15.75 seconds for the main content of your page to appear. Google calls anything over four seconds poor.",
    "“Start Your eVein Screening Now” at the foot of 86 interior content pages resolves to a 404 — the button positioned exactly where a convinced reader acts.",
    "Nine paid ads are running into that same destination, and the sitelinks point into that same funnel.",
  ],
};

/* ============================================================
   VERDICT
   ============================================================ */

export const verdict = {
  title: "The verdict",
  paragraphs: [
    "Start with what is working, because it is genuinely rare. Your search readiness scored **100 out of 100** — nine of nine checks verified, and the only perfect score across roughly sixty vein and vascular practices we have measured. Your content library is deep, the treatment pages are written for the patient rather than the algorithm, and you publish an `llms.txt` and an AI fact sheet, which almost nobody in this specialty does yet. That is why the AI-readiness score is 90.",
    "That work is the practice's asset, and none of what follows is a criticism of it. The finding is underneath it: the content is being delivered by a platform generation that cannot carry it. WordPress with a page builder was designed for a web that loaded on a desktop over a cable connection. Asked to serve a symptom-led education library to a 60-year-old on a phone in a parking lot, it takes **15.75 seconds** to put the main content on screen.",
  ],
  pullquote:
    "The marketing is ahead of the field. The infrastructure is a generation behind it. Everything in this document sits in that gap.",
  closing:
    "That gap is the whole story. Patients find you — the search work sees to that. Nine paid ads bring more of them. And then the page they land on takes long enough to arrive that a share of them are gone before it does. **Nothing here needs to be re-thought. It needs to be re-hosted.**",
  stats: [
    { value: "100", label: "search readiness — the only perfect score in roughly sixty practices measured", tone: "positive" },
    { value: "90", label: "AI readiness, on the strength of a published llms.txt and AI fact sheet", tone: "positive" },
    { value: "15.75s", label: "for the main content to appear on a phone — Google calls over 4s poor", tone: "critical" },
    { value: "86", label: "interior content pages whose screening button resolves to a 404", tone: "critical" },
  ] as Stat[],
  footnote:
    "Every figure on this page was verified by hand between August 27 and August 28, 2026, against live Google Business Profile data, weknowveins.com, the federal NPPES registry, Google's Ads Transparency Center and third-party directory listings.",
};

/* ============================================================
   01 — THE WEBSITE
   ============================================================ */

export const engine = {
  eyebrow: "InflowMD audit engine · measured August 28, 2026",
  headline: "Patients can find you.",
  headlineAccent: "Then they leave.",
  lede: "Two of these three scores are the best we have measured in this specialty. Search readiness is perfect and AI readiness is close to it — patients and assistants can find you, and they can read and quote what you publish. The third score is where the visit ends.",
  scores: [
    { score: 90, label: "AI readiness", note: "11 of 11 checks verified · InflowMD analysis" },
    { score: 100, label: "Search readiness", note: "9 of 9 checks verified · InflowMD analysis" },
    { score: 46, label: "Speed", note: "Google PageSpeed Insights" },
  ],
  crown:
    "**The 100 is the headline of this document.** Nine of nine checks verified, and the only perfect search-readiness score across roughly sixty vein and vascular practices we have measured. Whoever built and maintains that program is doing it better than anyone else in the field.",
  metrics: [
    { label: "Largest Contentful Paint", value: "15.75s", note: "The main content arriving. Google calls anything over 4s poor.", tone: "critical" as Tone },
    { label: "First Contentful Paint", value: "9.22s", note: "The first pixel of the page. Poor.", tone: "critical" as Tone },
    { label: "Speed Index", value: "9.22s", note: "How quickly the page fills in overall. Poor.", tone: "critical" as Tone },
    { label: "Total Blocking Time", value: "429ms", note: "Needs improvement.", tone: "warn" as Tone },
    { label: "Cumulative Layout Shift", value: "0.012", note: "Good — the page holds still while it loads.", tone: "positive" as Tone },
  ],
  translation:
    "In practice terms: a patient on a phone finds you, taps through, and the main content is not on screen for nearly sixteen seconds. Speed scores vary run to run — this site measures in the forties — but the shape does not move: the content is excellent and the delivery is slow. The discovery work is already paid for. This is the step where a share of it is thrown away.",
  platformNote:
    "The platform is WordPress with the WPBakery page builder, and images are served as WebP by Smush with base64-GIF placeholder swaps. That is a normal, well-maintained configuration of its generation, and it is consistent with the performance characteristics measured above — stated as consistent with, not as a proven cause.",
};

export const websiteSection = {
  title: "The website",
  sub: "What we found on weknowveins.com, decoded into plain English — what is working, what the platform cannot deliver, and what it costs.",
};

export const websiteFindings: FindingBlock[] = [
  {
    id: "screening-cta",
    tone: "critical",
    tag: "Verified by direct click, August 28, 2026",
    title: "The screening button at the end of your interior content pages goes to an error page",
    subhead: "“Start Your eVein Screening Now” points to /lastform/7/, which returns a 404",
    body: [
      "On interior content pages, the pre-footer band reads “Do you have the signs and symptoms of vein disease? Take our online screening today!” with a button labelled “Start Your eVein Screening Now.” That button points to /lastform/7/, and that URL returns your 404 page. We counted it on **86 interior content pages** — 44 articles, 33 patient experiences, four physician-training pages, three treatment pages and two condition pages.",
      "**The main funnel is intact, and that matters more than the fault.** The homepage header, the hero call to action and the exit popup all point to /eveinscreening/, which works and leads correctly to /eveinscreening/evaluation/. The homepage is not affected. The exit popup on these same interior pages still works, so a patient does have a route through.",
    ],
    meaning:
      "The cost is narrow and specific: the call to action positioned exactly where a convinced reader acts — at the end of a full treatment or education page, after they have read the case for treatment — is the one that fails. A patient who reads to the bottom is the most qualified visitor on the site, and that is the button they reach for.",
  },
  {
    id: "pinch-zoom",
    tone: "warn",
    title: "Pinch-zoom is switched off in the page settings",
    subhead: "maximum-scale=1 in the viewport meta tag",
    body: [
      "The viewport meta tag carries maximum-scale=1, which asks the browser not to let a visitor pinch to zoom. Your patient base skews 55 and older, and reading small type on a phone by zooming in is exactly how that group reads.",
    ],
    meaning:
      "This is a one-line accessibility improvement available on a rebuild, and it costs nothing to make. Modern iOS overrides the setting for accessibility, so the effect varies by browser — but there is no reason to ask for it in the first place.",
  },
  {
    id: "orphans",
    tone: "warn",
    title: "Two live pages are missing from the sitemap, and one of them is the funnel",
    subhead: "/eveinscreening/evaluation/ is step two of the screening flow",
    body: [
      "The full URL inventory is 160 pages, all of which return 200. Two live pages sit outside it: /eveinscreening/evaluation/ — step two of the screening funnel — and /out-of-towners/, which is linked from eleven pages including the homepage. One further page, /physician-training/advanced-provider-training-aprn-pa/, is in the sitemap but linked from nowhere on the site.",
    ],
    meaning:
      "A page missing from the sitemap is a page a search engine finds late or not at all. The funnel step is the one that matters: it is the page a patient reaches after deciding to be screened.",
  },
  {
    id: "schema-malformed",
    tone: "warn",
    title: "Fourteen pages carry a structured-data block that does not parse",
    subhead: "A control character inside a JSON string in an Article block",
    body: [
      "Your structured data is otherwise strong — every one of the 160 pages carries JSON-LD, with FAQPage on 23 pages and MedicalProcedure, MedicalTherapy and MedicalCondition across the treatment and condition library. On fourteen pages, one Article block fails to parse because of a raw control character inside a JSON string.",
    ],
    meaning:
      "A block that does not parse is a block search engines discard. The content is written and the markup is nearly right — this is a character-level repair, not a content project.",
  },
  {
    id: "duplicate",
    tone: "warn",
    title: "One treatment page exists twice under different URLs",
    subhead: "The pelvic congestion child page duplicates its parent",
    body: [
      "/vein-treatment-options/pelvic-congestion-syndrome/pelvic-congestion-syndrome-specialist/ returns 200 at its own URL and repeats the content of its parent page. Both are in the sitemap.",
    ],
    meaning:
      "Where two pages say the same thing, Google picks one and discards the other — so the page that ranks may not be the one you would choose.",
  },
  {
    id: "spanish",
    tone: "warn",
    title: "Your Spanish pages are not marked as Spanish",
    subhead: "lang=\"en-US\" on every Spanish page, no hreflang, no language switcher",
    body: [
      "Four Spanish URLs exist and the copy reads as genuinely written rather than machine-translated. All four declare lang=\"en-US\", none carries an hreflang annotation, and there is no language switcher in the header — so an English visitor cannot navigate to them and a search engine is not told they are Spanish.",
    ],
    meaning:
      "The translation work is already done and paid for. The markup that would let a Spanish-speaking patient find it is a rebuild-time detail.",
  },
  {
    id: "consent",
    tone: "warn",
    title: "No consent checkbox on the form that collects stated medical interest",
    subhead: "reCAPTCHA is present sitewide; the consent box is not",
    body: [
      "The appointment form collects name, email, phone and a set of symptom checkboxes — spider veins, swollen legs, ulcers, bleeding and others. Spam protection is in place sitewide. There is no consent checkbox and no consent language on the form itself.",
    ],
  },
  {
    id: "headings",
    tone: "warn",
    title: "Ten pages use the top-level heading for section titles",
    subhead: "One page carries eleven H1s",
    body: [
      "Every page on the site has a written, page-specific H1 and not one template default — that is the opposite of what we usually find. On ten pages, though, H1 is also used for the section headings inside the page; /vein-disease/swollen-ankles/ carries eleven.",
    ],
    meaning:
      "A page announces what it is about with one top-level heading. Eleven of them asks a search engine to choose, and it may not choose the one you would.",
  },
];

export const crowns = {
  title: "What is already right",
  lead: "These are not consolation prizes. Several of them are things we rarely see in this specialty at all.",
  items: [
    { title: "A perfect search-readiness score", detail: "9 of 9 checks verified — the only 100 across roughly sixty vein and vascular practices we have measured." },
    { title: "You publish an llms.txt and an AI fact sheet", detail: "Deliberate machine-readability work for AI assistants. Almost nobody in this field is doing it yet, and it is the clearest single piece of evidence that your marketing is ahead of the market." },
    { title: "A written H1 on every page", detail: "160 pages, no template defaults anywhere." },
    { title: "FAQPage schema on 23 pages", detail: "Alongside MedicalProcedure, MedicalTherapy and MedicalCondition markup across the treatment library." },
    { title: "Correct 301 redirects on five legacy paths", detail: "Old URLs still resolve to current pages. That is redirect discipline most practices never had." },
    { title: "reCAPTCHA sitewide, and the policies are all linked", detail: "Privacy policy, HIPAA notice of privacy practices and the non-discrimination notice are published and linked from the homepage." },
  ],
};

/* ============================================================
   PAID CAMPAIGN — inside Section 01
   ============================================================ */

export const ads = {
  eyebrow: "Google Ads Transparency Center · checked August 28, 2026",
  title: "Nine ads are bringing patients to a destination that cannot hold them",
  lead: "Nine ads were active in the thirty-day window ending August 27, 2026, out of seventeen on file all-time, under the verified advertiser ROAR! Internet Marketing.",
  praise:
    "The campaign itself is well built, and it is worth saying so specifically: it leads with insurance, it leads with the free screening rather than a phone call, it targets Cape Coral in step with the newest service-area pages on the site, and the street addresses in the local ads are correct at both offices. Someone understands this market. Nothing below is a criticism of the media buying.",
  mapCaption: "What the campaign does well · what it runs into",
  map: [
    {
      promise: "Insurance-first, screening-led creative",
      found: "The right offer for a vein patient, pointed at a site that takes 15.75 seconds to put its main content on a phone screen.",
    },
    {
      promise: "“Online Vein Screening” sitelinks",
      found: "They point into the screening funnel — the same funnel whose end-of-page button on 86 interior content pages returns a 404.",
    },
    {
      promise: "Cape Coral targeting",
      found: "Matched to the service-area pages already published. The targeting is ahead of the infrastructure, not behind it.",
    },
  ],
  advertiser: {
    title: "The ads run under an agency's verified identity",
    body: "The verified advertiser on these ads is ROAR! Internet Marketing rather than the practice's own entity. Stated as a fact about account structure and nothing more: if that engagement ever ends, the ad account and its performance history may not transfer with it. Worth confirming who holds the account, whatever else is decided.",
  },
  caveat:
    "Source: Google's Ads Transparency Center, checked August 28, 2026, under its thirty-day window. That library publishes creative, advertiser verification and display URLs only. It does not publish spend, clicks or conversions, and display URL paths are written by the advertiser — so nothing above says where these ads land. No landing page was opened.",
};

/* ============================================================
   02 — WEB PRESENCE
   ============================================================ */

export const presenceSection = {
  title: "The web presence scan",
  sub: "Your website is one surface. This is everything else a patient touches on the way to you — the federal record, the directories that read it, the reviews and the profiles.",
};

export const npi = {
  title: "The federal record is the upstream leak",
  body: "Verified directly at npiregistry.cms.hhs.gov on August 28, 2026 — the registry itself, not a mirror.",
  findings: [
    {
      id: "npi-individual",
      tone: "critical",
      tag: "Fix this first",
      title: "Both federal records still carry a 2008 address",
      body: [
        "Dr. Magnant's individual record, NPI **1588682728**, carries 1510 Royal Palm Square Blvd Ste 101 and was last updated **October 7, 2008**. The organization record, NPI **1124205349** — “VEIN SPECIALISTS AT ROYAL PALM SQUARE INC” — carries the same address and was last updated **October 1, 2008**. The practice's correct address is 1500 Royal Palm Square Blvd Ste 105.",
        "The ingestion chain is verified on both ends. Healthgrades and Sharecare still publish that exact 2008 address string today. WebMD and Vitals show the correct one.",
      ],
      meaning:
        "This is why directory-only cleanups undo themselves. Healthcare directories re-pull from the federal record on a cycle, so corrections made by hand are overwritten a few months later. Fix NPPES first, then the directories — in that order, always.",
    },
    {
      id: "npi-kammerlocher",
      tone: "critical",
      title: "Dr. Kammerlocher's record is a second, separate leak",
      body: [
        "NPI **1326003997** carries neither practice address, and its taxonomy is the generic **208600000X, “Surgery”** — with no vascular or phlebology designation.",
        "That single field has a visible downstream effect: Healthgrades files a vascular surgeon as a General Surgeon.",
      ],
      meaning:
        "A patient searching for a vein specialist and a directory sorting by specialty are both reading that taxonomy code. Correcting it is the same NPPES filing as the address, done at the same time.",
    },
  ] as FindingBlock[],
};

export const listings = {
  title: "The directories, and how the two offices are bleeding into each other",
  body: "Across both locations, roughly one in three directory listings carries an error, and the two offices' addresses are bleeding into each other.",
  stats: [
    { value: "25%", label: "of Fort Myers listings inaccurate — name 16%, address 16%, phone 8%", tone: "warn" },
    { value: "39%", label: "of Bonita Springs listings inaccurate — name 17%, address 39%, phone 17%", tone: "critical" },
    { value: "5", label: "publishers showing a Fort Myers address on the Bonita listing", tone: "critical" },
    { value: "1", label: "publisher showing Bonita's address on the Fort Myers listing", tone: "warn" },
  ] as Stat[],
  findings: [
    {
      id: "cross-contamination",
      tone: "critical",
      title: "The two offices are being merged into one by the aggregators",
      body: [
        "Five publishers show a Fort Myers address on the Bonita Springs listing, and one shows the Bonita address on the Fort Myers listing.",
        "**A likely mechanism, and stated as consistent with rather than proven:** both offices publish the same phone number, and aggregators commonly de-duplicate business records by phone. Two locations sharing one number look like one business to that logic — and the stale federal record supplies the 1510 string that keeps reappearing.",
      ],
      meaning:
        "That completes the arc: the federal record feeds directory ingestion, and directory ingestion merges the two offices. It also means a Bonita patient can be handed a Fort Myers address by a directory that is confident it is right.",
    },
    {
      id: "listing-errors",
      tone: "warn",
      title: "Specific errors live on the web right now",
      body: [
        "A listing published under an unrelated person's name. One under “Vascular Diagnostics.” A “Vein Specialties” misspelling. One listing showing only a ZIP code with no street address. One mangling the state.",
        "MapQuest, n49, ShowMeLocal and Tupalo returned scan errors on August 28, 2026 and are recorded as could-not-verify rather than as errors.",
      ],
    },
  ] as FindingBlock[],
};

export const reviews = {
  title: "Your reviews are excellent. They are just split across two profiles per office.",
  crown:
    "The rating is not the finding, and it deserves saying first: you run **4.9 essentially everywhere reviews accumulate** — Fort Myers Google 4.9 from 291 reviews, Bonita Springs Google 4.9 from 211, Birdeye 4.9 from 415, Healthgrades 4.9 from 315. Your own site cites its figure as of April 2026. That is a practice patients are actively glad they chose.",
  table: {
    caption: "Where the reviews are, August 28, 2026",
    columns: ["Profile", "Rating", "Reviews"],
    rows: [
      { cells: ["Google — Vein Specialists, Fort Myers", "4.9", "291"], highlight: true },
      { cells: ["Google — Vein Specialists, Bonita Springs", "4.9", "211"], highlight: true },
      { cells: ["Birdeye", "4.9", "415"] },
      { cells: ["Healthgrades", "4.9", "315"] },
      { cells: ["Google — practitioner profile, Fort Myers", "4.5", "74"] },
      { cells: ["Google — practitioner profile, Bonita Springs", "4.8", "18"] },
    ],
  } as TableBlock,
  findings: [
    {
      id: "duplicate-profiles",
      tone: "warn",
      tag: "A Google artifact, and quick to fix",
      title: "There is a second Google profile at each office address",
      body: [
        "Alongside the practice profiles, there is a practitioner-level Google profile at each office — Fort Myers at 4.5 from 74 reviews, Bonita Springs at 4.8 from 18 — sitting at the same addresses as the practice profiles at 4.9.",
        "This is a common Google artifact rather than anything anyone did: practitioner and practice listings are created through different paths and end up side by side. The consequence is that review equity is split between two profiles per office, and paid placements draw their rating assets from the practitioner listing while patients reading your profile see the practice listing.",
      ],
      meaning:
        "Fixable, and verifiable by you in under a minute — open Maps, search the practice name at each address, and both profiles appear. Consolidating them puts every review behind one profile per office.",
    },
    {
      id: "facebook",
      tone: "warn",
      title: "Three Facebook pages split the social proof",
      body: [
        "Three Facebook pages exist for the practice, which spreads followers and reviews across all three rather than compounding on one.",
      ],
      meaning: "Consolidation, plus deliberate review routing to a single destination per platform, is the play.",
    },
    {
      id: "healthgrades-group",
      tone: "warn",
      title: "The Healthgrades practice page is unclaimed and carries a third suite number",
      body: [
        "The Healthgrades practice-group page for Vein Specialists is explicitly unclaimed and shows 0 ratings — while Dr. Magnant's own Healthgrades profile carries 315 reviews at 4.9. The group page also introduces a third suite variant, 1510 Ste 106.",
      ],
    },
  ] as FindingBlock[],
};

export const gbp = {
  title: "Google Business Profile",
  body: "Both locations are claimed and active. **The website links on your profiles carry UTM tagging** — that is deliberate tracking discipline, it is not common, and the migration plan below commits to preserving those tagged links exactly as they are.",
  categoryNote:
    "One inconsistency, observed in Google Maps on August 28, 2026 rather than in search results: the Fort Myers profile is categorised as “Surgical center” while the Bonita Springs profile is categorised as “Vascular surgeon.” Comparable practices use Vascular surgeon. Aligning the two is a profile-settings change.",
};

export const domains = {
  title: "Domains",
  body: "eVeinscreening.com correctly 301-redirects into the main site, so there is no split authority there — and it is a good branded front door for the screening funnel, worth keeping exactly as it is. Two legacy microsites remain live on plain HTTP and still publish the 2008 address; those are worth harvesting for anything useful and then redirecting or formally retiring.",
};

/* ============================================================
   03 — THE BUILD AND THE PLAN
   ============================================================ */

export const thesis = {
  title: "The Authority Engine and the Screening Funnel",
  sub: "You already have the hard half. This is one architecture where the content library you have built feeds one screening funnel that can actually carry it.",
  intro: "Your own site already states the strategy, and states it correctly:",
  quote:
    "Symptom-led education, funnelling to a free online vein screening — agreed by the header call to action, the exit popup and the ad sitelinks alike.",
  body: [
    "The practice already knows its front door. Every surface you control points at the same place, which is more strategic coherence than most practices ever achieve. What is missing is a platform that can deliver it: the 100-point content library feeding one first-class, mobile-perfect screening funnel, rebuilt on infrastructure engineered for green Core Web Vitals.",
    "From there the same pattern extends. Geographic expansion doors follow the Cape Coral and Naples pages you have already established. AI-era answer structure extends the 90 you already score into a moat almost nobody in this specialty occupies yet — because almost nobody else has published an llms.txt at all.",
  ],
  proofPoints: [
    { label: "Approximately 45,000", detail: "vein ablation procedures since 2006" },
    { label: "The original", detail: "IAC-accredited vein center in Southwest Florida" },
    { label: "A physician-training program", detail: "the doctor other doctors learn from" },
  ],
  closing:
    "That is not a practice that needs a new story. It is a practice whose story is being told on infrastructure that cannot keep up with it.",
};

export const plan = {
  title: "What we would do",
  sub: "Ordered by what protects the most value first, not by what is most impressive.",
  spine:
    "**Protecting the 100 is the design constraint of the entire migration.** Every decision below is measured against it: nothing ships that puts the search program at risk, and the inventory that makes that guarantee possible is built before anything is rebuilt.",
  phases: [
    {
      name: "Phase one — protect and fix upstream",
      timeframe: "Weeks 1–2",
      outcome: "The federal record stops feeding bad data downstream, and the migration baseline exists.",
      steps: [
        "**Correct the federal NPPES record** — the individual record, the organization record, and Dr. Kammerlocher's taxonomy. Everything downstream re-pulls from here.",
        "**Full URL, ranking and backlink inventory.** The migration baseline: 160 URLs and everything that points at them, recorded before anything moves.",
        "**NAP correction sweep across both locations**, in the right order — federal record first, then the directories that read it.",
      ],
    },
    {
      name: "Phase two — the rebuild",
      timeframe: "Weeks 2–8",
      outcome: "The same content, delivered on infrastructure engineered for green Core Web Vitals.",
      steps: [
        "**New architecture engineered for green Core Web Vitals**, pinch-zoom restored, and a reading experience built for a patient in their sixties on a phone.",
        "**URL structure preserved, with 1:1 permanent redirects for anything that must change.** Protecting the 100 is the design constraint of the entire migration, and this is the line where that promise is kept.",
        "**The screening funnel rebuilt first-class**, with eVeinscreening.com retained as the branded front door and the end-of-page calls to action pointing where they should.",
      ],
    },
    {
      name: "Phase three — compounding",
      timeframe: "Ongoing",
      outcome: "The lead in AI readiness widens, and the review equity stops being split.",
      steps: [
        "**AI-era answer structure across the treatment library**, extending the work the llms.txt already started.",
        "**Review-equity consolidation and routing**, including the duplicate practitioner profiles at both offices.",
        "**Service-area expansion on the pattern you have already established** with Cape Coral and Naples.",
      ],
    },
  ],
  punchList:
    "The rest is a punch list we walk through together rather than a decision to make now: the two legacy microsites, hours unification across listings, the unclaimed physician and practice profiles, the schema repair and sitemap additions, curating the profile photo feed used by paid placements, documenting the UTM and tracking setup so it survives the move, and aligning the Google category between the two offices.",
  guarantee:
    "One thing we will not do is promise you a number. The rebuild is engineered toward green Core Web Vitals and a materially faster delivery of the content you already have; what it is measured against afterwards is the same audit that produced this page.",
};

/* ============================================================
   04 — INVESTMENT
   ============================================================ */

export const investment = {
  title: "Investment",
  sub: "One monthly figure. The build is included, not billed separately.",
  summitNote: "Summit pricing, held through September 12, 2026.",
  ratesNote:
    "Published rates are the ones on inflowmd.com/pricing. $500 is our floor and does not move; above it we are holding 20% for twelve months, with setup waived.",
  rationale:
    "**Why Full Engine, plainly:** a nine-ad campaign is already running into a destination that cannot hold what it brings. The rebuild and the media need to move together — fixing one without the other leaves the other paying for it.",
  /** Ownership of their reputation software was not confirmed, so this file
      says nothing about including or excluding it. Review strategy only. */
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
        "This fixes the website. It does not touch the federal NPPES record, the directory errors across both locations, the unclaimed profiles or the legacy domains — those stay as they are.",
    },
    {
      name: "Visibility",
      published: "$900",
      rate: "$720",
      badge: "20% OFF",
      savings: "You save $180/mo — rate locked 12 months",
      inherits: "Everything in Essentials, plus",
      includes: [
        "Phase One federal record and listing correction",
        "Managed citations across both locations",
        "Services menu and booking link on the Google profiles",
        "Local SEO",
        "Review strategy",
      ],
    },
    {
      name: "Growth",
      published: "$1,500",
      rate: "$1,200",
      badge: "20% OFF",
      savings: "You save $300/mo — rate locked 12 months",
      inherits: "Everything in Visibility, plus",
      includes: [
        "Custom architecture — the Authority Engine and the screening funnel, built to spec",
        "Keyword optimization",
        "2 patient-education posts per month",
        "Full structured-data layer and schema repair",
        "AI-search optimization",
        "Monthly SEO reporting",
      ],
    },
    {
      name: "Full Engine",
      published: "$2,500",
      rate: "$2,000",
      badge: "20% OFF",
      recommended: true,
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
  /**
   * Required, and the most important paragraph in the document. It is what
   * makes the difference between a rebuild that reads as a replacement and
   * one that reads as protection.
   */
  pattyTitle: "About the search program",
  patty: [
    "The search program and the content library are the practice's asset. A perfect search-readiness score is not something we found lying around — somebody built it, deliberately, and maintains it, and it is the best result across roughly sixty vein and vascular practices we have measured.",
    "That is precisely why the rebuild is scoped as protection rather than replacement. **The 100 is the constraint every migration decision is measured against**: URL structure preserved, 1:1 redirects where anything must move, the UTM tagging carried across intact, and the inventory built before a single page is rebuilt.",
    "What we are proposing to supply is the infrastructure and the paid media around that program — the delivery layer it deserves and the campaign management that keeps pace with it. Not a substitute for it.",
  ],
};

export const closing = {
  title: "Where this goes next",
  paragraphs: [
    "This audit is yours regardless of what you decide. The federal record correction in Phase One is worth doing whoever does it, the screening button is a ten-minute fix, and both duplicate Google profiles can be resolved by your own team this week.",
    "If the rebuild is interesting, the next step is a working session: we walk through this page together, you tell us where we have read the practice wrong, and we put a formal proposal and a timeline in front of you.",
  ],
  signature: {
    name: "Clayton Peterson · InflowMD",
    email: "clayton@inflowmd.com",
    site: "inflowmd.com",
  },
};

export const footer = {
  line: "Prepared by InflowMD for Dr. Joseph Magnant, Vein Specialists, Fort Myers and Bonita Springs FL. Confidential. August 28, 2026.",
  methodology:
    "Site walk and paid campaign verified by hand August 27–28, 2026. Directory scans, NPPES records and engine scores August 28, 2026. Speed measured by Google PageSpeed Insights; search and AI readiness analyzed by InflowMD. Speed scores vary between runs. Review counts, ratings and directory data change continuously.",
};
