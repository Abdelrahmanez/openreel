import { loadFont as loadAlexandria } from "@remotion/google-fonts/Alexandria";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadIbmPlexArabic } from "@remotion/google-fonts/IBMPlexSansArabic";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import type { FontPreset, Lang } from "../themes/types";

const alexandria = loadAlexandria("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["arabic", "latin"],
});

const ibmPlexArabic = loadIbmPlexArabic("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
});

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

export function getFontFamilies(lang: Lang, preset: FontPreset = "default") {
  if (lang === "ar") {
    if (preset === "cairo") {
      return {
        display: `${cairo.fontFamily}, ${alexandria.fontFamily}, sans-serif`,
        body: `${cairo.fontFamily}, ${ibmPlexArabic.fontFamily}, sans-serif`,
        mono: `${jetbrainsMono.fontFamily}, ${alexandria.fontFamily}, monospace`,
      };
    }
    return {
      display: `${alexandria.fontFamily}, ${cairo.fontFamily}, sans-serif`,
      body: `${ibmPlexArabic.fontFamily}, ${alexandria.fontFamily}, sans-serif`,
      mono: `${jetbrainsMono.fontFamily}, ${alexandria.fontFamily}, monospace`,
    };
  }
  return {
    display: `${spaceGrotesk.fontFamily}, ${alexandria.fontFamily}, sans-serif`,
    body: `${inter.fontFamily}, ${ibmPlexArabic.fontFamily}, sans-serif`,
    mono: `${jetbrainsMono.fontFamily}, monospace`,
  };
}
