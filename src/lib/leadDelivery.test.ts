/**
 * Delivery-level assertions for the lead route: what actually goes over the
 * wire to Resend. Composition is covered in lead.test.ts — this covers the
 * transport fields that no composed string can prove.
 *
 * Run with: npm run test:lead-delivery
 */

import assert from "node:assert/strict";
import { NOTIFY_TO, REPLY_TO } from "./lead";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

interface SentEmail {
  to: string[];
  from: string;
  reply_to?: string;
  subject: string;
}

/** Runs one POST with Resend stubbed out, and returns what it tried to send. */
async function submit(body: unknown, ip: string): Promise<{ status: number; sent: SentEmail[] }> {
  process.env.RESEND_API_KEY = "test_key_not_a_real_one";
  const sent: SentEmail[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url).includes("api.resend.com")) {
      sent.push(JSON.parse(String(init?.body)) as SentEmail);
      return new Response(JSON.stringify({ id: "stub" }), { status: 200 });
    }
    return realFetch(url as RequestInfo, init);
  }) as typeof fetch;

  // The route's file backup is resolved from cwd. Run from a temp directory
  // so a test lead never lands in the real data/leads.json.
  const cwd = process.cwd();
  process.chdir(await import("node:os").then((os) => os.tmpdir()));

  try {
    const { POST } = await import("@/app/api/lead/route");
    const res = await POST(
      new Request("http://localhost/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify(body),
      })
    );
    return { status: res.status, sent };
  } finally {
    globalThis.fetch = realFetch;
    process.chdir(cwd);
  }
}

const LEAD = {
  email: "doctor@veinpractice.com",
  phone: "(555) 555-5555",
  report: {
    practiceName: "Vein-ity: Vein Care Centers of Kansas",
    url: "https://vein-ity.com",
    scores: { ai: 60, patientsFind: 61, speed: 47 },
    issues: [{ id: "schema.medical", label: "Medical practice identification", status: "fail" }],
  },
};

// Wrapped in main(): this file compiles to CommonJS under tsx, where
// top-level await is not available.
async function main(): Promise<void> {
const run = await submit(LEAD, "10.11.12.13");

check("a valid lead is accepted", () => {
  assert.equal(run.status, 200);
});

check("both emails are attempted", () => {
  assert.equal(run.sent.length, 2, `sent ${run.sent.length} email(s)`);
});

check("the notification goes to us and the report to the doctor", () => {
  const recipients = run.sent.flatMap((e) => e.to);
  assert.ok(recipients.includes(NOTIFY_TO), `missing ${NOTIFY_TO}: ${recipients.join(", ")}`);
  assert.ok(recipients.includes(LEAD.email), `missing ${LEAD.email}: ${recipients.join(", ")}`);
});

check("BOTH emails carry the monitored reply-to address", () => {
  for (const email of run.sent) {
    assert.equal(
      email.reply_to,
      REPLY_TO,
      `${email.to.join(",")} would reply to ${email.reply_to ?? "the sending address"}`
    );
  }
});

check("reply-to is a monitored inbox, not the sending identity", () => {
  assert.equal(REPLY_TO, "clayton@inflowmd.com");
  // The whole point: a reply must not bounce back at the transport address,
  // which may be Resend's shared sender until inflowmd.com is verified.
  for (const email of run.sent) {
    assert.notEqual(email.reply_to, email.from);
  }
});

console.log(`\n${passed} lead delivery checks passed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
