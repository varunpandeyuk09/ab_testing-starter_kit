# Patterns — Quick Reference

Match brief → find pattern → adapt code. Functions in `SNIPPETS.md`.

---

## P1. Image Swap
**When:** Replace hero/product/section imagery.
```js
function swapImage(container, newSrc) {
  var img = container.querySelector('img');
  if (!img) return;
  if (!container.classList.contains('eg-swapped')) {
    container.dataset.egOrig = img.currentSrc || img.src;
    container.classList.add('eg-swapped');
  }
  img.setAttribute('src', newSrc);
  img.setAttribute('srcset', newSrc + ' 1x');
  img.setAttribute('data-src', newSrc);
  var sources = container.querySelectorAll('source');
  for (var i = 0; i < sources.length; i++) sources[i].setAttribute('srcset', newSrc);
}
```
**Gotcha:** Update `<source srcset>` inside `<picture>` too. Keep element height to prevent CLS.

---

## P2. Insert Section
**When:** Add marketing section/banner/CTA at a specific spot.
```js
function addSection() {
  var anchor = document.querySelector('.stable-anchor');
  if (!anchor || document.querySelector('.eg-hero-section')) return;
  var section = document.createElement('div');
  section.className = 'eg-hero-section';
  section.innerHTML = '<h2>Title</h2><p>Copy</p>';
  anchor.insertAdjacentElement('beforebegin', section);
}
```
**Gotcha:** Never `innerHTML =` container with event bindings. Guard against duplicate insert.

---

## P3. Sticky Element
**When:** Element sticks/appears/collapses on scroll.
```js
function initSticky() {
  if (document.body.classList.contains('eg-stuck')) return;
  window.addEventListener('scroll', function () {
    var y = window.scrollY || document.documentElement.scrollTop;
    document.body.classList.toggle('eg-stuck', y > 300);
  }, { passive: true });
}
```
```css
.EG-TEST-ID.eg-stuck .site-header { position: sticky; top: 0; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
```
**Gotcha:** CSS `position: sticky` fails inside `overflow: auto` ancestor. Use `{ passive: true }`.

---

## P4. DOM Reordering
**When:** Move/reorder existing sections.
```js
function reorder() {
  var list = document.querySelector('.eg-parent');
  if (!list || list.dataset.egReordered) return;
  list.querySelectorAll('.eg-source-item').forEach(function (item) {
    list.insertBefore(item, list.firstChild);
  });
  list.dataset.egReordered = '1';
}
```
**Gotcha:** Moving node auto-detaches. Loop in reverse for reordering.

---

## P5. MutationObserver Guard
**When:** Page re-renders target area and undoes changes.
```js
var isRunning = false;
function ensureApplied() {
  if (isRunning) return;
  isRunning = true;
  applyChanges();
  setTimeout(function () { isRunning = false; }, 200);
}
var mo = new MutationObserver(function (mutations) {
  if (mutations.some(function (m) { return m.type === 'childList' && m.addedNodes.length; }))
    ensureApplied();
});
mo.observe(document.querySelector('.target'), { childList: true, subtree: true });
```
**Gotcha:** Scope to smallest container. Guard with flag + debounce. Disconnect when done.

---

## P6. SPA Routing
**When:** Test applies on multiple routes / state persists across navigation.
**Use:** `listener()` from SNIPPETS.md. Re-run `waitForElement` in callback.

---

## P7. Event Tracking
**When:** Measure clicks on test elements.
**Use:** `live()` in `share.js`. One per tracked interaction. Never mutate DOM in share.js.

---

## P8. Form Restructure
**When:** Redesign form layout without breaking submission.
**Use:** Move existing fields via `insertBefore`/`appendChild`. Never clone inputs.

---

## P9. Load External Library
**When:** Need library site doesn't ship (tiny-slider, etc.).
**Use:** `loadExternalLib()` from SNIPPETS.md. Poll `window.tns` before init.

---

## P10. Text/Price Replacement
**When:** Swap headline, copy, prices, badges.
**Use:** `textContent` only on leaf elements. Preserve currency formatting.

---

## P11. Device-Switch Restore
**When:** Apply on some viewports, revert on others.
**Use:** `deviceAware()` from SNIPPETS.md. Store originals for restore.

---

## P12. Cross-Page State
**When:** Multi-step flow, urgency timers, one-time nudges.
**Use:** `localStorage` with try/catch. Version key with variation name.

---

## P13. XHR Hook
**When:** Page re-renders via fetch/XHR, DOM changes wiped.
**Use:** `hookXHR()` from SNIPPETS.md. Re-apply in load callback.

---

## P14. Cookie Helpers
**When:** Read/write cookies for targeting.
**Use:** `getCookie()` / `setCookie()` from SNIPPETS.md.

---

## P15. Exit-Intent Popup
**When:** Show popup on mouse-leave (desktop) / scroll-up (mobile).
```js
document.addEventListener('mouseout', function (e) {
  if (e.clientY < 5 && !sessionStorage.getItem('eg-popup-seen')) {
    showModal();
    sessionStorage.setItem('eg-popup-seen', '1');
  }
});
```

---

## P16. Cart Progress Bar
**When:** Threshold-based progress bar / free-shipping message.
```js
function updateCartProgress(cartTotal) {
  var threshold = 50;
  var pct = Math.min((cartTotal / threshold) * 100, 100);
  document.querySelector('.eg-progress').style.width = pct + '%';
}
```

---

## P17. Date Math / Countdown
**When:** Business days calculation, urgency countdown.
```js
function addBusinessDays(startDate, days) {
  var d = new Date(startDate);
  while (days > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) days--; }
  return d;
}
```

---

## P18. Cross-Page HTML Fetch
**When:** Fetch another page, parse, clone elements.
**Use:** `fetchPdpBlocks()` from SNIPPETS.md.

---

## P19. IP-Geo Content Swap
**When:** Show content based on user location.
**Use:** Fetch `https://ipapi.co/json/` → check `country_code` → swap content.

---

## P20. CSS-Only Carousel
**When:** Simple carousel without JS library.
```css
.eg-carousel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; }
.eg-carousel > * { scroll-snap-align: start; flex: 0 0 100%; }
```

---

## P21. Accordion Animation
**When:** Smooth accordion open/close.
```css
.eg-accordion-content { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s; }
.eg-accordion.open .eg-accordion-content { grid-template-rows: 1fr; }
.eg-accordion-content > div { overflow: hidden; }
```

---

## P22. rAF waitFor
**When:** Wait for element with requestAnimationFrame (lighter than setInterval).
```js
function rafWaitFor(selector, callback) {
  function check() {
    var el = document.querySelector(selector);
    if (el) callback(el); else requestAnimationFrame(check);
  }
  check();
}
```

---

## P23. PLP Quick View (Clone PDP)
**When:** Show PDP content in PLP modal.
**Use:** `fetchPdpBlocks()` + `sanitizeBuyBox()` + `bindModalBuy()` from SNIPPETS.md.
**See:** AB044 (AWG) for full implementation.

---

## P24. PDP to PLP Auto Popup
**When:** User lands on PDP, redirect to PLP, auto-open modal.
**Flow:** PDP saves URL → sessionStorage → redirect → PLP reads → fetch PDP → auto modal.
**Gotcha:** `waitForElement('html body')` not cards. `openModal(pdpUrl)` not card.

---

## P25. PLP Image Zoom Modal
**When:** Mobile PLP image click → zoom modal instead of PDP navigation.
**Flow:** Fetch PDP → extract gallery images → store in `data-pdp-images` → click → modal with tns slider + CSS `transform: scale()`.
**Gotcha:** tns = slider only. Zoom = custom CSS transform. Load tns via `loadExternalLib()`.

---

## P26. Configurator CAPTURE Handler
**When:** Theme intercepts radio clicks, cloned radios never get checked.
```js
document.addEventListener('click', function (e) {
  var opt = e.target.closest('.modal .product-detail-configurator-option');
  if (!opt) return;
  var radio = opt.querySelector('input[type="radio"]');
  if (!radio || radio.disabled || radio.checked) return;
  e.preventDefault(); e.stopPropagation();
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  radio.checked = true;
  handleVariantSelect(modal, radio, isSize);
}, true);
```
**Gotcha:** Must be CAPTURE phase (third arg `true`). Stops theme handlers from running.

---

## P27. Variant Switch In-Place
**When:** Single-URL products — update buy form without re-fetch.
**Use:** `updateBuyFormInPlace()` pattern from SNIPPETS.md logic. Rewrite `lineItems[oldId]` → `lineItems[newId]` across WHOLE modal.

---

## P28. SessionStorage Popup Tracking
**When:** Don't show popup again for same product in session.
```js
function markShown(key, url) { sessionStorage.setItem(key, getProductSlug(url)); }
function isShown(key, url) { return sessionStorage.getItem(key) === getProductSlug(url); }
```
**Gotcha:** Simple flag better than array. Clear key after read.

---

## P29. Single-File Dual-Context
**When:** One script runs on both PDP and PLP.
```js
(function () {
  // All code here — works on both page types
  // PDP: check body class, save URL, redirect
  // PLP: check sessionStorage, fetch PDP, open modal
  waitForElement('html body', init, 50, 15000);
})();
```
**Gotcha:** Don't wait for page-specific selectors. Use `html body` as universal wait.

---

## P30. CSS Scope Guard
**When:** All CSS must be scoped under test body class.
```css
.EG-TEST-ID .element { /* correct */ }
.element { /* wrong — unscoped */ }
```

---

## P31. Lazy Fetch Queue — Push Callback Before Fetch
**When:** Queuing async fetches with concurrency limit. Queue deadlocks if callback stored after fetch starts.
```js
function ensure(card, cb) {
  if (card.done) { if (cb) cb(); return; }
  if (card.pending) { if (cb) card.pending.push(cb); return; }
  card.pending = [];
  if (cb) card.pending.push(cb); // ← push BEFORE fetch
  fetch(card.url).then(function () {
    card.done = true;
    var cbs = card.pending || [];
    card.pending = null;
    for (var i = 0; i < cbs.length; i++) cbs[i]();
  });
}
```
**Gotcha:** Symptom: exactly N (= concurrency limit) cards get data, rest never start.

---

## P32. Bootstrap Flex-Wrap Gotcha
**When:** 2-col desktop layout uses Bootstrap `.row` — columns stack vertically because `flex-wrap: wrap` is default.
```css
.EG-TEST-ID .container > .row { flex-wrap: nowrap; }
```
**Gotcha:** Verify mobile still stacks. Only apply `nowrap` where redesign intends it.

---

## P33. Match AJAX Payload Encoding Byte-for-Byte
**When:** Cloning site component that fires AJAX. Server validates exact payload shape.
- Use `encodeURIComponent` on JSON: `%7B`, `%22`, `%3A`, `%2C`, `%7D`
- Include `X-Requested-With: XMLHttpRequest`
- Copy ALL state theme includes — don't omit fields that look like "ignore" hints
**Gotcha:** Wrong encoding = silent failure. Get real request from user's Network tab first.

---

## P34. Plugin Iframe/Widget Overlay — Don't Move
**When:** Moving plugin-owned widget (PayPal, Amazon, iframes) from one spot to another. `appendChild` breaks postMessage/click wiring.
- Keep original alive off-screen (`position: absolute; left: -9999px`)
- Overlay over target with `position: fixed` + rAF loop to sync position
**Gotcha:** `display:none` kills iframe render. Never move — always overlay.
