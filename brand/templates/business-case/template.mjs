/** Business case / quantified value — PROTECTED BRAND-SOURCE FILE. */
import { titleBlock } from "../master-slide/master.mjs";

export const id = "business-case";
export const description = "Economics: 2–4 headline metrics with gradient values, plus a supporting bullet card.";

export function render(slide, h) {
  const c = slide.content ?? {};
  const metrics = (c.metrics ?? [])
    .map(
      (m, i) => `
    <div class="wz-card ${i % 2 ? "wz-card-green" : ""}" style="flex:1; min-width:0; text-align:center; padding:36px 28px;" data-wz-name="metric-${i + 1}">
      <div class="wz-accent" style="font-size:var(--wz-type-metric-value-size); font-weight:var(--wz-type-metric-value-weight); line-height:var(--wz-type-metric-value-line-height); letter-spacing:var(--wz-type-metric-value-letter-spacing);">${h.esc(m.value)}</div>
      <div style="font-size:24px; font-weight:600; margin-top:14px;">${h.esc(m.label)}</div>
      ${m.caption ? `<div style="font-size:19px; color:var(--wz-color-text-secondary); margin-top:8px; line-height:1.35;">${h.esc(m.caption)}</div>` : ""}
    </div>`
    )
    .join("\n");
  return `
${titleBlock(slide, h)}
<div class="wz-body-zone" style="flex-direction:column; gap:32px;">
  <div style="display:flex; gap:32px;">${metrics}</div>
  ${
    (c.bullets ?? []).length
      ? `<div class="wz-card" style="flex:1;" data-wz-name="business-bullets"><ul class="wz-bullets">${c.bullets
          .map((b) => `<li>${h.esc(b)}</li>`)
          .join("")}</ul></div>`
      : ""
  }
</div>
${c.note ? `<div class="wz-note">${h.esc(c.note)}</div>` : ""}`;
}
