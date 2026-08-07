# AGENTS.md

## Role
You are building an A/B test variation for a premium CRO agency. Work must match the standards in `AB_TESTING_PLAYBOOK.md`.

---

## STEP 0 — Parse the Brief & Scaffold the Folder (DO THIS FIRST, BEFORE ANY CODE)

**Before writing a single line of code**, do the following:

### 0a. Parse the brief
Read `AI/PROMPT_PARSING.md` and extract:
- `CLIENT` — the client folder name in CAPS (e.g. `TROOPER`, `MONASH`)
- `TEST_NAME` — the full test name used as the subfolder (e.g. `SM22 Product Tile Optimization`)
- `TEST_ID` — the short ID used for the body class `EG-<TEST-ID>` (e.g. `SM22`)
- `WEBSITE_URL` — the target page URL(s)
- `FOCUS_AREA` — the part of the page the test actually touches. Standard areas:
  `navigation` (header, login, cart, search) | `product` (PDP, price, stock, add-to-cart) |
  `checkout` (cart page, popups, payment, confirmation) | `section` (one block/section being
  redesigned) | `form` (a form region, its fields, validation, submit) | `page` (full-page /
  template-level redesign) | `search` (search bar, results, facets).

If the brief is incomplete or ambiguous, **ask the user for the missing pieces before proceeding**. Do NOT guess and do NOT start writing code.

### 0b. Create the folder structure immediately
Every test lives under `../ABTESTSWITHAI/CLIENT/TEST_NAME/` (outside the starter kit). **Never write to the root `variation1/` folder — it is a read-only template.**

Create this structure:
```
../ABTESTSWITHAI/CLIENT/
  TEST_NAME/
    metadata.json
    v1.json
    share.js
    readme.md
    variation1/
      variation.js
      variation.css
```

- Copy content from `variation1/variation.js` (root template) → `../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/variation.js`
- Copy content from `variation1/variation.css` (root template) → `../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/variation.css`
- Copy content from `share.js` (root template) → `../ABTESTSWITHAI/CLIENT/TEST_NAME/share.js`
- Copy content from `v1.json` (root template) → `../ABTESTSWITHAI/CLIENT/TEST_NAME/v1.json`
- Fill in `metadata.json` and `readme.md` with test details

> **Template source of truth:** the blank templates live at the kit ROOT — `variation1/variation.js`, `variation1/variation.css`, `share.js`, `v1.json`. The copies under `AI/` are backups of the same templates. Always copy from the ROOT versions. The filled `AI/examples/EG-EXAMPLE-SM01/` files are reference examples ONLY — never copy those values into a real test.

**Scaffold all files before writing any implementation code.**

---

## STEP 1 — Research Before Writing Code (AREA-SCOPED)

1. Read `AB_TESTING_PLAYBOOK.md` in full (same folder as this file).
2. Match the task against the Reusable Patterns Library (playbook §8, P1–P28). Adopt the matching pattern(s) and adapt them. This is the primary source — do NOT run a search unless no pattern fits.
3. **Fallback (only when NO pattern in §8 fits the brief):** run the RAG search — it auto-locates the `AB-test` archive anywhere on this machine and prints the top 3 similar past tests with their code:
   ```bash
   python scripts/search_tests.py "your test description"
   ```
   Study the returned examples, then **add the newly discovered technique to the playbook §8 as the next P-number (P26, P27, ...)**, with a short snippet, so the library grows. Then adapt the pattern for the current brief.
4. **Verify ONLY the FOCUS_AREA, never the whole site.** `AI/SITE_PROFILES.md` stores verified DOM facts per client, grouped **by area** (each `### Area` subsection is verified once and reused forever).
   - Start by reading the client's profile for the **current FOCUS_AREA only** (plus the client's site-wide gotchas section).
   - If the area is already in the profile → **do not re-verify**; read the selectors and go straight to STEP 2. Re-verify only what the brief changes.
   - If the area is NOT in the profile → inspect the live DOM for **that area only** (stable selectors, AJAX/lazy-loading/SPA behaviour), then record it area-wise in STEP 4. A navigation test verifies login/cart/search — nothing else. A section test verifies only that section's container + its anchors.
   - Site-wide gotchas (Cloudflare/auth, A/B platform, theme framework) are verified ONCE per client and live in the client's profile header — do not re-derive them per test.
5. Inspect the live website (live DOM) before writing any code — scoped to the focus area. Identify stable selectors, check whether elements are rendered dynamically, lazy-loading, and SPA behaviour. Confirm the change will not break existing functionality, analytics, tracking, accessibility, or responsiveness. Never assume — verify against the actual page.

---

## STEP 2 — Write the Code

### Study the Reference Example First
Before writing any code, read `AI/examples/EG-EXAMPLE-SM01/` — all 6 files.
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
- Add the unique body class `EG-<TEST-ID>` inside `init()` (e.g. `EG-PXD-SM27`). Scope ALL CSS under this class.
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
- Every time the fallback search is used, a new pattern MUST be appended to playbook §8.

---

## Output files (full paths relative to starter kit)

```
../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/variation.js     ← main implementation
../ABTESTSWITHAI/CLIENT/TEST_NAME/variation1/variation.css    ← scoped styles
../ABTESTSWITHAI/CLIENT/TEST_NAME/share.js                    ← tracking only, no DOM mutation
../ABTESTSWITHAI/CLIENT/TEST_NAME/v1.json                     ← filled with real URLs and file paths
../ABTESTSWITHAI/CLIENT/TEST_NAME/metadata.json               ← RAG metadata
../ABTESTSWITHAI/CLIENT/TEST_NAME/readme.md                   ← brief summary
```

⚠️ **NEVER write to `variation1/variation.js` or `variation1/variation.css` at the repo root. Those are read-only templates.**

---

## STEP 3 — Before Finishing

Run the QA checklist (playbook section 9) and confirm every item. Re-check every selector against the forbidden-anchor list before delivering.

---

## STEP 4 — Capture Knowledge Back Into the Kit (MANDATORY before finishing)

Every completed test must leave its verified learnings in the kit. This feedback loop is
what makes the kit faster with every test. **Do all of the following that apply before you
hand over a test** — if a future session would have to re-verify something you already
verified, the test is NOT finished:

1. **`AI/SITE_PROFILES.md`** — add a `## CLIENT` section (or update the existing one) with
   ONLY facts you confirmed against the live DOM: stable selectors, AJAX endpoints, theme
   gotchas, and the working technique. Mark each fact with the test that proved it
   (`Verified in: ../ABTESTSWITHAI/<CLIENT>/<TEST_NAME>`). Never record assumptions.
   **Record AREA-WISE:** the client header holds site-wide gotchas (auth/Cloudflare, A/B
   platform, framework); everything else goes under the `### <FOCUS_AREA>` subsection
   (`navigation` / `product` / `checkout` / `section` / `form` / `page` / `search`).
   Only append the areas this test actually touched — never a full-site dump. Future tests
   read only their own area + the header, and never re-verify what is already recorded.

2. **`AI/AB_TESTING_PLAYBOOK.md` §8** — if the test used a technique that is NOT already a
   pattern, append it as the next P-number (P28, P29, ...) with a short recipe + `Source:`
   line. Then update every `P1–Pxx` reference in `AGENTS.md` / `AB_TESTING_PLAYBOOK.md` /
   `README.md` to the new max count (grep for `P1–P` before finishing).

3. **`tools/`** — if you built a reusable script (verification, batch check, DOM inspect),
   save it under `tools/` with site-specific parts parameterized (see
   `tools/ss_search_check.ps1` for the pattern). Reference it from the client's profile so
   future sessions find it.

4. **Test folder `readme.md`** — add a short "Knowledge added" note listing which
   profiles / patterns / tools this test updated, so the loop stays traceable.

Rule of thumb: the kit should be strictly more capable after your test than before it.
