export type SearchInterestRow = {
  term: string;
  volume: string;
  kind: "condition" | "symptom";
};

export type CostRow = { label: string; amount: string; total?: boolean };

export type RoiRow = {
  patients: string;
  value: string;
  investment: string;
  net: string;
  breakeven?: boolean;
};

export type RecommendationData = {
  slug: string;
  practiceName: string;
  ctaUrl: string;

  searchInterest: SearchInterestRow[];
  searchInterestCaveat: string;

  contentIncludes: string[];

  costRows: CostRow[];
  costNote: string;

  patientValueEstimate: string; // "$2,000–$6,000"
  patientValueAnchor: string; // "$2,500"
  yearlyInvestment: string; // "$12,000"
  breakEvenPatients: string; // "about 5 new patients per year"
  roiRows: RoiRow[];
  roiCaveat: string;
};

export const veinItyRecommendation: RecommendationData = {
  slug: "vein-ity",
  practiceName: "Vein-ity Vein Care Centers of Kansas",
  ctaUrl: "/get-started",

  searchInterest: [
    { term: "chronic venous insufficiency", volume: "~1,900 / month", kind: "condition" },
    { term: "restless legs", volume: "~1,900 / month", kind: "symptom" },
    { term: "venous insufficiency", volume: "~880 / month", kind: "condition" },
    { term: "restless legs treatment", volume: "~720 / month", kind: "condition" },
    { term: "swollen ankles", volume: "~480 / month", kind: "symptom" },
    { term: "leg cramps at night", volume: "~390 / month", kind: "symptom" },
    { term: "leg swelling / edema", volume: "~260–310 / month combined", kind: "symptom" },
    { term: "venous insufficiency treatment", volume: "~210 / month", kind: "condition" },
    { term: "why do my legs ache / hurt at night", volume: "~200 / month combined", kind: "symptom" },
  ],
  searchInterestCaveat:
    "This is search interest, not a guarantee of patients — not everyone searching is local, and not everyone will book. But it shows real, ongoing demand around the conditions you treat, which is exactly what good content captures.",

  contentIncludes: [
    "Two patient-focused articles every month, targeting the symptoms and conditions your future patients actually search.",
    "Each article written to rank in search and to serve as the destination your ads point to.",
    "Weighted toward medical, insurance-covered conditions — venous insufficiency and leg symptoms — where patient value is highest, over cosmetic.",
  ],

  costRows: [
    { label: "InflowMD management (content + ads management)", amount: "$500 / month" },
    { label: "Advertising budget (paid directly to Google — you control it)", amount: "$500 / month" },
    { label: "Total monthly investment", amount: "$1,000 / month", total: true },
  ],
  costNote:
    "The $500 advertising budget goes directly to Google, not to us — and you can raise or lower it anytime. Our management fee covers writing your content, building and running your ad campaigns, setting up tracking, and reporting on results.",

  patientValueEstimate: "$2,000–$6,000",
  patientValueAnchor: "$2,500",
  yearlyInvestment: "$12,000",
  breakEvenPatients: "about 5 new patients per year",
  roiRows: [
    { patients: "5 (break-even)", value: "$12,500", investment: "$12,000", net: "~$0", breakeven: true },
    { patients: "10", value: "$25,000", investment: "$12,000", net: "+$13,000" },
    { patients: "15", value: "$37,500", investment: "$12,000", net: "+$25,500" },
    { patients: "20", value: "$50,000", investment: "$12,000", net: "+$38,000" },
  ],
  roiCaveat:
    "These figures are illustrations to show how the economics work — not predictions or guarantees. Actual patient volume depends on many factors, and early months run slower while content builds and campaigns gather data. We measure real calls from day one through dedicated call tracking, and we’ll evaluate actual results together within the first couple of months.",
};

const RECOMMENDATIONS: Record<string, RecommendationData> = {
  [veinItyRecommendation.slug]: veinItyRecommendation,
};

export function getRecommendation(slug: string): RecommendationData | null {
  return RECOMMENDATIONS[slug] ?? null;
}
