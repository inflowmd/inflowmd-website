# HANDOFF — /audit booth tool

**Status: DONE. Deployed to production and merged to main.** Nothing is
pending. This file exists in case a session boundary hits mid-work; as of
the last edit it did not — everything below already happened, in order,
most recent first.

## Latest: PSI authentication hardening (fixes the anonymous-call quota leak)

Google Cloud showed PSI traffic split between the named key
(`pagespeed-audit-key`, 248 requests) and **Anonymous**. Anonymous calls
land in Google's small shared public quota, which is why ~100 of our own
calls exhausted a "per day" limit.

**The product code was never the leak.** Both committed paths that reach
PageSpeed — `/api/audit` → `runAudit` and `scripts/prewarm.ts` → `runAudit`
— attach the key, and a machine-wide grep found no other repo calling
`pagespeedonline`. The leak was **ad-hoc invocations**: `npx tsx -e "...
runPageSpeed ..."` and a bare `curl`, neither of which loads `.env.local`
(verified empirically: bare `npx tsx -e` cannot see the key;
`--env-file-if-exists=.env.local` can). Both patterns were used for
diagnostics during these sessions. The enabling design flaw was a client
that silently omitted the key rather than complaining.

Three changes shipped:

1. **A keyless call is now loud.** `requestOnce` warns on every
   unauthenticated request — naming the behavior, the consequence, both
   fixes (`.env.local` locally, project env vars on Vercel) and the target
   that went out keyless. The same warning fires in the **`/api/audit`
   route** on the live path, so if the Vercel env var ever goes missing it
   appears in production logs instead of the route quietly degrading.
   Checked only before a live run — a cache hit never touches PageSpeed.
   The placeholder rule now lives in one exported `resolveApiKey()` so the
   route, the script and the client can't drift on what a usable key is.

2. **Every `tsx` entry point loads `.env.local`**, not just the pre-warm
   script, so a script that grows a PageSpeed call later inherits the key
   instead of silently going anonymous.

3. **The pre-warm script refuses to start without a key** — hard `exit 1`,
   before any network call, with a message saying how to fix it. It makes
   one call per site, so a keyless run would fire ~58 anonymous requests
   and burn the shared quota, potentially the morning of the conference.
   There is no scenario where running it keyless is correct, so it does not
   degrade. Verified by invoking it without the env file (refuses, exit 1,
   audits nothing) and confirming it passes the guard under `npm run
   prewarm`.

Tests: 4 new checks in `src/lib/pagespeed.test.ts` (14 total) — an
authenticated call attaches the key to the query string and stays silent; a
missing key warns once with fix instructions and sends no key; a
placeholder counts as missing; every retry of a keyless call warns, because
a keyless batch should be impossible to miss.

Deployed: `https://www.inflowmd.com` (READY, aliased, `/audit` 200).
Merged: merge commit `019283a` on `origin/main`.

**Still worth doing by hand:** check the quota page for GCP project
`583797351490`. The anonymous traffic is now stopped at the source, but if
the *authenticated* per-day limit is also set unusually low, that's a
separate ceiling worth raising before the conference.

## Earlier: quota-exhaustion cache fallback (shipped)

**Shipped: the booth now falls back to cache when a live run returns no
speed data.** The live-first fallback previously fired only on transport
failures (non-2xx, network error, client timeout). It missed the failure
mode that actually bites at a conference: PageSpeed's daily quota runs out
and the audit *succeeds* — fast HTTP 200, well-formed `AuditResult`, quota
message where the speed score should be. Nothing "failed", so the fallback
never triggered and the booth rendered a blank speed gauge while a measured
result sat in the cache.

The rule is now about the DATA, not the transport: live
`performance.available === false` AND a cached entry with
`performance.available === true` → render the cached result with the usual
"Showing our pre-run audit from [date]" line, and log the reason. Applies
equally to a quota rejection, a Lighthouse 500 that outlived its retries,
or any future partial. Unchanged where it should be: walk-ups with nothing
cached still show the honest partial; a cached entry that also lacks speed
is not swapped in; a live run that DID return speed always stands (even
when it diverges — that's the discrepancy warning's job).

The decision lives in `src/lib/liveFallback.ts` as a pure function so the
rule is unit-testable rather than only reachable by driving a browser.
Tests: `npm run test:livefallback`, 9 checks led by the quota case using
the real quota message. Also verified end-to-end in a browser against a
stubbed 200-with-no-speed response (cached 97 renders with the pre-run
note, no error state; walk-up still shows "Speed not measured"; healthy
live run untouched).

Deployed: `https://www.inflowmd.com` (READY, aliased, `/audit` 200).
Merged: merge commit `e382b5d` on `origin/main`.

**Diagnosed here, fixed in the section above — PSI calls were going out unauthenticated.**
Google Cloud shows traffic split between the named key
(`pagespeed-audit-key`, 248 requests) and **Anonymous**, which lands in
Google's shared low quota and explains exhausting after ~100 of our own
calls. Findings:

| Path | Key attached? |
|---|---|
| `/api/audit` route on Vercel (the booth's live audits) | Yes — env var set for Production + Preview |
| `npm run prewarm` | Yes — script passes `--env-file-if-exists=.env.local`; verified the key is visible |
| Local `next dev` / `next start` | Yes — Next.js auto-loads `.env.local` |
| **Ad-hoc `npx tsx -e "... runPageSpeed ..."`** | **NO — anonymous.** No env flag, so `process.env.PAGESPEED_API_KEY` is undefined. Verified empirically. This exact pattern was used for smoke tests during this session. |
| **Direct `curl` to the endpoint without `&key=`** | **NO — anonymous.** Used once during earlier diagnosis. |
| `npm run summarize`, all `test:*` scripts | No env file, but none of them reach PSI (summarize reads JSON; the pagespeed test stubs `fetch`), so no leak today — they would be silently anonymous if they ever did call. |

Only two committed code paths reach PSI (`/api/audit` → `runAudit` and
`scripts/prewarm.ts` → `runAudit`), and both are authenticated. A
machine-wide grep found no other repo calling `pagespeedonline`. **So the
anonymous traffic is coming from ad-hoc/diagnostic invocations, not from
the product.**

Root enabler: `resolveApiKey()` in `src/lib/pagespeed.ts` returns null when
the key is absent, and `requestOnce` then does `if (key) params.set(...)` —
silently proceeding unauthenticated. That converts "misconfigured
environment" into "quietly consuming Google's shared anonymous quota" with
no signal anywhere. Fixed — see the authentication-hardening section above.

## Earlier: PageSpeed backoff + API key findings

**Backoff.** `src/lib/pagespeed.ts` now retries server errors: wait 2s,
retry; wait 5s, retry; then give up and return the honest partial. The
retries share ONE deadline rather than multiplying the timeout — the 55s
ceiling is unchanged and now bounds the whole sequence, with each attempt
capped by whatever budget remains and a retry only starting when there's
room for both the wait and a real attempt after it. This matters: the
module's own history comment records that stacked full-length attempts are
exactly what previously handed callers a dead connection instead of a
report. Worst case the caller still waits 55s, never more.

Deliberately NOT retried:
- **timeouts** — a page slow enough to exhaust the budget will be slow
  again, and proving it costs the caller the partial report it could have
  had (pre-existing documented lesson, kept)
- **4xx, including 429 quota rejections** — retrying a quota rejection only
  makes it worse

Retries log a warning with status/target/attempt, so the pattern shows up
in pre-warm output and Vercel logs. Tests:
`src/lib/pagespeed.test.ts` (`npm run test:pagespeed`), 10 checks with
`fetch` stubbed and no network, including a pin on the real 2s/5s/55s
values so the spec can't drift.

**API key: dedicated at the app level — no separate key needed for
isolation.** Verified via the Vercel API across all 16 projects in the
account: only `inflowmd` defines `PAGESPEED_API_KEY`. A grep across all
local repos confirms only the inflowmd codebase references it. So no
sibling project is competing for the booth's quota.

**But the quota is the real problem, and a new key alone won't fix it.**
The daily quota was exhausted twice on 2026-08-11 after only roughly ~100
calls total (58-site pre-warm + 20-site speed-gap run + ad-hoc
diagnostics). PageSpeed Insights' documented default with an API key is
25,000 queries/day, so ~100 calls should not come close. Either the Google
Cloud project's PSI quota is set unusually low, or something outside this
repo is consuming it. The quota is billed to **GCP project number
583797351490** (from the error body). `gcloud` isn't installed on this
machine, so the quota page for that project has to be checked by hand —
that's the action item, ahead of minting a new key.

Distinguishing the two failure modes, since they were being conflated:
- **Quota**: HTTP 429, explicit `Quota exceeded for quota metric
  'Queries' and limit 'Queries per day'` message, returns in well under a
  second. Confirmed live during this work.
- **Transient Lighthouse failure**: HTTP 500, `Lighthouse returned error:
  Something went wrong`. These are what the backoff targets, and they
  succeeded on a later attempt every time in the pre-warm — including 3
  that needed the retry in the `--only-missing-speed` run.

So the earlier hypothesis that the 11 "API error (500)" responses were
rate-limiting does not hold: rate limiting presents as 429 with a quota
message, not 500.

**Open item worth deciding before the conference.** A quota-exhausted live
audit does NOT trigger the booth's cache fallback, because the audit
itself *succeeds* — it just comes back with `performance.available: false`.
The fallback only fires on API/network failure. Net effect: if quota is
out at the booth, a picker selection renders a report with no speed score
instead of the cached report that has one. Fixing that means treating "live
result came back with no speed data, but we hold a cached result that has
it" as a fallback condition. That's a behavior change to the live-first
rules, so it's flagged rather than assumed.

Deployed: `npx vercel --prod --yes` → `https://www.inflowmd.com`
(readyState READY, aliased, `/audit` 200). Merged: `claude/musing-kepler`
→ `main` (merge commit `cd74d32`), pushed to `origin/main`.

## Earlier: audit categories regrouped by question, weighted scoring

The old four categories grouped checks by technical family, which let the
booth contradict itself out loud: "Medical practice identification" could
FAIL — meaning AI cannot tell this is a vein practice — while "AI
readiness" still scored 90, because the most important AI signal lived in
a different category. Regrouped around the question each category answers.

**New categories** (all 20 checks reassigned; detection logic, labels and
explanations untouched — regrouping and rescoring only):

| Category | Checks |
|---|---|
| Can AI find you? | AI assistant access, crawler instructions file, AI content guide (llms.txt), redirect chain |
| Can AI understand you? | medical practice identification, machine-readable practice details, local listing details, organization details, page structure for AI, content depth, heading structure, FAQ |
| Can patients find you? | page title, search result description, main heading, mobile display, preferred address, social preview, image descriptions, secure connection |
| How fast is it? | Google Lighthouse performance, unchanged |

(The spec said "19 existing checks" but listed 20; the engine produces 20
and all 20 are assigned exactly once — a test asserts this can't drift.)

**Weighted scoring** replaced flat pass=1/warn=0.5/fail=0. Within "Can AI
find you?": crawler access 3, robots.txt 2, llms.txt 2, redirects 1.
Within "Can AI understand you?": medical identification 3, machine-readable
details 3, all others 1. "Can patients find you?": all 1.

**Hard ceilings**: a category is capped at 40 when its gate check FAILS —
medical identification for "Can AI understand you?", crawler access for
"Can AI find you?". Deliberate nuance: `could_not_verify` does NOT trigger
a ceiling, because an unread check is not a failure — that would be the
exact false accusation the engine refuses to make. `could_not_verify` is
still excluded from the denominator and the minimum-verified floor is
unchanged.

**Architecture note that matters for future work**: categories are DERIVED
from the raw checks by a shared pure table (`src/lib/categories.ts`) that
the server (`runAudit`, pre-warm) and the booth UI both call. Two
consequences: live and cached results can never disagree about a number,
and a result measured before this change renders under the new categories
with correct new numbers — **no re-warm was required**. `AuditResult.seo /
.schema / .aiReadiness` are now raw MODULE output, not display groupings;
read categories via `buildCategories()`, never by assuming those arrays are
user-facing. The shipped cache's stored `scores` were normalized onto the
new shape by pure recomputation — every measurement and timestamp is
byte-identical (asserted during the rewrite, aborts if anything moved).

**Attribution fixed**: only "How fast is it?" credits Google PageSpeed
Insights; the other three carry a small "InflowMD analysis" label. The
picker intro line no longer implies the whole tool is Google's.

Also updated: llms.txt explanation copy; "What we'd fix" strip and the
comparison block remapped; findings list grouped under the category
headings in order with per-category scores; scan-stage outcomes rewired;
prewarm/summarize report the new categories (summarize derives, so it
reads pre-restructure entries correctly). The flat scorer in `scoring.ts`
is gone — that file now holds only the invariants both sides share.

**Tests**: `src/lib/categories.test.ts` (`npm run test:categories`), 18
checks including the two required ceiling assertions, membership
completeness (every engine check assigned exactly once, no unknown ids),
weight sensitivity, `could_not_verify` handling, and a regression test for
the exact contradiction this change exists to fix. Full suite (model,
security, attendees, categories) passes; tsc/eslint/build clean.

**Effect, on real data**: Vein-ity previously read "AI readiness 100" with
medical identification failing; it now reads "Can AI understand you? 40".
Across the 58 attending practices the median "ai understands" score is
**40** — i.e. the median practice hits the medical-identification ceiling.
That is a strong, defensible booth talking point.

Deployed: `npx vercel --prod --yes` → `https://www.inflowmd.com`, verified
live (all four category labels render, 3 "InflowMD analysis" labels + 1
Google label, old labels gone). Merged: `claude/musing-kepler` → `main`
(merge commit `c37a4f6`), pushed to `origin/main`, HEAD confirmed.

## Earlier: patched the cache's speed gaps (--only-missing-speed)

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
