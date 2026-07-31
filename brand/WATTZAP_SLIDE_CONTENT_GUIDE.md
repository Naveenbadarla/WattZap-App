# WattZap Slide Content Guide

How to write content for WattZap slides. Design is locked by
`WATTZAP_BRAND_SYSTEM.md`; this guide governs the words that go into the
structured JSON files (`brand/schemas/slide-content.schema.json`).

## Length limits (enforced by schema + validator)

| Field | Limit |
|---|---|
| Title | ≤ 60 characters, one line, no full stop |
| Title accent | A phrase contained in the title (gradient emphasis) |
| Subtitle | ≤ 110 characters, one sentence fragment |
| Supporting statement | ≤ 220 characters, one sentence |
| Bullet | ≤ 90 characters, one idea per bullet, no nested bullets |
| Bullets per card | ≤ 5 (≤ 4 on the four-card layout; ≤ 3 on timeline cards) |
| Cards per slide | ≤ 4 |
| Metrics | 2–4, value ≤ 16 chars (e.g. "18%", "₹4.2L/yr") |
| Section label | ≤ 40 characters |
| Footer note | ≤ 90 characters |

## When to split into multiple slides

Split when content would exceed the limits above, when a card would need a
second paragraph, when a process has more than six steps, or when two distinct
decisions compete for attention. One slide = one decision. Never shrink fonts,
tighten spacing or overflow a card to force a fit — the renderer will reject it.

## Terminology & product names

- Company: **WattZap** (one word, capital W and Z) / WattZap Energy Solutions.
- Positioning line: **"Measured savings, not equipment sales."**
- Customer journey stages: **Diagnose → Protect → Optimise → Generate → Finance → Prove.**
- Approved product/service names: **EnergyScan** (free audit entry point),
  WattZap platform, Savings Command Centre. Do not invent new product names on
  slides without approval.
- Partners/customers by their correct names: VVDN Technologies, DISCOM (caps),
  Telangana & AP.

## British/Indian English (mandatory)

"optimisation", "colour", "programme", "customised", "analyse", "metre" (unit
context: use SI symbols instead). The validator warns on American spellings.
Currency: ₹ with Indian units (₹4.2L, ₹1.2 Cr) where natural.

## Rules against overcrowding

- Prefer 3 bullets; use 4–5 only when each is short.
- No paragraphs inside cards; the supporting statement is the only prose line.
- Keep one emphasis phrase per headline; don't gradient whole sentences.
- Leave outcome strips to ≤ 3 chips of ≤ 70 characters.

## Quantitative slides (business-case)

- Every number carries its unit and period ("₹/kWh", "per month", "90-day").
- State the measurement basis in a bullet or note ("validated against DISCOM
  bill"), never as a footnote-sized disclaimer.
- Round to the precision you can defend; avoid false precision (18.37%).
- Use `business-case` metrics for at most four headline figures; further detail
  belongs in a follow-up slide or document.

## Pilot requirement slides

- Use `four-card-requirements` with cards in this default order: sensing /
  metering, connectivity, environment / integration, success criteria.
- Success criteria must be measurable (uptime %, days, validated savings).
- Mark drafts clearly in the note ("Working draft — to be confirmed").

## VVDN-facing technical slides

- Audience is an engineering partner: name protocols and interfaces precisely
  (OCPP 1.6-J, MQTT over TLS, OTA), avoid marketing adjectives.
- Clearly separate: current MVP scope, future-ready interfaces, and
  out-of-scope items — never blur them on one card.
- Do not expose proprietary implementation detail beyond what the partner needs;
  keep customer-identifying data off partner slides unless approved.
- Keep the standard confidentiality footer on every VVDN slide.

## Content JSON quick reference

Each slide is one JSON file (`NN-slug.json`) in a deck folder under
`brand/examples/`. Common fields: `template`, `title`, `titleAccent`,
`subtitle`, `supporting`, `sectionLabel`, `slideNumber`, `totalSlides`,
`footerNote`, `a11yLabel`, and a template-specific `content` object. See
`brand/examples/vvdn-pilot/` for working examples and
`brand/schemas/slide-content.schema.json` for the full contract.
