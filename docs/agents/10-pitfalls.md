# 10 — Pitfalls: Mistakes, Bugs, Security, Performance, Accessibility

> Source: `AGENTS.md` Sections 12, 16, 17, 18, 19, 21, 22 merged.
> Priority: HIGH for QA. Original section numbers kept in brackets.

---

## A. Common mistakes [Old Sec 12]

| Mistake | Principle |
|---|---|
| No duplicate guard | Always `if (el.querySelector('.eg-*')) return` before insert |
| `innerHTML =` | Never use — use `insertAdjacentHTML` to preserve existing DOM |
| Unscoped CSS | Always scope under `.EG-XXX`, max 2 `!important` |
| Observer on body | Scope to smallest container, never `document.body` |
| No debounce | Always debounce MO with `isRunning` flag + 200ms |
| Hardcoded data | Read from DOM/API, never hardcode dates/prices |
| Ignoring mobile | Always test mobile, use `innerWidth < 767` branch |
| jQuery without wait | Always `waitForSlick()` or poll `window.jQuery` before use |
| Double init | Use either `load` OR `waitForElement`, never both |
| indexOf without check | `indexOf('/blog')` returns -1 (truthy) — use `includes()` |
| Readiness gated on `window.X` | Top-level `class`/`let`/`const` never land on `window` — use `typeof X` |
| External image hosting | Never use ibb.co — use CDN or local assets |
| Clear + re-append loop | Avoid — self-triggers MutationObserver |
| Guard flag reset by page-load fn | Reset done-flag only at flow start; init/poll fns must never touch state flags |

---

## B. Anti-patterns from 90+ test analysis (2023) [Old Sec 16]

### Fragile selectors
- Never use nth-child chains — `div:nth-child(7) > div:nth-child(2) > div:nth-child(1)` breaks on any CMS change.
- Prefer data attributes — `[data-section="hero"]` over `:nth-child(3)`.
- Avoid deep CSS paths — max 3 levels, use classes with `eg-` prefix.

### Hardcoded data
- Never hardcode dates — `new Date('February 2 2023')` permanently expires.
- Read from DOM — prices, dates, counts should come from page elements.
- Use data attributes — `<span data-price="29.99">` for reliable extraction.

### Empty stubs
- Check init() body — 8+ tests had empty `init()` — never completed.
- Verify file exists — some variation.js files are placeholders.

### Console.log in production
- Never leave console.log — 10+ tests had only `console.log` for tracking.
- Use gtag/utag — actual analytics integration required.

---

## C. Security issues [Old Sec 17]

### eval() usage
- Never use eval() — XSS vector.
- Use object lookup — `{key: value}` mapping instead of dynamic code execution.

### innerHTML with user input
- Never innerHTML with UTM params — sanitization risk.
- Use textContent — sanitizes input automatically.

### Plaintext credentials
- Never send credentials raw — always HTTPS and proper auth headers.

### Third-party dependencies
- Always have fallback — ipinfo.io, CDN URLs.
- Check if service deprecated — JSONP, old APIs may stop working.

---

## D. Performance issues [Old Sec 18]

### setInterval never cleared
- Always clearInterval.
- Clear on navigation — SPA route changes should stop intervals.

### XHR wrapper never restored
- Save original — `var orig = XMLHttpRequest.prototype.send`.
- Restore on cleanup — `XMLHttpRequest.prototype.send = orig`.

### Multiple waitForElement racing
- Sequence calls — parallel waitForElement can fire out of order.
- Use single init — one waitForElement triggers all logic.

### Scroll listener no debounce
- Always debounce.
- Use requestAnimationFrame — for smooth scroll handling.

### innerHTML on timer
- Use textContent — no HTML parsing overhead.
- textContent is faster for countdown updates every second.

---

## E. Accessibility issues [Old Sec 19]

### removeAttribute('href')
- Never remove href — breaks keyboard navigation.
- Use aria-disabled — keeps element focusable.

### innerText without ARIA
- Update aria-label — when changing visible text.
- Screen readers need both visible and programmatic labels.

### No focus management
- Trap focus in modals — popup injected without focus trap.
- Return focus on close — when popup dismisses.

### Color-only indicators
- Add text/icon alternative — color alone not accessible.
- Use aria-label — for state communication.

---

## F. Common bugs [Old Sec 21]

### indexOf truthy bug
```js
// WRONG — indexOf returns -1 (truthy), ! makes it false, !== -1 always false
if (!window.location.href.indexOf("search") !== -1) { ... }

// CORRECT
if (window.location.href.indexOf("search") !== -1) { ... }
// OR
if (window.location.href.includes("search")) { ... }
```

### Missing dot in querySelector
```js
// WRONG — selects <eg-moved-ele> tag, not .eg-moved-ele class
document.querySelector("eg-moved-ele")

// CORRECT
document.querySelector(".eg-moved-ele")
```

### Live function shadowed
- Inner `live()` shadows outer — confusing but works.
- Name inner function differently: `delegateEvent()`.

### Dead code paths
- Verify all referenced functions exist.
- Example failures seen: `getPDPData()` never defined, `getEstTime()` defined but never called.

### Duplicate HTML IDs
- Invalid HTML — `id="egCost"` used 8 times in one past test.
- Use classes — `eg-cost-value` instead.

### Swallowed ReferenceError (debug=0 catch)
- Vars used by the bottom init block must be IIFE-scoped.
- Otherwise `ReferenceError` fires and the silent `catch` hides dead code for weeks.
- Verify every var referenced at file bottom is declared at IIFE top.

### Third-party global readiness
- Gate on `typeof X !== 'undefined'`, never on `window.X` — top-level `class`/`let`/`const` create lexical bindings only, not `window` properties.
- Bare `X` before its script runs throws (TDZ) — the `debug=0` catch swallows it, so wrap in `try/catch` or keep using `typeof`.
- A timeout fallback that calls `cb()` anyway turns a missing global into a timing bug: code runs late and fails only for fast users.
- Console autocomplete on `window` lists own properties only — "not in window" does not mean "does not exist".
- Before assuming a global is missing, grep the vendor bundle for its real declaration.

---

## G. Business logic learnings [Old Sec 22]

### Price calculations need rollback
- Remove custom prices when discount disappears.
- Use state marker class: `eg-original-changed`.
- Check `savedPrice` null before removing.

### Cart interception needs endpoint awareness
- Different endpoints return different HTML structure. Parse accordingly.

### Locale affects URL structure
- `/cn/` vs `/hk/` vs `/sg/` — different paths.
- Use locale mapping object with fallback.
- Check `<html lang>` attribute for language.

### Login state changes DOM
- Logged-in users see different nav elements.
- Detect via sign-out link selector.
- Inject different content per state.

### SPA navigation needs cleanup
- Classes/elements persist after route change.
- Remove classes on non-matching paths.
- Disconnect observers on navigation.
