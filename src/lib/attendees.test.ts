/**
 * Plain assertions for the picker's attendee matching. No test framework —
 * run with: npm run test:attendees
 *
 * These pin the picker's own worked examples from the spec so a future
 * change to the matcher (or the data file) can't silently break "chatt"
 * finding Chattanooga by city, a city search finding a doctor with no
 * practice name, or a shared domain finding both attendee names.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { attendeeMatches, hasNoWebsite, type Attendee } from "./attendees";

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

const dataPath = path.resolve(process.cwd(), "data/hps-practices.json");
const attendees = JSON.parse(readFileSync(dataPath, "utf8")) as Attendee[];

function namesMatching(query: string): string[] {
  return attendees.filter((a) => attendeeMatches(a, query)).map((a) => a.name);
}

check("data file has the real 67-attendee list, not a placeholder", () => {
  assert.equal(attendees.length, 67);
});

check("'chatt' matches The Vein Institute of Chattanooga by city", () => {
  const names = namesMatching("chatt");
  assert.ok(
    names.includes("The Vein Institute of Chattanooga"),
    `expected Chattanooga entry in: ${JSON.stringify(names)}`
  );
});

check("'Wylie' (city) matches Dr. Julie Kilgore, who has no practice name field", () => {
  const names = namesMatching("Wylie");
  assert.ok(
    names.some((n) => n.includes("Kilgore")),
    `expected Kilgore entry in: ${JSON.stringify(names)}`
  );
  const kilgore = attendees.find((a) => a.name.includes("Kilgore"));
  assert.ok(kilgore, "Kilgore entry must exist in the data file");
  assert.ok(hasNoWebsite(kilgore!), "Kilgore has no website on file");
});

check("'salcedo' matches BOTH attendee names sharing one domain", () => {
  const names = namesMatching("salcedo");
  assert.ok(names.includes("Salcedo Medical Center"), JSON.stringify(names));
  assert.ok(
    names.includes("Salcedo Medical Center And Vein Institute"),
    JSON.stringify(names)
  );
  assert.equal(names.length, 2, `expected exactly 2 Salcedo entries, got: ${JSON.stringify(names)}`);
});

check("match is case-insensitive", () => {
  assert.ok(namesMatching("CHATT").includes("The Vein Institute of Chattanooga"));
  assert.ok(namesMatching("ChAtT").includes("The Vein Institute of Chattanooga"));
});

check("empty query matches everything", () => {
  assert.equal(namesMatching("").length, attendees.length);
  assert.equal(namesMatching("   ").length, attendees.length);
});

check("a query matching nothing returns an empty list, not a crash", () => {
  assert.deepEqual(namesMatching("zzzzznonexistentqueryzzzzz"), []);
});

console.log(`\n${passed} attendee matcher checks passed.`);
