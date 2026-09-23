# CODE GUIDELINES

> Ultimate weapon for AI. Read before writing any test code.

---

## 1. ELEMENT INSERTION — Always Guard

**Principle:** Check if element already exists before inserting new one.

**Why:** Without guard, every `init()` call or MO trigger adds duplicate content. `waitForElement` can fire multiple times. Page reloads re-run code.

**When:** Any `insertAdjacentHTML` or `insertAdjacentElement` usage.

**Rule:** `if (el.querySelector('.eg-xxx')) continue;` or `return;` — mandatory for every insert.

---

## 2. EVENTS — Use live() from SNIPPETS.md

**Principle:** Prefer `live()` for delegated events. Only use `addEventListener` with guard if `live()` won't work.

**Why:** `live()` handles dynamic elements automatically. `addEventListener` without guard adds duplicate listeners on re-inject.

**When:** All click/scroll/change events in variation.js. share.js = tracking only, NO DOM mutation.

**Rule:** If using `addEventListener`, guard with `data-eg-bound` check.

---

## 3. TEMPLATE LITERALS — Always Use for HTML

**Principle:** Always use backticks for HTML strings in JS.

**Why:** Backticks support multi-line strings without concatenation. Cleaner, readable, maintainable.

**When:** Any HTML string construction in variation.js.

---

## 4. MUTATION OBSERVER — Ask User First, Then Use Safely

**Principle:** Ask user if website is SPA before using MO. Scope to smallest container. Guard with `isRunning` flag.

**Why:** MO on `document.body` causes performance issues and self-trigger loops. SPA frameworks re-render DOM unpredictably.

**When:** Only when user confirms SPA or dynamic re-rendering affects your changes.

**Rules:**
- Scope to smallest container — never `document.body`
- `isRunning` flag + 200ms debounce
- Filter own mutations: `if (target.closest('.eg-*')) continue;`
- Never observe `src` — use `attributeFilter: ['data-*']` only
- Disconnect when done

---

## 5. CODE STYLE — Human Readable & Maintainable

**Principle:** Write code that humans can read and maintain.

**Why:** AB tests are temporary but code must be debuggable. AI-style minified code wastes time during QA.

**When:** Always.

**Rules:**
- Named functions, not anonymous arrows
- `var` not `let/const` (wider browser support)
- Descriptive variable names
- One function = one job
- No minified/obfuscated code

---

## 6. STEP-BY-STEP CODE WITH NOTES

**Principle:** Add one-line note above each function explaining what it does.

**Why:** New developer reads code and immediately understands purpose without reading implementation.

**When:** Always. Every function should have a comment above it.

---

## 7. FILE STRUCTURE

```
ab_testing-starter_kit/ClientData/TEST-NAME/
├── v1.json              # Required
├── metadata.json        # Required
├── share.js             # If tracking needed
└── variation1/
    ├── variation.js     # IIFE + helpers + init
    └── variation.css    # Scoped under .EG-TEST-NAME
```

### variation.js Template:
```js
(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-TEST-NAME';
    var targetSelector = '.target-element';

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector)) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function init() {
      document.body.classList.add(variation_name);
      // your logic here
    }

    waitForElement(targetSelector, init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();
```

**Idempotent Init Pattern:** Always add body class first, then check if element already exists before inserting. Anchor must exist before use.
```js
function init() {
  document.body.classList.add(variation_name);
  if (document.querySelector('.eg-hero-section')) return; // idempotent
  var anchor = document.querySelector('.stable-anchor');
  if (!anchor) return;
  anchor.insertAdjacentHTML('afterend', '<div class="eg-hero-section">...</div>');
}
```

### variation.css Template:
```css
.EG-TEST-NAME .eg-new-element {
  /* styles here */
}
```

### metadata.json Template:
```json
{
  "id": "EG-EXAMPLE-SM01",
  "client": "EXAMPLE CLIENT",
  "type": "From the brief shared",
  "platform": "From the brief shared",
  "devices": ["From the brief shared", "From the brief shared", "From the brief shared"],
  "number_of_variations": "from the brief shared"
}

```

### v1.json Template:
```json
{
  "files": [
    "./variation1/variation.css",
    "./variation1/variation.js",
    "./share.js"
  ],
  "urls": [
    "client target url here"
  ]
}

```

### share.js Template:
```js
(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-EXAMPLE-SM01-events-tracking';
    var targetSelector = "wait-for-element-selector-from-dom";

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector)) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function init() {
      if(document.querySelector('.' + variation_name)) return;
      document.body.classList.add(variation_name);
      // example : live('.selector', 'click', function () { console.log('clicked'); });
    }

    waitForElement(targetSelector, init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in share.js ' + variation_name);
  }
})();

```

---

## 7.1 KEY SNIPPETS (Copy-paste ready)

### 1. waitForElement — Poll for DOM element (97% of tests)
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

### 2. live() — Delegated event binding (28% of tests)
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

### 3. listener() — SPA routing (9.8% of tests)
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

### 4. Cookie Helpers
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

### 5. loadExternalLib — Slick/jQuery CDN (21% CDN inject)
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

### 7. XHR Hook + Price Parse — Cart re-apply (4.6% Cart)
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

### 8. ScrollSpy — Sticky Nav Auto-Highlight (P20)
```js
var isClickScrolling = false;
var ticking = false;
var clickTimer = null;

function getStickyOffset() {
  var navbar = document.querySelector('#navigation-header');
  var quickLinks = document.querySelector('.eg-quick-links');
  var h = 0;
  if (navbar) h += navbar.offsetHeight;
  if (quickLinks && quickLinks.classList.contains('is-sticky')) h += quickLinks.offsetHeight;
  return h + 20;
}

function updateActiveOnScroll() {
  if (isClickScrolling) { ticking = false; return; }
  var sections = [
    { id: 'section-1', selector: '#section-1' },
    { id: 'section-2', selector: '#section-2' }
  ];
  var stickyOffset = getStickyOffset();
  var bestId = sections[0].id;
  for (var i = 0; i < sections.length; i++) {
    var sec = document.querySelector(sections[i].selector);
    if (!sec) continue;
    if (sec.getBoundingClientRect().top - stickyOffset <= 0) bestId = sections[i].id;
  }
  var activeLink = document.querySelector('.eg-link[href="#' + bestId + '"]');
  if (activeLink && !activeLink.classList.contains('eg-link--pill')) setActivePill(activeLink);
  ticking = false;
}

function onScrollSpy() {
  if (!ticking) { ticking = true; window.requestAnimationFrame(updateActiveOnScroll); }
}

// In init():
// live('.eg-link','click',function(e){e.preventDefault();isClickScrolling=true;clearTimeout(clickTimer);setActivePill(this);smoothScroll(this.getAttribute('href'));clickTimer=setTimeout(function(){isClickScrolling=false;},900);});
// window.addEventListener('scroll', onScrollSpy, {passive:true}); updateActiveOnScroll();
```

---

## 7.2 ADVANCED JS PATTERNS (From ClientData Analysis)

### 1. Dataset Flag Guard
**Principle:** Use `data-*` attributes instead of CSS classes for idempotency guards.
**Why:** CSS classes can collide with site styles. Dataset attributes are isolated and semantic.
**When:** Class-based guards might conflict with existing site classes.

### 2. Staggered Re-Init
**Principle:** For SPA frameworks, call `init()` multiple times with increasing delays.
**Why:** Framework hydration is unpredictable. Each call is idempotent, so extra calls are no-ops.
**When:** Vue/React/Next.js sites where elements load at different times.

### 3. Capture-Phase Event Hijacking
**Principle:** Use `addEventListener(..., true)` to run before theme's bubble-phase handlers.
**Why:** Capture phase executes before bubble phase. Only way to override theme behavior.
**When:** Theme handlers prevent your code from working.

### 4. Native Handler Neutralization
**Principle:** Remove attributes that theme JS binds to, not just add new listeners.
**Why:** Theme binds by `[data-action]`, `[name]` selectors. Removing attribute kills the handler.
**When:** Theme handlers persist even after adding your own listeners.

### 5. Proxy Button Delegation
**Principle:** Create new UI element that proxies clicks to hidden original button.
**Why:** Original buttons have server-side bindings you cannot replicate in JS.
**When:** Checkout, form submit, or any button with backend logic.

### 6. Lazy Dependency Chain
**Principle:** Check if dependency exists before loading. Chain loads sequentially.
**Why:** Prevents duplicate script loading. Each step is self-contained.
**When:** Multiple libraries that depend on each other (jQuery → Slick).

### 7. Two-Phase Init
**Principle:** Separate DOM structure build from data population.
**Why:** Complex tests need clean separation between "build" and "fill" phases.
**When:** Tests with both DOM restructuring and data synchronization.

### 8. URL Path Gating
**Principle:** Define inclusion/exclusion rules by pathname before `waitForElement`.
**Why:** Saves polling. Self-documents which pages test runs on.
**When:** Test should run on specific page types only.

### 9. Responsive DOM Repositioning
**Principle:** Save original parent in `dataset`, move element on resize, restore on resize back.
**Why:** Some layouts need different DOM order at different breakpoints, not just CSS hide.
**When:** Mobile and desktop need fundamentally different DOM structure.

### 10. Assets Object Pattern
**Principle:** Store repetitive assets (icons, text, selectors, config) in object. Access via lookup function.
**Why:** Single source of truth, DRY enforcement, easy maintenance.
**When:** Icons, text, selectors, or config values repeated across code.

### 11. Block Comment Header
**Principle:** Embed test brief as comment block at file top.
**Why:** New developer reads header and knows: client, pattern, URL, anchor point.
**When:** Always. Every variation.js should start with this.

### 12. Clipboard-Style CSS Naming
**Principle:** Namespace all classes with `eg-<client>-<test>` prefix.
**Why:** Prevents collisions with site CSS. Makes DevTools search trivial.
**When:** Always. Every test follows this naming convention.

---

## 7.3 ADVANCED CSS PATTERNS (From ClientData Analysis)

### 1. Glassmorphism
**Principle:** Use `backdrop-filter: blur()` with semi-transparent background for modern card look.
**Why:** Creates depth and premium feel without heavy shadows.
**When:** Cards, modals, overlays that need modern aesthetic.

### 2. Keyframe Animations
**Principle:** Define `@keyframes` for smooth transitions between states.
**Why:** CSS animations are performant (GPU-accelerated). Better than JS for simple effects.
**When:** Tab switches, content reveal, fade-in effects.

### 3. Horizontal Scroll Mobile
**Principle:** Use `overflow-x: auto` with `-webkit-overflow-scrolling: touch` for mobile navigation.
**Why:** Native touch scrolling. Hide scrollbar for clean look.
**When:** Mobile tab navigation, horizontal menu strips.

### 4. Higher Specificity Selector
**Principle:** Add `html body` prefix to increase selector specificity.
**Why:** Overrides site CSS without `!important`. Clean specificity boost.
**When:** Site CSS is too specific to override with single class.

### 5. User Selection Control
**Principle:** Use `user-select: none` on interactive elements.
**Why:** Prevents accidental text selection on buttons, quantity steppers.
**When:** Quantity buttons, draggable elements, interactive controls.

### 6. Multiple Breakpoints
**Principle:** Use 2-3 breakpoints for progressive enhancement.
**Why:** Different devices need different layouts. Progressive approach is maintainable.
**When:** Complex layouts needing tablet + mobile adaptations.

### 7. Desktop-First Mobile Hide
**Principle:** Use `min-width` for desktop styles, `max-width` with `display: none` for mobile.
**Why:** Desktop-first approach. Completely removes desktop-only features on mobile.
**When:** Features that should not exist on mobile at all.

### 8. Negative Margin Overlap
**Principle:** Use negative margin to create visual overlap between sections.
**Why:** Creates depth and visual hierarchy. Cards appear to float over hero.
**When:** Design requires sections to overlap hero or adjacent sections.

### 9. Flicker Fix
**Principle:** Hide element with `opacity: 0` until JS marks it ready with `.eg-ready` class.
**Why:** Prevents flash of unstyled/empty content (FOUC).
**When:** Elements that need JS to populate content before display.

### 10. BEM Modifiers
**Principle:** Use Block__Element--Modifier naming for component variants.
**Why:** Predictable naming. Easy to understand relationships.
**When:** Multiple variants of same component (primary/secondary CTAs).

### 11. Sticky Sidebar
**Principle:** Use `position: sticky` for sidebars that should stay visible on scroll.
**Why:** Better UX than fixed position. Sticks only when container is in view.
**When:** Cart summary, order details, filter panels.

### 12. Transform Hover
**Principle:** Use `transform: translateY(-1px)` for subtle hover lift effect.
**Why:** GPU-accelerated, performant. Subtle feedback without being distracting.
**When:** CTAs, cards, interactive elements.

### 13. Comment Section Headers
**Principle:** Use decorative comment dividers `/* ── Section ──── */` to organize CSS.
**Why:** Makes CSS scannable. Groups related rules visually.
**When:** Always. Every CSS file should have section headers.

### 14. Letter Spacing
**Principle:** Use `letter-spacing: 0.02em` for subtle text refinement.
**Why:** Improves readability of uppercase or bold text.
**When:** Headlines, urgency text, CTAs.

### 15. Responsive CTA Buttons
**Principle:** Use `flex: 0 1 auto` desktop, `flex: 1 1 100%` mobile for CTAs.
**Why:** Side-by-side on desktop, full-width stacked on mobile.
**When:** CTAs that need different layouts per viewport.

---

## 8. QUICK PATTERNS

| Pattern | Principle | When |
|---|---|---|
| **P1. Image Swap** | Replace src + srcset together, never just src | Hero/product imagery |
| **P2. Insert Section** | `insertAdjacentHTML` + idempotent guard | Add banner/CTA (75% of tests) |
| **P3. Sticky Element** | CSS `position: sticky` + scroll class toggle | Fixed on scroll |
| **P4. DOM Reorder** | `insertAdjacentElement` moves node (events preserved) | Move sections |
| **P5. MutationObserver** | Scope to smallest container + `isRunning` + debounce | SPA re-renders |
| **P6. SPA Routing** | `listener()` captures pushState/replaceState/popstate | Multi-page test |
| **P7. Event Tracking** | `live()` in share.js, never in variation.js for tracking | Click measurement |
| **P8. Form Restructure** | Move fields, never clone inputs | Redesign form |
| **P9. Load Library** | CDN inject + poll (`waitForSlick`) before init | Need slick/jQuery |
| **P10. Text Replacement** | Target leaf elements only, never parent containers | Swap headline/price |
| **P11. URL Gating** | Check `location.pathname` before init | Specific pages only |
| **P12. Viewport Branch** | `window.innerWidth < 767` or `matchMedia` | Mobile vs desktop |
| **P13. XHR Hook** | Hook `XMLHttpRequest.prototype.send`, re-apply on load | Cart/filter re-apply |
| **P14. Cookie Helpers** | `getCookie()` / `setCookie()` for cross-page state | State persistence |
| **P15. Nudge/Urgency** | Real data, near CTA, never fake | Exit intent, countdown |
| **P16. CSS Scope** | `.EG-XXX` prefix, `<2 !important` max | All CSS |
| **P17. Date Math** | Skip weekends, `setInterval` + `Date` for live timers | Business days calc |
| **P18. YouTube Integration** | `extractYoutubeId()` + `mqdefault.jpg` for thumbnails | Video in gallery |
| **P19. CSS Reorder** | `order: -1` in flex — visual only, DOM unchanged | Visual only reorder |
| **P20. ScrollSpy** | `getBoundingClientRect()` + `isClickScrolling` + rAF throttle | Sticky nav highlight |

---

## 9. TEST TYPES — Principles

### Redesign
- Hide original CSS, build new HTML, wire existing functionality
- Never remove original DOM, only hide with CSS

### CTA Test
- Find all CTAs, replace text/style, track clicks
- Use `live()` for dynamic CTAs

### Trust/Social Proof
- Add badges/reviews near conversion point
- Real data only, never fabricated

### Sticky CTA
- Create fixed CTA, show after scroll, preserve original
- `position: sticky` preferred over `fixed`

### Navigation
- Inject nav items, handle mobile separately, sync active state
- Mobile nav = different implementation than desktop

### Form Optimization
- Shorten forms, add defaults, split into steps
- Never clone inputs, move them

### Urgency
- Real dates, near CTA, never fake
- Cookie-gated to persist across loads

### Content Reorder
- Move sections above fold, CSS `order` preferred over JS reorder
- DOM order unchanged = screen readers safe

---

## 10. CRO PRINCIPLES

| Principle | Tactics |
|---|---|
| **Reduce Anxiety** | Trust badges near CTAs, money-back guarantee, payment icons |
| **Social Proof** | Review counts, star ratings, "BEST SELLER" badges |
| **Progressive Disclosure** | Show essential first, reveal more after engagement |
| **Urgency/Scarcity** | Real dates, "Only X left", countdown timers |
| **Clear Value Prop** | Benefit-first headlines, bullet points, price anchoring |
| **Reduce Friction** | Sticky CTAs on mobile, express checkout, auto-fill |

---

## 11. PLATFORM NOTES

### Shopify
- Cart API: `/cart/add.js`, variants via URL handle
- Always check `Shopify` object exists before using

### React/Next.js
- MutationObserver essential for dynamic content
- `stopPropagation` on injected elements to prevent framework interference

### Shopware 6
- Offcanvas nav clones DOM — watch for duplicate elements
- Use CAPTURE-phase events for offcanvas interactions
- tiny-slider instead of Slick

### BigCommerce
- Cart via `data-cart` attribute
- CSRF token via `BCData` object

### Salesforce
- Slick carousel common
- `$pdpflexf2$` image params for image swapping
- Skip `.slick-cloned` elements

### WordPress/Elementor
- Body class-based testing preferred
- CSS-only variations fastest to implement

---

## 12. COMMON MISTAKES → PRINCIPLES

| Mistake | Principle |
|---|---|
| No duplicate guard | Always `if (el.querySelector('.eg-*')) return` before insert |
| `innerHTML =` | Never use — use `insertAdjacentHTML` to preserve existing DOM |
| Unscoped CSS | Always scope under `.EG-XXX`, max 2 `!important` |
| Observer on body | Scope to smallest container, never `document.body` |
| No debounce | Always debounce MO with `isRunning` flag + 200ms |
| Hardcoded data | Read from DOM/API, never hardcode dates/prices |
| Ignoring mobile | Always test mobile, use `innerWidth < 767` branch |
| jQuery without wait | Always `waitForSlick()` or poll `window.jQuery` before use |
| Double init | Use either `load` OR `waitForElement`, never both |
| indexOf without check | `indexOf('/blog')` returns -1 (truthy!) — use `includes()` |
| External image hosting | Never use ibb.co — use CDN or local assets |
| Clear + re-append loop | Avoid — self-triggers MutationObserver |

---

## 13. CODEBASE STATS

- **Total Tests:** 4,340+ variation.js files
- **Total Clients:** 300+
- **Top Clients:** ALTIUM (337), BETASHARES (146), OCTO_PART (140), NEW BALANCE (138), HSBC (118), BRIT_BOX (105), THE_SPANISH_GROUP (99), REGUS (90), VACATION (88), AIRDOCTORPRO (88)

### Top Techniques (Audit 4344 tests, 2026-09-01)

| # | Technique | Usage |
|---|-----------|-------|
| 1 | `waitForElement` + polling | 97.5% |
| 2 | `querySelector` / DOM access | 99.4% |
| 3 | `insertAdjacentHTML/Element` | 75.3% |
| 4 | `classList.add` / CSS class injection | 68.4% |
| 5 | `live()` delegated events | 28.7% var / 95.8% share.js |
| 6 | Sticky elements | 12.9% |
| 7 | Cookie get/set/delete | 4.3% |
| 8 | Slick/Carousel loading | 5.4% slick / 21.7% CDN |
| 9 | XHR/Fetch hooks | 11.2% |
| 10 | MutationObserver | 8.6% |

---

## 14. MOST COMMON TEST TYPES — Principles

### 1. DOM Insertion (sticky banners, trust badges, promo bars)
- Use `insertAdjacentHTML` not `innerHTML`
- Always check `.eg-*` exists before inserting (idempotent)

### 2. CSS-Only Tests (class toggle)
- JS adds body class, all changes in CSS via `.EG-TEST-ID .element`
- Fastest to build, no DOM mutation

### 3. CSS-Only Reorder (visual only)
- CSS `display: flex` + `order` property reorders visually
- Safer than JS reorder — no event listener breakage
- DOM order unchanged, screen readers follow DOM

### 4. Sticky Elements (headers, ATC, filters, CTAs)
- `position: sticky; top: 0` in CSS
- JS adds class on scroll threshold

### 5. ScrollSpy — Sticky Jump-Links Auto-Highlight
- Use `getBoundingClientRect()` not `offsetTop`
- `isClickScrolling` flag + `rAF` throttle

### 6. Popup/Modal (exit intent, promo, upsell)
- Cookie-gated (show once per session/day)
- `mouseout` for desktop exit intent, scroll threshold for mobile

### 7. Carousel/Slick
- Load jQuery + Slick from CDN
- `waitForSlick()` polling before init
- `slidesToShow` with decimals for peek effect (e.g. `2.9`)

### 8. Fetch + DOMParser (minicart, cross-sell)
- Fetch another page, parse HTML, extract elements
- Used for: minicart rebuild, cross-sell from cart page

### 9. Countdown Timers
- Set end time, update DOM every second
- Cookie-gated to persist across page loads

### 10. Price Calculations
- Read `data-price-amount` attribute
- Calculate discount %, savings, monthly payments
- Insert formatted message

---

## 15. share.js PURPOSE

### Core Rules
- **No DOM mutation** — only tracking
- `live()` for delegated click events
- `gtag()` or `utag.track()` for analytics
- Cookie read/write for cross-page state
- `waitForElement('html body', init, 50, 15000)` always
- Guard with class check: `if(document.querySelector('.' + variation_name)) return;`

### Advanced Principles

#### 1. Document-Level Delegation
- Single `document.addEventListener('click', ...)` filters by `e.target.closest()`
- One listener vs. per-element binding for multiple similar elements

#### 2. Read Adjacent State
- Enrich tracking payload with user context (quantity, selected option)
- Read from DOM before tracking the click event

#### 3. Goal in Selector
- CSS selector encodes the conversion action
- `live('a[href*="/account/signup"]', 'click', ...)` — selector IS the goal

#### 4. Compact wait()
- Lightweight 4-line alternative for simple tracking
- Simpler than full `waitForElement` when share.js has minimal init logic

#### 5. Debug Flag
- `debug = 0` for production (silent), `debug = 1` for development (logs)
- Always gate error logging with debug check

#### 6. Variation Name as Log Prefix
- `if (debug) console.log(v + ': Tab clicked — ' + tabName);`
- Makes DevTools filtering trivial by variation name

#### 7. live() as Mandatory Boilerplate
- Include `live()` in every share.js even if not used yet
- Supports future tracking additions without modifying scaffold

---

## 16. ANTI-PATTERNS — From 90+ Test Analysis (2023)

### Fragile Selectors
- **Never use nth-child chains** — `div:nth-child(7) > div:nth-child(2) > div:nth-child(1)` breaks on any CMS change
- **Prefer data attributes** — `[data-section="hero"]` over `:nth-child(3)`
- **Avoid deep CSS paths** — max 3 levels, use classes with `eg-` prefix

### Hardcoded Data
- **Never hardcode dates** — `new Date('February 2 2023')` permanently expires
- **Read from DOM** — prices, dates, counts should come from page elements
- **Use data attributes** — `<span data-price="29.99">` for reliable extraction

### Empty Stubs
- **Check init() body** — 8+ tests had empty `init()` — never completed
- **Verify file exists** — some variation.js files are placeholders

### Console.log in Production
- **Never leave console.log** — 10+ tests had only `console.log` for tracking
- **Use gtag/utag** — actual analytics integration required

---

## 17. SECURITY ISSUES — From 90+ Test Analysis

### eval() Usage
- **Never use eval()** — Moorings used `eval()` for filtering — XSS vector
- **Use object lookup** — `{key: value}` mapping instead of dynamic code execution

### InnerHTML with User Input
- **Never innerHTML with UTM params** — Athena injected `utm_content` via `.innerHTML`
- **Use textContent** — sanitizes input automatically

### Plaintext Credentials
- **Never send credentials raw** — OCTO_PART sent email/password in plaintext fetch()
- **Always HTTPS** — and use proper auth headers

### Third-Party Dependencies
- **Always have fallback** — ipinfo.io, sitetunershosting.com, CDN URLs
- **Check if service deprecated** — JSONP, old APIs may stop working

---

## 18. PERFORMANCE ISSUES — From 90+ Test Analysis

### setInterval Never Cleared
- **Always clearInterval** — OCTO_PART HIVE-239 ran setInterval forever
- **Clear on navigation** — SPA route changes should stop intervals

### XHR Wrapper Never Restored
- **Save original** — `var orig = XMLHttpRequest.prototype.send`
- **Restore on cleanup** — `XMLHttpRequest.prototype.send = orig`

### Multiple waitForElement Racing
- **Sequence calls** — parallel waitForElement can fire out of order
- **Use single init** — one waitForElement triggers all logic

### Scroll Listener No Debounce
- **Always debounce** — EASY_OFFICES fired every pixel
- **Use requestAnimationFrame** — for smooth scroll handling

### innerHTML on Timer
- **Use textContent** — Moorings countdown used innerHTML every second
- **textContent is faster** — no HTML parsing overhead

---

## 19. ACCESSIBILITY ISSUES — From 90+ Test Analysis

### removeAttribute('href')
- **Never remove href** — ALLIANT broke keyboard navigation
- **Use aria-disabled** — keeps element focusable

### innerText Without ARIA
- **Update aria-label** — when changing visible text
- **Screen readers need** — both visible and programmatic labels

### No Focus Management
- **Trap focus in modals** — popup injected without focus trap
- **Return focus on close** — when popup dismisses

### Color-Only Indicators
- **Add text/icon alternative** — color alone not accessible
- **Use aria-label** — for state communication

---

## 20. PLATFORM QUIRKS — From 90+ Test Analysis

### Shopify
- `cart?view=contents` for side-cart HTML — but markup changes break injected content
- `Shopify.addItem` needs quantity as string `'1'` not number
- Cart API endpoints: `cart.js`, `discount-on-cart-pro`, `cart?view=contents`

### Next.js
- `#__next` selector needed for body class injection
- SPA routing requires pushState override
- React state needs proxy-click to stay in sync

### React
- Proxy-click needed — click new element → triggers original label click
- DOM changes don't update React state — need programmatic events
- `stopPropagation` on injected elements prevents framework interference

### Demandware
- Different selectors for legacy vs React pages — dual codebase needed
- `data-component` attributes for React sections
- `.page-header` vs `.react-header` depending on architecture

### Marketo
- Forms need `MktoForms2.whenReady()` wait chain
- Not just jQuery — separate Marketo API load required
- Form IDs change per locale — use mapping object

---

## 21. COMMON BUGS — From 90+ Test Analysis

### indexOf Truthy Bug
```js
// WRONG — indexOf returns -1 (truthy!), ! makes it false, !== -1 always false
if (!window.location.href.indexOf("search") !== -1) { ... }

// CORRECT
if (window.location.href.indexOf("search") !== -1) { ... }
// OR
if (window.location.href.includes("search")) { ... }
```

### Missing Dot in QuerySelector
```js
// WRONG — selects <eg-moved-ele> tag, not .eg-moved-ele class
document.querySelector("eg-moved-ele")

// CORRECT
document.querySelector(".eg-moved-ele")
```

### Live Function Shadowed
- Inner `live()` shadows outer — confusing but works
- Name inner function differently: `delegateEvent()`

### Dead Code Paths
- `getPDPData()` never defined — fallback never works
- `getEstTime()` defined but never called
- Verify all referenced functions exist

### Duplicate HTML IDs
- **Invalid HTML** — `id="egCost"` used 8 times
- **Use classes** — `eg-cost-value` instead

---

## 22. BUSINESS LOGIC LEARNINGS — From 90+ Test Analysis

### Price Calculations Need Rollback
- Remove custom prices when discount disappears
- Use state marker class: `eg-original-changed`
- Check `savedPrice` null before removing

### Cart Interception Needs Endpoint Awareness
- Different endpoints: `cart.js`, `discount-on-cart-pro`, `cart?view=contents`
- Each returns different HTML structure
- Parse accordingly

### Locale Affects URL Structure
- `/cn/` vs `/hk/` vs `/sg/` — different paths
- Use locale mapping object with fallback
- Check `<html lang>` attribute for language

### Login State Changes DOM
- Logged-in users see different nav elements
- Detect via sign-out link selector
- Inject different content per state

### SPA Navigation Needs Cleanup
- Classes/elements persist after route change
- Remove classes on non-matching paths
- Disconnect observers on navigation

---

## 23. NEW PATTERNS — From 2023 Test Analysis

### P21. Locale Branching
- Check URL path for locale: `/cn/`, `/hk/`, `/sg/`
- Different content per locale, same test
- Use locale mapping object

### P22. GeoIP Detection
- `$.get("ipinfo.io")` for country detection
- Add body class per country: `eg-usa`, `eg-uk`
- Fallback if API fails

### P23. Multi-Step Form Wizard
- Cache form elements in JS vars
- Swap forms based on user selection
- Marketo integration with `loadForm()`

### P24. Drupal AJAX Detection
- Poll for `.ajax-progress.ajax-progress-fullscreen`
- Re-run init after AJAX completes
- Handle dynamic content reloads

### P25. XHR Cross-Page Extraction
- Fetch another page via XHR
- Parse with DOMParser
- Extract specific element and inject

### P26. URL Query-String Stripping
- Use `new URL(href)` + `.replace(url.search, '')`
- Clean tracking params from links
- Preserve path and hash

### P27. UTM Content Mapping
- Parse `utm_content` from URL
- Replace underscores with spaces
- Inject as headline/content

### P28. Proxy-Click Filter Bridge
- Build parallel UI
- Map clicks to original filter labels
- Keep React state in sync

### P29. Attribute-Driven Metric Switcher
- Switch `data-metric` attribute
- Page JS re-renders against new value
- Not just visual swap

### P30. Scroll-Threshold DOM Relocation
- Move nodes between DOM parents
- Based on scroll position
- Not CSS sticky — actual migration

### P31. CDN Carousel Injection
- Load Slick/Swiper/Owl from CDN
- Wait for plugin readiness
- Retrofit existing DOM elements

### P32. history.pushState SPA Interception
- Override pushState/replaceState
- Dispatch custom `locationchange` event
- Re-apply logic on route change

### P33. MutationObserver Card Replacement
- Observe carousel/filter indicators
- Trigger content swap on change
- Watch `characterData` or `disabled` attribute

### P34. fetch() Interception
- Monkey-patch `window.fetch`
- Detect specific API calls
- Re-apply DOM modifications after

### P35. Dual Codebase Adaptation
- Handle legacy + React selectors
- Same file, different init functions
- Detect via element presence

### P36. Login-State-Aware DOM
- Detect logged-in via sign-out link
- Inject different content per state
- Handle nav changes

### P37. Out-of-Stock API Check
- Fire XHR per SKU to availability endpoint
- Mark unavailable items in dropdown
- Salesforce OCAPI integration

### P38. Cross-Page localStorage
- Store recently-viewed in localStorage
- Read back on homepage
- Show "Recently Viewed" card

### P39. Cart-Abandonment Popup
- Read localStorage for charter data
- Show "Still Interested?" popup
- Cookie-gated after dismiss

### P40. Locale-Branched Copy
- Read `<html lang>` attribute
- Select translated copy
- Fallback to English

### P41. Timezone-Adjusted Countdown
- Convert local time to fixed offset
- Handle DST properly
- Use `getTimezoneOffset()`

### P42. Checkout Progress Bar
- Modify step text based on URL
- Add `eg-active` class
- Handle multi-step flows

### P43. Bidirectional Scroll DOM Relocation
- Move nodes on scroll past threshold
- Move back on scroll up
- Not clone — actual migration

### P44. Distributor-Name-Driven Injection
- Read anchor text to identify distributor
- Inject different content per distributor
- Case-sensitive matching

### P45. Tab Section Visibility Switcher
- Inject tab UI
- Show/hide sections by class toggle
- Update links to match active tab

### P46. Responsive Picture Injection
- Inject `<picture>` with `<source>` elements
- Viewport-based srcset
- No JS required for responsive images

---

## 24. MORE PATTERNS — From 2023 Test Analysis (Part 2)

### P47. Live Event Delegation Polyfill
- Bubbling-based delegated event binding
- IE8 `attachEvent` + `matches` polyfill fallback
- Different from simple `addEventListener` on static elements

### P48. Step Renumbering
- Rewrite checkout step numbers in-place
- Change "Step 3" to "Step 2" for custom flows
- DOM text replacement on step indicators

### P49. Multi-Page Conditional Init
- Single variation file handles multiple page types
- Different selectors and insertion points per page
- Branched at `waitForElement` call and inside `init()`

### P50. Global SVG Asset Preloading
- Store SVG markup as `window.egTruck`, `window.egDocument`
- `waitForElement` checks existence before triggering init
- Ensures async-loaded assets are ready

### P51. Inline SVG Icon Injection
- Full SVG markup embedded as JS strings
- Different from P50's preloading — inline in template literals
- Used for nav icons, trust badges

### P52. Cross-Page URL Parameter Propagation
- Append `&egSameDay` to link href on page 1
- Read `window.location.search` on page 2
- Trigger preselection based on param

### P53. Programmatic Option Preselection
- `setTimeout` + `.click()` on specific `li` element
- Auto-select radio-like option
- Simulates user interaction

### P54. Desktop-Only Viewport Gate
- Wrap entire init in `if(window.innerWidth > 1024)`
- Different from CSS media queries — JS-level gating
- Mobile users get no injection

### P55. Inline POST Form Injection
- Inject `<form action="..." method="POST">` directly
- Form submission bypasses JS redirect
- Server-side submission handling

### P56. Inline Email Regex Validation
- Standalone `validateEmail()` with hardcoded regex
- Not using HTML5 `type="email"` validation
- Client-only validation before submit

### P57. Cart Free-Shipping Threshold Progress Meter
- Read cart total, compare to threshold
- Insert visual meter bar with `translateX(-XX%)`
- Update on every cart mutation (ADD/REMOVE/BAG)
- Different from Checkout progress bar (step tracking)

### P58. External Carousel Library Inject + reInit
- Load carousel from CDN (Embla, Slick, Swiper)
- Inject new slide + thumbnail + dot at position
- Call `embla.reInit()` to update carousel

### P59. Client-Side Product Page HTML Scrape
- Maintain static `{PRODUCT_NAME: {url, id}}` mapping
- Fetch each product's full page HTML via `fetch()`
- Parse response, extract name/price/image
- Render cross-sell cards from scraped data

### P60. Client-Side Product Search Autocomplete
- Hardcoded array of product objects with `keyWord`
- Substring match of query against `keyWord`
- Render matching products as suggestion dropdown
- No API call — fully client-side

### P61. Programmatic Quantity Button Click-Simulation
- Click Decrease button N times to reset
- Click Increase button (N-1) times to reach qty
- Auto-submit form after quantity set
- Controls quantity via synthetic clicks, not input value

### P62. Shadow DOM Piercing
- Access `element.shadowRoot` to reach inner elements
- Programmatically click links inside shadow DOM
- Fragile if component structure changes

### P63. iframe Pointer-Events Override
- `setInterval` polls and rewrites inline styles on iframe
- Force `pointer-events: all` on third-party iframe
- Never cleared — memory leak risk

### P64. XHR.prototype.send Monkey-Patching
- Wrap native `XMLHttpRequest.prototype.send`
- Intercept responses by URL pattern
- Different from `fetch()` interception — lower level

### P65. Client-Side Discount % Computation
- Read `content` attribute from price elements
- Compute `((list - selling) / list) * 100`
- Inject as `(${pct}% off)`

### P66. Order History Reorder Button Injection
- Fetch PDP pages from order history item links
- Extract add-to-cart button
- Inject as "Reorder" CTA on each order item

### P67. 404 Graceful Degradation
- Handle discontinued products
- Inject disabled CTA with lock icon
- Prevent crash on missing product data

### P68. Mouse-Exit Intent Detection
- `document.addEventListener("mouseout")` with `e.toElement == null`
- Detect cursor leaving viewport
- Trigger exit-intent popup

### P69. Scroll-to-Bottom Popup Trigger
- `scrollY + innerHeight + 50 >= offsetHeight`
- Mobile alternative to exit-intent
- Trigger popup when user scrolls near bottom

### P70. #__NEXT_DATA__ JSON Parsing
- `JSON.parse(document.querySelector("#__NEXT_DATA__").innerHTML)`
- Extract Next.js SSR hydration data
- Access anti-forgery tokens, phone configs, country codes

### P71. CSRF/XSRF Token Extraction
- Read `x-requestverificationtoken` from page
- Use in API submission headers
- Required for form POST requests

### P72. Custom locationchange Event
- Override `history.pushState`/`replaceState`
- Dispatch custom `locationchange` event
- Unified SPA route change detection

### P73. window.dispatchEvent resize
- Force resize event after dynamic content insertion
- Trigger library recalculation (Swiper, carousel)
- `window.dispatchEvent(new Event('resize'))`

### P74. waitForSwiper Polling
- `setInterval` polling `typeof Swiper != "undefined"`
- Wait for async CDN script load
- Initialize after library ready

### P75. clickOnce Debounce Flag
- Boolean flag prevents duplicate event binding
- `live()` binding only registered once
- Prevents ghost listeners on re-init

### P76. Dynamic href Rewriting with Regex
- `url.replace('/get-a-quote', '/arrange-a-centre-tour')`
- Programmatic CTA URL transformation
- Based on solution type or locale

### P77. Solution-Type Branching for CTA Labels
- Read dropdown text ("Meeting rooms", "Virtual Offices")
- Dynamically change button text and URLs
- Different CTAs per solution type

### P78. getQueryParams URL Parser
- Manual query string parsing
- Extract `locationid`, `locationname`, `ws` params
- Use in URL construction

### P79. localStorage + Cookie Dual Tracking
- `localStorage.setItem(pageIdentifier, 'visited')`
- Cookie `pageVisitsCount` for visit counting
- Cross-tab dedup via localStorage

### P80. Country Data as Inline JSON Array
- 200+ country entries with dial codes, flag CSS, ISO codes
- Full intl phone input data embedded in JS
- Used for phone number formatting

### P81. CSS Custom Properties Set via JS
- `style.cssText = '--width:' + tabWidth + 'px'`
- Drive CSS animations/positioning from JS
- Modern approach to dynamic styling

### P82. Inline JS in HTML Strings (CSP Issue)
- `onmouseenter="..."` in template literals
- Breaks CSP with `script-src` without `unsafe-inline`
- Avoid inline event handlers

---

## 25. MORE PATTERNS — From 2023 Test Analysis (Part 3)

### P83. window.availableDays Global Polling
- Wait for externally-defined global JS variable
- Build date data from global object
- Different from API fetch — data already on page

### P84. Date Computation + State Object
- Parse dates, aggregate counts by month
- Update HTML reactively from state
- `egAvailableDates` pattern for calendar UI

### P85. isInViewport() + isElementAtBottom() Utility
- Custom viewport/scroll-position detection
- NOT using IntersectionObserver
- Manual `getBoundingClientRect()` checks

### P86. getLastWordFromPath() Helper
- URL path parser extracts last segment
- Use for dynamic link construction
- `pathname.split('/').pop()`

### P87. Conditional setTimeout Before init()
- Deliberate delay after element is found
- `setTimeout(function(){ init() }, 5000)`
- Wait for third-party scripts to settle

### P88. Intl.NumberFormat Currency Localization
- `new Intl.NumberFormat('en-AU', {style: 'currency', currency: 'AUD'})`
- Format prices per locale
- Different from hardcoded `$` symbols

### P89. Nested waitForElement Calls (3-level chain)
- Sequential waitForElement for multiple elements
- Callback hell from deep nesting
- Consider Promise.all instead

### P90. Scroll-Based Auto-Close (wheel event)
- `wheel` event closes filter dropdowns
- Auto-close when user scrolls past sidebar
- Different from click-outside detection

### P91. detectClickOutside Helper
- Body-level mousedown listener
- `!element.contains(event.target)` check
- Close dropdowns/popups on outside click

### P92. Idle Time Detection
- `setInterval(timerIncrement, 1000)` with event reset
- Mouse/keypress/touchmove resets `idleTime` to 0
- Trigger popup after N seconds of inactivity

### P93. sessionStorage One-Shot Popup
- Show popup only once per session
- `sessionStorage.setItem('shown', 'true')`
- Different from cookie — tab-specific

### P94. Responsive Popup Re-Parenting
- Create desktop/mobile popup dynamically
- Re-parent on `resize` event
- Different content placement per viewport

### P95. DOM Node Reordering (move existing)
- `insertAdjacentElement("beforebegin", nameEl)`
- Move existing element to new position
- Not injection — actual DOM migration

### P96. Cross-Page Content Scraping via XHR
- Fetch another page's HTML
- Extract specific content
- Different from P59 — uses XHR not fetch()

### P97. MutationObserver for Calendar Re-Render
- Watch for DOM mutations
- Re-render content dynamically
- Used for date picker updates

### P98. Exit Intent Popup on Checkout
- `mouseleave` + focus guard on inputs/selects
- Prevent popup during form interaction
- Different from P68 — adds focus guard

### P99. Form Submit Proxy
- Programmatically click real submit button
- Per checkout step
- Different from direct form.submit()

### P100. window.availableDays + MutationObserver
- Combine global variable polling with MO
- Wait for data + DOM readiness
- Robust initialization pattern

---

*Last updated: September 2026*