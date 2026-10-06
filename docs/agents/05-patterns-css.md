# 05 — Advanced CSS Patterns

> Source: `AGENTS.md` Section 7.3. Priority: MEDIUM.

## 1. Glassmorphism

**Principle:** Use `backdrop-filter: blur()` with a semi-transparent background for a modern card look.
**Why:** Creates depth and premium feel without heavy shadows.
**When:** Cards, modals, overlays that need a modern aesthetic.

## 2. Keyframe Animations

**Principle:** Define `@keyframes` for smooth transitions between states.
**Why:** CSS animations are performant (GPU-accelerated). Better than JS for simple effects.
**When:** Tab switches, content reveal, fade-in effects.

## 3. Horizontal Scroll Mobile

**Principle:** Use `overflow-x: auto` with `-webkit-overflow-scrolling: touch` for mobile navigation.
**Why:** Native touch scrolling. Hide scrollbar for a clean look.
**When:** Mobile tab navigation, horizontal menu strips.

## 4. Higher Specificity Selector

**Principle:** Add an `html body` prefix to increase selector specificity.
**Why:** Overrides site CSS without `!important`. Clean specificity boost.
**When:** Site CSS is too specific to override with a single class.

## 5. User Selection Control

**Principle:** Use `user-select: none` on interactive elements.
**Why:** Prevents accidental text selection on buttons and quantity steppers.
**When:** Quantity buttons, draggable elements, interactive controls.

## 6. Multiple Breakpoints

**Principle:** Use 2-3 breakpoints for progressive enhancement.
**Why:** Different devices need different layouts. Progressive approach is maintainable.
**When:** Complex layouts needing tablet and mobile adaptations.

## 7. Desktop-First Mobile Hide

**Principle:** Use `min-width` for desktop styles, `max-width` with `display: none` for mobile.
**Why:** Desktop-first approach. Completely removes desktop-only features on mobile.
**When:** Features that should not exist on mobile at all.

## 8. Negative Margin Overlap

**Principle:** Use negative margin to create visual overlap between sections.
**Why:** Creates depth and visual hierarchy. Cards appear to float over the hero.
**When:** Design requires sections to overlap the hero or adjacent sections.

## 9. Flicker Fix

**Principle:** Hide the element with `opacity: 0` until JS marks it ready with an `.eg-ready` class.
**Why:** Prevents flash of unstyled or empty content (FOUC).
**When:** Elements that need JS to populate content before display.

## 10. BEM Modifiers

**Principle:** Use Block__Element--Modifier naming for component variants.
**Why:** Predictable naming. Easy to understand relationships.
**When:** Multiple variants of the same component (primary/secondary CTAs).

## 11. Sticky Sidebar

**Principle:** Use `position: sticky` for sidebars that should stay visible on scroll.
**Why:** Better UX than fixed position. Sticks only when the container is in view.
**When:** Cart summary, order details, filter panels.

## 12. Transform Hover

**Principle:** Use `transform: translateY(-1px)` for a subtle hover lift effect.
**Why:** GPU-accelerated, performant. Subtle feedback without being distracting.
**When:** CTAs, cards, interactive elements.

## 13. Comment Section Headers

**Principle:** Use decorative comment dividers `/* ── Section ──── */` to organize CSS.
**Why:** Makes CSS scannable. Groups related rules visually.
**When:** Always. Every CSS file should have section headers.

## 14. Letter Spacing

**Principle:** Use `letter-spacing: 0.02em` for subtle text refinement.
**Why:** Improves readability of uppercase or bold text.
**When:** Headlines, urgency text, CTAs.

## 15. Responsive CTA Buttons

**Principle:** Use `flex: 0 1 auto` on desktop, `flex: 1 1 100%` on mobile for CTAs.
**Why:** Side-by-side on desktop, full-width stacked on mobile.
**When:** CTAs that need different layouts per viewport.
