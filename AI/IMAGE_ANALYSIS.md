# Image Analysis Checklist — Figma Screenshot Parse

> **RULE: Do not code immediately after seeing an image. Analyze first, then code.**

---

## Step 1: Zoom In

- Open the image at full size
- Zoom into every element
- Do not miss small details (icons, lines, shadows, colors, spacing)
- Check both desktop AND mobile views if provided

---

## Step 2: Identify Component Type

What are you building? Match with real test patterns:

| Component | What to Check | Reference |
|-----------|---------------|-----------|
| **Info Box / Detail Card** | Two-column layout? Left/right split? Border separator? | DEKRA-AB01 |
| **Product Card** | Image aspect ratio, price position, badge overlay, hover state | NB-RECENTLY-VIEWED |
| **Tab Navigation** | Active tab indicator (underline/highlight), scroll behavior | DEKRA-PLP-TABS |
| **Badge / Tag** | Position (absolute?), shape (pill?), background color | NB-ADDMODEL, LP-1.11 |
| **CTA Button** | Color, size, border radius, icon, hover effect | DEKRA-AB01, LP-1.11 |
| **Carousel / Slider** | Navigation arrows, thumbnails, dots, slides visible | VIDABOX, NB-RECENTLY-VIEWED |
| **Trust Section** | Cards connected or with gap? Separator lines? Icons? | DEKRA-TRUST |
| **Hero Enhancement** | Overlap effect? Social proof? USP bar? | LP-1.11 |
| **Price Display** | Sale vs regular, strikethrough, MwSt badge, funded badge | DEKRA-AB01, NB-RECENTLY-VIEWED |
| **Benefits List** | Checkmark icons, spacing, separator lines | DEKRA-AB01 |

---

## Step 3: Layout Analysis

| Check | What to Look For |
|-------|------------------|
| **Grid vs Flex** | CSS Grid (rows+columns) or Flexbox (one direction)? |
| **Columns** | How many? Equal or asymmetric? |
| **Overlap** | Any negative margin overlap (hero cards)? |
| **Alignment** | Left, center, right aligned? |
| **Hierarchy** | Which element is bigger/primary? |

### Layout Patterns (from real tests):

```
TWO-COLUMN (DEKRA-AB01):
┌─────────────┬─────────────┐
│  Left Col   │  Right Col  │
│  (flex: 1)  │  (max-w)    │
│  border-r   │  border     │
└─────────────┴─────────────┘

THREE-CARD GRID (LP-1.11):
┌───────┐ ┌───────┐ ┌───────┐
│ Card1 │ │ Card2 │ │ Card3 │
└───────┘ └───────┘ └───────┘
  flex: 1    flex: 1    flex: 1

TAB NAVIGATION (DEKRA-PLP-TABS):
[Tab1] [Tab2] [Tab3]  ← horizontal scroll on mobile
─────────────────────
    Tab Content
```

---

## Step 4: Spacing Map

| Property | What to Look For | Common Values |
|----------|------------------|---------------|
| **Card Padding** | Inside space | 16px, 20px, 24px, 28px, 32px |
| **Section Margin** | Between sections | 24px, 32px, 40px, 48px |
| **Grid Gap** | Between cards/items | 0 (connected), 8px, 12px, 16px, 24px |
| **Icon Gap** | Between icon and text | 8px, 10px, 12px, 14px |
| **Border Radius** | Corner roundness | 0 (sharp), 4px, 6px, 8px, 12px, 19px, 9999px (pill) |

### Border Radius Guide:

```
0px        → Sharp corners (default)
4-6px      → Slight rounding (buttons)
8px        → Moderate (cards, inputs)
12px       → Round (cards, containers)
19px       → Very round (panels)
9999px     → Pill shape (badges, tags)
```

---

## Step 5: Colors Identify

| Element | What to Look For |
|---------|------------------|
| **Page Background** | White (#fff), off-white (#f8f9fa, #f9fafc), gray |
| **Card Background** | Same as page or different? |
| **Primary Color** | Headings, values, important text |
| **Secondary Color** | Descriptions, labels, muted text |
| **Accent Color** | CTAs, highlights, icons, badges |
| **Border/Separator** | Line color (#e5e7eb common) |
| **Status Colors** | Green (success), red (error), yellow (warning) |

### Color Patterns (from real tests):

```
DEKRA GREEN:    #185F24 (primary), #007d40 (CTA), #dcfce7 (icon bg)
LP GREEN:       #2ecc71 (status dot), #0b7a3a (review score)
NB GREEN:       #1a7a3c (badge bg)
GRAY SCALE:     #1a1a1a (black), #374151 (dark gray), #6b7280 (gray), #9ca3af (light gray)
BORDERS:        #e5e7eb (common), #d1d5db (alternative)
```

---

## Step 6: Typography Note

| Element | What to Look For |
|---------|------------------|
| **Headings (h1/h2)** | Size, weight (700 bold, 600 semi-bold), color |
| **Values/Numbers** | Large size, bold, accent color |
| **Body Text** | 14-16px, normal weight, gray |
| **Labels** | 10-12px, uppercase, letter-spacing, gray |
| **Line Height** | Tight (1.2-1.3) or loose (1.4-1.6) |

### Font Size Guide:

```
LABELS:     10-11px, uppercase, letter-spacing: 0.8px
SMALL TEXT: 12-13px, secondary color
BODY TEXT:  14px, normal
VALUES:     28-31px, bold, primary color
HEADINGS:   22-32px, bold
```

---

## Step 7: Borders and Separators

| Check | What to Look For |
|-------|------------------|
| **Card Borders** | Present or not? Color? Width? |
| **Separator Lines** | Vertical (between columns) or horizontal (between items)? |
| **Separator Position** | Between items? At section end? |
| **Border Radius on Borders** | Does border follow card radius? |

### Separator Patterns:

```
VERTICAL SEPARATOR (DEKRA-AB01):
┌─────────────│─────────────┐
│  Left Col   │  Right Col  │
│             │  border-r   │
└─────────────│─────────────┘
              1px solid #e5e7eb

HORIZONTAL SEPARATOR (DEKRA-TRUST mobile):
┌─────────────┐
│   Card 1    │
├─────────────┤ ← border-bottom
│   Card 2    │
├─────────────┤
│   Card 3    │
└─────────────┘

NO SEPARATOR (connected cards):
┌─────────────┬─────────────┬─────────────┐
│   Card 1    │   Card 2    │   Card 3    │
└─────────────┴─────────────┘
  gap: 0, border-right on cards
```

---

## Step 8: Shadows and Effects

| Check | What to Look For |
|-------|------------------|
| **Box Shadow** | Subtle (0 2px 8px) or bold (0 8px 24px)? |
| **Hover Effects** | Shadow increase? Translate lift? Scale? |
| **Transitions** | Smooth (0.2s-0.3s) or instant? |
| **Backdrop Filter** | Blur effect (frosted glass)? |
| **Mix Blend Mode** | multiply, screen, overlay? |

### Shadow Guide:

```
SUBTLE:   box-shadow: 0 2px 8px rgba(0,0,0,0.08)
MEDIUM:   box-shadow: 0 4px 12px rgba(0,0,0,0.1)
BOLD:     box-shadow: 0 8px 24px rgba(0,0,0,0.08)
HOVER:    box-shadow: 0 4px 12px rgba(0,0,0,0.15)
          transform: translateY(-1px)
```

---

## Step 9: Responsive/Mobile

| Property | Desktop | Mobile |
|----------|---------|--------|
| **Layout** | Multi-column | Stacked? |
| **Gap** | ? | Smaller or same? |
| **Font Size** | ? | Smaller? |
| **Padding** | ? | Reduced? |
| **Border Radius** | ? | Same or removed? |
| **Separators** | Vertical | Horizontal? |
| **Alignment** | Center? | Left? |
| **Overflow** | Visible | Horizontal scroll? |

### Mobile Patterns:

```
STACKED LAYOUT:
Desktop:  [Card1] [Card2] [Card3]
Mobile:   [Card1]
          [Card2]
          [Card3]

HORIZONTAL SCROLL (tabs):
Mobile:  [Tab1] [Tab2] [Tab3] → (scrollable)

HIDDEN ON MOBILE:
if (window.innerWidth < 767) return; // skip on mobile
```

---

## Step 10: Special Elements

| Element | What to Check |
|---------|---------------|
| **Icons** | Font Awesome? Unicode? SVG? Size? Color? |
| **Status Dots** | 8px circle, green color, absolute position |
| **Badges** | Absolute position, pill shape, background |
| **Strikethrough** | text-decoration: line-through for old price |
| **Pill Shapes** | border-radius: 9999px |
| **ARIA Attributes** | role, aria-selected, aria-label |
| **Data Attributes** | [data-soul], [data-pid], custom attributes |

---

## Step 11: Confirm

**If unclear, ask first:**
- Element is not clearly visible
- Cannot identify color (ask for hex code)
- Not sure if gap or separator
- Do not know how it looks on mobile
- Not sure if border radius is on all elements or only container
- Animation/transition details unclear
- Hover state not shown in design

---

## Quick Reference

```
SPACING:     8px (tight) → 12px → 16px → 24px → 32px → 48px (loose)
RADIUS:      0 → 4px → 8px → 12px → 19px → 9999px (pill)
FONTS:       10px (label) → 12px (small) → 14px (body) → 22px (heading) → 28px+ (value)
SHADOWS:     subtle → medium → bold
SEPARATORS:  1px solid #e5e7eb (vertical or horizontal)
```

---

## TL;DR

1. **Zoom** — see every detail
2. **Component Type** — match with real patterns
3. **Layout** — grid, flex, columns, overlap
4. **Spacing** — padding, margin, gap, radius
5. **Colors** — background, text, accent, border
6. **Typography** — size, weight, color
7. **Borders** — present or not, style, color
8. **Shadows** — subtle or bold, hover effects
9. **Mobile** — desktop vs mobile differences
10. **Special Elements** — icons, badges, dots, ARIA
11. **Confirm** — ask if in doubt
