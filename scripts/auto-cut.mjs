#!/usr/bin/env node
/**
 * OpenReel Auto-Cut: removes awkward pauses/silences from talking-head video or audio
 * in a single synchronized FFmpeg pass (zero lip-sync drift) + EBU R128 loudnorm.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { probeMedia, requireFfmpeg } from "./lib/ffmpeg.mjs";

function printHelp() {
  console.log(`Usage: node scripts/auto-cut.mjs <input> <output.mp4> [options]

Options:
  --threshold <dB>       Silence threshold (default: -38dB)
  --min-silence <sec>    Minimum silence length to cut in seconds (default: 0.35)
  --pad <sec>            Breath padding kept around speech in seconds (default: 0.10)
  --no-loudnorm          Skip -14 LUFS loudness normalization
  --edl <cuts.json>      Custom path for cut-list JSON report
  --dry-run              Analyze silences and write EDL JSON without rendering output
  -h, --help             Show this help`);
}

function parseCli(argv) {
  if (argv.includes("-h") || argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }
  const positional = [];
  const opts = {
    threshold: "-38dB",
    minSilence: 0.35,
    pad: 0.10,
    loudnorm: true,
    edl: null,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--no-loudnorm") {
      opts.loudnorm = false;
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (arg === "--threshold" && argv[i + 1]) {
      opts.threshold = argv[++i];
    } else if (arg === "--min-silence" && argv[i + 1]) {
      opts.minSilence = Number(argv[++i]);
    } else if (arg === "--pad" && argv[i + 1]) {
      opts.pad = Number(argv[++i]);
    } else if (arg === "--edl" && argv[i + 1]) {
      opts.edl = argv[++i];
    } else if (!arg.startsWith("--")) {
      positional.push(arg);
    }
  }
  return { input: positional[0], output: positional[1], opts };
}

function hasFfmpegFilter(ffmpeg, filterName) {
  try {
    const res = spawnSync(ffmpeg, ["-hide_banner", "-filters"], {
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    });
    const text = `${res.stdout || ""}\n${res.stderr || ""}`;
    return new RegExp(`\\b${filterName}\\b`).test(text);
  } catch {
    return false;
  }
}

function detectSilences(ffmpeg, inputPath, threshold, minSilence, totalDuration, useHighpass) {
  const af = useHighpass
    ? `highpass=f=80,silencedetect=noise=${threshold}:d=${minSilence}`
    : `silencedetect=noise=${threshold}:d=${minSilence}`;
  const res = spawnSync(
    ffmpeg,
    [
      "-hide_banner",
      "-i",
      inputPath,
      "-vn",
      "-af",
      af,
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
  );

  if (res.status !== 0) {
    throw new Error(`FFmpeg silencedetect failed (exit ${res.status}): ${res.stderr || ""}`);
  }

  const stderr = res.stderr || "";
  const silences = [];
  let pendingStart = null;

  for (const line of stderr.split(/\r?\n/)) {
    const startMatch = line.match(/silence_start:\s*([0-9.]+)/);
    if (startMatch) {
      pendingStart = Number(startMatch[1]);
      continue;
    }
    const endMatch = line.match(/silence_end:\s*([0-9.]+)/);
    if (endMatch) {
      const endVal = Number(endMatch[1]);
      const startVal = pendingStart !== null ? pendingStart : 0;
      if (endVal > startVal) {
        silences.push([startVal, Math.min(totalDuration, endVal)]);
      }
      pendingStart = null;
    }
  }

  if (pendingStart !== null && totalDuration > pendingStart) {
    silences.push([pendingStart, totalDuration]);
  }
  return silences;
}

function computeKeepSegments(silences, totalDuration, padSec) {
  const rawKeep = [];
  let cursor = 0;

  for (const [sStart, sEnd] of silences) {
    if (sStart > cursor) {
      rawKeep.push([cursor, sStart]);
    }
    cursor = Math.max(cursor, sEnd);
  }
  if (cursor < totalDuration) {
    rawKeep.push([cursor, totalDuration]);
  }

  // Expand by breath padding and drop tiny blips
  const padded = rawKeep
    .filter(([s, e]) => e - s >= 0.08)
    .map(([s, e]) => [Math.max(0, s - padSec), Math.min(totalDuration, e + padSec)]);

  // Merge overlapping or micro-gap segments (< 0.14s)
  const merged = [];
  for (const seg of padded) {
    if (merged.length === 0) {
      merged.push([...seg]);
    } else {
      const prev = merged[merged.length - 1];
      if (seg[0] <= prev[1] + 0.14) {
        prev[1] = Math.max(prev[1], seg[1]);
      } else {
        merged.push([...seg]);
      }
    }
  }

  return merged
    .filter(([s, e]) => e - s >= 0.12)
    .map(([s, e]) => [Number(s.toFixed(3)), Number(e.toFixed(3))]);
}

const { input, output, opts } = parseCli(process.argv.slice(2));
if (!input || !output) {
  printHelp();
  process.exit(1);
}

const absIn = path.resolve(input);
const absOut = path.resolve(output);
const edlPath = opts.edl
  ? path.resolve(opts.edl)
  : path.join(
      path.dirname(absOut),
      `${path.basename(absOut, path.extname(absOut))}.cuts.json`
    );

const { ffmpeg } = requireFfmpeg();
const info = probeMedia(absIn);

if (!info.hasAudio) {
  console.error(`[OpenReel auto-cut] Input has no audio stream: ${absIn}`);
  process.exit(1);
}
if (info.durationSec <= 0) {
  console.error(`[OpenReel auto-cut] Could not determine duration for: ${absIn}`);
  process.exit(1);
}

const useHighpass = hasFfmpegFilter(ffmpeg, "highpass");
const useSetpts = hasFfmpegFilter(ffmpeg, "setpts");
const silences = detectSilences(
  ffmpeg,
  absIn,
  opts.threshold,
  opts.minSilence,
  info.durationSec,
  useHighpass
);
const kept = computeKeepSegments(silences, info.durationSec, opts.pad);

if (kept.length === 0) {
  console.error(
    `[OpenReel auto-cut] Entire clip fell below threshold ${opts.threshold}. Try lowering --threshold (e.g. -45dB).`
  );
  process.exit(1);
}

let outCursor = 0;
const segments = kept.map(([startSec, endSec], idx) => {
  const durationSec = Number((endSec - startSec).toFixed(3));
  const item = {
    index: idx,
    startSec,
    endSec,
    durationSec,
    outStartSec: Number(outCursor.toFixed(3)),
    outEndSec: Number((outCursor + durationSec).toFixed(3)),
  };
  outCursor += durationSec;
  return item;
});

const outputDurationSec = Number(outCursor.toFixed(3));
const removedSec = Number(Math.max(0, info.durationSec - outputDurationSec).toFixed(3));

const report = {
  input: absIn,
  output: absOut,
  threshold: opts.threshold,
  minSilenceSec: opts.minSilence,
  padSec: opts.pad,
  loudnorm: opts.loudnorm,
  originalDurationSec: Number(info.durationSec.toFixed(3)),
  outputDurationSec,
  removedSec,
  keptSegmentsCount: segments.length,
  segments,
};

fs.mkdirSync(path.dirname(edlPath), { recursive: true });
fs.writeFileSync(edlPath, JSON.stringify(report, null, 2) + "\n", "utf8");

if (opts.dryRun) {
  console.log(JSON.stringify({ ...report, edlPath, dryRun: true }, null, 2));
  process.exit(0);
}

fs.mkdirSync(path.dirname(absOut), { recursive: true });
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "openreel-autocut-"));
const filterScriptPath = path.join(tempDir, "filter_complex.txt");

try {
  if (info.hasVideo && !useSetpts) {
    // Fallback for minimal Remotion-bundled FFmpeg (lacks setpts filter):
    // frame-accurate segment re-encode + concat demuxer + optional loudnorm.
    const concatEntries = [];
    for (const seg of segments) {
      const segPath = path.join(tempDir, `seg_${String(seg.index).padStart(4, "0")}.mp4`);
      execFileSync(
        ffmpeg,
        [
          "-y",
          "-hide_banner",
          "-loglevel",
          "error",
          "-i",
          absIn,
          "-ss",
          String(seg.startSec),
          "-t",
          String(seg.durationSec),
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          "18",
          "-pix_fmt",
          "yuv420p",
          "-c:a",
          "aac",
          "-b:a",
          "192k",
          "-ar",
          "48000",
          segPath,
        ],
        { stdio: "inherit" }
      );
      const escaped = segPath.replace(/\\/g, "/").replace(/'/g, "'\\''");
      concatEntries.push(`file '${escaped}'`);
    }

    const concatListPath = path.join(tempDir, "concat.txt");
    fs.writeFileSync(concatListPath, concatEntries.join("\n") + "\n", "utf8");

    const concatArgs = [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatListPath,
      "-c:v",
      "copy",
    ];
    if (opts.loudnorm) {
      concatArgs.push(
        "-af",
        "loudnorm=I=-14:TP=-1.5:LRA=11",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000"
      );
    } else {
      concatArgs.push("-c:a", "copy");
    }
    concatArgs.push("-movflags", "+faststart", absOut);
    execFileSync(ffmpeg, concatArgs, { stdio: "inherit" });
  } else {
    const lines = [];
    const concatInputs = [];

    segments.forEach((seg, i) => {
      if (info.hasVideo) {
        lines.push(
          `[0:v]trim=start=${seg.startSec}:end=${seg.endSec},setpts=PTS-STARTPTS[v${i}];`
        );
        lines.push(
          `[0:a]atrim=start=${seg.startSec}:end=${seg.endSec},asetpts=PTS-STARTPTS[a${i}];`
        );
        concatInputs.push(`[v${i}][a${i}]`);
      } else {
        lines.push(
          `[0:a]atrim=start=${seg.startSec}:end=${seg.endSec},asetpts=PTS-STARTPTS[a${i}];`
        );
        concatInputs.push(`[a${i}]`);
      }
    });

    const n = segments.length;
    const hpPrefix = useHighpass ? "highpass=f=80," : "";
    if (info.hasVideo) {
      lines.push(`${concatInputs.join("")}concat=n=${n}:v=1:a=1[vout][araw];`);
      if (opts.loudnorm) {
        lines.push(`[araw]${hpPrefix}loudnorm=I=-14:TP=-1.5:LRA=11[aout]`);
      } else {
        lines.push(`[araw]anull[aout]`);
      }
    } else {
      lines.push(`${concatInputs.join("")}concat=n=${n}:v=0:a=1[araw];`);
      if (opts.loudnorm) {
        lines.push(`[araw]${hpPrefix}loudnorm=I=-14:TP=-1.5:LRA=11[aout]`);
      } else {
        lines.push(`[araw]anull[aout]`);
      }
    }

    const filterText = lines.join("");

    const ffArgs = [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      absIn,
      "-filter_complex",
      filterText,
    ];

    if (info.hasVideo) {
      ffArgs.push(
        "-map",
        "[vout]",
        "-map",
        "[aout]",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000",
        "-movflags",
        "+faststart",
        absOut
      );
    } else {
      const ext = path.extname(absOut).toLowerCase();
      ffArgs.push("-map", "[aout]");
      if (ext === ".wav") {
        ffArgs.push("-c:a", "pcm_s16le", "-ar", "48000", absOut);
      } else {
        ffArgs.push("-c:a", "aac", "-b:a", "192k", "-ar", "48000", absOut);
      }
    }

    execFileSync(ffmpeg, ffArgs, { stdio: "inherit" });
  }
  console.log(
    JSON.stringify(
      {
        ...report,
        edlPath,
      },
      null,
      2
    )
  );
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
