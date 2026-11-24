import React from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { FontPreset, Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";
import { isVideoPath, resolveMediaSrc } from "./mediaSrc";

export type MediaMotion =
  | "ken-burns-in"
  | "ken-burns-out"
  | "pan-left"
  | "pan-right"
  | "static";

export type MediaFrame = "full" | "framed-card" | "phone-mockup";

export interface MediaSceneProps {
  theme: ThemeSpec;
  lang: Lang;
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
  durationFrames: number;
  fontPreset?: FontPreset;
}

export const MediaScene: React.FC<MediaSceneProps> = ({
  theme,
  lang,
  src,
  mediaType,
  motion = "ken-burns-in",
  frameStyle = "framed-card",
  headline,
  highlightWord,
  badge,
  startFromSec = 0,
  playbackRate = 1,
  muted = true,
  loop = true,
  durationFrames,
  fontPreset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";
  const resolved = resolveMediaSrc(src);
  const isVideo = mediaType ? mediaType === "video" : isVideoPath(src);

  const progress = Math.min(1, frame / Math.max(1, durationFrames));
  let scale = 1;
  let tx = 0;

  if (motion === "ken-burns-in") {
    scale = interpolate(progress, [0, 1], [1.0, 1.09]);
  } else if (motion === "ken-burns-out") {
    scale = interpolate(progress, [0, 1], [1.09, 1.0]);
  } else if (motion === "pan-left") {
    scale = 1.08;
    tx = interpolate(progress, [0, 1], [24, -24]);
  } else if (motion === "pan-right") {
    scale = 1.08;
    tx = interpolate(progress, [0, 1], [-24, 24]);
  }

  const cardEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 170 },
  });

  const mediaElement = isVideo ? (
    <Video
      src={resolved}
      trimBefore={
        startFromSec > 0 ? Math.round(startFromSec * fps) : undefined
      }
      playbackRate={playbackRate}
      muted={muted}
      loop={loop}
      objectFit="cover"
      style={{
        width: "100%",
        height: "100%",
        transform: `scale(${scale}) translateX(${tx}px)`,
      }}
    />
  ) : (
    <Img
      src={resolved}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${scale}) translateX(${tx}px)`,
      }}
    />
  );

  const renderHeadline = () => {
    if (!headline) return null;
    if (!highlightWord || !headline.includes(highlightWord)) {
      return headline;
    }
    const idx = headline.indexOf(highlightWord);
    return (
      <>
        {headline.slice(0, idx)}
        <span
          style={{
            backgroundColor: theme.highlightBg,
            color: theme.highlightText,
            padding: isRtl ? "0 16px 6px" : "2px 14px",
            borderRadius: theme.radius === 0 ? 0 : 10,
            display: "inline-block",
          }}
        >
          {highlightWord}
        </span>
        {headline.slice(idx + highlightWord.length)}
      </>
    );
  };

  if (frameStyle === "full") {
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <AbsoluteFill>{mediaElement}</AbsoluteFill>
        {/* Subtle dark legibility gradient at top & bottom */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.0) 28%, rgba(0,0,0,0.0) 64%, rgba(0,0,0,0.58) 100%)",
          }}
        />
        {(badge || headline) && (
          <div
            dir={isRtl ? "rtl" : "ltr"}
            style={{
              position: "absolute",
              top: 230,
              left: 64,
              right: 64,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            {badge && (
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 24,
                  fontWeight: 700,
                  padding: "8px 18px",
                  borderRadius: theme.radius === 0 ? 0 : 999,
                  backgroundColor: theme.accent,
                  color: theme.accentText,
                }}
              >
                {badge}
              </div>
            )}
            {headline && (
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: 54,
                  fontWeight: 900,
                  lineHeight: 1.25,
                  color: "#FFFFFF",
                  textShadow: "0 6px 24px rgba(0,0,0,0.75)",
                }}
              >
                {renderHeadline()}
              </div>
            )}
          </div>
        )}
      </AbsoluteFill>
    );
  }

  const isPhone = frameStyle === "phone-mockup";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        opacity: cardEntrance,
        transform: `translateY(${interpolate(cardEntrance, [0, 1], [28, 0])}px)`,
      }}
    >
      {badge && (
        <div
          style={{
            alignSelf: "flex-start",
            fontFamily: fonts.mono,
            fontSize: 24,
            fontWeight: 700,
            padding: "8px 18px",
            borderRadius: theme.radius === 0 ? 0 : 999,
            backgroundColor: theme.surfaceElevated,
            color: theme.accent,
            border: `2px solid ${theme.accent}`,
          }}
        >
          {badge}
        </div>
      )}

      <div
        style={{
          width: isPhone ? 560 : "100%",
          height: isPhone ? 960 : 760,
          borderRadius: isPhone ? 46 : theme.radius,
          border: `${isPhone ? 10 : Math.max(3, theme.borderWidth)}px solid ${
            isPhone ? "#111827" : theme.border
          }`,
          boxShadow: theme.cardShadow,
          overflow: "hidden",
          backgroundColor: theme.surface,
          position: "relative",
        }}
      >
        {mediaElement}
      </div>

      {headline && (
        <div
          style={{
            width: "100%",
            backgroundColor: theme.surface,
            border: `${theme.borderWidth}px solid ${theme.border}`,
            borderRadius: theme.radius,
            padding: "24px 32px",
            fontFamily: fonts.display,
            fontSize: 42,
            fontWeight: 800,
            lineHeight: 1.3,
            color: theme.text,
            textAlign: isRtl ? "right" : "left",
          }}
        >
          {renderHeadline()}
        </div>
      )}
    </div>
  );
};
