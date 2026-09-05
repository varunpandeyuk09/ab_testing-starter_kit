# User QA — EG-LP-1_11

## Test
1.11 | LP | Home Page Redesign Desktop

## What to check
1. **Desktop only** — 3 cards show on ≥992px, hidden on <992px
2. **Hero reduced** — min-height 520px, copy higher, no layout break
3. **Hero CTAs** — primary href is /pricing/, secondary is /funerals/upcoming-funerals/
4. **3 cards position** — immediately after .jw-hero-homepage, overlapping -40px, 3 columns
5. **Cards content** — Plan A Funeral Now / Pre-plan / Explore Pricing with correct links
6. **No duplicate** — refresh, 3 cards only once
7. **Body class** — .EG-LP-1_11 on body, all CSS scoped
8. **Mobile** — original hero unchanged, no cards

## URL
https://www.lepinefunerals.com.au/

## Devices to test
- [ ] Desktop (≥992px)
- [ ] Tablet (should hide)
- [ ] Mobile (should hide)

## Tracking (share.js)
- [ ] .eg-card__cta click logs
- [ ] .jw-hero-homepage a click logs
