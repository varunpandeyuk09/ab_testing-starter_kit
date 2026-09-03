# Playbook — QA Checklist & Tips

---

## Repository Layout

```
CLIENT/
  TEST NAME/
    variation1/
      variation.js
      variation.css
    v1.json              ← must
    share.js             ← if tracking
    metadata.json        ← must
    AI_DATA/             ← optional for low tests
      user_qa.md           ← optional (skip for low complexity, keep for medium/high)
      user_inputs/
        test_images/
```

**v1.json:**
```json
{
  "files": ["./variation1/variation.css", "./variation1/variation.js", "./share.js"],
  "urls": ["https://client-site.com/page"]
}
```

---

## QA Checklist

- [ ] Standard IIFE wrapper; `init()` is entry point.
- [ ] `waitForElement` (50/15000) guards every init — incl. `share.js` DOM reads (`[data-pid]` etc.) → see `SNIPPETS.md:1`.
- [ ] Unique body class in `init()`; all CSS scoped to it.
- [ ] Only stable selectors: semantic id/class/`data-*`.
- [ ] All inserts/listeners/observers guarded against duplicates.
- [ ] Every `setInterval`/`setTimeout` clears itself.
- [ ] MutationObservers scoped, guarded, disconnected.
- [ ] Events use `live()` (see `SNIPPETS.md:2`). SPA tests use `listener()` (see `SNIPPETS.md:3`).
- [ ] CSS scoped under `.EG-xxx`/`.eg-xxx` (78% of real tests), <2 `!important` per file — see `PATTERNS.md:P16`.
- [ ] CSS-first: hide/show in CSS, JS only for behavior.
- [ ] Site functionality untouched.
- [ ] `v1.json` created (+ `share.js` if tracking).
- [ ] Verified on desktop, tablet, mobile.

---

## Automated QA (pre-handover) — run `python scripts/qa_validate.py <TEST_PATH>`

- [ ] syntax check (brace balance)
- [ ] duplicate selector check
- [ ] unscoped CSS check (<2 `!important`, scoped under `.EG-` — P16)
- [ ] setInterval/setTimeout cleanup check
- [ ] missing `v1.json` / `variation.js/css` check
- [ ] `share.js` DOM mutation check (P7)
- [ ] anti-pattern scan (`[data-pid]` without waitForElement, `innerHTML=`)

---

## Tips

1. Minified HTML/JS — use `Select-String` or regex. Save fetched assets once, reuse.
2. Don't chase minified theme bundles — get DOM from user instead.
3. Detect state from rendered DOM, not plugin internals (use P25 if clicks unreliable).
4. Validate with `node` — regex, URL mapping: `node -e "..."` (single-quote in PowerShell).
5. Fetch cap: ONE `Invoke-WebRequest`/`webfetch` per page max. More = guessing → STOP.
