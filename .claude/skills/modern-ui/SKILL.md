---
name: modern-ui
description: >
  Apply the BookShelf dark design system to any UI component, page, or interface.
  Use this skill whenever building or restyling ANY frontend element for the BookShelf
  app — components, pages, dashboards, modals, forms, cards, nav bars, tables, buttons,
  or full layouts. Triggers on: "make it look better", "style this", "dark theme",
  "update the UI", "redesign", "add color", "make it modern", "build a component",
  "create a page", "restyle", or any request to touch BookShelf's visual appearance.
  Enforces the exact color tokens, typography, spacing scale, and motion rules defined
  below. Never deviate from the design system.
---

# BookShelf Dark UI Design System

Enforces a consistent, modern dark-theme aesthetic across the BookShelf frontend.
Every UI component and page must conform to these rules — no exceptions.
All styling uses **Tailwind CSS utility classes** — no custom CSS or inline styles.

---

## Brand Identity

**Mood**: Refined editorial darkness. Like a late-night reading room — deep shadows,
warm amber accents, crisp type, and satisfying hover states.

**NOT**: Cold tech blue-on-black, purple gradient AI aesthetics, or neon cyberpunk.

---

## Tailwind Config — Required Extensions

The following must be present in `tailwind.config.js` under `theme.extend`:

```js
colors: {
  'bg-base':    '#0f0e0d',  // page background
  'bg-raised':  '#1a1917',  // cards, panels
  'bg-overlay': '#242220',  // modals, dropdowns
  'bg-subtle':  '#2e2b28',  // hover fills
  'accent':     '#e8a44a',  // primary CTA, links, highlights
  'accent-dim': '#b07a2e',  // pressed/active accent
  'text-primary':   '#f0ebe4',
  'text-secondary': '#a89e93',
  'text-muted':     '#6b6259',
  'text-inverse':   '#0f0e0d',
  'success': '#5cb98c',
  'error':   '#e05c5c',
  'info':    '#6aadcf',
},
fontFamily: {
  display: ['"Playfair Display"', 'Georgia', 'serif'],
  body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
  mono:    ['"JetBrains Mono"', 'monospace'],
},
fontSize: {
  'display-sm': ['1.375rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 22px
  'display-md': ['1.75rem',  { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 28px
  'display-lg': ['2.25rem',  { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 36px
},
animation: {
  'fade-up': 'fadeUp 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
},
keyframes: {
  fadeUp: {
    from: { opacity: '0', transform: 'translateY(12px)' },
    to:   { opacity: '1', transform: 'translateY(0)' },
  },
},
```

---

## Color Usage Rules

- NEVER use arbitrary hex values like `bg-[#e8a44a]` — always use the named token class (e.g. `bg-accent`)
- NEVER use `bg-black`, `bg-white`, `text-black`, or `text-white`
- `text-accent` / `bg-accent` is for ONE primary action per view, not decoration
- Cards always use `bg-bg-raised`, never `bg-bg-base`
- Border opacity variants: use `border-white/7` (7%), `border-white/14` (14%), `border-accent/40`

---

## Typography Classes

| Role | Classes |
|---|---|
| H1 (hero) | `font-display text-display-lg font-bold text-text-primary` |
| H2 (page title) | `font-display text-display-md font-bold text-text-primary` |
| H3 (section) | `font-display text-display-sm font-semibold text-text-primary` |
| Body copy | `font-body text-base text-text-secondary leading-relaxed` |
| UI label | `font-body text-sm text-text-secondary font-medium` |
| Secondary label | `font-body text-sm text-text-muted` |
| Uppercase tag | `font-body text-xs font-semibold tracking-widest uppercase text-text-muted` |
| Monospace / meta | `font-mono text-sm text-text-muted` |

---

## Spacing Reference

Map design scale to Tailwind spacing — use these, not arbitrary values:

| Design scale | Value | Tailwind |
|---|---|---|
| space-1 | 4px | `p-1` / `gap-1` |
| space-2 | 8px | `p-2` / `gap-2` |
| space-3 | 12px | `p-3` / `gap-3` |
| space-4 | 16px | `p-4` / `gap-4` |
| space-5 | 24px | `p-6` / `gap-6` |
| space-6 | 32px | `p-8` / `gap-8` |
| space-8 | 48px | `p-12` / `gap-12` |
| space-10 | 64px | `p-16` / `gap-16` |

---

## Component Patterns

### Cards

```tsx
<div className="bg-bg-raised border border-white/7 rounded-xl p-8 transition-all duration-200
                hover:border-accent/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
```

### Buttons

```tsx
{/* Primary */}
<button className="bg-accent text-text-inverse font-body font-semibold rounded-lg px-5 py-2.5
                   transition-all duration-150 hover:bg-accent-dim active:scale-[0.97]">

{/* Ghost */}
<button className="bg-transparent text-text-secondary font-body border border-white/7 rounded-lg px-5 py-2.5
                   transition-all duration-150 hover:border-white/14 hover:text-text-primary">
```

### Inputs

```tsx
<input className="w-full bg-bg-overlay border border-white/7 rounded-lg text-text-primary
                  font-body px-3.5 py-2.5 transition-colors duration-150
                  focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15
                  placeholder:text-text-muted" />
```

### Badges / Tags

```tsx
{/* Default */}
<span className="text-xs font-semibold tracking-widest uppercase py-0.5 px-2 rounded
                 bg-bg-subtle text-text-secondary border border-white/7">

{/* Accent */}
<span className="text-xs font-semibold tracking-widest uppercase py-0.5 px-2 rounded
                 bg-accent/12 text-accent border border-accent/40">
```

---

## Motion Rules

- **Duration**: `duration-100` (micro), `duration-200` (standard), `duration-[350ms]` (entrance)
- **Easing**: `ease-in-out` for hover toggles; `ease-[cubic-bezier(0.16,1,0.3,1)]` for entrances
- **Never** animate width/height — use `transition-transform` and `transition-opacity` only
- Hover effects: always include a `transition-*` class — never instant

```tsx
{/* Entrance animation */}
<div className="animate-fade-up">

{/* Staggered children — use inline style for delay only */}
<div className="animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
```

---

## Layout Rules

- Max content width: `max-w-[1200px] mx-auto`
- Page padding: `px-4 sm:px-8 lg:px-16` (approximates `clamp(16px, 5vw, 64px)`)
- Page-level layout: CSS Grid via `grid` classes (`grid-cols-[...]`)
- Component-level layout: Flexbox via `flex` classes
- Section spacing: `space-y-12` or `gap-12` between sections
- Asymmetric layouts encouraged — avoid `items-center justify-center` on hero sections

---

## Texture & Depth

Never flat solid fills on large surfaces — add ambient depth:

```tsx
{/* Hero ambient glow — use a positioned div behind content */}
<div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(232,164,74,0.08),transparent)]
                pointer-events-none" />

{/* Grain overlay on surface */}
<div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] pointer-events-none" />
```

---

## What to NEVER do

- No purple gradients, blue-on-black, or neon accents
- No `bg-black`, `bg-white`, `text-white`, `text-black`
- No `font-sans` or system font for headings — always `font-display`
- No arbitrary hex values like `bg-[#e8a44a]` — use the named token
- No instant hover states — always include a `transition-*` class
- No more than one `bg-accent` / `text-accent` usage as a primary action per view
- No perfectly symmetric `items-center justify-center` hero layouts every time
- No large surface areas without a glow or grain depth layer
