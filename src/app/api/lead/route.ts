import { NextResponse } from "next/server";
import {
  NOTIFY_TO,
  composeNotification,
  composeReport,
  parseLeadPayload,
  type LeadPayload,
} from "@/lib/lead";
import { clientIp, rateLimit } from "@/lib/rateLimit";

/**
 * Lead capture from the audit result screen.
 *
 * THE GOVERNING RULE: a doctor who has just handed over their email address
 * must never see an error, and we must never lose the lead. Every step after
 * validation is best-effort and independently guarded — the console log
 * always happens, the file append and both emails may each fail on their own,
 * and the response is 200 regardless. A mail outage is our problem, not the
 * visitor's.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Resend requires a verified sending domain. Override with LEAD_FROM_EMAIL
 * once inflowmd.com is verified; the default is Resend's shared test sender,
 * which only delivers to the account owner's own address.
 */
const FROM = process.env.LEAD_FROM_EMAIL ?? "InflowMD Audit <onboarding@resend.dev>";

async function sendEmail(
  to: string,
  email: { subject: string; html: string; text: string }
): Promise<{ ok: boolean; detail: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key || /^(your_|placeholder|changeme|xxx|<)/i.test(key)) {
    return { ok: false, detail: "RESEND_API_KEY is not configured" };
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, detail: `Resend returned ${res.status} ${body.slice(0, 200)}` };
    }
    return { ok: true, detail: "sent" };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : "request failed" };
  }
}

/**
 * Backup copy on disk.
 *
 * Works locally. On Vercel the filesystem is read-only outside /tmp and this
 * will fail every time by design — which is exactly why the console line
 * below is written first and unconditionally: in production THAT is the
 * durable record, alongside the notification email.
 */
async function appendLeadFile(payload: LeadPayload): Promise<{ ok: boolean; detail: string }> {
  try {
    const { readFile, writeFile, mkdir } = await import("node:fs/promises");
    const path = await import("node:path");
    const dir = path.resolve(process.cwd(), "data");
    const file = path.join(dir, "leads.json");

    let leads: unknown[] = [];
    try {
      const existing = JSON.parse(await readFile(file, "utf8"));
      if (Array.isArray(existing)) leads = existing;
    } catch {
      /* first lead, or unreadable — start a fresh list rather than fail */
    }
    leads.push({ receivedAt: new Date().toISOString(), ...payload });
    await mkdir(dir, { recursive: true });
    await writeFile(file, `${JSON.stringify(leads, null, 2)}\n`, "utf8");
    return { ok: true, detail: file };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : "write failed" };
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = parseLeadPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const payload = parsed.payload;

  // Light abuse guard. Generous enough that a booth queue never trips it.
  const limit = rateLimit(`lead:${clientIp(request)}`);
  if (!limit.allowed) {
    // Even a throttled submission is logged — a real lead behind a noisy
    // neighbour is still a lead we would rather have than not.
    console.warn(`[LEAD] rate-limited but recorded: ${JSON.stringify(payload)}`);
    return NextResponse.json({ ok: true, throttled: true });
  }

  // FIRST, ALWAYS: one greppable line. Everything after this can fail.
  console.log(`[LEAD] ${JSON.stringify({ receivedAt: new Date().toISOString(), ...payload })}`);

  const [file, notify, report] = await Promise.all([
    appendLeadFile(payload),
    sendEmail(NOTIFY_TO, composeNotification(payload)),
    sendEmail(payload.email, composeReport(payload)),
  ]);

  if (!file.ok) console.warn(`[LEAD] backup file not written: ${file.detail}`);
  if (!notify.ok) console.error(`[LEAD] NOTIFICATION EMAIL FAILED: ${notify.detail}`);
  if (!report.ok) console.error(`[LEAD] REPORT EMAIL FAILED to ${payload.email}: ${report.detail}`);

  // Always 200. The visitor's side of this transaction is complete either way.
  return NextResponse.json({
    ok: true,
    delivered: { notification: notify.ok, report: report.ok, backup: file.ok },
  });
}
