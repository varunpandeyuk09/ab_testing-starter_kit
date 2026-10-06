# 14 — share.js Purpose and Rules

> Source: `AGENTS.md` Section 15. Priority: HIGH when tracking is needed.

## Core rules

- No DOM mutation — only tracking.
- `live()` for delegated click events.
- `gtag()` or `utag.track()` for analytics.
- Cookie read/write for cross-page state.
- `waitForElement('html body', init, 50, 15000)` always.
- Guard with class check: `if(document.querySelector('.' + variation_name)) return;`
- Full template: see `02-file-structure.md`.

## Advanced principles

### 1. Document-Level Delegation
- Single `document.addEventListener('click', ...)` filters by `e.target.closest()`.
- One listener vs. per-element binding for multiple similar elements.

### 2. Read Adjacent State
- Enrich tracking payload with user context (quantity, selected option).
- Read from DOM before tracking the click event.

### 3. Goal in Selector
- CSS selector encodes the conversion action.
- `live('a[href*="/account/signup"]', 'click', ...)` — selector IS the goal.

### 4. Compact wait()
- Lightweight 4-line alternative for simple tracking.
- Simpler than full `waitForElement` when share.js has minimal init logic.

### 5. Debug Flag
- `debug = 0` for production (silent), `debug = 1` for development (logs).
- Always gate error logging with debug check.

### 6. Variation Name as Log Prefix
- `if (debug) console.log(v + ': Tab clicked — ' + tabName);`
- Makes DevTools filtering trivial by variation name.

### 7. live() as Mandatory Boilerplate
- Include `live()` in every share.js even if not used yet.
- Supports future tracking additions without modifying scaffold.
- Code: see `03-snippets.md` S2.
