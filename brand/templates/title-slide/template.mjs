/** Title / section slide — PROTECTED BRAND-SOURCE FILE. */
export const id = "title-slide";
export const description = "Deck opener or section divider: display headline, subtitle, up to three highlight chips, decorative brand icon.";

export function render(slide, h) {
  const c = slide.content ?? {};
  const chips = (c.highlights ?? [])
    .map(
      (x, i) => `<div class="wz-chip"><span class="wz-dot" style="background:${i === 2 ? "var(--wz-color-gold)" : i === 1 ? "var(--wz-color-green)" : "var(--wz-color-cyan)"}"></span>${h.esc(x)}</div>`
    )
    .join("\n");
  return `
<div style="flex:1; display:flex; align-items:center;">
  <div style="max-width:1250px;">
    ${c.kicker ? `<div class="wz-section-label" style="margin-bottom:32px;">${h.esc(c.kicker)}</div>` : ""}
    <div style="font-size:var(--wz-type-display-size); font-weight:var(--wz-type-display-weight); line-height:var(--wz-type-display-line-height); letter-spacing:var(--wz-type-display-letter-spacing);" data-wz-name="title">${h.accentTitle(slide.title, slide.titleAccent)}</div>
    ${slide.subtitle ? `<div class="wz-subtitle" style="margin-top:32px; font-size:36px;">${h.esc(slide.subtitle)}</div>` : ""}
    ${slide.supporting ? `<div class="wz-intro" style="margin-top:24px;">${h.esc(slide.supporting)}</div>` : ""}
    ${chips ? `<div style="display:flex; gap:24px; margin-top:56px;">${chips}</div>` : ""}
    ${c.dateLine ? `<div class="wz-note" style="margin-top:40px;">${h.esc(c.dateLine)}</div>` : ""}
  </div>
  <div style="flex:1; display:flex; justify-content:flex-end; align-items:center; opacity:0.9;">
    <div style="width:360px; height:360px; filter: drop-shadow(0 0 60px rgba(0,212,255,0.25));">${h.loadLogo("iconTransparent")}</div>
  </div>
</div>`;
}
