#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EDITOR_DIR = path.join(ROOT, "editor");

const THEME_IDS = ["editorial-dark", "swiss-bold", "studio-warm", "tech-blueprint"];

function parseArgs(argv) {
  const args = {
    title: "Your Idea to Final Reel",
    subtitle: "AI guides every step — zero editing guesswork",
    tag: "OpenReel Studio",
    handle: "@yourhandle",
    lang: "en",
    out: path.join(ROOT, "docs", "previews"),
    accent: undefined,
    highlight: undefined,
    theme: undefined,
  };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const val = argv[i + 1];
    if (!key.startsWith("--") || val === undefined) continue;
    const name = key.slice(2);
    if (name in args) {
      args[name] = val;
      i++;
    }
  }
  return args;
}

const opts = parseArgs(process.argv.slice(2));
const outDir = path.resolve(opts.out);
fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(path.join(EDITOR_DIR, "node_modules"))) {
  console.error("editor/node_modules not found. Run `npm --prefix editor install` first.");
  process.exit(1);
}

const themesToRender =
  opts.theme && THEME_IDS.includes(opts.theme) ? [opts.theme] : THEME_IDS;

const remotionCli = path.join(EDITOR_DIR, "node_modules", "@remotion", "cli", "remotion-cli.js");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "openreel-previews-"));

try {
  for (const themeId of themesToRender) {
    const propsPath = path.join(tempDir, `${themeId}.json`);
    const outFile = path.join(outDir, `${themeId}.png`);
    const payload = {
      themeId,
      title: opts.title,
      subtitle: opts.subtitle,
      tag: opts.tag,
      handle: opts.handle,
      lang: opts.lang === "ar" ? "ar" : "en",
      ...(opts.accent ? { accentOverride: opts.accent } : {}),
      ...(opts.highlight ? { highlightOverride: opts.highlight } : {}),
    };
    fs.writeFileSync(propsPath, JSON.stringify(payload), "utf8");
    console.log(`Rendering preview: ${themeId} -> ${outFile}`);
    execFileSync(
      process.execPath,
      [remotionCli, "still", "src/index.ts", "ThemePreview", outFile, `--props=${propsPath}`],
      {
        cwd: EDITOR_DIR,
        stdio: "inherit",
      }
    );
  }
  console.log(`\nRendered ${themesToRender.length} preview(s) into ${outDir}`);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
