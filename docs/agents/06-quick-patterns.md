# 06 — Quick Patterns P1-P20

> Source: `AGENTS.md` Section 8. Priority: HIGH.
> Match the test to one of these 20 patterns first before using advanced patterns.

| ID | Pattern | Principle | When |
|---|---|---|---|
| P1 | Image Swap | Replace src + srcset together, never just src | Hero/product imagery |
| P2 | Insert Section | `insertAdjacentHTML` + idempotent guard | Add banner/CTA (75% of tests) |
| P3 | Sticky Element | CSS `position: sticky` + scroll class toggle | Fixed on scroll |
| P4 | DOM Reorder | `insertAdjacentElement` moves node (events preserved) | Move sections |
| P5 | MutationObserver | Scope to smallest container + `isRunning` + debounce | SPA re-renders |
| P6 | SPA Routing | `listener()` captures pushState/replaceState/popstate | Multi-page test |
| P7 | Event Tracking | `live()` in share.js, never in variation.js for tracking | Click measurement |
| P8 | Form Restructure | Move fields, never clone inputs | Redesign form |
| P9 | Load Library | CDN inject + poll (`waitForSlick` / `waitForSwiper`) before init | Need slick/swiper/jQuery |
| P10 | Text Replacement | Target leaf elements only, never parent containers | Swap headline/price |
| P11 | URL Gating | Check `location.pathname` before init | Specific pages only |
| P12 | Viewport Branch | `window.innerWidth < 767` or `matchMedia` | Mobile vs desktop |
| P13 | XHR Hook | Hook `XMLHttpRequest.prototype.send`, re-apply on load | Cart/filter re-apply |
| P14 | Cookie Helpers | `getCookie()` / `setCookie()` for cross-page state | State persistence |
| P15 | Nudge/Urgency | Real data, near CTA, never fake | Exit intent, countdown |
| P16 | CSS Scope | `.EG-XXX` prefix, max 2 `!important` | All CSS |
| P17 | Date Math | Skip weekends, `setInterval` + `Date` for live timers | Business days calc |
| P18 | YouTube Integration | `extractYoutubeId()` + `mqdefault.jpg` for thumbnails | Video in gallery |
| P19 | CSS Reorder | `order: -1` in flex — visual only, DOM unchanged | Visual only reorder |
| P20 | ScrollSpy | `getBoundingClientRect()` + `isClickScrolling` + rAF throttle | Sticky nav highlight |

Related code: P5 → `03-snippets.md` S1+S3, P6 → S3, P7 → S2, P9 → S5 (Slick) / S8 (Swiper), P13 → S6, P14 → S4, P20 → S7.
