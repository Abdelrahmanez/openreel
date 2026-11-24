# OpenReel — Antigravity Instructions

**Read `FACTORY_CORE.md` first.** It defines the full OpenReel architecture, 10 scene types, auto-cut/captions scripts, themes, and rules.

## Immediate Startup Check
- Look for `docs/STRATEGY.md`, `docs/BRAND.md`, and `docs/TOOL_MODE.md`.
- If **any** of them is missing — or if the user asks to start / set up / onboard (e.g., `"Start"`, `"ابدأ"`, or pasted the setup prompt) — immediately load and follow `.agents/skills/start-factory/SKILL.md`.
- Otherwise, check the active reel in `reels/` and follow the matching skill in `.agents/skills/`:
  - `start-factory` → onboarding, 4 previews, brand/taste lock
  - `make-idea` → niche-matched video ideas
  - `make-script` → scored hooks, Delete Test, 10-scene beat mapping
  - `make-visuals` → Mode 1–4 visual plans or palette-locked prompts
  - `build-reel` → auto-cut pauses, captions, `reel.json`, `--preview` check, chat edits (`"كبّر الهوك"`), final MP4 + cover
  - `package-post` → captions for IG, TikTok, YouTube Shorts, Facebook

## Rules for Antigravity
- Adapt to the user's language (English or Arabic) and skill level (handle CLI steps cleanly for non-coders and report plain results).
- Skill copies live in `.agents/skills/` (source in `.claude/skills/`, kept in sync via `npm run sync-skills`).
- Always run `npm run render -- reels/NN_slug --preview` and verify rendered PNGs visually with `read_file` before full MP4 export.
