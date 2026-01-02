/**
 * Canvas Renderer - Main canvas viewport component
 */

import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import { useCanvasStore, useHistoryStore, useSettingsStore, CanvasState, snapToGridValue, useBehaviorStore } from '@builder/core';
import { ElementRenderer } from './ElementRenderer';
import { ResizeHandles, ResizeDirection } from './ResizeHandles';
import { GridOverlay } from './GridOverlay';
import { SmartGuides } from './SmartGuides';
import { ContextMenu } from './ContextMenu';
import { MarqueeSelection } from './MarqueeSelection';
import { Rulers } from './Rulers';
import { ElementControls } from './ElementControls';

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
  isPreview?: boolean;
}

interface DragState {
  isDragging: boolean;
  isPreparing: boolean; // Waiting for threshold to start actual drag
  elementId: string | null;
  startX: number;
  startY: number;
  initialLeft: number;
  initialTop: number;
}

// Drag threshold in pixels - must move this much to start dragging
const DRAG_THRESHOLD = 5;

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
  isPreview = false,
}: CanvasRendererProps) {
  // Sync viewport width with behavior store for visibility conditions
  useEffect(() => {
    useBehaviorStore.getState().updateViewportWidth(width);
  }, [width]);

  const rootElementIds = useCanvasStore((state) => state.rootElementIds);
  const elements = useCanvasStore((state) => state.elements);
  const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);
  const hoveredElementId = useCanvasStore((state) => state.hoveredElementId);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  const selectElement = useCanvasStore((state) => state.selectElement);
  const selectMultiple = useCanvasStore((state) => state.selectMultiple);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  // Settings
  // Settings
  const storeZoom = useSettingsStore((state) => state.zoom);
  const storePanX = useSettingsStore((state) => state.panX);
  const storePanY = useSettingsStore((state) => state.panY);
  
  // Use overrides if in preview mode
  const zoom = isPreview ? 1 : storeZoom;
  const panX = isPreview ? 0 : storePanX;
  const panY = isPreview ? 0 : storePanY;
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
    isPreparing: false,
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

  // Track drop target highlight (replaces direct DOM manipulation)
  const [highlightedDropTargetId, setHighlightedDropTargetId] = useState<string | null>(null);

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
      x: (e.clientX - rect.left) / zoom - panX / zoom,
      y: (e.clientY - rect.top) / zoom - panY / zoom,
    };
  }, [zoom, panX, panY]);

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

    // Prepare for potential drag (but don't start dragging yet)
    // We'll wait for mouse to move beyond threshold
    setDragState({
      isDragging: false,
      isPreparing: true,
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

    // Check if we should start dragging (threshold check)
    if (dragState.isPreparing && !dragState.isDragging && dragState.elementId) {
      const deltaX = Math.abs(e.clientX - dragState.startX);
      const deltaY = Math.abs(e.clientY - dragState.startY);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > DRAG_THRESHOLD) {
        // Threshold exceeded, start actual dragging
        saveHistory();
        setDragState((prev) => ({
          ...prev,
          isDragging: true,
          isPreparing: false,
        }));
      }
      return;
    }

    // Handle drag
    if (dragState.isDragging && dragState.elementId) {
      const element = elements[dragState.elementId];

      if (!element) return;

      // Check if parent exists and has flex/grid layout
      const parent = element?.parentId ? elements[element.parentId] : null;

      // Simple heuristic for flow layout: parent is flex/grid
      // Ideally we would check computed styles, but checking style props + default is a good start
      // We can also assume non-absolute elements are flow
      const isAbsolute = element.style.position === 'absolute' || element.style.position === 'fixed';
      
      // ===== DROP ZONE DETECTION =====
      // Fare altındaki container'ı bul
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const elementsAtPoint = document.elementsFromPoint(mouseX, mouseY);

      // Sürüklenen elementin kendisi hariç, container bul
      let dropTargetContainer: any = null;
      for (const el of elementsAtPoint) {
        const targetId = el.getAttribute('data-element-id');
        if (targetId && targetId !== dragState.elementId) {
          const targetElement = elements[targetId];
          if (targetElement && targetElement.type === 'container') {
            dropTargetContainer = targetElement;
            break;
          }
        }
      }

      // Update highlighted drop target via state (no direct DOM manipulation)
      setHighlightedDropTargetId(dropTargetContainer?.id || null);
      
      // If we are in a Flow layout (not absolute), we use Reordering logic
      // We need to find the "effective" element to reorder.
      // If the dragged element is the ONLY child of its parent, we try to reorder the Parent instead.
      // This handles cases where components are wrapped in divs.
      
      let effectiveElementId = dragState.elementId;
      let effectiveParent = parent;
      let siblings: Element[] = [];
      let parentEl: HTMLElement | null = null;
      let isAbsoluteEffective = isAbsolute;

      // Traversal Loop
      while (effectiveParent && !isAbsoluteEffective) {
          parentEl = document.querySelector(`[data-element-id="${effectiveParent.id}"]`) as HTMLElement;
          if (!parentEl) break;

          siblings = Array.from(parentEl.children).filter(child => 
              child.getAttribute('data-element-id') !== effectiveElementId
          ) as Element[];


          // If we have siblings (meaning we can reorder here), stop traversing
          if (siblings.length > 0) {
              // console.log(`[Drag] Found reorderable level: ${effectiveElementId} in ${effectiveParent.id} with ${siblings.length} siblings`);
              break;
          }

          // If no siblings, and we have a grandparent, traverse up
          if (effectiveParent.parentId) {
               // console.log(`[Drag] Element ${effectiveElementId} is unique child. Traversing up to ${effectiveParent.id}`);
               const grandParent = useCanvasStore.getState().elements[effectiveParent.parentId];
               if (grandParent) {
                   effectiveElementId = effectiveParent.id;
                   effectiveParent = grandParent;
                   
                   // Check if new element is absolute
                   const effectiveElStyle = useCanvasStore.getState().elements[effectiveElementId].style;
                   const pos = effectiveElStyle?.position;
                   isAbsoluteEffective = pos === 'absolute' || pos === 'fixed';
                   continue;
               }
          }
          break;
      }

      if (effectiveParent && !isAbsoluteEffective && parentEl && siblings.length > 0) {
             
             // DEBUG LOGS
             // console.log('[Drag] Flow Reorder Check. Siblings:', siblings.length);

             // Find insertion index based on mouse position
             let insertIndex = siblings.length; // Default to end
             
             const parentStyle = window.getComputedStyle(parentEl);
             const isRow = parentStyle.flexDirection.includes('row') || parentStyle.display === 'grid';
             
             // Find the first sibling that is "after" the cursor
             for (let i = 0; i < siblings.length; i++) {
                 const box = siblings[i].getBoundingClientRect();
                 
                 // Skip invisible elements (width/height 0) to prevent logic errors
                 if (box.width === 0 || box.height === 0 || window.getComputedStyle(siblings[i]).display === 'none') {
                     continue;
                 }

                 const centerX = box.left + box.width / 2;
                 const centerY = box.top + box.height / 2;

                 // DEBUG
                 // console.log(`[Drag] Sib ${i} Center: ${centerX},${centerY} vs Mouse: ${e.clientX},${e.clientY}`);
                 
                 // If cursor is before this sibling 'center', we insert here
                 if (isRow) {
                     if (e.clientX < centerX) {
                         insertIndex = i;
                         break;
                     }
                 } else {
                     if (e.clientY < centerY) {
                         insertIndex = i;
                         break;
                     }
                 }
             }
             
             // Current Real Index in Store
             const currentRealIndex = effectiveParent.children.indexOf(effectiveElementId);

             if (insertIndex !== currentRealIndex) {
                 useCanvasStore.getState().reorderElement(effectiveElementId, insertIndex);
             }

             return; // Flow layout işlendi, absolute drag'e gitme
          }
          // Flow layout değilse, absolute drag'e devam et (aşağıya düş)

      // Fallback to Absolute Dragging (default behavior)
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
  }, [dragState, resizeState, isPanning, panStart, zoom, applySnap, updateElementStyle, setPan, marqueeState.isSelecting, getCanvasPosition, saveHistory, elements]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    // ===== DROP ZONE PARENT-CHILD İLİŞKİSİ =====
    if (dragState.isDragging && dragState.elementId) {
      // Fare altındaki container'ı bul
      const mouseX = window.event ? (window.event as MouseEvent).clientX : 0;
      const mouseY = window.event ? (window.event as MouseEvent).clientY : 0;
      const elementsAtPoint = document.elementsFromPoint(mouseX, mouseY);
      
      let dropTargetContainer: any = null;
      for (const el of elementsAtPoint) {
        const targetId = el.getAttribute('data-element-id');
        if (targetId && targetId !== dragState.elementId) {
          const targetElement = elements[targetId];
          if (targetElement && targetElement.type === 'container') {
            dropTargetContainer = targetElement;
            break;
          }
        }
      }
      
      const draggedElement = elements[dragState.elementId];
      const currentParentId = draggedElement?.parentId;
      
      // Eğer bir container üzerine bırakıldıysa
      if (dropTargetContainer) {
        // Farklı bir parent'a bırakıldıysa, parent değiştir
        if (currentParentId !== dropTargetContainer.id) {
          const moveElement = useCanvasStore.getState().moveElement;
          moveElement(dragState.elementId, dropTargetContainer.id);
          
          // ===== GRID HÜCRE TESPİTİ VE YERLEŞTİRME =====
          if (dropTargetContainer.props?.containerType === 'grid') {
            const containerEl = document.querySelector(`[data-element-id="${dropTargetContainer.id}"]`) as HTMLElement;
            if (containerEl) {
              const rect = containerEl.getBoundingClientRect();
              
              // Grid bilgilerini al
              const cols = dropTargetContainer.props?.gridTemplateColumns || 'repeat(3, 1fr)';
              const rows = dropTargetContainer.props?.gridTemplateRows || 'auto';
              const colMatch = cols.match(/repeat\((\d+),/);
              const rowMatch = rows.match(/repeat\((\d+),/);
              const columnCount = colMatch ? parseInt(colMatch[1]) : 3;
              const rowCount = rowMatch ? parseInt(rowMatch[1]) : 3;
              
              // Mouse pozisyonunu container'a göre hesapla
              const relativeX = mouseX - rect.left;
              const relativeY = mouseY - rect.top;
              
              // Hangi sütun ve satıra bırakıldığını hesapla
              const columnWidth = rect.width / columnCount;
              const rowHeight = rect.height / rowCount;
              
              const targetColumn = Math.floor(relativeX / columnWidth) + 1; // 1-indexed
              const targetRow = Math.floor(relativeY / rowHeight) + 1; // 1-indexed

              // Element'in style'ına grid-column ve grid-row ekle
              const updateElementStyle = useCanvasStore.getState().updateElementStyle;
              updateElementStyle(dragState.elementId, {
                gridColumn: `${targetColumn}`,
                gridRow: `${targetRow}`,
                position: 'relative', // Grid item için relative
              });
            }
          } else {
            // Flexbox container'a (veya Grid Cell'e) taşındıysa
            const updateElementStyle = useCanvasStore.getState().updateElementStyle;
            const draggedEl = elements[dragState.elementId];

            // Eğer Grid Cell ise, varsayılan olarak Flow davranışı uygula
            if (dropTargetContainer.props?.isGridCell) {
              updateElementStyle(dragState.elementId, {
                gridColumn: undefined,
                gridRow: undefined,
                position: 'relative',
                // Keep user's width if it's not auto/undefined, otherwise set to 100%
                width: draggedEl?.style.width && draggedEl.style.width !== 'auto' ? draggedEl.style.width : '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                // Keep user's height if set
                height: draggedEl?.style.height || 'auto',
                left: 'auto',
                top: 'auto',
                minWidth: 0,
                overflow: 'hidden', // Prevent overflow from grid cell
                marginBottom: 8 // default spacing
              });
            } else {
              // Normal container (Absolute veya Flex)
              updateElementStyle(dragState.elementId, {
                gridColumn: undefined,
                gridRow: undefined,
                position: 'relative',
                // Keep user's width if it's not auto/undefined, otherwise set to 100%
                width: draggedEl?.style.width && draggedEl.style.width !== 'auto' ? draggedEl.style.width : '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                // Keep user's height if set
                height: draggedEl?.style.height || 'auto',
                left: 'auto',
                top: 'auto',
                minWidth: 0,
              });
            }
          }
          
          saveHistory();
        }
      } else {
        // Container üzerine bırakılmadıysa (canvas'a bırakıldı)
        // Eğer element şu anda bir parent'a sahipse, root'a taşı
        if (currentParentId) {
          const moveElement = useCanvasStore.getState().moveElement;
          moveElement(dragState.elementId, null); // null = root
          
          // Grid properties'i temizle
          const updateElementStyle = useCanvasStore.getState().updateElementStyle;
          updateElementStyle(dragState.elementId, {
            gridColumn: undefined,
            gridRow: undefined,
            position: 'absolute', // Root'ta absolute
          });
          
          saveHistory();
        }
      }
    }

    // Clear drop target highlight
    setHighlightedDropTargetId(null);
    
    // Finalize marquee selection
    if (marqueeState.isSelecting && canvasRef.current) {
      const left = Math.min(marqueeState.startX, marqueeState.currentX);
      const top = Math.min(marqueeState.startY, marqueeState.currentY);
      const right = Math.max(marqueeState.startX, marqueeState.currentX);
      const bottom = Math.max(marqueeState.startY, marqueeState.currentY);

      // Only select if marquee is bigger than 5px
      if (right - left > 5 || bottom - top > 5) {
        const selectedIds: string[] = [];
        const canvasRect = canvasRef.current.getBoundingClientRect();

        Object.values(elements).forEach((el) => {
          const domEl = document.querySelector(`[data-element-id="${el.id}"]`);
          if (!domEl) return;

          const elRect = domEl.getBoundingClientRect();

          // Convert element position to canvas coordinates
          const elLeft = (elRect.left - canvasRect.left) / zoom - panX / zoom;
          const elTop = (elRect.top - canvasRect.top) / zoom - panY / zoom;
          const elRight = elLeft + (elRect.width / zoom);
          const elBottom = elTop + (elRect.height / zoom);

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
      isPreparing: false,
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
  }, [marqueeState, elements, selectMultiple, dragState.elementId, dragState.isDragging, saveHistory]);

  // ===== EXTERNAL DRAG & DROP SUPPORT =====
  const [dropIndicator, setDropIndicator] = useState<{top: number, left: number, width: number} | null>(null);
  const addElement = useCanvasStore((state) => state.addElement);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate Drop Position (Pink Line)
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Find target container
    const elementsAtPoint = document.elementsFromPoint(mouseX, mouseY);
    let targetContainer: any = null;
    for (const el of elementsAtPoint) {
      const id = el.getAttribute('data-element-id');
      if (id && elements[id]?.type === 'container') {
        targetContainer = elements[id];
        break;
      }
    }

    if (targetContainer && canvasRef.current) {
       const containerEl = document.querySelector(`[data-element-id="${targetContainer.id}"]`) as HTMLElement;
       if (containerEl) {
         const rect = containerEl.getBoundingClientRect();
         const canvasRect = canvasRef.current.getBoundingClientRect();

         // Calculate position relative to canvas (pan is already applied via transform)
         const relativeX = (rect.left - canvasRect.left) / zoom;
         const relativeY = (rect.bottom - canvasRect.top) / zoom - 10;

         setDropIndicator({
           left: relativeX,
           top: relativeY,
           width: rect.width / zoom
         });
         return;
       }
    }
    setDropIndicator(null);
  }, [elements, zoom, panX, panY]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDropIndicator(null);
    
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    try {
      const payload = JSON.parse(data);
      if (payload.type === 'new_element') {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const elementsAtPoint = document.elementsFromPoint(mouseX, mouseY);
        let targetContainerId: string | null = null;
        
        for (const el of elementsAtPoint) {
           const id = el.getAttribute('data-element-id');
           if (id && elements[id]?.type === 'container') {
             targetContainerId = id;
             break;
           }
        }
        
        addElement({
          type: payload.elementType,
          name: payload.name,
        }, targetContainerId);
        
        saveHistory();
      }
    } catch (err) {
      // Ignore
    }
  }, [addElement, elements, saveHistory]);

  // Handle wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    }
  }, [zoom, setZoom]);

  // Dynamic cursor based on state
  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (dragState.isDragging) return 'grabbing';
    if (dragState.isPreparing) return 'grab';
    if (resizeState.isResizing) return resizeState.direction ? `${resizeState.direction}-resize` : 'default';
    return 'default';
  };

  const canvasStyle: React.CSSProperties = {
    position: 'relative',
    width,
    minHeight: height,
    height: 'auto', // Allow content to expand
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'visible', // Allow content to be visible for parent scroll
    cursor: getCursor(),
    transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
    transformOrigin: 'top center',
  };

  const selectedElement = selectedElementIds.length === 1 
    ? elements[selectedElementIds[0]] 
    : null;

  return (
    <>
      {/* Rulers - Hide in preview */}
      {!isPreview && <Rulers width={width} height={height} />}
      
      <div
        ref={canvasRef}
        className="editor-canvas-root"
        style={canvasStyle}
        onMouseDown={!isPreview ? handleCanvasMouseDown : undefined}
        onMouseMove={!isPreview ? handleMouseMove : undefined}
        onMouseUp={!isPreview ? handleMouseUp : undefined}
        onMouseLeave={!isPreview ? handleMouseUp : undefined}
        onWheel={handleWheel}
        onContextMenu={!isPreview ? handleContextMenu : undefined}
        // External Drag Events
        onDragOver={!isPreview ? handleDragOver : undefined}
        onDrop={!isPreview ? handleDrop : undefined}
      >
        {/* Drop Indicator (Pink Line) */}
        {dropIndicator && (
          <div style={{
            position: 'absolute',
            top: dropIndicator.top,
            left: dropIndicator.left,
            width: dropIndicator.width,
            height: 4,
            backgroundColor: '#FF00CC', // Pink
            boxShadow: '0 0 8px rgba(255, 0, 204, 0.5)',
            zIndex: 1000,
            pointerEvents: 'none',
            borderRadius: 2,
          }} />
        )}

        {/* Grid Overlay - Hide in preview */}
        {!isPreview && <GridOverlay width={width} height={height} />}
        
        {/* Render all root elements */}
        {rootElementIds
          .filter((id) => {
            // Hide containers that are used as mega menus
            const megaMenuContainerIds = new Set<string>();
            Object.values(elements).forEach((el) => {
              // Only hide if showMegaMenuContainers is NOT true OR if we are in PREVIEW mode
              if (el.type === 'menu' && el.props?.megaMenuBindings && (isPreview || !el.props.showMegaMenuContainers)) {
                Object.values(el.props.megaMenuBindings as Record<number, string>).forEach((containerId) => {
                  megaMenuContainerIds.add(containerId);
                });
              }
            });
            return !megaMenuContainerIds.has(id);
          })
          .map((id) => (
            <ElementRenderer
              key={id}
              elementId={id}
              isPreview={isPreview}
              highlightedDropTargetId={highlightedDropTargetId}
              isDragging={dragState.isDragging && dragState.elementId === id}
            />
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
        
        {/* Render resize handles for selected element - Hide in preview */}
        {!isPreview && selectedElement && !dragState.isDragging && !selectedElement.props?.isGridCell && (
          <ResizeHandles
            element={selectedElement}
            onResizeStart={handleResizeStart}
          />
        )}

        {/* Elementor-style Controls - Hide in preview */}
        {!isPreview && !dragState.isDragging && !resizeState.isResizing && !marqueeState.isSelecting && (
           <>
              {selectedElementIds.length === 1 && (
                  <ElementControls elementId={selectedElementIds[0]} />
              )}
              {hoveredElementId && 
               !selectedElementIds.includes(hoveredElementId) && (
                  <ElementControls elementId={hoveredElementId} />
              )}
           </>
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
