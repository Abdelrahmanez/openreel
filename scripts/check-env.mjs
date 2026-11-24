#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findFfmpeg, findFfprobe } from "./lib/ffmpeg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function tryVersion(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" })
      .trim()
      .split(/\r?\n/)[0];
  } catch {
    return null;
  }
}

const nodeVer = process.versions.node;
const major = Number.parseInt(nodeVer.split(".")[0], 10);
const npmVer = tryVersion("npm -v");
const gitVer = tryVersion("git --version");
const editorModulesReady = fs.existsSync(path.join(ROOT, "editor", "node_modules"));
const ffmpegInfo = findFfmpeg();
const ffprobeInfo = findFfprobe();
const sfxDir = path.join(ROOT, "editor", "public", "sfx");
const sfxFiles = ["whoosh.wav", "pop.wav", "ding.wav", "impact.wav", "click.wav", "riser.wav"];
const sfxReady = sfxFiles.every((f) => fs.existsSync(path.join(sfxDir, f)));
const onboarded =
  fs.existsSync(path.join(ROOT, "docs", "STRATEGY.md")) &&
  fs.existsSync(path.join(ROOT, "docs", "BRAND.md")) &&
  fs.existsSync(path.join(ROOT, "docs", "TOOL_MODE.md"));

const report = {
  node: { version: nodeVer, ok: major >= 20 },
  npm: { version: npmVer, ok: Boolean(npmVer) },
  editorDepsInstalled: editorModulesReady,
  ffmpeg: {
    ok: Boolean(ffmpegInfo && ffprobeInfo),
    source: ffmpegInfo?.source ?? null,
    path: ffmpegInfo?.path ?? null,
  },
  sfxKitReady: sfxReady,
  onboarded,
  optional: {
    git: gitVer,
    groqApiKeySet: Boolean(process.env.GROQ_API_KEY),
    openaiApiKeySet: Boolean(process.env.OPENAI_API_KEY),
  },
};

console.log(JSON.stringify(report, null, 2));

if (major < 20 || !npmVer) {
  console.error("\n[OpenReel] Node.js >= 20 and npm are required. Install LTS from https://nodejs.org");
  process.exit(1);
}
if (!editorModulesReady) {
  console.log("\n[OpenReel] Next step: run `cd editor && npm install`");
}
