---
name: wattzap-slide-studio
description: >
  Create or update WattZap slides, decks, presentation images, proposal visuals
  and other branded graphics using the locked WattZap Brand Studio (deterministic
  renderer + approved templates). Use for ANY WattZap visual-communication task.
---

# WattZap Slide Studio

Deterministic workflow for producing on-brand WattZap slides. Design is locked;
only structured content changes. Read `.claude/rules/wattzap-brand.md`,
`brand/WATTZAP_BRAND_SYSTEM.md` and `brand/WATTZAP_SLIDE_CONTENT_GUIDE.md` first.

## Workflow

1. **Read the user's content.** Identify the audience (customer, partner such as
   VVDN, internal), the decision the slide supports, and the number of slides.
2. **Choose the approved layout** (never invent one):
   - Executive overview / "what we do" → `three-column-overview`
   - Requirements / scope / pilot needs → `four-card-requirements`
   - Customer journey / process → `process-flow`
   - Hardware / data architecture → `architecture`
   - Roadmap / phases → `timeline`
   - Economics / quantified value → `business-case`
   - Options / products side-by-side → `comparison`
   - Deck opener / section divider → `title-slide`
3. **Condense content without changing meaning.** Respect the limits in
   `brand/WATTZAP_SLIDE_CONTENT_GUIDE.md` (≤5 bullets/card, ≤90 chars/bullet,
   title ≤60 chars). If content exceeds limits, split into more slides and say so.
4. **Write one JSON file per slide** conforming to
   `brand/schemas/slide-content.schema.json`, in a deck folder under
   `brand/examples/<deck-name>/`, named `NN-slug.json` with `slideNumber` /
   `totalSlides` set for multi-slide sets.
5. **Render deterministically** (this loads official tokens, components and the
   exact logo — never hand-draw a slide):
   `npm run brand:render -- brand/examples/<deck-name> --out brand/generated/<deck-name>`
6. **Logos are automatic.** The master template embeds the exact official SVG.
   Never add, redraw or AI-generate a logo. Icons come from `brand/assets/icons/`.
7. **Check readability and overflow.** The renderer writes a `.report.json` per
   slide; any `overflow.ok === false` means shorten content or split the slide.
   View the PNG to confirm hierarchy and spacing.
8. **Run brand validation:** `npm run brand:validate` — must PASS.
9. **Export:** the 1920×1080 PNG in `brand/generated/<deck-name>/` is the
   deliverable (use `--scale 2` for print). The `.html` beside it is the
   editable source; keep both.
10. **Report:** provide output paths plus a short validation report (validator
    result, overflow status, any warnings, any missing official assets).

## Hard rules

- Never modify protected brand-source files without explicit approval from
  Naveen: `brand/assets/logos/*`, `brand/tokens/brand-tokens.json`,
  `brand/templates/**`, `brand/WATTZAP_BRAND_SYSTEM.md`.
- Never touch the application (`src/`, config, deployment) during slide work.
- British/Indian English. WattZap positioning: "Measured savings, not equipment
  sales." Journey: Diagnose → Protect → Optimise → Generate → Finance → Prove.
- If something cannot be done within the locked system, stop and ask rather than
  improvising off-brand output.
