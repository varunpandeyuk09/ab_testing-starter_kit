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

*Last updated: 16 September 2026 — Added 1.9 PDP Model Sizing & Gallery, 2.8 Slick Boost, 3.6 Salesforce, 4.11 Observer Loop + expanded NEW BALANCE V1/V2 notes (Test 22.3)*
*Based on analysis of 100+ AB tests across 50+ clients*
