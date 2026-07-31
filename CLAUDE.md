# WattZap-App — Project Instructions

WattZap Energy Solutions — "Measured savings, not equipment sales."
This repository contains two independent things:

1. **The WattZap application** — a Next.js 14 (App Router) + Tailwind CSS + Supabase
   customer app in `src/`. Commands: `npm run dev | build | lint | typecheck`.
2. **The WattZap Brand Studio** — a locked, deterministic slide/visual system in
   `brand/` and `tools/wattzap-brand-studio/`. It is additive infrastructure and is
   NOT connected to the production website, build, or deployment.

## WattZap Brand System (permanent rule)

Any task mentioning WattZap slides, decks, presentations, pitch materials, proposal
visuals, slide images, diagrams, brochures, product visuals or company graphics MUST
follow the WattZap Brand System:

- Always read and apply:
  - @brand/WATTZAP_BRAND_SYSTEM.md
  - @brand/WATTZAP_SLIDE_CONTENT_GUIDE.md
- Follow the project rule in `.claude/rules/wattzap-brand.md` and use the
  `wattzap-slide-studio` skill (`.claude/skills/wattzap-slide-studio/SKILL.md`).
- Use ONLY the official logo files in `brand/assets/logos/`. Never redraw,
  regenerate, recolour, distort, crop or substitute the WattZap logo.
- Generate slides with the deterministic renderer and approved master templates:
  - `npm run brand:render -- <content.json | dir> [--out <dir>]`
  - `npm run brand:validate`
- Do not invent a new template. New content goes into structured JSON files
  conforming to `brand/schemas/slide-content.schema.json`; design stays fixed.
- Do not alter the existing WattZap website, routes, components, database or
  deployment when performing slide work.
- Validate every generated slide (`npm run brand:validate`) before declaring
  completion, and report any deviation or missing asset explicitly.
- Ask Naveen for approval BEFORE changing any protected brand-source file:
  - `brand/assets/logos/*` (official SVG logos)
  - `brand/tokens/brand-tokens.json`
  - `brand/templates/**` (master slide components)
  - `brand/WATTZAP_BRAND_SYSTEM.md`

## Application conventions (unchanged by the Brand Studio)

- TypeScript, App Router, server components by default; Tailwind for styling.
- The app UI uses its own light theme defined in `tailwind.config.ts` — the dark
  Brand Studio palette applies to slides/visual communication only.
- Data access goes through the repository seam in `src/lib/repo/`.
- Use British/Indian English in user-facing copy ("optimisation", "colour").

## How to verify these instructions are loaded

Ask: "Which file defines the WattZap slide rules?" — the answer must reference
`brand/WATTZAP_BRAND_SYSTEM.md` and `.claude/rules/wattzap-brand.md`.
