/**
 * WattZap master slide chrome — PROTECTED BRAND-SOURCE FILE.
 * Every template renders inside this frame: canvas, technical grid, glows,
 * official header logo, section label, footer note and page marker.
 * Changes require explicit approval from Naveen.
 */
import { loadTokens, loadTokensCss, loadLogo, esc } from "../../../tools/wattzap-brand-studio/renderer/lib.mjs";

export function masterCss(relFontPath) {
  const t = loadTokens();
  return `
@font-face {
  font-family: "InterVariable";
  src: url("${relFontPath}") format("truetype-variations");
  font-weight: 100 900;
  font-style: normal;
}
${loadTokensCss()}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: ${t.slide.width}px; height: ${t.slide.height}px; overflow: hidden; }
body {
  font-family: var(--wz-font-family);
  color: var(--wz-color-text-primary);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.wz-slide {
  position: relative;
  width: ${t.slide.width}px;
  height: ${t.slide.height}px;
  background: var(--wz-gradient-canvas);
  overflow: hidden;
}
.wz-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(to right, var(--wz-grid-color) ${t.grid.lineWidth}px, transparent ${t.grid.lineWidth}px),
    linear-gradient(to bottom, var(--wz-grid-color) ${t.grid.lineWidth}px, transparent ${t.grid.lineWidth}px);
  background-size: var(--wz-grid-cell) var(--wz-grid-cell);
  mask-image: radial-gradient(1400px 900px at 50% 40%, rgba(0,0,0,0.9), rgba(0,0,0,0.35));
  -webkit-mask-image: radial-gradient(1400px 900px at 50% 40%, rgba(0,0,0,0.9), rgba(0,0,0,0.35));
}
.wz-header {
  position: absolute;
  left: var(--wz-slide-safe-margin);
  right: var(--wz-slide-safe-margin);
  top: ${t.slide.headerLogoY}px;
  height: ${t.slide.headerLogoHeight}px;
  display: flex; align-items: center; justify-content: space-between;
}
.wz-logo { height: ${t.slide.headerLogoHeight}px; display: flex; align-items: center; }
.wz-logo svg { height: ${t.slide.headerLogoHeight}px; width: auto; display: block; }
.wz-section-label {
  font-size: var(--wz-type-section-label-size);
  font-weight: var(--wz-type-section-label-weight);
  letter-spacing: var(--wz-type-section-label-letter-spacing);
  text-transform: uppercase;
  color: var(--wz-color-text-secondary);
}
.wz-content {
  position: absolute;
  left: var(--wz-slide-safe-margin);
  right: var(--wz-slide-safe-margin);
  top: var(--wz-slide-content-top-y);
  bottom: ${t.slide.height - t.slide.footerBaselineY + 24}px;
  display: flex; flex-direction: column;
}
.wz-footer {
  position: absolute;
  left: var(--wz-slide-safe-margin);
  right: var(--wz-slide-safe-margin);
  top: ${t.slide.footerBaselineY}px;
  display: flex; align-items: center; justify-content: space-between;
  font-size: var(--wz-type-footer-size);
  font-weight: var(--wz-type-footer-weight);
  letter-spacing: var(--wz-type-footer-letter-spacing);
  color: var(--wz-color-text-muted);
}
.wz-footer-rule {
  position: absolute;
  left: var(--wz-slide-safe-margin);
  right: var(--wz-slide-safe-margin);
  top: ${t.slide.footerBaselineY - 20}px;
  height: 1px;
  background: linear-gradient(90deg, rgba(0,212,255,0.30), rgba(33,245,155,0.18), transparent 85%);
}
.wz-page-marker { color: var(--wz-color-text-secondary); font-variant-numeric: tabular-nums; }
.wz-accent {
  background: var(--wz-gradient-energy);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.wz-title {
  font-size: var(--wz-type-h1-size);
  font-weight: var(--wz-type-h1-weight);
  line-height: var(--wz-type-h1-line-height);
  letter-spacing: var(--wz-type-h1-letter-spacing);
}
.wz-subtitle {
  margin-top: var(--wz-space-sm);
  font-size: var(--wz-type-subtitle-size);
  font-weight: var(--wz-type-subtitle-weight);
  line-height: var(--wz-type-subtitle-line-height);
  color: var(--wz-color-text-secondary);
  max-width: 1400px;
}
.wz-intro {
  margin-top: var(--wz-space-sm);
  font-size: var(--wz-type-body-size);
  line-height: var(--wz-type-body-line-height);
  color: var(--wz-color-text-secondary);
  max-width: 1500px;
}
.wz-body-zone { flex: 1; display: flex; margin-top: var(--wz-space-lg); min-height: 0; }
.wz-card {
  background: var(--wz-color-card-fill);
  border: var(--wz-border-card);
  border-radius: var(--wz-radius-card);
  box-shadow: var(--wz-glow-card);
  padding: var(--wz-space-card-padding);
  overflow: hidden;
  backdrop-filter: blur(6px);
}
.wz-card-green { border: var(--wz-border-card-green); }
.wz-card-heading {
  font-size: var(--wz-type-card-heading-size);
  font-weight: var(--wz-type-card-heading-weight);
  line-height: var(--wz-type-card-heading-line-height);
  letter-spacing: var(--wz-type-card-heading-letter-spacing);
}
.wz-card-head { display: flex; align-items: center; gap: 20px; margin-bottom: var(--wz-space-md); }
.wz-icon { width: 44px; height: 44px; flex: 0 0 44px; display: inline-flex; }
.wz-icon svg { width: 100%; height: 100%; }
.wz-icon-cyan { color: var(--wz-color-cyan); filter: drop-shadow(0 0 8px rgba(0,212,255,0.45)); }
.wz-icon-green { color: var(--wz-color-green); filter: drop-shadow(0 0 8px rgba(33,245,155,0.45)); }
.wz-icon-gold { color: var(--wz-color-gold); filter: drop-shadow(0 0 8px rgba(255,200,87,0.45)); }
.wz-bullets { list-style: none; display: flex; flex-direction: column; gap: var(--wz-space-bullet-gap); }
.wz-bullets li {
  position: relative;
  padding-left: 34px;
  font-size: var(--wz-type-body-size);
  line-height: var(--wz-type-body-line-height);
  color: var(--wz-color-text-primary);
}
.wz-bullets li::before {
  content: "";
  position: absolute; left: 0; top: 13px;
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--wz-gradient-energy);
  box-shadow: var(--wz-glow-accent);
}
.wz-bullets li .wz-dim { color: var(--wz-color-text-secondary); }
.wz-chip {
  display: inline-flex; align-items: center; gap: 12px;
  border-radius: var(--wz-radius-chip);
  border: var(--wz-border-faint);
  background: var(--wz-color-card-fill);
  padding: 12px 28px;
  font-size: var(--wz-type-caption-size);
  font-weight: 600;
  color: var(--wz-color-text-secondary);
}
.wz-chip .wz-dot { width: 10px; height: 10px; border-radius: 50%; }
.wz-note {
  margin-top: var(--wz-space-md);
  font-size: var(--wz-type-caption-size);
  line-height: var(--wz-type-caption-line-height);
  color: var(--wz-color-text-muted);
}
`;
}

/** Overflow probe — runs in-page, reports card/content overflow into the DOM for the validator. */
const PROBE = `
function wzMeasure(final) {
  const problems = [];
  const guard = 1;
  document.querySelectorAll(".wz-card, [data-overflow-guard]").forEach((el, i) => {
    if (el.scrollHeight > el.clientHeight + guard || el.scrollWidth > el.clientWidth + guard) {
      problems.push({
        element: el.getAttribute("data-wz-name") || el.className.split(" ")[0] + "#" + i,
        scrollHeight: el.scrollHeight, clientHeight: el.clientHeight,
        scrollWidth: el.scrollWidth, clientWidth: el.clientWidth
      });
    }
  });
  const content = document.querySelector(".wz-content");
  const footerRule = document.querySelector(".wz-footer-rule");
  if (content && footerRule) {
    const fb = footerRule.getBoundingClientRect();
    for (const child of content.querySelectorAll("*")) {
      const r = child.getBoundingClientRect();
      if (r.height > 0 && r.bottom > fb.top - 4) {
        problems.push({ element: "content-intrudes-footer", detail: child.className || child.tagName });
        break;
      }
    }
  }
  const report = { ok: problems.length === 0, final, problems };
  let s = document.getElementById("wz-overflow-report");
  if (!s) {
    s = document.createElement("script");
    s.type = "application/json";
    s.id = "wz-overflow-report";
    document.body.appendChild(s);
  }
  s.textContent = JSON.stringify(report);
}
// Provisional measurement immediately (layout is complete at end-of-body), then a
// definitive one once the bundled font has settled — so a report always exists
// even if DOM serialisation wins the race against font loading.
wzMeasure(false);
// setTimeout, not requestAnimationFrame: headless DOM dumps produce no
// compositor frames, so rAF callbacks may never fire there. Layout metrics are
// current after a task-queue turn.
Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 4000))])
  .then(() => setTimeout(() => wzMeasure(true), 50));
`;

/** Standard headline block shared by all content templates. */
export function titleBlock(slide, { accentTitle, esc: e }) {
  return `<div class="wz-title" data-wz-name="title">${accentTitle(slide.title, slide.titleAccent)}</div>
${slide.subtitle ? `<div class="wz-subtitle">${e(slide.subtitle)}</div>` : ""}
${slide.supporting ? `<div class="wz-intro">${e(slide.supporting)}</div>` : ""}`;
}

/**
 * Wraps a template's content zone in the master chrome.
 * slide: validated slide-content JSON. contentHtml: template body markup.
 */
export function masterFrame(slide, contentHtml, { relFontPath }) {
  const logo = loadLogo("horizontalDark");
  const pageMarker =
    slide.slideNumber && slide.totalSlides
      ? `${String(slide.slideNumber).padStart(2, "0")} / ${String(slide.totalSlides).padStart(2, "0")}`
      : "";
  const footerNote = slide.footerNote ?? "WattZap Energy Solutions — Confidential";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(slide.title)}</title>
<style>${masterCss(relFontPath)}</style>
</head>
<body>
<div class="wz-slide" data-wz-canvas role="img" aria-label="${esc(slide.a11yLabel ?? slide.title)}">
  <div class="wz-grid"></div>
  <header class="wz-header">
    <div class="wz-logo" data-wz-logo="horizontalDark">${logo}</div>
    ${slide.sectionLabel ? `<div class="wz-section-label">${esc(slide.sectionLabel)}</div>` : ""}
  </header>
  <main class="wz-content" data-overflow-guard data-wz-name="content">
${contentHtml}
  </main>
  <div class="wz-footer-rule"></div>
  <footer class="wz-footer">
    <div class="wz-footer-note">${esc(footerNote)}</div>
    <div class="wz-page-marker">${esc(pageMarker)}</div>
  </footer>
</div>
<script>${PROBE}</script>
</body>
</html>
`;
}
