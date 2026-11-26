# Test report - Homepage redesign, "the page is a test run"

- Date: 2026-11-25
- Branch: `feature/homepage-test-run`
- Commit: `ae1655c` (`style: polish homepage layout, HUD and PASS card finish`)
- Spec: `docs/specs/homepage-test-run.md` (source PDF: `docs/specs/homepage-test-run.source.pdf`)
- Test cases: `docs/test-cases/homepage-test-run.md`
- Acceptance suite: `tests/acceptance.homepage-test-run.spec.ts`
- Existing regression suite: `tests/portfolio.spec.ts`
- Environment: Windows, Node 20, Playwright 1.65.1; Chromium desktop (1280x720) and the project's `mobile` project (iPhone 13 descriptor, WebKit 390x844)

## Verdict

**FAIL.** 38 of 39 test cases pass, but AC-1 fails on tall viewports: the page opens at `1 / 7 PASSED` on 1440p and iPad Pro portrait, and at `3 / 7 PASSED` on 4K, before the visitor scrolls. Filed as **#1 (major)**.

Full suite: **145 passed, 1 failed, 4 skipped** (150 tests, 1.3 min, no retries). The only failure is TC-34 (issue #1).

## Counts

| Item | Result |
|---|---|
| Test cases designed | 39 |
| Test cases passing | 38 |
| Test cases failing | 1 (TC-34, #1) |
| New automated tests | 80 runs (40 declarations x 2 projects): 76 passed, 1 failed, 3 skipped |
| Existing suite | 70 runs: 69 passed, 1 skipped (HUD nav on mobile, by design) |
| Full `npm test` | 150 runs: 145 passed, 1 failed, 4 skipped |
| Flaky tests | 0 |
| Issues opened | 1 (#1, major) |

The three new-suite skips are intentional: TC-9 (HUD nav is hidden on mobile), TC-34 and TC-35 (explicit desktop viewports are used inside the test, so the mobile project is skipped; both are covered on desktop).

## Traceability and results

| AC | Test cases | Result |
|---|---|---|
| AC-1 | TC-1 (pass), TC-34 (fail #1) | **FAIL** |
| AC-2 | TC-2 | Pass |
| AC-3 | TC-3 | Pass |
| AC-4 | TC-4 | Pass |
| AC-5 | TC-5, TC-38 | Pass |
| AC-6 | TC-6 | Pass |
| AC-7 | TC-7 | Pass |
| AC-8 | TC-8 | Pass |
| AC-9 | TC-9 | Pass (Chromium; mobile skipped by design) |
| AC-10 | TC-10, TC-14 | Pass |
| AC-11 | TC-11, TC-39 | Pass |
| AC-12 | TC-12 | Pass |
| AC-13 | TC-13 | Pass |
| AC-14 | TC-15 | Pass (all approved strings checked through a data-driven copy test) |
| AC-15 | TC-16 | Pass |
| AC-16 | TC-17 | Pass |
| AC-17 | TC-18 | Pass |
| AC-18 | TC-19 | Pass |
| AC-19 | TC-20 | Pass |
| AC-20 | TC-21 | Pass |
| AC-21 | TC-22, TC-38 | Pass |
| AC-22 | TC-23 | Pass |
| AC-23 | TC-24 | Pass |
| AC-24 | TC-25 | Pass |
| AC-25 | TC-26 | Pass |
| AC-26 | TC-27, TC-36, TC-37 | Pass (390, 360 and 320px) |
| AC-27 | TC-28 (light), TC-28 (dark) | Pass (all FR-32 tokens checked) |
| AC-28 | TC-29, TC-39 | Pass (visible focus and keyboard activation) |
| AC-29 | TC-30 | Pass |
| AC-30 | TC-31 | Pass |
| AC-31 | TC-32 | Pass (source + PDF signature; PDF text verified manually, see below) |
| AC-32 | TC-33 | Pass (`CNAME` and deploy workflow unchanged) |

Every acceptance criterion has at least one passing test, except AC-1, which is covered by a passing test at the default viewport (TC-1) and a failing boundary test at tall viewports (TC-34). Because AC-1 explicitly says a fresh load at the top shows `RUN 0/7`, AC-1 is red.

## Issues opened

- **#1 (major)**: Homepage opens at 1/7 or 3/7 instead of RUN 0/7 on tall viewports.

## Flaky tests

None. The config has `retries: 0`, and no test needed a retry.

Two new tests (TC-29 and TC-39) first failed on the `mobile` project because it runs **WebKit**, where links are not in the default Tab order unless the OS enables full keyboard access. This was a wrong test assumption, not a product defect: the facade and CTA have `:focus-visible` styles and activate with Enter when focused. The tests now Tab through the HUD buttons on WebKit and use programmatic focus for the two links, then press Enter; both pass on both projects. The behaviour is documented in the test comments.

## Code review

The branch diff (`git diff main...HEAD`, 2462 insertions) was reviewed with the code-review-and-quality and security-and-hardening skills.

- **Correctness:** One real defect, #1, in the initial run-state calculation. Everything else matched the spec: all copy, section order, observers, monotonic run state, reduced motion, i18n keys, links and resume corrections.
- **Readability:** `index.html` is 1281 lines / about 84 KB, but FR-0.1 mandates a single static file with inline CSS/JS, so the size is justified. Section comments, small IIFE functions and consistent naming make it navigable.
- **Architecture:** The existing i18n engine was extended, not rewritten; no framework, bundler, runtime dependency or external JS was added. `package-lock.json` now pins Playwright 1.65.1, which matches the local run.
- **Security:** No user input is rendered; `?lang` is allowlisted, the video ID is URL-encoded, the YouTube embed uses `youtube-nocookie.com` only after a click, and every `target="_blank"` link has `rel="noopener"`. No secrets, no storage, no PII. `npm audit` reports 0 vulnerabilities. Missing CSP/security headers are a host-level limitation of GitHub Pages; suggested as hardening, not filed as a bug.
- **Performance:** One font stylesheet, no images, no third-party request before the click, passive scroll listener with `requestAnimationFrame`, IntersectionObserver for reveals. No issue found.
- **Verification:** The developer suite covered the main ACs but not tall viewports, the full copy, the CTA/facade focus path, or 360/320px. The new acceptance suite fills those gaps. The existing suite is green after the changes.

Suggestions (not issues): use `npm ci` in the workflow now that the lockfile is committed; consider a `<meta>` CSP if the hosting ever allows it.

## Manual and exploratory evidence

- **360/390px HUD:** the id wraps to two lines inside 134px; the counter and the four language buttons stay inside the viewport with no overlap. Measured at 360 (id 12-146, counter 154-199, languages 238-348) and 390 (languages 268-378); `scrollWidth == innerWidth` at both, and at 320 in all four languages.
- **PASS card at 360/390:** card 320/350px wide, four link rows 268/298px wide, no text overflow, stamp inside the card.
- **Sticky showcase player:** at 921px and 1280px the player is `position: sticky`, pinned at 78px (HUD 59px + 20px), beside the copy and never over the HUD; at 920px it is static and stacked above the copy (AC-13). At a 400px-tall viewport it still clears the HUD.
- **Focus:** keyboard/`focus()` reaches the facade and CTA; facade outline is gold 2px at -6px offset inside the dark frame; CTA outline is ink 2px at +3px offset; language buttons show the brick outline. Screenshots were inspected in light and dark.
- **Copy:** the data-driven test compares every approved string in spec section 4; the front-end commit did not change the dictionary (only CSS).
- **Resume PDF:** `pypdf` extracted 2 pages; the PDF text contains SQA Team Lead, 11 testers, 95%, 98%, CTFL certified 2026, CTAL with 2027 and `linkedin.com/in/herbert-cunha`; it contains no `scheduled`, `studying`, `certify`, `certifies`, `approve` or `reject`. This was a manual check because adding a PDF library would violate FR-0.1.
- **Screenshots:** the four required combinations exist under `docs/screenshots/homepage-test-run/` and were regenerated in `ae1655c`.

## Spec issues and observations

No acceptance criterion was ambiguous enough to block the run. Non-blocking observations for Herbert/Analyst:

1. **Mobile poster ratio (minor, not filed).** FR-17 and the PDF say the typographic frame is 16:9. At 560px and below, `.facade` is 16:10 (`aspect-ratio:16/10`), so at 390px the poster is 350x219 instead of 350x197. The real embedded player (`.video-embed`) is 16:9. Visual only, no AC; restore 16:9 or approve the mobile variant.
2. **HUD counter language (possible FR-23 gap, not filed).** `RUN 0/7` and `N / 7 PASSED` are hardcoded in JS and stay English in PT/ES/FR, while `#specStatus` and the rest of the HUD are translated. FR-3/AC-1/AC-3 prescribe the English strings, so this was not treated as a failure; Herbert can decide whether the counter should be keyed.
3. **Language switch drops the URL hash (cosmetic, not filed).** `apply()` uses `history.replaceState(pathname + search)`, so switching language on `/#showcase` leaves `/?lang=pt` without the hash. The scroll position does not jump.
4. **PDF text automation.** The suite has no PDF text library and the spec forbids new dependencies, so AC-31 is automated at the source/signature level and the PDF text is verified manually. If a dependency is ever allowed, add a small PDF text assertion.

## Not covered

See the "Not covered" section of `docs/test-cases/homepage-test-run.md`: pixel-perfect visual diffing, real YouTube playback, CI PDF text extraction, a browser matrix beyond Chromium/WebKit-iPhone, screen-reader sessions, a full WCAG contrast audit and back-end/security surfaces (there are none).

## Files changed by QA

- `docs/test-cases/homepage-test-run.md`
- `tests/acceptance.homepage-test-run.spec.ts`
- `docs/test-reports/homepage-test-run.md`

No production file was modified. No test was skipped or weakened to make the suite pass; the one failure is the product defect in #1.
