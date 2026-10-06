# 09 — Platform Notes and Quirks

> Source: `AGENTS.md` Sections 11 and 20 merged. Priority: MEDIUM.
> Check this file when the brief names a platform.

## Shopify

- Cart API: `/cart/add.js`, variants via URL handle.
- Always check the `Shopify` object exists before using.
- `cart?view=contents` for side-cart HTML — but markup changes break injected content.
- `Shopify.addItem` needs quantity as string `'1'`, not number.
- Cart API endpoints: `cart.js`, `discount-on-cart-pro`, `cart?view=contents`.

## React / Next.js

- MutationObserver essential for dynamic content.
- `stopPropagation` on injected elements to prevent framework interference.
- `#__next` selector needed for body class injection.
- SPA routing requires pushState override.
- React state needs proxy-click to stay in sync.
- Proxy-click needed — click new element → triggers original label click.
- DOM changes do not update React state — need programmatic events.

## Shopware 6

- Offcanvas nav clones DOM — watch for duplicate elements.
- Use CAPTURE-phase events for offcanvas interactions.
- tiny-slider instead of Slick.

## BigCommerce

- Cart via `data-cart` attribute.
- CSRF token via `BCData` object.

## Salesforce

- Slick carousel common.
- `$pdpflexf2$` image params for image swapping.
- Skip `.slick-cloned` elements.

## WordPress / Elementor

- Body class-based testing preferred.
- CSS-only variations fastest to implement.

## Demandware

- Different selectors for legacy vs React pages — dual codebase needed.
- `data-component` attributes for React sections.
- `.page-header` vs `.react-header` depending on architecture.

## Marketo

- Forms need `MktoForms2.whenReady()` wait chain.
- Not just jQuery — separate Marketo API load required.
- Form IDs change per locale — use mapping object.
