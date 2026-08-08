# AB Testing Starter Kit

**Purpose:** Copy this entire folder into any new project folder so a fresh session can build complete, complex A/B tests even without access to the agency's test archive.

---

## 🚀 Session Starter Prompt (copy-paste this every time)

Copy this entire block at the start of every new AI session. Replace the path and paste your brief at the bottom.

```
You are an expert CRO developer at a premium A/B testing agency.

The AB test starter kit is at: D:\WORK_EXPOGROWTH\ab_testing-starter_kit

Before writing a single line of code, read these files in order:
1. AI/AGENTS.md               — your step-by-step instructions
2. AI/PROMPT_PARSING.md       — how to extract CLIENT and TEST_NAME from the brief
3. AI/question_templates.md   — pre-code Q&A gate (STEP 0c): ask only what the kit doesn't know
4. AI/AB_TESTING_PLAYBOOK.md  — coding standards and reusable patterns (P1–P31)
5. AI/examples/EG-EXAMPLE-SM01/readme.md    — what a correct test looks like
6. AI/examples/EG-EXAMPLE-SM01/variation1/variation.js  — reference JS
7. AI/examples/EG-EXAMPLE-SM01/variation1/variation.css — reference CSS
8. AI/examples/EG-EXAMPLE-SM01/share.js                 — reference tracking
9. flow.md                    — end-to-end flow of the kit (single source of truth; kept updated on every change)

Note: the blank templates to copy are at the kit ROOT (`variation1/`, `share.js`, `v1.json`, `metadata.json`) — see AI/AGENTS.md Step 0b. The AI/examples files are reference only.

After reading all files above, confirm:
- CLIENT folder name
- TEST_NAME (subfolder)
- Body class (EG-...)
- Target URL(s)

Then scaffold the folder structure and build the test. When the test is finished, write its
verified learnings back into the kit (AI/AGENTS.md STEP 4): SITE_PROFILES.md, playbook §8, tools/.

--- BRIEF START ---
[PASTE YOUR BRIEF HERE]
--- BRIEF END ---
```

---

## What Goes in [PASTE YOUR BRIEF HERE]

Paste whatever you have — any format works. Examples:

**Option A — Trello card title + requirements:**
```
TRO | SM22 | Product Tile Optimization
For trooper.ch, adjustments to all tiles on the PLP:
- Remove the button from all of them
- Set price font size to 25px
- SALE badge on right side with border radius 6px
```

**Option B — Just the Trello card title:**
```
TRO | SM22 | Product Tile Optimization
```
*(AI will ask for requirements if too vague)*

**Option C — URL + description (no Trello card):**
```
Website: https://trooper.ch/collections/all
Test: Make the product price bigger and hide the add to cart button on PLP
```

**Option D — With design images:**
```
TRO | SM22 | Product Tile Optimization
[attach desktop screenshot]
[attach mobile screenshot]
Match the design in these images.
```

**Option E — Mixed language brief:**
```
TRO | SM22 | Product Tile Optimization
trooper.ch pe product tiles mein se button hatana hai,
price 25px krni hai aur SALE badge right side pe chahiye 6px border radius ke saath
```

---

## Structure

```
ab_testing-starter_kit/
  variation1/                 ← READ-ONLY template — never write test code here
    variation.js              ← base wrapper (waitForElement + init only)
    variation.css             ← scoped CSS template
  share.js                    ← goals/tracking template (blank)
  v1.json                     ← platform config template (blank)
  metadata.json               ← RAG metadata template (blank)
  flow.md                     ← end-to-end flow of the kit (SINGLE SOURCE OF TRUTH — update on every kit change)
  AGENTS.md                   ← entry-point instructions (read these files first)
  AI/                         ← everything the AI needs to know / reuse
    AGENTS.md                 ← step-by-step instructions the AI follows automatically
    PROMPT_PARSING.md         ← teaches AI to extract CLIENT/TEST_NAME from any brief
    question_templates.md     ← pre-code Q&A gate (area-wise banks + kit-lookup rules)
    AB_TESTING_PLAYBOOK.md    ← full coding standard + patterns library
    SITE_PROFILES.md          ← verified per-client DOM facts (check before live autopsy)
    snippets/
      live.js               ← event-delegation helper (ONLY when events needed)
      listener.js           ← SPA routing listener (ONLY when site is a SPA)
      cookies.js            ← getCookie/setCookie/deleteCookie (ONLY when cookies needed)
      waitForLibrary.js     ← waitForJquery/waitForLibrary readiness waiters
    share.js / v1.json        ← backups of the root blank templates
    examples/
      EG-EXAMPLE-SM01/        ← REFERENCE ONLY — correct, complete output to study
    README.md                 ← this file
  scripts/
    search_tests.py           ← RAG fallback search (auto-locates the AB-test archive)
  tools/                      ← reusable scripts built during tests (see ss_search_check.ps1)
    ss_search_check.ps1       ← headless-search-result checker (SMARTSIGN instance of P27)
  ../ABTESTSWITHAI/CLIENT/    ← actual test output lives here (outside starter kit)
    TEST_NAME/
      metadata.json
      v1.json
      share.js
      readme.md
      variation1/
        variation.js
        variation.css
```

> **Template source of truth:** the blank templates live at the kit ROOT — `variation1/`, `share.js`, `v1.json`. The copies under `AI/` are backups. `AI/examples/EG-EXAMPLE-SM01/` is a filled reference example ONLY — never copy its values into a real test.

---

## ⚠️ Root `variation1/` is a READ-ONLY template

The `variation1/` folder at the repo root is the **blank starting template**. The AI copies it when scaffolding a new test. **Never write test code directly into it.** All test output goes into `../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/`.

---

## Key rule

The base `variation.js` contains **only** `waitForElement` + `init()`.
- `live()` — add from `AI/snippets/live.js` **only when the test binds events** (clicks, tracking).
- `listener()` — add from `AI/snippets/listener.js` **only when the site uses SPA routing**.
- Everything else stays lean. Don't include helpers you don't need.

---

## AI Workflow (automatic — no manual steps needed)

The exact end-to-end flow is documented in `flow.md` (kit root) — **the single source of
truth for HOW this kit works**. It is kept updated on every kit change, so read it, don't
re-derive it. The short version of the pipeline is STEP 0 (parse + scaffold) → STEP 0c
(Q&A gate) → STEP 1 (area-scoped research) → STEP 2 (code + spec.json) → STEP 3 (QA) →
STEP 4 (knowledge loop back into the kit).

> ⚠️ If you change anything about the kit (a step, file, folder, tool, flag, or pattern
> count), update `flow.md` in the SAME commit — see `AI/AGENTS.md` STEP 4 item 6.

---

## RAG fallback search (`scripts/search_tests.py`)

The patterns library (playbook §8, P1–P31) is the primary source. If no pattern fits a brief, the AI runs the fallback search against the agency's archive:

```bash
python scripts/search_tests.py "test description"
```

**How it works:**
1. Auto-locates the `AB-test` archive — walks up from the current directory, scans all drive roots, or uses the `AB_TEST_REPO` environment variable. No hardcoded paths.
2. Reads `metadata.json` in every test folder, scores relevance to your query.
3. Prints the top 3 matching tests with their `variation.js` / `variation.css`.

**Required once per machine:** Python 3 with `scikit-learn` (`pip install scikit-learn`). Pure-Python fallback is used if sklearn is missing.

**Rule:** when the fallback is used, the newly learned technique MUST be appended to playbook §8 as the next P-number — the library is the lasting output, the search is only the teacher.

---

## Knowledge feedback loop (after every test)

Every finished test must leave its verified learnings in the kit. The full checklist lives
in `AI/AGENTS.md` STEP 4 and the pipeline is mirrored in `flow.md` (kit root). In short:
- Verified DOM facts + user-confirmed Q&A → `AI/SITE_PROFILES.md` (client section, area-wise)
- New technique → next P-pattern in `AI/AB_TESTING_PLAYBOOK.md` §8 + update `P1–Pxx` count
- New question the templates missed → `AI/question_templates.md` (relevant area bank)
- Reusable script → `tools/`
- Any kit change → update `flow.md` (root) in the SAME commit

The kit compounds: each test makes the next one faster.

<!-- end -->