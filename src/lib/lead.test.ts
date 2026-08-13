/**
 * Plain assertions for lead validation and email composition.
 * Run with: npm run test:lead
 */

import assert from "node:assert/strict";
import {
  NOTIFY_TO,
  composeNotification,
  composeReport,
  isValidEmail,
  parseLeadPayload,
  type LeadPayload,
} from "./lead";
import { CHECK_EXPLANATIONS } from "./checkExplanations";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

const BODY = {
  email: "doctor@veinpractice.com",
  phone: "(555) 555-5555",
  report: {
    practiceName: "Vein-ity: Vein Care Centers of Kansas",
    url: "https://vein-ity.com",
    measuredAt: "2026-08-11T18:25:19.273Z",
    fromCache: true,
    verdict: {
      headline: "Patients can find you. Then they leave.",
      subline: "This site is discoverable — but on a phone connection, most patients never see it finish loading.",
    },
    scores: { ai: 60, patientsFind: 61, speed: 47 },
    issues: [
      { id: "schema.medical", label: "Medical practice identification", status: "fail" },
      { id: "schema.faq", label: "Frequently asked questions", status: "warn" },
    ],
  },
};

const parsedOk = (body: unknown): LeadPayload => {
  const r = parseLeadPayload(body);
  assert.ok(r.ok, `expected a valid payload: ${r.ok ? "" : r.error}`);
  return r.payload;
};

/* ---------- validation ---------- */

check("accepts ordinary addresses", () => {
  for (const e of [
    "doctor@veinpractice.com",
    "first.last@sub.domain.co.uk",
    "dr+audit@practice.io",
    "a_b@c.de",
  ]) {
    assert.ok(isValidEmail(e), e);
  }
});

check("rejects malformed addresses", () => {
  for (const e of ["", "nope", "no@domain", "two@@at.com", "spaces in@mail.com", "@no-local.com"]) {
    assert.ok(!isValidEmail(e), e);
  }
});

check("phone never blocks a submission", () => {
  assert.ok(parseLeadPayload({ ...BODY, phone: "" }).ok);
  assert.ok(parseLeadPayload({ ...BODY, phone: "not a phone at all" }).ok);
  assert.ok(parseLeadPayload({ ...BODY, phone: undefined }).ok);
  const noPhone = parsedOk({ ...BODY, phone: "   " });
  assert.equal(noPhone.phone, undefined);
});

check("a bad email is the only rejection", () => {
  const r = parseLeadPayload({ ...BODY, email: "nope" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /valid email/i);
});

check("a missing report still yields a usable lead", () => {
  // The address is the thing that matters; never lose it over a thin payload.
  const p = parsedOk({ email: "doctor@practice.com" });
  assert.equal(p.email, "doctor@practice.com");
  assert.equal(p.report.issues.length, 0);
  assert.deepEqual(p.report.scores, { ai: null, patientsFind: null, speed: null });
});

/* ---------- sanitisation ---------- */

check("control characters are stripped from free text", () => {
  const p = parsedOk({
    ...BODY,
    report: { ...BODY.report, practiceName: "Evil\r\nBcc: someone@else.com" },
  });
  assert.ok(!/[\r\n]/.test(p.report.practiceName ?? ""), p.report.practiceName ?? "");
});

check("HTML in posted text cannot reach the inbox unescaped", () => {
  const p = parsedOk({
    ...BODY,
    report: {
      ...BODY.report,
      practiceName: '<img src=x onerror="alert(1)">',
      verdict: { headline: "<script>bad()</script>", subline: "ok" },
    },
  });
  const html = composeNotification(p).html + composeReport(p).html;
  // What matters is that posted text cannot form a TAG. Escaped, the same
  // characters are inert prose — "onerror=" as literal text is harmless once
  // its "<" is gone, so assert on tag formation rather than on keywords.
  assert.ok(!/<script/i.test(html), "script tag survived escaping");
  assert.ok(!/<img/i.test(html), "img tag survived escaping");
  assert.ok(html.includes("&lt;script&gt;"), "expected the text to appear escaped");
  assert.ok(html.includes("&lt;img"), "expected the img text to appear escaped");
  // Quotes are escaped too, so nothing can break out of an attribute.
  assert.ok(!html.includes('onerror="'), "an unescaped quoted handler survived");
});

check("explanations come from OUR map, never from the request", () => {
  const p = parsedOk({
    ...BODY,
    report: {
      ...BODY.report,
      issues: [
        {
          id: "schema.medical",
          label: "Medical practice identification",
          status: "fail",
          explanation: "INJECTED TEXT FROM THE CLIENT",
        },
      ],
    },
  });
  const email = composeReport(p);
  assert.ok(!email.text.includes("INJECTED"), "client text leaked into the email");
  assert.ok(email.text.includes(CHECK_EXPLANATIONS["schema.medical"]), "our explanation is missing");
});

check("issue lists are capped and non-issues dropped", () => {
  const many = Array.from({ length: 60 }, () => ({
    id: "schema.faq",
    label: "x",
    status: "warn",
  }));
  const p = parsedOk({ ...BODY, report: { ...BODY.report, issues: [...many, { id: "a", label: "b", status: "pass" }] } });
  assert.ok(p.report.issues.length <= 40, `${p.report.issues.length} issues survived`);
  assert.ok(p.report.issues.every((i) => i.status === "fail" || i.status === "warn"));
});

/* ---------- notification email (to InflowMD) ---------- */

check("notification subject names the practice", () => {
  const email = composeNotification(parsedOk(BODY));
  assert.equal(email.subject, "Audit lead: Vein-ity: Vein Care Centers of Kansas");
});

check("notification carries everything needed to follow up", () => {
  const email = composeNotification(parsedOk(BODY));
  for (const needle of [
    "doctor@veinpractice.com",
    "(555) 555-5555",
    "Vein-ity: Vein Care Centers of Kansas",
    "vein-ity.com",
    "Patients can find you. Then they leave.",
    "Medical practice identification",
    "Frequently asked questions",
  ]) {
    assert.ok(email.text.includes(needle), `notification is missing: ${needle}`);
  }
  // All three scores, by category.
  assert.ok(email.text.includes("60") && email.text.includes("61") && email.text.includes("47"));
  // A timestamp.
  assert.match(email.text, /Captured: \d{4}-\d{2}-\d{2}T/);
});

check("notification says so when no phone was given", () => {
  const email = composeNotification(parsedOk({ ...BODY, phone: "" }));
  assert.match(email.text, /Phone: not provided/);
});

check("the notification goes to the InflowMD inbox", () => {
  assert.equal(NOTIFY_TO, "inflowmd@gmail.com");
});

/* ---------- report email (to the doctor) ---------- */

check("report email leads with the verdict they saw", () => {
  const email = composeReport(parsedOk(BODY));
  assert.ok(email.text.includes("Patients can find you. Then they leave."));
  assert.ok(email.html.includes("Patients can find you. Then they leave."));
});

check("report email lists the three scores and the failing checks", () => {
  const email = composeReport(parsedOk(BODY));
  assert.ok(email.text.includes("Is your website optimized for AI?: 60"));
  assert.ok(email.text.includes("Can patients find you?: 61"));
  assert.ok(email.text.includes("How fast is it?: 47"));
  assert.ok(email.text.includes("Medical practice identification — Not in place"));
  assert.ok(email.text.includes("Frequently asked questions — Needs work"));
});

check("report email closes with the site and contact line, and no hard sell", () => {
  const email = composeReport(parsedOk(BODY));
  assert.ok(email.text.includes("inflowmd.com"));
  assert.ok(email.text.includes("Clayton Peterson"));
  for (const pushy of ["buy", "sign up", "act now", "limited time", "don't miss"]) {
    assert.ok(!email.text.toLowerCase().includes(pushy), `too salesy: ${pushy}`);
  }
});

check("report email keeps the attribution split honest", () => {
  const email = composeReport(parsedOk(BODY));
  assert.match(email.text, /Google PageSpeed Insights/);
  assert.match(email.text, /InflowMD's own analysis/);
});

check("an unmeasured score reads as not measured, never as zero", () => {
  const p = parsedOk({
    ...BODY,
    report: { ...BODY.report, scores: { ai: null, patientsFind: 61, speed: 47 } },
  });
  const email = composeReport(p);
  assert.ok(email.text.includes("Is your website optimized for AI?: not measured"));
  assert.ok(!email.text.includes("AI?: 0"));
});

check("a clean site gets an honest, non-alarming report", () => {
  const p = parsedOk({ ...BODY, report: { ...BODY.report, issues: [] } });
  const email = composeReport(p);
  assert.ok(email.text.includes("Nothing we checked came back as a problem"));
});

console.log(`\n${passed} lead checks passed.`);
