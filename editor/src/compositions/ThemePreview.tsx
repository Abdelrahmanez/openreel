import React from "react";
import { AbsoluteFill } from "remotion";
import {
  Backdrop,
  CaptionBar,
  HookCard,
  TagBadge,
  getFontFamilies,
} from "../kit";
import { getTheme, type FontPreset, type Lang, type ThemeId } from "../themes";

export type ThemePreviewProps = {
  themeId: ThemeId;
  title: string;
  subtitle: string;
  tag: string;
  handle: string;
  lang: Lang;
  accentOverride?: string;
  highlightOverride?: string;
  fontPreset?: FontPreset;
};

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  themeId,
  title,
  subtitle,
  tag,
  handle,
  lang,
  accentOverride,
  highlightOverride,
  fontPreset,
}) => {
  const theme = getTheme(themeId, {
    accentColor: accentOverride,
    highlightColor: highlightOverride,
  });
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";

  const words = title.trim().split(/\s+/);
  const highlightWord =
    words.length >= 2 ? words[words.length - 1] : undefined;

  const captionSample = isRtl
    ? "ده شكل الكابشن الحية وألوان الهوية بتاعتك"
    : "Live karaoke captions locked to your palette";
  const captionHot = isRtl ? "الهوية" : "karaoke";

  const pipelineChips = isRtl
    ? ["01 فكرة", "02 سكريبت", "03 مونتاج"]
    : ["01 IDEA", "02 SCRIPT", "03 RENDER"];

  const statNumber = theme.layoutStyle === "schematic" ? "30 FPS" : "3.4x";
  const statLabel = isRtl
    ? theme.layoutStyle === "poster"
      ? "معدل الحفظ والمشاركة"
      : "توفير وقت المونتاج"
    : theme.layoutStyle === "schematic"
      ? "1080×1920 H.264 SPEC"
      : "HIGHER SAVE RATE";

  return (
    <AbsoluteFill>
      <Backdrop theme={theme} animate={false} />

      <div
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          position: "absolute",
          top: 120,
          bottom: 440,
          left: 68,
          right: 68,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {/* Top bar: TagBadge + optional theme layout header strip */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <TagBadge
            theme={theme}
            lang={lang}
            label={tag}
            secondary={handle}
            fontPreset={fontPreset}
          />

          {theme.layoutStyle === "schematic" && (
            <div
              dir="ltr"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: fonts.mono,
                fontSize: 22,
                color: theme.muted,
                borderTop: `1px solid ${theme.border}`,
                borderBottom: `1px solid ${theme.border}`,
                padding: "10px 4px",
              }}
            >
              <span>SYS: OPENREEL_V2</span>
              <span style={{ color: theme.accent }}>● READY</span>
              <span>RTL + LTR</span>
            </div>
          )}

          {theme.layoutStyle === "poster" && (
            <div
              dir="ltr"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `3px solid ${theme.border}`,
                paddingBottom: 10,
                fontFamily: fonts.mono,
                fontSize: 22,
                fontWeight: 700,
                color: theme.text,
              }}
            >
              <span>SWISS POSTER GRID</span>
              <span style={{ color: theme.accent }}>ISSUE NO. 01</span>
            </div>
          )}
        </div>

        {/* Middle Hero Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <HookCard
            theme={theme}
            lang={lang}
            title={title}
            highlightWord={highlightWord}
            subtitle={subtitle}
            immediate
            fontPreset={fontPreset}
          />

          {/* Compact proof & palette card tailored to theme */}
          <div
            style={{
              backgroundColor: theme.surfaceElevated,
              border: `${theme.borderWidth}px solid ${theme.border}`,
              borderRadius: theme.radius,
              boxShadow:
                theme.layoutStyle === "poster"
                  ? `6px 6px 0px ${theme.border}`
                  : "none",
              padding: "26px 30px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div
                dir="ltr"
                style={{
                  unicodeBidi: "isolate",
                  fontFamily: fonts.display,
                  fontSize: 48,
                  fontWeight: 900,
                  color: theme.accent,
                }}
              >
                {statNumber}
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 27,
                  fontWeight: 700,
                  color: theme.text,
                }}
              >
                {statLabel}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                borderTop: `1.5px solid ${theme.subtleBorder}`,
                paddingTop: 18,
              }}
            >
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {pipelineChips.map((chip, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 22,
                      fontWeight: 700,
                      padding: "9px 16px",
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

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {[
                  theme.bg,
                  theme.surface,
                  theme.accent,
                  theme.highlightBg,
                ].map((hex, i) => (
                  <div
                    key={i}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: theme.radius === 0 ? 0 : "50%",
                      backgroundColor: hex,
                      border: `2px solid ${theme.text}`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Spec Line */}
        <div
          dir="ltr"
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
          <span>THEME // {theme.name.toUpperCase()}</span>
          <span style={{ color: theme.accent }}>{theme.id}</span>
        </div>
      </div>

      <CaptionBar
        theme={theme}
        lang={lang}
        staticText={captionSample}
        highlightWord={captionHot}
        activeWordIndex={isRtl ? 2 : 1}
        fontPreset={fontPreset}
      />
    </AbsoluteFill>
  );
};
