export type ThemeId =
  | "editorial-dark"
  | "swiss-bold"
  | "studio-warm"
  | "tech-blueprint";

export type Lang = "en" | "ar";

export type FontPreset = "default" | "cairo" | "editorial";

export type CaptionStyle = "box" | "karaoke" | "pill" | "minimal";

export type TransitionKind = "cut" | "fade" | "slide" | "wipe";

export interface ReelOverrides {
  hookScale?: number;
  captionScale?: number;
  captionBottom?: number;
  captionStyle?: CaptionStyle;
  accentColor?: string;
  highlightColor?: string;
  bgColor?: string;
  showProgressBar?: boolean;
  showTagBadge?: boolean;
  sfxEnabled?: boolean;
  sfxVolume?: number;
  transition?: TransitionKind;
  transitionFrames?: number;
}

export interface ThemeSpec {
  id: ThemeId;
  name: string;
  tagline: string;
  isDark: boolean;
  layoutStyle: "editorial" | "poster" | "stationery" | "schematic";
  captionStyleDefault: CaptionStyle;
  bg: string;
  bgGradient: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  muted: string;
  accent: string;
  accentSecondary: string;
  accentText: string;
  highlightBg: string;
  highlightText: string;
  border: string;
  subtleBorder: string;
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
  highlightOverride?: string;
  fontPreset?: FontPreset;
  defaults?: ReelOverrides;
}
