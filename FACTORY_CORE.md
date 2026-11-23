# OpenReel Core Architecture & Rules (`FACTORY_CORE.md`)

> **Single source of truth for both Antigravity (`AGENTS.md`) and Claude Code (`CLAUDE.md`).**
> OpenReel is an **AI-driven vertical video factory** (9:16 Reels, TikTok, YouTube Shorts, Facebook Reels) powered by Remotion 4.

---

## 0. First-Run & Onboarding Rule (CRITICAL)
1. **Check before doing anything:** Check whether `docs/STRATEGY.md`, `docs/BRAND.md`, and `docs/TOOL_MODE.md` exist.
2. **If ANY of those 3 files is missing** (or if the user says `"Start"`, `"ابدأ"`, `"setup"`, or pasted the quick-start prompt):
   - **Immediately run the `start-factory` skill.**
   - Do **not** dump raw terminal commands or developer jargon on a non-coder. Run installation and preview rendering automatically when allowed, explain what you're doing simply, and adapt to the user's language (English or Arabic) and technical comfort level (coder or non-coder).
3. **Rule of language:** Match the user's language in chat. Keep all on-screen text, hooks, captions, and cover titles in the creator's chosen content language/dialect (from `docs/BRAND.md`).

---

## 1. Repository Layout
```text
openreel/
├── FACTORY_CORE.md              <- You are here (shared rules for all agents)
├── AGENTS.md                    <- Entry point for Antigravity
├── CLAUDE.md                    <- Entry point for Claude Code
├── README.md                    <- Bilingual quick-start & theme gallery
├── docs/
│   ├── STRATEGY.template.md     <- Template -> copied to docs/STRATEGY.md on setup
│   ├── BRAND.template.md        <- Template -> copied to docs/BRAND.md on setup
│   ├── TOOL_MODE.template.md    <- Template -> copied to docs/TOOL_MODE.md on setup
│   ├── WORKFLOW.md              <- 6-step pipeline reference
│   └── previews/                <- Rendered 1080x1920 theme previews (git-tracked)
├── editor/                      <- Remotion 4 video + cover engine
│   └── src/
│       ├── brand/brand.config.ts <- Generated during start-factory onboarding
│       ├── themes/              <- 4 built-in themes (zero hardcoded identity)
│       ├── kit/                 <- Reusable RTL/LTR Remotion components
│       └── compositions/        <- ThemePreview, ReelTemplate, CoverComposition
├── reels/
│   ├── 00_demo_reel/            <- Working demo reel & cover spec
│   └── NN_slug/                 <- Each new reel (script, visuals, captions.json, out)
├── scripts/                     <- Pure Node.js (.mjs) helpers — NO Python required
│   ├── check-env.mjs
│   ├── render-previews.mjs
│   ├── srt-to-captions.mjs
│   └── sync-skills.mjs
├── .claude/skills/              <- Primary skill files (source)
└── .agents/skills/              <- Synced skill copies for Antigravity
```

---

## 2. Adaptive Visual Modes (`docs/TOOL_MODE.md`)
OpenReel **never assumes the creator owns paid AI subscriptions**. During onboarding, the AI detects what tools the user has and configures one of 4 modes:

| Mode | Tools Available | How Visuals Work |
|---|---|---|
| **Mode 1: Zero Paid Tools** | Laptop + Node/Remotion only (no paid AI media subscriptions) | Pure Remotion motion graphics: kinetic hook typography, animated stat counters, step cards, before/after comparisons, SVG diagrams, and screen captures. 100% free. |
| **Mode 2: Camera + Screen** | Phone/webcam + mic (and optional screen recording) | Talking-head video clips + screen recordings + Remotion motion overlays, hook cards, and captions. |
| **Mode 3: Image AI Only** | Any image generator (ChatGPT Images, Ideogram, Midjourney, Nano Banana, etc.) | Scene-by-scene image prompts aligned to `docs/BRAND.md` color/mood + smooth Remotion Ken Burns pan/zoom + data overlays. |
| **Mode 4: Image + Video AI** | Image AI + video AI (Google Flow, Runway, Kling, Veo, etc.) | Full image + short motion-clip prompts (with static-camera anti-hallucination guidelines) + Remotion overlays, audio, and captions. |

---

## 3. Built-In Visual Themes (`editor/src/themes/`)
During `start-factory`, the AI renders **4 real 1080×1920 previews** tailored to the creator's topic using `node scripts/render-previews.mjs` so they choose visually (and optionally customize the accent hex):
1. `editorial-dark` — Deep obsidian slate, electric cyan accent, amber highlight, architectural grid.
2. `swiss-bold` — Stark gallery off-white, pure black ink borders, vermilion red + yellow highlight, bold Swiss poster typography.
3. `studio-warm` — Warm linen/sand canvas, soft elevated studio cards, espresso text, terracotta amber + sage highlights.
4. `tech-blueprint` — Blueprint midnight grid, crisp white & cyan lines, emerald + gold badges, monospace technical metadata.

Every theme supports both **Arabic (`rtl`)** and **English (`ltr`)**, keeps captions in the safe lower zone (`bottom: 220px`) above social UI overlays, and centers covers inside the central `1080×1350` Instagram 3:4 grid safe box.

---

## 4. Zero-Python Audio & Captions Architecture
OpenReel runs on **Node.js (>=20) + Remotion 4** with zero Python dependency:
- **Path A (`.srt` file):** Drop any `.srt` exported from CapCut, Premiere, or Voice Memos → run `node scripts/srt-to-captions.mjs <file.srt> <captions.json>`.
- **Path B (Script-estimated timing):** Before recording or for fast typographic drafts, pass a script lines JSON to `node scripts/srt-to-captions.mjs <script.json> <captions.json>`.
- **Path C (On-demand local CPU transcription):** If the user drops raw voice/video and wants automatic word-level timing, install and run `@remotion/install-whisper-cpp` via Node on demand (`build-reel` skill).

---

## 5. The 6-Step Pipeline (Skills)
| Step | Skill | Purpose |
|---|---|---|
| 0 | `start-factory` | First-time onboarding: env check, `npm install`, 5-question interview, render 4 custom previews, save brand & mode config |
| 1 | `make-idea` | Generate 5 high-retention ideas filtered for the creator's niche & "Why follow?" value |
| 2 | `make-script` | Write script with 3–5 scored hooks, early payoff, Delete Test, and beat-by-beat visual plan |
| 3 | `make-visuals` | Produce the visual assets/prompts/motion plan matching `docs/TOOL_MODE.md` |
| 4 | `build-reel` | Generate `captions.json`, build `reel.json` (or custom TSX), inspect preview stills, render `1080×1920` `.mp4` + cover PNG |
| 5 | `package-post` | Write platform-native captions (Instagram, TikTok, YouTube Shorts, Facebook) + pinned comment + optional comment-keyword CTA |

> **Skill sync rule:** Edit skills ONLY in `.claude/skills/`, then run `node scripts/sync-skills.mjs` so `.agents/skills/` stays identical.
