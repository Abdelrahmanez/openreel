import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { FontPreset, Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

export interface BarChartItem {
  label: string;
  value: number;
  suffix?: string;
  highlight?: boolean;
}

interface BarChartProps {
  theme: ThemeSpec;
  lang: Lang;
  heading: string;
  bars: BarChartItem[];
  source?: string;
  fontPreset?: FontPreset;
}

export const BarChart: React.FC<BarChartProps> = ({
  theme,
  lang,
  heading,
  bars,
  source,
  fontPreset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";

  const maxVal = Math.max(1, ...bars.map((b) => Math.abs(b.value)));

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        backgroundColor: theme.surface,
        border: `${theme.borderWidth}px solid ${theme.border}`,
        borderRadius: theme.radius,
        boxShadow: theme.cardShadow,
        padding: "46px 46px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 48,
          fontWeight: 900,
          lineHeight: 1.25,
          color: theme.text,
        }}
      >
        {heading}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {bars.map((bar, idx) => {
          const delay = idx * 7;
          const p = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: { damping: 18, stiffness: 135 },
          });
          const targetPct = Math.max(10, (Math.abs(bar.value) / maxVal) * 100);
          const widthPct = interpolate(p, [0, 1], [0, targetPct]);
          const numDisplay = Math.round(interpolate(p, [0, 1], [0, bar.value]));
          const fillColor = bar.highlight ? theme.highlightBg : theme.accent;

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                opacity: Math.min(1, p * 1.4),
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 31,
                    fontWeight: bar.highlight ? 800 : 600,
                    color: theme.text,
                  }}
                >
                  {bar.label}
                </span>
                <span
                  dir="ltr"
                  style={{
                    unicodeBidi: "isolate",
                    fontFamily: fonts.mono,
                    fontSize: 30,
                    fontWeight: 800,
                    color: bar.highlight ? theme.highlightBg : theme.accent,
                  }}
                >
                  {numDisplay}
                  {bar.suffix ?? ""}
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: 22,
                  backgroundColor: theme.surfaceElevated,
                  borderRadius: theme.radius === 0 ? 0 : 999,
                  border: `1.5px solid ${theme.subtleBorder}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    backgroundColor: fillColor,
                    borderRadius: theme.radius === 0 ? 0 : 999,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {source && (
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 22,
            color: theme.muted,
            borderTop: `1.5px solid ${theme.subtleBorder}`,
            paddingTop: 14,
          }}
        >
          {source}
        </div>
      )}
    </div>
  );
};
