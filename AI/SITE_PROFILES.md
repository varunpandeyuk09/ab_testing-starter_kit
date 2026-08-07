# SITE_PROFILES.md — Confirmed DOM Facts per Client

Purpose: one place to store hard-won DOM knowledge so a new session does NOT have to
re-autopsy a site. Check this file BEFORE inspecting the live page (AGENTS.md STEP 1).

## How to add a profile

- Add a `## CLIENT` section after you have VERIFIED the facts against the live site.
- Only record stable selectors, AJAX endpoints, theme gotchas, and working techniques.
- Note the test that proved each fact (so a future session can read its code).
- Delete/update entries when a client's theme changes break them.

---

## AWG

- **Site:** https://www.awg-mode.de — German, Shopware 6.
- **Verified in:** `../ABTESTSWITHAI/AWG/AB042 Sitewide Navigation structure mobile` (variation1/variation.js uses every selector below).

### Mobile navigation (offcanvas menu)
- The mobile menu is a Shopware offcanvas built from the hidden source block
  `.js-navigation-offcanvas-initial-content` (class `d-none ... is-root`).
- Inside it, `.offcanvas-body` holds two siblings:
  1. `#mainMenuContainer.navigation-offcanvas-main-menu` — the 4 top-level tabs.
     Tab markup (NOTE: no `href` attribute, so tabs are not plain links):
     ```html
     <a class="nav-item nav-link navigation-offcanvas-link js-navigation-offcanvas-link
                main-navigation-link val-main-navigation-link"
        data-href="/widgets/menu/offcanvas?navigationId=<category-uuid>"
        data-active-id="<category-uuid>"
        data-category-name="Damen|Herren|Kinder|Wohnen">Label</a>
     ```
  2. `.navigation-offcanvas-container` — EMPTY on page load; submenus are AJAX-loaded into it.

### Submenu AJAX endpoint
- `GET /widgets/menu/offcanvas?navigationId=<category-uuid>` returns
  `.navigation-offcanvas-content` containing:
  - `.navigation-offcanvas-previous` → `a.navigation-offcanvas-btn` "Zur Übersicht" —
    its **href is the active category page URL** (e.g. `https://www.awg-mode.de/wohnen`).
    This is THE reliable active-tab signal.
  - `ul.navigation-offcanvas-list` → `.navigation-offcanvas-list-item` →
    `a.navigation-offcanvas-link` subcategory links (first path segment = top-level tab too).
- Every category URL starts with one of `damen | herren | kinder | wohnen`.

### Theme gotchas
- Tab clicks are handled by a custom theme plugin that does NOT live in the base
  `awg_storefront.js` bundle (it is in a lazy-loaded webpack chunk whose URL is not
  easily resolvable — don't waste time reading the plugin source).
- The theme suppresses/overrides tab click events and sets `.active`
  (`.navigation-offcanvas .navigation-offcanvas-main-menu .nav-link.active` →
  bold `#2A3031` + `:after` underline) asynchronously — **click listeners and
  `.active`-class reads are NOT reliable**.
- Use pattern **P25**: MutationObserver on `.navigation-offcanvas-container` / body,
  watch for `.navigation-offcanvas-previous` being added, derive the tab from the
  Zur-Übersicht link href's first path segment.

### Other notes
- `rg` is not installed on this machine's PowerShell — use `Select-String` or
  `[regex]::Match` on the raw file content instead.
- Quick submenu DOM check without a browser:
  `Invoke-WebRequest -Uri "https://www.awg-mode.de/widgets/menu/offcanvas?navigationId=<uuid>"`.

---

## SMARTSIGN

- **Site:** https://www.smartsign.com — US sign retailer, ASP.NET (Razor), Bootstrap 4, jQuery. Convert Experiences A/B platform already loaded.
- **Verified in:** research session (Aug 2026) — live DOM + headless Edge checks of `/search/*` pages.

### Search — the important parts
- Search URL pattern: `/search/{term}` — spaces become underscores (`/search/stop_sign`), canonical uses dashes (`/search/stop-sign`). BOTH forms are served; both return the same page.
- Header search input: `#search_box` (name `txtsearch`), inside `<form name="productsearchbar">` (POST + `validatesearch('header')` — definition lives in `/js/ui-xp5_search_ultra.js`).
- Live search is AJAX-driven (keyup → `getdata()` → re-render). Products load client-side via Azure Search API:
  `POST https://smartsign.azure-api.net/indexes/al-sku/docs/search`
  Body: `{"skip":0,"top":50,"filter":"","facets":[],"search":"<term>","orderby":"search.score() desc, RelevanceScore desc, SKU asc"}`
  Header: `custid: a7K3RXzbnrCbt1oM6V1Zv9WZyQOHQWokfMRdR6H18Bc/5P5bNUyTXLhkTrvNEWrEmRHU5EX0DDCrewwbbKToAw==` (static, embedded in page JS).
  ⚠️ Direct non-browser calls to this API return 500 — the gateway rejects them. Use headless Edge (P27) instead.
- Live search term source of truth: `#my-search` (hidden input). Static term: `#txtsearch`.

### Search result page selectors (verified)
- Result count: `<span id="total_result" class="ss_subcategory_result_count">` — text like `1 result`, `48 results`, `300 + results`, `1,000+ results`. JS writes raw count into `#txtresultcount`.
- Product grid container: `.products_grid` (empty on page load; filled by AJAX).
- Product item: `.products_grid_item.ss-product-box`.
- Filter sidebar: `#facets` (`.products_filter_body`); "Explore More Products" = `#whatelse .department_grid` (NOT search results).
- Page routing: hybrid — AJAX + hash (`window.location.hash`), no framework SPA.

### Verified low/zero-result search terms (for fallback testing)
- 1 result: `lead paint`, `oil tank`, `wetland`, `generator room`
- 6 results: `recycling bin`, `gutter`; 7: `janitor closet`
- 0 results (no-results page with tips + contact CTA): `radon`, `tritium`

### Checking result counts for any term
Use the reusable script `tools/ss_search_check.ps1` (headless Edge):
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/ss_search_check.ps1 -Terms "lead paint;oil tank;radon"
```
Headless Edge sometimes produces a 0-byte dump on parallel runs — rerun flaky terms sequentially.
