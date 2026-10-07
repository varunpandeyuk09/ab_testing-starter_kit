# 13 — Advanced Patterns P83-P104 (Newest, Highest Value)

> Source: `AGENTS.md` Section 25. Priority: HIGH among advanced patterns.
> These are the newest learnings. Check here before building complex flows.

## P83. window.availableDays Global Polling
- Wait for externally-defined global JS variable.
- Build date data from global object.
- Different from API fetch — data already on page.

## P84. Date Computation + State Object
- Parse dates, aggregate counts by month.
- Update HTML reactively from state.
- `egAvailableDates` pattern for calendar UI.

## P85. isInViewport() + isElementAtBottom() Utility
- Custom viewport/scroll-position detection.
- NOT using IntersectionObserver.
- Manual `getBoundingClientRect()` checks.

## P86. getLastWordFromPath() Helper
- URL path parser extracts last segment.
- Use for dynamic link construction.
- `pathname.split('/').pop()`.

## P87. Conditional setTimeout Before init()
- Deliberate delay after element is found.
- `setTimeout(function(){ init() }, 5000)`.
- Wait for third-party scripts to settle.

## P88. Intl.NumberFormat Currency Localization
- `new Intl.NumberFormat('en-AU', {style: 'currency', currency: 'AUD'})`.
- Format prices per locale.
- Different from hardcoded `$` symbols.

## P89. Nested waitForElement Calls (3-level chain)
- Sequential waitForElement for multiple elements.
- Callback hell from deep nesting.
- Consider Promise.all instead.

## P90. Scroll-Based Auto-Close (wheel event)
- `wheel` event closes filter dropdowns.
- Auto-close when user scrolls past sidebar.
- Different from click-outside detection.

## P91. detectClickOutside Helper
- Body-level mousedown listener.
- `!element.contains(event.target)` check.
- Close dropdowns/popups on outside click.

## P92. Idle Time Detection
- `setInterval(timerIncrement, 1000)` with event reset.
- Mouse/keypress/touchmove resets `idleTime` to 0.
- Trigger popup after N seconds of inactivity.

## P93. sessionStorage One-Shot Popup
- Show popup only once per session.
- `sessionStorage.setItem('shown', 'true')`.
- Different from cookie — tab-specific.

## P94. Responsive Popup Re-Parenting
- Create desktop/mobile popup dynamically.
- Re-parent on `resize` event.
- Different content placement per viewport.

## P95. DOM Node Reordering (move existing)
- `insertAdjacentElement("beforebegin", nameEl)`.
- Move existing element to new position.
- Not injection — actual DOM migration.

## P96. Cross-Page Content Scraping via XHR
- Fetch another page HTML.
- Extract specific content.
- Different from P59 — uses XHR, not fetch().

## P97. MutationObserver for Calendar Re-Render
- Watch for DOM mutations.
- Re-render content dynamically.
- Used for date picker updates.

## P98. Exit Intent Popup on Checkout
- `mouseleave` + focus guard on inputs/selects.
- Prevent popup during form interaction.
- Different from P68 — adds focus guard.

## P99. Form Submit Proxy
- Programmatically click real submit button.
- Per checkout step.
- Different from direct form.submit().

## P100. window.availableDays + MutationObserver
- Combine global variable polling with MO.
- Wait for data + DOM readiness.
- Robust initialization pattern.

## P101. Body Class Guard at IIFE Top (SPA Duplicate Run Prevention)

- Add body class in `init()`, check it at IIFE top before the `try` block.
- `if (document.body.classList.contains('EG-XXX')) return;`
- On SPA/filter re-render sites, the AB tool re-injects the script — guard prevents duplicate listeners, observers, fetch hooks.
- Different from `.eg-*` element guard — body class persists even after modal/CTA elements are removed by re-render.
- Why before `try`: guard should fire before any code executes, not inside error handling.

```js
(function () {
  if (document.body.classList.contains('EG-XXX')) return; // SPA guard
  try {
    // ... all code
    function init() {
      document.body.classList.add('EG-XXX');
      // ...
    }
  } catch (e) { ... }
})();
```

## P102. Section-Wise Scaffold Order for Full Page Redesign

- Plan insertion order FIRST — map every section to its anchor before writing code: which section comes first, which stable ID/class it attaches to, and via which `insertAdjacentHTML` position (`afterbegin` / `afterend`).
- Build one function per section (`addEligibility()`, `addStructure()`, `addFees()`...) — never one giant HTML blob.
- Every section function starts with its own idempotent guard: `if (document.querySelector("#eg-xxx")) return;`
- Why: guards make `init()` safe to re-run (SPA re-inject, double trigger, staggered re-init) — each call only builds the sections that are missing.
- Anchor chain pattern: wrapper inserted `beforebegin` `#rankings` → hero `afterbegin` wrapper → quick links `afterend` `.eg-hero` → eligibility `afterend` `.eg-quick-links` → each next section `afterend` previous section ID.
- Rule: anchors must exist before their dependent section runs — call functions in the same order as the chain; a missing anchor means that section (and everything after it) fails, so verify each anchor selector in QA.
- Different from P2 (single insert guard) — this is the ordering + per-section guard strategy for multi-section builds.

## P103. One-Shot Auto-Apply + User-Override Guard (Anti-Loop)

**Principle:** Any JS that programmatically pre-selects / pre-fills / force-applies UI state must fire once per flow only, must never reset its own done-flag from a function that runs on every page load, and must stop permanently once the user changes that control manually.

**Why:** If a page-load poll resets the done-flag, the guard becomes a no-op — the automation re-applies after every reload and silently overrides the user choice (symptom: selection flips back after loading).

**When:** Shipping/payment pre-select, dropdown default, radio prefill, auto-open tab/modal, auto-scroll, auto-activate CTA.

**Rules:**
- Store done-flag in `sessionStorage` (survives reload); reset ONLY at intentional flow start (CTA click / form submit) — never inside an init or poll function.
- Bind ONE capture-phase `change` listener (`data-eg-*` guard) → non-programmatic value sets `egUserChoice=true` + clears the pending interval.
- Ignore your own `dispatchEvent` by comparing value, otherwise the guard disables itself.
- Keep the interval handle in IIFE scope so the guard can `clearInterval` it.
- Gate EVERY entry point on the flag: helper fn, `waitForElement` trigger, bottom init block.
- Never let the `debug=0` catch swallow a ReferenceError — vars used by the bottom init block must be IIFE-scoped.

## P104. Viewport Auto-Action Config Flag

**Principle:** Any action the script performs automatically after a user step (auto add-to-cart after size select, auto-scroll, auto-open) must be driven by one named config constant, never hard-coded — so client feedback ("remove it from mobile", "disable everywhere") becomes a one-line change.

**Why:** Auto-actions change often during client QA. A hard-coded click means re-hunting the code path every time; a constant documents the current decision and its allowed values.

**When:** Auto-click / auto-add after variant or size selection, auto-apply, auto-scroll, auto-open overlays — anything triggered by an interaction rather than page init.

**Rules:**
```js
// AUTO_ADD_ON - viewports where a size/variant switch may auto-click Add-to-Cart:
// 'mobile' | 'desktop' | 'both' | 'none'  (change this one value to switch behaviour)
var AUTO_ADD_ON = 'none';

// isAutoAddAllowed - true only when AUTO_ADD_ON covers the current viewport
function isAutoAddAllowed() {
  if (AUTO_ADD_ON === 'both') return true;
  if (AUTO_ADD_ON === 'none') return false;
  var isMobile = window.innerWidth < 768; // must match the CSS breakpoint
  return AUTO_ADD_ON === 'mobile' ? isMobile : !isMobile;
}
```
- Declare the constant at IIFE top with its allowed values in the comment line — QA flips one value, nothing else.
- Gate ONLY the action site: `if (isAutoAddAllowed()) { btn.click(); }` — validation, fetch, popups and the rest of the flow stay untouched.
- Reuse the exact CSS breakpoint (`<768` mobile / `>=768` desktop) so behaviour and layout never disagree.
- Default to the least intrusive value while feedback is pending (`'none'` = manual CTA only).

## P105. CSS-Only Text Swap (font-size:0 + ::before/::after)

**Principle:** To change visible text without touching the DOM text node, set the element's `font-size: 0` and render the new copy in `::before` or `::after` with an explicit `font-size` (use `!important` where host styles are strong).

**Why:** Zero JS, zero reflow risk on the text node; host listeners and structure stay intact. The DOM text is untouched.

**When:** Copy/headline swap on heavily-styled pages where JS text replacement risks breaking bindings.

**Rules:**
```css
.EG-XXX .hero-title {
  font-size: 0 !important;
}
.EG-XXX .hero-title::before {
  content: "New headline copy";
  font-size: 28px !important;
}
```
- Always set an explicit `font-size` on the pseudo-element — it inherits the zeroed size otherwise.
- Center and constrain via the pseudo-element (`display`, `max-width`, alignment), not the zeroed parent.
- Gotcha 1: screen readers announce the ORIGINAL DOM text while sighted users see the new copy — note the mismatch for information-critical copy.
- Gotcha 2: pseudo-element text is not selectable and invisible to JS reads — content placed in CSS is a one-way door.
- Different from P10 (JS leaf-text swap) — no DOM write at all.
