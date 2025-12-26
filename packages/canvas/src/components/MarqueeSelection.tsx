/**
 * Selection Box - Marquee selection rectangle
 */

import React, { memo } from 'react';

interface MarqueeSelectionProps {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const MarqueeSelection = memo(function MarqueeSelection({
  startX,
  startY,
  currentX,
  currentY,
}: MarqueeSelectionProps) {
  const left = Math.min(startX, currentX);
  const top = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  if (width < 5 && height < 5) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px dashed #3b82f6',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
});
