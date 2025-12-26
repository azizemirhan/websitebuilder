/**
 * Canvas Renderer - Main canvas viewport component
 */

import React, { memo, useCallback, useRef, useState } from 'react';
import { useCanvasStore, useHistoryStore, useSettingsStore, CanvasState, snapToGridValue } from '@builder/core';
import { ElementRenderer } from './ElementRenderer';
import { ResizeHandles, ResizeDirection } from './ResizeHandles';
import { GridOverlay } from './GridOverlay';
import { SmartGuides } from './SmartGuides';
import { ContextMenu } from './ContextMenu';
import { MarqueeSelection } from './MarqueeSelection';
import { Rulers } from './Rulers';

// Helper to safely get numeric value from string | number | undefined
const getNumericStyleValue = (value: number | string | undefined, fallback = 0): number => {
  if (value === undefined) return fallback;
  if (typeof value === 'number') return value;
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
};

interface CanvasRendererProps {
  width?: number;
  height?: number;
}

interface DragState {
  isDragging: boolean;
  elementId: string | null;
  startX: number;
  startY: number;
  initialLeft: number;
  initialTop: number;
}

interface ResizeState {
  isResizing: boolean;
  elementId: string | null;
  direction: ResizeDirection | null;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialW: number;
  initialH: number;
}

interface MarqueeState {
  isSelecting: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
}

export const CanvasRenderer = memo(function CanvasRenderer({
  width = 1440,
  height = 900,
}: CanvasRendererProps) {
  const rootElementIds = useCanvasStore((state) => state.rootElementIds);
  const elements = useCanvasStore((state) => state.elements);
  const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  const selectElement = useCanvasStore((state) => state.selectElement);
  const selectMultiple = useCanvasStore((state) => state.selectMultiple);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  // Settings
  const zoom = useSettingsStore((state) => state.zoom);
  const panX = useSettingsStore((state) => state.panX);
  const panY = useSettingsStore((state) => state.panY);
  const setZoom = useSettingsStore((state) => state.setZoom);
  const setPan = useSettingsStore((state) => state.setPan);
  const snapToGrid = useSettingsStore((state) => state.snapToGrid);
  const gridSize = useSettingsStore((state) => state.gridSize);
  const snapThreshold = useSettingsStore((state) => state.snapThreshold);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    elementId: null,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    elementId: null,
    direction: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialW: 0,
    initialH: 0,
  });

  const [marqueeState, setMarqueeState] = useState<MarqueeState>({
    isSelecting: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  // Save current state to history
  const saveHistory = useCallback(() => {
    const state = useCanvasStore.getState();
    const snapshot: CanvasState = {
      elements: state.elements,
      rootElementIds: state.rootElementIds,
      selectedElementIds: state.selectedElementIds,
      hoveredElementId: state.hoveredElementId,
    };
    addToHistory(snapshot);
  }, [addToHistory]);

  // Apply snap to grid
  const applySnap = useCallback((value: number): number => {
    if (!snapToGrid) return value;
    return snapToGridValue(value, gridSize, snapThreshold);
  }, [snapToGrid, gridSize, snapThreshold]);

  // Get canvas-relative position from mouse event
  const getCanvasPosition = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  }, [zoom]);

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ isOpen: false, x: 0, y: 0 });
  }, []);

  // Handle canvas mouse down
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Close context menu if open
    if (contextMenu.isOpen) {
      closeContextMenu();
      return;
    }

    const target = e.target as HTMLElement;
    
    // Middle click or Alt+Click - start panning
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      e.preventDefault();
      return;
    }
    
    // Click on empty canvas - start marquee selection or deselect
    if (target === canvasRef.current || target.closest('[data-grid-overlay]')) {
      const pos = getCanvasPosition(e);
      setMarqueeState({
        isSelecting: true,
        startX: pos.x,
        startY: pos.y,
        currentX: pos.x,
        currentY: pos.y,
      });
      if (!e.shiftKey) {
        clearSelection();
      }
      return;
    }
    
    // Find clicked element
    const elementEl = target.closest('[data-element-id]');
    if (!elementEl) return;
    
    const elementId = elementEl.getAttribute('data-element-id');
    if (!elementId) return;
    
    const element = elements[elementId];
    if (!element || element.locked) return;
    
    // Select the element
    selectElement(elementId, e.shiftKey);
    
    // Start drag immediately
    saveHistory();
    setDragState({
      isDragging: true,
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: getNumericStyleValue(element.style.left),
      initialTop: getNumericStyleValue(element.style.top),
    });
    
    e.preventDefault();
  }, [elements, clearSelection, selectElement, saveHistory, panX, panY, contextMenu.isOpen, closeContextMenu, getCanvasPosition]);

  // Handle resize start
  const handleResizeStart = useCallback((direction: ResizeDirection, e: React.MouseEvent) => {
    if (selectedElementIds.length !== 1) return;
    
    const elementId = selectedElementIds[0];
    const element = elements[elementId];
    if (!element) return;
    
    saveHistory();
    setResizeState({
      isResizing: true,
      elementId,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      initialX: getNumericStyleValue(element.style.left),
      initialY: getNumericStyleValue(element.style.top),
      initialW: getNumericStyleValue(element.style.width, 100),
      initialH: getNumericStyleValue(element.style.height, 100),
    });
    
    e.preventDefault();
    e.stopPropagation();
  }, [selectedElementIds, elements, saveHistory]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Handle panning
    if (isPanning) {
      const newPanX = e.clientX - panStart.x;
      const newPanY = e.clientY - panStart.y;
      setPan(newPanX, newPanY);
      return;
    }

    // Handle marquee selection
    if (marqueeState.isSelecting) {
      const pos = getCanvasPosition(e);
      setMarqueeState((prev) => ({
        ...prev,
        currentX: pos.x,
        currentY: pos.y,
      }));
      return;
    }
    
    // Handle drag
    if (dragState.isDragging && dragState.elementId) {
      const deltaX = (e.clientX - dragState.startX) / zoom;
      const deltaY = (e.clientY - dragState.startY) / zoom;
      
      let newLeft = dragState.initialLeft + deltaX;
      let newTop = dragState.initialTop + deltaY;
      
      // Apply snap
      newLeft = applySnap(newLeft);
      newTop = applySnap(newTop);
      
      updateElementStyle(dragState.elementId, {
        left: newLeft,
        top: newTop,
      });
      return;
    }
    
    // Handle resize
    if (resizeState.isResizing && resizeState.elementId && resizeState.direction) {
      const deltaX = (e.clientX - resizeState.startX) / zoom;
      const deltaY = (e.clientY - resizeState.startY) / zoom;
      const dir = resizeState.direction;
      
      let newX = resizeState.initialX;
      let newY = resizeState.initialY;
      let newW = resizeState.initialW;
      let newH = resizeState.initialH;
      
      if (dir.includes('e')) newW = Math.max(20, resizeState.initialW + deltaX);
      if (dir.includes('w')) {
        newW = Math.max(20, resizeState.initialW - deltaX);
        newX = resizeState.initialX + (resizeState.initialW - newW);
      }
      if (dir.includes('s')) newH = Math.max(20, resizeState.initialH + deltaY);
      if (dir.includes('n')) {
        newH = Math.max(20, resizeState.initialH - deltaY);
        newY = resizeState.initialY + (resizeState.initialH - newH);
      }
      
      newX = applySnap(newX);
      newY = applySnap(newY);
      newW = applySnap(newW);
      newH = applySnap(newH);
      
      updateElementStyle(resizeState.elementId, {
        left: newX,
        top: newY,
        width: newW,
        height: newH,
      });
    }
  }, [dragState, resizeState, isPanning, panStart, zoom, applySnap, updateElementStyle, setPan, marqueeState.isSelecting, getCanvasPosition]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    // Finalize marquee selection
    if (marqueeState.isSelecting) {
      const left = Math.min(marqueeState.startX, marqueeState.currentX);
      const top = Math.min(marqueeState.startY, marqueeState.currentY);
      const right = Math.max(marqueeState.startX, marqueeState.currentX);
      const bottom = Math.max(marqueeState.startY, marqueeState.currentY);
      
      // Only select if marquee is bigger than 5px
      if (right - left > 5 || bottom - top > 5) {
        const selectedIds: string[] = [];
        Object.values(elements).forEach((el) => {
          const elLeft = getNumericStyleValue(el.style.left);
          const elTop = getNumericStyleValue(el.style.top);
          const elRight = elLeft + getNumericStyleValue(el.style.width);
          const elBottom = elTop + getNumericStyleValue(el.style.height);
          
          // Check intersection
          if (elLeft < right && elRight > left && elTop < bottom && elBottom > top) {
            selectedIds.push(el.id);
          }
        });
        
        if (selectedIds.length > 0) {
          selectMultiple(selectedIds);
        }
      }
      
      setMarqueeState({
        isSelecting: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
      });
    }

    setIsPanning(false);
    setDragState({
      isDragging: false,
      elementId: null,
      startX: 0,
      startY: 0,
      initialLeft: 0,
      initialTop: 0,
    });
    setResizeState({
      isResizing: false,
      elementId: null,
      direction: null,
      startX: 0,
      startY: 0,
      initialX: 0,
      initialY: 0,
      initialW: 0,
      initialH: 0,
    });
  }, [marqueeState, elements, selectMultiple]);

  // Handle wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    }
  }, [zoom, setZoom]);

  const canvasStyle: React.CSSProperties = {
    position: 'relative',
    width,
    height,
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    cursor: isPanning ? 'grabbing' : dragState.isDragging ? 'move' : 'default',
    transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
    transformOrigin: 'center center',
  };

  const selectedElement = selectedElementIds.length === 1 
    ? elements[selectedElementIds[0]] 
    : null;

  return (
    <>
      {/* Rulers */}
      <Rulers width={width} height={height} />
      
      <div
        ref={canvasRef}
        style={canvasStyle}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      >
        {/* Grid Overlay */}
        <GridOverlay width={width} height={height} />
        
        {/* Render all root elements */}
        {rootElementIds.map((id) => (
          <ElementRenderer key={id} elementId={id} />
        ))}
        
        {/* Smart Guides */}
        <SmartGuides />
        
        {/* Marquee Selection */}
        {marqueeState.isSelecting && (
          <MarqueeSelection
            startX={marqueeState.startX}
            startY={marqueeState.startY}
            currentX={marqueeState.currentX}
            currentY={marqueeState.currentY}
          />
        )}
        
        {/* Render resize handles for selected element */}
        {selectedElement && !dragState.isDragging && (
          <ResizeHandles
            element={selectedElement}
            onResizeStart={handleResizeStart}
          />
        )}
      </div>
      
      {/* Context Menu */}
      {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        />
      )}
    </>
  );
});
