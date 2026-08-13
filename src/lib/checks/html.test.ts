/**
 * Plain assertions for the HTML helpers behind the SEO/AI checks.
 * Run with: npm run test:html
 *
 * The alt-text cases exist because we used to count alt="" as a MISSING
 * description. That is backwards: alt="" is the standards-defined way to mark
 * an image decorative so screen readers skip it. The old rule failed sites for
 * doing it right — including our own.
 */

import assert from "node:assert/strict";
import { getImageAltStats, findHeadingSkip } from "./html";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

/* ---------- alt text ---------- */

check("a described image counts as described", () => {
  const s = getImageAltStats('<img src="a.jpg" alt="Dr. Sarah Chen">');
  assert.deepEqual(s, { total: 1, withAlt: 1, decorative: 0, missing: 0 });
});

check('DECORATIVE alt="" is correct markup, not a missing description', () => {
  const s = getImageAltStats('<img src="hero.jpg" alt="">');
  assert.equal(s.missing, 0, 'alt="" must never count as missing');
  assert.equal(s.decorative, 1);
  assert.equal(s.withAlt, 1, "it is handled, so it counts toward coverage");
});

check("an image with NO alt attribute is the real defect", () => {
  const s = getImageAltStats('<img src="a.jpg">');
  assert.equal(s.missing, 1);
  assert.equal(s.withAlt, 0);
});

check("REGRESSION: our own homepage shape scores full coverage", () => {
  // Three described images plus one decorative hero background — exactly what
  // www.inflowmd.com serves. This used to be 3/4 = 0.75 → a FAIL.
  const html = `
    <img src="/logo.png" alt="InflowMD">
    <img src="/hero.jpg" alt="">
    <img src="/doctor.jpg" alt="Dr. Sarah Chen">
    <img src="/logo.png" alt="InflowMD">`;
  const s = getImageAltStats(html);
  assert.equal(s.total, 4);
  assert.equal(s.missing, 0);
  assert.equal(s.withAlt / s.total, 1, "coverage must be complete, not 0.75");
});

check("a genuinely undescribed image still drags coverage down", () => {
  const html = `
    <img src="a.jpg" alt="described">
    <img src="b.jpg">
    <img src="c.jpg">`;
  const s = getImageAltStats(html);
  assert.equal(s.missing, 2);
  assert.ok(s.withAlt / s.total < 0.8, "should land in fail territory");
});

check("whitespace-only alt is treated as decorative, not as a description", () => {
  const s = getImageAltStats('<img src="a.jpg" alt="   ">');
  assert.equal(s.decorative, 1);
  assert.equal(s.withAlt - s.decorative, 0, "it describes nothing");
});

check("single quotes and extra attributes are handled", () => {
  const s = getImageAltStats("<img class='x' src='a.jpg' alt='A vein clinic waiting room' loading='lazy'>");
  assert.equal(s.withAlt, 1);
  assert.equal(s.decorative, 0);
});

check("no images at all is not a defect", () => {
  assert.deepEqual(getImageAltStats("<p>text</p>"), {
    total: 0,
    withAlt: 0,
    decorative: 0,
    missing: 0,
  });
});

/* ---------- heading order ---------- */

const heads = (...levels: number[]) => levels.map((level) => ({ level, text: `h${level}` }));

check("a clean outline has no skip", () => {
  assert.equal(findHeadingSkip(heads(1, 2, 2, 3, 2)), null);
});

check("h1 → h3 is a skip", () => {
  assert.deepEqual(findHeadingSkip(heads(1, 3)), { fromLevel: 1, toLevel: 3 });
});

check("h2 → h4 is a skip — the shape our footer used to create", () => {
  assert.deepEqual(findHeadingSkip(heads(1, 2, 2, 4)), { fromLevel: 2, toLevel: 4 });
});

check("jumping back UP any number of levels is never a skip", () => {
  // A footer h2 after a page h3 is fine; only descending too fast counts.
  assert.equal(findHeadingSkip(heads(1, 2, 3, 4, 2)), null);
  assert.equal(findHeadingSkip(heads(1, 2, 3, 1)), null);
});

console.log(`\n${passed} html helper checks passed.`);
