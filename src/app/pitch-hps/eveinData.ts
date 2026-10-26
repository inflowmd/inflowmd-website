/**
 * Dr. Magnant's eVein screening — questions, points, clinical classes, modifiers,
 * thresholds and result wording, PORTED VERBATIM for this review route.
 *
 * SOURCE — vein-specialists @ 1e96271: src/data/evein.ts.
 * These are the practice's clinical rules. Not one label, point value, threshold
 * or line of result copy is changed here. Nothing is invented, and no result is
 * derived from a count of selections: the tier comes from calc() below, exactly
 * as the source computes it.
 *
 * Pure data and pure functions. Answers live only in the demo component's React
 * state — this module neither stores nor transmits anything.
 */

export const STEPS = ["signs", "symptoms", "history", "result"] as const;
export type StepKey = (typeof STEPS)[number];
export type GroupKey = Exclude<StepKey, "result">;

export const SIDE = { R: "Right", L: "Left", B: "Both" } as const;
export const DUR = { "<3m": "Less than 3 months", "3-12m": "3 to 12 months", "1-5y": "1 to 5 years", "5y+": "More than 5 years" } as const;
export const IMPACT = { none: "No effect", some: "Some effect", lot: "A lot" } as const;
export const AGE = { "<30": "Under 30", "30s": "30 to 39", "40s": "40 to 49", "50s": "50 to 59", "60s": "60 to 69", "70+": "70 or older" } as const;
export const HRS = { "0-3": "0 to 3 hours", "4-6": "4 to 6 hours", "7-9": "7 to 9 hours", "10-12": "10 to 12 hours", "13+": "13 or more hours" } as const;
export const OUTCOME = { better: "Symptoms improved", same: "Symptoms stayed the same", worse: "Symptoms got worse" } as const;
export const STOCK = { no: "Have not tried them", helped: "Tried them and they helped enough", notenough: "Tried them and they did not help enough" } as const;
export const CEAP = [
  { c: 0, n: "No signs" }, { c: 1, n: "Spider veins" }, { c: 2, n: "Varicose veins" }, { c: 3, n: "Swelling" },
  { c: 4, n: "Skin changes" }, { c: 5, n: "Healed sore" }, { c: 6, n: "Open sore" },
] as const;

export interface Item {
  id: string;
  t: string;
  /** points */
  p: number;
  /** clinical class (C1 to C6) the sign fits */
  c?: number;
  sides?: "RL" | "RLB";
  only?: "F" | "M";
  /** items that do not add points (or flag something) */
  flag?: "pelvic" | "urgent" | "dvt";
  warn?: 1;
  year?: 1;
}
export interface Group { title: string; note?: string; treated?: 1; items: Item[] }

export const GROUPS: Record<GroupKey, Group[]> = {
  signs: [
    { title: "Veins and swelling", note: "Pick the side for each one you check.", items: [
      { id: "s_sp", t: "Spider veins", p: 1, c: 1, sides: "RLB" },
      { id: "s_var", t: "Bulging varicose veins", p: 3, c: 2, sides: "RLB" },
      { id: "s_swl", t: "Ankle or leg swelling", p: 2, c: 3, sides: "RLB" },
    ] },
    { title: "Skin changes", items: [
      { id: "s_disc", t: "Brown discoloration, or red, itchy skin on the lower leg", p: 3, c: 4, sides: "RLB" },
      { id: "s_hard", t: "Hard, tight, or shiny skin near the ankle", p: 3, c: 4, sides: "RLB" },
      { id: "s_heal", t: "A leg sore that has healed", p: 4, c: 5, sides: "RLB" },
      { id: "s_open", t: "An open leg sore", p: 5, c: 6, sides: "RLB" },
    ] },
    { title: "Elsewhere", items: [
      { id: "s_pelv", t: "Pelvic or lower back pain", p: 0, flag: "pelvic" },
    ] },
  ],
  symptoms: [
    { title: "How your legs feel", items: [
      { id: "y_heavy", t: "Heavy or tired legs", p: 2 },
      { id: "y_ache", t: "Aching or pain", p: 2 },
      { id: "y_burn", t: "Throbbing, itching, or burning", p: 1 },
      { id: "y_cramp", t: "Night cramps or restless legs", p: 2 },
    ] },
    { title: "Patterns that point to veins", items: [
      { id: "y_end", t: "Worse by evening or after standing", p: 2 },
      { id: "y_elev", t: "Better when you raise your legs or wear compression", p: 2 },
    ] },
    { title: "Pelvic symptoms (not scored)", items: [
      { id: "y_urin", t: "Frequent urination, including at night", p: 0, flag: "pelvic" },
      { id: "y_mens", t: "Painful periods", p: 0, flag: "pelvic", only: "F" },
      { id: "y_inter", t: "Pain during or after intercourse", p: 0, flag: "pelvic", only: "F" },
    ] },
    { title: "Needs prompt care", items: [
      { id: "y_dvt", t: "New swelling in one leg over hours or days, with pain, warmth, or redness", p: 0, flag: "urgent", warn: 1 },
    ] },
  ],
  history: [
    { title: "Risk factors", items: [
      { id: "h_fam", t: "Close relatives have varicose veins", p: 1 },
      { id: "h_dvt", t: "I have had a leg blood clot (DVT)", p: 2, flag: "dvt" },
      { id: "h_preg", t: "Pregnant two or more times", p: 1, only: "F" },
      { id: "h_inj", t: "Past leg injury or leg surgery", p: 1 },
    ] },
    { title: "Which procedures", note: "Add the year if you know it.", treated: 1, items: [
      { id: "h_abl", t: "Ablation (laser or radiofrequency)", p: 0, year: 1 },
      { id: "h_scl", t: "Sclerotherapy or foam injections", p: 0, year: 1 },
      { id: "h_oth", t: "VenaSeal, microphlebectomy, or stripping", p: 0, year: 1 },
    ] },
  ],
};

export const TIERS = {
  low: { name: "Lower likelihood", body: "Few signs of vein disease. If your legs still bother you, request a free evaluation." },
  mod: { name: "Moderate likelihood", body: "Several features of vein disease. An evaluation can show whether treatment would help." },
  high: { name: "Higher likelihood", body: "Many signs of vein disease. We recommend requesting an evaluation." },
} as const;
export type Tier = keyof typeof TIERS;
export const LOW_MAX = 5, MOD_MAX = 12, SCALE = 24;

export interface State {
  step: number;
  sex: "F" | "M";
  on: Record<string, boolean>;
  side: Record<string, keyof typeof SIDE>;
  year: Record<string, string>;
  dur: "" | keyof typeof DUR;
  sev: number;
  impact: keyof typeof IMPACT;
  age: "" | keyof typeof AGE;
  sit: "" | keyof typeof HRS;
  stand: "" | keyof typeof HRS;
  treated: "yes" | "no";
  outcome: "" | keyof typeof OUTCOME;
  stock: keyof typeof STOCK;
}

export function fresh(): State {
  return { step: 0, sex: "F", on: {}, side: {}, year: {}, dur: "", sev: 0, impact: "none",
    age: "", sit: "", stand: "", treated: "no", outcome: "", stock: "no" };
}

export const vis = (state: State, it: Item) => !it.only || it.only === state.sex;

function allItems(state: State) {
  const out: { k: GroupKey; it: Item }[] = [];
  (Object.keys(GROUPS) as GroupKey[]).forEach((k) => {
    GROUPS[k].forEach((g) => {
      if (g.treated && state.treated !== "yes") return;
      g.items.forEach((it) => { if (vis(state, it)) out.push({ k, it }); });
    });
  });
  return out;
}

export interface Result {
  sec: Record<GroupKey, number>;
  total: number;
  tier: Tier;
  raised: string;
  maxc: number;
  urgent: boolean;
  pelvic: boolean;
  dvt: boolean;
}

/** The practice's own scoring. Copied line for line; nothing here is re-derived. */
export function calc(state: State): Result {
  const sec = { signs: 0, symptoms: 0, history: 0 };
  let maxc = 0, urgent = false, pelvic = false, dvt = false;
  allItems(state).forEach((o) => {
    const it = o.it;
    if (!state.on[it.id]) return;
    sec[o.k] += it.p;
    if (it.c && it.c > maxc) maxc = it.c;
    if (it.flag === "urgent") urgent = true;
    if (it.flag === "pelvic") pelvic = true;
    if (it.flag === "dvt") dvt = true;
  });
  if (state.dur === "1-5y" || state.dur === "5y+") sec.symptoms += 1;
  if (state.sev >= 7) sec.symptoms += 1;
  if (state.impact === "some") sec.symptoms += 1;
  if (state.impact === "lot") sec.symptoms += 2;
  if (state.age === "50s" || state.age === "60s" || state.age === "70+") sec.history += 1;
  if (state.stand === "7-9" || state.stand === "10-12" || state.stand === "13+") sec.history += 1;
  if (state.sit === "10-12" || state.sit === "13+") sec.history += 1;
  if (state.treated === "yes" && (state.outcome === "same" || state.outcome === "worse")) sec.history += 2;
  if (state.stock === "notenough") sec.history += 1;
  const total = sec.signs + sec.symptoms + sec.history;
  let tier: Tier = total <= LOW_MAX ? "low" : total <= MOD_MAX ? "mod" : "high";
  let raised = "";
  if (maxc >= 5 && tier !== "high") { tier = "high"; raised = "a healed or open leg sore"; }
  else if (maxc === 4 && tier === "low") { tier = "mod"; raised = "skin changes on the leg"; }
  return { sec, total, tier, raised, maxc, urgent, pelvic, dvt };
}

export function reported(state: State, key: GroupKey): string[] {
  const out: string[] = [];
  GROUPS[key].forEach((g) => {
    if (g.treated && state.treated !== "yes") return;
    g.items.forEach((it) => {
      if (!vis(state, it) || !state.on[it.id]) return;
      let s = it.t;
      if (state.side[it.id]) s += " (" + SIDE[state.side[it.id]] + ")";
      if (state.year[it.id]) s += " (" + state.year[it.id] + ")";
      out.push(s);
    });
  });
  if (key === "symptoms") {
    if (state.dur) out.push("Duration: " + DUR[state.dur]);
    if (state.sev > 0) out.push("Worst discomfort: " + state.sev + " of 10");
    if (state.impact !== "none") out.push("Limits daily life: " + IMPACT[state.impact]);
  }
  if (key === "history") {
    if (state.age) out.push("Age: " + AGE[state.age]);
    if (state.sit) out.push("Sitting per day: " + HRS[state.sit]);
    if (state.stand) out.push("Standing per day: " + HRS[state.stand]);
    out.push("Treated for veins before: " + (state.treated === "yes" ? "Yes" : "No"));
    if (state.treated === "yes" && state.outcome) out.push("After treatment: " + OUTCOME[state.outcome]);
    out.push("Compression stockings: " + STOCK[state.stock]);
  }
  return out;
}

/** Step heads and result copy, verbatim from the source. */
export const EVEIN_COPY = {
  heads: {
    signs: ["What you can see", "Check any that apply."],
    symptoms: ["How you feel", "Vein symptoms often build through the day."],
    history: ["Your history", "A few last questions."],
  } as Record<GroupKey, [string, string]>,
  next: ["Next: Symptoms", "Next: History", "See my result", "Start over"],
  urgent: { strong: "Get care today", body: "A newly swollen, painful leg can be a blood clot. Call 239-694-8346 now, or go to urgent care or the ER if we are closed. Call 911 for chest pain or trouble breathing." },
  raised: (r: string) => `Your score is lower, but ${r} raised your result. Vein disease may be advancing.`,
  dvt: "You had a leg blood clot before. Tell us when you call.",
  pelvicNote: "You reported pelvic or lower back signs. Ask us about a pelvic venous screening too.",
  ladderCaption: "Doctors grade vein disease C0 to C6 by the most advanced sign present. Signs can appear in any order.",
} as const;

/** Step names for the progress rail, as the source labels them. */
export const STEP_NAMES = ["Signs", "Symptoms", "History", "Result"] as const;

/**
 * sign id → its marker on the legs. From the practice's own SymptomScreener.tsx,
 * already ported into this route; the mapping is unchanged.
 */
export const MARK: Record<string, string> = {
  s_sp: "sp", s_var: "var", s_swl: "swl", s_disc: "disc", s_hard: "hard", s_heal: "heal", s_open: "open",
};
export const LEG_PATH =
  "M10 0C8 50 16 110 22 160C25 178 20 192 20 205C16 240 20 275 28 305C32 325 34 345 33 362C32 372 28 380 26 388C24 398 32 402 46 402L84 402C94 402 94 392 86 388C76 384 66 378 62 366C60 345 64 320 70 290C76 260 72 225 64 205C62 195 64 180 66 165C74 120 88 60 90 0Z";

export const DEMO_NOTE = "Screening is not a diagnosis. No information is submitted.";
