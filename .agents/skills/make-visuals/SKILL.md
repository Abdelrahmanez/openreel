---
name: make-visuals
description: >-
  Step 3 of OpenReel: adapt the locked script's beats to docs/TOOL_MODE.md across OpenReel's 10 scene types
  (Mode 1 pure Remotion motion, Mode 2 talking-head + screen recording, Mode 3 Image AI prompts, or Mode 4 Image+Video AI prompts).
---

# make-visuals: Adaptive Visual Planning

## Read First
1. `docs/TOOL_MODE.md`
2. `docs/BRAND.md` (theme colors, caption style, handle)
3. `reels/NN_slug/script.md`

## Branch Automatically by Active Mode

### Mode 1 — Zero Paid Tools (Pure Remotion Motion)
- Map every 2–4 second beat to OpenReel's pure-code components (`hook`, `stat`, `steps`, `compare`, `quote`, `bar-chart`, `cta`).
- Plan transition variety (`fade`, `slide`, `wipe`, `cut`) and intentional SFX cues (`impact` on Frame 0, `ding` on numbers, `click` on steps, `pop` on comparisons/quotes).

### Mode 2 — Camera + Screen / B-Roll
- Output a clear shot plan separating:
  - **A-Roll (Face):** lines to record on camera + framing tips (keep chest around `y=800` clear for `hookBanner`, lower band clear for captions). Remind the creator to record in a quiet spot — `auto-cut.mjs` removes all pauses automatically.
  - **Screen Recordings:** exact UI clicks/demos to capture (`media` with `framed-card` or `phone-mockup`, or `split` screen above talking-head).
  - **Motion Card Beats:** which beats cut away from camera to `stat`, `compare`, `bar-chart`, or `steps` cards to reset attention every 2–4 seconds.

### Mode 3 — Image AI Only (ChatGPT / Ideogram / Midjourney / Nano Banana)
- Write complete, ready-to-paste `9:16` prompts locked to `docs/BRAND.md`'s background and accent colors (generous negative space, zero garbled embedded text).
- Specify `media` scene framing (`full` vs `framed-card`) and Remotion motion (`ken-burns-in`, `ken-burns-out`, `pan-left`, `pan-right`) for every image.

### Mode 4 — Image + Video AI (Google Flow / Kling / Runway / Veo)
- Write Start-Frame image prompts first, plus **1–3 sentence static-camera motion prompts** (never repeat static color words inside video prompts, avoid quotation marks, keep characters steady, always keep `muted: true` on AI clips in `reel.json` so AI-generated music never leaks in).

Save the full plan to `reels/NN_slug/visual_plan.md`.
