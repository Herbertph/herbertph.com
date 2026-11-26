# Test report - Embed the Unflaky walkthrough video

- Date: 2026-11-25
- Branch: `feature/unflaky-video`
- Commit under test: `a97ffc6` (`style: keep the video frame 16:9 and show focus on the embed`), on top of `f4ac361` (embed feature)
- Spec: `docs/specs/unflaky-video.md`
- Test cases: `docs/test-cases/unflaky-video.md`
- Acceptance suite: `tests/acceptance.unflaky-video.spec.ts`
- Existing suites: `tests/acceptance.homepage-test-run.spec.ts` and `tests/portfolio.spec.ts` (updated by the developer for the new embed behaviour)
- Environment: Windows, Node 20, Playwright 1.65.1; Chromium desktop and the project's `mobile` project (iPhone 13 descriptor, WebKit). YouTube embed requests are stubbed in the tests; the real video was checked once with YouTube oEmbed.

## Verdict

**PASS**, with one **minor** open issue (#4): the gold focus frame is missing in WebKit/Safari after the iframe is focused.

All seven acceptance criteria pass on both projects, the full suite is green (**202 tests: 197 passed, 5 skipped, 0 failed**), and the handoff's asks are verified: the facade and the iframe are 16:9 at 360/390/560/1280px, the embed background is `--green-deep`, the iframe receives focus after mouse and Enter, and the mobile screenshots are updated. The only finding is Chromium-vs-WebKit for the new gold frame; it is visual only and does not affect the embed, the iframe focus or the run state.

## Counts

| Item | Result |
|---|---|
| Test cases designed | 12 |
| Test cases passing | 11 |
| Test cases failing | 1 (TC-11, WebKit only; #4 minor; Chromium passes) |
| New automated tests | 22 runs (11 declarations x 2 projects): 21 passed, 0 failed, 1 skipped (WebKit gold-frame variant, #4) |
| Existing suites (before this QA suite) | 180 runs: 176 passed, 4 skipped |
| Full `npm test` | 202 runs: 197 passed, 0 failed, 5 skipped |
| Flaky tests | 0 |
| Issues open for this feature | 1 minor (#4) |

The 5 skips are the 4 pre-existing homepage skips plus the WebKit gold-frame variant in TC-11 (documented below). The AC-2/AC-3 iframe-focus and embed tests run on both projects; only the decorative WebKit frame is skipped.

## Traceability and results

| AC | Test cases | Result |
|---|---|---|
| AC-1 | TC-1 | Pass |
| AC-2 | TC-2, TC-11 | Pass (TC-11 Chromium pass; WebKit gold frame #4 minor) |
| AC-3 | TC-3, TC-11 | Pass (iframe focus on both; gold frame Chromium; #4) |
| AC-4 | TC-5 | Pass |
| AC-5 | TC-6 | Pass |
| AC-6 | TC-7 | Pass |
| AC-7 | TC-8 | Pass (202/197, 0 failed) |
| FR-2 | TC-2, TC-4 | Pass (Enter and Space) |
| FR-6 | TC-9 | Pass (as resolved by AC-7; see spec note) |
| FR-7 | TC-10, TC-11 | Pass (iframe focus both; run state unchanged) |
| Handoff (a97ffc6) | TC-11, TC-12 | TC-11 Chromium pass / WebKit #4; TC-12 pass |

## Manual and exploratory evidence

- **16:9 at every width:** measured facade and embed boxes at 360 (320x180), 390 (350x196.9), 560 (520x292.5) and 1280 (548x308.25); ratio 1.777 within 2%; `scrollWidth == innerWidth` before and after the embed. The old 16:10 mobile override is gone.
- **Embed background:** computed `rgb(16, 40, 26)` (#10281A) on `.video-embed` after the click; the video/iframe sits on the `--green-deep` frame.
- **Focus:** after both mouse click and Enter, `document.activeElement` is the iframe; Chromium shows the 2px `rgb(199, 154, 59)` gold frame (`::after` opacity 1) and hides it when the CTA takes focus. WebKit reports the iframe as active but does not expose iframe focus to `:focus-within`; `::after` stays at opacity 0 — filed as **#4 (minor)**.
- **Mouse vs popup:** the click prevents the default link navigation; no popup opened; the facade is replaced in place.
- **Embed attributes:** `src="https://www.youtube-nocookie.com/embed/XVhTas9QSIo?autoplay=1"`, title `Watch the Unflaky tool walkthrough on YouTube`, allow `autoplay; encrypted-media; picture-in-picture; fullscreen`, `allowfullscreen`.
- **Links:** the facade and the showcase CTA point to `https://www.youtube.com/watch?v=XVhTas9QSIo` with `target="_blank"` and `rel=noopener`; the Sign-off `@UNFLAKY` still points to `https://youtube.com/@unflaky`.
- **No third party before click:** the request log has no youtube/ytimg/googlevideo host on a fresh load; no iframe or image in `#showcase`.
- **Run state:** clicking the facade at `#showcase` leaves `#runCount`, `#specStatus` and `aria-valuenow` unchanged.
- **Empty-ID fallback:** with `window.UNFLAKY_VIDEO_ID = ""` forced, no iframe is created; the facade remains a plain link to the video and opens it in a new tab. See the spec note below.
- **Real video:** YouTube oEmbed returned title "unflaky quality lab", author "Unflaky — Herbert Parasio", author URL `https://www.youtube.com/@unflaky`, and an embeddable iframe; the video is public/embeddable. Playback itself is not automated.
- **Screenshots:** `docs/screenshots/homepage-test-run/mobile-light.png` and `mobile-dark.png` are the updated 390px captures (390x9295); the showcase crop was inspected and shows the 16:9 poster. The desktop captures are unchanged because the pre-click desktop poster was already 16:9; the new green background/gold focus are post-click states and are not in the static poster screenshots.

## Code review

The branch diff (index.html, the updated homepage/portfolio tests and the two mobile screenshots) was reviewed with the code-review-and-quality and security-and-hardening skills.

- **Correctness:** The constant is `XVhTas9QSIo`; the facade href and CTA href are the specific video; the Sign-off link stays on the channel; the click/Enter/Space path embeds in place with the exact src, title, allow and allowfullscreen; the iframe is focused. The `typeof overrideId === "string"` change lets tests force an empty ID while the real page (where `window.UNFLAKY_VIDEO_ID` is undefined) uses the constant. The `facade.isConnected` guard prevents a double embed.
- **Readability:** The embed logic is a small named `embedVideo()`; the diff is focused and the comments explain the override and the fallback.
- **Architecture:** The static single-file page and the i18n/HUD mechanisms are untouched; no dependency was added. The 16:9 frame is now consistent at every breakpoint.
- **Security:** The iframe src is built with `encodeURIComponent`; YouTube is loaded only after the click; the links keep `target="_blank"` and `rel=noopener`; no user input, secrets or storage. The video's oEmbed confirms it is public/embeddable. Nothing to flag.
- **Performance:** The iframe is requested only on interaction; the poster is typographic; the `::after` focus layer is `pointer-events:none` and uses an opacity transition. No layout shift (facade and embed share the 16:9 box).
- **Tests:** The developer updated the old empty-ID/channel tests to the new embed behaviour and kept the no-request/no-image checks; the new suite adds 360/560 widths, Space, the green background, the gold frame, the run-state check and the screenshot artifact check. No test of an acceptance criterion was weakened or removed. The WebKit gold-frame test is skipped for #4, not deleted; the iframe focus is still asserted on WebKit.

## Spec issues and observations

1. **FR-6 vs AC-7 (spec ambiguity, not a bug).** FR-6 says the empty-ID fallback "facade opens the channel"; AC-7 says the old empty-ID tests are updated to the new behaviour. In the shipped code the facade's href (and the forced-empty fallback) points to the specific video, not the channel. The implementation and tests follow AC-7; the FR-6 parenthetical is stale and should be reworded by the Analyst/Herbert if the channel fallback was intended.
2. **Gold focus frame in WebKit/Safari (#4, minor).** `:focus-within` does not match a focused iframe in WebKit; the gold frame is missing there. The iframe focus itself works; the embed, links and run state are unaffected.
3. **Desktop screenshots.** They are intentionally not updated: the pre-click desktop poster was already 16:9, and the new green background/gold frame appear only after the click, so the review screenshots still represent the static page. The mobile screenshots are updated because the 16:10 override was removed.
4. **Autoplay.** The iframe has `autoplay=1` and the allow list, but headless Chromium may block autoplay; this is a browser policy, not a page defect.

## Not covered

See the "Not covered" section of `docs/test-cases/unflaky-video.md`: real playback/ads, autoplay execution, dark-theme gold border, screenshot pixel diffing, and keyboard focus inside the third-party YouTube player. The WebKit gold-frame limitation is tracked as #4.

## Files changed by QA

- `docs/test-cases/unflaky-video.md`
- `tests/acceptance.unflaky-video.spec.ts`
- `docs/test-reports/unflaky-video.md`

No production file was modified by QA. The existing homepage/portfolio tests were updated by the developer; QA added an independent acceptance suite. The full suite is green and no acceptance-criterion test was weakened.
