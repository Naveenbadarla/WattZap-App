/** System architecture — PROTECTED BRAND-SOURCE FILE. */
import { titleBlock } from "../master-slide/master.mjs";

export const id = "architecture";
export const description = "Hardware/data architecture: 2–4 stacked layers with items, connected top-to-bottom, optional side notes.";

export function render(slide, h) {
  const c = slide.content ?? {};
  const layers = c.layers ?? [];
  const bands = layers
    .map(
      (layer, i) => `
    <div class="wz-card ${i % 2 ? "wz-card-green" : ""}" style="padding:28px 40px; display:flex; align-items:center; gap:40px;" data-wz-name="layer-${i + 1}">
      <div style="width:320px; flex:0 0 320px; display:flex; align-items:center; gap:18px;">
        ${h.iconSpan(layer.icon, i % 2 ? "green" : "cyan")}
        <div class="wz-card-heading" style="font-size:26px;">${h.esc(layer.heading)}</div>
      </div>
      <div style="display:flex; gap:16px; flex-wrap:wrap; flex:1;">
        ${(layer.items ?? []).map((it) => `<div class="wz-chip" style="padding:10px 22px;">${h.esc(it)}</div>`).join("")}
      </div>
    </div>
    ${i < layers.length - 1 ? `<div style="display:flex; justify-content:center; color:var(--wz-color-cyan); font-size:24px; line-height:1; margin:2px 0;">↓</div>` : ""}`
    )
    .join("\n");
  return `
${titleBlock(slide, h)}
<div class="wz-body-zone" style="flex-direction:column; gap:8px; justify-content:center;">
${bands}
</div>
${c.note ? `<div class="wz-note">${h.esc(c.note)}</div>` : ""}`;
}
