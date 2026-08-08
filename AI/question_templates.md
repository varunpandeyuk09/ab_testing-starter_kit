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
| U7 | Default/preselected state — for any interactive control (tabs, accordions, selectors, dropdowns): what should be highlighted on FIRST load? | the most common rework bug (PLP01 round-4: default grade) |
| U8 | Site default ≠ design default — if the design's default shows a different value/price than the site currently displays, do we (a) keep the site's display and just highlight the matching option, or (b) swap to the design's default? | decides whether a visible value change on load is expected or a bug |
| U9 | Fallback when live data ≠ mockup — if the live DOM lacks an element the mockup assumes (e.g. a "Grade X" label, a variant set), what's acceptable? Hide / grey out / skip / invent? | prevents guessing degradation (PLP01: monitors `NEW` type had no A/B/C) |
| U10 | Copy — are the mockup strings final (use verbatim) or can I adapt? | wording, pricing labels, CTAs |
| U11 | Must-not-touch list — any element that must look EXACTLY the same (logo, trust badges, brand marks, legal text)? | guardrails for scoping + spec |
| U12 | Extra network calls OK? — if the test must fetch data per item on scroll (e.g. each PLP card's PDP), is that acceptable? Any budget/concurrency concern? | decides queue/timeout/retry design (PLP01: server stalls on bulk PDP XHRs) |
| U13 | 3rd-party libraries — may I inject libraries (sliders, fonts, libs) or keep it vanilla/cross-origin-safe? | wrapper + loading strategy |
| U14 | Deployment — how will the variation ship? (Convert / VWO / GA4 experiment / custom tag) | wrapper structure, CSS scoping, selector rules |
| U15 | QA environment — live site or a staging/preview URL? Any Cloudflare/login/CSP that blocks automation? | QA mode (manual vs AI), profile state |
| U16 | Screenshots on live — allowed? (bot-protection can block headless captures) | verification + handover artifacts |
| U17 | Exclusions — any page-type, device, or login-state where the change must be OFF? | scope guardrails |
| U18 | Sign-off matrix — which browsers/devices must the final approval cover? (Chrome only, or a suite?) | QA checklist + screenshot list |
| U19 | Tracking — what should be tracked and where must it appear? (dataLayer, GA4 event, Convert goal) | spec asserts the tracking, not just the DOM |

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

### PLP / category listing (product cards)
- L1: Scope — one category page or all listing pages sitewide (brand/filter/pagination views)?
- L2: Grade/variant selector — must it replicate the PDP's own switcher behavior (click changes product image + price WITHOUT page refresh)?
- L3: What happens when the user clicks the card CTA (e.g. "See Options") — navigate to PDP / open a quickview / trigger ATC?
- L4: Where does each data point come from — is price/strike/spec already rendered on the card, or fetched from the PDP (verify markup first)?
- L5: Does the redesign apply to grid view, list view, or both?
- L6: Mobile — same card details as desktop, or a simplified variant?
- L7: Grade selector — does the design fix the full option set on every card (e.g. always show A/B/C) with unavailable options greyed out and disabled, or only show available options?
- L8: Do the option buttons carry prices (e.g. "A — $299") or just the bare grade label? (Only show prices if the mockup puts them there — otherwise keep them out.)
- L9: Default grade selection on FIRST load — (a) first available (A→B→C), (b) the grade matching the site's shown price, or (c) none? *(PLP01 round-4: site shows a lower grade's price, so "match shown price" is usually wrong — confirm the rule)*
- L10: Cards with NO options — if a product has no grade set (e.g. monitors only `NEW`), should the selector be (a) all-disabled, (b) hidden, or (c) CTA-only? What does the mockup show?
- L11: Pagination survival — must the variation re-apply on page 2+, and must QA re-verify there? (list both URLs in the spec)
- L12: Interaction contract — grade click swaps product image + price IN PLACE (no page refresh), re-click is a no-op, unavailable options are unclickable. Is that the intended behavior?
- L13: Per-card data fetch — if each card's data comes from a PDP fetch (not SSR), is a queue with limited concurrency + timeout + retry acceptable, or must nothing block on the network?

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
