#!/usr/bin/env node
/**
 * WattZap Brand Studio — deterministic slide renderer.
 *
 * Usage:
 *   node tools/wattzap-brand-studio/scripts/render.mjs <content.json | dir> [more...] [--out <dir>] [--scale <n>] [--no-png]
 *
 * For each content JSON file this writes, next to `--out` (default brand/generated/<parent-dir-name>/):
 *   <name>.html         editable deterministic source (inline official logo, tokens, fonts)
 *   <name>.png          1920×1080 presentation-ready export
 *   <name>.report.json  validation + overflow report
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  repoRoot,
  loadTokens,
  esc,
  accentTitle,
  iconSpan,
  loadLogo,
  htmlToPng,
  probeOverflow,
  writeFile,
} from "../renderer/lib.mjs";
import { validateSlide } from "../validator/content-schema.mjs";
import { masterFrame } from "../../../brand/templates/master-slide/master.mjs";

const args = process.argv.slice(2);
const inputs = [];
let outDir = null;
let scale = 1;
let png = true;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--out") outDir = path.resolve(args[++i]);
  else if (args[i] === "--scale") scale = Number(args[++i]) || 1;
  else if (args[i] === "--no-png") png = false;
  else inputs.push(args[i]);
}
if (!inputs.length) {
  console.error("Usage: render.mjs <content.json | dir> [--out dir] [--scale n] [--no-png]");
  process.exit(2);
}

const files = [];
for (const input of inputs) {
  const p = path.resolve(input);
  if (statSync(p).isDirectory()) {
    for (const f of readdirSync(p).sort()) {
      if (f.endsWith(".json") && !f.endsWith(".report.json")) files.push(path.join(p, f));
    }
  } else {
    files.push(p);
  }
}
if (!files.length) {
  console.error("No content JSON files found.");
  process.exit(2);
}

async function loadTemplate(templateId) {
  const mod = await import(path.join(repoRoot, "brand/templates", templateId, "template.mjs"));
  if (typeof mod.render !== "function") throw new Error(`Template ${templateId} has no render()`);
  return mod;
}

const helpers = { esc, accentTitle, iconSpan, loadLogo };
const tokens = loadTokens();
let failed = 0;

for (const file of files) {
  const name = path.basename(file, ".json");
  const targetDir = outDir ?? path.join(repoRoot, "brand/generated", path.basename(path.dirname(file)));
  const json = JSON.parse(readFileSync(file, "utf8"));
  const result = validateSlide(json, path.relative(repoRoot, file));
  if (!result.ok) {
    failed++;
    console.error(`✗ ${name}: content validation failed`);
    for (const e of result.errors) console.error(`    ${e}`);
    continue;
  }
  const slide = result.slide;
  const template = await loadTemplate(slide.template);
  const contentHtml = template.render(slide, helpers);
  const relFontPath = path
    .relative(targetDir, path.join(repoRoot, tokens.font.file))
    .split(path.sep)
    .join("/");
  const html = masterFrame(slide, contentHtml, { relFontPath });

  const htmlPath = path.join(targetDir, `${name}.html`);
  writeFile(htmlPath, html);

  let overflow = { skipped: true, reason: "png export disabled" };
  let pngPath = null;
  if (png) {
    pngPath = path.join(targetDir, `${name}.png`);
    htmlToPng(htmlPath, pngPath, { scale });
    overflow = probeOverflow(htmlPath);
  }

  const report = {
    source: path.relative(repoRoot, file),
    template: slide.template,
    title: slide.title,
    pageMarker: slide.slideNumber ? `${slide.slideNumber}/${slide.totalSlides}` : null,
    outputs: {
      html: path.relative(repoRoot, htmlPath),
      png: pngPath ? path.relative(repoRoot, pngPath) : null,
    },
    dimensions: { width: tokens.slide.width * scale, height: tokens.slide.height * scale },
    logo: "brand/assets/logos/wattzap-animated-horizontal-dark.svg (exact bytes, inlined)",
    overflow,
    ok: overflow.skipped ? true : overflow.ok,
  };
  writeFile(path.join(targetDir, `${name}.report.json`), JSON.stringify(report, null, 2) + "\n");

  if (report.ok) {
    console.log(`✓ ${name} → ${path.relative(repoRoot, targetDir)}/ (${slide.template}${overflow.skipped ? ", overflow check skipped" : ""})`);
  } else {
    failed++;
    console.error(`✗ ${name}: OVERFLOW detected — shorten content or split the slide`);
    for (const p of overflow.problems) console.error(`    ${JSON.stringify(p)}`);
  }
}

process.exit(failed ? 1 : 0);
