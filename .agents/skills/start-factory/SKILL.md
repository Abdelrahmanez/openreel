---
name: start-factory
description: >-
  Step 0 onboarding for OpenReel. Auto-checks Node/FFmpeg, installs editor dependencies and SFX kit, interviews
  the creator in their language (Arabic or English), detects available tools (Mode 1-4), renders 4 custom 1080x1920
  theme previews for visual selection, supports instant color tweaks, and saves STRATEGY.md, BRAND.md, TOOL_MODE.md,
  and brand.config.ts.
---

# start-factory: First-Time Guided Onboarding

**Goal:** Turn an empty OpenReel folder into the creator's own personalized vertical video studio — zero coding required from the user.

## Step 1 — Automatic Environment Setup
1. Run `node scripts/check-env.mjs`.
   - If Node.js is missing or `< 20`, stop and give ONE simple download instruction for `https://nodejs.org` (LTS), then resume once installed.
2. If `editor/node_modules` or `editor/public/sfx/` is missing, run:
   ```bash
   npm run setup
   ```
   (Explain briefly in plain words: "Installing the video engine and built-in sound effects...")
   Note: `npm run setup` also verifies Remotion's bundled FFmpeg automatically so the creator never has to install FFmpeg manually.

## Step 2 — Language-Matched 5-Question Interview
Greet the creator warmly in **the same language they used** (Arabic or English). Ask clearly — **either one question at a time or a clean numbered list** (never use developer jargon like "repo", "CLI", or "TypeScript" for non-coders):
1. **Niche & Audience:** What topic do you create about, who is watching, and why should someone follow you?
2. **Language & Tone:** What language/dialect do your videos use (e.g., Egyptian Arabic, MSA, Casual English), and what is your delivery style (calm explainer, energetic, builder demo)?
3. **Handle & Camera:** What is your `@handle`? Will you appear on camera, stay faceless, or mix both?
4. **Available Visual Tools (picks Mode 1–4):**
   - **A (Zero extra tools):** Just your computer (100% free Remotion motion graphics, kinetic stats, charts, quotes & screen captures).
   - **B (Camera + Screen):** Phone/webcam + mic + screen recordings (with automatic silence cutting & captions).
   - **C (Image AI only):** You use an image generator (ChatGPT Images, Ideogram, Midjourney, Nano Banana, etc.).
   - **D (Image + Video AI):** You also use a video generator (Google Flow, Kling, Runway, Veo, etc.).
5. **Sample Topic for Theme Previews:** Ask for 1 short headline idea from their niche (or craft a sharp 4–6 word sample title based on Question 1 if they want you to pick).

## Step 3 — Render 4 Custom Niche Theme Previews (1080×1920)
Run:
```bash
node scripts/render-previews.mjs --title "<sample title>" --subtitle "<short value line>" --tag "<niche tag>" --handle "@<handle>" --lang "<ar|en>" --out "docs/previews/custom"
```
Show all 4 generated PNGs visually in chat (`read_file` / preview paths):
1. `editorial-dark`
2. `swiss-bold`
3. `studio-warm`
4. `tech-blueprint`

Ask the creator to:
- Pick `1`, `2`, `3`, or `4`.
- Optionally tweak any accent or highlight color or caption style right now — re-render only their chosen theme quickly with:
  ```bash
  node scripts/render-previews.mjs --theme "<chosen-id>" --accent "#HEX" --highlight "#HEX" --title "<sample title>" --subtitle "<short value line>" --tag "<niche tag>" --handle "@<handle>" --lang "<ar|en>" --out "docs/previews/custom"
  ```

## Step 4 — Lock Persistent Identity & Taste Files
Copy templates from `docs/*.template.md` and populate:
1. `docs/STRATEGY.md`
2. `docs/BRAND.md`
3. `docs/TOOL_MODE.md`
4. `editor/src/brand/brand.config.ts`:
```ts
import type { BrandConfig } from "../themes/types";

export const BRAND_CONFIG: BrandConfig = {
  themeId: "<chosen theme>",
  lang: "<ar|en>",
  handle: "@<handle>",
  nicheTag: "<tag>",
  accentOverride: undefined, // or "#HEX"
  highlightOverride: undefined, // or "#HEX"
  fontPreset: "default", // "default" (Alexandria / Space Grotesk) or "cairo"
  defaults: {
    hookScale: 1,
    captionScale: 1,
    captionBottom: 220,
    showProgressBar: true,
    showTagBadge: true,
    sfxEnabled: true,
    sfxVolume: 1,
    transition: "fade",
    transitionFrames: 8,
  },
};
```
Run `npm run typecheck` to confirm `brand.config.ts` compiles cleanly.

## Step 5 — Smooth Handover
Confirm that their identity, voice, and taste are now saved in project files (so they never repeat themselves), and ask if they want to run **`make-idea`** now to brainstorm their first 5 tailored reel ideas.
