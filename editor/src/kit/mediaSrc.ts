import { staticFile } from "remotion";

export function resolveMediaSrc(src: string): string {
  if (/^(https?:|data:|blob:)/i.test(src)) {
    return src;
  }
  const clean = src.replace(/^\.?\//, "");
  return staticFile(clean);
}

export function isVideoPath(src: string): boolean {
  return /\.(mp4|mov|webm|mkv|m4v)(\?.*)?$/i.test(src);
}
