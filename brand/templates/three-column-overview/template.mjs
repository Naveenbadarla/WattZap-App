/** Three-column overview — PROTECTED BRAND-SOURCE FILE. */
import { titleBlock } from "../master-slide/master.mjs";

export const id = "three-column-overview";
export const description = "Executive overview: headline plus three equal cards, optional outcome strip.";

export function render(slide, h) {
  const c = slide.content ?? {};
  const tones = ["cyan", "green", "cyan"];
  const cols = (c.columns ?? [])
    .map(
      (col, i) => `
    <div class="wz-card ${i === 1 ? "wz-card-green" : ""}" style="flex:1; min-width:0;" data-wz-name="column-${i + 1}">
      <div class="wz-card-head">${h.iconSpan(col.icon, tones[i % 3])}<div class="wz-card-heading">${h.esc(col.heading)}</div></div>
      <ul class="wz-bullets">${(col.bullets ?? []).map((b) => `<li>${h.esc(b)}</li>`).join("")}</ul>
    </div>`
    )
    .join("\n");
  const outcomes = (c.outcomes ?? [])
    .map((o) => `<div class="wz-chip"><span class="wz-dot" style="background:var(--wz-color-green)"></span>${h.esc(o)}</div>`)
    .join("\n");
  return `
${titleBlock(slide, h)}
<div class="wz-body-zone" style="gap:var(--wz-space-card-gap);">
${cols}
</div>
${outcomes ? `<div style="display:flex; gap:24px; margin-top:var(--wz-space-md);">${outcomes}</div>` : ""}`;
}
