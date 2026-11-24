import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { ThemeSpec } from "../themes/types";

interface ProgressBarProps {
  theme: ThemeSpec;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pct = Math.max(
    0,
    Math.min(100, (frame / Math.max(1, durationInFrames - 1)) * 100)
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 7,
        backgroundColor: theme.subtleBorder,
        zIndex: 60,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${theme.accent}, ${theme.highlightBg})`,
        }}
      />
    </div>
  );
};
