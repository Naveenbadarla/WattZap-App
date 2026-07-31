#!/usr/bin/env node
/**
 * WattZap Brand Studio — brand validator.
 * Usage: node tools/wattzap-brand-studio/scripts/validate.mjs  (or: npm run brand:validate)
 * Validates tokens, schema, official assets, slide content, and generated outputs.
 * Exits non-zero on any error; warnings are reported but do not fail the run.
 */
import path from "node:path";
import { readFileSync } from "node:fs";
import { repoRoot, loadTokens } from "../renderer/lib.mjs";
import {
  checkOfficialAssets,
  checkTokens,
  checkSchema,
  checkContentDir,
  checkGeneratedDir,
  approvedHexSet,
  listExampleDirs,
  listGeneratedDirs,
} from "../validator/checks.mjs";

const errors = [];
const warnings = [];
const sections = [];

function run(name, fn) {
  try {
    const r = fn();
    sections.push({ name, errors: r.errors.length, warnings: r.warnings.length });
    errors.push(...r.errors);
    warnings.push(...r.warnings);
    return r;
  } catch (e) {
    sections.push({ name, errors: 1, warnings: 0 });
    errors.push(`${name}: check crashed — ${e.message}`);
    return { errors: [e.message], warnings: [] };
  }
}

run("tokens", checkTokens);
run("schema & templates", checkSchema);
run("official assets", checkOfficialAssets);

let slideCount = 0;
for (const dir of listExampleDirs()) {
  const r = run(`content: ${path.relative(repoRoot, dir)}`, () => checkContentDir(dir));
  slideCount += r.count ?? 0;
}

const tokens = loadTokens();
const logoBytes = readFileSync(path.join(repoRoot, tokens.logo.horizontalDark.file), "utf8");
const approved = approvedHexSet();
for (const dir of listGeneratedDirs()) {
  run(`generated: ${path.relative(repoRoot, dir)}`, () =>
    checkGeneratedDir(dir, { logoBytes, approvedHex: approved })
  );
}

console.log("WattZap brand validation");
console.log("========================");
for (const s of sections) {
  const status = s.errors ? "✗" : "✓";
  console.log(`${status} ${s.name}${s.errors ? ` — ${s.errors} error(s)` : ""}${s.warnings ? ` — ${s.warnings} warning(s)` : ""}`);
}
console.log(`\nChecked ${slideCount} slide content file(s).`);
if (warnings.length) {
  console.log("\nWarnings:");
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}
if (errors.length) {
  console.error("\nErrors:");
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`\nFAILED with ${errors.length} error(s).`);
  process.exit(1);
}
console.log("\nPASSED — brand system is consistent.");
