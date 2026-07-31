/** Roadmap / timeline — PROTECTED BRAND-SOURCE FILE. */
import { titleBlock } from "../master-slide/master.mjs";

export const id = "timeline";
export const description = "Roadmap: 3–6 milestones along a gradient rail, each with label, heading and up to three bullets.";

export function render(slide, h) {
  const c = slide.content ?? {};
  const ms = c.milestones ?? [];
  const cols = ms
    .map(
      (m, i) => `
    <div style="flex:1; min-width:0; position:relative; padding-top:56px;" data-wz-name="milestone-${i + 1}">
      <div style="position:absolute; top:12px; left:50%; transform:translateX(-50%); width:22px; height:22px; border-radius:50%; background:var(--wz-gradient-energy); box-shadow:var(--wz-glow-accent);"></div>
      <div class="wz-card ${i % 2 ? "wz-card-green" : ""}" style="margin:0 14px; padding:28px;">
        <div style="font-size:18px; font-weight:700; letter-spacing:0.12em; color:var(--wz-color-gold); margin-bottom:8px;">${h.esc(m.label ?? "")}</div>
        <div class="wz-card-heading" style="font-size:25px; margin-bottom:14px;">${h.esc(m.heading)}</div>
        <ul class="wz-bullets" style="gap:10px;">${(m.bullets ?? []).map((b) => `<li style="font-size:20px; line-height:1.4;">${h.esc(b)}</li>`).join("")}</ul>
      </div>
    </div>`
    )
    .join("\n");
  return `
${titleBlock(slide, h)}
<div class="wz-body-zone" style="flex-direction:column;">
  <div style="position:relative;">
    <div style="position:absolute; top:22px; left:4%; right:4%; height:3px; background:var(--wz-gradient-energy); opacity:0.6; border-radius:2px;"></div>
    <div style="display:flex;">${cols}</div>
  </div>
</div>
${c.note ? `<div class="wz-note">${h.esc(c.note)}</div>` : ""}`;
}
