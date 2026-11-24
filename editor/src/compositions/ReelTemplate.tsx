import React from "react";
import { Audio } from "@remotion/media";
import {
  TransitionSeries,
  linearTiming,
  type TransitionPresentation,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { BRAND_CONFIG } from "../brand/brand.config";
import {
  Backdrop,
  BarChart,
  CaptionBar,
  CompareCard,
  HookCard,
  MediaScene,
  ProgressBar,
  QuoteCard,
  SplitScene,
  StatBlock,
  StepList,
  TagBadge,
  TalkingHeadScene,
  resolveMediaSrc,
  type BarChartItem,
  type CaptionLine,
  type CaptionWord,
  type MediaFrame,
  type MediaMotion,
  type SplitMediaPane,
  type StepItem,
} from "../kit";
import {
  getTheme,
  type FontPreset,
  type Lang,
  type ReelOverrides,
  type ThemeId,
  type TransitionKind,
} from "../themes";

export type SfxKind =
  | "whoosh"
  | "pop"
  | "ding"
  | "impact"
  | "click"
  | "riser";

export interface SfxEvent {
  frame: number;
  type: SfxKind;
  volume?: number;
}

export interface SfxConfig {
  enabled?: boolean;
  volume?: number;
  auto?: boolean;
  events?: SfxEvent[];
}

export type ReelScene =
  | {
      type: "hook";
      durationFrames: number;
      title: string;
      highlightWord?: string;
      subtitle?: string;
      kicker?: string;
      transition?: TransitionKind;
    }
  | {
      type: "talking-head";
      durationFrames: number;
      src: string;
      startFromSec?: number;
      zoom?: "none" | "push-in" | "punch";
      muted?: boolean;
      overlayTitle?: string;
      highlightWord?: string;
      calloutChip?: string;
      hookBanner?: {
        title: string;
        highlightWord?: string;
        subtitle?: string;
      };
      transition?: TransitionKind;
    }
  | {
      type: "media";
      durationFrames: number;
      src: string;
      mediaType?: "image" | "video";
      motion?: MediaMotion;
      frameStyle?: MediaFrame;
      headline?: string;
      highlightWord?: string;
      badge?: string;
      startFromSec?: number;
      playbackRate?: number;
      muted?: boolean;
      loop?: boolean;
      transition?: TransitionKind;
    }
  | {
      type: "split";
      durationFrames: number;
      top: SplitMediaPane;
      bottom: SplitMediaPane;
      ratio?: number;
      dividerLabel?: string;
      transition?: TransitionKind;
    }
  | {
      type: "stat";
      durationFrames: number;
      value: number;
      prefix?: string;
      suffix?: string;
      label: string;
      detail?: string;
      delta?: string;
      transition?: TransitionKind;
    }
  | {
      type: "steps";
      durationFrames: number;
      heading: string;
      steps: StepItem[];
      transition?: TransitionKind;
    }
  | {
      type: "compare";
      durationFrames: number;
      heading: string;
      leftTitle: string;
      leftBody: string;
      rightTitle: string;
      rightBody: string;
      transition?: TransitionKind;
    }
  | {
      type: "quote";
      durationFrames: number;
      quote: string;
      highlightWord?: string;
      author?: string;
      source?: string;
      transition?: TransitionKind;
    }
  | {
      type: "bar-chart";
      durationFrames: number;
      heading: string;
      bars: BarChartItem[];
      source?: string;
      transition?: TransitionKind;
    }
  | {
      type: "cta";
      durationFrames: number;
      title: string;
      highlightWord?: string;
      subtitle?: string;
      kicker?: string;
      transition?: TransitionKind;
    };

export type ReelProps = {
  themeId: ThemeId;
  lang: Lang;
  tag: string;
  handle: string;
  accentOverride?: string;
  highlightOverride?: string;
  fontPreset?: FontPreset;
  audioSrc?: string;
  aRollSrc?: string;
  overrides?: ReelOverrides;
  sfx?: SfxConfig;
  scenes: ReelScene[];
  captions: CaptionLine[];
  words?: CaptionWord[];
};

export interface SceneTiming {
  index: number;
  startFrame: number;
  durationFrames: number;
  transitionInKind: TransitionKind;
  transitionInFrames: number;
}

function mergeOverrides(props: Pick<ReelProps, "overrides" | "accentOverride" | "highlightOverride">): ReelOverrides {
  return {
    ...BRAND_CONFIG.defaults,
    ...(props.accentOverride ? { accentColor: props.accentOverride } : {}),
    ...(props.highlightOverride
      ? { highlightColor: props.highlightOverride }
      : {}),
    ...props.overrides,
  };
}

export function computeSceneTimings(props: ReelProps): {
  timings: SceneTiming[];
  totalFrames: number;
} {
  const scenes = props.scenes;
  if (!scenes || scenes.length === 0) {
    return { timings: [], totalFrames: 30 };
  }
  const overrides = mergeOverrides(props);
  const defaultTransition: TransitionKind = overrides.transition ?? "fade";
  const defaultTransFrames = Math.max(0, overrides.transitionFrames ?? 8);

  const timings: SceneTiming[] = [];
  let cursor = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const dur = Math.max(15, scene.durationFrames);
    if (i === 0) {
      timings.push({
        index: 0,
        startFrame: 0,
        durationFrames: dur,
        transitionInKind: "cut",
        transitionInFrames: 0,
      });
      cursor = dur;
      continue;
    }

    const prevScene = scenes[i - 1];
    const requestedKind: TransitionKind =
      scene.transition ??
      (prevScene.type === "talking-head" && scene.type === "talking-head"
        ? "cut"
        : defaultTransition);

    const maxSafe = Math.floor(Math.min(prevScene.durationFrames, dur) / 3);
    const tFrames =
      requestedKind === "cut" ? 0 : Math.min(defaultTransFrames, maxSafe);
    const effectiveKind: TransitionKind = tFrames >= 2 ? requestedKind : "cut";
    const effectiveFrames = effectiveKind === "cut" ? 0 : tFrames;

    const startFrame = Math.max(0, cursor - effectiveFrames);
    timings.push({
      index: i,
      startFrame,
      durationFrames: dur,
      transitionInKind: effectiveKind,
      transitionInFrames: effectiveFrames,
    });
    cursor = startFrame + dur;
  }

  return { timings, totalFrames: Math.max(30, cursor) };
}

export function computeReelTotalFrames(props: ReelProps): number {
  return computeSceneTimings(props).totalFrames;
}

function getTransitionPresentation(
  kind: TransitionKind,
  isRtl: boolean
): TransitionPresentation<Record<string, unknown>> {
  if (kind === "slide") {
    return slide({
      direction: isRtl ? "from-left" : "from-right",
    }) as unknown as TransitionPresentation<Record<string, unknown>>;
  }
  if (kind === "wipe") {
    return wipe({
      direction: isRtl ? "from-left" : "from-right",
    }) as unknown as TransitionPresentation<Record<string, unknown>>;
  }
  return fade() as unknown as TransitionPresentation<Record<string, unknown>>;
}

const SceneContainer: React.FC<{
  durationFrames: number;
  children: React.ReactNode;
}> = ({ durationFrames, children }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(
    frame,
    [0, Math.max(1, durationFrames)],
    [1.0, 1.024],
    {
      extrapolateRight: "clamp",
    }
  );
  return (
    <div
      style={{
        width: "100%",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
};

function buildSfxSchedule(
  scenes: ReelScene[],
  timings: SceneTiming[],
  sfxConfig?: SfxConfig,
  overrides?: ReelOverrides
): SfxEvent[] {
  const enabled = overrides?.sfxEnabled ?? sfxConfig?.enabled ?? true;
  if (!enabled) return [];

  const volMult = Math.max(0, Math.min(2, overrides?.sfxVolume ?? sfxConfig?.volume ?? 1));
  const list: SfxEvent[] = [];

  if (sfxConfig?.auto !== false) {
    scenes.forEach((scene, idx) => {
      const timing = timings[idx];
      if (!timing) return;
      const start = timing.startFrame;

      if (idx === 0) {
        if (scene.type === "hook" || scene.type === "talking-head") {
          list.push({ frame: 0, type: "impact", volume: 0.24 * volMult });
        }
        return;
      }

      if (timing.transitionInFrames > 0) {
        list.push({
          frame: Math.max(0, start - Math.floor(timing.transitionInFrames / 2)),
          type: "whoosh",
          volume: 0.14 * volMult,
        });
      }

      if (scene.type === "stat" || scene.type === "bar-chart") {
        list.push({ frame: start + 4, type: "ding", volume: 0.2 * volMult });
      } else if (scene.type === "steps") {
        list.push({ frame: start + 2, type: "click", volume: 0.16 * volMult });
        if (scene.steps.length > 1) {
          list.push({
            frame: start + 12,
            type: "click",
            volume: 0.14 * volMult,
          });
        }
      } else if (scene.type === "compare" || scene.type === "quote") {
        list.push({ frame: start + 5, type: "pop", volume: 0.18 * volMult });
      } else if (scene.type === "cta") {
        list.push({ frame: start + 2, type: "impact", volume: 0.22 * volMult });
      }
    });
  }

  if (Array.isArray(sfxConfig?.events)) {
    for (const ev of sfxConfig.events) {
      list.push({
        frame: Math.max(0, Math.round(ev.frame)),
        type: ev.type,
        volume: (ev.volume ?? 0.22) * volMult,
      });
    }
  }

  return list;
}

export const ReelTemplate: React.FC<ReelProps> = (props) => {
  const {
    themeId,
    lang,
    tag,
    handle,
    fontPreset,
    audioSrc,
    aRollSrc,
    sfx,
    scenes,
    captions,
    words,
  } = props;

  const overrides = mergeOverrides(props);
  const effectiveFontPreset = fontPreset ?? BRAND_CONFIG.fontPreset;
  const theme = getTheme(themeId, {
    accentColor: overrides.accentColor,
    highlightColor: overrides.highlightColor,
    bgColor: overrides.bgColor,
  });

  const isRtl = lang === "ar";
  const { timings } = computeSceneTimings(props);
  const sfxSchedule = buildSfxSchedule(scenes, timings, sfx, overrides);

  const showProgressBar = overrides.showProgressBar ?? true;
  const showTagBadge = overrides.showTagBadge ?? true;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <TransitionSeries>
        {scenes.map((scene, idx) => {
          const timing = timings[idx];
          const isFullBleed =
            scene.type === "talking-head" ||
            (scene.type === "media" && scene.frameStyle === "full");

          return (
            <React.Fragment key={idx}>
              {idx > 0 && timing && timing.transitionInFrames > 0 && (
                <TransitionSeries.Transition
                  presentation={getTransitionPresentation(
                    timing.transitionInKind,
                    isRtl
                  )}
                  timing={linearTiming({
                    durationInFrames: timing.transitionInFrames,
                  })}
                />
              )}

              <TransitionSeries.Sequence durationInFrames={scene.durationFrames}>
                <AbsoluteFill>
                  {!isFullBleed && <Backdrop theme={theme} />}

                  {scene.type === "talking-head" ? (
                    <TalkingHeadScene
                      theme={theme}
                      lang={lang}
                      src={scene.src}
                      startFromSec={scene.startFromSec}
                      zoom={scene.zoom}
                      muted={scene.muted}
                      overlayTitle={scene.overlayTitle}
                      highlightWord={scene.highlightWord}
                      calloutChip={scene.calloutChip}
                      hookBanner={scene.hookBanner}
                      hookScale={overrides.hookScale}
                      durationFrames={scene.durationFrames}
                      fontPreset={effectiveFontPreset}
                    />
                  ) : scene.type === "media" && scene.frameStyle === "full" ? (
                    <MediaScene
                      theme={theme}
                      lang={lang}
                      src={scene.src}
                      mediaType={scene.mediaType}
                      motion={scene.motion}
                      frameStyle="full"
                      headline={scene.headline}
                      highlightWord={scene.highlightWord}
                      badge={scene.badge}
                      startFromSec={scene.startFromSec}
                      playbackRate={scene.playbackRate}
                      muted={scene.muted}
                      loop={scene.loop}
                      durationFrames={scene.durationFrames}
                      fontPreset={effectiveFontPreset}
                    />
                  ) : (
                    <AbsoluteFill
                      style={{
                        paddingTop: 225,
                        paddingBottom: 370,
                        paddingLeft: 64,
                        paddingRight: 64,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <SceneContainer durationFrames={scene.durationFrames}>
                        {scene.type === "hook" && (
                          <HookCard
                            theme={theme}
                            lang={lang}
                            title={scene.title}
                            highlightWord={scene.highlightWord}
                            subtitle={scene.subtitle}
                            kicker={scene.kicker}
                            immediate={idx === 0}
                            scale={overrides.hookScale}
                            fontPreset={effectiveFontPreset}
                          />
                        )}
                        {scene.type === "media" && (
                          <MediaScene
                            theme={theme}
                            lang={lang}
                            src={scene.src}
                            mediaType={scene.mediaType}
                            motion={scene.motion}
                            frameStyle={scene.frameStyle ?? "framed-card"}
                            headline={scene.headline}
                            highlightWord={scene.highlightWord}
                            badge={scene.badge}
                            startFromSec={scene.startFromSec}
                            playbackRate={scene.playbackRate}
                            muted={scene.muted}
                            loop={scene.loop}
                            durationFrames={scene.durationFrames}
                            fontPreset={effectiveFontPreset}
                          />
                        )}
                        {scene.type === "split" && (
                          <SplitScene
                            theme={theme}
                            lang={lang}
                            top={scene.top}
                            bottom={scene.bottom}
                            ratio={scene.ratio}
                            dividerLabel={scene.dividerLabel}
                            fontPreset={effectiveFontPreset}
                          />
                        )}
                        {scene.type === "stat" && (
                          <StatBlock
                            theme={theme}
                            lang={lang}
                            value={scene.value}
                            prefix={scene.prefix}
                            suffix={scene.suffix}
                            label={scene.label}
                            detail={scene.detail}
                            delta={scene.delta}
                            fontPreset={effectiveFontPreset}
                          />
                        )}
                        {scene.type === "steps" && (
                          <StepList
                            theme={theme}
                            lang={lang}
                            heading={scene.heading}
                            steps={scene.steps}
                            fontPreset={effectiveFontPreset}
                          />
                        )}
                        {scene.type === "compare" && (
                          <CompareCard
                            theme={theme}
                            lang={lang}
                            heading={scene.heading}
                            leftTitle={scene.leftTitle}
                            leftBody={scene.leftBody}
                            rightTitle={scene.rightTitle}
                            rightBody={scene.rightBody}
                            fontPreset={effectiveFontPreset}
                          />
                        )}
                        {scene.type === "quote" && (
                          <QuoteCard
                            theme={theme}
                            lang={lang}
                            quote={scene.quote}
                            highlightWord={scene.highlightWord}
                            author={scene.author}
                            source={scene.source}
                            fontPreset={effectiveFontPreset}
                          />
                        )}
                        {scene.type === "bar-chart" && (
                          <BarChart
                            theme={theme}
                            lang={lang}
                            heading={scene.heading}
                            bars={scene.bars}
                            source={scene.source}
                            fontPreset={effectiveFontPreset}
                          />
                        )}
                        {scene.type === "cta" && (
                          <HookCard
                            theme={theme}
                            lang={lang}
                            title={scene.title}
                            highlightWord={scene.highlightWord}
                            subtitle={scene.subtitle}
                            kicker={scene.kicker}
                            immediate={false}
                            scale={overrides.hookScale}
                            fontPreset={effectiveFontPreset}
                          />
                        )}
                      </SceneContainer>
                    </AbsoluteFill>
                  )}
                </AbsoluteFill>
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {/* Global voiceover or continuous A-roll backing audio */}
      {audioSrc && <Audio src={resolveMediaSrc(audioSrc)} volume={1} />}
      {aRollSrc && <Audio src={resolveMediaSrc(aRollSrc)} volume={1} />}

      {/* Built-in SFX track */}
      {sfxSchedule.map((ev, i) => (
        <Sequence key={`sfx-${i}`} from={ev.frame} durationInFrames={45}>
          <Audio
            src={staticFile(`sfx/${ev.type}.wav`)}
            volume={ev.volume ?? 0.22}
          />
        </Sequence>
      ))}

      {showTagBadge && (
        <div
          style={{
            position: "absolute",
            top: 112,
            left: 64,
            right: 64,
            zIndex: 35,
          }}
        >
          <TagBadge
            theme={theme}
            lang={lang}
            label={tag}
            secondary={handle}
            fontPreset={effectiveFontPreset}
          />
        </div>
      )}

      {showProgressBar && <ProgressBar theme={theme} />}

      <CaptionBar
        theme={theme}
        lang={lang}
        lines={captions}
        words={words}
        captionStyle={overrides.captionStyle}
        scale={overrides.captionScale}
        bottom={overrides.captionBottom}
        fontPreset={effectiveFontPreset}
      />
    </AbsoluteFill>
  );
};
