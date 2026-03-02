---
name: Doczai Design System
description: A comprehensive UI/UX design system inspired by doczai.webflow.io — a modern, warm, documentation-style template featuring mesh gradients, cream backgrounds, lavender accents, and clean typography. Use this skill to guide the visual design of any web project.
---

# Doczai Design System — UI/UX Skill Guide

> **Source Reference**: [doczai.webflow.io](https://doczai.webflow.io/)
> **Aesthetic**: Modern-warm minimalism with soft depth, mesh gradients, and approachable documentation-style layouts.

Use this file as a design blueprint when building any web project. Every section below provides exact tokens, patterns, and CSS-ready values so an AI agent can immediately apply the Doczai aesthetic to a custom codebase.

---

## 1. Design Philosophy

| Principle | Description |
|---|---|
| **Warm Minimalism** | Clean layouts with generous whitespace, avoiding cold corporate aesthetics by using cream/beige tones instead of pure white |
| **Soft Depth** | Thin borders (1px) and subtle background shifts instead of heavy box-shadows — depth through color, not shadow |
| **Approachable Authority** | Large, bold headings with tight letter-spacing convey expertise; light body text and rounded shapes keep it friendly |
| **Gradient Accents** | Soft mesh gradients (blue → green → lavender) used sparingly for hero sections and footers to add visual interest without overwhelming |
| **Content-First** | Typography hierarchy and spacing guide the eye; decorative elements support — never compete with — the content |

---

## 2. Color Palette

### 2.1 Background Colors

```css
:root {
  /* Page Backgrounds */
  --bg-page:          #F3F1EB;   /* Warm cream — primary page background */
  --bg-surface:       #FFFFFF;   /* Pure white — cards, panels, elevated surfaces */
  --bg-surface-muted: #F5F5F0;   /* Light grey-cream — secondary surfaces, expanded accordions */
  --bg-overlay:       #EDEDED;   /* Neutral grey — sidebar items, muted containers */

  /* Gradient Backgrounds (Hero & Footer) */
  --gradient-mesh: linear-gradient(135deg,
    rgba(180, 200, 240, 0.4) 0%,      /* Soft blue */
    rgba(200, 230, 220, 0.3) 40%,      /* Mint-teal */
    rgba(220, 210, 240, 0.3) 70%,      /* Lavender */
    rgba(200, 230, 210, 0.2) 100%      /* Light green */
  );
}
```

### 2.2 Text Colors

```css
:root {
  --text-primary:    #000000;    /* Deep black — headings, primary labels */
  --text-body:       #6B6B6B;    /* Muted grey — body copy, descriptions */
  --text-secondary:  #888888;    /* Light grey — captions, metadata, timestamps */
  --text-inverse:    #FFFFFF;    /* White — text on dark buttons */
}
```

### 2.3 Accent Colors

```css
:root {
  --accent-primary:    #A8A5E6;  /* Soft lavender — icons, active states, links, underlines */
  --accent-primary-hover: #8E8AD4; /* Darker lavender — hover state */
  --accent-dark:       #000000;  /* Black — primary CTA buttons */
  --accent-dark-hover: #222222;  /* Near-black — button hover */
  --border-default:    #E5E5E0;  /* Warm light grey — card borders, dividers */
  --border-hover:      #D0D0CB;  /* Slightly darker — hover state borders */
}
```

### 2.4 Color Usage Rules
- **NEVER** use pure white `#FFFFFF` as the page background — always use the warm cream `#F3F1EB`
- **Cards** float on white `#FFFFFF` surfaces against the cream background for natural elevation
- **Gradients** are reserved for hero sections and footer sections only — never inside cards
- **Lavender accent** is used for: active tab underlines, icon strokes, "Know More" link text, sidebar icon colors
- **Black** is for headings and primary CTA buttons only — never for body text

---

## 3. Typography

### 3.1 Font Stack

```css
:root {
  --font-primary: 'Gelion', 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}
```

> **Substitute Guidance**: If Gelion is unavailable, use **Inter** (Google Fonts) as the closest match. Both are rounded geometric sans-serifs with similar x-heights.

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `--text-display` | 56–72px | 700 (Bold) | 1.05 | -0.03em (tight) | Hero headlines, page titles |
| `--text-h1` | 42–48px | 700 (Bold) | 1.1 | -0.02em | Section headings |
| `--text-h2` | 32–36px | 600 (SemiBold) | 1.15 | -0.015em | Subsection headings |
| `--text-h3` | 24–28px | 600 (SemiBold) | 1.2 | -0.01em | Card titles, accordion headers |
| `--text-h4` | 18–20px | 600 (SemiBold) | 1.3 | 0 | Small headings, labels |
| `--text-body-lg` | 18px | 300 (Light) | 1.6 | 0 | Lead paragraphs, hero subtitles |
| `--text-body` | 16px | 300 (Light) | 1.625 (26px) | 0 | Default body copy |
| `--text-small` | 14px | 400 (Regular) | 1.5 | 0 | Captions, breadcrumbs, metadata |
| `--text-xs` | 12px | 500 (Medium) | 1.4 | 0.02em | Badges, labels, counters |

### 3.3 Typography Rules
- **Headings** always use **tight letter-spacing** (negative tracking) for a compact, premium feel
- **Body text** uses **Light (300) weight** — never Regular or Medium for paragraphs
- **All serif fonts are forbidden** — the entire system is sans-serif
- **"Know More →"** links use the accent lavender color with a long arrow character (`→` or `⟶`)
- **FAQ numbering** uses bold weight with period notation: `01.`, `02.`, etc.

---

## 4. Spacing System

### 4.1 Base Unit: 8px Grid

```css
:root {
  --space-1:  4px;    /* Micro: icon-to-label gap */
  --space-2:  8px;    /* Tiny: inline element padding */
  --space-3:  12px;   /* Small: compact component internal padding */
  --space-4:  16px;   /* Default: standard component padding */
  --space-5:  24px;   /* Medium: card internal padding, gap between card elements */
  --space-6:  32px;   /* Large: gap between cards in a grid */
  --space-7:  48px;   /* XL: section vertical padding */
  --space-8:  64px;   /* 2XL: major section separation */
  --space-9:  96px;   /* 3XL: hero section vertical padding */
  --space-10: 128px;  /* 4XL: page-level breathing room */
}
```

### 4.2 Spacing Rules
- **Between section blocks**: `48px–96px` — generous spacing prevents visual crowding
- **Inside cards**: `24px–32px` padding on all sides
- **Between grid items**: `24px–32px` gap
- **Between heading and body text**: `12px–16px`
- **Between body text and CTA link**: `24px`
- The overall feel should be **airy and breathable** — when in doubt, add more space

---

## 5. Border & Radius System

```css
:root {
  /* Border */
  --border-width:  1px;
  --border-style:  solid;
  --border-color:  var(--border-default);  /* #E5E5E0 */

  /* Border Radius */
  --radius-sm:     6px;    /* Small buttons, tags */
  --radius-md:     8px;    /* Buttons, input fields */
  --radius-lg:     12px;   /* Cards, panels */
  --radius-xl:     16px;   /* Large cards, hero elements */
  --radius-full:   9999px; /* Pill shapes, avatar circles */
}
```

### 5.1 Border Rules
- **Cards** use `1px solid #E5E5E0` borders — no box-shadow
- **Hover state** changes border to `#D0D0CB` — subtle darkening
- **Sidebar menu items** are separated by `1px` border-bottom dividers
- **Accordion items** have borders on all sides forming a box
- **Never use thick borders** (2px+) — the aesthetic is always thin and delicate

---

## 6. Component Library

### 6.1 Navigation — Header

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔗 Logo        Topics▾   FAQ   Support   Forum▾   Utilities▾   [■ Open A Ticket] │
└─────────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Position**: Sticky top, full-width
- **Background**: `var(--bg-page)` (cream) or transparent blending into hero gradient
- **Height**: `72–80px`
- **Logo**: Left-aligned, black logotype with icon
- **Nav Links**: Center-aligned, `16px`, `font-weight: 400`, `color: var(--text-primary)`
- **Dropdowns**: Indicated by `▾` chevron with subtle rotation animation (`180deg` on open)
- **CTA Button**: Right-aligned, solid black rectangle with white text (`padding: 12px 24px`, `border-radius: 0` — intentionally sharp corners on CTA)

```css
.nav-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-7);
  height: 76px;
  background: var(--bg-page);
  border-bottom: 1px solid transparent; /* appears on scroll */
}

.nav-cta {
  background: var(--accent-dark);
  color: var(--text-inverse);
  padding: 14px 28px;
  border: none;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.nav-cta:hover {
  background: var(--accent-dark-hover);
}
```

---

### 6.2 Hero Section

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ░░░ MESH GRADIENT BACKGROUND ░░░                 │
│                                                                     │
│              Hello 👋! what can we                                  │
│              help you find?                                         │
│                                                                     │
│    Subtitle text in light grey, 18px, max-width ~700px centered     │
│                                                                     │
│              ┌──────────────────────────────────┐                   │
│              │  🔍  Search knowledge base...     │                   │
│              └──────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Background**: `var(--gradient-mesh)` — soft pastel mesh gradient (blue-teal-lavender-green)
- **Padding**: `96px 0` top and bottom (airy, spacious)
- **Headline**: Display size (`56–72px`), bold, tight tracking, centered, black text
- **Emoji**: Inline emoji (👋) adds warmth and personality
- **Subtitle**: `18px`, light weight, muted grey, centered, `max-width: 700px`
- **Search bar** (optional): White background, thin border, rounded corners (`12px`), centered, `max-width: 600px`

```css
.hero {
  background: var(--gradient-mesh);
  padding: var(--space-9) var(--space-7);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
}

.hero-title {
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: var(--text-primary);
}

.hero-subtitle {
  font-size: 18px;
  font-weight: 300;
  color: var(--text-body);
  max-width: 700px;
  line-height: 1.6;
}
```

---

### 6.3 Category / Feature Cards (3-Column Grid)

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  ◇ (icon)           │  │  📈 (icon)           │  │  ◠ (icon)            │
│                     │  │                     │  │                     │
│  Setting Up         │  │  Using Doczai       │  │  Account            │
│                     │  │                     │  │                     │
│  Description text   │  │  Description text   │  │  Description text   │
│  in muted grey...   │  │  in muted grey...   │  │  in muted grey...   │
│                     │  │                     │  │                     │
│  Know More  →       │  │  Know More  →       │  │  Know More  →       │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

**Specifications:**
- **Layout**: CSS Grid, 3 columns on desktop, 2 on tablet, 1 on mobile
- **Gap**: `24–32px`
- **Card Background**: `var(--bg-surface)` (white)
- **Card Border**: `1px solid var(--border-default)`
- **Card Radius**: `var(--radius-lg)` (12px)
- **Card Padding**: `32px`
- **Shadow**: `none` — elevation comes from white-on-cream contrast
- **Icon**: Line-style, `40–48px`, lavender stroke (`var(--accent-primary)`), positioned top-left
- **Title**: `24px`, bold, black, `margin-top: 24px`
- **Description**: `16px`, light, grey, `margin-top: 12px`
- **Link**: `"Know More →"` in lavender accent, bold, `margin-top: 24px`

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  padding: var(--space-7) 0;
}

.card {
  background: var(--bg-surface);
  border: var(--border-width) var(--border-style) var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  color: var(--accent-primary);
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: var(--space-5);
  letter-spacing: -0.01em;
}

.card-description {
  font-size: 16px;
  font-weight: 300;
  color: var(--text-body);
  margin-top: var(--space-3);
  line-height: 1.625;
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-primary);
  margin-top: var(--space-5);
  text-decoration: none;
  transition: color 0.2s ease;
}

.card-link:hover {
  color: var(--accent-primary-hover);
}

.card-link::after {
  content: '→';
  font-size: 18px;
  transition: transform 0.2s ease;
}

.card-link:hover::after {
  transform: translateX(4px);
}
```

---

### 6.4 Sidebar Navigation (Documentation Pages)

```
┌──────────────────────┐
│  Home                │
├──────────────────────┤
│  🔒 Shortcodes    › │
├──────────────────────┤
│  ▦  Categories     › │
├──────────────────────┤
│  📄 Content        › │
├──────────────────────┤
│  🗺  Tour           › │
└──────────────────────┘
```

**Specifications:**
- **Width**: `280–320px`, fixed on desktop
- **Background**: `var(--bg-surface)` (white)
- **Border**: `1px solid var(--border-default)` around the container
- **Border-radius**: `var(--radius-lg)` (12px)
- **Menu items**: Rows with `padding: 16px 20px`, separated by `1px` border-bottom
- **Item layout**: Icon (lavender, 20px) → Label (16px, semibold, black) → Chevron `›` (grey, right-aligned)
- **Active state**: Background shifts to `var(--bg-surface-muted)`, lavender left border accent
- **Chevron**: Circular grey background, `24px` diameter

```css
.sidebar {
  width: 300px;
  background: var(--bg-surface);
  border: var(--border-width) var(--border-style) var(--border-color);
  border-radius: var(--radius-lg);
  position: sticky;
  top: 96px;
  align-self: flex-start;
  overflow: hidden;
}

.sidebar-title {
  font-size: 24px;
  font-weight: 700;
  padding: var(--space-5);
  border-bottom: 1px solid var(--border-default);
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-default);
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 16px;
  transition: background 0.15s ease;
}

.sidebar-item:last-child {
  border-bottom: none;
}

.sidebar-item:hover {
  background: var(--bg-surface-muted);
}

.sidebar-item-icon {
  color: var(--accent-primary);
  width: 20px;
  height: 20px;
}

.sidebar-item-chevron {
  margin-left: auto;
  width: 24px;
  height: 24px;
  background: var(--bg-overlay);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-secondary);
}
```

---

### 6.5 Documentation Layout (Sidebar + Content)

```
┌──────────┬──────────────────────────────────────────────┐
│ Sidebar  │  Breadcrumb: Home > Category > Page          │
│          │                                              │
│          │  ┌──────────────────┐  ┌──────────────────┐  │
│          │  │  →               │  │  →               │  │
│          │  │  Article Title   │  │  Article Title   │  │
│          │  │  Description...  │  │  Description...  │  │
│          │  │  Know More       │  │  Know More       │  │
│          │  └──────────────────┘  └──────────────────┘  │
│          │                                              │
│          │  ┌──────────────────┐                        │
│          │  │  →               │                        │
│          │  │  Article Title   │                        │
│          │  │  Description...  │                        │
│          │  │  Know More       │                        │
│          │  └──────────────────┘                        │
└──────────┴──────────────────────────────────────────────┘
```

**Specifications:**
- **Layout**: `display: flex`, sidebar 300px fixed + content area fills remaining space
- **Breadcrumb**: `Home > Category > Page` — `14px`, muted grey, with `>` separators
- **Content area**: 2-column grid of article cards
- **Article cards**: Same as category cards but feature a top-right arrow icon (`→`) instead of a left icon
- **Arrow icon**: Lavender color, `24px`
- **Gap between sidebar and content**: `32–48px`

```css
.doc-layout {
  display: flex;
  gap: var(--space-7);
  padding: var(--space-7);
  max-width: 1400px;
  margin: 0 auto;
}

.doc-content {
  flex: 1;
  min-width: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

.breadcrumb a {
  color: var(--text-secondary);
  text-decoration: none;
}

.breadcrumb a:hover {
  color: var(--accent-primary);
}

.breadcrumb-separator::before {
  content: '>';
  margin: 0 var(--space-1);
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}
```

---

### 6.6 Tabs Component

```
┌─────────────────────────────────────────┐
│  Explorer    Lorem    Numquam           │
│  ━━━━━━━━                              │  ← lavender underline on active tab
├─────────────────────────────────────────┤
│                                         │
│  Tab content panel with body text...    │
│                                         │
└─────────────────────────────────────────┘
```

**Specifications:**
- **Tab headers**: Inline row, `16px`, regular weight for inactive, semibold for active
- **Active indicator**: `2px` bottom border in `var(--accent-primary)` (lavender)
- **Inactive color**: `var(--text-secondary)` — no underline
- **Content panel**: `var(--bg-surface-muted)` background, `24px` padding, `12px` border-radius
- **Transition**: Smooth underline slide (`0.3s ease`)

```css
.tabs-header {
  display: flex;
  gap: var(--space-6);
  border-bottom: 1px solid var(--border-default);
  margin-bottom: var(--space-5);
}

.tab {
  padding: var(--space-3) 0;
  font-size: 16px;
  font-weight: 400;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab.active,
.tab:hover {
  color: var(--accent-primary);
  font-weight: 600;
  border-bottom-color: var(--accent-primary);
}

.tab-panel {
  background: var(--bg-surface-muted);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  font-size: 16px;
  line-height: 1.625;
  color: var(--text-body);
}
```

---

### 6.7 Accordion / Toggle Component

```
┌─────────────────────────────────────────────────────────┐
│  Super Professional                              ✓ (↓)  │ ← expanded: grey bg
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Body content text... Light weight, grey color...       │
│                                                         │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Dashboard                                        › (→) │ ← collapsed: white bg
└─────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Container**: `1px` border all around, `0` border-radius (sharp edges on accordions)
- **Header**: `padding: 20px 24px`, `18–20px` font, semibold, flex with space-between
- **Collapsed state**: White background, chevron points right `›`
- **Expanded state**: Header background shifts to `var(--bg-surface-muted)` (grey), chevron rotates to `✓` (down), border between header and content
- **Content**: `padding: 24px`, light weight, grey text
- **Animation**: Height transition `0.3s ease`, chevron rotation `0.2s ease`

```css
.accordion-item {
  border: var(--border-width) var(--border-style) var(--border-color);
  margin-bottom: -1px; /* collapse adjacent borders */
  overflow: hidden;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-5);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-surface);
  cursor: pointer;
  transition: background 0.2s ease;
}

.accordion-item.active .accordion-header {
  background: var(--bg-surface-muted);
}

.accordion-chevron {
  transition: transform 0.2s ease;
  font-size: 20px;
  color: var(--text-secondary);
}

.accordion-item.active .accordion-chevron {
  transform: rotate(180deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: 0 var(--space-5);
}

.accordion-item.active .accordion-content {
  max-height: 500px;
  padding: var(--space-5);
}
```

---

### 6.8 FAQ Grid (2-Column Numbered)

```
┌────────────────────────────────┐  ┌────────────────────────────────┐
│ 01.  Question text here?    +  │  │ 06.  Question text here?    +  │
└────────────────────────────────┘  └────────────────────────────────┘
┌────────────────────────────────┐  ┌────────────────────────────────┐
│ 02.  Question text here?    +  │  │ 07.  Question text here?    +  │
└────────────────────────────────┘  └────────────────────────────────┘
```

**Specifications:**
- **Layout**: 2-column grid
- **Item**: White background card, thin border, `padding: 20px 24px`
- **Number**: Bold, `18px`, inline with question text, format `01.`, `02.`, etc.
- **Question**: `16–18px`, semibold, black
- **Expand icon**: `+` symbol on the right, rotates 45° to become `×` when expanded
- **Spacing between rows**: `16px`

```css
.faq-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.faq-item {
  background: var(--bg-surface);
  border: var(--border-width) var(--border-style) var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.2s ease;
}

.faq-item:hover {
  background: var(--bg-surface-muted);
}

.faq-number {
  font-weight: 700;
  font-size: 18px;
  color: var(--text-primary);
  margin-right: var(--space-3);
  min-width: 32px;
}

.faq-question {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.faq-toggle {
  font-size: 20px;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.faq-item.active .faq-toggle {
  transform: rotate(45deg);
}
```

---

### 6.9 CTA / "Still Need Help?" Section

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐  │
│  │                          │  │                              │  │
│  │  Fill in a support       │  │  Frequently asked            │  │
│  │  ticket                  │  │  questions                   │  │
│  │                          │  │                              │  │
│  │  Description text...     │  │  Description text...         │  │
│  │                          │  │                              │  │
│  │  Know More  →            │  │  Know More  →                │  │
│  │                          │  │                              │  │
│  └──────────────────────────┘  └──────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Layout**: 2-column grid, centered text within each card
- **Card style**: `var(--bg-surface-muted)` background (not white — slightly muted)
- **Title**: `28–32px`, bold
- **Description**: `16px`, light, grey, centered
- **CTA**: `"Know More →"` in black (not lavender here), centered
- **Section padding**: `64px 0`

---

### 6.10 Footer

```
┌──────────────────────────────────────────────────────────────────┐
│  ░░░ MESH GRADIENT BACKGROUND ░░░                                │
│                                                                  │
│  Stay in touch with us!                                          │
│  Description text...                                             │
│                                                                  │
│  Links Column 1    Links Column 2    Social Icons                │
│  Topics            Style Guide       □ □ □ □                     │
│  FAQ               Password                                      │
│  Support            404                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- **Background**: `var(--gradient-mesh)` — matches the hero gradient for visual bookending
- **Title**: `36–42px`, bold, black, tight tracking
- **Description**: `16px`, light, grey
- **Links**: Organized in columns, `14px`, grey, simple text links
- **Social Icons**: Small square icons (Facebook, Skype, Twitter, LinkedIn), 24px
- **Padding**: `64–96px` vertical
- **Max-width**: `1200px` centered container

```css
.footer {
  background: var(--gradient-mesh);
  padding: var(--space-8) var(--space-7);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-title {
  font-size: clamp(32px, 4vw, 42px);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-7);
}

.footer-link {
  font-size: 14px;
  color: var(--text-body);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--text-primary);
}
```

---

## 7. Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 480px)  { /* Small mobile   */ }
@media (min-width: 768px)  { /* Tablet         */ }
@media (min-width: 1024px) { /* Small desktop  */ }
@media (min-width: 1280px) { /* Large desktop  */ }
@media (min-width: 1440px) { /* XL desktop     */ }
```

### 7.1 Responsive Rules

| Breakpoint | Grid Columns | Sidebar | Hero Font | Card Padding |
|---|---|---|---|---|
| < 768px | 1 column | Hidden (hamburger) | 36px | 20px |
| 768–1023px | 2 columns | Collapsible drawer | 48px | 24px |
| ≥ 1024px | 3 columns | Fixed 300px | 56–72px | 32px |

- **Mobile**: Sidebar becomes a slide-out drawer from left, triggered by hamburger icon
- **Tablet**: 2-column grids, sidebar collapses to icon-only or overlay
- **Desktop**: Full 3-column grids, persistent sidebar

---

## 8. Animation & Transitions

### 8.1 Micro-Interactions

```css
:root {
  --ease-default:   cubic-bezier(0.4, 0, 0.2, 1);   /* Material standard */
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);     /* Elements entering */
  --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);     /* Elements leaving */
  --duration-fast:   150ms;
  --duration-normal: 200ms;
  --duration-slow:   300ms;
}
```

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Card hover | `translateY(-2px)` lift + border darken | 200ms | ease |
| Link hover arrow | Arrow slides right `translateX(4px)` | 200ms | ease |
| Tab switch underline | Underline slides to new tab | 300ms | ease |
| Accordion expand | `max-height` transition | 300ms | ease |
| Accordion chevron | Rotate `180deg` | 200ms | ease |
| FAQ `+` toggle | Rotate `45deg` to become `×` | 200ms | ease |
| Button hover | Background lightened | 200ms | ease |
| Sidebar item hover | Background shifts to muted | 150ms | ease |
| Page load | Content fades in from bottom | 400ms | decelerate |

### 8.2 Animation Rules
- **Never use bounce or spring physics** — all transitions are smooth and controlled
- **Keep durations short** (150–300ms) — the design is snappy, not playful
- **Hover states are subtle** — 2px lifts, not 8px; slight color shifts, not dramatic changes
- **Page transitions** (if using SPA): cross-fade content area, sidebar stays static

---

## 9. Icon System

### 9.1 Icon Style
- **Type**: Line/outline icons only — never filled/solid
- **Stroke width**: `1.5–2px`
- **Size**: `20px` (inline), `40–48px` (featured on cards)
- **Color**: `var(--accent-primary)` (lavender) as default, `var(--text-secondary)` for muted states
- **Library recommendation**: [Lucide Icons](https://lucide.dev/) or [Phosphor Icons](https://phosphoricons.com/) — both match the thin, rounded aesthetic

### 9.2 Icon Rules
- Always pair icons with text labels — never icon-only (except social media links)
- Sidebar icons are 20px and left-aligned before the label
- Card icons are 40–48px, positioned top-left of the card, above the title
- Chevrons (`›`, `▾`) are functional indicators, always `14–16px`

---

## 10. Adapting This Design to a Custom Project

### Step-by-Step for AI Agents

1. **Set up the CSS custom properties**: Copy all `:root` variables from Sections 2–5 into your project's global CSS file (e.g., `index.css` or `globals.css`).

2. **Apply the page background**: Set `body { background: var(--bg-page); }` — this warm cream is the foundation of the entire aesthetic.

3. **Import the font**: Add `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');` if using Inter as the Gelion substitute.

4. **Build components in this order**:
   a. Global layout (header, main, footer)
   b. Cards (the most reusable component)
   c. Sidebar navigation
   d. Tabs and accordions
   e. FAQ grid
   f. Hero and footer sections (gradient work)

5. **Adapt content structure**: Replace "Categories you may like" with your project's main features/sections. The card grid works for any content type — features, articles, settings, modules.

6. **Maintain the "Know More →" pattern**: For any link that navigates deeper, use a text link with an arrow. This creates a consistent interaction pattern throughout the app.

7. **Test the cream-on-white contrast**: The entire design depends on `#F3F1EB` page background with `#FFFFFF` card surfaces. If you change one, adjust the other to maintain the subtle elevation effect.

### Adaptation Examples

| Original Doczai Element | CivicVoice Adaptation | Any SaaS App |
|---|---|---|
| "Hello 👋! what can we help you find?" | "Report 📢! Make your voice heard" | "Welcome! What would you like to do?" |
| Category cards (Setting Up, Account...) | Feature cards (Witness Feed, Report, Evidence...) | Feature cards (Dashboard, Analytics, Settings...) |
| Sidebar (Shortcodes, Categories...) | Sidebar (My Reports, Evidence, Disputes...) | Sidebar (Projects, Teams, Billing...) |
| FAQ Grid | "How It Works" numbered guide | Help Center FAQ |
| "Know More →" links | "View Details →" or "Open →" | "Learn More →" or "Explore →" |
| "Open A Ticket" CTA | "File a Report" CTA | "Get Started" CTA |

---

## 11. Anti-Patterns — What to Avoid

| ❌ Don't Do This | ✅ Do This Instead |
|---|---|
| Pure white `#FFF` page background | Warm cream `#F3F1EB` |
| Heavy box-shadows on cards | Thin 1px borders with subtle hover darkening |
| Bold/medium weight for body text | Light (300) weight body copy |
| Bright, saturated accent colors | Muted lavender `#A8A5E6` |
| Large border-radius on accordions | Sharp or minimal radius on accordions |
| Filled/solid icons | Line/outline icons with thin strokes |
| Bounce or spring animations | Smooth, controlled 200ms easings |
| Dense, cramped layouts | Generous 48–96px section spacing |
| Multiple accent colors | Single lavender accent + black for CTAs |
| Drop-shadows for depth | White-on-cream layering for elevation |

---

## 12. Quick-Start CSS Template

Copy this into your project's `index.css` as a complete starter:

```css
/* ── DOCZAI DESIGN SYSTEM: QUICK START ── */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  /* Colors */
  --bg-page: #F3F1EB;
  --bg-surface: #FFFFFF;
  --bg-surface-muted: #F5F5F0;
  --bg-overlay: #EDEDED;
  --text-primary: #000000;
  --text-body: #6B6B6B;
  --text-secondary: #888888;
  --text-inverse: #FFFFFF;
  --accent-primary: #A8A5E6;
  --accent-primary-hover: #8E8AD4;
  --accent-dark: #000000;
  --border-default: #E5E5E0;
  --border-hover: #D0D0CB;

  /* Gradient */
  --gradient-mesh: linear-gradient(135deg,
    rgba(180, 200, 240, 0.4) 0%,
    rgba(200, 230, 220, 0.3) 40%,
    rgba(220, 210, 240, 0.3) 70%,
    rgba(200, 230, 210, 0.2) 100%
  );

  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
  --space-7: 48px; --space-8: 64px; --space-9: 96px;

  /* Radius */
  --radius-sm: 6px;  --radius-md: 8px;
  --radius-lg: 12px; --radius-xl: 16px;
  --radius-full: 9999px;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-primary);
  background: var(--bg-page);
  color: var(--text-body);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.625;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--text-primary);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--accent-primary-hover);
}
```

---

> **End of Doczai Design System Skill**
> This file is a living design reference. Update it as the design evolves or as new components are needed for specific projects.
