/**
 * WattZap Brand Studio — renderer core.
 * Deterministic slide rendering: JSON content + brand tokens + master templates → HTML → PNG.
 * Zero external dependencies beyond the repo's existing toolchain and a local Chromium/Chrome.
 */
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

export function loadTokens() {
  return JSON.parse(readFileSync(path.join(repoRoot, "brand/tokens/brand-tokens.json"), "utf8"));
}

export function loadTokensCss() {
  return readFileSync(path.join(repoRoot, "brand/tokens/brand-tokens.css"), "utf8");
}

/**
 * Returns the exact bytes of an official logo SVG. Never modified, only inlined.
 * name: "horizontalDark" | "icon" | "iconTransparent"
 */
export function loadLogo(name) {
  const tokens = loadTokens();
  const entry = tokens.logo[name];
  if (!entry) throw new Error(`Unknown logo asset "${name}"`);
  const file = path.join(repoRoot, entry.file);
  if (!existsSync(file)) {
    throw new Error(`MISSING OFFICIAL ASSET: ${entry.file} — do not substitute; restore the official file.`);
  }
  return readFileSync(file, "utf8");
}

export function loadIcon(name) {
  const file = path.join(repoRoot, "brand/assets/icons", `${name}.svg`);
  if (!existsSync(file)) throw new Error(`Unknown icon "${name}" (expected brand/assets/icons/${name}.svg)`);
  return readFileSync(file, "utf8");
}

export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wraps the accent phrase of a title in a gradient span. Falls back to plain title. */
export function accentTitle(title, accent) {
  if (!accent || !title.includes(accent)) return esc(title);
  const [before, ...rest] = title.split(accent);
  return `${esc(before)}<span class="wz-accent">${esc(accent)}</span>${esc(rest.join(accent))}`;
}

export function iconSpan(name, tone = "cyan") {
  if (!name) return "";
  return `<span class="wz-icon wz-icon-${tone}">${loadIcon(name)}</span>`;
}

/** Playwright-style headless_shell installs, if present (best fidelity: window-size == viewport). */
function findHeadlessShells() {
  const found = [];
  for (const base of ["/opt/pw-browsers", path.join(process.env.HOME ?? "", ".cache/ms-playwright")]) {
    try {
      for (const dir of readdirSync(base)) {
        if (dir.startsWith("chromium_headless_shell")) {
          const p = path.join(base, dir, "chrome-linux", "headless_shell");
          if (existsSync(p)) found.push(p);
        }
      }
    } catch { /* base missing */ }
  }
  return found.sort().reverse();
}

/**
 * Locates a usable Chromium/Chrome binary for deterministic PNG export.
 * Preference: WATTZAP_CHROME env → Playwright headless_shell → full Chromium/Chrome.
 * headless_shell is preferred because its --window-size is exactly the viewport;
 * full Chrome's new headless mode can reserve window-UI space and clip the canvas.
 */
export function findChromium() {
  const candidates = [
    process.env.WATTZAP_CHROME,
    process.env.CHROME_PATH,
    ...findHeadlessShells(),
    "/opt/pw-browsers/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      if (existsSync(c)) return c;
    } catch { /* keep looking */ }
  }
  try {
    return execFileSync("which", ["chromium"], { encoding: "utf8" }).trim() || null;
  } catch {
    return null;
  }
}

function headlessArgs(chrome) {
  return chrome.includes("headless_shell") ? [] : ["--headless=new"];
}

/**
 * Renders an HTML file to a 1920×1080 PNG using headless Chromium.
 * --virtual-time-budget fast-forwards the official logo's CSS animations to
 * their completed state, so the exact SVG renders fully drawn — no asset edits.
 */
export function htmlToPng(htmlPath, pngPath, { scale = 1 } = {}) {
  const chrome = findChromium();
  if (!chrome) {
    throw new Error(
      "No Chromium/Chrome found. Set WATTZAP_CHROME=/path/to/chrome. PNG export needs a local browser; HTML sources were still written."
    );
  }
  const tokens = loadTokens();
  const w = tokens.slide.width * scale;
  const h = tokens.slide.height * scale;
  execFileSync(
    chrome,
    [
      ...headlessArgs(chrome),
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      `--window-size=${w},${h}`,
      `--force-device-scale-factor=${scale}`,
      `--screenshot=${pngPath}`,
      "--virtual-time-budget=10000",
      pathToFileURL(htmlPath).href,
    ],
    { stdio: "pipe" }
  );
}

/** Extracts the overflow report the in-page probe writes into the DOM. Retries the font-load race. */
export function probeOverflow(htmlPath) {
  const chrome = findChromium();
  if (!chrome) return { skipped: true, reason: "no chromium available" };
  for (let attempt = 1; attempt <= 3; attempt++) {
    const dom = execFileSync(
      chrome,
      [
        ...headlessArgs(chrome),
        "--no-sandbox",
        "--disable-gpu",
        `--virtual-time-budget=${10000 * attempt}`,
        "--dump-dom",
        pathToFileURL(htmlPath).href,
      ],
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }
    );
    const m = dom.match(/<script[^>]*id="wz-overflow-report"[^>]*>([\s\S]*?)<\/script>/);
    if (m) {
      try {
        const report = JSON.parse(m[1]);
        // Prefer the post-font-load measurement; accept the provisional one on the last try.
        if (report.final || attempt === 3) return report;
      } catch { /* fall through to retry */ }
    }
  }
  return { skipped: true, reason: "probe report not found in DOM after 3 attempts" };
}

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

export function writeFile(file, content) {
  ensureDir(path.dirname(file));
  writeFileSync(file, content);
}

export function sha256File(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}
