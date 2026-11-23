import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Lang, ThemeSpec } from "../themes/types";
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
}

export const StepList: React.FC<StepListProps> = ({
  theme,
  lang,
  heading,
  steps,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang);
  const isRtl = lang === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 54,
          fontWeight: 800,
          color: theme.text,
          marginBottom: 8,
        }}
      >
        {heading}
      </div>

      {steps.map((step, idx) => {
        const delay = idx * 8;
        const p = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: { damping: 16, stiffness: 160 },
        });
        const y = interpolate(p, [0, 1], [32, 0]);
        return (
          <div
            key={idx}
            style={{
              opacity: p,
              transform: `translateY(${y}px)`,
              backgroundColor: theme.surface,
              border: `${theme.borderWidth}px solid ${theme.border}`,
              borderRadius: theme.radius,
              boxShadow: theme.cardShadow,
              padding: "30px 34px",
              display: "flex",
              alignItems: "flex-start",
              gap: 24,
            }}
          >
            <div
              style={{
                minWidth: 64,
                height: 64,
                borderRadius: theme.radius === 0 ? 0 : 16,
                backgroundColor: theme.accent,
                color: theme.accentText,
                fontFamily: fonts.mono,
                fontSize: 32,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              0{idx + 1}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: 38,
                  fontWeight: 700,
                  color: theme.text,
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 29,
                  color: theme.muted,
                  lineHeight: 1.4,
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
