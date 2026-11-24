import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionStyle, FontPreset, Lang, ThemeSpec } from "../themes/types";
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
  words?: CaptionWord[];
  staticText?: string;
  highlightWord?: string;
  captionStyle?: CaptionStyle;
  scale?: number;
  bottom?: number;
  activeWordIndex?: number;
  fontPreset?: FontPreset;
}

function isBidiIsolatedToken(tok: string): boolean {
  const cleaned = tok.replace(/[.,!?؟،:"'«»()\[\]]/g, "");
  if (!cleaned) return false;
  return /^[A-Za-z0-9@#%._/+:-]+$/.test(cleaned);
}

function normalizeClean(tok: string): string {
  return tok.replace(/[.,!?؟،:"'«»()\[\]]/g, "").toLowerCase();
}

export const CaptionBar: React.FC<CaptionBarProps> = ({
  theme,
  lang,
  lines,
  words,
  staticText,
  highlightWord,
  captionStyle,
  scale = 1,
  bottom = 220,
  activeWordIndex,
  fontPreset,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fonts = getFontFamilies(lang, fontPreset);
  const isRtl = lang === "ar";
  const currentMs = (frame / fps) * 1000;

  const effectiveStyle: CaptionStyle = captionStyle ?? theme.captionStyleDefault;
  const safeScale = Math.max(0.75, Math.min(1.5, scale));
  const fontSize = Math.round(44 * safeScale);

  // Resolve active caption tokens & whether each token is actively spoken right now
  let tokens: { text: string; isActive: boolean; isHot: boolean }[] = [];

  if (lines && lines.length > 0) {
    const matchLine = lines.find(
      (l) => currentMs >= l.startMs && currentMs <= l.endMs
    );
    if (!matchLine) return null;

    const lineWordsRaw =
      words && words.length > 0
        ? words.filter(
            (w) =>
              w.endMs > matchLine.startMs - 40 &&
              w.startMs < matchLine.endMs + 40
          )
        : [];
    const lineWordsMatchText =
      lineWordsRaw.length > 0 &&
      lineWordsRaw.some((w) =>
        matchLine.text.toLowerCase().includes(normalizeClean(w.text))
      );
    const lineWords = lineWordsMatchText ? lineWordsRaw : [];

    const hlSet = new Set(
      (matchLine.highlight ?? []).map((h) => normalizeClean(h))
    );

    if (lineWords.length > 0) {
      tokens = lineWords.map((w) => ({
        text: w.text,
        isActive: currentMs >= w.startMs && currentMs <= w.endMs,
        isHot: Boolean(w.highlight) || hlSet.has(normalizeClean(w.text)),
      }));
    } else {
      const split = matchLine.text.split(/\s+/).filter(Boolean);
      const span = Math.max(200, matchLine.endMs - matchLine.startMs);
      const progress = Math.max(0, Math.min(0.999, (currentMs - matchLine.startMs) / span));
      const approxIdx = Math.floor(progress * split.length);
      tokens = split.map((tok, i) => ({
        text: tok,
        isActive: effectiveStyle === "karaoke" && i === approxIdx,
        isHot: hlSet.has(normalizeClean(tok)),
      }));
    }
  } else if (words && words.length > 0) {
    const activeIdx = words.findIndex(
      (w) => currentMs >= w.startMs && currentMs <= w.endMs
    );
    if (activeIdx === -1) return null;
    const chunkStart = Math.floor(activeIdx / 5) * 5;
    const slice = words.slice(chunkStart, chunkStart + 5);
    tokens = slice.map((w, i) => ({
      text: w.text,
      isActive: chunkStart + i === activeIdx,
      isHot: Boolean(w.highlight),
    }));
  } else if (staticText) {
    const split = staticText.split(/\s+/).filter(Boolean);
    const hlClean = highlightWord ? normalizeClean(highlightWord) : "";
    tokens = split.map((tok, i) => ({
      text: tok,
      isActive: activeWordIndex !== undefined ? i === activeWordIndex : false,
      isHot: Boolean(hlClean) && normalizeClean(tok) === hlClean,
    }));
  } else {
    return null;
  }

  if (tokens.length === 0) return null;

  const isMinimal = effectiveStyle === "minimal";
  const isPill = effectiveStyle === "pill";
  const isKaraoke = effectiveStyle === "karaoke";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        position: "absolute",
        bottom,
        left: 64,
        right: 64,
        display: "flex",
        justifyContent: "center",
        zIndex: 40,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: isMinimal ? "transparent" : theme.captionBg,
          color: theme.captionText,
          border: isMinimal
            ? "none"
            : isPill
              ? `2.5px solid ${theme.accent}`
              : `2px solid ${theme.border}`,
          borderRadius:
            theme.radius === 0 ? 0 : isPill ? 999 : 20,
          padding: isMinimal
            ? "8px 16px"
            : isPill
              ? "18px 38px"
              : "20px 32px",
          fontFamily: fonts.body,
          fontSize,
          fontWeight: 800,
          lineHeight: 1.4,
          textAlign: "center",
          boxShadow: isMinimal
            ? "none"
            : theme.layoutStyle === "poster"
              ? `6px 6px 0px ${theme.accent}`
              : "0 14px 36px rgba(0, 0, 0, 0.38)",
          textShadow: isMinimal
            ? "0 4px 16px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.95)"
            : "none",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "4px 12px",
        }}
      >
        {tokens.map((tok, i) => {
          const isolate = isBidiIsolatedToken(tok.text);
          const showKaraokePill = isKaraoke && tok.isActive;
          return (
            <span
              key={i}
              dir={isolate ? "ltr" : undefined}
              style={{
                unicodeBidi: isolate ? "isolate" : undefined,
                display: "inline-block",
                padding: showKaraokePill ? "2px 12px" : "0 2px",
                borderRadius: theme.radius === 0 ? 0 : 10,
                backgroundColor: showKaraokePill
                  ? theme.captionAccent
                  : "transparent",
                color: showKaraokePill
                  ? theme.accentText
                  : tok.isHot || tok.isActive
                    ? theme.captionAccent
                    : theme.captionText,
                transform: tok.isActive ? "scale(1.06)" : "scale(1)",
              }}
            >
              {tok.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
