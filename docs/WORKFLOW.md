# OpenReel 6-Step Workflow

| Step | Skill | What Happens | Command / Output |
|---|---|---|---|
| **0. Setup** | `start-factory` | Checks Node/FFmpeg/SFX (`npm run setup`), runs 5-question interview, renders 4 real niche theme previews, locks `STRATEGY.md`, `BRAND.md`, `TOOL_MODE.md`, and `brand.config.ts` | Personalized studio |
| **1. Ideas** | `make-idea` | Proposes 5 ideas passing the 5-point filter ("Why follow?" + real proof + tool-mode fit) | Chosen idea + `reels/NN_slug/` |
| **2. Script** | `make-script` | Researches facts, writes 3–5 scored hooks, runs Delete Test, maps beats across OpenReel's 10 scene types | `reels/NN_slug/script.md` |
| **3. Visuals** | `make-visuals` | Adapts to Mode 1–4: pure Remotion scenes, camera/screen shot list, or palette-matched AI prompts | `reels/NN_slug/visual_plan.md` |
| **4. Build** | `build-reel` | Auto-cuts silences (`npm run cut`), builds word-timed `captions.json` (`transcribe` or `captions`), creates `reel.json`, inspects `--preview` frames, applies instant chat tweaks (`overrides`), renders `1080×1920` `.mp4` + `cover.png` | `reels/NN_slug/out/reel.mp4` + `cover.png` |
| **5. Package** | `package-post` | Writes Instagram, TikTok, YouTube Shorts, and Facebook captions + pinned comment + optional giveaway CTA | `reels/NN_slug/captions_social.md` |
