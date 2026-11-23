import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Lang, ThemeSpec } from "../themes/types";
import { getFontFamilies } from "./fonts";

export interface CaptionWord {
  text: string;
  startMs: number;
  endMs: number;
  highlight?: boolean;
}

export interface CaptionLine {
  seg: number;
  text: string;
  startMs: number;
  endMs: number;
  highlight?: string[];
}

interface CaptionBarProps {
  theme: ThemeSpec;
  lang: Lang;
  lines?: CaptionLine[];
  staticText?: string;
  highlightWord?: string;
}

export const CaptionBar: React.FC<CaptionBarProps> = ({
  theme,
  lang,
  lines,
  staticText,
  highlightWord,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang);
  const isRtl = lang === "ar";
  const currentMs = (frame / fps) * 1000;

  let activeText = staticText ?? "";
  let highlights: string[] = highlightWord ? [highlightWord] : [];

  if (lines && lines.length > 0) {
    const match = lines.find(
      (l) => currentMs >= l.startMs && currentMs <= l.endMs
    );
    if (!match) return null;
    activeText = match.text;
    highlights = match.highlight ?? [];
  }

  if (!activeText) return null;

  const tokens = activeText.split(" ");

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        position: "absolute",
        bottom: 220,
        left: 72,
        right: 72,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: theme.captionBg,
          color: theme.captionText,
          border: `2px solid ${theme.border}`,
          borderRadius: theme.radius === 0 ? 0 : 18,
          padding: "20px 34px",
          fontFamily: fonts.body,
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.38,
          textAlign: "center",
          boxShadow: "0 12px 32px rgba(0,0,0,0.32)",
        }}
      >
        {tokens.map((tok, i) => {
          const clean = tok.replace(/[.,!?؟،:"'«»()]/g, "").toLowerCase();
          const isHot = highlights.some((h) => h.toLowerCase() === clean);
          const isBidiToken = /^@|^\d+%$/.test(tok);
          return (
            <span
              key={i}
              dir={isBidiToken ? "ltr" : undefined}
              style={{
                unicodeBidi: isBidiToken ? "isolate" : undefined,
                display: isBidiToken ? "inline-block" : undefined,
                color: isHot ? theme.captionAccent : theme.captionText,
              }}
            >
              {tok}
              {i < tokens.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
