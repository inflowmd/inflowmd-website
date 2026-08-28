# Vein Specialists — research findings

**Prospect:** Vein Specialists · Dr. Joseph Magnant · Fort Myers + Bonita Springs, FL · weknowveins.com
**Research date:** August 28, 2026 (all items below verified on this date unless stated otherwise)
**Session type:** verification only — nothing built, nothing deployed
**Standing rule applied:** anything not verified at source is marked `could_not_verify`. Nothing here is
inferred from what a similar practice would have.

---

## 0. Summary of what changed

| Item | Status |
|---|---|
| 1. NPPES at source | **All three NPIs verified at source.** Mirrors were correct. |
| 2. Site walk | **Complete.** One genuine sitewide broken CTA; Spanish pages unmarked; malformed JSON-LD. |
| 3. URL inventory | **Complete — 160 URLs.** One orphan, two live pages missing from the sitemap. |
| 4. Local pack | **`could_not_verify`** — Google web search is captcha-blocked. Maps captured instead, labelled as such. |
| 5. 4.5★ ad source | **Identified** — a second, practitioner-level Google profile. |
| 6. Directory claimed-status | **Recorded for both physicians**, one gap (`Sharecare / Kammerlocher`). |

Two things I got wrong mid-session and corrected, both recorded here because they are the kind of error
that becomes a fabricated finding if it survives:

- A sitewide link to `/general/index.php` looked like a 404 on 159 pages. It is on the **`patient.weknowveins.com`
  subdomain** and returns **200**. My link graph had normalised the host away. **Not a finding.**
- Four more "404s" were my own missing trailing slash. With the URL as actually written in the markup, they
  are 200. **Not findings.** Only one genuine 404 survived (§2.1).

---

## 1. NPPES — verified at source

**Method:** NPPES public API (`npiregistry.cms.hhs.gov/api/?version=2.1`), queried directly, August 28, 2026.
This is the registry itself, not a mirror.

### 1.1 Dr. Joseph Magnant — individual NPI `1588682728` — VERIFIED

| Field | Value at source |
|---|---|
| Name | JOSEPH G MAGNANT, M.D. |
| Status | A (active), sole proprietor: YES |
| Address (mailing **and** location) | **1510 ROYAL PALM SQUARE BLVD, SUITE 101**, FORT MYERS, FL 33919-1068 |
| Phone / fax | 239-694-8346 / 239-936-6272 |
| **Last updated** | **2008-10-07** |
| Enumerated | 2006-07-17 |
| Primary taxonomy | `2086S0129X`, license ME94904 (FL) |
| Linked identifier | "Facility NPI" `1124205349` |

**The mirrors were right.** healthcare4ppl/npiprofile matched the registry on address, suite and the
October 2008 last-updated date. The finding stands and can now be sourced to NPPES directly.

The practice's current address is **1500 Royal Palm Square Blvd Ste 105** — confirmed independently on
their own site, on WebMD, on Vitals and on their Google profile (§4, §6). So the federal record is
**wrong on both the street number and the suite**, and has been since 2008.

**Taxonomy caveat:** the API returns `desc: null` for `2086S0129X`, so NPPES itself did not hand me a
label. Querying NPPES by `taxonomy_description=Vascular Surgery` returns records carrying this code, which
is source-side evidence for the mapping, but the string "Surgery, Vascular Surgery" comes from the NUCC
code set, not from NPPES. Treat the **code** as verified and the **label** as NUCC-sourced.

### 1.2 Organisation NPI `1124205349` — VERIFIED

Found via the "Facility NPI" identifier carried on Dr. Magnant's own record — not guessed.

| Field | Value at source |
|---|---|
| Legal name | **VEIN SPECIALISTS AT ROYAL PALM SQUARE INC** |
| Type / status | NPI-2 / A (active) |
| Address (mailing and location) | **1510 ROYAL PALM SQUARE BLVD STE. 101**, FORT MYERS, FL 33919-1068 |
| Phone | 239-694-8346 |
| **Last updated** | **2008-10-01** |
| Enumerated | 2008-01-30 |
| Authorized official | JOSEPH MAGNANT M.D. |
| Primary taxonomy | `2086S0129X` |

The legal name flagged as unconfirmed in the strategy notes is **confirmed at source**. Both federal
records — individual and organisation — carry the same stale address and have not been touched since 2008.

### 1.3 Dr. Thad Kammerlocher — individual NPI `1326003997` — VERIFIED

| Field | Value at source |
|---|---|
| Name | THAD KAMMERLOCHER MD |
| Status | A (active) |
| Location address | **6821 PALISADES PARK CT, SUITE 1**, FORT MYERS, FL 33912-7131 |
| Phone | 239-936-8555 |
| **Last updated** | **2016-03-11** |
| Primary taxonomy | `208600000X` — **"Surgery"** (generic; NPPES returned this label itself) |
| License | ME65374 (FL) |

Two things here, both verified:

1. His federal record carries **neither practice address** — not 1500 Ste 105, not the Bonita office. It
   points at Palisades Park Ct.
2. His taxonomy is **generic Surgery**, with no vascular or phlebology designation. This is corroborated
   downstream: Healthgrades files him as a **General Surgeon** (§6.2). The NPPES record is the plausible
   upstream cause, and the correction is the same NPPES fix as Dr. Magnant's.

---

## 2. Manual site walk

**Method:** all 160 sitemap URLs fetched with curl (full server HTML, WordPress renders server-side), plus
a rendered pass in headless Chromium for navigation, forms, the eVeinscreening funnel and the Spanish
pages. August 28, 2026.

**Framing note:** this site is well kept. The previous prospect's failure pattern is largely absent here
and its absence is not reported as a finding. What follows is what is actually there.

### 2.1 Broken links — one, and it is the screening CTA

| Link | Status | Reach |
|---|---|---|
| `https://www.weknowveins.com/lastform/7/` | **404 — "Page not found - We Know Veins"** | **86 pages** |

Anchor text: **"Start Your eVein Screening Now"** (link `title` attribute: "Appointments"). This is the
primary screening call to action, rendered as a button, and on 86 pages it lands on the 404 page.

Verified as the URL is actually written in the markup, with the trailing slash, following redirects.

**Ruled out, do not report:**

- `patient.weknowveins.com/general/index.php` ("Patient Portal", in the main nav on 159 pages) — **200**.
- `/vein-treatment-options/ivus/` → 301 → `/vein-treatment-options/intravascular-ultrasound-ivus/` — fine.
- `/vein-treatment-options/varithena/` → 301 → `/vein-treatment-options/` — resolves, though it lands on
  the treatment index rather than a Varithena page. Linked from both location pages.
- `/book-your-appointment-alt/` → 301 → `/book-your-appointment/` — fine.
- `/vein-disease/varicose-veins-spider-veins/` → 301 → `/vein-disease/varicose-veins/` — fine.
- Legacy paths `/about-us/dr-magnant`, `/doctor-joseph-magnant`, `/dr-magnant.php`, `/spider-veins-treatment`,
  `/vein-disease/spider-veins` all **301 correctly** to current pages. Redirect discipline here is good and
  is worth saying so in the audit.

### 2.2 Pages linked from nowhere / missing from the sitemap

- **Orphan (in sitemap, linked from no other page):** `/physician-training/advanced-provider-training-aprn-pa/`
  — and it 301s to `/physician-training/`, so Yoast is publishing a redirecting URL.
- **Live at its own URL but absent from the sitemap:** `/out-of-towners/` (linked from 11 pages including
  the homepage) and `/eveinscreening/evaluation/` (**step 2 of the screening funnel**).
- Two further sitemap URLs 301 elsewhere: `/locations/` → `/book-your-appointment/`, and
  `/blog/pelvic-congestion-syndrome-treatment-by-vein-specialists-profiled-by-florida-health-care-news/`
  → `/vein-treatment-options/pelvic-congestion-syndrome/`.

### 2.3 Duplicate page

`/vein-treatment-options/pelvic-congestion-syndrome/pelvic-congestion-syndrome-specialist/` returns **200 at
its own URL** and its opening content is **identical** to its parent
`/vein-treatment-options/pelvic-congestion-syndrome/`. Both are in the sitemap. Both carry the same four
H1s. This is a genuine duplicate, not a redirect.

`/vein-treatments-alt/` is also live and in the sitemap (H1 "Treatments"), alongside
`/vein-treatment-options/`. Not byte-identical, so recorded as a probable legacy alternate rather than a
confirmed duplicate.

### 2.4 Headings

- **No page is missing an H1.** No template-default H1 was found anywhere — every page has a written,
  page-specific H1. This is the opposite of the previous prospect and should be said plainly.
- **10 pages carry multiple H1s**, using H1 for section headings rather than one page title. Worst cases:
  `/vein-disease/swollen-ankles/` (**11 H1s**), `/vein-disease/swollen-legs/` (8),
  `/vein-treatment-options/pelvic-congestion-syndrome/` (4).
- Repeated H1s across pages are explained by the duplicate and redirect pairs above, not by templating.

### 2.5 Forms, spam protection, consent

- 159 of 160 pages carry a form. **reCAPTCHA is present sitewide** (invisible badge confirmed rendering;
  `google.com/recaptcha/api2/anchor` iframe loaded on the appointment page). Akismet/honeypot markers on 144.
- The appointment form renders **12 symptom checkboxes** (Spider Veins, Varicose Veins, Swollen Legs/Ankles,
  Pain/Heaviness, Pelvic Congestion, Restless Leg Syndrome, Charley Horses or Leg Cramps, Skin
  Discoloration, Non-healing Dermatology Biopsy, Ulcers, Bleeding, Other) plus name, two email fields,
  phone, a select and a textarea.
- **No consent checkbox and no consent text on the form.** Checked in the rendered DOM, not just the source.
  The form collects name, email, phone and stated medical interest.

### 2.6 Privacy, terms, accessibility

- `/privacy-policy/` (links a PDF), `/privacy-practices/` (HIPAA NPP PDF) and
  `/nondiscrimination-accessibility/` are all present **and linked from the homepage**.
- **No terms-of-use page exists** anywhere in the 160-URL inventory, so it is not linked. Recorded as
  absent rather than as an unlinked page.
- `/patient-consent-forms/` publishes five procedure PDFs.

### 2.7 Structured data inventory

JSON-LD is present on **every one of the 160 pages**. Types observed across the site:

`LocalBusiness` (324) · `MedicalClinic` (320) · `BreadcrumbList` / `WebSite` / `Organization` /
`MedicalOrganization` (160 each) · `WebPage` (145) · `Person` (45) · `Article` (43) · `ImageObject` (41) ·
`MedicalWebPage` (39) · `FAQPage` (23) · `MedicalCondition` (18) · `CollectionPage` (15) ·
`MedicalTherapy` / `MedicalProcedure` / `Service` (9 each) · `IndividualPhysician` (2)

Notes:

- This is a **strong** schema footprint — FAQPage on 23 pages, MedicalProcedure/MedicalTherapy on the
  treatment pages, MedicalCondition on the condition pages.
- **`IndividualPhysician` appears on only 2 pages.** `Physician` proper does not appear at all.
- **14 pages carry a malformed JSON-LD block that does not parse.** Verified as theirs, not a parser
  artefact: on `/vein-disease/varicose-veins/` three of four blocks parse and the fourth fails with
  *Invalid control character at line 20 column 196* — a raw control character inside a JSON string in an
  `Article` block. A block that does not parse is a block search engines discard.
- `/ai-info-fact-sheet/` publishes `/llms.txt` and `/vein-specialists-ai-fact-sheet.txt`, both **200**.
  They are already doing deliberate AI-readability work.

### 2.8 Spanish pages

Four Spanish URLs exist: `/agende-su-cita/`, `/locations/vein-specialists-fort-myers/esp/`,
`/locations/vein-specialists-bonita-springs/esp/`, `/vein-disease/varicose-veins/esp/`. The copy is
genuinely Spanish and reads as written, not machine-translated.

Verified in the rendered DOM:

- **`<html lang="en-US">` on every Spanish page.** They are declared as English.
- **No `hreflang` annotations anywhere** on any of them.
- **No language switcher in the header** — the Spanish pages are not reachable from the English site by
  navigation. The header on the Spanish pages is itself still in English.

### 2.9 Viewport

`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=1">`

`maximum-scale=1` is present, as the partial walk found. Note for accuracy: `user-scalable=1` is also
present, and iOS Safari has ignored `maximum-scale` for accessibility since iOS 10. So the attribute is
there and is worth removing, but "disables pinch-zoom" should not be stated flatly — it depends on the
browser. Report the markup, not an effect we have not measured on a device.

### 2.10 eVeinscreening funnel

- `/eveinscreening/` — H1 "3 Simple, Short Steps to Your Personalized Virtual Leg Vein Screening".
  **Zero forms on the page.** Three CTAs, all "Start Your Vein Evaluation Now".
- Step 2 is `/eveinscreening/evaluation/` — **200**, live, and **absent from the sitemap** (§2.2).
- The `/lastform/7/` 404 (§2.1) is the *other* screening CTA, used across 86 content pages.

### 2.11 Empty containers

No empty heading-above-blank-space containers were found. Not reported as a finding.

---

## 3. URL inventory and the nav-vs-sitemap gap

**Source:** `sitemap_index.xml` (Yoast), five child sitemaps, fetched August 28, 2026.

| Sitemap | URLs |
|---|---|
| `page-sitemap.xml` | 64 |
| `post-sitemap.xml` | 44 |
| `patient-exp-sitemap.xml` | 33 |
| `patient-experience-category-sitemap.xml` | 15 |
| `physician-exp-sitemap.xml` | 4 |
| **Total** | **160** |

All 160 return HTTP 200. Three of them 301 elsewhere (§2.2).

**Nav → sitemap:** the header nav carries 48 links, 45 unique internal paths, **0 external**. Every nav
destination is in the sitemap **except** the Patient Portal, which is on the `patient.` subdomain and is
correctly excluded.

**Sitemap → nav/site:** exactly **one orphan** —
`/physician-training/advanced-provider-training-aprn-pa/`.

**Live but unlisted:** `/out-of-towners/`, `/eveinscreening/evaluation/`.

The full inventory is saved alongside this file as the migration baseline
(`research/veinspecialists-urls.txt`, 160 URLs with their source sitemap).

---

## 4. Local pack — `could_not_verify`

**Google web search: blocked.** Requests from this network return Google's "unusual traffic … not a robot"
interstitial on both `vein doctor fort myers` and `varicose vein treatment fort myers`. **No SERP local
pack was captured, and none is reported.**

Location origin was *not* the problem — it was set correctly and proved so, which is the one useful thing
that came out of the attempt. What follows is **Google Maps ranking, captured from Fort Myers and Bonita
Springs coordinates. This is a different surface from the SERP three-pack and must not be presented as
one.**

### 4.1 Maps — "vein doctor fort myers" (origin 26.6406, −81.8723) · August 28, 2026

| # | Name | Rating | Reviews | Google category |
|---|---|---|---|---|
| 1 | **Vein Specialists** | 4.9 | 291 | **Surgical center** |
| 2 | Fort Myers Florida Vein Experts | 4.9 | 201 | Medical clinic |
| 3 | The Vascular and Vein Center at Gulfcoast Surgeons | 4.6 | 34 | Vascular surgeon |
| 4 | **Joseph G. Magnant, MD, FACS, RPVI** | **4.5** | **74** | Vascular surgeon |
| 5 | BenMaamer Institute; General Surgery Institute; Vein Institute | 4.5 | 66 | Vascular surgeon |
| 6 | GulfCoast Vascular Surgeons – Michael Novotney MD | 4.6 | 8 | Vascular surgeon |
| 7 | GulfCoast Vascular Surgeons – Abraham Sadighi MD | 3.3 | 9 | Vascular surgeon |
| 8 | SunState Medical Specialists – Surgery | 4.7 | 48 | Surgeon |

### 4.2 Maps — "varicose vein treatment fort myers" · same origin

| # | Name | Rating | Reviews | Google category |
|---|---|---|---|---|
| 1 | Fort Myers Florida Vein Experts | 4.9 | 201 | Medical clinic |
| 2 | **Vein Specialists** | 4.9 | 291 | Surgical center |
| 3 | The Vascular and Vein Center at Gulfcoast Surgeons | 4.6 | 34 | Vascular surgeon |
| 4 | **Joseph G. Magnant, MD, FACS, RPVI** | 4.5 | 74 | Vascular surgeon |
| 5 | BenMaamer Institute; General Surgery Institute; Vein Institute | 4.5 | 66 | Surgeon |
| 6 | LPG Vascular Surgery – Creekside | 3.7 | 3 | Vascular surgeon |
| 7 | GulfCoast Vascular Surgeons – Michael Novotney MD | 4.6 | 8 | Surgeon |
| 8 | USA Vein Clinics – Fort Myers | 4.5 | 34 | Medical clinic |

### 4.3 Maps — "varicose vein treatment bonita springs" (origin 26.3398, −81.7787)

| # | Name | Rating | Reviews | Google category |
|---|---|---|---|---|
| 1 | **Vein Specialists** (3359 Woods Edge Cir #102) | 4.9 | 211 | **Vascular surgeon** |
| 2 | **Joseph G. Magnant, MD, FACS, RPVI** (same address) | **4.8** | **18** | Vascular surgeon |
| 3 | Vanish Vein & Laser Center | 5.0 | 48 | Vascular surgeon |
| 4 | Vascular Center of Naples | 4.9 | 610 | Vascular surgeon |
| 5 | The Vascular Group of Naples – Hiranya Rajasinghe MD FACS | 4.7 | 78 | Vascular surgeon |
| 6 | Fort Myers Florida Vein Experts | 4.9 | 201 | Vascular surgeon |
| 7 | Vein Specialists (Fort Myers) | 4.9 | 291 | Vascular surgeon |

`vein doctor bonita springs` returned no parseable rows before timeout — **`could_not_verify` for that one
query.**

### 4.4 Two observations that follow from the capture

- **Their own two locations are categorised differently.** Fort Myers is **Surgical center**; Bonita
  Springs is **Vascular surgeon**. Every serious competitor in both captures is Vascular surgeon.
- **The Bonita review count does not match the figure in the strategy notes** (4.9/86). Observed
  August 28, 2026: **4.9 / 211**. Not reconciled — flagging rather than overwriting either number.

---

## 5. The 4.5★ ad assets — SOURCE IDENTIFIED

**The ratings in the ad units are almost certainly coming from a second, practitioner-level Google Business
Profile that is separate from the practice profile.**

| Profile | Rating | Reviews | Address |
|---|---|---|---|
| **Vein Specialists** (practice, Fort Myers) | 4.9 | 291 | 1500 Royal Palm Square Blvd #105 |
| **Joseph G. Magnant, MD, FACS, RPVI** (practitioner, Fort Myers) | **4.5** | **74** | 1500 Royal Palm Square Blvd #105 |
| **Vein Specialists** (practice, Bonita) | 4.9 | 211 | 3359 Woods Edge Cir #102 |
| **Joseph G. Magnant, MD, FACS, RPVI** (practitioner, Bonita) | **4.8** | **18** | 3359 Woods Edge Cir #102 |

Against the ad assets: **4.5 with 72 / 61 / 58 / 57 (Fort Myers)** and **4.8 with 17 (Bonita)**.

The ratings match **exactly** — 4.5 and 4.8, in the right cities, at the practice's own two addresses. The
counts sit just above the highest ad snapshot (74 vs 72; 18 vs 17), which is what accumulation over time
looks like. This is the innocent mechanism the brief anticipated: the ads are pulling the **physician**
listing, while the site and the strategy notes quote the **practice** listing.

**Confidence and its limits.** Rating match is exact and the address match is exact. The count match is
*near*, not identical, and I did not have the ad snapshot dates to line up against, so I cannot show the
counts converging on a specific day. Before this goes on the page, one of two things should close it:
either the ad snapshot dates, or a single observation of the physician profile's count equalling one of
72/61/58/57. Until then this is "identified, one step short of proven", which is still a long way past
"unsourced discrepancy".

**Ruled out** (checked August 28, 2026, none carries a 4.5 near those counts): Vitals 4.9/203 · WebMD
5.0/134 · Healthgrades 315 reviews · Sharecare 5.0/4 · EverydayHealth 5.0/97 · Facebook 33 reviews ·
Yelp 11 reviews · BBB no listing found. RateMDs returned 403 — `could_not_verify`.

---

## 6. Physician profile claimed-status

**Method:** each profile loaded in headless Chromium, August 28, 2026. Profile URLs were found by search,
**not** by guessing slugs — my first guessed Healthgrades URL resolved to an unrelated physician in Texas,
which is exactly how a fabricated finding gets made.

**Caveat on "claimed":** these sites do not publish an explicit claimed/unclaimed flag. What is recorded
below is the **exact prompt text observed**. "Claim your profile" / "Claim Your Free Profile" is a reliable
unclaimed signal; **"Is this you?" is weaker** and appears on some claimed profiles too. Treated as
indicative, not conclusive.

### 6.1 Dr. Joseph Magnant

| Directory | Prompt observed | Rating / reviews | Address shown |
|---|---|---|---|
| Healthgrades | "Is this you" | 315 reviews | **1510 Ste 101** *and* 1500 Ste 105, plus 2776 Cleveland Ave |
| WebMD | "Is this you?" | 5.0 / 134 | 1500 Royal Palm Square Blvd Ste 105 |
| Vitals | "Is this you?" | 4.9 / 203 | 1500 Royal Palm Square Blvd Ste 105 |
| Sharecare | *none observed* | 5.0 / 4 | **1510 Ste 101** *and* 1500 Ste 105, plus 2776 Cleveland Ave |

**Healthgrades and Sharecare are both still publishing the stale 1510 Ste 101 address** — the exact string
in the 2008 NPPES record. WebMD and Vitals show the correct 1500 Ste 105. This is the NPPES-ingestion
pattern the brief predicted, and it is now verified on both ends.

Healthgrades also carries a **practice group** page — "Vein Specialists", **"Claim Your Free Profile"**
(unclaimed), **0 ratings** — listing 1500 Ste 105 *and* a third suite variant, **1510 Ste 106**.

### 6.2 Dr. Thad Kammerlocher

| Directory | Prompt observed | Specialty shown | Rating / reviews | Address shown |
|---|---|---|---|---|
| Healthgrades | **"Claim your profile"** (unclaimed) | **General Surgeon** | 4.1 / 16 | 636 Del Prado Blvd S |
| WebMD | "Is this you?" | Vascular Surgery | — / 0 | 3637 Del Prado Blvd S Ste 101; 636 Del Prado Blvd |
| Vitals | "Is this you?" | Vascular Surgery | 4.3 / 30 | 3637 Del Prado Blvd S Ste 101; 636 Del Prado Blvd |
| Sharecare | **`could_not_verify`** — search URL returned 404, no profile located | — | — | — |

**Not one of his directory profiles shows a Vein Specialists address.** All show Cape Coral / Del Prado
locations, and his federal record shows a third address again (Palisades Park Ct, §1.3). Healthgrades
files him as a **General Surgeon**, which matches his generic NPPES taxonomy.

### 6.3 Years-of-experience figures — recorded, not a finding

Per the brief, no site-vs-ad contradiction is reported; the ad's "30 Years" matches the site's "30+ years".
Recording separately that the **directories** display their own derived figures — Magnant: 40 (Healthgrades),
41 (WebMD, Vitals, Sharecare); Kammerlocher: 30 (Healthgrades), 34 (WebMD, Vitals). These are third-party
computed values, not practice claims.

---

## 7. Open items for the build prompt

1. **Local pack** — still uncaptured. Needs a tool that can reach a SERP, or an accepted substitute. The
   Maps captures in §4 are usable **only if labelled as Maps**.
2. **4.5★** — one step from proven (§5). Needs the ad snapshot dates or one matching count observation.
3. **Bonita review count** — strategy notes say 4.9/86, observed 4.9/211. Unreconciled.
4. **Sharecare / Kammerlocher** — no profile located.
5. **RateMDs** — 403, unchecked.

## 8. Not done, deliberately

Per the brief: no audit page built, no route touched, no copy written, no ads research re-run, no engine
audit, no ad spend/click/conversion figures, and **no claim about where any ad lands** — no landing page
was loaded in this session.
