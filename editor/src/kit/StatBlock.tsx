import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { FontPreset, Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

interface StatBlockProps {
  theme: ThemeSpec;
  lang: Lang;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  detail?: string;
  delta?: string;
  fontPreset?: FontPreset;
}

export const StatBlock: React.FC<StatBlockProps> = ({
  theme,
  lang,
  value,
  suffix = "",
  prefix = "",
  label,
  detail,
  delta,
  fontPreset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";

  const countProg = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  const displayValue = Math.round(interpolate(countProg, [0, 1], [0, value]));
  const barWidth = interpolate(countProg, [0, 1], [6, 100]);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        backgroundColor: theme.surface,
        border: `${theme.borderWidth}px solid ${theme.border}`,
        borderRadius: theme.radius,
        boxShadow: theme.cardShadow,
        padding: "54px 50px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          dir="ltr"
          style={{
            unicodeBidi: "isolate",
            fontFamily: fonts.display,
            fontSize: 132,
            fontWeight: 900,
            lineHeight: 1,
            color: theme.accent,
            letterSpacing: -2,
          }}
        >
          {prefix}
          {displayValue}
          {suffix}
        </div>

        {delta && (
          <div
            dir="ltr"
            style={{
              unicodeBidi: "isolate",
              fontFamily: fonts.mono,
              fontSize: 28,
              fontWeight: 700,
              padding: "10px 20px",
              borderRadius: theme.radius === 0 ? 0 : 999,
              backgroundColor: theme.highlightBg,
              color: theme.highlightText,
              border:
                theme.layoutStyle === "poster"
                  ? `2px solid ${theme.border}`
                  : "none",
            }}
          >
            {delta}
          </div>
        )}
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 48,
          fontWeight: 800,
          lineHeight: 1.3,
          color: theme.text,
        }}
      >
        {label}
      </div>

      {detail && (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 32,
            color: theme.muted,
            lineHeight: 1.45,
          }}
        >
          {detail}
        </div>
      )}

      <div
        style={{
          width: "100%",
          height: 16,
          backgroundColor: theme.surfaceElevated,
          borderRadius: theme.radius === 0 ? 0 : 999,
          border: `1.5px solid ${theme.subtleBorder}`,
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${theme.accent}, ${theme.highlightBg})`,
          }}
        />
      </div>
    </div>
  );
};
