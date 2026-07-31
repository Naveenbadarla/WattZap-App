#!/usr/bin/env node
/**
 * Generates brand/tokens/brand-tokens.css from brand/tokens/brand-tokens.json.
 * brand-tokens.json is the single source of truth — never edit the CSS by hand.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const tokensPath = path.join(repoRoot, "brand/tokens/brand-tokens.json");
const cssPath = path.join(repoRoot, "brand/tokens/brand-tokens.css");

const t = JSON.parse(readFileSync(tokensPath, "utf8"));

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const lines = [];

for (const [k, v] of Object.entries(t.color)) lines.push(`  --wz-color-${kebab(k)}: ${v};`);
for (const [k, v] of Object.entries(t.gradient)) lines.push(`  --wz-gradient-${kebab(k)}: ${v};`);
for (const [k, v] of Object.entries(t.glow)) lines.push(`  --wz-glow-${kebab(k)}: ${v};`);
lines.push(`  --wz-font-family: ${t.font.family};`);
for (const [k, v] of Object.entries(t.type)) {
  if (typeof v !== "object") continue;
  lines.push(`  --wz-type-${kebab(k)}-size: ${v.size}px;`);
  lines.push(`  --wz-type-${kebab(k)}-weight: ${v.weight};`);
  lines.push(`  --wz-type-${kebab(k)}-line-height: ${v.lineHeight};`);
  lines.push(`  --wz-type-${kebab(k)}-letter-spacing: ${v.letterSpacing};`);
}
for (const [k, v] of Object.entries(t.spacing)) lines.push(`  --wz-space-${kebab(k)}: ${v}px;`);
for (const [k, v] of Object.entries(t.radius)) lines.push(`  --wz-radius-${kebab(k)}: ${v}px;`);
for (const [k, v] of Object.entries(t.border)) lines.push(`  --wz-border-${kebab(k)}: ${v};`);
for (const [k, v] of Object.entries(t.slide)) {
  if (typeof v === "number") lines.push(`  --wz-slide-${kebab(k)}: ${v}px;`);
}
lines.push(`  --wz-grid-cell: ${t.grid.cellSize}px;`);
lines.push(`  --wz-grid-color: ${t.grid.color};`);

const css = `/*
 * GENERATED FILE — do not edit by hand.
 * Source of truth: brand/tokens/brand-tokens.json (version ${t.version})
 * Regenerate with: npm run brand:tokens
 */
:root {
${lines.join("\n")}
}
`;

writeFileSync(cssPath, css);
console.log(`Wrote ${path.relative(repoRoot, cssPath)} (${lines.length} custom properties)`);
