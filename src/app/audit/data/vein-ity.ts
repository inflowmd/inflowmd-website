import type { AuditData } from "./types";

export const veinIty: AuditData = {
  slug: "vein-ity",
  practice: {
    name: "Vein-ity Vein Care Centers of Kansas",
    domain: "vein-ity.com",
    ownerName: "Dr. C. Allyson Walker",
    ownerTitle: "Board-Certified Cardiothoracic Surgeon, Owner",
    location: "Olathe, Kansas",
  },
  auditDate: "July 7, 2026",
  overallGrade: "D+",
  headline:
    "The new site looks better. The foundation doesn’t hold. Current #1 ranking is carried by 40 five-star Google reviews — not the site.",
  categories: [
    { label: "Design shell", grade: "B", note: "Clean, modern look — the visible layer is fine." },
    { label: "Analytics", grade: "A", note: "GA4, GTM, and Meta Pixel all fire correctly." },
    { label: "SEO fundamentals", grade: "F", note: "No H1s and no schema on any page." },
    { label: "Content QA", grade: "F", note: "17 live errors, one medically inaccurate." },
    { label: "Performance", grade: "D", note: "52/100 on mobile · ~5-second load." },
    { label: "Compliance", grade: "F", note: "Accessibility widget claimed but missing." },
  ],

  heroKpis: [
    { value: "D+", label: "Overall technical grade", note: "Full breakdown below", tone: "warn" },
    { value: "0", label: "H1 headings sitewide", note: "20+ pages inspected", tone: "critical" },
    {
      value: "0",
      label: "Schema markup found",
      note: "No medical, physician, FAQ, or review markup",
      tone: "critical",
    },
    {
      value: "17",
      label: "Documented content errors",
      note: "Including one medically inaccurate answer",
      tone: "critical",
    },
    {
      value: "52/100",
      label: "Mobile performance",
      note: "Google PageSpeed, homepage",
      tone: "warn",
    },
    {
      value: "Page 2+",
      label: "“Vein clinic Overland Park”",
      note: "Not on page 1, map pack or organic",
      tone: "warn",
    },
  ],

  heroMessagingLine:
    "This report shows where the new site is quietly costing the practice patients — and exactly what a rebuilt foundation changes.",

  whatWorks: {
    items: [
      {
        title: "Analytics stack correctly installed",
        detail:
          "GA4 (G-RTW7M74T18), GTM (GTM-NBPT53H3), and Meta Pixel all fire on page load.",
      },
      {
        title: "Valid SSL, click-to-call above the fold",
        detail: "Baseline trust and conversion mechanics in place.",
      },
      {
        title: "Live 5.0★ Google reviews widget (40 reviews)",
        detail: "Rendered client-side from the Google Business Profile.",
      },
      {
        title: "Embedded map and Athena scheduling",
        detail: "Directions and self-booking work end-to-end.",
      },
      {
        title: "Physician credentials present in copy",
        detail: "Board certification and specialty named on About + homepage.",
      },
      {
        title: "#1 for “vein treatment Olathe KS”",
        detail: "Top of Google for the home-city primary term.",
      },
    ],
    honestCaveat:
      "The #1 ranking is powered by the practice’s 40 five-star reviews — not the site. Remove the reviews and the technical foundation would not hold that position.",
  },

  execFive: [
    "medically-inaccurate-faq",
    "invisible-structure",
    "false-ada-claim",
    "content-errors",
    "invisible-in-overland-park",
  ],

  findings: [
    {
      id: "medically-inaccurate-faq",
      title: "Medically inaccurate FAQ answer on /hand-veins/",
      severity: "critical",
      consequence:
        "Patients and referring physicians reading a wrong medical answer published under your name — a credibility risk no ranking can offset.",
      summary:
        "The hand-veins FAQ answers a hand-vein question with the varicose-vein pathology copy — copied from the varicose-veins page. Valve failure and venous pooling do not cause prominent hand veins; dermal thinning and subcutaneous fat loss do.",
      evidence: {
        quote:
          "Varicose veins develop when valves in the veins weaken, causing blood to pool and veins to enlarge. Factors like genetics, prolonged standing, age, and pregnancy can increase the risk.",
        url: "https://vein-ity.com/hand-veins/",
        label: "vein-ity.com/hand-veins/ — under “Why Do Hand Veins Become More Prominent With Age?”",
      },
    },
    {
      id: "invisible-structure",
      title: "Invisible structure — zero H1s and zero schema sitewide",
      severity: "critical",
      consequence:
        "Google and AI search engines can’t confidently identify what you treat — so competitors get cited as the answer for questions you’re more qualified to own.",
      summary:
        "Not one page carries an H1 heading (20+ pages inspected). No MedicalBusiness, Physician, FAQPage, or Review structured data was found anywhere. JSON-LD blocks: 0. Microdata: 0.",
      detail:
        "An H1 is the title of a page in a form crawlers and assistive tech can read. Structured data is the machine-readable layer AI engines and Google use to cite a practice as the answer. Missing both, at the same time, makes the site ineligible for rich results, FAQ dropdowns, and AI-search citation — categories the reviews and content are otherwise strong enough to win.",
    },
    {
      id: "false-ada-claim",
      title: "False ADA accessibility claim on /accessibility/",
      severity: "critical",
      consequence:
        "Live legal exposure. Healthcare sites are the #1 ADA web-lawsuit target, and a published claim for a widget that doesn’t exist is disprovable in 30 seconds.",
      summary:
        "The accessibility statement promises a widget the site does not actually render on any page.",
      evidence: {
        quote:
          "makes available an accessibility the Vein-ity Vein Care Centers of Kansas Accessibility Widget",
        url: "https://vein-ity.com/accessibility/",
        label: "vein-ity.com/accessibility/",
      },
    },
    {
      id: "content-errors",
      title: "17 documented content errors in patient-facing copy",
      severity: "high",
      consequence:
        "Prospective patients deciding a surgeon’s attention to detail based on “curgical specialist” — before they ever call.",
      summary:
        "Selected verbatim samples from the audit worksheet. Full list of 17 available on request.",
    },
    {
      id: "invisible-in-overland-park",
      title: "Invisible in Overland Park while 23 cities sit as footer text",
      severity: "high",
      consequence:
        "The largest suburb in your market books with six competitors while your listing sits at the bottom of the results page.",
      summary:
        "Not on page 1 of Google — organic or map pack — for “vein clinic Overland Park.” Twenty-three surrounding cities are listed as plain footer text with zero location pages behind them.",
      detail:
        "Currently on page 1: Vein Clinic of Greater Kansas City, USA Vein Clinics – Overland Park, Modern Vascular, and The University of Kansas Health System.",
    },
  ],

  contentErrorRows: [
    {
      quote:
        "Recieve specialized vein treatment from a highly skilled board-certified curgical specialist with over 15 years of surgical experience",
      where: "Homepage & Contact page — “Expert Care” section",
    },
    {
      quote: "providing personalized in a comfortable and luxurious environment",
      where: "Homepage hero — also present in the auto-dumped meta description",
    },
    {
      quote:
        "...symptoms like heaviness, fatigue, or swelling. ultrasonidos is required for diagnosis.",
      where:
        "Homepage FAQ — “Can I Have Vein Disease Without Visible Veins?” (untranslated Spanish word in English copy)",
    },
    {
      quote: "Blood clots,In rare cases, vein disease may increase the risk of blood clots",
      where: "/varicose-veins/ — missing space after the comma",
    },
    {
      quote: "Meagan Cunningham, FD  //  my name is Maegan  //  Maegan Cunninghan",
      where:
        "Staff name spelled three ways across three locations: About heading, About bio, homepage",
    },
  ],

  performance: {
    rows: [
      {
        page: "Homepage",
        form: "mobile",
        performance: 52,
        fcp: "5.0s",
        si: "14.7s",
        imageWeight: "2,566 KiB unoptimized",
        renderBlocking: "~2,980ms est. savings",
      },
      { page: "Homepage", form: "desktop", performance: 65, fcp: "0.9s" },
      { page: "/varicose-veins/", form: "mobile", performance: 60 },
    ],
    translation:
      "At the site’s current mobile load times, more than half of mobile visitors may leave before the page paints. Every abandoned visit is a consultation that books elsewhere.",
    benchmarks: [
      {
        stat: "Every 100ms of added load time reduced conversions by 7%",
        detail: "Direct measurement across major retail sites.",
        source: "Akamai — Online Retail Performance Report (2017)",
      },
      {
        stat: "53% of mobile visitors abandon a page slower than 3 seconds",
        detail: "Mobile abandonment threshold across sectors.",
        source: "Google / SOASTA",
      },
      {
        stat: "0.1s speed improvement → +8.4% retail conversions, +10.1% travel",
        detail: "Same site, faster site — direct conversion lift measured.",
        source: "Deloitte / Google — “Milliseconds Make Millions” (2020)",
      },
      {
        stat: "1s → 3s load: bounce probability +32%. 1s → 5s: +90%",
        detail: "Bounce probability rises non-linearly with load time.",
        source: "Google / SOASTA (2017)",
      },
    ],
  },

  rootCause:
    "The site is built on hello-elementor-child + Elementor 4.1.4 — a page-builder stack that layers plugins, render-blocking scripts, and megabytes of CSS/JS on every page. The 52/100 mobile score and ~3 seconds of render-blocking savings flagged by PageSpeed are characteristics of the stack, not accidents of configuration. The ceiling is the platform.",

  standard: {
    intro: "",
    points: [],
  },

  comparison: [
    { metric: "Mobile PageSpeed score", theirs: "52 / 100", ours: "95+ / 100", win: "ours" },
    { metric: "First Contentful Paint (mobile)", theirs: "5.0 s", ours: "≤ 1.0 s", win: "ours" },
    { metric: "H1 coverage", theirs: "0 of 20+ pages", ours: "One per page", win: "ours" },
    {
      metric: "Structured data",
      theirs: "None",
      ours: "MedicalBusiness · Physician · FAQ · Review",
      win: "ours",
    },
    {
      metric: "ADA compliance",
      theirs: "Claim made · widget missing",
      ours: "WCAG-audited at launch",
      win: "ours",
    },
    {
      metric: "Content QA",
      theirs: "None — 17 errors live",
      ours: "Human medical-copy review",
      win: "ours",
    },
    {
      metric: "Location coverage",
      theirs: "0 pages (23 cities as footer text)",
      ours: "One landing page per targeted city",
      win: "ours",
    },
    { metric: "Call tracking", theirs: "Not installed", ours: "Attribution-ready", win: "ours" },
  ],

  summaryRow: {
    theirs: "Ranking on reputation alone",
    ours: "Ranking on reputation AND foundation",
  },

  fork: {
    quickFixes: [
      { label: "The 17 typos and grammar errors (curgical, Recieve, ultrasonidos, blood-clots comma, staff name variants)" },
      { label: "Phone number mismatch across the site vs. Google Business Profile vs. Yelp" },
      { label: "Default WordPress Sample Page live at /sample-page/" },
      { label: "Malformed telephone and mailto links (tel:%2+…, tel:%20…, mailto:%20…)" },
      { label: "Dead Spanish GTranslate toggle in the header" },
    ],
    quickFixesNote:
      "Hand this list to whoever maintains the site. No charge, no catch.",
    foundation: [
      { label: "95+ mobile PageSpeed as the baseline" },
      { label: "Complete medical schema architecture (MedicalBusiness · Physician · FAQPage · Review)" },
      { label: "One-per-page H1 and semantic heading structure" },
      { label: "Real location pages for the 23 cities currently sitting as footer text" },
      { label: "WCAG-real accessibility, not a false claim" },
    ],
    foundationNote:
      "These aren’t tasks — they’re properties of how the site is built. The current stack caps out below the standard patients now expect.",
  },

  additionalCount: 32,
  additionalTeasers: [
    { severity: "high", title: "Meta descriptions auto-dumped from body copy (all pages)" },
    { severity: "high", title: "WordPress admin username publicly exposed via /author/admin/" },
    { severity: "high", title: "Thank-you and Sample pages fully indexable and listed in the sitemap" },
    { severity: "medium", title: "Footer “Services” link mislabeled — points to a single treatment page" },
  ],

  cta: {
    fullReportMailto: "/get-started",
    walkthroughUrl: "/get-started",
  },

  methodologyNote:
    "All findings observed directly on the live site on July 7, 2026, logged out, from a clean session. No forms were submitted; no systems were accessed.",

  market: {
    eyebrow: "Section — Market position",
    title: "Where you stand in Kansas City.",
    subline:
      "Live competitive data — how patients comparing vein care actually see the practice. Observed July 10, 2026.",
    contextLine:
      "Johnson County is the wealthiest county in Kansas — roughly 630,000 residents, median household income ~$109K, ~94% insured, and aging into peak vein-care demographics.",
    serpCaption:
      "Live Google local results, “vein clinic Overland Park” — July 10, 2026, 2:37 PM, logged out.",
    serp: [
      {
        rank: 1,
        name: "Vein Clinic of Greater Kansas City",
        rating: "4.3★",
        reviews: 47,
        category: "Surgical center",
        status: "Closes soon",
      },
      {
        rank: 2,
        name: "USA Vein Clinics – Overland Park",
        rating: "4.2★",
        reviews: 151,
        category: "Medical clinic",
        status: "Closed · Opens 8 AM Mon",
      },
      {
        rank: 3,
        name: "Kansas City Vascular and General Surgery",
        rating: "4.7★",
        reviews: 226,
        category: "Medical clinic",
        status: "Open",
      },
      {
        rank: 4,
        name: "Modern Vascular",
        rating: "4.8★",
        reviews: 86,
        category: "Medical clinic",
        status: "Open",
      },
      {
        rank: 5,
        name: "Kansas City Vascular Institute",
        rating: "4.9★",
        reviews: 209,
        category: "Vascular surgeon · Leawood",
        status: "Closed · Opens 7 AM Mon",
      },
      {
        rank: 6,
        name: "USA Vein Clinics – Kansas City",
        rating: "4.3★",
        reviews: 147,
        category: "Medical clinic",
        status: "Closed · Opens 7 AM Tue",
      },
      {
        rank: 7,
        name: "Vein-ity Vein Care Centers of Kansas",
        rating: "5.0★",
        reviews: 40,
        category: "Vascular surgeon · Olathe",
        status: "Closed · Opens 8 AM Mon",
        isSubject: true,
      },
    ],
    facts: [
      {
        id: "bottom-of-list",
        title: "Seventh of seven in the biggest market.",
        fact:
          "In a live Google search for “vein clinic Overland Park” (July 10, 2026, logged out), Vein-ity appears seventh of seven local results — below six competitors and outside the map pack.",
        cost:
          "Patients call from the top of the list; most never scroll past the third result. Overland Park is the densest, most affluent vein market in the metro — and the practice is at the bottom of the results page.",
      },
      {
        id: "best-rating-fewest-reviews",
        title: "Best rating on the page. Fewest reviews on the page.",
        fact:
          "5.0★ is the highest rating of any practice in the list. 40 reviews is the lowest count — against 226, 209, 151, 147, 86, and 47.",
        cost:
          "Review count is the tiebreaker patients use after stars. 40 vs. 209 reads as “newer, less proven” regardless of quality. The gap is provably closable: a KC-metro vascular practice added roughly 130 Google reviews in about 12 months with a systematic review engine — while holding 4.9★+. A review tool is already installed on the practice site; it is underproducing.",
      },
      {
        id: "distance",
        title: "Distance is working against the listing, with nothing to counteract it.",
        fact:
          "Competitor locations cluster in Overland Park / Leawood; Vein-ity sits in Olathe. Google weights proximity heavily in local results — and the site has zero Overland Park–specific pages, only 23 city names as plain footer text.",
        cost:
          "With no location pages, Google has no reason to show an Olathe practice to an Overland Park searcher. The result: #1 in Olathe, seventh in the market next door.",
      },
      {
        id: "directories",
        title: "Directory sites tell the wrong story under Dr. Walker’s name.",
        fact:
          "Healthgrades lists Dr. Walker under “Thoracic Cardiovascular Surgery” — not vein care — and the most visible review there is an unrelated 2020 consultation review from her prior specialty. Root cause: the federal NPI registry classification, which Healthgrades and other directories inherit.",
        cost:
          "Patients verify a doctor by name before booking. A vein patient who checks finds the wrong specialty and an off-topic review — the strongest asset, elite surgical credentials, currently reads as a mismatch.",
      },
    ],
    throughLine:
      "The practice loses patients before the first phone call — on visibility, on social proof, and on identity. All three are fixable.",
  },

  outcomes: [
    {
      fix: "95+ mobile performance",
      means:
        "Patients who click actually arrive. At current speeds, half of mobile visitors may leave before the page paints — each one is a consultation booking somewhere else.",
    },
    {
      fix: "Complete medical schema (MedicalBusiness · Physician · FAQPage · Review)",
      means:
        "Your 5.0★ reviews and Dr. Walker’s credentials become machine-readable — eligible for star ratings in results and citations in AI answers, where patients increasingly decide.",
    },
    {
      fix: "Real location pages for the 23 cities",
      means:
        "Overland Park and 22 other suburbs stop being footer text and start being pages that can actually rank — visibility in the markets you already claim to serve.",
    },
    {
      fix: "WCAG-real accessibility",
      means:
        "The false claim comes down, real conformance goes in, with a documented audit trail — legal exposure replaced by defensible compliance.",
    },
    {
      fix: "Human medical-copy QA",
      means:
        "Every word a patient reads is reviewed before it ships. The typo era ends the day the site does.",
    },
    {
      fix: "Call tracking / attribution",
      means:
        "Every new patient call traces to its source — you’ll know exactly what your marketing produces, in numbers, monthly.",
    },
  ],

  guaranteeLine:
    "We guarantee the work. Patient growth we project honestly, from data — never promise.",

  showdown: {
    theirName: "vein-ity.com",
    theirCaption: "Your site today",
    ourName: "inflowmd.com",
    ourCaption: "An InflowMD build — our own site",
    gauges: [
      { label: "Mobile performance", theirs: 52, ours: 92 },
      { label: "Desktop performance", theirs: 65, ours: 100 },
    ],
    metrics: [
      { label: "First paint (mobile)", theirs: "5.0s", ours: "1.3s" },
      { label: "Speed Index (mobile)", theirs: "14.7s", ours: "4.6s" },
    ],
    rows: [
      {
        label: "Engine",
        theirs: "WordPress + Elementor — plugin and script stack",
        ours: "Next.js on Vercel — server-rendered, zero plugin bloat",
      },
      {
        label: "H1 headings",
        theirs: "0 across 20+ pages",
        ours: "One on every page",
      },
      {
        label: "Structured data",
        theirs: "None",
        ours: "MedicalBusiness · Physician · FAQPage · Review — built in",
      },
      {
        label: "ADA accessibility",
        theirs: "Claim published, widget missing",
        ours: "WCAG-audited, real conformance",
      },
      {
        label: "Content accuracy",
        theirs: "17 live errors, including one medically inaccurate answer",
        ours: "AI-audited + human-reviewed — every word checked before launch",
      },
      {
        label: "Meta descriptions",
        theirs: "Auto-dumped page text, typos in Google snippets",
        ours: "Written for every page",
      },
      {
        label: "Indexation hygiene",
        theirs: "Default Sample Page live and listed in the sitemap",
        ours: "Clean sitemap — nothing ships that shouldn’t",
      },
      {
        label: "Link integrity",
        theirs: "Malformed phone and email links",
        ours: "Every link validated",
      },
      {
        label: "Local coverage",
        theirs: "0 location pages — 23 cities listed as footer text",
        ours: "One rankable landing page per targeted city",
      },
      {
        label: "Call tracking",
        theirs: "Not installed — new-patient calls untraceable",
        ours: "Attribution-ready — every call traced to its source",
      },
    ],
    note:
      "Both sites measured with Google’s PageSpeed engine (Lighthouse): vein-ity.com on July 7, 2026 · inflowmd.com on July 15, 2026. Anyone can re-run this test at pagespeed.web.dev.",
    payoffStat: "Every second of load time is a 7% drop in conversions.",
    payoffLine:
      "This is the whole point. A faster, cleaner site doesn’t just score better — it books more patients from the same visitors. At 5.0 seconds, most of your mobile traffic leaves before the page loads. At 1.3, they stay, they read, they call. More speed, more conversions, more patients.",
    payoffSource: "Akamai / Deloitte — mobile & healthcare conversion studies.",
    liveExample: {
      url: "https://thefloridavascularcare.com",
      name: "Florida Vascular Care",
      blurb: "A vein practice we built on this same foundation. Pull it up on your phone.",
    },
  },
};
