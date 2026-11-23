#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/srt-to-captions.mjs <input.srt|lines.json> <captions.json>");
  process.exit(1);
}

const absIn = path.resolve(inputPath);
const absOut = path.resolve(outputPath);

if (!fs.existsSync(absIn)) {
  console.error(`Input file not found: ${absIn}`);
  process.exit(1);
}

function parseSrtTime(stamp) {
  const m = stamp.trim().match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);
  if (!m) throw new Error(`Invalid SRT timestamp: ${stamp}`);
  const [, hh, mm, ss, ms] = m;
  return (Number(hh) * 3600 + Number(mm) * 60 + Number(ss)) * 1000 + Number(ms);
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
    const normalized = word.replace(/[.,!?؟،:"'«»()]/g, "").toLowerCase();
    return {
      text: word,
      startMs: wStart,
      endMs: Math.max(wStart + 80, wEnd),
      highlight: highlightSet.has(normalized),
    };
  });
}

function parseSrt(raw) {
  const cleaned = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  const blocks = cleaned.split(/\n{2,}/);
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
    lines.push({ seg: lines.length, text, startMs, endMs, highlight: [] });
    words.push(...splitWordsWithTiming(text, startMs, endMs, new Set()));
  }
  return { source: "srt", lines, words };
}

function parseLinesJson(raw) {
  const cleaned = raw.replace(/^\uFEFF/, "");
  const items = JSON.parse(cleaned);
  if (!Array.isArray(items)) {
    throw new Error("Script JSON must be an array of strings or { text, durationSec?, highlight? } objects.");
  }

  let cursorMs = 0;
  const lines = [];
  const words = [];

  items.forEach((item, idx) => {
    const text = typeof item === "string" ? item.trim() : String(item.text || "").trim();
    if (!text) return;
    const tokenCount = text.split(/\s+/).filter(Boolean).length;
    const durationMs =
      typeof item === "object" && item.durationSec
        ? Math.round(Number(item.durationSec) * 1000)
        : Math.max(1800, Math.round((tokenCount / 2.4) * 1000));
    const highlightArr =
      typeof item === "object" && Array.isArray(item.highlight)
        ? item.highlight.map((h) => String(h).trim().toLowerCase())
        : [];
    const startMs = cursorMs;
    const endMs = startMs + durationMs;
    cursorMs = endMs + 120;

    lines.push({ seg: idx, text, startMs, endMs, highlight: highlightArr });
    words.push(...splitWordsWithTiming(text, startMs, endMs, new Set(highlightArr)));
  });

  return { source: "script-estimated", lines, words };
}

const raw = fs.readFileSync(absIn, "utf8");
const result = absIn.toLowerCase().endsWith(".json") ? parseLinesJson(raw) : parseSrt(raw);

fs.mkdirSync(path.dirname(absOut), { recursive: true });
fs.writeFileSync(absOut, JSON.stringify(result, null, 2) + "\n", "utf8");
console.log(`Wrote ${result.lines.length} caption lines (${result.words.length} words) -> ${absOut}`);
