# Spec: Embed the Unflaky walkthrough video

- Branch: `feature/unflaky-video`
- Builds on: `docs/specs/homepage-test-run.md` (FR-15 to FR-19, AC-10 to AC-13, AC-30)
- Video (from Herbert, 2026-11-25): https://www.youtube.com/watch?v=XVhTas9QSIo, ID `XVhTas9QSIo`

## 1. Context

The `#showcase` section shipped with `const UNFLAKY_VIDEO_ID = "";`, so the typographic facade opens the @unflaky channel. Herbert sent the walkthrough video. The section is the "hire-me" piece of the portfolio, so the video must play in the page.

## 2. Scope

**In scope:** set the video ID; point the facade fallback and the showcase CTA to the specific video; update the tests that assumed an empty ID.

**Out of scope:** any copy change, any thumbnail or image (the poster stays 100% typographic), loading YouTube before the click, the Sign-off YouTube link (it is labelled `@UNFLAKY` and stays on the channel).

## 3. Functional requirements

- **FR-1** `const UNFLAKY_VIDEO_ID = "XVhTas9QSIo";` in `index.html`.
- **FR-2** Clicking the facade (mouse, or Enter/Space when focused) replaces it with an `<iframe>` whose `src` is `https://www.youtube-nocookie.com/embed/XVhTas9QSIo?autoplay=1`, keeping the 16:9 frame, with a `title` (e.g. the facade's aria-label) and `allow="autoplay; encrypted-media; picture-in-picture; fullscreen"`, `allowfullscreen`. It does not open a new tab.
- **FR-3** Before the click, no request goes to any YouTube/Google video domain, and no `<iframe>` or `<img>` exists in `#showcase` (unchanged from AC-10/AC-30).
- **FR-4** Without JavaScript, the facade is a plain link to `https://www.youtube.com/watch?v=XVhTas9QSIo` (`target="_blank" rel="noopener"`), so it still promises and delivers the video.
- **FR-5** The showcase CTA "Watch the video on YouTube (@unflaky)" links to `https://www.youtube.com/watch?v=XVhTas9QSIo` (`target="_blank" rel="noopener"`); the link points to what its text promises.
- **FR-6** The empty-ID behaviour (facade opens the channel) stays in the code as a fallback, but is no longer the shipped state.
- **FR-7** After the embed, keyboard focus moves to the iframe (or stays inside the frame), and the HUD/run state is not affected.

## 4. Acceptance criteria

- **AC-1** Given a fresh load, Then `#showcase` has the facade with `aria-label="Watch the Unflaky tool walkthrough on YouTube"`, no `<iframe>`, no `<img>`, and no request was made to youtube.com, youtube-nocookie.com, ytimg.com or googlevideo.com.
- **AC-2** Given the facade, When I click it, Then an `<iframe>` with `src` `https://www.youtube-nocookie.com/embed/XVhTas9QSIo?autoplay=1` is in the frame, the facade is gone, and no popup/new tab opened.
- **AC-3** Given keyboard focus on the facade, When I press Enter, Then the same embed as AC-2 happens.
- **AC-4** Given the facade's `href` and the showcase CTA, Then both are `https://www.youtube.com/watch?v=XVhTas9QSIo` with `rel` containing `noopener` and `target="_blank"`.
- **AC-5** Given the Sign-off links, Then YouTube still points to `https://youtube.com/@unflaky`.
- **AC-6** Given the embedded iframe at 390px and at 1280px, Then it fills the 16:9 frame with no horizontal scroll.
- **AC-7** Given `npm test`, Then the suite is green on both projects. Tests that asserted the old empty-ID state (facade href = channel, click opens the channel) are updated to the new behaviour; the empty-ID fallback stays covered if it can be forced in a test, otherwise it is documented as not covered.

## 5. Assumptions (Herbert to confirm in review)
1. The facade fallback and the CTA go to the video itself, not the channel. The Sign-off `@UNFLAKY` link stays on the channel.
2. The video is public or unlisted and allows embedding (if YouTube blocks embedding, the frame shows YouTube's own error; we would then switch back to opening YouTube in a new tab).

## 6. Technical notes and tasks
Code: `index.html` around line 602 (facade), 641 (CTA), 695 (constant), 1261-1270 (embed logic). Tests: `tests/acceptance.homepage-test-run.spec.ts` (~189, 203, 212, 258, 1029, 1112) and `tests/portfolio.spec.ts` (~170, 187, 196).
1. Set the constant and update the two `href`s (FR-1, FR-4, FR-5).
2. Check the embed adds `title`, `allow`, `allowfullscreen` and handles focus (FR-2, FR-7).
3. Update the tests that assumed an empty ID; keep the no-request-before-click check.
4. `npm test` green (port 4173 only, never 4545); refresh `npm run screenshots` only if the showcase looks different.
