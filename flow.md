# 🔄 AB Testing Starter Kit — Flow

> 🗺️ **Single source of truth** for how the kit turns a brief into a QA'd, knowledge-captured test.
> 📐 The **map, not the manual** — step detail lives in `AI/AGENTS.md` (STEP 0–4), `AI/question_templates.md`.
> 🛡️ **Enforced by `tools/flow_gate.js`** — the gate, not prose, stops skipped steps. Run it after every step.

---

## 🏷️ Legend

| Icon | Meaning |
|:---:|---|
| 📥 | Input / entry point |
| 🏗️ | Build (scaffold / write) |
| 🔍 | Research / verify |
| 🗣️ | Q&A gate (ask the user) |
| 🧪 | QA / test the build |
| 🧠 | Knowledge loop (feed back into the kit) |
| 🚀 | Output / handover |

---

## 🚦 The Flow

```
                 ┌─────────────────────────────────────────────┐
                 │ 📥  INPUT: Client brief (any format)          │
                 └──────────────────────┬──────────────────────┘
                                        ▼
   STEP 0  🏷️ PARSE   AI/PROMPT_PARSING.md → CLIENT / TEST_NAME / TEST_ID(EG-…)
         → client-code/domain lookup: ClientData/client_registry.md (if present)
                                           → WEBSITE_URL / FOCUS_AREA
                         If any missing → 🙋 ASK user, never guess
                                          ▼
   STEP 0a.5 🧠 CLASSIFY effort (AI decides from the brief — NEVER ask the user)
         LITE   = presentational/structural only (hide/show/move/style existing), no behavior
         HEAVY  = clone/AJAX/state/re-render (P33–P38), needs evidence front-load
         else STANDARD = full flow.  unsure → STANDARD (never down-classify a test)
         LITE: Q&A → 0–2, no archive/RAG, session_notes 3–5 lines, knowledge diff only if
               genuinely new; user_qa.md ALWAYS. Target brief→handover ~10–15 min
                                          ▼
   STEP 0b 🏗️ SCAFFOLD  Copy ROOT templates (variation1/, share.js, v1.json)
        → ../ABTESTSWITHAI/CLIENT/TEST_NAME/  (⛔ NEVER touch root variation1/)
          TEST_NAME/ = TWO folders: variation1/ (deploy: variation.js/css + v1.json
          + share.js + metadata.json) + AI_DATA/ (all AI/QA data: qa_prep, session_notes.md
          (appended all session), readme, user_inputs/ (test_images/ sub), user_qa.md)
                                        ▼
   STEP 0b.5 📥 INPUT GATE  ASK where the user's material lives (BEFORE research):
          "AI_DATA/user_inputs/ ban gaya — images → user_inputs/test_images/,
           PDF/DOCX/anything → seedha user_inputs/; file names meaningful rakho."
          (a) sab daala → read PDF/DOCX (folds into 0c/1)
          (b) kuch daala → same, with what's there
          (c) abhi kuch nahi → proceed with brief text; re-scan if material arrives
          Missing material NEVER blocks — fewer inputs now.
                                        ▼
    STEP 0c 🗣️ Q&A GATE  AI/question_templates.md (U1–U21 + §2.5 evidence cheat sheet, L1–L13, N/P/C/S/F/G/H banks)
         1. gap-scan the brief          2. kit-lookup (drop what's already known:
          ClientData/SITE_PROFILES.md, past qa_prep.json, playbook §8 index)     3. ask ONLY what's left
         → answers written to AI_DATA/qa_prep.json NOW (not deferred — gate checks it)
         → product/catalog tests: ask the user for product data first (they have it
           in seconds; the AI never scrapes — no bulk fetch, no curl loops)
         → clone/AJAX tests (P33–P38): ASK for the evidence NOW — real network request,
           full container outerHTML incl. form=-associated controls, console log (U21) —
           + the PARITY question (U20: behave exactly like the source, or simplified?)
           one paste now > 3 QA rounds (AB044: 9 rounds → target 1–2)
         → event-only briefs: use the §3.5 EVENT bank (E1–E4) — 2–4 questions max,
           kit defaults (P39) cover the rest; output = eventName-only helper, default tags
                                        ▼
   STEP 1  🔍 RESEARCH  (area-scoped ONLY, never whole site)
        §8 pattern INDEX in AB_TESTING_PLAYBOOK.md → open ONLY the matched P#
        in AB_TESTING_PATTERNS.md (reference file — never read end-to-end)
        no match? 🙋 ASK "RAG search (archive) chalaun, ya library se chalaun?"
        → run python scripts/search_tests.py (takes time) → save new technique
          as next P-pattern; or skip → build from existing patterns
        → ASK-DON'T-GUESS: no browser → unrecorded live facts come from the user
          (outerHTML / screenshot / console log), one round-trip ≈ 1 min
        → record confirmed facts in session_notes.md + ClientData/SITE_PROFILES.md/json
                                        ▼
   🛡️ GATE  node tools/flow_gate.js "<test folder>" --through <completed-step>
        ← run after EVERY step (0b / 0b.5 / 0c / 1 / 2 / 3 / 4).
        FAIL in the checked phase → fix that step, re-run, then continue. WARN → note it.
        Omit --through only for the final full-flow check.
                                         ▼
   STEP 2  🏗️ WRITE CODE  (minimum to run)
        variation1/variation.js + variation.css   (EG-<ID> body class, scoped CSS)
        share.js (tracking) / v1.json (platform)
        → start session_notes.md at the FIRST learned fact (append all session)
                                         ▼
   STEP 3  🙋 USER QA HANDOVER  (AI does NOT run QA — user QA's ALWAYS)
         write AI_DATA/user_qa.md: what changed + 3–5 things to verify + risky bits
         + the bug-report format (expected-vs-actual in one line + console log + §2.5 evidence)
         "Test ready — QA aap karo" → STOP (no screenshots, no analysis)
         loop after handover: user tests → reports bug (batched, with evidence) → AI fixes
                                         ▼
   STEP 4  🧠 KNOWLEDGE LOOP  (kit must be STRICTLY more capable after each test)
         🙋 KNOWLEDGE DIFF (mini self-check): list NEW facts from session_notes.md
            not already in the kit → show user in ONE message → WAIT for approval
            → write ONLY approved facts (unapproved guesses never reach a profile)
         metadata.json / readme.md / session_notes.md
         (qa_prep.json was written in 0c; session_notes.md was appended all session)
         ClientData/SITE_PROFILES.md + ClientData/site_profiles.json  (fold approved facts, area-wise)
         new P-pattern → AB_TESTING_PATTERNS.md + §8 index row → bump P1–Pxx count everywhere
         new question → question_templates.md   → reusable script → tools/
         any kit change → 🔄 update THIS file (flow.md) in the same commit
                                        ▼
                        🚀 OUTPUT: ../ABTESTSWITHAI/CLIENT/TEST_NAME/
```

---

## 📋 STEP cheat-sheet

| Step | Name | What happens | Key rule |
|:---:|---|---|---|
| **0** | Parse | Extract `CLIENT`, `TEST_NAME`, `TEST_ID`, `URL(s)`, `FOCUS_AREA` | Never guess → ask |
| **0a.5** | Classify effort | AI judges LITE / STANDARD / HEAVY from the brief's signals — **never ask the user**; record in `qa_prep.json` (`effort`) | unsure → STANDARD; LITE skips the heavy machinery (~10–15 min total) |
| **0b** | Scaffold | Copy root templates → `../ABTESTSWITHAI/CLIENT/TEST_NAME/` | Root `variation1/` is read-only |
| **0b.5** | Input gate | Ask where the user's material lives → images into `user_inputs/test_images/`, PDF/DOCX etc. into `user_inputs/`, meaningful file names | (a) all / (b) partial / (c) none → never blocks |
| **0c** | Q&A gate | Ask only what the kit doesn't know (U/L/N/P/C/S/F/G/H banks + §2.5 evidence cheat sheet; event-only briefs → §3.5 EVENT bank E1–E4) | Max 6–8 questions (events: 2–4); write `qa_prep.json` NOW. LITE with no gaps records `gate_complete: true`; ask for product/catalog data when products are in scope; clone/AJAX tests → front-load evidence (U21) + parity (U20) |
| **1** | Research | §8 pattern INDEX → open ONLY the matched P# in `AB_TESTING_PATTERNS.md` → no match? **ask run-or-skip RAG search** → **ask-don't-guess**: live facts come from the user (outerHTML/screenshot/log) | Area-scoped only; never speculate — ask |
| **2** | Write code | `variation1/` (`variation.js`/`.css` + `v1.json` + `share.js`) | Start `session_notes.md` at first learned fact |
| **3** | User QA handover | Write `AI_DATA/user_qa.md` (what changed + 3–5 things to verify + risks + bug-report format) → "Test ready — QA aap karo" → STOP | AI never runs QA; user QA's always; fix-loop: user reports (batched, with evidence) → AI fixes |
| **4** | Knowledge loop | Knowledge diff first: show user the NEW facts from `session_notes.md` in one message, get approval, write ONLY approved facts → then profiles, P-patterns, questions, tools → back into the kit | Update `flow.md` too; no unapproved guess reaches a profile |

---

## ⚠️ Golden rules

- 🏗️ **Templates** — root `variation1/`, `share.js`, `v1.json`, `metadata.json` are the source of truth. Copy, never edit.
- 🗂️ **ClientData/ is the ONLY client-data home** — profiles (`SITE_PROFILES.md`/`site_profiles.json`), `client_registry.md`, `examples/`, client tools (`tools/ss_search_check.ps1`). Everything else in the kit is generic; if `ClientData/` is missing the kit still works (verify facts from scratch).
- 🛡️ **Flow gate is mandatory** — `node tools/flow_gate.js "<test folder>" --through <completed-step>` after EVERY step. A `FAIL` in the completed phase means STOP and fix first; omit `--through` only for the final full-flow check.
- ⚡ **Fast Lane** — for eligible LITE / known STANDARD work, use the one-message intake in `AI/FAST_LANE.md`; `tools/start_test.js` creates STEP 0b and `tools/preflight_check.js` catches local structural errors before user QA. These tools never replace evidence collection or user QA.
- 🙋 **Ask, don't guess** — the user IS your browser. Live-page facts (request shape, response, DOM after click, console errors) come from the user — one paste/screenshot/log, never a guess-test loop. Evidence is front-loaded at the Q&A gate for clone/AJAX tests (network request, full container HTML, console-on-fail — `question_templates.md` §2.5 / U21), and the parity question (U20) is asked once at the gate, not discovered at QA.
- 🛑 **Fail once → question the APPROACH, not just the guess** — if a technique can't work (e.g. moving a plugin-owned iframe breaks postMessage), retries never fix it; re-derive from first principles and change the approach (5x same-premise ≠ smarter, it's harder — antigravity fixed the same bug on try 2 by switching approach).
- 🧠 **Session notes** — `AI_DATA/session_notes.md` is appended ALL session (first learned fact onward), never deferred to the end; STEP 4 folds it into the client profile.
- 🙋 **Knowledge diff approval** — STEP 4 starts with a mini self-check: list the NEW facts learned (from `session_notes.md`), show the user in ONE message, wait for approval, then write ONLY the approved facts. Unapproved guesses never land in a profile — that is the drift protection.
- 📥 **User material lives in `AI_DATA/user_inputs/`** (images → `test_images/`, everything else → loose/own folders). Never reference files the user pasted anywhere else — copy them into `user_inputs/` first.
- 🎨 **CSS-first (hide ≠ move)** — any presentational change (hide/show/style/spacing) is a scoped CSS rule; JS is only for behavior CSS can't do (move/clone/fetch/state). Never `remove()` / JS-hide what one `display: none` fixes.
- 🔍 **No stable selector? → ASK the user** — when only Salesforce `00N…` / CRM tokens / tool-injected IDs exist on form fields, ask the user before using `name` attribute as fallback. Document the risk in `session_notes.md`. Never silently ship a CRM ID selector.
- 🧪 **AI never runs QA** — QA is ALWAYS the user's job. AI hands over with `AI_DATA/user_qa.md` and stops.
- 🔄 **Keep this file in sync** — any step/file/tool/count change → update `flow.md` in the same commit (rule in `AGENTS.md` / `AI/AGENTS.md` STEP 4).
