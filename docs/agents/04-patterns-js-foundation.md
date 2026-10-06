# 04 — Advanced JS Patterns (Foundation)

> Source: `AGENTS.md` Section 7.2. Priority: MEDIUM.
> Use when the quick patterns in `06-quick-patterns.md` are not enough.

## 1. Dataset Flag Guard

**Principle:** Use `data-*` attributes instead of CSS classes for idempotency guards.
**Why:** CSS classes can collide with site styles. Dataset attributes are isolated and semantic.
**When:** Class-based guards might conflict with existing site classes.

## 2. Staggered Re-Init

**Principle:** For SPA frameworks, call `init()` multiple times with increasing delays.
**Why:** Framework hydration is unpredictable. Each call is idempotent, so extra calls are no-ops.
**When:** Vue/React/Next.js sites where elements load at different times.

## 3. Capture-Phase Event Hijacking

**Principle:** Use `addEventListener(..., true)` to run before theme bubble-phase handlers.
**Why:** Capture phase executes before bubble phase. Only way to override theme behavior.
**When:** Theme handlers prevent your code from working.

## 4. Native Handler Neutralization

**Principle:** Remove attributes that theme JS binds to, not just add new listeners.
**Why:** Theme binds by `[data-action]`, `[name]` selectors. Removing the attribute kills the handler.
**When:** Theme handlers persist even after adding your own listeners.

## 5. Proxy Button Delegation

**Principle:** Create a new UI element that proxies clicks to the hidden original button.
**Why:** Original buttons have server-side bindings you cannot replicate in JS.
**When:** Checkout, form submit, or any button with backend logic.

## 6. Lazy Dependency Chain

**Principle:** Check if a dependency exists before loading. Chain loads sequentially.
**Why:** Prevents duplicate script loading. Each step is self-contained.
**When:** Multiple libraries that depend on each other (jQuery → Slick).

## 7. Two-Phase Init

**Principle:** Separate DOM structure build from data population.
**Why:** Complex tests need clean separation between build and fill phases.
**When:** Tests with both DOM restructuring and data synchronization.

## 8. URL Path Gating

**Principle:** Define inclusion/exclusion rules by pathname before `waitForElement`.
**Why:** Saves polling. Self-documents which pages the test runs on.
**When:** Test should run on specific page types only.

## 9. Responsive DOM Repositioning

**Principle:** Save original parent in `dataset`, move element on resize, restore on resize back.
**Why:** Some layouts need different DOM order at different breakpoints, not just CSS hide.
**When:** Mobile and desktop need fundamentally different DOM structure.

## 10. Assets Object Pattern

**Principle:** Store repetitive assets (icons, text, selectors, config) in an object. Access via lookup function.
**Why:** Single source of truth, DRY enforcement, easy maintenance.
**When:** Icons, text, selectors, or config values repeated across code.

## 11. Block Comment Header

**Principle:** Embed the test brief as a comment block at file top.
**Why:** A new developer reads the header and knows: client, pattern, URL, anchor point.
**When:** Always. Every variation.js should start with this.

## 12. Clipboard-Style CSS Naming

**Principle:** Namespace all classes with the `eg-<client>-<test>` prefix.
**Why:** Prevents collisions with site CSS. Makes DevTools search trivial.
**When:** Always. Every test follows this naming convention.
