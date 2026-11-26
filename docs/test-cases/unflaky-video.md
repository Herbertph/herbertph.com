# Test cases - Embed the Unflaky walkthrough video

- Spec: `docs/specs/unflaky-video.md`
- Branch under test: `feature/unflaky-video`
- Commit: `a97ffc6` (`style: keep the video frame 16:9 and show focus on the embed`), on top of `f4ac361` (embed feature)
- Suite: `tests/acceptance.unflaky-video.spec.ts` (this document) plus the updated homepage suites `tests/acceptance.homepage-test-run.spec.ts` and `tests/portfolio.spec.ts`
- Environment: Chromium desktop and the project's `mobile` project (iPhone 13 descriptor, WebKit); video requests are stubbed in the tests; the real video availability was checked manually with YouTube oEmbed.

## Traceability

| AC | Test cases |
|---|---|
| AC-1 | TC-1 |
| AC-2 | TC-2, TC-11 |
| AC-3 | TC-3, TC-11 |
| AC-4 | TC-5 |
| AC-5 | TC-6 |
| AC-6 | TC-7 |
| AC-7 | TC-8 |
| FR-2 | TC-2, TC-4 |
| FR-6 | TC-9 |
| FR-7 | TC-10, TC-11 |
| Handoff (a97ffc6) | TC-11, TC-12 |

## Test cases

### TC-1: a fresh load has the typographic facade and loads no video third party
- **Acceptance criterion:** AC-1
- **Priority:** high
- **Type:** functional / security
- **Preconditions:** Clean context, no override.
- **Test data:** `/`.
- **Steps:**
  1. Record request hosts while loading.
  2. Check the facade, its `aria-label`, `href`, and the absence of `iframe`/`img` in `#showcase`.
- **Expected result:** Facade is a link with `aria-label="Watch the Unflaky tool walkthrough on YouTube"` and `href="https://www.youtube.com/watch?v=XVhTas9QSIo"`; no iframe or image; no request to youtube.com, youtube-nocookie.com, ytimg.com or googlevideo.com.
- **Automated by:** `tests/acceptance.unflaky-video.spec.ts` > `TC-1 (AC-1): a fresh load has the typographic facade and loads no video third party`
- **Status:** Pass

### TC-2: a mouse click embeds the video in place
- **Acceptance criterion:** AC-2
- **Priority:** high
- **Type:** functional
- **Preconditions:** YouTube embed route stubbed.
- **Test data:** `/`, `#videoFacade`.
- **Steps:**
  1. Click the facade.
  2. Read the iframe src, title, allow and allowfullscreen; check the facade is gone and no popup opened; check focus, frame ratio and background.
- **Expected result:** One iframe with `src="https://www.youtube-nocookie.com/embed/XVhTas9QSIo?autoplay=1"`, title `Watch the Unflaky tool walkthrough on YouTube`, allow `autoplay; encrypted-media; picture-in-picture; fullscreen`, `allowfullscreen`; facade removed; no popup; iframe focused; 16:9; `--green-deep` background.
- **Automated by:** `tests/acceptance.unflaky-video.spec.ts` > `TC-2 (AC-2): a mouse click embeds the video in place`
- **Status:** Pass

### TC-3: Enter on the focused facade embeds the video
- **Acceptance criterion:** AC-3
- **Priority:** high
- **Type:** accessibility
- **Preconditions:** YouTube embed route stubbed.
- **Test data:** `/`, focused `#videoFacade`.
- **Steps:**
  1. Focus the facade and press Enter.
- **Expected result:** The same iframe as TC-2; facade gone; iframe focused.
- **Automated by:** `tests/acceptance.unflaky-video.spec.ts` > `TC-3 (AC-3): Enter on the focused facade embeds the video`
- **Status:** Pass

### TC-4: Space on the focused facade embeds the video
- **Acceptance criterion:** FR-2
- **Priority:** medium
- **Type:** accessibility
- **Preconditions:** YouTube embed route stubbed.
- **Test data:** `/`, focused `#videoFacade`.
- **Steps:**
  1. Focus the facade and press Space.
- **Expected result:** The same iframe as TC-2; no page scroll-only action; iframe focused.
- **Automated by:** `tests/acceptance.unflaky-video.spec.ts` > `TC-4 (FR-2): Space on the focused facade embeds the video`
- **Status:** Pass

### TC-5: the facade and the showcase CTA point to the specific video
- **Acceptance criterion:** AC-4
- **Priority:** high
- **Type:** security / functional
- **Preconditions:** Clean load.
- **Test data:** `#videoFacade`, `#showcase .cta`.
- **Steps:**
  1. Read both `href`, `target` and `rel` values.
- **Expected result:** Both `https://www.youtube.com/watch?v=XVhTas9QSIo`, `target="_blank"`, `rel` contains `noopener`; neither points to `youtube.com/@unflaky`.
- **Automated by:** `tests/acceptance.unflaky-video.spec.ts` > `TC-5 (AC-4): the facade and the showcase CTA point to the specific video`
- **Status:** Pass

### TC-6: the Sign-off YouTube link stays on the channel
- **Acceptance criterion:** AC-5
- **Priority:** medium
- **Type:** functional
- **Preconditions:** Clean load.
- **Test data:** `#signoff` link `@UNFLAKY`.
- **Steps:**
  1. Read the href of the Sign-off `@UNFLAKY` link.
- **Expected result:** `https://youtube.com/@unflaky`; the video change did not alter the Sign-off semantics.
- **Automated by:** `tests/acceptance.unflaky-video.spec.ts` > `TC-6 (AC-5): the Sign-off YouTube link stays on the channel`
- **Status:** Pass

### TC-7: the facade and the embed are 16:9 at 360, 390, 560 and 1280px
- **Acceptance criterion:** AC-6
- **Priority:** high
- **Type:** boundary
- **Preconditions:** YouTube embed route stubbed.
- **Test data:** 360x900, 390x900, 560x900, 1280x900.
- **Steps:**
  1. At each width, measure the facade and check the 16:9 ratio and no horizontal scroll.
  2. Click the facade and measure the embed; check 16:9 and no horizontal scroll.
- **Expected result:** Both the facade (before) and the embed (after) keep a 16:9 ratio within 2% and stay inside the viewport with no horizontal scroll.
- **Automated by:** `tests/acceptance.unflaky-video.spec.ts` > `TC-7 (AC-6): the facade and the embed are 16:9 at 360, 390, 560 and 1280px`
- **Status:** Pass

### TC-8: the full suite is green
- **Acceptance criterion:** AC-7
- **Priority:** high
- **Type:** regression
- **Preconditions:** Branch checked out, dependencies installed.
- **Test data:** `npm test`.
- **Steps:**
  1. Run `npm test` on both projects.
  2. Confirm the no-request, embed and fallback tests are updated, not weakened.
- **Expected result:** Full suite passes on both projects; no test was deleted or skipped to hide the new behaviour.
- **Automated by:** `npm test` (meta-check; result recorded in the report)
- **Status:** Pass

### TC-9: a forced empty ID keeps a plain link to the video
- **Acceptance criterion:** FR-6 (as resolved by AC-7)
- **Priority:** medium
- **Type:** negative / fallback
- **Preconditions:** `window.UNFLAKY_VIDEO_ID = ""` forced before load; YouTube watch route stubbed.
- **Test data:** `/`.
- **Steps:**
  1. Load with the empty override.
  2. Click the facade and wait for the popup.
- **Expected result:** No iframe is created; the facade stays as a plain link to the video (`target="_blank"`, `rel` contains `noopener`) and opens the video in a new tab. Note: spec FR-6 says the old fallback opened the channel; AC-7 explicitly says the old empty-ID tests move to the new behaviour, so the video is the resolved fallback.
- **Automated by:** `tests/acceptance.unflaky-video.spec.ts` > `TC-9 (FR-6/AC-7): a forced empty ID keeps a plain link to the video`
- **Status:** Pass

### TC-10: the embed does not change the run state
- **Acceptance criterion:** FR-7
- **Priority:** medium
- **Type:** functional
- **Preconditions:** YouTube embed route stubbed; page scrolled to `#showcase`.
- **Test data:** `/`.
- **Steps:**
  1. Scroll to `#showcase`, wait for the run state, read `#runCount`/`#specStatus`.
  2. Click the facade; read them again after the embed.
- **Expected result:** The counter and status are unchanged by the embed; the iframe is focused.
- **Automated by:** `tests/acceptance.unflaky-video.spec.ts` > `TC-10 (FR-7): the embed does not change the run state`
- **Status:** Pass

### TC-11: the focused embed gets the gold frame by mouse and by Enter
- **Acceptance criterion:** AC-2 / AC-3 / FR-7 / handoff
- **Priority:** high
- **Type:** visual / accessibility
- **Preconditions:** YouTube embed route stubbed.
- **Test data:** `/`, light theme.
- **Steps:**
  1. Click the facade; read `getComputedStyle(.video-embed, '::after')` opacity/border and the focused element.
  2. Focus the CTA to blur the embed; wait for the transition; read the border again.
  3. Reload, focus the facade, press Enter; read the border/focus again.
- **Expected result:** The iframe is focused and the 2px gold frame is visible after mouse and Enter; the frame hides when focus leaves. The embed background is `--green-deep`.
- **Automated by:** `tests/acceptance.unflaky-video.spec.ts` > `TC-11 (handoff): the focused embed gets the gold frame by mouse and by Enter` (Chromium passes; the WebKit variant is skipped for #4)
- **Status:** Fail (#4) — WebKit only; Chromium passes

### TC-12: the mobile review screenshots are current and 16:9
- **Acceptance criterion:** handoff (mobile screenshots)
- **Priority:** medium
- **Type:** visual
- **Preconditions:** `docs/screenshots/homepage-test-run/mobile-light.png` and `mobile-dark.png` committed.
- **Test data:** both PNGs; `/` at 390px.
- **Steps:**
  1. Check the PNGs exist, are served as image/png and are 390px wide.
  2. Check the live 390px facade is 16:9 (TC-7).
  3. Inspect the showcase crop of the screenshots.
- **Expected result:** Both screenshots are the updated 390px captures and the showcase poster is 16:9; the desktop captures are unchanged because the pre-click desktop poster was already 16:9.
- **Automated by:** `tests/acceptance.unflaky-video.spec.ts` > `TC-12 (handoff): the mobile review screenshots are current and 16:9` plus the manual crop in the report
- **Status:** Pass

## Not covered

- **Real YouTube playback.** The suite stubs youtube-nocookie; the video's public/embeddable status was checked once with YouTube oEmbed (title "unflaky quality lab", author Unflaky), but playback, ads and YouTube's own errors are not automated.
- **Screenshot pixel comparison.** The mobile screenshots are checked for dimensions/currency and inspected manually; there is no pixel-diff baseline.
- **Autoplay policy.** Headless Chromium may block autoplay; the iframe `autoplay=1` and `allow` are checked, not whether the browser actually starts playback.
- **Dark-theme gold border colour.** The frame follows `--gold`; the focused-border test runs in the default light theme.
- **Gold focus frame in WebKit/Safari.** WebKit does not expose iframe focus to `:focus-within`, so the gold frame is missing there and is tracked as **#4** (minor); the Chromium reference is tested and the iframe focus itself is tested on both projects.
- **Keyboard focus inside the YouTube iframe.** The frame element receives focus (FR-7); the third-party player's internal keyboard behaviour is out of our control.
