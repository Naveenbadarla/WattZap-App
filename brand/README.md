# WattZap Brand Studio — `brand/`

The locked, deterministic WattZap visual system for slides, decks and branded
graphics. Additive infrastructure only — not connected to the production website,
build or deployment.

| Path | Contents |
|---|---|
| `WATTZAP_BRAND_SYSTEM.md` | Master visual rules (PROTECTED). |
| `WATTZAP_SLIDE_CONTENT_GUIDE.md` | Writing rules and length limits for slide content. |
| `assets/logos/` | Official WattZap SVG logos (PROTECTED — exact bytes, see `MANIFEST.md`). |
| `assets/references/` | Website screenshot + original brand-kit design notes. |
| `assets/icons/` | Approved line-icon set used by templates. |
| `assets/fonts/` | Bundled InterVariable (SIL OFL) for deterministic rendering. |
| `tokens/` | `brand-tokens.json` (source of truth, PROTECTED) + generated `brand-tokens.css`. |
| `schemas/` | `slide-content.schema.json` — the content contract. |
| `templates/` | Master chrome + eight approved slide templates (PROTECTED). |
| `examples/` | Structured slide-content JSON, one folder per deck. |
| `generated/` | Rendered outputs (`.png` deliverable, `.html` source, `.report.json`). |

## Create a new slide

1. Copy an example JSON from `examples/vvdn-pilot/`, edit the content fields.
2. `npm run brand:render -- brand/examples/<deck> --out brand/generated/<deck>`
3. `npm run brand:validate`

Full workflow: `.claude/skills/wattzap-slide-studio/SKILL.md`.
Renderer/validator internals: `tools/wattzap-brand-studio/README.md`.

**Protected files** (approval from Naveen required before changing):
`assets/logos/*`, `tokens/brand-tokens.json`, `templates/**`,
`WATTZAP_BRAND_SYSTEM.md`.
