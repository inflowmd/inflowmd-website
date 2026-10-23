/**
 * /home-v2 — visual-first rebuild. Copy only.
 *
 * THE RULE THAT SHAPES THIS FILE: the imagery is the argument, and the words
 * are captions to it. Primary narrative is kept under 350 words including
 * every caption and limit. Text visible inside the captured screenshots is
 * image evidence, not prose, and is never retyped here as a claim.
 *
 * NOTHING HERE ASSERTS A RESULT. No score, no statistic, no elapsed time, no
 * benchmark, no testimonial, no guarantee, no claim that an AI assistant has
 * read, ranked or recommended anything. The structured-data labels are real
 * `@type` values verified in the practice's live JSON-LD, not property names
 * and not invented. The quiz screenshot's "17%" is questionnaire progress and
 * is never described as a measurement of anything.
 */

export const meta = {
  title: "Homepage concept · For review",
  description:
    "An unlisted homepage concept for internal review. Not linked from site navigation and not indexed.",
  reviewLabel: "Homepage concept · For review",
};

export const nav = {
  logoSrc: "/inflowmd-final.png",
  logoAlt: "InflowMD",
  audit: { label: "Free audit", href: "/audit" },
  call: { label: "Book a call", href: "/get-started" },
};

export const hero = {
  eyebrow: "01 · Discovery",
  h1Lead: "Patients find care",
  h1Accent: "differently now.",
  caption: "From discovery to understanding. From understanding to the next step.",
  primary: { label: "Run your free site audit", href: "/audit" },
  secondary: { label: "Talk about your practice", href: "/get-started" },
  micro: "See your site’s performance and technical readiness.",
};

export const visibility = {
  eyebrow: "02 · Visibility",
  h2Lead: "Clear to patients.",
  h2Accent: "Readable to machines.",
  caption:
    "A structured identity — who you are, what you treat, where you are — written in a form machines can carry.",
  /** Real @type values, verified in this practice's live JSON-LD. */
  types: [
    "MedicalClinic",
    "Physician",
    "PostalAddress",
    "OpeningHoursSpecification",
    "FAQPage",
  ],
  typesNote: "Actual schema types published by this practice.",
};

export const performance = {
  eyebrow: "03 · Performance",
  h2Lead: "Found you. Opened your site.",
  h2Accent: "Seconds decide.",
  caption: "What arrives first, and how quickly it becomes readable, is the first impression.",
  /** Neutral stage names. Deliberately not first-paint / interactive / LCP:
      those are measurement terms and this is a drawing, not a measurement. */
  stages: ["Opening", "Content", "Ready"],
  disclaimer:
    "Illustration of how a visit unfolds — not a recorded timeline for this practice.",
};

export const education = {
  eyebrow: "04 · Education",
  h2Lead: "The same screen teaches, asks, and",
  h2Accent: "invites the next step.",
  caption:
    "Condition stages → a symptom check → a real request form. One continuous path, on one phone.",
  steps: [
    { key: "stages", label: "Learn" },
    { key: "checker", label: "Check" },
    { key: "request", label: "Request" },
  ],
  prev: "Previous screen",
  next: "Next screen",
};

export const coda = {
  eyebrow: "05 · Start",
  h2: "Start with your site.",
  caption: "See your site’s performance and technical readiness.",
  primary: { label: "Run your free site audit", href: "/audit" },
  secondary: { label: "Talk about your practice", href: "/get-started" },
  limits:
    "Speed is Google’s own measurement; everything else is InflowMD analysis of your page’s code. It shows technical readiness — it can’t promise rankings or AI recommendations, and nothing can.",
};

export const footer = {
  brand: "InflowMD",
  email: "clayton@inflowmd.com",
  note: "Unlisted concept page for review. Not linked from site navigation and not indexed.",
};

/**
 * Image sources. Every entry is an actual capture verified by sha256 against
 * the controller's provenance manifest; the two Magnant preview files in that
 * directory are excluded by the brief and are not referenced anywhere.
 */
export const shots = {
  backdrop: {
    base: "backdrop",
    widths: [900, 1672],
    ratio: "1672 / 941",
    alt: "", // decorative
  },
  practiceHome: {
    base: "practice-home",
    widths: [400, 800],
    ratio: "1179 / 2556",
    alt: "A launched vein practice website on a phone, showing its home screen.",
  },
  practiceStages: {
    base: "practice-stages",
    widths: [400, 800],
    ratio: "1179 / 2556",
    alt: "The same practice site showing a condition-stages education screen with a progress rail.",
  },
  practiceChecker: {
    base: "practice-checker",
    widths: [400, 800],
    ratio: "1179 / 2556",
    alt: "The practice site’s symptom check, question one of three, with several options selected.",
  },
  practiceRequest: {
    base: "practice-request",
    widths: [400, 800],
    ratio: "1179 / 2556",
    alt: "The practice site’s appointment request form, empty and unsubmitted.",
  },
  auditorTablet: {
    base: "auditor-tablet",
    widths: [700, 1360],
    ratio: "2048 / 1536",
    alt: "The InflowMD site audit start screen on a tablet.",
  },
  auditorPhone: {
    base: "auditor-phone",
    widths: [400, 800],
    ratio: "1179 / 2556",
    alt: "The InflowMD site audit start screen on a phone.",
  },
} as const;
