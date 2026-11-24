import React from "react";
import { AbsoluteFill } from "remotion";
import type { FontPreset, Lang, ThemeSpec } from "../themes/types";
import { Backdrop } from "./Backdrop";
import { TagBadge } from "./TagBadge";
import { getFontFamilies } from "./fonts";

interface CoverFrameProps {
  theme: ThemeSpec;
  lang: Lang;
  tag: string;
  handle: string;
  title: string;
  highlightWord?: string;
  subtitle?: string;
  fontPreset?: FontPreset;
}

export const CoverFrame: React.FC<CoverFrameProps> = ({
  theme,
  lang,
  tag,
  handle,
  title,
  highlightWord,
  subtitle,
  fontPreset,
}) => {
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";
  const isPoster = theme.layoutStyle === "poster";

  const renderTitle = () => {
    if (!highlightWord || !title.includes(highlightWord)) return title;
    const idx = title.indexOf(highlightWord);
    return (
      <>
        {title.slice(0, idx)}
        <span
          style={{
            backgroundColor: theme.highlightBg,
            color: theme.highlightText,
            padding: isRtl ? "2px 24px 10px" : "6px 22px",
            borderRadius: theme.radius === 0 ? 0 : 16,
            display: "inline-block",
            border: isPoster ? `3px solid ${theme.border}` : "none",
          }}
        >
          {highlightWord}
        </span>
        {title.slice(idx + highlightWord.length)}
      </>
    );
  };

  return (
    <AbsoluteFill>
      <Backdrop theme={theme} animate={false} />
      {/* Safe central 1080x1350 zone (top/bottom 285px margin for 3:4 profile grid crop) */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          position: "absolute",
          top: 310,
          bottom: 310,
          left: 72,
          right: 72,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <TagBadge
          theme={theme}
          lang={lang}
          label={tag}
          secondary={handle}
          fontPreset={fontPreset}
        />

        <div
          style={{
            position: "relative",
            backgroundColor: theme.surface,
            border: `${Math.max(3, theme.borderWidth)}px solid ${theme.border}`,
            borderRadius: theme.radius,
            boxShadow: theme.cardShadow,
            padding: "64px 54px",
            display: "flex",
            flexDirection: "column",
            gap: 28,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: isPoster ? 12 : 8,
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.highlightBg})`,
            }}
          />

          <div
            style={{
              fontFamily: fonts.display,
              fontSize: isRtl ? 90 : 94,
              fontWeight: 900,
              lineHeight: isRtl ? 1.24 : 1.08,
              color: theme.text,
              letterSpacing: isRtl ? 0 : -2,
              marginTop: 6,
            }}
          >
            {renderTitle()}
          </div>

          {subtitle && (
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 36,
                fontWeight: 600,
                color: theme.muted,
                lineHeight: 1.42,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          dir="ltr"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: fonts.mono,
            fontSize: 26,
            fontWeight: 700,
            color: theme.muted,
            borderTop: `1.5px solid ${theme.subtleBorder}`,
            paddingTop: 18,
          }}
        >
          <span>{theme.name.toUpperCase()}</span>
          <span style={{ color: theme.accent }}>OPENREEL • 9:16</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
