# PROMPT_PARSING.md

## Purpose
This file teaches the AI how to extract `CLIENT`, `TEST_NAME`, `TEST_ID`, and `WEBSITE_URL` from any brief — even if it is short, broken, mixed-language, or a raw Trello card paste.

**Read this file as part of Step 0 before creating any folder or writing any code.**

---

## Rule 1 — Parse Trello Card Format

The most common input format is a Trello card title or description:

```
CLIENT_CODE | TEST_ID | Test Name
```

**Examples:**
| Raw Input | CLIENT folder | TEST_ID | TEST_NAME |
|---|---|---|---|
| `TRO \| SM22 \| Product Tile Optimization` | `TROOPER` | `SM22` | `SM22 Product Tile Optimization` |
| `MOL \| 10.01 \| Contact Us Page Redesign` | `MONASH` | `MOL-1001` | `MOL 10.01 Contact Us Page Redesign` |
| `PXD \| SM27 \| Homepage Redesign` | `PRAXINDO` | `PXD-SM27` | `PXD SM27 Homepage Redesign` |
| `GF \| HP \| Homepage CTA Test` | `GUARDIAN FUNERALS` | `GF-HP` | `GF HP Homepage CTA Test` |

**Extraction rules:**
1. Split on `|` — first segment = client code, second = test ID, third = test name.
2. Map the client code to the full CLIENT folder name using the lookup table below (Rule 2).
3. Body class = `EG-CLIENT_CODE-TEST_ID` (e.g. `EG-TRO-SM22`, `EG-PXD-SM27`). Match the pattern from existing tests in the repo.
4. TEST_NAME for the folder = `TEST_ID + " " + Test Name` (e.g. `SM22 Product Tile Optimization`).

---

## Rule 2 — Client Code → CLIENT Folder Name

| Client Code | CLIENT Folder |
|---|---|
| `TRO` | `TROOPER` |
| `MOL` | `MONASH` |
| `PXD` | `PRAXINDO` |
| `GF` | `GUARDIAN FUNERALS` |
| `RH` | `RIGID HITCH` |
| `BD` | `BELLA AND DUKE` |
| `JUV` | `JUVIA` |
| `REV` | `REVIVSERUMS` |
| `AAPL` | `AAPL` |

If the client code is NOT in this table, use the website domain to infer it (Rule 3), or ask the user.

---

## Rule 3 — Infer from Website Domain

If no Trello card format is present, look for a website URL or domain in the brief:

| Domain | CLIENT Folder |
|---|---|
| `trooper.ch` | `TROOPER` |
| `monash.edu` / `online.monash.edu` | `MONASH` |
| `praxindo.com` | `PRAXINDO` |
| `guardianfunerals.com.au` | `GUARDIAN FUNERALS` |
| `bellaandduke.com` | `BELLA AND DUKE` |
| `rigidusa.com` | `RIGID HITCH` |
| `juviaplace.com` | `JUVIA` |
| `revivserums.com` | `REVIVSERUMS` |

---

## Rule 4 — Infer TEST_NAME from the Description

If no test ID is given, extract the test name from the brief description:
- Look for keywords like "redesign", "optimization", "test", "CTA", "hero", "PLP", "checkout"
- Use the most descriptive noun phrase as the TEST_NAME
- Keep it short and readable — it becomes a folder name on disk

Example: *"I want to change the product tiles on the PLP"* → TEST_NAME = `PLP Product Tile Optimization`

---

## Rule 5 — When the Brief is Incomplete or Broken

If after applying Rules 1–4 you still cannot determine CLIENT or TEST_NAME:
1. **Do not guess and do not start writing code.**
2. **Ask the user one clear question** listing what you found and what is missing:

> "I found: CLIENT = TROOPER, but I couldn't determine the TEST_NAME or TEST_ID. Can you share the Trello card ID or test name so I can create the correct folder?"

Never create a folder with a placeholder name like `TEST_NAME` or `CLIENT`. Always confirm with the user first.

---

## Rule 6 — Confirm Before Scaffolding

Once you have extracted all values, state them clearly before creating any files:

> **Scaffolding:**
> - CLIENT folder: `TROOPER`
> - Test folder: `SM22 Product Tile Optimization`
> - Full path: `../ABTESTSWITHAI/TROOPER/SM22 Product Tile Optimization/`
> - Body class: `EG-TRO-SM22`
> - Target URL: `https://www.trooper.ch/collections/restposten-sale`

Then proceed to create the folder structure as described in `AGENTS.md` Step 0b.

---

## Quick Reference: What to Extract

| Field | Used For | Example |
|---|---|---|
| `CLIENT` | Top-level folder name | `TROOPER` |
| `TEST_NAME` | Test subfolder name | `SM22 Product Tile Optimization` |
| `TEST_ID` | Body class suffix, `variation_name` var | `TRO-SM22` |
| `WEBSITE_URL` | `v1.json` → `urls`, `metadata.json` → `website_url` | `https://www.trooper.ch/collections/restposten-sale` |
