import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

interface StatBlockProps {
  theme: ThemeSpec;
  lang: Lang;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  detail?: string;
}

export const StatBlock: React.FC<StatBlockProps> = ({
  theme,
  lang,
  value,
  suffix = "",
  prefix = "",
  label,
  detail,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang);
  const isRtl = lang === "ar";

  const countProg = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 110 },
  });
  const displayValue = Math.round(interpolate(countProg, [0, 1], [0, value]));
  const barWidth = interpolate(countProg, [0, 1], [8, 100]);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        backgroundColor: theme.surface,
        border: `${theme.borderWidth}px solid ${theme.border}`,
        borderRadius: theme.radius,
        boxShadow: theme.cardShadow,
        padding: "56px 52px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div
        style={{
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

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 48,
          fontWeight: 700,
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
          height: 14,
          backgroundColor: theme.surfaceElevated,
          borderRadius: theme.radius === 0 ? 0 : 999,
          overflow: "hidden",
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            backgroundColor: theme.highlightBg,
          }}
        />
      </div>
    </div>
  );
};
