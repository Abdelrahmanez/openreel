import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { FontPreset, Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

export interface StepItem {
  title: string;
  detail: string;
}

interface StepListProps {
  theme: ThemeSpec;
  lang: Lang;
  heading: string;
  steps: StepItem[];
  fontPreset?: FontPreset;
}

export const StepList: React.FC<StepListProps> = ({
  theme,
  lang,
  heading,
  steps,
  fontPreset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 54,
          fontWeight: 900,
          color: theme.text,
          marginBottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            width: 14,
            height: 44,
            backgroundColor: theme.accent,
            borderRadius: theme.radius === 0 ? 0 : 6,
            display: "inline-block",
          }}
        />
        <span>{heading}</span>
      </div>

      {steps.map((step, idx) => {
        const delay = idx * 10;
        const p = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: { damping: 16, stiffness: 170 },
        });
        const y = interpolate(p, [0, 1], [34, 0]);
        const isLast = idx === steps.length - 1;
        return (
          <div
            key={idx}
            style={{
              opacity: p,
              transform: `translateY(${y}px)`,
              backgroundColor: theme.surface,
              border: `${theme.borderWidth}px solid ${
                isLast ? theme.accent : theme.border
              }`,
              borderRadius: theme.radius,
              boxShadow: theme.cardShadow,
              padding: "28px 34px",
              display: "flex",
              alignItems: "flex-start",
              gap: 22,
            }}
          >
            <div
              dir="ltr"
              style={{
                unicodeBidi: "isolate",
                minWidth: 66,
                height: 66,
                borderRadius: theme.radius === 0 ? 0 : 16,
                backgroundColor: isLast ? theme.highlightBg : theme.accent,
                color: isLast ? theme.highlightText : theme.accentText,
                fontFamily: fonts.mono,
                fontSize: 30,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border:
                  theme.layoutStyle === "poster"
                    ? `2px solid ${theme.border}`
                    : "none",
              }}
            >
              0{idx + 1}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: 38,
                  fontWeight: 800,
                  color: theme.text,
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 28,
                  color: theme.muted,
                  lineHeight: 1.42,
                }}
              >
                {step.detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
