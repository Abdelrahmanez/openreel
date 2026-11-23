import React from "react";
import { AbsoluteFill, Series, interpolate, useCurrentFrame } from "remotion";
import {
  Backdrop,
  CaptionBar,
  CompareCard,
  HookCard,
  StatBlock,
  StepList,
  TagBadge,
  type CaptionLine,
  type StepItem,
} from "../kit";
import { getTheme, type Lang, type ThemeId } from "../themes";

export type ReelScene =
  | {
      type: "hook";
      durationFrames: number;
      title: string;
      highlightWord?: string;
      subtitle?: string;
    }
  | {
      type: "stat";
      durationFrames: number;
      value: number;
      prefix?: string;
      suffix?: string;
      label: string;
      detail?: string;
    }
  | {
      type: "steps";
      durationFrames: number;
      heading: string;
      steps: StepItem[];
    }
  | {
      type: "compare";
      durationFrames: number;
      heading: string;
      leftTitle: string;
      leftBody: string;
      rightTitle: string;
      rightBody: string;
    }
  | {
      type: "cta";
      durationFrames: number;
      title: string;
      highlightWord?: string;
      subtitle?: string;
    };

export type ReelProps = {
  themeId: ThemeId;
  lang: Lang;
  tag: string;
  handle: string;
  accentOverride?: string;
  scenes: ReelScene[];
  captions: CaptionLine[];
};

const SceneContainer: React.FC<{
  durationFrames: number;
  children: React.ReactNode;
}> = ({ durationFrames, children }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, Math.max(1, durationFrames)], [1.0, 1.025], {
    extrapolateRight: "clamp",
  });
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

export const ReelTemplate: React.FC<ReelProps> = ({
  themeId,
  lang,
  tag,
  handle,
  accentOverride,
  scenes,
  captions,
}) => {
  const theme = getTheme(themeId, accentOverride);

  return (
    <AbsoluteFill>
      <Backdrop theme={theme} />

      <div
        style={{
          position: "absolute",
          top: 128,
          left: 72,
          right: 72,
          zIndex: 10,
        }}
      >
        <TagBadge theme={theme} lang={lang} label={tag} secondary={handle} />
      </div>

      <Series>
        {scenes.map((scene, idx) => (
          <Series.Sequence key={idx} durationInFrames={scene.durationFrames}>
            <AbsoluteFill
              style={{
                paddingTop: 260,
                paddingBottom: 390,
                paddingLeft: 72,
                paddingRight: 72,
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
                    immediate={idx === 0}
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
                  />
                )}
                {scene.type === "steps" && (
                  <StepList
                    theme={theme}
                    lang={lang}
                    heading={scene.heading}
                    steps={scene.steps}
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
                  />
                )}
                {scene.type === "cta" && (
                  <HookCard
                    theme={theme}
                    lang={lang}
                    title={scene.title}
                    highlightWord={scene.highlightWord}
                    subtitle={scene.subtitle}
                    immediate={false}
                  />
                )}
              </SceneContainer>
            </AbsoluteFill>
          </Series.Sequence>
        ))}
      </Series>

      <CaptionBar theme={theme} lang={lang} lines={captions} />
    </AbsoluteFill>
  );
};
