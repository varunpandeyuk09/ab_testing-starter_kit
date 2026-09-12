# Shopify + Git Local Development Setup

> Complete guide for Shopify theme development with Git version control.
> Last updated: 2026-09-10 — **Moved Shopify themes out of starter_kit to keep it lightweight.**
> **New standard:** Shopify themes live in main `AB-test` repo: `AB-test/<CLIENT>/<TEST_NAME>/shopify/theme`

---

## Why Moved?

`ab_testing-starter_kit` is now **lightweight** (only `AI/`, `ClientData/`, `scripts/`). Heavy theme files (`assets/`, `sections/` etc.) live in sibling `AB-test` repo under each test:
```
D:\WORK_EXPOGROWTH\
├── ab_testing-starter_kit\   ← docs/patterns only
└── AB-test\                  ← actual tests + Shopify themes
    └── <CLIENT>\
        └── <TEST_NAME>\
            ├── variation1\   (CRO)
            └── shopify\
                └── theme\    ← Shopify theme (shopify/<client>/theme per test)
```
Example: `D:\WORK_EXPOGROWTH\AB-test\ScrapArmor\T01-Home-Hero\shopify\theme`

> **Path note:** `AB-test` location may vary per developer (`D:`, `C:`, `~/`). Use **relative** `../AB-test` from `starter_kit` or set env var `AB_TEST_ROOT`.

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 22.12+ | https://nodejs.org |
| Git | 2.28.0+ | https://git-scm.com |
| Shopify CLI | 4.x | Installed via npm |

---

## Step 1: Install Shopify CLI

```bash
npm install -g @shopify/cli@latest
```

Verify installation:
```bash
shopify version
```

---

## Step 2: Login to Shopify

```bash
shopify auth login
```

Browser will open. Login with your Shopify credentials.

Or with store directly:
```bash
shopify auth login --store your-store.myshopify.com
```

---

## Step 3: List Available Themes

```bash
shopify theme list --store your-store.myshopify.com
```

Note down the **Copy Theme ID** (starts with #).

---

## Step 4: Create Project Folder (in AB-test, not starter_kit)

```bash
# Navigate to AB-test client test folder (sibling to starter_kit on D: drive)
cd D:\WORK_EXPOGROWTH\AB-test

# Create Shopify theme folder inside the specific test
mkdir ScrapArmor\T01-Home-Hero\shopify\theme
# Generic: mkdir <CLIENT>\<TEST_NAME>\shopify\theme
# Relative from starter_kit: mkdir ..\AB-test\<CLIENT>\<TEST_NAME>\shopify\theme
```

---

## Step 5: Pull Copy Theme Locally

```bash
shopify theme pull --theme "#THEME_ID" --path "D:\WORK_EXPOGROWTH\AB-test\ScrapArmor\T01-Home-Hero\shopify\theme" --store your-store.myshopify.com
# Generic: --path "D:\WORK_EXPOGROWTH\AB-test\<CLIENT>\<TEST_NAME>\shopify\theme"
# Relative: --path ../AB-test/<CLIENT>/<TEST_NAME>/shopify/theme
```

Example:
```bash
shopify theme pull --theme "#163786653953" --path "D:\WORK_EXPOGROWTH\AB-test\ScrapArmor\T01-Home-Hero\shopify\theme" --store teststore-k0li1x4i.myshopify.com
or try without "#"
```

Enter store password when prompted.

---

## Step 6: Initialize Git Repository

```bash
cd D:\WORK_EXPOGROWTH\AB-test\ScrapArmor\T01-Home-Hero\shopify\theme
git init
git add .
git commit -m "shopify copy theme pull"
```

---

## Step 7: Start Local Development Server

**Important:** You must be in the theme directory first!

```bash
cd D:\WORK_EXPOGROWTH\AB-test\ScrapArmor\T01-Home-Hero\shopify\theme
shopify theme dev --store your-store.myshopify.com
```

Open in browser: `http://127.0.0.1:9292`

---

## Step 8: Make Changes & Push to Shopify

### Edit files locally
Make changes in `sections/`, `templates/`, `snippets/`, etc. inside `AB-test/<CLIENT>/<TEST>/shopify/theme`

### Commit changes to Git
```bash
git add .
git commit -m "description of changes"
```

### Push to Shopify Copy Theme
```bash
shopify theme push --theme "#THEME_ID" --store your-store.myshopify.com
```

---

## Useful Commands

### Theme Management
```bash
# List all themes
shopify theme list --store your-store.myshopify.com

# Pull specific theme
shopify theme pull --theme "#THEME_ID" --path "D:\WORK_EXPOGROWTH\AB-test\<CLIENT>\<TEST>\shopify\theme" --store your-store.myshopify.com

# Push changes to theme
shopify theme push --theme "#THEME_ID" --store your-store.myshopify.com

# Create new unpublished theme
shopify theme push --unpublished --store your-store.myshopify.com
```

### Development Server
```bash
# Start dev server (must be in theme directory)
shopify theme dev --store your-store.myshopify.com

# Start on custom port
shopify theme dev --store your-store.myshopify.com --port 8080
```

### Authentication
```bash
# Login
shopify auth login

# Login with specific store
shopify auth login --store your-store.myshopify.com

# Logout
shopify auth logout
```

### Git Commands
```bash
# Initialize repo
git init

# Add all files
git add .

# Commit changes
git commit -m "your message"

# Check status
git status

# View commit history
git log --oneline
```

---

## Project Structure

```
D:\WORK_EXPOGROWTH\
├── ab_testing-starter_kit\          ← LIGHT, docs only
│   ├── AI\
│   ├── ClientData\
│   └── scripts\
└── AB-test\                         ← HEAVY, actual code per developer path may vary
    └── <CLIENT>\                    ← e.g., ScrapArmor, ALTIUM
        └── <TEST_NAME>\             ← e.g., T01-Home-Hero
            ├── variation1\          ← CRO variation
            ├── v1.json
            └── shopify\
                └── theme\           ← Your Shopify theme (AB-test/<CLIENT>/<TEST>/shopify/theme)
                    ├── assets/
                    ├── config/
                    ├── layout/
                    ├── locales/
                    ├── sections/
                    ├── snippets/
                    └── templates/
```

> **Reff path:** Always use `AB-test/<CLIENT>/<TEST_NAME>/shopify/theme`. In docs use relative `../AB-test/...` or env var `AB_TEST_ROOT=D:\WORK_EXPOGROWTH\AB-test` to handle per-device path differences.

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY STORE                            │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ Original     │ copy │ Copy Theme   │                    │
│  │ Theme (Prod) │ ───► │ (Testing)    │                    │
│  └──────────────┘      └──────┬───────┘                    │
└───────────────────────────────┼─────────────────────────────┘
                                │
                    shopify theme pull
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 LOCAL COMPUTER                              │
│  ┌──────────────────────────────────────┐                  │
│  │ AB-test/<CLIENT>/<TEST>/shopify/theme  ← Edit here      │
│  │ ├── assets/                          │                  │
│  │ ├── sections/  ← Edit files here    │                  │
│  │ ├── templates/                       │                  │
│  │ └── ...                              │                  │
│  └──────────────────┬───────────────────┘                  │
│                     │                                       │
│               git add . && git commit                       │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────┐                  │
│  │ Git Repository (Version Control)     │                  │
│  │ - Track all changes                  │                  │
│  │ - Undo if needed                     │                  │
│  │ - Backup                            │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                                │
                    shopify theme push
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY STORE                            │
│  ┌──────────────┐                                           │
│  │ Copy Theme   │ ← Updated with local changes             │
│  │ (Testing)    │                                           │
│  └──────────────┘                                           │
│                                                             │
│  Test here, then manually publish to production             │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### "Command not found" error
```bash
# Make sure Shopify CLI is installed
npm install -g @shopify/cli@latest

# Check version
shopify version
```

### "Not in theme directory" error
```bash
# Navigate to AB-test theme directory first
cd D:\WORK_EXPOGROWTH\AB-test\<CLIENT>\<TEST_NAME>\shopify\theme

# Then run command
shopify theme dev --store your-store.myshopify.com
```

### "Store is required" error
```bash
# Add --store flag
shopify theme list --store your-store.myshopify.com
```

### Page not found on localhost
- Make sure you're in the correct theme directory (`AB-test/.../shopify/theme`)
- Check terminal output for errors
- Try: `http://127.0.0.1:9292`

### Theme pull fails
- Check if theme ID is correct (starts with #)
- Make sure store password is correct
- Verify you have access to the theme

### Path varies per developer
- Use relative: `../AB-test/<CLIENT>/<TEST>/shopify/theme` from `starter_kit`
- Or set env var: `AB_TEST_ROOT=D:\WORK_EXPOGROWTH\AB-test` and use `$AB_TEST_ROOT/<CLIENT>/...`

---

## Best Practices

1. **Always be in AB-test theme directory** before running Shopify commands (`AB-test/<CLIENT>/<TEST>/shopify/theme`)
2. **Commit frequently** with descriptive messages
3. **Test on copy theme** before publishing to production
4. **Use Git** to track all changes in `AB-test` repo
5. **Never push directly** to production theme
6. **Pull before push** to avoid conflicts
7. **Keep starter_kit lightweight** — no theme files inside it

---

## Quick Reference Card

```bash
# Setup (one time) — AB-test sibling on D: drive
npm install -g @shopify/cli@latest
shopify auth login --store your-store.myshopify.com
mkdir "D:\WORK_EXPOGROWTH\AB-test\<CLIENT>\<TEST_NAME>\shopify\theme"
shopify theme pull --theme "#THEME_ID" --path "D:\WORK_EXPOGROWTH\AB-test\<CLIENT>\<TEST_NAME>\shopify\theme" --store your-store.myshopify.com
cd "D:\WORK_EXPOGROWTH\AB-test\<CLIENT>\<TEST_NAME>\shopify\theme"
git init && git add . && git commit -m "initial pull"

# Daily workflow
cd "D:\WORK_EXPOGROWTH\AB-test\<CLIENT>\<TEST_NAME>\shopify\theme"
shopify theme dev --store your-store.myshopify.com
# ... edit files in AB-test/<CLIENT>/<TEST>/shopify/theme ...
git add . && git commit -m "your changes"
shopify theme push --theme "#THEME_ID" --store your-store.myshopify.com
```
