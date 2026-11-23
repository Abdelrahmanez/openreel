---
name: make-visuals
description: >-
  Step 3 of OpenReel: adapt the locked script's beats to the creator's docs/TOOL_MODE.md
  (Mode 1 pure Remotion motion, Mode 2 camera+screen, Mode 3 Image AI prompts, or Mode 4 Image+Video AI prompts).
---

# make-visuals: Adaptive Visual Planning

## Read First
1. `docs/TOOL_MODE.md`
2. `docs/BRAND.md` (theme colors, direction, handle)
3. `reels/NN_slug/script.md`

## Branch Automatically by Active Mode

### Mode 1 — Zero Paid Tools (Pure Remotion Motion)
- Map every beat directly to OpenReel's Remotion components (`hook`, `stat`, `steps`, `compare`, `cta`) or custom SVG/data graphics in `reels/NN_slug/`.
- No external downloads or subscriptions needed. Ensure every 2–4 seconds has a visual beat change, counter animation, or step reveal.

### Mode 2 — Camera + Screen / B-Roll
- Output a clean shot list separating:
  - **A-Roll (Face):** exact lines to record on camera + framing tips (leave chest/lower space clear for captions).
  - **Screen Recordings:** exact UI clicks/demos to capture at 1080p or 9:16 crop.
  - **Overlay Graphics:** which beats get Remotion `stat`, `steps`, or `compare` cards on top.

### Mode 3 — Image AI Only (ChatGPT / Ideogram / Midjourney / Nano Banana)
- Write complete, ready-to-paste `9:16` prompts locked to the theme's background and accent colors in `docs/BRAND.md` (with generous margin and no garbled embedded text).
- Specify which Remotion motion (slow zoom, slide, overlay stat) animates each still.

### Mode 4 — Image + Video AI (Flow / Kling / Runway / Veo)
- Write Start-Frame image prompts first, plus **1–3 sentence static-camera motion prompts** (never repeat static color words inside video prompts, avoid quotation marks, keep characters locked, mute generated AI audio).

Save the full plan to `reels/NN_slug/visual_plan.md`.
