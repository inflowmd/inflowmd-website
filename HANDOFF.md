# HANDOFF — /audit booth tool

**Status: DONE. Deployed to production and merged to main.** Nothing is
pending. This file exists in case a session boundary hits mid-work; as of
the last edit it did not — everything below already happened, in order,
most recent first.

## Latest: patched the cache's speed gaps (--only-missing-speed)

Follow-up to the live-first change: the cache had 20 of 58 entries with no
performance data (PSI timeouts and transient 500s from the original
pre-warm run, listed in full in the prior conversation turn). Added a
targeted re-run mode to `scripts/prewarm.ts`:

```
npm run prewarm -- --only-missing-speed
```

Re-audits ONLY cache entries whose `performance.available` is false (or
that have no cached entry yet) — every complete entry is carried forward
byte-for-byte untouched, no network call, no delay, no re-timestamp
(verified: exactly 20 entries' `fetchedAt` changed, 38 stayed identical).
Sanity bounds (history comparison, outlier retry, stale-value keep) stay
active for whatever IS re-audited. The audit + anomaly-retry logic was
extracted into a shared `auditWithAnomalyCheck` helper so the normal pass
and this targeted mode don't duplicate it.

On top of that, a target that still has no performance data after its
first fresh attempt gets ONE more full attempt (30s later, same
anomaly-check machinery) before being accepted as an honest partial —
"PSI timeouts are transient" held up: of the 20 re-audited, 3 needed that
second attempt and all 3 succeeded on it. Only 1 (Vein and Wellness
Centers of Texas — veinandwellnesscenters.com, timeout both times) is
still missing after retry, listed by name in the run report's "Speed
data still missing after retry" section and in the console output.

**Before/after**: 38 of 58 → **57 of 58** cache entries have complete
speed data. `scripts/prewarm.ts`'s report now also prints this count
directly (`Speed data: X of Y cache entries have complete performance
data.`) so it doesn't have to be computed by hand next time.

Deployed: `npx vercel --prod --yes` → `https://www.inflowmd.com`. First
deploy attempt failed on a transient Vercel build-infra issue (Google
Fonts module resolution failure during the Turbopack build — unrelated
to this change, a flaky network hiccup on Vercel's side); the immediate
retry succeeded cleanly. Merged: `claude/musing-kepler` → `main` (merge
commit `cb5aeec`), pushed to `origin/main`, confirmed HEAD matches.

Open: Vein and Wellness Centers of Texas has no speed data at all — if
that practice comes up at the booth, the live-first flow will attempt a
real PSI run (which may well succeed live even though pre-warm's two
attempts didn't), and if that also fails it'll render the cached partial
honestly (`could_not_verify` styling, never a false failure) rather than
a live speed number.

## Earlier: live-first picker, cache as silent fallback

Picker/browse-grid selections now run a REAL live audit (force:true, full
scan sequence — the honest "Google is measuring this site" experience)
under the attendee's own name, instead of instantly rendering the
pre-warmed cache. Full behavior:

- **Live-first**: selecting a practice always attempts a genuine live PSI
  run first (unless booth network-safety mode has kicked in — see below).
- **Silent cache fallback**: if the live attempt fails for any reason —
  non-2xx response, network error, or it drags past a 75s soft ceiling
  (`FALLBACK_TIMEOUT_MS`, shorter than the route's 150s budget) — it
  silently substitutes the pre-warmed cache. No error state reaches the
  visitor, just a small "Showing our pre-run audit from [date]" line under
  the header. The fallback is always logged to console
  (`[BOOTH] Live audit for ... — showing the pre-run result from ...`).
- **C key** (running or result screen): force-loads the cached version
  immediately — the mid-demo escape hatch for a dragging live run. Same
  fallback-note UI, logs `[BOOTH] C pressed — force-loaded ...`.
- **Sanity check**: a live score that differs from the cached score by 25+
  points still renders as the live result (it's what was watched
  happening) but logs a loud `BOOTH ALERT: performance discrepancy ...` —
  the signal to verify the number before quoting it.
- **No-website entries and the manual walk-up URL field are unchanged** —
  still call `runLive` with the old defaults (force:false, no fallback),
  keeping their existing honest failure/retry screen exactly as before.
- **Booth-mode network safety**: `navigator.onLine === false` at boot, or
  a failed page-load reachability probe against `/api/audit` (a same-origin
  GET — any response, even 405, proves the network path works; a thrown
  error doesn't), flips picker selections to cache-first automatically —
  instant cache render, zero live attempts, flagged only by a small dot in
  the header corner, subtle enough that only the presenter would notice.
  `online`/`offline` listeners keep this current for the rest of the
  session, not just at load. Known limitation: this catches total network
  death (dead venue wifi), not selective blocking (wifi up, PSI/Google
  specifically firewalled) — that failure mode is instead caught per-run by
  the ordinary live-failure fallback above.

**Verification**: a 30-check Playwright suite against a mocked
`/api/audit` route covered every behavior above — request shape
(`force:true`), the discrepancy warning while still showing the live
number, silent fallback on a 500/network-error/75s-timeout (the timeout
test used Playwright's virtualized clock rather than a real 75s wait), C
on both the running and result screens, an Escape-during-run race-safety
check (a deliberately cancelled run must never sneak in a stale fallback
render after the user has already backed out), the two network-down boot
modes, and confirmation the walk-up path sends `force` unset/false and
still shows its old honest error screen. All 30 passed. Also smoke-tested
directly against production after deploying (live scan sequence appears,
POST carries `force:true`, Escape aborts cleanly, no-website path intact).
`tsc`, `eslint`, and `next build` all clean throughout.

Deployed: `npx vercel --prod --yes` → `https://www.inflowmd.com`. Merged:
`claude/musing-kepler` → `main` (merge commit `0aaa801`), pushed to
`origin/main`, confirmed HEAD matches.

## Earlier: real conference data + two-layer picker

- Real attendee data (`data/hps-practices.json`, 67 practices — 59 with a
  URL, 8 with none) replaced all placeholder data everywhere: pre-warm,
  picker, browse grid.
- Pre-warm batch ran against all 58 unique domains (shared domains, e.g.
  Salcedo's two attendee names on one site, audited once). Sanity bounds
  (history comparison, outlier retry, stale-value keep) were active and
  fired zero anomalies. Result: 55 ok, 3 failed (real site issues — a 503,
  a DNS miss, a timeout — not engine bugs), 8 no-website.
  - Full run report: `data/prewarm-report.txt`
  - Platform clustering (by platform/builder/vendor/exact signature):
    `data/platform-summary.txt` — headline finding: 71% of attendees run
    WordPress, WordPress+Elementor is the single largest template cluster,
    21% run bare WordPress with no builder detected.
- Picker built as two layers: fuzzy type-ahead (name/city/state) plus a
  full-screen alphabetical browse grid of all 67 with sticky letter
  headers and neutral "no site found" markers. (Layer 1 selection no
  longer renders the cache instantly, per the live-first change above —
  this section describes the original shape of the two layers, not their
  current selection behavior.)
- An attendee with no website routes to a dedicated opportunity screen
  (not an error), "Talk to us at the booth" CTA.
- Caught and fixed a real bug mid-task: "chatt" returned no match because
  the picker rewrite existed only in the local worktree and had never
  been deployed — not a code bug. Added `src/lib/attendees.test.ts`
  (`npm run test:attendees`) pinning the spec's three worked examples
  (chatt → Chattanooga by city, Wylie → Dr. Julie Kilgore by city, salcedo
  → both shared-domain names) plus edge cases.
- `normalizeUrl` and `cacheKey` were extracted into dependency-free
  modules (`src/lib/normalizeUrl.ts`, `src/lib/cacheKey.ts`) so the
  now-client-side picker can use them without pulling `node:dns`/`node:fs`
  into the browser bundle. Originals (`runAudit.ts`, `cache.ts`) re-export
  from these for existing server-side callers.

## Open flags / things to know

- `data/attendees.csv` (the old 3-practice placeholder file) was deleted —
  fully superseded.
- 3 of the 58 attending-practice sites failed to pre-warm (503 / DNS /
  timeout) — real problems with those sites, not the engine. They'll
  render as `could_not_verify`, never a false failure. With the live-first
  change, a booth visit to one of these will attempt a real live run
  first and, if it still fails live, fall back to that same
  `could_not_verify` cached shape — worth knowing before demoing one of
  them specifically.
- The picker's "no website" list (8 attendees) is worth someone's eyes
  before the conference — a few read like personal/independent-doctor
  entries rather than clinics; probably fine, flagging in case any are
  typos rather than genuine no-site cases.
- The booth-mode network-safety probe only checks reachability to our own
  `/api/audit` endpoint, not to PSI/Google specifically — see the
  "Known limitation" note above.
