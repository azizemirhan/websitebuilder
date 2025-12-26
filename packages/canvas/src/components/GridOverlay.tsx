/**
 * Grid Overlay - Canvas grid lines
 */

import React, { memo } from 'react';
import { useSettingsStore } from '@builder/core';

interface GridOverlayProps {
  width: number;
  height: number;
}

export const GridOverlay = memo(function GridOverlay({ width, height }: GridOverlayProps) {
  const showGrid = useSettingsStore((state) => state.showGrid);
  const gridSize = useSettingsStore((state) => state.gridSize);

  if (!showGrid) return null;

  const verticalLines = Math.ceil(width / gridSize);
  const horizontalLines = Math.ceil(height / gridSize);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="rgba(0, 0, 0, 0.06)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
});
