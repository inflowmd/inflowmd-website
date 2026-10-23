/**
 * InflowMD homepage V2 — copy for the unlisted review route.
 *
 * EVERY CLAIM HERE IS DELIBERATELY BOUNDED. This page describes what the
 * audit measures and what consistent identity helps with. It does not
 * promise rankings, inclusion in AI answers, recommendations, traffic,
 * revenue, conversion uplift or clinical outcomes, and it carries no
 * benchmark, score, statistic, testimonial, client name or turnaround time.
 * If a sentence here starts to sound like a result, it is wrong.
 *
 * THE PRACTICE RECORD IS AN ILLUSTRATION and is labelled as one wherever it
 * appears. Its name, address, phone and hours are obvious placeholders
 * ("Example", "000") precisely so it cannot be mistaken for a real clinic,
 * and they stay identical in all three states so the reader follows one
 * record through the page rather than three unrelated mock-ups.
 *
 * SYMPTOM LABELS are phrased as the questions a person might arrive with.
 * None of them asserts a diagnosis, a treatment or an outcome.
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
  primary: { label: "Run your free site audit", href: "/audit" },
  secondary: { label: "Talk about your practice", href: "/get-started" },
};

export const hero = {
  h1: "Patients find care differently now.",
  supporting:
    "From search and maps to AI answers, your practice needs a clear identity, a fast website and information that helps patients take the next step.",
  primary: { label: "Run your free site audit", href: "/audit" },
  auditLine: "Google performance data. InflowMD readiness checks. A clearer starting point.",
  secondary: { label: "Talk about your practice", href: "/get-started" },
  recordIntro:
    "One practice record runs through this page — the same name, the same details — as it moves from being found, to being read, to being understood.",
};

/** The one record, in one place, so all three states cannot drift apart. */
export const record = {
  illustrationLabel: "Illustration · Example practice",
  name: "Example Vein & Vascular",
  specialty: "Vein and vascular care",
  street: "000 Example Avenue, Suite 100",
  city: "Anytown, ST 00000",
  phone: "(000) 000-0000",
  hours: "Mon–Fri, 8:00–4:00",
  site: "example-practice.test",
};

export const spine = [
  { num: "01", name: "Visibility", line: "Make your practice clear." },
  { num: "02", name: "Performance", line: "Make the next step easier." },
  { num: "03", name: "Education", line: "Help patients understand their options." },
];

export const visibility = {
  num: "01",
  eyebrow: "Visibility",
  headline: "Before a patient clicks, your practice has already made an impression.",
  body: [
    "Search results, maps, directories and your own website each carry a copy of the same few facts: the practice name, the address, the phone number, the hours, the kind of care you provide.",
    "Those copies are written at different times by different hands, and they drift apart. A consistent, accurate identity helps both people and platforms understand what the practice is and where it is.",
  ],
  pmPoint:
    "A practice with a brand-new website can still have identity problems elsewhere. The site is one copy among many.",
  /** Decorative chips for scene 1. Each is a fragment of the record above. */
  fragments: [
    "Example Vein & Vascular",
    "000 Example Avenue",
    "Suite 100",
    "Anytown, ST 00000",
    "(000) 000-0000",
    "Mon–Fri",
    "8:00–4:00",
    "Vein and vascular care",
    "example-practice.test",
  ],
  sceneCaption:
    "The same facts, agreeing with each other. This is an illustration of consistency, not a live view of your listings.",
};

export const evidence = {
  eyebrow: "How the audit works",
  headline: "Two different kinds of evidence, kept separate.",
  columns: [
    {
      title: "Google PageSpeed Insights",
      body: "Google's own performance results for the page — loading milestones, layout stability and responsiveness — reported as Google measures them, including its real-user data when Google has any for the site.",
    },
    {
      title: "InflowMD readiness checks",
      body: "Our own reading of the page: the visible structure, the structured data and whether the page can be crawled and understood.",
      groups: [
        {
          label: "Visible structure",
          items: [
            "Secure connection",
            "Redirect chain",
            "Page title",
            "Search result description",
            "Main page heading",
            "Heading structure",
            "Preferred page address",
            "Image descriptions",
            "Social sharing preview",
            "Mobile display setting",
          ],
        },
        {
          label: "Structured data",
          items: [
            "Machine-readable practice details",
            "Medical practice identification",
            "Local listing details",
            "Organization details",
            "Frequently asked questions",
          ],
        },
        {
          label: "Crawlability",
          items: [
            "Crawler instructions file",
            "AI assistant access",
            "AI content guide",
            "Page structure for AI",
            "Content depth",
          ],
        },
      ],
    },
  ],
  limits: [
    "Technical checks can expose issues worth investigating. They do not predict AI recommendations, rankings, traffic, revenue or clinical outcomes.",
    "When something cannot be read or Google has no data for it, the audit reports it as unavailable or not applicable. That is not the same as a failed test, and it is not counted as one.",
  ],
  cta: { label: "Run your free site audit", href: "/audit" },
};

export const performance = {
  num: "02",
  eyebrow: "Performance",
  headline: "Found you. Opened your site. What happens next?",
  body: [
    "A visit is a short sequence. The page has to arrive, it has to be readable, and the next step has to be obvious once someone has read it.",
    "Each part of that sequence is something you can look at and improve on its own.",
  ],
  stops: [
    {
      key: "find",
      label: "Find",
      line: "The practice appears with its name, location and the kind of care it provides.",
    },
    {
      key: "open",
      label: "Open",
      line: "The page arrives and the main content is readable without waiting for everything else.",
    },
    {
      key: "understand",
      label: "Understand",
      line: "The reader can tell what the practice treats and who it is for.",
    },
    {
      key: "next",
      label: "Take the next step",
      line: "One clear action is available — call, ask a question, or request an appointment.",
    },
  ],
  sceneCaption:
    "A labelled illustration of the visit sequence. It is not a speed test and carries no measurement.",
};

export const education = {
  num: "03",
  eyebrow: "Education",
  headline: "Help patients connect their questions to a next step.",
  body: [
    "People usually arrive with a question in ordinary words rather than a clinical term. Useful, clinically reviewed educational material can describe what a symptom may involve, explain what care options exist and help someone prepare for a conversation with the practice.",
    "It is there to make the next conversation easier, not to answer a question only a clinician can answer.",
  ],
  questionsLabel: "Questions patients arrive with",
  questions: [
    "Why do my legs ache by the end of the day?",
    "What does swelling in one leg mean?",
    "Are visible veins something to have looked at?",
    "What happens at a first appointment?",
  ],
  affordanceLabel: "Request an appointment",
  affordanceNote:
    "Shown as an illustration of the cue a patient would see. It is not a working form on this page.",
  caution:
    "Educational material describes options and prepares a conversation. It does not diagnose, and it does not promise a result.",
};

export const straight = {
  eyebrow: "Straight answers",
  headline: "What this is, and what it is not.",
  items: [
    {
      q: "How does work begin?",
      a: "We agree on scope, responsibilities and ongoing support before work begins.",
    },
    {
      q: "What does the audit actually measure?",
      a: "Google's performance results for the page, and our own checks of visible structure, structured data and crawlability. It reads what is publicly available on the page.",
    },
    {
      q: "What can the audit not tell you?",
      a: "It cannot tell you how you will rank, whether an AI assistant will mention you, how many patients will call, or anything clinical. It points at things worth looking into.",
    },
    {
      q: "What happens to things it cannot check?",
      a: "They are reported as unavailable or not applicable rather than counted against the practice.",
    },
  ],
};

export const closing = {
  headline: "Start with what can be measured.",
  body: "The audit is the first concrete step: it reads the page as it stands today and shows you where to look.",
  primary: { label: "Run your free site audit", href: "/audit" },
  secondary: { label: "Talk about your practice", href: "/get-started" },
};

export const footer = {
  brand: "InflowMD",
  email: "clayton@inflowmd.com",
  note: "Unlisted concept page for review. Not linked from site navigation and not indexed.",
};
