import React from "react";
import { CoverFrame } from "../kit";
import { getTheme, type FontPreset, type Lang, type ThemeId } from "../themes";

export type CoverProps = {
  themeId: ThemeId;
  lang: Lang;
  tag: string;
  handle: string;
  title: string;
  highlightWord?: string;
  subtitle?: string;
  accentOverride?: string;
  highlightOverride?: string;
  fontPreset?: FontPreset;
};

export const CoverComposition: React.FC<CoverProps> = ({
  themeId,
  lang,
  tag,
  handle,
  title,
  highlightWord,
  subtitle,
  accentOverride,
  highlightOverride,
  fontPreset,
}) => {
  const theme = getTheme(themeId, {
    accentColor: accentOverride,
    highlightColor: highlightOverride,
  });
  return (
    <CoverFrame
      theme={theme}
      lang={lang}
      tag={tag}
      handle={handle}
      title={title}
      highlightWord={highlightWord}
      subtitle={subtitle}
      fontPreset={fontPreset}
    />
  );
};
