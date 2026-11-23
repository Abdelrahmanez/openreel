export type ThemeId =
  | "editorial-dark"
  | "swiss-bold"
  | "studio-warm"
  | "tech-blueprint";

export type Lang = "en" | "ar";

export interface ThemeSpec {
  id: ThemeId;
  name: string;
  tagline: string;
  isDark: boolean;
  bg: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  highlightBg: string;
  highlightText: string;
  border: string;
  borderWidth: number;
  radius: number;
  cardShadow: string;
  backdropPattern: "glow-grid" | "swiss-frame" | "warm-dots" | "blueprint";
  captionBg: string;
  captionText: string;
  captionAccent: string;
}

export interface BrandConfig {
  themeId: ThemeId;
  lang: Lang;
  handle: string;
  nicheTag: string;
  accentOverride?: string;
}
