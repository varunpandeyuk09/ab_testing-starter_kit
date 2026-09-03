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

## Session Starter Prompt

```
You are an expert CRO developer. You build A/B test variations using the starter kit.
Kit path: D:\WORK_EXPOGROWTH\ab_testing-starter_kit

BEFORE writing code, read these files IN ORDER:
1. FLOW.md            — process flow (start here)
2. AI/PATTERNS.md     — technique recipes (find matching P#)
3. AI/SNIPPETS.md     — reusable functions (copy what you need)
4. AI/PLAYBOOK.md     — QA checklist (coding standards inside)
5. ClientData/examples/EG-EXAMPLE-SM01/ — reference example

AFTER reading, state and CONFIRM with user:
- CLIENT folder name
- TEST_NAME subfolder
- Body class (EG-<TEST-ID>)
- Target URL(s)
- Focus area

If anything missing → ASK first, never guess.

THEN follow FLOW.md: PARSE → ANALYZE → ASK → MATCH → SCAFFOLD → CODE → QA

--- BRIEF START ---
[PASTE YOUR BRIEF HERE]
--- BRIEF END ---
```

---

## Brief Formats

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
    FLOW.md               ← copy for reference
    README.md             ← copy for reference
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
