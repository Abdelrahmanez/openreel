#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function tryVersion(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" }).trim().split(/\r?\n/)[0];
  } catch {
    return null;
  }
}

const nodeVer = process.versions.node;
const major = Number.parseInt(nodeVer.split(".")[0], 10);
const npmVer = tryVersion("npm -v");
const gitVer = tryVersion("git --version");
const ffmpegVer = tryVersion("ffmpeg -version");
const editorModulesReady = fs.existsSync(path.join(ROOT, "editor", "node_modules"));
const onboarded =
  fs.existsSync(path.join(ROOT, "docs", "STRATEGY.md")) &&
  fs.existsSync(path.join(ROOT, "docs", "BRAND.md")) &&
  fs.existsSync(path.join(ROOT, "docs", "TOOL_MODE.md"));

const report = {
  node: { version: nodeVer, ok: major >= 20 },
  npm: { version: npmVer, ok: Boolean(npmVer) },
  editorDepsInstalled: editorModulesReady,
  onboarded,
  optional: {
    git: gitVer,
    ffmpeg: ffmpegVer,
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
