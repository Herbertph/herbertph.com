# Review: unflaky-video

- **Verdict:** APPROVED
- **Commit reviewed:** a0c8beb (production change in f4ac361 and a97ffc6)
- **Spec:** docs/specs/unflaky-video.md
- **Build and tests (run by the reviewer):** `npx playwright test --reporter=line` (chromium + mobile) → 197 passed, 0 failed, 5 skipped (1.6m). No build step (static page).
- **QA report:** agrees with my run (202 tests: 197 passed, 5 skipped). The fifth skip is the WebKit gold-frame check, skipped against #4.

## Requirements coverage
| AC | Implemented in | Tested by | Status |
|---|---|---|---|
| AC-1 | index.html:607 (facade, no iframe/img before click) | TC-1; acceptance.homepage TC-10; portfolio AC-10 | OK |
| AC-2 | index.html:1271-1290 (`embedVideo`, click handler) | TC-2; acceptance.homepage TC-12; portfolio AC-2 | OK |
| AC-3 | native Enter on the link + Space handler, index.html:1291-1296 | TC-3, TC-4; acceptance.homepage TC-39; portfolio AC-3 | OK |
| AC-4 | index.html:607, 646 | TC-5; portfolio AC-4 | OK |
| AC-5 | sign-off link unchanged | TC-6; portfolio AC-5 | OK |
| AC-6 | index.html:274-275 (16:9 embed); 16:10 mobile override removed | TC-7; portfolio AC-6 | OK |
| AC-7 | updated homepage and portfolio tests | full suite | OK |

The developer edited `tests/acceptance.homepage-test-run.spec.ts` and `tests/portfolio.spec.ts`. The spec asks for that explicitly (scope, AC-7, task 3). I read the diff: every changed test still asserts something it can fail on (exact src, title, allow list, no popup, focus, no YouTube request before the click). None was weakened or removed.

## Blockers
None. #4 is open as minor (see R-2): the spec ACs do not require the gold frame, and focus still moves to the iframe on WebKit.

## Should fix
- R-1: The spec contradicts itself on the empty-ID fallback, and the code follows only one side. FR-6 says the fallback "facade opens the channel"; FR-4/AC-4 say the facade's `href` is the video. Both use the same `href`, so with an empty ID the facade now opens the video, not the channel. `index.html:607`, `index.html:1268`. The video is the better target. The Analyst should reword FR-6 rather than ask for a code change.
- R-2 (#4): On WebKit/Safari, the gold focus frame does not appear on the focused embed, because `:focus-within` does not match a focused iframe there. `index.html:281`. Visual only.

## Suggestions
- R-3: The click handler does not check modifier keys, so Ctrl/Cmd/Shift-click on the facade embeds the video in place instead of opening the video in a new tab as the link promises. `index.html:1287`. Returning early when `e.ctrlKey || e.metaKey || e.shiftKey` keeps the user's choice.
- R-4: `tabindex="0"` on the iframe is redundant, because iframes are focusable by default. `index.html:1280`.
- R-5: The iframe title reuses the facade's action label ("Watch the Unflaky tool walkthrough on YouTube"). A frame title describes its content, so "Unflaky tool walkthrough" reads better in a screen reader's frame list. `index.html:1277`. The spec allowed the current choice ("e.g. the facade's aria-label"), so this is optional.

## Security
YouTube loads only after the click, from `youtube-nocookie.com`, with the ID passed through `encodeURIComponent`. The allow list is narrower than before (no accelerometer, gyroscope or clipboard-write). All new links keep `target="_blank" rel="noopener"`. The test override `window.UNFLAKY_VIDEO_ID` is never set by the page, and the comment documents it (this also covers R-6 from the homepage-test-run review). No input, storage or secrets. No dependency changes.

## Not reviewed
- Real playback and autoplay: the tests stub YouTube, and I did not load the real player. QA confirmed through oEmbed that the video is public and embeddable.
- The updated mobile screenshots: I did not open the PNGs and relied on QA's inspection.
