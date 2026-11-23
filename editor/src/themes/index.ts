import { editorialDark } from "./editorialDark";
import { studioWarm } from "./studioWarm";
import { swissBold } from "./swissBold";
import { techBlueprint } from "./techBlueprint";
import type { ThemeId, ThemeSpec } from "./types";

export const THEMES: Record<ThemeId, ThemeSpec> = {
  "editorial-dark": editorialDark,
  "swiss-bold": swissBold,
  "studio-warm": studioWarm,
  "tech-blueprint": techBlueprint,
};

export const THEME_LIST: ThemeSpec[] = [
  editorialDark,
  swissBold,
  studioWarm,
  techBlueprint,
];

export function getTheme(id: ThemeId, accentOverride?: string): ThemeSpec {
  const base = THEMES[id] ?? editorialDark;
  if (!accentOverride) return base;
  return {
    ...base,
    accent: accentOverride,
    captionAccent: accentOverride,
  };
}

export type { BrandConfig, Lang, ThemeId, ThemeSpec } from "./types";
