import React from "react";
import { Composition } from "remotion";
import demoCover from "../../reels/00_demo_reel/cover.json";
import demoReel from "../../reels/00_demo_reel/reel.json";
import { BRAND_CONFIG } from "./brand/brand.config";
import {
  CoverComposition,
  type CoverProps,
} from "./compositions/CoverComposition";
import { ReelTemplate, type ReelProps } from "./compositions/ReelTemplate";
import {
  ThemePreview,
  type ThemePreviewProps,
} from "./compositions/ThemePreview";

const getTotalFrames = (props: ReelProps) => {
  const sum = props.scenes.reduce((acc, s) => acc + s.durationFrames, 0);
  return Math.max(30, sum);
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ThemePreview"
        component={ThemePreview}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={
          {
            themeId: BRAND_CONFIG.themeId,
            lang: BRAND_CONFIG.lang,
            tag: BRAND_CONFIG.nicheTag,
            handle: BRAND_CONFIG.handle,
            title: "Your Idea to Final Reel",
            subtitle: "AI guides every step — zero editing guesswork",
          } satisfies ThemePreviewProps
        }
      />

      <Composition
        id="ReelTemplate"
        component={ReelTemplate}
        durationInFrames={getTotalFrames(demoReel as ReelProps)}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: getTotalFrames(props as unknown as ReelProps),
        })}
        defaultProps={demoReel as ReelProps}
      />

      <Composition
        id="CoverComposition"
        component={CoverComposition}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={demoCover as CoverProps}
      />

      <Composition
        id="DemoReel"
        component={ReelTemplate}
        durationInFrames={getTotalFrames(demoReel as ReelProps)}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: getTotalFrames(props as unknown as ReelProps),
        })}
        defaultProps={demoReel as ReelProps}
      />

      <Composition
        id="DemoCover"
        component={CoverComposition}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={demoCover as CoverProps}
      />
    </>
  );
};
