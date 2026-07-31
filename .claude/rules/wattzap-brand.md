# WattZap Brand Rule (unconditional project rule)

When the task relates to WattZap visual communication, the existing WattZap website
and official brand assets override generic design preferences.

This rule applies to every task touching WattZap slides, decks, presentations,
pitch materials, proposal visuals, slide images, diagrams, brochures, product
visuals or company graphics. It is not optional and does not expire.

## Logo (testable)

- Use ONLY files in `brand/assets/logos/` — exact bytes, checksums pinned in
  `brand/tokens/brand-tokens.json`.
- Horizontal dark logo (`wattzap-animated-horizontal-dark.svg`) in slide headers;
  transparent icon (`wattzap-animated-icon-transparent.svg`) only as a controlled
  decorative element.
- Never redraw, regenerate, recolour, outline, shadow, distort, crop or substitute
  the logo. Never let an image model produce a logo. Scale proportionally only.
- Clear space ≥ 0.5 × logo height on all sides.

## Colours (testable)

- Only colours from `brand/tokens/brand-tokens.json`: deep navy `#071A2D` canvas,
  cyan `#00D4FF`, green `#21F59B`, gold `#FFC857`, pale gold `#FFE29A`, white and
  the defined blue-grey secondary tones.
- Gradients: cyan-to-green (emphasis) and gold (sparingly) only.
- No bright white slide backgrounds, no unrelated palettes, no random gradients.

## Background & cards (testable)

- Dark navy canvas with the fine low-contrast technical grid and restrained
  cyan/green radial glows — rendered by the master template, never improvised.
- Rounded (24px) dark translucent cards with thin cyan/green borders.

## Typography (testable)

- Inter (bundled `brand/assets/fonts/InterVariable.ttf`), white primary text,
  muted blue-grey secondary text.
- Hierarchy: display/H1 → subtitle → section/card heading → body → caption, sizes
  fixed in brand tokens. Minimum rendered text size: 18px at 1920×1080.

## Slides (testable)

- Canvas exactly 1920×1080 (16:9). Safe margin 96px. Fixed header, logo, footer
  and page-marker positions from `brand-tokens.json` → `slide`.
- Page numbers are mandatory on multi-slide sets (`NN / NN`, bottom-right).
- Content density: ≤ 5 concise bullets per card, ≤ 4 cards per slide, no dense
  paragraphs, no text overflow (renderer + validator enforce this).
- British/Indian English ("optimisation", not "optimization").

## Icons & imagery

- Line icons from `brand/assets/icons/` (stroke style, 2.5px, rounded). No
  clip-art, no photorealistic stock imagery unless explicitly required.

## Process (mandatory)

- Content goes in JSON conforming to `brand/schemas/slide-content.schema.json`;
  render with `npm run brand:render`; design changes are NOT made per-slide.
- Do not invent new templates or a generic consulting-deck look. Use the eight
  approved templates in `brand/templates/`.
- Run `npm run brand:validate` before declaring any slide work complete; report
  failures and missing assets explicitly. Export quality: PNG at native canvas
  size or an integer multiple (`--scale`).
- If an official asset is missing, keep the reference path, report it, and do NOT
  generate a substitute.

## Protected files (require explicit approval from Naveen before ANY change)

- `brand/assets/logos/*`
- `brand/tokens/brand-tokens.json`
- `brand/templates/**` (master slide components)
- `brand/WATTZAP_BRAND_SYSTEM.md`

Never silently modify these during slide-generation tasks. Do not connect the
Brand Studio to production routes, builds or deployments.
