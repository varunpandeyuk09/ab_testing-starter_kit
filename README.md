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
    - `AGENTS.md` — MUST rules + router (slim, read first)
    - `docs/agents/` — detail files, load on demand (rules, snippets S1-S8, patterns P1-P104, platforms, pitfalls, communication records)
    - `docs/agents/17-image-analysis.md` — design screenshot analysis checklist
    - **Do NOT read** `communications/` — private, gitignored (client/manager comms, not for AI)
   - **Do NOT read** `ClientData/<CLIENT>/` — only AGENTS.md for initial read
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
  FLOW.md                 ← START HERE
  README.md               ← this file
  AGENTS.md               ← MUST rules + router (slim, points to docs/agents/)
  docs/
    agents/               ← detail files: 01 core rules, 02 scaffold, 03 snippets S1-S8,
                            04-05 JS/CSS patterns, 06 quick P1-P20, 07 test types,
                            08 CRO, 09 platforms, 10 pitfalls, 11-13 advanced P21-P104,
                            14 share.js, 15 stats, 16 communication records, 17 design analysis — load on demand, never all at once
  communications/         ← PRIVATE, gitignored — DO NOT READ (client/manager comms)
  scripts/                ← utility scripts
    qa_validate.py        ← automated QA
  docs/                   ← setup docs + AI detail files
    SHOPIFY-GIT-SETUP.md
    agents/               ← AI brain details (see above)
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

- Read `AGENTS.md` first — MUST rules + index of `docs/agents/` detail files
- Base `variation.js` = only `waitForElement` + `init()`
- Add `live()` only when events needed
- Add `listener()` only for SPA sites
- Everything else stays lean

---

## Knowledge Loop (after every test)

- New technique → `docs/agents/` **only if qualifies**:
  1. Generic (not client-specific) + reusable across ≥2 clients or ≥3 tests
  2. Distinct technique not covered by P1-P104 (see `docs/agents/06-quick-patterns.md`)
  3. Has copy-paste snippet + gotcha
  4. Else → keep in test's `notes`, not new P#
- QA/process change → `docs/agents/10-pitfalls.md`
- Any kit change → update this file
