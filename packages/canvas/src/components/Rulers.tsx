/**
 * Rulers - Pixel rulers on canvas edges
 */

import React, { memo } from 'react';
import { useSettingsStore } from '@builder/core';

interface RulersProps {
  width: number;
  height: number;
}

const RULER_SIZE = 20;
const TICK_SPACING = 50;

export const Rulers = memo(function Rulers({ width, height }: RulersProps) {
  const showRulers = useSettingsStore((state) => state.showRulers);
  const zoom = useSettingsStore((state) => state.zoom);

  if (!showRulers) return null;

  const adjustedTickSpacing = TICK_SPACING / zoom;
  const horizontalTicks = Math.ceil(width / adjustedTickSpacing);
  const verticalTicks = Math.ceil(height / adjustedTickSpacing);

  return (
    <>
      {/* Horizontal Ruler (Top) */}
      <div
        style={{
          position: 'absolute',
          top: -RULER_SIZE,
          left: 0,
          width,
          height: RULER_SIZE,
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          overflow: 'hidden',
          fontSize: 9,
          color: '#6b7280',
          userSelect: 'none',
        }}
      >
        {Array.from({ length: horizontalTicks }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i * TICK_SPACING,
              top: 0,
              height: RULER_SIZE,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              paddingLeft: 2,
            }}
          >
            <span>{Math.round(i * TICK_SPACING)}</span>
            <div
              style={{
                width: 1,
                flex: 1,
                backgroundColor: '#d1d5db',
              }}
            />
          </div>
        ))}
      </div>

      {/* Vertical Ruler (Left) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: -RULER_SIZE,
          width: RULER_SIZE,
          height,
          backgroundColor: '#f9fafb',
          borderRight: '1px solid #e5e7eb',
          overflow: 'hidden',
          fontSize: 9,
          color: '#6b7280',
          userSelect: 'none',
        }}
      >
        {Array.from({ length: verticalTicks }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: i * TICK_SPACING,
              left: 0,
              width: RULER_SIZE,
              display: 'flex',
              alignItems: 'flex-start',
              paddingTop: 2,
            }}
          >
            <span
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }}
            >
              {Math.round(i * TICK_SPACING)}
            </span>
            <div
              style={{
                height: 1,
                flex: 1,
                backgroundColor: '#d1d5db',
              }}
            />
          </div>
        ))}
      </div>

      {/* Corner */}
      <div
        style={{
          position: 'absolute',
          top: -RULER_SIZE,
          left: -RULER_SIZE,
          width: RULER_SIZE,
          height: RULER_SIZE,
          backgroundColor: '#f9fafb',
          borderRight: '1px solid #e5e7eb',
          borderBottom: '1px solid #e5e7eb',
        }}
      />
    </>
  );
});
