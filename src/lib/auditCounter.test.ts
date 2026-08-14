/**
 * Plain assertions for what the booth counter counts.
 * Run with: npm run test:counter
 *
 * The store itself (a gist) is not exercised here — these cover the decisions
 * that would put a WRONG number on a poster in front of the people it is
 * describing: counting ourselves, counting a practice twice, or counting a
 * pre-warmed result that nobody at the event actually ran.
 */

import assert from "node:assert/strict";
import { NON_COUNTED_DOMAINS, isCountable, normalizeDomain } from "./auditCounter";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

/* ---------- normalisation ---------- */

check("www is stripped so one practice is one domain", () => {
  assert.equal(normalizeDomain("https://www.vein-ity.com"), "vein-ity.com");
  assert.equal(normalizeDomain("https://vein-ity.com"), "vein-ity.com");
  assert.equal(normalizeDomain("https://VEIN-ITY.com/services?x=1"), "vein-ity.com");
});

check("the same practice at different paths is one domain", () => {
  const a = normalizeDomain("https://www.veinkc.com/");
  const b = normalizeDomain("https://veinkc.com/contact");
  assert.equal(a, b);
});

check("an unparseable address counts as nothing", () => {
  assert.equal(normalizeDomain("not a url"), null);
  assert.equal(normalizeDomain(""), null);
  assert.equal(isCountable("not a url"), false);
});

/* ---------- what must never be counted ---------- */

check("OUR OWN SITE IS NEVER COUNTED", () => {
  // The result screen audits inflowmd.com live in its comparison block every
  // time a report opens. Without this the counter would mostly count us.
  assert.equal(isCountable("https://www.inflowmd.com"), false);
  assert.equal(isCountable("https://inflowmd.com/audit"), false);
});

check("THE COMPARISON SITE IS NEVER COUNTED", () => {
  // The result screen fires a live audit of it every time a report opens, so
  // if it were countable it would swamp the real booth traffic.
  assert.ok(NON_COUNTED_DOMAINS.includes("centerforveincareandsurgery.com"));
  assert.equal(isCountable("https://centerforveincareandsurgery.com"), false);
  assert.equal(isCountable("https://www.centerforveincareandsurgery.com/contact"), false);
});

check("the configured test domains are excluded", () => {
  assert.ok(NON_COUNTED_DOMAINS.includes("inflowmd.com"));
  assert.ok(NON_COUNTED_DOMAINS.includes("thebluffs.com"));
  assert.equal(isCountable("https://thebluffs.com"), false);
  assert.equal(isCountable("https://www.thebluffs.com/team"), false);
});

check("subdomains of an excluded domain are excluded too", () => {
  assert.equal(isCountable("https://staging.inflowmd.com"), false);
  assert.equal(isCountable("https://inflowmd-abc123.vercel.app"), false);
  assert.equal(isCountable("http://localhost:3311"), false);
});

check("a lookalike domain is NOT excused by a substring match", () => {
  // Ends-with matching is anchored on a dot, so these are real prospects.
  assert.equal(isCountable("https://notinflowmd.com"), true);
  assert.equal(isCountable("https://inflowmd.co"), true);
  assert.equal(isCountable("https://myinflowmd.com"), true);
});

/* ---------- what must be counted ---------- */

check("a real practice counts", () => {
  for (const url of [
    "https://vein-ity.com",
    "https://www.veinkc.com",
    "https://atlantaveincenter.com",
  ]) {
    assert.equal(isCountable(url), true, url);
  }
});

console.log(`\n${passed} audit counter checks passed.`);
