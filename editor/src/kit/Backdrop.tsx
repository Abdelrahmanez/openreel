import React from "react";
import { AbsoluteFill } from "remotion";
import type { ThemeSpec } from "../themes/types";

interface BackdropProps {
  theme: ThemeSpec;
}

export const Backdrop: React.FC<BackdropProps> = ({ theme }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        overflow: "hidden",
      }}
    >
      {theme.backdropPattern === "glow-grid" && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -220,
              right: -180,
              width: 820,
              height: 820,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.accent}28 0%, transparent 68%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -240,
              left: -180,
              width: 760,
              height: 760,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.highlightBg}1F 0%, transparent 68%)`,
            }}
          />
        </>
      )}

      {theme.backdropPattern === "swiss-frame" && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 42,
              border: `3px solid ${theme.border}`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 42,
              left: 42,
              right: 42,
              height: 16,
              backgroundColor: theme.accent,
            }}
          />
        </>
      )}

      {theme.backdropPattern === "warm-dots" && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(rgba(29,24,21,0.11) 1.6px, transparent 1.6px)",
              backgroundSize: "34px 34px",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -160,
              left: -140,
              width: 680,
              height: 680,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.accent}1A 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      {theme.backdropPattern === "blueprint" && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(56,189,248,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.10) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 44,
              border: "1.5px solid rgba(56,189,248,0.28)",
              borderRadius: 8,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -200,
              right: -120,
              width: 780,
              height: 780,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.accent}22 0%, transparent 70%)`,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
