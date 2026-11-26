# Review: resume-refresh

- **Verdict:** APPROVED
- **Commit reviewed:** f6ee305 (production change in 9ab5ab6 and 11b7745)
- **Spec:** docs/specs/resume-refresh.md
- **Build and tests (run by the reviewer):** `npx playwright test --reporter=line` (chromium + mobile) → 168 passed, 0 failed, 4 skipped (1.4m). Resume regenerated to a temp file with the same Chromium print settings as `scripts/build-resume.mjs` → 98502 bytes, identical in size to the committed `resume.pdf`, 2 Letter pages.
- **QA report:** agrees with my run (172 tests, 168 passed, 4 pre-existing skips).

## Requirements coverage
| AC | Implemented in | Tested by | Status |
|---|---|---|---|
| AC-1 | resume/resume.html:84-272 | TC-1, TC-11; reviewer script: every sentence of spec section 4 found in the rendered text | OK |
| AC-2 | resume/resume.html | TC-2 | OK |
| AC-3 | resume/resume.html | TC-3 | OK |
| AC-4 | resume/resume.html:93, 106 | TC-4 | OK |
| AC-5 | resume.pdf (changed with the HTML in 11b7745) | TC-5; reviewer regeneration matches | OK |
| AC-6 | resume/resume.html:83-87, 205 | TC-6; PDF `/URI` entries: mailto, herbertph.com, linkedin.com/in/herbert-cunha, github.com/Herbertph, unflakyqa.com | OK |
| AC-7 | resume/resume.html print rules (`break-after:avoid`, `break-inside:avoid`, explicit page break) | TC-7, TC-12; reviewer measurement: page 1 content ends at 987px, footer at 1009px of 1056px; page 2 ends at 846px | OK |
| AC-8 | tests/portfolio.spec.ts and the homepage suite unchanged | full suite | OK |
| AC-9 | /resume.pdf path unchanged | TC-9 | OK |

## Blockers
None.

## Should fix
- R-1: Both page footers still read "Herbert Parasio · SQA Team Lead" while the headline is now "Senior QA Analyst". `resume/resume.html:169`, `resume/resume.html:276`. The footer is not in spec section 4 (FR-1 says "exactly the content of section 4"), and a job-application resume carries two different titles. Herbert should decide: keep it, switch it to the headline, or drop the role from the footer.

## Suggestions
- R-2: The CTFL and CTAL rows use empty `<div></div>` cells only to fill the grid's date column. `resume/resume.html:250`, `resume/resume.html:257`. A single-column modifier class would avoid empty markup.
- R-3: The contact line uses a `<br>` where the spec has a pipe, and the credential lines use a line break where the spec has an em dash. A visual choice, already noted by QA; the content and order are unchanged.

## Security
Static print source: no scripts, no input, no external assets. The phone number and email stay public by spec assumption 3, as before. `git log -p main..HEAD` shows no secrets. No dependency changes.

## Notes
- The previous review's R-3 (homepage-test-run: the FluxoBjj project linked to the GitHub root) no longer applies: the "Selected work" section was removed with this content.

## Not reviewed
- Herbert's original resume PDF on Google Drive (private): I reviewed against the text in spec section 4.
- A rendered image of the PDF pages: no PDF renderer was available to me. I checked the layout from the print-emulated HTML geometry and from regenerating the PDF, and relied on QA's rendered page inspection for the visual.
