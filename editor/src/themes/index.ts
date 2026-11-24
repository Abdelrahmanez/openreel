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

export interface ThemeColorOverrides {
  accentColor?: string;
  highlightColor?: string;
  bgColor?: string;
}

export function getTheme(
  id: ThemeId,
  override?: string | ThemeColorOverrides
): ThemeSpec {
  const base = THEMES[id] ?? editorialDark;
  if (!override) return base;

  const opts: ThemeColorOverrides =
    typeof override === "string" ? { accentColor: override } : override;

  return {
    ...base,
    ...(opts.bgColor ? { bg: opts.bgColor } : {}),
    ...(opts.accentColor
      ? { accent: opts.accentColor, captionAccent: opts.accentColor }
      : {}),
    ...(opts.highlightColor ? { highlightBg: opts.highlightColor } : {}),
  };
}

export type {
  BrandConfig,
  CaptionStyle,
  FontPreset,
  Lang,
  ReelOverrides,
  ThemeId,
  ThemeSpec,
  TransitionKind,
} from "./types";
