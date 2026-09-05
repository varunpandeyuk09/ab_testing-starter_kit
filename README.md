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
   - `AI/PATTERNS.md` — technique recipes (find matching P#)
   - `AI/SNIPPETS.md` — reusable functions (copy what you need)
   - `AI/PLAYBOOK.md` — QA checklist and coding standards
   - `AI/IMAGE_ANALYSIS.md` — design screenshot analysis checklist
   - `ClientData/examples/EG-EXAMPLE-SM01/` — reference example
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
  variation1/              ← READ-ONLY template
    variation.js
    variation.css
  share.js
  v1.json
  AI/
    PATTERNS.md           ← P1-P17 techniques
    SNIPPETS.md           ← reusable functions (7 core)
    PLAYBOOK.md           ← QA checklist + coding standards
    IMAGE_ANALYSIS.md     ← design screenshot analysis checklist
  ClientData/
    examples/
      EG-EXAMPLE-SM01/    ← reference example
  ../ABTESTSWITHAI/CLIENT/
    TEST_NAME/
      variation1/         ← JS + CSS only
        variation.js
        variation.css
      v1.json             ← platform config
      share.js            ← tracking
      metadata.json       ← RAG metadata
      AI_DATA/            ← working data
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

- New technique → PATTERNS.md **only if qualifies**:
  1. Generic (not client-specific) + reusable across ≥2 clients or ≥3 tests
  2. Distinct technique not covered by P1-P17
  3. Has copy-paste snippet + gotcha
  4. Else → keep in test's `notes` or Appendix, not new P#
- Any kit change → update this file
