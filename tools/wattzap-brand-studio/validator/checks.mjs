/**
 * WattZap Brand Studio — validation checks.
 * Each check returns { errors: string[], warnings: string[] }.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { repoRoot, loadTokens, loadTokensCss, sha256File } from "../renderer/lib.mjs";
import { validateSlide, TEMPLATE_IDS } from "./content-schema.mjs";

const rel = (p) => path.relative(repoRoot, p);

export function pngDimensions(file) {
  const buf = readFileSync(file);
  if (buf.length < 24 || buf.readUInt32BE(12) !== 0x49484452) return null; // IHDR
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export function checkOfficialAssets() {
  const errors = [];
  const warnings = [];
  const tokens = loadTokens();
  for (const [name, entry] of Object.entries(tokens.logo)) {
    if (typeof entry !== "object" || !entry.file) continue;
    const file = path.join(repoRoot, entry.file);
    if (!existsSync(file)) {
      errors.push(`MISSING OFFICIAL ASSET: ${entry.file} (${name}) — do not substitute; restore the official file.`);
      continue;
    }
    const hash = sha256File(file);
    if (entry.sha256 && hash !== entry.sha256) {
      errors.push(
        `LOGO MODIFIED: ${entry.file} sha256 ${hash} does not match the protected checksum in brand-tokens.json. Official logos must never be altered.`
      );
    }
  }
  if (!existsSync(path.join(repoRoot, "brand/assets/references/wattzap-website-reference.png"))) {
    warnings.push("Missing reference: brand/assets/references/wattzap-website-reference.png");
  }
  if (!existsSync(path.join(repoRoot, loadTokens().font.file))) {
    errors.push(`Missing font: ${loadTokens().font.file} — deterministic rendering requires the bundled Inter variable font.`);
  }
  return { errors, warnings };
}

export function checkTokens() {
  const errors = [];
  const warnings = [];
  let tokens;
  try {
    tokens = loadTokens();
  } catch (e) {
    return { errors: [`brand-tokens.json unreadable: ${e.message}`], warnings };
  }
  for (const key of ["color", "gradient", "glow", "font", "type", "spacing", "radius", "border", "slide", "logo", "grid", "content", "export"]) {
    if (!tokens[key]) errors.push(`brand-tokens.json missing "${key}" section`);
  }
  if (tokens.slide && (tokens.slide.width !== 1920 || tokens.slide.height !== 1080)) {
    errors.push(`Slide canvas must be 1920×1080 (found ${tokens.slide.width}×${tokens.slide.height})`);
  }
  // CSS must be regenerable byte-for-byte from JSON (no hand edits, no drift).
  try {
    const current = readFileSync(path.join(repoRoot, "brand/tokens/brand-tokens.css"), "utf8");
    if (!current.includes("GENERATED FILE")) {
      errors.push("brand-tokens.css missing generated-file header — regenerate with npm run brand:tokens");
    }
    if (!current.includes(`version ${tokens.version}`)) {
      errors.push("brand-tokens.css version differs from brand-tokens.json — regenerate with npm run brand:tokens");
    }
    for (const [k, v] of Object.entries(tokens.color)) {
      if (!current.includes(String(v))) errors.push(`brand-tokens.css out of sync: colour "${k}" (${v}) not present — run npm run brand:tokens`);
    }
  } catch {
    errors.push("brand/tokens/brand-tokens.css missing — run npm run brand:tokens");
  }
  return { errors, warnings };
}

export function checkSchema() {
  const errors = [];
  const warnings = [];
  try {
    const schema = JSON.parse(readFileSync(path.join(repoRoot, "brand/schemas/slide-content.schema.json"), "utf8"));
    const enumIds = schema.properties?.template?.enum ?? [];
    const missing = TEMPLATE_IDS.filter((t) => !enumIds.includes(t));
    const extra = enumIds.filter((t) => !TEMPLATE_IDS.includes(t));
    if (missing.length) errors.push(`schema template enum missing: ${missing.join(", ")}`);
    if (extra.length) errors.push(`schema template enum has unknown templates: ${extra.join(", ")}`);
  } catch (e) {
    errors.push(`slide-content.schema.json unreadable: ${e.message}`);
  }
  for (const t of TEMPLATE_IDS) {
    if (!existsSync(path.join(repoRoot, "brand/templates", t, "template.mjs"))) {
      errors.push(`Missing master template module: brand/templates/${t}/template.mjs`);
    }
  }
  if (!existsSync(path.join(repoRoot, "brand/templates/master-slide/master.mjs"))) {
    errors.push("Missing master chrome: brand/templates/master-slide/master.mjs");
  }
  return { errors, warnings };
}

export function checkContentDir(dir) {
  const errors = [];
  const warnings = [];
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.endsWith(".report.json"))
    .sort();
  const tokens = loadTokens();
  const namePattern = new RegExp(tokens.export.filenamePattern);
  const slides = [];
  for (const f of files) {
    if (!namePattern.test(f)) {
      errors.push(`${rel(path.join(dir, f))}: filename must match ${tokens.export.filenamePattern} (e.g. 01-title.json)`);
    }
    let json;
    try {
      json = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
    } catch (e) {
      errors.push(`${rel(path.join(dir, f))}: invalid JSON — ${e.message}`);
      continue;
    }
    delete json.$schema;
    const result = validateSlide(json, rel(path.join(dir, f)));
    if (!result.ok) errors.push(...result.errors);
    else slides.push({ file: f, slide: result.slide });
  }
  // Deck-level rules: multi-slide sets need consistent, unique page markers.
  const withNumbers = slides.filter((s) => s.slide.slideNumber);
  if (slides.length > 1) {
    if (withNumbers.length !== slides.length) {
      errors.push(`${rel(dir)}: multi-slide set — every slide needs slideNumber and totalSlides (page markers are mandatory).`);
    }
    const totals = new Set(withNumbers.map((s) => s.slide.totalSlides));
    if (totals.size > 1) errors.push(`${rel(dir)}: inconsistent totalSlides across the set: ${[...totals].join(", ")}`);
    const nums = withNumbers.map((s) => s.slide.slideNumber);
    if (new Set(nums).size !== nums.length) errors.push(`${rel(dir)}: duplicate slideNumber values`);
  }
  for (const { file, slide } of slides) {
    const spellings = /optimiz(e|ing|ation)|color\b|analyz/i;
    const text = JSON.stringify(slide);
    if (spellings.test(text)) {
      warnings.push(`${rel(path.join(dir, file))}: possible American spelling — use British/Indian English (optimisation, colour, analyse).`);
    }
  }
  return { errors, warnings, count: files.length };
}

export function checkGeneratedDir(dir, { logoBytes, approvedHex }) {
  const errors = [];
  const warnings = [];
  const tokens = loadTokens();
  const htmlFiles = readdirSync(dir).filter((f) => f.endsWith(".html")).sort();
  const pngFiles = readdirSync(dir).filter((f) => f.endsWith(".png")).sort();

  for (const f of pngFiles) {
    const dims = pngDimensions(path.join(dir, f));
    if (!dims) {
      errors.push(`${rel(path.join(dir, f))}: not a valid PNG`);
      continue;
    }
    const scaleW = dims.width / tokens.slide.width;
    const scaleH = dims.height / tokens.slide.height;
    if (scaleW !== scaleH || !Number.isInteger(dims.width / 16) || Math.abs(dims.width / dims.height - 16 / 9) > 0.001) {
      errors.push(`${rel(path.join(dir, f))}: ${dims.width}×${dims.height} is not 16:9 at the master canvas size`);
    } else if (dims.width !== tokens.slide.width) {
      warnings.push(`${rel(path.join(dir, f))}: ${dims.width}×${dims.height} (scaled export; master is 1920×1080)`);
    }
  }

  for (const f of htmlFiles) {
    const p = path.join(dir, f);
    const html = readFileSync(p, "utf8");
    const label = rel(p);
    if (!html.includes(logoBytes.trim())) {
      errors.push(`${label}: does not embed the exact official horizontal logo SVG — only brand/assets/logos files may be used.`);
    }
    if (!html.includes('class="wz-grid"')) errors.push(`${label}: missing technical-grid background component`);
    if (!html.includes("wz-page-marker")) errors.push(`${label}: missing page-marker element`);
    if (!/aria-label="[^"]+"/.test(html)) warnings.push(`${label}: missing aria-label on slide root`);
    for (const m of html.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) {
      const size = Number(m[1]);
      if (size < tokens.type.minReadableSize) {
        errors.push(`${label}: font-size ${size}px below minimum readable size ${tokens.type.minReadableSize}px`);
        break;
      }
    }
    const bodyOnly = html.replace(/<svg[\s\S]*?<\/svg>/g, "");
    for (const m of bodyOnly.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
      const hex = `#${m[1].toUpperCase()}`;
      if (!approvedHex.has(hex)) {
        errors.push(`${label}: unapproved colour ${hex} — only brand-token colours are allowed.`);
        break;
      }
    }
    const report = p.replace(/\.html$/, ".report.json");
    if (existsSync(report)) {
      const r = JSON.parse(readFileSync(report, "utf8"));
      if (r.overflow && r.overflow.ok === false) {
        errors.push(`${label}: overflow recorded in ${rel(report)} — shorten content or split the slide.`);
      }
    } else {
      warnings.push(`${label}: no .report.json — re-render to capture the overflow report.`);
    }
  }
  return { errors, warnings, htmlCount: htmlFiles.length, pngCount: pngFiles.length };
}

/** Approved hex set = brand token colours + colours used inside the official logo files. */
export function approvedHexSet() {
  const tokens = loadTokens();
  const set = new Set();
  const collect = (s) => {
    for (const m of String(s).matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) set.add(`#${m[1].toUpperCase()}`);
  };
  for (const v of Object.values(tokens.color)) collect(v);
  for (const v of Object.values(tokens.gradient)) collect(v);
  for (const entry of Object.values(tokens.logo)) {
    if (entry && entry.file) {
      const p = path.join(repoRoot, entry.file);
      if (existsSync(p)) collect(readFileSync(p, "utf8"));
    }
  }
  collect(loadTokensCss());
  return set;
}

export function listExampleDirs() {
  const base = path.join(repoRoot, "brand/examples");
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .map((d) => path.join(base, d))
    .filter((d) => statSync(d).isDirectory());
}

export function listGeneratedDirs() {
  const base = path.join(repoRoot, "brand/generated");
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .map((d) => path.join(base, d))
    .filter((d) => statSync(d).isDirectory());
}
