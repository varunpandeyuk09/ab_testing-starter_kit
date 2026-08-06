# EG-EXAMPLE-SM01 — PLP Product Card Optimization

> ⚠️ This is a **reference example only** — not a real shipped test.
> It exists to show AI agents exactly what correct, complete, well-structured output looks like.

---

## Test Brief
Add a "Free Shipping" badge above the price on every product card in the PLP grid.
Add a sticky "Back to Top" bar that appears after the user scrolls 400px.
Reapply badges after AJAX filter/re-render using a MutationObserver.
Track badge card clicks and sticky bar clicks via share.js.

## Patterns Used
- **P2** — Insert Block (shipping badge before `.price` on each `.product-item`)
- **P3** — Sticky Element (Back to Top bar toggled by scroll)
- **P5** — MutationObserver guard (reapply badges after filter re-render)
- **P7** — Click Tracking via `share.js`

## What Makes This a Good Example
- `init()` only calls helpers — zero logic inside it
- All helpers defined at IIFE top level
- Every insertion is idempotent (`if (el.querySelector('.eg-...')) return`)
- MutationObserver scoped to `.product-grid` only, not `document.body`
- `isRunning` flag guards MO re-entrancy
- Stable selectors: `.product-item`, `.price`, `.product-grid` — no `nth-child`, no utility classes
- CSS fully scoped under `.EG-EXAMPLE-SM01`
- Section comments in both JS and CSS
- `share.js` has no DOM mutation — tracking only
