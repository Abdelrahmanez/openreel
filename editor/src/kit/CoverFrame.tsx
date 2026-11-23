import React from "react";
import { AbsoluteFill } from "remotion";
import type { Lang, ThemeSpec } from "../themes/types";
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
}

export const CoverFrame: React.FC<CoverFrameProps> = ({
  theme,
  lang,
  tag,
  handle,
  title,
  highlightWord,
  subtitle,
}) => {
  const fonts = getFontFamilies(lang);
  const isRtl = lang === "ar";

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
            padding: "6px 22px",
            borderRadius: theme.radius === 0 ? 0 : 16,
            display: "inline-block",
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
      <Backdrop theme={theme} />
      {/* Safe central 1080x1350 zone (top/bottom 285px margin for 3:4 profile grid crop) */}
      <div
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          position: "absolute",
          top: 310,
          bottom: 310,
          left: 76,
          right: 76,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <TagBadge theme={theme} lang={lang} label={tag} secondary={handle} />

        <div
          style={{
            backgroundColor: theme.surface,
            border: `${Math.max(3, theme.borderWidth)}px solid ${theme.border}`,
            borderRadius: theme.radius,
            boxShadow: theme.cardShadow,
            padding: "68px 56px",
            display: "flex",
            flexDirection: "column",
            gap: 30,
          }}
        >
          <div
            style={{
              fontFamily: fonts.display,
              fontSize: isRtl ? 96 : 98,
              fontWeight: 900,
              lineHeight: isRtl ? 1.24 : 1.08,
              color: theme.text,
              letterSpacing: isRtl ? 0 : -2,
            }}
          >
            {renderTitle()}
          </div>

          {subtitle && (
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 38,
                fontWeight: 600,
                color: theme.muted,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: fonts.mono,
            fontSize: 28,
            fontWeight: 600,
            color: theme.muted,
          }}
        >
          <span>{theme.name.toUpperCase()}</span>
          <span style={{ color: theme.accent }}>OPENREEL • 9:16</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
