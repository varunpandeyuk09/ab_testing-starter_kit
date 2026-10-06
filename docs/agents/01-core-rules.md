# 01 — Core Rules (MUST Follow)

> Source: `AGENTS.md` Sections 1-6. Priority: HIGHEST. These 6 rules override everything else.
> Load this file on every test. Load other files only when needed.

## How to use this folder

1. Always apply the 6 rules below.
2. Use `02-file-structure.md` for scaffolding.
3. Use `03-snippets.md` for copy-paste code.
4. Use `06-quick-patterns.md` (P1-P20) to match the test type.
5. Use `11/12/13-patterns-*.md` (P21-P104) for edge cases.
6. Use `10-pitfalls.md` during QA.

---

## RULE 1 — Element Insertion: Always Guard [MUST]

**Principle:** Check if the element already exists before inserting a new one.

**Why:** Without a guard, every `init()` call or MutationObserver trigger adds duplicate content. `waitForElement` can fire multiple times. Page reloads re-run code.

**When:** Every `insertAdjacentHTML` or `insertAdjacentElement` usage.

**Rule:** `if (el.querySelector('.eg-xxx')) continue;` or `return;` — mandatory for every insert.

---

## RULE 2 — Events: Use live() [MUST]

**Principle:** Prefer `live()` for delegated events. Use `addEventListener` with a guard only when `live()` does not work.

**Why:** `live()` handles dynamic elements automatically. `addEventListener` without a guard adds duplicate listeners on re-inject.

**When:** All click/scroll/change events in `variation.js`. `share.js` = tracking only, NO DOM mutation.

**Rule:** If using `addEventListener`, guard with a `data-eg-bound` check.

**Code:** See `03-snippets.md` → S2 `live()`.

---

## RULE 3 — Template Literals for HTML [MUST]

**Principle:** Always use backticks for HTML strings in JS.

**Why:** Backticks support multi-line strings without concatenation. Cleaner, readable, maintainable.

**When:** Any HTML string construction in `variation.js`.

---

## RULE 4 — MutationObserver: Ask First, Then Use Safely [MUST]

**Principle:** Ask the user if the website is an SPA before using a MutationObserver. Scope to the smallest container. Guard with an `isRunning` flag.

**Why:** An observer on `document.body` causes performance issues and self-trigger loops. SPA frameworks re-render DOM unpredictably.

**When:** Only when the user confirms SPA behavior or dynamic re-rendering affects your changes.

**Rules:**
- Scope to the smallest container — never `document.body`.
- `isRunning` flag + 200ms debounce.
- Filter own mutations: `if (target.closest('.eg-*')) continue;`
- Never observe `src` — use `attributeFilter: ['data-*']` only.
- Disconnect when done.

---

## RULE 5 — Code Style: Human Readable [MUST]

**Principle:** Write code that humans can read and maintain.

**Why:** AB tests are temporary but code must be debuggable. Minified-style code wastes time during QA.

**When:** Always.

**Rules:**
- Named functions, not anonymous arrows.
- `var`, not `let/const` (wider browser support).
- Descriptive variable names.
- One function = one job.
- No minified or obfuscated code.

**Note:** One legacy snippet in `03-snippets.md` (S3 SPA listener) uses arrow functions. Convert it to `function () {}` syntax for production to comply with this rule.

---

## RULE 6 — One-Line Note Above Every Function [SHOULD]

**Principle:** Add a one-line note above each function explaining what it does.

**Why:** A new developer reads the note and immediately understands the purpose without reading the implementation.

**When:** Always. Every function should have a comment above it.
