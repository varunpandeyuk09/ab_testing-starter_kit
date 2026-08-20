# AB Testing Starter Kit

**Purpose:** Copy this entire folder into any new project folder so a fresh session can build complete, complex A/B tests even without access to the agency's test archive.

---

## 🚀 Session Starter Prompt (copy-paste this every time)

Copy this entire block at the start of every new AI session. Replace the path and paste your brief at the bottom.

```
You are an expert CRO developer at a premium A/B testing agency. You build production-grade
A/B test variations using the starter kit below. Follow its process EXACTLY — do not skip,
reorder, or "remember" steps.

The AB test starter kit is at: D:\WORK_EXPOGROWTH\ab_testing-starter_kit

BEFORE writing any code, read these files IN ORDER:
1. AI/AGENTS.md               — step-by-step build instructions (steps + hard bans)
2. AI/PROMPT_PARSING.md       — how to extract CLIENT / TEST_NAME / TEST_ID from a brief
3. AI/question_templates.md   — pre-code Q&A gate (STEP 0c)
4. AI/AB_TESTING_PLAYBOOK.md  — coding standards (read in full) + §8 pattern INDEX; the P1–P40
                                recipes live in AI/AB_TESTING_PATTERNS.md — open ONLY the matched pattern
5. ClientData/examples/EG-EXAMPLE-SM01/readme.md    — what a correct test looks like
6. ClientData/examples/EG-EXAMPLE-SM01/variation1/variation.js   — reference JS
7. ClientData/examples/EG-EXAMPLE-SM01/variation1/variation.css  — reference CSS
8. ClientData/examples/EG-EXAMPLE-SM01/share.js                   — reference tracking
9. flow.md                    — end-to-end flow (single source of truth, kept updated)
10. AI/README.md              — this file: prompt starter, brief formats, structure

AFTER reading the files, state and CONFIRM with the user:
- CLIENT folder name (e.g. CLIENTX)
- TEST_NAME subfolder (e.g. AB01 Product Tile Optimization)
- Body class (e.g. EG-CLIENTX-AB01)
- Target URL(s)
- FOCUS_AREA (navigation / product / checkout / section / form / page / search)

If any of the above is not in the brief → ASK first, never guess.

THEN follow AI/AGENTS.md STEP 0 → 4 in order (scaffold → input gate → Q&A gate → area-scoped
research → code → user-QA handover → knowledge loop). After every completed step, run
node tools/flow_gate.js "<test folder>" --through <completed-step>. Any FAIL in that phase
means STOP and fix first; omit --through only for the final full-flow check.

--- BRIEF START ---
[PASTE YOUR BRIEF HERE]
--- BRIEF END ---
```

---

## ⚡ Fast Lane (use for a 10–20 minute build target)

For a simple test, paste this below the Session Starter Prompt. The AI decides whether it is
LITE, STANDARD, or HEAVY — do not guess the effort level yourself.

```text
FAST LANE
Client: CLIENT
Test ID: AB01
Test name: Product Tile Copy Change
URL(s): https://example.com/page
Focus area: section
Change: [exact change required]
Target selector / full outerHTML: [paste]
Mockup: [attach or state none]
Tracking: [what to track, or none]
Constraints: [devices/pages/elements that must not change]
Input material: (a) all uploaded / (b) partially uploaded / (c) none
```

LITE tasks (CSS/text/show/hide/reorder of existing content) target **10–15 minutes**. A known
STANDARD task targets **up to 20 minutes** only when the client profile and exact target facts
already exist. AJAX, cloned components, forms, variants, or re-render/state work are HEAVY and
need their normal evidence/QA time.

### Optional local commands

Normally the AI runs these. Use them yourself only when you need to prepare a test before
opening a session:

```powershell
# Create the safe test scaffold.
node tools/start_test.js --client CLIENT --name "AB01 Product Tile Copy Change" --id CLIENT-AB01 --url "https://example.com/page" --focus section --effort LITE

# Run after each completed phase.
node tools/flow_gate.js "<test folder>" --through 0b
node tools/flow_gate.js "<test folder>" --through 0c

# Run before giving the build to the user for QA.
node tools/preflight_check.js "<test folder>"
```

Full rules and examples: [`AI/FAST_LANE.md`](FAST_LANE.md).

---

## What Goes in [PASTE YOUR BRIEF HERE]

Paste whatever you have — any format works. Examples:

**Option A — Trello card title + requirements:**
```
ABC | AB01 | Product Tile Optimization
For abcstore.example.com, adjustments to all tiles on the PLP:
- Remove the button from all of them
- Set price font size to 25px
- SALE badge on right side with border radius 6px
```

**Option B — Just the Trello card title:**
```
ABC | AB01 | Product Tile Optimization
```
*(AI will ask for requirements if too vague)*

**Option C — URL + description (no Trello card):**
```
Website: https://abcstore.example.com/collections/all
Test: Make the product price bigger and hide the add to cart button on PLP
```

**Option D — With design images:**
```
ABC | AB01 | Product Tile Optimization
[attach desktop screenshot]
[attach mobile screenshot]
Match the design in these images.
```

**Option E — Mixed language brief:**
```
ABC | AB01 | Product Tile Optimization
abcstore.example.com pe product tiles mein se button hatana hai,
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
    README.md                 ← onboarding: session starter prompt, brief formats, structure (this file)
    AGENTS.md                 ← step-by-step instructions the AI follows automatically
    PROMPT_PARSING.md         ← teaches AI to extract CLIENT/TEST_NAME from any brief
    question_templates.md     ← pre-code Q&A gate (area-wise banks + kit-lookup rules)
     AB_TESTING_PLAYBOOK.md    ← full coding standard + §8 pattern INDEX (read in full)
     AB_TESTING_PATTERNS.md    ← P1–P40 recipes (REFERENCE — open ONLY the matched P#)
    snippets/
      live.js               ← event-delegation helper (ONLY when events needed)
      listener.js           ← SPA routing listener (ONLY when site is a SPA)
      cookies.js            ← getCookie/setCookie/deleteCookie (ONLY when cookies needed)
      waitForLibrary.js     ← waitForJquery/waitForLibrary readiness waiters
    share.js / v1.json        ← backups of the root blank templates
  ClientData/                 ← THE ONLY place client-specific data lives
    SITE_PROFILES.md          ← verified per-client DOM facts (check before live autopsy)
    site_profiles.json        ← machine-readable facts store (selectors/endpoints/gotchas)
    client_registry.md        ← real client codes + domains → folder-name map (if present)
    examples/
      EG-EXAMPLE-SM01/        ← REFERENCE ONLY — correct, complete output to study
    tools/
      ss_search_check.ps1     ← client-instance of P27 (headless search-result checker)
  scripts/
    search_tests.py           ← RAG fallback search (auto-locates the AB-test archive)
  tools/                      ← reusable scripts built during tests
    flow_gate.js              ← MECHANICAL FLOW ENFORCEMENT — run after every step (FAIL → stop & fix)
    start_test.js              ← optional safe STEP 0b scaffold command
    preflight_check.js         ← static check before user QA handover (never replaces QA)
  ../ABTESTSWITHAI/CLIENT/    ← actual test output lives here (outside starter kit)
    TEST_NAME/                ← exactly TWO folders
      variation1/             ← DEPLOY PACKAGE (everything the platform runs)
        variation.js
        variation.css
        v1.json               ← platform config (paths relative to variation1/)
        share.js
        metadata.json
      AI_DATA/                ← ALL AI/QA working data (never touched by the platform)
        qa_prep.json          ← Q&A gate record (STEP 0c)
        session_notes.md      ← facts appended ALL session (folded into profiles in STEP 4)
        user_qa.md            ← STEP 3 handover note (what changed + what the user should verify)
        readme.md
        user_inputs/          ← EVERYTHING the user pastes (STEP 0b.5 gate)
          test_images/        ← figma / control / variation reference images
```

> **Template source of truth:** the blank templates live at the kit ROOT — `variation1/`, `share.js`, `v1.json`, `metadata.json`. The copies under `AI/` are backups. `ClientData/examples/EG-EXAMPLE-SM01/` is a filled reference example ONLY — never copy its values into a real test. `ClientData/` is the ONLY folder holding client-specific data — the rest of the kit is generic.

---

## ⚠️ Root `variation1/` is a READ-ONLY template

The `variation1/` folder at the repo root is the **blank starting template**. The AI copies it when scaffolding a new test. **Never write test code directly into it.** All test output goes into `../ABTESTSWITHAI/CLIENT/TEST_NAME/` — exactly TWO folders: `variation1/` (the deploy package) + `AI_DATA/` (all AI/QA working data).

---

## Key rule

The base `variation.js` contains **only** `waitForElement` + `init()`.
- `live()` — add from `AI/snippets/live.js` **only when the test binds events** (clicks, tracking).
- `listener()` — add from `AI/snippets/listener.js` **only when the site uses SPA routing**.
- Everything else stays lean. Don't include helpers you don't need.

---

## AI Workflow (automatic — no manual steps needed)

> 🛡️ **The flow is ENFORCED, not just documented:** run `node tools/flow_gate.js "<test folder>"`
> after **every** step. Any `FAIL` → STOP, fix that step, re-run. The gate enforces the
> same checks for every test. Prose is the manual; the gate is the law.

The exact end-to-end flow is documented in `flow.md` (kit root) — **the single source of
truth for HOW this kit works**. It is kept updated on every kit change, so read it, don't
re-derive it. The short version of the pipeline is STEP 0 (parse + scaffold) →
STEP 0c (Q&A gate) → STEP 1 (area-scoped research, ask-don't-guess) → STEP 2 (code +
start `session_notes.md`) → STEP 3 (user QA handover via `AI_DATA/user_qa.md` — AI never
runs QA) → STEP 4 (knowledge loop back into the kit).

> ⚠️ If you change anything about the kit (a step, file, folder, tool, flag, or pattern
> count), update `flow.md` in the SAME commit — see `AI/AGENTS.md` STEP 4 item 6.

---

## RAG fallback search (`scripts/search_tests.py`)

The patterns library is the primary source: match the brief against the §8 INDEX in `AB_TESTING_PLAYBOOK.md`, then read ONLY the matched P# in `AI/AB_TESTING_PATTERNS.md`. If no pattern fits a brief, the AI runs the fallback search against the agency's archive:

```bash
python scripts/search_tests.py "test description"
```

**How it works:**
1. Auto-locates the `AB-test` archive — walks up from the current directory, scans all drive roots, or uses the `AB_TEST_REPO` environment variable. No hardcoded paths.
2. Reads `metadata.json` in every test folder, scores relevance to your query.
3. Prints the top 3 matching tests with their `variation.js` / `variation.css`.

**Required once per machine:** Python 3 with `scikit-learn` (`pip install scikit-learn`). Pure-Python fallback is used if sklearn is missing.

**Rule:** when the fallback is used, the newly learned technique MUST be appended to `AI/AB_TESTING_PATTERNS.md` as the next P-number + a row in the playbook §8 index — the library is the lasting output, the search is only the teacher.

---

## Knowledge feedback loop (after every test)

Every finished test must leave its verified learnings in the kit. The full checklist lives
in `AI/AGENTS.md` STEP 4 and the pipeline is mirrored in `flow.md` (kit root). In short:
- **Knowledge diff (user-approved)** — show the user the NEW facts from `session_notes.md` in ONE message, wait for approval, write only approved facts (drift protection)
- Verified DOM facts + user-confirmed Q&A → `ClientData/SITE_PROFILES.md` (client section, area-wise)
- New technique → next P-pattern in `AI/AB_TESTING_PATTERNS.md` + a row in playbook §8 index + update `P1–Pxx` count
- New question the templates missed → `AI/question_templates.md` (relevant area bank)
- Reusable script → `tools/`
- Any kit change → update `flow.md` (root) in the SAME commit

The kit compounds: each test makes the next one faster.

<!-- end -->
