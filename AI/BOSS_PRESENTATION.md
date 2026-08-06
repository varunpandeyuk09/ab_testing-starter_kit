# A/B Test Starter Kit — Presentation for Management

**One-line summary:** A self-contained "AI brain" that builds agency-standard A/B tests from a single brief, without training the AI model — the knowledge lives in the files, and the files grow smarter with every test.

---

## 1. What is it?

The starter kit is a **folder of instructions + templates + a search tool** that teaches an AI how to build A/B tests the same way our senior developers do.

Any AI model (Claude, GPT, opencode, etc.) reads these files once, then builds a complete, production-ready test in minutes.

```
ab_testing-starter_kit/
├── AGENTS.md                  ← entry instructions (what to read, in order)
├── variation1/                ← blank JS/CSS templates (copied for every test)
├── share.js, v1.json,
│   metadata.json              ← blank templates (tracking, config, metadata)
├── AI/
│   ├── AGENTS.md              ← step-by-step build instructions
│   ├── PROMPT_PARSING.md      ← extracts CLIENT / TEST NAME from any brief
│   ├── AB_TESTING_PLAYBOOK.md ← the coding standard + 12 reusable patterns
│   ├── examples/              ← a complete, correct reference test to copy
│   └── snippets/              ← optional helpers (events, SPA routing)
└── scripts/
    └── search_tests.py        ← searches the 2500+ old tests (fallback)
```

---

## 2. How was it built?

**Step 1 — Study the archive.** We analysed 2500+ shipped tests from the `AB-test` folder (MONASH, PRAXINDO, REVIVSERUMS, GUARDIAN FUNERALS, JUVIA and more).

**Step 2 — Distill into patterns.** The most common techniques were compressed into **reusable patterns (P1–P24)**, with the second batch (P13–P24) harvested from a full-archive scan for novel techniques:
- P1 Image Swap (lazy-load safe) · P2 Insert New Section · P3 Sticky Elements · P4 DOM Reordering · P5 Surviving AJAX Re-renders · P6 SPA Routing · P7 Click Tracking · P8 Form Restructure · P9 Loading External Libraries · P10 Text/Price/Badge Swap · P11 Device-Switch (desktop/mobile) · P12 Persistent State
- P13 AJAX XHR Hook · P14 React Controlled Inputs · P15 Library Waiters · P16 Cookie Helpers · P17 Exit-Intent Popup · P18 Cart-Reactive Progress Bar · P19 Date Math · P20 Cross-Page Fetch/Clone · P21 IP-Geo Swap · P22 CSS-Only Carousel · P23 0fr/1fr Accordion · P24 rAF + ResizeObserver

**Step 3 — Write the rulebook.** Every standard our team follows was documented: base script wrapper, stable selectors, naming, CSS scoping, QA checklist, and forbidden anti-patterns.

**Step 4 — Keep the archive alive.** The old tests are NOT thrown away. If a brief doesn't match any pattern, the AI runs a search script that finds similar past tests and learns from their code.

**Step 5 — Make it self-learning.** Every time the AI learns a new technique from the archive, it **appends it to the playbook as a new pattern**. The kit gets smarter after every single use.

> **Why no AI training?** You cannot fine-tune a hosted AI model with your own data. But you don't need to — the knowledge is stored in files that every AI session reads. The model doesn't remember; the files remember.

---

## 3. How to use it (workflow)

**Step 0 — Paste one brief.** Any format works: Trello card title, English, mixed Hinglish, just a URL + request.

```
TRO | SM22 | Product Tile Optimization
On trooper.ch, remove the button from all product tiles,
set the price to 25px and put the SALE badge on the right with 6px border radius.
```

**Step 1 — AI confirms.** It states the client, test name, body class and URL before touching anything.

**Step 2 — AI scaffolds + builds.** It creates the test folder, copies the blank templates, inspects the live website for stable selectors, then writes `variation.js`, `variation.css`, `share.js` and `v1.json`.

**Step 3 — QA + deliver.** It runs the QA checklist and saves everything to `ABTESTSWITHAI/CLIENT/TEST_NAME/`.

**Result:** a complete test that matches our exact house style — every time, on any machine, by any developer.

---

## 4. Token usage (how much does one test cost?)

An AI session consumes "tokens" — the unit the AI reads and writes. Here is the real cost per test:

### Reading the kit (one-time per session) — the main cost

| File | Size | ~Tokens |
|---|---|---|
| AI/AB_TESTING_PLAYBOOK.md | 26 KB | ~7,500 |
| AI/AGENTS.md | 8 KB | ~2,100 |
| AI/README.md | 7 KB | ~1,900 |
| AI/PROMPT_PARSING.md | 4 KB | ~1,200 |
| Example test (6 files) | 16 KB | ~4,400 |
| Templates (root) | 6 KB | ~1,300 |
| **Reading total** | **~67 KB** | **~18,400** |

### Writing the test

| Output | ~Tokens |
|---|---|
| variation.js + variation.css | ~2,500 |
| share.js + v1.json + metadata | ~1,000 |
| **Writing total** | **~3,500** |

### Grand total per test

| Scenario | Input | Output | **Total** |
|---|---|---|---|
| Normal brief (90% of tests) | ~18,500 | ~3,500 | **~22,000 tokens** |
| Rare brief → RAG fallback (10%) | +3,000 | — | **~25,000 tokens** |

**Put in plain numbers:**
- One test ≈ **22,000–25,000 tokens** (~80 KB of text, about 1.5 short PDF pages).
- Same session can build **multiple tests** — the ~18k reading cost is paid once, each extra test only adds the ~4k write cost.
- Cost on typical AI pricing ≈ a few cents per test (exact rate depends on the model/plan used).

---

## 5. What you get

| Before (manual) | With the kit |
|---|---|
| 2–3 hours per test | **15–25 minutes** per test |
| Style depends on who builds it | Same standard every time |
| Rare briefs = guesswork | RAG fallback → real past examples |
| Knowledge dies with the dev | Knowledge lives in files, grows with use |

**Speed:** ~10x faster. **Consistency:** identical house style. **Knowledge:** permanently retained and self-growing.

---

## 6. The one thing we need to do now

The kit is ready but needs **real usage**. The more tests it builds, the more patterns it absorbs from the archive, and the faster future tests become. Start with a small batch of 5–10 tests, then measure build time and quality.
