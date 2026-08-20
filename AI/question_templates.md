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
   - `ClientData/SITE_PROFILES.md` → the client's header + `### <FOCUS_AREA>` (verified DOM
     facts AND `User-confirmed` bullets).
   - Previous test folders of the same client → their `qa_prep.json` + `readme.md`
     "Knowledge added" section (same area = answers already captured).
   - `AI/AB_TESTING_PLAYBOOK.md` §8 → if the matching pattern documents the
     behavior (e.g. P28 says "popup wipes injected nodes"), don't ask it again.
3. **Ask ONLY what's left.** Max 6–8 questions, grouped by theme, phrased for the
   user (they know the business, not selectors). Ask the highest-risk ones first
   (design intent > behavior > scope > environment). Record every answer in
   `qa_prep.json` (see §5).

**Self-check before asking:** would this answer change what I build? If no → skip.
You have NO browser — behavior facts (e.g. "does the minicart open on add-to-cart
or on header click?") come from the USER: ask them to check once and report back,
then record the answer in `qa_prep.json` as `user-confirmed`. Never self-verify on
the live site.

---

## 1.5 INPUT gate (AGENTS.md STEP 0b.5 — BEFORE this workflow)

Ask where the user's material lives before doing anything else. Nothing here is a
Q&A *question* — it is a material-location check:

```
📁 AI_DATA/user_inputs/ ban gaya — apna saara data yahan daal do:
   • Images (Figma/control/screenshots) → user_inputs/test_images/
   • PDF/DOCX (brief, requirements, research) → seedha user_inputs/ me
   • Aur kuch (fonts, old variation, CSV) → apna folder bana ke daal do

⚠️ File names meaningful rakho (figma_desktop.png, brief_v2.docx) —
   isse AI ko samajhne me direct help milti hai.
   (a) Sab daal diya   (b) Kuch daala hai   (c) Abhi kuch nahi hai — data baad me aa jayega
```

- **(a)/(b):** scan `user_inputs/` now — images → look at them once for design facts;
  PDF/DOCX → read for brief/requirements and fold the facts into the Q&A gate below.
- **(c):** proceed on the brief text; re-scan if material arrives later.
- Missing material never blocks the flow.

---

## 2. Universal questions (every test — ask only if not in the brief)

| # | Question | Why it matters |
|---|----------|----------------|
| U1 | Which URL(s)/pages is this test scoped to? Any exclusions? | scope = where the change applies + is verified |
| U2 | What is the redesign/change supposed to achieve (goal/KPI)? | decides what to build and what QA must verify |
| U3 | Is there a design mockup (Figma/image)? Describe layout: image left, text right, button colors/copy. | design intent is NEVER in the DOM |
| U4 | Any hard constraints? (don't touch X, keep element Y, analytics/tracking must stay) | prevents breaking things |
| U5 | Target audience/segment for this variation? | login state, device, traffic rules |
| U6 | Is login/account state required to see the element? Credentials available? | QA needs the right profile state |
| U7 | Default/preselected state — for any interactive control (tabs, accordions, selectors, dropdowns): what should be highlighted on FIRST load? | the most common rework bug (graded-goods PLP: wrong default grade) |
| U8 | Site default ≠ design default — if the design's default shows a different value/price than the site currently displays, do we (a) keep the site's display and just highlight the matching option, or (b) swap to the design's default? | decides whether a visible value change on load is expected or a bug |
| U9 | Fallback when live data ≠ mockup — if the live DOM lacks an element the mockup assumes (e.g. a "Grade X" label, a variant set), what's acceptable? Hide / grey out / skip / invent? | prevents guessing degradation (graded-goods PLP: `NEW` type had no A/B/C) |
| U10 | Copy — are the mockup strings final (use verbatim) or can I adapt? | wording, pricing labels, CTAs |
| U11 | Must-not-touch list — any element that must look EXACTLY the same (logo, trust badges, brand marks, legal text)? | guardrails for scoping |
| U12 | Extra network calls OK? — if the test must fetch data per item on scroll (e.g. each PLP card's PDP), is that acceptable? Any budget/concurrency concern? | decides queue/timeout/retry design (graded-goods PLP: server stalls on bulk PDP XHRs) |
| U13 | 3rd-party libraries — may I inject libraries (sliders, fonts, libs) or keep it vanilla/cross-origin-safe? | wrapper + loading strategy |
| U14 | Deployment — how will the variation ship? (Convert / VWO / GA4 experiment / custom tag) | wrapper structure, CSS scoping, selector rules |
| U15 | QA environment — live site or a staging/preview URL? Any Cloudflare/login that blocks the live page? | whether the user's QA needs a specific profile state |
| U16 | Screenshots on live — can YOU capture them? (bot-protection can block captures) | the user QA's visually; screenshots help when reporting bugs |
| U17 | Exclusions — any page-type, device, or login-state where the change must be OFF? | scope guardrails |
| U18 | Sign-off matrix — which browsers/devices must the final approval cover? (Chrome only, or a suite?) | user's QA checklist per browser/device |
| U19 | Tracking — what should be tracked and where must it appear? (dataLayer, GA4 event, Convert goal) | QA checklist must include tracking, not just the DOM |
| U20 | **Parity vs simplified** — if the variation reuses a site component (buy-box, configurator, slider, cart): must it behave EXACTLY like the source (e.g. option click → product + image + per-option sizes + quantity range all change), or is a simplified version OK? List every source behavior the variation must mirror. | parity decided at the gate, not discovered during QA (AB044: rounds 7–9 were "make it like the PDP" feature requests) |
| U21 | **Evidence front-load** — if the test calls a site AJAX action or clones a site component, which of these can you paste NOW (see §2.5 cheat sheet): (a) the real Network-tab request, (b) the full container outerHTML incl. `form=`-associated controls, (c) a console log of the action working/failing? | one paste now beats 3 fix rounds later (P33 evidence-first) |

---

## 2.5 Evidence-paste cheat sheet (for the user — read before starting, ask in the gate)

Before ANY code is written, and again before QA, the user can hand over three evidence
types that end guess-work. One paste ≈ 1 minute ≈ one skipped QA round. Ask for these in
the Q&A gate when the test clones a site component or calls a site AJAX action (U21).

| Evidence | What to paste | When it's needed |
|---|---|---|
| **Network request** | DevTools → Network tab → do the action (variant switch / add-to-cart / filter) → right-click it → Copy → Copy as cURL (or paste the URL + Payload tab + Request Headers). | Any test where the variation CALLS a site AJAX action (clone-heavy: P33–P38). Wrong request shape silently fails — the #1 time-waster (AB044: 3 rounds). |
| **Full container HTML** | Element → right-click → Copy → Copy element (outerHTML). Paste the WHOLE container, not one sub-element. | Any test that CLONES a site component (quick-add modal, buy-box, section). Include elements OUTSIDE the `<form>` that reference it via `form="..."` (e.g. a quantity `<select>`) — form-associated controls live outside the form tag (AB044: ATC 400 bug). |
| **Console log on fail** | When something doesn't work: paste the full console output (errors + any `[EG-…]` logs) AND expected-vs-actual in ONE line. | Every bug report. "M selected but cart shows noSize (expected M)" + the console lines = 1 round, not 5. |
| **Before/after DOM** | When a value doesn't stick (variant id, checked option, price): paste the element's outerHTML BEFORE the action and AFTER. | Proves what the site wrote vs what the variation wrote (AB044: the M-variant id proof). |
| **DevTools experiment result** | If a fix is proposed and it can be tested manually in DevTools first (edit style, run a snippet), report the result before it's coded. | Confirms a mechanism before it's built (AB044: `setProperty(..., 'important')` proved the slider fix). |

**Parity rule (U20 — asked once, saves whole rounds):** if the variation shows or reuses a
site component (e.g. a PDP buy-box in a quick-add modal), the user states UPFRONT whether it
must behave EXACTLY like the source ("swatch click → product + image + sizes + quantity range
all change") or a simplified version is fine. "Behave exactly like the PDP" said at QA time
is a feature request, not a bug.

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
- P5: Clone-heavy build (quick-add modal / reusing the site's own form or AJAX): paste the site's REAL network request for the action (variant switch, add-to-cart) — URL + full payload with encodings + headers — from the Network tab. The code matches it byte-for-byte instead of guessing. *(P33 evidence-first rule — guessing the payload is the #1 silent-failure source)*
- P6: Cloning a PDP component (quick-add modal, buy-box): paste the FULL container outerHTML — the whole buy-box area INCLUDING any element outside the `<form>` that references it via `form="..."` (e.g. a quantity `<select>`). Partial pastes hide form-associated controls → ATC 400s. *(AB044 round 6)*

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
- F5: Form fields with no stable selector (Salesforce `00N…` IDs, CRM tokens) — shall I use the `name` attribute as fallback, or is there a stable class/data-attribute on the live page? *(Risks: CRM-generated values could change on platform update)*

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
- L4: Where does each data point come from — is price/strike already rendered on the card, or fetched from the PDP (verify markup first)?
- L5: Does the redesign apply to grid view, list view, or both?
- L6: Mobile — same card details as desktop, or a simplified variant?
- L7: Grade selector — does the design fix the full option set on every card (e.g. always show A/B/C) with unavailable options greyed out and disabled, or only show available options?
- L8: Do the option buttons carry prices (e.g. "A — $299") or just the bare grade label? (Only show prices if the mockup puts them there — otherwise keep them out.)
- L9: Default grade selection on FIRST load — (a) first available (A→B→C), (b) the grade matching the site's shown price, or (c) none? *(graded-goods PLP: site shows a lower grade's price, so "match shown price" is usually wrong — confirm the rule)*
- L10: Cards with NO options — if a product has no grade set (e.g. monitors only `NEW`), should the selector be (a) all-disabled, (b) hidden, or (c) CTA-only? What does the mockup show?
- L11: Pagination survival — must the variation re-apply on page 2+, and must QA re-verify there? (list both URLs for the user's QA)
- L12: Interaction contract — grade click swaps product image + price IN PLACE (no page refresh), re-click is a no-op, unavailable options are unclickable. Is that the intended behavior?
- L13: Per-card data fetch — if each card's data comes from a PDP fetch (not SSR), is a queue with limited concurrency + timeout + retry acceptable, or must nothing block on the network?

---

## 3.5 EVENT bank — "event banane" brief ke liye (ask ONLY if the brief doesn't state it)

Use this when the brief is ONLY about adding tracking events (Optimizely goals). Kit
defaults (P39) answer most of it — ask at most 2–4 questions, ONLY the ones below whose
answer the brief doesn't already give:

| # | Question | Kit default if not answered |
|---|----------|-----------------------------|
| E1 | Kaunse events? (page view / time-on-page marks / scroll depth / click interactions — list the user actions) | Standard set: `variant_page_view`, `time_on_page` (10/30/60/120/300s), `scroll_25_`/`scroll_50_`/`scroll_90_`/`scroll_100_` |
| E2 | Custom tags chahiye (variant, plan, type, etc.) ya default `{revenue:0, value:0.00}` hi rahe? | Default tags ONLY — eventName-based (USER-CONFIRMED: no custom tags unless asked) |
| E3 | Kya mapping? (kaunsa action kaunsa event fire kare — Login → `handoff_clicks`, Register/Hero-trial → `trial_start`, FAQ → `faq_clicks`) | User intent mapping, not element names (P39) |
| E4 | Which platform — Optimizely only, or also dataLayer/GA4? | Optimizely `window['optimizely'].push` only |

**Output rule (P39):** one `pushEvent(eventName)` helper with default tags; each mark fires
ONCE; interaction events wire via `live()`; event names snake_case action-based. Never invent
custom tags.

---

## 4. Behavior questions worth checking (not asking blind)

These are often cheaper to CHECK than to ask — but you have no browser, so the USER
does the check in one headed run. Ask them to verify, then record the verified fact:

- Element renders on SSR vs late AJAX (poll/settle needed?)
- Site wipes injected nodes after render (re-decorate pattern needed?)
- SPA routing (pushState) vs page reload
- Hidden inputs/values updated by JS after load (read at apply-time)
- Mobile vs desktop markup differences (different containers per breakpoint)
- Theme intercepts clicks on interactive controls (configurator pills, swatches, tabs) — does a click actually check the radio / update the highlight, or does the theme JS drive it and swallow the native check? (→ capture-phase click needed, P35)
- After a switch/selection, does the site update the DOM CLIENT-SIDE from the response id, or does it fetch a whole page? (→ P34 in-place update vs page apply)
- Does the component's behavior change per option (image swap, per-option availability, quantity range)? Parity is not binary — verify each source behavior separately (P36/P37 interplay).

`verified` entries from these go straight into `session_notes.md` and the client profile.

---

## 5. qa_prep.json — record format (write to the TEST folder)

```json
{
  "test": "AB01 Minicart Redesign",
  "client": "CLIENTX",
  "focus_area": "navigation",
  "effort": "STANDARD",
  "brief_gaps": ["design mockup", "scoped URLs", "open-trigger"],
  "asked": [
    { "q": "Does the minicart open on add-to-cart or header icon click?", "a": "header icon click", "source": "user" },
    { "q": "Which URLs is this scoped to?", "a": "/index.php, /category", "source": "user" }
  ],
  "skipped_known": [
    { "q": "Does the popup wipe injected nodes?", "reason": "ClientData/SITE_PROFILES checkout section — P28", "source": "kit" }
  ],
  "verified": [
    { "fact": "minicart trigger = .header-cart-trigger", "how": "user-confirmed in a headed run", "area": "navigation" }
  ]
}
```

- `asked` → answers given by the user (record verbatim; these are USER-CONFIRMED facts).
- `skipped_known` → questions auto-dropped because the kit already knew (this is what makes the kit faster every test).
- `verified` → facts YOU confirmed live (later moved into `ClientData/SITE_PROFILES.md`).
- `effort` → the STEP 0a.5 classification (LITE / STANDARD / HEAVY) — records how much machinery this test needed so the flow gate and future sessions can see it.

---

## 6. Feeding Q&A back into the kit (STEP 4)

- **User-confirmed facts** → add to `ClientData/SITE_PROFILES.md` under the client's
  `### <FOCUS_AREA>` as `User-confirmed (Q&A, <TEST_NAME>): ...`. Mark them clearly
  as user-said (NOT DOM-verified) so a future session knows to trust but can re-verify.
- **Verified facts** → normal profile entries (DOM-verified, same as before).
- **New question the templates missed** → append it to the relevant area bank above
  so future tests reuse it.
- **Agenda:** after ~5 tests per client/area, the Q&A gate should shrink to
  design/scope questions only — the kit answers the rest.
