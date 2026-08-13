/**
 * Plain assertions for the non-practice domain config and the not_applicable
 * state it produces. Run with: npm run test:non-practice
 *
 * The point of these: schema.medical is the single heaviest finding in the
 * audit (30 of 100 AI points). Anything that can excuse a site from it must be
 * an explicit list entry and nothing else — no page content, no keyword, no
 * URL pattern can talk a prospect's site out of that check.
 */

import assert from "node:assert/strict";
import { isNonPracticeDomain, nonPracticeEntry } from "./nonPracticeDomains";
import { runSchemaChecks } from "./checks/schema";
import { buildCategories } from "./categories";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

const medicalOf = (html: string, url?: string) =>
  runSchemaChecks({ html, htmlOk: true, url }).find((c) => c.id === "schema.medical")!;

/** A page with structured data, but nothing medical about it. */
const AGENCY_HTML = `<html><body>
  <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"Organization","name":"InflowMD"}
  </script>
</body></html>`;

/* ---------- the config ---------- */

check("the configured domain matches, with or without www", () => {
  assert.ok(isNonPracticeDomain("https://inflowmd.com"));
  assert.ok(isNonPracticeDomain("https://www.inflowmd.com"));
  assert.ok(isNonPracticeDomain("https://www.inflowmd.com/audit?x=1"));
});

check("the explanation is the exact sentence we show the reader", () => {
  assert.equal(
    nonPracticeEntry("https://www.inflowmd.com")?.explanation,
    "Not applicable — InflowMD is a marketing agency, not a medical practice."
  );
});

check("NO PROSPECT SITE IS EVER EXCUSED", () => {
  for (const url of [
    "https://vein-ity.com",
    "https://atlantaveincenter.com",
    "https://www.someveinclinic.com",
    // Names designed to look like ours, or to game a substring match.
    "https://inflowmd.co",
    "https://inflowmd.com.example.com",
    "https://notinflowmd.com",
    "https://myinflowmd.com",
  ]) {
    assert.equal(isNonPracticeDomain(url), false, `${url} must NOT be excused`);
  }
});

check("a subdomain is a different site and is not folded into the parent", () => {
  // Only "www." is stripped. booking.inflowmd.com would be its own site.
  assert.equal(isNonPracticeDomain("https://booking.inflowmd.com"), false);
});

check("an unparseable URL is never treated as a non-practice", () => {
  assert.equal(isNonPracticeDomain("not a url"), false);
  assert.equal(isNonPracticeDomain(""), false);
});

/* ---------- the check it produces ---------- */

check("a configured domain returns not_applicable with the reason", () => {
  const c = medicalOf(AGENCY_HTML, "https://www.inflowmd.com");
  assert.equal(c.status, "not_applicable");
  assert.equal(c.detail, "Not applicable — InflowMD is a marketing agency, not a medical practice.");
});

check("the SAME markup on a prospect's site still fails", () => {
  // Identical page, different domain. Nothing about the HTML earned the pass.
  const c = medicalOf(AGENCY_HTML, "https://vein-ity.com");
  assert.equal(c.status, "fail");
});

check("with no URL supplied at all, the check applies as normal", () => {
  // A caller that forgets to pass the URL must get the strict behaviour,
  // never the excused one.
  assert.equal(medicalOf(AGENCY_HTML).status, "fail");
});

check("a page with NO structured data is still excused on a configured domain", () => {
  // The early "nothing here at all" branch has its own hard-coded fail; it
  // must respect the config too.
  const bare = "<html><body><p>no structured data at all</p></body></html>";
  assert.equal(medicalOf(bare, "https://www.inflowmd.com").status, "not_applicable");
  assert.equal(medicalOf(bare, "https://vein-ity.com").status, "fail");
});

check("an unreadable page is could_not_verify, NOT not_applicable", () => {
  // We could not read it. That is a different claim from "does not apply",
  // and the configured domain must not overwrite it.
  const c = runSchemaChecks({ html: "", htmlOk: false, url: "https://www.inflowmd.com" }).find(
    (x) => x.id === "schema.medical"
  )!;
  assert.equal(c.status, "could_not_verify");
});

/* ---------- what it does to the score ---------- */

check("END TO END: the excused check is worth its full weight back", () => {
  const schema = runSchemaChecks({ html: AGENCY_HTML, htmlOk: true, url: "https://www.inflowmd.com" });
  const ai = buildCategories({ schema, seo: [], aiReadiness: [] }).find((c) => c.key === "ai")!;
  const item = ai.items.find((i) => i.check.id === "schema.medical")!;
  assert.equal(item.applicable, false);
  assert.equal(item.pointsLost, 0, "an excused check must cost nothing");

  // The same page on a prospect's domain loses the full 30.
  const prospect = runSchemaChecks({ html: AGENCY_HTML, htmlOk: true, url: "https://vein-ity.com" });
  const prospectItem = buildCategories({ schema: prospect, seo: [], aiReadiness: [] })
    .find((c) => c.key === "ai")!
    .items.find((i) => i.check.id === "schema.medical")!;
  assert.equal(prospectItem.pointsLost, 30);
});

console.log(`\n${passed} non-practice domain checks passed.`);
