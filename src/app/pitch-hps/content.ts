/**
 * /pitch-hps — copy and evidence for the nine-scene HPS patient-journey concept.
 *
 * EVERY NUMBER CARRIES ITS TOOL, TARGET AND DATE. Google PageSpeed lab scores
 * and the InflowMD automated rubric are separate rows and are never blended.
 * Where a comparable measurement does not exist it is left unmeasured and said
 * so; a measured low score is shown as measured.
 *
 * Nothing here claims a ranking, an AI citation, a conversion, a clinical
 * outcome, a booked appointment or that one platform is better than another.
 */

export const meta = {
  title: "HPS patient journey — a concept review | InflowMD",
  description:
    "An unlisted concept review for HPS: a practice site that teaches treatment and screens patients, with every measurement labelled by tool and date.",
  reviewLabel: "Concept review",
};

export const links = {
  magnantDemo: "https://vein-specialists.vercel.app/",
  magnantScreening: "https://vein-specialists.vercel.app/eveinscreening/",
  magnantAblation:
    "https://vein-specialists.vercel.app/vein-treatment-options/endovenous-ablation/",
  cvrQuiz: "https://www.centerforvein.com/self-assessment",
  cvrHome: "https://www.centerforvein.com/",
  /* The October 26, 2026 matched pair: one analysis per homepage, read on both
     device tabs. These are the only PageSpeed reports this page cites. */
  psiMagnantMobile:
    "https://pagespeed.web.dev/analysis/https-vein-specialists-vercel-app/5kjdxt3sg4?form_factor=mobile",
  psiMagnantDesktop:
    "https://pagespeed.web.dev/analysis/https-vein-specialists-vercel-app/5kjdxt3sg4?form_factor=desktop",
  psiCvrMobile:
    "https://pagespeed.web.dev/analysis/https-www-centerforvein-com/51ta0k6owf?form_factor=mobile",
  psiCvrDesktop:
    "https://pagespeed.web.dev/analysis/https-www-centerforvein-com/51ta0k6owf?form_factor=desktop",
};

/** The nine scenes. One short statement each; `label` names it in the counter. */
export type Scene = {
  id: string; label: string; kicker?: string;
  title: string; titleAccent: string; body: string;
  /** scene 4 only: the second, shorter beat under the animation */
  beat?: string; beatBody?: string;
};
export const scenes: readonly Scene[] = [
  {
    id: "open", label: "Open",
    title: "Websites that", titleAccent: "teach.",
    body: "A patient-journey concept for HPS.",
  },
  {
    id: "symptom", label: "Symptom",
    kicker: "Where it starts",
    title: "A symptom.", titleAccent: "A question.",
    body: "Someone notices something in their own legs and goes looking for an answer.",
  },
  {
    id: "practice", label: "Practice",
    kicker: "The practice",
    title: "A practice, presented", titleAccent: "properly.",
    body: "A real pre-launch build, running today.",
  },
  {
    id: "treatment", label: "Treatment",
    kicker: "Teaching",
    title: "How we teach", titleAccent: "treatment.",
    body: "RFA, explained in motion.",
    beat: "Bring understanding into the exam room.",
    beatBody:
      "The same page opens on a tablet while a clinician and a patient are talking it through.",
  },
  {
    id: "screening", label: "Screening",
    kicker: "Screening",
    title: "Screening that", titleAccent: "responds.",
    body: "Tap what you see. The legs answer back.",
  },
  {
    id: "scorecard", label: "Scorecard",
    kicker: "Measurement",
    title: "Side by", titleAccent: "side.",
    body: "Homepage against homepage, each cell labelled with its tool and date.",
  },
  {
    id: "order", label: "Order",
    kicker: "Sequence",
    title: "Two ways to", titleAccent: "screen.",
    body: "Both educate and screen. The order is the difference.",
  },
  {
    id: "pilot", label: "Pilot",
    kicker: "Proving it",
    title: "Pilot it.", titleAccent: "Measure it.",
    body: "Baseline, then an agreed journey, then measurement.",
  },
  {
    id: "build", label: "Build",
    kicker: "Next",
    title: "Let's build it", titleAccent: "together.",
    body: "Walk the demo, or outline a pilot.",
  },
];

/** Scene 2 — the fragments a patient arrives with. */
export const concerns = [
  "My legs ache by the end of the day.",
  "One ankle swells and the other does not.",
  "A vein has changed and I do not know if it matters.",
  "Standing all day leaves my legs heavy.",
];

/**
 * Real captures, pre-optimized. Each `ratio` is the capture's own pixel ratio
 * and each was taken at the viewport it is shown in: the desktop capture at
 * 1440 CSS px, the phone captures at 390 CSS px. No capture is stretched into
 * a device it was not taken on.
 */
export const shots = {
  magnantDesktop: {
    base: "magnant-desktop", widths: [720, 1440], ratio: "2880 / 1800",
    alt: "Vein Specialists pre-launch homepage on a desktop screen: a heading reading “Expert Vein Care for Leg Pain, Swelling and Varicose Veins” above the practice navigation.",
  },
  cvrHome: {
    base: "cvr-home", widths: [360, 720], ratio: "780 / 1688",
    alt: "The Center for Vein Restoration homepage as it renders on a phone.",
  },
  magnantHome: {
    base: "magnant-home", widths: [360, 720], ratio: "780 / 1688",
    alt: "The Vein Specialists pre-launch homepage as it renders on a phone.",
  },
  magnantQuestions: {
    base: "magnant-questions", widths: [360, 720], ratio: "780 / 1688",
    alt: "The Vein Specialists online screening on a phone, at step 1 of 4: a Signs / Symptoms / History / Result rail above \u201cWhat you can see\u201d and a list of signs to check.",
  },
  magnantScreening: {
    base: "magnant-screening", widths: [360, 720], ratio: "780 / 1688",
    alt: "Vein Specialists pre-launch online vein screening entry screen on a phone, opening with questions about what the patient can see on their legs.",
  },
  cvrStep1: {
    base: "cvr-step1", widths: [360, 720], ratio: "780 / 1800",
    alt: "Center for Vein Restoration self-assessment, step 1 of 5, asking first name, last name, email address, zip code, phone and follow-up consent before any symptom question.",
  },
} as const;

export const captions = {
  magnantDesktop: "Pre-launch build · Vein Specialists · desktop captured October 26, 2026 at 1440 CSS px; phone captured October 24, 2026 at 390 CSS px",
  magnantHome: "Pre-launch build · Vein Specialists · captured October 24, 2026 at 390 CSS px",
  magnantScreening: "Pre-launch build · Vein Specialists · captured October 24, 2026 at 390 CSS px",
  magnantQuestions: "Pre-launch build · Vein Specialists · captured October 26, 2026 at 390 CSS px",
  cvrStep1: "centerforvein.com self-assessment · captured October 24, 2026 at 390 CSS px",
};

/* ───────────────────────── scene 4 — the real RFA explainer ─────────────────────────
   Ported from the practice site's own endovenous-ablation explainer:
   src/components/content/VeinFixExplainer.tsx and src/data/explainers.ts at
   vein-specialists eec6a944f368ad392e72d9b213efa32bfa23e90f. The geometry,
   renderer and step copy are the real ones.

   The source clinical copy is PENDING PHYSICIAN REVIEW. It is not presented
   here as clinician-approved, and the source step-3 sentence about returning
   to normal activity is deliberately omitted: this concept makes no recovery,
   candidacy or outcome claim. Nothing else in the mechanism is altered. */
export const rfa = {
  micro: "How we fix it",
  heading: "From faulty vein to healthy flow.",
  steps: [
    {
      title: "The problem: valves that leak.",
      body: "Healthy veins have one-way valves that keep blood moving up toward the heart. When they fail, blood falls backward and pools, and the vein stretches, twists and bulges.",
    },
    {
      title: "The fix: we close the faulty vein.",
      body: "Guided by ultrasound, a thin catheter seals the leaking vein from the inside. It’s done in our office, under local anesthesia.",
    },
    {
      title: "The result: blood takes the healthy route.",
      body: "Healthy veins carry the blood back to the heart, and the pressure is relieved.",
    },
  ],
  status: ["Reflux: blood pooling", "Sealing the faulty vein", "Healthy flow restored"],
  heart: "Toward the heart ↑",
  use: "On the website. In the exam room.",
  labels: [
    { step: 0, title: "Valves leak", small: "Blood falls backward ↓", x: 7, y: 44, side: "l" },
    { step: 0, title: "Healthy vein", small: "Valves closed, flow ↑", x: 8, y: 30, side: "r" },
    { step: 1, title: "Catheter seals", small: "the faulty vein", x: 7, y: 62, side: "l" },
    { step: 2, title: "Rerouted", small: "Healthy flow home ↑", x: 8, y: 56, side: "r" },
  ],
  driver:
    "Scrolling drives it from 900px up, exactly as the practice site does: the stage pins and the scroll position maps to the same 0\u20133 progression. On phones the three step controls move it, as they do there. The Replay control, and the Play control on phones, are added for this review \u2014 the practice site has neither, and neither starts on its own.",
  provenance:
    "The animation and its geometry are the practice site’s own endovenous-ablation explainer, ported from vein-specialists at commit eec6a94 with the mechanism unchanged. The step copy is adapted from that explainer — faithfully shortened, with its closing sentence about returning to normal activity omitted. It is pending physician review and is not presented as approved.",
} as const;

/* ───────────────────────── scene 5 — the real screener ─────────────────────────
   Signs, side choices, leg geometry and overlays ported from
   src/components/site/SymptomScreener.tsx and src/data/evein.ts at the same
   commit. Selections live in component state only: nothing is stored, sent,
   put in the URL or reported to analytics, and no intake is submitted. */
export type SignItem = { id: string; t: string; sides: boolean };
export type SignGroup = { title: string; items: readonly SignItem[] };
export const signGroups: readonly SignGroup[] = [
  {
    title: "Veins and swelling",
    items: [
      { id: "s_sp", t: "Spider veins", sides: true },
      { id: "s_var", t: "Bulging varicose veins", sides: true },
      { id: "s_swl", t: "Ankle or leg swelling", sides: true },
    ],
  },
  {
    title: "Skin changes",
    items: [
      { id: "s_disc", t: "Brown discoloration, or red, itchy skin on the lower leg", sides: true },
      { id: "s_hard", t: "Hard, tight, or shiny skin near the ankle", sides: true },
      { id: "s_heal", t: "A leg sore that has healed", sides: true },
      { id: "s_open", t: "An open leg sore", sides: true },
    ],
  },
  {
    title: "Elsewhere",
    items: [{ id: "s_pelv", t: "Pelvic or lower back pain", sides: false }],
  },
];

export const screener = {
  eyebrow: "Start here",
  heading: "Where do your legs stand?",
  lede: "Tap anything you see on your legs.",
  legs: { right: "Right leg", left: "Left leg" },
  sideLabels: { R: "Right", L: "Left", B: "Both" },
  sideWords: { R: "right", L: "left", B: "both legs" },
  empty: "Nothing picked yet",
  emptyBody: "Your legs update as you tap.",
  picked: (n: number) => `You picked ${n} ${n === 1 ? "sign" : "signs"}`,
  pickedBody: "Screening helps guide the next step.",
  pelvicNote: "+ Pelvic or lower back pain",
  cta: "Continue",
  privacy: "Nothing you tap is saved or sent.",
  nextHead: "Your next step: a vein screening",
  nextBody:
    "The practice’s own online screening adds a few symptom and history questions, then gives the patient their next step.",
  nextCarried: "What you picked here:",
  nextNone: "No visible signs picked.",
  nextLink: "Open the practice screening",
  back: "Back to the signs",
  countNote:
    "The count is how many signs are selected. It is not a diagnosis, a stage, a severity or a score.",
} as const;

/* ───────────────────────── scene 6 — the scorecard ───────────────────────── */

/**
 * A MATCHED PAIR. Both homepages were analysed in the same session on
 * October 26, 2026 at 00:38 UTC through Google's own PageSpeed Insights, with
 * the same Lighthouse 13.5.0 and the same device configurations: emulated
 * Moto G Power on Slow 4G for mobile, emulated desktop with custom throttling
 * for desktop. One initial-load run per homepage per device. Neither run was
 * repeated to obtain a better number.
 *
 * The InflowMD rubric rows are NOT same-day and say so on their own cells.
 * A measured low score is shown as measured: the pre-launch preview's SEO 69
 * is reported with the reason Lighthouse gives for it.
 */
/**
 * The same measurements, as a selector rather than a six-row grid. Every
 * measured value the report carried is still here and still reachable: each
 * metric is a tab carrying its own tool, date and report link, and the
 * unfavourable ones are shown exactly as measured.
 */
export type Metric = {
  key: string; tab: string;
  left: string; right: string;
  /** numeric where the metric has a score to band; null where it has none */
  leftN: number | null; rightN: number | null;
  /** which banding applies — each metric's own scale, never another's */
  band: "psi" | "inflowmd" | "none";
  /** the concise on-slide label: tool, category, date */
  label: string;
  hrefL?: string; hrefR?: string;
};
export const metrics: readonly Metric[] = [
  { key: "mobile", tab: "Mobile", left: "86", right: "59", leftN: 86, rightN: 59, band: "psi",
    label: "Google PageSpeed · mobile · Oct 26",
    hrefL: links.psiMagnantMobile, hrefR: links.psiCvrMobile },
  { key: "desktop", tab: "Desktop", left: "100", right: "80", leftN: 100, rightN: 80, band: "psi",
    label: "Google PageSpeed · desktop · Oct 26",
    hrefL: links.psiMagnantDesktop, hrefR: links.psiCvrDesktop },
  { key: "seo", tab: "Google SEO", left: "69", right: "92", leftN: 69, rightN: 92, band: "psi",
    label: "Google PageSpeed · SEO · Oct 26",
    hrefL: links.psiMagnantMobile, hrefR: links.psiCvrMobile },
  { key: "ai", tab: "AI rubric", left: "94", right: "97", leftN: 94, rightN: 97, band: "inflowmd",
    label: "InflowMD auditor · AI readiness · Oct 26 / Oct 24" },
  { key: "findability", tab: "Findability", left: "100", right: "94", leftN: 100, rightN: 94, band: "inflowmd",
    label: "InflowMD auditor · findability · Oct 26 / Oct 24" },
  { key: "field", tab: "Field data", left: "No data", right: "Mobile failed · desktop passed",
    leftN: null, rightN: null, band: "none",
    label: "Chrome UX Report · field data · Oct 26" },
];

export const scorecard = {
  head: "Homepage against homepage",
  matched:
    "Both homepages, same session, same tool, same device profiles · Google PageSpeed Insights · Lighthouse 13.5.0 · October 26, 2026, 00:38 UTC · one initial-load run per device",
  left: { name: "Vein Specialists", sub: "vein-specialists.vercel.app · pre-launch build", href: links.magnantDemo },
  right: { name: "Center for Vein Restoration", sub: "centerforvein.com · live", href: links.cvrHome },
  rows: [
    {
      metric: "Mobile performance",
      tool: "Google PageSpeed lab run · Moto G Power, Slow 4G",
      left: { value: "86", when: "Oct 26, 2026", href: links.psiMagnantMobile, tone: "amber" as const },
      right: { value: "59", when: "Oct 26, 2026", href: links.psiCvrMobile, tone: "amber" as const },
    },
    {
      metric: "Desktop performance",
      tool: "Google PageSpeed lab run · emulated desktop",
      left: { value: "100", when: "Oct 26, 2026", href: links.psiMagnantDesktop, tone: "green" as const },
      right: { value: "80", when: "Oct 26, 2026", href: links.psiCvrDesktop, tone: "amber" as const },
    },
    {
      metric: "Google SEO (Lighthouse)",
      tool: "Google PageSpeed lab run · same score on both devices",
      left: { value: "69", when: "Oct 26, 2026", href: links.psiMagnantMobile, tone: "amber" as const,
        note: "Measured as shown. Lighthouse reports the page as blocked from indexing: a pre-launch preview is deliberately set noindex, and that is what this check penalises." },
      right: { value: "92", when: "Oct 26, 2026", href: links.psiCvrMobile, tone: "green" as const },
    },
    {
      metric: "AI readiness (InflowMD rubric)",
      tool: "InflowMD automated rubric · not a Google score · not same-day",
      left: { value: "94", when: "Oct 26, 2026", tone: "green" as const, flag: "different date" as const },
      right: { value: "97", when: "Oct 24, 2026", tone: "green" as const, flag: "different date" as const },
    },
    {
      metric: "Findability (InflowMD rubric)",
      tool: "InflowMD automated rubric · not a Google score · not same-day",
      left: { value: "100", when: "Oct 26, 2026", tone: "green" as const, flag: "different date" as const },
      right: { value: "94", when: "Oct 24, 2026", tone: "green" as const, flag: "different date" as const },
    },
    {
      metric: "Field data (Chrome UX Report)",
      tool: "Real-user data, latest 28 days, this URL",
      left: { value: "No data", when: "Oct 26, 2026", tone: "none" as const,
        note: "CrUX field data is unavailable for this preview. That is not a measurement of how much traffic it has." },
      right: { value: "Mobile failed · desktop passed", when: "Oct 26, 2026", tone: "none" as const,
        note: "Mobile LCP 2.8s · INP 110ms · CLS 0. Desktop LCP 1.2s · INP 57ms · CLS 0.01." },
    },
  ],
  prelaunch:
    "The left column is a pre-launch preview: deliberately not indexed, still being built, and with no field data available.",
  caveats: [
    "One initial-load lab run per homepage per device. A single run is not a site average, a controlled experiment, a before-and-after, or evidence that one platform causes a faster site.",
    "The two performance and SEO columns are matched: same session, same tool version, same emulated device and throttling, minutes apart. The two InflowMD rubric columns are not — they were run on different dates, and are labelled on each cell.",
    "The preview and the live site are in different deployment and indexing states. That difference is the reason for the SEO row, and it is not a quality judgement about either site.",
    "Lab LCP is not what an average patient experiences. Field data is real-user data, is shown separately, and is never combined with a lab score here.",
    "No CrUX data does not establish that a site has no traffic.",
    "The InflowMD rubric is an automated check of crawlable structure, machine-readable practice details and whether patient questions are answered on the page. It does not measure AI citations, recommendation frequency, search rankings or clinical quality, and it is not a mobile test.",
    "Homepage against homepage only. No interior page is compared to another site's homepage.",
    "Nothing here is claimed to be equal or better beyond the dated values shown, and no row implies a conversion, a ranking or a clinical outcome.",
  ],
  psiDetail: {
    tool: "Google PageSpeed Insights · Lighthouse 13.5.0 · Headless Chromium 153.0.8010.36, read through Google's own hosted interface",
    when: "Vein Specialists reported Oct 25, 2026, 8:38:32 PM EDT; Center for Vein Restoration reported 8:38:43 PM EDT — October 26, 2026, 00:38 UTC",
    config: "Mobile: emulated Moto G Power, Slow 4G. Desktop: emulated desktop, custom throttling. Single page session, initial page load.",
    magnantMetrics: "Vein Specialists — mobile FCP 1.8s · LCP 3.7s · TBT 10ms · CLS 0 · SI 4.3s. Desktop FCP 0.4s · LCP 0.6s · TBT 0ms · CLS 0 · SI 0.6s. Accessibility 100, best practices 100 on both.",
    cvrMetrics: "Center for Vein Restoration — mobile FCP 2.0s · LCP 10.9s · TBT 300ms · CLS 0 · SI 8.7s. Desktop FCP 0.5s · LCP 2.0s · TBT 220ms · CLS 0 · SI 1.8s. Accessibility 97 mobile / 100 desktop, best practices 96.",
    rounding: "Metrics are quoted as Google's interface rounds them.",
    auditorWhen:
      "InflowMD rubric: the Vein Specialists homepage was checked on October 26, 2026 at 00:31 UTC and centerforvein.com on October 24, 2026, so these two are not a same-day pairing. Neither run has a shareable report URL.",
    auditorResolved:
      "The AI-readiness score of 94 comes from 11 checks that all resolved, which is not the same as 11 checks that all passed: the AI-crawler check did not pass. Findability resolved 9 checks.",
    banding: "Google's banding: 0–49 red, 50–89 amber, 90–100 green.",
  },
} as const;

/* ───────────────────────── scene 7 — the order ───────────────────────── */
export const order = {
  headline: "Both educate and screen. The order is the difference.",
  left: {
    label: "Contact first",
    source: "centerforvein.com/self-assessment",
    href: links.cvrQuiz,
    shot: "cvrStep1" as const,
    caption:
      "Step 1 of 5 asks for first name, last name, email address, zip code, phone and follow-up consent. The symptom questions come after.",
  },
  right: {
    label: "Signs first",
    source: "vein-specialists.vercel.app/eveinscreening/",
    href: links.magnantScreening,
    shot: "magnantQuestions" as const,
    caption:
      "The screening opens on what the patient can see on their own legs. Contact details come later, if the patient chooses to continue.",
  },
  note:
    "Two different sequences, both of which educate and screen. Neither capture is evidence about how many patients either one converts.",
  method:
    "On centerforvein.com the cookie notice was hidden locally so the page is not shown behind a modal — it was never accepted and no consent was stored. Step 1 was reached using the page’s own visible “Start Quiz” control. No field was filled, nothing was submitted, and no form field, consent control or source label was hidden. Both captures were taken at 390 CSS px at 2×; the page heights differ, so these are not identical viewports.",
} as const;

/* ───────────────────────── scene 8 — the pilot ───────────────────────── */
export const pilot = [
  { label: "Education engagement", body: "Whether patients reach and read the explanations." },
  { label: "Screening starts and completions", body: "How many begin the screening, and how many finish it." },
  { label: "Qualified evaluation requests", body: "Genuine requests for an evaluation, excluding spam and duplicates." },
  { label: "Verified staff receipt", body: "Confirmation that the office actually received each request." },
  { label: "Scheduling and attendance", body: "Where the practice authorizes sharing it." },
];

export const pilotNote =
  "Baseline first, then an agreed journey, then measurement. Targets are set after the baseline exists — none is proposed here.";

export const footer = {
  brand: "InflowMD",
  note:
    "Unlisted concept page prepared for an HPS review conversation. Not linked from site navigation and not indexed. The practice site shown is a pre-launch preview used with permission; its clinical copy is pending physician review.",
};
