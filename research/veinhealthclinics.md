# Vein Health Clinics — research findings

**Target:** veinhealthclinics.com · Dr. Obinna Nwobi · five Florida locations
**Research date:** August 28, 2026 (every item below verified on this date unless stated)
**Session type:** research only — nothing built, nothing deployed
**Feeds:** a future `/audit/veinhealthclinics`, on the `/audit/veinandmedspa` pattern

**Standing rule applied.** Verified at source or marked `could_not_verify`. Nothing is inferred from a
comparable practice, and nothing whose mechanism I could not establish is written up as a finding — those
sit in the punch list at the end, which is longer than usual and deliberately so.

---

## 0. The cached entry — and a correction to the premise

An entry exists in `data/prewarmed-audits.json` (cache generated 2026-08-18T04:37Z):

| Field | Value in cache |
|---|---|
| url | `https://www.veinhealthclinics.com` |
| fetchedAt | 2026-08-18T04:27:56Z |
| htmlFetch | **`ok: true`, statusCode 200, blocked: false** |
| scores | performance 56 · ai 86 (11/11) · patientsFind 89 (9/9) |
| lighthouse / LCP | 56 / 13.58s |
| platform | WordPress + Elementor |

`data/prewarm-history.json` carries the same figures in both `previous` and `current`.

**This does not match the premise in the brief.** The brief says the site was down during the sweep. The
cached record says the opposite: a successful 200 fetch with a complete set of scores and no
`could_not_verify` anywhere in it. I am reporting the discrepancy rather than resolving it — I cannot
establish from here what the site was doing on August 18, only what the record says.

Either way the instruction stands and I have followed it: **that score is used for nothing below.** Every
figure in section 1 is from a fresh run dated today.

---

## 1. Engine re-run — August 28, 2026

Run directly against `runAudit` (the booth counter only records through the API route, so this did not
touch it). Two passes, roughly two hours apart.

| | Pass 1 | Pass 2 |
|---|---|---|
| Speed | **57** | **56** |
| LCP | 13.35s | 13.35s |
| FCP | 8.1s | 8.1s |
| Speed Index | 8.4s | 8.95s |
| Total Blocking Time | 6ms | 0ms |
| CLS | 0 | 0 |
| Is your website optimized for AI? | **86** (11 of 11 verified) | 86 (11 of 11) |
| Can patients find you? | **89** (9 of 9 verified) | 89 (9 of 9) |

The two passes do not disagree materially, so nothing was discarded and nothing averaged. Stated the way
it should appear on a page: **speed sits in the mid-to-high fifties**, AI readiness in the mid-eighties,
search readiness in the high eighties. LCP was identical to the hundredth of a second across both runs.

Checks not passing (identical in both runs): `ai.semantic-structure`, `schema.organization`,
`seo.heading-order`, `schema.faq`, `ai.llms-txt`, `seo.meta-description`, `seo.image-alt` — all **warn**,
none failing outright.

---

## 2. Manual site walk

**Method:** all 57 sitemap URLs fetched server-side, plus rendered passes in headless Chromium for forms,
CTAs and policies.

### 2.1 Inventory

`sitemap_index.xml` (Yoast) → four child sitemaps: `post` 28, `page` 26, `gallery` 1, `category` 2 =
**57 URLs**. All 57 return HTTP 200. **No redirects among them, and no orphans** — every sitemap URL is
linked from at least one other page.

`robots.txt` is stock WordPress (`Disallow: /wp-admin/`) and declares the sitemap.

### 2.2 Live pages absent from the sitemap

Five aesthetic-service landing pages are live at 200 and in no sitemap:

`/emsculpt-lp/` · `/fat-reduction-lp/` · `/skin-tightening-lp/` · `/skin-resurfacing-lp/` ·
`/anti-wrinkle-dermal-fillers-lp/`

Each is linked from exactly one page. An entire body-contouring/aesthetics line exists as landing pages
outside the sitemap.

### 2.3 Broken links — three, all internal, all low-reach

| Link | Status | Linked from |
|---|---|---|
| `/contactus/` | **404** | 3 pages |
| `/services/pelvic-congestion/` | **404** | 1 page |
| `/services/peripheral-artery-disease/` | **404** | 1 page |

The last one matters more than its count: `/services/peripheral-artery-disease-florida/` exists and is
fine, so this is an old slug still linked. Also observed: one malformed href, `/job-opening/&`.

**Checked and NOT broken** (recorded so nobody re-reports them): `/contact` and `/contact/` both 301 to
`/contact-us/`; the `winterhaven.` subdomain link resolves (§8). I checked every candidate with the
trailing slash as written in the markup — without it, several of these return 404 at this host and would
have produced false findings.

### 2.4 The screening CTA — observed, mechanism not established

This is the one I would most want a second look at before it goes on a page.

On `/contact-us/`, the visible screening CTA differs by viewport:

- **Desktop:** "FREE VEIN SCREENING" → `https://www.veinhealthclinics.com/contact/#book`
- **Mobile (390px):** "Book a Free Vein Screening" → `https://www.veinhealthclinics.com/contact-us/#book`
- The other one is present but hidden at each width.

`/contact/` 301s to `/contact-us/`, so both land on the page the user is already on. **No element with
`id="book"` or `name="book"` exists on that page** — checked in the rendered DOM at both widths.

What I could not establish is what happens next, because the page did not behave the same way twice:

| Load | Widget iframes | Form |
|---|---|---|
| First load (`networkidle`, scrolled) | 5 present, all `src="about:blank"` with `data-src` to `api.leadconnectorhq.com/widget/form/…` and `/widget/booking/…` | none until a click, then 1 form / 7 inputs appeared |
| Later load, both viewports, full scroll + 8s | **0 widget iframes** | none |
| Three consecutive fresh loads, 12s wait each | **0 widget iframes, 0 scripts referencing leadconnector** | none |

So the forms are third-party **LeadConnector / GoHighLevel** widgets, and on most of my loads they were
not in the DOM at all. I am not calling this a broken form: I could not establish the trigger, and a
mechanism I cannot name is not a finding. **Punch list.**

### 2.5 Forms, spam protection, consent

Because of §2.4 I can only report what I observed: on the one load where a form rendered, it had 7 inputs
and **no consent checkbox**; no reCAPTCHA/hCaptcha/Turnstile markers were present in the page source on
any of the 57 pages, and no captcha element rendered on any load. Since the forms are third-party
iframes, spam protection may live inside the widget where I cannot see it. **`could_not_verify` on spam
protection; consent checkbox not observed.**

### 2.6 Privacy and terms — not found

No link containing "privacy", "terms", "HIPAA", "notice" or "accessibility" appears on the homepage, the
contact page or `/patient-information/`, in the rendered DOM. There is no privacy-policy or terms URL in
the 57-page sitemap, and `/privacy-policy/`, `/terms-of-use/`, `/hipaa/` were each checked directly.

One privacy policy *is* reachable from the property, but it is not theirs: the Winter Haven subdomain
assessment page (§8) links to **`clinicgrower.com/privacy-policy/`**, and a `cdn.reviewwave.com/embed/
rw_privacy_policy.html` iframe appeared on one contact-page load. Both are vendor policies.

### 2.7 Headings

**Every page has an H1; no template defaults anywhere.** Four pages carry two H1s:

- `/services/peripheral-artery-disease-florida/` — "Peripheral Artery Disease (PAD) Treatment in Oviedo, FL" + "Peripheral Artery Disease Florida"
- `/services/sclerotherapy-treatment-florida/` — "Sclerotherapy Injections in Oviedo, FL" + "Sclerotherapy treatment Florida"
- `/services/varicose-veins-treatment-florida/` — "Varicose Vein Removal in Oviedo, FL" + "Get Rid of Varicose Veins For Good"
- `/vein-doctors-alafaya/` — "Vein Doctors Alafaya" + "Vein Doctors Alafaya —Expert Vascular Care Near You"

No H1 is repeated across pages. The engine's `seo.heading-order` warn is consistent with this.

Worth noting for a page-level finding later: three service pages title themselves **"in Oviedo, FL"** while
the practice runs five offices.

### 2.8 Structured data

JSON-LD on **all 57 pages**, and **zero unparseable blocks**.

`BreadcrumbList` 57 · `WebSite` 57 · `WebPage` 55 · `ImageObject` 47 · `Person` 28 · **`FAQPage` 24** ·
`Physician` 3 · `CollectionPage` 2 · **`HealthAndBeautyBusiness` 1**

The gap is the business entity: there is **no `MedicalClinic`, `MedicalBusiness` or `LocalBusiness` type
anywhere**, and the single business-entity node on the site is typed `HealthAndBeautyBusiness`. For a
five-location vascular surgery practice that is the wrong shelf. This is consistent with the engine's
`schema.organization` warn.

### 2.9 Viewport and zoom

`<meta name="viewport" content="width=device-width, initial-scale=1.0">` — **no `maximum-scale`, no
`user-scalable=no`. Pinch-zoom is not restricted.** Recorded because it is a common finding elsewhere and
is genuinely absent here.

### 2.10 Platform, and who maintains it

- **WordPress + Elementor** (asset paths and builder markers; the engine agrees). A custom theme at
  `/wp-content/themes/vhc/`.
- **Footer build credit: "Powered by Online Marketing For Doctors."**
- **LeadConnector / GoHighLevel** supplies the forms and booking widgets (§2.4).
- **Review Wave** (`cdn.reviewwave.com`) supplies at least one embed, and the footer carries a review
  widget reading **"4,8/5 (466 reviews)"** — with a comma decimal separator.
- **ClinicGrower** — the Winter Haven subdomain assessment page links to their privacy policy (§8).

Four separate vendor fingerprints. I have not established which relationship is current.

### 2.11 Credential claims

"Board certified" / "board-certified" appears 125 times across the 57 pages, and `/our-team/` describes
Dr. Nwobi as a board-certified **vascular surgeon**. **No certifying board is named anywhere**, and no
ABVLM, ACP, RPVI, FACS or RVT credential string appears on any page. **No years-of-experience claim
appears anywhere on the site**, so there is no internal contradiction to check — I looked for one
specifically and there is nothing there.

Only one physician is named on the site: **Dr. Obinna Nwobi**.

---

## 3. Google Ads Transparency Center

Checked August 28, 2026, `adstransparency.google.com`, region **United States**, domain filter
`veinhealthclinics.com`, in a real browser.

**Result: 0 ads, under the "Any time" filter** — not merely the 30-day window. The page renders "No ads
found."

Two things I could not resolve:

1. The page also displays the line *"This domain includes results for multiple advertiser accounts with
   ads pointing to this domain. You can filter by individual advertiser below."* — while simultaneously
   reporting 0 ads. I opened the advertiser filter and it listed **no options**; an advertiser-name search
   for "Vein Health Clinics" returned no suggestions. I could not establish whether that sentence
   reflects real accounts or is boilerplate shown on every domain query. **Punch list.**
2. Therefore **no advertiser identity was established** — I cannot say whether any account is the
   practice's own entity or an agency's.

**Weight of this evidence: very low, and it must be presented that way.** Absence in the Transparency
Center does not establish that the practice does not advertise. It does not cover non-Google channels, it
would not surface ads pointing at a different domain (the `winterhaven.` subdomain or a landing-page
domain, for instance), and I did not confirm its coverage rules. **Nothing about paid media should go on a
client page from this check.**

Since there are no ads, there is no ad-promise-versus-site cross-reference to run. That step is not
"clean" — it is **not applicable on the evidence available**.

---

## 4. NPI / NPPES — verified at source

`npiregistry.cms.hhs.gov` API, queried directly, August 28, 2026.

### 4.1 Dr. Obinna Nwobi — individual NPI `1912028853` — VERIFIED

Verbatim from the record:

| Field | Value |
|---|---|
| Name | **OBINNA UCHENNA NWOBI MD** |
| Status | A (active) · enumerated 2007-04-02 |
| **Last updated** | **2022-07-13** |
| Location address | **1121 1ST ST S, WINTER HAVEN FL 33880-3902** |
| Mailing address | same |
| Phone | 877-817-8346 |
| Primary taxonomy | `2086S0129X`, license ME106633 (FL) |
| Secondary taxonomy | `208600000X` — **"Surgery"** (generic), license 25MA08134900 |

Notes:

- The primary taxonomy code is the specific vascular-surgery code, so the **primary** classification is
  correct. A **generic "Surgery" code is carried as a secondary taxonomy** — worth flagging, but this is
  not the same defect as a practice whose *primary* code is generic.
- NPPES returns no description string for `2086S0129X`; the "Surgery, Vascular Surgery" label is NUCC's,
  not NPPES's. Code verified, label external.
- **The federal address is Winter Haven**, while the site's first-listed office and three of its service
  pages are **Oviedo**. Both are real offices; the record simply points at one of five. Recorded, not
  characterised as an error.
- A second "Nwobi" in Florida (NPI 1295921823, Obioma Nwobi, pediatric nephrology, Miami) is a different
  physician and is excluded.

### 4.2 Organization NPI — `could_not_verify`

No NPI-2 organization record found. Searched `VEIN HEALTH CLINICS`, `VEIN HEALTH*` and `NWOBI*` in FL
(0 results each); `VEIN*` in FL returned 20 unrelated organizations, none of them this practice. The
organization may be enumerated under a legal name I could not establish, or may not be enumerated at all.
**No legal entity name is established, and none should be asserted on a page.**

### 4.3 Other physicians

None to check. The site names exactly one physician.

---

## 5. Directory sweep — INCOMPLETE, and reported as such

**The brief asked for 15–20 publishers. I completed six, and I am not going to present six as a sweep.**

| Publisher | Result |
|---|---|
| Vitals | **200.** "Dr. Obinna Nwobi, MD \| Oviedo, FL \| Vascular Surgeon". Prompt observed: **"Is this you?"** Four phone numbers listed: **(877) 817-8346, (407) 278-6925, (407) 296-1000, (863) 293-1121**. Addresses include 1000 Executive Dr Ste 8, 1121 1st St S, and **572 Ocoee Commerce Pkwy** |
| WebMD | **200** on the directory search; an individual profile was returned but I did not open and confirm it. `could_not_verify` on claimed status and address |
| Healthgrades | **410 Gone** on the URL I tried — that URL was a guess, and a guessed slug on this site resolved to an unrelated physician in a previous session. `could_not_verify`; the correct profile URL was not established |
| Yelp | **403** to this network. `could_not_verify` |
| BBB | Searched Winter Haven, FL — **no listing found** |
| npino (NPPES mirror) | 200; carries an extra address (320 1st St N, Winter Haven) and phone (321-286-0517) not on NPPES. Mirror data, recorded but **not used** |

**Distinct values observed so far — an undercount, not a total:**

- **Phone numbers: at least five.** 877-817-8346 (site-wide), 863 223 3797, 772-261-5116, (352) 690-6000
  (all three on the site's own footer), plus (407) 278-6925, (407) 296-1000, (863) 293-1121 on Vitals.
- **Name spellings: at least four.** "Vein Health Clinics", "Vein Health Clinics \| Florida Vein Care
  Specialists", "Vein Health Clinic Winterhaven", "Vein Health Clinics Ocoee".
- **Addresses: at least seven.** The five on the site, plus 572 Ocoee Commerce Pkwy and 7490 Cypress
  Gardens Blvd from Google profiles (§6).

**Cross-location contamination via a shared phone: not tested.** The practice publishes one toll-free
number (877-817-8346) sitewide *and* location-specific numbers, which is exactly the setup where
aggregator de-duplication tends to merge records — but I did not run the scan that would show it. Do not
assert the mechanism; it is untested here.

---

## 6. Reviews and Google profiles

Captured in Google Maps, August 28, 2026, from Winter Haven and Oviedo coordinates.

### 6.1 The practice's own profiles — four of them

| Profile name | Rating | Reviews | Google category | Address |
|---|---|---|---|---|
| Vein Health Clinics \| Florida Vein Care Specialists | 4.8 | 361 | **Vascular surgeon** | 1121 1st St S (Winter Haven) |
| Vein Health Clinics: Obinna Nwobi, MD | 4.8 | 328 | **Medical Center** | 1000 Executive Dr #8 (Oviedo) |
| Vein Health Clinics | 4.8 | 190 | **Specialized clinic** | 301 SW Crown Point Rd #140 (Winter Garden) |
| Vein Health Clinics Ocoee | 4.7 | 41 | **Medical clinic** | 1000 Executive Dr |

Two observations that stand on their own:

1. **Four different Google categories across four of their own profiles.**
2. **"Vein Health Clinics Ocoee" carries the same street address as the Oviedo profile** (1000 Executive
   Dr) while being named for a different city. Whether that is a duplicate, a mislabelled listing or a
   genuine suite-sharing arrangement, **I did not establish. Punch list.**

I did not locate Google profiles for the Port St. Lucie or Ocala offices in these captures. That is a gap
in my capture, not evidence they do not exist.

### 6.2 Duplicate practitioner profiles — yes, two

| Profile | Rating | Reviews | Category | Address |
|---|---|---|---|---|
| Obinna Nwobi, MD | **3.0** | 2 | Vascular surgeon | 7490 Cypress Gardens Blvd |
| Obinna Nwobi, MD | **3.0** | 5 | Vascular surgeon | 572 Ocoee Commerce Pkwy |

Practitioner-level listings sitting alongside the practice listings, at two addresses that are **not among
the five offices published on the site**, both rated 3.0 against the practice profiles' 4.8. The 572
Ocoee Commerce Pkwy address also appears on the Vitals profile (§5).

### 6.3 Other platforms

- **Site footer widget: "4,8/5 (466 reviews)"** — an aggregate that matches no single Google profile
  (361 / 328 / 190 / 41). Presumably a multi-location roll-up from Review Wave; **mechanism not
  established. Punch list.**
- **Vitals:** rating and count not cleanly parsed — the page carries several counts (3, 19, 2 Ratings) and
  my extraction could not attribute them reliably. `could_not_verify`.
- **Yelp / Healthgrades:** blocked and not-found respectively (§5).
- **Recency and reply behaviour: not checked on any platform.** `could_not_verify`.

---

## 7. Google Business Profile — mostly `could_not_verify`

What I have is in §6.1: four profiles, four categories, with names and addresses.

What I did **not** verify, and therefore say nothing about: **claimed status, services menu, booking link,
UTM tagging on the profile website links, posts, or owner reply behaviour.** These are owner-side or
require opening each place panel, which I did not do.

**Category-versus-competitors is deliberately omitted.** The local pack capture failed (§9), and the brief
is explicit that competitor data is omitted entirely in that case — so while I hold competitor rows from
the Maps captures, they are not reported here and should not be reconstructed from this file. Their own
four-way category inconsistency stands on its own without a comparison.

---

## 8. Second domains and subdomains

- **`winterhaven.veinhealthclinics.com`** — live. `/survey-page-google` returns **200** and renders a
  *"Complimentary Online Vein Assessment — This quick ONE MINUTE assessment…"* page. It is **linked from
  32 of the 57 main-site pages**. The subdomain **root returns 404**. Its only outbound link is to
  **`clinicgrower.com/privacy-policy/`**.
- No other second domain established. `floridaveincarespecialists.com` — suggested by the Winter Haven
  profile name "Vein Health Clinics | Florida Vein Care Specialists" — **does not resolve**
  (`ERR_NAME_NOT_RESOLVED`), so that guess is dead and is recorded here so nobody tries it again.
- Whether the subdomain is indexed, and whether it duplicates main-site content, I did not check.

---

## 9. Local pack — `could_not_verify`

Google web search returns the "unusual traffic … not a robot" interstitial to this network on both
`vein doctor winter haven fl` and `varicose vein treatment winter haven fl`, geo-targeted to the Winter
Haven metro established in §4.

**No local pack was captured, and no competitor data is reported anywhere in this file.** Maps rankings
are a different surface and are not a substitute; the competitor rows they returned are deliberately
excluded per the brief.

---

## Punch list — observed, mechanism NOT established

These are not findings. None of them may be written up as findings without further work.

1. **The LeadConnector form/booking widgets appear inconsistently.** Five widget iframes present and
   unactivated on one load; entirely absent from the DOM on four subsequent loads with longer waits. A
   form rendered only once, after a click. Trigger unknown — lazy-load threshold, A/B, caching, or
   something else.
2. **The screening CTA targets `#book`, and no such anchor exists** on `/contact-us/`. What a real click
   does — given §1 above — is unknown. These two items are probably the same story, and both need a
   session on a real device before either becomes a finding.
3. **The Transparency Center says "multiple advertiser accounts" while reporting 0 ads**, with an empty
   advertiser filter. Boilerplate or real, unknown.
4. **"Vein Health Clinics Ocoee" shares the Oviedo street address** (1000 Executive Dr) under a different
   city name. Duplicate, mislabel, or real shared address — unknown.
5. **Two practitioner Google profiles sit at addresses that are not published offices** (7490 Cypress
   Gardens Blvd; 572 Ocoee Commerce Pkwy). Former offices, data errors, or current locations the site
   omits — unknown.
6. **The footer review widget reads 4,8/5 (466)** — matching no single profile, with a comma decimal.
   Aggregation method unknown.
7. **Four vendor fingerprints** (Online Marketing For Doctors, ClinicGrower, LeadConnector/GoHighLevel,
   Review Wave). Which relationship is current, unknown — and nothing about any vendor should be
   characterised on a client page.
8. **No privacy policy or terms page found**, while vendor privacy policies are reachable from the
   property. Whether one exists somewhere I did not look, unknown.
9. **The August 18 cache says the site was up and scored**, contradicting the brief's premise that it was
   down. Unresolved.

## Gaps to close before a build session

- Directory sweep: **six of 15–20 publishers done.** Healthgrades URL, Yelp, and the WebMD profile all
  need another pass.
- Organization NPI: not found under any name I tried.
- GBP owner-side detail: claimed status, services, booking link, UTM tagging — none verified.
- Review recency and reply behaviour: not checked on any platform.
- Google profiles for the Port St. Lucie and Ocala offices: not located.
- Local pack: still blocked.

---

**NOT deployed — research only.**

---

# Pass 2 — gap closure · August 28, 2026

Appended, not edited: Pass 1 above is left exactly as written, including the parts this pass supersedes.
Where Pass 2 resolves or overturns a Pass 1 item, it is called out here.

## P2.1 Forms — mechanism ESTABLISHED, and the rate with it

**The mechanism.** All **nine** LeadConnector (GoHighLevel) widget iframes on `/contact-us/` are parked
inside **Elementor popup templates** — `DIV.elementor elementor-location-popup` with `display: none`. They
carry their real URL in **`data-lazy-src`** (WP Rocket LazyLoad) and are never swapped into `src`, because
a container that is `display:none` never enters the viewport and never trips the lazy-load observer. Each
one measures 0×0. Three form widgets, three booking widgets, three more forms.

**Correcting my own Pass 1 measurement:** Pass 1 reported "0 widget iframes in the DOM" on later loads.
That was my probe, not the site — I checked `src` and `data-src` and not `data-lazy-src`. The widgets are
in the DOM on **every** load. The served HTML is byte-identical between the Pass 1 capture and now
(196,749 bytes, 20 `leadconnectorhq` references), so nothing about the page changed between passes.

**The rate, controlled:**

| Condition | Loads | Usable form |
|---|---|---|
| `/contact-us/` cold cache, desktop 1440 | 4 | **0** |
| `/contact-us/` cold cache, mobile 390 | 4 | **0** |
| `/contact-us/` warm cache, desktop, reloaded | 3 | **0** |
| `/contact-us/` ± exit-intent pointer sweep | 6 | **0** |
| `/online-scheduler/` ± exit-intent pointer sweep | 6 | **0** |
| **Total controlled loads** | **23** | **0** |

Every load included a full page scroll and a 20-second wait (10s + 6s on the exit-intent runs). "Usable"
means a field a patient could type into — counted inside the widget frames as well as natively.

Twice across the whole engagement a form *did* appear: once in Pass 1 after a stray click, once on an
uncontrolled `/online-scheduler/` load. Both were LeadConnector frames with 7 fields. **Two sightings in
roughly 25 loads, none of them reproducible under controlled conditions.** The trigger for those two is
still unestablished; exit intent was tested explicitly and is not it.

So the finding is not "the form is intermittent" — it is **the forms do not render**, with two unexplained
exceptions I cannot reproduce. That distinction matters and should survive into any client page.

**Every booking CTA, enumerated:**

| Page | CTA | Viewport | Target | Target exists? |
|---|---|---|---|---|
| `/contact-us/` | "FREE VEIN SCREENING" | **visible desktop**, hidden mobile | `/contact/#book` → 301 → `/contact-us/` | **No `#book` anchor on the page** |
| `/contact-us/` | "Book a Free Vein Screening" | hidden desktop, **visible mobile** | `/contact-us/#book` | **No `#book` anchor** |
| `/online-scheduler/` | "Book a Free Vein Screening" | visible | `/contact-us/#book` | **No `#book` anchor** |
| Homepage | "Book An Appointment" | visible | `/contact/#book` | **No `#book` anchor** |
| Homepage | "FREE VEIN SCREENING" | visible | `/contact/#book` | **No `#book` anchor** |
| Homepage | "CLICK HERE TO BOOK YOUR APPOINTMENT" | visible | `/online-scheduler` | Page exists (200) |
| Homepage | "YES, I'M READY, LET'S BOOK ME IN!" | visible | `/services/` | Page exists — the services index, not a booking surface |

**Clicked as a user**, at both viewports: the visible screening CTA on `/contact-us/` opens **no popup**,
activates **no widget**, and yields **no form**. On mobile the URL simply gains `#book`; on desktop it
reloads the same page. Verified by clicking, not by reading hrefs.

**Scope, precisely.** `/online-scheduler/` is the only page that ever produced a usable form, and it did
so once out of seven attempts. The homepage and a representative service page produced none. The one
booking CTA that reaches a real destination is the homepage's "CLICK HERE TO BOOK YOUR APPOINTMENT" →
`/online-scheduler/` — which is itself a page whose form did not render on six of seven loads.

**Still not established:** what fired on the two occasions a form appeared. That stays on the punch list.

## P2.2 The winterhaven subdomain — resolved

| Check | Result |
|---|---|
| `/survey-page-google` | **200**, 301 KB, renders "Complimentary Online Vein Assessment" |
| Subdomain root `/` | **404** |
| `/robots.txt` | **200 but zero bytes** |
| `/sitemap.xml` | **200 but zero bytes** |
| `<title>` | **empty** |
| `<meta name="robots">` | **none** |
| `<link rel="canonical">` | **none** |
| Platform | **Not WordPress.** GoHighLevel funnel — assets from `cdn.msgsndr.com`, `backend.leadconnectorhq.com`, `assets.cdn.filesafe.space`, `apisystem.tech`, Cloudflare Turnstile; markers for `clinicgrower` and `funnel` |

**What it is:** a single standalone GoHighLevel/ClinicGrower funnel page — a one-minute vein assessment
quiz — linked from **32 of the 57 main-site pages**. It is not a microsite; there is one page and the root
404s.

**Does it duplicate the main site?** No. Different platform, different content, no shared page structure.

**Is it indexed?** `could_not_verify` — Google search is captcha-blocked from here. What I can say is that
**nothing on it prevents indexing**: no robots meta, no canonical, an empty robots.txt, and it is linked
from 32 indexed pages. It has no title tag, which is its own problem if it is indexed.

## P2.3 NPPES — organization records FOUND, superseding Pass 1

Pass 1 recorded `could_not_verify` for the organization record. **That was wrong, and the reason is worth
recording: I searched the trading name.** The records are filed under a different legal name.

**Legal name: `VASCULAR HEALTH INSTITUTE INC`.** Four NPI-2 records, plus a surgery-center entity — all
with **authorized official OBINNA NWOBI, Owner**, all on 877-817-8346:

| NPI | Legal name | Location on file | Taxonomy | Last updated |
|---|---|---|---|---|
| **1952847139** | VASCULAR HEALTH INSTITUTE INC | 1121 1ST ST S, WINTER HAVEN FL 33880-3902 | `2086S0129X` PRIMARY | **2022-07-13** |
| **1508591108** | VASCULAR HEALTH INSTITUTE INC | **4355 BEAR GULLY RD, WINTER PARK FL 32792-9422** | `2086S0129X` PRIMARY | **2022-07-19** |
| **1730961038** | VASCULAR HEALTH INSTITUTE INC | **1410 W BROADWAY ST STE 105, OVIEDO FL 32765-6537** | `2086S0129X` PRIMARY | **2023-10-20** |
| **1851026454** | VASCULAR HEALTH INSTITUTE INC | **572 OCOEE COMMERCE PKWY, OCOEE FL 34761-4219** | `2086S0129X` PRIMARY | **2022-07-19** |
| **1912598939** | KEYHOLE SURGERY CENTER-WINTER HAVEN LLC | 1121 1ST ST S, WINTER HAVEN FL 33880-3902 | `261QA1903X` Clinic/Center, Ambulatory Surgical PRIMARY | **2022-07-13** |

Every organization taxonomy is the specific vascular-surgery code. **No generic organization taxonomy.**

**Federal addresses versus the site's five offices — none of them agree except Winter Haven:**

- Winter Haven 1121 1st St S — on the site **and** federal. Agrees.
- Oviedo — site says **1000 Executive Dr Ste 8**; federal says **1410 W Broadway St Ste 105**. Two
  different Oviedo addresses.
- **Winter Park (4355 Bear Gully Rd)** and **Ocoee (572 Ocoee Commerce Pkwy)** — federal records with no
  corresponding page or address anywhere on the site.
- Winter Garden, Port St. Lucie and Ocala — **published on the site, no federal record found.** Scanned
  the full NPI-2 population of ZIPs 34787, 34952 and 34471 (600 records each, paginated) with no match.

**Method note on the negative results:** ZIP-code scans covered 382 records for 33880 and 537 for 32765,
paginated to exhaustion, plus the four organization-name variants tried in Pass 1. A record filed under
yet another name in a ZIP I did not scan would not have surfaced.

**Physicians:** the site names one, Dr. Nwobi, and Pass 1 verified his individual record (NPI 1912028853,
last updated 2022-07-13). No second physician appears on `/our-team/`, and no second individual record
turned up in the Nwobi searches. **No mid-level providers are named on the site.**

## P2.4 The two duplicate Google practitioner profiles — one real, one not

| Profile address | Federal record? | On the site? | Verdict |
|---|---|---|---|
| **572 Ocoee Commerce Pkwy** | **Yes** — org NPI 1851026454, VASCULAR HEALTH INSTITUTE INC, updated 2022-07-19 | **No** | A **real, federally-registered location the website does not mention.** There is also a Yelp listing at this address ("Vein Health Clinics: Obinna Nwobi, MD", Ocoee) |
| **7490 Cypress Gardens Blvd** | **No.** Scanned the full NPI-2 population of ZIP 33884; the entities at 7490 are unrelated (Precious Kiddos Therapy Services / Trans Services). No Nwobi individual record in that ZIP either | **No** | **Matches neither.** Origin unestablished |

So the Pass 1 phrasing — "two practitioner profiles at addresses that are not published offices" — resolves
into two different situations: one is a genuine location missing from the website, and one matches nothing
I can find.

## P2.5 Directories — still short of 15–20, and here is exactly where it stands

| Publisher | Result |
|---|---|
| Vitals | 200. "Is this you?" prompt. Four phones, four addresses (Pass 1) |
| WebMD | 200 on directory search; counts 3 / 31 / 18 Ratings visible, profile not opened cleanly. `could_not_verify` on claimed status |
| **Doximity** | **200.** "Dr. Obinna Nwobi, MD – Winter Haven, FL \| Vascular Surgery". Lists Vein Health Clinics, 1121 1st St S, and phones **877-817-8346** and **321-286-0517** |
| Yelp — Winter Haven | Listing **exists** (found by search: `/biz/vein-health-clinics-winter-haven`). Page **403** to this network |
| Yelp — Oviedo | Listing **exists** (`/biz/vein-health-clinics-obinna-nwobi-md-oviedo-3`, 1000 Executive Dr). Page **403** |
| Yelp — **Ocoee** | Listing **exists** (`/biz/obinna-nwobi-md-ococee`, **572 Ocoee Commerce Pkwy**) — corroborates P2.4. Page **403** |
| ZoomInfo | Company record exists; page **403** |
| Healthgrades | Not located by search this pass either. **`could_not_verify`** — and no slug will be guessed |
| BBB | No listing found (Pass 1) |
| npino (NPPES mirror) | 200; extra phone 321-286-0517 — **now corroborated by Doximity**, so that number is real and in circulation |
| oneseniorplace.com | Directory entry exists (search result); not opened |
| Google Business Profiles | Four practice + two practitioner (Pass 1) |

**Reached: eleven publishers with something recorded, of which five returned data I could actually read.**
Not 15–20. Yelp (×3) and ZoomInfo are hard-blocked from this network and would need a different route.

**Distinct values, updated:**

- **Name spellings — at least six:** Vein Health Clinics · Vein Health Clinics \| Florida Vein Care
  Specialists · Vein Health Clinic Winterhaven · Vein Health Clinics Ocoee · Vein Health Clinics: Obinna
  Nwobi, MD · **Vascular Health Institute Inc** (legal) — and **Vascular Health Center** (second domain,
  P2.6).
- **Phone numbers — at least six:** 877-817-8346 · 863 223 3797 · 772-261-5116 · (352) 690-6000 ·
  (407) 278-6925 · (407) 296-1000 · (863) 293-1121 · **321-286-0517**.
- **Addresses — at least nine:** the five published, plus 572 Ocoee Commerce Pkwy, 4355 Bear Gully Rd
  (Winter Park), 1410 W Broadway St Ste 105 (Oviedo), 7490 Cypress Gardens Blvd.

**Shared-phone contamination: the condition is confirmed, the effect is not.** The toll-free
877-817-8346 is published sitewide, on **all five** organization NPI records, on Doximity and on the
second domain — one number across every location and both brands. That is the setup where aggregators
de-duplicate by phone and merge locations. **I did not observe a merged listing**, so the effect remains
untested; only the precondition is established.

## P2.6 A second live domain — `vascularhealthcenter.com`

Pass 1 said no second domain was established. **Superseded.**

`https://vascularhealthcenter.com/` returns **200**. Title: *"Vein Specialist Doctor & Vascular Surgeon
Florida - Vascular Health Center"*. It names Dr. Nwobi, runs the same stack (WordPress + Elementor +
LeadConnector/msgsndr), and publishes **877-817-8346, (352) 690-6000 and 772-261-5116** — the same
toll-free number plus the Ocala and Port St. Lucie numbers from veinhealthclinics.com's own footer.

Its robots meta is **`index, follow, max-image-preview:large`** — actively indexable. It leads with a
webinar funnel ("Free Webinar: How To Get Rid Of Varicose Veins Safely And Quickly").

Two separately-branded, separately-indexable sites for one practice, sharing phone numbers and a
physician. Whether authority is split between them, and which is intended as primary, is **not
established** — that needs a backlink and ranking comparison this session did not run.

## P2.7 Ads — confirmed and closed

Re-checked, and the filter state is now confirmed rather than assumed:

- Region reads **"Ads In United States"**.
- Date filter reads **"Any time"** — not the 30-day window.
- Result: **"0 ads" / "No ads found."**
- The **"multiple advertiser accounts"** sentence appears **identically** on a second query for
  `winterhaven.veinhealthclinics.com`, which also returns 0 ads. Identical text on a different domain with
  no ads is consistent with **boilerplate**, and I am treating it as resolved to nothing. Not proof, but
  enough to stop reading it as a signal.
- No advertiser identity established; the advertiser filter renders no options.

**Closed. Absence is not evidence, and nothing paid-media goes on a client page from this.**

## P2.8 Punch list after Pass 2

Resolved this pass: the form mechanism (P2.1) · the subdomain (P2.2) · the organization NPI and legal
name (P2.3) · one of the two duplicate-profile addresses (P2.4) · the "multiple advertiser accounts"
string (P2.7) · the second domain (P2.6).

Still open, still not findings:

1. **What rendered a form on two occasions out of ~25.** Not exit intent, not a CTA click, not cache
   state. Unknown.
2. **7490 Cypress Gardens Blvd** — a Google practitioner profile at an address with no federal record and
   no site presence.
3. **Three published offices with no federal record** (Winter Garden, Port St. Lucie, Ocala) and **two
   federal records with no published office** (Winter Park, Ocoee). Which list is current is unknown.
4. **Two Oviedo addresses**, one on the site and one on the federal record.
5. **Two live indexable domains** sharing phones and a physician — split authority unmeasured.
6. **Shared-phone contamination**: precondition confirmed, no merged listing observed.
7. **The footer widget reading "4,8/5 (466 reviews)"** with a comma decimal — still unmatched to any
   single profile, still unexplained.
8. **`inLanguage: "en-AU"`** in the site's own JSON-LD, on a Florida practice. Noted, not explained.
9. **Four vendor fingerprints**, now five with ClinicGrower's funnel confirmed. No relationship
   characterised, and none should be.

## P2.9 Still not attempted or still blocked

- Local pack — omitted by instruction, still captcha-blocked.
- Yelp (three listings), ZoomInfo, Healthgrades — blocked or unlocated.
- GBP owner-side detail — claimed status, services menu, booking link, UTM tagging — unverified, so
  unreported.
- Review recency and reply behaviour — unchecked on every platform.
- Google profiles for Port St. Lucie and Ocala — not located.
- Backlink/ranking comparison between the two domains — not run.

---

**NOT deployed — research only.**
