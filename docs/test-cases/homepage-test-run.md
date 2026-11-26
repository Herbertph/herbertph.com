# Test cases — Homepage redesign, "the page is a test run"

- Spec: `docs/specs/homepage-test-run.md`
- Branch under test: `feature/homepage-test-run`
- Commit: `ae1655c`
- Suite: `tests/acceptance.homepage-test-run.spec.ts` (this document) plus the developer regression suite in `tests/portfolio.spec.ts`
- Viewports exercised: Chromium desktop default (1280×720), iPhone 13 (390×844), explicit 320/360/390/640/760/920/921/1280/2560/3840 widths

## Traceability

| AC | Test cases |
|---|---|
| AC-1 | TC-1, TC-34 |
| AC-2 | TC-2 |
| AC-3 | TC-3 |
| AC-4 | TC-4 |
| AC-5 | TC-5, TC-38 |
| AC-6 | TC-6 |
| AC-7 | TC-7 |
| AC-8 | TC-8 |
| AC-9 | TC-9 |
| AC-10 | TC-10, TC-14 |
| AC-11 | TC-11, TC-39 |
| AC-12 | TC-12 |
| AC-13 | TC-13 |
| AC-14 | TC-15 |
| AC-15 | TC-16 |
| AC-16 | TC-17 |
| AC-17 | TC-18 |
| AC-18 | TC-19 |
| AC-19 | TC-20 |
| AC-20 | TC-21 |
| AC-21 | TC-22, TC-38 |
| AC-22 | TC-23 |
| AC-23 | TC-24 |
| AC-24 | TC-25 |
| AC-25 | TC-26 |
| AC-26 | TC-27, TC-36, TC-37 |
| AC-27 | TC-28 |
| AC-28 | TC-29, TC-39 |
| AC-29 | TC-30 |
| AC-30 | TC-31 |
| AC-31 | TC-32 |
| AC-32 | TC-33 |
| FR-15 / FR-17 | TC-35 |

## Test cases

### TC-1: a fresh load starts at RUN 0/7 with every item pending
- **Acceptance criterion:** AC-1
- **Priority:** high
- **Type:** functional
- **Preconditions:** Clean browser context, no `?lang`, scroll at top.
- **Test data:** `/` at 1280×720 and 390×844.
- **Steps:**
  1. Open `/`.
  2. Read `#runCount`, `#progress` attributes, `#specStatus`, the seven `#specList .spec-item` classes and `#passCard`.
- **Expected result:** `RUN 0/7`; `aria-valuenow="0"` (min 0, max 7); `#specStatus` is `RUNNING`; all 7 items have `pending` and none `passed`; `#passCard` has no `visible` class and the stamp is not visible.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-1 (AC-1): a fresh load starts at RUN 0/7 with every item pending`
- **Status:** Pass

### TC-2: sections are in order and there is exactly one h1
- **Acceptance criterion:** AC-2
- **Priority:** high
- **Type:** functional
- **Preconditions:** Page loaded.
- **Test data:** `/`.
- **Steps:**
  1. List `main section` ids in DOM order.
  2. Count `h1` elements.
- **Expected result:** `top, story, method, evidence, showcase, next, signoff`, and exactly one `<h1>`.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-2 (AC-2): sections are in order and there is exactly one h1`
- **Status:** Pass

### TC-3: scrolling to the bottom passes all seven tests
- **Acceptance criterion:** AC-3
- **Priority:** high
- **Type:** functional
- **Preconditions:** Fresh load at the top.
- **Test data:** `/`, instant scroll to `document.documentElement.scrollHeight`.
- **Steps:**
  1. Scroll to the bottom.
  2. Read the panel, counter and progressbar.
- **Expected result:** 7 passed items, 0 pending; `7 / 7 PASSED`; `aria-valuenow="7"`; `#specStatus` contains `ALL PASSING`.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-3 (AC-3): scrolling to the bottom passes all seven tests`
- **Status:** Pass

### TC-4: chapter 01 passes only item 1
- **Acceptance criterion:** AC-4
- **Priority:** high
- **Type:** functional
- **Preconditions:** Fresh load, viewport tall enough to show chapter 01 only.
- **Test data:** 1280px wide, viewport height sized to 105% of chapter 01.
- **Steps:**
  1. Scroll chapter 01 to the top edge of the viewport.
  2. Read the panel and counter.
- **Expected result:** Exactly item 1 is passed; the other six stay pending; counter `1 / 7 PASSED`; `aria-valuenow="1"`.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-4 (AC-4): chapter 01 passes only item 1`
- **Status:** Pass

### TC-5: a passed test never reverts
- **Acceptance criterion:** AC-5
- **Priority:** high
- **Type:** functional
- **Preconditions:** Fresh load.
- **Test data:** `/`.
- **Steps:**
  1. Scroll to the bottom and wait for 7 passed.
  2. Scroll back to the top and wait 250 ms.
- **Expected result:** Counter remains `7 / 7 PASSED`, all 7 items remain passed, status remains `ALL PASSING`.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-5 (AC-5): a passed test never reverts`
- **Status:** Pass

### TC-6: reduced motion still completes the run
- **Acceptance criterion:** AC-6
- **Priority:** high
- **Type:** accessibility
- **Preconditions:** `prefers-reduced-motion: reduce`.
- **Test data:** `/`.
- **Steps:**
  1. Open `/` with reduced motion.
  2. Read `html` computed `scroll-behavior`.
  3. Scroll to the bottom.
- **Expected result:** `scroll-behavior` is not `smooth`; all 7 tests pass; counter `7 / 7 PASSED`; `#passCard` visible.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-6 (AC-6): reduced motion still completes the run`
- **Status:** Pass

### TC-7: the PASS card appears only at the sign-off
- **Acceptance criterion:** AC-7
- **Priority:** high
- **Type:** functional
- **Preconditions:** Fresh load.
- **Test data:** `/`.
- **Steps:**
  1. Check `#passCard` at the top.
  2. Scroll `#signoff` to the top of the viewport.
- **Expected result:** Before scrolling, no `visible` class and the stamp is hidden; after scrolling, `visible` is present and the stamp is visible.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-7 (AC-7): the PASS card appears only at the sign-off`
- **Status:** Pass

### TC-8: the spine fills and chapters reveal themselves
- **Acceptance criterion:** AC-8
- **Priority:** high
- **Type:** functional
- **Preconditions:** Fresh load.
- **Test data:** `/`.
- **Steps:**
  1. Center chapter 01 and measure `#spineProgress` height.
  2. Center chapter 05 and measure `#spineProgress` height.
  3. Check classes on all `[data-chapter]`.
- **Expected result:** The fill at chapter 05 is larger than at chapter 01; all five chapters get `in`; chapter 05 also has `chapter-dark`; there are exactly five chapters.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-8 (AC-8): the spine fills and chapters reveal themselves`
- **Status:** Pass

### TC-9: the HUD anchors work with mouse and keyboard
- **Acceptance criterion:** AC-9
- **Priority:** high
- **Type:** accessibility
- **Preconditions:** Desktop width where the HUD nav is visible.
- **Test data:** Anchors `#story`, `#method`, `#evidence`, `#showcase`, `#next`, `#signoff`.
- **Steps:**
  1. Click each HUD nav link and assert the URL hash.
  2. Focus `Video`, press Enter, assert `#showcase`; repeat for `Sign-off`.
- **Expected result:** Every anchor navigates to its section by mouse and by keyboard Enter.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-9 (AC-9): the HUD anchors work with mouse and keyboard`
- **Status:** Pass

### TC-10: the player is a typographic facade with no third-party load
- **Acceptance criterion:** AC-10
- **Priority:** high
- **Type:** functional / security
- **Preconditions:** Empty `UNFLAKY_VIDEO_ID`, clean context.
- **Test data:** `/`.
- **Steps:**
  1. Record every request host while loading.
  2. Check `#showcase` for the facade link, its `aria-label`, and absence of `iframe` and `img`.
- **Expected result:** Facade is a link/button with `aria-label="Watch the Unflaky tool walkthrough on YouTube"` and `href="https://youtube.com/@unflaky"`; no iframe or image in the section; no request to youtube, ytimg or googlevideo hosts.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-10 (AC-10): the player is a typographic facade with no third-party load`
- **Status:** Pass

### TC-11: an empty video ID opens the channel in a new tab
- **Acceptance criterion:** AC-11
- **Priority:** high
- **Type:** functional
- **Preconditions:** Empty `UNFLAKY_VIDEO_ID`; YouTube requests stubbed.
- **Test data:** `#videoFacade`.
- **Steps:**
  1. Assert the facade is `target="_blank"` with `rel` containing `noopener`.
  2. Click it and wait for the popup.
- **Expected result:** A new tab opens at `https://youtube.com/@unflaky`; the facade is still visible in the original tab.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-11 (AC-11): an empty video ID opens the channel in a new tab`
- **Status:** Pass

### TC-12: a configured video ID replaces the facade with the privacy embed
- **Acceptance criterion:** AC-12
- **Priority:** high
- **Type:** functional / security
- **Preconditions:** Override the ID with `abc123`; stub youtube-nocookie.
- **Test data:** `window.UNFLAKY_VIDEO_ID = 'abc123'`.
- **Steps:**
  1. Load with the override.
  2. Click the facade.
- **Expected result:** The facade is removed and one iframe remains with `src="https://www.youtube-nocookie.com/embed/abc123?autoplay=1"`.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-12 (AC-12): a configured video ID replaces the facade with the privacy embed`
- **Status:** Pass

### TC-13: the player stacks below 920px and stays side-by-side above it
- **Acceptance criterion:** AC-13
- **Priority:** high
- **Type:** boundary
- **Preconditions:** Fresh load.
- **Test data:** 760×1000, 920×800, 921×900, 1280×900.
- **Steps:**
  1. At 760 and 920, compare the player and copy bounding boxes.
  2. At 921 and 1280, compare columns and computed `position` of `.show-player`.
- **Expected result:** Below 920px the player sits above the copy in one column; at 921px and above the two columns sit side by side and the player is sticky.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-13 (AC-13): the player stacks below 920px and stays side-by-side above it`
- **Status:** Pass

### TC-14: without JavaScript the facade is a plain link
- **Acceptance criterion:** AC-10 (FR-18 fallback)
- **Priority:** medium
- **Type:** functional
- **Preconditions:** JavaScript disabled.
- **Test data:** `/`.
- **Steps:**
  1. Load `/` with JS disabled.
  2. Inspect `#videoFacade`.
- **Expected result:** The facade is a visible `<a>` with `href="https://youtube.com/@unflaky"`, `target="_blank"`, `rel` containing `noopener` and the required `aria-label`.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-14 (AC-10): without JavaScript the facade is a plain link`
- **Status:** Pass

### TC-15: the approved English copy is rendered verbatim
- **Acceptance criterion:** AC-14
- **Priority:** high
- **Type:** functional
- **Preconditions:** Clean load, EN.
- **Test data:** Every approved string in spec section 4.
- **Steps:**
  1. Assert each approved label, heading, body, line, metric, card, chip, block, quote, CTA, link label and footer by selector.
- **Expected result:** All strings match section 4 exactly (after whitespace normalisation).
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-15 (AC-14): the approved English copy is rendered verbatim`
- **Status:** Pass

### TC-16: CTFL is certified and the forbidden wording stays out
- **Acceptance criterion:** AC-15
- **Priority:** high
- **Type:** negative
- **Preconditions:** Clean load, EN.
- **Test data:** Body text and `.callout` text.
- **Steps:**
  1. Check for `certified 2026`.
  2. Check the body has no `scheduled` or `studying`.
  3. Remove the callout and check no `certify/certifies`, `approve` or `reject` remains.
- **Expected result:** `certified 2026` present; no `scheduled`/`studying`; forbidden verbs appear only in the Compliance callout.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-16 (AC-15): CTFL is certified and the forbidden wording stays out`
- **Status:** Pass

### TC-17: the evidence grid has five metrics and three cards
- **Acceptance criterion:** AC-16
- **Priority:** high
- **Type:** functional
- **Preconditions:** Clean load.
- **Test data:** `#evidence .metric`, `#evidence .ev-card`.
- **Steps:**
  1. Count metrics and cards and assert none is empty.
  2. Search the body for `FLUXO`, standalone `LIVE`, `SUITE PASSING`.
- **Expected result:** Exactly 5 metrics, 3 non-empty cards, no FLUXO card, no LIVE badge, no SUITE PASSING badge.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-17 (AC-16): the evidence grid has five metrics and three cards`
- **Status:** Pass

### TC-18: the story shows 2014, 2017, 2022, 2024 and 2026
- **Acceptance criterion:** AC-17
- **Priority:** medium
- **Type:** functional
- **Preconditions:** Clean load.
- **Test data:** `#story` text.
- **Steps:**
  1. Read `#story` inner text.
- **Expected result:** All five years are present.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-18 (AC-17): the story shows 2014, 2017, 2022, 2024 and 2026`
- **Status:** Pass

### TC-19: the sign-off links point where their labels promise
- **Acceptance criterion:** AC-18
- **Priority:** high
- **Type:** security
- **Preconditions:** Clean load.
- **Test data:** Labels `/IN/HERBERT-CUNHA`, `@HERBERTPH`, `@UNFLAKY`, `X @HERBERTBUILDS`.
- **Steps:**
  1. For each label, read the href, target and rel.
  2. Search the page for `/in/herbertph`.
- **Expected result:** Hrefs are the four approved destinations; each has `target="_blank"` and `rel` containing `noopener`; no `/in/herbertph` link exists.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-19 (AC-18): the sign-off links point where their labels promise`
- **Status:** Pass

### TC-20: every new-tab link keeps rel="noopener"
- **Acceptance criterion:** AC-19
- **Priority:** high
- **Type:** security
- **Preconditions:** Clean load.
- **Test data:** All `a[target="_blank"]`.
- **Steps:**
  1. Iterate every link with `target="_blank"` and read `rel`.
- **Expected result:** Every one contains `noopener`.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-20 (AC-19): every new-tab link keeps rel=noopener`
- **Status:** Pass

### TC-21: English is the default with the approved title
- **Acceptance criterion:** AC-20
- **Priority:** high
- **Type:** functional
- **Preconditions:** No `?lang`.
- **Test data:** `/`.
- **Steps:**
  1. Read `html[lang]` and `document.title`.
- **Expected result:** `lang="en"` and title `Herbert Parasio · SQA Team Lead`.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-21 (AC-20): English is the default with the approved title`
- **Status:** Pass

### TC-22: switching language updates the page, html lang and URL
- **Acceptance criterion:** AC-21
- **Priority:** high
- **Type:** functional
- **Preconditions:** Clean load.
- **Test data:** PT, ES, FR buttons; then EN.
- **Steps:**
  1. Click PT, ES and FR in turn; read `html[lang]`, H1 and URL.
  2. From `?lang=pt`, click EN.
- **Expected result:** Each language updates `html[lang]`, translates the H1 and sets `?lang=<code>`; EN removes the parameter.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-22 (AC-21): switching language updates the page, html lang and URL`
- **Status:** Pass

### TC-23: ?lang loads the page translated, including title and meta
- **Acceptance criterion:** AC-22
- **Priority:** high
- **Type:** functional
- **Preconditions:** Clean load with a language parameter.
- **Test data:** `?lang=pt`, `?lang=es`, `?lang=fr`.
- **Steps:**
  1. Load each URL directly.
  2. Read the H1, title, meta description and Open Graph title/description.
- **Expected result:** The page is translated on first paint; `<html lang>` matches; title and both meta descriptions are non-empty and language-specific.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-23 (AC-22): ?lang loads the page translated, including title and meta`
- **Status:** Pass

### TC-24: an unknown language falls back to English
- **Acceptance criterion:** AC-23
- **Priority:** medium
- **Type:** negative
- **Preconditions:** Clean load.
- **Test data:** `?lang=klingon`.
- **Steps:**
  1. Load `/?lang=klingon`.
- **Expected result:** `html[lang="en"]` and the English H1.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-24 (AC-23): an unknown language falls back to English`
- **Status:** Pass

### TC-25: every key renders and the protected terms stay untranslated
- **Acceptance criterion:** AC-24
- **Priority:** high
- **Type:** functional
- **Preconditions:** Clean load in each language.
- **Test data:** `?lang=en|pt|es|fr`.
- **Steps:**
  1. In each language, list `[data-i]`/`[data-ihtml]` elements whose text is empty.
  2. Check the protected terms appear untranslated.
  3. Check one translated string per section per language.
- **Expected result:** No empty key; `herbert.spec.ts`, `BMM Testlabs`, `NBCC`, `ISTQB CTFL`, `CTAL`, `Unflaky` and the six agent names appear untranslated; each section is translated.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-25 (AC-24): every key renders and the protected terms stay untranslated`
- **Status:** Pass

### TC-26: the CTFL/CTAL wording holds in every language
- **Acceptance criterion:** AC-25
- **Priority:** high
- **Type:** negative
- **Preconditions:** Clean load in each language.
- **Test data:** `?lang=en|pt|es|fr`.
- **Steps:**
  1. Read the body text and the CTAL item.
  2. Search for scheduled/studying equivalents and confirm 2026/2027.
- **Expected result:** No `scheduled`, `studying`, `agendado`, `estudando` or `em estudo`; the CTAL item does not describe studying; the page states certified 2026 and exam 2027.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-26 (AC-25): the CTFL/CTAL wording holds in every language`
- **Status:** Pass

### TC-27: 390px has no horizontal scroll and the HUD fits
- **Acceptance criterion:** AC-26
- **Priority:** high
- **Type:** boundary
- **Preconditions:** Fresh load.
- **Test data:** 390×844.
- **Steps:**
  1. Compare `documentElement.scrollWidth` with the viewport width.
  2. Measure `.hud-id`, `#runCount` and `#langs` and check for overlap and overflow.
  3. Measure `.hero-copy` and `#spec` and check the panel is below the copy.
- **Expected result:** No horizontal scroll; the HUD items do not overlap and stay inside the viewport; the spec panel sits below the hero text.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-27 (AC-26): 390px has no horizontal scroll and the HUD fits`
- **Status:** Pass

### TC-28: light and dark tokens match the design system
- **Acceptance criterion:** AC-27
- **Priority:** high
- **Type:** functional
- **Preconditions:** `prefers-color-scheme: light` and `dark`.
- **Test data:** `/`.
- **Steps:**
  1. Read every token from FR-32 in each scheme.
- **Expected result:** All tokens resolve to the values in the light and dark tables.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-28 (AC-27): light tokens match the design system` and `TC-28 (AC-27): dark tokens match the design system`
- **Status:** Pass

### TC-29: keyboard focus is visible on HUD, CTA and facade
- **Acceptance criterion:** AC-28
- **Priority:** high
- **Type:** accessibility
- **Preconditions:** Clean load.
- **Test data:** Keyboard Tab sequence.
- **Steps:**
  1. Tab through the HUD links and language buttons and assert a visible outline on each.
  2. Continue to the video facade and the CTA and assert their specific focus styles.
- **Expected result:** Every focusable control shows a visible focus indicator; the facade gets the gold inner outline and the CTA the ink outline.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-29 (AC-28): keyboard focus is visible on HUD, CTA and facade`
- **Status:** Pass

### TC-30: the HUD stays readable at a 200%-zoom width
- **Acceptance criterion:** AC-29
- **Priority:** medium
- **Type:** boundary
- **Preconditions:** Desktop page at a 640px CSS width (200% zoom equivalent).
- **Test data:** 640×800.
- **Steps:**
  1. Measure the HUD children and check for overlap, clipping and overflow.
- **Expected result:** The HUD id, counter and language selector stay inside the viewport, in order, without clipping or overlap.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-30 (AC-29): the HUD stays readable at a 200%-zoom width`
- **Status:** Pass

### TC-31: the page is typographic and only loads its origin and Google Fonts
- **Acceptance criterion:** AC-30
- **Priority:** high
- **Type:** security
- **Preconditions:** Clean context.
- **Test data:** `/`.
- **Steps:**
  1. Record request hosts while loading.
  2. Count `<img>` elements.
- **Expected result:** No `<img>`; every request host is the page origin or `fonts.googleapis.com` / `fonts.gstatic.com`.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-31 (AC-30): the page is typographic and only loads its origin and Google Fonts`
- **Status:** Pass

### TC-32: the resume source and PDF carry the corrections
- **Acceptance criterion:** AC-31
- **Priority:** high
- **Type:** functional
- **Preconditions:** Repository built, PDF served.
- **Test data:** `/resume.pdf`, `/resume/resume.html`.
- **Steps:**
  1. Request the PDF and check the `%PDF` signature and a plausible size.
  2. Read the resume source text and check the required facts and forbidden wording.
  3. (Manual evidence, recorded in the report) extract the PDF text with pypdf and repeat the content checks on the PDF itself.
- **Expected result:** PDF is valid; the resume contains SQA Team Lead, 11 testers, 95%, 98%, CTFL certified 2026, CTAL 2027, `linkedin.com/in/herbert-cunha`; no `scheduled`, `studying`, and no BMM work described as certifying.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-32 (AC-31): the resume source and PDF carry the corrections`
- **Status:** Pass

### TC-33: CNAME and the deploy job are unchanged
- **Acceptance criterion:** AC-32
- **Priority:** high
- **Type:** functional
- **Preconditions:** Repository.
- **Test data:** `CNAME`, `.github/workflows/deploy.yml`.
- **Steps:**
  1. Request `/CNAME` and read it.
  2. Read the workflow and check the test gate, the Pages upload path and the main-only deploy.
  3. Compare both files with `main` (`git diff main...HEAD -- CNAME .github/workflows/deploy.yml`).
- **Expected result:** `herbertph.com`; workflow tests first, deploys only `main` and uploads `.`; no diff against `main` for either file.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-33 (AC-32): CNAME and the deploy job are unchanged`
- **Status:** Pass

### TC-34: a tall viewport must still open at RUN 0/7
- **Acceptance criterion:** AC-1
- **Priority:** high
- **Type:** boundary
- **Preconditions:** Clean context, scroll at the top, no user interaction.
- **Test data:** 2560×1440 (1440p monitor), 1024×1366 (iPad Pro portrait), 3840×2160 (4K).
- **Steps:**
  1. Open `/` at each viewport.
  2. Wait for the inline script and 500 ms for layout.
  3. Read `#runCount` and the passed items.
- **Expected result:** The page opens at `RUN 0/7` with all seven items pending, as required by AC-1 and by the PDF checklist ("A página abre como um test run: HUD fixa com contador 0/7").
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-34 (AC-1): a tall viewport must still open at RUN 0/7`
- **Status:** Pass (#1 verified fixed in `9d8ea6b`)

### TC-35: the player is 16:9 and sticky above 920px without covering the HUD
- **Acceptance criterion:** FR-15 / FR-17 (handoff risk)
- **Priority:** medium
- **Type:** functional / boundary
- **Preconditions:** Fresh load; one run with a configured video ID.
- **Test data:** 921×900, 1280×900, 1280×400, 390×844.
- **Steps:**
  1. Scroll inside `#showcase` and measure `.show-player`.
  2. Check its top, the HUD bottom and the copy column.
  3. With `UNFLAKY_VIDEO_ID` set, measure the iframe wrapper.
  4. At 390px, check the facade does not overflow its column.
- **Expected result:** Above 920px the player is pinned at `hud bottom + 20px`, never covers the HUD and stays beside the copy; the embedded player is 16:9; at 390px the facade fits without horizontal overflow.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-35 (FR-15/FR-17): the player is 16:9 and sticky above 920px without covering the HUD`
- **Status:** Pass

### TC-36: 360px keeps the HUD and PASS card inside the viewport
- **Acceptance criterion:** AC-26 (handoff risk)
- **Priority:** high
- **Type:** boundary
- **Preconditions:** Fresh load; sign-off in view.
- **Test data:** 360×800, light and dark.
- **Steps:**
  1. Check horizontal overflow at the top.
  2. Measure the HUD children and check for overlap and clipping.
  3. Scroll to `#signoff` and check the card, stamp and four link rows.
- **Expected result:** No horizontal scroll; HUD id wraps without overlapping the counter or language selector; the PASS card and all four links stay inside the 360px viewport with no text overflow.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-36 (AC-26): 360px keeps the HUD and PASS card inside the viewport`
- **Status:** Pass

### TC-37: 320px is the narrowest supported width without overflow
- **Acceptance criterion:** AC-26 (boundary, below the required 390)
- **Priority:** low
- **Type:** boundary
- **Preconditions:** Fresh load.
- **Test data:** 320×800, all four languages.
- **Steps:**
  1. Open each language at 320px.
  2. Check page scroll width and HUD overlap.
- **Expected result:** No horizontal scroll; HUD items do not overlap.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-37 (AC-26): 320px is the narrowest supported width without overflow`
- **Status:** Pass

### TC-38: rapid language changes preserve the run state
- **Acceptance criterion:** AC-5 / AC-21 (exploration: fast repeated actions)
- **Priority:** medium
- **Type:** functional
- **Preconditions:** Run completed to 7/7.
- **Test data:** PT → ES → FR → EN, clicked in quick succession.
- **Steps:**
  1. Scroll to the bottom until 7/7.
  2. Click the four language buttons in quick succession.
  3. Check the passed items, counter and status.
- **Expected result:** The run stays 7/7 with no item reverting; the status is shown in the active language (`ALL PASSING` when EN).
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-38 (AC-5/AC-21): rapid language changes preserve the run state`
- **Status:** Pass

### TC-39: the facade opens the channel from the keyboard
- **Acceptance criterion:** AC-11 / AC-28
- **Priority:** medium
- **Type:** accessibility
- **Preconditions:** Empty ID; YouTube requests stubbed.
- **Test data:** Keyboard only.
- **Steps:**
  1. Tab to the video facade (no mouse).
  2. Press Enter and wait for the popup.
- **Expected result:** The facade is focusable with a visible focus ring; Enter opens `https://youtube.com/@unflaky` in a new tab.
- **Automated by:** `tests/acceptance.homepage-test-run.spec.ts` › `TC-39 (AC-11/AC-28): the facade opens the channel from the keyboard`
- **Status:** Pass

## Not covered

- **Pixel-perfect visual comparison against the four screenshots.** Screenshots exist for the record, but the acceptance criteria are behavioural; visual review was done manually at 360/390/1280 in both schemes.
- **Real YouTube navigation and embed rendering.** The suite stubs youtube.com; AC-11/AC-12 assert the URL and the iframe source, not YouTube's player behaviour. Loading the real channel would add a third-party dependency to CI.
- **PDF text extraction in CI.** The Playwright suite has no PDF text library and the spec forbids new dependencies; the PDF text was verified manually with pypdf against the same content checks applied to the HTML source.
- **Browser matrix beyond Chromium and iPhone 13.** The project config defines those two projects; WebKit/Firefox were not in scope.
- **Screen-reader announcement testing.** Focus visibility and semantic roles were checked programmatically; no NVDA/VoiceOver session was run.
- **Contrast ratios at every token pair.** Values follow FR-32 and were visually checked; a full WCAG contrast audit of all combinations was not run.
- **Back-end, form input, data storage and authentication.** The page has none; the security review covered external links, the embed and the i18n query parameter.
