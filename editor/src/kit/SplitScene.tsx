import React from "react";
import { Video } from "@remotion/media";
import { Img, useVideoConfig } from "remotion";
import type { FontPreset, Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";
import { isVideoPath, resolveMediaSrc } from "./mediaSrc";

export interface SplitMediaPane {
  src: string;
  mediaType?: "image" | "video";
  startFromSec?: number;
  muted?: boolean;
  label?: string;
}

export interface SplitSceneProps {
  theme: ThemeSpec;
  lang: Lang;
  top: SplitMediaPane;
  bottom: SplitMediaPane;
  ratio?: number;
  dividerLabel?: string;
  fontPreset?: FontPreset;
}

const PaneMedia: React.FC<{
  pane: SplitMediaPane;
  theme: ThemeSpec;
  fontMono: string;
}> = ({ pane, theme, fontMono }) => {
  const { fps } = useVideoConfig();
  const resolved = resolveMediaSrc(pane.src);
  const isVid = pane.mediaType ? pane.mediaType === "video" : isVideoPath(pane.src);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: theme.surface,
        borderRadius: theme.radius,
        border: `${Math.max(2, theme.borderWidth)}px solid ${theme.border}`,
      }}
    >
      {isVid ? (
        <Video
          src={resolved}
          trimBefore={
            pane.startFromSec && pane.startFromSec > 0
              ? Math.round(pane.startFromSec * fps)
              : undefined
          }
          muted={pane.muted ?? true}
          loop
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <Img
          src={resolved}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {pane.label && (
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            fontFamily: fontMono,
            fontSize: 22,
            fontWeight: 700,
            padding: "6px 16px",
            borderRadius: theme.radius === 0 ? 0 : 999,
            backgroundColor: theme.captionBg,
            color: theme.captionText,
            border: `1.5px solid ${theme.border}`,
          }}
        >
          {pane.label}
        </div>
      )}
    </div>
  );
};

export const SplitScene: React.FC<SplitSceneProps> = ({
  theme,
  lang,
  top,
  bottom,
  ratio = 0.54,
  dividerLabel,
  fontPreset,
}) => {
  const fonts = getFontFamilies(lang, fontPreset);
  const clampedRatio = Math.max(0.3, Math.min(0.7, ratio));

  return (
    <div
      style={{
        width: "100%",
        height: 1120,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        position: "relative",
      }}
    >
      <div style={{ flex: clampedRatio, minHeight: 0 }}>
        <PaneMedia pane={top} theme={theme} fontMono={fonts.mono} />
      </div>

      {dividerLabel && (
        <div
          style={{
            position: "absolute",
            top: `${clampedRatio * 100}%`,
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 15,
            fontFamily: fonts.mono,
            fontSize: 24,
            fontWeight: 800,
            padding: "8px 24px",
            borderRadius: theme.radius === 0 ? 0 : 999,
            backgroundColor: theme.highlightBg,
            color: theme.highlightText,
            border: `2.5px solid ${theme.border}`,
          }}
        >
          {dividerLabel}
        </div>
      )}

      <div style={{ flex: 1 - clampedRatio, minHeight: 0 }}>
        <PaneMedia pane={bottom} theme={theme} fontMono={fonts.mono} />
      </div>
    </div>
  );
};
