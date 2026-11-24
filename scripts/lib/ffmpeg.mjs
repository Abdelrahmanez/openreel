#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

function findRemotionBinary(binaryBase) {
  const remotionScope = path.join(ROOT, "editor", "node_modules", "@remotion");
  if (!fs.existsSync(remotionScope)) return null;
  const exe = process.platform === "win32" ? `${binaryBase}.exe` : binaryBase;
  for (const entry of fs.readdirSync(remotionScope, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith("compositor-")) continue;
    const candidate = path.join(remotionScope, entry.name, exe);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function findOnPath(cmd) {
  try {
    const res = spawnSync(cmd, ["-version"], {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
    });
    if (res.status === 0) return cmd;
  } catch {
    // not found on PATH
  }
  return null;
}

export function findFfmpeg() {
  const preferBundled = process.env.OPENREEL_FFMPEG_PREFER === "bundled";
  if (!preferBundled) {
    const sys = findOnPath("ffmpeg");
    if (sys) return { path: sys, source: "system-path" };
  }
  const bundled = findRemotionBinary("ffmpeg");
  if (bundled) return { path: bundled, source: "remotion-bundled" };
  if (preferBundled) {
    const sys = findOnPath("ffmpeg");
    if (sys) return { path: sys, source: "system-path" };
  }
  return null;
}

export function findFfprobe() {
  const preferBundled = process.env.OPENREEL_FFMPEG_PREFER === "bundled";
  if (!preferBundled) {
    const sys = findOnPath("ffprobe");
    if (sys) return { path: sys, source: "system-path" };
  }
  const bundled = findRemotionBinary("ffprobe");
  if (bundled) return { path: bundled, source: "remotion-bundled" };
  if (preferBundled) {
    const sys = findOnPath("ffprobe");
    if (sys) return { path: sys, source: "system-path" };
  }
  return null;
}

export function requireFfmpeg() {
  const ff = findFfmpeg();
  const fp = findFfprobe();
  if (!ff || !fp) {
    throw new Error(
      "FFmpeg/ffprobe not found. Run `npm --prefix editor install` (to use Remotion's bundled FFmpeg) or install FFmpeg on PATH."
    );
  }
  return { ffmpeg: ff.path, ffprobe: fp.path, source: ff.source };
}

function parseFraction(rateStr) {
  if (!rateStr || rateStr === "0/0") return 30;
  const parts = String(rateStr).split("/");
  if (parts.length === 2) {
    const num = Number(parts[0]);
    const den = Number(parts[1]);
    if (den > 0 && Number.isFinite(num / den)) return num / den;
  }
  const n = Number(rateStr);
  return Number.isFinite(n) && n > 0 ? n : 30;
}

export function probeMedia(filePath) {
  const { ffprobe } = requireFfmpeg();
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Media file not found: ${abs}`);
  }
  const raw = execFileSync(
    ffprobe,
    [
      "-v",
      "error",
      "-show_format",
      "-show_streams",
      "-print_format",
      "json",
      abs,
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
  );
  const info = JSON.parse(raw);
  const streams = Array.isArray(info.streams) ? info.streams : [];
  const video = streams.find((s) => s.codec_type === "video");
  const audio = streams.find((s) => s.codec_type === "audio");
  const durationSec = Number(
    info.format?.duration || video?.duration || audio?.duration || 0
  );

  // Respect display rotation side data when reporting effective width/height
  let width = video?.width ?? 0;
  let height = video?.height ?? 0;
  const sideData = Array.isArray(video?.side_data_list) ? video.side_data_list : [];
  const rotData = sideData.find((d) => typeof d.rotation === "number");
  const rot = rotData ? Math.abs(rotData.rotation) : 0;
  if (rot === 90 || rot === 270) {
    [width, height] = [height, width];
  }

  return {
    path: abs,
    durationSec: Number.isFinite(durationSec) ? durationSec : 0,
    width,
    height,
    fps: video ? parseFraction(video.r_frame_rate || video.avg_frame_rate) : 0,
    hasVideo: Boolean(video),
    hasAudio: Boolean(audio),
    videoCodec: video?.codec_name ?? null,
    audioCodec: audio?.codec_name ?? null,
  };
}
