# AGENTS.md

## Role
You are building an A/B test variation for a premium CRO agency. Work must match the standards in `AB_TESTING_PLAYBOOK.md`.

---

## GATE RULE (MANDATORY — this is what prevents skipping steps)

Run the mechanical gate after **EVERY** step, before starting the next one. Check only
the phase that has actually been completed:

```
node tools/flow_gate.js "<test folder>" --through 0b
```

- Use `--through 0b`, `0b.5`, `0c`, `1`, `2`, `3`, or `4` after that named step. Omit
  `--through` only for the final full-flow check.
- **Any `FAIL` in the checked phase → STOP.** Fix that step first, re-run the gate, and only then proceed.
- `WARN` = note it, continue.
- `ALL PASS` → move to the next step.
- The gate is the *enforcement*; this document is only the *manual*. If a step is missing,
  the gate says so — never assume a step is done because you "remember" doing it. A fresh
  session or a resumed session MUST run the gate before touching anything.

---

## ASK-DON'T-GUESS — the user IS your browser (MANDATORY)

You have NO browser. Any fact that lives on the live page — request shape, response
body, DOM after a click, theme JS behavior, console errors — you CANNOT observe.

When you need such a fact and it is NOT already in the kit (`ClientData/SITE_PROFILES.md`,
`ClientData/site_profiles.json`, past `qa_prep.json`, playbook §8 index → `AI/AB_TESTING_PATTERNS.md`):
  → ASK the user to capture it (one console.log, one network-tab copy, one `outerHTML`
    paste, one screenshot). One round-trip to the user ≈ 1 minute.
  → NEVER build speculative code to "discover" the fact. If a guess fails ONCE on the
    live site, STOP guessing and ask. Max one speculative round, ever.
  → A guess-test-guess loop costs hours and is the #1 kit time-waster — it is banned.
  → FAIL ONCE = question the APPROACH, not just the guess (lesson: 5 tries on a DOM-move of a
    plugin-owned PayPal iframe never converged; antigravity fixed it by changing the approach
    on try 2). If the technique itself can't work, no number of retries fixes it. Stop and ask:
    who owns this element's lifecycle (plugin/SDK/theme)? does the site re-render it? Re-derive
    the approach from first principles before the next try — never re-try the same premise harder.

---

## STEP 0 — Parse the Brief & Scaffold the Folder (DO THIS FIRST, BEFORE ANY CODE)

**Before writing a single line of code**, do the following:

### 0a. Parse the brief
Read `AI/PROMPT_PARSING.md` and extract:
- `CLIENT` — the client folder name in CAPS (e.g. `CLIENTX`, `CLIENTY`)
- `TEST_NAME` — the full test name used as the subfolder (e.g. `AB01 Product Tile Optimization`)
- `TEST_ID` — the short ID used for the body class `EG-<TEST-ID>` (e.g. `AB01`)
- `WEBSITE_URL` — the target page URL(s)
- `FOCUS_AREA` — the part of the page the test actually touches. Standard areas:
  `navigation` (header, login, cart, search) | `product` (PDP, price, stock, add-to-cart) |
  `checkout` (cart page, popups, payment, confirmation) | `section` (one block/section being
  redesigned) | `form` (a form region, its fields, validation, submit) | `page` (full-page /
  template-level redesign) | `search` (search bar, results, facets).

If the brief is incomplete or ambiguous, **ask the user for the missing pieces before proceeding**. Do NOT guess and do NOT start writing code.

### 0a.5 — Classify test effort (AI decides from the brief — NEVER ask the user)

The user doesn't know the taxonomy; the AI judges from the brief's own signals, right after
parsing and BEFORE scaffolding (it changes how much machinery the rest of the flow runs).
Record the level in `session_notes.md` + `qa_prep.json` (`"effort"` field). Never present
"Lite/Standard/Heavy?" as a question — the user will just tell you the goal.

- **HEAVY** if ANY of: clones/reuses a site component that carries its OWN JS behavior
  (configurators, buy-boxes, sliders, carts, forms with `onSubmit`/AJAX — P33–P38); calls a
  site AJAX endpoint or needs the theme's real request shape; needs evidence front-loading
  (network request / full container outerHTML — U21/§2.5); cross-page or persistent state;
  multiple interactive sub-features; must survive re-render inside a JS-driven UI.
- **LITE** if ALL of: presentational/structural ONLY (hide, show, move, reorder, restyle
  EXISTING content); NO new behavior (no click handlers, no fetches, no AJAX, no state, no
  cloning-with-JS, no variant/conditional logic); single page/area; brief already specifies
  scope + exact target with no open design questions.
- **otherwise → STANDARD** (the full flow below, unchanged).

**Process per level:**
- **LITE** → scaffold the deploy package; Q&A gate auto-shrinks to 0–2 questions (only real
  gaps); no archive/RAG/deep research — a quick §8 pattern match (e.g. P4 move + CSS-first)
  is enough; `session_notes.md` 3–5 lines; knowledge diff (STEP 4.0) ONLY if a genuinely NEW
  site fact or technique was confirmed, else just `metadata.json` + minimal `readme.md`;
  `user_qa.md` is ALWAYS written (handover is non-negotiable). Target: brief → handover
  **~10–15 min** (a "hide this tab, move that block" test is minutes, not an hour).
- **STANDARD** → run the full flow exactly as written below.
- **HEAVY** → full flow + evidence front-loading (U21 / §2.5) + parity (U20) + the matching
  P33–P38 patterns. Budget real QA rounds — HEAVY tests are where clone/AJAX edge cases live.

**Decision rule:** when unsure → **STANDARD**. Never down-classify a test to save time — the
cost of missing a HEAVY signal is a 9-round QA loop (AB044), not 10 minutes.

### 0b. Create the folder structure immediately
Every test lives under `../ABTESTSWITHAI/CLIENT/TEST_NAME/` (outside the starter kit). **Never write to the root `variation1/` folder — it is a read-only template.**

Create this structure:
```
../ABTESTSWITHAI/CLIENT/
  TEST_NAME/
    variation1/                  ← DEPLOY PACKAGE (everything the platform runs)
      variation.js               ← STEP 2
      variation.css              ← STEP 2
      v1.json                    ← STEP 2 (platform config; file paths relative to variation1/)
      share.js                   ← STEP 2 (tracking)
      metadata.json              ← STEP 4 (RAG metadata)
    AI_DATA/                     ← ALL AI/QA working data (never touched by the platform)
      qa_prep.json               ← STEP 0c (Q&A record — write it RIGHT AFTER the gate, NOT deferred)
      session_notes.md           ← STEP 2+ (append facts ALL session; folded into profiles in STEP 4)
      user_qa.md                 ← STEP 3 (handover note: what changed + what the user should verify)
      readme.md                  ← STEP 4 (brief summary)
      user_inputs/               ← STEP 0b.5 (EVERYTHING the user pastes: images, PDF, DOCX)
        test_images/             ← figma / control / variation reference images
```

- Copy content from `variation1/variation.js` (root template) → `../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/variation.js`
- Copy content from `variation1/variation.css` (root template) → `../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/variation.css`
- Copy content from `share.js` (root template) → `../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/share.js`
- Copy content from `v1.json` (root template) → `../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/v1.json`
  (paths inside `v1.json` are relative to `variation1/`, so the template reads `./variation.css` etc.)
- Do NOT fill in `metadata.json` or `readme.md` yet — they are written in STEP 4 (they
  don't affect whether the test runs, so they wait). `qa_prep.json` is the EXCEPTION:
  write it in STEP 0c right after the Q&A gate, so the answers are never lost and the
  gate can verify the step was done.
- `AI_DATA/user_inputs/` is where the USER drops their raw material (Figma mockups, control
  captures, PDF/DOCX briefs, anything else). The AI creates `user_inputs/test_images/` for
  images. If the user shares files elsewhere, copy them into `user_inputs/` first.

### 0b.5 — INPUT GATE (ask BEFORE any research/code)

Right after scaffolding, ask the user where their material lives — do NOT start STEP 0c/1
until they answer. Prompt (adapt wording, keep the three parts):

```
📁 AI_DATA/user_inputs/ ban gaya — apna saara data yahan daal do:
   • Images (Figma/control/screenshots) → user_inputs/test_images/
   • PDF/DOCX (brief, requirements, research) → seedha user_inputs/ me
   • Aur kuch (fonts, old variation, CSV) → apna folder bana ke daal do

⚠️ File names meaningful rakho (figma_desktop.png, brief_v2.docx) —
   isse AI ko samajhne me direct help milti hai.
   (a) Sab daal diya   (b) Kuch daala hai   (c) Abhi kuch nahi hai — data baad me aa jayega
```

- **(a) / (b):** scan `user_inputs/` NOW — images → look at them once for design facts
  (Figma mockup, control); PDF/DOCX → read them for brief/requirements and fold their
  facts into the Q&A gate.
- **(c):** proceed with the brief text only; if material arrives later, re-run STEP 0b.5
  scan (and re-open the Q&A gate only if new facts contradict what was asked).
- Missing material NEVER blocks the flow — it just means fewer inputs now.

> **Template source of truth:** the blank templates live at the kit ROOT — `variation1/variation.js`, `variation1/variation.css`, `share.js`, `v1.json`. The copies under `AI/` are backups of the same templates. Always copy from the ROOT versions. The filled `ClientData/examples/EG-EXAMPLE-SM01/` files are reference examples ONLY — never copy those values into a real test.

**Scaffold all files before writing any implementation code.**

---

## STEP 0c — Ask Test-Specific Questions Before Any Research (Q&A GATE)

Read `AI/question_templates.md` FIRST. Then, before inspecting any site or writing
code, turn the brief into the minimum set of questions the kit cannot already answer:

1. **Gap-scan the brief** — mark every field the brief already answers
   (design mockup, URLs, goal, constraints, audience, behavior). Never re-ask those.
2. **Kit-lookup** — drop any question the kit already answers, in this order:
   - `ClientData/SITE_PROFILES.md` → this client's header + `### <FOCUS_AREA>` (includes
     `User-confirmed (Q&A, …)` bullets from past tests).
   - Same-client previous tests → their `qa_prep.json` + readme "Knowledge added".
   - `AI/AB_TESTING_PLAYBOOK.md` §8 index → if a pattern matches, its recipe is in `AI/AB_TESTING_PATTERNS.md`.
3. **Ask the user ONLY what's left** — max 6–8 questions, grouped, phrased for a
   business person (never selector-speak). Highest-risk first: design intent >
   behavior > scope > environment. You have NO browser — any behavior fact (e.g.
   minicart open trigger) can only be verified by the USER: ask them to check it
   once and report back, then record the answer.
4. **Collect every answer NOW and WRITE the record NOW** — `asked`, `skipped_known` (with
   reason), and `verified` (schema in `question_templates.md` §5) go straight into
   `../ABTESTSWITHAI/CLIENT/TEST_NAME/AI_DATA/qa_prep.json` **before leaving this step**.
   Do NOT defer it to STEP 4 — a deferred record is a lost record, and the flow gate
   treats a missing `qa_prep.json` as "STEP 0c not done".
   For a LITE brief with no remaining question, set `"gate_complete": true` in
   `qa_prep.json`; this records that the zero-question gate was deliberately completed.
5. **Ask the user for catalog/product data if the test touches products** (PDP, cart,
   upsells, prices): "Products/catalog data (handles, variant IDs, prices, images) ho to de
   do — nahi to ye specific facts aap live site se confirm kar dena (1 min ka kaam)."
   Never guess product facts, and never silently run a long catalog scrape the user could
   have provided in seconds.
6. **Front-load the evidence the code will need (clone/AJAX tests — pattern index P33–P38).**
   If the test clones a site component or calls a site AJAX endpoint, ASK IN THIS GATE for the
   three pastes that end guess-work (§2.5 cheat sheet): (a) the real Network-tab request for
   the action (URL + payload with encodings + headers), (b) the FULL container outerHTML
   (including `form=`-associated controls that live OUTSIDE the `<form>`), (c) a console log
   of the action. And if the variation reuses a site component, ask the PARITY question (U20):
   must it behave EXACTLY like the source (swatch → product + image + per-option sizes + qty
   range), or is a simplified version OK? Getting these at the gate turns AB044-style
   "make it like the PDP" QA rounds into build spec.

This gate is what makes the kit faster per test: things the user once answered are
never re-asked, and things the kit already verified are never re-verified.

---

## STEP 1 — Research Before Writing Code (AREA-SCOPED)

1. Read `AB_TESTING_PLAYBOOK.md` in full (same folder as this file — it is small now:
   standards + the §8 pattern INDEX only).
2. Match the task against the §8 pattern INDEX. Adopt the matching pattern(s): open ONLY
   the matched P# in `AB_TESTING_PATTERNS.md` and adapt it. NEVER read the patterns file
   end-to-end. This is the primary source — do NOT run a search unless no pattern fits.
3. **Fallback (only when NO pattern fits the brief):** before running the RAG search, ASK the user:
   **"RAG search (archive se similar past tests) chalaun, ya pattern library se kaam chalaun?"**
   Wait for their answer — the search takes time, so never auto-run it.
   - **Run it:** `python scripts/search_tests.py "your test description"` — auto-locates the `AB-test` archive anywhere on this machine and prints the top 3 similar past tests with their code. Study the returned examples, then **append the newly discovered technique to `AI/AB_TESTING_PATTERNS.md` as the next P-number (P33, P34, ...)**, with a short snippet, AND add a row to the playbook §8 index, so the library grows. Then adapt the pattern for the current brief.
   - **Skip it:** build from the existing P-patterns / your own knowledge; no archive search.
4. **Verify ONLY the FOCUS_AREA, never the whole site.** `ClientData/SITE_PROFILES.md` stores verified DOM facts per client, grouped **by area** (each `### Area` subsection is verified once and reused forever). `ClientData/site_profiles.json` is the machine-readable facts store (a user-side runner may read it) — keep both in sync when a fact changes.
   - Start by reading the client's profile for the **current FOCUS_AREA only** (plus the client's site-wide gotchas section).
   - If the area is already in the profile → **do not re-verify**; read the selectors and go straight to STEP 2. Re-verify only what the brief changes.
   - If the area is NOT in the profile → **ASK the user to paste what you need** (component `outerHTML`, a screenshot, one console log) — ask-don't-guess. Record only what you actually confirmed, area-wise, in `session_notes.md` and STEP 4. A navigation test verifies login/cart/search — nothing else. A section test verifies only that section's container + its anchors.
   - Site-wide gotchas (Cloudflare/auth, A/B platform, theme framework) are verified ONCE per client and live in the client's profile header — do not re-derive them per test.
5. **You cannot inspect the live page yourself.** "Never assume — verify against the actual page" means: the USER confirms on the actual page. Write selectors ONLY from facts the user pasted or that already sit in the profile. If a selector is a guess, ask for a paste before coding — do not ship it and let the user discover the break.

---

## STEP 2 — Write the Code (minimum to run)

**Write ONLY what the test needs to run:** `variation1/variation.js`,
`variation1/variation.css`, `share.js`, `v1.json`. `metadata.json`, `readme.md` and
`qa_prep.json` are written elsewhere (STEP 4 / STEP 0c); they are docs, not runtime.

**Start `AI_DATA/session_notes.md` at the FIRST fact you learn** (a selector the user
confirmed, a request shape, a user bug report, a decision) and append throughout the
session — do NOT wait for STEP 4. This file is what makes the kit faster: mid-session
facts are never lost, and STEP 4 folds them into the client profile.

### Study the Reference Example First
Before writing any code, read `ClientData/examples/EG-EXAMPLE-SM01/` — all 6 files.
This is a complete, correct, production-quality example. Your output should match this standard:
- Same IIFE structure and comment style
- Same `init()` pattern (orchestrates only, no logic inside)
- Same idempotency guards, same MO pattern, same CSS scoping
- Same section headers in JS and CSS

### Base script rule
The base `variation.js` contains ONLY `waitForElement` + `init()`. Do not add helpers you don't need:
- Add `live()` (from `snippets/live.js`) ONLY when the test binds events / click tracking.
- Add `listener()` (from `snippets/listener.js`) ONLY when the site is a SPA (routing via pushState).
- Add `getCookie`/`setCookie` (from `snippets/cookies.js`) ONLY when the test reads/writes cookies.
- Add `waitForJquery`/`waitForLibrary` (from `snippets/waitForLibrary.js`) ONLY when the code calls a site library (`$`, `Swiper`, `Slick`, `Munchkin`, ...).
- Otherwise keep the file lean. Never include helpers "just in case".

### Hard rules (violating any of these = redo)
- Start every `variation.js` from the base wrapper. Do NOT restructure the wrapper. `init()` is the ONLY entry point.
- Add the unique body class `EG-<TEST-ID>` inside `init()` (e.g. `EG-CLIENTX-AB01`). Scope ALL CSS under this class.
- Never use auto-generated/random selectors. Use `id`, stable classes, `data-*` attributes, or CSS chaining.
- Every selector must be a valid CSS selector. IDs starting with a digit are invalid as `#id` (`querySelector('#00N2v00000VhUGp')` throws `SyntaxError`) — use `[id="00N2v00000VhUGp"]` or a stable class/`data-*` attribute. Never build selectors from raw dynamic strings.
- **Forbidden anchors — never use as selectors (redo if found):**
  - `contains("...")` partial-class matching — use the exact class name, never a substring.
  - Bootstrap/grid utility classes: `.row`, `.col-12`, `.col-sm-6`, `.container`, `.mb-5`, `.d-flex`, etc.
  - Hashed/system-generated IDs (Salesforce `00N2v00000VhUGp`, CRM tokens, tool-injected IDs).
  - Tag-only headings (`#some-id h6`) — the tag may become `h5` or `p`.
  - Visual/utility classes (`.bg-gradient`, `.text-white`, `.shadow-sm`, `.font-bold`).
  - Positional selectors (`.row > div:nth-child(3)`).
- Stable-selector test: is it semantic, does it survive a theme/grid update, and is it identical on dev → staging → prod? If any answer is no, find a better anchor.
- **No stable selector exists (Salesforce CRM fields, tool-injected IDs)?** → ASK the user: "In fields ke liye koi stable class ya data-attribute hai, ya `name` attribute se kaam chalana padega?" Use `name` attribute as pragmatic fallback ONLY after user confirms no better option exists. Log the risk in `session_notes.md`: "Selector uses CRM-generated ID — unstable, could change on CRM update."
- Support multiple matching elements — loop where applicable. Guard against duplicate inserts: `if (!parent.querySelector('.eg-...')) { ... }`.
- Use `waitForElement(selector, trigger, 50, 15000)` to initialize. Never call `init()` before the required DOM exists.
- Every `setInterval`/`setTimeout` must self-clear or have a timeout. No infinite intervals/loops.
- MutationObservers: observe only the needed container, guard with an `isRunning` flag, disconnect when done. Never observe whole `document` unless necessary.
- No nested functions inside `init()`; helpers live at IIFE top level. `init()` only orchestrates.
- Keep code simple, modular and maintainable. Avoid overly complex logic. Write code a human can read, follow and hand over.
- JS comments only (no markdown/HTML comments in variation files). Comment every major function briefly.
- No `!important` unless required to override a site rule. No unscoped CSS.
- Never break existing site functionality or create global side effects.
- New element classes use lowercase `eg-` prefix. Never reuse site classes for our own elements.
- Load external libraries (e.g. sliders) only via on-demand script/link injection guarded by duplicate checks.
- Never modify anything inside the `AB-test` archive. The archive is read-only reference material.
- Every time the fallback search is used, a new pattern MUST be appended to `AI/AB_TESTING_PATTERNS.md` + a row in the playbook §8 index.

---

## Output files (full paths relative to starter kit)

Written in STEP 2 (runtime):
```
../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/variation.js     ← main implementation
../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/variation.css    ← scoped styles
../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/share.js         ← tracking only, no DOM mutation
../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/v1.json          ← platform config (paths relative to variation1/)
```
Written during the session (facts — never lost, folded in STEP 4):
```
../ABTESTSWITHAI/CLIENT/TEST_NAME/AI_DATA/session_notes.md    ← append as you learn (STEP 2+)
```
Written in STEP 4 (docs, after the test is ready to hand over):
```
../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/metadata.json    ← RAG metadata
../ABTESTSWITHAI/CLIENT/TEST_NAME/AI_DATA/readme.md           ← brief summary
```
`qa_prep.json` is NOT here — it is written in STEP 0c (right after the Q&A gate) so the
answers are never lost and the flow gate can verify STEP 0c happened.

⚠️ **NEVER write to `variation1/variation.js` or `variation1/variation.css` at the repo root. Those are read-only templates.**

---

## STEP 3 — Hand over for USER QA (AI does NOT run QA)

**QA is ALWAYS the user's job.** You never run QA, never take screenshots for QA, never
judge pass/fail, never ask "manual ya AI ya skip". The user QA's every test themselves.
The kit's job ends at a clean, complete handover.

1. When code + files are complete, write `AI_DATA/user_qa.md` — a short handover note:
   - **What changed** (1–3 lines)
   - **What to verify on the live page** — the 3–5 behaviors the change affects, in
     plain language ("size select pe correct size add hota hai", "click ke baad loader
     aata hai, phir cart khulta hai")
   - **Anything fragile/risky** worth a second look
2. Say clearly: **"Test ready — QA aap karo."** Then stop. Do NOT wait for QA results,
   do NOT analyze screenshots. The loop from here on is simply: *user tests → reports a
   bug → you fix → you update the handover note → repeat.*
3. Re-check every selector you used against the forbidden-anchor list (playbook §9) once
   before handover — cheap, catches the worst mistakes before the user does.
4. Then run STEP 4 (knowledge loop) — capture only facts you actually verified (code-level,
   or facts the user confirmed in their bug reports). Do not pad with guesses.
5. **Give the user the bug-report format in `user_qa.md`** — one line expected-vs-actual
   ("M selected but cart shows noSize (expected M)") + the console log (+ relevant DOM/network
   paste per `question_templates.md` §2.5). Ask them to batch independent bugs in ONE message
   instead of one-per-round; dependent bugs (can't see B until A is fixed) stay sequential.
   This is what keeps a clone-heavy QA loop at 1–2 rounds instead of 9 (AB044 lesson).

---

## STEP 4 — Capture Knowledge Back Into the Kit (MANDATORY before finishing)

Every completed test must leave its verified learnings in the kit. This feedback loop is
what makes the kit faster with every test. **Do all of the following that apply before you
hand over a test** — if a future session would have to re-verify something you already
verified, the test is NOT finished:

0. **Knowledge diff — the user approves BEFORE any fact is written (drift protection).**
   Read your `session_notes.md`, draft the list of NEW facts this session actually verified
   that are NOT already in the kit (stable selectors, AJAX endpoints, theme gotchas, a
   technique worth a pattern, a question the templates missed). Show the user the diff in
   ONE message — *"Ye facts kit me record karun?"* — and WAIT for approval. Write ONLY the
   approved facts. An unapproved guess never lands in a profile; this is what stops library
   drift (a fact that sits in `session_notes.md` but never reaches the profile is lost).

1. **Write the deferred docs** (they were held back in STEP 0b/STEP 2 on purpose):
   - `metadata.json` — RAG metadata for this test.
   - `readme.md` — brief summary + a short "Knowledge added" note listing which
     profiles / patterns / tools this test updated, so the loop stays traceable.
   - `session_notes.md` — this is NOT new work: you kept it appended all session. Just
     make sure it's complete; it is the raw material for the profiles below.
   - (`qa_prep.json` is NOT deferred — it was written in STEP 0c with the Q&A answers.
     Only re-open it here if the gate flags it.)

2. **`ClientData/SITE_PROFILES.md`** — from the APPROVED diff (step 0), add a `## CLIENT` section
   (or update the existing one) with ONLY facts you confirmed against the live DOM: stable
   selectors, AJAX endpoints, theme gotchas, and the working technique. Mark each fact with
   the test that proved it (`Verified in: ../ABTESTSWITHAI/<CLIENT>/<TEST_NAME>`). Never
   record assumptions.
   **Your `session_notes.md` is the source for this — fold its facts in, do not re-derive
   them.**
   **Record AREA-WISE:** the client header holds site-wide gotchas (auth/Cloudflare, A/B
   platform, framework); everything else goes under the `### <FOCUS_AREA>` subsection
   (`navigation` / `product` / `checkout` / `section` / `form` / `page` / `search`).
   Only append the areas this test actually touched — never a full-site dump. Future tests
   read only their own area + the header, and never re-verify what is already recorded.
   **Add `User-confirmed (Q&A, <TEST_NAME>):` bullets** for facts the USER gave in the Q&A
   gate (STEP 0c) — mark them as user-said, not DOM-verified, so future sessions trust but
   may re-verify. This is what shrinks the Q&A gate over time.
   **ALSO sync `ClientData/site_profiles.json`** — the machine-readable facts store. Any fact a
   future test needs for this client (stable selectors, AJAX endpoints, add-to-cart
   selectors, theme gotchas) is ADDED or UPDATED there, or the client's first profile
   entry is created. A new client with no entry yet MUST get one before its first test runs.

3. **`AI/AB_TESTING_PATTERNS.md` + playbook §8 index** — if the test used a technique that
   is NOT already a pattern, append it to `AI/AB_TESTING_PATTERNS.md` as the next P-number
   (P33, P34, ...) with a short recipe + `Source:` line, and add a row to the §8 index in
   `AB_TESTING_PLAYBOOK.md`. Then update every `P1–Pxx` reference in `AGENTS.md` /
   `AB_TESTING_PLAYBOOK.md` / `AB_TESTING_PATTERNS.md` / `AI/README.md` to the new max count
   (grep for `P1–P` before finishing).

4. **`tools/`** — if you built a reusable script (verification, batch check, DOM inspect),
   save it under `tools/` with site-specific parts parameterized (see
   `ClientData/tools/ss_search_check.ps1` for the pattern). Reference it from the client's profile so
   future sessions find it.

5. **`AI/question_templates.md`** — if the Q&A gate needed a question that is NOT in the
   templates, append it to the relevant area bank (or universal table). This keeps the
   Q&A gate shrinking test after test.

6. **`flow.md` (root)** — if ANY step, file, folder, tool, flag, or count changed, update
   `flow.md` in the SAME commit. It is the single source of truth for how the kit works
   and goes stale the moment a change isn't mirrored there. (New P-count, new bank item,
   new tool, changed folder layout — all land in flow.md too.)

Rule of thumb: the kit should be strictly more capable after your test than before it.
