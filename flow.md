# FLOW.md — AB Testing Starter Kit: End-to-End Flow

Single source of truth for HOW the kit works. **Keep in sync:** whenever any step,
file, folder, tool, flag, or count changes → update this file in the SAME commit
(rule in `AGENTS.md` / `AI/AGENTS.md` STEP 4). For details, see `AI/AGENTS.md` (STEP 0–4),
`AI/question_templates.md` (Q&A gate), `tools/qa_run.js` (runner) — this file is the map, not the manual.

```
                 ┌─────────────────────────────────────────────┐
                 │        INPUT: Client brief (any format)     │
                 └──────────────────────┬──────────────────────┘
                                        ▼
   STEP 0  PARSE  AI/PROMPT_PARSING.md  → CLIENT / TEST_NAME / TEST_ID(EG-…)
                                        → WEBSITE_URL / FOCUS_AREA
                        If any missing → ASK user, never guess
                                        ▼
   STEP 0b SCAFFOLD  Copy ROOT templates (variation1/, share.js, v1.json)
        → ../ABTESTSWITHAI/CLIENT/TEST_NAME/   (NEVER touch root variation1/)
                                        ▼
   STEP 0c Q&A GATE  AI/question_templates.md (U1–U19, L1–L13, N/P/C/S/F/G/H banks)
        1. gap-scan the brief          2. kit-lookup (drop what's already known:
        SITE_PROFILES.md, past qa_prep.json, playbook §8)     3. ask ONLY what's left
        → answers recorded → later saved to qa_prep.json
                                        ▼
   STEP 1  RESEARCH  (area-scoped ONLY, never whole site)
        AB_TESTING_PLAYBOOK.md §8 (P1–P31) = primary source  → no match? RAG search
        → verify live DOM for FOCUS_AREA → write selectors
        to AI/site_profiles.md + runner tokens to AI/site_profiles.json
                                        ▼
   STEP 2  WRITE CODE  (minimum to be QA-ready)
        variation1/variation.js + variation.css   (EG-<ID> body class, scoped CSS)
        share.js (tracking) / v1.json (platform) / spec.json (QA plan — MUST exist)
                                        ▼
   STEP 3  QA   RULE: ASK  "QA aap khud chalenge (manual), ya main chala dun (AI)?"
        ┌─────────────┬─────────────────────────────┐
        ▼ manual      ▼ AI (node tools/qa_run.js qa --spec "<test>/spec.json")
      give command     runner is GENERIC — reads site facts from site_profiles.json,
      + wait output    reads checks from spec.json (batch/noPageErrors/pagination/
                        waitJs/scrollAll) → 27/27 → screenshot vs mockup →
                        selector audit (forbidden anchors) → "Ready to share"
                                        ▼
   STEP 4  KNOWLEDGE LOOP  (kit must be STRICTLY more capable after each test)
        metadata.json / readme.md / qa_prep.json
        SITE_PROFILES.md + site_profiles.json  (verified DOM facts, area-wise)
        new P-pattern → playbook §8   → bump P1–Pxx count everywhere
        new question → question_templates.md   → reusable script → tools/
        any kit change → update THIS file (flow.md) in the same commit
                                        ▼
                        OUTPUT: ../ABTESTSWITHAI/CLIENT/TEST_NAME/
```
