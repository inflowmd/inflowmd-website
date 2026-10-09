/**
 * Miller Vein — audit page copy.
 *
 * EVERY FIGURE ON THIS PAGE COMES FROM research/millervein.md (all checks
 * dated October 6, 2026). Nothing here is inferred, estimated, or carried
 * over from another practice's audit. Where a check could not be completed,
 * the page says so rather than filling the gap.
 *
 * PRESENTATION — this file was rebuilt as exhibits, not prose. The reader is
 * a physician running eight clinics who will not read 24,000 characters. Each
 * finding here was always visual and had been written as paragraphs: a record
 * naming the wrong city, two directory listings that disagree, reviews on an
 * address nobody occupies, three phone numbers. Those are pictures. So the
 * default state of the page is figures, grids and mock listings, and the
 * supporting prose — dates, taxonomy codes, the ingestion chain — sits behind
 * disclosure for the reader who wants to check the work.
 *
 * NOT A RESEARCH CHANGE. No finding was added, dropped, softened or
 * sharpened in the rebuild. Two numbers are stated more precisely than the
 * previous draft stated them, both toward the research rather than away from
 * it: the review profiles located cover FOUR of the eight clinics plus the
 * corporate office (five profiles, 2,014 reviews), and that is said as such
 * rather than as "five of eight locations".
 *
 * SPEED — the most important honesty call here. The lab test returns a
 * 21.56s LCP; Google's real-user field data for the same site returns 2.02s.
 * Claiming patients wait twenty-one seconds would be false and would be
 * caught immediately by his COO or his developer. The page reports the score,
 * states the field data beside it, and never makes the twenty-one second
 * claim.
 *
 * NO PRICE, NO TIER, NO DEADLINE. He is deciding whether to take a meeting,
 * not choosing a package. Pricing belongs in the meeting.
 *
 * NO COMPLIMENTS ON THE BUILD. The site scores well and those scores appear
 * as data inside the site disclosure. They are not praise and they are not
 * the argument.
 */

export type Tone = "critical" | "warn" | "positive" | "neutral";

export const practice = {
  name: "Miller Vein",
  owner: "Dr. Jeffrey Miller",
  domain: "millervein.com",
  location: "Michigan",
  auditDate: "October 6, 2026",
};

/* ============================================================
   01 — HERO
   ============================================================ */

export const meta = {
  /** Absolute — the root layout's "%s | InflowMD" template would otherwise
      put our name on his document and on the PDF he saves from it. */
  title: "Miller Vein — Practice Audit",
  eyebrow: "Practice Audit · Prepared for Dr. Jeffrey Miller",
  /** The headline is split so the accent phrase can carry the critical token.
      It is the finding, and it is the only red thing in the hero.

      WORDED WITH CARE, and the wording is load-bearing. An earlier draft read
      "Your Troy physician works for a competitor." We cannot support that: we
      know what the directories PUBLISH, and we have not checked — and cannot
      claim — where Dr. Bannon actually practises beyond what millervein.com
      says. Published as it stood, it could have sent Dr. Miller to confront
      his own physician over a 2019 federal record. The claim on this page is
      about what patients are shown, which is the thing we measured. */
  h1Lead: "Patients looking up your Troy physician are shown",
  h1Accent: "a competitor's name",
  h1Tail: ".",
  sub: "Not because anything changed at your practice — because a federal record from 2019 is still feeding the directories. Here is what else the internet currently believes about Miller Vein.",
  /** An inline row, not cards. Four figures, no gauges — a score ring in the
      hero would frame this as a website report, which is what it is not. */
  figures: [
    { value: "8", label: "clinics" },
    { value: "2,014", label: "Google reviews verified" },
    { value: "1", label: "federal record for the practice" },
    { value: "2019", label: "last time it was updated" },
  ],
};

/* ============================================================
   02 — THE CLINIC GRID
   ============================================================ */

export const clinicGrid = {
  eyebrow: "Federal registry · verified October 6",
  title: "Eight clinics. One record. Wrong city.",
  /** state: "wrong" = a record exists and its data is wrong; "none" = no
      organization record exists at all. Dearborn is the only "wrong". */
  clinics: [
    { city: "Dearborn", status: "Novi address", state: "wrong" as const },
    { city: "Novi", status: "No record", state: "none" as const },
    { city: "Troy", status: "No record", state: "none" as const },
    { city: "Macomb", status: "No record", state: "none" as const },
    { city: "Auburn Hills", status: "No record", state: "none" as const },
    { city: "St. Clair Shores", status: "No record", state: "none" as const },
    { city: "Grand Rapids", status: "No record", state: "none" as const },
    { city: "Holland", status: "No record", state: "none" as const },
  ],
  legend: [
    { state: "wrong" as const, text: "Record exists, data is wrong" },
    { state: "none" as const, text: "No organization record at all" },
  ],
  footnote:
    "The one record is named “MILLER VEIN — DEARBORN”, carries a Novi street address at Suite 105 rather than 215, and was last updated November 2019.",
};

/* ============================================================
   03 — THE FOUR EXHIBITS
   ============================================================ */

export type ListingCard = {
  source: string;
  name: string;
  fields: { label: string; value: string; tone: Tone }[];
  city: string;
};

export type Visual =
  | { kind: "listings"; cards: ListingCard[] }
  | {
      kind: "addresses";
      halves: { figure: string; label: string; address: string; tone: Tone }[];
    }
  | { kind: "tiles"; tiles: { label: string; on: boolean }[]; caption: string }
  | {
      kind: "phones";
      rows: { number: string; source: string; tone: Tone }[];
    };

export type Exhibit = {
  id: string;
  figure: string;
  figureTone: Tone;
  headline: string;
  line: string;
  /** Optional plain line between the claim and the visual. Used where the
      exhibit could be misread as an accusation about a person. */
  reassurance?: string;
  visual: Visual;
  disclosure?: { label: string; blocks: string[] };
};

export const exhibitsSection = {
  title: "Four things sending patients somewhere else.",
};

export const exhibits: Exhibit[] = [
  {
    id: "providers",
    figure: "1 of 2",
    figureTone: "critical",
    headline: "Directories are publishing your physicians under other companies",
    line: "Her federal record has not been updated since 2019. It lists addresses that are not yours and flags her as practising independently, so the directories filled in the rest themselves.",
    /** Plain text above the visual, not a disclosure. The reader must not be
        able to reach the mock listings without having read this first. */
    reassurance:
      "This is a records problem, not a staffing one. Dr. Bannon is listed as your Troy provider on your own site; the directories simply never read it.",
    visual: {
      kind: "listings",
      cards: [
        {
          source: "What Vitals.com publishes",
          name: "Dr. Krista Bannon, MD",
          fields: [
            { label: "Specialty", value: "Surgery", tone: "critical" },
            { label: "Practice", value: "Metro Vein Centers", tone: "critical" },
          ],
          city: "Rochester Hills, MI",
        },
        {
          source: "What your website says",
          name: "Dr. Krista Bannon, MD",
          fields: [
            { label: "Specialty", value: "Vein & vascular", tone: "positive" },
            { label: "Practice", value: "Miller Vein", tone: "positive" },
          ],
          city: "Troy, MI",
        },
      ],
    },
    disclosure: {
      label: "See the full chain",
      blocks: [
        "Nothing here is a claim about where anyone works — it is a claim about what the directories publish, and why.",
        "**Her federal record, last updated March 28, 2019.** It lists three addresses — Rochester Hills, Detroit and Southfield — and not one Miller Vein address among them. Her taxonomy code is `208600000X`, which reads as “Surgery”, not vein, vascular or phlebology. She is flagged a **sole proprietor**, so the registry describes a physician practising on her own.",
        "**What each directory did with that record.** Vitals published the practice name **“Metro Vein Centers”** — a direct competitor — with the specialty “Surgery” read literally off the taxonomy code. Sharecare filed her under **“Seton Health Corporation of Southeastern Michigan”**, a third unrelated employer. WebMD still carries her **former name**, as a general surgeon, which is a direct ingestion of the former-name field still sitting on the federal record. WebMD also holds two separate practice records for Miller Vein.",
        "**Dr. Miller's own record is the opposite case, and worth saying so.** It was updated **March 6, 2026** and carries seven practice locations, all matching the site. That is better maintained than most. Sharecare still files him under **“A1 Home Health Care”** — a real, unrelated home-health business that happens to occupy the same Novi building and suite number. That profile carries zero reviews.",
        "The mechanism, with no accusation in it: healthcare directories ingest the federal registry automatically and **re-pull from it on a cycle**. A directory corrected by hand stays corrected until the next re-pull, then quietly reverts to whatever the federal record says. **That is why the same wrong entries keep reappearing after somebody has already fixed them.** Federal record first, or the directory work does not hold.",
      ],
    },
  },
  {
    id: "reviews",
    figure: "785",
    figureTone: "critical",
    headline: "Your biggest pile of reviews points at a building you left",
    line: "Roughly two in five of every review we could verify, anchored to an address patients cannot visit.",
    visual: {
      kind: "addresses",
      halves: [
        {
          figure: "785",
          label: "Reviews sit here",
          address: "46325 W 12 Mile Rd, Ste 150, Novi 48377",
          tone: "critical",
        },
        {
          figure: "—",
          label: "Your Novi clinic is here",
          address: "25500 Meadowbrook Rd, Ste 215, Novi 48375",
          tone: "neutral",
        },
      ],
    },
    disclosure: {
      label: "Where the rest of the 2,014 sit",
      blocks: [
        "**Novi 785 · Macomb 526 · Troy 440 · Auburn Hills 262 · Farmington Hills 4.** Ratings run 4.9 to 5.0 everywhere except the Farmington Hills corporate office, which carries **4.3 from four reviews** and competes for brand-name searches with your worst rating attached to it.",
        "Those five profiles cover **four of your eight clinics plus the corporate office**, so profiles for the other four clinics were not located. Your own site claims over 3,000 reviews, which is entirely plausible — we are reporting the verified figure rather than the assumed one.",
        "The W 12 Mile address itself appears with **three different suite numbers across three sources** — 150, 335, and none at all. Different street, different suite and different ZIP from the Novi clinic you actually occupy.",
      ],
    },
  },
  {
    id: "unclaimed",
    figure: "4 of 5",
    figureTone: "critical",
    headline: "Nobody can correct your listings or answer a review",
    line: "An unclaimed profile cannot be fixed, cannot reply to a patient, and leaves its address open to third-party edits.",
    visual: {
      kind: "tiles",
      tiles: [
        { label: "Novi", on: false },
        { label: "Macomb", on: false },
        { label: "Troy", on: true },
        { label: "Auburn H.", on: false },
        { label: "Farm. H.", on: false },
      ],
      caption: "Only Troy is claimed. Claiming the rest is free.",
    },
  },
  {
    id: "phones",
    figure: "3",
    figureTone: "warn",
    headline: "Three phone numbers are circulating as your main line",
    line: "The one printed on your own website appears in no federal record at all.",
    visual: {
      kind: "phones",
      rows: [
        { number: "(877) 432-2184", source: "Your website", tone: "neutral" },
        { number: "(248) 344-9110", source: "Every federal record", tone: "neutral" },
        { number: "(877) 250-7533", source: "Third-party listing", tone: "critical" },
      ],
    },
    disclosure: {
      label: "And six versions of the practice name",
      blocks: [
        "**Miller Vein · MILLER VEIN - DEARBORN · ADVANCED VEIN THERAPIES PLLC · Miller Vein Troy · Miller Vein - Macomb · MILLER VEIN - NOVI / TROY / MACOMB forms.** Six names for one practice, in circulation now.",
        "Why the phone number matters more than it looks: **aggregators commonly de-duplicate by phone number.** A conflicting number is the precondition for two of your offices merging into one listing, or for one office splitting into two. Reconciling the numbers is what stops the name variants multiplying.",
        "The Better Business Bureau still carries a **Troy address you have left** — 230 W. Maple Rd — against your current 4550 Investment Dr.",
      ],
    },
  },
];

/* ============================================================
   04 — THE SITE
   ============================================================ */

export const site = {
  eyebrow: "The website · measured October 6, 2026",
  title: "Where the site is today.",
  tiles: [
    { score: "90", label: "AI readiness", note: "11 of 11 checks", tone: "positive" as Tone },
    { score: "83", label: "Search readiness", note: "9 of 9 checks", tone: "warn" as Tone },
    { score: "54", label: "Speed", note: "Google PageSpeed", tone: "critical" as Tone },
  ],

  /**
   * THE REFERENCE BUILD. centerforveincareandsurgery.com is ours, and every
   * figure attributed to it below was measured through the live audit engine
   * on October 9, 2026, uncached, twice:
   *
   *   AI readiness   100 / 100   (11 of 11 checks, both runs)
   *   Search ready   100 / 100   ( 9 of  9 checks, both runs)
   *   Speed           89 /  92   (lab LCP 3.38s then 2.93s, FCP ~1.18s, CLS 0)
   *   Field LCP      NOT AVAILABLE — Google holds no real-user data for it
   *
   * Speed is quoted as the 89–92 band rather than a single figure, because
   * two runs the same day returned two numbers and neither is "the" score.
   * The 100s are quoted flat, because they did not move.
   *
   * NOTHING ON THIS PAGE PROMISES MILLER VEIN A FUTURE SCORE. We show what a
   * build of ours measures today and name the domain so he can run it
   * himself. A projected number for his site would be a number we invented.
   */
  future: {
    title: "Where we would take it.",
    stacks: [
      {
        label: "WordPress + page builder",
        note: "The current stack",
        ours: false,
        bullets: [
          "Every page assembled at request time",
          "Plugins stacked by different hands over years",
          "Speed is whatever the theme and plugin set allow",
          "54 on Google's own scoring",
        ],
      },
      {
        label: "Next.js on Vercel",
        note: "What we build",
        ours: true,
        bullets: [
          "Pages pre-rendered and served from the edge",
          "One component system, one source of truth",
          "Performance is a build-time property, not a plugin",
          "89–92 on Google's own scoring",
        ],
      },
    ],
  },

  comparison: {
    /** The original three bars were measured October 6; the fourth on
        October 9. The title said "same day" when all three were — it cannot
        say it now, so it says the thing that is still true of all four. */
    title: "Search readiness · the same test, every bar measured",
    rows: [
      { label: "Center for Vein Restoration", value: 94, variant: "other" as const },
      { label: "Miller Vein", value: 83, variant: "self" as const },
      { label: "Metro Vein Centers", value: 83, variant: "other" as const },
      {
        label: "An InflowMD build",
        sublabel: "centerforveincareandsurgery.com",
        value: 100,
        variant: "ours" as const,
      },
    ],
  },
  comparisonNote:
    "Every bar is a measured figure on the same test — Miller Vein and the two competitors on October 6, our own build on October 9. Not a projection: a site you can go and run yourself.",

  disclosure: {
    label: "What the three numbers actually measure",
    blocks: [
      "**Speed 54.** That is Google's own score on a deliberately throttled phone, where the homepage takes **21.56s** to settle. Google's real-user Chrome data for the same site returns **2.02s**. So patients are **not** waiting twenty-one seconds and we will not say they are. What matters is that Google ranks on the throttled number, and that a page this heavy punishes anyone on a weak signal.",
      "**AI readiness 90.** The crawler block you audited on the staging build never reached production. GPTBot, ClaudeBot, PerplexityBot and Google-Extended are all allowed, an `llms.txt` is published, and the site carries twenty-one types of machine-readable medical schema. That is ahead of most of this specialty.",
      "**Search readiness 83** — eleven points behind the national competitor. The gap is four things and a fifth: two competing main headings on the homepage, a heading-level skip from level two to level six, a search description at 159 characters that will be trimmed mid-sentence, a redirect hop from the bare domain to `www`. And every location page answers at **three different URLs**, because the previous site's structure was never redirected — the canonical tags are set correctly, which mitigates most of it, but crawl budget is spent on all three.",
    ],
  },
};

/* ============================================================
   05 — THE PLAN
   ============================================================ */

export const plan = {
  title: "Fastest return first.",
  sub: "Phase one is worth doing whoever does it. None of it requires a rebuild, and none of it requires us.",
  phases: [
    {
      num: "01",
      timeframe: "Days",
      name: "Stop the misrouting",
      bullets: [
        "Correct the federal records — the Dearborn/Novi mismatch, the parent entity, and Dr. Bannon's",
        "Claim the four open profiles",
        "Move the 785 reviews onto the clinic that exists",
      ],
    },
    {
      num: "02",
      timeframe: "Weeks",
      name: "One definition of the practice",
      bullets: [
        "Organization records for the seven clinics with none",
        "Reconcile the phone numbers and the six name variants",
        "Clean the directories in order — federal first",
      ],
    },
    {
      num: "03",
      timeframe: "Ongoing",
      name: "Close the gap on the site",
      bullets: [
        "The four engine items and the duplicate URLs",
        "The eleven points to the national player",
        "Monitoring, so a record that drifts is caught that month",
      ],
    },
  ],
};

/* ============================================================
   06 — CLOSE
   ============================================================ */

export const close = {
  title: "Twenty minutes, and you can check every line of this yourself.",
  body: "We will walk the federal registry together on screen. Whatever you decide afterwards, the Phase One list is yours to keep.",
  ctaLabel: "Book a working session",
  ctaHref: "https://calendly.com/inflowmd/strategy-call",
  signature: { name: "Clayton Peterson · InflowMD", email: "clayton@inflowmd.com" },
};

export const footer = {
  line: "Prepared by InflowMD for Dr. Jeffrey Miller, Miller Vein, Michigan. Confidential. October 6, 2026.",
  /** Behind disclosure rather than deleted. The could-not-verify list is the
      part of a document like this that keeps the rest of it trustworthy. */
  methodLabel: "Method, and what we could not verify",
  method: [
    "Site walk, engine scores, federal records, directory profiles and two competitor runs, all verified by hand on October 6, 2026. Federal records checked directly at **npiregistry.cms.hhs.gov**, where every line above can be re-checked. Speed measured by Google PageSpeed Insights and reported with both its lab and field figures; search and AI readiness analyzed by InflowMD.",
    "**Recorded as unverified rather than estimated:** Healthgrades (HTTP 403), Facebook and most of Yelp (blocked by robots), Google Business Profile owner-side data — categories, services, posting and reply behaviour — which cannot be seen from outside the account, and a handful of Doximity profiles we could not disambiguate. Directory and review data change continuously.",
  ],
};
