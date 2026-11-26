# Spec: Resume refresh

- Branch: `feature/resume-refresh`
- Source: Herbert's new resume "Herbert Parasio - Senior QA Analyst.pdf" (Google Drive, private; its text is reproduced in section 4 below, which is the source of truth for the team).
- Decisions approved by Herbert on 2026-11-25: option B (move the new content into the existing `resume/resume.html` layout and regenerate `resume.pdf`), plus the four edits listed in FR-3.

## 1. Context

`https://herbertph.com/resume.pdf` is generated from `resume/resume.html` with `npm run resume` (`scripts/build-resume.mjs`). Herbert wrote a new, more detailed resume aimed at job applications (Senior QA Analyst headline, relocation to British Columbia, new projects Unflaky and Lamp). The site must serve this new content, in the current typographic layout, while keeping the content rules approved in the homepage redesign (`docs/specs/homepage-test-run.md`, FR-26 to FR-28, FR-31).

## 2. Scope

**In scope**
- Replace the content of `resume/resume.html` with the content in section 4.
- Regenerate `resume.pdf` with `npm run resume` and commit it.
- Keep the current visual layout, fonts and print format of the resume (adjust spacing only as needed to fit the longer content cleanly).

**Out of scope**
- Any change to `index.html` or the homepage copy.
- A new resume design, photos or images.
- Changing tests other than what is strictly needed (see AC-8).

## 3. Functional requirements

- **FR-1** `resume/resume.html` contains exactly the content of section 4, in that order, with the edits of FR-3 already applied (section 4 already includes them).
- **FR-2** `resume.pdf` is regenerated from that source; the PDF text matches the HTML.
- **FR-3** Edits Herbert approved over his original file:
  1. "95% first-pass approval rate" → "95% first-pass compliance rate".
  2. "through the full certification cycle" → "through the full verification cycle".
  3. Add the CTAL line to Education & Certification: "ISTQB Certified Tester, Advanced Level Test Manager (CTAL-TM) — coming soon, exam planned for 2027".
  4. Company name is "BMM Testlabs" everywhere (the original says "BMM Test Labs").
  The company description "Global testing and certification lab for the gaming industry" and "a global game certification lab" stay as written: they describe BMM, not Herbert's team's work.
- **FR-4** Headline is "Senior QA Analyst | ISTQB CTFL Certified — Game QA, Test Automation & AI-Assisted Testing". The current role "SQA Team Lead" remains in the experience section.
- **FR-5** Links in the header are clickable in the PDF: `https://herbertph.com`, `https://linkedin.com/in/herbert-cunha`, `https://github.com/Herbertph`, `mailto:herbert.parasio@gmail.com`; the Unflaky project links to `https://unflakyqa.com`. No link points to a generic root when it promises a specific page.
- **FR-6** Content rules stay: no "scheduled", no "studying"; no "certify", "certifies", "approve", "reject" for Herbert's or his team's work.
- **FR-7** Fits on as few Letter pages as the content allows (expected 2), with no section heading orphaned at the bottom of a page and no line cut at page breaks.

## 4. Resume content (verbatim, edits applied)

**Header**
- Name: Herbert Parasio
- Headline: Senior QA Analyst | ISTQB CTFL Certified — Game QA, Test Automation & AI-Assisted Testing
- Contact line: Moncton, New Brunswick, Canada | Open to relocation to British Columbia | (506) 897-4188 | herbert.parasio@gmail.com | herbertph.com | linkedin.com/in/herbert-cunha | github.com/Herbertph

**Summary**
I test games for a living and automate the parts that repeat. I lead a team of 11 testers at a global game certification lab, where we put around 15 casino titles a month through manual, exploratory and regression testing across desktop and mobile, and every bug report has to be clear enough for a client studio to reproduce without a call. I build automated checks in Playwright that run in CI on every build, and I build AI tooling for QA: a tool at work that surfaces past root causes and flags likely duplicate bug reports, and on my own time Unflaky, a working pipeline of AI QA agents that plans, writes and runs tests (including Playwright automation) and reports release readiness, so I care less about AI hype and more about which tools actually save testers time. Before QA I spent four years as a developer, and I script in C#, Python and JavaScript. ISTQB CTFL certified.

**EXPERIENCE**

BMM Testlabs — Global testing and certification lab for the gaming industry: 500+ employees across 13+ countries, testing casino games and gaming systems for studios worldwide.

*SQA Team Lead* · 05/2026 — Present · BMM Testlabs — Dieppe, Canada
Tags: Game testing · Build verification · Bug triage · Quality metrics · JIRA · Confluence · Playwright
Held a 95% first-pass compliance rate and 98% on-time delivery over the last six months across an average of 15 game titles a month, leading and mentoring a team of 11 QA testers. Run build verification and smoke testing on every new client build, then a full ~300-case cycle; each returning build is re-tested against previously failed and impacted areas (~50, then ~20, then ~10 cases) so releases move fast without losing coverage. Decide with clients and QA management what each title needs tested and how deeply, based on risk, and turn game rules and design documents into test plans with full requirement-to-test traceability. Cut average bug triage turnaround from 3 days to under 24 hours by standardising how the team writes bug reports: clear reproduction steps, evidence and severity, followed through to verification in JIRA. Track and report team quality metrics (first-pass rate, on-time delivery, triage turnaround) to clients and management, and built the team's QA operations app in JavaScript and Node.js to replace spreadsheet tracking. Onboard new testers to independent work in 3 weeks and guide the team on test design, exploratory testing and investigation. Helped add weekend-long endurance runs to the test protocol after a memory-accumulation crash surfaced only after days of continuous play, so long-running issues are caught before release.

*QA Engineer* · 06/2024 — 05/2026 · BMM Testlabs — Moncton, Canada
Tags: Playwright · JavaScript · TypeScript · Postman · GitHub Actions · Node.js · Docker · SQL · JIRA
Tested casino and slot games through the full verification cycle on desktop and mobile, including iOS and Android devices, with manual, exploratory and regression testing of gameplay, math and payouts. Designed and maintained automated UI test suites in Playwright covering 20+ critical user flows, run in CI/CD with GitHub Actions on every build, reducing manual regression effort by ~30%. Built an internal AI-assisted knowledge base that retrieves prior root-cause analysis and flags likely duplicate bug reports, reducing repeat investigation time across the team. Wrote and tracked 150+ clear, reproducible bugs in JIRA through to verification, contributing to a 20% reduction in critical production defects. Tested backend services with Postman across 100+ endpoints and data scenarios, and used SQL to validate game and system data across environments. Created test cases aligned with ISTQB CTFL principles, improving coverage and increasing execution efficiency by 25%.

*Quality Assurance Intern* · 04/2024 — 06/2024 · BMM Testlabs — Moncton, Canada
Supported game testing and built foundations in test design and manual execution; promoted to QA Engineer after two months.

*Full Stack Developer* · 08/2017 — 07/2021 · Brasil Center Comunicações — Rio de Janeiro, Brazil
BPO and telecom services company, ~3,000 employees, supporting customer service and analytics for major Brazilian telecoms.
Tags: Java · Spring Boot · React · Vue.js · MySQL · Docker · GitHub Actions · Git
Designed, developed, tested and maintained 5+ internal web applications in a small Agile team, front end to database. Implemented CI/CD pipelines with GitHub Actions and Docker, cutting deployment time from ~2 hours to ~15 minutes and enabling zero-downtime releases.

*Data Analyst* · 08/2016 — 08/2017 · Seller Magazine (Lojas Americanas Group) — Rio de Janeiro, Brazil
Tags: Python · PostgreSQL · SQL Server · Tableau
Wrote Python and SQL analysis and Tableau dashboards for 80+ store locations, contributing to a 15% revenue increase; cut weekly reporting prep by ~30% and manual errors by 25%.

*Jr. Data Analyst* · 08/2014 — 08/2016 · Infoglobo (Grupo Globo) — Rio de Janeiro, Brazil
Tags: Python · PL/SQL · VBA
Automated reporting workflows in Python over datasets of 500K+ records, cutting processing from 6 hours to 1 hour per cycle.

**AI TOOLING PROJECTS**

*Unflaky Quality Lab — AI QA agent pipeline* · Working · unflakyqa.com
Tags: Multi-agent LLM pipeline · Playwright · API testing · Cross-device UI testing · Release reporting
Built a QA pipeline of six specialised AI agents (QA manager, functional, automation, API, regression, mobile and UI) that reads a repository, drafts the test plan and test cases, and runs functional, API and cross-device UI testing across devices and browsers. The automation agent writes and runs Playwright tests; the regression agent stays idle until a change is merged, then re-runs only the affected regression suite. Produces a client-ready quality report per run: results by suite, severity breakdown, coverage and a release-readiness verdict, exportable as PDF.

*Lamp — AI agent team for software delivery* · Working · in daily use
Tags: Claude Code · OpenCode · Multi-model agent orchestration · GitHub branches, PRs and issues
Built the agent framework Unflaky runs on: a team of AI agents (requirements analyst, senior developer, senior QA), each on its own branch and model, where every change lands as a pull request for human review and every failed test becomes a GitHub issue the developer agent picks up.

**SKILLS**
- GAME QA: Manual and exploratory game testing · Mobile testing on iOS and Android · Build verification and smoke testing · Regression and endurance testing · Bug writing, triage and verification · Quality metrics and reporting
- AUTOMATION & AI: Playwright · Automated checks in CI/CD (GitHub Actions) · Postman · Multi-agent LLM tooling (Claude Code, OpenCode) · AI-assisted QA (test case generation, automated test writing, root-cause retrieval, duplicate bug detection)
- SCRIPTING: C# · Python · JavaScript · TypeScript · SQL
- TOOLS: JIRA · Confluence · Git · Docker · Agile / Scrum
- LEADERSHIP: Onboarding and mentoring testers (team of 11) · Client and stakeholder communication · QA process improvement
- LANGUAGES: English (fluent) · Portuguese (native) · Spanish (basic) · French (basic)

**EDUCATION & CERTIFICATION**
- ISTQB Certified Tester, Foundation Level (CTFL) — ISTQB · certified 2026
- ISTQB Certified Tester, Advanced Level Test Manager (CTAL-TM) — coming soon, exam planned for 2027
- Information Technology: Software Development — New Brunswick Community College, Moncton, NB · 2022 — 2024
- Management Process — Universidade Salgado de Oliveira, Rio de Janeiro, Brazil · 2010 — 2012

## 5. Acceptance criteria

- **AC-1** Given `/resume/resume.html`, Then its visible text contains every paragraph, role, date, tag line and skill of section 4, in order (data-driven check of key strings per section).
- **AC-2** Given the resume text, Then it contains "Senior QA Analyst", "SQA Team Lead", "11 testers", "95% first-pass compliance", "98%", "certified 2026", "CTAL", "2027", "linkedin.com/in/herbert-cunha", "BMM Testlabs".
- **AC-3** Given the resume text, Then it does not contain "approval rate", "full certification cycle", "BMM Test Labs", "scheduled", "studying", nor `\b(certify|certifies|approve|reject)\b`.
- **AC-4** Given the resume text, Then "certification lab" appears only in the BMM company description and the summary's "global game certification lab".
- **AC-5** Given `/resume.pdf`, Then it starts with `%PDF`, was regenerated in this branch (newer than the HTML source change), and its text matches the HTML (checked manually if no PDF text tool is available — no new dependency).
- **AC-6** Given the PDF, Then the header links (herbertph.com, LinkedIn, GitHub, email) and unflakyqa.com are clickable and point to the URLs in FR-5.
- **AC-7** Given the PDF on Letter size, Then no section heading sits alone at the bottom of a page, no line is cut at a page break, and layout/fonts match the current resume style.
- **AC-8** Given `npm test`, Then the full suite passes on both projects. Existing resume tests (TC-32 and `AC-31` in `tests/portfolio.spec.ts`) keep passing without being weakened; QA may add the new checks.
- **AC-9** Given the homepage, Then the "Resume" link still opens `/resume.pdf` (unchanged).

## 6. Assumptions (Herbert to confirm in review)
1. The CTFL line reads "ISTQB · certified 2026" (his file says "ISTQB 2026") so it matches the site wording.
2. The CTAL line uses the full name "ISTQB Certified Tester, Advanced Level Test Manager (CTAL-TM)".
3. Phone number and email stay in the public PDF (they were already in the old one).
4. The original file's "C\#" / "\~" are typing artifacts; the resume shows "C#" and "~".

## 7. Technical notes and tasks (developer)
1. Edit `resume/resume.html`: replace the content with section 4, reusing existing classes (`job-org`, `where`, etc.). Add an "AI Tooling Projects" section styled like the experience entries.
2. Make the header links and the Unflaky link real `<a href>` so they stay clickable in the PDF.
3. Add print rules if needed (`break-inside: avoid` on entries, `break-after: avoid` on headings) to satisfy AC-7.
4. Run `npm run resume`, review the PDF visually, commit `resume.html` and `resume.pdf`.
5. Run `npm test` (port 4173 only, never 4545); keep both projects green.
