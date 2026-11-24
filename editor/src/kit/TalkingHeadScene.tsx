import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { FontPreset, Lang, ThemeSpec } from "../themes/types";
import { HookCard } from "./HookCard";
import { getFontFamilies } from "./fonts";
import { resolveMediaSrc } from "./mediaSrc";

export interface TalkingHeadSceneProps {
  theme: ThemeSpec;
  lang: Lang;
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
  hookScale?: number;
  durationFrames: number;
  fontPreset?: FontPreset;
}

export const TalkingHeadScene: React.FC<TalkingHeadSceneProps> = ({
  theme,
  lang,
  src,
  startFromSec = 0,
  zoom = "push-in",
  muted = false,
  overlayTitle,
  highlightWord,
  calloutChip,
  hookBanner,
  hookScale = 1,
  durationFrames,
  fontPreset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";
  const resolved = resolveMediaSrc(src);

  let videoScale = 1;
  if (zoom === "push-in") {
    videoScale = interpolate(
      frame,
      [0, Math.max(1, durationFrames)],
      [1.0, 1.07],
      { extrapolateRight: "clamp" }
    );
  } else if (zoom === "punch") {
    videoScale = interpolate(
      frame,
      [0, Math.max(1, durationFrames)],
      [1.1, 1.15],
      { extrapolateRight: "clamp" }
    );
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000000" }}>
      <Video
        src={resolved}
        trimBefore={
          startFromSec > 0 ? Math.round(startFromSec * fps) : undefined
        }
        muted={muted}
        objectFit="cover"
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${videoScale})`,
          transformOrigin: "center 32%",
        }}
      />

      {/* Subtle legibility gradient behind hook & lower captions */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 55%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Optional Frame-0 chest HookBanner */}
      {hookBanner && (
        <div
          style={{
            position: "absolute",
            top: 800,
            left: 56,
            right: 56,
            zIndex: 25,
          }}
        >
          <HookCard
            theme={theme}
            lang={lang}
            title={hookBanner.title}
            highlightWord={hookBanner.highlightWord}
            subtitle={hookBanner.subtitle}
            immediate
            variant="overlay"
            scale={hookScale}
            fontPreset={fontPreset}
          />
        </div>
      )}

      {/* Optional keyword callout overlay without hookBanner */}
      {!hookBanner && (overlayTitle || calloutChip) && (
        <div
          dir={isRtl ? "rtl" : "ltr"}
          style={{
            position: "absolute",
            top: 900,
            left: 64,
            right: 64,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            zIndex: 25,
          }}
        >
          {calloutChip && (
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 28,
                fontWeight: 800,
                padding: "10px 26px",
                borderRadius: theme.radius === 0 ? 0 : 999,
                backgroundColor: theme.accent,
                color: theme.accentText,
                border: `2.5px solid ${theme.border}`,
              }}
            >
              {calloutChip}
            </div>
          )}
          {overlayTitle && (
            <div
              style={{
                fontFamily: fonts.display,
                fontSize: 60,
                fontWeight: 900,
                lineHeight: 1.25,
                textAlign: "center",
                color: "#FFFFFF",
                textShadow: "0 8px 28px rgba(0,0,0,0.85)",
              }}
            >
              {highlightWord && overlayTitle.includes(highlightWord) ? (
                <>
                  {overlayTitle.slice(0, overlayTitle.indexOf(highlightWord))}
                  <span style={{ color: theme.highlightBg }}>
                    {highlightWord}
                  </span>
                  {overlayTitle.slice(
                    overlayTitle.indexOf(highlightWord) + highlightWord.length
                  )}
                </>
              ) : (
                overlayTitle
              )}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
