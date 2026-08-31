# User QA — EG-AB045 — Mobile Swatch Image Change

---

## Pre-requisites
- Test script injected via VWO / manual injection
- Body class `.EG-AB045` present on `<body>`
- Chrome DevTools mobile emulation (or real device) at ≤767px

---

## Checklist

### Mobile (≤767px)

- [ ] Go to PLP page (e.g., /damen)
- [ ] Scroll to a product card with color swatches
- [ ] **Tap a non-active color swatch**
  - [ ] Main product image updates to the selected color
  - [ ] No redirect to PDP occurs
  - [ ] Swatch gets visual active indicator (outline border)
  - [ ] Previous swatch loses active indicator
- [ ] **Tap another swatch**
  - [ ] Image updates again
  - [ ] Active state moves to newly tapped swatch
- [ ] **Tap the already-active swatch**
  - [ ] No change (image stays same, no redirect)
- [ ] **Tap product name/title**
  - [ ] Redirect to PDP works normally (not blocked)

### Desktop (>767px)

- [ ] Go to same PLP page
- [ ] **Hover over a color swatch**
  - [ ] Main image updates on hover (original site behavior)
- [ ] **Click a color swatch**
  - [ ] Redirect to PDP works normally (not blocked)
- [ ] No visual changes from test CSS

### Cross-check

- [ ] Console shows `EG-AB045: Mobile swatch tapped — color: <color>` on mobile tap
- [ ] No JS errors in console
- [ ] Product slider on homepage also works (same card structure)

---

## Notes

- If swatches don't have `data-val-swatches-hover-image-options` attribute, image swap won't work
- Test only blocks redirect on mobile — desktop PDP navigation unaffected
