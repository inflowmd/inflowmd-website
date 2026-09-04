/**
 * Versailles Health and Wellness — audit page copy.
 *
 * SOURCE OF TRUTH: research/versailles/ (gitignored, private). Only items the
 * pass-1B ledger marks CONFIRMED, or that pass 2 verified, appear here.
 * Anything in the could_not_verify files appears NOWHERE — no Yelp, no
 * chart. subdomain, no staff credential, no scanner percentage, no ad data.
 *
 * READER: Dr. Dorcas Lomo, alone. Physician, founder, price-conscious, and
 * proud of a brand she has just paid for. Nothing here blames her and nothing
 * blames whoever built the site. The framing is architectural and it is the
 * only frame used: the site was built as one brand's brochure while she is
 * running two medical businesses — a luxury med spa and an insurance-relevant
 * vein practice — and one page-builder site cannot be both.
 *
 * SPEED is prose, never a fixed decimal and never a before/after of runs.
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
  name: "Versailles Health and Wellness",
  owner: "Dr. Dorcas Lomo",
  domain: "versailleshealthandwellness.com",
  location: "Rockwall, Texas",
  auditDate: "September 2–3, 2026",
};

export const meta = {
  /** Absolute — the root layout would otherwise append "| InflowMD" and put
      our name on her document and on the PDF she saves from it. */
  title: "Versailles Health and Wellness — Practice Audit",
  eyebrow: "Practice Audit · Prepared for Dr. Dorcas Lomo",
  h1: "Versailles Health and Wellness",
  lede: "A complete look at your website and at everything around it — what a patient encounters on the way to you, what is already built well, and what happens when one site is asked to carry two different medical businesses.",
  metaRow: [
    { label: "Prepared by", value: "Clayton Peterson, InflowMD" },
    { label: "Date", value: "September 2–3, 2026" },
    { label: "Market", value: "Rockwall, Texas" },
    { label: "Scope", value: "Site, entities, federal records, directories, profiles, local results" },
  ],
  verifiedLine:
    "Every figure on this page was verified by hand on September 2–3, 2026 — against your live site, the federal NPPES registry, Texas Secretary of State records, Google Maps results geo-targeted to Rockwall, and each directory profile named in the sections below.",
};

export const nav = [
  { id: "verdict", label: "Verdict" },
  { id: "website", label: "Website" },
  { id: "presence", label: "Web Presence" },
  { id: "plan", label: "The Plan" },
  { id: "investment", label: "Investment" },
];

/* ============================================================
   THE SHORT VERSION
   ============================================================ */

export const summary = {
  eyebrow: "The short version",
  verdictLine:
    "One website is carrying two medical businesses. **It can only be good at one of them.**",
  scores: [
    { value: "46", label: "AI readiness" },
    { value: "78", label: "Search readiness" },
    { value: "61", label: "Speed" },
  ],
  scoresNote:
    "Measured September 2, 2026. Speed by Google PageSpeed Insights; AI and search readiness by the InflowMD engine.",
  findings: [
    "Rockwall does not show you. Across Google Maps results for vein treatment, med spa, hair restoration and botox in your own city, the practice appears in none of them — and the entire vein result set is five businesses.",
    "Your name is 12 different renderings across 22 third-party surfaces, with 8 addresses and 6 phone numbers. Two of the 22 link to your website; none of the nine medical publishers do.",
    "Booking splits three ways, and the button labelled for vein treatment opens a scheduler with no vein visit type in it.",
  ],
  recommendation: {
    label: "Recommended",
    tier: "Both Practices",
    price: "$950",
    per: "/ month",
    note: "Twelve months, setup waived.",
  },
  readMore: "Read the evidence",
};

/* ============================================================
   VERDICT
   ============================================================ */

export const verdict = {
  title: "The verdict",
  paragraphs: [
    "Nothing in this document is bad work. The brand is coherent, the service pages are written properly, and the site does the job it was built to do. The finding is that the job has changed underneath it: **you are running two medical businesses and you have one website.**",
    "A page-builder site is a stack of independent decisions — a theme, a set of plugins, a booking widget added when a booking widget was needed, a landing page spun up for a campaign — and nothing in the platform forces those decisions to agree with each other afterwards. Over a couple of years the presence quietly becomes several sites wearing one domain name. Here that is literal: **an Elementor main site, a second live weight-loss site on a different theme that nothing links to, and three separate booking systems.**",
    "And the two businesses want opposite things. A luxury med spa sells on brand, photography and price. A vein practice sells on credentials, insurance literacy and a physician's name — and Google files it under a different category entirely. One site cannot lead with both.",
  ],
  pullquote:
    "The site is a beautiful brochure for one brand. The vein practice is a second business that has never had a front door of its own.",
  closing:
    "What is underneath is better than the surface suggests. Your About page carries a **full founder bio — MD, MPH, ABVLM** — with a signed pull-quote in your own voice. Your Google rating is **5.0**. The brand is consistent and genuinely well made. And your own site already says the thing this entire document is built on: **“We're located in Rockwall, Texas.”** That sentence is the strategy. The work is making every surface agree with it.",
  stats: [
    { value: "0 of 4", label: "Rockwall Maps result sets the practice appears in — vein, med spa, hair restoration, botox", tone: "critical" },
    { value: "12", label: "renderings of the practice name across 22 third-party surfaces", tone: "critical" },
    { value: "3", label: "separate booking systems, and no vein visit type in the vein one", tone: "critical" },
    { value: "5.0", label: "Google rating — the brand is working where patients do reach it", tone: "positive" },
  ] as Stat[],
  footnote:
    "Every figure on this page was verified by hand on September 2–3, 2026. Where something could not be verified, it is absent from this document rather than estimated.",
};

/* ============================================================
   01 — THE WEBSITE AUDIT
   ============================================================ */

export const engine = {
  eyebrow: "InflowMD audit engine · measured September 2, 2026",
  headline: "The site reads as a brochure.",
  headlineAccent: "Search engines are reading it as one too.",
  lede: "Search readiness is respectable — your pages are written and structured well enough to be found. The AI-readiness score is where the two-business problem shows up first: there is nothing on the site that tells a machine this is a medical practice, who the physician is, or what is treated here.",
  scores: [
    { score: 46, label: "AI readiness", note: "11 of 11 checks verified · InflowMD analysis" },
    { score: 78, label: "Search readiness", note: "9 of 9 checks verified · InflowMD analysis" },
    { score: 61, label: "Speed", note: "Google PageSpeed Insights" },
  ],
  speedNote:
    "Speed sits around 60. In practice that is roughly **eight seconds on a typical phone connection** before the main content of the page is on screen — the measurement moves run to run, so it is stated as a range rather than a single figure.",
  translation:
    "The scores describe a site that is findable and slow. Neither is the expensive problem. The expensive problem is that everything below is invisible to a score.",
};

export const websiteSection = {
  title: "The website audit",
  sub: "What we found on versailleshealthandwellness.com, in plain English — what it means and what it costs in patients.",
};

export const websiteFindings: FindingBlock[] = [
  {
    id: "schema",
    tone: "critical",
    title: "Nothing on the site tells Google you are a medical practice",
    subhead: "No medical, local or FAQ structured data on any of the 50 pages",
    body: [
      "Structured data is the machine-readable label underneath a page — the part a search engine and an AI assistant read before they read your words. Across all 50 live pages there is **no `MedicalBusiness`, no `Physician`, no `LocalBusiness` and no `FAQPage` markup at all**. Confirmed in the browser and again by reading the raw HTML directly.",
      "What is there instead: the site's `Organization` name is the bare domain, **“versailleshealthandwellness.com”**, and the homepage is typed as an **`Article`**. More than twenty of your own FAQs sit on the page completely unmarked.",
    ],
    meaning:
      "A practice with no medical markup is a practice Google has to guess about — and it guesses from a page that identifies itself as an article published by a domain name. This is also the single clearest reason the AI-readiness score is where it is: assistants answering “who treats varicose veins in Rockwall” have nothing here to read.",
  },
  {
    id: "nap",
    tone: "critical",
    title: "Your phone number and address appear on exactly one page",
    subhead: "And it is not the contact page",
    body: [
      "Across all 50 pages there is **one** tappable phone link, **one** phone number and **one** street address — all three on `/financing/`. **`/contact/` has neither a phone number nor an address.** There is no phone number in the header or the footer on any page of the site.",
    ],
    meaning:
      "A patient who decides to call has to find the financing page to do it. It also matters to Google: name, address and phone are the three fields it uses to decide that a website and a Google listing describe the same business, and right now the site barely states them.",
  },
  {
    id: "booking",
    tone: "critical",
    title: "Booking splits three ways, and the vein button has no vein appointment",
    subhead: "Jane, Aesthetic Record and DrChrono are all in play on one site",
    body: [
      "The header “Book Now” opens a form. The footer “Book Now” — on every page — goes to **Jane's generic clinic-lookup page** rather than to your booking page. The contact page offers **Aesthetic Record** *and* **DrChrono**. Your own Terms say booking is through Jane.",
      "And the button labelled for **vein treatment** opens a scheduler that **lists no vein visit type**. A patient who came specifically for veins, and got as far as clicking, cannot book the thing they came for.",
    ],
    meaning:
      "Every extra decision between a patient and a booked appointment costs some of them. Three systems is three sets of records, three confirmation emails, and no single place where you can see what booking actually produced.",
  },
  {
    id: "sitemap",
    tone: "critical",
    title: "The sitemap you advertise to Google does not exist",
    subhead: "robots.txt points at a URL that redirects to a 404",
    body: [
      "Your `robots.txt` names a sitemap. That address redirects once and then returns **404**. There is no reachable XML sitemap on the site.",
    ],
    meaning:
      "A sitemap is how a site tells search engines what it contains. Without one, discovery falls back to whatever Google happens to crawl — which is workable for a small site and quietly expensive for a growing one.",
  },
  {
    id: "headings",
    tone: "warn",
    title: "Half your pages have no headline for Google to read",
    subhead: "24 of 50 pages have no h1 at all; 5 carry two",
    body: [
      "The top-level heading is the strongest on-page signal of what a page is about. **24 live pages have no such heading in the page at all** — this is a count of what is in the page, not of what happens to be visible. Five more carry two, which asks Google to choose.",
    ],
    meaning:
      "Pages without a headline compete for search terms with one hand behind them. It is also a fifteen-minute fix per page on a rebuild.",
  },
  {
    id: "metadata",
    tone: "warn",
    title: "The homepage description is a developer's placeholder",
    subhead: "Left over from the build, and it is what Google shows",
    body: [
      "The homepage's meta description — the sentence under your name in search results — currently reads as boilerplate about **hover-animation JavaScript**: *“Learn hover animation JavaScript logic to create interactive, smooth effects.”*",
      "Alongside it, other build-time artifacts are still published: the site name in social metadata is the bare domain, an agency address sits in a `Person` block, and a “written by” value on the homepage is a developer's email address.",
    ],
    meaning:
      "That description is the first sentence many patients read about the practice. Nobody chose it — it is what the template shipped with, and it has simply never been overwritten.",
  },
  {
    id: "404s",
    tone: "warn",
    title: "Two service pages linked from the site return 404",
    subhead: "Botox & dermal fillers, and PDO thread lift — two linking pages each",
    body: [
      "Both were clicked as a patient would click them before being recorded here. Each is linked from two pages of the site, and each returns your 404 page.",
    ],
    meaning:
      "These are two of the highest-intent aesthetic searches in the category, and the internal links pointing at them arrive nowhere.",
  },
  {
    id: "shop",
    tone: "warn",
    title: "A live shopping cart sits on the medical site",
    subhead: "One product, and a shop page titled “Page Not Found”",
    body: [
      "WooCommerce is installed and live, carrying a single product at **$295.00**, with a working cart and checkout. The shop page itself returns a normal page whose title says **“Page Not Found”**.",
    ],
    meaning:
      "A storefront on a medical site is a decision worth making deliberately — right now it reads as a plugin that was switched on and left. If retail is part of the plan it deserves its own treatment; if it is not, it is maintenance nobody is doing.",
  },
  {
    id: "byline",
    tone: "warn",
    title: "One blog post credits a physician and a practice that do not exist",
    subhead: "“Dr. Docs Lomo, founder of Versailles Wellness & Healthcare”",
    body: [
      "That byline is on a live post. **Neither the name nor the practice name matches any register** — not Texas records, not the federal registry, not your own site anywhere else.",
    ],
    meaning:
      "It is a typo with consequences: it is a twelfth version of your practice name in circulation, and it is attached to the physician's name on a page patients read.",
  },
];

export const crowns = {
  title: "What is already right",
  lead: "Named specifically, because several of these are things we do not usually find.",
  items: [
    { title: "A full founder bio, with credentials", detail: "The About page carries MD, MPH and ABVLM, a real bio and a signed pull-quote in your own voice. Most practice sites we audit never name their physician at all." },
    { title: "A 5.0 Google rating", detail: "Where patients do reach you, they are glad they did." },
    { title: "A coherent luxury brand", detail: "The look is consistent across the site and it is genuinely well made. Nothing in the plan below touches it." },
    { title: "Service pages that are actually written", detail: "The individual treatment pages carry real depth — several run well past a thousand words." },
    { title: "Your own words already state the strategy", detail: "“We're located in Rockwall, Texas.” The whole plan below is making every other surface agree with that sentence." },
  ],
};

/* ============================================================
   02 — THE WEB PRESENCE SCAN
   ============================================================ */

export const presenceSection = {
  title: "The web presence scan",
  sub: "Your website is one surface. This is every other place a patient meets you — the registers, the directories, the profiles, and the local results in your own city.",
};

export const entities = {
  title: "Two entities, two federal records, one spelling to reconcile",
  body: [
    "Texas shows **two active PLLCs**: one registered in 2022 and one in 2026. There are also **two active organisation records** in the federal registry, one for each. That is what an incomplete restructure looks like on paper, and it is ordinary — but the records have not caught up with each other yet, and a few surfaces are still reading the older one.",
    "One item is worth putting in front of whoever handles your filings: the federal registry spells one organisation **“LLC”** where the Texas record says **“PLLC”**. Stated as what it is — two records that disagree on a legal name, to be reconciled by your counsel. Nothing more is implied by it.",
  ],
  meaning:
    "Directories read these registers automatically. Until the records agree with each other, corrections made by hand downstream tend to be overwritten the next time a publisher re-reads the source.",
};

export const healthgrades = {
  title: "Healthgrades publishes your registered agent's office as a practice location",
  body: [
    "Your Healthgrades profile lists an **Austin** address among your practice locations. That address is your **registered agent's office** — the commercial service that receives legal mail for both entities. No clinical work happens there, and it should not be listed as a place a patient could go.",
  ],
  meaning:
    "A patient in the Dallas metro looking you up on Healthgrades can be shown an office three hours away.",
};

export const directories = {
  title: "22 surfaces, and almost none of them point home",
  body: "Across both passes we reached **22 distinct third-party surfaces**. Here is what they say about you.",
  stats: [
    { value: "12", label: "renderings of the practice name in circulation", tone: "critical" },
    { value: "8", label: "distinct addresses, including three in other states", tone: "critical" },
    { value: "6", label: "distinct phone numbers", tone: "critical" },
    { value: "2 of 22", label: "surfaces that link to your website — and none of the nine medical publishers", tone: "critical" },
  ] as Stat[],
  extra: [
    "Eight different spellings of the physician's name are also in circulation, including an expanded legal name on one publisher and a misspelling on your own site.",
    "**Healthgrades, Vitals, WebMD and Doctor.com each show zero reviews** for Dr. Lomo, and three of them are visibly **unclaimed** — which means nobody can correct the address, add the credentials, or reply to anything on them.",
  ],
  meaning:
    "Google decides whether a listing and a website are the same business by comparing name, address and phone. Twelve names, eight addresses and six numbers is not a business it can confirm — and the two links that would settle it are on the two surfaces you already control.",
};

export const gbp = {
  title: "Your Google profile is filed as a med spa, and Rockwall does not show you",
  body: [
    "The Google Business Profile's primary category is **Medical spa**. That matches the top three med-spa competitors in Rockwall **exactly** — and matches **none** of the vein practices, which are filed as Medical clinic, Surgical center and Vascular surgeon.",
    "The profile's **services menu is empty**, and neither the website link nor the booking link carries tracking, so nothing that arrives from Google can be told apart from anything else. There is **no practitioner profile** for Dr. Lomo at all.",
  ],
  localTitle: "The result that matters most",
  local: [
    "We ran four Google Maps searches geo-targeted to Rockwall — **vein treatment, med spa, hair restoration and botox** — and the practice appears in **none** of the four result sets.",
    "The vein set is the striking one. It contains **five businesses in total**. That is the entire field in your city, and a practice whose own Google post advertises **free vein screenings** is not in it.",
  ],
  meaning:
    "Category is one of the strongest signals deciding which businesses Google shows for a treatment search. Filed as a med spa, the practice is competing in the med-spa set and is invisible in the vein set — which is a five-business field with room in it.",
};

export const subdomain = {
  title: "A second live site, on a different theme, that nothing links to",
  body: [
    "A weight-loss site runs on a subdomain of your own domain. It is a **different builder on older WordPress**, with **no structured data, no meta description and no social tags**, and three top-level headings that are all **prices**. Its “Book Consultation” button scrolls to an empty container — the page contains **no form at all**.",
    "It also publishes the **phone number and address your main contact page is missing**, and it loads **two Meta tracking pixels** — while the main site loads **no analytics of any kind**, against a privacy policy that tells patients their data is collected via Google Analytics.",
    "There are **no links between the two sites in either direction**.",
  ],
  meaning:
    "Everything that site earns — links, mentions, the trust Google builds up over time — is earned for an address the main brand gets no credit for. And the tracking mismatch is worth fixing simply so the privacy policy is accurate about what the site does.",
};

/* ============================================================
   03 — THESIS AND PLAN
   ============================================================ */

export const thesis = {
  protocolNote:
    "**This plan is what the practice needs, regardless of who does the work.** Section 04 states separately what InflowMD proposes to handle and what that costs.",
  title: "One platform, two brands",
  sub: "The architecture follows from something you already decided.",
  intro: "You asked about setting the vein practice up as its own entity. The record agrees with you, independently, in four places:",
  points: [
    "Your Google category matches the med spas exactly and matches none of the vein practices.",
    "The Rockwall vein result set is five businesses — a field with room in it, and you are not in it.",
    "Your ABVLM credential is real, and it is buried on an About page inside a med-spa brand.",
    "A luxury aesthetics brand and an insurance-relevant medical practice ask a patient for completely different things.",
  ],
  body: [
    "So the answer is not a bigger website. It is **one platform running two brands**: a med-spa site that keeps the brand you have paid for and does it properly, and a vein site that is allowed to look and read like medicine — the physician's name and credentials in front, the insurance question answered, the category filed correctly.",
    "Both are anchored to **Rockwall** — your own words, in your own FAQ — with the wider metro treated as reach in the copy rather than as a claim about where the practice is.",
  ],
  closing:
    "Everything below is ordered by what recovers patients soonest, not by what is most impressive.",
};

export const plan = {
  title: "What we would do",
  sub: "Three phases. Phase 1 is worth doing whoever does the work.",
  phases: [
    {
      name: "Phase one — foundation",
      timeframe: "First",
      outcome: "One identity, a site that states it, and one way to book.",
      steps: [
        "**One identity.** Settle a canonical name, address and phone under **Versailles Health and Wellness PLLC**, align the Google profile to it, and put the federal-versus-Texas spelling mismatch on a punch list for your counsel to execute.",
        "**Repair the current site's fundamentals.** The sitemap chain, the missing headings, the leftover template metadata, and the name, address and phone in the header, the footer and the contact page.",
        "**One booking path.** The practice's own booking URL everywhere it is asked for, and a **vein visit type added** to it.",
      ],
    },
    {
      name: "Phase two — two brands, one platform",
      timeframe: "The build",
      outcome: "A med spa that looks like a med spa, and a vein practice that looks like medicine.",
      steps: [
        "**Rebuild versailleshealthandwellness.com as the med-spa brand** — modern stack, real `MedicalBusiness` and `Physician` markup, Rockwall-anchored throughout.",
        "**Launch the vein practice as its own site and its own entity** — own domain, own schema, ABVLM and the vein taxonomy in front, and a content architecture that answers the insurance question.",
        "**Retire the weight-loss subdomain into the main brand** — redirects so nothing it has earned is lost, and one analytics setup that matches what the privacy policy promises.",
      ],
    },
    {
      name: "Phase three — visibility engine",
      timeframe: "Ongoing",
      outcome: "Both brands findable in Rockwall, and a review corpus that compounds.",
      steps: [
        "**Directory remediation for both entities** — one name, one address, one phone across all 22 surfaces, and the four medical profiles claimed.",
        "**A Google Business program** — correct vein categories on a dedicated profile, populated services menus, tracked links, and a review-generation system. Never purchased, never incentivised.",
        "**Content cadence** — one post per brand per month with FAQ markup, targeting Rockwall and east-metro patient questions.",
      ],
    },
  ],
  giveaway:
    "**Phase one is worth doing whoever does the work.** The booking path, the missing name and phone number, and the sitemap are costing you patients this week, and none of them requires a relationship with us. If it is useful, we are glad to walk whoever maintains the site through the findings.",
};

/* ============================================================
   04 — INVESTMENT
   ============================================================ */

export const investment = {
  title: "Investment",
  sub: "Two ways to do this. Both are twelve months, and setup is waived on both.",
  cards: [
    {
      name: "The Vein Practice Only",
      price: "$500",
      per: "/ month",
      note: "Twelve months, setup waived.",
      includes: [
        "A new vein practice site — its own domain and its own brand",
        "Its structured data: MedicalBusiness, Physician, the vein taxonomy",
        "Its own Google Business Profile, categorised as a vein practice",
        "Its listings, built clean from a new entity rather than corrected",
        "Its review-generation system",
        "One post per month",
      ],
      footnote: "Exactly what the practice spends today.",
      limitation:
        "This leaves Versailles as it stands today. The website findings in Section 01, the listing record across the 22 surfaces, and the analytics gap all remain as they are.",
    },
    {
      name: "Both Practices",
      price: "$950",
      per: "/ month",
      note: "Twelve months, setup waived.",
      recommended: true,
      inherits: "Everything in The Vein Practice Only, plus",
      includes: [
        "The Versailles med-spa rebuild",
        "The full two-entity identity cleanup, handled as setup",
        "One post per brand per month",
      ],
      value:
        "Priced separately against inflowmd.com/pricing: $1,400/mo. Bundled: $950 — $450/mo less.",
    },
  ],
  bothNote:
    "Ad management is not included in either. If advertising ever makes sense, the spend goes directly to Google and never through us. Reviews are systems that ask at the right moment — never purchased, never incentivised.",
  deadline: "This pricing and the October build slot hold through September 18, 2026.",
};

export const closing = {
  title: "Where this goes next",
  paragraphs: [
    "This audit is yours regardless of what you decide. The Phase One items are worth doing whoever does them, and we are glad to walk whoever maintains the site through any of the findings in detail.",
    "If the two-brand architecture is interesting, the next step is a working session: we go through this page together, you tell us where we have read the practice wrong, and we put a proposal and a timeline in front of you.",
  ],
  signature: {
    name: "Clayton Peterson · InflowMD",
    email: "clayton@inflowmd.com",
    site: "inflowmd.com",
  },
};

export const footer = {
  line: "Prepared by InflowMD for Dr. Dorcas Lomo, Versailles Health and Wellness, Rockwall TX. Confidential. September 3, 2026.",
  methodology:
    "Site walk, engine scores, entity and federal records, directory profiles and Rockwall local results all verified by hand on September 2–3, 2026. Speed measured by Google PageSpeed Insights and reported as a range; AI and search readiness analyzed by InflowMD. Directory and profile data change continuously. Anything that could not be verified from our network is absent from this document rather than estimated.",
};
