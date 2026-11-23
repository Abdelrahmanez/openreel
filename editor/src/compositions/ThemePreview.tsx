import React from "react";
import { AbsoluteFill } from "remotion";
import {
  Backdrop,
  CaptionBar,
  HookCard,
  TagBadge,
  getFontFamilies,
} from "../kit";
import { getTheme, type Lang, type ThemeId } from "../themes";

export type ThemePreviewProps = {
  themeId: ThemeId;
  title: string;
  subtitle: string;
  tag: string;
  handle: string;
  lang: Lang;
  accentOverride?: string;
};

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  themeId,
  title,
  subtitle,
  tag,
  handle,
  lang,
  accentOverride,
}) => {
  const theme = getTheme(themeId, accentOverride);
  const fonts = getFontFamilies(lang);
  const isRtl = lang === "ar";

  const words = title.trim().split(/\s+/);
  const highlightWord =
    words.length >= 2 ? words[words.length - 1] : undefined;

  const captionSample = isRtl
    ? "ده شكل الترجمة والكلام على الشاشة في التصميم ده"
    : "This is how live captions look in this theme";
  const captionHot = isRtl ? "التصميم" : "captions";

  const pipelineChips = isRtl
    ? ["01 فكرة", "02 سكريبت", "03 مونتاج"]
    : ["01 IDEA", "02 SCRIPT", "03 RENDER"];

  return (
    <AbsoluteFill>
      <Backdrop theme={theme} />

      <div
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          position: "absolute",
          top: 130,
          bottom: 400,
          left: 72,
          right: 72,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <TagBadge theme={theme} lang={lang} label={tag} secondary={handle} />

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <HookCard
            theme={theme}
            lang={lang}
            title={title}
            highlightWord={highlightWord}
            subtitle={subtitle}
            immediate
          />

          <div
            style={{
              backgroundColor: theme.surfaceElevated,
              border: `${theme.borderWidth}px solid ${theme.border}`,
              borderRadius: theme.radius,
              padding: "28px 34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {pipelineChips.map((chip, idx) => (
                <div
                  key={idx}
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 24,
                    fontWeight: 700,
                    padding: "10px 18px",
                    borderRadius: theme.radius === 0 ? 0 : 10,
                    backgroundColor:
                      idx === 2 ? theme.accent : theme.surface,
                    color: idx === 2 ? theme.accentText : theme.text,
                    border: `1.5px solid ${theme.border}`,
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {[theme.bg, theme.surface, theme.accent, theme.highlightBg].map(
                (hex, i) => (
                  <div
                    key={i}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: theme.radius === 0 ? 0 : "50%",
                      backgroundColor: hex,
                      border: `2px solid ${theme.text}`,
                    }}
                  />
                )
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: fonts.mono,
            fontSize: 24,
            fontWeight: 700,
            color: theme.muted,
          }}
        >
          <span>THEME: {theme.name.toUpperCase()}</span>
          <span style={{ color: theme.accent }}>{theme.id}</span>
        </div>
      </div>

      <CaptionBar
        theme={theme}
        lang={lang}
        staticText={captionSample}
        highlightWord={captionHot}
      />
    </AbsoluteFill>
  );
};
