import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { FontPreset, Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

interface QuoteCardProps {
  theme: ThemeSpec;
  lang: Lang;
  quote: string;
  highlightWord?: string;
  author?: string;
  source?: string;
  fontPreset?: FontPreset;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  theme,
  lang,
  quote,
  highlightWord,
  author,
  source,
  fontPreset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";

  const prog = spring({ frame, fps, config: { damping: 17, stiffness: 160 } });
  const translateY = interpolate(prog, [0, 1], [32, 0]);

  const renderQuote = () => {
    if (!highlightWord || !quote.includes(highlightWord)) return quote;
    const idx = quote.indexOf(highlightWord);
    return (
      <>
        {quote.slice(0, idx)}
        <span
          style={{
            backgroundColor: theme.highlightBg,
            color: theme.highlightText,
            padding: isRtl ? "2px 18px 8px" : "2px 16px",
            borderRadius: theme.radius === 0 ? 0 : 12,
            display: "inline-block",
          }}
        >
          {highlightWord}
        </span>
        {quote.slice(idx + highlightWord.length)}
      </>
    );
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        opacity: prog,
        transform: `translateY(${translateY}px)`,
        backgroundColor: theme.surface,
        border: `${theme.borderWidth}px solid ${theme.border}`,
        borderRadius: theme.radius,
        boxShadow: theme.cardShadow,
        padding: "56px 52px",
        display: "flex",
        flexDirection: "column",
        gap: 26,
      }}
    >
      <div
        dir="ltr"
        style={{
          fontFamily: fonts.display,
          fontSize: 108,
          fontWeight: 900,
          lineHeight: 0.7,
          color: theme.accent,
          alignSelf: isRtl ? "flex-end" : "flex-start",
        }}
      >
        “
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: isRtl ? 56 : 58,
          fontWeight: 800,
          lineHeight: isRtl ? 1.38 : 1.24,
          color: theme.text,
        }}
      >
        {renderQuote()}
      </div>

      {(author || source) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${theme.subtleBorder}`,
            paddingTop: 20,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {author && (
            <span
              style={{
                fontFamily: fonts.body,
                fontSize: 30,
                fontWeight: 700,
                color: theme.text,
              }}
            >
              — {author}
            </span>
          )}
          {source && (
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: 24,
                fontWeight: 600,
                color: theme.muted,
              }}
            >
              {source}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
