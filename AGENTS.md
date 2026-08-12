# AGENTS.md — AB Testing Starter Kit

You have been given access to this AB testing starter kit.
Read the following files IN ORDER before doing anything else — before analyzing, before planning, before writing a single line of code.

## Read these files first (mandatory)

1. `AI/AGENTS.md`               — your complete step-by-step build instructions
2. `AI/PROMPT_PARSING.md`       — how to extract CLIENT and TEST_NAME from any brief
3. `AI/question_templates.md`   — pre-code Q&A gate (ask only what the kit doesn't know)
4. `AI/AB_TESTING_PLAYBOOK.md`  — coding standards (read in full) + pattern INDEX; the full P1–P38 recipes live in `AI/AB_TESTING_PATTERNS.md` (open ONLY the matching pattern)
5. `ClientData/examples/EG-EXAMPLE-SM01/readme.md`            — what correct output looks like
6. `ClientData/examples/EG-EXAMPLE-SM01/variation1/variation.js`  — reference JS (match this standard)
7. `ClientData/examples/EG-EXAMPLE-SM01/variation1/variation.css` — reference CSS (match this standard)
8. `ClientData/examples/EG-EXAMPLE-SM01/share.js`             — reference tracking file
9. `flow.md`                    — the end-to-end flow of the kit (single source of truth; update it whenever any step/file/tool/count changes)

Then, before inspecting a client's site, check `ClientData/SITE_PROFILES.md` — it stores
verified DOM facts (selectors, AJAX endpoints, theme gotchas) per client so you don't
re-autopsy a site you've already worked on. `ClientData/site_profiles.json` is the
machine-readable facts store (the AI never runs QA — QA is always the user's job).

> `ClientData/` is the ONLY place client-specific data lives (profiles, examples, client
> tools). The rest of the kit is generic and shareable. If `ClientData/` is missing/empty,
> the kit still works — every session just verifies client facts from scratch.

## Ask, don't guess — the user IS your browser

You have no browser. Live-page facts (request shapes, response bodies, DOM after a click,
console errors) can only come from the user. When a fact you need isn't already in the
kit, ASK for it (one paste / screenshot / console log) instead of building speculative
workarounds. If a guess fails once live → STOP and ask. Never loop guesses.

## What the AI NEVER does (hard bans — saves the "faltu deep dive")

- **Never opens a browser / headless browser / CDP** — the user has the browser.
- **Never takes screenshots** (no QA screenshots, no vision pipeline unless the USER
  provides the image in `user_inputs/`).
- **No bulk fetching / scraping** — at most ONE `Invoke-WebRequest`/`webfetch` per page
  to read SSR HTML; more than a couple of fetches = you're guessing → STOP and ask the
  user. Never loop curl commands.
- **No archive RAG search auto-runs** — the fallback search runs ONLY if the user says
  "yes, run it".
- **Never runs QA** (QA is ALWAYS the user's job; the AI never judges pass/fail).
- **No whole-site research** — verify facts only for the FOCUS_AREA the brief touches.

## Do not start until you have confirmed

After reading the files above, state:
- CLIENT folder name (e.g. `CLIENTX`)
- TEST_NAME subfolder (e.g. `AB01 Product Tile Optimization`)
- Body class (e.g. `EG-CLIENTX-AB01`)
- Target URL(s)
- FOCUS_AREA (e.g. `navigation` / `product` / `checkout` / `section` / `form` / `page` / `search`)

If any of the above cannot be determined from the brief → ask the user before proceeding.
Then run the **Q&A gate** (`AI/question_templates.md`, AGENTS.md STEP 0c) before researching
or coding — ask only what the brief and the kit don't already answer; collect the answers
and write them to `qa_prep.json` **now** (STEP 0c, not deferred — the flow gate checks it).

## Flow gate (mandatory — do not skip steps)

The flow is ENFORCED mechanically, not just documented. Run after EVERY step:

```
node tools/flow_gate.js "<test folder>"
```

Any `FAIL` → STOP, fix that step, re-run the gate, then continue. The gate enforces the
same checks for every test. A fresh session MUST run the gate before touching a test.

## Critical rule

All output goes into `../ABTESTSWITHAI/CLIENT/TEST_NAME/` — NEVER into the root `variation1/` folder (read-only template). Every test folder has exactly TWO subfolders:
- `variation1/` — the DEPLOY PACKAGE (everything the platform runs): `variation.js`, `variation.css`, `v1.json`, `share.js`, `metadata.json`
- `AI_DATA/` — ALL AI/QA working data (never touched by the platform): `qa_prep.json`, `session_notes.md`, `readme.md`, `user_inputs/` (images → `test_images/`, everything else loose), `user_qa.md`

## Knowledge feedback loop (after every test)

The kit gets faster with every completed test. Before finishing a test, write its verified
learnings back into the kit (see `AI/AGENTS.md` STEP 4):
- **Knowledge diff (user-approved)** — STEP 4 starts with a mini self-check: draft the NEW facts learned (from `session_notes.md`), show the user in ONE message, wait for approval, then write ONLY the approved facts. Unapproved guesses never reach a profile — this is the drift protection.
- Mid-session facts → `AI_DATA/session_notes.md` (append throughout the session, not just at the end); STEP 4 folds them into the profiles.
- Verified DOM facts → `ClientData/SITE_PROFILES.md` (client section) + selectors/facts → `ClientData/site_profiles.json`
- New technique → next P-pattern in `AI/AB_TESTING_PATTERNS.md` + a row in the playbook §8 index
- Reusable script → `tools/`
- Update the `P1–Pxx` count in AGENTS.md / playbook / README when you add a pattern
- **If any step, file, folder, tool, flag, or count changed → update `flow.md` (root) in the SAME commit.** `flow.md` is the single source of truth for how the kit works; it goes stale the moment a change isn't mirrored there.

## Templates (copy these, never edit them)

Blank templates live at the kit ROOT and are the source of truth:
- `variation1/variation.js` and `variation1/variation.css` — base wrapper + CSS
- `share.js` and `v1.json` — tracking + platform config
- `metadata.json` — RAG metadata (fill in per test)

The `AI/` copies of `share.js`/`v1.json` are backups. `ClientData/examples/EG-EXAMPLE-SM01/` is a filled reference example ONLY — never copy its values into a real test.
