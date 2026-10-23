/** PM-reviewed presentation copy. Detailed evidence stays in content.ts. */
export const priorities = [
  { title: "Make the next step easier", body: "Lead with ‘Request a vein evaluation,’ fix the mislabeled treatment link, and test the contact pathway through to staff receipt.", icon: "path" },
  { title: "Make your local strengths clearer", body: "Put the Bayonne office front and center, and keep both your name and Vein & Skin Studio recognizable.", icon: "pin" },
  { title: "Measure patient acquisition", body: "Baseline qualified inquiries, bookings and attended visits before increasing marketing activity.", icon: "chart" },
] as const;

export const findingDisplay: Record<string, { title: string; summary: string }> = {
  "evaluation-pathway": { title: "Lead with ‘Request a vein evaluation’", summary: "Appointment links lead to a general contact form. Make the next step and the office’s response process clear." },
  "treatment-links": { title: "Fix the VenaSeal link", summary: "The in-page VenaSeal link leads to Varithena. Help patients reach the treatment information they expect." },
  "loading-delays": { title: "Diagnose page speed", summary: "One lab test recorded 48/100 and a 5.18-second largest paint: a reason to investigate, not a measured loss of patients." },
  "bayonne-access": { title: "Make Bayonne unmistakable", summary: "Make the Bayonne office clear while retaining useful service-area context." },
  credentials: { title: "Align your credentials", summary: "Homepage and biography wording differ. Confirm the exact credentials with the physician, then align the language." },
  "listings-reviews": { title: "Reconcile listings and reviews", summary: "Confirm office hours, then build a consistent review routine." },
  attribution: { title: "Track inquiries to attended visits", summary: "The public site does not establish which inquiries become suitable patients. Verify the path from contact to attendance." },
};

export const competitorDisplay = [
  { name: "Metro Pain Centers", focus: "Appointment clarity", headline: "Explain the next step.", takeaway: "Pair your physician-led vein offering with an appointment process the office can support.", icon: "calendar" },
  { name: "Metro Vein Centers Jersey City", focus: "Booking & insurance", headline: "Answer first-visit questions.", takeaway: "Make evaluation expectations and coverage verification easy to understand.", icon: "check" },
  { name: "Vein Specialist Centers", focus: "Local convenience", headline: "Show your Bayonne advantage.", takeaway: "Make your actual Bayonne office easy to find, with useful directions and original office photos.", icon: "pin" },
] as const;

export const phaseDisplay = [
  { days: "01–30", title: "Establish the baseline", summary: "Confirm credentials, hours and contact routing; correct verified links; start the review routine." },
  { days: "31–60", title: "Improve the journey", summary: "Improve the vein evaluation pathway, local information and clinical answers; address confirmed speed bottlenecks." },
  { days: "61–90", title: "Measure and refine", summary: "Review qualified inquiries, bookings, attendance and response times; improve where suitable prospects drop out." },
];

export const measureLabels = ["Qualified inquiries", "Booking rate", "Attendance rate", "Response & spam"];
