# Spec: Homepage redesign — "the page is a test run"

- Branch: `feature/homepage-test-run`
- Source of truth: `docs/specs/homepage-test-run.source.pdf` ("Especificação Completa v2", approved by Herbert, 2026-11-25, Portuguese). This spec restates it in English for the team. **If this spec and the PDF disagree on copy, tokens or behavior, the PDF wins** — flag the conflict to the Analyst.
- Copy rule: the English copy in section 5 below is approved verbatim. Nobody rewrites it. Any text change goes back to Herbert.

## 1. Context

`herbertph.com` is Herbert Parasio's executive/leadership portfolio (SQA Team Lead at BMM Testlabs). It is one static `index.html` (HTML + CSS + JS + i18n dictionary inline), tested with Playwright and deployed to GitHub Pages by `.github/workflows/deploy.yml` only when the suite passes on `main`. Visitors: hiring managers, founders who might hire him to test SaaS, the QA community.

The redesign keeps the existing identity (cream paper, big serif, mono, dark green + brick accents, no photos) and turns the page into a **test run of 7 tests**: as the visitor scrolls, each chapter of Herbert's story marks one test as passed in the fixed HUD and in the `herbert.spec.ts` panel. The PASS stamp only appears at the very end.

## 2. Scope

**In scope**
- Rewrite `index.html` in the new design, keeping the language system (EN/PT/ES/FR) and correct links.
- New section `#showcase` featuring the Unflaky video (typographic facade, embed only on click).
- Content corrections (section 6) on the page and in `resume.pdf`.
- Regenerate `resume.pdf` with the corrections.
- Update `tests/portfolio.spec.ts` (keep existing coverage + new tests).
- Screenshots: desktop light, desktop dark, mobile light, mobile dark.

**Out of scope**
- Changing hosting, `CNAME`, GitHub Pages settings, or the deploy workflow (beyond what the new tests strictly need).
- Any framework, bundler, build step, new runtime dependency or external JS library.
- A manual dark-mode toggle (dark mode follows the OS only).
- Photos or decorative images of any kind.
- Choosing the Unflaky video ID (constant ships empty).

## 3. Functional requirements

### Hard constraints
- **FR-0.1** Single static `index.html` with inline CSS and JS. Vanilla JS only. No new dependencies (only `@playwright/test` stays in `devDependencies`).
- **FR-0.2** Fonts from Google Fonts in **one** `<link>` with the three families, plus `preconnect`: Newsreader (400–700, italic 400 and 500), Archivo (400–700, `body` font), IBM Plex Mono (400–600).
- **FR-0.3** Do not touch `CNAME`. Do not change the deploy job.

### Page structure (in this order)
- **FR-1** Sections, in order, with these anchors:
  1. Hero with the `herbert.spec.ts` panel — `#top`
  2. Story, 5 chapters — `#story`
  3. How I Work, 4 steps — `#method`
  4. Evidence, numbers + proofs, with Toolbox at the end — `#evidence`
  5. Showcase, Unflaky video — `#showcase`
  6. Next — `#next`
  7. Sign-off with PASS card — `#signoff`
- **FR-2** Exactly one `<h1>` (hero). Sections use `<h2>`; chapters and cards use `<h3>`.

### The 7 tests
| # | Panel label | Passes when |
|---|---|---|
| 1 | Reads data before it judges · 2014 · Infoglobo / Grupo Globo | Chapter 01 enters the viewport |
| 2 | Builds software before it tests it · 2017 · Full-stack developer | Chapter 02 enters |
| 3 | Crosses an ocean and starts over · 2022 · NBCC Moncton, Canada | Chapter 03 enters |
| 4 | Learns to break it properly · 2024 · BMM, intern to QA Engineer | Chapter 04 enters |
| 5 | Verifies what regulators sign off on · 2026 · SQA Team Lead, 11 testers | Chapter 05 enters |
| 6 | Certified, not just experienced · ISTQB CTFL, 2026 | `#evidence` enters |
| 7 | Teaches the next QAs to think · Next chapter, Unflaky | `#next` enters |

(Separators in the panel labels are presentation; keep the three parts: name, year, context.)

### HUD (fixed top bar)
- **FR-3** Fixed bar visible during the whole scroll containing: `HERBERT PARASIO · SQA TEAM LEAD`; a progress track; a counter starting `RUN 0/7` and ending `7 / 7 PASSED`; anchor nav `Story`, `Method`, `Evidence`, `Video` (→ `#showcase`), `Next`, `Sign-off`; and the language selector `EN PT ES FR` on the right, without breaking the bar's layout.
- **FR-4** Progress is exposed as `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="7"`, `aria-valuenow` updated on each pass.
- **FR-5** The count never goes backwards: a passed test stays passed for the rest of the page session (scrolling up does not un-pass).

### `herbert.spec.ts` panel (hero, right column on desktop)
- **FR-6** Dark panel (`--panel`) with header `herbert.spec.ts · TEST RUN`, list `#specList` with the 7 tests, and footer status `#specStatus`.
- **FR-7** Every item starts pending; it gets a green check when its trigger fires. Item 5 may be visually highlighted from the start.
- **FR-8** `#specStatus` starts `RUNNING`; when all 7 pass it shows `ALL PASSING` with a final check.

### Story spine
- **FR-9** Vertical line `#spine` left of the chapters with fill `#spineProgress` that follows scroll inside `#story`, computed in a passive scroll listener with `requestAnimationFrame`. It ends at chapter 05.
- **FR-10** Each chapter has `data-chapter` 0–4 and gets class `in` when it enters the viewport.
- **FR-11** Chapter 05 uses the dark treatment: class `chapter-dark`, background `--green-deep`.

### Motion
- **FR-12** `IntersectionObserver` triggers: chapters `threshold: 0.28`; `#evidence`, `#next` and `#passCard` `threshold: 0.3`.
- **FR-13** `scroll-behavior: smooth` for anchor clicks, except under `prefers-reduced-motion: reduce`, where smooth scroll is off and animations are instant. In reduced motion, scrolling to the end must still mark all 7 tests.
- **FR-14** PASS card `#passCard` (background `--pass-bg`) gets its visible class only when it enters the viewport. No PASS visible at the top of the page.

### Showcase (Unflaky video)
- **FR-15** `#showcase` sits between Evidence and Next, treated as the centerpiece: large 16:9 player, explanation, 6 agents, 3 blocks, YouTube CTA. Stacks to one column below 920px (player on top).
- **FR-16** At the top of the script: `const UNFLAKY_VIDEO_ID = "";`.
- **FR-17** The 16:9 frame (`--green-deep` background, `--gold` top rule) is a **pure HTML/CSS typographic poster** — no `<img>`, no thumbnail fetch — with an accessible play control.
- **FR-18** The facade is a real `<a>` (or `<button>`) with `aria-label="Watch the Unflaky tool walkthrough on YouTube"` and visible focus. Without JS it is a plain link to `https://youtube.com/@unflaky`.
- **FR-19** Click with empty ID → opens `https://youtube.com/@unflaky` in a new tab (`target="_blank" rel="noopener"`). Click with an ID set → replaces the facade with an `<iframe>` of `https://www.youtube-nocookie.com/embed/${UNFLAKY_VIDEO_ID}?autoplay=1`. No third-party script or request before the click.

### Sign-off links
- **FR-20** Four links, all external, `target="_blank" rel="noopener"`:
  - LinkedIn `https://linkedin.com/in/herbert-cunha` (label `/IN/HERBERT-CUNHA`)
  - GitHub `https://github.com/Herbertph` (label `@HERBERTPH`)
  - YouTube `https://youtube.com/@unflaky` (label `@UNFLAKY`)
  - X `https://x.com/herbertbuilds` (label `X @HERBERTBUILDS`)
- **FR-21** Every link points to the specific destination its text promises. No link to a bare GitHub root when it promises a project. LinkedIn is `/in/herbert-cunha` everywhere (page and resume).

### i18n
- **FR-22** Keep the current mechanism: `data-i` / `data-ihtml` keys, `?lang=` param, `<html lang>` updated, unknown language → English. EN is default (no `?lang` in URL).
- **FR-23** Every new phrase gets its own key in all 4 languages; no empty key in any language. EN copy is the reference; PT/ES/FR keep meaning and executive tone.
- **FR-24** Not translated: proper names, `BMM Testlabs`, `NBCC`, `ISTQB CTFL`, `CTAL`, `Unflaky`, the 6 agent names, `herbert.spec.ts`.
- **FR-25** Tab title and meta description (and Open Graph) are keyed per language. EN title: `Herbert Parasio · SQA Team Lead`.

### Content corrections (page + resume)
- **FR-26** CTFL: "ISTQB CTFL, certified 2026" / "Certified, not just experienced". Remove "scheduled" and "exam scheduled, Aug 2026".
- **FR-27** CTAL Test Manager only as "coming soon" or "incoming", exam planned for 2027. Never "studying", "study" or "em estudo" for CTAL.
- **FR-28** Forbidden for Herbert's/BMM team work: "certify", "certifies", "approve", "reject". Use "verify", "verifies", "verification". "certifies" may appear only attributed to Compliance.
- **FR-29** Removed completely: the "FLUXO" card marked "LIVE" (404 link, "SUITE PASSING" badge), and the empty grey 4th cell of the evidence grid. Evidence grid = exactly 5 metrics + 3 cards.
- **FR-30** The Story shows the years 2014, 2017, 2022, 2024, 2026.

### Resume
- **FR-31** `resume.pdf` regenerated with the same corrections: CTFL certified 2026; CTAL only as next step planned for 2027; LinkedIn `/in/herbert-cunha`; current role SQA Team Lead since May 2026, 11 testers; 95% first-pass compliance and 98% on-time delivery (last 6 months); verification (never certification) language for BMM. If there is no resume source, create a clean typographic HTML/CSS source and print it with Playwright `page.pdf({ format: 'Letter' })`, keeping the current executive layout.

### Design system
- **FR-32** Use exactly these CSS variables.

Light (default):

| Var | Value | Use |
|---|---|---|
| `--paper` | `#F6F1E7` | page background |
| `--paper-2` | `#EFE7D8` | secondary background, bands |
| `--ink` | `#17130B` | main text |
| `--ink-soft` | `#4A4234` | supporting text |
| `--ink-faint` | `#7A6F5C` | captions, metadata, footer |
| `--line` | `#DCD0BA` | light rules/borders |
| `--line-strong` | `#B9A888` | stronger borders |
| `--green` | `#1C4D2E` | main green, evidence numbers, PASS |
| `--green-bright` | `#2E7D46` | positive states, progress |
| `--green-deep` | `#10281A` | dark chapter, video section |
| `--brick` | `#BC4B1F` | kickers, markers, details |
| `--brick-soft` | `#F3D9C8` | soft brick highlight background |
| `--gold` | `#C79A3B` | video badge, premium details |
| `--card` | `#FFFDF7` | card background |
| `--panel` | `#17130B` | `herbert.spec.ts` panel background |
| `--panel-ink` | `#F2EBDA` | text in dark panel |
| `--panel-faint` | `#A99F88` | secondary text in panel |
| `--pass-bg` | `#1C4D2E` | final PASS card background |
| `--shadow` | `0 18px 40px rgba(23, 19, 11, .10)` | cards and panel |
| `--radius` | `14px` | cards |

Dark (`prefers-color-scheme: dark`, automatic, no toggle):

| Var | Value | Var | Value |
|---|---|---|---|
| `--paper` | `#14110B` | `--green` | `#7FC493` |
| `--paper-2` | `#1B1710` | `--green-bright` | `#9AD6AC` |
| `--ink` | `#F0E9D8` | `--green-deep` | `#0C1F13` |
| `--ink-soft` | `#C9BFA9` | `--brick` | `#E88A5F` |
| `--ink-faint` | `#948A74` | `--brick-soft` | `#3A2317` |
| `--line` | `#332C1E` | `--gold` | `#D9B45F` |
| `--line-strong` | `#55492F` | `--card` | `#1E1A12` |
| `--panel` | `#0D0B07` | `--pass-bg` | `#1E5C36` |
| `--panel-ink` | `#F2EBDA` | `--panel-faint` | `#8E8471` |
| `--shadow` | `0 18px 40px rgba(0, 0, 0, .45)` | | |

- **FR-33** Typography: Newsreader for H1–H3, big numbers, pull quotes; Archivo for body/UI; IBM Plex Mono for HUD, panel, kickers, labels, years, footer. Fluid sizes with `clamp()`.
- **FR-34** Layout: centered content width, generous side padding. Hero two columns on desktop (text left, panel right); one column on mobile (panel below text). Breakpoints to keep: 1180, 1000, 920, 900, 860, 760, 720, 640, 560, 480px. No horizontal scroll at 390px. 100% typographic — no images.

### Accessibility and performance
- **FR-35** Contrast of the tokens preserved in light and dark. Visible focus on links, buttons, language selector and video facade. Anchor nav works by keyboard. HUD readable at 200% zoom. No external images, no frameworks, YouTube embed only after click.

## 4. Approved copy (English, verbatim)

### Hero
- Label: `HERBERT PARASIO · SQA TEAM LEAD`
- Sub-label: `herbert.spec.ts · TEST RUN IN PROGRESS`
- H1: **Every release tells a story. I make sure it ends in a pass, not a post-mortem.**
- Lead: I'm Herbert Parasio, SQA Team Lead at BMM Testlabs in Dieppe, Canada. My team verifies casino and slot games against the math model and the rules of 10 jurisdictions, before Compliance decides whether they can go to market. This page is the run. Scroll, and each chapter passes.
- Cue: `SCROLL TO RUN THE SUITE · 7 TESTS`

### Story opening
- Kicker: `THE STORY · FIVE CHAPTERS, ONE THREAD`
- H2: **Most testers learn to test. I learned everything around the test first.**
- Body: Data taught me patterns. Code taught me where things hide. A new country taught me to start from zero. Put together, that is why I find the one bug that matters, not the thirty that don't.

### Chapter 01 · 2014 · THE PATTERN EYE
- H3: Before I tested software, I read numbers for a living.
- Body: I started as a junior data analyst at Infoglobo, Grupo Globo, then moved to the Lojas Americanas group. Two years of dashboards and anomalies teaches you something no test course does: systems confess in their data first. The failure is usually visible in the numbers long before anyone files a bug.
- Line: `SKILL ACQUIRED:` Reading evidence before forming an opinion

### Chapter 02 · 2017 · THE BUILDER YEARS
- H3: Then I spent four years on the other side of the bug report.
- Body: As a full-stack developer at Brasil Center, I shipped Java, Spring Boot, React and Vue in production. I wrote the race conditions, the null pointers, the "works on my machine" deploys. So today, when I test, I'm not guessing where software breaks. I've lived there.
- Line: `SKILL ACQUIRED:` Knowing where developers hide the bodies

### Chapter 03 · 2022 · THE RESTART
- H3: New country, new language at work, back to the classroom.
- Body: I moved to Canada and studied IT Software Development at NBCC Moncton, graduating in 2024. Starting over in your thirties, in a second language, does one useful thing to a tester: it kills the fear of the unknown system. Every codebase is just another country. You learn its rules, then you test whether it follows them.
- Line: `SKILL ACQUIRED:` Walking into any system like I belong there

### Chapter 04 · 2024 · BREAKING IT PROPERLY
- H3: An internship at BMM turned into the craft.
- Body: I joined BMM Testlabs as an intern in April 2024 and was a QA Engineer by June. There I learned regulated testing: verify paytables, RTP and payouts against the math model, jurisdiction by jurisdiction. I automated with Playwright and Postman in CI and built an AI-assisted knowledge base to speed up root-cause analysis and catch duplicate defects before they wasted anyone's time.
- Line: `RESULT:` Promoted twice in two years

### Chapter 05 · 2026 · THE VERIFICATION DESK (dark chapter)
- H3: Now I lead the team that verifies what regulators will sign.
- Body: Since May 2026 I lead 11 testers as SQA Team Lead. We verify around 15 casino games a month against the regulations of 10 jurisdictions, and when we find a problem, we send it back to the studio and work with them until it's right. That partnership loop, verify, report, re-verify, is the job. In 2026 I also passed the ISTQB CTFL, after two weeks of study. Next up: the CTAL Test Manager, coming soon.
- Line: `LAST 6 MONTHS:` 95% first-pass compliance · 98% on-time delivery

Exact names: Infoglobo / Grupo Globo, Lojas Americanas, Brasil Center, NBCC Moncton, BMM Testlabs, Dieppe.

> Note: "after two weeks of study" refers to the CTFL and is approved. The "no study/studying" rule (FR-27) applies to the CTAL only.

### How I Work (`#method`)
- Kicker: `HOW I WORK`
- H2: **A bug is a story with a missing chapter. My job is to find which one.**
- Lead: Four moves, in order, on every game and every system. The order matters more than the tools.
- STEP 01 · **Read the rules first.** The math model and the jurisdiction's regulation are the spec. If it isn't written there, it isn't a defect yet, it's a question.
- STEP 02 · **Follow the money.** Paytables, RTP, payouts. In regulated gaming, the defect that matters is the one that pays wrong. Test the happy path last.
- STEP 03 · **Automate the repeatable.** Playwright and Postman suites in CI run the checks humans get bored with, so humans can spend their attention on judgement.
- STEP 04 · **Report so it gets fixed.** Root cause, evidence, duplicate check against the knowledge base. A report a developer can act on in one read is a defect half-fixed.
- Callout: **IMPORTANT DISTINCTION.** My team verifies. Compliance certifies. We don't approve or reject games for market, and we don't pretend to. We verify them against the rules and hand Compliance a result they can trust. Getting that boundary right is most of leadership in a regulated lab.

> Note: the callout's "approve or reject" is a negation and "certifies" is attributed to Compliance — both allowed by FR-28. Tests must not flag this paragraph.

### Evidence (`#evidence`)
- Metrics (exactly 5): `11` TESTERS LED AT BMM TESTLABS · `10` JURISDICTIONS VERIFIED AGAINST · `~15` CASINO GAMES VERIFIED PER MONTH · `95%` FIRST-PASS COMPLIANCE, LAST 6 MONTHS · `98%` ON-TIME DELIVERY, LAST 6 MONTHS
- H2: **Don't take my word for it. Take the numbers.**
- Cards (exactly 3):
  - AUTOMATION · **Suites that run while I sleep.** Playwright and Postman checks wired into CI during my QA Engineer years, covering the repetitive verification so the team's eyes stay on edge cases and judgement calls.
  - KNOWLEDGE · **An AI-assisted defect memory.** A knowledge base that speeds up root-cause analysis and flags duplicate defects early, so studios don't get the same finding twice and testers don't re-investigate solved problems.
  - CERTIFICATION · **ISTQB CTFL, certified 2026.** Passed after two weeks of study using a method I built for dry syllabi. CTAL Test Manager: coming soon, exam planned for 2027.

### Toolbox (end of Evidence)
- Kicker: `TOOLBOX · WHAT'S ACTUALLY ON THE DESK`
- Chips (exactly, in order): Playwright · Postman · Java · Spring Boot · React · Vue · CI Pipelines · Test Design (Copeland) · RTP / Paytable Verification · Root-Cause Analysis · AI-Assisted QA · Team Leadership

### Showcase (`#showcase`)
- Kicker: `FEATURED BUILD · WATCH THIS FIRST · ★ THE HIRE-ME PIECE`
- H2: **Don't just read that I test. Watch the tool I built do it.**
- Lead: This is Unflaky, the QA tool I created. In the video I walk through what it does, how it thinks, and why I built it. If you watch one thing on this page, watch this. It's the clearest proof of how I work: I don't just find bugs, I build the system that finds them.
- Player caption: `unflaky · tool walkthrough · @UNFLAKY · YOUTUBE`
- Player description: Unflaky in action: a QA team in a tool. See it read a product, create the tests, run them, and turn the result into a report a client can act on.
- Agents label + list: `6 AGENTS:` QA MANAGER · FUNCTIONAL QA · AUTOMATION QA · API QA · REGRESSION QA · MOBILE / UI QA
- Blocks:
  - 01. PLANS · **Reads the product first.** It analyses the repo and the product, then writes the test plan and test cases, using proven test-design techniques, not guesswork.
  - 02. CREATES & RUNS · **Creates and runs the tests.** Functional, automation, API, regression and mobile/UI checks, the work of a full QA team, run by specialised agents.
  - 03. REPORTS · **Delivers a report you can hire on.** The output is a clear, client-ready test report. It opens issues with evidence, and never quietly fixes code, testing stays honest and independent.
- Quote: "This guy doesn't just test software. He had an idea for how testing should work, and he built it." That's the reaction this video is here to create, and it's why founders hire me to test SaaS, especially AI-built SaaS, before it breaks in production.
- CTA: **Watch the video on YouTube (@unflaky)** → `https://youtube.com/@unflaky`

(The PDF's "6 AGENTES" label is Portuguese residue; the EN label is `6 AGENTS`.)

### Next (`#next`)
- Kicker: `THE NEXT CHAPTER · WRITING ITSELF NOW`
- H2: **The run doesn't end at my desk. Next, I teach QAs to think, not just to click.**
- Body: A junior once found 30 bugs in a day. I found 1, and mine was the only one that mattered. That gap isn't talent, it's thinking, and thinking can be taught. That's what I'm building next.
- Items:
  - 2027 · **Unflaky, Quality Lab.** A QA company focused on testing SaaS, especially AI-built SaaS, before it breaks in production.
  - WEEKLY · **@unflaky on YouTube.** QA in practice, leadership and automation, in Portuguese, for QAs who want to become senior, lead and freelance.
  - COMING SOON · **CTAL Test Manager.** Incoming: the next certification after the CTFL, exam planned for 2027.

### Sign-off (`#signoff`)
- Stamp: `✓ PASS`
- H2: **Run complete. Let's verify yours before your users do.**
- Body: If you're shipping software that has to be right, a game, a SaaS, an AI-built product one bad release away from losing its users, this is the conversation I have every day. Start it here.
- Links: LinkedIn `/IN/HERBERT-CUNHA` · GitHub `@HERBERTPH` · YouTube `@UNFLAKY` · X `@HERBERTBUILDS` (URLs in FR-20)
- Footer: `HERBERT PARASIO · SQA TEAM LEAD · DIEPPE, CANADA · EN PT ES FR · THE RUN ABOVE IS THE REAL TIMELINE, 2014–2026`

## 5. Acceptance criteria

**Structure and run**
- **AC-1** Given a fresh load at the top, When the page renders, Then the fixed HUD shows `RUN 0/7`, `aria-valuenow="0"`, `#specStatus` reads `RUNNING`, all 7 `#specList` items are pending, and no PASS stamp is visible.
- **AC-2** Given the page, When I list sections, Then `#story`, `#method`, `#evidence`, `#showcase`, `#next`, `#signoff` exist in that DOM order after the hero, and there is exactly one `<h1>`.
- **AC-3** Given a fresh load, When I scroll to the bottom, Then all 7 items in `#specList` are marked passed, the HUD shows `7 / 7 PASSED` with `aria-valuenow="7"`, and `#specStatus` contains `ALL PASSING`.
- **AC-4** Given chapter 01 only has entered the viewport, Then exactly item 1 is passed and the counter is 1/7 (each trigger maps to its own item per the table in section 3).
- **AC-5** Given I scrolled to the bottom, When I scroll back to the top, Then the counter is still 7/7 and no item reverts to pending.
- **AC-6** Given `prefers-reduced-motion: reduce`, When I scroll to the bottom, Then all 7 tests are passed and `html` computed `scroll-behavior` is not `smooth`.
- **AC-7** Given a fresh load, Then `#passCard` does not have its visible class; When `#signoff` is scrolled into view, Then it does.
- **AC-8** Given I scroll through `#story`, Then `#spineProgress` fill grows (larger at chapter 05 than at chapter 01), and each `[data-chapter]` (0–4) gets class `in` once seen; chapter 05 has class `chapter-dark`.
- **AC-9** Given the HUD, When I activate `Video` (mouse or keyboard Enter), Then the page navigates to `#showcase`; the same holds for Story, Method, Evidence, Next, Sign-off.

**Showcase**
- **AC-10** Given `UNFLAKY_VIDEO_ID = ""`, Then `#showcase` is visible, contains a link to `https://youtube.com/@unflaky`, the facade is an `<a>`/`<button>` with `aria-label="Watch the Unflaky tool walkthrough on YouTube"`, there is no `<iframe>` and no `<img>` in the section, and no request to youtube/ytimg/google video domains was made on load.
- **AC-11** Given an empty ID, When I click the facade, Then a new tab to `https://youtube.com/@unflaky` opens and the facade stays in place.
- **AC-12** Given the ID set to a value (test can override the constant), When I click the facade, Then it is replaced by an `<iframe>` whose src is `https://www.youtube-nocookie.com/embed/<id>?autoplay=1`.
- **AC-13** Given viewport width < 920px, Then the player is stacked above the explanation in one column.

**Content and corrections**
- **AC-14** Given the EN page, Then the H1 equals the approved H1 and the visible copy of every section matches section 4 verbatim.
- **AC-15** Given the EN page text, Then it contains `certified 2026`, does not contain `scheduled` nor `studying` (case-insensitive), and contains no phrase claiming Herbert/his team certifies, approves or rejects games (the Compliance callout is the only allowed occurrence of `certifies`).
- **AC-16** Given the evidence section, Then it has exactly 5 metrics and exactly 3 cards, each non-empty; no "FLUXO" card, no "LIVE" / "SUITE PASSING" badge anywhere.
- **AC-17** Given the Story, Then the years 2014, 2017, 2022, 2024, 2026 are all visible.
- **AC-18** Given the sign-off, Then the 4 links point to `https://linkedin.com/in/herbert-cunha`, `https://github.com/Herbertph`, `https://youtube.com/@unflaky`, `https://x.com/herbertbuilds`, each with `target="_blank"` and `rel` containing `noopener`; and no link anywhere uses `/in/herbertph`.
- **AC-19** Given any external link on the page, Then it has `rel` containing `noopener` (kept).

**i18n (kept + extended)**
- **AC-20** Given no `?lang`, Then `<html lang="en">` and the title is `Herbert Parasio · SQA Team Lead`.
- **AC-21** Given I click PT/ES/FR, Then the page translates, `<html lang>` updates and the URL gets `?lang=<code>`; clicking EN removes the param.
- **AC-22** Given `?lang=pt|es|fr` on first load, Then the page loads translated, including title and meta description.
- **AC-23** Given `?lang=xx` (unknown), Then the page falls back to English.
- **AC-24** Given each of the 4 languages, Then every `[data-i]`/`[data-ihtml]` element has non-empty text, and the terms in FR-24 appear untranslated.
- **AC-25** Given PT/ES/FR, Then the forbidden-word rule (FR-28) and CTAL rule (FR-27) also hold in their translated equivalents (e.g. no "estudando"/"agendado" for CTAL/CTFL in PT).

**Layout, theme, a11y**
- **AC-26** Given a 390px-wide viewport, Then there is no horizontal scroll and the HUD (with language selector) fits without overlap; the hero panel sits below the hero text.
- **AC-27** Given `prefers-color-scheme: dark`, Then `--paper` resolves to `#14110B` and the other tokens to the dark table; in light, `--paper` is `#F6F1E7`.
- **AC-28** Given keyboard navigation, Then links, HUD buttons, language buttons and the video facade show a visible focus indicator.
- **AC-29** Given 200% browser zoom on desktop, Then the HUD text stays readable (no clipped/overlapping items).
- **AC-30** Given the page loads, Then no `<img>` elements exist and no requests go to domains other than the page origin and Google Fonts.

**Resume and pipeline**
- **AC-31** Given the new `resume.pdf`, Then its text contains "SQA Team Lead", "11", "95%", "98%", "CTFL" with 2026 as certified, CTAL with 2027, `linkedin.com/in/herbert-cunha`, and does not contain "scheduled", "studying", nor BMM work described as certifying.
- **AC-32** Given `npm test`, Then the full suite (chromium + mobile projects) passes locally and in the PR workflow; `CNAME` and the deploy job are unchanged.

## 6. Assumptions (Herbert to confirm in review)
1. Branch is `feature/homepage-test-run` (the PDF suggests `redesign/homepage-test-run`; it allows an equivalent name — our team convention is `feature/…`).
2. PT, ES and FR translations are written by the team following the EN copy; Herbert reviews them in the PR.
3. The resume content (education, older jobs, etc.) beyond the listed corrections is taken from the current `resume.pdf`. Its HTML source will live in the repo (e.g. `resume/resume.html`) plus a small script to regenerate the PDF with Playwright; that source is published by Pages too, which is harmless.
4. Screenshots of the 4 combinations are committed under `docs/screenshots/homepage-test-run/` and linked in the PR (GitHub CLI cannot attach images directly).
5. `UNFLAKY_VIDEO_ID` ships empty until Herbert sends the video ID; the facade then opens the channel.
6. "HUD readable at 200% zoom" is checked visually (and by a test at 640px-equivalent width), not pixel-measured.
7. Herbert merges the PR himself; the team never merges.

## 7. Technical notes

**Where it fits**
- `index.html` (~36 KB today) is the only page. Current IDs (`#run`, `#rows`, `#summary`, `#practice`, `#toolbox`, `#contact`, `#today`) are replaced by the new structure. Reuse the existing i18n engine (`T` dictionary, `apply(lang)`, `#langs` buttons, `?lang` handling around lines 480–550) — extend the dictionary, don't rewrite the mechanism.
- `tests/portfolio.spec.ts` (96 lines): keep the existing tests for default English, title, contact links, `noopener`, phone viewport, language switching, `?lang`, fallback, no empty keys; update section ids and panel selectors.
- `playwright.config.ts` already runs chromium + iPhone 13 on port 4173 via `serve`. Tests must not use port 4545.
- The deploy uploads the whole repo root to Pages, so anything committed is public. No secrets.

**Task list (developer)**
1. CSS tokens (light + dark) from FR-32, fonts link (FR-0.2), base typography and breakpoints. Verify: page renders in both schemes.
2. HTML skeleton in section order with exact EN copy (section 4), headings hierarchy, `data-i`/`data-ihtml` keys on every string. Remove FLUXO card and empty cell.
3. HUD with nav, progressbar ARIA, counter and integrated language selector; check 390px and 200% zoom.
4. `herbert.spec.ts` panel, IntersectionObservers (thresholds FR-12), monotonic run state, spine with rAF + passive listener, late PASS card, reduced-motion handling.
5. `#showcase` with typographic facade, `UNFLAKY_VIDEO_ID` logic (FR-16–19), stacking below 920px.
6. PT/ES/FR dictionary for every key, titles and meta/OG per language.
7. Resume: HTML source + Playwright print script → new `resume.pdf` (FR-31).
8. Update `tests/portfolio.spec.ts` for AC-1…AC-32 coverage that is automatable; `npm test` green on both projects.
9. Screenshots (desktop/mobile × light/dark) into `docs/screenshots/homepage-test-run/`. Update `README.md` if commands change.
