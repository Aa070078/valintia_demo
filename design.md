# Valentia Design System

**Product:** Valentia — Design & Build  
**Repo path:** `fitout/` (folder name unchanged; product brand is Valentia)  
**Logo:** [`assets/brand/valentia-logo.png`](./assets/brand/valentia-logo.png)  
**Generated artifact:** [`design-system/valentia/MASTER.md`](./design-system/valentia/MASTER.md) (ui-ux-pro-max)  
**This file** is the curated contract agents and humans follow for UI work.

---

## How to use

1. Read this file before any UI / theming work.
2. Prefer CSS variables / Tailwind tokens — **never hardcode raw hex in components**.
3. For page-specific overrides, check `design-system/valentia/pages/<page>.md` first; otherwise use this document + MASTER.
4. Business meaning of statuses, payments, and roles lives in [`valentia-business.md`](./valentia-business.md).

---

## 1. Brand identity

| Field | Value |
|-------|--------|
| Name | **Valentia** |
| Tagline | **Design & Build** |
| Sector | Interior design & fit-out project platform |
| Voice | Precise, calm, premium, technical — not salesy |
| Monogram | Architectural mark combining **V** (espresso), **B** (slate), **D** (copper) with blueprint guide lines |

### Logo usage

- Prefer the full lockup (monogram + VALENTIA + DESIGN & BUILD) on white or off-white.
- Clear space: at least the height of the “V” stroke around the lockup.
- Minimum digital width for full lockup: ~120px; monogram-only: ~24px.
- Do not stretch, recolor arbitrarily, add drop shadows, or place on busy photos without a solid plate.
- Dark surfaces: use a light-plate lockup or monogram-only until a dedicated dark logo asset exists.

### Sampled logo colors (source of truth)

Sampled from `assets/brand/valentia-logo.png`:

| Token | Hex | Role in logo |
|-------|-----|----------------|
| Espresso | `#503C2C` | V stroke (primary brand) |
| Copper | `#B88460` | D arc + divider rule (accent / CTA) |
| Slate | `#707070` | Wordmark / body neutral |
| Blueprint | `#C8C8C8` | Construction guide lines |
| Surface | `#FFFFFF` / `#F8F8F8` | Background |

---

## 2. Design dials (from ui-ux-pro-max)

| Dial | Value | Meaning |
|------|-------|---------|
| Variance | 4/10 | Balanced / modern |
| Motion | 4/10 | Standard micro-interactions |
| Density | 6/10 | Standard; denser on admin dashboards |

Style direction: warm premium interior / architecture — not neon, not playful, not glassmorphism-heavy.

---

## 3. Color tokens

Map these into CSS variables (and Tailwind theme) once apps are themed.

### Brand

| Token | Hex | CSS variable |
|-------|-----|----------------|
| brand-espresso | `#503C2C` | `--color-brand-espresso` |
| brand-copper | `#B88460` | `--color-brand-copper` |
| brand-slate | `#707070` | `--color-brand-slate` |
| brand-blueprint | `#C8C8C8` | `--color-brand-blueprint` |

### Semantic (light)

| Token | Hex | Notes |
|-------|-----|--------|
| background | `#FAF8F6` | Warm off-white (skill `#FAF5F2` adjusted toward logo) |
| foreground | `#2A241F` | Near-espresso text |
| card | `#FFFFFF` | |
| muted | `#F3F0ED` | |
| muted-foreground | `#707070` | brand-slate |
| border | `#E6E0DA` | |
| primary | `#503C2C` | espresso — buttons, key chrome |
| primary-foreground | `#FFFFFF` | |
| accent | `#B88460` | copper — CTA secondary, highlights |
| accent-foreground | `#2A241F` | |
| ring | `#B88460` | focus ring |
| success | `#2F6F4E` | |
| warning | `#B45309` | |
| danger | `#B91C1C` | |
| info | `#3B5B7A` | |

### Dark mode (minimum pairs — aim ≥ 4.5:1 text contrast)

| Token | Hex |
|-------|-----|
| background | `#1A1613` |
| foreground | `#F5F0EB` |
| card | `#24201C` |
| muted | `#2E2924` |
| muted-foreground | `#A8A29E` |
| border | `#3F3832` |
| primary | `#C4A484` | lighter espresso for dark surfaces |
| accent | `#D4A574` | copper lift |

---

## 4. Typography

Logo wordmark is a clean geometric **sans**. Product UI stays sans-first; optional display serif for marketing heroes only.

| Role | Font | Weight |
|------|------|--------|
| UI / body | **Inter** (or Geist if adopted with shadcn) | 400 / 500 / 600 |
| UI headings | **Inter** | 600 / 700 |
| Marketing display (optional) | **Cinzel** | 500 / 600 |
| Marketing body (optional) | **Josefin Sans** | 300 / 400 |

Scale (base **16px**, line-height **1.5** for body):

| Token | Size | Line height |
|-------|------|-------------|
| text-xs | 12px | 1.4 |
| text-sm | 14px | 1.45 |
| text-base | 16px | 1.5 |
| text-lg | 18px | 1.5 |
| text-xl | 20px | 1.4 |
| text-2xl | 24px | 1.3 |
| text-3xl | 30px | 1.25 |
| text-4xl | 36px | 1.2 |

Letter-spacing: slightly open for uppercase labels (echoes “DESIGN & BUILD”).

Google Fonts (optional marketing):

```text
https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Josefin+Sans:wght@300;400;500;600&display=swap
```

---

## 5. Spacing, radius, shadow, motion

### Spacing (Tailwind-aligned)

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64` px. Dashboard density may prefer the tighter end; customer marketing the roomier end.

### Radius

| Token | Value |
|-------|--------|
| radius-sm | 4px |
| radius-md | 8px |
| radius-lg | 12px |
| radius-full | 9999px |

Thin architectural lines > heavy rounded blobs.

### Shadow

Subtle warm shadows only:

- `shadow-sm`: `0 1px 2px rgb(42 36 31 / 0.06)`
- `shadow-md`: `0 4px 12px rgb(42 36 31 / 0.08)`

### Motion

- Duration: **150–300ms** for UI; list stagger up to **400ms**
- Easing: ease-out / standard; avoid playful overshoot on data tables
- Honor `prefers-reduced-motion: reduce`

---

## 6. Component conventions (shadcn + Tailwind v4)

Stack already present: shadcn / Base UI / Tailwind v4 / Phosphor icons.

| Component | Convention |
|-----------|------------|
| Primary button | Espresso fill, white text, copper ring on focus |
| Secondary / outline | Border espresso or copper text on white |
| Accent CTA | Copper fill when emphasizing commercial action (pay, approve) |
| Inputs | Visible border (`border`), label above (never placeholder-only) |
| Cards | White, light border, optional `shadow-sm` |
| Tables (BOQ, procurement) | Dense, sticky header, numeric columns right-aligned |
| Dialogs | Centered, clear primary/secondary actions |
| Icons | SVG (Phosphor) — **no emoji as icons** |

Touch targets ≥ **44×44px**. Focus rings visible (copper ring).

---

## 7. Domain-specific UI patterns

### Project status chips (BRD §59)

Use a single `StatusChip` with semantic variants. Map lifecycle statuses to:

| Group | Examples | Chip tone |
|-------|----------|-----------|
| Draft / intake | Draft, Concept Selected, Drawing Uploaded | muted / slate |
| Processing | AI Processing, Under Engineer Review | info |
| Scheduling | Meeting Scheduled, Site Visit Scheduled | info |
| Paid gates | Site Visit Paid, Payment Completed | success outline |
| Design | Design In Progress, Design Delivered, Design Revision | copper accent |
| Commercial | BOQ Generated, BOQ Confirmed, Contract Pending | espresso |
| Execution | Execution, Final Inspection | success |
| Terminal | Handover, Completed | success solid |
| Risk | Delayed / overdue (ops) | danger / warning |

Never invent a status string in UI that the backend does not own.

### Phase / progress (BRD §40)

Show phase bars: Design / BOQ / Contract / Execution with percentages. Overall % is secondary to **current phase + next action**.

### Payment-gate states (BRD §48)

Before gate clears: disabled primary + helper “Payment required”. After server-verified success: unlock CTA. Never treat client-side “paid” as truth.

### Data-trust badges (BRD §17)

Badge source types:

| Source | Badge |
|--------|--------|
| Customer Entered | slate |
| CAD Extracted | info |
| AI Inferred | warning (clearly labeled AI) |
| Engineer Verified | success |

Precedence display: Engineer Verified > CAD Extracted > AI Inferred.

### BOQ tables

Category grouping, units, totals sticky footer, revision badge on the version.

### Timeline / activity feed

Vertical timeline with espresso spine and copper active node. Separate **customer activity** from **internal audit** (BRD §61–62).

---

## 8. Dashboard density by persona

| Persona | App | Density | Focus |
|---------|-----|---------|--------|
| Customer | `client/` | Comfortable | Next action, progress, payments due |
| Engineer | `dashboard/` | Dense | Tasks, calendar, uploads |
| Project Manager | `dashboard/` | Dense | Workload, delays, assignments |
| Owner | `dashboard/` | Medium | KPIs, charts |
| Admin | `dashboard/` | Dense | Config tables |

---

## 9. Anti-patterns

- Raw hex / one-off colors in JSX
- Emoji as icons
- Placeholder-only form labels
- Submit-only validation with no field errors
- Hover-only affordances (mobile breaks)
- Instant 0ms state changes with no feedback
- Neon / glassmorphism as the primary aesthetic
- Treating AI output as verified measurements or money
- Showing payment success from the frontend alone

---

## 10. Pre-delivery checklist

- [ ] Contrast ≥ 4.5:1 for body text
- [ ] Focus states visible
- [ ] `cursor-pointer` on clickable elements
- [ ] Transitions 150–300ms
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive checks: 375 / 768 / 1024 / 1440
- [ ] Status / payment / trust patterns match this doc + `valentia-business.md`
