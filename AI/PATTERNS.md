# Patterns — Quick Reference

Match brief → find pattern → adapt code. Source: `SNIPPETS.md` — do not duplicate functions. Other files reference it.

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
**When:** Add marketing section/banner/CTA at a specific spot. (75% of tests)
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
**Gotcha:** Never `innerHTML =` container with event bindings. Guard against duplicate insert. Always `waitForElement` on anchor, not parent.

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
**Use:** `live()` in `share.js` (see `SNIPPETS.md:2`). One per tracked interaction. Never mutate DOM in share.js. Any DOM read on load (e.g. `[data-pid]` → cookie) must be inside `waitForElement` (see `SNIPPETS.md:1`) — never top-level `querySelector`.

---

## P8. Form Restructure
**When:** Redesign form layout without breaking submission.
**Use:** Move existing fields via `insertBefore`/`appendChild`. Never clone inputs.

---

## P9. Load External Library (Slick/JQuery)
**When:** Need library site doesn't ship. Real pattern: dual CSS + JS inject (21% of tests use slick).
```js
function loadSlick(cb) {
  if (document.querySelector('.eg-slick-loaded')) return;
  var g = document.createElement('div'); g.className = 'eg-slick-loaded'; document.head.appendChild(g);
  var l1 = document.createElement('link'); l1.rel = 'stylesheet'; l1.href = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css'; document.head.appendChild(l1);
  var l2 = document.createElement('link'); l2.rel = 'stylesheet'; l2.href = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.min.css'; document.head.appendChild(l2);
  var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js'; s.onload = cb; document.head.appendChild(s);
}
function waitForSlick(cb){ var i=setInterval(function(){ if(window.jQuery && jQuery.fn.slick){ clearInterval(i); cb(); }},50); setTimeout(function(){clearInterval(i)},15000); }
```
**Use:** Call `loadSlick(function(){ waitForSlick(initSlick); });`

---

## P10. Text/Price Replacement
**When:** Swap headline, copy, prices, badges.
**Use:** `textContent` only on leaf elements. Preserve currency formatting.

---

## P11. URL / Page-Type Gating
**When:** Test only on specific PDP/PLP/category or exclude pages. (26% of tests)
```js
function shouldRun() {
  if (['/cart','/checkout'].some(function(p){ return location.pathname.includes(p); })) return false;
  if (location.href.includes('/collections/')) return true;
  return false;
}
if (!shouldRun()) return;
waitForElement('.stable-anchor', init, 50, 15000);
```
**Gotcha:** Gate BEFORE waitForElement. Use `blockedUrls.includes(location.href)` early return for CROCS pattern.

---

## P12. Viewport Branch + Resize Rebuild
**When:** Different DOM/position on mobile vs desktop.
*History:* 35% of 4344 tests used `window.innerWidth < 767` + `resize` rebuild. `deviceAware()` matchMedia was only 0.07% — legacy.
*Modern options — choose per site:*
```js
// A) Legacy inline + rebuild (works, simple)
function buildA() {
  var isMobile = window.innerWidth < 767;
  if (document.querySelector('.eg-details')) document.querySelector('.eg-details').remove();
  var anchor = document.querySelector(isMobile ? '.mobile-anchor' : '.desktop-anchor');
  if (!anchor || document.querySelector('.eg-details')) return;
  anchor.insertAdjacentHTML('afterend', '<div class="eg-details">...</div>');
}
waitForElement('.desktop-anchor', buildA, 50, 15000);
window.addEventListener('resize', function(){ setTimeout(buildA, 200); });

// B) matchMedia (preferred for viewport) + ResizeObserver (element size)
var mq = window.matchMedia('(max-width: 767px)');
mq.addEventListener('change', buildA);
// or ResizeObserver for container queries: new ResizeObserver(buildA).observe(anchor);

// C) CSS-only when possible — @media hide/show, no JS rebuild needed
```
**Gotcha:** Use `screen.width` only if site lacks matchMedia support. Prefer CSS or matchMedia for modern responsive.

---

## P13. XHR Hook (Cart/Filter Re-apply)
**When:** Page re-renders via fetch/XHR, DOM changes wiped. (11% fetch, 4.6% Cart)
```js
function hookCartReapply(reApply){
  var orig = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(){
    this.addEventListener('load', function(){
      if (this.responseURL && this.responseURL.includes('Cart-UpdateQuantity')) reApply();
    });
    return orig.apply(this, arguments);
  };
}
```
**Price parse helper:** `var price = parseFloat(el.innerText.replace(/[^0-9.]/g,''));`

---

## P14. Cookie Helpers
**When:** Read/write cookies for targeting.
**Use:** `getCookie()` / `setCookie()` from SNIPPETS.md.

---

## P15. Nudge / Progress / Urgency (merged)
**When:** Exit nudge, cart progress, countdown, scarcity line. (exit 0%, progress 3%, urgency 0.4%)
```js
// progress bar
var pct = Math.min((cartTotal/threshold)*100,100); document.querySelector('.eg-progress').style.width=pct+'%';
// urgency line
var anchor=document.querySelector('.hero-cta'); if(anchor && !document.querySelector('.eg-urgency')) anchor.insertAdjacentHTML('beforebegin','<div class="eg-urgency">Only 3 spots left</div>');
// countdown: use setInterval + Date math, version key with variation name
```
**Gotcha:** Keep to 5 lines, not full pattern per use.

---

## P16. CSS Scope & Layout Gotchas (merged)
**When:** Scoping, accordion, carousel, flex. (80% @media, 80% !important, 71% flex in real tests)
```css
/* Scope — 78% use .EG-/.eg- prefix, 22% unscoped = bug */
.EG-TEST-ID .element { /* correct - scope all CSS */ }
.element { /* wrong - unscoped */ }
/* !important guard — 80% bloat, use <2 per file */
.EG-TEST-ID .eg-hidden { display:none !important; } /* only utility */
/* Trust logos — 9.5% filter pattern */
.EG-TEST-ID .eg-trust-logos { display:flex; flex-wrap:wrap; gap:15px; justify-content:center }
.EG-TEST-ID .eg-trust-logos img { width:90px; height:48px; object-fit:contain; filter:invert(50%) grayscale(100%); transition:filter .2s }
.EG-TEST-ID .eg-trust-logos img:hover { filter:invert(0) grayscale(0) !important; }
/* Accordion — P21 grid, 3% use */
.eg-accordion-content { display:grid; grid-template-rows:0fr; transition:grid-template-rows .32s; }
.eg-accordion.open .eg-accordion-content { grid-template-rows:1fr; }
.eg-accordion-content > div { overflow:hidden; }
/* Progress — 2.2% */
.EG-TEST-ID .eg-progress-track { height:6px; background:#E4E4E7; border-radius:9999px; overflow:hidden }
.EG-TEST-ID .eg-progress { height:100%; width:0; background:#00BE00; transition:width .32s; }
/* Reorder — 18% order, 4.2% :has */
.EG-TEST-ID .eg-reorder { display:flex; flex-direction:column }
.EG-TEST-ID .eg-reorder .eg-reviews { order:-1 }
.EG-TEST-ID .container > .row { flex-wrap:nowrap; } /* P32 — only where needed */
.eg-carousel { display:flex; overflow-x:auto; scroll-snap-type:x mandatory; } /* P20 — rare, JS slick 5% preferred */
```

---

## Appendix A. Shopware / AWG Quick-View (collapsed P23-P29, P31)
**When:** Only for AWG-MODE Shopware PLP→PDP clone (0.3% of tests). Do not use for generic tests.
**Use:** `fetchPdpBlocks()` + `sanitizeBuyBox()` + CAPTURE handler + variant switch. See `ab-test/AWG-MODE/AB044`, `AB045` for full 80-line implementation. Snippets 7-13 archived.

## Appendix B. Rare Gotchas (collapsed)
- **P33 Payload Encoding:** Match `encodeURIComponent(JSON.stringify)` + `X-Requested-With` exactly — get real Network payload first. (1.3%)
- **P34 Iframe Overlay:** Never `appendChild` PayPal iframe — overlay with `position:fixed` + rAF sync, keep original offscreen `left:-9999px`. (0.2%)

## P17. Date Math / Countdown
**When:** Business days calculation, urgency countdown.
```js
function addBusinessDays(startDate, days) {
  var d = new Date(startDate);
  while (days > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) days--; }
  return d;
}
```
