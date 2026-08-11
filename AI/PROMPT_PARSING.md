# PROMPT_PARSING.md

## Purpose
This file teaches the AI how to extract `CLIENT`, `TEST_NAME`, `TEST_ID`, and `WEBSITE_URL` from any brief — even if it is short, broken, mixed-language, or a raw Trello card paste.

**Read this file as part of Step 0 before creating any folder or writing any code.**

> **Real client mapping:** if `ClientData/client_registry.md` exists on this machine, use its
> code/domain → CLIENT-folder tables when the brief references a known client. The tables
> below are GENERIC placeholders that only illustrate the FORMAT — they contain no real client.

---

## Rule 1 — Parse Trello Card Format

The most common input format is a Trello card title or description:

```
CLIENT_CODE | TEST_ID | Test Name
```

**Examples (format illustration only — not real clients):**
| Raw Input | CLIENT folder | TEST_ID | TEST_NAME |
|---|---|---|---|
| `ABC \| AB01 \| Product Tile Optimization` | `ABCSTORE` | `AB01` | `AB01 Product Tile Optimization` |
| `XYZ \| 10.01 \| Contact Us Page Redesign` | `XYZHUB` | `XYZ-1001` | `XYZ 10.01 Contact Us Page Redesign` |
| `QRS \| AB02 \| Homepage Redesign` | `QRSMART` | `QRS-AB02` | `QRS AB02 Homepage Redesign` |

**Extraction rules:**
1. Split on `|` — first segment = client code, second = test ID, third = test name.
2. Map the client code to the full CLIENT folder name using the lookup table in
   `ClientData/client_registry.md` if present (Rule 2), otherwise ask the user.
3. Body class = `EG-CLIENT_CODE-TEST_ID` (e.g. `EG-ABC-AB01`). Match the pattern from existing tests in the repo.
4. TEST_NAME for the folder = `TEST_ID + " " + Test Name` (e.g. `AB01 Product Tile Optimization`).

---

## Rule 2 — Client Code → CLIENT Folder Name

| Client Code | CLIENT Folder |
|---|---|
| `ABC` | `ABCSTORE` |
| `XYZ` | `XYZHUB` |
| `QRS` | `QRSMART` |

If the client code is NOT in the table (and `ClientData/client_registry.md` has no match),
use the website domain to infer it (Rule 3), or ask the user. Never invent a mapping.

---

## Rule 3 — Infer from Website Domain

If no Trello card format is present, look for a website URL or domain in the brief:

| Domain | CLIENT Folder |
|---|---|
| `abcstore.example.com` | `ABCSTORE` |
| `xyzhub.example.org` | `XYZHUB` |

Unknown domain → ask the user for the CLIENT folder name (one question, never guess).

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

> "I found: CLIENT = ABCSTORE, but I couldn't determine the TEST_NAME or TEST_ID. Can you share the Trello card ID or test name so I can create the correct folder?"

Never create a folder with a placeholder name like `TEST_NAME` or `CLIENT`. Always confirm with the user first.

---

## Rule 6 — Confirm Before Scaffolding

Once you have extracted all values, state them clearly before creating any files:

> **Scaffolding:**
> - CLIENT folder: `ABCSTORE`
> - Test folder: `AB01 Product Tile Optimization`
> - Full path: `../ABTESTSWITHAI/ABCSTORE/AB01 Product Tile Optimization/`
> - Body class: `EG-ABC-AB01`
> - Target URL: `https://www.abcstore.example.com/collections/all`

Then proceed to create the folder structure as described in `AGENTS.md` Step 0b.

---

## Quick Reference: What to Extract

| Field | Used For | Example |
|---|---|---|
| `CLIENT` | Top-level folder name | `ABCSTORE` |
| `TEST_NAME` | Test subfolder name | `AB01 Product Tile Optimization` |
| `TEST_ID` | Body class suffix, `variation_name` var | `ABC-AB01` |
| `WEBSITE_URL` | `v1.json` → `urls`, `metadata.json` → `website_url` | `https://www.abcstore.example.com/collections/all` |
