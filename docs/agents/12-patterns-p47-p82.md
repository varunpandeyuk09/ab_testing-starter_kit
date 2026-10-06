# 12 — Advanced Patterns P47-P82

> Source: `AGENTS.md` Section 24. Priority: LOW (load on demand).

## P47. Live Event Delegation Polyfill
- Bubbling-based delegated event binding.
- IE8 `attachEvent` + `matches` polyfill fallback.
- Different from simple `addEventListener` on static elements.

## P48. Step Renumbering
- Rewrite checkout step numbers in-place.
- Change "Step 3" to "Step 2" for custom flows.
- DOM text replacement on step indicators.

## P49. Multi-Page Conditional Init
- Single variation file handles multiple page types.
- Different selectors and insertion points per page.
- Branched at `waitForElement` call and inside `init()`.

## P50. Global SVG Asset Preloading
- Store SVG markup as `window.egTruck`, `window.egDocument`.
- `waitForElement` checks existence before triggering init.
- Ensures async-loaded assets are ready.

## P51. Inline SVG Icon Injection
- Full SVG markup embedded as JS strings.
- Different from P50 preloading — inline in template literals.
- Used for nav icons, trust badges.

## P52. Cross-Page URL Parameter Propagation
- Append `&egSameDay` to link href on page 1.
- Read `window.location.search` on page 2.
- Trigger preselection based on param.

## P53. Programmatic Option Preselection
- `setTimeout` + `.click()` on specific `li` element.
- Auto-select radio-like option.
- Simulates user interaction.

## P54. Desktop-Only Viewport Gate
- Wrap entire init in `if(window.innerWidth > 1024)`.
- Different from CSS media queries — JS-level gating.
- Mobile users get no injection.

## P55. Inline POST Form Injection
- Inject `<form action="..." method="POST">` directly.
- Form submission bypasses JS redirect.
- Server-side submission handling.

## P56. Inline Email Regex Validation
- Standalone `validateEmail()` with hardcoded regex.
- Not using HTML5 `type="email"` validation.
- Client-only validation before submit.

## P57. Cart Free-Shipping Threshold Progress Meter
- Read cart total, compare to threshold.
- Insert visual meter bar with `translateX(-XX%)`.
- Update on every cart mutation (ADD/REMOVE/BAG).
- Different from checkout progress bar (step tracking).

## P58. External Carousel Library Inject + reInit
- Load carousel from CDN (Embla, Slick, Swiper).
- Inject new slide + thumbnail + dot at position.
- Call `embla.reInit()` to update carousel.

## P59. Client-Side Product Page HTML Scrape
- Maintain static `{PRODUCT_NAME: {url, id}}` mapping.
- Fetch each product full page HTML via `fetch()`.
- Parse response, extract name/price/image.
- Render cross-sell cards from scraped data.

## P60. Client-Side Product Search Autocomplete
- Hardcoded array of product objects with `keyWord`.
- Substring match of query against `keyWord`.
- Render matching products as suggestion dropdown.
- No API call — fully client-side.

## P61. Programmatic Quantity Button Click-Simulation
- Click Decrease button N times to reset.
- Click Increase button (N-1) times to reach quantity.
- Auto-submit form after quantity set.
- Controls quantity via synthetic clicks, not input value.

## P62. Shadow DOM Piercing
- Access `element.shadowRoot` to reach inner elements.
- Programmatically click links inside shadow DOM.
- Fragile if component structure changes.

## P63. iframe Pointer-Events Override
- `setInterval` polls and rewrites inline styles on iframe.
- Force `pointer-events: all` on third-party iframe.
- Never cleared — memory leak risk.

## P64. XHR.prototype.send Monkey-Patching
- Wrap native `XMLHttpRequest.prototype.send`.
- Intercept responses by URL pattern.
- Different from `fetch()` interception — lower level.

## P65. Client-Side Discount % Computation
- Read `content` attribute from price elements.
- Compute `((list - selling) / list) * 100`.
- Inject as `(${pct}% off)`.

## P66. Order History Reorder Button Injection
- Fetch PDP pages from order history item links.
- Extract add-to-cart button.
- Inject as "Reorder" CTA on each order item.

## P67. 404 Graceful Degradation
- Handle discontinued products.
- Inject disabled CTA with lock icon.
- Prevent crash on missing product data.

## P68. Mouse-Exit Intent Detection
- `document.addEventListener("mouseout")` with `e.toElement == null`.
- Detect cursor leaving viewport.
- Trigger exit-intent popup.

## P69. Scroll-to-Bottom Popup Trigger
- `scrollY + innerHeight + 50 >= offsetHeight`.
- Mobile alternative to exit-intent.
- Trigger popup when user scrolls near bottom.

## P70. #__NEXT_DATA__ JSON Parsing
- `JSON.parse(document.querySelector("#__NEXT_DATA__").innerHTML)`.
- Extract Next.js SSR hydration data.
- Access anti-forgery tokens, phone configs, country codes.

## P71. CSRF/XSRF Token Extraction
- Read `x-requestverificationtoken` from page.
- Use in API submission headers.
- Required for form POST requests.

## P72. Custom locationchange Event
- Override `history.pushState`/`replaceState`.
- Dispatch custom `locationchange` event.
- Unified SPA route change detection.

## P73. window.dispatchEvent resize
- Force resize event after dynamic content insertion.
- Trigger library recalculation (Swiper, carousel).
- `window.dispatchEvent(new Event('resize'))`.

## P74. waitForSwiper Polling
- `setInterval` polling `typeof Swiper != "undefined"`.
- Wait for async CDN script load.
- Initialize after library ready.

## P75. clickOnce Debounce Flag
- Boolean flag prevents duplicate event binding.
- `live()` binding only registered once.
- Prevents ghost listeners on re-init.

## P76. Dynamic href Rewriting with Regex
- `url.replace('/get-a-quote', '/arrange-a-centre-tour')`.
- Programmatic CTA URL transformation.
- Based on solution type or locale.

## P77. Solution-Type Branching for CTA Labels
- Read dropdown text ("Meeting rooms", "Virtual Offices").
- Dynamically change button text and URLs.
- Different CTAs per solution type.

## P78. getQueryParams URL Parser
- Manual query string parsing.
- Extract `locationid`, `locationname`, `ws` params.
- Use in URL construction.

## P79. localStorage + Cookie Dual Tracking
- `localStorage.setItem(pageIdentifier, 'visited')`.
- Cookie `pageVisitsCount` for visit counting.
- Cross-tab dedup via localStorage.

## P80. Country Data as Inline JSON Array
- 200+ country entries with dial codes, flag CSS, ISO codes.
- Full intl phone input data embedded in JS.
- Used for phone number formatting.

## P81. CSS Custom Properties Set via JS
- `style.cssText = '--width:' + tabWidth + 'px'`.
- Drive CSS animations/positioning from JS.
- Modern approach to dynamic styling.

## P82. Inline JS in HTML Strings (CSP Issue)
- `onmouseenter="..."` in template literals.
- Breaks CSP with `script-src` without `unsafe-inline`.
- Avoid inline event handlers.
