# AB Testing Starter Kit

---

## ⚠️ IMPORTANT: Think Beyond the Kit

**The kit is only a reference — don't limit yourself.**

- Understand the client's **real problem**, don't just follow the brief
- Don't start from patterns — **think first** what the solution could be
- If something is not in the kit, **create it** — don't copy existing patterns, adapt them
- Give **options upfront** to the user, don't ask later
- Cover **edge cases** yourself — don't wait to be told

**Client intent > Kit patterns**

---

## How to Use This Kit

1. **Provide a brief** — paste your brief in any format below
2. **Read the files in order** when beginning a new test:
   - `FLOW.md` — process flow
   - `AI/brain/LEARNED-MEMORY.md` — CRO Brain (SECTIONS 1-9: approaches + P1-P20 patterns + QA playbook, 100+ tests)
   - `AI/guides/SNIPPETS.md` — reusable functions (copy what you need)
   - `AI/guides/IMAGE_ANALYSIS.md` — design screenshot analysis checklist
   - `AI/guides/SMART-COMMUNICATION-GUIDE.md` — communication templates (email, WhatsApp, client updates)
   - `ClientData/examples/EG-EXAMPLE-SM01/` — reference example (only examples, not other ClientData)
   - **Do NOT read** `communications/` — private, gitignored (client/manager comms, not for AI)
   - **Do NOT read** `ClientData/<CLIENT>/` other folders — only `ClientData/examples/` for initial read
3. **Follow the flow** — PARSE → ANALYZE → DESIGN → ASK → MATCH → SCAFFOLD → CODE → QA
4. **If anything is missing** — ASK first, never guess

---

## Brief Formats

Paste your brief in any of these formats:

**Trello card:**
```
ABC | AB01 | Product Tile Optimization
For abcstore.example.com, adjustments to all tiles on PLP:
- Remove button
- Price font 25px
- SALE badge right side, 6px border radius
```

**URL + description:**
```
Website: https://abcstore.example.com/collections/all
Test: Make product price bigger, hide add to cart on PLP
```

**Mixed language:**
```
ABC | AB01 | Product Tile Optimization
abcstore.example.com pe product tiles mein se button hatana hai,
price 25px krni hai
```

**With design reference:**
```
ABC | AB01 | Trust Section Redesign
Website: https://abcstore.example.com/product/xyz
Add trust badges below H1
[Figma screenshot attached]
```

---

## Structure

```
ab_testing-starter_kit/
  FLOW.md                 ← START HERE (also in AI/)
  README.md               ← this file (also in AI/)
  communications/         ← PRIVATE, gitignored — DO NOT READ (client/manager comms)
  AI/
    brain/                ← CRO Brain (single source, learned memory from 100+ tests)
      LEARNED-MEMORY.md   ← SECTIONS 1-9: approaches + P1-P20 patterns (SEC 8) + QA playbook (SEC 9)
    guides/               ← grouped knowledge (AI must read)
      SNIPPETS.md         ← reusable functions (8 core)
      IMAGE_ANALYSIS.md   ← design screenshot analysis
      SMART-COMMUNICATION-GUIDE.md ← communication templates (email, WhatsApp, client updates)
      AB-TEST-CODEBASE-SUMMARY.md
    templates/            ← boilerplate (AI read if needed)
      share.js
      v1.json
      EG-SPA-HELPER.js
  docs/                   ← generic setup docs (outside AI)
    SHOPIFY-GIT-SETUP.md
  ClientData/
    examples/             ← ONLY this for AI initial read
      EG-EXAMPLE-SM01/    ← reference example
    <CLIENT>/             ← Do NOT read initially (only examples)
  ../AB-test/<CLIENT>/
    <TEST_NAME>/
      variation1/         ← JS + CSS only
        variation.js
        variation.css
      v1.json             ← platform config
      share.js            ← tracking
      metadata.json       ← RAG metadata
      AI_DATA/            ← working data
      shopify/
        theme/            ← Shopify theme if needed (AB-test/<CLIENT>/<TEST>/shopify/theme)
```

---

## Requirements

- **Python 3.8+** — for `scripts/qa_validate.py` (automated QA). If not installed, QA will be manual only — test still runs.
- **Node.js (optional)** — for `node --check` syntax validation, not required.
- No other dependencies — vanilla JS/CSS inject via Optimizely/VWO.

---

## Key Rules

- Base `variation.js` = only `waitForElement` + `init()`
- Add `live()` only when events needed
- Add `listener()` only for SPA sites
- Everything else stays lean

---

## Knowledge Loop (after every test)

- New technique → LEARNED-MEMORY.md:8 **only if qualifies**:
  1. Generic (not client-specific) + reusable across ≥2 clients or ≥3 tests
  2. Distinct technique not covered by P1-P20 (see SEC 8)
  3. Has copy-paste snippet + gotcha
  4. Else → keep in test's `notes` or Appendix, not new P#
- QA/process change → LEARNED-MEMORY.md:9
- Any kit change → update this file
- Archive note: PATTERNS.md + PLAYBOOK.md merged into LEARNED-MEMORY.md:8/9 on 16 Sep 2026 — do not recreate; update brain directly
