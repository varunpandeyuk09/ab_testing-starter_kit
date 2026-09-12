# Update Log — AB Testing Starter Kit

> Track all changes here. Keep this file updated after every modification.

> **LANGUAGE RULE: All files must be in English. No Hindi or Hinglish allowed.**

---

## Latest Update: 2026-09-13

### Files Updated

#### README.md
- Updated `How to Use This Kit` step 2 to `AI/guides/...` paths and `Do NOT read communications/`.
- Rewrote `Structure` diagram to grouped layout: `AI/guides/` (PATTERNS, SNIPPETS, PLAYBOOK, IMAGE_ANALYSIS, AB-TEST-CODEBASE-SUMMARY), `AI/templates/` (share.js, v1.json, EG-SPA-HELPER.js), `docs/SHOPIFY-GIT-SETUP.md`, `communications/` (gitignored), `AB-test/<CLIENT>/<TEST>/shopify/theme`.

#### FLOW.md
- Verified `How to Use` paths now point to `AI/guides/` — AI will read from grouped `guides/` folder, not root `AI/`.

#### AI/* → Grouped
- Moved `AB-TEST-CODEBASE-SUMMARY.md`, `PATTERNS.md`, `SNIPPETS.md`, `PLAYBOOK.md`, `IMAGE_ANALYSIS.md` → `AI/guides/`
- Moved `share.js`, `v1.json`, `EG-SPA-HELPER.js` → `AI/templates/`
- Moved `SHOPIFY-GIT-SETUP.md` (from `AI/`) → `docs/SHOPIFY-GIT-SETUP.md` (outside AI, generic folder)
- Updated all cross-references in `README.md`, `FLOW.md`, and `AI/UPDATE.md` to new paths.

---

## Previous Update: 2026-09-12

### New Files Added
| File | Purpose |
|------|---------|
| `communications/` | Private gitignored folder for client/manager communications (not for AI). Moved `*COMMUNICATION.txt` files from `AI/` here. |

### Files Updated

#### README.md
- Added `Do NOT read communications/ — private, gitignored` to How to Use This Kit step 2 and Structure diagram. Updated structure to `AB-test/<CLIENT>/<TEST>/shopify/theme`.

#### FLOW.md
- Added RULE: `Do NOT read communications/ — private, gitignored folder` to system prompt.

#### .gitignore
- Added `communications/` to keep kit lightweight and private.

#### AI/UPDATE.md
- Logged communications folder creation and docs update.

---

## Previous Update: 2026-09-10

### New Files Added
| File | Purpose |
|------|---------|
| `scripts/shopify_browser_downloader.js` | Browser console Shopify theme downloader (no CLI auth) — uses session cookie to fetch 1005 assets via `/admin/themes/:id/assets.json` + JSZip. For ScrapeArmor 161424146684 when Authenticator blocks CLI. |

### Files Updated

#### AI/guides/PATTERNS.md
- Added P20: ScrollSpy — Sticky Nav Auto-Highlight (Click + Scroll Sync) — fixes ALTIUM TS-2501 pill jitter (offsetTop broke after DOM move, click vs scroll race). Uses getBoundingClientRect() + isClickScrolling flag + rAF throttle, dynamic stickyOffset.

#### AI/guides/SNIPPETS.md
- Added Snippet 8: ScrollSpy — Sticky Nav Auto-Highlight — copy-paste helpers getStickyOffset/updateActiveOnScroll/onScrollSpy with isClickScrolling guard (900ms) and rAF throttle. References P20.

#### AI/guides/AB-TEST-CODEBASE-SUMMARY.md
- Added ScrollSpy to Most Common Test Types (sticky nav pattern).

#### SHOPIFY-GIT-SETUP.md + docs/SHOPIFY-GIT-SETUP.md
- Moved Shopify themes out of `starter_kit` to keep it lightweight. New standard: `AB-test/<CLIENT>/<TEST_NAME>/shopify/theme` (e.g., `AB-test/ScrapArmor/T01-Home-Hero/shopify/theme`). Updated all paths, workflow diagram, and quick ref. Handles per-developer `D:` drive via `../AB-test` relative path. Removed `shopify/XYZ/theme` from starter_kit.

#### scripts/shopify_browser_downloader.js
- Added browser session downloader tool — verified on ScrapeArmor 161424146684.

### Files Removed
| File | Reason |
|------|--------|
| `shopify/` (from starter_kit) | Moved to `AB-test/<CLIENT>/<TEST>/shopify/theme` to keep kit lightweight per user request (all devs have `D:\WORK_EXPOGROWTH\AB-test` sibling). |
| `AI/*COMMUNICATION.txt` (3 files) | Moved to `communications/` (now gitignored) — `AI/` should stay patterns/snippets only. |

---

## Previous Update: 2026-09-08

### Files Updated

#### AI/guides/PATTERNS.md
- Added P19: CSS-Only Reorder (Visual Only) — safer alternative to P4 for visual reordering without DOM manipulation
- Uses `display: flex` + `order` property
- No event listener breakage, no MutationObserver needed
- Example from DublinMaths AB001 test

#### AI/guides/AB-TEST-CODEBASE-SUMMARY.md
- Added "CSS-Only Reorder" as test type #3 in Most Common Test Types
- Documented advantages over JS reorder (P4)

---

## Previous Updates: 2026-09-05

### New Files Added

| File | Purpose |
|------|---------|
| `AI/guides/IMAGE_ANALYSIS.md` | Design screenshot analysis checklist — based on real test patterns from DEKRA, NB, LP, ZATTOO, VIDABOX |

---

### Files Updated

#### FLOW.md
- Added **DESIGN step** after ANALYZE
- Added **system prompt** before BRIEF (expert CRO developer role, rules, goals)
- Updated step table to include DESIGN

#### README.md
- Replaced **Session Starter Prompt** with **How to Use This Kit** (4 simple steps)
- Updated **Brief Formats** — added "With design reference" format
- Updated **Structure** — added IMAGE_ANALYSIS.md in AI folder

#### AI/guides/PLAYBOOK.md
- Added Tip #6: Design screenshots — follow IMAGE_ANALYSIS.md

#### AI/templates/v1.json
- Fixed extra angle bracket in URL

#### AI/templates/EG-SPA-HELPER.js
- Converted all Hindi comments to English

#### FLOW.md
- Fixed Hindi text "follow karo" → "follow" in DESIGN step

#### AI/guides/PATTERNS.md
- Added P18: YouTube / Video Integration pattern

#### AI/guides/IMAGE_ANALYSIS.md
- Complete rewrite based on real test patterns (DEKRA, NB, LP, ZATTOO, VIDABOX)
- Added component type matching (Info Box, Product Card, Tab Nav, Badge, CTA, Carousel, Trust Section, Hero Enhancement)
- Added layout patterns with ASCII diagrams
- Added color patterns from real tests (DEKRA green, LP green, NB green)
- Added spacing/radius/shadow guides
- Added separator patterns (vertical, horizontal, connected)
- Added special elements (icons, status dots, badges, ARIA)
- Added mobile patterns

---

## Previous Updates

_No previous updates._

---

## How to Update This File

Whenever you add, modify, or delete a file in the kit:

1. **New file added?** → Add to "New Files Added" section
2. **Existing file updated?** → Add to "Files Updated" section
3. **File deleted?** → Add to "Files Removed" section
4. **Always include the date**
5. **Write a brief summary** — what changed and why

---

## Format

```markdown
## YYYY-MM-DD

### New Files Added
| File | Purpose |
|------|---------|
| path/to/file | What it does |

### Files Updated
#### filename.md
- What changed and why

### Files Removed
| File | Reason |
|------|--------|
| path/to/file | Why removed |
```
