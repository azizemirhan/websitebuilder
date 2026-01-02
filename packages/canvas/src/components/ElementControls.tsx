import React, { memo, useCallback, useLayoutEffect, useState, useRef } from 'react';
import { useCanvasStore, useSettingsStore } from '@builder/core';
import type { Element } from '@builder/core';

interface ElementControlsProps {
  elementId: string;
}

export const ElementControls = memo(function ElementControls({
  elementId,
}: ElementControlsProps) {
  const element = useCanvasStore((state) => state.elements[elementId]);
  const deleteElement = useCanvasStore((state) => state.deleteElement);
  const selectElement = useCanvasStore((state) => state.selectElement);
  const elementIdState = useCanvasStore((state) => state.elements[elementId]?.id);

  const [domRect, setDomRect] = useState<DOMRect | null>(null);
  const zoom = useSettingsStore((state) => state.zoom);
  const panX = useSettingsStore((state) => state.panX);
  const panY = useSettingsStore((state) => state.panY);
  const retryCountRef = useRef(0);
  const maxRetries = 10;

  // Measure DOM element position relative to canvas root
  // Use useLayoutEffect for synchronous measurement before paint
  useLayoutEffect(() => {
    const measureElement = () => {
      const el = document.querySelector(`[data-element-id="${elementId}"]`);
      const canvasRoot = document.querySelector('.editor-canvas-root');
      
      if (!el || !canvasRoot) {
        // Retry with requestAnimationFrame if element not found yet
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          requestAnimationFrame(measureElement);
        }
        return;
      }
      
      retryCountRef.current = 0; // Reset retry count on success
      
      const elRect = el.getBoundingClientRect();
      const canvasRect = canvasRoot.getBoundingClientRect();
      
      // Validate that we have valid dimensions (element is visible)
      if (elRect.width === 0 && elRect.height === 0) {
        // Element might be hidden or not rendered yet
        requestAnimationFrame(measureElement);
        return;
      }
      
      // Calculate position relative to canvas root
      // Divide by zoom since getBoundingClientRect returns scaled values
      // Subtract pan offset to account for canvas panning
      const calculatedRect = {
        top: (elRect.top - canvasRect.top) / zoom - panY / zoom,
        left: (elRect.left - canvasRect.left) / zoom - panX / zoom,
        width: elRect.width / zoom,
        height: elRect.height / zoom,
        bottom: (elRect.bottom - canvasRect.top) / zoom - panY / zoom,
        right: (elRect.right - canvasRect.left) / zoom - panX / zoom,
        x: (elRect.left - canvasRect.left) / zoom - panX / zoom,
        y: (elRect.top - canvasRect.top) / zoom - panY / zoom,
        toJSON: () => {}
      };
      
      // Only update if values are valid (positive or zero for positions)
      if (calculatedRect.width > 0 && calculatedRect.height > 0) {
        setDomRect(calculatedRect);
      }
    };
    
    measureElement();
    
    // Set up observers for dynamic updates
    const el = document.querySelector(`[data-element-id="${elementId}"]`);
    const canvasRoot = document.querySelector('.editor-canvas-root');
    
    if (el && canvasRoot) {
      const resizeObserver = new ResizeObserver(measureElement);
      resizeObserver.observe(el);
      
      // Also update on scroll/mutation in case parent moves
      const mutationObserver = new MutationObserver(measureElement);
      mutationObserver.observe(canvasRoot, { childList: true, subtree: true, attributes: true });
      
      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    }
  }, [elementId, element?.style, zoom, panX, panY]);

  if (!element || !domRect) return null;

  const isContainer = element.type === 'container';

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(elementId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElement(elementId);
  };

  const handleAdd = (e: React.MouseEvent) => {
     e.stopPropagation();
     // TODO: Implement Add Logic (Open modal/drawer)
  };

  // Styles for the overlays
  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: domRect.top,
    left: domRect.left,
    width: domRect.width,
    height: domRect.height,
    pointerEvents: 'none', // Allow clicking through to the element itself
    zIndex: 50, // Above elements
    border: '1px solid #3b82f6', // Active blue border
  };

  // Common button style
  const btnStyle: React.CSSProperties = {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  return (
    <div style={overlayStyle}>
      {/* 1. Container Handle (Top-Left) */}
      {isContainer && (
        <div
          style={{
            position: 'absolute',
            top: -24, // Outside top
            left: 0,
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '4px 4px 0 0',
            padding: '0 8px',
            height: 24,
            display: 'flex',
            alignItems: 'center',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
          onClick={handleSelect}
        >
          Container
        </div>
      )}

      {/* 2. Widget Edit Handle (Top-Right) */}
      {!isContainer && (
        <button
          style={{
            ...btnStyle,
            position: 'absolute',
            top: 0,
            right: 0,
            borderRadius: '0 0 0 4px', // Inner corner radius
          }}
          onClick={handleSelect}
          title="Edit"
        >
          ✎
        </button>
      )}

      {/* 3. Top-Middle Toolbar (Add, Drag/Select, Delete) */}
      <div
        style={{
          position: 'absolute',
          top: -24, // Sits on top border
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          backgroundColor: '#3b82f6',
          borderRadius: '4px 4px 0 0',
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}
      >
        {/* Add Button */}
        <button style={btnStyle} onClick={handleAdd} title="Add New">
          +
        </button>
        
        {/* Drag/Select Button (Six Dots) */}
        <button style={{...btnStyle, cursor: 'grab'}} onClick={handleSelect} title="Drag / Select">
          ⠿
        </button>

        {/* Delete Button */}
        <button style={{...btnStyle, backgroundColor: '#ef4444'}} onClick={handleDelete} title="Delete">
          ×
        </button>
      </div>
    </div>
  );
});
