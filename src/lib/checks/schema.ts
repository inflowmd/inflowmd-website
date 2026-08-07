import type { Check } from "@/types/audit";
import { getJsonLd, stripComments } from "./html";

/**
 * Structured-data checks. Structured data is the machine-readable summary of a
 * practice — it is how Google and AI assistants learn that a site belongs to a
 * physician, in a city, with these services and hours.
 */

export interface SchemaCheckInput {
  html: string;
  htmlOk: boolean;
}

/** schema.org types that identify a medical practice. */
const MEDICAL_TYPES = new Set([
  "medicalbusiness",
  "medicalclinic",
  "medicalorganization",
  "physician",
  "hospital",
  "dentist",
  "diagnosticlab",
  "pharmacy",
  "veterinarycare",
  "optician",
  "medicaltherapy",
]);

/** Types that are LocalBusiness or inherit from it. */
const LOCAL_BUSINESS_TYPES = new Set([
  "localbusiness",
  "medicalbusiness",
  "medicalclinic",
  "physician",
  "hospital",
  "dentist",
  "pharmacy",
  "healthandbeautybusiness",
  "professionalservice",
  "medicalorganization",
]);

const ORGANIZATION_TYPES = new Set([
  "organization",
  "medicalorganization",
  "corporation",
  "ngo",
  "localbusiness",
  "medicalbusiness",
  "medicalclinic",
  "hospital",
]);

/** Recursively collects every @type value, including inside @graph arrays. */
function collectTypes(node: unknown, found: Set<string>, depth = 0): void {
  if (depth > 12 || node === null || typeof node !== "object") return;

  if (Array.isArray(node)) {
    for (const item of node) collectTypes(item, found, depth + 1);
    return;
  }

  const obj = node as Record<string, unknown>;
  const type = obj["@type"];
  if (typeof type === "string") {
    found.add(type.trim());
  } else if (Array.isArray(type)) {
    for (const t of type) if (typeof t === "string") found.add(t.trim());
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") collectTypes(value, found, depth + 1);
  }
}

function matches(found: Set<string>, allowed: Set<string>): string[] {
  return [...found].filter((t) => allowed.has(t.toLowerCase().replace(/^schema:/, "")));
}

const SCHEMA_CHECK_IDS: Array<[string, string]> = [
  ["schema.present", "Machine-readable practice details"],
  ["schema.medical", "Medical practice identification"],
  ["schema.local-business", "Local listing details"],
  ["schema.faq", "Frequently asked questions"],
  ["schema.organization", "Organization details"],
];

function unverified(id: string, label: string, detail: string, evidence?: string): Check {
  return {
    id,
    label,
    status: "could_not_verify",
    detail,
    ...(evidence ? { evidence } : {}),
  };
}

export function runSchemaChecks({ html, htmlOk }: SchemaCheckInput): Check[] {
  if (!htmlOk) {
    const reason =
      "We could not read this page, so we did not check this. It may well be fine.";
    return SCHEMA_CHECK_IDS.map(([id, label]) => unverified(id, label, reason));
  }

  const { blocks, found: blockCount, parseFailures } = getJsonLd(stripComments(html));

  // Structured data is demonstrably present but we could not read any of it.
  // That is a limitation of our reader, not a gap in their site — report it
  // as unverifiable rather than accuse them of having none.
  if (blockCount > 0 && blocks.length === 0) {
    const reason =
      "This page publishes structured data, but we could not read it, so we did not judge what it contains.";
    const evidence = `Structured data present but could not be parsed (${parseFailures} of ${blockCount} block${
      blockCount === 1 ? "" : "s"
    })`;
    return SCHEMA_CHECK_IDS.map(([id, label]) => unverified(id, label, reason, evidence));
  }

  const found = new Set<string>();
  for (const block of blocks) collectTypes(block, found);

  const allTypes = [...found].sort();
  const typeList = allTypes.join(", ");
  const checks: Check[] = [];

  // --- Any structured data at all -------------------------------------------
  if (allTypes.length === 0) {
    checks.push({
      id: "schema.present",
      label: "Machine-readable practice details",
      status: "fail",
      detail:
        "This page carries no machine-readable summary, so Google and AI assistants have to guess at your practice details from ordinary page text.",
    });
    // Without any structured data, the specific checks below are genuine
    // absences, not unverifiable — we read the page successfully.
    checks.push({
      id: "schema.medical",
      label: "Medical practice identification",
      status: "fail",
      detail:
        "Search engines cannot tell that this site belongs to a medical practice rather than any other kind of business.",
    });
    checks.push({
      id: "schema.local-business",
      label: "Local listing details",
      status: "fail",
      detail:
        "Your address, phone number and hours are not published in a form search engines can read directly.",
    });
    checks.push({
      id: "schema.faq",
      label: "Frequently asked questions",
      status: "warn",
      detail:
        "No patient questions are marked up on this page, so they cannot appear as expandable answers in search results.",
    });
    checks.push({
      id: "schema.organization",
      label: "Organization details",
      status: "fail",
      detail:
        "The practice itself is not described in a machine-readable way, so search engines cannot connect your name, logo and profiles.",
    });
    return checks;
  }

  checks.push({
    id: "schema.present",
    label: "Machine-readable practice details",
    status: "pass",
    detail: `This page publishes ${allTypes.length} machine-readable ${
      allTypes.length === 1 ? "description" : "descriptions"
    } that search engines and AI assistants can read directly.`,
    evidence: typeList,
  });

  // --- Medical identity -----------------------------------------------------
  const medical = matches(found, MEDICAL_TYPES);
  checks.push(
    medical.length > 0
      ? {
          id: "schema.medical",
          label: "Medical practice identification",
          status: "pass",
          detail:
            "Search engines can tell this site belongs to a medical practice, which is what makes you eligible to appear for treatment searches.",
          evidence: `Found: ${medical.join(", ")}`,
        }
      : {
          id: "schema.medical",
          label: "Medical practice identification",
          status: "fail",
          detail:
            "Search engines cannot tell what kind of practice this is — nothing on the page identifies it as a medical provider.",
          evidence: `Found instead: ${typeList}`,
        }
  );

  // --- Local business -------------------------------------------------------
  const local = matches(found, LOCAL_BUSINESS_TYPES);
  checks.push(
    local.length > 0
      ? {
          id: "schema.local-business",
          label: "Local listing details",
          status: "pass",
          detail:
            "Your practice is described as a local business, which is how your address, phone number and hours reach local search results.",
          evidence: `Found: ${local.join(", ")}`,
        }
      : {
          id: "schema.local-business",
          label: "Local listing details",
          status: "fail",
          detail:
            "Your address, phone number and hours are not published in a form search engines can read directly, which weakens local visibility.",
          evidence: `Found instead: ${typeList}`,
        }
  );

  // --- FAQ ------------------------------------------------------------------
  const faq = matches(found, new Set(["faqpage", "qapage"]));
  checks.push(
    faq.length > 0
      ? {
          id: "schema.faq",
          label: "Frequently asked questions",
          status: "pass",
          detail:
            "Your patient questions are marked up so they can appear as expandable answers directly in search results.",
          evidence: `Found: ${faq.join(", ")}`,
        }
      : {
          id: "schema.faq",
          label: "Frequently asked questions",
          status: "warn",
          detail:
            "No patient questions are marked up on this page, so you are not eligible for the expandable answers competitors can win.",
        }
  );

  // --- Organization ---------------------------------------------------------
  const organization = matches(found, ORGANIZATION_TYPES);
  checks.push(
    organization.length > 0
      ? {
          id: "schema.organization",
          label: "Organization details",
          status: "pass",
          detail:
            "The practice is described as an organization, which lets search engines connect your name, logo and official profiles.",
          evidence: `Found: ${organization.join(", ")}`,
        }
      : {
          id: "schema.organization",
          label: "Organization details",
          status: "warn",
          detail:
            "The practice itself is not described in a machine-readable way, so search engines cannot reliably connect your name, logo and profiles.",
          evidence: `Found instead: ${typeList}`,
        }
  );

  return checks;
}
