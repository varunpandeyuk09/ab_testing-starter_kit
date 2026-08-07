# AGENTS.md — AB Testing Starter Kit

You have been given access to this AB testing starter kit.
Read the following files IN ORDER before doing anything else — before analyzing, before planning, before writing a single line of code.

## Read these files first (mandatory)

1. `AI/AGENTS.md`               — your complete step-by-step build instructions
2. `AI/PROMPT_PARSING.md`       — how to extract CLIENT and TEST_NAME from any brief
3. `AI/AB_TESTING_PLAYBOOK.md`  — coding standards and reusable patterns library (P1–P27)
4. `AI/examples/EG-EXAMPLE-SM01/readme.md`             — what correct output looks like
5. `AI/examples/EG-EXAMPLE-SM01/variation1/variation.js`  — reference JS (match this standard)
6. `AI/examples/EG-EXAMPLE-SM01/variation1/variation.css` — reference CSS (match this standard)
7. `AI/examples/EG-EXAMPLE-SM01/share.js`              — reference tracking file

Then, before inspecting a client's site, check `AI/SITE_PROFILES.md` — it stores verified
DOM facts (selectors, AJAX endpoints, theme gotchas) per client so you don't re-autopsy
a site you've already worked on.

## Do not start until you have confirmed

After reading the files above, state:
- CLIENT folder name (e.g. `TROOPER`)
- TEST_NAME subfolder (e.g. `SM22 Product Tile Optimization`)
- Body class (e.g. `EG-TRO-SM22`)
- Target URL(s)

If any of the above cannot be determined from the brief → ask the user before proceeding.

## Critical rule

All output files go into `../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/` — NEVER into the root `variation1/` folder.
The root `variation1/` is a read-only template. Do not touch it.

## Knowledge feedback loop (after every test)

The kit gets faster with every completed test. Before finishing a test, write its verified
learnings back into the kit (see `AI/AGENTS.md` STEP 4):
- Verified DOM facts → `AI/SITE_PROFILES.md` (client section)
- New technique → next P-pattern in `AI/AB_TESTING_PLAYBOOK.md` §8
- Reusable script → `tools/`
- Update the `P1–Pxx` count in AGENTS.md / playbook / README when you add a pattern

## Templates (copy these, never edit them)

Blank templates live at the kit ROOT and are the source of truth:
- `variation1/variation.js` and `variation1/variation.css` — base wrapper + CSS
- `share.js` and `v1.json` — tracking + platform config
- `metadata.json` — RAG metadata (fill in per test)

The `AI/` copies of `share.js`/`v1.json` are backups. `AI/examples/EG-EXAMPLE-SM01/` is a filled reference example ONLY — never copy its values into a real test.
