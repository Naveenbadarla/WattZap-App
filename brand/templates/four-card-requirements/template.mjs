/** Four-card requirements — PROTECTED BRAND-SOURCE FILE. */
import { titleBlock } from "../master-slide/master.mjs";

export const id = "four-card-requirements";
export const description = "Requirements or scope: 2×2 grid of cards, each with icon, heading and up to four bullets.";

export function render(slide, h) {
  const c = slide.content ?? {};
  const tones = ["cyan", "green", "green", "cyan"];
  const cards = (c.cards ?? [])
    .map(
      (card, i) => `
    <div class="wz-card ${i % 3 === 1 || i % 3 === 2 ? "wz-card-green" : ""}" style="min-width:0; display:flex; flex-direction:column;" data-wz-name="card-${i + 1}">
      <div class="wz-card-head" style="margin-bottom:20px;">${h.iconSpan(card.icon, tones[i % 4])}<div class="wz-card-heading" style="font-size:28px;">${h.esc(card.heading)}</div></div>
      <ul class="wz-bullets" style="gap:12px;">${(card.bullets ?? []).map((b) => `<li style="font-size:22px; line-height:1.4;">${h.esc(b)}</li>`).join("")}</ul>
    </div>`
    )
    .join("\n");
  return `
${titleBlock(slide, h)}
<div class="wz-body-zone" style="display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:28px;">
${cards}
</div>
${c.note ? `<div class="wz-note">${h.esc(c.note)}</div>` : ""}`;
}
