# QUESTION_TEMPLATES.md — Pre-code Q&A Gate

How the AI turns any brief into the RIGHT questions, using only what the kit
doesn't already know. Run this BEFORE research (AGENTS.md STEP 0c), so you never
verify something the user can answer in seconds, and never ask what the kit
already knows.

---

## 1. Workflow (3 steps, in order)

1. **Gap-scan the brief.** Read it and mark which of the fields below are ALREADY
   answered in the brief. Never re-ask those.
2. **Kit-lookup.** Check for existing answers in this order and DROP any question
   whose answer is already recorded:
   - `AI/SITE_PROFILES.md` → the client's header + `### <FOCUS_AREA>` (verified DOM
     facts AND `User-confirmed` bullets).
   - Previous test folders of the same client → their `qa_prep.json` + `readme.md`
     "Knowledge added" section (same area = answers already captured).
   - `AI/AB_TESTING_PLAYBOOK.md` §8 → if the matching pattern documents the
     behavior (e.g. P28 says "popup wipes injected nodes"), don't ask it again.
3. **Ask ONLY what's left.** Max 6–8 questions, grouped by theme, phrased for the
   user (they know the business, not selectors). Ask the highest-risk ones first
   (design intent > behavior > scope > environment). Record every answer in
   `qa_prep.json` (see §5).

**Self-check before asking:** would this answer change what I build or how I
verify it? If no → skip. If I can verify it myself in one headed browser run
(e.g. "does the minicart open on add-to-cart or on header click?") → only ask if
it's cheaper/faster to ask; otherwise verify it and record the result.

---

## 2. Universal questions (every test — ask only if not in the brief)

| # | Question | Why it matters |
|---|----------|----------------|
| U1 | Which URL(s)/pages is this test scoped to? Any exclusions? | scope = where code + spec run |
| U2 | What is the redesign/change supposed to achieve (goal/KPI)? | decides what the spec asserts |
| U3 | Is there a design mockup (Figma/image)? Describe layout: image left, text right, button colors/copy. | design intent is NEVER in the DOM |
| U4 | Any hard constraints? (don't touch X, keep element Y, analytics/tracking must stay) | prevents breaking things |
| U5 | Target audience/segment for this variation? | login state, device, traffic rules |
| U6 | Is login/account state required to see the element? Credentials available? | QA needs the right profile state |

---

## 3. Area-wise question banks (ask only the ones relevant to FOCUS_AREA)

### navigation (header, login, cart, search)
- N1: Does the minicart/cart dropdown open on **add-to-cart**, **header icon click**, or both? *(verify if you can)*
- N2: Should the redesign apply to the desktop dropdown, mobile drawer, or both?
- N3: Which header elements must stay interactive (login link, search, menu toggles)?
- N4: Login/logout states — different header content logged in vs guest?

### product (PDP, price, stock, add-to-cart)
- P1: Which product(s)/category is the redesign for? Single product or all PDPs?
- P2: Is the add-to-cart a form submit or JS-only button? Any variant/qty options required?
- P3: Should price/stock/stock-availability sources stay as the site renders them, or be recomputed?
- P4: Is a "verified price/strike" line required (e.g. site renders its own statt)?

### checkout (cart page, popups, payment, confirmation)
- C1: Does the post-add experience use a popup/modal, a minicart update, or a page redirect?
- C2: Is the popup content static skeleton filled by JS (re-decorate needed), or fully rendered?
- C3: Multi-item cart behavior — totals must be cart-wide or per-item?
- C4: Are payment/confirmation steps in scope, or only the cart/popup layer?

### section (one block/section being redesigned)
- S1: Which exact section/block is this? (name it so it maps to a container selector)
- S2: What's the new layout (image position, text, CTA, count/order of items)?
- S3: How many instances can appear on one page (grid items, repeated blocks)?
- S4: Any interaction the section must keep (add-to-cart per tile, links, sliders)?

### form (a form region, fields, validation, submit)
- F1: Which form is this (contact, checkout, filter, search)? Fields in scope?
- F2: What happens on submit (AJAX, redirect, success state)? Must it keep working?
- F3: Validation/error states — restyle or keep site's?
- F4: Are required/optional/autofill attributes to be preserved?

### page (full-page / template-level redesign)
- G1: Which template(s)/page types (home, category, article)?
- G2: Full redesign or only sections within it? Any sections that must NOT change?
- G3: Hero/banners — single or rotating? Responsive breakpoints critical?

### search (search bar, results, facets)
- H1: Is this the header search, a results page, or both?
- H2: Are results AJAX-loaded or full page reload? Debounced live suggestions?
- H3: Zero/low-result states — is a fallback design required?
- H4: Facets/filters in scope?

---

## 4. Behavior questions worth verifying yourself (not asking)

These are often cheaper to check in a headed run (`tools/qa_run.js`) than to ask —
verify, then record the verified fact:

- Element renders on SSR vs late AJAX (poll/settle needed?)
- Site wipes injected nodes after render (re-decorate pattern needed?)
- SPA routing (pushState) vs page reload
- Hidden inputs/values updated by JS after load (read at apply-time)
- Mobile vs desktop markup differences (different containers per breakpoint)

---

## 5. qa_prep.json — record format (write to the TEST folder)

```json
{
  "test": "SM26 Minicart Redesign",
  "client": "TROOPER",
  "focus_area": "navigation",
  "brief_gaps": ["design mockup", "scoped URLs", "open-trigger"],
  "asked": [
    { "q": "Does the minicart open on add-to-cart or header icon click?", "a": "header icon click", "source": "user" },
    { "q": "Which URLs is this scoped to?", "a": "/index.php, /category", "source": "user" }
  ],
  "skipped_known": [
    { "q": "Does the popup wipe injected nodes?", "reason": "SITE_PROFILES PRAXINDO checkout — P28", "source": "kit" }
  ],
  "verified": [
    { "fact": "minicart trigger = .header-cart-trigger", "how": "qa_run.js navigate+click", "area": "navigation" }
  ]
}
```

- `asked` → answers given by the user (record verbatim; these are USER-CONFIRMED facts).
- `skipped_known` → questions auto-dropped because the kit already knew (this is what makes the kit faster every test).
- `verified` → facts YOU confirmed live (later moved into `SITE_PROFILES.md`).

---

## 6. Feeding Q&A back into the kit (STEP 4)

- **User-confirmed facts** → add to `SITE_PROFILES.md` under the client's
  `### <FOCUS_AREA>` as `User-confirmed (Q&A, <TEST_NAME>): ...`. Mark them clearly
  as user-said (NOT DOM-verified) so a future session knows to trust but can re-verify.
- **Verified facts** → normal profile entries (DOM-verified, same as before).
- **New question the templates missed** → append it to the relevant area bank above
  so future tests reuse it.
- **Agenda:** after ~5 tests per client/area, the Q&A gate should shrink to
  design/scope questions only — the kit answers the rest.
