import React, { memo, useRef, useEffect, useMemo } from 'react';
import { useThemeStore, themeColors } from '@builder/core';

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  scale?: number;
  scrollOffset?: number; // How much the content is scrolled
  length?: number; // Total length of the ruler (usually matches container scrollHeight/scrollWidth or just window size)
  offset?: number; // Start offset if needed (e.g. for page padding)
}

export const Ruler = memo(function Ruler({
  orientation,
  scale = 1,
  scrollOffset = 0,
  length = 20000, 
  offset = 0,
}: RulerProps) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  const thickness = 20;
  const majorTick = 100;
  const mediumTick = 50;
  const minorTick = 10;
  const labelOffset = 2;

  // Render svg content
  const ticks = useMemo(() => {
    const items = [];
    // We render a large enough range. Optimally we would only render what's visible, 
    // but for simplicity and performance of React diffing, we might just render a good chunk 
    // or use a windowing approach if it gets too heavy. 
    // For now, let's assume 'length' is restricted or we rely on browser SVG optimization.
    // Actually, generating 20000px worth of ticks is too much DOM.
    // We should only render visible range + buffer if possible, OR just use a pattern.
    // But patterns don't support numbering easily.
    
    // Better approach: Responsive rendering based on scrollOffset?
    // Let's rely on standard large width for now but keep it reasonable. 
    // If the user scrolls far, we might need virtualizing, but let's stick to a reasonable max size or relative view.
    
    // Actually, simplicity: Render ticks for the visible area + buffer?
    // The component receives `scrollOffset` but usually that's used to transform the view, 
    // not necessarily re-render the ticks unless we virtualize.
    // EditorLayout will pass scroll position.
    
    // Let's look at `EditorLayout`: The ruller should probably be sticky?
    // Or fixed, and we translate the inner group?
    
    return null; // Calculated in render
  }, [length, scale]);

  // Calculate rendering parameters
  const step = minorTick * scale;
  const majorStep = majorTick * scale;
  
  // Basic range to render to avoid thousands of DOM nodes
  // Convert scrollOffset (pixels) to ruler units
  const start = Math.max(0, (scrollOffset - 500) / scale);
  const visibleUnits = 3500 / scale; 
  const end = start + visibleUnits;

  // Round start to nearest majorTick to avoid jitter
  const roundedStart = Math.floor(start / majorTick) * majorTick;

  const tickElements = [];
  
  for (let i = roundedStart; i < end; i += minorTick) {
    const pos = (i * scale); // Position in pixels
    const displayPos = pos - scrollOffset; // Shift by scroll offset
    
    // Safety check for render bounds
    if (displayPos < -50 || displayPos > 3500) continue;

    const isMajor = i % majorTick === 0;
    const isMedium = i % mediumTick === 0 && !isMajor;
    
    const tickLength = isMajor ? thickness : isMedium ? thickness * 0.6 : thickness * 0.3;
    
    if (orientation === 'horizontal') {
      tickElements.push(
        <line
          key={i}
          x1={displayPos + offset}
          y1={thickness - tickLength}
          x2={displayPos + offset}
          y2={thickness}
          stroke={colors.textMuted}
          strokeWidth={1}
          opacity={isMajor ? 1 : 0.6}
        />
      );
      if (isMajor) {
        tickElements.push(
          <text
            key={`t-${i}`}
            x={displayPos + offset + 2}
            y={10}
            fontSize={9}
            fill={colors.textMuted}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {i}
          </text>
        );
      }
    } else {
      tickElements.push(
        <line
          key={i}
          x1={thickness - tickLength}
          y1={displayPos + offset}
          x2={thickness}
          y2={displayPos + offset}
          stroke={colors.textMuted}
          strokeWidth={1}
          opacity={isMajor ? 1 : 0.6}
        />
      );
      if (isMajor) {
        tickElements.push(
          <text
            key={`t-${i}`}
            x={2}
            y={displayPos + offset + 8}
            fontSize={9}
            fill={colors.textMuted}
            transform={`rotate(-90 2 ${displayPos + offset + 8})`}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {i}
          </text>
        );
      }
    }
  }

  return (
    <div
      style={{
        width: orientation === 'horizontal' ? '100%' : thickness,
        height: orientation === 'horizontal' ? thickness : '100%',
        backgroundColor: colors.surface,
        borderBottom: orientation === 'horizontal' ? `1px solid ${colors.border}` : 'none',
        borderRight: orientation === 'vertical' ? `1px solid ${colors.border}` : 'none',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        userSelect: 'none',
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
          {tickElements}
          
          {/* Corner box if needed, or just background fill */}
      </svg>
    </div>
  );
});
