/**
 * Vein Clinic & Med Spa — audit page copy.
 *
 * The copy arrived finished, in vein-clinic-content.md, and is transcribed
 * here VERBATIM. The block labels in that file (FINDING [critical], STAT ROW,
 * TWO-PANEL, PHASE, SLOT, WHAT THIS MEANS) are mapping instructions, not copy;
 * they became the shapes below and do not render.
 *
 * Inline **bold** and *italic* survive as markers and are rendered by the
 * RichText helper in page.tsx — the source file uses them to carry emphasis
 * that is load-bearing in several sentences.
 *
 * TONE. Every finding here is framed as an artifact of the platform era, not
 * of anyone's work — the client is two months into an engagement with another
 * vendor. Nothing in this file attributes a finding to a build date, a
 * redesign, or a vendor, and nothing calls the site broken or neglected. If a
 * future edit needs to say something sharper, say it about WordPress.
 */

export type Tone = "critical" | "warn" | "positive";

export type Stat = { value: string; label: string; tone: Tone };

export type FindingBlock = {
  id: string;
  tone: Tone;
  /** Optional eyebrow badge, e.g. "Highest-leverage listing fix". */
  tag?: string;
  title: string;
  subhead?: string;
  /** One or more body paragraphs. */
  body: string[];
  /** The inset "plain English" sub-block. */
  meaning?: string;
  /** A table rendered inside the finding, above WHAT THIS MEANS. */
  table?: TableBlock;
};

export type TableBlock = {
  caption?: string;
  columns: string[];
  rows: { cells: string[]; highlight?: boolean }[];
};

export const practice = {
  name: "Vein Clinic & Med Spa",
  owner: "Dr. Sharath Reniguntala",
  domain: "veinandmedspa.com",
  location: "Santa Ana & Orange County",
  auditDate: "August 27, 2026",
};

export const meta = {
  title: "Vein Clinic & Med Spa — Practice Audit | InflowMD",
  eyebrow: "Practice Audit · Prepared for Dr. Sharath Reniguntala",
  h1: "Vein Clinic & Med Spa",
  lede: "A complete look at your website and your web presence — what patients actually encounter when they go looking for you, and what it would take to make that experience match the care you deliver.",
  metaRow: [
    { label: "Prepared by", value: "Clayton Peterson, InflowMD" },
    { label: "Date", value: "August 27, 2026" },
    { label: "Market", value: "Santa Ana & Orange County" },
    { label: "Scope", value: "Site, listings, reviews, local search" },
  ],
};

export const nav = [
  { id: "verdict", label: "Verdict" },
  { id: "website", label: "Website" },
  { id: "presence", label: "Web Presence" },
  { id: "plan", label: "The Build & Plan" },
  { id: "investment", label: "Investment" },
];

/**
 * The one-screen summary.
 *
 * Everything below it is evidence for a skeptical reader; this is the part
 * for a doctor who reads one screen and decides. It carries the verdict line,
 * the three scores, the three findings that actually change his week, and the
 * price — and it has to stay inside 900px at 1440, which is the only reason
 * it is this terse.
 */
export const summary = {
  eyebrow: "The short version",
  verdictLine:
    "You are not losing patients because anyone did bad work. You are losing them because of **when** your web presence was built.",
  scores: [
    { value: "91", label: "AI readiness" },
    { value: "94", label: "Search readiness" },
    { value: "59", label: "Speed" },
  ],
  scoresNote: "Patients and assistants can find you. The page is what loses them.",
  findings: [
    "Roughly twenty service links on your homepage all lead to the same contact form — the real pages exist and nothing points at them.",
    "The online scheduler you already pay for is linked nowhere on the current site. The form offers a callback instead.",
    "Four different phone numbers for your practice are live on the web, and the federal record that feeds the directories is one of the wrong ones.",
  ],
  recommendation: {
    label: "Recommended",
    tier: "Full Engine",
    price: "$2,000",
    per: "/ month",
    published: "$2,500",
    note: "Summit rate, 20% off, locked twelve months.",
  },
  readMore: "Read the evidence",
};

/**
 * The strip above the findings.
 *
 * The six criticals used to render open, and they were most of Section 01's
 * height. Collapsed, they risked reading as a list of headlines nobody opens
 * — so the worst of them are stated here as plain sentences, no cards, no
 * chrome. Same information above the fold, a fraction of the height.
 */
export const criticalStrip = {
  title: "The four that cost you patients this week",
  lines: [
    "Your homepage does not link to your own website — around twenty service links resolve to a contact form.",
    "You are paying for an online scheduler that no patient can reach from the current site.",
    "Three wrong phone numbers are live on the web right now, and the federal NPI record is the one feeding them.",
    "Your foam sclerotherapy page contains no foam sclerotherapy content, so Google keeps one page and discards the other.",
  ],
};

/* ============================================================
   VERDICT
   ============================================================ */

export const verdict = {
  title: "The verdict",
  paragraphs: [
    "You are not losing patients because anyone did bad work. You are losing them because of **when** your web presence was built, not **who** built it.",
    "A WordPress site is a stack of decisions made at different times by different people. Nothing in the platform forces those decisions to agree with each other. Add a page, and nothing links to it. Redesign the front, and the back stays where it was. Change the phone number, and eighteen directories keep the old one. There is no single source of truth — so over three or four years, a practice site quietly becomes several sites wearing one domain name, and a practice's listings quietly become several businesses wearing one name.",
  ],
  pullquote:
    "Both of those things have happened here. Neither is a mistake anyone made. Both are what the platform does when left running long enough.",
  closing:
    "The encouraging part is what we found underneath it. Your Google profile is claimed, actively managed, and collecting fresh reviews — you reply to patients, and it shows. Roughly six thousand words of genuinely good service copy already exist. A working online scheduler is already paid for and running. **The assets are here. The architecture is what is failing to connect them.**",
  stats: [
    {
      value: "3",
      label: "generations of website live on one domain, invisible to each other",
      tone: "critical",
    },
    {
      value: "4",
      label: "different phone numbers for your practice, live on the web right now",
      tone: "critical",
    },
    {
      value: "47",
      label: "Google reviews — against 273 for the leader in your own search results",
      tone: "warn",
    },
    {
      value: "6,000",
      label: "words of service copy already written, currently unreachable",
      tone: "positive",
    },
  ] as Stat[],
  footnote:
    "Every figure on this page was verified by hand on August 27, 2026, against live Google Business Profile data, your website, and eighteen third-party directory listings.",
};

/* ============================================================
   01 — THE WEBSITE AUDIT

   The scorecard slot is FILLED: these are real numbers from our own engine,
   measured against veinandmedspa.com. The frame is the one the numbers
   themselves make — discovery is solid, delivery is not.
   ============================================================ */

/**
 * TODO — reconcile with the live engine, in a session of its own.
 * These are the figures the page shipped with (speed 59, LCP 12.75s). A live
 * run on August 27, 2026 returned 53 / 10.91s against the same site. Both are
 * real measurements of a site whose speed genuinely varies run to run; what
 * this page needs is one dated figure with a variance note, not a silent
 * swap. Deliberately left alone here — changing a number a prospect may have
 * already read is not a drive-by edit.
 */
export const engine = {
  eyebrow: "InflowMD audit engine · measured August 27, 2026",
  headline: "Patients can find you.",
  headlineAccent: "Then they leave.",
  lede: "Two of these three scores are strong. Search and AI readiness are doing their job — patients and assistants can find you and understand what you treat. The third is where the visit ends: the page takes long enough to arrive that most phones have given up before it does.",
  scores: [
    { score: 91, label: "AI readiness", note: "Assistants can read and quote your pages" },
    { score: 94, label: "Search readiness", note: "Patients can find you in search" },
    { score: 59, label: "Speed", note: "What happens once they arrive" },
  ],
  metrics: [
    {
      label: "Largest Contentful Paint",
      value: "12.75s",
      note: "Google calls anything over 4s poor. This is the main content arriving.",
      tone: "critical" as Tone,
    },
    {
      label: "First Contentful Paint",
      value: "6.12s",
      note: "Six seconds of blank screen before the first pixel of your page.",
      tone: "critical" as Tone,
    },
  ],
  translation:
    "In practice terms: a patient searching on a phone finds you, taps through, and stares at nothing for six seconds. The page is not finished arriving for nearly thirteen. The discovery work is already done — this is the step where it is being thrown away.",
};

export const websiteSection = {
  title: "The website audit",
  sub: "What we found on veinandmedspa.com, decoded into plain English — what it means and what it costs you.",
};

export const websiteFindings: FindingBlock[] = [
  {
    id: "homepage-links",
    tone: "critical",
    title: "Your homepage does not link to your website",
    subhead: "Roughly twenty service links on the homepage all lead to the same contact form",
    body: [
      "“Varicose Vein Treatment.” “Endovenous Laser Ablation.” “Sclerotherapy.” “Foam Sclerotherapy.” “Leg Swelling & Heaviness.” “Meet Dr. Reniguntala.” “Botox & Injectables.” “Medical-Grade Facials.” Every one of those links on your homepage resolves to /contact/. Meanwhile, real pages for most of those topics *do exist* on your site — a full varicose vein page, a sclerotherapy page, an ablation page, a leg swelling page, an insurance verification page, your bio. They are simply not linked from the front door.",
    ],
    meaning:
      "A patient researching varicose veins clicks “Varicose Vein Treatment,” expecting to learn something, and is handed a form instead. They have one question answered — “do they want my phone number?” — and none of the ones they actually came with. Most leave. Google draws the same conclusion: pages nothing links to are pages Google treats as unimportant, so your best content is invisible to search as well as to patients.",
  },
  {
    id: "scheduler",
    tone: "critical",
    title: "You are paying for online scheduling that no patient can find",
    subhead: "A live booking widget runs on your older pages and is linked nowhere on the current site",
    body: [
      "Your legacy service pages carry “Book Consult” buttons wired to a working third-party scheduling widget — a real one, with your practice key in it. The current homepage does not link to it anywhere. In its place is an eight-field form whose output is a request for a callback.",
    ],
    meaning:
      "The difference between “book Thursday at 2:00” and “we will call you back” is the difference between a patient on your schedule and a patient on your staff's follow-up list. Roughly half of the second group never converts. You already own the tool that fixes this; the current site just cannot see it.",
  },
  {
    id: "foam",
    tone: "critical",
    title: "Two of your pages tell the same story, and one of them is the wrong story",
    subhead: "Your foam sclerotherapy page contains no foam sclerotherapy content",
    body: [
      "Your homepage promotes “Foam Sclerotherapy — an advanced foam technique for larger, deeper underlying veins.” The page behind that name is a word-for-word duplicate of your standard sclerotherapy page. The word “foam” does not appear in its body copy at all.",
    ],
    meaning:
      "Two costs. A patient who specifically wants to understand foam treatment reads the wrong page and quietly concludes you may not do it. And Google, seeing two identical pages, picks one and discards the other — so you compete for foam sclerotherapy searches with a page that never mentions foam.",
  },
  {
    id: "headlines",
    tone: "warn",
    title: "Five pages share one headline, and it is the wrong headline",
    subhead:
      "“Meet our Team” is the main heading on your ablation, sclerotherapy, foam, leg swelling, and about pages",
    body: [
      "The page headline — the single strongest on-page signal Google reads to decide what a page is about — was never overwritten from the template default on five pages.",
    ],
    meaning:
      "You are asking Google to rank a page for “endovenous laser ablation” while the page announces itself as “Meet our Team.” This is a fifteen-minute fix on a rebuild and one of the clearest cases of good content held back by mechanics rather than substance.",
  },
  {
    id: "credentials",
    tone: "warn",
    title: "Your credentials are the softest thing on the site",
    subhead: "“Board-certified” appears repeatedly; the board is never named",
    body: [
      "Your about page runs under three hundred words. It says “board-certified physician” without naming the certifying board, and no ABVLM, ACP, or RPVI credential appears anywhere on the site. Your homepage claims “14+ years of focused vascular practice” while your about page says “over 10 years.” For comparison, every competitor we reviewed at your size or above names their boards explicitly, and the strongest of them lead with them.",
    ],
    meaning:
      "Vein patients comparison-shop credentials harder than almost any other elective specialty, because the field is genuinely crowded with varying levels of training. An unnamed board reads as a weaker claim than a modest but specific one. This is not a content problem — it is a page that was never given room to make your case.",
  },
  {
    id: "proof",
    tone: "warn",
    title: "The proof exists and the site does not show it",
    subhead:
      "Zero vein before-and-afters, zero testimonials on the main site, and 87 reviews shown nowhere",
    body: [
      "There is not a single before-and-after image anywhere in your vein content — the most-requested proof asset in the entire category. Four real, specific, named patient testimonials do exist on your site, sitting on two pages nothing links to. Meanwhile your main service pages render a heading that reads “Clients Success Stories” above an empty space. Your 47 Google reviews and 40 Yelp reviews appear nowhere on the website at all.",
    ],
    meaning:
      "You are currently displaying an empty container where your social proof should be, while your actual social proof sits one click out of reach. Patients read the empty container as an answer.",
  },
  {
    id: "xerf",
    tone: "warn",
    title: "Your XERF results are labeled in a way that could bite you",
    subhead: "“Real XERF results — actual patients” sits above images credited to two other physicians",
    body: [
      "The gallery heading reads “Real XERF results” and “Actual patients treated with XERF.” The captions beneath read “Courtesy of Dianne Quibell, MD” and “Courtesy of Jordan Wang, MD,” with a disclosure that the images come from the manufacturer.",
    ],
    meaning:
      "The disclosure is there and it is the right instinct — but the heading above it invites a reader to believe these are your outcomes. In an aesthetics context that is the kind of wording that draws complaints. A one-line rewrite to “Representative XERF results from the manufacturer's clinical library” removes the exposure entirely and costs nothing.",
  },
  {
    id: "weight-loss",
    tone: "warn",
    title: "An entire service line is invisible",
    subhead: "Medical weight loss: roughly 3,000 words written, zero navigation",
    body: [
      "Your homepage's search description tells Google you offer “vein treatment, weight loss, and aesthetics.” Weight loss appears nowhere in your navigation, your homepage body, or your service cards. Two full pages of GLP-1 and medical weight loss content exist, unlinked.",
    ],
    meaning:
      "This is the highest-margin, fastest-growing cash-pay line in aesthetic medicine right now, it is already written, and it is currently a secret. Either promote it properly or take it out of the description — but leaving it half-announced is the one option that pays nothing.",
  },
  {
    id: "schema",
    tone: "warn",
    title: "Google has no structured way to read your practice",
    subhead: "No schema markup of any kind on any page",
    body: [
      "There is no structured data on your site — no MedicalBusiness, no Physician, no MedicalProcedure, no FAQPage. Schema is the machine-readable layer that tells Google explicitly what a page is, who the physician is, what is treated and where.",
    ],
    meaning:
      "Without it, Google is guessing from your text. With it, you become eligible for the expanded search results your competitors are showing. Your homepage and five service pages already contain well-formed question-and-answer blocks, which means FAQ markup here is close to free — the content is written, it just is not tagged.",
  },
];

/**
 * The paid campaign, filed beside the dead homepage links because it is the
 * same failure seen from the other side: the promises are good, and the site
 * cannot keep them.
 *
 * ACCURACY. Everything here comes from Google's public Ads Transparency
 * Center, checked once, on August 27, 2026. That library shows creative,
 * advertiser verification and display URLs — and nothing else. So this block
 * says nothing about where the ads land (advertisers write those path
 * segments freely and we have not opened one), nothing about spend, clicks or
 * conversions (Google does not publish them), and nothing about whether the
 * ads are live today (the library retains recently stopped ads and we did not
 * confirm the date filter). If any of those claims ever appear here, they did
 * not come from this source.
 */
export const ads = {
  eyebrow: "Google Ads Transparency Center · checked August 27, 2026",
  title: "You are paying Google to make four promises the site cannot keep",
  lead: "Four ads are on file under the verified advertiser “Sharath Reniguntala MD Inc.” They lead with insurance verification, a free screening, board certification, and Spanish-language service. The sitelinks read “Check Your Insurance Now,” “View All Vein Treatments,” and “Meet Our Vein Specialist.”",
  praise:
    "The campaign is good, and it is worth saying so plainly: insurance-first, symptom-led, and offering Spanish is an accurate read of a vein patient in Orange County. Nothing here is a criticism of the advertising. The failure is the destination, not the campaign.",
  mapCaption: "What each ad promises · what this audit found",
  map: [
    {
      promise: "“Check Your Insurance Now”",
      found: "Your real insurance verification form sits on a page the current site does not link to. “Verify Insurance” opens a list of carrier logos instead.",
    },
    {
      promise: "“View All Vein Treatments”",
      found: "The treatment links on your homepage resolve to /contact/. The pages behind those names exist and nothing points at them.",
    },
    {
      promise: "A free screening, booked",
      found: "The working scheduler you already pay for is linked nowhere on the current site. The form offers a callback instead.",
    },
    {
      promise: "“Meet Our Vein Specialist”",
      found: "The bio runs under three hundred words and never names the certifying board — the single claim a vein patient shops hardest.",
    },
  ],
  variants:
    "Two smaller things worth catching. One ad spells the practice “Veins Clinic & MedSpa” — a sixth variant of your name, and the only one you are paying for. Another claims 14+ years of experience, against the about page's “over 10.”",
  caveat:
    "Source: Google's Ads Transparency Center, checked August 27, 2026. That library publishes creative, advertiser verification and display URLs only. It does not publish spend, clicks or conversions, and it retains ads that recently stopped running — so this is what is on file, not a statement about today's spend. We have not opened a landing page, so nothing above says where these ads arrive.",
};

export const alsoFound: TableBlock = {
  caption: "Also found, and worth naming briefly",
  columns: ["Item", "What we found"],
  rows: [
    {
      cells: [
        "Search descriptions",
        "Several are auto-generated. One page pushes your own address block into the Google result: “Address 431 N Tustin Ave… Call Now 949-272-9919…”",
      ],
    },
    {
      cells: [
        "Page titles",
        "Most end in the raw system default “- Vein Clinic Ca” with no city and no service qualifier",
      ],
    },
    {
      cells: [
        "Image descriptions",
        "Empty or missing on your most image-dependent page — an SEO loss and an accessibility failure",
      ],
    },
    {
      cells: [
        "Insurance path",
        "“Verify Insurance” opens a list of carrier logos. The real verification form lives on a page the current site does not link to",
      ],
    },
    {
      cells: ["Blog", "Exists, is empty, and sits beside a newsletter signup with no newsletter"],
    },
    {
      cells: [
        "Form protection",
        "No spam protection and no consent checkbox on the main contact form, which collects name, phone, email and stated medical interest",
      ],
    },
    {
      cells: ["Legal links", "Privacy policy and terms are not linked from the current footer"],
    },
    {
      cells: [
        "Address formatting",
        "Three different spellings of your own street address across your own pages",
      ],
    },
  ],
};

/* ============================================================
   02 — THE WEB PRESENCE SCAN
   ============================================================ */

export const presenceSection = {
  title: "The web presence scan",
  sub: "Your website is one surface. This is everything else a patient touches on the way to you — Google, directories, reviews — most of which you have never been shown.",
};

export const gbp = {
  title: "Google Business Profile",
  body: "This is the strongest part of your web presence, and it is worth saying plainly: **your profile is claimed, accurate, and actively tended.** The address, suite, phone number and website all match your site. Accessibility, parking, payment and appointment details are filled in. You reply to reviews — we found owner responses thanking patients by name. Reviews are arriving within the last two months. Somebody is doing this work, and it is the reason you appear in the local map results at all.",
  stats: [
    { value: "4.4", label: "star rating, from 47 Google reviews", tone: "positive" },
    { value: "Yes", label: "claimed, verified, and responding to reviews", tone: "positive" },
    { value: "0", label: "services listed on the profile", tone: "warn" },
    { value: "0", label: "booking link on the profile", tone: "warn" },
  ] as Stat[],
  findings: [
    {
      id: "category",
      tone: "warn",
      tag: "Highest-leverage listing fix",
      title:
        "Google has you filed as a “Medical clinic.” Your competitors are filed as “Vascular surgeon.”",
      body: [
        "Of the seven vein practices competing with you across Orange County, five are categorized as *Vascular surgeon* or *Surgeon*. You are categorized as *Medical clinic* — the broadest, least specific option available.",
        "The same misclassification appears one level deeper. Your NPI registration — the federal record most healthcare directories pull from automatically — lists you under *General Practice* and *Family Medicine*, with no vascular or phlebology designation at all. That single record is why Healthgrades calls you a vascular surgeon, WebMD calls you a family physician, and Google is left guessing.",
      ],
      meaning:
        "Category is one of the top three factors deciding which businesses Google shows for “varicose vein treatment near me.” You are competing in a specialty search from a general-practice category. Correcting the category and the federal taxonomy is inexpensive, and it is upstream of nearly every other listing problem below.",
    },
    {
      id: "profile-gaps",
      tone: "warn",
      title: "Two things missing from the profile that your competitors have",
      body: [
        "Your profile carries no **services menu** — the list of treatments that appears directly in your Google panel and feeds treatment-specific searches. And it carries no **booking link**. Advanced Vein Center in Orange shows a “Book online” button right in their Google result; a patient can schedule without ever visiting their website. You already own a scheduler that could sit in that same slot.",
      ],
    },
  ] as FindingBlock[],
};

export const listings = {
  title: "Business listings — the part nobody has been minding",
  body: "We found your practice on eighteen directories. Here is the problem: they do not agree with each other, and nothing is keeping them in sync.",
  stats: [
    { value: "4", label: "different phone numbers published for your practice", tone: "critical" },
    { value: "5", label: "different versions of your business name in circulation", tone: "critical" },
    { value: "2", label: "live websites splitting your traffic and authority", tone: "critical" },
    { value: "0", label: "of your physician profiles have been claimed", tone: "warn" },
  ] as Stat[],
  findings: [
    {
      id: "phones",
      tone: "critical",
      tag: "Losing you calls today",
      title: "Three wrong phone numbers are live on the web right now",
      body: [],
      table: {
        columns: ["Number", "Where it appears", "Status"],
        rows: [
          {
            cells: [
              "(949) 272-9919",
              "Your site, Google, Yelp, Yahoo, WebMD, Vitals, Chamber",
              "Correct",
            ],
            highlight: true,
          },
          { cells: ["(714) 664-0225", "YellowPages", "Wrong"] },
          { cells: ["(949) 531-6344", "Doximity, NPI federal registry", "Wrong"] },
          { cells: ["(949) 783-8560", "VeinDirectory", "Wrong"] },
        ],
      },
      meaning:
        "Two costs, and the second is worse than the first. A patient who finds the wrong number simply does not reach you — that is the obvious one. The quieter one: Google uses phone-number agreement across the web as a confidence test. When it finds four numbers, it trusts all of them less, and a practice it trusts less ranks lower. This is one of the cheapest ranking gains available to you.",
    },
    {
      id: "npi",
      tone: "critical",
      title: "The federal record is the upstream leak — and it lists a different city",
      body: [
        "Your NPI registry entry carries an address in **Orange, California**, not Santa Ana, along with the (949) 531-6344 number. Healthcare directories ingest that record automatically and refresh from it on a cycle.",
      ],
      meaning:
        "Cleaning up Doximity, WebMD, Vitals and Healthgrades by hand will work for a few months and then quietly undo itself, because they will re-pull from the federal record and overwrite the corrections. Fix NPPES first, then the directories. This is the single most common reason listing cleanups fail to hold.",
    },
    {
      id: "previous-physician",
      tone: "critical",
      title: "One directory still names the previous physician at your address",
      body: [
        "VeinDirectory — a site vein patients specifically use to find vein doctors — lists your address under **S. Myron Goldstein, MD**, with a wrong phone number and no suite. Your own Google description notes the practice has been under new ownership since March 2025, which makes this listing roughly eighteen months out of date.",
      ],
    },
    {
      id: "name",
      tone: "warn",
      title: "Your name is five different businesses as far as the internet is concerned",
      body: [
        "Vein Clinic CA & Med Spa · Vein Clinic & Med Spa · Vein Clinic CA · Vein Clinic Ca · VEIN CLINIC & MED SPA",
        "Your website brands as “Vein Clinic CA & Med Spa.” Your Google profile says “Vein Clinic & Med Spa.” Your two most important properties do not match each other. Three listings drop Suite B entirely, which Google reads as an address conflict in a multi-tenant medical building.",
      ],
    },
    {
      id: "two-sites",
      tone: "warn",
      title: "You have two live websites",
      body: [
        "Alongside veinandmedspa.com, a second site — vccmedspa.com, in Spanish — is still live and indexed, and YellowPages points patients to it. Whatever authority that domain has earned is not helping the domain you are investing in, and a patient landing on the wrong one gets a different, older impression of your practice.",
      ],
    },
    {
      id: "unclaimed",
      tone: "warn",
      title: "Nobody has claimed a single physician profile",
      body: [
        "WebMD, Vitals, Sharecare and Healthgrades all still display an active “claim this profile” prompt on your listing. Claiming is free on all four. Until you do, you cannot correct your specialty, add your credentials, or respond to a review on any of them.",
      ],
    },
    {
      id: "unmanaged",
      tone: "positive",
      tag: "Diagnosis",
      title: "None of this is managed — and that is genuinely good news",
      body: [
        "We checked for the fingerprints of a listings-management service and found none. There is no presence across the syndication network those services push to. Your directory descriptions are all different from one another rather than one identical text repeated. A search on your own phone number returns almost no business citations at all.",
        "What that means is that everything above is **drift, not damage**. These listings were created by aggregators scraping each other over several years, not by anyone making choices. Nothing has to be undone. It has to be claimed, corrected once, and then held in place.",
      ],
    },
  ] as FindingBlock[],
};

export const reviews = {
  title: "Your reviews — and where they are stranded",
  table: {
    columns: ["Platform", "Reviews", "Rating", "Most recent", "Can you reply?"],
    rows: [
      {
        cells: ["Google", "47", "4.4", "2 months ago", "Yes — and you do"],
        highlight: true,
      },
      {
        cells: ["Yelp", "40", "4.5", "Unchanged since at least February", "Yes"],
      },
      { cells: ["Vitals", "3", "4.7", "—", "No — unclaimed"] },
      { cells: ["Sharecare", "1", "5.0", "—", "No — unclaimed"] },
      { cells: ["WebMD", "0", "—", "—", "No — unclaimed"] },
      { cells: ["Healthgrades", "0", "—", "—", "No — unclaimed"] },
    ],
  } as TableBlock,
  closing:
    "Ninety-one reviews across the web, and **not one of them appears on your website.** Your Yelp page has been flat at forty reviews since at least February — six months without a new one — while Google keeps moving. Google is where your patients are actually writing, and Google is what decides local search. That is the right place for the effort; it just needs a system behind it rather than goodwill.",
};

/* ============================================================
   03 — WHAT YOUR MARKET LOOKS LIKE
   ============================================================ */

/**
 * The market read now lives INSIDE the web presence scan — review counts and
 * Google categories are presence data, and running them as their own section
 * asked the reader to hold the same competitors in mind twice.
 *
 * The two tables merged for the same reason: four of the seven practices
 * appeared in both, at different widths. One table now carries the local pack
 * rank where there is one, and the wider field where there is not.
 */
export const marketSection = {
  title: "What your market looks like",
  sub: "These are the practices Google shows next to you, with the numbers a patient sees before they see anything else about you.",
  table: {
    /**
     * The local pack, and only the local pack. Three practices from the wider
     * county field used to sit here carrying a dash in every column that made
     * this table worth reading — rows padded with absence. With them gone the
     * rank column has nothing to distinguish either, so it went too.
     */
    caption: "Google's local results for “varicose vein treatment Santa Ana,” today",
    columns: ["Practice", "Reviews", "Rating", "Google category", "Notes"],
    rows: [
      {
        cells: ["The Vein Place — Santa Ana", "23", "4.2", "Vascular surgeon", "1.5 miles away; publishing weekly, names no physician anywhere"],
      },
      {
        cells: ["Vein Clinic & Med Spa", "47", "4.4", "Medical clinic", "Vein plus med spa plus weight loss"],
        highlight: true,
      },
      {
        cells: [
          "Vital Vein & Vascular — Dr. Christopher Yi, Tustin",
          "273",
          "5.0",
          "Vascular surgeon",
          "The volume leader in your market",
        ],
      },
      {
        cells: ["Advanced Vein Center — Orange", "94", "4.9", "Surgeon", "Booking directly from Google; no blog at all"],
      },
      {
        cells: ["Vascular & Interventional Specialists of OC", "—", "—", "—", "—"],
      },
    ],
  } as TableBlock,
  readingTitle: "What the numbers actually say",
  findings: [
    {
      id: "rating",
      tone: "warn",
      title: "Your rating is the outlier, not your review count",
      body: [
        "Forty-seven reviews is a respectable base for a practice under new ownership since March 2025. But your 4.4 sits at the bottom of a field clustered between 4.6 and 5.0, with two practices at a perfect 5.0. In a category where patients compare four or five clinics side by side, a four-tenths gap is visible at a glance and is doing more damage than the volume gap.",
      ],
    },
    {
      id: "nearest",
      tone: "positive",
      tag: "Opening",
      title: "Your nearest competitor has a strong web strategy and a glaring weakness",
      body: [
        "The Vein Place, a mile and a half away, currently outranks you. They publish consistently, they book online, and one of their recent articles argues that patients should look past Yelp ratings when choosing a clinic. They also have **23 reviews at 4.2** — below you on both counts — and, across their entire website and every directory listing we checked, **they never name their physician.**",
        "You have a named, board-credentialed, experienced physician and better patient feedback. They are simply better organized on the web. That is the entire gap, and it is the most closeable gap on this page.",
      ],
    },
    {
      id: "content-lane",
      tone: "warn",
      title: "The content lane in your market is genuinely open",
      body: [
        "Advanced Vein Center — the practice most similar to you in size and structure — has 94 reviews, an online scheduler, and **no educational content at all**. Neither do you. Vein disease is the most explained-away, misunderstood condition in elective medicine; patients spend weeks reading before they call. In your immediate market, almost nobody is doing that reading for them.",
      ],
    },
  ] as FindingBlock[],
};

/* ============================================================
   04 — THE DUAL BUILD
   ============================================================ */

export const dualBuild = {
  title: "The dual build",
  sub: "Your practice is named for the exact thing we build best. That is not a coincidence we are stretching — it is the reason this project is straightforward.",
  intro: "Your homepage already says the true thing, and says it well:",
  quote:
    "One clinic, two kinds of care. The name says Vein Clinic & Med Spa. One side restores how your legs feel and function; the other refines how you look.",
  body: [
    "That is the strategy, stated correctly, already in your own words. What is missing is a site built the way that sentence describes. Right now both halves of your practice funnel into one contact form — a patient with painful, swollen legs and a patient who wants Botox take the identical path and receive the identical experience.",
    "They are not the same patient. They are barely the same business.",
  ],
  panels: [
    {
      kicker: "The medical side",
      title: "Vein care",
      lead: "Insurance-covered. Symptom-driven. A long, anxious research cycle before anyone calls.",
      points: [
        "Patients arrive with symptoms, not a diagnosis — aching, heaviness, swelling, restless legs — and often no visible veins at all",
        "They need education first: what is happening in the leg, why it progresses, what an ultrasound shows",
        "The decisive question is almost always *“will insurance cover this?”*",
        "The conversion is a screening or an insurance verification, not a purchase",
      ],
      buildLabel: "What we build",
      build:
        "a symptom-first education and screening funnel — a symptom checker that meets patients where they actually are, procedure explainers written for a nervous reader, a live insurance verification form, and ultrasound and consultation booking as the primary action.",
    },
    {
      kicker: "The aesthetic side",
      title: "Med spa",
      lead: "Cash-pay. Outcome-driven. A short, visual, comparison-shopping cycle.",
      points: [
        "Patients arrive knowing roughly what they want and shopping who does it well",
        "They decide on *proof* — before-and-afters, real faces, real results",
        "The decisive question is *“what does it cost and when can I come in?”*",
        "The conversion is a booked appointment, immediately",
      ],
      buildLabel: "What we build",
      build:
        "a results-led showcase — a real before-and-after gallery of your own patients, transparent per-service pricing (your XERF pricing is already written and already hidden), and direct booking with no callback step in between.",
    },
  ],
  closing: [
    "**One site, two architectures, one physician.** Shared design language, shared booking system, shared reporting — two completely different journeys underneath. The medical side earns trust slowly and converts on a screening. The aesthetic side earns trust visually and converts on a booking. And the crossover between them is real revenue: a vein patient in your chair for six months of treatment is the most qualified aesthetics prospect you will ever have, and right now nothing on your site makes that introduction.",
    "Your medical weight loss line becomes the third door, properly built rather than hidden in a search description.",
  ],
  footnote:
    "This is the build we have done repeatedly for vein-and-aesthetics practices, and it is the reason your name caught our attention in the first place.",
};

/* ============================================================
   05 — WHAT WE WOULD DO
   ============================================================ */

export const plan = {
  title: "What we would do",
  sub: "Ordered by what returns fastest, not by what is most impressive.",
  /**
   * Five per phase, deliberately. Twenty-one numbered items read as a bill of
   * work rather than a plan, and the tail of each phase was the part nobody
   * argues about anyway. The rest is not dropped — it is the punch list, and
   * it is named as such below.
   */
  punchList:
    "Twelve more sit behind these nine — claiming the four physician profiles, settling on one business name and address format, resolving the second website, the XERF gallery heading, the weight-loss door, migrating and repairing the existing pages, your bio, moving the scheduler to the front, surfacing the reviews and testimonials, the structured-data layer, AI-search visibility and monthly reporting. That is a punch list we walk through together, not a decision to make now.",
  phases: [
    {
      name: "Phase one — stop the leaks",
      timeframe: "Weeks 1–2",
      outcome: "The calls reach you, and Google stops filing you as a general clinic.",
      steps: [
        "**Correct the federal NPI record first.** Right address, right phone, and a vascular or phlebology taxonomy added. Everything downstream re-pulls from here, so this goes first or the rest will not hold.",
        "**Fix the three wrong phone numbers** on YellowPages, Doximity and VeinDirectory, and get the previous physician's name off your address.",
        "**Recategorize the Google profile** from “Medical clinic” to the vascular category your competitors use, add a full services menu, and attach a booking link to the profile.",
      ],
    },
    {
      name: "Phase two — the dual build",
      timeframe: "Weeks 2–8",
      outcome: "One architecture, two journeys, and something to book at the end of each.",
      steps: [
        "**Rebuild on a modern architecture** — Next.js on Vercel, from a component system, so that every page shares one source of truth for your name, address, phone, navigation and calls to action. The specific failure at the center of this audit — a homepage that does not link to its own site — cannot occur in this architecture. There is no version of it where content exists and nothing points at it.",
        "**Build the vein side as a screening funnel** — symptom-first entry, procedure education, live insurance verification, ultrasound booking.",
        "**Build the med spa side as a results showcase** — your own before-and-afters, per-service pages for Botox, injectables, skin rejuvenation and facials, published pricing, direct booking.",
      ],
    },
    {
      name: "Phase three — compounding",
      timeframe: "Ongoing",
      outcome: "The corrections hold themselves in place, and the rating starts moving.",
      steps: [
        "**Managed citations.** Your listings are corrected once and then held in place automatically, so this never drifts back.",
        "**Review generation.** A system that asks every satisfied patient at the right moment. Moving 4.4 to 4.8 and 47 reviews toward 150 is the single highest-return marketing activity available to you, and it is mostly a matter of asking consistently.",
        "**The education content nobody in your market is writing.** Vein disease explained for the patient who has symptoms and no diagnosis — the lane Advanced Vein Center and The Vein Place have both left open.",
      ],
    },
  ],
};

/* ============================================================
   06 — INVESTMENT
   ============================================================ */

export const investment = {
  title: "Investment",
  sub: "One monthly figure. The build is included, not billed separately.",
  /**
   * SHARED inclusions only.
   *
   * This list used to promise a dual-architecture build and reputation
   * management at every price point, which the tier cards now contradict —
   * the dual build is Growth and above, and reputation software is excluded
   * throughout because he already owns his own. Anything tier-specific lives
   * on the cards and only on the cards.
   */
  inclusionsTitle: "In every tier",
  inclusions: [
    "Rebuild on one architecture",
    "Hosting, maintenance, security and ongoing development",
    "Google Business Profile setup",
    "Monthly reporting",
  ],
  inclusionsNote:
    "Everything beyond these four is tier-specific and named on the card that carries it.",

  /**
   * PRICING. Two numbers per card on purpose: the published rate and his, so
   * the reduction is visible rather than asserted. $500 is the floor and does
   * not move, which is why Essentials shows the same number twice.
   */
  /**
   * The Summit line. He came from the HPS Vein Practice Growth Summit, so the
   * rate is named for it and given an end — a date supplied by Clayton, not
   * invented here. One line, no countdown, no urgency styling: the reason to
   * decide is on the rest of the page.
   */
  summitNote: "Summit pricing, held through September 12, 2026.",
  ratesNote:
    "Published rates are the ones on inflowmd.com/pricing. $500 is our floor and does not move; above it we are holding 20% for twelve months, with setup waived.",
  exclusionNote:
    "Reputation software is excluded from every tier — you already have your own, and we are not going to sell you a second one. Review strategy is still included where the card says so.",
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
      /** Said plainly rather than buried: this tier leaves the listings alone. */
      limitation:
        "This fixes the website and does not include the listings work. The federal NPI record, the four wrong phone numbers, the unclaimed physician profiles and the second live website stay as they are.",
    },
    {
      name: "Visibility",
      published: "$900",
      rate: "$720",
      badge: "20% OFF",
      savings: "You save $180/mo — rate locked 12 months",
      inherits: "Everything in Essentials, plus",
      includes: [
        "Phase One listing correction",
        "Managed citations",
        "Services menu and booking link on the Google profile",
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
        "The dual build — vein screening funnel and med spa showcase, weight-loss door, Spanish path",
        "Keyword optimization",
        "2 patient-education posts per month",
        "Full structured-data layer",
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
      /** Savings x 12. Plain multiplication on a contracted figure — the only
          number on this page that is extrapolated at all, and it stops here. */
      term: "$6,000 over the term",
      recommended: true,
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
  timingTitle: "On the timing",
  timing: [
    "You mentioned you are two months into work with your current web partner, and it is a fair thing to weigh. Our honest read is that two months in is the **best** moment to make this call, not the worst one. Two months is not a sunk investment — it is the cheapest exit point you will ever have. The same decision made a year from now costs a year of compounding: another year of listings drifting, another year of competitors accumulating reviews you did not, another year of content published into an architecture that cannot rank it.",
    "None of what is in this audit reflects on anyone's competence. It reflects a platform that was designed in 2003 for blogs and has been asked to run medical practices ever since. Everyone building on it is fighting the same drift. The alternative is not working harder against it — it is an architecture where the drift is structurally impossible.",
    "That is the entire pitch: **before you invest further in the old infrastructure, move to what is better.**",
  ],
};

export const closing = {
  title: "Where this goes next",
  paragraphs: [
    "This audit is yours regardless of what you decide — the listing corrections in Phase One are worth doing whoever does them, and we are glad to walk your current partner through the findings if that is useful.",
    "If the dual build is interesting, the next step is a working session: we walk through this page together, you tell us where we have read your practice wrong, and we put a formal proposal and a timeline in front of you.",
  ],
  signature: {
    name: "Clayton Peterson · InflowMD",
    email: "clayton@inflowmd.com",
    site: "inflowmd.com",
  },
};

export const footer = {
  line: "Prepared by InflowMD for Dr. Sharath Reniguntala, Vein Clinic & Med Spa, Santa Ana CA. Confidential. August 27, 2026.",
  methodology:
    "All figures independently verified against live Google Business Profile data, veinandmedspa.com, and eighteen third-party directory listings on the date of preparation. Review counts and ratings change continuously.",
};
