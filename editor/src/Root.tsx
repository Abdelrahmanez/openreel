import React from "react";
import { Composition } from "remotion";
import demoCover from "../../reels/00_demo_reel/cover.json";
import demoReel from "../../reels/00_demo_reel/reel.json";
import arabicCover from "../../reels/01_arabic_demo/cover.json";
import arabicReel from "../../reels/01_arabic_demo/reel.json";
import { BRAND_CONFIG } from "./brand/brand.config";
import {
  CoverComposition,
  type CoverProps,
} from "./compositions/CoverComposition";
import {
  ReelTemplate,
  computeReelTotalFrames,
  type ReelProps,
} from "./compositions/ReelTemplate";
import {
  ThemePreview,
  type ThemePreviewProps,
} from "./compositions/ThemePreview";

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
            accentOverride: BRAND_CONFIG.accentOverride,
            highlightOverride: BRAND_CONFIG.highlightOverride,
            fontPreset: BRAND_CONFIG.fontPreset,
            title: "Your Idea to Final Reel",
            subtitle: "AI guides every step — zero editing guesswork",
          } satisfies ThemePreviewProps
        }
      />

      <Composition
        id="ReelTemplate"
        component={ReelTemplate}
        durationInFrames={computeReelTotalFrames(demoReel as ReelProps)}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: computeReelTotalFrames(props as unknown as ReelProps),
        })}
        defaultProps={{ ...(demoReel as ReelProps), words: [] }}
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
        durationInFrames={computeReelTotalFrames(demoReel as ReelProps)}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: computeReelTotalFrames(props as unknown as ReelProps),
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

      <Composition
        id="ArabicDemoReel"
        component={ReelTemplate}
        durationInFrames={computeReelTotalFrames(arabicReel as ReelProps)}
        fps={30}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => ({
          durationInFrames: computeReelTotalFrames(props as unknown as ReelProps),
        })}
        defaultProps={arabicReel as ReelProps}
      />

      <Composition
        id="ArabicDemoCover"
        component={CoverComposition}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={arabicCover as CoverProps}
      />
    </>
  );
};
