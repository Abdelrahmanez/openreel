import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { ThemeSpec } from "../themes/types";

interface BackdropProps {
  theme: ThemeSpec;
  animate?: boolean;
}

export const Backdrop: React.FC<BackdropProps> = ({ theme, animate = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = animate ? frame / Math.max(1, fps) : 0;
  const driftX = Math.sin(t * 0.6) * 24;
  const driftY = Math.cos(t * 0.45) * 18;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        backgroundImage: theme.bgGradient,
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
              top: -220 + driftY,
              right: -180 + driftX,
              width: 860,
              height: 860,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.accent}2A 0%, transparent 66%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -240 - driftY,
              left: -180 - driftX,
              width: 780,
              height: 780,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.highlightBg}20 0%, transparent 68%)`,
            }}
          />
        </>
      )}

      {theme.backdropPattern === "swiss-frame" && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(14,14,16,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(14,14,16,0.035) 1px, transparent 1px)",
              backgroundSize: "90px 90px",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 38,
              border: `3px solid ${theme.border}`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 38,
              left: 38,
              right: 38,
              height: 18,
              backgroundColor: theme.accent,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 38,
              left: 38,
              right: 38,
              height: 8,
              backgroundColor: theme.border,
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
                "radial-gradient(rgba(24,20,17,0.13) 1.7px, transparent 1.7px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 34,
              border: `2.5px solid rgba(24,20,17,0.22)`,
              borderRadius: 16,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -160 + driftY,
              left: -140 + driftX,
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
                "linear-gradient(rgba(56,189,248,0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.11) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 40,
              border: "1.5px solid rgba(56,189,248,0.28)",
              borderRadius: 8,
              pointerEvents: "none",
            }}
          />
          {/* Corner registration brackets */}
          <div
            style={{
              position: "absolute",
              top: 32,
              left: 32,
              width: 34,
              height: 34,
              borderTop: `3px solid ${theme.accent}`,
              borderLeft: `3px solid ${theme.accent}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 32,
              right: 32,
              width: 34,
              height: 34,
              borderTop: `3px solid ${theme.accent}`,
              borderRight: `3px solid ${theme.accent}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 32,
              left: 32,
              width: 34,
              height: 34,
              borderBottom: `3px solid ${theme.accent}`,
              borderLeft: `3px solid ${theme.accent}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 32,
              right: 32,
              width: 34,
              height: 34,
              borderBottom: `3px solid ${theme.accent}`,
              borderRight: `3px solid ${theme.accent}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -200 - driftY,
              right: -120 - driftX,
              width: 780,
              height: 780,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.accent}24 0%, transparent 70%)`,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
