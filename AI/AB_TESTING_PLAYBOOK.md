# AB Testing Playbook

Default coding standard for every A/B test in this repository. Distilled from the latest shipped tests (MONASH CRO series, REVIVSERUMS, PRAXINDO, JUVIA, BELLA & DUKE, GUARDIAN FUNERALS, RIGID HITCH, AAPL). Follow this file for all future work. It replaces ad-hoc / older wrapper styles found in legacy folders.

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

- Client folder is the client name in caps (e.g. `MONASH`, `REVIVSERUMS`, `PRAXINDO`).
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

- **Body class**: `EG-<TEST-ID>` added once inside `init()`. Examples seen in the repo: `EG-AB-06-HP`, `EG-MOL1001`, `EG-PXD-SM27`, `EG-GF-homepage`, `EG-GC`, `EG-HP`. Every rule in CSS must be scoped by this class.
- **New DOM elements**: lowercase `eg-` prefixed classes (`.eg-hero-section`, `.eg-course`, `.eg-guest-cta`, `.eg-btn`). Never reuse site classes for our elements.
- **variation_name**: descriptive, e.g. `"EG-PXD-SM27-Redesign"`, `"EG-HP-VariantA"`.

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

## 8. Reusable Patterns Library

This library is the primary source of implementation recipes. Before writing any code, find the pattern(s) below that match the test and adapt them. It is distilled from the shipped tests in the archive (MONASH CRO, REVIVSERUMS, PRAXINDO, JUVIA, BELLA & DUKE, GUARDIAN FUNERALS, RIGID HITCH, AAPL and more) and verified live research (SMARTSIGN, AWG). No external RAG search is required.

Every recipe assumes the base script from §2 and follows the rules from §4–§6. All patterns must stay idempotent (guard against duplicate insertion), use only stable selectors, and never break existing functionality.

### P1. Image Swap (incl. lazy-load, srcset, picture)

**When:** replacing hero / product / section imagery.

**Recipe:**
```js
function swapImage(container, newSrc) {
  var img = container.querySelector('img');
  if (!img) return;
  // Preserve the original for device-switch restore (P11)
  if (!container.classList.contains('eg-swapped')) {
    container.dataset.egOrig = img.currentSrc || img.src;
    container.classList.add('eg-swapped');
  }
  // Set every resolution source so native + lazy-load libs pick it up
  img.setAttribute('src', newSrc);
  img.setAttribute('srcset', newSrc + ' 1x');
  img.setAttribute('data-src', newSrc);       // lazy-loader hooks
  img.setAttribute('data-lazy-src', newSrc);
  var sources = container.querySelectorAll('source');
  for (var i = 0; i < sources.length; i++) sources[i].setAttribute('srcset', newSrc);
}
```

**Gotchas:**
- Update `<source srcset>` inside `<picture>` too, or the swap silently fails on art-direction breakpoints.
- Keep the element's height (fixed height, `aspect-ratio`, or a CSS min-height) so the swap does not cause layout shift (CLS).
- Only touch images matching a stable container; never sweep `document.querySelectorAll('img')`.

### P2. Insert a New Section / Block Between Elements

**When:** adding a marketing section, banner, CTA, or content block at a specific spot.

**Recipe:**
```js
function addSection() {
  var anchor = document.querySelector('.stable-anchor');
  if (!anchor || document.querySelector('.eg-hero-section')) return; // idempotent
  var section = document.createElement('div');
  section.className = 'eg-hero-section';
  section.innerHTML = '<h2 class="eg-title">...</h2><p class="eg-copy">...</p>';
  anchor.insertAdjacentElement('beforebegin', section); // afterend | beforebegin | afterbegin | beforeend
}
```

**Gotchas:**
- `insertAdjacentHTML('beforeend', html)` is the fastest way to fill an element; use `insertAdjacentElement` when you hold a node reference.
- Always guard on the presence of the newly created element before inserting (double-poll / re-run protection).
- Never `innerHTML =` an existing container that carries event bindings — that destroys them.

### P3. Sticky Element (header / bar / CTA)

**When:** making an element stick, appear, or collapse on scroll.

**Recipe:**
```js
function initSticky() {
  if (document.body.classList.contains('eg-stuck')) return;
  window.addEventListener('scroll', function () {
    var y = window.scrollY || document.documentElement.scrollTop;
    document.body.classList.toggle('eg-stuck', y > 300); // CSS owns all styling
  }, { passive: true });
}
```
```css
.EG-TEST-ID .site-header { transition: box-shadow .2s; }
.EG-TEST-ID.eg-stuck .site-header { position: sticky; top: 0; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
```

**Gotchas:**
- Prefer CSS `position: sticky` for the element itself; only use a scroll listener when you must style other parts of the page based on scroll depth.
- Use `{ passive: true }` and throttle with `requestAnimationFrame` if the callback does heavy work.
- Check `position: sticky` against the site's scroll containers — sticky fails inside an `overflow: auto` ancestor that isn't the viewport.

### P4. DOM Reordering (move existing sections)

**When:** moving a section, reordering list items, transplanting an existing block into a new spot.

**Recipe:**
```js
function reorder() {
  var list = document.querySelector('.eg-parent');
  if (!list || list.dataset.egReordered) return;
  list.querySelectorAll('.eg-source-item').forEach(function (item) {
    list.insertBefore(item, list.firstChild); // appendChild / insertBefore both auto-detach
  });
  list.dataset.egReordered = '1';
}
```

**Gotchas:**
- Moving a node auto-detaches it from its old position — no manual remove needed, but never append the same node twice (it silently moves instead of duplicating).
- Loop in reverse when reordering into a new order to avoid index skew (`for (var i = n - 1; i >= 0; i--)`).
- Reuse `live()` for any click handling on moved nodes so bindings survive the move.

### P5. Survival Under AJAX / Re-render (MutationObserver guard)

**When:** the page re-renders the target area (carousels, carts, infinite feeds) and undoes our changes.

**Recipe:**
```js
var observerRunning = false;
function ensureApplied() {
  if (observerRunning) return; // re-entrancy guard
  observerRunning = true;
  applyChanges(); // the idempotent init work
  setTimeout(function () { observerRunning = false; }, 200); // debounce
}
var mo = new MutationObserver(function (mutations) {
  var changed = mutations.some(function (m) {
    return m.type === 'childList' && m.addedNodes.length;
  });
  if (changed) ensureApplied();
});
mo.observe(document.querySelector('.target-container'), { childList: true, subtree: true });

// Disconnect when done / not needed:
// mo.disconnect();
```

**Gotchas:**
- Scope the observer to the smallest container that changes; never observe `document.body` for whole-site change detection.
- Guard with an `isRunning`/`observerRunning` flag + debounce to avoid infinite loops from your own mutations.
- Disconnect the observer once the change is applied and stable.

### P6. SPA Routing (cross-page persistence)

**When:** the test must apply on multiple routes, or state must survive navigation.

**Recipe:** use the standard `listener()` from §2 verbatim. Inside the callback, re-run `waitForElement` for the target of the new route and re-apply idempotent changes. For state that must persist across routes:

```js
var state = JSON.parse(localStorage.getItem('eg-flow') || '{}');
function saveState(key, val) { state[key] = val; localStorage.setItem('eg-flow', JSON.stringify(state)); }
```

**Gotchas:**
- Re-running `init()` must be safe — every mutation checks for the body class / element existence before acting.
- Timestamp stored state when it should expire (e.g. urgency timers): store `Date.now()` and compare on read.

### P7. Event Tracking / Goals

**When:** measuring clicks on test elements or existing CTAs.

**Recipe:** see §7 `share.js`. One `live()` per tracked interaction with a readable log string. Never mutate the DOM in `share.js`.

### P8. Form Restructure (re-layout without breaking submission)

**When:** redesigning a form's visual order/layout while keeping it functional.

**Recipe:**
```js
function restructureForm() {
  var form = document.querySelector('form.stable');
  if (!form || form.classList.contains('eg-re') ) return;
  form.classList.add('eg-re');
  // Move existing fields into our layout via insertBefore/appendChild — do NOT clone
  var submit = form.querySelector('.site-submit');
  form.appendChild(submit); // submit last
}
```

**Gotchas:**
- Never clone inputs — duplicate `name`/`id` breaks autofill, validation, and submission parsing.
- Keep every field's `name`, `id`, `required`, and value attributes intact.
- Preserve native submit, tab order, autofill, and browser validation; test the form end-to-end.

### P9. On-Demand External Library Loading

**When:** the test needs a library the site does not ship (e.g. `tiny-slider` for a carousel).

**Recipe:**
```js
function loadTinySlider(cb) {
  if (window.tns) return cb();
  if (document.querySelector('.eg-lib-loaded')) return; // already queued
  var lib = document.createElement('div');
  lib.className = 'eg-lib-loaded';
  document.head.appendChild(lib);
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.example.com/tiny-slider.min.css';
  document.head.appendChild(link);
  var script = document.createElement('script');
  script.src = 'https://cdn.example.com/tiny-slider.min.js';
  script.onload = cb;
  script.onerror = function () { /* fall back to static layout */ };
  document.head.appendChild(script);
}
loadTinySlider(function () {
  tns({ container: '.eg-carousel', items: 3, responsive: {...} });
});
```

**Gotchas:**
- Poll for the library's global (`window.tns`) before initialising — it may still be loading.
- Guard against double-injection (both window-global check and a queued-element flag).
- Provide a graceful non-JS/on-error fallback so content stays visible.

### P10. Text / Copy / Price / Badge Replacement

**When:** swapping headline/copy, changing prices, or adding sale badges.

**Recipe:**
```js
function updateCopy() {
  var heading = document.querySelector('.product-title');
  if (!heading || heading.dataset.egDone) return;
  heading.textContent = 'New headline';
  heading.dataset.egDone = '1';

  var price = document.querySelector('.price-amount');
  if (price) price.textContent = '$49.99'; // keep currency formatting intact

  var img = document.querySelector('.product-media');
  if (img && !img.querySelector('.eg-badge')) {
    var badge = document.createElement('span');
    badge.className = 'eg-badge';
    badge.textContent = 'Best Value';
    img.appendChild(badge);
  }
}
```

**Gotchas:**
- Change only the text node (`textContent`) of a leaf element — never rewrite `innerHTML` of a wrapper that has bindings.
- Use ASCII / entity-safe strings for copy (avoid raw unicode that can break encoding in the injection pipeline).
- For prices, preserve the site's currency formatting and `data-*` price hooks used by cart logic.

### P11. Device-Switch Restore (matchMedia)

**When:** the change must apply on some viewports and revert on others (e.g. mobile-only bar, desktop-only sidebar).

**Recipe:**
```js
function deviceAware() {
  var mq = window.matchMedia('(min-width: 992px)');
  function apply() { document.body.classList.toggle('eg-desktop', mq.matches); }
  apply();
  mq.addEventListener('change', apply); // re-runs on rotate / resize across breakpoint
}
```

**Gotchas:**
- Keep the original values (e.g. stored via `dataset.egOrig` in P1) so you can restore on switch instead of re-sniffing.
- Clean up `matchMedia` listeners with the test (they are scoped to the IIFE closure).

### P12. Cross-Page Flow / Persistent State (localStorage)

**When:** multi-step flow, first-visit nudges, urgency timers, previously-seen-CTA suppression.

**Recipe:**
```js
var key = 'eg-' + variation_name;
function initFlow() {
  var data = {};
  try { data = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { data = {}; }
  if (data.seen) return; // already engaged
  // ... show CTA / start timer ...
  function engage() { data.seen = 1; data.t = Date.now(); localStorage.setItem(key, JSON.stringify(data)); }
  live('.eg-cta', 'click', engage);
}
```

**Gotchas:**
- Wrap `localStorage` access in try/catch (private mode / disabled storage throws).
- Version the key with the variation name so different tests never collide.
- Expire urgency/one-time timers by comparing `Date.now()` against the stored timestamp.

### P13. AJAX Response Re-application (XHR `send()` hook)

**When:** the page re-renders content via fetch/XHR (minicarts, quick-view, facet filters, lazy sections) and your DOM changes are wiped. A MutationObserver (P5) re-applies changes only if the nodes change again; an XHR hook lets you re-apply at the exact moment new content lands.

**Recipe:**
```js
(function () {
  var origOpen = XMLHttpRequest.prototype.open;
  var origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function () {
    this._egMethod = arguments[0];
    this._egUrl = arguments[1];
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener('load', function () {
      if (this._egUrl && this._egUrl.indexOf('/cart/') > -1) reapplyCartUI(); // any guard you need
    });
    return origSend.apply(this, arguments);
  };
})();
```

**Gotchas:**
- Keep the guard narrow (URL / method / responseType) so unrelated requests don't trigger work.
- Re-apply must be idempotent — guard with a body class or `dataset` flag so you never double-wrap (see P8 / P10 gotchas).
- If the site uses `fetch()` instead of XHR, wrap `window.fetch` the same way (check `url` in the first arg, read response via `res.clone().json()`).
- Only hook once; guard the whole block so it can't be installed twice.

### P14. React / Controlled-Input Automation

**When:** the form field is a React (or Vue/Svelte) controlled input. Setting `.value` directly doesn't register, and `keydown` events are ignored. Source: FIJI_AIRWAYS (location auto-select).

**Recipe:**
```js
function setReactInput(el, value) {
  var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, value);                       // bypass React's internal tracker
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
// then drive the dropdown, e.g. dispatch ArrowDown + Enter:
function pickDropdownOption(optionText, sel) {
  var dd = document.querySelector(sel);
  if (!dd) return;
  var opt = Array.prototype.slice.call(dd.querySelectorAll('li, .option'))
    .find(function (o) { return o.textContent.trim().indexOf(optionText) > -1; });
  if (!opt) return;
  opt.click();
}
```

**Gotchas:**
- The value setter lives on the **prototype** (`HTMLInputElement.prototype`), not on the element itself; using it keeps React's internal value tracker in sync.
- Always dispatch `input` (and sometimes `change`) with `bubbles: true` after setting.
- For a controlled **select**, dispatch a `change` event on the `<select>` element instead.
- This is inherently brittle to framework internals — pair with P5 (MutationObserver) so the follow-up UI is caught whether it renders sync or async.

### P15. Library Readiness Waiters

**When:** your code calls `$`, `Swiper`, `Slick`, `Munchkin`, etc., but the page loads the library lazily or after AJAX. Calling early throws; polling with `setTimeout` is uglier. Source: Moorings, WICKED_CLOTHES, SWEET PLAID.

**Recipe:** use `snippets/waitForLibrary.js`:
```js
waitForJquery(function () { /* code that uses $ */ });
// generic:
waitForLibrary(function () { return window.Swiper; }, function () { new Swiper('.eg-swiper'); });
```

**Gotchas:**
- Always provide a timeout so the interval dies and no console spam if the lib never loads.
- Re-check readiness inside the callback if your code itself is async.
- For libraries the site injects per-route (SPA), re-run the waiter inside the SPA listener (P6).

### P16. Cookie Helpers

**When:** popups, first-visit nudges, geo swaps, or anything that must remember a choice across pages/sessions without touching localStorage. Source: OCTO_PART, VACATION.

**Recipe:** use `snippets/cookies.js`:
```js
if (!getCookie('eg_geo_seen')) { showGeoCTA(); setCookie('eg_geo_seen', '1', 30); }
deleteCookie('eg_geo_seen'); // reset for QA
```

**Gotchas:**
- Always `encodeURIComponent`/`decodeURIComponent` values — prices, phone numbers, and text can contain spaces/symbols.
- Use the variation name in the cookie key so tests never collide.
- `path=/` or the cookie silently doesn't apply on sub-pages.

### P17. Exit-Intent Popup (desktop + mobile, cookie-guarded)

**When:** exit-intent / cart-abandon popup. Desktop: mouse leaving the top of the viewport. Mobile: quick scroll-up. One-time per visitor via cookie. Source: OCTO_PART, LATTICE, VACATION.

**Recipe:**
```js
var popupKey = 'eg_xi_' + variation_name;
if (!getCookie(popupKey)) {
  var armed = false, shown = false;
  function showPopup() {
    if (shown) return;
    shown = true; setCookie(popupKey, '1', 30);
    el.style.display = 'block';
  }
  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0) { if (!armed) { armed = true; setTimeout(function () { armed = false; }, 2000); } else showPopup(); }
    });
  } else {
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      if (window.scrollY < lastY - 150) showPopup();   // fast upward scroll
      lastY = window.scrollY;
    });
  }
  live('.eg-xi-close', 'click', function () { el.style.display = 'none'; });
  document.addEventListener('click', function (e) {
    if (shown && !el.contains(e.target)) el.style.display = 'none';  // click-outside
  });
}
```

**Gotchas:**
- The `mouseout` arm/disarm pattern stops the popup firing on every move to the top edge — require two passes or a short re-arm delay.
- Add a real close button (`live`-bound) — the click-outside handler alone fails for screen-reader / keyboard users.
- Store `shown` in a cookie **at show time**, not arm time, so QA can re-test.

### P18. Cart-Reactive Progress Bar / Threshold Message

**When:** free-shipping or threshold progress bars that must update live when the cart changes (add/remove/qty). Source: PRAXINDO SM25, ROYAL_DOUTON, VACATION, DRSEBISCELLFOOD.

**Recipe:**
```js
function updateBar() {
  var count = 0;
  document.querySelectorAll('.mini-cart .line-item').forEach(function (li) {
    count += parseFloat(li.querySelector('[data-qty]').dataset.qty) || 0;
  });
  var pct = Math.min(100, Math.round((count / threshold) * 100));
  bar.style.width = pct + '%';
  msg.textContent = count >= threshold ? 'Free shipping unlocked!' : 'You are $' + (threshold - count).toFixed(2) + ' away';
}
// re-apply on AJAX cart updates (P13) AND on direct DOM changes (P5):
new MutationObserver(updateBar).observe(cartEl, { childList: true, subtree: true });
```

**Gotchas:**
- Read the count from the **page's own cart DOM**, not your own counter — the site is the source of truth.
- Guard against `NaN` (`|| 0`) when a qty field is empty or mid-edit.
- Re-run `updateBar` after the XHR cart load completes (P13), not only on mutation, because the counter row may be fully replaced.

### P19. Date Math (business-day estimates + timezone-normalized countdown)

**When:** "ships in X business days", countdown to a promo window, or date-based urgency. Source: PRAXINDO SM23, Moorings.

**Recipe:**
```js
function addBusinessDays(d, n) {
  var date = new Date(d);
  var added = 0;
  while (added < n) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) added++;
  }
  return date;
}
function etaText() {
  var eta = addBusinessDays(new Date(), 5);
  return eta.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
// timezone-safe countdown: build the target from a UTC ISO string, never from local Date('2026-...') parsing
var end = new Date('2026-12-31T23:59:59Z');
function tick() { document.getElementById('eg-count').textContent = Math.max(0, Math.floor((end - Date.now()) / 1000)) + 's'; }
setInterval(tick, 1000);
```

**Gotchas:**
- Holiday lists vary by region — if the brief needs them, pass an explicit holiday array to `addBusinessDays`.
- `new Date('YYYY-MM-DDTHH:mm:ssZ')` is parsed as UTC regardless of the visitor's timezone; `new Date('YYYY-MM-DD')` is parsed as local — pick deliberately.
- Format with `toLocaleDateString` for the visitor's locale instead of hand-building month names.

### P20. Cross-Page HTML Fetch → Parse → Clone

**When:** you need a component (trust badge, size chart, FAQ, header/footer snippet) that only exists on another page of the same site, and you must reuse it verbatim rather than rebuild it. Source: TACTICALELITES, YANKEE_CANDLE.

**Recipe:**
```js
fetch('/pages/shipping').then(function (r) { return r.text(); }).then(function (html) {
  var doc = new DOMParser().parseFromString(html, 'text/html');
  var el = doc.querySelector('.shipping-info');
  if (el) { target.appendChild(el.cloneNode(true)); }   // cloneNode(true) keeps descendants + attrs
}).catch(function () { /* silent fail — enhancement only */ });
```

**Gotchas:**
- Same-origin only (usually fine — it's the same site). For cross-domain, use P9 to load a script instead.
- Only `enhance` — never gate the page on the fetch; `.catch` and move on if it fails or the page is down.
- Wrap all new content in your body-class-scoped CSS so it inherits styling and never clashes.

### P21. IP-Geo Content Swap (region-specific phone / messaging)

**When:** showing a local phone number or region-specific text based on visitor location. Source: Moorings.

**Recipe:**
```js
waitForJquery(function () {
  $.getJSON('https://ipapi.co/json/', function (data) {
    var country = (data.country_name || '').toLowerCase();
    document.querySelectorAll('.eg-phone').forEach(function (p) {
      if (country === 'australia' || country === 'new zealand') p.textContent = '+61 000 000';
      else p.textContent = '+1 000 000';
    });
  });
});
```

**Gotchas:**
- The geo call is async and external — run it inside `waitForJquery`/readiness waiter and let the UI update in place (no blocking).
- Match on `country_code` too, not just name; fall back gracefully when the API fails (keep the original number).
- Respect the site's existing privacy expectations — prefer the provider already used by the site if one exists.

### P22. CSS-Only Carousel (scroll-snap + hidden scrollbar)

**When:** product/category carousels that should feel native, need no JS drag handlers, and must keep touch swiping. Source: ALTIUM TS-2467, LILYSKIN, HW PART STORE.

**Recipe:**
```css
.eg-carousel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.eg-carousel::-webkit-scrollbar { display: none; }
.eg-carousel > * { flex: 0 0 auto; scroll-snap-align: start; }
```

**Gotchas:**
- Hide the scrollbar in **both** standard (`scrollbar-width`) and WebKit (`::-webkit-scrollbar`) so desktop doesn't show a clunky bar.
- Optionally add prev/next buttons that scroll `container.scrollBy({ left: 300, behavior: 'smooth' })`.
- Only apply snap on touch-capable or coarse-pointer devices if desktop users expect free scrolling.

### P23. 0fr/1fr Accordion Animation (pure CSS, no height hacks)

**When:** FAQ/accordion sections that need a smooth open/close animation without measuring heights or JS. Source: AQUA.

**Recipe:**
```css
.eg-acc-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
.eg-acc-body > * { overflow: hidden; }
.eg-acc.open .eg-acc-body { grid-template-rows: 1fr; }
```

**Gotchas:**
- The inner wrapper (`> *`) must have `overflow: hidden` or the child content leaks during the animation.
- Pair with a small `live('.eg-acc-head', 'click', ...)` handler that toggles the `.open` class.

### P24. rAF-based `waitFor` + ResizeObserver viewport compensation

**When:** elements appear after layout/font-load (rAF beats polling) and sticky/absolute elements must compensate when the viewport resizes or the header height changes. Source: ALTIUM, GERBERGEAR, ROYAL_DOUTON.

**Recipe:**
```js
function waitForNextFrame(callback) { requestAnimationFrame(function () { requestAnimationFrame(callback); }); }
function compensate() { stickyEl.style.top = headerEl.getBoundingClientRect().height + 'px'; }
new ResizeObserver(compensate).observe(headerEl);   // header shrinks/grows on scroll or media queries
window.addEventListener('resize', waitForNextFrame); // avoid layout-thrash reads in the same frame
```

**Gotchas:**
- Double-rAF ensures the browser has painted after a reflow before you measure.
- ResizeObserver fires repeatedly; debounce or cheaply assign in `compensate`.
- `getBoundingClientRect().height` is a layout read — don't call it inside a scroll listener without a rAF wrapper.

### P25. Derive Active Tab / Current View From Rendered Content (not click events)

**When:** a theme intercepts tab/menu clicks — it stops propagation, drives tabs through its own plugin, or sets the `.active` class asynchronously — so click listeners and `.active`-class reads are unreliable. Instead, derive the current state from content the site itself renders: e.g. an AJAX-loaded submenu whose "back / overview" link href contains the active category. Source: AWG (AB042 sitewide nav mobile).

**Recipe:** MutationObserver on the container that receives the AJAX content; parse the first path segment of the loaded submenu's overview-link href; apply your per-state hrefs. Keep the tab click binding as a fast path only.

```js
var urlParser = document.createElement('a');
var DEFAULT_TAB = 'damen';

function getActiveTab(body) {
  var link = body.querySelector('.navigation-offcanvas-previous a[href]');
  if (link) {
    urlParser.href = link.getAttribute('href') || '';
    var m = urlParser.pathname.match(/^\/(damen|herren|kinder|wohnen)(?:\/|$)/i);
    if (m) return m[1].toLowerCase();
  }
  return DEFAULT_TAB;
}

// body-level MutationObserver: act only when a relevant node is added
new MutationObserver(function (mutations) {
  for (var i = 0; i < mutations.length; i++) {
    var added = mutations[i].addedNodes;
    for (var j = 0; j < added.length; j++) {
      var n = added[j];
      if (n.nodeType === 1 && n.querySelector && n.querySelector('.navigation-offcanvas-previous')) {
        syncUi(n.closest('.offcanvas-body')); // derive + apply hrefs
        return;
      }
    }
  }
}).observe(document.body, { childList: true, subtree: true });
```

**Gotchas:**
- Parse with an anchor's `pathname`, not a regex on the raw href — it resolves relative URLs and strips query strings (`/wohnen?p=1` stays `/wohnen`).
- AJAX `innerHTML` swaps surface as `childList` mutations on the container — observe the container, not the site's JS.
- If the container may be re-created entirely, observe `document.body` subtree but bail out fast unless an added node contains your anchor.
- Keep a `DEFAULT` state for the first render before any content loads.

### P26. Low / No-Result Search Fallback

**When:** the site's search returns very few results (0–5) for legitimate queries, leaving users with a dead-end SERP. Add related products, popular searches, or department links to recover the session. Source: SMARTSIGN (research Aug 2026).

**Research first — prove the failing state exists:**
1. Find the search URL pattern (`/search/{term}`, `?q=`, etc.) and the result-count element. On SMARTSIGN: `#total_result`, grid `.products_grid`, item `.ss-product-box`.
2. Batch-test candidate niche terms with the headless tool (P27) and record which terms return 0, 1, 5, 6, ... results. Pick trigger threshold from real data (e.g. `count <= 5`).
3. Verify the page renders results client-side (AJAX) vs server-side — this decides whether you read a count element or count grid items.

**Recipe (AJAX-loaded count, e.g. SMARTSIGN):**
```js
function readResultCount() {
  var el = document.querySelector('#total_result');
  if (!el) return -1;
  var m = (el.textContent || '').trim().match(/([\d,]+)\+?\s*results?/i);
  if (!m) return -1;                       // "1 result" / "48 results" / "300 + results"
  return parseInt(m[1].replace(/,/g, ''), 10);
}
function applyFallback() {
  var count = readResultCount();
  if (count === -1 || count > 5) return;   // healthy SERP, or count not rendered yet
  var grid = document.querySelector('.products_grid');
  if (!grid || document.querySelector('.eg-search-fallback')) return; // idempotent
  // insert fallback block (related depts / popular searches) after the grid
  grid.insertAdjacentHTML('afterend', buildFallbackHtml(count));
}
// re-apply when AJAX finishes re-rendering the count (MO scoped to the count element)
var mo = new MutationObserver(function (mutations) {
  for (var i = 0; i < mutations.length; i++) {
    if (mutations[i].type === 'childList' || mutations[i].type === 'characterData') {
      applyFallback(); break;
    }
  }
});
var countEl = document.querySelector('#total_result');
if (countEl) mo.observe(countEl, { childList: true, characterData: true, subtree: true });
```

**Gotchas:**
- The count text format varies (`1 result`, `6 results`, `300 + results`, `1,000+ results`) — normalize before comparing. Prefer the raw hidden input (`#txtresultcount`) when the site exposes one.
- Server-rendered SERPs: read the count once in `init()`, no observer needed.
- Fallback content must be enhancement-only: if the count element never renders (page error), do nothing.
- Guard against duplicate insertion and observer re-trigger loops (debounce / `isRunning` flag).

### P27. Headless Browser Verification (JS-rendered content)

**When:** a page renders its real content via AJAX/JS (search results, product grids, lazy sections), so `Invoke-WebRequest`/`webfetch` only returns the empty shell. You need the post-render DOM to verify selectors, count results, or read dynamic text — on ANY site, no per-site automation code. Source: SMARTSIGN research (Aug 2026).

**Recipe (Edge headless dump):**
```powershell
# Edge headless + virtual-time-budget makes the page run its JS (incl. AJAX) then dumps the DOM
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$out  = "$env:TEMP\page.html"
$prof = "$env:TEMP\profile_$([guid]::NewGuid().ToString('N'))"
$proc = Start-Process -FilePath $edge -ArgumentList "--headless","--disable-gpu","--no-sandbox",
  "--user-data-dir=$prof","--dump-dom","--virtual-time-budget=10000","--timeout=25000",$url `
  -RedirectStandardOutput $out -RedirectStandardError "$env:TEMP\edge_err.txt" -PassThru -NoNewWindow
if (-not $proc.WaitForExit(30000)) { $proc.Kill() }
Remove-Item $prof -Recurse -Force -ErrorAction SilentlyContinue
# then grep the dump for the rendered selector, e.g. id="total_result">N results<
```

**Gotchas:**
- `--dump-dom` needs a long-enough `--virtual-time-budget` for the page's AJAX to land (10s is a good start); the process may not exit cleanly — enforce a `WaitForExit` timeout + `Kill()`.
- Use a unique `--user-data-dir` per run or concurrent Edge instances conflict.
- Runs are flaky when many run in parallel (0-byte dumps) — rerun failed terms sequentially.
- Chrome on other machines: same flags, different `chrome.exe` path.
- Reusable: `tools/ss_search_check.ps1` is the parameterized SMARTSIGN version (terms + count extractor); copy it, swap the selector, and it audits any site's search.

### P28. Re-decorating a Reused Success Modal (ACP-style popup)

**When:** the site shows a post-action modal (add-to-cart "success" popup, quick-view, coupon confirm) whose markup is a static skeleton hydrated by the site's own JS on every trigger. You must redesign it without fighting the site's fill-in logic, and survive multiple consecutive triggers reusing the SAME popup node. Source: PRAXINDO SM25 (AW ACP popup, Aug 2026).

**Key ideas:**
1. **Let the site keep its own nodes.** Restyle + insert around `.layer__checkout__title`, `.layer__checkout__product` etc. instead of copying their values into new nodes — the site JS keeps updating them and you never race it.
2. **Activation signal = the skeleton being filled.** SSR skeletons have empty title links / empty price spans. Don't observe visibility toggles — poll cheaply for the success state (`selector + ':success title'`) AND a non-empty product title, then decorate. Poll re-runs on every activation.
3. **Keyed re-decorate.** A reused popup's innerHTML may be updated in place (not replaced), so a one-time flag would skip the 2nd add. Track `key = productTitle + '|' + cartCounter`; re-decorate when the key changes, and remove your own `eg-*` pieces first (idempotent).
4. **Late data → delayed refresh.** Hidden inputs (`cart_net_sum`) are filled a beat after the popup opens. Recompute the dynamic bits once ~800 ms later, but only if the same product is still active (re-check the title).
5. **AJAX-filled siblings.** If a section (`[data-role="related"]`) is empty at SSR and populated by JS later, put a scoped MutationObserver on it with a `isRunning` guard (P5). If the tile markup is unknown, detect tiles structurally (elements containing a `.html` product link or a `.price`), dedupe parents/children, and limit to the required count.

**Gotchas:**
- Raw non-ASCII copy mangles in the injection pipeline — write German/umlauts as `\u00fc` escapes in JS.
- Hide replaced original controls with `display:none` rather than removing them, so the site's JS (and its handlers) stay intact.
- Don't read dynamic popup values at load time — read them at decorate time.

### P29. Client-Editable Config Map for Creatives (handle-keyed)

**When:** the brief replaces media (images/videos/copy) with creatives that are NOT final yet. Put every swap decision in ONE clearly-marked object the client edits post-launch, keyed by a stable per-item id (product handle / SKU), so updating assets never requires touching the swap logic. Source: REVIVSERUMS AB-06-HP (Best Sellers image refresh, Aug 2026).

**Recipe:**
```js
// UPDATE HERE — key = product handle, value = new creative URL
var EG_BS_EDITORIAL = {
  'hair-stimulating-serum': 'https://.../reviv-ultimate-serum-1.jpg?v=...',
  'ultimate-serum': 'https://.../reviv-ultimate-serum-1.jpg?v=...'
};
function normalizeImageUrl(url) {
  return String(url || '').replace(/^https?:/, '').split('?')[0];
}
function swapCardImages() {
  var cards = document.querySelectorAll('.c_best_seller_single_product');
  for (var i = 0; i < cards.length; i++) {
    var link = cards[i].querySelector('.c_bs_single_product_img a[href*="/products/"]');
    var m = link && link.getAttribute('href').match(/\/products\/([^/?]+)/);
    if (!m) continue;
    var target = EG_BS_EDITORIAL[m[1]];
    var img = cards[i].querySelector('img.c_product_main_image');
    if (!target || !img) continue;
    if (normalizeImageUrl(img.getAttribute('src')) === normalizeImageUrl(target)) continue; // idempotent
    img.setAttribute('src', target);
  }
}
```

**Gotchas:**
- Key by a stable id from the DOM (`/products/{handle}` in the card link), never by array index or image filename — the handle survives theme re-renders and collection reordering.
- Normalize protocol (`http:`/`https:`) and query string before comparing srcs so re-runs are no-ops (works with protocol-relative site URLs).
- Eager single-src `<img>` (Shopify custom sections) needs only `src`; use P1 for lazy-load/srcset/`<picture>` cases.
- Ask the client at the Q&A gate where the creatives come from (Q: "where do the images come from?") — this pattern exists precisely because creatives usually aren't ready at build time.

### P30. Client-Side Variant Switcher Powered by Fetched PDP Blocks (no AJAX, no refresh)

**When:** the PLP card must show a grade/variant selector (A/B/C, size, condition) and switching a variant must update image + price + links IN PLACE exactly like the PDP's own switcher — but the PLP page itself exposes no AJAX endpoint. The PDP page embeds every variant's HTML server-side, so one fetch gives you all variant data for free. Source: PCLIQUIDATIONS PLP01 (PLP card revamp, Aug 2026).

**Recipe:**
```js
function fetchPdpData(url) {
  var id = (url.match(/\/p(\d+)/) || [])[1];
  if (!id) return Promise.resolve(null);
  var cacheKey = 'eg-test:' + id;
  var hit = sessionStorage.getItem(cacheKey);
  if (hit) return Promise.resolve(JSON.parse(hit).data);
  return fetch(url, { credentials: 'same-origin' })
    .then(function (r) { return r.text(); })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var blocks = doc.querySelectorAll('.listing-variant');   // one per variant, embedded in PDP
      var data = {};                                           // keyed by grade letter
      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        data[b.getAttribute('data-grade')] = {
          id: b.getAttribute('data-id'),
          price: parseFloat(b.getAttribute('data-price')),
          strike: parseFloat(b.getAttribute('data-strike')) || 0,
          img: (b.querySelector('img') || {}).getAttribute('src') || ''
        };
      }
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: data }));
      return data;
    }).catch(function () { return null; });   // enhancement only — never gate on it
}
function swapVariant(card, v) {
  card.querySelector('.eg-price').textContent = '$' + v.price.toFixed(2);
  card.querySelector('.eg-strike').textContent = v.strike ? '$' + v.strike.toFixed(2) : '';
  var img = card.querySelector('img');
  if (v.img && img) { img.setAttribute('src', v.img); }
}
```

**Key ideas:**
1. **Parse the PDP's embedded variant blocks instead of finding an API.** If the PDP swaps variants client-side via a class like `variantSet.change(id)` (read the site's `fullwlibs.js`/global), the two/three variant HTML nodes are almost always already SSR'd in the PDP DOM — read them from the fetched HTML.
2. **Lazy + queued + cached.** Don't fetch all 24 cards at once. Queue per-card fetches with a small concurrency limit (e.g. 3), trigger when cards scroll into view (`IntersectionObserver` + `rootMargin: '300px'`), cache in `sessionStorage` (key = product id, TTL ~1 day) so back/forward and page 2+ are instant.
3. **Idempotent swap + restore.** Only mutate `src`/`textContent` when the value changes; keep the site's own price/strike/savings nodes (update their text, never replace them) so the site's JS still owns them.
4. **Mirror the PDP's variant URL scheme.** If the PDP uses `?variant=<id>` for non-master variants, rebuild the card links the same way so "See Options"/card clicks land on the correct variant.
5. **Default selection = FIRST AVAILABLE grade, not the price-matched grade.** Preselect the first grade from the card's own `x-in-types`-style attribute (A → B → C) and swap the card to it once PDP data arrives. Do NOT default to whichever grade's price equals the card's initially-shown price — the PLP often shows a LOWER grade's price by default (e.g. shows Grade B's $119.99 while Grade A at $139.99 is available), which makes the wrong grade look selected and the price jump only when the user clicks (PCLIQUIDATIONS PLP01 round-4, user-confirmed). Range-priced cards where the shown price matches nothing simply keep the first-available grade.
6. **Swap EVERY field the PDP's switcher changes — including the title — and write the FULL per-variant title.** When a PDP swaps variants it often also swaps the page `h1`. The visible difference between two variant titles is frequently ONLY the variant suffix (e.g. `… Windows 11 - Grade A` vs `… Windows 11 - Grade C`) — so write the entire per-variant h1 (suffix included) into the card title. Stripping the suffix makes both variants map to one identical title and the swap becomes a visual no-op (PLP01 round-2 fix). Fallback when a variant block has no h1: base card title + ` - Grade <letter>`.
7. **Render the DESIGN's fixed option set, not the DOM's available set.** If the mockup fixes A/B/C on every card, always render 3 buttons and mark unavailable ones `disabled` + `aria-disabled` + greyed-out (`cursor: not-allowed`) + click no-op. Building buttons from `x-in-types` skips the unavailable options the design explicitly wants shown. Bug: PLP01 report #2 (buttons built only from available grades).

**Gotchas:**
- Same-origin only; silent-fail on error/404/redirect.
- Match grade labels (`/Grade\s*([ABC])/i`) but expect site-specific extra types (e.g. `NEW`) — parse what you can, skip cleanly.
- Detach the fetched `<doc>` after parsing; never touch the real PDP DOM (this runs on the PLP).
- Finance/3rd-party badges (Affirm `data-amount` in cents) are often per-variant — read them from the same blocks.
- **Keep prices OUT of the option buttons unless the mockup puts them there.** If the design shows bare "A/B/C" pills, don't inject per-grade prices into them (PLP01 report #3). The card's main price line already swaps on click.
- **Spec the swap behavior against a multi-grade card.** A "price changed on click" check that runs on a single-grade card passes vacuously. In `spec.json` make the check FAIL (`{pass:false, detail:'... (vacuous pass blocked)'}`) when it cannot find a card that actually exercises the claim — see `tools/qa_run.js` vacuous-pass note and playbook §9.

### P31. Lazy Fetch Queue — store the caller's callback BEFORE the first fetch

**When:** you queue N async fetches (PDP data, images, API) with a concurrency limit and a `pumpQueue()` that refills itself from the `cb` of each completed fetch.

**The bug (PCLIQUIDATIONS PLP01 round-3, caught by QA):** the queue deadlocked after exactly `MAX_CONCURRENT` fetches. `ensurePdpData(card, cb)` stored `cb` in `card._pclPending` only in the *already-fetching* branch; on a **fresh** fetch it set `card._pclPending = []` and started the fetch without pushing `cb`. When the fetch resolved it iterated `cbs` (empty!) and never called the pumpQueue callback → `inFlight--` never ran → `pumpQueue()` never resumed → every card after the first 3 sat in the queue forever, silently. Only the first 3 of 24 cards ever got variant data; the rest showed `pend:false, data:null` in an in-page probe.

**Recipe (correct):**
```js
function ensure(card, cb) {
  if (card.done) { if (cb) cb(); return; }
  if (card.pending) { if (cb) card.pending.push(cb); return; } // already fetching
  card.pending = [];             // fresh fetch
  if (cb) card.pending.push(cb); // ← REQUIRED: the caller's cb (pumpQueue) must run on resolve
  fetch(card.url).then(function () {
    card.done = true;
    var cbs = card.pending || [];
    card.pending = null;
    for (var i = 0; i < cbs.length; i++) cbs[i]();
  });
}
```

**Key ideas:**
1. **Every call path must end in `cb()`.** If the caller passed a callback (especially one that decrements `inFlight` and re-pumps a queue), it must be guaranteed to run exactly once — push it into the pending list before starting the async work, not only when already in-flight.
2. **Guard the whole completion block with try/catch.** If a fetch `.then` handler throws mid-processing (swapVariant, DOM writes), the pending callbacks after it never run — same wedge. Do the risky DOM work AFTER firing `cbs`, or wrap it so `cbs` still fire.
3. **Diagnose with a per-card state probe.** A symptom of this class is "exactly N (= concurrency) cards got data, rest never start". Probe `egPdpData`/`_pclPending` per card (`obs:1` but `pend:false`, `data:null`) to distinguish "not yet queued" from "queued but stuck".
4. **QA it at full scale, not with one lucky card.** A behavioral check that exercises one multi-grade card passes even when 21 of 24 cards have no data. Gate spec checks with a data-readiness wait (`settle.waitJs`: "all N cards have data") + a hard floor in the check itself (`cards<20 → fail`), so the queue is actually proven to drain.

### P32. Viewport-aware spec — QA desktop AND mobile from ONE spec.json

**When:** the test has responsive behavior (media queries change layout per breakpoint, e.g. badge placement, price size) and you want both desktop and mobile sign-off.

**How (TROOPER SM22, Aug 2026):**
1. Add the generic `--viewport WxH` flag to `tools/qa_run.js` (CDP `Emulation.setDeviceMetricsOverride`, `mobile: width<600`).
2. Write spec checks that branch on `window.innerWidth` instead of hard-coding one breakpoint, so the SAME spec passes at any viewport:
   ```js
   "(function(){ var el=document.querySelector('.price--on-sale .price-item--sale'); if(!el) return { pass:false, detail:'no sale price' }; var cs=getComputedStyle(el); var w=window.innerWidth; var sizeOk = w<768 ? cs.fontSize==='14px' : cs.fontSize==='25px'; return { pass: cs.color==='rgb(14, 91, 0)' && cs.fontWeight==='700' && sizeOk, detail:'w='+w+' color='+cs.color+' weight='+cs.fontWeight+' size='+cs.fontSize }; })()"
   ```
3. Run twice: `qa_run.js qa --spec spec.json` (desktop) and `qa_run.js qa --spec spec.json --viewport 390x844` (mobile). Both must go green.

**Key ideas:**
1. **CSS `op` checks can't branch on viewport** — use `js` checks with `window.innerWidth` when a computed style differs by breakpoint; use plain `css` ops only for styles that are the same at every size.
2. **Keep the same spec for both runs** — this also QAs pagination on mobile, catching "works on desktop, breaks on tap-sized layout".
3. **The runner stays client-agnostic** — `--viewport` is a generic flag, no site-specific code added.

### P33. Bootstrap `.row` flex-wrap gotcha — 2-col desktop redesigns need `flex-wrap: nowrap`

**When:** the variation restyles a Bootstrap-grid container (`.container > .row > .col-*`) into a fixed 2-column desktop layout (sidebar + main). Bootstrap's `.row` default is `flex-wrap: wrap`, so a `width:40%` sidebar + `width:100%` form **wrap onto separate lines and stack vertically** — the redesign silently looks like a mobile layout on desktop.

**How (MONASH MOL 10.01, Aug 2026):**
1. Probe the layout first: a `js` spec check comparing `getBoundingClientRect().top` (or `x`) of the two columns reveals the stack — same `x`, different `y` = wrapped.
2. Fix in the scoped variation CSS, not the site:
   ```css
   body.EG-MOL1001 .forms-layout .container > .row {
     flex-wrap: nowrap;
   }
   ```
3. Re-probe and re-QA at both viewports — the desktop run must show sidebar and form at the same `y`; the mobile run must still show the stacked layout.

**Key ideas:**
1. Never target `.row`/`.col-*` utility classes in JS (forbidden anchors) — but scoping the CSS override with the body class + a layout-section parent (`.forms-layout`) is safe and survives theme updates.
2. A viewport probe (`top`/`x` comparison) turns "looks wrong in the screenshot" into a deterministic PASS/FAIL check — add it to the spec so future QA catches the regression.
3. Always verify the mobile run still passes after the fix — `nowrap` must be applied only where the redesign intends it.

Source: `../ABTESTSWITHAI/MONASH/MOL 10.01 Contact Us Page Redesign` (layout bug found during QA, fixed in `variation1/variation.css`, 33/33 re-verified).

### P34. `geom` spec op — deterministic layout QA (no screenshots/vision for facts)

**When:** the QA needs to assert HOW things are placed relative to each other — "sidebar and form are on the same row", "tiles are equal size with a consistent gap", "the block is centered / inside the viewport". Previously this forced a screenshot + eyeball (or a per-test hand-rolled `js` probe like P33 step 1); now it's a first-class spec op.

**How (MONASH MOL 10.01 + TROOPER SM22, Aug 2026):** add `geom` to `tools/qa_run.js` — a generic relation vocabulary, every test supplies its OWN selectors + relation (config, never code):
```json
{ "check": "sidebar+form same row", "op": "geom", "selectors": [".eg-sidebar", ".forms-layout__form"], "relation": "same-top", "tol": 1 },
{ "check": "sidebar width",         "op": "geom", "selectors": [".eg-sidebar"], "relation": "width-pct", "between": [35, 45] },
{ "check": "tiles equal + even",    "op": "geom", "selectors": [".tile"], "relation": "equal-size", "each": true },
{ "check": "tile gap",              "op": "geom", "selectors": [".tile"], "relation": "x-gap", "each": true, "between": [12, 20] },
{ "check": "CTA centered",          "op": "geom", "selectors": [".eg-cta"], "relation": "centered", "tol": 2 }
```
Runner reads `getBoundingClientRect()` per selector and computes the relation → `{pass, detail}` with the real numbers in `detail` (e.g. `gap=40.0`, `w%=25.0`) so a failure says exactly what was measured. Two modes: binary/unary (selector pairs, optional `index` for nth match) and `each:true` (one selector, ALL matches — grids/lists).

**Relations:** `same-top` `same-left` `left-of` `right-of` `above` `below` `x-gap` `y-gap` `within` `width-pct` `height-pct` `aspect-ratio` `centered` `inside-viewport` `equal-size`.

**Key ideas:**
1. **Deterministic** — pure JS + `getBoundingClientRect`, zero screenshots/vision for these facts; runs in the same generic spec run as every other check. This is the "Level 1" fix for vision-model dependency (see MONASH readme): geometry facts leave the eyeball, vision stays only for edge-case judgment.
2. **Catch real layout**, not just presence — `exists` only proves the element is there; `geom` proves it is placed correctly (the P33 flex-wrap bug would have been caught by a `same-top` check with zero manual probing).
3. **`each:true` handles grids** — one op asserts every tile matches (size, gap, width%) instead of hand-rolling loops per test.
4. **Sane failures** — always include a negative-control check in a redesign spec (e.g. `below` where it must NOT be below) so a PASS run also proves the check would catch a regression.

Source: `../ABTESTSWITHAI/MONASH/MOL 10.01 Contact Us Page Redesign` (op added during knowledge loop; validated on a synthetic grid — detected real inline-block whitespace gap 16→20.5px).

### Other techniques observed in the archive (use when a brief needs them)

- **Canvas dominant-colour swatches** — draw the product image into a hidden `<canvas>`, sample the pixels, set the swatch background. Source: `CROCS/CRO 3.04 Product Page Colour Swatch Revised/variation2/variation.js`.
- **SVG star-rating generator** — build filled/empty stars by joining inline `<svg>` paths instead of shipping images. Source: `CATHOLIC COMPANY`, `ALTIUM`.
- **Custom video-player overlay** — pause site video via a wrapped element and listen for `webkitendfullscreen`/`fullscreenchange` to restore it. Source: `DRSEBISCELLFOOD`.
- **IntersectionObserver sticky toggle** — swap a CTA between "in-flow" and "sticky" as the target scrolls out of view, instead of always-on sticky. Source: `CATHOLIC COMPANY`.
- **Vendor/page guard** — early-return unless a specific cart-vendor marker or page path matches, so one script never runs on the wrong storefront. Source: `HW PART STORE`.
- **`debug` toggle** — a query-param (`?egdebug=1`) or flag that logs actions, so QA can trace a script without shipping console noise in production. Source: `DRINKGT`, `Moorings`.

---

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
- [ ] Site functionality untouched; no global side effects.
- [ ] `v1.json` created (+ `share.js` where clicks are tracked).
- [ ] **Behavioral checks must actually exercise the behavior** (vacuous-pass rule, PLP01): a `spec.json` js check that can't find a case to test must FAIL with `{pass:false, detail:'... (vacuous pass blocked)'}`, never pass with "nothing to test". Loop to the strongest card (multi-option card, card with a disabled control) so the interaction is genuinely proven.
- [ ] Verified on desktop, tablet, mobile.
- [ ] Knowledge capture done (AGENTS.md STEP 4): verified facts → `AI/SITE_PROFILES.md`, new technique → §8 next P-number + `P1–Pxx` count updated, reusable script → `tools/`.

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

---

## 11. How to Use This Playbook

1. Read the test brief and identify the goal. Pick the matching pattern(s) from §8 (P1–P34).
2. If a pattern matches, copy the base script from §2, add the body class, and adapt the chosen pattern inside `init()`. No search needed.
3. If NO pattern in §8 fits, use the RAG fallback: `python scripts/search_tests.py "brief description"` (script auto-locates the `AB-test` archive anywhere on the machine and prints the top 3 similar tests). Study the code, then append the new technique to §8 as the next P-number so the library grows.
4. Scope all CSS to the body class (§6). Add `share.js` goals if the test measures clicks (§7).
5. New patterns discovered in future work should be added back into §8 so the library always expands.
6. Run the QA checklist (§9) before finishing.

---

## 12. Working Faster — Tooling & Process Notes

These save the most time on every test, whatever the client. Source: lessons from AWG (AB042), where most of the session went into site autopsy instead of code.

1. **Check `AI/SITE_PROFILES.md` before any live inspection.** If the client is listed, verify only what changed; never re-autopsy a worked site.
2. **Minified one-line HTML/JS can't be read with normal tools.** Use `Select-String` for line matches or PowerShell `[regex]::Match($content, 'pattern')` / `.Substring()` windows. (`rg` is not installed on this machine's PowerShell.) The fetched page and theme assets are worth saving to a scratch folder once — reuse them instead of re-fetching.
3. **Don't chase the theme's minified JS bundle / webpack chunks to learn how a component works.** Dynamic chunks often 404 and the source is unreadable — a guaranteed time sink. Instead, hit the site's own AJAX/`/widgets/...` endpoint directly (see the client's site profile) to see the exact DOM the site renders, or test the behaviour in a live browser.
4. **Detect state from the rendered DOM, not from plugin internals.** If clicks or `.active` classes are unreliable, use pattern **P25** — the site always renders a signal you can read (e.g. a submenu's back-link href).
5. **Validate logic with `node` before shipping.** Parse-critical pieces (regexes, URL/href mapping, tab derivation) take seconds to verify:
   `node -e "..."` (single-quote the script in PowerShell to avoid `$` interpolation) or a scratch `.js` file. Fix bugs here, not in the test tool.
6. **Fetch pages with `Invoke-WebRequest` and an explicit `User-Agent`** (some stores 404 default PowerShell's UA).
7. **Keep the file-transfer pipeline in mind:** when you download a site asset, save it to the scratch folder with a clear name — re-downloading a 800 KB minified CSS to grep it twice is wasted time.
8. **Write knowledge back AFTER every test (STEP 4).** The kit only compounds if each finished test updates `AI/SITE_PROFILES.md` (verified selectors/endpoints), playbook §8 (new P-pattern), and `tools/` (reusable scripts). A test that adds nothing to the kit leaves the next session re-doing your work. When a site's rendered content is JS/AJAX-driven, verify with pattern **P27** (headless Edge) and record the working command in the client's profile.
