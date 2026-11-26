# Test report - Homepage redesign, "the page is a test run"

- Date: 2026-11-25
- Branch: `feature/homepage-test-run`
- Commit under test: `9d8ea6b` (`fix: open every tall viewport at RUN 0/7 until the first scroll (#1)`); initial full run: `ae1655c`
- Spec: `docs/specs/homepage-test-run.md` (source PDF: `docs/specs/homepage-test-run.source.pdf`)
- Test cases: `docs/test-cases/homepage-test-run.md`
- Acceptance suite: `tests/acceptance.homepage-test-run.spec.ts`
- Existing regression suite: `tests/portfolio.spec.ts`
- Environment: Windows, Node 20, Playwright 1.65.1; Chromium desktop (1280x720) and the project's `mobile` project (iPhone 13 descriptor, WebKit 390x844)

## Verdict

**PASS (retest).** Issue #1 is verified fixed in `9d8ea6b`. All 39 test cases pass and the full suite is green: **146 passed, 0 failed, 4 skipped** (150 tests, no retries).

The initial full run at `ae1655c` failed AC-1 on tall viewports (issue #1, major). That history is kept in the "Initial full run (superseded)" section at the end of this report.

## Retest evidence (#1)

- Fresh load at `scrollY = 0` now shows `RUN 0/7`, `aria-valuenow="0"`, `RUNNING`, all 7 items pending and no PASS card at **2560x1440**, **1024x1366** and **3840x2160**.
- The catch-up still works: instant scroll to the bottom, a 1px scroll plus normal reading, and a direct `/#signoff` load all reach **7/7**, `ALL PASSING`, all chapters `in` and the PASS card visible.
- After scrolling back to the top the run stays **7/7** (AC-5); reduced motion at 4K opens at **0/7** and reaches **7/7** at the bottom (AC-6).
- `TC-34` passes on Chromium (mobile skipped by design); `TC-8` passes on both projects; `TC-1`, `TC-3`, `TC-5` and `TC-6` pass on both projects.
- The fix is a small gate around the initial run state (`started`), not a change to the observers' monotonic logic. It also handles a restored mid-page position (`scrollY > 0`) and direct hash loads.

## Counts (retest)

| Item | Result |
|---|---|
| Test cases designed | 39 |
| Test cases passing | 39 |
| Test cases failing | 0 (#1 verified fixed) |
| New automated tests | 80 runs (40 declarations x 2 projects): 77 passed, 0 failed, 3 skipped |
| Existing suite | 70 runs: 69 passed, 1 skipped (HUD nav on mobile, by design) |
| Full `npm test` | 150 runs: 146 passed, 0 failed, 4 skipped |
| Flaky tests | 0 |
| Issues open for this feature | 0 critical/major (#1 verified fixed, remains open until merge) |

The three new-suite skips are intentional: TC-9 (HUD nav is hidden on mobile), TC-34 and TC-35 (explicit desktop viewports are used inside the test, so the mobile project is skipped; both are covered on desktop).

## Traceability and results

| AC | Test cases | Result |
|---|---|---|
| AC-1 | TC-1, TC-34 | Pass (TC-34 verified in `9d8ea6b`) |
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

Every acceptance criterion now has at least one passing test. AC-1 is covered by TC-1 (default viewport) and TC-34 (tall viewports), both passing in `9d8ea6b`.

## Issues opened

- **#1 (major)**: Homepage opens at 1/7 or 3/7 instead of RUN 0/7 on tall viewports. **Verified fixed in `9d8ea6b`** (comment added). The issue stays open; merging the pull request closes it. No new issue was opened in the retest.

## Flaky tests

None. The config has `retries: 0`, and neither the initial run nor the retest needed a retry.

Two new tests (TC-29 and TC-39) first failed on the `mobile` project because it runs **WebKit**, where links are not in the default Tab order unless the OS enables full keyboard access. This was a wrong test assumption, not a product defect: the facade and CTA have `:focus-visible` styles and activate with Enter when focused. The tests now Tab through the HUD buttons on WebKit and use programmatic focus for the two links, then press Enter; both pass on both projects. The behaviour is documented in the test comments.

## Code review

The branch diff (`git diff main...HEAD`) was reviewed with the code-review-and-quality and security-and-hardening skills.

- **Correctness:** One real defect was found in the initial full run, #1 in the initial run-state calculation. The fix in `9d8ea6b` gates `syncFromViewport()` and the observer startup entries behind `started`, which is set on the first scroll (or when `scrollY > 0` on load, covering restored positions and hash loads). The retest confirms 0/7 on load and 7/7 after scrolling/jumping. Everything else matched the spec: all copy, section order, observers, monotonic run state, reduced motion, i18n keys, links and resume corrections.
- **Readability:** `index.html` is 1291 lines / about 84 KB, but FR-0.1 mandates a single static file with inline CSS/JS, so the size is justified. Section comments, small IIFE functions and consistent naming make it navigable. The fix reads cleanly and is limited to 12 added lines.
- **Architecture:** The existing i18n engine was extended, not rewritten; no framework, bundler, runtime dependency or external JS was added. `package-lock.json` pins Playwright 1.65.1, which matches the local run.
- **Security:** No user input is rendered; `?lang` is allowlisted, the video ID is URL-encoded, the YouTube embed uses `youtube-nocookie.com` only after a click, and every `target="_blank"` link has `rel="noopener"`. No secrets, no storage, no PII. `npm audit` reports 0 vulnerabilities. Missing CSP/security headers are a host-level limitation of GitHub Pages; suggested as hardening, not filed as a bug.
- **Performance:** One font stylesheet, no images, no third-party request before the click, passive scroll listener with `requestAnimationFrame`, IntersectionObserver for reveals. Removing the spine height transition does not affect scrolling performance.
- **Verification:** The developer suite covered the main ACs but not tall viewports, the full copy, the CTA/facade focus path, or 360/320px. The new acceptance suite fills those gaps. The retest is green on both projects.

Suggestions (not issues): use `npm ci` in the workflow now that the lockfile is committed; consider a `<meta>` CSP if the hosting ever allows it.

## Manual and exploratory evidence

- **360/390px HUD:** the id wraps to two lines inside 134px; the counter and the four language buttons stay inside the viewport with no overlap. Measured at 360 (id 12-146, counter 154-199, languages 238-348) and 390 (languages 268-378); `scrollWidth == innerWidth` at both, and at 320 in all four languages.
- **PASS card at 360/390:** card 320/350px wide, four link rows 268/298px wide, no text overflow, stamp inside the card.
- **Sticky showcase player:** at 921px and 1280px the player is `position: sticky`, pinned at 78px (HUD 59px + 20px), beside the copy and never over the HUD; at 920px it is static and stacked above the copy (AC-13). At a 400px-tall viewport it still clears the HUD.
- **Focus:** keyboard/`focus()` reaches the facade and CTA; facade outline is gold 2px at -6px offset inside the dark frame; CTA outline is ink 2px at +3px offset; language buttons show the brick outline. Screenshots were inspected in light and dark.
- **Copy:** the data-driven test compares every approved string in spec section 4; the front-end commit did not change the dictionary (only CSS).
- **Resume PDF:** `pypdf` extracted 2 pages; the PDF text contains SQA Team Lead, 11 testers, 95%, 98%, CTFL certified 2026, CTAL with 2027 and `linkedin.com/in/herbert-cunha`; it contains no `scheduled`, `studying`, `certify`, `certifies`, `approve` or `reject`. This was a manual check because adding a PDF library would violate FR-0.1.
- **Screenshots:** the four required combinations exist under `docs/screenshots/homepage-test-run/` and were regenerated in `ae1655c`.
- **Tall viewports (retest, `9d8ea6b`):** 2560x1440, 1024x1366 and 3840x2160 open at `RUN 0/7`; instant bottom, direct `/#signoff` and scroll-back checks reach/preserve `7 / 7 PASSED`; reduced motion at 4K opens at 0/7 and reaches 7/7. Confirmed by the scripted check and by TC-34.

## Spec issues and observations

No acceptance criterion was ambiguous enough to block the run. Non-blocking observations for Herbert/Analyst:

1. **Mobile poster ratio (minor, not filed).** FR-17 and the PDF say the typographic frame is 16:9. At 560px and below, `.facade` is 16:10 (`aspect-ratio:16/10`), so at 390px the poster is 350x219 instead of 350x197. The real embedded player (`.video-embed`) is 16:9. Visual only, no AC; restore 16:9 or approve the mobile variant.
2. **HUD counter language (possible FR-23 gap, not filed).** `RUN 0/7` and `N / 7 PASSED` are hardcoded in JS and stay English in PT/ES/FR, while `#specStatus` and the rest of the HUD are translated. FR-3/AC-1/AC-3 prescribe the English strings, so this was not treated as a failure; Herbert can decide whether the counter should be keyed.
3. **Language switch drops the URL hash (cosmetic, not filed).** `apply()` uses `history.replaceState(pathname + search)`, so switching language on `/#showcase` leaves `/?lang=pt` without the hash. The scroll position does not jump.
4. **Tall-viewport chapter reveal (visual, not filed).** At 2560x1440 and 3840x2160, chapters already inside the viewport at load stay at `opacity: .4` until the first scroll. At 4K, after 1px of scroll chapters 01-02 reveal while 03-04 wait for the 72% catch-up line; a full scroll reveals all five. This is the deliberate cost of opening at `RUN 0/7` and AC-8 passes after a real scroll, but the faded copy is visible on a 4K screen (screenshot checked). Worth a visual decision in the next design pass, not an acceptance failure.
5. **PDF text automation.** The suite has no PDF text library and the spec forbids new dependencies, so AC-31 is automated at the source/signature level and the PDF text is verified manually. If a dependency is ever allowed, add a small PDF text assertion.

## Not covered

See the "Not covered" section of `docs/test-cases/homepage-test-run.md`: pixel-perfect visual diffing, real YouTube playback, CI PDF text extraction, a browser matrix beyond Chromium/WebKit-iPhone, screen-reader sessions, a full WCAG contrast audit and back-end/security surfaces (there are none).

## Files changed by QA

- `docs/test-cases/homepage-test-run.md`
- `tests/acceptance.homepage-test-run.spec.ts`
- `docs/test-reports/homepage-test-run.md`

Retest updated the TC-34 status and this report; no test was changed to make the fix pass. No production file was modified by QA. No test was skipped or weakened to make the suite pass: the same TC-34 that failed before now passes on `9d8ea6b`.

## Initial full run (superseded)

At `ae1655c`, before the fix:

- Verdict **FAIL**; issue **#1 (major)** open.
- Test cases: 38/39 passed; TC-34 failed.
- Full suite: **145 passed, 1 failed, 4 skipped** (150 tests).
- At 2560x1440 and 1024x1366 the page opened at `1 / 7 PASSED`; at 3840x2160 at `3 / 7 PASSED`, with `scrollY = 0`.
- The failing output and geometry are recorded in issue #1 and in the initial version of this report; the failing test is still in the suite and now passes.
