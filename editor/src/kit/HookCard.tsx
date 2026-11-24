import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { FontPreset, Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

interface HookCardProps {
  theme: ThemeSpec;
  lang: Lang;
  title: string;
  highlightWord?: string;
  subtitle?: string;
  immediate?: boolean;
  scale?: number;
  variant?: "card" | "overlay";
  kicker?: string;
  fontPreset?: FontPreset;
}

export const HookCard: React.FC<HookCardProps> = ({
  theme,
  lang,
  title,
  highlightWord,
  subtitle,
  immediate = true,
  scale = 1,
  variant = "card",
  kicker,
  fontPreset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";

  const prog = immediate
    ? 1
    : spring({ frame, fps, config: { damping: 16, stiffness: 190 } });
  const translateY = interpolate(prog, [0, 1], [34, 0]);
  const popScale = immediate
    ? interpolate(Math.min(frame, 8), [0, 8], [1.02, 1], {
        extrapolateRight: "clamp",
      })
    : 1;

  const safeScale = Math.max(0.75, Math.min(1.65, scale));
  const baseTitleSize =
    variant === "overlay" ? (isRtl ? 56 : 58) : isRtl ? 74 : 76;
  const titleFontSize = Math.round(baseTitleSize * safeScale);
  const subtitleFontSize = Math.round(
    (variant === "overlay" ? 28 : 35) * Math.min(1.28, safeScale)
  );

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
            border:
              theme.layoutStyle === "poster"
                ? `2.5px solid ${theme.border}`
                : "none",
          }}
        >
          {highlightWord}
        </span>
        {after}
      </>
    );
  };

  const isOverlay = variant === "overlay";
  const isPoster = theme.layoutStyle === "poster";
  const isSchematic = theme.layoutStyle === "schematic";
  const isStationery = theme.layoutStyle === "stationery";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        position: "relative",
        transform: `translateY(${translateY}px) scale(${popScale})`,
        backgroundColor: isOverlay
          ? theme.isDark
            ? "rgba(11, 15, 25, 0.90)"
            : "rgba(250, 246, 238, 0.96)"
          : theme.surface,
        border: `${Math.max(2, theme.borderWidth)}px solid ${
          isOverlay ? theme.accent : theme.border
        }`,
        borderRadius: theme.radius,
        boxShadow: isPoster
          ? theme.cardShadow
          : "0 22px 54px rgba(0, 0, 0, 0.34)",
        padding: isOverlay ? "30px 36px" : "52px 50px",
        display: "flex",
        flexDirection: "column",
        gap: isOverlay ? 14 : 24,
        overflow: "hidden",
      }}
    >
      {/* Theme-specific top accent strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: isPoster ? 10 : 6,
          background:
            isStationery || isPoster
              ? theme.accent
              : `linear-gradient(90deg, ${theme.accent}, ${theme.highlightBg})`,
        }}
      />

      {/* Kicker row */}
      {(kicker || isSchematic || isPoster) && (
        <div
          dir="ltr"
          style={{
            unicodeBidi: "isolate",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: fonts.mono,
            fontSize: 22,
            fontWeight: 700,
            color: theme.accent,
            letterSpacing: 1.0,
            marginTop: 4,
          }}
        >
          <span>
            {kicker ??
              (isSchematic
                ? "[ HOOK // FRAME 00 ]"
                : isPoster
                  ? "01 — FEATURED"
                  : "")}
          </span>
          {isSchematic && (
            <span style={{ color: theme.muted, fontSize: 20 }}>9:16 SPEC</span>
          )}
        </div>
      )}

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: titleFontSize,
          fontWeight: 900,
          lineHeight: isRtl ? 1.26 : 1.1,
          color: theme.text,
          letterSpacing: isRtl ? 0 : -1.6,
        }}
      >
        {renderHighlightedTitle()}
      </div>

      {subtitle && (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: subtitleFontSize,
            fontWeight: 500,
            lineHeight: 1.44,
            color: theme.muted,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
