import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

interface CompareCardProps {
  theme: ThemeSpec;
  lang: Lang;
  heading: string;
  leftTitle: string;
  leftBody: string;
  rightTitle: string;
  rightBody: string;
}

export const CompareCard: React.FC<CompareCardProps> = ({
  theme,
  lang,
  heading,
  leftTitle,
  leftBody,
  rightTitle,
  rightBody,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang);
  const isRtl = lang === "ar";

  const p1 = spring({ frame, fps, config: { damping: 16, stiffness: 160 } });
  const p2 = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 16, stiffness: 160 },
  });

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{ display: "flex", flexDirection: "column", gap: 26 }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 54,
          fontWeight: 800,
          color: theme.text,
        }}
      >
        {heading}
      </div>

      <div
        style={{
          opacity: p1,
          transform: `translateY(${interpolate(p1, [0, 1], [30, 0])}px)`,
          backgroundColor: theme.surfaceElevated,
          border: `${theme.borderWidth}px solid ${theme.border}`,
          borderRadius: theme.radius,
          padding: "36px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 28,
            fontWeight: 700,
            color: theme.muted,
          }}
        >
          {leftTitle}
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 36,
            fontWeight: 600,
            color: theme.text,
            lineHeight: 1.4,
          }}
        >
          {leftBody}
        </div>
      </div>

      <div
        style={{
          opacity: p2,
          transform: `translateY(${interpolate(p2, [0, 1], [30, 0])}px)`,
          backgroundColor: theme.surface,
          border: `${Math.max(3, theme.borderWidth)}px solid ${theme.accent}`,
          borderRadius: theme.radius,
          boxShadow: theme.cardShadow,
          padding: "40px 42px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 28,
            fontWeight: 700,
            color: theme.accent,
          }}
        >
          {rightTitle}
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 38,
            fontWeight: 700,
            color: theme.text,
            lineHeight: 1.4,
          }}
        >
          {rightBody}
        </div>
      </div>
    </div>
  );
};
