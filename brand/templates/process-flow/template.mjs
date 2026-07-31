/** Process / customer-journey flow — PROTECTED BRAND-SOURCE FILE. */
import { titleBlock } from "../master-slide/master.mjs";

export const id = "process-flow";
export const description = "Customer journey or process: 3–6 connected steps with icons, headings and captions.";

export function render(slide, h) {
  const c = slide.content ?? {};
  const steps = c.steps ?? [];
  const items = steps
    .map(
      (s, i) => `
    <div style="flex:1; min-width:0; display:flex; align-items:stretch;">
      <div class="wz-card ${i % 2 ? "wz-card-green" : ""}" style="flex:1; padding:32px; text-align:center;" data-wz-name="step-${i + 1}">
        <div style="display:flex; justify-content:center; margin-bottom:20px;">${h.iconSpan(s.icon, i % 2 ? "green" : "cyan")}</div>
        <div style="font-size:18px; font-weight:700; letter-spacing:0.14em; color:var(--wz-color-text-muted); margin-bottom:10px;">STEP ${i + 1}</div>
        <div class="wz-card-heading" style="font-size:26px; margin-bottom:12px;">${h.esc(s.heading)}</div>
        <div style="font-size:20px; line-height:1.4; color:var(--wz-color-text-secondary);">${h.esc(s.caption ?? "")}</div>
      </div>
      ${i < steps.length - 1 ? `<div style="align-self:center; padding:0 10px; color:var(--wz-color-cyan); font-size:30px;">→</div>` : ""}
    </div>`
    )
    .join("\n");
  const outcomes = (c.outcomes ?? [])
    .map((o) => `<div class="wz-chip"><span class="wz-dot" style="background:var(--wz-color-green)"></span>${h.esc(o)}</div>`)
    .join("\n");
  return `
${titleBlock(slide, h)}
<div class="wz-body-zone" style="align-items:stretch;">
${items}
</div>
${outcomes ? `<div style="display:flex; gap:24px; margin-top:var(--wz-space-md);">${outcomes}</div>` : ""}`;
}
