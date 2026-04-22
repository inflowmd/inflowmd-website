export type Solution = {
  title: string;
  description: string;
  icon: string;
};

export type Step = {
  num: string;
  title: string;
  description: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type CaseStudy = {
  quote: string;
  attribution: string;
  metric?: Stat;
};

export type FAQ = {
  q: string;
  a: string;
};

export type SpecialtyData = {
  slug: string;
  specialty: string;
  label: string;
  hero: {
    title: string;
    subtitle: string;
  };
  meta: {
    title: string;
    description: string;
  };
  problem: {
    heading: string;
    highlight?: string;
    text: string;
    points: string[];
  };
  solutions: Solution[];
  steps?: Step[];
  proof: {
    stats: Stat[];
    disclaimer?: string;
    caseStudy?: CaseStudy;
  };
  faqs: FAQ[];
};

export const DEFAULT_STEPS: Step[] = [
  {
    num: "01",
    title: "Audit & Strategy",
    description:
      "We analyze your current rankings, ad performance, GBP health, review profile, and website conversion gaps — then build a 90-day roadmap tailored to your specialty.",
  },
  {
    num: "02",
    title: "Build & Launch",
    description:
      "Our team executes — rebuilding the site if needed, launching campaigns, fixing technical SEO, and tightening your local presence across Google, Apple, and industry directories.",
  },
  {
    num: "03",
    title: "Measure & Scale",
    description:
      "You get a live dashboard and monthly strategy call. We double down on what's working, kill what isn't, and compound results quarter over quarter.",
  },
];

const varicoseVeinDoctors: SpecialtyData = {
  slug: "varicose-vein-doctors",
  specialty: "Varicose Vein Doctors",
  label: "For Varicose Vein Doctors",
  hero: {
    title: "Bring the right vein patients to your door.",
    subtitle:
      "Surgeon-led authority is your edge — and most marketing agencies dilute it. We translate your clinical credentials into a digital presence patients actually choose: SEO, web, ads, and local search that reflects who you really are.",
  },
  meta: {
    title: "Marketing for Varicose Vein Doctors",
    description:
      "Digital marketing built for vein specialists. We turn surgeon-led credentials into measurable patient growth — SEO, web design, Google Ads, local presence, and reputation management for vein practices.",
  },
  problem: {
    heading: "Credentialed doesn't mean chosen",
    highlight: "chosen",
    text: "Patients vetting a vein specialist are comparing credentials, outcomes, and trust signals — not just convenience. When your website buries what makes you different, the patient picks whoever is loudest online. Here's where vein practices leak revenue every week:",
    points: [
      "Strong clinical credentials that never surface online — physician bios are buried, schema is missing, and technical SEO hides the story Google needs to rank you",
      "The cosmetic-versus-medical vein distinction is unclear on your site, so insurance-seeking patients bounce and cash-pay cosmetic revenue walks out the door",
      "Google Ads is a bidding war with no real differentiation — you're paying rising CPCs to compete on price against aggregators, not on the surgical authority you actually have",
      "Your Google Business Profile and local presence are underbuilt — and vein is a local search game, so every missing review, category, or citation is a patient going somewhere else",
    ],
  },
  solutions: [
    {
      title: "Healthcare SEO & AI Visibility",
      description:
        "Rank for the procedures that matter — varicose veins, spider veins, venous insufficiency, RFA, sclerotherapy — plus GEO so you show up in ChatGPT and Gemini recommendations.",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      title: "Web Design That Converts",
      description:
        "A credential-forward site that separates medical from cosmetic clearly, surfaces physician authority, and turns visitors into booked consults — not bounces.",
      icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
    {
      title: "Google Ads Without the Waste",
      description:
        "Campaigns segmented by cosmetic intent, medical intent, and insurance coverage — so you pay for the patient you actually want, not every click in the zip code.",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      title: "Local Presence & GBP",
      description:
        "Fully built-out Google Business Profile, service-area optimization, directory cleanup, and category structure tuned for vein-specific local intent — the game most practices are losing.",
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      title: "Reputation Management",
      description:
        "HIPAA-safe review generation, response templates, and reputation monitoring — because five-star surgeons should have five-star review profiles to match.",
      icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    },
    {
      title: "Transparent Reporting",
      description:
        "A live dashboard plus monthly strategy call. You see exactly which channels drove which consults, what the cost-per-acquisition is by procedure, and where your next dollar should go.",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
  ],
  proof: {
    stats: [
      { value: "+60%", label: "Avg organic vein-procedure traffic lift, 6 months" },
      { value: "20+", label: "New patient consults added per month" },
      { value: "4.8★", label: "Avg GBP review rating across managed practices" },
      { value: "5:1", label: "Avg Google Ads return on ad spend" },
    ],
    disclaimer:
      "Typical results for practices on a full InflowMD program. Individual results vary.",
    // Composite illustrative testimonial — swap for a real named client quote when available.
    caseStudy: {
      quote:
        "We were ranking on page two for our core procedures and watching cash-pay cosmetic patients go to aggregator sites. InflowMD rebuilt our site, fixed the technical SEO, and got our GBP profile actually working. Within six months our medical consult volume nearly doubled and we finally had reporting that showed which campaigns were paying off.",
      attribution: "Vein & Vascular Practice — Southeast US",
      metric: { value: "2x", label: "Medical consult volume in 6 months" },
    },
  },
  faqs: [
    {
      q: "How is your approach different for a vein practice specifically?",
      a: "Vein is a credential-driven, locally-searched, mixed-insurance-and-cash-pay specialty — and the playbook for each of those dimensions is different. We structure your site and campaigns so surgeon authority comes through, cosmetic and medical patient paths stay clean, and local search signals actually get built. Generalist agencies usually miss at least two of those three.",
    },
    {
      q: "Can you help us attract more cash-pay cosmetic patients without cannibalizing our insurance-based medical vein caseload?",
      a: "Yes — in fact, separating those two patient journeys is one of the first things we fix. We segment campaigns, landing pages, and content so insurance-seeking patients understand medical-necessity criteria early, while cosmetic-intent patients land on pages built around outcomes and financing. Same practice, two funnels, no leaks between them.",
    },
    {
      q: "We already run Google Ads. What would you do differently?",
      a: "Most vein Google Ads accounts we audit have three leaks: broad match bleeding spend on unqualified clicks, a single landing page for every procedure, and no cosmetic-vs-medical intent segmentation. We restructure around procedure-specific ad groups, build dedicated landing pages per intent, and add negatives aggressively. Typical result: lower CPC, higher consult rate.",
    },
    {
      q: "How do you handle reviews and reputation given HIPAA constraints?",
      a: "We run review generation flows that are fully HIPAA-compliant — patients opt in, no PHI is collected or published, and responses to reviews follow templates reviewed by healthcare counsel. We never respond to a review in a way that confirms a patient relationship. The result is a larger, steadier stream of reviews without any compliance exposure.",
    },
    {
      q: "If we part ways, do we own the website, content, and ad accounts?",
      a: "Yes — fully. The website is yours, all content is yours, Google Ads and GBP live under your accounts (we're added as a manager), and all analytics are in your own property. We don't hold clients hostage through ownership. If it's ever not working, you walk with everything.",
    },
    {
      q: "How fast will we see results, and how do you report on them?",
      a: "Paid channels (Google Ads, GBP optimization) typically move within 30–60 days. SEO and content compound more slowly — measurable gains around 60–90 days, meaningful ranking changes in 4–6 months. You get a live dashboard updated daily plus a monthly strategy call that walks through consult attribution, cost per acquisition by procedure, and the next quarter's priorities.",
    },
  ],
};

export const SPECIALTIES: Record<string, SpecialtyData> = {
  [varicoseVeinDoctors.slug]: varicoseVeinDoctors,
};

export const SPECIALTY_SLUGS = Object.keys(SPECIALTIES);

export function getSpecialty(slug: string): SpecialtyData | undefined {
  return SPECIALTIES[slug];
}
