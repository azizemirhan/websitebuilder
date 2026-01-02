/**
 * Resize Handles - 8-point resize handles for selected elements
 */

import React, { memo, useCallback } from 'react';
import type { Element } from '@builder/core';
import { useSettingsStore } from '@builder/core';

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
  const [domRect, setDomRect] = React.useState<DOMRect | null>(null);
  const zoom = useSettingsStore((state) => state.zoom);
  const panX = useSettingsStore((state) => state.panX);
  const panY = useSettingsStore((state) => state.panY);

  // Measure DOM element on mounting and changes
  React.useEffect(() => {
    const el = document.querySelector(`[data-element-id="${element.id}"]`);
    const canvasRoot = document.querySelector('.editor-canvas-root');

    if (el && canvasRoot) {
      const updateRect = () => {
        const elRect = el.getBoundingClientRect();
        const canvasRect = canvasRoot.getBoundingClientRect();

        // Calculate position relative to canvas root
        // Divide by zoom and account for pan offset
        setDomRect({
          top: (elRect.top - canvasRect.top) / zoom - panY / zoom,
          left: (elRect.left - canvasRect.left) / zoom - panX / zoom,
          width: elRect.width / zoom,
          height: elRect.height / zoom,
        } as DOMRect);
      };

      updateRect();

      const observer = new ResizeObserver(updateRect);
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, [element.id, element.style, element.props, zoom, panX, panY]); // Re-run if style/props/zoom/pan change

  // Grid Cell'lerin boyutu parent tarafından yönetilir, handle'ları gizle
  if (element.props?.isGridCell) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: domRect ? domRect.top : 0,
    left: domRect ? domRect.left : 0,
    width: domRect ? domRect.width : 0,
    height: domRect ? domRect.height : 0,
    pointerEvents: 'none',
    display: domRect ? 'block' : 'none', // Hide until measured
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
