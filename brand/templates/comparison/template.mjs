/** Product / option comparison — PROTECTED BRAND-SOURCE FILE. */
import { titleBlock } from "../master-slide/master.mjs";

export const id = "comparison";
export const description = "Options or products side by side: 2–3 columns with optional badge, tagline and bullets.";

export function render(slide, h) {
  const c = slide.content ?? {};
  const opts = (c.options ?? [])
    .map(
      (o, i) => `
    <div class="wz-card ${o.featured ? "" : "wz-card-green"}" style="flex:1; min-width:0; display:flex; flex-direction:column; ${o.featured ? "box-shadow: 0 0 44px rgba(0,212,255,0.16), 0 12px 40px rgba(0,0,0,0.35);" : ""}" data-wz-name="option-${i + 1}">
      ${o.badge ? `<div style="align-self:flex-start; margin-bottom:18px;" class="wz-chip"><span class="wz-dot" style="background:var(--wz-color-gold)"></span>${h.esc(o.badge)}</div>` : ""}
      <div class="wz-card-head" style="margin-bottom:8px;">${h.iconSpan(o.icon, o.featured ? "cyan" : "green")}<div class="wz-card-heading">${h.esc(o.heading)}</div></div>
      ${o.tagline ? `<div style="font-size:21px; color:var(--wz-color-text-secondary); margin-bottom:22px; line-height:1.35;">${h.esc(o.tagline)}</div>` : ""}
      <ul class="wz-bullets" style="gap:14px;">${(o.bullets ?? []).map((b) => `<li style="font-size:22px; line-height:1.4;">${h.esc(b)}</li>`).join("")}</ul>
    </div>`
    )
    .join("\n");
  return `
${titleBlock(slide, h)}
<div class="wz-body-zone" style="gap:var(--wz-space-card-gap);">
${opts}
</div>
${c.note ? `<div class="wz-note">${h.esc(c.note)}</div>` : ""}`;
}
