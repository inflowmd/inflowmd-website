/**
 * /pitch-hps — HPS patient-journey concept. Copy and evidence only.
 *
 * WHAT THIS PAGE IS ALLOWED TO SAY. Every number here is a recorded
 * measurement with a named tool, target, date and device, and every one of
 * them is labelled as such on screen. Nothing claims a ranking, an AI
 * citation, a conversion, a revenue effect or a platform being better than
 * another platform. Where a comparison cannot be made fairly, the page says
 * so rather than reaching for a number.
 *
 * THINGS DELIBERATELY ABSENT, because earlier material asserted them without
 * support: "42 vs 98"; "Same test. Same day. Different architecture";
 * guaranteed AI recommendations; "invisible to AI"; any Next.js-beats-
 * WordPress generalisation; conversion multipliers; security allegations;
 * "patients who understand progression don't wait"; invented appointment
 * dates or "Appointment booked"; pricing or any commercial commitment.
 *
 * THE COMPARISON IS OF SEQUENCE, NOT QUALITY. CVR has substantial education
 * and screening. What differs is the order in which a patient meets them,
 * and the page says that in as many words.
 */

export const meta = {
  title: "HPS Patient Journey Concept",
  description:
    "An unlisted patient-journey concept prepared for an HPS review conversation. Not linked from site navigation and not indexed.",
  reviewLabel: "Concept · For review",
};

/** Real captures. Aspect ratios differ and are declared per asset. */
export const shots = {
  cvrStep1: {
    base: "cvr-step1", widths: [360, 720], ratio: "780 / 1800",
    alt: "Center for Vein Restoration self-assessment, step 1 of 5, asking first name, last name, email address, zip code, phone and follow-up consent before any symptom question.",
  },
  cvrHome: {
    base: "cvr-home", widths: [360, 720], ratio: "780 / 1688",
    alt: "Center for Vein Restoration homepage on a phone.",
  },
  magnantHome: {
    base: "magnant-home", widths: [360, 720], ratio: "780 / 1688",
    alt: "Vein Specialists pre-launch homepage on a phone.",
  },
  magnantScreening: {
    base: "magnant-screening", widths: [360, 720], ratio: "780 / 1688",
    alt: "Vein Specialists pre-launch online vein screening entry screen on a phone.",
  },
} as const;

export const links = {
  magnantDemo: "https://vein-specialists.vercel.app/",
  magnantScreening: "https://vein-specialists.vercel.app/eveinscreening/",
  cvrQuiz: "https://www.centerforvein.com/self-assessment",
  cvrHome: "https://www.centerforvein.com/",
  psiMobile:
    "https://pagespeed.web.dev/analysis/https-www-centerforvein-com/jfcukfbou9?form_factor=mobile",
  psiDesktop:
    "https://pagespeed.web.dev/analysis/https-www-centerforvein-com/jfcukfbou9?form_factor=desktop",
  magnantHistoricalReport:
    "https://pagespeed.web.dev/analysis/https-vein-specialists-vercel-app/hwb5odyct3",
};

export type Scene = {
  id: string;
  n: number;
  label: string;
  kicker?: string;
  title: string;
  titleAccent?: string;
  body?: string;
  note?: string;
};

export const scenes: Scene[] = [
  { id: "open", n: 1, label: "Open",
    title: "From a symptom to a", titleAccent: "clear next step.",
    body: "A patient-journey proof of concept for HPS.",
    note: "Use the controls to move through ten scenes. Nothing advances on its own." },
  { id: "recognize", n: 2, label: "Recognize",
    kicker: "Recognize",
    title: "A symptom may not yet", titleAccent: "have a name.",
    body: "Aching by evening. Swelling that eases overnight. A vein that has changed. People arrive with a description, not a diagnosis.",
    note: "Illustrative patient concerns. Not a diagnosis and not a claim about how many patients think this way." },
  { id: "understand", n: 3, label: "Understand",
    kicker: "Understand",
    title: "Make vein disease", titleAccent: "easier to understand.",
    body: "Plain explanations of possible signs and what they may indicate, so a patient can tell whether their experience is worth discussing.",
    note: "Possible signs, not an inevitable sequence. Clinical copy subject to physician review." },
  { id: "journey", n: 4, label: "Journey",
    kicker: "One continuous journey",
    title: "Education, screening and a next step —", titleAccent: "on one screen.",
    body: "The same phone carries a patient from symptoms they recognise, to an explanation in plain language, to a voluntary request for an evaluation.",
    note: "Illustrative sequence — not a live form. Nothing is submitted and no appointment is created." },
  { id: "demo", n: 5, label: "Pre-launch demo",
    kicker: "Vein Specialists",
    title: "The same journey,", titleAccent: "built for a real practice.",
    body: "A working pre-launch build with online vein screening and an evaluation request. Open it and move through it yourself.",
    note: "Pre-launch build. It demonstrates the current education, screening and request experience — not delivery, scheduling or any outcome." },
  { id: "difference", n: 6, label: "Sequence",
    kicker: "The difference is the order",
    title: "Help patients understand", titleAccent: "before asking them to reach out.",
    body: "Both sites offer education and screening. What differs is where the questions begin.",
    note: "Captures of two live pages, taken October 24, 2026. A difference in sequence and hierarchy — not evidence of higher conversion." },
  { id: "measure", n: 7, label: "Measure",
    kicker: "Measure the page, not a promise",
    title: "One homepage,", titleAccent: "measured and labelled.",
    body: "A single Google PageSpeed run per device on the Center for Vein Restoration homepage.",
    note: "Single lab run · lab LCP is not a patient average. Field data is reported separately below." },
  { id: "foundations", n: 8, label: "Foundations",
    kicker: "Search and AI foundations",
    title: "Strong foundations.", titleAccent: "A different patient experience.",
    body: "Our own automated rubric scores the Center for Vein Restoration homepage highly. The opportunity is not their foundations — it is the patient journey and mobile loading.",
    note: "An automated rubric of technical and content checks. It does not measure actual AI citations, rankings or clinical quality." },
  { id: "pilot", n: 9, label: "Pilot",
    kicker: "A measurable pilot",
    title: "Baseline. Agreed journey.", titleAccent: "Then measure.",
    body: "Proposed measures for an HPS pilot, agreed before anything is built.",
    note: "Proposed pilot measures, not measured outcomes and not commitments. Targets set after baseline." },
  { id: "partnership", n: 10, label: "Partnership",
    kicker: "Next",
    title: "Worth a conversation about", titleAccent: "a measured pilot.",
    body: "Replay the journey, open the pre-launch demo, or read the pilot outline.",
    note: "A concept for discussion. No scope, timeline or commercial terms are implied here." },
];

/** Scene 2 — recognisable concerns, phrased as descriptions, never diagnoses. */
export const concerns = [
  "My legs ache by the end of the day.",
  "One ankle swells and the other does not.",
  "A vein has changed and I do not know if it matters.",
  "Standing all day leaves my legs heavy.",
];

/** Scene 3 — possible signs. Order is presentational, not a promised course. */
export const signs = [
  { label: "Visible veins", body: "Veins that have become prominent or changed shape." },
  { label: "Aching and heaviness", body: "Discomfort that builds through the day and eases when the legs are raised." },
  { label: "Swelling", body: "Swelling around the ankle, often one side more than the other." },
  { label: "Skin changes", body: "Changes in colour or texture around the lower leg." },
];

/** Scene 4 — the illustrative journey. No live form, no booked appointment. */
export const journeySteps = [
  { key: "symptoms", label: "Symptoms", head: "Choose what you notice",
    body: "A short, plain-language list a patient can answer without clinical vocabulary." },
  { key: "explain", label: "Explanation", head: "Your answers are worth discussing with a specialist",
    body: "A non-diagnostic explanation of what those answers may relate to, and what a consultation would look at." },
  { key: "request", label: "Request", head: "Request an evaluation",
    body: "A voluntary next step, offered after the explanation rather than before it." },
  { key: "received", label: "Handoff", head: "Request received — the office will contact you to schedule",
    body: "An illustrative handoff. Staff confirm; nothing is scheduled automatically." },
];

/** Scene 4 — symptoms a patient picks from. Descriptions, never diagnoses. */
export const journeySymptoms = [
  "Aching by evening",
  "Swelling at the ankle",
  "Visible veins",
  "Heaviness when standing",
  "Night cramps",
];

/** Scene 3 — clinical sign imagery already published on this site. */
export const stageImages = [
  { src: "/cvi/stage-1-clear.webp", name: "Spider veins", desc: "Small, visible veins beneath the skin." },
  { src: "/cvi/stage-2-spider.webp", name: "Varicose veins", desc: "Bulging veins that can ache or throb." },
  { src: "/cvi/stage-3-reticular.webp", name: "Swelling", desc: "Legs and ankles swell as pressure builds." },
  { src: "/cvi/stage-4-discoloration.webp", name: "Skin changes", desc: "Colour and texture change in the lower leg." },
  { src: "/cvi/stage-5-trophic.webp", name: "Skin breakdown", desc: "Skin can break down if pressure continues." },
] as const;

/** Scene 6 — the sequence comparison. Both sides are real captures. */
export const comparison = {
  headline: "Help patients understand before asking them to reach out.",
  qualifier: "Both offer education and screening. This concept changes the order.",
  left: {
    label: "Contact before symptoms",
    source: "centerforvein.com/self-assessment",
    href: "https://www.centerforvein.com/self-assessment",
    caption: "Step 1 of 5 asks first name, last name, email, zip code, phone and follow-up consent. Symptoms are step 2.",
    shot: "cvrStep1" as const,
  },
  right: {
    label: "Education and symptoms before contact",
    source: "vein-specialists.vercel.app/eveinscreening/",
    href: "https://vein-specialists.vercel.app/eveinscreening/",
    caption: "A free online screening that opens with what the patient is experiencing, with contact details offered afterwards.",
    shot: "magnantScreening" as const,
  },
  ribbon: ["Symptom", "Explanation", "Request", "Staff confirmation"],
  steps: [
    "Step 1 — first name, last name, email address, zip code, phone, follow-up consent",
    "Step 2 — symptoms",
    "Step 3 — duration",
    "Step 4 — severity and impact",
    "Step 5 — family history",
  ],
  stepsNote:
    "Five-step order read from the live page on October 24, 2026. Step 1 field labels were read directly from the page.",
};

/** Scene 7 — PSI. 57 and 89 are both amber on Google's own banding. */
export const psi = {
  target: "centerforvein.com homepage",
  tool: "Google PageSpeed Insights · Lighthouse 13.5.0 · Headless Chromium 153.0.8010.36",
  when: "October 24, 2026, about 23:02 UTC",
  gauges: [
    { device: "Mobile", score: 57, band: "amber" as const,
      config: "Emulated Moto G Power, Slow 4G",
      metrics: "Lab LCP 10.9s · FCP 2.0s · TBT 360ms · CLS 0 · Speed Index 8.4s",
      href: links.psiMobile },
    { device: "Desktop", score: 89, band: "amber" as const,
      config: "Desktop configuration",
      metrics: "Lab LCP 1.2s · FCP 0.5s · TBT 170ms · CLS 0 · Speed Index 2.2s",
      href: links.psiDesktop },
  ],
  banding: "Google's banding: 0–49 red, 50–89 amber, 90–100 green. 57 and 89 are both amber.",
  others: "Same runs: accessibility 97 mobile / 100 desktop, best practices 96, SEO 92.",
  field: {
    head: "Separate evidence — Chrome UX Report, 28 days, this URL",
    mobile: "Mobile: Core Web Vitals failed. LCP 2.8s · INP 113ms · CLS 0",
    desktop: "Desktop: passed. LCP 1.2s · INP 59ms · CLS 0.01",
    note: "Field data is real-user data and is not the same thing as the lab run above. The two are never combined here.",
  },
  limits: [
    "One run per device, initial load, single page. Not a whole-site average, a controlled experiment or a before-and-after.",
    "Lab LCP is not what an average patient experiences.",
  ],
};

/**
 * Scene 7 — our comparator. A HOMEPAGE-to-HOMEPAGE pairing is the only kind
 * allowed, and this one is historical rather than same-day, so it is shown
 * with its date and its limits attached rather than as a matched test.
 */
export const magnantHistorical = {
  head: "Our pre-launch homepage, measured earlier",
  target: "vein-specialists.vercel.app homepage",
  tool: "Google PageSpeed Insights · Lighthouse 13.5.0",
  when: "October 15, 2026, 21:30 EDT",
  mobile: "Mobile 87 · LCP 3.6s · FCP 1.7s · TBT 21ms · CLS 0",
  desktop: "Desktop 100 · LCP 0.68s · FCP 0.47s · TBT 60ms · CLS 0",
  href: links.magnantHistoricalReport,
  limits: [
    "A different date, deployment and configuration from the Center for Vein Restoration run above. This is an observational pairing, not a controlled same-day test.",
    "Emulated hardware and throttling were not recorded for this run, so it cannot be assumed to match the other run's configuration.",
    "A pre-launch preview with development tracking disabled and no field data.",
    "Homepage against homepage only. Interior-page scores are never compared to another site's homepage.",
    "These are lab samples. They do not establish a field Core Web Vitals pass, and they are not evidence that one platform causes a faster site.",
  ],
};

/** Scene 8 — our own rubric. Separate panel, separate labels, no blending. */
export const auditor = {
  head: "InflowMD automated checks · CVR homepage · Oct 24, 2026",
  scores: [
    { label: "AI readiness", value: 97 },
    { label: "Findability", value: 94 },
  ],
  interpretation: "Strong foundations. The opportunity is the patient journey and mobile loading.",
  scope: [
    "An automated rubric of technical and content checks: crawlable structure, machine-readable practice details, and whether patient questions are answered on the page.",
    "It does not measure actual AI citations, recommendation frequency, search rankings or clinical quality.",
    "Device is not applicable to these rubric checks. They are not a mobile test.",
    "No unique shareable report URL exists for this run.",
    "Kept separate from the Google PageSpeed scores above; the two are never blended into one number.",
  ],
  ours: "An equivalent score for our own example would need its own recorded run, with its own target, date and tool — and a pre-launch preview carries noindex limitations that would have to be stated. None is claimed here.",
};

/** Scene 9 — proposed measures. */
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
  note: "Unlisted concept page prepared for an HPS review conversation. Not linked from site navigation and not indexed.",
};
