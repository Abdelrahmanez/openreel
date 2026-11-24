# OpenReel Core Architecture & Rules (`FACTORY_CORE.md`)

> **Single source of truth for both Antigravity (`AGENTS.md`) and Claude Code (`CLAUDE.md`).**
> OpenReel is an **AI-driven vertical video factory** (9:16 Reels, TikTok, YouTube Shorts, Facebook Reels) powered by Node.js (>=20) and Remotion 4.

---

## 0. First-Run & Onboarding Rule (CRITICAL)
1. **Check before doing anything:** Check whether `docs/STRATEGY.md`, `docs/BRAND.md`, and `docs/TOOL_MODE.md` exist.
2. **If ANY of those 3 files is missing** (or if the user says `"Start"`, `"ابدأ"`, `"setup"`, or pasted the setup prompt):
   - **Immediately run the `start-factory` skill.**
   - Do **not** dump raw terminal commands or developer jargon on a non-coder. Run installation, SFX setup, and preview rendering automatically, explain what you are doing simply, and match the user's language (English or Arabic).
3. **Rule of language:** Match the creator's language in chat. Keep all on-screen text, hooks, captions, and cover titles in the creator's chosen content language/dialect (from `docs/BRAND.md`).

---

## 1. Repository Layout
```text
openreel/
├── FACTORY_CORE.md              <- Single source of truth for all agents
├── AGENTS.md                    <- Entry point for Antigravity
├── CLAUDE.md                    <- Entry point for Claude Code
├── package.json                 <- Root shortcuts (npm run setup/cut/transcribe/render/previews)
├── README.md                    <- Bilingual quick-start & feature overview
├── docs/
│   ├── STRATEGY.template.md     <- Template -> copied to docs/STRATEGY.md on setup
│   ├── BRAND.template.md        <- Template -> copied to docs/BRAND.md on setup
│   ├── TOOL_MODE.template.md    <- Template -> copied to docs/TOOL_MODE.md on setup
│   ├── WORKFLOW.md              <- 6-step pipeline reference
│   └── previews/                <- Rendered 1080x1920 theme previews (git-tracked)
├── editor/                      <- Remotion 4 video + cover engine
│   ├── public/sfx/              <- 6 built-in royalty-free WAVs (whoosh, pop, ding, impact, click, riser)
│   └── src/
│       ├── brand/brand.config.ts <- Generated during onboarding + saves taste defaults
│       ├── themes/              <- 4 distinct themes + ThemeColorOverrides
│       ├── kit/                 <- 12 RTL/LTR Remotion components (media, talking-head, charts, karaoke captions)
│       └── compositions/        <- ThemePreview, ReelTemplate, CoverComposition
├── reels/
│   ├── 00_demo_reel/            <- Working English demo reel & cover spec
│   ├── 01_arabic_demo/          <- Working Arabic (RTL) demo reel & cover spec
│   └── NN_slug/                 <- Creator reels (script.md, visual_plan.md, captions.json, reel.json, cover.json, out/)
├── scripts/                     <- Pure Node.js (.mjs) helpers — NO Python required
│   ├── lib/ffmpeg.mjs           <- Auto-discovers Remotion's bundled FFmpeg/ffprobe (fallback: system PATH)
│   ├── check-env.mjs            <- Checks Node, npm, FFmpeg, SFX kit & onboarding state
│   ├── generate-sfx.mjs         <- Pure Node DSP generator for editor/public/sfx/*.wav
│   ├── auto-cut.mjs             <- Single-pass synchronized silence removal + -14 LUFS loudnorm
│   ├── transcribe.mjs           <- Local CPU Whisper (@remotion/install-whisper-cpp) or Groq/OpenAI + script alignment
│   ├── srt-to-captions.mjs      <- Converts .srt or lines.json -> word-timed captions.json
│   ├── render-previews.mjs      <- Renders 1 or 4 custom 1080x1920 theme previews
│   ├── render-reel.mjs          <- Stages local media, renders --preview stills or full MP4 + cover
│   └── sync-skills.mjs          <- Mirrors .claude/skills/ -> .agents/skills/
├── .claude/skills/              <- Primary skill files (source)
└── .agents/skills/              <- Synced skill copies for Antigravity
```

---

## 2. Adaptive Visual Modes (`docs/TOOL_MODE.md`)
| Mode | Tools Available | How Visuals Work |
|---|---|---|
| **Mode 1: Zero Paid Tools** | Laptop + Node/Remotion only | Pure Remotion motion graphics (`hook`, `stat`, `steps`, `compare`, `quote`, `bar-chart`, `cta`) + built-in SFX. 100% free. |
| **Mode 2: Camera + Screen** | Phone/webcam + mic (+ screen recordings) | `auto-cut.mjs` removes pauses cleanly -> `talking-head`, `split`, and `media` scenes + kinetic overlays, karaoke captions & SFX. |
| **Mode 3: Image AI Only** | Any image generator | Palette-locked `9:16` image prompts + `media` Ken Burns pan/zoom, overlays, captions & SFX. |
| **Mode 4: Image + Video AI** | Image AI + video AI (Flow, Kling, Runway, Veo) | Start-Frame + static-camera motion prompts + `media` video scenes (muted AI audio), overlays, captions & SFX. |

---

## 3. Built-In Visual Themes & Persistent Overrides
1. `editorial-dark` — Deep obsidian slate, electric cyan, amber marker, karaoke captions default.
2. `swiss-bold` — Gallery off-white, heavy black ink framing, vermilion + yellow highlight, crisp box captions.
3. `studio-warm` — Warm dotted stationery paper, espresso ink, amber + mustard gold accents, Alexandria Arabic typography.
4. `tech-blueprint` — Midnight schematic grid, cyan corner brackets, emerald proof badges, floating pill captions.

**Chat-to-Edit & Persistent Taste (`ReelOverrides`):**
Every reel (`reel.json` `overrides`) and the global brand (`editor/src/brand/brand.config.ts` `defaults`) support instant overrides:
`hookScale`, `captionScale`, `captionBottom`, `captionStyle` (`box` | `karaoke` | `pill` | `minimal`), `accentColor`, `highlightColor`, `bgColor`, `showProgressBar`, `showTagBadge`, `sfxEnabled`, `sfxVolume`, `transition` (`cut` | `fade` | `slide` | `wipe`), `transitionFrames`.

---

## 4. Zero-Python Media, Auto-Cut & Captions Pipeline
- **FFmpeg Built-In:** `scripts/lib/ffmpeg.mjs` automatically uses the `ffmpeg`/`ffprobe` binaries inside `editor/node_modules/@remotion/compositor-*`, so creators do **not** have to install FFmpeg separately.
- **Auto-Cut (`scripts/auto-cut.mjs`):** Detects pauses via `silencedetect`, expands breath padding, and performs a single-pass synchronized `trim`/`atrim` + `concat` + `-14 LUFS` `loudnorm` with zero lip-sync drift.
- **Captions (`scripts/transcribe.mjs` & `scripts/srt-to-captions.mjs`):** Produces both `lines[]` and word-level `words[]` timestamps for live karaoke highlighting. Supports `--script` alignment to guarantee zero Arabic spelling errors.
- **One-Command Render (`scripts/render-reel.mjs`):** Automatically copies local reel media (`a_roll.mp4`, `media/*.png`) into `editor/public/reel_media/<slug>/` during render, runs `--preview` for fast still checks, or outputs `out/reel.mp4` + `out/cover.png`.

---

## 5. The 6-Step Pipeline (Skills)
| Step | Skill | Purpose |
|---|---|---|
| 0 | `start-factory` | Setup, 5-question interview, 4 custom previews + color tweak, saves strategy/brand/mode/config |
| 1 | `make-idea` | Generate 5 high-retention ideas tailored to niche & tool mode |
| 2 | `make-script` | Write script with 3–5 scored hooks, Delete Test, and beat mapping across 10 scene types |
| 3 | `make-visuals` | Produce pure Remotion visual plan, camera/screen shot list, or palette-locked AI prompts |
| 4 | `build-reel` | Auto-cut raw footage, build word-timed `captions.json`, author `reel.json`, inspect `--preview`, apply chat edits, export MP4 + cover |
| 5 | `package-post` | Write IG, TikTok, YouTube Shorts, and Facebook captions + pinned comment |

> **Skill sync rule:** Edit skills ONLY in `.claude/skills/`, then run `npm run sync-skills` (`node scripts/sync-skills.mjs`) so `.agents/skills/` stays identical.
