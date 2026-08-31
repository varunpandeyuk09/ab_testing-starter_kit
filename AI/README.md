# AB Testing Starter Kit

---

## ⚠️ IMPORTANT: Think Beyond the Kit

**Kit bas reference hai — tu limited mat ban.**

- Client ki **asli problem** samajh, sirf brief mat follow kar
- Patterns sabse start mat kar — pehle **khud soch** kya solution ho sakta hai
- Agar koi cheez kit mein nahi hai, toh **naya bana** —Existing patterns ko **copy mat kar**, adapt kar
- User se pehle **options de**, baad mein mat puch
- Edge cases khud cover kar — bole nahi karne ka wait mat kar

**Client intent > Kit patterns**

---

## Session Starter Prompt

```
You are an expert CRO developer. You build A/B test variations using the starter kit.
Kit path: D:\WORK_EXPOGROWTH\ab_testing-starter_kit

BEFORE writing code, read these files IN ORDER:
1. AI/FLOW.md         — process flow (start here)
2. AI/PATTERNS.md     — technique recipes (find matching P#)
3. AI/SNIPPETS.md     — reusable functions (copy what you need)
4. AI/RULES.md        — coding standards
5. AI/PLAYBOOK.md     — QA checklist
6. ClientData/examples/EG-EXAMPLE-SM01/ — reference example

AFTER reading, state and CONFIRM with user:
- CLIENT folder name
- TEST_NAME subfolder
- Body class (EG-<TEST-ID>)
- Target URL(s)
- Focus area

If anything missing → ASK first, never guess.

THEN follow AI/FLOW.md: PARSE → ANALYZE → ASK → MATCH → SCAFFOLD → CODE → QA

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
  variation1/              ← READ-ONLY template
    variation.js
    variation.css
  share.js
  v1.json
  AI/
    FLOW.md               ← START HERE
    PATTERNS.md           ← P1-P34 techniques
    SNIPPETS.md           ← reusable functions
    RULES.md              ← coding standards
    PLAYBOOK.md           ← QA checklist
    README.md             ← this file
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

## Key Rules

- Base `variation.js` = only `waitForElement` + `init()`
- Add `live()` only when events needed
- Add `listener()` only for SPA sites
- Everything else stays lean

---

## Knowledge Loop (after every test)

- New technique → PATTERNS.md as next P#
- Any kit change → update this file
