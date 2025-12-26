/**
 * Keyboard Shortcuts Hook - Global keyboard event handling
 */

import { useEffect, useCallback } from 'react';
import { useCanvasStore, useHistoryStore, useClipboardStore, CanvasState, Element } from '@builder/core';

export function useKeyboardShortcuts() {
  const elements = useCanvasStore((state) => state.elements);
  const deleteElement = useCanvasStore((state) => state.deleteElement);
  const duplicateElement = useCanvasStore((state) => state.duplicateElement);
  const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  const selectMultiple = useCanvasStore((state) => state.selectMultiple);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addElement = useCanvasStore((state) => state.addElement);
  
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  
  const copyElements = useClipboardStore((state) => state.copyElements);
  const copiedElements = useClipboardStore((state) => state.copiedElements);

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

  const handleUndo = useCallback(() => {
    const getCurrentState = (): CanvasState => {
      const state = useCanvasStore.getState();
      return {
        elements: state.elements,
        rootElementIds: state.rootElementIds,
        selectedElementIds: state.selectedElementIds,
        hoveredElementId: state.hoveredElementId,
      };
    };
    
    const applyState = (state: CanvasState) => {
      useCanvasStore.setState({
        elements: state.elements,
        rootElementIds: state.rootElementIds,
        selectedElementIds: state.selectedElementIds,
        hoveredElementId: state.hoveredElementId,
      });
    };
    
    undo(getCurrentState, applyState);
  }, [undo]);

  const handleRedo = useCallback(() => {
    const getCurrentState = (): CanvasState => {
      const state = useCanvasStore.getState();
      return {
        elements: state.elements,
        rootElementIds: state.rootElementIds,
        selectedElementIds: state.selectedElementIds,
        hoveredElementId: state.hoveredElementId,
      };
    };
    
    const applyState = (state: CanvasState) => {
      useCanvasStore.setState({
        elements: state.elements,
        rootElementIds: state.rootElementIds,
        selectedElementIds: state.selectedElementIds,
        hoveredElementId: state.hoveredElementId,
      });
    };
    
    redo(getCurrentState, applyState);
  }, [redo]);

  // Handle copy
  const handleCopy = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    const selectedElements = selectedElementIds
      .map((id) => elements[id])
      .filter(Boolean) as Element[];
    copyElements(selectedElements);
  }, [selectedElementIds, elements, copyElements]);

  // Handle paste
  const handlePaste = useCallback(() => {
    if (copiedElements.length === 0) return;
    saveHistory();
    
    const newIds: string[] = [];
    copiedElements.forEach((el) => {
      const newId = addElement({
        type: el.type,
        name: `${el.name} Copy`,
        style: {
          ...el.style,
          left: typeof el.style.left === 'number' ? el.style.left + 20 : el.style.left,
          top: typeof el.style.top === 'number' ? el.style.top + 20 : el.style.top,
        },
        props: el.props,
      } as Parameters<typeof addElement>[0]);
      newIds.push(newId);
    });
    
    if (newIds.length > 0) {
      selectMultiple(newIds);
    }
  }, [copiedElements, addElement, selectMultiple, saveHistory]);

  // Helper for safe numeric style value
  const getNumericValue = (value: number | string | undefined, fallback = 0): number => {
    if (value === undefined) return fallback;
    if (typeof value === 'number') return value;
    const num = parseFloat(value);
    return isNaN(num) ? fallback : num;
  };

  // Handle arrow key nudge
  const handleNudge = useCallback((direction: 'up' | 'down' | 'left' | 'right', amount: number) => {
    if (selectedElementIds.length === 0) return;
    saveHistory();
    
    selectedElementIds.forEach((id) => {
      const element = elements[id];
      if (!element) return;
      
      switch (direction) {
        case 'up':
          updateElementStyle(id, { top: getNumericValue(element.style.top) - amount });
          break;
        case 'down':
          updateElementStyle(id, { top: getNumericValue(element.style.top) + amount });
          break;
        case 'left':
          updateElementStyle(id, { left: getNumericValue(element.style.left) - amount });
          break;
        case 'right':
          updateElementStyle(id, { left: getNumericValue(element.style.left) + amount });
          break;
      }
    });
  }, [selectedElementIds, elements, updateElementStyle, saveHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Ctrl/Cmd + Y: Redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Ctrl/Cmd + C: Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        handleCopy();
        return;
      }

      // Ctrl/Cmd + V: Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
        return;
      }

      // Delete or Backspace: Delete selected elements
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          saveHistory();
          selectedElementIds.forEach((id) => deleteElement(id));
          clearSelection();
        }
        return;
      }

      // Ctrl/Cmd + D: Duplicate selected elements
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          saveHistory();
          const newIds: string[] = [];
          selectedElementIds.forEach((id) => {
            const newId = duplicateElement(id);
            if (newId) newIds.push(newId);
          });
          if (newIds.length > 0) {
            selectMultiple(newIds);
          }
        }
        return;
      }

      // Escape: Clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        return;
      }

      // Arrow Keys: Nudge elements (1px, or 10px with Shift)
      const nudgeAmount = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNudge('up', nudgeAmount);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNudge('down', nudgeAmount);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNudge('left', nudgeAmount);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNudge('right', nudgeAmount);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElementIds,
    elements,
    deleteElement,
    duplicateElement,
    clearSelection,
    selectMultiple,
    saveHistory,
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    handleNudge,
  ]);
}
