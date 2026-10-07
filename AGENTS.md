# CODE GUIDELINES — AB Testing Starter Kit

> Ultimate reference for AI. Read before writing any test code.
> Language: English only for all rules, comments, and new code.
> Client intent > Kit patterns. Think first, then match.

## MUST Rules (apply on every test)

1. **MUST guard every insert:** `if (document.querySelector('.eg-xxx')) return;` before any `insertAdjacentHTML` / `insertAdjacentElement`. Details: `docs/agents/01-core-rules.md`.
2. **MUST use live() for events:** delegated `live()` from `docs/agents/03-snippets.md` S2. `addEventListener` only with `data-eg-bound` guard. `share.js` = tracking only, NO DOM mutation.
3. **MUST use backticks for HTML strings.** No concatenation.
4. **MUST ask before MutationObserver:** ask user if SPA. Scope to smallest container, never `document.body`. `isRunning` + 200ms debounce. Filter own `.eg-*` mutations.
5. **MUST write human-readable code:** named functions, `var` (not `let/const`), descriptive names, one function = one job. No arrows in production.
6. **MUST scope all CSS under `.EG-TEST-NAME`:** max 2 `!important`. One-line note above every function.

Full rules: `docs/agents/01-core-rules.md`.

## Scaffold

```
ClientData/TEST-NAME/
├── v1.json
├── metadata.json
├── share.js
└── variation1/
    ├── variation.js   # IIFE + waitForElement + init
    └── variation.css  # scoped under .EG-TEST-NAME
```

Templates + idempotent init: `docs/agents/02-file-structure.md`.

Base `variation.js` = only `waitForElement` + `init()`. Add `live()` only when events needed. Add `listener()` only for SPA.

## Index — Load on Demand (do not load all at once)

| When you need | Read | Old section |
|---|---|---|
| User context — load FIRST (standing decisions, corrections) | `docs/agents/00-user-context.md` | New |
| Core 6 rules | `docs/agents/01-core-rules.md` | Sec 1-6 |
| Templates, init pattern | `docs/agents/02-file-structure.md` | Sec 7 |
| Copy-paste code S1-S8 (waitForElement, live, SPA, cookies, Slick, XHR, ScrollSpy, Swiper) | `docs/agents/03-snippets.md` | Sec 7.1 |
| JS foundations (12 patterns) | `docs/agents/04-patterns-js-foundation.md` | Sec 7.2 |
| CSS patterns (15 patterns) | `docs/agents/05-patterns-css.md` | Sec 7.3 |
| Quick match P1-P20 | `docs/agents/06-quick-patterns.md` | Sec 8 |
| Test types (redesign, CTA, sticky, popup, carousel) | `docs/agents/07-test-types.md` | Sec 9+14 |
| CRO strategy | `docs/agents/08-cro-principles.md` | Sec 10 |
| Platform quirks (Shopify, React, SFCC, Marketo) | `docs/agents/09-platforms.md` | Sec 11+20 |
| QA pitfalls (mistakes, bugs, security, perf, a11y) | `docs/agents/10-pitfalls.md` | Sec 12+16+17+18+19+21+22 |
| Advanced P21-P46 | `docs/agents/11-patterns-p21-p46.md` | Sec 23 |
| Advanced P47-P82 | `docs/agents/12-patterns-p47-p82.md` | Sec 24 |
| Newest P83-P105 (P101 SPA guard, P102 scaffold, P103 anti-loop, P104 auto-action, P105 CSS text swap) | `docs/agents/13-patterns-p83-p104.md` | Sec 25 |
| Tracking rules | `docs/agents/14-sharejs.md` | Sec 15 |
| Communication records (schema + message rules) | `docs/agents/16-communication.md` | New |
| Design analysis (screenshot to code, 13 steps) | `docs/agents/17-image-analysis.md` | New |
| Stats (context only) | `docs/agents/15-stats.md` | Sec 13 |

Process flow: `FLOW.md`. Design analysis: `docs/agents/17-image-analysis.md`.

Do NOT read `communications/` (private, gitignored). Do NOT read `ClientData/<CLIENT>/` for initial read.

## QA Gate

Before handoff, check: brief match, selectors stable (no nth-child chains), duplicate guard, SPA re-run safe, observers scoped + debounced, listeners single-bound, responsive <767, CSS scoped, edge cases, no hardcoded dates/prices, no console.log, no eval, no innerHTML with user input.

Checklist + bug catalog: `docs/agents/10-pitfalls.md`.

## Capture (add new pattern only if all true)

1. Generic + reusable across >=2 clients or >=3 tests.
2. Distinct technique not covered by P1-P104.
3. Has copy-paste snippet + gotcha.
4. Else keep in test notes, not new P#.

*Last restructured: October 2026. Content migrated losslessly from 1609-line monolith. All comments in English.*
