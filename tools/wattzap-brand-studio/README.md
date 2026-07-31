# WattZap Brand Studio — tooling

Deterministic slide renderer + brand validator. Isolated from the application:
plain Node ESM scripts, no new runtime dependencies (uses the repo's existing
`zod` and any local Chromium for PNG export).

## Commands

```bash
npm run brand:render -- <content.json | dir> [--out <dir>] [--scale <n>] [--no-png]
npm run brand:render:vvdn     # renders brand/examples/vvdn-pilot
npm run brand:validate        # full brand validation (CI runs this)
npm run brand:tokens          # regenerate brand-tokens.css from brand-tokens.json
```

## How rendering works

1. Content JSON is validated against the schema (`validator/content-schema.mjs`,
   mirroring `brand/schemas/slide-content.schema.json`).
2. The matching template module (`brand/templates/<template>/template.mjs`)
   produces the content zone; `brand/templates/master-slide/master.mjs` wraps it
   in the fixed chrome (canvas gradient, technical grid, glows, exact official
   logo, footer, page marker) using `brand/tokens/brand-tokens.(json|css)` and
   the bundled Inter font.
3. The self-contained `.html` (editable source) is written to the output dir.
4. Headless Chromium screenshots it at exactly 1920×1080.
   `--virtual-time-budget` fast-forwards the logo's entrance animations so the
   completed mark is captured — the official SVG bytes are never modified.
5. An in-page probe measures card/content overflow; results land in
   `<name>.report.json`. Overflow fails the render.

### Browser discovery

`WATTZAP_CHROME` env var → Playwright `chromium_headless_shell` (preferred: its
`--window-size` equals the viewport exactly) → `chromium`/`google-chrome` on
PATH or standard locations. Without any browser, rendering still writes HTML
sources (`--no-png` behaviour) and says so.

## What the validator checks

Tokens (present, canvas 1920×1080, CSS in sync with JSON) · schema/template
integrity · official assets (existence + pinned sha256 — a modified logo fails) ·
bundled font · content files (schema, filename pattern `NN-slug.json`, page
markers mandatory and consistent on multi-slide sets, British/Indian spelling
warnings) · generated outputs (PNG 16:9 at master size, exact logo bytes
embedded, technical grid + page-marker elements present, aria-label, minimum
18px font size, only brand-token colours, overflow reports clean).

## Layout of this directory

```
renderer/lib.mjs               core: tokens/logo/icon loading, Chromium, probe
validator/content-schema.mjs   zod content validation (single content contract)
validator/checks.mjs           brand checks used by validate.mjs
scripts/render.mjs             CLI renderer
scripts/validate.mjs           CLI validator (npm run brand:validate)
scripts/tokens-to-css.mjs      token CSS generator
```

Master layouts live with the brand in `brand/templates/`; this directory is the
machinery only. Do not connect any of it to the production website or build.
