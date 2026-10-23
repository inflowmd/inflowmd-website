/**
 * Vein and Skin Studio — Patient Acquisition Review. Copy only.
 *
 * TRANSCRIBED VERBATIM from the controller's approved client-safe document
 * (APPROVED-COPY.md, research completed October 23, 2026), with exactly the
 * three approved corrections and nothing else:
 *
 *   1. Finding 3 "Observed" opens with the approved measurement attribution
 *      — a synthetic Google PageSpeed Insights test, Lighthouse lab data
 *      retrieved through the InflowMD auditor — and the finding carries the
 *      retrieval timestamp. Nothing here says or implies that anyone ran PSI
 *      by hand. Device configuration unrecorded and field data absent are
 *      both retained.
 *   2. The two-profile count is removed from Finding 6 and the 30-day plan.
 *      One Bayonne location throughout. No current review total is asserted.
 *   3. Finding 3 is severity INVESTIGATE. Nothing on this page is Critical.
 *
 * NO COMMERCIAL CONTENT ANYWHERE. No price, tier, package, setup fee,
 * contract term, deadline or investment block. The word "Recommendation" is
 * the document's own section label and "Measurement and recommended
 * sequence" is its own heading; neither is a commercial badge.
 *
 * Observed / Why it matters / Recommendation are kept as three distinct
 * fields so the page cannot blur what was measured into what is advised.
 */

export type Tone = "attention" | "review";

export const meta = {
  /** Absolute — the root layout's "%s | InflowMD" template would otherwise
      put our name on the client's document and on the saved PDF. */
  title: "Vein and Skin Studio Patient Acquisition Review",
  practice: "Vein and Skin Studio",
  eyebrow: "Patient Acquisition Review",
  preparedFor: "Prepared for Dr. Zbigniew Moszczynski",
  preparedBy: "Prepared by InflowMD",
  researchDate: "Research completed October 23, 2026",
  description:
    "A patient acquisition review prepared by InflowMD for Dr. Zbigniew Moszczynski, research completed October 23, 2026.",
};

export const summary = {
  heading: "Executive summary",
  verdict:
    "Your website already gives patients useful information about vein conditions, treatment options and your practice. The clearest opportunity is to help more prospective vein patients move from recognizing a symptom to requesting an evaluation, then measure whether those inquiries become appointments.",
  lead: "We recommend three priorities:",
  priorities: [
    {
      n: "1",
      title: "Make the next step easier.",
      body: "Put the vein evaluation journey first, correct the verified treatment-link mismatch and test the contact pathway through to staff receipt.",
    },
    {
      n: "2",
      title: "Make your local strengths clearer.",
      body: "Emphasize the Bayonne office, preserve recognition of both your name and Vein & Skin Studio, and align approved credentials and practice information.",
    },
    {
      n: "3",
      title: "Measure patient acquisition.",
      body: "Establish a baseline for qualified inquiries, bookings and attended visits before increasing marketing activity. Use performance tests to diagnose friction, not as the definition of success.",
    },
  ],
};

export const working = {
  heading: "What is already working",
  items: [
    {
      title: "A substantial vein-care foundation.",
      body: "Dedicated symptom and treatment pages, a physician biography, FAQs, insurance information and testimonials give patients material to explore. [Practice website](https://veinandskinstudio.com/)",
    },
    {
      title: "Existing before and after cases.",
      body: "The gallery includes varicose-vein cases. We recommend making these easier to reach, rather than starting over. [Varicose-vein gallery](https://veinandskinstudio.com/gallery-procedure/vein-treatments/varicose-vein-treatment/)",
    },
    {
      title: "Clear office contact information.",
      body: "The current contact page provides a phone number, Bayonne address, hours and directions. [Contact page](https://veinandskinstudio.com/contact-us/)",
    },
    {
      title: "A useful technical foundation.",
      body: "The inspected pages returned successfully and included indexable page settings and matching canonical URLs. A sitemap and extensive practice/medical structured data are already present. These support discoverability, although they do not establish search positions or AI citations. [Sitemap](https://veinandskinstudio.com/sitemap_index.xml) · [Crawler instructions](https://veinandskinstudio.com/robots.txt)",
    },
  ],
};

export type Finding = {
  id: string;
  n: string;
  title: string;
  tone: Tone;
  severity: string;
  observed: string;
  why: string;
  recommendation: string;
  /** Rendered as muted supporting detail under the body. */
  detail?: string;
};

export const findingsHeading = "Prioritized opportunities";

export const findings: Finding[] = [
  {
    id: "evaluation-pathway",
    n: "1",
    title: "Make the vein evaluation pathway clear",
    tone: "attention",
    severity: "Priority",
    observed:
      "The site combines vein care and cosmetic services. Prominent appointment links lead to a contact page with a JavaScript-loaded form and an instruction to submit non-medical correspondence only. We have not verified real-time scheduling or successful delivery to staff. [Homepage](https://veinandskinstudio.com/) · [Contact page](https://veinandskinstudio.com/contact-us/)",
    why: "A prospective patient should quickly understand what to do, what information to provide and what happens next.",
    recommendation:
      "Lead with “Request a vein evaluation,” retain a clear call option and explain the response process. Use “request” rather than “book” unless a confirmed appointment can actually be made. Test loading, errors, acknowledgment and staff routing with approved test data. Assess any Athena handoff separately before promising integration. Keep medical details out of the existing general inquiry channel.",
  },
  {
    id: "treatment-links",
    n: "2",
    title: "Correct treatment links and shorten the route to evidence",
    tone: "attention",
    severity: "Verified issue",
    observed:
      "The lower treatment list on the varicose-vein page labels a link “VenaSeal” but sends visitors to the Varithena page. The main navigation has a separate, correct VenaSeal destination. Before and after cases already exist in the gallery. [Treatment page](https://veinandskinstudio.com/vein-treatment/varicose-vein-treatment/) · [Gallery](https://veinandskinstudio.com/gallery-intro/)",
    why: "Patients comparing treatments should reach the information they expect without extra searching.",
    recommendation:
      "Correct the in-page link and check other treatment buttons. Connect relevant symptom and treatment pages directly to approved cases, with clear labels and realistic expectations. Preserve existing useful content and patient-photo permissions.",
  },
  {
    id: "loading-delays",
    n: "3",
    /* Correction 3: medium treatment, never Critical. */
    tone: "attention",
    severity: "Investigate",
    title: "Diagnose loading and interaction delays",
    /* Correction 1: approved measurement attribution. */
    observed:
      "One synthetic Google PageSpeed Insights test (Lighthouse lab data retrieved through the InflowMD auditor) recorded a performance score of **48/100** and Largest Contentful Paint of **5.18 seconds**. The device configuration was not recorded and no real-user field data was available. These results are not a mobile score or an average patient experience. Test target: [homepage](https://veinandskinstudio.com/).",
    why: "Delays may make it harder for visitors to reach information and contact the office. The current evidence identifies a reason to investigate, not a measured loss of patients.",
    recommendation:
      "Establish repeatable mobile and desktop tests, inspect image loading and script activity, and improve the confirmed bottlenecks. Retest under comparable conditions and use real-user data when available. The current test cannot establish a field Core Web Vitals pass or fail. [Core Web Vitals guidance](https://web.dev/articles/vitals)",
    detail: "Measurement retrieved 2026-10-23T15:22:10.432Z. Single synthetic run, lab data only.",
  },
  {
    id: "bayonne-access",
    n: "4",
    title: "Clarify Bayonne access while retaining service area reach",
    tone: "review",
    severity: "Review",
    observed:
      "The homepage title emphasizes Jersey City and Newark, while the physical office is in Bayonne. That may be intentional service-area targeting. The website also presents both physician and practice identities. [Homepage](https://veinandskinstudio.com/) · [Office details](https://veinandskinstudio.com/contact-us/)",
    why: "Nearby patients should immediately understand where care takes place and recognize either the doctor or the practice name.",
    /* Correction 2: identities, no profile count. */
    recommendation:
      "Review search evidence and geographic priorities before adjusting titles. Make the Bayonne office prominent while retaining useful nearby-area context, without implying additional offices. Add accurate entrance, parking and transit guidance. Preserve legitimate physician and practice identities; verify the associated Google profiles.",
  },
  {
    id: "credentials",
    n: "5",
    title: "Align credentials and strengthen clinical review",
    tone: "review",
    severity: "Confirm",
    observed:
      "Homepage wording describes a board-certified vascular surgeon; the physician page describes a board-certified general surgeon and vein specialist, with general surgery and phlebology in the biography. This needs clarification from the physician, not an assumption about which credentials are held. [Homepage](https://veinandskinstudio.com/) · [Physician biography](https://veinandskinstudio.com/our-practice/dr-moszczynski/)",
    why: "Consistent, precise language helps patients understand your qualifications and make informed decisions.",
    recommendation:
      "Approve the exact credentials and board names, then align pages and profiles. Give key medical pages a named clinical reviewer, review date and appropriate references. Review treatment benefits, risks, recovery and insurance language. Prioritize practical answers about the first visit, symptoms and coverage verification. [Existing FAQs](https://veinandskinstudio.com/our-practice/faq/)",
  },
  {
    id: "listings-reviews",
    n: "6",
    title: "Build a consistent review and local information routine",
    tone: "review",
    severity: "Reconcile",
    observed:
      "Public listings provide additional paths to the practice, but details need reconciliation. For example, Doctor.com lists different hours from the current contact page. Current Google review totals were not verified in this audit. [Doctor.com profile](https://www.doctor.com/Dr-Zbigniew-Moszczynski) · [Practice hours](https://veinandskinstudio.com/contact-us/)",
    why: "Accurate information reduces confusion. A consistent review process gives patients a straightforward way to share their experience.",
    /* Correction 2: no two-profile count. */
    recommendation:
      "Confirm office hours and verify the associated Google profiles directly. Assign a staff owner for neutral invitations to all eligible patients, with a simple link or QR code. Avoid incentives and selective requests based on expected sentiment. Keep public replies privacy-preserving. [Google review guidance](https://support.google.com/business/answer/3474122)",
  },
  {
    id: "attribution",
    n: "7",
    title: "Connect marketing activity to attended vein visits",
    tone: "review",
    severity: "Verify",
    observed:
      "The public site includes phone contact, a form, chat and tracking code. Their presence does not establish working attribution or useful inquiries. Different telephone numbers appear in some homepage metadata and visible contact information; this may be intentional call tracking. [Homepage](https://veinandskinstudio.com/) · [Contact page](https://veinandskinstudio.com/contact-us/)",
    why: "Traffic, chat activity and form counts alone cannot show whether marketing produces suitable patients.",
    recommendation:
      "Verify number ownership and forwarding before changing anything. Measure calls, forms and chat separately through qualified inquiry, booking and attendance. Exclude spam and duplicates, track response times and keep aesthetics separate. Use privacy-appropriate analytics without sending medical information to general marketing tools.",
  },
];

export const competitors = {
  heading: "Local competitor context",
  lead: "Nearby providers show useful patient-facing tactics. This comparison describes their published content, not measured rankings, clinical quality or patient volume.",
  columns: ["Provider", "Public approach", "Opportunity for Vein & Skin Studio"],
  rows: [
    [
      "[Metro Pain Centers](https://www.metropaincenters.com/services/vein-treatments/)",
      "Advertises vein services, Bayonne access and same-day appointment messaging.",
      "Explain your physician-led vein offering and actual appointment process. Promise only availability the office can support.",
    ],
    [
      "[Metro Vein Centers Jersey City](https://www.metroveincenters.com/locations/new-jersey/jersey-city)",
      "Prominent evaluation booking, insurance information and access guidance; includes Bayonne among nearby areas.",
      "Make first-visit expectations and coverage verification easy to understand.",
    ],
    [
      "[Vein Specialist Centers Bayonne page](https://veinspecialistcenters.com/bayonne-nj/)",
      "Targets Bayonne patients while directing them to its Jersey City office, with travel guidance.",
      "Make the convenience of your actual Bayonne office clear, supported by useful directions and original office photos.",
    ],
  ],
  closing:
    "Your opportunity is to communicate your own location, physician identity and care experience clearly. There is no basis here to claim that another provider outranks you across Bayonne.",
};

export const measurement = {
  heading: "Measurement and recommended sequence",
  phases: [
    {
      label: "First 30 days",
      /* Correction 2: no two-profile count. */
      body: "Confirm credentials, hours, contact routing and service priorities. Correct verified links. Establish analytics and search baselines with authorized access, validate contact pathways and verify the associated Google profiles. Start a consistent review workflow.",
    },
    {
      label: "Days 31 to 60",
      body: "Improve the vein evaluation journey, local access information and clinically reviewed patient answers. Address performance bottlenecks identified by testing. Reconcile approved profile details and validate attribution.",
    },
    {
      label: "Days 61 to 90",
      body: "Review qualified inquiries, bookings, attendance, response times and spam by source. Improve the points where suitable prospects drop out. Consider additional acquisition activity only after measurement, capacity, scope and budget are agreed.",
    },
  ],
  measuresLead: "The core measures are:",
  measures: [
    {
      title: "Qualified vein inquiries:",
      body: "Genuine prospective patients asking about offered vein services within the practical service area, excluding spam and duplicates.",
    },
    { title: "Booking rate:", body: "Vein appointments booked divided by qualified vein inquiries." },
    {
      title: "Attendance rate:",
      body: "Attended vein appointments divided by booked vein appointments.",
    },
    {
      title: "Operational measures:",
      body: "Response time, source completeness and spam rate.",
    },
  ],
  closing:
    "Report actual counts alongside rates, particularly when volumes are small. Set improvement targets after the baseline is established; inquiries should not be treated as revenue.",
};

export const scope = {
  heading: "Scope and supporting detail",
  paragraphs: [
    "This review covers representative public website pages, public listings, competitor websites and one synthetic performance test, with research completed October 23, 2026. It is not a complete crawl, clinical review, security or accessibility certification, controlled local-ranking study, or verification of form delivery. Mobile visual behavior, live scheduling and integrations require additional testing. No current Google review total, conversion baseline or traffic gain is asserted.",
    "Page-level technical findings and validation checks are available as supporting detail. Search and AI recommendations focus on useful, accurately reviewed content and sound technical fundamentals; neither markup nor AI-specific files guarantee visibility. [Google guidance on AI search features](https://developers.google.com/search/docs/appearance/ai-features)",
    "Implementation, account changes and integrations are subject to an agreed scope and authorization. The proposed sequence is a recommendation, not a committed launch schedule.",
  ],
};
