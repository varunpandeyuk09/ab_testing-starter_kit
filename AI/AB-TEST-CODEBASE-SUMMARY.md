# AB Test Codebase Summary

## Stats
- **Total Tests:** 4,340+ variation.js files
- **Total Clients:** 300+
- **Top Clients:** ALTIUM (337), BETASHARES (146), OCTO_PART (140), NEW BALANCE (138), HSBC (118), BRIT_BOX (105), THE_SPANISH_GROUP (99), REGUS (90), VACATION (88), AIRDOCTORPRO (88)

---

## Top Techniques Used — audit 4344 variation.js (2026-09-01) — single source

| # | Technique | Usage | Where Used |
|---|-----------|-------|------------|
| 1 | `waitForElement` + polling | 97.5% | Every test (boilerplate) |
| 2 | `querySelector` / DOM access | 99.4% | Every test |
| 3 | `insertAdjacentHTML/Element` | 75.3% | Insert banners, badges, CTAs, trust sections |
| 4 | `classList.add` / CSS class injection | 68.4% | Scoping styles, triggering CSS-only changes |
| 5 | `live()` delegated events | 28.7% var / 95.8% share | Click tracking (variation 28.7%, share.js 95.8%) |
| 6 | Sticky elements (ATC, headers, CTAs) | 12.9% | PLP filters, PDP ATC, checkout CTA |
| 7 | Cookie get/set/delete | 4.3% | Promo codes, user tracking, A/B state |
| 8 | Slick/Carousel loading | 5.4% slick / 21.7% CDN inject | Product carousels, review sliders |
| 9 | XHR/Fetch hooks | 11.2% | Re-apply after AJAX (cart 4.6%) |
| 10 | MutationObserver | 8.6% | SPA re-render resilience |

---

## Most Common Test Types

### 1. DOM Insertion (sticky banners, trust badges, promo bars)
- Insert HTML before/after/inside target element
- Use `insertAdjacentHTML` not `innerHTML`
- Always check `.eg-*` exists before inserting (idempotent)

### 2. CSS-Only Tests (class toggle)
- JS just adds body class: `document.body.classList.add('EG-TEST-ID')`
- All changes in CSS via `.EG-TEST-ID .element`
- Fastest to build, no DOM mutation

### 3. Sticky Elements (headers, ATC, filters, CTAs)
- `position: sticky; top: 0` in CSS
- JS adds class on scroll threshold
- Common: sticky ATC on mobile PDP, sticky filter on PLP

### 4. Popup/Modal (exit intent, promo, upsell)
- Cookie-gated (show once per session/day)
- `mouseout` event for exit intent on desktop
- Scroll threshold for mobile

### 5. Carousel/Slick
- Load jQuery + Slick from CDN
- `waitForSlick()` polling before init
- `slidesToShow` with decimals for peek effect (e.g. `2.9`, `3.3`)

### 6. Fetch + DOMParser (minicart, cross-sell)
- Fetch another page, parse HTML, extract elements
- Used for: minicart rebuild, cross-sell from cart page

### 7. Countdown Timers
- Set end time, update DOM every second
- Cookie-gated to persist across page loads

### 8. Price Calculations
- Read `data-price-amount` attribute
- Calculate discount %, savings, monthly payments
- Insert formatted message

---

## Key Patterns

### IIFE Wrapper (every test)
```js
(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-TEST-ID';
    // ... code
  } catch (e) {
    if (debug) console.log(e, 'error in ' + variation_name);
  }
})();
```

### Body Class for CSS Scoping
```js
document.body.classList.add('EG-TEST-ID');
```
```css
.EG-TEST-ID .target { /* styles */ }
```

### Idempotent Insertion
```js
if (!document.querySelector('.eg-my-element')) {
  target.insertAdjacentHTML('afterend', html);
}
```

### XHR Hook (re-apply after AJAX)
```js
var origSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function () {
  this.addEventListener('load', function () {
    if (this.responseURL.includes('/cart/')) reApply();
  });
  return origSend.apply(this, arguments);
};
```

### Cookie Gate (show once)
```js
if (!getCookie('eg-shown')) {
  // show popup/banner
  setCookie('eg-shown', '1', 1);
}
```

---

## Client Platform Summary

| Platform | Clients | Notes |
|----------|---------|-------|
| Shopify | BENISOUK, WICKED_CLOTHES, YANKEE_CANDLE, NOMINAL | `Shopify.routes.root + 'cart/add.js'` |
| Magento | ZWILLINGBEAUTY, NEW BALANCE, ALTIUM | `data-price-amount`, `.product-item-info` |
| WordPress | BELLA_AND_DUKE, THE_SPANISH_GROUP | Stepper forms, quiz flows |
| Custom | HSBC, FIJI_AIRWAYS, ZATTOO | SPA, React/Angular wrappers |
| Salesforce | CONTIKI, MOORINGS, SUNSAIL | Booking engines |

---

## share.js Purpose
- **No DOM mutation** — only tracking
- `live()` for delegated click events
- `gtag()` or `utag.track()` for analytics
- Cookie read/write for cross-page state
- `waitForElement('html body', init, 50, 15000)` always

---

## v1.json Template
```json
{
  "files": [
    "./variation1/variation.css",
    "./variation1/variation.js",
    "./share.js"
  ],
  "urls": ["https://client.com/target-page"]
}
```
