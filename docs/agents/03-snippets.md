# 03 — Copy-Paste Snippets

> Source: `AGENTS.md` Section 7.1. Priority: HIGH.
> Numbering note: the original file numbered these 1, 2, 3, 4, 5, 7, 8 (6 was missing).
> They are renumbered here S1-S7 with the old number in brackets. S8 (Swiper) is a new addition — it was referenced by P58/P73/P74 but had no copy-paste snippet. No code logic was changed.
> Only comments were translated to English.

---

## S1. waitForElement — Poll for DOM element [Old: 1] (97% of tests)

```js
function waitForElement(selector, trigger, delayInterval, delayTimeout) {
  var interval = setInterval(function () {
    if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
      clearInterval(interval);
      trigger();
    }
  }, delayInterval);
  setTimeout(function () { clearInterval(interval); }, delayTimeout);
}

// Usage — always on ANCHOR, not parent
waitForElement('.stable-anchor', init, 50, 15000);
```

---

## S2. live() — Delegated event binding [Old: 2] (28% of tests)

```js
function live(selector, event, callback, context) {
  function addEvent(el, type, handler) {
    if (el.attachEvent) el.attachEvent('on' + type, handler);
    else el.addEventListener(type, handler);
  }
  this.Element && (function (ElementPrototype) {
    ElementPrototype.matches = ElementPrototype.matches || ElementPrototype.matchesSelector ||
      ElementPrototype.webkitMatchesSelector || ElementPrototype.msMatchesSelector ||
      function (selector) {
        var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
        while (nodes[++i] && nodes[i] != node);
        return !!nodes[i];
      };
  })(Element.prototype);
  function live(selector, event, callback, context) {
    addEvent(context || document, event, function (e) {
      var found, el = e.target || e.srcElement;
      while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
      if (el && found) callback.call(el, e);
    });
  }
  live(selector, event, callback, context);
}

// Usage
live('.btn', 'click', function () { /* this = matched element */ });
```

---

## S3. listener() — SPA routing [Old: 3] (9.8% of tests)

Note: the original snippet used arrow functions. For production, replace `=>` with `function () {}` to comply with `01-core-rules.md` RULE 5. Logic below is unchanged.

```js
function listener() {
  window.addEventListener("locationchange", function () {
    // re-run init for new route
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
listener();
```

---

## S4. Cookie helpers [Old: 4]

```js
function getCookie(name) {
  var v = null;
  document.cookie.split(';').forEach(function (c) {
    var m = c.trim().match(name + '=([^;]+)');
    if (m) v = decodeURIComponent(m[1]);
  });
  return v;
}

function setCookie(name, val, days) {
  var d = new Date();
  d.setTime(d.getTime() + (days || 30) * 86400000);
  document.cookie = name + '=' + encodeURIComponent(val) + ';expires=' + d.toUTCString() + ';path=/';
}
```

---

## S5. loadExternalLib — Slick/jQuery CDN [Old: 5] (21% CDN inject)

```js
function loadSlick(cb) {
  if (document.querySelector('.eg-slick-loaded')) return;
  var g = document.createElement('div'); g.className = 'eg-slick-loaded'; document.head.appendChild(g);
  var l1 = document.createElement('link'); l1.rel = 'stylesheet'; l1.href = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css'; document.head.appendChild(l1);
  var l2 = document.createElement('link'); l2.rel = 'stylesheet'; l2.href = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.min.css'; document.head.appendChild(l2);
  var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js'; s.onload = cb; document.head.appendChild(s);
}
function waitForSlick(cb){ var i=setInterval(function(){ if(window.jQuery && jQuery.fn.slick){ clearInterval(i); cb(); }},50); setTimeout(function(){clearInterval(i)},15000); }
// Usage: loadSlick(function(){ waitForSlick(initSlick); });
```

---

## S6. XHR Hook + Price Parse — Cart re-apply [Old: 7] (4.6% cart)

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
function parsePrice(el){ return parseFloat(el.innerText.replace(/[^0-9.]/g,'')); }
```

---

## S7. ScrollSpy + Sticky Pill Jump-Links [Old: 8] (P20)

Full drop-in: config → JS → CSS. Change selectors only, everything else works as-is.

```js
/* == Pill ScrollSpy + Sticky Jump-Links (generic) == */
// Config — change only these selectors, nothing else
var pillConfig = {
  variation: 'EG-XXX',              // body class / scope prefix
  navSelector: '.eg-quick-links',   // jump-links wrapper you inject
  linkSelector: '.eg-link',         // each <a href="#section">
  activeClass: 'eg-link--active',   // pill highlight class
  navbarSelector: '',               // site header to dock into ('' = no docking)
  homeAnchor: '',                   // original position to restore the dock (e.g. '.eg-hero') — '' for no-dock case only
  stickyGap: 20                     // extra px offset from section tops
};

var pillScope = '.' + pillConfig.variation + ' ' + pillConfig.navSelector;
var isClickScrolling = false;
var pillTicking = false;
var pillClickTimer = null;
var lastPillKey = '';
var pillStickyOffset = 0;

// setActivePill - clear all pills and activate one link
function setActivePill(activeLink) {
  var allLinks = document.querySelectorAll(pillScope + ' ' + pillConfig.linkSelector);
  for (var i = 0; i < allLinks.length; i++) allLinks[i].classList.remove(pillConfig.activeClass);
  if (activeLink) activeLink.classList.add(pillConfig.activeClass);
}

// getStickyOffset - fixed chrome height (how many px above to land)
function getStickyOffset() {
  var h = 0;
  var quickLinks = document.querySelector(pillScope);
  var navbar = pillConfig.navbarSelector ? document.querySelector(pillConfig.navbarSelector) : null;
  if (quickLinks) h += quickLinks.offsetHeight; // the bar covers the top once fixed — always add
  if (navbar && navbar.classList.contains('is_sticky')) h += navbar.offsetHeight; // non-sticky navbar scrolls away — do not count
  return h + pillConfig.stickyGap;
}

// smoothScroll - smooth scroll with offset
function smoothScroll(target) {
  var element = document.querySelector(target);
  if (!element) return;
  var offset = getStickyOffset() + 100;
  var offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
}

// updateActiveOnScroll - highlight pills for sections in viewport (multiple active allowed)
function updateActiveOnScroll() {
  if (isClickScrolling) { pillTicking = false; return; }

  // build targets from link hrefs only (no hardcoded list)
  var links = document.querySelectorAll(pillScope + ' ' + pillConfig.linkSelector);
  var visibleKeys = [];
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute('href') || '';
    if (href.indexOf('#') !== 0) continue;
    var el = document.querySelector(href);
    if (!el) continue;
    var rect = el.getBoundingClientRect();
    if (rect.top > 0 && rect.top < window.innerHeight) visibleKeys.push(href);
  }

  // update DOM only when the active set changes
  var activeKey = visibleKeys.join(',');
  if (activeKey === lastPillKey) { pillTicking = false; return; }
  lastPillKey = activeKey;

  // clear + highlight
  for (var j = 0; j < links.length; j++) links[j].classList.remove(pillConfig.activeClass);
  for (var k = 0; k < visibleKeys.length; k++) {
    var link = document.querySelector(pillScope + ' ' + pillConfig.linkSelector + '[href="' + visibleKeys[k] + '"]');
    if (link) link.classList.add(pillConfig.activeClass);
  }
  pillTicking = false;
}

// onPillScroll - rAF throttle wrapper
function onPillScroll() {
  if (!pillTicking) {
    pillTicking = true;
    window.requestAnimationFrame(updateActiveOnScroll);
  }
}

// handleStickyNav - toggle .is-sticky on scroll; docking only when navbarSelector is set
function handleStickyNav() {
  var quickLinks = document.querySelector(pillScope);
  if (!quickLinks) return;

  if (window.pageYOffset > pillStickyOffset) {
    quickLinks.classList.add('is-sticky');
    if (!pillConfig.navbarSelector) return; // no-dock: class toggle only, no DOM move
    var navbar = document.querySelector(pillConfig.navbarSelector);
    if (navbar && navbar.classList.contains('is_sticky') && quickLinks.parentNode !== navbar) {
      navbar.insertAdjacentElement('beforeend', quickLinks);
      quickLinks.style.top = navbar.offsetHeight + 'px';
    }
  } else {
    quickLinks.classList.remove('is-sticky');
    quickLinks.style.top = '';
    // restore dock to original position (only reparented in dock case)
    if (pillConfig.homeAnchor) {
      var home = document.querySelector(pillConfig.homeAnchor);
      if (home && home.nextSibling !== quickLinks) home.insertAdjacentElement('afterend', quickLinks);
    }
  }
}

// jumpLinksLogic - click + scroll + initial state (call once after init)
function jumpLinksLogic() {
  var quickLinks = document.querySelector(pillScope);
  if (!quickLinks) return;

  // sticky origin point = bar document position
  pillStickyOffset = quickLinks.getBoundingClientRect().top + window.pageYOffset;

  // click: prevent default, set pill, smooth scroll, 900ms scroll-lock
  live('.' + pillConfig.variation + ' ' + pillConfig.linkSelector, 'click', function (e) {
    e.preventDefault();
    isClickScrolling = true;
    clearTimeout(pillClickTimer);
    setActivePill(this);
    var target = this.getAttribute('href');
    if (target) smoothScroll(target);
    pillClickTimer = setTimeout(function () { isClickScrolling = false; }, 900);
  });

  // single scroll listener — both sticky and spy
  window.addEventListener('scroll', function () {
    handleStickyNav();
    onPillScroll();
  }, { passive: true });

  // on load: first link active (no hardcoded href — actual first link)
  updateActiveOnScroll();
  setActivePill(document.querySelector(pillScope + ' ' + pillConfig.linkSelector));
}
```

```css
/* ── Pill Jump-Links (generic) — scope under .EG-XXX ──── */
.EG-XXX .eg-quick-links {
  background: #fff;
}

/* Sticky state — top: 0 is required, otherwise the bar stays off-screen above after scrolling past */
.EG-XXX .eg-quick-links.is-sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  max-width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0;
}

.EG-XXX .eg-quick-links__container {
  display: flex;
  justify-content: center;
  align-items: stretch;
  max-width: 1248px;
  margin: 0 auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 24px;
  background: #FBFBFB;
  scrollbar-width: none;        /* Firefox */
  -ms-overflow-style: none;     /* IE/Edge */
}

.EG-XXX .eg-quick-links__container::-webkit-scrollbar {
  display: none;                /* Chrome/Safari */
}

.EG-XXX .eg-link {
  flex: 0 0 auto;
  padding: 14px 18px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-decoration: none;
  color: #006DAE;
  white-space: nowrap;
  transition: background 0.2s ease;
}

.EG-XXX .eg-link:hover {
  background: #E8F1FE;
}

.EG-XXX .eg-link--active {
  background: #E8F2F8;
  border-bottom: 1px solid #006DAE;
}

/* ── Mobile: horizontal scroll, flex-start ──── */
@media (max-width: 767px) {
  .EG-XXX .eg-quick-links__container {
    justify-content: flex-start;
  }
  .EG-XXX .eg-link {
    padding: 12px 14px;
    font-size: 12px;
  }
}
```

**Usage:**
- Wrapper HTML: `.eg-quick-links > .eg-quick-links__container > a.eg-link[href="#section"]...`
- Call only `jumpLinksLogic();` in init — body class `EG-XXX` is already added in `init()`.
- No-dock site: `navbarSelector: ''`, `homeAnchor: ''` (defaults) — pinned by CSS toggle only.
- Dock site: `navbarSelector: '.site-header'` + `homeAnchor: '.eg-hero'` — docks when the site applies `is_sticky`, restores to the next sibling of homeAnchor on scroll back.
- Sections add/remove = only change links in HTML, JS derives targets from href automatically.

---

## S8. loadSwiper — Swiper slider CDN (NEW, no jQuery needed)

Use when the test needs a carousel but the site has no slider library, or Slick conflicts with the theme. Swiper bundle needs no jQuery. Related: P58, P73, P74.

```js
// loadSwiper - inject Swiper CSS+JS once, then run callback
function loadSwiper(cb) {
  if (document.querySelector('.eg-swiper-loaded')) return;
  var g = document.createElement('div'); g.className = 'eg-swiper-loaded'; document.head.appendChild(g);
  var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.2.10/swiper-bundle.min.css'; document.head.appendChild(l);
  var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.2.10/swiper-bundle.min.js'; s.onload = cb; document.head.appendChild(s);
}

// waitForSwiper - poll until the Swiper global is ready
function waitForSwiper(cb){ var i=setInterval(function(){ if(typeof Swiper !== 'undefined'){ clearInterval(i); cb(); }},50); setTimeout(function(){clearInterval(i)},15000); }
// Usage: loadSwiper(function(){ waitForSwiper(initSwiper); });
```

```js
// initSwiper - basic slider init (change selectors and options only)
function initSwiper() {
  if (document.querySelector('.eg-swiper-initialized')) return;
  var slider = document.querySelector('.eg-slider');
  if (!slider || typeof Swiper === 'undefined') return;
  slider.classList.add('eg-swiper-initialized');
  new Swiper(slider, {
    slidesPerView: 1,
    spaceBetween: 16,
    pagination: { el: '.swiper-pagination', clickable: true }
  });
  window.dispatchEvent(new Event('resize')); // force recalculation after insert (P73)
}
```

**Usage:**
- Slider HTML must follow Swiper structure: `.eg-slider.swiper > .swiper-wrapper > .swiper-slide...` plus `.swiper-pagination` if pagination is used.
- Slick (S5) needs jQuery; Swiper (S8) does not — prefer Swiper on sites without jQuery.
- After dynamic insert, dispatch `resize` so Swiper recalculates widths (P73).
