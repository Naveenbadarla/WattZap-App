# WattZap Brand System

PROTECTED FILE — changes require explicit approval from Naveen.

The master visual instruction set for every WattZap slide, presentation image,
proposal visual, diagram, brochure and customer-facing deck. The WattZap website
implementation and the official SVG assets are the source of truth; this document
records their values so output is repeatable and locked.

## 1. Brand purpose & personality

- Positioning: **Measured savings, not equipment sales.**
- Customer journey: **Diagnose → Protect → Optimise → Generate → Finance → Prove.**
- Personality: minimal, premium, precise energy-technology. Decision-oriented,
  quantified, calm — never a generic consulting template, never clip-art, never
  neon excess.

## 2. Logo rules

Official assets (exact bytes only, checksums pinned in `brand/tokens/brand-tokens.json`):

| File | Use |
|---|---|
| `assets/logos/wattzap-animated-horizontal-dark.svg` | Slide headers and any dark background (preferred). |
| `assets/logos/wattzap-animated-icon-transparent.svg` | Controlled decorative element, diagrams, cover art. |
| `assets/logos/wattzap-animated-icon.svg` | Icon with its own dark panel, standalone marks. |

- Never redraw, regenerate, reinterpret, recolour, outline, shadow, distort or
  crop the logo (signal arc, icon terminals and wordmark must stay intact).
- Never let an image model produce or "restore" a logo; composite the official
  SVG via the deterministic renderer.
- Preserve aspect ratio (horizontal 760:220; icons square). Scale uniformly only.
- Clear space: at least 0.5 × logo height on every side.
- Header placement: top-left at (96, 56), height 52px on the 1920×1080 canvas.

## 3. Colour tokens

Single source of truth: `brand/tokens/brand-tokens.json` (CSS mirror generated
via `npm run brand:tokens`). Core values:

| Token | Value | Role |
|---|---|---|
| navy | `#071A2D` | Dominant canvas |
| navyDeep | `#04111F` | Canvas gradient floor |
| surface / surfaceRaised | `#0A2238` / `#0D2A44` | Secondary dark-blue surfaces |
| cyan | `#00D4FF` | Primary accent, emphasis, borders |
| green | `#21F59B` | Secondary accent, success, emphasis |
| gold / goldPale | `#FFC857` / `#FFE29A` | Solar/signal accents, sparingly |
| textPrimary | `#FFFFFF` | Headlines and body |
| textSecondary | `#9FB3C8` | Muted blue-grey supporting text |
| textMuted | `#6E8299` | Footers, fine print |

Prohibited: bright white slide backgrounds, unrelated palettes, random gradients,
photographic backgrounds (unless explicitly required), generic corporate blue decks.

## 4. Gradients, grid & glows

- `gradient.energy`: cyan → green, 90°. For emphasised keywords, bullet dots,
  rails and thin rules. The only text gradient allowed.
- `gradient.solar`: gold → pale gold. Rare, for solar/signal accents.
- `gradient.canvas`: layered radial cyan/green glows over a navy 160° ramp — the
  standard slide background.
- Technical grid: 64px cells, 1px lines, `rgba(0,212,255,0.055)`, radially masked
  so it fades toward the edges. Always behind content.
- Glows are restrained: card glow `0 0 32px rgba(0,212,255,0.08)` + soft black
  shadow; accent glow `0 0 18px rgba(33,245,155,0.30)`. Never full-neon.

## 5. Typography

- Typeface: **Inter** — declared by the website (`tailwind.config.ts`
  `fontFamily.sans: Inter, system-ui, …`). The website does not self-host Inter
  (system fallback stack), so the Brand Studio bundles
  `assets/fonts/InterVariable.ttf` (SIL OFL 1.1, licence alongside) to make
  rendering deterministic on any machine. If the bundled font is removed,
  renders fall back to the system stack — the validator flags this.
- Scale (px on the 1920×1080 canvas), from `brand-tokens.json` → `type`:
  display 88/800 · h1 64/800 · subtitle 32/500 · section label 22/600 caps
  0.14em · card heading 30/700 · body 24/400 · caption 20/500 · metric 64/800 ·
  footer 18/500. **Minimum rendered size: 18px.**
- White headlines with one cyan-to-green emphasis phrase; no serif, 3D, all-caps
  paragraphs or decorative display faces.

## 6. Spacing, radii, cards

- Spacing scale: 8 / 16 / 24 / 40 / 64 / 96. Safe margin: 96px all sides.
- Card: fill `rgba(10,34,56,0.72)`, 1.5px cyan (`rgba(0,212,255,0.28)`) or green
  (`rgba(33,245,155,0.25)`) border, radius 24px, padding 40px, gap 32px, subtle
  glow + blur. Generous spacing; never crowd cards.

## 7. Icon & illustration style

- Line icons only: 48-viewBox, 2.5px stroke, rounded caps/joins, single colour
  (cyan/green/gold) with a soft matching drop-glow. Set in `assets/icons/`.
- Illustrations follow the same language: thin strokes, navy fills, cyan/green
  accents. No clip-art, no stock photos unless explicitly required, and never
  AI-generated logos or template chrome.

## 8. Slide anatomy (fixed)

Canvas 1920×1080 (16:9). From `brand-tokens.json` → `slide`:

1. **Header** — official horizontal logo top-left (96, 56, h 52); optional
   uppercase section label top-right.
2. **Headline zone** — from y 200: H1 with one gradient emphasis phrase, then
   subtitle, then optional one-line supporting statement.
3. **Content zone** — cards/flows per the approved template, inside safe margins.
4. **Footer** — thin gradient rule at y 996; footer note bottom-left and page
   marker `NN / NN` bottom-right at y 1016. Page markers are mandatory on
   multi-slide sets.

## 9. Content density & accessibility

- ≤ 5 concise bullets per card (≤ 4 on four-card layouts), ≤ ~90 chars/bullet;
  split dense content across slides. Full limits in
  `WATTZAP_SLIDE_CONTENT_GUIDE.md`.
- Contrast: body text is white or `#9FB3C8` on navy (≥ 4.5:1); never place long
  text in cyan/green/gold; muted text only for footers and fine print.
- Every slide's source JSON should carry an `a11yLabel` (falls back to title);
  the renderer emits it as the slide's `aria-label`.
- British/Indian English throughout ("optimisation", "colour", "programme").

## 10. Approved / prohibited

Approved: the eight master templates in `brand/templates/`; content-only edits
via JSON; official logos; token colours; line icons; restrained glows.

Prohibited: new ad-hoc templates; white/generic consulting decks; recreated or
modified logos; off-token colours; clip-art; photorealistic stock (unless
required and approved); text overflowing or overlapping cards; slides without
page markers in multi-slide sets.

## 11. Export standards

- Master: PNG 1920×1080 (or integer `--scale` multiples for print) via
  `npm run brand:render`; editable `.html` source and `.report.json` kept beside
  each PNG. Optional PDF: print the HTML at 1920×1080 (no layout change allowed).
- Filenames: `NN-kebab-slug.(json|html|png)`.
- Every deliverable must pass `npm run brand:validate` (dimensions, exact logo,
  token colours, grid, page markers, minimum font size, overflow, spelling).

## 12. Change control

Protected files — explicit approval from Naveen required before any change:
`brand/assets/logos/*`, `brand/tokens/brand-tokens.json`, `brand/templates/**`,
this document. The Brand Studio stays disconnected from the production website,
build and deployment.
