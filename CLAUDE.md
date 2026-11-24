# OpenReel — Claude Code Instructions

**Read `FACTORY_CORE.md` first.** It defines the full OpenReel architecture, 10 scene types, auto-cut/captions scripts, themes, and rules.

## Immediate Startup Check
- Look for `docs/STRATEGY.md`, `docs/BRAND.md`, and `docs/TOOL_MODE.md`.
- If **any** of them is missing — or if the user asks to start / set up / onboard (e.g., `"Start"`, `"ابدأ"`, or pasted the setup prompt) — immediately load and follow `.claude/skills/start-factory/SKILL.md`.
- Otherwise, check the active reel in `reels/` and follow the matching skill in `.claude/skills/`:
  - `start-factory` → onboarding, 4 previews, brand/taste lock
  - `make-idea` → niche-matched video ideas
  - `make-script` → scored hooks, Delete Test, 10-scene beat mapping
  - `make-visuals` → Mode 1–4 visual plans or palette-locked prompts
  - `build-reel` → auto-cut pauses, captions, `reel.json`, `--preview` check, chat edits (`"كبّر الهوك"`), final MP4 + cover
  - `package-post` → captions for IG, TikTok, YouTube Shorts, Facebook

## Rules for Claude Code
- Adapt to the user's language (English or Arabic) and skill level (run `npm run setup`, `cut`, `transcribe`, and `render` yourself instead of asking non-coders to debug terminals).
- Edit skills only in `.claude/skills/` and keep Antigravity synced via `npm run sync-skills`.
- Always run `npm run render -- reels/NN_slug --preview` and visually inspect the rendered PNGs before a full MP4 export.
