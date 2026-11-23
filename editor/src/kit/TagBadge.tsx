import React from "react";
import type { Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

interface TagBadgeProps {
  theme: ThemeSpec;
  lang: Lang;
  label: string;
  secondary?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  theme,
  lang,
  label,
  secondary,
}) => {
  const fonts = getFontFamilies(lang);
  const isRtl = lang === "ar";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
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
          fontSize: 30,
          fontWeight: 700,
          padding: "12px 26px",
          borderRadius: theme.radius === 0 ? 0 : 999,
          border:
            theme.id === "swiss-bold" ? `3px solid ${theme.border}` : "none",
          letterSpacing: isRtl ? 0 : 0.4,
        }}
      >
        <span>{label}</span>
      </div>

      {secondary && (
        <div
          dir="ltr"
          style={{
            unicodeBidi: "isolate",
            fontFamily: fonts.mono,
            fontSize: 26,
            fontWeight: 600,
            color: theme.muted,
            padding: "10px 20px",
            borderRadius: theme.radius === 0 ? 0 : 999,
            border: `${Math.min(2, theme.borderWidth)}px solid ${theme.border}`,
            backgroundColor: theme.surface,
          }}
        >
          {secondary}
        </div>
      )}
    </div>
  );
};
