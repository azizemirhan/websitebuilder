/**
 * Resize Handles - 8-point resize handles for selected elements
 */

import React, { memo, useCallback } from 'react';
import type { Element } from '@builder/core';

export type ResizeDirection = 
  | 'nw' | 'n' | 'ne' 
  | 'w'  |      'e'  
  | 'sw' | 's' | 'se';

interface ResizeHandlesProps {
  element: Element;
  onResizeStart: (direction: ResizeDirection, e: React.MouseEvent) => void;
}

const HANDLE_SIZE = 8;

const handlePositions: Record<ResizeDirection, React.CSSProperties> = {
  nw: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'nwse-resize' },
  n:  { top: -HANDLE_SIZE / 2, left: '50%', marginLeft: -HANDLE_SIZE / 2, cursor: 'ns-resize' },
  ne: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'nesw-resize' },
  w:  { top: '50%', marginTop: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'ew-resize' },
  e:  { top: '50%', marginTop: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'ew-resize' },
  sw: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'nesw-resize' },
  s:  { bottom: -HANDLE_SIZE / 2, left: '50%', marginLeft: -HANDLE_SIZE / 2, cursor: 'ns-resize' },
  se: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'nwse-resize' },
};

const directions: ResizeDirection[] = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

export const ResizeHandles = memo(function ResizeHandles({
  element,
  onResizeStart,
}: ResizeHandlesProps) {
  const { style } = element;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: style.top,
    left: style.left,
    width: style.width,
    height: style.height,
    pointerEvents: 'none',
  };

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    backgroundColor: '#ffffff',
    border: '1px solid #2563eb',
    borderRadius: 2,
    pointerEvents: 'auto',
  };

  const handleMouseDown = useCallback((direction: ResizeDirection) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onResizeStart(direction, e);
  }, [onResizeStart]);

  return (
    <div style={containerStyle}>
      {directions.map((direction) => (
        <div
          key={direction}
          style={{
            ...handleStyle,
            ...handlePositions[direction],
          }}
          onMouseDown={handleMouseDown(direction)}
        />
      ))}
    </div>
  );
});
