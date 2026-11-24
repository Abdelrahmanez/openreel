import React from "react";
import type { FontPreset, Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

interface TagBadgeProps {
  theme: ThemeSpec;
  lang: Lang;
  label: string;
  secondary?: string;
  fontPreset?: FontPreset;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  theme,
  lang,
  label,
  secondary,
  fontPreset,
}) => {
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          backgroundColor: theme.accent,
          color: theme.accentText,
          fontFamily: fonts.display,
          fontSize: 28,
          fontWeight: 800,
          padding: "11px 24px",
          borderRadius: theme.radius === 0 ? 0 : 999,
          border:
            theme.layoutStyle === "poster" || theme.layoutStyle === "stationery"
              ? `2.5px solid ${theme.border}`
              : "none",
          boxShadow:
            theme.layoutStyle === "poster" ? `4px 4px 0px ${theme.border}` : "none",
          letterSpacing: isRtl ? 0 : 0.4,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: theme.radius === 0 ? 0 : "50%",
            backgroundColor: theme.accentText,
            opacity: 0.75,
          }}
        />
        <span>{label}</span>
      </div>

      {secondary && (
        <div
          dir="ltr"
          style={{
            unicodeBidi: "isolate",
            fontFamily: fonts.mono,
            fontSize: 25,
            fontWeight: 600,
            color: theme.isDark ? theme.text : theme.muted,
            padding: "10px 20px",
            borderRadius: theme.radius === 0 ? 0 : 999,
            border: `${Math.min(2.5, theme.borderWidth)}px solid ${theme.border}`,
            backgroundColor: theme.surface,
            boxShadow:
              theme.layoutStyle === "poster"
                ? `4px 4px 0px ${theme.border}`
                : "none",
          }}
        >
          {secondary}
        </div>
      )}
    </div>
  );
};
