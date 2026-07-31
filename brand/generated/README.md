# Rendered slide outputs

Each deck folder holds, per slide: the `.png` deliverable (1920×1080), the
editable `.html` source, and a `.report.json` (render + overflow report).
Everything here is produced by `npm run brand:render` from the JSON in
`brand/examples/` — regenerate rather than editing outputs by hand. Commit only
curated reference decks (like `vvdn-pilot/`); treat ad-hoc renders as
disposable.
