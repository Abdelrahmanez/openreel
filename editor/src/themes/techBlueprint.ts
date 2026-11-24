import type { ThemeSpec } from "./types";

export const techBlueprint: ThemeSpec = {
  id: "tech-blueprint",
  name: "Tech Blueprint",
  tagline: "Midnight schematic grid, cyan vectors & emerald proof",
  isDark: true,
  layoutStyle: "schematic",
  captionStyleDefault: "pill",
  bg: "#071224",
  bgGradient:
    "radial-gradient(circle at 50% 18%, rgba(56, 189, 248, 0.14), transparent 54%), radial-gradient(circle at 82% 84%, rgba(16, 185, 129, 0.14), transparent 46%)",
  surface: "#0B1B36",
  surfaceElevated: "#11274D",
  text: "#F0F9FF",
  muted: "#7DD3FC",
  accent: "#10B981",
  accentSecondary: "#38BDF8",
  accentText: "#042319",
  highlightBg: "#FBBF24",
  highlightText: "#071224",
  border: "rgba(56, 189, 248, 0.36)",
  subtleBorder: "rgba(56, 189, 248, 0.18)",
  borderWidth: 2,
  radius: 12,
  cardShadow:
    "0 0 0 1px rgba(56, 189, 248, 0.22), 0 24px 48px rgba(2, 8, 23, 0.65)",
  backdropPattern: "blueprint",
  captionBg: "rgba(7, 18, 36, 0.94)",
  captionText: "#F0F9FF",
  captionAccent: "#10B981",
};
