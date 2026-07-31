# Official WattZap logo assets — manifest

PROTECTED FILES — never redraw, regenerate, recolour, distort, crop or replace.
Checksums are enforced by `npm run brand:validate` (pinned in
`brand/tokens/brand-tokens.json`). If a file here is missing, report it and stop —
do not generate a substitute.

| File | Purpose / approved usage | viewBox (dimensions) | sha256 |
|---|---|---|---|
| `wattzap-animated-horizontal-dark.svg` | Horizontal logo for dark backgrounds. Slide headers (top-left), documents on navy. | `0 0 760 220` (760×220) | `543514e43aa66ad2c61a5534923a9b3b129a3e53ecb85a71cd2cc86ab5ccc810` |
| `wattzap-animated-icon.svg` | Icon with its own dark panel. Standalone marks, avatars, favicons on unknown backgrounds. | `0 0 240 240` (240×240) | `488ff60540b0307b394155b41cdf8dc796a482b02a89ff801898a781b18fa01c` |
| `wattzap-animated-icon-transparent.svg` | Transparent icon. Controlled decorative element on slide covers and diagrams only. | `0 0 220 220` (220×220) | `b5853136404b7fbb2594c6763bbbdd1057e072eca3cf59e144bfda2b115be3e7` |

Notes:

- The SVGs contain entrance animations (draw-in wave, arc, sun pop). The
  renderer fast-forwards them (`--virtual-time-budget`) so exports show the
  completed mark; the files themselves are never modified.
- Keep clear space ≥ 0.5 × logo height on all sides; scale uniformly only.
- Reference imagery (website screenshot, original kit notes) lives in
  `../references/`.
