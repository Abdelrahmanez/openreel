import React from "react";
import { CoverFrame } from "../kit";
import { getTheme, type Lang, type ThemeId } from "../themes";

export type CoverProps = {
  themeId: ThemeId;
  lang: Lang;
  tag: string;
  handle: string;
  title: string;
  highlightWord?: string;
  subtitle?: string;
  accentOverride?: string;
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
}) => {
  const theme = getTheme(themeId, accentOverride);
  return (
    <CoverFrame
      theme={theme}
      lang={lang}
      tag={tag}
      handle={handle}
      title={title}
      highlightWord={highlightWord}
      subtitle={subtitle}
    />
  );
};
