# SITE_PROFILES.md — Confirmed DOM Facts per Client

Purpose: one place to store hard-won DOM knowledge so a new session does NOT have to
re-autopsy a site. Check this file BEFORE inspecting the live page (AGENTS.md STEP 1).

## How to add a profile

- Add a `## CLIENT` section after you have VERIFIED the facts against the live site.
- Only record stable selectors, AJAX endpoints, theme gotchas, and working techniques.
- Note the test that proved each fact (so a future session can read its code).
- Delete/update entries when a client's theme changes break them.

## AREA-WISE rule (AGENTS.md STEP 1/STEP 4)

Profiles are organised **by focus area** — never as a full-site dump. This keeps new-client
setup to a few minutes (verify only the area the brief touches) instead of a full autopsy.

- **Client header (`## CLIENT`)** = site-wide facts verified ONCE per client: auth/Cloudflare
  behaviour, A/B platform (Varify/Convert/...), theme framework (Next.js, Shopware, Magento...),
  and any reusable tooling.
- **Area subsections (`### <AREA>`)** = per-area verified facts. Standard areas:
  `navigation` | `product` | `checkout` | `section` | `form` | `page` | `search`.
- A new test reads ONLY its focus area + the header; a new test in a NEW area appends that
  area only. Never re-verify an area that is already recorded.

Template:

```
## CLIENT

- **Site:** <url> — <stack facts, verified once>
- **A/B platform:** Varify (app.varify.io/varify.js) / Convert / ...
- **Verified in:** <first test that proved the header facts>
- **Site-wide gotchas:** auth/Cloudflare behaviour, framework quirks

### navigation
- header selectors, login/cart/search, mobile menu ...
### product
- PDP selectors, price/stock/add-to-cart ...
### checkout
- cart page, popup/AJAX flow, confirmation ...
### section
- the specific block + its child anchors (only what was redesigned) ...
### form
- form region, fields, validation, submit ...
```

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

---

## PRAXINDO

- **Site:** https://www.praxindo.de — German medical-supply shop. Next.js App Router SSR + Magento-flavoured markup (no `__NEXT_DATA__`; data in RSC flight payloads). Prices are plain text (no `data-price-amount`/`itemprop` on price spans).
- **A/B platform:** Varify (`app.varify.io/varify.js`), NOT Convert.
- **Verified in:** `../ABTESTSWITHAI/PRAXINDO/SM25 Add-To-Cart Window` (SSR product-page + homepage dumps, Aug 2026).

### Site-wide gotchas (verified once)
- Cloudflare: headless Edge (`--dump-dom`, `--headless=new` + CDP) is BLOCKED on product pages by Cloudflare Turnstile ("Nur einen Moment…"). `webfetch` DOES get through and returns full SSR HTML. Live QA must run HEADED with the persistent profile (`~/.ab-test-kit/browser-profiles/praxindo-edge`) — that passes Turnstile.
- Add-to-cart is JS-only (no form): `#product-addtocart-button` is `type="button"` handled by client JS. A real click is required to observe the post-add popup state.

### product (PDP — verified)
- Add button: `#product-addtocart-button` (`action primary tocart`); qty input `#teaser-qty`; VPE text `#teaser-qty + label .vpe_value`.
- Final price: `.product-teaser__item__price__final .price` ("24,90 €"); old price: `.product-teaser__item__price__strike` ("statt 32,90 €"); per-unit: `.product-teaser__item__price__per_unit`; gross: `#price_hints .brutto_amount`.
- Stock: `.product-details-eb__item__stock--green` with `.status-dot`, `.product-details-eb__item__date-text.status-text` (has `data-deliverytime="ca. 1-2 Werktage"`, text "Sofort verfügbar" + "Lieferung ca. 1-2 Werktage"). Slider variants: `.product-slider__item__stock--green/--orange`.
- Cross-sell "Kunden kauften auch" = `.block.crosssell` (fed by RSC `customers_also_bought`, often 8 items); `related_products`/`upsell_products` usually empty.
- Live QA detail: JS `.click()` on `#product-addtocart-button` opens the popup reliably; CDP synthetic mouse events do NOT trigger it (counter stays 0).

### checkout (add-to-cart popup — AW ACP, Aheadworks Advanced Product Options + Magnific Popup)
- 3 popups are SSR'd in `#maincontent.wrapper`, each inside its own `.mfp-wrap` (`display:none` until shown), all carrying class `layer__checkout--active`: progress (`[data-role="progress"]`), **success**, choice ("Bitte wählen Sie eine Variante").
- **Popup disambiguation (LIVE-verified):** all 3 nodes match a naive `querySelector` — pick the SUCCESS node via `:has()`: `.aw-acp-popup:has([data-role="update"] .layer__checkout__title--success)`.
- Success popup `[data-role="update"]` contains: `.layer__checkout__close` (empty button, site sprite X — keep it), `.layer__checkout__title--success` (green band + `:before` sprite check; override `background:#fff` + `:before{display:none}`), `.layer__checkout__product` with hidden `input[name="cart_net_sum"]` (`value="0"` until JS fills it) + `input[name="freeshipping"]` (`value="100"`), `.layer__checkout__product__image span` (background-image), `.layer__checkout__product__title a`, `.layer__checkout__product__info` ("Im Warenkorb befinden sich jetzt: N"), `.layer__checkout__product__price .final.final` (empty until JS fills it) — site renders its own `statt` + stock (`.final--hasstrike` + `.strike`), do not inject your own.
- `[data-role="content"]` = `.layer__checkout__action` (Weiter einkaufen + Zur Kasse → `/checkout/cart` + `/checkout/onepage`).
- **`[data-role="related"]` is a SIBLING of `[data-role="update"]`** (not a child), filled by late AJAX after add — poll innerHTML length > 50 (~9s). Markup: `.layer__checkout__upselling` > `__title` ("Kunden kauften auch") > `__list` > `__list__item.related-available` (DIVs, NOT `.swiper-slide`) > `__image`, `__wrapper`, `__title`, `__info` ("100 Stück"), `__price .final.final--hasstrike` + `.strike` ("statt 2,49 €"), `__button` ("In den Warenkorb").
- Cart state after add: `#minicart-counter` (in `li.user_item--cart`), `#minicart-content-wrapper`.
- **`cart_net_sum` = just-added item price, NOT full cart total** (adds 24.90 → "24.9" with 1 item). Free-shipping math is per-add, not per-cart.
- **Site's final render wipes injected nodes** after early decorate → poll with `key !== lastKey || !hasMarkers` and re-decorate until stable (P28).
- Guest state: `#userLayerTriggerB .user__text small` = "Anmelden" and `#loginLayer` present.

### Reusable tooling
- `tools/qa_run.js` — **reusable headed CDP QA runner (Node >=22, zero deps), 100% client-agnostic.** Auto-detects installed Chromium (Chrome/Edge/Brave/Opera/Vivaldi), drives headed via `--remote-debugging-port=0`, injects a `variation1/` dir into the live page, clicks Add to Cart, settles, runs golden assertions, writes a JSON report. Actions: `navigate|login|atc|qa`; flags `--browser --profile --url --inject --screenshot --out --wait-ms --headless --fresh`. Verified 13/13 PASS on the SM25 variation (Aug 2026). **No client code lives in the runner** — site facts (selectors/tokens) live in `AI/site_profiles.json` (data), and every check comes from the test's `spec.json`, so adding a client or a test never requires a qa_run.js edit. **Data-driven mode (the only QA mode):** pass `--spec <spec.json>` — the spec lives in the test folder and holds `settle` + all `checks` (ops `exists|not|eq|match|count|countLte|css|js`, tokens `{popup} {title} {update} {related} {relatedTitle} {relatedTile} {counter}` resolve from the site profile; fields `profile`/`url`/`inject` override CLI). New tests need NO qa_run.js edits — just a profile entry + spec.json + variation files. Example: `node tools/qa_run.js qa --spec "…/TEST_NAME/spec.json"`.

---

## REVIVSERUMS

- **Site:** https://revivserums.com/ — Shopify, Prestige 4.13.0 base heavily customised ("WeConvert 2.8.2026 Live Site | Bold | Feb.10.26", theme id 158476632317). Homepage sections are CUSTOM (`dv_*` section ids, `c_*` classes), NOT stock Prestige sections.
- **A/B platform:** Varify (`app.varify.io/varify.js`, `iid 5955`).
- **Verified in:** `../ABTESTSWITHAI/REVIVSERUMS/AB-06-HP Best Sellers Image Refresh` (homepage dump + headed CDP QA, Aug 2026).
- **Stack (verified in header dump):** jQuery 3.6.4, slick.min.js + slick.css loaded but NOT used on homepage, lazySizes (`Image--lazyLoad`/`data-src`) used in Prestige sections (header megamenu, featured-product) but NOT in the Best Sellers cards, Judge.me reviews (`jdgm-*`), Bold options/upsell, LoyaltyLion, Clarity, GTM `GTM-PJG48N7`, Afterpay. Money format `${{amount}}` (`<span class=money>`).

### Site-wide gotchas
- Public storefront — homepage is readable via `webfetch` AND headed Edge CDP with no Cloudflare challenge and no login (fresh profile, first run). First-run may show a sign-up/newsletter modal overlay (does not block DOM QA).

### section (Best Sellers homepage carousel — verified AB-06-HP)
- **Container:** `div#shopify-section-dv_best_seller_grid_qkUN9a.c_section_dv_best_seller_grid`; inner `.c_section_bestselling` (inline `background-color:#65315f`); heading `.c_best_seller_top h2` ("Best Sellers"), eyebrow `.c_best_seller_top span` ("Featured collection").
- **Carousel:** `.c_best_seller_product_grid`. Desktop (>768px) = static CSS grid. Mobile (≤768px) = inline vanilla-JS translateX slider (gap 24, dots `.c_pagination_wrapper`, prev/next `.c_bs_slider_prev`/`.c_bs_slider_next`). **No slick init, no data-slick, no lazy-load in this section.**
- **Cards:** exactly 4 `.c_best_seller_single_product`. Structure:
  - Image: `.c_bs_single_product_img > a[href="/products/{handle}"] > img.c_product_main_image` — plain eager single-src `<img src>` (literal `width="auto" height="auto"`, NO srcset/data-src/lazy).
  - Title: `.c_product_content_top h3`; reviews: `.c_product_rating_wrapper .jdgm-preview-badge`; badge: `.c_icon_text_wraper .c_icon_text`; price: `.c_bst_product_price .money` (**`class=money` unquoted — do not "fix"**); CTA: `.c_product_content_bottom a.c_primary_button > span` ("VIEW DETAILS").
  - Bottom link: `.c_bs_bottom_wrapper a.c_secondaty_button` ("VIEW ALL PRODUCTS" → `/collections/best-sellers`).
- **Image URL pattern:** `//revivserums.com/cdn/shop/files/{file}.{ext}?v={ts}` — protocol-relative; **filename does NOT contain the product handle** (e.g. `hair-stimulating-serum` → `RevivHairMaxworchidgradient.jpg`).
- **Ultimate Serum editorial creative** `reviv-ultimate-serum-1.jpg` = BEFORE/AFTER 8 WEEKS split-layout + "REAL RESULTS / IN 8 WEEKS." band + product-bottle overlay (verified by viewing the file) — this is the placeholder creative for the AB-06-HP image swap.
- **`c_primary_button` is reused by the hero section** — always scope card CTA selectors inside `.c_best_seller_product_grid`/`.c_best_seller_single_product`.
- User-confirmed (Q&A, AB-06-HP): only card images change (all other card data untouched); keep the live card count; per-product result claims live inside the future creative images; keep card/CTA links and track card + VIEW DETAILS clicks (share.js); placeholder URL for now — client updates the JS config map when real creatives arrive.

### Reusable tooling
- `tools/qa_run.js` — `revivserums` profile entry in `AI/site_profiles.json` (empty `addToCart[]`). **Section-flow QA** is automatic for profiles with no add-to-cart: navigate → inject → settle → spec checks (no ATC/popup). `spec.settle.scrollTo` scrolls a below-the-fold section into view before screenshot. Verified 7/7 PASS on AB-06-HP (Aug 2026). Run: `node tools/qa_run.js qa --spec "…/AB-06-HP Best Sellers Image Refresh/spec.json"`.

---

## TROOPER

- **Site:** https://www.trooper.ch — German outdoor/tactical gear shop. Shopify, **Dawn theme** (Dawn card/price/rating markup). Varify A/B platform (`app.varify.io/varify.js`, `window.varify.iid = 3266`).
- **Verified in:** `../ABTESTSWITHAI/TROOPER/SM22 Product Tile Optimization` (PLP tile optimization, Aug 2026).
- **Site-wide gotchas:** no Cloudflare challenge on PLP (Invoke-WebRequest + headed CDP both fine, fresh profile). Currency `CHF`. A shop-specific `changeMainImage()` + `variant-thumbnails` on cards (image swap on variant hover, onmouseover/onclick inline handlers → PDP `?variant=` links).

### product (PLP tiles — verified)
- Grid: `#product-grid` (ul, `data-id=template--…__product-grid`) > `li.grid__item` > `.card-wrapper.product-card-wrapper` (16 cards/page, 25 pages).
- Card layout (Dawn): `.card__inner` (`.card__media` images, optional `.official-badge` INSIDE card__inner BEFORE card__media, `data-regios-dopp-generic-product-id`), `.card__content` (`h3.card__heading > a.full-unstyled-link`), second `.card__content` with `.card__information` (`div.caption-with-letter-spacing.light` = brand, `.card__heading.h5`, `.rating-count.caption > span[aria-hidden="true"]` = `(N)`), `.price` block, `.quick-add.no-js-hidden > a.quick-add__submit.button` ("zum Produkt", no real add-to-cart form on PLP).
- `.price.price--on-sale`: `.price__regular .price-item--regular` ("Von CHF 189.90") + `.price__sale` (`<s class="price-item--regular">CHF 239.90</s>` + `.price-item--sale.price-item--last` "Von CHF 189.90"). Non-sale cards: `.price:not(.price--on-sale)`.
- Badge: `.card__badge.top.left > span.badge` text "Sale" (site class `card__badge` is `top left`; variation repositions it top-right with `right:10px`).
- Rating: only ~9/16 cards have `.rating-count`; `(N)` → `(N Bewertungen)` / `(1 Bewertung)`.
- Discount: `s.price-item--regular` vs `.price-item--sale` → integer `-X%` tag (e.g. 239.90→189.90 = `-21%`).
- **SM22 design contract (Q&A-confirmed):** test is scoped to the single `/collections/restposten-sale` URL; desktop + mobile sign-off; NO tracking in share.js (user-said). Buttons hidden via CSS (`.quick-add`, `a.button`), official badge moved above `.caption-with-letter-spacing` (JS) then absolute top-left desktop / in-flow centered mobile (CSS).
- Pagination: `nav.pagination`, next page = `a.pagination__item--prev` (href `?page=2`), current = `a.pagination__item--current`. `waitCards`: `.card-wrapper.product-card-wrapper`.

### Reusable tooling
- `tools/qa_run.js` — **`--viewport WxH`** flag (e.g. `390x844`) emulates a mobile/tablet viewport via CDP `Emulation.setDeviceMetricsOverride`, so ONE viewport-aware spec.json QAs both desktop AND mobile (runner stays client-agnostic). Verified **17/17 desktop + 17/17 mobile + 5/5 pagination each** on SM22 (Aug 2026). Run: `node tools/qa_run.js qa --spec "…/SM22 Product Tile Optimization/spec.json"` (+ `--viewport 390x844` for mobile).

## MONASH

- **Site:** https://online.monash.edu/contact/ — Monash University Online (online.monash.edu). WordPress (page template `wp-singular page-template-default page page-id-517`), forms-layout section markup, Bootstrap `.container > .row > .col-md-8` grid. **A/B platform: Evolution** (`metadata.json`), `website_type: WordPress`.
- **Verified in:** `../ABTESTSWITHAI/MONASH/MOL 10.01 Contact Us Page Redesign` (form wizard redesign, Aug 2026).
- **Site-wide gotchas:** **Cloudflare managed challenge** — raw Invoke-WebRequest is blocked (serves `Just a moment...` + `_cf_chl_*`). Headed browser + persistent profile passes; repeated rapid QA runs re-trigger the challenge → use `--fresh` + the `login` action to clear it. Contact page sections are `section.block.*` (`.block.header.bg-gradient` hero, `.block.forms-layout`), forms wrapped in `.contact-form.white` > `.contact-form__form` (`#contactForm`).

### form (Contact Us enquiry — verified)
- Form: `#contactForm`; student radios `input[name="current_student"]` (values `yes`/`no`); detail area `#student-no-answer` (shown by default, hidden on yes), student-hub message `#student-yes-answer` (hidden by default, shown on yes).
- Step-1 fields (all `required`, `.form-control` inside `.eg-step1-col`): `#first_name`, `#last_name`, `#email` (type=email), `#mobile` (text, placeholder "Mobile*").
- Step-2 required selects: `select[name="reason_for_enquiry"]` (id `00N2v00000VhUGp`), `select.select2__selectCourse` (no name/id), `select[name="study_timeframe"]` (id `00N2v00000Y7jGD`). Salesforce `00N…` ids are forbidden anchors — use name/class. `.g-recaptcha` + `.disclaimer` present in step 2. Submit: `#contactForm button[type="submit"]` (class `btn btn-primary`, text "Submit").
- **Layout gotcha (bug found in QA):** Bootstrap `.row` default `flex-wrap: wrap` — a desktop 2-col redesign MUST set `flex-wrap: nowrap` on `.forms-layout .container > .row`, else a 40% sidebar + 100% form wrap onto separate lines and stack vertically. Fixed in MOL 10.01-era CSS (`variation1/variation.css`).
- **MOL 10.01 design contract (Q&A-confirmed):** AI QA desktop + mobile; tracking (share.js) included in QA. Wizard = CSS-tagged steps (`.eg-step1-col` / `.eg-step2`, shown/hidden via `#student-no-answer.eg-on-step2`); no inputs cloned/moved; step 1 validated before hiding. Mobile: benefit cards move out of the sidebar into a tiny-slider carousel (`.tns-outer`, 4 `.tns-item`, no dots/arrows; `.eg-usp-carousel` on body). Continue enabled only when all required step-1 fields pass `checkValidity()`; magenta `rgb(230,0,40)` when active.
- **QA results (MOL 10.01, Aug 2026):** desktop 33/33 + mobile 33/33, `noPageErrors: true` both, after the flex-wrap fix. Spec is viewport-aware (P32): benefit-card placement + heading size branch on `window.innerWidth < 992`.

---

- **Site:** https://www.pcliquidations.com — refurbished computer/electronics reseller. Custom PHP storefront ("IsaacStore" markup) + `fullwlibs.js` (site-wide jQuery bundle, includes the `IsaacVariantSet` variant switcher). Google Tag Manager `GTM-K338VW` + `dataLayer` (listingId / listingCurPrice / ecommerce.detail on PDP).
- **A/B platform:** Convert Experiences (`//cdn-4.convertexperiments.com/v1/js/100412892-100413810.js`) — Convert code already present on PLPs.
- **Verified in:** `../ABTESTSWITHAI/PCLIQUIDATIONS/Product Listing Revamp` (PLP01, Aug 2026).
- **Site-wide gotchas:** product URLs come in TWO shapes — `/p<id>-<slug>` (e.g. `/p151874-hp-elitedesk-800-g4`) and `/<slug>/p/<id>` (e.g. `/hp-elitedesk-800-g5/p/161203`, ~half the listings). Any id extraction must match both (`/\/p\/(\d+)/` OR `/\/p(\d+)/`); link-rewrite tests must match both (`/\/p[\d/]/`). Images on `images.pcliquidations.com` with `/t200.jpg` thumbs. jQuery is available but the PLP test runs vanilla. Pages are server-rendered, no SPA routing. No Cloudflare challenge observed on PLP/PDP (headed + Invoke-WebRequest both fine).

### page (PLP / category listings — verified)
- Listing container: `.itemBrowser.itemTable` (flex wrap, desktop). Cards: `.item_square-medium` (also `.item_square-small`); desktop grid = 4–5 across (native width 260px, flex in `.itemTable`).
- **Grade data lives on the card:** `x-all-types` (e.g. `"New, Grade A, Grade B, Grade C"`) and `x-in-types` (grades this card can sell, e.g. `"Grade A, Grade B"`). Desktops are A/B/C only; monitors add a `NEW` type (no "Grade X" on the live DOM despite Figma mockups).
- **PLP01 design contract (bug-report round, Aug 2026):** the grade selector is a FIXED A/B/C set on every card — buttons for grades not in `x-in-types` are rendered `disabled` + `aria-disabled` + `.eg-pcl-grade--off` (greyed `#bdbdbd`, `cursor:not-allowed`, click no-op). Grade buttons carry NO prices (bare letter labels only). Verified DOM: 24 cards × 3 buttons, 34 disabled, `innerText` = single letter.
- **Default grade selection (round-4 user-confirmed):** the DEFAULT selected grade = FIRST AVAILABLE from `x-in-types` (A → B → C). The PLP's own card price is often a LOWER grade's price (e.g. `/p110771-dell-p2419h` shows $119.99 = Grade B while Grade A = $139.99 is available), so matching the shown price picks the WRONG grade. Variation now swaps each card to its first-available grade (price/title/image) once PDP data loads. Verified live: `/p110771` defaults to A ($139.99), `/dell-c3422we.../p/162755` (A/B/C) defaults to A.
- **`NEW`-only cards (round-5 user-confirmed):** cards whose `x-in-types` has NO A/B/C (monitors available only as `NEW`) HIDE the grade selector and render a red **NEW tag** (`.eg-pcl-newtag`) instead of an all-disabled A/B/C set. Design contract is mutually exclusive: a card has EITHER the 3-button Grade selector OR the NEW tag, never both. Verified live: `dell-refurbished-monitors` page 1 has 3 NEW-tag cards, page 2 has 1.
- Card inner markup: `.item_image` (a > lazy `<img src=.../t200.jpg>`), `.item_text` (`.brand_img`, `h3.item_title > a[href="/p<id>-slug"]`), `.price_box` (`.browseLinePrice` current, `.browsePriceStrike` strike, `.savings` "Save $xx.xx"), `.item_spec > .browse-spec` rows (`<div>` with `.spec-name` + text value), `.item_extra` (native CTA `.cartbtn.tocart`).
- Specs per category: computers → Processor / Memory / Storage; monitors → Screen Size / Max Resolution / Aspect Ratio.
- **Grid/list toggle:** `browseSetVert(true|false)` toggles `.itemTableVert` on `.itemBrowser` (cards become `div.itemLineVert` with CSS grid areas image/maintext/itemspec/pricebox/itemextra); layout choice persisted in a `browseLayout` cookie. The toggle is hidden on mobile (`is_mobile()` early-return).
- Mobile (≤799px): cards collapse to a 2-col grid (`grid-template-columns:40% auto`; areas image/maintext, image/pricebox, image/itemspec); `.item_extra`, `.brand_img`, `.cartbtn` are `display:none` by the site CSS.
- Pagination: "Results 1-24 of 554", next page = `?start=24`; sort + count via `listBrowseOrder`/`listResultCount` forms. Category filter checkboxes carry `x-url` of the brand's own PLP (e.g. `/dell-refurbished-desktops`). Pagination links: `<a class="is_page" title="Page N of Results">` / next-page link `a.is_page[title="Next Page of Results"]` (verified live, PLP01 round-3).
- Category PLPs share one template: `/refurbished-desktop-computers`, `/refurbished-laptops`, `/refurbished-monitors` + per-brand `/dell-…/hp-…/lenovo-…/…` + `/all-in-one-computers`, `/triple-monitor-setups`, `/monitor-stands-mounts`, `/electronics-deals`, `/closeout-sale`, `/c108---scratch-dent`.
- User-confirmed (Q&A, PLP01): test is **sitewide across all PLPs**; CTA ("See Options") must navigate to the PDP; grade selector must replicate the PDP switcher (in-place image/price change, no refresh); price block = single price + strike + savings that updates on grade switch; applies to **grid + list view**; same card details on mobile.

### product (PDP — variant mechanics, verified)
- PDP embeds **every grade's variant block server-side** in the DOM as `.listing-variant` (one is `.listing-variant.listing-main`). Attributes: `x-id`, `x-baseprice` (current), `x-strikeprice` (strike), `x-master` (on the main block). E.g. Grade A `x-id=151874` $274.99/strike 299.99; Grade C `x-id=156094` $247.99/strike 336.99.
- **Lazy-fetch safety net (PLP01 round-2 fix):** IntersectionObserver can skip cards that never intersect the viewport (fast programmatic scroll / below-fold), so those cards' grade/price/title swaps silently no-op. `setupLazyFetch` now force-queues every not-yet-fetched card after 2500ms (`if (!card.egPdpData && !card._pclPending) queueFetch(card)`). PDP fetch+parse itself is reliable for both URL shapes — failures were never reaching the fetch (verified via in-page async probes).
- The site's `IsaacVariantSet` (defined in `https://stat.pcliquidations.com/fullwlibs.js`, cache-busted `?yyyyMMdd`) calls `load()` → collects all `.listing-variant` blocks → `change(id)` swaps innerHTML client-side (**no AJAX**). Non-master variant URL = `?variant=<id>`.
- Grade label sources in a block: `#itemInfoBlock h1` ("… Grade A") or the selected button `.sub-variant-selected span`. Condition buttons: `.sub-variant-selected` (active) / `.sub-variant-non`; stock: `.pcl-grade-stock.statusGood` ("25+ in stock").
- **The PDP h1 is per-grade** (`<h1>HP EliteDesk 800 G4 SFF Computer i5-8500 - Windows 11 - Grade A</h1>` vs `… Grade C`). When mirroring a grade swap on a PLP card, write the FULL per-grade h1 into `h3.item_title a` — the visible title change IS the `- Grade X` suffix, so stripping it makes the swap a no-op (PLP01 round-2 fix). Fallback when a variant block has no h1: base card title + ` - Grade <letter>`. Verified: `/p151874` card title swaps `… Grade A -> … Grade C` live.
- **Affirm 0% APR:** PDP shows `<p class="affirm-as-low-as" data-amount="27499" data-page-type="product">` (`data-amount` = price in cents, per variant) — this is the zero-interest source (client confirmed badge copy comes from here). `listingFinanceShowBtn()` updates `data-amount` = `store_getItemPrice()*100` and calls `affirm.ui.refresh()`.
- User-confirmed (Q&A, PLP01): zero-interest badge = extract from PDP `.affirm-as-low-as` (0% APR + logo/icon).

### Reusable tooling
- `tools/qa_run.js` — `pcliq` profile entry in `AI/site_profiles.json` (empty `addToCart[]` → section flow). Spec-driven QA: `node tools/qa_run.js qa --spec "…/Product Listing Revamp/spec.json"` (or add `--url https://www.pcliquidations.com/dell-refurbished-monitors` to QA a second PLP). Verified **27/27 PASS on PLP01 round 5 (Aug 2026): 22 main + 5 pagination checks** on BOTH `refurbished-desktop-computers` AND `dell-refurbished-monitors`. Spec `js` checks click a grade button and assert price + title changed on a MULTI-GRADE card, and that a disabled grade click is a no-op — behavioral checks fail (`vacuous pass blocked`) when no card can exercise the claim. Default-grade check asserts selection = FIRST AVAILABLE `x-in-types` grade and that its price matches after swap (round-4 contract); NEW-tag cards are asserted mutually-exclusive with the Grade selector (round-5). `settle.waitJs` gates on ALL cards having PDP data (pending=0, have>=cards.length, >=1 multi-grade) — the round-3 deadlock would hang this gate. `settle.scrollAll` + async `js` checks (in-page fetch probes) were added to qa_run.js during round 3.
- **Round-3 runner features (qa_run.js, all generic/data-driven):** `batch` op (map of sub-checks in one round-trip), `spec.noPageErrors` (fails on any uncaught exception after injection), `spec.pagination` block (click next-page → wait URL change + readyState complete + `waitCards` > 0 → re-inject → settle → run subset checks), `settle.waitJs` (poll a boolean js expr until true, bounded), configurable `settle.scrollAll {stepMs,maxMs}`.
- **Round-3 bug caught by QA (important):** the PDP fetch queue in `variation.js` deadlocked after the first 3 cards — `pumpQueue`/`ensurePdpData` never stored the caller's `cb` in `_pclPending` for a fresh fetch, so `inFlight` never decremented and cards 3+ sat in `fetchQueue` forever (only 3 of 24 cards ever got variant data). Fix: `card._pclPending = []; if (cb) card._pclPending.push(cb);` before fetching. Symptom to watch for in any lazy fetch-queue pattern: N cards fetched (exactly = concurrency limit) then silence.
- `Invoke-WebRequest` + `[regex]` works for quick grade/markup checks (site does not block PowerShell UA).
