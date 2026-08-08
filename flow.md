# FLOW.md — AB Testing Starter Kit: End-to-End Flow

This file is the single source of truth for HOW the kit works — the exact order a
brief moves through the kit from input to a QA'd, knowledge-captured test.

**KEEP THIS FILE IN SYNC.** Every time a step, file, folder, rule, tool, or pattern
count changes, update this file in the SAME commit. (Rule enforced by the knowledge
loop — see STEP 4 in `AGENTS.md` and `AI/AGENTS.md`.)

---

## 1. Big picture

```
  BRIEF ──> PARSE ──> SCAFFOLD ──> Q&A GATE ──> RESEARCH ──> CODE+SPEC ──> QA ──> KNOWLEDGE LOOP
   (any)    STEP 0    STEP 0b      STEP 0c      STEP 1       STEP 2       STEP 3    STEP 4
```

- **Input:** a client brief (any format).
- **Output:** a test folder in `../ABTESTSWITHAI/CLIENT/TEST_NAME/` + the committed
  kit carrying reusable knowledge (profiles, patterns, questions, tools).
- **Two worlds, never mixed:**
  - The **starter kit** (`ab_testing-starter_kit/`) — templates + knowledge. Committed to git.
  - The **ABTESTSWITHAI archive** (`../ABTESTSWITHAI/CLIENT/TEST_NAME/`) — per-test output. NOT a git repo.
  - All output goes into the archive; the root `variation1/` is a READ-ONLY template.

---

## 2. The steps in detail

### STEP 0 — Parse the brief & scaffold (before ANY code)
1. **0a Parse** — read `AI/PROMPT_PARSING.md`; extract and CONFIRM with the user:
   - `CLIENT` (folder name, CAPS) · `TEST_NAME` (subfolder) · `TEST_ID` (body class `EG-<TEST_ID>`)
   - `WEBSITE_URL`(s) · `FOCUS_AREA` (`navigation` / `product` / `checkout` / `section` / `form` / `page` / `search`)
   - If anything is ambiguous → **ask the user, never guess.**
2. **0b Scaffold** — create the folder tree under `../ABTESTSWITHAI/CLIENT/TEST_NAME/`:
   ```
   v1.json · share.js · spec.json · qa_prep.json · metadata.json · readme.md
   variation1/variation.js · variation1/variation.css
   ```
   Copy `variation1/` + `share.js` + `v1.json` from the kit ROOT templates (never from `AI/` backups or the example folder).
   `spec.json` is written in STEP 2 (QA input — must exist before STEP 3). The docs (`qa_prep.json`, `metadata.json`, `readme.md`) are written in STEP 4.

### STEP 0c — Q&A gate (ask ONLY what the kit doesn't know)
Read `AI/question_templates.md` FIRST, then:
1. **Gap-scan the brief** — mark every field already answered; never re-ask.
2. **Kit-lookup** — drop any question already answered in (in order):
   `AI/SITE_PROFILES.md` → same-client past `qa_prep.json` + readme "Knowledge added" → `AI/AB_TESTING_PLAYBOOK.md` §8 patterns.
3. **Ask the user ONLY what's left** — max 6–8 questions, business-language, highest-risk first
   (design intent > behavior > scope > environment). Verify behaviors yourself when cheaper than asking.
4. **Record answers now** (schema in `question_templates.md` §5): `asked` (verbatim user answers),
   `skipped_known` (with reason), `verified` (facts YOU confirmed live).
   Question banks: universal **U1–U19**, area banks (N / P / C / S / F / G / H), PLP bank **L1–L13**.

### STEP 1 — Research (AREA-SCOPED, never the whole site)
1. Read `AI/AB_TESTING_PLAYBOOK.md` in full; match the task against patterns §8 **P1–P31** (primary source).
2. Only if NO pattern fits → RAG fallback: `python scripts/search_tests.py "<description>"`, then **add the new technique to the playbook §8 as the next P-number**.
3. Read the client's `AI/SITE_PROFILES.md` for the **current FOCUS_AREA only** (+ site-wide gotchas header).
   - Area already verified → use the selectors, don't re-verify.
   - Area not verified → inspect the live DOM for that area only, record area-wise in STEP 4.
4. Keep `AI/site_profiles.md` (human facts) and `AI/site_profiles.json` (machine tokens for the QA runner) in sync.

### STEP 2 — Write code + spec (minimum to be QA-ready)
Study `AI/examples/EG-EXAMPLE-SM01/` (all 6 files) as the quality bar, then write:
- `variation1/variation.js` — base wrapper (`waitForElement` + `init()`), `EG-<TEST-ID>` body class, scoped `eg-` CSS classes, idempotency + MO guards, lean helper set (add helpers only when needed).
- `variation1/variation.css` — all rules scoped under `body.EG-<TEST-ID>`; no `!important` unless required.
- `share.js` — tracking only, no DOM mutation. `v1.json` — platform config with real URLs/file paths.
- **`spec.json`** — the data-driven QA plan (`tools/qa_run.js` reads ONLY this + `site_profiles.json`). It is REQUIRED before STEP 3.
  Supported spec features: `checks` (ops `js` / `exists` / `css` / `batch`), async `js` checks, `settle` (`marker`, `scrollTo`, `scrollAll {stepMs,maxMs}`, `waitJs` data-readiness gate, `extraMs`), `noPageErrors`, `pagination` block (`click`, `waitCards`, `checks`).
  Specs must block **weak passes** (too few items with data) and **vacuous passes** (no element could exercise the claim).

### STEP 3 — QA & ready-to-share
0. **ASK FIRST (user-confirmed rule):** *"QA aap khud chalenge (manual), ya main chala dun (AI)?"* — wait for the answer, never auto-run.
   - Manual → give them `node tools/qa_run.js qa --spec "<test>/spec.json"` and wait for their output.
   - AI → run it yourself:
     ```
     node tools/qa_run.js qa --spec "../ABTESTSWITHAI/CLIENT/TEST_NAME/spec.json"
     ```
     Optionally `--url <other-page>` to verify the same variation on a second URL, and `--out <file>` to save the result.
1. Every check must PASS.
2. Visual check (screenshot vs mockup) — desktop AND mobile.
3. Selector audit against the forbidden-anchor list (playbook §9).
4. Declare **"Test completed — ready to share"**, then run STEP 4.

### STEP 4 — Capture knowledge back into the kit (MANDATORY)
The kit must be **strictly more capable after the test than before it**. Before handover:
1. Write the deferred docs: `metadata.json`, `readme.md` (brief + "Knowledge added"), `qa_prep.json` (Q&A record from STEP 0c).
2. `AI/SITE_PROFILES.md` — add/update the client section: header (site-wide gotchas) + `### <FOCUS_AREA>` (verified DOM facts, each marked with the test that proved it). Add `User-confirmed (Q&A, <TEST_NAME>):` bullets for facts the USER gave. **ALSO sync `AI/site_profiles.json`** with any runner tokens/selectors.
3. `AI/AB_TESTING_PLAYBOOK.md` §8 — append new techniques as the next P-number (recipe + `Source:`). Update every `P1–Pxx` reference in `AGENTS.md` / `AB_TESTING_PLAYBOOK.md` / `README.md` (grep for `P1–P`).
4. `tools/` — save reusable scripts, site-specific parts parameterized.
5. `AI/question_templates.md` — append any new question the gate needed to the relevant bank/universal table.
6. **`flow.md` (this file)** — update it if ANY step, file, folder, tool, flag, or count changed.

---

## 3. The QA runner architecture (client-agnostic)

```
                 ┌───────────────────────────────────────────────┐
                 │  tools/qa_run.js  (GENERIC ENGINE, never edits) │
                 └──────┬──────────────────────────┬───────────────┘
                        │ reads site facts         │ reads all checks
                        ▼                          ▼
        AI/site_profiles.json              <test>/spec.json
        (per-client tokens:                (per-test: url, inject,
         addToCart, popup, title,           checks, settle, noPageErrors,
         related, counter, threshold)       pagination)
```

- Adding a client → add its `site_profiles.json` entry. Adding a test → write its `spec.json`.
- **Neither requires editing `qa_run.js`.** That is the core design contract.

---

## 4. Quick-reference map

| Kit location | Role |
|---|---|
| `AGENTS.md` (root) | Entry point — mandatory reading order, critical rules, knowledge loop |
| `README.md` (root) | Onboarding — session starter prompt, brief formats, kit structure (how-to-use; flow.md = how-it-works) |
| `AI/AGENTS.md` | Full step-by-step build instructions (STEP 0–4) |
| `AI/PROMPT_PARSING.md` | Extracting CLIENT / TEST_NAME / body class from any brief |
| `AI/question_templates.md` | Pre-code Q&A gate + question banks (U1–U19, L1–L13, N/P/C/S/F/G/H) |
| `AI/AB_TESTING_PLAYBOOK.md` | Coding standards + reusable patterns library (P1–P31) |
| `AI/SITE_PROFILES.md` | Verified DOM facts per client, grouped by focus area |
| `AI/site_profiles.json` | Machine-readable tokens for the QA runner |
| `AI/examples/EG-EXAMPLE-SM01/` | Reference example (never copy values into a real test) |
| `variation1/` (root) | READ-ONLY blank template |
| `share.js`, `v1.json`, `metadata.json` (root) | Blank templates (copy, never edit) |
| `tools/qa_run.js` | Generic data-driven QA engine |
| `tools/ss_search_check.ps1`, `tools/acp_add_check.js` | Reusable helpers |
| `scripts/search_tests.py` | RAG fallback when no playbook pattern fits |
| `../ABTESTSWITHAI/CLIENT/TEST_NAME/` | All test output (NOT a git repo) |

---

## 5. Version history
- **Current:** README moved from `AI/README.md` → root `README.md` (onboarding/how-to-use; flow.md stays the how-it-works single source of truth).
- **Previous:** STEP 0–4 flow with Q&A gate (STEP 0c), area-scoped research, generic spec-driven QA runner, mandatory STEP 4 knowledge loop including flow.md sync.
- Update this section every time `flow.md` changes (one line: what changed + when).
