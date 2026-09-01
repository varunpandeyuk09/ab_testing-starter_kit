# User QA — EG-ALTIUM-TS2523

## Test
ST | FY26Q2 | TS-2523 | Altium | Platform Solutions: Develop - Re-Add FAQ Section to Bottom

## What to check
1. **FAQ appears** — "Frequently Asked Questions" section shows immediately before footer / above "Home > Altium Develop" breadcrumb
2. **No duplicate** — refresh, FAQ appears only once
3. **First open** — "What is Altium Develop?" expanded by default, others collapsed
4. **Accordion** — click any header toggles content with smooth grid animation (P21), only one open at a time
5. **Icon rotates** — chevron points down when closed, up when open
6. **Mobile** — title 26px, padding reduced, tap targets work
7. **Body class** — `.EG-ALTIUM-TS2523` on body, all CSS scoped
8. **No break** — footer/breadcrumb not shifted, no CLS

## URL
https://www.altium.com/develop
Content source: https://web.archive.org/web/20260419091421/https://www.altium.com/develop

## Devices to test
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

## Tracking (share.js)
- [ ] Click any `.eg-faq__header` logs "EG-ALTIUM-TS2523: FAQ clicked"
