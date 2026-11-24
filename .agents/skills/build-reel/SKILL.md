---
name: build-reel
description: >-
  Step 4 of OpenReel: auto-cut talking-head silences (auto-cut.mjs), generate word-timed captions.json
  (transcribe.mjs or srt-to-captions.mjs), author reels/NN_slug/reel.json + cover.json across 10 scene types,
  inspect --preview frames, handle instant Chat-to-Edit tweaks ("كبّر الهوك"), and export 1080x1920 MP4 + Cover PNG.
---

# build-reel: Auto-Cut, Captions, Motion, SFX & Chat-to-Edit Render

## Step 1 — Auto-Cut Raw Footage (If Mode 2 Talking-Head / Audio Exists)
When the creator drops raw talking-head video (`raw/a_roll.mp4` or `.mov`), remove pauses and normalize loudness (`-14 LUFS`) in a single synchronized pass:
```bash
node scripts/auto-cut.mjs reels/NN_slug/raw/a_roll.mp4 reels/NN_slug/media/a_roll_clean.mp4
```
- Uses Remotion's bundled FFmpeg automatically (zero manual FFmpeg install).
- Adjust `--threshold -40dB` or `--min-silence 0.30` if needed; inspect `a_roll_clean.cuts.json` to see how many seconds of dead air were removed.

## Step 2 — Generate Word-Timed `captions.json` (Zero Python)
Choose the path matching the reel's audio:
- **Path A (Auto-transcribe clean video/audio with optional exact script alignment):**
  ```bash
  node scripts/transcribe.mjs reels/NN_slug/media/a_roll_clean.mp4 reels/NN_slug/captions.json --lang ar --script reels/NN_slug/script_lines.txt
  ```
  (Uses `GROQ_API_KEY` / `OPENAI_API_KEY` if set, or automatically downloads & runs free local `@remotion/install-whisper-cpp` on CPU — passing `--script` guarantees zero Arabic spelling errors!)
- **Path B (Has `.srt` file):**
  ```bash
  node scripts/srt-to-captions.mjs reels/NN_slug/audio.srt reels/NN_slug/captions.json --max-words 5 --highlights "keyword1,keyword2"
  ```
- **Path C (Mode 1 pure-code / pre-voice typographic draft):**
  Prepare `reels/NN_slug/lines.json` (`[{ "text": "...", "durationSec": 2.4, "highlight": ["keyword"] }]`) and run:
  ```bash
  node scripts/srt-to-captions.mjs reels/NN_slug/lines.json reels/NN_slug/captions.json
  ```

## Step 3 — Author `reels/NN_slug/reel.json` & `cover.json`
Build `reel.json` using OpenReel's 10 scene types (`hook`, `talking-head`, `media`, `split`, `stat`, `steps`, `compare`, `quote`, `bar-chart`, `cta`):
- Match `themeId`, `lang`, `tag`, `handle`, and `fontPreset` from `editor/src/brand/brand.config.ts`.
- Keep Frame 0 immediately readable (`hook` or `talking-head` with `hookBanner` — never fade in from black).
- Reference local files simply relative to `reels/NN_slug/` (e.g. `"src": "media/a_roll_clean.mp4"` or `"audioSrc": "media/voice.mp3"`) — `scripts/render-reel.mjs` auto-stages them cleanly during render.
- Keep `muted: true` on AI-generated video clips (`media`) and `sfx.enabled: true` (built-in WAVs in `editor/public/sfx/` play automatically on Frame 0, transitions, stats, steps, and CTA).

## Step 4 — Typecheck & Fast Visual Preview Check (MANDATORY)
1. Run `npm run typecheck`.
2. Render key preview frames + cover in seconds:
   ```bash
   node scripts/render-reel.mjs reels/NN_slug --preview
   ```
3. **Inspect all generated PNGs (`read_file`)** (`preview_f0.png`, mid frame, end frame, `cover.png`) to verify zero clipping, crisp RTL/BiDi Arabic rendering, and safe mobile framing before exporting MP4.

## Step 5 — Instant Chat-to-Edit Loop (Save Taste If Desired)
When the creator asks for visual tweaks in plain chat, map them straight into `reel.json` `overrides` (and re-run `--preview` immediately):
- `"كبّر الهوك"` / `"make the hook bigger"` → set `overrides.hookScale: 1.28` (or `1.35`)
- `"كبّر الكابشن"` / `"bigger captions"` → set `overrides.captionScale: 1.2`
- `"غيّر شكل الكابشن"` → set `overrides.captionStyle: "karaoke" | "box" | "pill" | "minimal"`
- `"ارفع الكابشن شوية"` → set `overrides.captionBottom: 260`
- `"غيّر اللون الأساسي"` → set `overrides.accentColor: "#HEX"` or `overrides.highlightColor: "#HEX"`
- `"شيل الساوند إفيكتس"` / `"mute SFX"` → set `overrides.sfxEnabled: false`
- `"خلّي القطع سريع من غير ترانزيشن"` → set `overrides.transition: "cut"`

If the creator says `"خلّي ده دايماً"` / `"save this as my default"`, persist those `overrides` directly into `editor/src/brand/brand.config.ts` (`defaults`) and `docs/BRAND.md` so every future reel inherits their taste automatically!

## Step 6 — Final MP4 + Cover Export
```bash
node scripts/render-reel.mjs reels/NN_slug
```
Outputs:
- `reels/NN_slug/out/reel.mp4` (`1080×1920` H.264 + AAC audio with voice + SFX)
- `reels/NN_slug/out/cover.png` (`1080×1920`, Instagram 3:4 grid safe)
