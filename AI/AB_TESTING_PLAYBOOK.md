# AB Testing Playbook

Default coding standard for every A/B test in this repository. Distilled from the latest shipped tests across multiple e-commerce/corporate clients. Follow this file for all future work. It replaces ad-hoc / older wrapper styles found in legacy folders.

---

## 1. Repository Layout (per test)

```
CLIENT/
  TEST NAME/
    metadata.json          # RAG search metadata (always create)
    v1.json / v2.json      # platform config: files + urls
    share.js               # shared goals/tracking (optional, shared across variations)
    readme.md              # optional notes / test brief
    variation1/
      variation.js         # main implementation
      variation.css        # scoped styles
    variation2/            # additional variations (variationB/, variation3/ etc.)
      ...
```

- Client folder is the client name in caps (e.g. `CLIENTX`, `CLIENTY`).
- Test folder name mirrors the internal test ID (e.g. `CRO MOL 12.01 Application  Restructure`).
- `v1.json` shape:

```json
{
  "files": ["./variation1/variation.css", "./variation1/variation.js", "./share.js"],
  "urls": ["https://client-site.com/page"]
}
```

- `metadata.json` must include: `id`, `client`, `website_url`, `type`, `platform`, `website_type`, `framework` (`vanilla js`), `devices`, `techniques`, `changes_made`, `number_of_variations`, `variation_differences`, `complexity`, `notes`.

---

## 2. Base Script (variation.js) — use this wrapper verbatim

Every test starts from the standard wrapper. `init()` is the only entry point. Do not restructure the wrapper unless specifically required.

```js
(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "EG-<TEST-ID>";
    var $;

    /* all Pure helper functions */

    // Polls for a selector then triggers once; always self-clears with a timeout.
    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (
          document &&
          document.querySelector(selector) &&
          document.querySelectorAll(selector).length > 0
        ) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }

    // Delegated event binding for static + dynamic elements. Always use this.
    function live(selector, event, callback, context) {
      function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent("on" + type, handler);
        else el.addEventListener(type, handler);
      }
      this.Element &&
        (function (ElementPrototype) {
          ElementPrototype.matches =
            ElementPrototype.matches ||
            ElementPrototype.matchesSelector ||
            ElementPrototype.webkitMatchesSelector ||
            ElementPrototype.msMatchesSelector ||
            function (selector) {
              var node = this,
                nodes = (node.parentNode || node.document).querySelectorAll(selector),
                i = -1;
              while (nodes[++i] && nodes[i] != node);
              return !!nodes[i];
            };
        })(Element.prototype);
      function live(selector, event, callback, context) {
        addEvent(context || document, event, function (e) {
          var found,
            el = e.target || e.srcElement;
          while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
          if (el && found) callback.call(el, e);
        });
      }
      live(selector, event, callback, context);
    }

    // Standard SPA routing listener. Copy as-is; only customise the callback body.
    function listener() {
      window.addEventListener("locationchange", function () {
        // re-run init / cleanup for the new route
      });
      history.pushState = ((f) =>
        function pushState() {
          var ret = f.apply(this, arguments);
          window.dispatchEvent(new Event("pushstate"));
          window.dispatchEvent(new Event("locationchange"));
          return ret;
        })(history.pushState);
      history.replaceState = ((f) =>
        function replaceState() {
          var ret = f.apply(this, arguments);
          window.dispatchEvent(new Event("replacestate"));
          window.dispatchEvent(new Event("locationchange"));
          return ret;
        })(history.replaceState);
      window.addEventListener("popstate", () => {
        window.dispatchEvent(new Event("locationchange"));
      });
    }

    /* Variation Init */
    function init() {
      document.body.classList.add('EG-<TEST-ID>');
      // orchestrate helpers...
    }

    listener(); // only when SPA support is needed

    /* Initialize variation */
    waitForElement('<required-selector>', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
```

- Default polling: `delayInterval = 50`, `delayTimeout = 15000`. Never run `init()` directly before the required DOM exists.
- Wrap everything in `try/catch`; log only when `debug` is enabled.

---

## 3. Naming Conventions

- **Body class**: `EG-<TEST-ID>` added once inside `init()`. Examples seen in the repo: `EG-CLIENTX-AB01`, `EG-CLIENTY-HP`. Every rule in CSS must be scoped by this class.
- **New DOM elements**: lowercase `eg-` prefixed classes (`.eg-hero-section`, `.eg-course`, `.eg-guest-cta`, `.eg-btn`). Never reuse site classes for our elements.
- **variation_name**: descriptive, e.g. `"EG-CLIENTX-AB01-Redesign"`, `"EG-CLIENTY-HP-VariantA"`.

---

## 4. DOM Selector Rules

- **Dynamic selectors are forbidden**: no auto-generated classes, random IDs, hashed attributes.
- **Every selector must be a valid CSS selector.** IDs that start with a digit (e.g. Salesforce/SFMC IDs like `00N2v00000VhUGp`) are NOT valid in `#id` form — `querySelector('#00N2v00000VhUGp')` throws `SyntaxError`. Reference them via an attribute selector `[id="00N2v00000VhUGp"]` or a stable class/`data-*` attribute instead. Never build selectors from raw dynamic strings.
- **No `contains("...")` partial-class matching.** It is not a CSS selector — it silently matches any substring and breaks on renames (`contains("col-12")` also matches `col-12x`). Use the exact stable class name.
- **No Bootstrap/grid utility classes as anchors** (`.row`, `.col-12`, `.col-sm-6`, `.container`, `.mb-5`, `.d-flex`, etc.). They describe layout, not meaning, and are the first thing to change in a redesign. Anchor to the semantic wrapper (`.forms-layout__form`, `[data-field="course"]`) instead.
- **No tag-only heading selectors** (`#some-id h6` where the tag is the whole handle). `h6` can become `h5` or a `p` tomorrow. Select the stable container/class/`data-*` and style the heading inside it, or use a text-stable parent.
- **No visual/utility classes as anchors** (`.bg-gradient`, `.text-white`, `.shadow-sm`, `.font-bold`). They describe styling, not structure, and get renamed freely.
- **No positional selectors** (`.row > div:nth-child(3)`) — DOM order and grid columns change.
- **Stable-selector checklist:** (a) semantic id/class/`data-*`, (b) survives a theme/grid update, (c) identical across dev → staging → prod. If any answer is no, find a better anchor.
- **No stable selector exists (Salesforce CRM fields, tool-injected IDs)?** → ASK the user: "In fields ke liye koi stable class ya data-attribute hai, ya `name` attribute se kaam chalana padega?" Use `name` attribute as pragmatic fallback ONLY after user confirms no better option exists. Log the risk in `session_notes.md`: "Selector uses CRM-generated ID — unstable, could change on CRM update." Never silently ship a CRM ID selector without documenting the risk.
- Preferred: `id`, stable classes, `data-*` attributes, and CSS selector chaining (e.g. `[data-login="logged-out"] #cart-page .button-go-to-checkout`).
- Never assume a single element — loop `querySelectorAll(...)` results and apply the change to every match where applicable.
- Prevent duplicate insertion/listeners/observers:
  - `if (!parent.querySelector('.eg-element')) { ... }`
  - `if (!document.body.classList.contains('EG-X')) { document.body.classList.add('EG-X'); }`
- Prefer `insertAdjacentHTML` / `insertAdjacentElement` / `insertBefore` over `innerHTML` overwrites that destroy event bindings.

---

## 5. JavaScript Rules

- **Function structure**: no nested functions inside `init()`. All helpers sit at the top level of the IIFE; `init()` only orchestrates.
- **Code readability**: keep code simple, modular, easy to understand and maintain. Avoid overly complex logic.
- **Commenting**: JS comments only (markdown/HTML comments do not ship in variations). Comment every major function with its purpose; avoid per-line noise.
- **Events**: always `live(selector, event, callback, context)` for delegated events. Do not hand-roll delegation, and avoid binding to elements that don't exist yet.
- **SPA support**: try the standard `listener()` first (pushstate / replacestate / locationchange / popstate). Customise only the callback body. Fall back to a custom listener only if the standard one fails.
- **setInterval / setInterval polling**: every interval must self-clear — either on success (`clearInterval(interval)` before `trigger()`) or via the paired `setTimeout` (15s default). No infinite intervals.
- **Loops**: no `while(true)` or unbounded loops; every loop needs a guaranteed exit.
- **MutationObserver**:
  - Performance friendly: observe only the required container, use `subtree: true` only when needed, filter with `attributeFilter` when watching classes.
  - Guard re-entrancy with an `isRunning` flag and debounce (`if (isRunning) return;`).
  - Disconnect the observer when it is no longer needed.
  - Never observe the whole `document`/`body` unless the test genuinely needs site-wide change detection.
- **Duplicate protection**: before inserting elements, attaching listeners, or creating observers, check they don't already exist.
- **Performance**: avoid repeated DOM queries (cache queried elements), unnecessary timers, duplicate listeners, and needless reflows/repaints.
- **Keep the site safe**: never break existing functionality, modify unrelated components, or create global side effects.

---

## 6. CSS Rules

- **CSS-first decision order (hide ≠ move).** Before writing ANY JS, ask: is this change presentational (hide / show / style / spacing / layout)? If yes → do it in scoped CSS under the body class. JS is ONLY for behavior CSS cannot do: move, clone, fetch, state, events, timing. Concretely: hiding a tab/link/button/section = a `display: none` rule in `variation.css` — never `remove()` the node, never set `style.display` in JS, unless a live fact proves CSS can't win (site JS re-shows it / inline-style fight). Hiding and moving are two separate jobs — hide with CSS, move with JS — never bundle a CSS job inside a JS operation. *(Lesson: a PDP tab removal that needed one scoped `display: none` was first proposed as a JS `remove()` — CSS should have been the instinct.)*
- Scope every rule under the body class: `.EG-<TEST-ID> .eg-element { ... }`. Never write unscoped selectors.
- Use the `eg-` prefix for all new classes.
- Use comment section headers (`/* Main outer section wrapper */`, `/* Cards CSS */`) to group styles.
- Mobile-first or explicit `@media (min-width: 992px)` / `@media (max-width: 767px)` breakpoints; test on desktop, tablet and mobile.
- Prefer CSS `var(--...)` tokens from the site's design system when available; fall back to explicit hex values.
- Avoid `!important` — use only when overriding a stubborn site rule (targeted `!important` on overrides is acceptable and common in shipped CSS).
- Reuse site classes where appropriate so interactions (native collapse, forms, carousels) keep working.
- The same forbidden anchors as §4 apply to CSS: no tag-only headings (`#x h6 { }` — the tag may change), no positional/grid chains (`.row > div`), no styling a heading you don't own. Target the stable class/`data-*` container and style the heading inside it.

---

## 7. share.js — Goals / Tracking

`share.js` runs on every variation (it is listed in each `v1.json`) and is used for click/goal tracking, not layout:

```js
function init() {
  live('.some-cta, .eg-analytics', 'click', function () {
    console.log('tracked action description');
  });
}
waitForElement('html body', init, 50, 15000);
```

- One `live()` per tracked interaction, with a human-readable log string describing the click.
- Keep it pure — no DOM mutation in `share.js`.

---

## 8. Reusable Patterns Library — INDEX (read this, then open ONLY the matched P#)

The full recipes live in `AI/AB_TESTING_PATTERNS.md` (reference — never read it end-to-end).
Match the brief against this index, then read only the matching pattern(s). Every recipe
assumes the base script from §2 and follows the rules from §4–§6. All patterns stay
idempotent, use stable selectors, and never break existing functionality.

| P# | Technique | When to use (match against the brief) |
|:--:|---|---|
| P1 | Image swap (lazy-load / srcset / picture) | Replacing hero / product / section imagery |
| P2 | Insert a new section / block between elements | Adding a marketing section, banner, CTA at a specific spot |
| P3 | Sticky element (header / bar / CTA) | Making an element stick, appear, or collapse on scroll |
| P4 | DOM reordering (move existing sections) | Moving a section, reordering list items, transplanting a block |
| P5 | Survival under AJAX / re-render (MutationObserver) | Page re-renders the target area (carousels, carts, feeds) and undoes your changes |
| P6 | SPA routing (cross-page persistence) | Test must apply on multiple routes / state must survive navigation |
| P7 | Event tracking / goals | Measuring clicks on test elements or existing CTAs (`share.js`) |
| P8 | Form restructure (re-layout without breaking submit) | Redesigning a form's visual order while keeping it functional |
| P9 | On-demand external library loading | Test needs a library the site doesn't ship (sliders, etc.) |
| P10 | Text / copy / price / badge replacement | Swapping headline, copy, prices, or adding sale badges |
| P11 | Device-switch restore (matchMedia) | Change applies on some viewports, reverts on others |
| P12 | Cross-page flow / persistent state (localStorage) | Multi-step flow, first-visit nudges, urgency timers |
| P13 | AJAX response re-application (XHR `send()` hook) | Content re-rendered via fetch/XHR (minicarts, quick-view, facets) |
| P14 | Controlled-input automation (autocomplete-friendly) | Setting values in React/Vue/Svelte/Angular inputs; progressive typing; click → verify → keyboard-fallback option pick; programmatic-vs-user focus; value-reversion safeguard |
| P15 | Library readiness waiters | Calling `$` / `Swiper` / `Slick` before the library has loaded |
| P16 | Cookie helpers | Remembering a choice across pages without localStorage |
| P17 | Exit-intent popup (desktop + mobile, cookie-guarded) | Cart-abandon / exit-intent popups |
| P18 | Cart-reactive progress bar / threshold message | Free-shipping / threshold bars that update live with the cart |
| P19 | Date math (business days + timezone countdown) | "Ships in X business days", promo countdowns |
| P20 | Cross-page HTML fetch → parse → clone | Reusing a component that only exists on another page of the same site |
| P21 | IP-geo content swap | Region-specific phone number / messaging |
| P22 | CSS-only carousel (scroll-snap + hidden scrollbar) | Native-feel product/category carousels, touch swiping |
| P23 | 0fr/1fr accordion animation (pure CSS) | Smooth FAQ/accordion open/close without measuring heights |
| P24 | rAF `waitFor` + ResizeObserver compensation | Elements appearing after layout/font-load; sticky offsets tracking header height |
| P25 | Derive active tab from rendered content (not clicks) | Theme intercepts clicks / sets `.active` async — read a rendered signal |
| P26 | Low / no-result search fallback | SERP returns 0–5 results; add related products / popular searches |
| P27 | Headless browser verification (JS-rendered content) | Page renders via AJAX; need the post-render DOM (no per-site code) |
| P28 | Re-decorating a reused success modal (site-hydrated) | Post-action modal hydrated by site JS on every trigger; keyed re-decorate |
| P29 | Client-editable config map for creatives (handle-keyed) | Media/copy swaps that the client edits post-launch |
| P30 | Client-side variant switcher from fetched PDP blocks | PLP variant selector when the PDP embeds all variant HTML server-side |
| P31 | Lazy fetch queue — store caller's callback BEFORE the first fetch | N async fetches with a concurrency limit (prevents queue deadlock) |
| P32 | Bootstrap `.row` flex-wrap gotcha | 2-col desktop redesign silently stacks vertically — needs `flex-wrap: nowrap` |
| P33 | Replicate the theme's own AJAX request byte-for-byte | Cloned component fires a site AJAX action; wrong payload/encoding silently fails |
| P34 | In-place form update from `{url, id}` switch responses | Switch returns id + url; site rebuilds client-side; re-fetching the url wipes picked state |
| P35 | Cloned configurator: capture-phase click + whole-container radio state | Theme intercepts pill clicks; same-name radios duplicated; `form=`-associated controls sit outside the form |
| P36 | Hydrate cloned plugin components (strip hooks → site initializer) | Cloned gallery/buy-box won't auto-init; strip `data-*` hooks, then call the site's initializer on the clone |
| P37 | Author `!important` vs cloned slider inline transform | `.tns-slider` frozen by `transform: none !important`; re-assert inline value with `!important` + MutationObserver |
| P38 | Relocate plugin-owned iframes/widgets (overlay-sync) | Moving an SDK/plugin-rendered widget (PayPal/Amazon express buttons, iframes) from PDP to mini-cart — `appendChild` breaks postMessage/click wiring, `display:none` kills render; keep the original alive off-screen and overlay it over dummy slots with `position: fixed` + rAF loop |
| P39 | Optimizely events — eventName-only, default tags | Engagement goals fire by `eventName` ONLY with default `{revenue: 0, value: 0.00}` — no custom tags unless the user asks; page-view / time-on-page marks / scroll depth (once per mark) / interaction clicks mapped by user intent (`handoff_clicks`, `trial_start`) |
| P40 | SFCC Product-Variation fetch + inflight dedup for shared-pid tiles | PLP on SFCC/Demandware site; fetch variant data (sizes/widths/stock) per tile; `dwvar_` double-underscore encoding; Tealium `masterProductId` unreliable; multiple tiles share same `data-pid` (colorways) — inflight tracker prevents duplicate fetches, flushPending applies data to all tiles |

A short list of **other techniques** (canvas colour swatches, SVG star ratings, video overlay,
IntersectionObserver sticky, vendor guard, debug toggle) is at the end of `AI/AB_TESTING_PATTERNS.md`.

## 9. QA Checklist (run before shipping)

- [ ] Wrapper is the standard base script; `init()` is the entry point.
- [ ] `waitForElement` (50/15000 defaults) guards every initialization; no direct `init()` call on missing DOM.
- [ ] Unique body class added inside `init()`; all CSS scoped to it.
- [ ] Only stable selectors: semantic id/class/`data-*`; no `contains()`, no grid/utility classes (`.row`, `.col-sm-6`), no hashed/system IDs (Salesforce `00N...`), no tag-only headings (`h6`), no `.bg-gradient`-style visual classes, no positional selectors.
- [ ] All inserts/listeners/observers guarded against duplicates.
- [ ] Every `setInterval`/`setTimeout` clears itself or has a timeout.
- [ ] MutationObservers are scoped, guarded (`isRunning`), and disconnected when done.
- [ ] Events use `live()`; SPA tests use the standard `listener()`.
- [ ] No `!important` unless required; no unscoped CSS.
- [ ] CSS-first pass: every hide/show/style/spacing change is a scoped CSS rule; JS is used only for behavior CSS can't do (move/clone/fetch/state) — no `remove()` / `style.display` where one `display: none` works.
- [ ] Site functionality untouched; no global side effects.
- [ ] `v1.json` created (+ `share.js` where clicks are tracked).
- [ ] Clone/AJAX tests: the real site request was pasted at the Q&A gate (P33 evidence-first) and the code reproduces it byte-for-byte; the full source-container outerHTML (incl. `form=`-associated controls) was provided.
- [ ] `user_qa.md` gives the user the bug-report format (expected-vs-actual in one line + console log + §2.5 evidence paste) and asks them to batch independent bugs in one message.
- [ ] Verified on desktop, tablet, mobile.
- [ ] Knowledge capture done (AGENTS.md STEP 4): verified facts → `ClientData/SITE_PROFILES.md`, new technique → `AI/AB_TESTING_PATTERNS.md` as next P-number + a row in this §8 index + `P1–Pxx` count updated, reusable script → `tools/`.

---

## 10. Anti-Patterns (never do these)

- `nth-child` / positional selectors on dynamic lists — they break the moment the site adds or reorders a row.
- `contains("col-12")`-style partial-class matching — matches unrelated substrings and breaks on rename.
- Bootstrap/grid utility classes (`.row`, `.col-sm-6`, `.container`) and visual classes (`.bg-gradient`, `.text-white`) as anchors — they change with the theme.
- Hashed/system-generated IDs (Salesforce `00N2v00000VhUGp` and similar) — environment-specific, differ between sandbox and prod.
- Tag-only heading selectors (`#x h6`) — `h6` may become `h5` or `p` at any time.
- Hand-rolled event delegation or direct binding to elements that don't exist yet — use `live()`.
- `while(true)` loops, unbounded intervals, or `setInterval` without a paired `setTimeout` self-clear.
- Observing `document`/`body` with a MutationObserver for site-wide change detection.
- `innerHTML =` on a container with event bindings; cloning inputs (duplicate `name`/`id`).
- Rebuilding the whole page or touching unrelated components — scope everything to `EG-<TEST-ID>`.
- Raw non-ASCII copy strings that can mangle encoding in the injection pipeline.
- Re-initialising on every SPA route without idempotency guards (body class + element existence checks).
- Using JS to hide/show or restyle an element that a scoped CSS rule handles (`display: none`, spacing, colour) — presentation belongs in `variation.css`; JS is only for behavior (move/clone/fetch/state). The hidden trap: bundling a CSS job inside a JS move operation.
- Iterating on a failing approach instead of questioning it — "5 tries, same premise" (e.g. forcing a DOM-move on a plugin-owned PayPal iframe: postMessage breaks, retries can't fix it). Fail ONCE → ask *who owns this element's lifecycle*; if a plugin/SDK owns it, overlay — never move (P38). Changing the approach on try 2 beats forcing the same one on try 5.

---

## 11. How to Use This Playbook

1. Read the test brief and identify the goal. Match it against the §8 INDEX above and pick
   the matching P# — the full recipe is in `AI/AB_TESTING_PATTERNS.md`. Read ONLY that
   pattern; never the whole file.
2. Copy the base script from §2, add the body class, and adapt the chosen pattern inside `init()`. No search needed.
3. If NO pattern matches, use the RAG fallback: `python scripts/search_tests.py "brief description"` (script auto-locates the `AB-test` archive anywhere on the machine and prints the top 3 similar tests). Study the code, then append the new technique to `AI/AB_TESTING_PATTERNS.md` as the next P-number AND add a row to the §8 index so the library grows.
4. Scope all CSS to the body class (§6). Add `share.js` goals if the test measures clicks (§7).
5. New patterns discovered in future work are added to `AI/AB_TESTING_PATTERNS.md` (recipe) + this §8 index (row) so the library always expands.
6. Run the QA checklist (§9) before handing over.

---

## 12. Working Faster — Tooling & Process Notes

These save the most time on every test, whatever the client. Source: lessons from a sitewide-nav test where most of the session went into site autopsy instead of code.

1. **Check `ClientData/SITE_PROFILES.md` before any live inspection.** If the client is listed, verify only what changed; never re-autopsy a worked site.
2. **Minified one-line HTML/JS can't be read with normal tools.** Use `Select-String` for line matches or PowerShell `[regex]::Match($content, 'pattern')` / `.Substring()` windows. (`rg` is not installed on this machine's PowerShell.) If the USER hands you a fetched page or theme asset, save it to a scratch folder once — reuse it instead of re-fetching.
3. **Don't chase the theme's minified JS bundle / webpack chunks to learn how a component works.** Dynamic chunks often 404 and the source is unreadable — a guaranteed time sink, and chasing them is a banned deep dive. Get the exact DOM from the user instead (one `outerHTML` paste of the component) or from the client's site profile.
4. **Detect state from the rendered DOM, not from plugin internals.** If clicks or `.active` classes are unreliable, use pattern **P25** — the site always renders a signal you can read (e.g. a submenu's back-link href).
5. **Validate logic with `node` before shipping.** Parse-critical pieces (regexes, URL/href mapping, tab derivation) take seconds to verify:
   `node -e "..."` (single-quote the script in PowerShell to avoid `$` interpolation) or a scratch `.js` file. Fix bugs here, not in the test tool.
6. **Fetch cap:** you may `Invoke-WebRequest`/`webfetch` a page with an explicit `User-Agent` (some stores 404 default PowerShell's UA) AT MOST once to read SSR HTML. That's the limit — more than a couple of fetches means you're guessing → STOP and ask the user.
7. **Keep the file-transfer pipeline in mind:** when the USER gives you a site asset, save it to the scratch folder with a clear name — re-downloading a 800 KB minified CSS to grep it twice is wasted time.
8. **Write knowledge back AFTER every test (STEP 4).** The kit only compounds if each finished test updates `ClientData/SITE_PROFILES.md` (verified selectors/endpoints), `AI/AB_TESTING_PATTERNS.md` (new P-pattern) + this §8 index, and `tools/` (reusable scripts). A test that adds nothing to the kit leaves the next session re-doing your work. When a site's rendered content is JS/AJAX-driven and the USER needs a deterministic check, they can use pattern **P27** (headless Edge) — record the working command in the client's profile so the user can reuse it.
