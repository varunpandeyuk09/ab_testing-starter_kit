# CRO Brain — Learned Memory

> This file is the "brain" built from analyzing 100+ AB tests across multiple clients.
> It captures APPROACHES, PATTERNS, LEARNINGS, and WARNINGS from past work.

---

## HOW TO USE THIS FILE

When building a new test, reference this file for:
1. **What approach worked** for similar test types
2. **What patterns to use** (waitForElement, MutationObserver, etc.)
3. **What pitfalls to avoid** from past mistakes
4. **What selectors worked** on similar platforms

---

## SECTION 1: TEST TYPES & APPROACHES

### 1.1 Redesign Tests (Full Page / Section)

**When to use:** Complete page or section overhaul with new layout, content, and CTAs.

**Approach:**
1. Hide original elements via CSS (body class toggle)
2. Build new HTML structure with `insertAdjacentHTML`
3. Wire up existing functionality (ATC, checkout, forms)
4. Preserve all event listeners and AJAX calls

**Key Learnings:**
- NEVER break existing functionality (cart, checkout, forms)
- Use `insertAdjacentHTML` not `innerHTML` (preserves existing DOM)
- Always add duplicate prevention check (`!document.querySelector('.eg-xxx')`)
- Test mobile, tablet, desktop separately
- For SPAs, use MutationObserver to re-inject after framework re-renders

**Example Tests:** LE PINE FUNERALS Homepage, SIMPLICITY FUNERALS Homepage, THELIGHTSFEST Events Page

---

### 1.2 CTA Tests (Button Text, Color, Placement)

**When to use:** Testing different CTA messaging, styling, or positioning.

**Approach:**
1. Find all CTA elements with `querySelectorAll`
2. Replace text/styling with variation
3. Track clicks on new CTAs

**Key Learnings:**
- Risk-reversal CTAs ("Try Free - No Card Required") are highest-ROI tests
- Dual CTAs (primary + secondary) give users choice
- CTA proximity to trust signals matters
- Mobile CTAs need larger touch targets

**Example Tests:** ALTIUM TS-2524 (Risk-reversal CTA), ALTIUM TS-2532 (Consultative CTA)

---

### 1.3 Trust/Social Proof Tests

**When to use:** Adding trust badges, reviews, logos, or social proof near conversion points.

**Approach:**
1. Identify conversion point (CTA, form, checkout)
2. Add trust element nearby (badges, reviews, logos, guarantees)
3. Measure impact on conversion

**Key Learnings:**
- Trust near CTA > Trust far from CTA
- Specific numbers ("1,000+ reviews") > Vague claims ("Trusted by many")
- Linking to real review sites (G2, Capterra) adds credibility
- Google rating with click-to-scroll is powerful
- Payment icons reduce checkout anxiety
- Warranty/guarantee badges reduce purchase hesitation

**Example Tests:** ALTIUM TS-2533 (Trust Pill), SCRAPE ARMOR (Best Seller + Warranty), DEKRA AB04 (Dynamic Trust)

---

### 1.4 Sticky/Floating CTA Tests

**When to use:** Long pages where users may not reach the bottom CTA.

**Approach:**
1. Create sticky/fixed position CTA element
2. Show/hide based on scroll position
3. Preserve original CTA functionality

**Key Learnings:**
- Show after user scrolls past hero (not immediately)
- Hide on scroll down, show on scroll up (less intrusive)
- Mobile sticky ATC is essential for conversion
- Size gating (check if size selected before adding to cart) prevents errors
- Always test timing — too early = annoying, too late = missed opportunity

**Example Tests:** ALTIUM TS-2193 (Floating CTA), NEW BALANCE Sticky ATC, DRSEBISCELLFOOD Sticky CTA

---

### 1.5 Navigation Tests

**When to use:** Adding/modifying navigation items, mega menus, or mobile nav.

**Approach:**
1. Identify navigation container
2. Inject new items with proper styling
3. Handle mobile offcanvas separately
4. Sync active states with current URL

**Key Learnings:**
- Desktop and mobile navs are separate DOM structures
- Shopware offcanvas nav clones DOM — must handle multiple containers
- Capture-phase event listeners bypass stopPropagation
- Anti-overwrite MutationObserver needed for SPA frameworks
- Active state must sync with URL path

**Example Tests:** AWG AB043 (Desktop Nav), AWG AB042 (Mobile Nav)

---

### 1.6 Form Optimization Tests

**When to use:** Improving form conversion (shorter forms, better labels, validation).

**Approach:**
1. Identify friction points (too many fields, confusing labels)
2. Modify form structure (hide fields, add defaults, split into steps)
3. Preserve submission functionality

**Key Learnings:**
- Two-step forms reduce perceived complexity
- Hiding non-essential fields (with default values) reduces friction
- Auto-submit defaults for hidden fields
- Progressive disclosure (show more options after core inputs)
- Step indicators set user expectations
- Form preloading eliminates modal load delay

**Example Tests:** SWINBURNE Contact Form, LINCOLN HERITAGE License Question, CENTRUM24 Account Opening

---

### 1.7 Urgency/Social Proof Tests

**When to use:** Adding urgency messaging, stock indicators, or social proof.

**Approach:**
1. Add urgency element near conversion point
2. Use real data (dates, stock levels) not fake data
3. Rotate/alternate visibility to prevent blindness

**Key Learnings:**
- Real dates create authentic urgency
- "Only X left" works for low-stock items
- "X people viewed this today" creates FOMO
- Alternating visibility (odd/even visits) prevents banner blindness
- Urgency near CTA > Urgency far from CTA
- Never fake urgency — erodes trust permanently

**Example Tests:** SITETUNERS Urgency Messaging, AWG AB020 (Social Proof), G-STAR Trending Badge

---

### 1.8 Content Reordering Tests

**When to use:** Moving existing sections higher/lower in page hierarchy.

**Approach:**
1. Identify element to move
2. Use `insertAdjacentElement` to relocate
3. Test different positions

**Key Learnings:**
- Moving content above the fold increases visibility
- "What's included" near purchase decision increases conversion
- Policies/trust info higher reduces scroll-for-reassurance
- Media/testimonials above fold builds immediate trust
- CSS-only reordering via body class is most performant

**Example Tests:** DUBLINMATHS Section Reorder, PCLIQUIDATIONS Policy Visibility, H&R BLOCK OTE Reorder

---

### 1.9 PDP Model Sizing & Gallery Enhancement (NEW BALANCE Test 22.3)

**When to use:** Apparel PDPs where model height/size info exists in DOM (`img[data-modelinfo]`) and gallery needs premium feel on desktop.

**Approach:**
1. Parse `img[data-modelinfo]` via `textarea` decode + regex (`/size\s+([A-Z0-9]+)/i`, `/(\d+'\d+")\/(\d+cm)/`) → short text `Model is X and wears a size Y` (fallback: first sentence ≤80 chars)
2. Inject overlay badge `.eg-model-badge` absolutely bottom-center on `.item-content` / `button` wrapper — desktop: **1st valid image only**, mobile (`<768`): **all valid images** (skip `.slick-cloned`)
3. (V2 only, desktop `>1199`): Boost image resolution (`$pdpflexf2$` → `$pdpflexf2MD2x$`, `wid/hei=1026`), strip `<picture><source>`, re-init `#imageGallery #imageGalleryInner` as slick with custom arrows + slide counter, handle SPA via `MutationObserver`

**Key Learnings:**
- Never use `clearBadges() + re-append` — use per-target `:scope > .eg-badge` check to avoid self-trigger loop (see 2.4/4.11)
- Slick clones must be skipped or badge appears 3x
- `data-modelinfo` may contain HTML entities — decode via `textarea.innerHTML` before regex
- Image quality boost must remove `<source>` else browser keeps 440px variant
- `unslick` before `slick()` essential — else duplicate arrows/counters
- Slide counter via `slick('getSlick').slideCount` + `afterChange` event (namespace `.egCounter`)
- Responsive: desktop 14px, mobile 10px, `position:relative` on wrapper required

**Example Tests:** NEW BALANCE Test 22.3 V1 (badge only), V2 (badge + desktop gallery slick rebuild)

---

## SECTION 2: TECHNICAL PATTERNS

### 2.1 Universal Helper: waitForElement

```javascript
function waitForElement(selector, trigger, delayInterval, delayTimeout) {
  var interval = setInterval(function () {
    if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
      clearInterval(interval);
      trigger();
    }
  }, delayInterval);
  setTimeout(function () {
    clearInterval(interval);
  }, delayTimeout);
}
```

**Usage:** Every test uses this. Always include timeout to prevent infinite polling.

---

### 2.2 Universal Helper: live() Event Delegation

```javascript
function live(selector, event, callback, context) {
  function addEvent(el, type, handler) {
    if (el.attachEvent) el.attachEvent('on' + type, handler);
    else el.addEventListener(type, handler);
  }
  this.Element && (function (ElementPrototype) {
    ElementPrototype.matches = ElementPrototype.matches || ElementPrototype.matchesSelector || ...
  })(Element.prototype);
  function live(selector, event, callback, context) {
    addEvent(context || document, event, function (e) {
      var found, el = e.target || e.srcElement;
      while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
      if (found) callback.call(el, e);
    });
  }
  live(selector, event, callback, context);
}
```

**Usage:** For dynamically injected elements. Essential for React/SPA sites.

---

### 2.3 SPA Navigation Detection

```javascript
function listener() {
  window.addEventListener("locationchange", function () {
    waitForElement('body', init, 1000, 15000);
  });
  history.pushState = ((f) => function pushState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event("pushstate"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  })(history.pushState);
  history.replaceState = ((f) => function replaceState() {
    var ret = f.apply(this, arguments);
    window.dispatchEvent(new Event("replacestate"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  })(history.replaceState);
  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("locationchange"));
  });
}
```

**Usage:** React/Vue/Next.js sites that use client-side navigation.

---

### 2.4 MutationObserver for Dynamic Content

```javascript
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.addedNodes.length) {
      // Re-inject content
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });
```

**Usage:** When framework re-renders DOM and removes injected content.

**Gotcha — Self-Trigger Loop (NEW BALANCE Test 22.3, Sep 2026):**
- `clearBadges() + appendChild()` inside `inject()` itself fires `addedNodes` → observer re-triggers → 120ms debounce still causes rapid remove/add churn (visually 1 badge, DOM thrashing on mobile).
- **Fix:** (1) Use `isInjecting` flag + per-target idempotent check (`:scope > .eg-badge` + `textContent` compare) instead of `clear + re-add`, (2) Ignore own mutations (`target.closest('.eg-*')` + `onlyBadge` filter), (3) Scope `observe()` to smallest container (`#mainImageCarouselComponent` not `main`), (4) Remove `src` from `attributeFilter` (slick lazy-load triggers endlessly) — keep only `data-*`.

---

### 2.5 XHR/Fetch Interception

```javascript
var originalSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function () {
  this.addEventListener('load', function () {
    if (this.responseURL.includes('/cart')) {
      // Re-inject cart content
    }
  });
  return originalSend.apply(this, arguments);
};
```

**Usage:** Monitoring AJAX calls for cart updates, form submissions, etc.

---

### 2.6 Cookie-Based State Persistence

```javascript
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
```

**Usage:** Cross-page state for multi-step tests, variant persistence.

---

### 2.7 Body Class as CSS Trigger

```javascript
document.body.classList.add('EG-TEST-NAME');
```

```css
.EG-TEST-NAME .original-element { display: none; }
.EG-TEST-NAME .new-element { display: block; }
```

**Usage:** Most performant approach. JS adds class, CSS handles all visual changes.

---

### 2.8 Slick Re-init & High-Res Image Boost (NEW BALANCE Test 22.3 V2)

```javascript
// 1. Boost URL: Salesforce $pdpflexf2$ params
function boostResolution(url){
  return url.replace(/\$pdpflexf2\$/g,'$pdpflexf2MD2x$').replace(/wid=\d+/g,'wid=1026').replace(/hei=\d+/g,'hei=1026');
}
// 2. Strip <source> then set high-res on img
$carousel.find('picture source').remove();
$img.removeAttr('srcset data-srcset').attr({src: highResUrl, 'data-src': highResUrl});
// 3. Safe re-init
if ($slider.hasClass('slick-initialized')) $slider.slick('unslick');
$slider.slick({ slidesToShow:1, arrows:true, infinite:false, adaptiveHeight:true, prevArrow:'...', nextArrow:'...' });
$slider.slick('getSlick').slideCount; // for counter
$slider.on('afterChange.egCounter', function(e,slick,curr){ $('.eg-slide-count .current').text(curr+1); });
```

**Usage:** Desktop-only (`>1199`) gallery premium rebuild. Requires `waitForjQuery` + `waitForSlick` + CDN load (`slick.css` + `slick.min.js`). Disconnect/re-check via MutationObserver on `#imageGallery` with 500ms debounce. See `AB-test/NEW BALANCE/Test 22.3/variation2/variation.js:173-306`, `variation2/variation.css:42-114`.

---

## SECTION 3: PLATFORM-SPECIFIC PATTERNS

### 3.1 Shopware 6

- Offcanvas nav clones DOM — handle multiple `.navigation-offcanvas-container`
- Product variants switch via URL with `?options=` query
- Radio buttons use raw UUID names, not `group[...]`
- Tiny-slider (tns) requires `pinTnsTransform()` to override CSS `!important`
- `PluginManager.initializePlugins()` needed after DOM insertion
- CAPTURE-phase event listeners override theme's handlers

### 3.2 React/Next.js Sites

- MutationObserver is essential — elements re-render on state changes
- `stopPropagation()` on injected elements prevents React crashes
- Retry logic with exponential backoff for text replacements
- History API hooks for navigation detection
- Class flags (`eg-changes-made`) prevent duplicate modifications

### 3.3 BigCommerce Stencil

- Cart rendered client-side via `data-cart` attribute
- AJAX endpoints: `/remote/v1/cart/add`, `/remote/v1/cart/update`, `/remote/v1/cart/remove`
- Quantity input: `input[name='qty[]']` with `data-qty-field` attribute
- CSRF token via `BCData` object
- Checkout button: `#checkoutButton`

### 3.4 Shopify

- Product variants switch via URL handle
- Cart AJAX API: `/cart/add.js`, `/cart/update.js`, `/cart/change.js`
- Template content fragments for video/media
- Deferred video loading requires specific element targeting

### 3.5 WordPress/Elementor

- Body class-based testing is most common
- CSS-only variations via class toggle
- Elementor widgets have predictable class patterns

### 3.6 Salesforce Commerce Cloud (NEW BALANCE newbalance.com.au)

- PDP gallery: `#imageGallery #imageGalleryInner` with `#mainImageCarouselComponent`, `.item-content`, `img[data-modelinfo]` holds model sizing string
- Image params: `$pdpflexf2$`, `$pdpflexf22x$`, `$pdpflexf2MD$` → upgrade to `$pdpflexf2MD2x$` + `wid=1026&hei=1026` for hi-res (see 2.8)
- Slick used for carousel — clones have `.slick-cloned`, need guard; `unslick` before re-init
- Swatch variant switch is SPA — observe `click` on `[class*="swatch"],[class*="colour"],[data-testid*="swatch"]` + MutationObserver, not XHR
- Responsive breakpoint `768` (badge all vs 1st), `1199`/`1200` (gallery slick rebuild)
- Platform setting in metadata: `Salesforce`, `vanilla js`, body class `EG-NB-22_03`

---

## SECTION 4: COMMON MISTAKES TO AVOID

### 4.1 Double-Init
**Mistake:** Using both `window.addEventListener('load', init)` AND `waitForElement(..., init)`
**Fix:** Use only one initialization method

### 4.2 No Duplicate Check
**Mistake:** Inserting content without checking if it already exists
**Fix:** Always add `!document.querySelector('.eg-your-class')` guard

### 4.3 Hardcoded Data
**Mistake:** Hardcoding dates, prices, or stock levels in urgency messages
**Fix:** Use real data from DOM or API, or remove test when data becomes stale

### 4.4 innerHTML Destruction
**Mistake:** Using `innerHTML` to replace content (destroys existing DOM)
**Fix:** Use `insertAdjacentHTML` for appending, `textContent` for text only

### 4.5 Missing Throttle on Scroll
**Mistake:** Running heavy logic on every scroll event
**Fix:** Use `requestAnimationFrame` or throttling

### 4.6 URL Check Bug
**Mistake:** `indexOf('/blog')` returns -1 (truthy!) when not found
**Fix:** Always use `!== -1` check

### 4.7 jQuery Dependency Without Wait
**Mistake:** Calling jQuery methods before jQuery loads
**Fix:** Use `waitForjQuery` helper or check `window.jQuery`

### 4.8 Ignoring Mobile
**Mistake:** Only testing desktop behavior
**Fix:** Always test mobile, tablet, desktop separately

### 4.9 External Image Hosting
**Mistake:** Using ibb.co or svgshare.com for production images
**Fix:** Use client CDN or S3 for reliable image hosting

### 4.10 Removing Without Fallback
**Mistake:** Hiding/removing elements without fallback for missing DOM
**Fix:** Always check if target element exists before modification

### 4.11 Self-Triggering MutationObserver Loop
**Mistake:** `inject()` does `clearAll() → append()` on every trigger while `MutationObserver` watches `childList:true, subtree:true` on `main`/`body` with `attributeFilter:['src','data-*']`. Own `appendChild`/`removeChild` fires `addedNodes` → debounced re-inject → endless 120ms remove/add cycle. On mobile NEW BALANCE Test 22.3 Apparel PDP, every badge re-append triggered observer again (N badges = N mutations), slick `src` swaps amplified it.
**Fix:** (1) Replace `clearBadges() + loop append` with per-target guard: `target.querySelector(':scope > .eg-badge')` → if exists and `textContent===newText` skip, else update text, else append; (2) Guard observer with `isInjecting` flag + `isClickScrolling` style debounce, (3) Filter own nodes in callback: `if (target.closest('.eg-*')) continue` and `if (onlyBadgeNodes) continue`, (4) Scope `observe(root)` to `#mainImageCarouselComponent` not `main`/`body`, (5) `attributeFilter: ['data-modelinfo']` only — never `src`. Reference: `AB-test/NEW BALANCE/Test 22.3 Add Model Sizing Information to Apparel PDPs/variation1/variation.js:32-128` — P5 pattern.

---

## SECTION 5: CRO PRINCIPLES

### 5.1 Reduce Anxiety
- Trust badges near CTAs
- Money-back guarantees
- Free shipping/returns messaging
- Security icons (lock, SSL)
- Payment method icons

### 5.2 Social Proof
- Customer counts ("200,000+ happy customers")
- Star ratings with review links
- "BEST SELLER" badges
- Trustpilot/Google ratings
- Testimonials with real names/photos

### 5.3 Progressive Disclosure
- Show essential fields first, reveal more after engagement
- Accordion forms (one step at a time)
- "Learn more" links for complex information
- Tooltips for jargon explanation

### 5.4 Urgency/Scarcity
- Real dates ("Next cohort starts Sept 15")
- Limited availability ("Only 3 spots left")
- Stock indicators ("Low stock")
- Countdown timers (with real end times)
- "X people viewing this now"

### 5.5 Clear Value Proposition
- Benefit-first headlines
- Bullet-pointed value props
- "What's included" sections
- Price anchoring (show savings)
- Free trial messaging

### 5.6 Reduce Friction
- Sticky CTAs on mobile
- Express checkout (Apple Pay, Google Pay)
- Guest checkout option
- Auto-fill form fields
- Skip unnecessary steps

---

## SECTION 6: FILE STRUCTURE TEMPLATE

```
test-name/
  v1.json
  share.js (optional)
  variation1/
    variation.js
    variation.css
```

### v1.json
```json
{
  "files": ["./variation1/variation.css", "./variation1/variation.js"],
  "urls": ["https://example.com/target-page"]
}
```

### variation.js Template
```javascript
(function () {
  try {
    var debug = 0;
    var variation_name = "Test Name";

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function injectCSS() {
      if (document.querySelector('#eg-test-css')) return;
      var link = document.createElement('link');
      link.id = 'eg-test-css';
      link.rel = 'stylesheet';
      link.href = 'variation.css';
      document.head.appendChild(link);
    }

    function init() {
      injectCSS();
      waitForElement('.target-element', function () {
        // Your test logic here
        document.body.classList.add('EG-TEST-NAME');
      }, 200, 15000);
    }

    waitForElement('body', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in ' + variation_name);
  }
})();
```

---

## SECTION 7: CLIENT-SPECIFIC NOTES

### AWG (awg-mode.de)
- Shopware 6 platform
- Offcanvas nav clones DOM — handle multiple containers
- tiny-slider (tns) for carousels
- Product variants switch via URL with `?options=`
- CAPTURE-phase events needed to override theme handlers

### DEKRA (dekra-akademie.de)
- German training/education platform
- State-funded vs self-funded course detection
- Trust messaging varies by funding status
- Content-heavy pages benefit from tabification
- Prerequisite badges (license classes) are important

### ZATTOO (zattoo.com)
- React SPA
- Multi-market (DE/CH/AT) with localized content
- History API hooks for navigation
- stopPropagation on injected elements
- Cookie-based variant persistence

### ALTIUM (altium.com)
- B2B SaaS
- Modular trust components (reusable across tests)
- Consultative CTA patterns
- Risk-reversal messaging
- Multi-step forms

### NEW BALANCE (newbalance.com.au)
- E-commerce — **Salesforce Commerce Cloud** (`vanilla js`, `EG-NB-22_03`, Sep 2026)
- **Test 22.3 Apparel PDP — V1 vs V2 breakdown:**
  - **V1 (badge only, all devices):** Parse `img[data-modelinfo]` via `textarea` decode → regex `size` + `height` → `.eg-model-badge` overlay (`14px` desktop/`10px` mobile, white `bottom:12px` center, `border:1px #FFF`) on `.item-content`/`button` (`position:relative`); desktop **1st valid only** (`break`), mobile `<768` **all valid** (`loop`), skip `.slick-cloned`; `waitForElement('img[data-modelinfo]')` + `MutationObserver` on `#mainImageCarouselComponent` (`childList/subtree` + `attributeFilter:['data-modelinfo']` only) with `debouncedInject 120ms` + swatch click `300/800ms` fallback — **gotcha fixed in 2.4/4.11** (was `clear+append` self-loop on `main`, `src` filter, mobile N mutations)
  - **V2 (V1 badge + desktop gallery rebuild `>1199`):** + `boostResolution()` (`$pdpflexf2$` → `$pdpflexf2MD2x$`, `wid/hei 1026`), strip `picture > source` + `srcset`, force reload, `waitForjQuery`/`waitForSlick` CDN `slick.css`+`slick.min.js` (cdnjs 1.8.1), safe `unslick`→`slick({slidesToShow1, arrows:true, infinite:false, adaptiveHeight:true, custom prev/next png})`, slide counter `.eg-slide-count` (`slick('getSlick').slideCount` + `afterChange.egCounter`), `MutationObserver` on `#imageGallery` `500ms` debounce re-init, CSS `min-width:1200` → `.pdpimg-container 66.33%`, `#productDetails pl-1.5rem`, arrows/counter `bottom:25px` `backdrop-filter:blur(16px)` `bg:#FFFFFFB2`
- Shared selectors: `#imageGallery #imageGalleryInner`, `#mainImageCarouselComponent`, `.item-content`, `[class*="carousel"]`
- Mobile sticky ATC essential
- Recently viewed carousels
- Size gating before ATC

---

## SECTION 8: PATTERNS QUICK REFERENCE (P1-P20) — Merged from PATTERNS.md (Sep 2026)

> Source merged 16 Sep 2026 from `AI/guides/PATTERNS.md`. Original file archived/removed — this section is now single source for pattern lookup. Reference as `LEARNED-MEMORY.md:8.x`. For snippets see `SNIPPETS.md:1-8`. Usage % from audit of 4344 tests (2026-09-01).

### 8.1 P1. Image Swap

**When to use:** Replace hero/product/section imagery.

**Approach:**
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

**Key Learnings:**
- Update `<source srcset>` inside `<picture>` too — else browser keeps old `srcset`
- Keep element height to prevent CLS
- Use `container.dataset.egOrig` to allow revert

**Usage:** Common for hero/product swaps

---

### 8.2 P2. Insert Section

**When to use:** Add marketing section/banner/CTA at a specific spot. (75% of tests — most common pattern)

**Approach:**
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

**Key Learnings:**
- Never `innerHTML =` container with event bindings — destroys listeners
- Guard against duplicate insert (`!document.querySelector('.eg-*')`)
- Always `waitForElement` on anchor, not parent — anchor is stable selector

**Usage:** 75.3% `insertAdjacentHTML/Element`

---

### 8.3 P3. Sticky Element

**When to use:** Element sticks/appears/collapses on scroll.

**Approach:**
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

**Key Learnings:**
- CSS `position: sticky` fails inside `overflow: auto` ancestor — check parent
- Use `{ passive: true }` on scroll for performance
- Toggle body class, handle visuals in CSS

**Usage:** 12.9% sticky elements

---

### 8.4 P4. DOM Reordering

**When to use:** Move/reorder existing sections.

**Approach:**
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

**Key Learnings:**
- Moving node auto-detaches — no clone needed
- Loop in reverse for correct order
- Guard with `dataset.egReordered` flag
- For visual-only reorder, prefer `SECTION 8.19` (CSS `order`) — safer, no listener breakage

**Usage:** 18% `order`, 4.2% `:has`

---

### 8.5 P5. MutationObserver Guard

**When to use:** Page re-renders target area and undoes changes.

**Approach:**
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

**Key Learnings:**
- Scope to smallest container — never `document.body` or `main` (see `SECTION 2.4` / `4.11`)
- Guard with `isRunning` flag + debounce
- Filter own mutations (`target.closest('.eg-*')` + `onlyBadge` check) — avoids self-loop (NEW BALANCE Test 22.3)
- Disconnect when done; `attributeFilter` only needed `data-*`, never `src`

**Usage:** 8.6% MutationObserver

**Relation:** See `SECTION 2.4` for self-trigger loop gotcha & fix

---

### 8.6 P6. SPA Routing

**When to use:** Test applies on multiple routes / state persists across navigation.

**Approach:** Use `listener()` from `SNIPPETS.md:3`. Re-run `waitForElement` in `locationchange` callback.

```js
listener(); // from SNIPPETS.md:3
window.addEventListener('locationchange', function(){ waitForElement('.anchor', init, 50, 15000); });
```

**Key Learnings:**
- Hook `pushState`/`replaceState`/`popstate` once
- Re-init on `locationchange`, not `load`

**Usage:** 9.8% SPA

---

### 8.7 P7. Event Tracking

**When to use:** Measure clicks on test elements.

**Approach:** Use `live()` in `share.js` (see `SNIPPETS.md:2`). One per tracked interaction. Never mutate DOM in `share.js`. Any DOM read on load (e.g. `[data-pid]` → cookie) must be inside `waitForElement` (see `SNIPPETS.md:1`) — never top-level `querySelector`.

**Key Learnings:**
- `share.js` = tracking only, no inserts
- Use `live()` for delegated events — works for dynamic elements

**Usage:** 28.7% variation / 95.8% share.js

---

### 8.8 P8. Form Restructure

**When to use:** Redesign form layout without breaking submission.

**Approach:** Move existing fields via `insertBefore`/`appendChild`. Never clone inputs — clones lose `name`/`validation` bindings.

**Key Learnings:**
- Preserve original `input` nodes — move, don't recreate
- Test submission after restructure
- See `SECTION 1.6` for form UX patterns

---

### 8.9 P9. Load External Library (Slick/JQuery)

**When to use:** Need library site doesn't ship. Real pattern: dual CSS + JS inject (21% of tests use slick).

**Approach:**
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
Call `loadSlick(function(){ waitForSlick(initSlick); });`

**Key Learnings:**
- Dual CSS + JS required for slick
- Poll `jQuery.fn.slick` before init
- Guard with `.eg-slick-loaded` div

**Usage:** 21.7% CDN inject / 5.4% slick

---

### 8.10 P10. Text/Price Replacement

**When to use:** Swap headline, copy, prices, badges.

**Approach:** Use `textContent` only on leaf elements. Preserve currency formatting.

**Key Learnings:**
- `textContent` not `innerHTML` for text only
- Keep original number/currency format

---

### 8.11 P11. URL / Page-Type Gating

**When to use:** Test only on specific PDP/PLP/category or exclude pages. (26% of tests)

**Approach:**
```js
function shouldRun() {
  if (['/cart','/checkout'].some(function(p){ return location.pathname.includes(p); })) return false;
  if (location.href.includes('/collections/')) return true;
  return false;
}
if (!shouldRun()) return;
waitForElement('.stable-anchor', init, 50, 15000);
```

**Key Learnings:**
- Gate **BEFORE** `waitForElement` — saves polling
- Use `blockedUrls.includes(location.href)` early return for CROCS pattern
- Check `!== -1` for `indexOf`, not truthy

**Usage:** 26%

---

### 8.12 P12. Viewport Branch + Resize Rebuild

**When to use:** Different DOM/position on mobile vs desktop.

**Approach — choose per site:**
```js
// A) Legacy inline + rebuild (works, simple) — 35% of tests used this historically
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
// or ResizeObserver: new ResizeObserver(buildA).observe(anchor);

// C) CSS-only when possible — @media hide/show, no JS rebuild needed
```

**Key Learnings:**
- `deviceAware()` matchMedia was only 0.07% — legacy, use inline `window.innerWidth < 767` or modern `matchMedia`
- `screen.width` only if site lacks `matchMedia`
- Prefer CSS or `matchMedia` for modern responsive
- NEW BALANCE Test 22.3 uses `<768` for badge (all vs 1st) and `<1200` for gallery slick

**Usage:** 35% viewport branching

---

### 8.13 P13. XHR Hook (Cart/Filter Re-apply)

**When to use:** Page re-renders via fetch/XHR, DOM changes wiped. (11% fetch, 4.6% Cart)

**Approach:**
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
Price helper: `var price = parseFloat(el.innerText.replace(/[^0-9.]/g,''));`

**Key Learnings:**
- Hook `XMLHttpRequest.prototype.send`, check `responseURL`
- Re-apply after relevant endpoint only

**Usage:** 11.2% XHR/fetch hooks

---

### 8.14 P14. Cookie Helpers

**When to use:** Read/write cookies for targeting.

**Approach:** Use `getCookie()` / `setCookie()` from `SNIPPETS.md:4`.

**Key Learnings:** Cross-page state, variant persistence, promo gating

**Usage:** 4.3% cookies

---

### 8.15 P15. Nudge / Progress / Urgency (merged)

**When to use:** Exit nudge, cart progress, countdown, scarcity line. (exit 0%, progress 3%, urgency 0.4%)

**Approach:**
```js
// progress bar
var pct = Math.min((cartTotal/threshold)*100,100); document.querySelector('.eg-progress').style.width=pct+'%';
// urgency line
var anchor=document.querySelector('.hero-cta'); if(anchor && !document.querySelector('.eg-urgency')) anchor.insertAdjacentHTML('beforebegin','<div class="eg-urgency">Only 3 spots left</div>');
// countdown: use setInterval + Date math, version key with variation name
```

**Key Learnings:** Keep to 5 lines, not full pattern per use; use real data not fake urgency

---

### 8.16 P16. CSS Scope & Layout Gotchas (merged)

**When to use:** Scoping, accordion, carousel, flex. (80% @media, 80% !important, 71% flex in real tests)

**Approach:**
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

**Key Learnings:**
- All CSS scoped under `.EG-*` — 78% correct, 22% unscoped is bug
- `<2 !important` per file — only utility hides
- Flex 71%, @media 80%, !important 80% in wild — keep lean

---

### 8.17 P17. Date Math / Countdown

**When to use:** Business days calculation, urgency countdown.

**Approach:**
```js
function addBusinessDays(startDate, days) {
  var d = new Date(startDate);
  while (days > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) days--; }
  return d;
}
```

**Key Learnings:** Skip weekends (0=Sun, 6=Sat); use `setInterval` + `Date` math for countdown with version key

---

### 8.18 P18. YouTube / Video Integration

**When to use:** Add YouTube video to gallery, lightbox, or custom player.

**Approach:**
```js
// 1. Parse YouTube URL — handles all formats
function extractYoutubeId(url) {
  var patterns = [
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
  ];
  for (var i = 0; i < patterns.length; i++) {
    var match = url.match(patterns[i]);
    if (match) return match[1];
  }
  return null;
}
// 2. Auto-generate thumbnail
var thumbUrl = 'https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg';
// 3. Idempotent guard
if (gallery.querySelector('[data-video-type="youtube"]')) return;
// 4. Re-init jQuery plugin
if ($lg.data('lightGallery')) { $lg.data('lightGallery').destroy(true); }
$lg.lightGallery({ selector: 'a[data-video-type="youtube"]', videojs: true });
```

**Key Learnings:**
- Always `destroy(true)` before re-init
- Use `mqdefault.jpg` for thumbnails (120x90)
- Watch URL preferred over embed for lightGallery

---

### 8.19 P19. CSS-Only Reorder (Visual Only)

**When to use:** Reorder elements visually without touching DOM. Safer alternative to P4 when only visual position matters.

**Approach:**
```css
.EG-TEST-ID .parent-container { display: flex; flex-direction: column; }
.EG-TEST-ID .parent-container > .target-child { order: -2; }
.EG-TEST-ID .parent-container > .first-child,
.EG-TEST-ID .parent-container > .target-child { order: -2; }
```
```js
function init() { document.body.classList.add('EG-TEST-ID'); }
waitForElement('.parent-container', init, 50, 15000);
```

**Key Learnings:**
- Visual-only — DOM order unchanged, screen readers follow DOM
- Use P4 (JS reorder) when DOM order must match visual
- Avoid if parent has existing `display: grid`/`flex` with complex props
- Test with `!important` only if site CSS conflicts

---

### 8.20 P20. ScrollSpy — Sticky Nav Auto-Highlight (Click + Scroll Sync)

**When to use:** Sticky jump-links / tab nav must auto-highlight current section on scroll and stay synced with click. (ALTIUM TS-2501 V1-V3 — pill jittered without this)

**Approach:** Use `SNIPPETS.md:8` — `getBoundingClientRect()` + `isClickScrolling` flag + `requestAnimationFrame` throttle. Do not use `offsetTop` when nav moves DOM.

```js
// After setActivePill() — paste SNIPPETS.md:8 helpers
// Replace click: isClickScrolling=true → setActivePill(this) → smoothScroll() → setTimeout(isClickScrolling=false, 900)
// Wire scroll: window.addEventListener('scroll', onScrollSpy, {passive:true}); updateActiveOnScroll();
```

**Key Learnings:**
- Never `offsetTop` after `handleNavbarFixed()` moves nav — use `sec.getBoundingClientRect().top - stickyOffset`
- Guard click vs scroll race with `isClickScrolling` (900ms > smoothScroll)
- Throttle with `rAF`, skip DOM if already active
- Compute `stickyOffset` dynamically: `navbar.offsetHeight + (quickLinks.is-sticky ? quickLinks.offsetHeight : 0) + 20`

**Source:** `ALTIUM/ST FY26Q2 TS-2501` — `SNIPPETS.md:8`

---

### 8.21 Appendix A. Shopware / AWG Quick-View (collapsed P23-P29, P31)

**When to use:** Only for AWG-MODE Shopware PLP→PDP clone (0.3% of tests). Do not use for generic tests.

**Approach:** Use `fetchPdpBlocks()` + `sanitizeBuyBox()` + CAPTURE handler + variant switch. See `ab-test/AWG-MODE/AB044`, `AB045` for full 80-line implementation. Snippets 7-13 archived.

**Key Learnings:** Shopware offcanvas nav clones DOM — handle multiple containers, CAPTURE-phase events, `PluginManager.initializePlugins()`, tiny-slider `pinTnsTransform()`, payload encoding exact match.

---

### 8.22 Appendix B. Rare Gotchas (collapsed)

**When to use:** Edge cases 0.2-1.3% hit rate — keep for reference, not new P#.

**Approach:**
- **P33 Payload Encoding:** Match `encodeURIComponent(JSON.stringify)` + `X-Requested-With` exactly — get real Network payload first. (1.3%)
- **P34 Iframe Overlay:** Never `appendChild` PayPal iframe — overlay with `position:fixed` + rAF sync, keep original offscreen `left:-9999px`. (0.2%)

**Key Learnings:** Rare — only apply when Network tab confirms pattern; otherwise keep in test's `notes`, not new P#

---

## SECTION 9: QA PLAYBOOK & REPO STANDARDS — Merged from PLAYBOOK.md (Sep 2026)

> Source merged 16 Sep 2026 from `AI/guides/PLAYBOOK.md`. Original file archived/removed — this section now single source for QA + repo layout. Run `python scripts/qa_validate.py <TEST_PATH>` pre-handover.

### 9.1 Repository Layout

```
CLIENT/
  TEST NAME/
    variation1/
      variation.js
      variation.css
    v1.json              ← must
    share.js             ← if tracking
    metadata.json        ← must
    AI_DATA/             ← optional for low tests
      user_qa.md           ← optional (skip for low, keep for medium/high)
      user_inputs/
        test_images/
```

**v1.json:**
```json
{
  "files": ["./variation1/variation.css", "./variation1/variation.js", "./share.js"],
  "urls": ["https://client-site.com/page"]
}
```

---

### 9.2 QA Checklist

- [ ] Standard IIFE wrapper; `init()` is entry point.
- [ ] `waitForElement` (50/15000) guards every init — incl. `share.js` DOM reads (`[data-pid]` etc.) → see `SNIPPETS.md:1`.
- [ ] Unique body class in `init()`; all CSS scoped to it.
- [ ] Only stable selectors: semantic id/class/`data-*`.
- [ ] All inserts/listeners/observers guarded against duplicates.
- [ ] Every `setInterval`/`setTimeout` clears itself.
- [ ] MutationObservers scoped, guarded, disconnected.
- [ ] Events use `live()` (see `SNIPPETS.md:2`). SPA tests use `listener()` (see `SNIPPETS.md:3`).
- [ ] CSS scoped under `.EG-xxx`/`.eg-xxx` (78% of real tests), <2 `!important` per file — see `SECTION 8.16`.
- [ ] CSS-first: hide/show in CSS, JS only for behavior.
- [ ] Site functionality untouched.
- [ ] `v1.json` created (+ `share.js` if tracking).
- [ ] Verified on desktop, tablet, mobile.

---

### 9.3 Automated QA (pre-handover) — run `python scripts/qa_validate.py <TEST_PATH>`

- [ ] syntax check (brace balance)
- [ ] duplicate selector check
- [ ] unscoped CSS check (<2 `!important`, scoped under `.EG-` — 8.16)
- [ ] setInterval/setTimeout cleanup check
- [ ] missing `v1.json` / `variation.js/css` check
- [ ] `share.js` DOM mutation check (P7 → 8.7)
- [ ] anti-pattern scan (`[data-pid]` without waitForElement, `innerHTML=`)

---

### 9.4 Tips

1. Minified HTML/JS — use `Select-String` or regex. Save fetched assets once, reuse.
2. Don't chase minified theme bundles — get DOM from user instead.
3. Detect state from rendered DOM, not plugin internals (use P25 if clicks unreliable).
4. Validate with `node` — regex, URL mapping: `node -e "..."` (single-quote in PowerShell).
5. Fetch cap: ONE `Invoke-WebRequest`/`webfetch` per page max. More = guessing → STOP.
6. **Design screenshots** — follow `IMAGE_ANALYSIS.md` before coding. Analyze layout, colors, spacing, borders, mobile first.

---

*Last updated: 16 September 2026 — Big merge: Added SECTION 8 (P1-P20 + Appendix) from PATTERNS.md + SECTION 9 (QA/Repo) from PLAYBOOK.md — single-brain Option A; original files archived. Prev: 1.9 PDP, 2.8 Slick Boost, 3.6 Salesforce, 4.11 Observer Loop, NEW BALANCE V1/V2*
*Based on analysis of 100+ AB tests across 50+ clients*
