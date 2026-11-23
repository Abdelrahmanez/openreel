import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import type { Lang } from "../themes/types";

const cairo = loadCairo("normal", {
  weights: ["400", "600", "700", "800", "900"],
  subsets: ["arabic", "latin"],
});

const spaceGrotesk = loadSpaceGrotesk("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const jetbrainsMono = loadJetBrainsMono("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

export function getFontFamilies(lang: Lang) {
  if (lang === "ar") {
    return {
      display: `${cairo.fontFamily}, sans-serif`,
      body: `${cairo.fontFamily}, sans-serif`,
      mono: `${jetbrainsMono.fontFamily}, monospace`,
    };
  }
  return {
    display: `${spaceGrotesk.fontFamily}, ${cairo.fontFamily}, sans-serif`,
    body: `${inter.fontFamily}, ${cairo.fontFamily}, sans-serif`,
    mono: `${jetbrainsMono.fontFamily}, monospace`,
  };
}
