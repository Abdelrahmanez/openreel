#!/usr/bin/env node
/**
 * Convert an .srt subtitle file or script lines JSON into OpenReel captions.json
 * (with per-word timestamps for word-by-word karaoke captions).
 */
import fs from "node:fs";
import path from "node:path";

function printHelp() {
  console.log(`Usage: node scripts/srt-to-captions.mjs <input.srt|lines.json> <captions.json> [options]

Options:
  --max-words <N>       Split long SRT lines into max N words per beat (default: 0 = keep original)
  --highlights "w1,w2"  Comma-separated keywords to highlight
  -h, --help            Show this help`);
}

function parseCli(argv) {
  if (argv.includes("-h") || argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }
  const positional = [];
  const opts = { maxWords: 0, highlights: [] };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--max-words" && argv[i + 1]) {
      opts.maxWords = Math.max(0, Number(argv[++i]) || 0);
    } else if (arg === "--highlights" && argv[i + 1]) {
      opts.highlights = argv[++i]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    } else if (!arg.startsWith("--")) {
      positional.push(arg);
    }
  }
  return { inputPath: positional[0], outputPath: positional[1], opts };
}

function parseSrtTime(stamp) {
  const m = stamp.trim().match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);
  if (!m) throw new Error(`Invalid SRT timestamp: ${stamp}`);
  const [, hh, mm, ss, ms] = m;
  return (Number(hh) * 3600 + Number(mm) * 60 + Number(ss)) * 1000 + Number(ms);
}

function normalizeWord(word) {
  return word.replace(/[.,!?؟،:"'«»()]/g, "").toLowerCase();
}

function splitWordsWithTiming(text, startMs, endMs, highlightSet) {
  const cleanTokens = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (cleanTokens.length === 0) return [];
  const totalMs = Math.max(250, endMs - startMs);
  const weights = cleanTokens.map((w) => Math.max(2, w.length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let cursor = startMs;
  return cleanTokens.map((word, idx) => {
    const share = (weights[idx] / totalWeight) * totalMs;
    const wStart = Math.round(cursor);
    const wEnd = idx === cleanTokens.length - 1 ? endMs : Math.round(cursor + share);
    cursor += share;
    const normalized = normalizeWord(word);
    return {
      text: word,
      startMs: wStart,
      endMs: Math.max(wStart + 80, wEnd),
      highlight: highlightSet.has(normalized),
    };
  });
}

function chunkWordList(wordList, maxWords, highlightSet) {
  const lines = [];
  for (let i = 0; i < wordList.length; i += maxWords) {
    const slice = wordList.slice(i, i + maxWords);
    const text = slice.map((w) => w.text).join(" ");
    const lineHighlights = slice
      .map((w) => normalizeWord(w.text))
      .filter((n) => highlightSet.has(n));
    lines.push({
      seg: lines.length,
      text,
      startMs: slice[0].startMs,
      endMs: slice[slice.length - 1].endMs,
      highlight: [...new Set(lineHighlights)],
    });
  }
  return lines;
}

function parseSrt(raw, maxWords, globalHighlights) {
  const cleaned = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  const blocks = cleaned.split(/\n{2,}/);
  const hlSet = new Set(globalHighlights.map(normalizeWord));
  const lines = [];
  const words = [];

  for (const block of blocks) {
    const rowLines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (rowLines.length < 2) continue;
    const timeLineIdx = rowLines[0].includes("-->") ? 0 : 1;
    const timeMatch = rowLines[timeLineIdx]?.match(/^(.+?)\s+-->\s+([^\s]+)/);
    if (!timeMatch) continue;
    const startMs = parseSrtTime(timeMatch[1]);
    const endMs = parseSrtTime(timeMatch[2]);
    const text = rowLines.slice(timeLineIdx + 1).join(" ").trim();
    if (!text) continue;

    const blockWords = splitWordsWithTiming(text, startMs, endMs, hlSet);
    words.push(...blockWords);

    if (maxWords > 0 && blockWords.length > maxWords) {
      const chunks = chunkWordList(blockWords, maxWords, hlSet);
      for (const ch of chunks) {
        lines.push({ ...ch, seg: lines.length });
      }
    } else {
      const lineHighlights = blockWords
        .map((w) => normalizeWord(w.text))
        .filter((n) => hlSet.has(n));
      lines.push({
        seg: lines.length,
        text,
        startMs,
        endMs,
        highlight: [...new Set(lineHighlights)],
      });
    }
  }
  return { source: "srt", lines, words };
}

function parseLinesJson(raw, globalHighlights) {
  const cleaned = raw.replace(/^\uFEFF/, "");
  const items = JSON.parse(cleaned);
  if (!Array.isArray(items)) {
    throw new Error("Script JSON must be an array of strings or { text, durationSec?, highlight? } objects.");
  }

  let cursorMs = 0;
  const lines = [];
  const words = [];
  const globalHlNorm = globalHighlights.map(normalizeWord);

  items.forEach((item, idx) => {
    const text = typeof item === "string" ? item.trim() : String(item.text || "").trim();
    if (!text) return;
    const tokenCount = text.split(/\s+/).filter(Boolean).length;
    const durationMs =
      typeof item === "object" && item.durationSec
        ? Math.round(Number(item.durationSec) * 1000)
        : Math.max(1800, Math.round((tokenCount / 2.4) * 1000));
    const itemHl =
      typeof item === "object" && Array.isArray(item.highlight)
        ? item.highlight.map((h) => normalizeWord(String(h)))
        : [];
    const highlightArr = [...new Set([...globalHlNorm, ...itemHl])];
    const startMs = cursorMs;
    const endMs = startMs + durationMs;
    cursorMs = endMs + 120;

    lines.push({ seg: idx, text, startMs, endMs, highlight: highlightArr });
    words.push(...splitWordsWithTiming(text, startMs, endMs, new Set(highlightArr)));
  });

  return { source: "script-estimated", lines, words };
}

const { inputPath, outputPath, opts } = parseCli(process.argv.slice(2));
if (!inputPath || !outputPath) {
  printHelp();
  process.exit(1);
}

const absIn = path.resolve(inputPath);
const absOut = path.resolve(outputPath);

if (!fs.existsSync(absIn)) {
  console.error(`Input file not found: ${absIn}`);
  process.exit(1);
}

const raw = fs.readFileSync(absIn, "utf8");
const result = absIn.toLowerCase().endsWith(".json")
  ? parseLinesJson(raw, opts.highlights)
  : parseSrt(raw, opts.maxWords, opts.highlights);

fs.mkdirSync(path.dirname(absOut), { recursive: true });
fs.writeFileSync(absOut, JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(`Wrote ${result.lines.length} caption lines (${result.words.length} words) -> ${absOut}`);
