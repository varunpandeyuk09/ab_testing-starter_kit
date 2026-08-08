# 🔄 AB Testing Starter Kit — Flow

> 🗺️ **Single source of truth** for how the kit turns a brief into a QA'd, knowledge-captured test.
> 📐 The **map, not the manual** — step detail lives in `AI/AGENTS.md` (STEP 0–4), `AI/question_templates.md`, `tools/qa_run.js`.

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
   STEP 0  🏷️ PARSE   AI/PROMPT_PARSING.md  → CLIENT / TEST_NAME / TEST_ID(EG-…)
                                        → WEBSITE_URL / FOCUS_AREA
                        If any missing → 🙋 ASK user, never guess
                                        ▼
   STEP 0b 🏗️ SCAFFOLD  Copy ROOT templates (variation1/, share.js, v1.json)
        → ../ABTESTSWITHAI/CLIENT/TEST_NAME/  (⛔ NEVER touch root variation1/)
          TEST_NAME/ = TWO folders: variation1/ (deploy: variation.js/css + v1.json
          + share.js + metadata.json) + AI_DATA/ (all AI/QA data: spec.json, qa_prep,
          readme, design_contract, design_tokens, user_inputs/ (test_images/ sub),
          vision_cache/, results)
                                        ▼
   STEP 0b.5 📥 INPUT GATE  ASK where the user's material lives (BEFORE research):
          "AI_DATA/user_inputs/ ban gaya — images → user_inputs/test_images/,
           PDF/DOCX/anything → seedha user_inputs/; file names meaningful rakho."
          (a) sab daala → scan images (STEP 1b) + read PDF/DOCX (folds into 0c/1b)
          (b) kuch daala → same, with what's there
          (c) abhi kuch nahi → proceed with brief text; re-scan if material arrives
          Missing material NEVER blocks — fewer inputs now.
                                        ▼
   STEP 0c 🗣️ Q&A GATE  AI/question_templates.md (U1–U19, L1–L13, N/P/C/S/F/G/H banks)
        1. gap-scan the brief          2. kit-lookup (drop what's already known:
        SITE_PROFILES.md, past qa_prep.json, playbook §8)     3. ask ONLY what's left
        → answers recorded → later saved to qa_prep.json
                                        ▼
   STEP 1  🔍 RESEARCH  (area-scoped ONLY, never whole site)
        AB_TESTING_PLAYBOOK.md §8 (P1–P35) = primary source
        no match? 🙋 ASK "RAG search (archive) chalaun, ya library se chalaun?"
        → run python scripts/search_tests.py (takes time) → save new technique
          as next P-pattern; or skip → build from existing patterns
        → verify live DOM for FOCUS_AREA → write selectors
        to AI/site_profiles.md + runner tokens to AI/site_profiles.json
                                        ▼
   STEP 1b 🎨 DESIGN CONTRACT  (look at Figma ONCE — cache the understanding)
        static refs (Figma/design targets) → tools/cache_vision.js (sha256@model@vN)
        → AI_DATA/vision_cache/  (NEVER cache control/live renders — always fresh)
        → AI_DATA/design_contract.json (tokens→css, layout→geom, copy→eq)
        → node tools/contract_to_spec.js → design checks in spec.json
        → append behavioral checks by hand (settle.*/js/noPageErrors)
        → Figma stays ground truth; contract is the cache (user-vetted, spot-validated)
                                        ▼
   STEP 2  🏗️ WRITE CODE  (minimum to be QA-ready)
        variation1/variation.js + variation.css   (EG-<ID> body class, scoped CSS)
        share.js (tracking) / v1.json (platform) / spec.json (QA plan — MUST exist)
                                        ▼
   STEP 3  🧪 QA   🙋 RULE: ASK "QA chahiye (manual ya AI), ya skip karna hai?"
        ┌─────────────┬──────────────┬───────────────┐
        ▼ manual      ▼ AI           ▼ skip (no QA)
      🎯 AI-directs   node qa_run    → straight to STEP 4,
      → shot-list     --spec "<test>/ → mark UNVERIFIED in handover
      (desktop/mobile/  AI_DATA/      (user ships as-is, knowingly)
      click states)     spec.json"    runner is GENERIC —
      → what to verify  site facts from site_profiles.json,
      → user sends      checks from spec.json (batch/noPageErrors/
        screenshots +   pagination/waitJs/scrollAll/geom) → ✅ all PASS →
        bug reports →   screenshot vs mockup → selector audit
        AI analyzes →   (forbidden anchors) → "Ready to share"
        pass or fix (loop)   + --viewport WxH (mobile/tablet emulation)
                                        ▼
   STEP 4  🧠 KNOWLEDGE LOOP  (kit must be STRICTLY more capable after each test)
        metadata.json / readme.md / qa_prep.json
        SITE_PROFILES.md + site_profiles.json  (verified DOM facts, area-wise)
        new P-pattern → playbook §8   → bump P1–Pxx count everywhere
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
| **0b** | Scaffold | Copy root templates → `../ABTESTSWITHAI/CLIENT/TEST_NAME/` | Root `variation1/` is read-only |
| **0b.5** | Input gate | Ask where the user's material lives → images into `user_inputs/test_images/`, PDF/DOCX etc. into `user_inputs/`, meaningful file names | (a) all / (b) partial / (c) none → never blocks |
| **0c** | Q&A gate | Ask only what the kit doesn't know (U/L/N/P/C/S/F/G/H banks) | Max 6–8 questions |
| **1** | Research | Playbook §8 (P1–P35) → no match? **ask run-or-skip RAG search** → verify only the FOCUS_AREA live → save selectors | Area-scoped only |
| **1b** | Design contract | Cache static refs (`cache_vision.js`) → write `design_contract.json` → generate design checks (`contract_to_spec.js`) → append behavioral checks | Figma = ground truth, contract = cache |
| **2** | Write code | `variation1/` (`variation.js`/`.css` + `v1.json` + `share.js`) + **`AI_DATA/spec.json`** | `spec.json` must exist |
| **3** | QA | Ask **manual / AI / skip**. **AI:** run `qa_run.js` + visual check + audit. **Manual:** AI gives shot-list + what-to-verify; user sends screenshots + bug reports; AI analyzes → pass or fix. **Skip:** no QA, hand over as UNVERIFIED | All checks PASS |
| **4** | Knowledge loop | Profiles, P-pattern, questions, tools → back into the kit | Update `flow.md` too |

---

## ⚠️ Golden rules

- 🏗️ **Templates** — root `variation1/`, `share.js`, `v1.json`, `metadata.json`, `design_contract.json` are the source of truth. Copy, never edit.
- 📥 **User material lives in `AI_DATA/user_inputs/`** (images → `test_images/`, everything else → loose/own folders). Never reference files the user pasted anywhere else — copy them into `user_inputs/` first.
- 🧩 **QA runner is client-agnostic** — reads site facts from `AI/site_profiles.json`, checks from the test's `spec.json`. No runner edits per client/test.
- 🚫 **No weak/vacuous passes** — spec checks must actually exercise their claim, or they *fail*.
- 🔄 **Keep this file in sync** — any step/file/tool/count change → update `flow.md` in the same commit (rule in `AGENTS.md` / `AI/AGENTS.md` STEP 4).
