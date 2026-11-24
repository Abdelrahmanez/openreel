#!/usr/bin/env node
/**
 * Generate OpenReel's built-in royalty-free SFX kit (48 kHz, 16-bit mono PCM WAV).
 * Pure Node.js DSP — zero external dependencies, deterministic seeded PRNG.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "editor", "public", "sfx");
const SR = 48000;

function createRng(seed = 1337) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function gaussianNoise(rng, length) {
  const out = new Float64Array(length);
  for (let i = 0; i < length; i++) {
    const u1 = Math.max(1e-7, rng());
    const u2 = rng();
    out[i] = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
  return out;
}

function onePoleLowpass(samples, cutoffHz) {
  const out = new Float64Array(samples.length);
  let prev = 0;
  for (let i = 0; i < samples.length; i++) {
    const fc = typeof cutoffHz === "number" ? cutoffHz : cutoffHz[i];
    const alpha = 1 - Math.exp((-2 * Math.PI * Math.max(20, fc)) / SR);
    prev = prev + alpha * (samples[i] - prev);
    out[i] = prev;
  }
  return out;
}

function normalize(samples, peakDb = -3.0) {
  let mean = 0;
  for (let i = 0; i < samples.length; i++) mean += samples[i];
  mean /= Math.max(1, samples.length);

  let maxAbs = 1e-9;
  const centered = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i] - mean;
    centered[i] = v;
    const a = Math.abs(v);
    if (a > maxAbs) maxAbs = a;
  }

  const target = Math.pow(10, peakDb / 20);
  const scale = target / maxAbs;
  for (let i = 0; i < centered.length; i++) {
    centered[i] *= scale;
  }
  return centered;
}

function applyFade(samples, fadeInSec = 0.003, fadeOutSec = 0.02) {
  const nIn = Math.min(samples.length, Math.floor(SR * fadeInSec));
  const nOut = Math.min(samples.length, Math.floor(SR * fadeOutSec));
  for (let i = 0; i < nIn; i++) {
    samples[i] *= nIn > 1 ? i / (nIn - 1) : 1;
  }
  for (let i = 0; i < nOut; i++) {
    const idx = samples.length - nOut + i;
    samples[idx] *= nOut > 1 ? 1 - i / (nOut - 1) : 0;
  }
  return samples;
}

function writeWavMono16(filePath, samples) {
  const numSamples = samples.length;
  const dataBytes = numSamples * 2;
  const buf = Buffer.alloc(44 + dataBytes);

  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); // PCM fmt chunk size
  buf.writeUInt16LE(1, 20); // PCM format
  buf.writeUInt16LE(1, 22); // Mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28); // ByteRate
  buf.writeUInt16LE(2, 32); // BlockAlign
  buf.writeUInt16LE(16, 34); // BitsPerSample
  buf.write("data", 36);
  buf.writeUInt32LE(dataBytes, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buf);
}

function makeWhoosh(rng) {
  const dur = 0.36;
  const n = Math.floor(SR * dur);
  const noise = gaussianNoise(rng, n);
  const hp = onePoleLowpass(noise, 190);
  const highPassed = new Float64Array(n);
  const cutoffs = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    highPassed[i] = noise[i] - hp[i];
    const progress = i / (n - 1);
    const bell = Math.pow(Math.sin(Math.PI * progress), 1.8);
    cutoffs[i] = 280 + 4800 * bell;
  }
  const swept = onePoleLowpass(highPassed, cutoffs);
  for (let i = 0; i < n; i++) {
    const progress = i / (n - 1);
    swept[i] *= Math.pow(Math.sin(Math.PI * progress), 1.45);
  }
  return applyFade(normalize(swept, -7.5), 0.01, 0.045);
}

function makePop() {
  const dur = 0.11;
  const n = Math.floor(SR * dur);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const freq = 1080 * Math.exp(-t * 28) + 270;
    phase += (2 * Math.PI * freq) / SR;
    out[i] = Math.sin(phase) * Math.exp(-t * 36);
  }
  return applyFade(normalize(out, -5.5), 0.002, 0.02);
}

function makeDing() {
  const dur = 0.75;
  const n = Math.floor(SR * dur);
  const out = new Float64Array(n);
  const partials = [
    [1318.5, 1.0, 5.4],
    [2637.0, 0.32, 8.5],
    [3955.5, 0.11, 13.0],
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    for (const [freq, amp, decay] of partials) {
      s += amp * Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * decay);
    }
    out[i] = s;
  }
  return applyFade(normalize(out, -8.0), 0.002, 0.12);
}

function makeImpact(rng) {
  const dur = 0.26;
  const n = Math.floor(SR * dur);
  const noise = onePoleLowpass(gaussianNoise(rng, n), 3200);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const freq = 140 * Math.exp(-t * 22) + 52;
    phase += (2 * Math.PI * freq) / SR;
    const sub = Math.sin(phase) * Math.exp(-t * 14);
    const snap = noise[i] * Math.exp(-t * 110) * 0.55;
    out[i] = sub + snap;
  }
  return applyFade(normalize(out, -3.5), 0.001, 0.04);
}

function makeClick(rng) {
  const dur = 0.06;
  const n = Math.floor(SR * dur);
  const noise = onePoleLowpass(gaussianNoise(rng, n), 4600);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ping = Math.sin(2 * Math.PI * 1950 * t) * Math.exp(-t * 95);
    const tick = noise[i] * Math.exp(-t * 140) * 0.65;
    out[i] = ping + tick;
  }
  return applyFade(normalize(out, -6.5), 0.001, 0.015);
}

function makeRiser(rng) {
  const dur = 0.55;
  const n = Math.floor(SR * dur);
  const noise = gaussianNoise(rng, n);
  const hp = onePoleLowpass(noise, 320);
  const highPassed = new Float64Array(n);
  const cutoffs = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    highPassed[i] = noise[i] - hp[i];
    cutoffs[i] = 350 + 5200 * p * p;
  }
  const filtered = onePoleLowpass(highPassed, cutoffs);
  const out = new Float64Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    const freq = 220 + 440 * Math.pow(p, 1.6);
    phase += (2 * Math.PI * freq) / SR;
    const env = Math.pow(p, 2.2);
    out[i] = (filtered[i] * 0.75 + Math.sin(phase) * 0.25) * env;
  }
  return applyFade(normalize(out, -7.5), 0.015, 0.025);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const rng = createRng(20261124);

const kit = {
  whoosh: makeWhoosh(rng),
  pop: makePop(),
  ding: makeDing(),
  impact: makeImpact(rng),
  click: makeClick(rng),
  riser: makeRiser(rng),
};

for (const [name, samples] of Object.entries(kit)) {
  const target = path.join(OUT_DIR, `${name}.wav`);
  writeWavMono16(target, samples);
  console.log(`Generated SFX: ${path.relative(ROOT, target)} (${(samples.length / SR).toFixed(2)}s)`);
}
