import { CHECK_EXPLANATIONS } from "@/lib/checkExplanations";

/**
 * Lead capture — payload shape, validation, and the two emails.
 *
 * Composition lives here as pure functions so the wording can be tested
 * without a mail service, and so the route stays a thin transport layer.
 *
 * SAFETY: everything in a payload arrives from a browser over a public
 * endpoint. Strings are length-capped and HTML-escaped before they reach an
 * email body, and check explanations are looked up from OUR map by id rather
 * than taken from the request — a posted explanation would be arbitrary text
 * injected into an inbox.
 */

export interface LeadIssue {
  id: string;
  label: string;
  status: "fail" | "warn";
}

export interface LeadReport {
  practiceName: string | null;
  url: string;
  measuredAt: string;
  fromCache: boolean;
  verdict: { headline: string; subline: string } | null;
  scores: { ai: number | null; patientsFind: number | null; speed: number | null };
  issues: LeadIssue[];
}

export interface LeadPayload {
  email: string;
  phone?: string;
  report: LeadReport;
}

export const NOTIFY_TO = "clayton@inflowmd.com";

/**
 * Where replies land. The sending address is a no-reply transport identity
 * (and may be Resend's shared sender until inflowmd.com is verified), so a
 * doctor who simply hits Reply must be routed to a monitored inbox instead.
 */
export const REPLY_TO = "clayton@inflowmd.com";
export const CONTACT_LINE = "Clayton Peterson · InflowMD · inflowmd.com";

/**
 * Deliberately permissive: one @, something either side, a dot in the domain.
 * A stricter pattern rejects addresses that are perfectly deliverable, and
 * the cost of a wrong rejection at a booth is a lost lead.
 */
export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 254) return false;
  if (/\s/.test(trimmed)) return false;
  return /^[^@]+@[^@.]+(\.[^@.]+)+$/.test(trimmed);
}

/** Strips control characters and caps length. */
function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Narrows an arbitrary request body into a payload, or explains why not. */
export function parseLeadPayload(
  body: unknown
): { ok: true; payload: LeadPayload } | { ok: false; error: string } {
  const raw = (body ?? {}) as Record<string, unknown>;
  const email = clean(raw.email, 254);
  if (!isValidEmail(email)) return { ok: false, error: "A valid email address is required." };

  const reportRaw = (raw.report ?? {}) as Record<string, unknown>;
  const scoresRaw = (reportRaw.scores ?? {}) as Record<string, unknown>;
  const verdictRaw = reportRaw.verdict as Record<string, unknown> | null | undefined;

  const score = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null;

  const issues: LeadIssue[] = Array.isArray(reportRaw.issues)
    ? reportRaw.issues
        .slice(0, 40)
        .map((i) => {
          const item = (i ?? {}) as Record<string, unknown>;
          const status = item.status === "fail" || item.status === "warn" ? item.status : null;
          if (!status) return null;
          return { id: clean(item.id, 80), label: clean(item.label, 120), status };
        })
        .filter((i): i is LeadIssue => i !== null)
    : [];

  return {
    ok: true,
    payload: {
      email,
      phone: clean(raw.phone, 40) || undefined,
      report: {
        practiceName: clean(reportRaw.practiceName, 160) || null,
        url: clean(reportRaw.url, 400),
        measuredAt: clean(reportRaw.measuredAt, 40),
        fromCache: reportRaw.fromCache === true,
        verdict: verdictRaw
          ? {
              headline: clean(verdictRaw.headline, 200),
              subline: clean(verdictRaw.subline, 400),
            }
          : null,
        scores: {
          ai: score(scoresRaw.ai),
          patientsFind: score(scoresRaw.patientsFind),
          speed: score(scoresRaw.speed),
        },
        issues,
      },
    },
  };
}

const CATEGORY_TITLE = {
  ai: "Is your website optimized for AI?",
  patientsFind: "Can patients find you?",
  speed: "How fast is it?",
} as const;

const displayScore = (v: number | null) => (v === null ? "not measured" : String(v));
const displayName = (r: LeadReport) => r.practiceName || r.url || "Unknown practice";

export interface ComposedEmail {
  subject: string;
  html: string;
  text: string;
}

/** What lands in the InflowMD inbox — everything needed to follow up. */
export function composeNotification(payload: LeadPayload): ComposedEmail {
  const { report } = payload;
  const name = displayName(report);
  const rows = [
    ["Email", payload.email],
    ["Phone", payload.phone || "not provided"],
    ["Practice", name],
    ["Website", report.url],
    ["Audit", report.fromCache ? `pre-measured ${report.measuredAt}` : `live ${report.measuredAt}`],
    ["Captured", new Date().toISOString()],
  ] as const;

  const scoreLines = (Object.keys(CATEGORY_TITLE) as Array<keyof typeof CATEGORY_TITLE>).map(
    (k) => `${CATEGORY_TITLE[k]} — ${displayScore(report.scores[k])}`
  );

  const issueLines = report.issues.map(
    (i) => `${i.status === "fail" ? "FAIL" : "NEEDS WORK"} — ${i.label}`
  );

  const text = [
    `New audit lead: ${name}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    report.verdict ? `Verdict shown: "${report.verdict.headline}"` : "Verdict shown: (none)",
    report.verdict ? report.verdict.subline : "",
    "",
    "Scores",
    ...scoreLines,
    "",
    `Issues (${issueLines.length})`,
    ...(issueLines.length > 0 ? issueLines : ["none"]),
  ].join("\n");

  const html = `
    <h2>New audit lead: ${escapeHtml(name)}</h2>
    <table cellpadding="4" style="border-collapse:collapse;font-family:system-ui,sans-serif">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="color:#555">${escapeHtml(k)}</td><td><strong>${escapeHtml(String(v))}</strong></td></tr>`
        )
        .join("")}
    </table>
    ${
      report.verdict
        ? `<p style="font-family:system-ui,sans-serif"><strong>Verdict shown:</strong> ${escapeHtml(
            report.verdict.headline
          )}<br><span style="color:#555">${escapeHtml(report.verdict.subline)}</span></p>`
        : ""
    }
    <h3 style="font-family:system-ui,sans-serif">Scores</h3>
    <ul style="font-family:system-ui,sans-serif">${scoreLines
      .map((l) => `<li>${escapeHtml(l)}</li>`)
      .join("")}</ul>
    <h3 style="font-family:system-ui,sans-serif">Issues (${issueLines.length})</h3>
    <ul style="font-family:system-ui,sans-serif">${
      issueLines.length > 0
        ? issueLines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")
        : "<li>none</li>"
    }</ul>
  `.trim();

  return { subject: `Audit lead: ${name}`, html, text };
}

/** What the doctor receives — their findings, plainly, with no hard sell. */
export function composeReport(payload: LeadPayload): ComposedEmail {
  const { report } = payload;
  const name = displayName(report);

  const scoreLines = (Object.keys(CATEGORY_TITLE) as Array<keyof typeof CATEGORY_TITLE>).map(
    (k) => `${CATEGORY_TITLE[k]}: ${displayScore(report.scores[k])}`
  );

  // Explanations come from our own map, keyed by id — never from the request.
  const issues = report.issues.map((i) => ({
    label: i.label,
    status: i.status === "fail" ? "Not in place" : "Needs work",
    explanation: CHECK_EXPLANATIONS[i.id] ?? "",
  }));

  const closing = `The full audit is at inflowmd.com/audit — run it on any site, any time.\n\n${CONTACT_LINE}`;

  const text = [
    `Your website audit — ${name}`,
    "",
    report.verdict ? report.verdict.headline : "",
    report.verdict ? report.verdict.subline : "",
    "",
    "Scores",
    ...scoreLines,
    "",
    issues.length > 0 ? "What we'd fix first" : "Nothing we checked came back as a problem.",
    ...issues.flatMap((i) => [
      "",
      `${i.label} — ${i.status}`,
      i.explanation,
    ]),
    "",
    `Speed is measured by Google PageSpeed Insights. Search and AI readiness are InflowMD's own analysis.`,
    "",
    closing,
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;color:#14181f;line-height:1.5">
      <h2 style="margin:0 0 4px">Your website audit</h2>
      <p style="margin:0 0 20px;color:#55606f">${escapeHtml(name)} — ${escapeHtml(report.url)}</p>
      ${
        report.verdict
          ? `<div style="border-left:3px solid #84B83B;padding:8px 14px;margin:0 0 20px">
               <p style="margin:0;font-size:18px;font-weight:700">${escapeHtml(report.verdict.headline)}</p>
               <p style="margin:6px 0 0;color:#55606f">${escapeHtml(report.verdict.subline)}</p>
             </div>`
          : ""
      }
      <h3 style="margin:0 0 8px">Scores</h3>
      <ul style="margin:0 0 20px;padding-left:18px">
        ${scoreLines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}
      </ul>
      <h3 style="margin:0 0 8px">${
        issues.length > 0 ? "What we&rsquo;d fix first" : "Nothing we checked came back as a problem"
      }</h3>
      ${issues
        .map(
          (i) => `<div style="margin:0 0 14px">
            <p style="margin:0;font-weight:700">${escapeHtml(i.label)} — ${escapeHtml(i.status)}</p>
            <p style="margin:4px 0 0;color:#55606f">${escapeHtml(i.explanation)}</p>
          </div>`
        )
        .join("")}
      <p style="margin:24px 0 0;color:#55606f;font-size:13px">
        Speed is measured by Google PageSpeed Insights. Search and AI readiness are InflowMD&rsquo;s own analysis.
      </p>
      <p style="margin:16px 0 0">
        The full audit is at <a href="https://www.inflowmd.com/audit">inflowmd.com/audit</a> —
        run it on any site, any time.
      </p>
      <p style="margin:12px 0 0;color:#55606f">${escapeHtml(CONTACT_LINE)}</p>
    </div>
  `.trim();

  return { subject: `Your website audit — ${name}`, html, text };
}
