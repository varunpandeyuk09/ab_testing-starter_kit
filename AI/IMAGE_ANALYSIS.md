# Image Analysis Checklist — Figma Screenshot Parse

> **RULE: Do not code immediately after seeing an image. Analyze first, then code.**

---

## Step 1: Zoom In
- Open the image at full size
- Zoom into every element
- Do not miss small details (icons, lines, shadows, colors)

---

## Step 2: Understand Structure

| Check | What to Look For |
|-------|------------------|
| **Layout** | Grid, flex, columns, rows? |
| **Sections** | How many distinct sections? |
| **Hierarchy** | Which element is bigger, which is smaller? |
| **Alignment** | Left, center, right? |
| **Grouping** | Are related items grouped together? |

---

## Step 3: Map Spacing

| Property | What to Look For |
|----------|------------------|
| **Padding** | How much space inside the element? |
| **Margin** | How much space outside the element? |
| **Gap** | How much space between items? |
| **Border Radius** | How rounded are the corners? (0 = sharp, 8 = slightly round, 12+ = round) |

---

## Step 4: Identify Colors

| Element | What to Look For |
|---------|------------------|
| **Page Background** | What is it? (white, off-white, gray) |
| **Element Background** | Are cards/boxes different from page? |
| **Primary Color** | Headings, values, important text |
| **Secondary Color** | Descriptions, labels |
| **Accent Color** | Buttons, highlights, icons |
| **Borders** | What color are borders? |
| **Separators** | What color are lines? |

---

## Step 5: Note Typography

| Element | What to Look For |
|---------|------------------|
| **Headings** | Size, weight (bold/semi-bold/normal), color |
| **Values/Numbers** | Size, weight, color |
| **Body Text** | Size, weight, color |
| **Labels** | Uppercase or lowercase? Size? |
| **Line Height** | Is text tight or loose? |

---

## Step 6: Borders and Separators

| Check | What to Look For |
|-------|------------------|
| **Borders** | Does element have border or not? |
| **Border Style** | Solid, dashed, dotted? |
| **Border Width** | 1px, 2px? |
| **Border Color** | What color? |
| **Separators** | Vertical line or horizontal? |
| **Separator Position** | Between items or at section end? |

---

## Step 7: Shadows and Effects

| Check | What to Look For |
|-------|------------------|
| **Box Shadow** | Shadow present or not? |
| **Shadow Style** | Subtle or bold? |
| **Hover Effects** | Does anything change on hover? |

---

## Step 8: Responsive/Mobile

| Property | Desktop | Mobile |
|----------|---------|--------|
| **Layout** | Columns | Stacked? |
| **Gap** | ? | ? |
| **Font Size** | ? | ? |
| **Padding** | ? | ? |
| **Border Radius** | ? | ? |
| **Separators** | Vertical? | Horizontal? |
| **Alignment** | ? | ? |

---

## Step 9: Component Type Check

Understand the component type, analyze accordingly:

| Component | Special Checks |
|-----------|----------------|
| **Cards** | Gap vs separator, background color, border radius |
| **Buttons** | Color, size, border radius, text color, hover state |
| **Forms** | Input borders, focus state, labels, error state |
| **Banners** | Full-width or contained? Close button? |
| **Modals** | Overlay color, close position, padding |
| **Navigation** | Active state, underline, color change |
| **Lists** | Bullets vs numbers, spacing, separators |
| **Tables** | Header style, row borders, zebra striping |
| **Badges** | Size, color, position, border radius |
| **Icons** | Size, color, alignment |

---

## Step 10: Confirm

**If unclear, ask first:**
- Element is not clearly visible
- Cannot identify color
- Not sure if gap or separator
- Do not know how it looks on mobile
- Not sure if border radius is on all elements or only container

---

## Quick Reference

```
SHARP CORNERS     → border-radius: 0
SLIGHTLY ROUND    → border-radius: 4-8px
ROUND             → border-radius: 12px+
PILL               → border-radius: 9999px

NO GAP             → gap: 0, items connected
SMALL GAP          → gap: 8-12px
MEDIUM GAP         → gap: 16px
LARGE GAP          → gap: 24px+

THIN SEPARATOR     → 1px solid #e5e7eb
THICK SEPARATOR    → 2px+
```

---

## TL;DR

1. **Zoom** in - look at small details
2. **Structure** - layout, hierarchy
3. **Spacing** - padding, margin, gap, radius
4. **Colors** - background, text, accent, border
5. **Typography** - size, weight, color
6. **Borders** - present or not, style, color
7. **Shadows** - subtle or bold
8. **Mobile** - compare desktop vs mobile
9. **Component type** - cards, buttons, forms etc.
10. **Confirm** if in doubt
