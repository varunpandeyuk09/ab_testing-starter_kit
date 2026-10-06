# 11 — Advanced Patterns P21-P46

> Source: `AGENTS.md` Section 23. Priority: LOW (load on demand).
> Schema: ID / Principle / Why-When / Details.

## P21. Locale Branching
- Check URL path for locale: `/cn/`, `/hk/`, `/sg/`.
- Different content per locale, same test.
- Use locale mapping object.

## P22. GeoIP Detection
- `$.get("ipinfo.io")` for country detection.
- Add body class per country: `eg-usa`, `eg-uk`.
- Fallback if API fails.

## P23. Multi-Step Form Wizard
- Cache form elements in JS vars.
- Swap forms based on user selection.
- Marketo integration with `loadForm()`.

## P24. Drupal AJAX Detection
- Poll for `.ajax-progress.ajax-progress-fullscreen`.
- Re-run init after AJAX completes.
- Handle dynamic content reloads.

## P25. XHR Cross-Page Extraction
- Fetch another page via XHR.
- Parse with DOMParser.
- Extract specific element and inject.

## P26. URL Query-String Stripping
- Use `new URL(href)` + `.replace(url.search, '')`.
- Clean tracking params from links.
- Preserve path and hash.

## P27. UTM Content Mapping
- Parse `utm_content` from URL.
- Replace underscores with spaces.
- Inject as headline/content.

## P28. Proxy-Click Filter Bridge
- Build parallel UI.
- Map clicks to original filter labels.
- Keep React state in sync.

## P29. Attribute-Driven Metric Switcher
- Switch `data-metric` attribute.
- Page JS re-renders against new value.
- Not just visual swap.

## P30. Scroll-Threshold DOM Relocation
- Move nodes between DOM parents.
- Based on scroll position.
- Not CSS sticky — actual migration.

## P31. CDN Carousel Injection
- Load Slick/Swiper/Owl from CDN.
- Wait for plugin readiness.
- Retrofit existing DOM elements.

## P32. history.pushState SPA Interception
- Override pushState/replaceState.
- Dispatch custom `locationchange` event.
- Re-apply logic on route change.
- Related: `03-snippets.md` S3.

## P33. MutationObserver Card Replacement
- Observe carousel/filter indicators.
- Trigger content swap on change.
- Watch `characterData` or `disabled` attribute.

## P34. fetch() Interception
- Monkey-patch `window.fetch`.
- Detect specific API calls.
- Re-apply DOM modifications after.

## P35. Dual Codebase Adaptation
- Handle legacy + React selectors.
- Same file, different init functions.
- Detect via element presence.

## P36. Login-State-Aware DOM
- Detect logged-in via sign-out link.
- Inject different content per state.
- Handle nav changes.

## P37. Out-of-Stock API Check
- Fire XHR per SKU to availability endpoint.
- Mark unavailable items in dropdown.
- Salesforce OCAPI integration.

## P38. Cross-Page localStorage
- Store recently-viewed in localStorage.
- Read back on homepage.
- Show "Recently Viewed" card.

## P39. Cart-Abandonment Popup
- Read localStorage for charter data.
- Show "Still Interested?" popup.
- Cookie-gated after dismiss.

## P40. Locale-Branched Copy
- Read `<html lang>` attribute.
- Select translated copy.
- Fallback to English.

## P41. Timezone-Adjusted Countdown
- Convert local time to fixed offset.
- Handle DST properly.
- Use `getTimezoneOffset()`.

## P42. Checkout Progress Bar
- Modify step text based on URL.
- Add `eg-active` class.
- Handle multi-step flows.

## P43. Bidirectional Scroll DOM Relocation
- Move nodes on scroll past threshold.
- Move back on scroll up.
- Not clone — actual migration.

## P44. Distributor-Name-Driven Injection
- Read anchor text to identify distributor.
- Inject different content per distributor.
- Case-sensitive matching.

## P45. Tab Section Visibility Switcher
- Inject tab UI.
- Show/hide sections by class toggle.
- Update links to match active tab.

## P46. Responsive Picture Injection
- Inject `<picture>` with `<source>` elements.
- Viewport-based srcset.
- No JS required for responsive images.
