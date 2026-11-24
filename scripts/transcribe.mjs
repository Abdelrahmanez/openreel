#!/usr/bin/env node
/**
 * OpenReel Zero-Python Transcription & Script Alignment -> captions.json
 * Supports:
 *   1. Groq Whisper API (when GROQ_API_KEY is set)
 *   2. OpenAI Whisper API (when OPENAI_API_KEY is set)
 *   3. 100% Free Local CPU via @remotion/install-whisper-cpp (cached under .cache/whisper)
 */
import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { probeMedia, requireFfmpeg } from "./lib/ffmpeg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function printHelp() {
  console.log(`Usage: node scripts/transcribe.mjs <input-audio-or-video> <captions.json> [options]

Options:
  --lang <ar|en|auto>             Spoken language hint (default: auto)
  --model <base|small|medium>     Local Whisper model size (default: base)
  --script <file.txt|lines.json>  Exact spoken script for typo-free alignment
  --max-words <N>                 Max words per caption line (default: 5)
  --highlights "w1,w2"            Comma-separated keywords to highlight
  --provider <auto|local|groq|openai>  Transcription backend (default: auto)
  -h, --help                      Show this help`);
}

function parseCli(argv) {
  if (argv.includes("-h") || argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }
  const positional = [];
  const opts = {
    lang: "auto",
    model: "base",
    script: null,
    maxWords: 5,
    highlights: [],
    provider: "auto",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--lang" && argv[i + 1]) opts.lang = argv[++i];
    else if (arg === "--model" && argv[i + 1]) opts.model = argv[++i];
    else if (arg === "--script" && argv[i + 1]) opts.script = argv[++i];
    else if (arg === "--max-words" && argv[i + 1]) opts.maxWords = Math.max(1, Number(argv[++i]) || 5);
    else if (arg === "--provider" && argv[i + 1]) opts.provider = argv[++i];
    else if (arg === "--highlights" && argv[i + 1]) {
      opts.highlights = argv[++i]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    } else if (!arg.startsWith("--")) {
      positional.push(arg);
    }
  }
  return { input: positional[0], output: positional[1], opts };
}

function normalizeToken(tok) {
  return String(tok)
    .replace(/[.,!?؟،:"'«»()\[\]—–-]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim()
    .toLowerCase();
}

function extractWav16k(inputPath, wavPath) {
  const { ffmpeg } = requireFfmpeg();
  const info = probeMedia(inputPath);
  if (!info.hasAudio) {
    throw new Error(`Input file has no audio stream: ${inputPath}`);
  }
  execFileSync(
    ffmpeg,
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      inputPath,
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-c:a",
      "pcm_s16le",
      wavPath,
    ],
    { stdio: "inherit" }
  );
  return info.durationSec;
}

async function transcribeRemoteWhisper(wavPath, provider, lang) {
  const isGroq = provider === "groq";
  const apiKey = isGroq ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(`Missing ${isGroq ? "GROQ_API_KEY" : "OPENAI_API_KEY"}`);
  }
  const url = isGroq
    ? "https://api.groq.com/openai/v1/audio/transcriptions"
    : "https://api.openai.com/v1/audio/transcriptions";
  const model = isGroq ? "whisper-large-v3-turbo" : "whisper-1";

  const audioBuf = fs.readFileSync(wavPath);
  const form = new FormData();
  form.append("file", new Blob([audioBuf], { type: "audio/wav" }), "audio.wav");
  form.append("model", model);
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "word");
  form.append("timestamp_granularities[]", "segment");
  if (lang && lang !== "auto") {
    form.append("language", lang);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${provider} Whisper API failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const rawWords = Array.isArray(data.words) ? data.words : [];
  if (rawWords.length > 0) {
    return rawWords
      .map((w) => ({
        text: String(w.word || w.text || "").trim(),
        startMs: Math.round(Number(w.start || 0) * 1000),
        endMs: Math.round(Number(w.end || 0) * 1000),
      }))
      .filter((w) => w.text);
  }

  // Fallback to segment splitting if API only returned segments
  const segs = Array.isArray(data.segments) ? data.segments : [];
  const words = [];
  for (const seg of segs) {
    const tokens = String(seg.text || "").trim().split(/\s+/).filter(Boolean);
    const startMs = Math.round(Number(seg.start || 0) * 1000);
    const endMs = Math.round(Number(seg.end || 0) * 1000);
    const total = Math.max(200, endMs - startMs);
    tokens.forEach((tok, idx) => {
      const wStart = Math.round(startMs + (idx / tokens.length) * total);
      const wEnd = Math.round(startMs + ((idx + 1) / tokens.length) * total);
      words.push({ text: tok, startMs: wStart, endMs: Math.max(wStart + 80, wEnd) });
    });
  }
  return words;
}

async function transcribeLocalWhisper(wavPath, modelName, lang) {
  const cacheRoot = path.join(ROOT, ".cache", "whisper");
  const pkgEntry = path.join(
    cacheRoot,
    "node_modules",
    "@remotion",
    "install-whisper-cpp",
    "dist",
    "index.js"
  );

  if (!fs.existsSync(pkgEntry)) {
    fs.mkdirSync(cacheRoot, { recursive: true });
    console.log("[OpenReel transcribe] Installing @remotion/install-whisper-cpp into .cache/whisper (first run only)...");
    execSync("npm install --no-save @remotion/install-whisper-cpp", {
      cwd: cacheRoot,
      stdio: "inherit",
    });
  }

  const mod = await import(pathToFileURL(pkgEntry).href);
  const whisperDir = path.join(cacheRoot, "whisper.cpp");
  const whisperVersion = "1.5.5";

  if (!fs.existsSync(whisperDir)) {
    console.log("[OpenReel transcribe] Setting up local whisper.cpp...");
    await mod.installWhisperCpp({ to: whisperDir, version: whisperVersion });
  }

  await mod.downloadWhisperModel({
    model: modelName,
    folder: whisperDir,
  });

  const result = await mod.transcribe({
    inputPath: wavPath,
    whisperPath: whisperDir,
    whisperCppVersion: whisperVersion,
    model: modelName,
    tokenLevelTimestamps: true,
    language: lang === "auto" ? undefined : lang,
  });

  const transcriptions = Array.isArray(result.transcription) ? result.transcription : [];
  const rawTokens = [];
  for (const item of transcriptions) {
    if (Array.isArray(item.tokens) && item.tokens.length > 0) {
      for (const t of item.tokens) {
        const text = String(t.text || "");
        if (!text.trim() || text.trim().startsWith("[_")) continue;
        rawTokens.push({
          text,
          startMs: Math.round(t.offsets?.from ?? item.offsets?.from ?? 0),
          endMs: Math.round(t.offsets?.to ?? item.offsets?.to ?? 0),
        });
      }
    } else if (item.text) {
      rawTokens.push({
        text: ` ${String(item.text).trim()}`,
        startMs: Math.round(item.offsets?.from ?? 0),
        endMs: Math.round(item.offsets?.to ?? 0),
      });
    }
  }

  // Merge BPE sub-word tokens into whole words (new word starts with whitespace)
  const words = [];
  for (const tok of rawTokens) {
    const startsNew = /^\s/.test(tok.text) || words.length === 0;
    const clean = tok.text.trim();
    if (!clean) continue;
    if (startsNew) {
      words.push({ text: clean, startMs: tok.startMs, endMs: Math.max(tok.startMs + 80, tok.endMs) });
    } else {
      const prev = words[words.length - 1];
      prev.text += clean;
      prev.endMs = Math.max(prev.endMs, tok.endMs);
    }
  }
  return words;
}

function loadScriptLines(scriptPath) {
  const abs = path.resolve(scriptPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Script file not found: ${abs}`);
  }
  const raw = fs.readFileSync(abs, "utf8").replace(/^\uFEFF/, "");
  if (abs.toLowerCase().endsWith(".json")) {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Script JSON must be an array.");
    return parsed
      .map((item) =>
        typeof item === "string"
          ? { text: item.trim(), highlight: [] }
          : {
              text: String(item.text || "").trim(),
              highlight: Array.isArray(item.highlight)
                ? item.highlight.map((h) => normalizeToken(h))
                : [],
            }
      )
      .filter((x) => x.text);
  }
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !l.startsWith(">"))
    .map((text) => ({ text, highlight: [] }));
}

function distributeWordsOverRange(tokens, startMs, endMs, highlightSet) {
  const totalMs = Math.max(220, endMs - startMs);
  const weights = tokens.map((w) => Math.max(2, w.length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let cursor = startMs;
  return tokens.map((word, i) => {
    const share = (weights[i] / totalWeight) * totalMs;
    const wStart = Math.round(cursor);
    const wEnd = i === tokens.length - 1 ? endMs : Math.round(cursor + share);
    cursor += share;
    const norm = normalizeToken(word);
    return {
      text: word,
      startMs: wStart,
      endMs: Math.max(wStart + 70, wEnd),
      highlight: highlightSet.has(norm),
    };
  });
}

function alignScriptToWords(scriptItems, transcribedWords, globalHighlights) {
  if (transcribedWords.length === 0) {
    throw new Error("Transcription returned zero spoken words to align.");
  }
  const speechStart = transcribedWords[0].startMs;
  const speechEnd = transcribedWords[transcribedWords.length - 1].endMs;
  const spanMs = Math.max(500, speechEnd - speechStart);

  // Map cumulative script character weight onto real transcribed word boundaries
  const totalScriptWords = scriptItems.reduce(
    (sum, item) => sum + item.text.split(/\s+/).filter(Boolean).length,
    0
  );

  const lines = [];
  const words = [];
  let wordOffset = 0;

  scriptItems.forEach((item, idx) => {
    const tokens = item.text.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return;

    const startFrac = wordOffset / Math.max(1, totalScriptWords);
    wordOffset += tokens.length;
    const endFrac = wordOffset / Math.max(1, totalScriptWords);

    const rawStartIdx = Math.min(
      transcribedWords.length - 1,
      Math.floor(startFrac * transcribedWords.length)
    );
    const rawEndIdx = Math.min(
      transcribedWords.length - 1,
      Math.max(rawStartIdx, Math.ceil(endFrac * transcribedWords.length) - 1)
    );

    const startMs =
      idx === 0
        ? speechStart
        : transcribedWords[rawStartIdx]?.startMs ??
          Math.round(speechStart + startFrac * spanMs);
    const endMs =
      idx === scriptItems.length - 1
        ? speechEnd
        : transcribedWords[rawEndIdx]?.endMs ??
          Math.round(speechStart + endFrac * spanMs);

    const safeEnd = Math.max(startMs + 250, endMs);
    const hlList = [...new Set([...globalHighlights, ...item.highlight])];
    const hlSet = new Set(hlList.map(normalizeToken));

    lines.push({
      seg: idx,
      text: item.text,
      startMs,
      endMs: safeEnd,
      highlight: hlList,
    });
    words.push(...distributeWordsOverRange(tokens, startMs, safeEnd, hlSet));
  });

  return { lines, words };
}

function chunkWordsToLines(rawWords, maxWords, globalHighlights) {
  const hlSet = new Set(globalHighlights.map(normalizeToken));
  const lines = [];
  const words = [];

  let bucket = [];
  const flush = () => {
    if (bucket.length === 0) return;
    const segIdx = lines.length;
    const text = bucket.map((w) => w.text).join(" ");
    const startMs = bucket[0].startMs;
    const endMs = Math.max(startMs + 150, bucket[bucket.length - 1].endMs);
    const lineHighlights = bucket
      .filter((w) => hlSet.has(normalizeToken(w.text)))
      .map((w) => normalizeToken(w.text));

    lines.push({
      seg: segIdx,
      text,
      startMs,
      endMs,
      highlight: [...new Set(lineHighlights)],
    });

    for (const w of bucket) {
      words.push({
        text: w.text,
        startMs: w.startMs,
        endMs: Math.max(w.startMs + 70, w.endMs),
        highlight: hlSet.has(normalizeToken(w.text)),
      });
    }
    bucket = [];
  };

  for (let i = 0; i < rawWords.length; i++) {
    const w = rawWords[i];
    const prev = bucket[bucket.length - 1];
    const pauseMs = prev ? w.startMs - prev.endMs : 0;
    const prevEndsSentence = prev && /[.!?؟،]$/.test(prev.text);

    if (
      bucket.length >= maxWords ||
      (bucket.length >= 2 && (pauseMs > 380 || prevEndsSentence))
    ) {
      flush();
    }
    bucket.push(w);
  }
  flush();

  return { lines, words };
}

async function main() {
  const { input, output, opts } = parseCli(process.argv.slice(2));
  if (!input || !output) {
    printHelp();
    process.exit(1);
  }

  const absIn = path.resolve(input);
  const absOut = path.resolve(output);
  if (!fs.existsSync(absIn)) {
    console.error(`Input file not found: ${absIn}`);
    process.exit(1);
  }

  let provider = opts.provider;
  if (provider === "auto") {
    if (process.env.GROQ_API_KEY) provider = "groq";
    else if (process.env.OPENAI_API_KEY) provider = "openai";
    else provider = "local";
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "openreel-whisper-"));
  const wavPath = path.join(tempDir, "audio_16k.wav");

  try {
    extractWav16k(absIn, wavPath);
    console.log(`[OpenReel transcribe] Running ${provider} transcription...`);
    const rawWords =
      provider === "local"
        ? await transcribeLocalWhisper(wavPath, opts.model, opts.lang)
        : await transcribeRemoteWhisper(wavPath, provider, opts.lang);

    let result;
    if (opts.script) {
      const scriptItems = loadScriptLines(opts.script);
      const aligned = alignScriptToWords(scriptItems, rawWords, opts.highlights);
      result = {
        source: `${provider}-script-aligned`,
        lang: opts.lang,
        ...aligned,
      };
    } else {
      const chunked = chunkWordsToLines(rawWords, opts.maxWords, opts.highlights);
      result = {
        source: `${provider}-whisper`,
        lang: opts.lang,
        ...chunked,
      };
    }

    fs.mkdirSync(path.dirname(absOut), { recursive: true });
    fs.writeFileSync(absOut, JSON.stringify(result, null, 2) + "\n", "utf8");
    console.log(
      `Wrote ${result.lines.length} caption lines (${result.words.length} words) via ${result.source} -> ${absOut}`
    );
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(`[OpenReel transcribe] ${err.message}`);
  process.exit(1);
});
