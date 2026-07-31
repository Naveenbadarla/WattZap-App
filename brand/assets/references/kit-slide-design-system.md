# WattZap Slide Design System

## Purpose
This file is the master visual instruction set for every WattZap slide image, presentation visual, one-pager, diagram, and customer-facing deck. Use it unless Naveen explicitly requests another brand or design.

## Source-of-truth assets
Use the supplied files directly. Never redraw, reinterpret, or generate a substitute logo.

1. `wattzap-animated-horizontal-dark.svg` — preferred header logo on dark backgrounds.
2. `wattzap-animated-icon-transparent.svg` — preferred icon for decorative use, diagrams, and cover visuals.
3. `wattzap-animated-icon.svg` — icon with its own dark background.
4. `wattzap-website-reference.png` — primary reference for the visual language.

## Brand palette
- Deep navy: `#071A2D`
- Electric cyan: `#00D4FF`
- Energy green: `#21F59B`
- Solar gold: `#FFC857`
- Pale solar gold: `#FFE29A`
- White: `#FFFFFF`

Use navy as the dominant canvas. Use cyan and green for emphasis, borders, gradients, icons, data highlights, and key words. Use gold sparingly for signal, solar, or attention accents.

## Mandatory visual principles
- 16:9 landscape unless another format is explicitly requested.
- Dark navy technical-grid background inspired by the WattZap website.
- Subtle cyan/green radial glows, never excessive neon.
- White primary text; selected keywords may use a cyan-to-green gradient.
- Rounded dark translucent cards with low-contrast borders and controlled glow.
- Clean energy-tech line icons; avoid generic stock photography unless requested.
- Strong website-style hierarchy: large headline, clear subtitle, concise supporting sentence, structured cards.
- Generous spacing and clear alignment. Never overcrowd the slide.
- Keep the exact official logo untouched and correctly proportioned.
- Multi-slide sets must use consistent margins, header placement, card radii, icon style, and page markers.

## Default slide anatomy
1. **Header:** official horizontal logo at top left; optional slim navigation-style line or section label.
2. **Headline zone:** large white headline with one cyan/green emphasis phrase.
3. **Context line:** one sentence explaining the slide's decision or purpose.
4. **Content zone:** two to four rounded cards, or one central visual with supporting cards.
5. **Outcome strip:** up to three concise outcome blocks when useful.
6. **Footer:** page marker on multi-slide sets; optional confidentiality line.

## Typography rules
- Use the website's actual font when available.
- Otherwise use a clean geometric sans-serif such as Inter, Arial, or Aptos.
- Headline: bold and high contrast.
- Card headings: semibold/bold.
- Body: regular, short lines, high readability.
- Avoid long paragraphs. Prefer one idea per bullet.
- Do not use decorative serif fonts, 3D text, or excessive all-caps.

## Logo integrity workflow
For exact brand fidelity, do not ask an image model to recreate the logo inside the artwork. Generate the slide background/layout without a logo if necessary, then composite the official SVG/PNG logo onto the final slide. The logo must remain crisp, undistorted, and unaltered.

## Content rules
- WattZap positioning: **Measured savings, not equipment sales.**
- Customer journey: **Diagnose → Protect → Optimise → Generate → Finance → Prove.**
- Use Indian/British spelling where appropriate: optimisation, customised, programme.
- Slides must be decision-oriented and customer-relevant, not technology-heavy for its own sake.
- Do not expose unnecessary proprietary implementation detail on public/customer slides.
- For technical partner discussions, clearly separate: current MVP, future-ready interfaces, and out-of-scope items.

## Image-generation guardrails
- Treat the website screenshot and official SVGs as reference images in every new generation session.
- Do not introduce unrelated colours, white corporate templates, photographic backgrounds, or generic sustainability imagery.
- Do not invent a new WattZap logo, tagline, or icon system.
- Do not use a generic consulting-deck aesthetic that conflicts with the website.
- Verify all text after generation. Regenerate or build deterministically if text is misspelled.

## Preferred production method
For important partner/customer slides, use a deterministic slide template or coded layout and export to PNG. Use generative imaging mainly for illustrations and background visuals. This gives exact logos, correct text, consistent spacing, and repeatable branding.

## Approval rule
Once Naveen approves a slide as the master template, retain that approved slide as a visual reference for all subsequent WattZap slide sets. Later work should inherit the approved layout unless the content requires a different structure.
