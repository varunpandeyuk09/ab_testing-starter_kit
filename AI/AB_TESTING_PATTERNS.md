# AB Testing Patterns Library (P1–P38)

REFERENCE FILE — do NOT read this end-to-end. Match the brief against the §8 INDEX in
`AI/AB_TESTING_PLAYBOOK.md`, then open ONLY the matching pattern here. New patterns are
appended as P33, P34, ... AND get a row in the playbook's §8 index table.

---
## 8. Reusable Patterns Library

This library is the primary source of implementation recipes. Before writing any code, find the pattern(s) below that match the test and adapt them. It is distilled from the shipped tests in the archive (various e-commerce/corporate clients) and verified live research. No external RAG search is required.

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

### P14. React / Controlled-Input Automation (autocomplete-friendly)

**When:** the form field is a React (or Vue/Svelte/Angular) controlled input. Setting `.value` directly doesn't register, and `keydown` events are ignored. Source: verified on a location auto-select test.

**1. Set a controlled value (native setter, not `.value`):**
```js
function setControlled(el, value) {
  var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, value);                       // bypass the framework's internal tracker
  el.dispatchEvent(new Event('input', { bubbles: true }));  // + 'change' if a select
  el.dispatchEvent(new Event('change', { bubbles: true }));
}
```

**2. Progressive typing** — when the autocomplete fetches suggestions **from a server per keystroke**, a single `setControlled()` call produces no options. Type character-by-character, firing `input` + key events after each char, then let the panel settle before reading options:
```js
function typeInto(input, text, done) {
  var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  var idx = 0, cur = '';
  var iv = setInterval(function () {
    if (idx >= text.length) { clearInterval(iv); done(); return; }
    cur += text[idx];
    setter.call(input, cur);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: text[idx] }));
    input.dispatchEvent(new KeyboardEvent('keyup',   { bubbles: true, key: text[idx] }));
    idx++;
  }, 80);   // per-char delay — long enough for the autocomplete request to be meaningful
}
```

**3. Pick an option — click, VERIFY by reading the input back, then keyboard fallback.** Don't assume the click worked; the framework may swallow it or the panel may re-render:
```js
function pickOption(input, options, targetIdx, done) {
  var opt = options[targetIdx];
  ['mousedown', 'mouseup', 'click'].forEach(function (t) {
    opt.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
    if (opt.firstElementChild) opt.firstElementChild.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
  });
  setTimeout(function () {
    var v = input.value.trim();
    var city = /* the typed query */;
    if (v.indexOf(city) === -1 || v.length < city.length + 5) {
      // click didn't land → keyboard fallback: ArrowDown×(index+1) then Enter
      for (var i = 0; i <= targetIdx; i++) input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown', keyCode: 40 }));
      ['keydown', 'keypress', 'keyup'].forEach(function (t) {
        input.dispatchEvent(new KeyboardEvent(t, { bubbles: true, key: 'Enter', keyCode: 13 }));
      });
    }
    done(input.value.trim());
  }, 200);
}
```

**Scored matching (preference + backup):** when options are free text (airports, cities), match by substring of the query, **prefer** an option that also contains the user's country/region, keep the **first plain match as backup**, and fall back to it when no preferred match exists. Verify success by the input's length (`query.length + 5`) — a bare `", CODE"` residue means the option text was partially applied.

**Gotchas:**
- The value setter lives on the **prototype** (`HTMLInputElement.prototype`), not on the element itself; using it keeps the framework's internal value tracker in sync.
- Always dispatch `input` (and sometimes `change`) with `bubbles: true` after setting.
- For a controlled **select**, dispatch a `change` event on the `<select>` element instead.
- **Distinguish user focus from programmatic focus** — track `lastMousedownTime`/`lastMousedownTarget` on `document` (capture phase); on `focus`, if the input wasn't just mousedowned (<150ms), it's a programmatic focus → blur immediately so the autocomplete panel doesn't reopen over a pre-filled value. If it IS a real user click, reset the value to just the bare query (not the full `", CODE"` text) so the correct suggestions render.
- **Value reversion safeguard** — a framework re-render can reset a natively-set display value back to a stale model value (e.g. a bare airport code). Re-assert the full display value via the native setter, but **only when the input is NOT focused** (never fight the user while typing). Keep this bounded — a MutationObserver or a timer that self-clears after success; never a page-lifetime interval.
- **Verify what the form SUBMITS, not just what it shows.** A display-only native-setter fix can leave the framework model stale — confirm the search/submit payload carries the full value, especially after the keyboard-fallback path (where no real option was clicked).
- **Single-flight lock** — wrap the whole automation in an `isAutomating` flag so polling/multiple triggers don't overlap, and **always release it** (`try/finally` or a watchdog timeout). A leaked lock silently kills the automation forever.
- Optionally add a body class (`eg-automating`) for the duration of the automation so scoped CSS can suppress transitions/animations that would fight the automation.
- This is inherently brittle to framework internals — pair with P5 (MutationObserver) so the follow-up UI is caught whether it renders sync or async.

### P15. Library Readiness Waiters

**When:** your code calls `$`, `Swiper`, `Slick`, `Munchkin`, etc., but the page loads the library lazily or after AJAX. Calling early throws; polling with `setTimeout` is uglier. Source: verified across multiple themes that lazy-load their JS bundles.

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

**When:** free-shipping or threshold progress bars that must update live when the cart changes (add/remove/qty). Source: verified on multiple Shopify/Magento stores with mini-cart bars.

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

**When:** "ships in X business days", countdown to a promo window, or date-based urgency. Source: verified on shipping-estimate and promo-countdown tests.

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

**When:** showing a local phone number or region-specific text based on visitor location. Source: verified on a multi-region storefront.

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
- **Geo can also AUTO-FILL form fields** (not just swap content), e.g. prefill the departure/location field. Use a fallback chain: try the IP city → if the autocomplete has no match, derive a fallback query from the **timezone** (`data.timezone.split('/').pop().replace(/_/g, ' ')` — e.g. `Asia/Kolkata` → `Kolkata`), which usually names a nearby selectable place; give up gracefully (blank) only after that. Pair with P14 for the actual field automation, and give the fetch a timeout so a slow geo API never blocks the flow.

### P22. CSS-Only Carousel (scroll-snap + hidden scrollbar)

**When:** product/category carousels that should feel native, need no JS drag handlers, and must keep touch swiping. Source: verified on multiple storefronts with native-feel carousels.

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

**When:** a theme intercepts tab/menu clicks — it stops propagation, drives tabs through its own plugin, or sets the `.active` class asynchronously — so click listeners and `.active`-class reads are unreliable. Instead, derive the current state from content the site itself renders: e.g. an AJAX-loaded submenu whose "back / overview" link href contains the active category. Source: verified on a sitewide-mobile-nav test.

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

**When:** the site's search returns very few results (0–5) for legitimate queries, leaving users with a dead-end SERP. Add related products, popular searches, or department links to recover the session. Source: verified on a low-result SERP research pass.

**Research first — prove the failing state exists:**
1. Find the search URL pattern (`/search/{term}`, `?q=`, etc.) and the result-count element. E.g. `#result-count`, grid `.product-grid`, item `.product-card`.
2. Batch-test candidate niche terms with the headless tool (P27) and record which terms return 0, 1, 5, 6, ... results. Pick trigger threshold from real data (e.g. `count <= 5`).
3. Verify the page renders results client-side (AJAX) vs server-side — this decides whether you read a count element or count grid items.

**Recipe (AJAX-loaded count):**
```js
function readResultCount() {
  var el = document.querySelector('#result-count');
  if (!el) return -1;
  var m = (el.textContent || '').trim().match(/([\d,]+)\+?\s*results?/i);
  if (!m) return -1;                       // "1 result" / "48 results" / "300 + results"
  return parseInt(m[1].replace(/,/g, ''), 10);
}
function applyFallback() {
  var count = readResultCount();
  if (count === -1 || count > 5) return;   // healthy SERP, or count not rendered yet
  var grid = document.querySelector('.product-grid');
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
var countEl = document.querySelector('#result-count');
if (countEl) mo.observe(countEl, { childList: true, characterData: true, subtree: true });
```

**Gotchas:**
- The count text format varies (`1 result`, `6 results`, `300 + results`, `1,000+ results`) — normalize before comparing. Prefer the site's raw hidden count input when it exposes one.
- Server-rendered SERPs: read the count once in `init()`, no observer needed.
- Fallback content must be enhancement-only: if the count element never renders (page error), do nothing.
- Guard against duplicate insertion and observer re-trigger loops (debounce / `isRunning` flag).

### P27. Headless Browser Verification (JS-rendered content)

**When:** a page renders its real content via AJAX/JS (search results, product grids, lazy sections), so `Invoke-WebRequest`/`webfetch` only returns the empty shell. You need the post-render DOM to verify selectors, count results, or read dynamic text — on ANY site, no per-site automation code. Source: verified on a JS-rendered search research pass.

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
# then grep the dump for the rendered selector, e.g. id="result-count">N results<
```

**Gotchas:**
- `--dump-dom` needs a long-enough `--virtual-time-budget` for the page's AJAX to land (10s is a good start); the process may not exit cleanly — enforce a `WaitForExit` timeout + `Kill()`.
- Use a unique `--user-data-dir` per run or concurrent Edge instances conflict.
- Runs are flaky when many run in parallel (0-byte dumps) — rerun failed terms sequentially.
- Chrome on other machines: same flags, different `chrome.exe` path.
- Reusable: `ClientData/tools/ss_search_check.ps1` is a client-specific parameterized instance (terms + count extractor); copy it, swap the selector, and it audits any site's search.

### P28. Re-decorating a Reused Success Modal (site-hydrated popup)

**When:** the site shows a post-action modal (add-to-cart "success" popup, quick-view, coupon confirm) whose markup is a static skeleton hydrated by the site's own JS on every trigger. You must redesign it without fighting the site's fill-in logic, and survive multiple consecutive triggers reusing the SAME popup node. Source: verified on a checkout success-popup test.

**Key ideas:**
1. **Let the site keep its own nodes.** Restyle + insert around `.modal__title`, `.modal__product` etc. instead of copying their values into new nodes — the site JS keeps updating them and you never race it.
2. **Activation signal = the skeleton being filled.** SSR skeletons have empty title links / empty price spans. Don't observe visibility toggles — poll cheaply for the success state (`selector + ':success title'`) AND a non-empty product title, then decorate. Poll re-runs on every activation.
3. **Keyed re-decorate.** A reused popup's innerHTML may be updated in place (not replaced), so a one-time flag would skip the 2nd add. Track `key = productTitle + '|' + cartCounter`; re-decorate when the key changes, and remove your own `eg-*` pieces first (idempotent).
4. **Late data → delayed refresh.** Hidden inputs (e.g. `cart_total`) are filled a beat after the popup opens. Recompute the dynamic bits once ~800 ms later, but only if the same product is still active (re-check the title).
5. **AJAX-filled siblings.** If a section (`[data-role="related"]`) is empty at SSR and populated by JS later, put a scoped MutationObserver on it with a `isRunning` guard (P5). If the tile markup is unknown, detect tiles structurally (elements containing a `.html` product link or a `.price`), dedupe parents/children, and limit to the required count.

**Gotchas:**
- Raw non-ASCII copy mangles in the injection pipeline — write umlauts/special chars as `\u00fc`-style escapes in JS.
- Hide replaced original controls with `display:none` rather than removing them, so the site's JS (and its handlers) stay intact.
- Don't read dynamic popup values at load time — read them at decorate time.

### P29. Client-Editable Config Map for Creatives (handle-keyed)

**When:** the brief replaces media (images/videos/copy) with creatives that are NOT final yet. Put every swap decision in ONE clearly-marked object the client edits post-launch, keyed by a stable per-item id (product handle / SKU), so updating assets never requires touching the swap logic. Source: verified on a collection image-refresh test.

**Recipe:**
```js
// UPDATE HERE — key = product handle, value = new creative URL
var EG_EDITORIAL = {
  'hair-stimulating-serum': 'https://cdn.example.com/editorial/serum-1.jpg?v=...',
  'ultimate-serum': 'https://cdn.example.com/editorial/ultimate-1.jpg?v=...'
};
function normalizeImageUrl(url) {
  return String(url || '').replace(/^https?:/, '').split('?')[0];
}
function swapCardImages() {
  var cards = document.querySelectorAll('.product-card');
  for (var i = 0; i < cards.length; i++) {
    var link = cards[i].querySelector('.product-card__media a[href*="/products/"]');
    var m = link && link.getAttribute('href').match(/\/products\/([^/?]+)/);
    if (!m) continue;
    var target = EG_EDITORIAL[m[1]];
    var img = cards[i].querySelector('img.product-card__image');
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

**When:** the PLP card must show a grade/variant selector (A/B/C, size, condition) and switching a variant must update image + price + links IN PLACE exactly like the PDP's own switcher — but the PLP page itself exposes no AJAX endpoint. The PDP page embeds every variant's HTML server-side, so one fetch gives you all variant data for free. Source: verified on a graded-goods PLP card revamp.

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
      var blocks = doc.querySelectorAll('.variant-block');   // one per variant, embedded in PDP
      var data = {};                                         // keyed by grade letter
      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        data[b.getAttribute('data-variant')] = {
          id: b.getAttribute('data-variant-id'),
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
1. **Parse the PDP's embedded variant blocks instead of finding an API.** If the PDP swaps variants client-side via a site global (e.g. `swatchSet.change(id)`), the two/three variant HTML nodes are almost always already SSR'd in the PDP DOM — read them from the fetched HTML.
2. **Lazy + queued + cached.** Don't fetch all 24 cards at once. Queue per-card fetches with a small concurrency limit (e.g. 3), trigger when cards scroll into view (`IntersectionObserver` + `rootMargin: '300px'`), cache in `sessionStorage` (key = product id, TTL ~1 day) so back/forward and page 2+ are instant.
3. **Idempotent swap + restore.** Only mutate `src`/`textContent` when the value changes; keep the site's own price/strike/savings nodes (update their text, never replace them) so the site's JS still owns them.
4. **Mirror the PDP's variant URL scheme.** If the PDP uses `?variant=<id>` for non-master variants, rebuild the card links the same way so "See Options"/card clicks land on the correct variant.
5. **Default selection = FIRST AVAILABLE grade, not the price-matched grade.** Preselect the first grade from the card's own `data-types`-style attribute (A → B → C) and swap the card to it once PDP data arrives. Do NOT default to whichever grade's price equals the card's initially-shown price — the PLP often shows a LOWER grade's price by default (e.g. shows Grade B's $119.99 while Grade A at $139.99 is available), which makes the wrong grade look selected and the price jump only when the user clicks (user-confirmed on a graded-goods PLP). Range-priced cards where the shown price matches nothing simply keep the first-available grade.
6. **Swap EVERY field the PDP's switcher changes — including the title — and write the FULL per-variant title.** When a PDP swaps variants it often also swaps the page `h1`. The visible difference between two variant titles is frequently ONLY the variant suffix (e.g. `… Windows 11 - Grade A` vs `… Windows 11 - Grade C`) — so write the entire per-variant h1 (suffix included) into the card title. Stripping the suffix makes both variants map to one identical title and the swap becomes a visual no-op. Fallback when a variant block has no h1: base card title + ` - Grade <letter>`.
7. **Render the DESIGN's fixed option set, not the DOM's available set.** If the mockup fixes A/B/C on every card, always render 3 buttons and mark unavailable ones `disabled` + `aria-disabled` + greyed-out (`cursor: not-allowed`) + click no-op. Building buttons from `data-types` skips the unavailable options the design explicitly wants shown. Bug: user report #2 (buttons built only from available grades).

**Gotchas:**
- Same-origin only; silent-fail on error/404/redirect.
- Match grade labels (`/Grade\s*([ABC])/i`) but expect site-specific extra types (e.g. `NEW`) — parse what you can, skip cleanly.
- Detach the fetched `<doc>` after parsing; never touch the real PDP DOM (this runs on the PLP).
- Finance/3rd-party badges (Affirm `data-amount` in cents) are often per-variant — read them from the same blocks.
- **Keep prices OUT of the option buttons unless the mockup puts them there.** If the design shows bare "A/B/C" pills, don't inject per-grade prices into them (user report #3). The card's main price line already swaps on click.

### P31. Lazy Fetch Queue — store the caller's callback BEFORE the first fetch

**When:** you queue N async fetches (PDP data, images, API) with a concurrency limit and a `pumpQueue()` that refills itself from the `cb` of each completed fetch.

**The bug (found by QA on a graded-goods PLP):** the queue deadlocked after exactly `MAX_CONCURRENT` fetches. `ensurePdpData(card, cb)` stored `cb` in `card._egPending` only in the *already-fetching* branch; on a **fresh** fetch it set `card._egPending = []` and started the fetch without pushing `cb`. When the fetch resolved it iterated `cbs` (empty!) and never called the pumpQueue callback → `inFlight--` never ran → `pumpQueue()` never resumed → every card after the first 3 sat in the queue forever, silently. Only the first 3 of 24 cards ever got variant data; the rest showed `pend:false, data:null` in an in-page probe.

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
3. **Diagnose with a per-card state probe.** A symptom of this class is "exactly N (= concurrency) cards got data, rest never start". Probe `egPdpData`/`_egPending` per card (`obs:1` but `pend:false`, `data:null`) to distinguish "not yet queued" from "queued but stuck".
4. **Verify it at full scale, not with one lucky card.** Checking one multi-grade card passes even when 21 of 24 cards have no data. The user's QA (or a temporary in-page probe) must confirm ALL cards end up with variant data — that is what actually proves the queue drains.

### P32. Bootstrap `.row` flex-wrap gotcha — 2-col desktop redesigns need `flex-wrap: nowrap`

**When:** the variation restyles a Bootstrap-grid container (`.container > .row > .col-*`) into a fixed 2-column desktop layout (sidebar + main). Bootstrap's `.row` default is `flex-wrap: wrap`, so a `width:40%` sidebar + `width:100%` form **wrap onto separate lines and stack vertically** — the redesign silently looks like a mobile layout on desktop.

**How (verified on a contact-page redesign):**
1. Detect the stack first: the two columns have the same `x` but different `y`. (Ask the user for the two `getBoundingClientRect()` values if it isn't obvious.)
2. Fix in the scoped variation CSS, not the site:
   ```css
   body.EG-CLIENT01 .page-layout .container > .row {
     flex-wrap: nowrap;
   }
   ```
3. Re-check at both viewports in the user's QA — desktop must show sidebar and form at the same `top`; mobile must still show the stacked layout.

**Key ideas:**
1. Never target `.row`/`.col-*` utility classes in JS (forbidden anchors) — but scoping the CSS override with the body class + a layout-section parent (`.page-layout`) is safe and survives theme updates.
2. A simple `top`/`x` comparison turns "looks wrong in the screenshot" into a checkable fact — one console paste settles it.
3. Always verify the mobile layout still stacks after the fix — `nowrap` must be applied only where the redesign intends it.

Source: verified on a contact-page redesign (layout bug found during QA, fixed in `variation1/variation.css`).

### P33. Replicate the theme's own AJAX request byte-for-byte

**When:** your variation clones a site component whose action fires a site AJAX call (variant switch, add-to-cart, quick-add) and must produce the same effect the site's own UI does. The server validates exactly the shape the theme sends — a wrong payload silently fails or resolves the wrong thing.

**Recipe:** before writing any request builder, get the REAL request from the user's Network tab (full URL with query, complete payload with its encodings, headers). Build byte-for-byte. Preserve `encodeURIComponent`-style encodings (`%7B`, `%22`, `%3A`, `%2C`, `%7D` for JSON braces/quotes/colons/commas/brackets). Include `X-Requested-With: XMLHttpRequest` so the server treats it as the theme's own AJAX.

**Key ideas:**
1. Match encoding exactly — the theme sends `JSON.stringify()` run through `encodeURIComponent`; so must you.
2. Include ALL the state the theme includes. `data-*` attributes that look like "ignore" hints (e.g. `data-select-only`, `data-ignore-me`) are NOT reliably excluded from the request — verify against the theme's actual Network tab entry before omitting them.
3. Force the picked value into the request regardless of DOM state — the theme's configurator can revert cloned-form radio state, so read your own tracked choice.
4. Copy the AJAX headers the theme sends so the server can't distinguish your call from the site's own.

**Gotchas:** guessing the payload shape is the #1 silent-failure source — this pattern exists precisely because the "obvious" JSON payload (just the option id) was wrong on a verified build. Evidence first: if the user can't paste the request, you don't have enough to build it.

Source: verified on a PLP quick-add modal (size/grade switch returned `{url, productId}` with a JSON-encoded, URL-encoded payload; the naive `{id: X}` shape failed).

### P34. In-place form update from `{url, id}` switch responses — don't re-fetch the page

**When:** a switch/selection endpoint returns JSON like `{url, productId}`, and the site updates its own form CLIENT-SIDE from the returned id (its reload-selectors list only analytics elements). Re-fetching the returned `url` is a trap: it can return the BASE page (all variants share one URL) whose buy-form id doesn't match the switch id — rebuilding from it wipes the picked state.

**Recipe:** read the response id, rewrite every id-bearing field name/value in the container (`lineItems[<id>]...`), set the CTA's `data-product-id`, keep the user's picked option checked, then re-enable the button. Only when the returned `url` is a genuinely different page → fetch it and rebuild (configurator + media + select range) from its HTML.

**Key ideas:**
1. After fetching the variant page, compare its buy-form id against the switch response id. If they DON'T match, the page is the base page → fall back to in-place update instead of applying it.
2. Rewrite id fields across the WHOLE container, not just the `<form>` element — `form=`-associated controls (e.g. a quantity `<select>`) live OUTSIDE the form tag.
3. Track the modal's current source URL and compare against it (not the page's original open URL) after every applied switch page.

**Gotchas:** a `{url, id}` response looks like a "fetch this page" hint — that's exactly what makes this pattern counter-intuitive. Always verify which fields the theme's OWN reload-selectors actually rebuild before re-fetching.

Source: verified on a PLP quick-add modal where the theme's reload-selectors rebuilt the analytics elements (not the form) client-side from the id.

### P35. Cloned configurator: capture-phase click + whole-container radio state

**When:** the site's configurator (size/colour pills) intercepts clicks — it `preventDefault()`s the native radio check and drives the `.active` highlight itself. On a CLONED component the theme's plugin never binds, so clicks are swallowed silently. Compounding trap: the same radio group is often DUPLICATED (an in-form group + an external selector), and same-`name` radios form ONE document-wide group.

**Recipe:** use a document-level CAPTURE-phase click handler (`addEventListener('click', fn, true)`) that `preventDefault()` + `stopImmediatePropagation()`, forces `radio.checked = true`, mirrors `.active` on ALL copies of the option, and runs your handler. Read state from the whole container, not one copy.

**Key ideas:**
1. Capture phase runs BEFORE the theme's document-level handlers — force your check there, before the theme's `preventDefault` can kill it.
2. Block disabled / not-combinable options; no-op on an already-checked option.
3. Keep a `change` listener as a keyboard / accessibility fallback.
4. `form=`-associated external controls: rewrite field names across the whole container, not just the `<form>`.

**Gotchas:** if you only listen on the clone's own nodes (bubble phase), the theme's document handler usually swallows the event first — this is the silent "nothing happens on click" bug.

Source: verified on a PLP quick-add modal configurator with in-form radios + an external selector sharing the same `name`.

### P36. Hydrate cloned plugin components (strip hooks → site initializer)

**When:** you clone a component the site's JS normally enhances (gallery slider, buy box). The theme's native plugins won't auto-bind on cloned nodes, so the clone looks dead.

**Recipe:** verify the plugin API surface FIRST with `typeof` checks (e.g. `window.PluginManager.initializePlugins()` may exist while `createPluginInstanceFromElement` does not). Strip the clone's `data-*` hooks that would re-trigger theme plugins you drive manually (`data-custom-switch`, `data-variant-switch-options`, `data-add-to-cart`, `data-buy-box`, zoom/magnifier), then call the site's initializer scoped to the clone. The initializer skips already-initialized elements, so the rest of the page stays untouched.

**Key ideas:**
1. Never assume an init path — `typeof` each API member before calling it.
2. Strip zoom/magnifier hooks if the modal gallery should be slide-only.
3. Re-run the hydration after every media/component replacement inside the clone.

**Gotchas:** calling the initializer on the whole document can double-init page components that the theme already initialized — scope it to the clone subtree only.

Source: verified on a PLP quick-add modal (shopware `PluginManager.initializePlugins` on the clone; zoom hooks stripped for a slide-only gallery).

### P37. Author `!important` vs cloned slider inline transform

**When:** the site's CSS forces e.g. `transform: none !important` on the slider track (`.tns-slider`) or `display: grid` on the container up to a breakpoint. A cloned slider inside your modal freezes: the inline `transform` exists but the COMPUTED value is `none`, because static CSS can't beat author `!important` on a dynamic value.

**Recipe:** fix `display: grid` with a scoped override (`display: block !important` on the modal container only). For the transform: re-assert the track's OWN inline value with `style.setProperty('transform', t, 'important')` (inline `!important` beats author `!important`) and keep it in sync with a MutationObserver on the track's style/class — tns writes `translate3d` there; re-setting the same string is a no-op, so there's no loop. Mirror the technique for `transition`.

**Key ideas:**
1. Timing: tns creates `.tns-slider` only after the FIRST PAINT — a one-shot pin right after init finds nothing. Watch the whole modal subtree (attributes) and re-pin whenever the track appears or its style changes.
2. Disconnect the observer on close and re-create it after a media replacement.
3. Scope CSS overrides to the modal so the real PDP keeps its theme behaviour.

**Gotchas:** a one-shot `style.setProperty` is a mirage — the theme re-asserts on every tns update, so the observer is the fix, not the initial pin.

Source: verified on a PLP quick-add modal slider inside a grid-forced container.

### P38. Overlay-sync plugin-owned iframes/widgets — never move them

**When:** you need to relocate a widget the site's plugin/SDK already initialized — PayPal express-checkout iframes, Amazon Pay buttons, any SDK-rendered component — from its original spot (e.g. PDP) into a new one (e.g. mini-cart). Physically moving the node with `appendChild` breaks the SDK: iframes detach/reload and lose their postMessage channel (button blank or checkout never opens); Amazon's `.lpa-button` loses its click wiring. Hiding the source with `display: none` makes the SDK measure 0×0 and bail out of rendering.

**Recipe:** keep the real element exactly where the plugin rendered it and overlay it over a dummy "slot" at the destination:
1. Never `appendChild` the plugin's element. Create a mount at the destination with placeholder slots (one per widget); reserve space with `min-height` so layout doesn't collapse. Slot order = visual order (grid/flex) — reorder by swapping the slots' `appendChild` order, never plugin DOM.
2. If the source sits inside a `display:none`/clipped ancestor (z-index jail), move its *container* once to `<body>` and park it off-screen (`position:absolute; top/left:-9999px; width/height:0; overflow:visible`) — never `display:none`. Remove duplicate containers left by AJAX re-renders.
3. Drive a `requestAnimationFrame` sync loop: read each slot's `getBoundingClientRect()` and pin the REAL widget over it with `position: fixed; top/left/width = rect; z-index; pointer-events: auto`. When the destination slot is off-screen/invisible, park the widget off-screen (`-9999px`, opacity 0, pointer-events none) instead of hiding it.
4. A container move reloads iframes → re-trigger the plugin's own initializer if it exposes one (e.g. JTL PayPal: find the init fn in `window.PPCcomponentInitializations`, fire `window.jQuery(window).trigger('ppc:componentInit', [initFn, true])`).
5. Handle two-phase UIs (consent button → iframe): sync whichever is currently visible, park the other.

**Key ideas:**
1. The plugin must keep full ownership of its element; the script only mirrors coordinates. Clicks land on the untouched real button → checkout opens.
2. The rAF loop self-keeps alignment across scroll, open/close animation and AJAX re-renders — a one-shot position is not enough.
3. Detect the slot's on-screen visibility from its rect (width/height > 0 and inside the viewport) so hidden destinations park the widgets.

**Gotchas:** `position: fixed` is viewport-relative — any `transform`/`filter` ancestor (slide-in cart animations) breaks the overlay, so keep the slots' ancestors transform-free. The rAF loop runs forever (cheap, but park buttons when the destination is closed). Re-init depends on plugin globals (`PPCcomponentInitializations`, `jQuery`) — pin the plugin version. If the anchor that places the mount (e.g. a coupon field) is absent, widgets stay parked off-screen and silently disappear — always keep a fallback that leaves them visible in the original spot.

Source: verified on a JTL-shop storefront fixing PayPal + Amazon Pay express buttons moved PDP → mini-cart (DOM-move broke PayPal iframe messaging; off-screen parking + overlay-sync fixed it).

### Other techniques observed in the archive (use when a brief needs them)

- **Canvas dominant-colour swatches** — draw the product image into a hidden `<canvas>`, sample the pixels, set the swatch background.
- **SVG star-rating generator** — build filled/empty stars by joining inline `<svg>` paths instead of shipping images.
- **Custom video-player overlay** — pause site video via a wrapped element and listen for `webkitendfullscreen`/`fullscreenchange` to restore it.
- **IntersectionObserver sticky toggle** — swap a CTA between "in-flow" and "sticky" as the target scrolls out of view, instead of always-on sticky.
- **Vendor/page guard** — early-return unless a specific cart-vendor marker or page path matches, so one script never runs on the wrong storefront.
- **`debug` toggle** — a query-param (`?egdebug=1`) or flag that logs actions, so QA can trace a script without shipping console noise in production.

---
