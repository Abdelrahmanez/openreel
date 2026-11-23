import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

interface HookCardProps {
  theme: ThemeSpec;
  lang: Lang;
  title: string;
  highlightWord?: string;
  subtitle?: string;
  immediate?: boolean;
}

export const HookCard: React.FC<HookCardProps> = ({
  theme,
  lang,
  title,
  highlightWord,
  subtitle,
  immediate = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang);
  const isRtl = lang === "ar";

  const prog = immediate
    ? 1
    : spring({ frame, fps, config: { damping: 16, stiffness: 180 } });
  const translateY = interpolate(prog, [0, 1], [36, 0]);

  const renderHighlightedTitle = () => {
    if (!highlightWord || !title.includes(highlightWord)) {
      return title;
    }
    const idx = title.indexOf(highlightWord);
    const before = title.slice(0, idx);
    const after = title.slice(idx + highlightWord.length);
    return (
      <>
        {before}
        <span
          style={{
            backgroundColor: theme.highlightBg,
            color: theme.highlightText,
            padding: isRtl ? "2px 22px 10px" : "4px 18px",
            borderRadius: theme.radius === 0 ? 0 : 14,
            display: "inline-block",
          }}
        >
          {highlightWord}
        </span>
        {after}
      </>
    );
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        transform: `translateY(${translateY}px)`,
        backgroundColor: theme.surface,
        border: `${theme.borderWidth}px solid ${theme.border}`,
        borderRadius: theme.radius,
        boxShadow: theme.cardShadow,
        padding: "56px 52px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: isRtl ? 74 : 76,
          fontWeight: 800,
          lineHeight: isRtl ? 1.28 : 1.12,
          color: theme.text,
          letterSpacing: isRtl ? 0 : -1.5,
        }}
      >
        {renderHighlightedTitle()}
      </div>

      {subtitle && (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 36,
            fontWeight: 500,
            lineHeight: 1.45,
            color: theme.muted,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
