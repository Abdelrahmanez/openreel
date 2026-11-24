import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { FontPreset, Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

interface CompareCardProps {
  theme: ThemeSpec;
  lang: Lang;
  heading: string;
  leftTitle: string;
  leftBody: string;
  rightTitle: string;
  rightBody: string;
  fontPreset?: FontPreset;
}

export const CompareCard: React.FC<CompareCardProps> = ({
  theme,
  lang,
  heading,
  leftTitle,
  leftBody,
  rightTitle,
  rightBody,
  fontPreset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";

  const p1 = spring({ frame, fps, config: { damping: 16, stiffness: 160 } });
  const p2 = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 16, stiffness: 160 },
  });

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 54,
          fontWeight: 900,
          color: theme.text,
          lineHeight: 1.2,
        }}
      >
        {heading}
      </div>

      {/* Old / Generic card */}
      <div
        style={{
          opacity: p1,
          transform: `translateY(${interpolate(p1, [0, 1], [30, 0])}px)`,
          backgroundColor: theme.surfaceElevated,
          border: `${theme.borderWidth}px solid ${theme.border}`,
          borderRadius: theme.radius,
          padding: "34px 38px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 26,
              fontWeight: 700,
              color: theme.muted,
            }}
          >
            {leftTitle}
          </span>
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: theme.radius === 0 ? 0 : "50%",
              backgroundColor: "rgba(224, 50, 43, 0.16)",
              color: "#E0322B",
              border: "2px solid #E0322B",
              fontFamily: fonts.mono,
              fontSize: 24,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </span>
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 35,
            fontWeight: 600,
            color: theme.text,
            lineHeight: 1.42,
            opacity: 0.85,
          }}
        >
          {leftBody}
        </div>
      </div>

      {/* New / Winning card */}
      <div
        style={{
          opacity: p2,
          transform: `translateY(${interpolate(p2, [0, 1], [30, 0])}px)`,
          backgroundColor: theme.surface,
          border: `${Math.max(3, theme.borderWidth)}px solid ${theme.accent}`,
          borderRadius: theme.radius,
          boxShadow: theme.cardShadow,
          padding: "38px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 26,
              fontWeight: 800,
              color: theme.accent,
            }}
          >
            {rightTitle}
          </span>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: theme.radius === 0 ? 0 : "50%",
              backgroundColor: theme.accent,
              color: theme.accentText,
              fontFamily: fonts.mono,
              fontSize: 24,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✓
          </span>
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 37,
            fontWeight: 800,
            color: theme.text,
            lineHeight: 1.42,
          }}
        >
          {rightBody}
        </div>
      </div>
    </div>
  );
};
