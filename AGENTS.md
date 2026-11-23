# OpenReel — Antigravity Instructions

**Read `FACTORY_CORE.md` first.** It defines the full OpenReel architecture, visual modes, themes, and rules.

## Immediate Startup Check
- Look for `docs/STRATEGY.md`, `docs/BRAND.md`, and `docs/TOOL_MODE.md`.
- If **any** of them is missing — or if the user asks to start / set up / onboard (e.g., `"Start"`, `"ابدأ"`, or pasted the quick-start prompt) — immediately load and follow `.agents/skills/start-factory/SKILL.md`.
- Otherwise, check which reel the user is working on in `reels/` and follow the matching skill in `.agents/skills/`:
  - `start-factory` → onboarding & theme selection
  - `make-idea` → niche-matched video ideas
  - `make-script` → hooks, Delete Test, beat-by-beat script
  - `make-visuals` → Mode 1–4 visual prompts or pure Remotion shot plans
  - `build-reel` → captions, Remotion preview stills, final `1080×1920` `.mp4` + cover
  - `package-post` → captions for IG, TikTok, YouTube Shorts, Facebook

## Rules for Antigravity
- Adapt to the user's language (English or Arabic) and skill level (handle CLI steps cleanly for non-coders and report plain results).
- Skill copies live in `.agents/skills/` (source in `.claude/skills/`, kept in sync via `node scripts/sync-skills.mjs`).
- Always render a preview still before a full video render and verify visual quality with `read_file`.
