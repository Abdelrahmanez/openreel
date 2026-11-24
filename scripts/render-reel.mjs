#!/usr/bin/env node
/**
 * One-command OpenReel renderer & fast previewer.
 * Auto-stages local reel media into editor/public/reel_media/<slug>/,
 * ensures built-in SFX exist, and renders either fast still previews or full MP4 + Cover PNG.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EDITOR_DIR = path.join(ROOT, "editor");
const SFX_DIR = path.join(EDITOR_DIR, "public", "sfx");
const REQUIRED_SFX = ["whoosh.wav", "pop.wav", "ding.wav", "impact.wav", "click.wav", "riser.wav"];

function printHelp() {
  console.log(`Usage: node scripts/render-reel.mjs <reel-dir> [options]

Options:
  --preview              Render key still frames + cover.png (fast visual check)
  --frames 0,90,180      Custom frame numbers for --preview
  --video-only           Skip cover.png render
  --cover-only           Render only cover.png
  --out <dir>            Custom output directory (default: <reel-dir>/out)
  -h, --help             Show this help`);
}

function parseCli(argv) {
  if (argv.includes("-h") || argv.includes("--help") || argv.length === 0) {
    printHelp();
    process.exit(argv.length === 0 ? 1 : 0);
  }
  const opts = {
    reelArg: null,
    preview: false,
    videoOnly: false,
    coverOnly: false,
    frames: null,
    outDir: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--preview") opts.preview = true;
    else if (a === "--video-only") opts.videoOnly = true;
    else if (a === "--cover-only") opts.coverOnly = true;
    else if (a === "--frames" && argv[i + 1]) {
      opts.frames = argv[++i]
        .split(",")
        .map((n) => Number.parseInt(n.trim(), 10))
        .filter((n) => Number.isFinite(n) && n >= 0);
    } else if (a === "--out" && argv[i + 1]) {
      opts.outDir = argv[++i];
    } else if (!a.startsWith("--") && !opts.reelArg) {
      opts.reelArg = a;
    }
  }
  return opts;
}

function resolveReelDir(arg) {
  const candidates = [
    path.resolve(arg),
    path.join(ROOT, arg),
    path.join(ROOT, "reels", arg),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
      return c;
    }
  }
  throw new Error(`Reel directory not found: ${arg}`);
}

function ensureSfxKit() {
  const missing = REQUIRED_SFX.some(
    (name) => !fs.existsSync(path.join(SFX_DIR, name))
  );
  if (missing) {
    console.log("[OpenReel] Generating built-in SFX kit...");
    execFileSync(process.execPath, [path.join(ROOT, "scripts", "generate-sfx.mjs")], {
      stdio: "inherit",
    });
  }
}

function estimateTotalFrames(reelProps) {
  const scenes = Array.isArray(reelProps.scenes) ? reelProps.scenes : [];
  if (scenes.length === 0) return 30;
  const ov = reelProps.overrides || {};
  const defKind = ov.transition ?? "fade";
  const defFrames = Math.max(0, ov.transitionFrames ?? 8);
  let total = Math.max(15, scenes[0].durationFrames || 30);

  for (let i = 1; i < scenes.length; i++) {
    const prev = scenes[i - 1];
    const cur = scenes[i];
    const curDur = Math.max(15, cur.durationFrames || 30);
    const prevDur = Math.max(15, prev.durationFrames || 30);
    const kind =
      cur.transition ??
      (prev.type === "talking-head" && cur.type === "talking-head"
        ? "cut"
        : defKind);
    const maxSafe = Math.floor(Math.min(prevDur, curDur) / 3);
    const tFrames = kind === "cut" ? 0 : Math.min(defFrames, maxSafe);
    const eff = tFrames >= 2 ? tFrames : 0;
    total += curDur - eff;
  }
  return Math.max(30, total);
}

function stageMediaPath(rawSrc, reelDir, stageDir, stagePrefix) {
  if (
    !rawSrc ||
    typeof rawSrc !== "string" ||
    /^(https?:|data:|blob:)/i.test(rawSrc) ||
    rawSrc.startsWith("sfx/") ||
    rawSrc.startsWith("reel_media/")
  ) {
    return rawSrc;
  }

  const candidateA = path.resolve(reelDir, rawSrc);
  const candidateB = path.resolve(ROOT, rawSrc);
  const found = fs.existsSync(candidateA)
    ? candidateA
    : fs.existsSync(candidateB)
      ? candidateB
      : null;

  if (!found) {
    return rawSrc;
  }

  const safeName = rawSrc
    .replace(/\\/g, "/")
    .replace(/^(\.\.\/)+/, "")
    .replace(/^\.\//, "");
  const dest = path.join(stageDir, safeName);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(found, dest);
  return `${stagePrefix}/${safeName}`;
}

function stageAllMedia(reelProps, reelDir, stageDir, stagePrefix) {
  const cloned = structuredClone(reelProps);
  if (cloned.audioSrc) {
    cloned.audioSrc = stageMediaPath(cloned.audioSrc, reelDir, stageDir, stagePrefix);
  }
  if (cloned.aRollSrc) {
    cloned.aRollSrc = stageMediaPath(cloned.aRollSrc, reelDir, stageDir, stagePrefix);
  }
  if (Array.isArray(cloned.scenes)) {
    for (const s of cloned.scenes) {
      if (s.src) {
        s.src = stageMediaPath(s.src, reelDir, stageDir, stagePrefix);
      }
      if (s.top?.src) {
        s.top.src = stageMediaPath(s.top.src, reelDir, stageDir, stagePrefix);
      }
      if (s.bottom?.src) {
        s.bottom.src = stageMediaPath(s.bottom.src, reelDir, stageDir, stagePrefix);
      }
    }
  }
  return cloned;
}

const opts = parseCli(process.argv.slice(2));
if (!opts.reelArg) {
  printHelp();
  process.exit(1);
}

if (!fs.existsSync(path.join(EDITOR_DIR, "node_modules"))) {
  console.error("editor/node_modules not found. Run `npm --prefix editor install` first.");
  process.exit(1);
}

const reelDir = resolveReelDir(opts.reelArg);
const reelJsonPath = path.join(reelDir, "reel.json");
const coverJsonPath = path.join(reelDir, "cover.json");

if (!fs.existsSync(reelJsonPath)) {
  console.error(`Missing ${reelJsonPath}`);
  process.exit(1);
}

ensureSfxKit();

const slug = path.basename(reelDir);
const outDir = opts.outDir ? path.resolve(opts.outDir) : path.join(reelDir, "out");
fs.mkdirSync(outDir, { recursive: true });

const remotionCli = path.join(EDITOR_DIR, "node_modules", "@remotion", "cli", "remotion-cli.js");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "openreel-render-"));
const stagePrefix = `reel_media/${slug}`;
const stageDir = path.join(EDITOR_DIR, "public", "reel_media", slug);

try {
  const rawReel = JSON.parse(fs.readFileSync(reelJsonPath, "utf8").replace(/^\uFEFF/, ""));
  const stagedReel = stageAllMedia(rawReel, reelDir, stageDir, stagePrefix);
  // Explicitly clear optional top-level fields so Remotion defaultProps never leak into custom reels
  if (!Array.isArray(stagedReel.words)) stagedReel.words = [];
  if (!stagedReel.overrides) stagedReel.overrides = {};
  const stagedPropsPath = path.join(tempDir, "reel.props.json");
  fs.writeFileSync(stagedPropsPath, JSON.stringify(stagedReel, null, 2), "utf8");

  if (!opts.coverOnly) {
    if (opts.preview) {
      const total = estimateTotalFrames(stagedReel);
      const frames =
        opts.frames && opts.frames.length > 0
          ? opts.frames
          : [0, Math.floor(total * 0.45), Math.max(0, total - 18)];

      for (const frameNum of frames) {
        const clamped = Math.max(0, Math.min(total - 1, frameNum));
        const outStill = path.join(outDir, `preview_f${clamped}.png`);
        console.log(`[OpenReel] Preview frame ${clamped} -> ${path.relative(ROOT, outStill)}`);
        execFileSync(
          process.execPath,
          [
            remotionCli,
            "still",
            "src/index.ts",
            "ReelTemplate",
            outStill,
            `--frame=${clamped}`,
            `--props=${stagedPropsPath}`,
          ],
          { cwd: EDITOR_DIR, stdio: "inherit" }
        );
      }
    } else {
      const outVideo = path.join(outDir, "reel.mp4");
      console.log(`[OpenReel] Rendering MP4 -> ${path.relative(ROOT, outVideo)}`);
      execFileSync(
        process.execPath,
        [
          remotionCli,
          "render",
          "src/index.ts",
          "ReelTemplate",
          outVideo,
          `--props=${stagedPropsPath}`,
        ],
        { cwd: EDITOR_DIR, stdio: "inherit" }
      );
    }
  }

  if (!opts.videoOnly && fs.existsSync(coverJsonPath)) {
    const outCover = path.join(outDir, "cover.png");
    console.log(`[OpenReel] Rendering Cover -> ${path.relative(ROOT, outCover)}`);
    execFileSync(
      process.execPath,
      [
        remotionCli,
        "still",
        "src/index.ts",
        "CoverComposition",
        outCover,
        `--props=${coverJsonPath}`,
      ],
      { cwd: EDITOR_DIR, stdio: "inherit" }
    );
  }
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
  if (fs.existsSync(stageDir)) {
    fs.rmSync(stageDir, { recursive: true, force: true });
  }
}
