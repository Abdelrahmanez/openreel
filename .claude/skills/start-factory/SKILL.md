---
name: start-factory
description: >-
  Step 0 onboarding for OpenReel. Auto-checks Node/Remotion, installs editor dependencies, interviews the creator
  in their language (Arabic or English), detects available tools (Mode 1-4), renders 4 custom 1080x1920 theme previews
  for visual selection, and saves STRATEGY.md, BRAND.md, TOOL_MODE.md, and brand.config.ts.
---

# start-factory: First-Time Guided Onboarding

**Goal:** Turn an empty OpenReel clone into the creator's own personalized vertical video studio — zero coding required from the user.

## Step 1 — Automatic Environment Setup
1. Run `node scripts/check-env.mjs`.
   - If Node.js is missing or `< 20`, stop and give ONE simple download instruction for `https://nodejs.org` (LTS), then resume once installed.
2. If `editor/node_modules` does not exist yet, run inside `editor/`:
   ```bash
   cd editor && npm install
   ```
   (Run this silently or explain briefly in plain words: "Installing the video engine...").

## Step 2 — Language-Matched 5-Question Interview
Greet the creator warmly in **the same language they used** (Arabic or English). Ask clearly — **either one question at a time or in a clean short list** (adapt if they seem non-technical: never say "repo", "CLI", or "TypeScript"):
1. **Niche & Audience:** What topic do you create about, who is watching, and why should someone follow you?
2. **Language & Tone:** What language/dialect do your videos use (e.g., Egyptian Arabic, MSA, Casual English), and what is your style (calm explainer, energetic, builder demo)?
3. **Handle & Camera:** What is your `@handle`? Will you appear on camera, stay faceless, or mix both?
4. **Available Visual Tools (critical — picks Mode 1–4):**
   - **A (Zero extra tools):** Just your computer (100% free Remotion motion graphics, kinetic stats, diagrams & screen captures).
   - **B (Camera + Screen):** Phone/webcam + mic + screen recordings.
   - **C (Image AI only):** You have an image generator (ChatGPT Images, Ideogram, Midjourney, etc.).
   - **D (Image + Video AI):** You also use a video generator (Google Flow, Kling, Runway, Veo, etc.).
5. **Sample Topic for Theme Previews:** Ask for 1 short headline idea from their niche (or invent a sharp 4–6 word sample title based on Question 1 if they want you to pick).

## Step 3 — Render 4 Real Custom Theme Previews (1080×1920)
Run:
```bash
node scripts/render-previews.mjs --title "<sample title>" --subtitle "<short value line>" --tag "<niche tag>" --handle "@<handle>" --lang "<ar|en>" --out "docs/previews/custom"
```
Show all 4 generated PNGs visually (or link/preview them in chat):
1. `editorial-dark`
2. `swiss-bold`
3. `studio-warm`
4. `tech-blueprint`

Ask the creator to:
- Pick `1`, `2`, `3`, or `4` (or ask to tweak the accent color hex, e.g., `#FF5722`, and re-render that preview once to confirm).

## Step 4 — Lock Configuration Files
Copy the templates from `docs/*.template.md` and populate:
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
};
```
Run `npm run typecheck` inside `editor/` to confirm `brand.config.ts` compiles cleanly.

## Step 5 — Smooth Handover
Tell the creator setup is complete and immediately ask if they want to run **`make-idea`** right now to generate their first 5 tailored reel ideas.
