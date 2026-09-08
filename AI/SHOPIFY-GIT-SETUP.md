# Shopify + Git Local Development Setup

> Complete guide for Shopify theme development with Git version control.
> Last updated: 2026-09-08

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

## Step 4: Create Project Folder

```bash
# Navigate to your working directory
cd D:\WORK_EXPOGROWTH\ab_testing-starter_kit

# Create folder for Shopify themes
mkdir shopify-themes\copy-theme
```

---

## Step 5: Pull Copy Theme Locally

```bash
shopify theme pull --theme "#THEME_ID" --path ./shopify-themes/copy-theme --store your-store.myshopify.com
```

Example:
```bash
shopify theme pull --theme "#163786653953" --path ./shopify-themes/copy-theme --store teststore-k0li1x4i.myshopify.com
```

Enter store password when prompted.

---

## Step 6: Initialize Git Repository

```bash
cd shopify-themes\copy-theme
git init
git add .
git commit -m "shopify copy theme pull"
```

---

## Step 7: Start Local Development Server

**Important:** You must be in the theme directory first!

```bash
cd D:\WORK_EXPOGROWTH\ab_testing-starter_kit\shopify-themes\copy-theme
shopify theme dev --store your-store.myshopify.com
```

Open in browser: `http://127.0.0.1:9292`

---

## Step 8: Make Changes & Push to Shopify

### Edit files locally
Make changes in `sections/`, `templates/`, `snippets/`, etc.

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
shopify theme pull --theme "#THEME_ID" --path ./path --store your-store.myshopify.com

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
ab_testing-starter_kit/
├── AI/
├── ClientData/
├── AB-test/
└── shopify-themes/
    └── copy-theme/          ← Your Shopify theme
        ├── assets/
        ├── config/
        ├── layout/
        ├── locales/
        ├── sections/
        ├── snippets/
        └── templates/
```

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
│  │ shopify-themes/copy-theme/           │                  │
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
# Navigate to theme directory first
cd D:\WORK_EXPOGROWTH\ab_testing-starter_kit\shopify-themes\copy-theme

# Then run command
shopify theme dev --store your-store.myshopify.com
```

### "Store is required" error
```bash
# Add --store flag
shopify theme list --store your-store.myshopify.com
```

### Page not found on localhost
- Make sure you're in the correct theme directory
- Check terminal output for errors
- Try: `http://127.0.0.1:9292`

### Theme pull fails
- Check if theme ID is correct (starts with #)
- Make sure store password is correct
- Verify you have access to the theme

---

## Best Practices

1. **Always be in theme directory** before running Shopify commands
2. **Commit frequently** with descriptive messages
3. **Test on copy theme** before publishing to production
4. **Use Git** to track all changes
5. **Never push directly** to production theme
6. **Pull before push** to avoid conflicts

---

## Quick Reference Card

```bash
# Setup (one time)
npm install -g @shopify/cli@latest
shopify auth login --store your-store.myshopify.com
mkdir shopify-themes\copy-theme
shopify theme pull --theme "#THEME_ID" --path ./shopify-themes/copy-theme --store your-store.myshopify.com
cd shopify-themes\copy-theme
git init && git add . && git commit -m "initial pull"

# Daily workflow
cd D:\WORK_EXPOGROWTH\ab_testing-starter_kit\shopify-themes\copy-theme
shopify theme dev --store your-store.myshopify.com
# ... edit files ...
git add . && git commit -m "your changes"
shopify theme push --theme "#THEME_ID" --store your-store.myshopify.com
```
