# 07 — Test Types

> Source: `AGENTS.md` Sections 9 and 14 merged. Priority: MEDIUM.
> Note: the original file listed test types twice (Section 9 and Section 14).
> They are merged here with no data loss. Section 14 items keep their original numbers in brackets.

## A. Core test types (from original Section 9)

### Redesign
- Hide original with CSS, build new HTML, wire existing functionality.
- Never remove original DOM, only hide with CSS.

### CTA Test
- Find all CTAs, replace text/style, track clicks.
- Use `live()` for dynamic CTAs.

### Trust / Social Proof
- Add badges/reviews near the conversion point.
- Real data only, never fabricated.

### Sticky CTA
- Create fixed CTA, show after scroll, preserve original.
- `position: sticky` preferred over `fixed`.

### Navigation
- Inject nav items, handle mobile separately, sync active state.
- Mobile nav = different implementation than desktop.

### Form Optimization
- Shorten forms, add defaults, split into steps.
- Never clone inputs, move them.

### Urgency
- Real dates, near CTA, never fake.
- Cookie-gated to persist across loads.

### Content Reorder
- Move sections above the fold, CSS `order` preferred over JS reorder.
- DOM order unchanged = screen readers safe.

---

## B. Common implementation types (from original Section 14)

### 1. DOM Insertion (sticky banners, trust badges, promo bars) [Old 14.1]
- Use `insertAdjacentHTML`, not `innerHTML`.
- Always check `.eg-*` exists before inserting (idempotent).

### 2. CSS-Only Tests (class toggle) [Old 14.2]
- JS adds body class, all changes in CSS via `.EG-TEST-ID .element`.
- Fastest to build, no DOM mutation.

### 3. CSS-Only Reorder (visual only) [Old 14.3]
- CSS `display: flex` + `order` property reorders visually.
- Safer than JS reorder — no event listener breakage.
- DOM order unchanged, screen readers follow DOM.

### 4. Sticky Elements (headers, ATC, filters, CTAs) [Old 14.4]
- `position: sticky; top: 0` in CSS.
- JS adds class on scroll threshold.

### 5. ScrollSpy — Sticky Jump-Links Auto-Highlight [Old 14.5]
- Use `getBoundingClientRect()`, not `offsetTop`.
- `isClickScrolling` flag + `rAF` throttle.
- Config object (`pillConfig`) — selectors in one place; targets derived from link `href`, no hardcoded section list.
- `.is-sticky` CSS must have `top: 0` — otherwise the bar stays off-screen after scrolling past.
- Navbar docking optional: `navbarSelector: ''` = class toggle only, no DOM move.
- Full drop-in (JS + CSS) — see `03-snippets.md` S7.

### 6. Popup / Modal (exit intent, promo, upsell) [Old 14.6]
- Cookie-gated (show once per session/day).
- `mouseout` for desktop exit intent, scroll threshold for mobile.

### 7. Carousel / Slick [Old 14.7]
- Load jQuery + Slick from CDN.
- `waitForSlick()` polling before init.
- `slidesToShow` with decimals for peek effect (e.g. `2.9`).

### 8. Fetch + DOMParser (minicart, cross-sell) [Old 14.8]
- Fetch another page, parse HTML, extract elements.
- Used for: minicart rebuild, cross-sell from cart page.

### 9. Countdown Timers [Old 14.9]
- Set end time, update DOM every second.
- Cookie-gated to persist across page loads.

### 10. Price Calculations [Old 14.10]
- Read `data-price-amount` attribute.
- Calculate discount %, savings, monthly payments.
- Insert formatted message.
