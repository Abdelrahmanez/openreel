---
name: build-reel
description: >-
  Step 4 of OpenReel: generate captions.json (from .srt, script timing, or optional local whisper.cpp via Node),
  author reels/NN_slug/reel.json, inspect still frames before full render, and export 1080x1920 MP4 + Cover PNG.
---

# build-reel: Captions, Composition & 1080×1920 Render

## Step 1 — Prepare `captions.json` (Zero Python)
Choose the path matching what the creator provided:
- **Path A (Has `.srt` file):**
  ```bash
  node scripts/srt-to-captions.mjs reels/NN_slug/audio.srt reels/NN_slug/captions.json
  ```
- **Path B (Script-estimated timing for typographic/draft build):**
  Prepare `reels/NN_slug/lines.json` (`[{ "text": "...", "highlight": ["keyword"] }]`) and run:
  ```bash
  node scripts/srt-to-captions.mjs reels/NN_slug/lines.json reels/NN_slug/captions.json
  ```
- **Path C (Raw audio/video without `.srt`):**
  Ask if they want automatic local transcription on CPU via Node (`@remotion/install-whisper-cpp`), or if they prefer dropping an `.srt` exported from CapCut/phone.

## Step 2 — Author `reels/NN_slug/reel.json` & Cover Spec
Build a structured JSON matching `ReelProps` (or create a custom TSX composition in `editor/src/compositions/` if the reel needs custom SVG diagrams or Mode 2 video clips):
- Ensure `themeId`, `lang`, and `handle` match `editor/src/brand/brand.config.ts`.
- Frame 0 must display the `hook` scene immediately (never start on a blank frame).
- Keep captions inside the safe lower band and cover hero content inside the central `1080×1350` safe box.

## Step 3 — Typecheck & Visual Pre-Render Check (MANDATORY)
1. Run `npm run typecheck` inside `editor/`.
2. Render 2–3 key still frames (e.g., frame `0`, mid-reel frame, and cover) using `--props=../reels/NN_slug/reel.json`:
   ```bash
   cd editor && npx remotion still src/index.ts ReelTemplate ../reels/NN_slug/out/check_f0.png --frame=0 --props=../reels/NN_slug/reel.json
   ```
3. **Inspect the PNGs visually** (`read_file`) to confirm zero text clipping, crisp RTL/LTR rendering, and readable captions before running the full MP4 export.

## Step 4 — Final Export
Render full `1080×1920` H.264 MP4 + `1080×1920` Cover PNG into `reels/NN_slug/out/`:
- `reels/NN_slug/out/reel.mp4`
- `reels/NN_slug/out/cover.png`
