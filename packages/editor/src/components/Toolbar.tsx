/**
 * Toolbar - Top toolbar with element actions
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, useHistoryStore, useSettingsStore, CanvasState } from '@builder/core';

interface ToolbarProps {
  onCreateComponent?: () => void;
}

export const Toolbar = memo(function Toolbar({ onCreateComponent }: ToolbarProps) {
  const elements = useCanvasStore((state) => state.elements);
  const addElement = useCanvasStore((state) => state.addElement);
  const deleteElement = useCanvasStore((state) => state.deleteElement);
  const duplicateElement = useCanvasStore((state) => state.duplicateElement);
  const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  const canUndo = useHistoryStore((state) => state.canUndo);
  const canRedo = useHistoryStore((state) => state.canRedo);
  
  // Settings
  const zoom = useSettingsStore((state) => state.zoom);
  const setZoom = useSettingsStore((state) => state.setZoom);
  const resetView = useSettingsStore((state) => state.resetView);
  const showGrid = useSettingsStore((state) => state.showGrid);
  const toggleGrid = useSettingsStore((state) => state.toggleGrid);
  const snapToGrid = useSettingsStore((state) => state.snapToGrid);
  const toggleSnapToGrid = useSettingsStore((state) => state.toggleSnapToGrid);
  const showRulers = useSettingsStore((state) => state.showRulers);
  const toggleRulers = useSettingsStore((state) => state.toggleRulers);

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

  const handleAddElement = useCallback((type: 'container' | 'text' | 'button' | 'image' | 'input') => {
    saveHistory();
    const id = addElement({ type });
    useCanvasStore.getState().selectElement(id);
  }, [addElement, saveHistory]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    saveHistory();
    selectedElementIds.forEach((id) => deleteElement(id));
    clearSelection();
  }, [selectedElementIds, deleteElement, clearSelection, saveHistory]);

  const handleDuplicateSelected = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    saveHistory();
    const newIds: string[] = [];
    selectedElementIds.forEach((id) => {
      const newId = duplicateElement(id);
      if (newId) newIds.push(newId);
    });
    if (newIds.length > 0) {
      useCanvasStore.getState().selectMultiple(newIds);
    }
  }, [selectedElementIds, duplicateElement, saveHistory]);

  // Z-Index controls
  const handleBringForward = useCallback(() => {
    if (selectedElementIds.length !== 1) return;
    const element = elements[selectedElementIds[0]];
    if (!element) return;
    saveHistory();
    const currentZ = element.style.zIndex || 0;
    updateElementStyle(selectedElementIds[0], { zIndex: currentZ + 1 });
  }, [selectedElementIds, elements, updateElementStyle, saveHistory]);

  const handleSendBackward = useCallback(() => {
    if (selectedElementIds.length !== 1) return;
    const element = elements[selectedElementIds[0]];
    if (!element) return;
    saveHistory();
    const currentZ = element.style.zIndex || 0;
    updateElementStyle(selectedElementIds[0], { zIndex: Math.max(0, currentZ - 1) });
  }, [selectedElementIds, elements, updateElementStyle, saveHistory]);

  const handleBringToFront = useCallback(() => {
    if (selectedElementIds.length !== 1) return;
    saveHistory();
    // Find max z-index
    const maxZ = Math.max(...Object.values(elements).map((el) => el.style.zIndex || 0));
    updateElementStyle(selectedElementIds[0], { zIndex: maxZ + 1 });
  }, [selectedElementIds, elements, updateElementStyle, saveHistory]);

  const handleSendToBack = useCallback(() => {
    if (selectedElementIds.length !== 1) return;
    saveHistory();
    updateElementStyle(selectedElementIds[0], { zIndex: 0 });
  }, [selectedElementIds, updateElementStyle, saveHistory]);

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

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const disabledStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: '1px solid #2563eb',
  };

  const dangerButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: '1px solid #dc2626',
  };

  const toggleButtonStyle = (active: boolean): React.CSSProperties => ({
    ...buttonStyle,
    backgroundColor: active ? '#dbeafe' : '#ffffff',
    color: active ? '#1d4ed8' : '#374151',
    border: active ? '1px solid #3b82f6' : '1px solid #e5e7eb',
  });

  const smallButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    padding: '6px 8px',
    minWidth: 32,
  };

  const hasSelection = selectedElementIds.length > 0;
  const hasSingleSelection = selectedElementIds.length === 1;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px 16px',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      flexWrap: 'wrap',
    }}>
      {/* Add Elements Section */}
      <div style={{ display: 'flex', gap: 4, borderRight: '1px solid #e5e7eb', paddingRight: 12 }}>
        <button style={primaryButtonStyle} onClick={() => handleAddElement('container')} title="Add Container">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          Container
        </button>
        <button style={buttonStyle} onClick={() => handleAddElement('text')} title="Add Text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7V4h16v3M9 20h6M12 4v16" />
          </svg>
          Text
        </button>
        <button style={buttonStyle} onClick={() => handleAddElement('button')} title="Add Button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
          </svg>
          Button
        </button>
      </div>

      {/* Undo/Redo Section */}
      <div style={{ display: 'flex', gap: 4, borderRight: '1px solid #e5e7eb', paddingRight: 12 }}>
        <button 
          style={canUndo() ? buttonStyle : disabledStyle} 
          onClick={handleUndo}
          disabled={!canUndo()}
          title="Undo (Ctrl+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7v6h6M3 13c1.5-5 6-8 12-8 5 0 9 4 9 9s-4 9-9 9c-4 0-7-2-9-6" />
          </svg>
        </button>
        <button 
          style={canRedo() ? buttonStyle : disabledStyle} 
          onClick={handleRedo}
          disabled={!canRedo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 7v6h-6M21 13c-1.5-5-6-8-12-8-5 0-9 4-9 9s4 9 9 9c4 0 7-2 9-6" />
          </svg>
        </button>
      </div>

      {/* Element Actions Section */}
      <div style={{ display: 'flex', gap: 4, borderRight: '1px solid #e5e7eb', paddingRight: 12 }}>
        <button 
          style={hasSelection ? buttonStyle : disabledStyle} 
          onClick={handleDuplicateSelected}
          disabled={!hasSelection}
          title="Duplicate (Ctrl+D)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>
        <button 
          style={hasSelection ? dangerButtonStyle : disabledStyle} 
          onClick={handleDeleteSelected}
          disabled={!hasSelection}
          title="Delete (Del)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
        {/* Create Component Button */}
        {onCreateComponent && (
          <button 
            style={hasSelection ? {
              ...buttonStyle,
              backgroundColor: '#8b5cf6',
              color: '#fff',
              border: '1px solid #8b5cf6',
            } : disabledStyle} 
            onClick={onCreateComponent}
            disabled={!hasSelection}
            title="Create Component (Ctrl+Alt+K)"
          >
            🧩
          </button>
        )}
      </div>

      {/* Z-Index Controls */}
      <div style={{ display: 'flex', gap: 4, borderRight: '1px solid #e5e7eb', paddingRight: 12 }}>
        <button 
          style={hasSingleSelection ? smallButtonStyle : disabledStyle} 
          onClick={handleBringToFront}
          disabled={!hasSingleSelection}
          title="Bring to Front"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="8" y="2" width="12" height="12" rx="1" />
            <path d="M4 14h10v6H4z" strokeDasharray="2 2" />
          </svg>
        </button>
        <button 
          style={hasSingleSelection ? smallButtonStyle : disabledStyle} 
          onClick={handleBringForward}
          disabled={!hasSingleSelection}
          title="Bring Forward"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5l-7 7h4v6h6v-6h4z" />
          </svg>
        </button>
        <button 
          style={hasSingleSelection ? smallButtonStyle : disabledStyle} 
          onClick={handleSendBackward}
          disabled={!hasSingleSelection}
          title="Send Backward"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19l7-7h-4V6H9v6H5z" />
          </svg>
        </button>
        <button 
          style={hasSingleSelection ? smallButtonStyle : disabledStyle} 
          onClick={handleSendToBack}
          disabled={!hasSingleSelection}
          title="Send to Back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="10" width="12" height="12" rx="1" />
            <path d="M10 2h10v10" strokeDasharray="2 2" />
          </svg>
        </button>
      </div>

      {/* Grid & Snap Toggles */}
      <div style={{ display: 'flex', gap: 4, borderRight: '1px solid #e5e7eb', paddingRight: 12 }}>
        <button 
          style={toggleButtonStyle(showGrid)} 
          onClick={toggleGrid}
          title="Toggle Grid"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" />
            <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
          </svg>
        </button>
        <button 
          style={toggleButtonStyle(snapToGrid)} 
          onClick={toggleSnapToGrid}
          title="Toggle Snap to Grid"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </button>
        <button 
          style={toggleButtonStyle(showRulers)} 
          onClick={toggleRulers}
          title="Toggle Rulers"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h18v6H3zM3 3v18h6V3" />
            <path d="M6 6v3M9 6v1.5M12 6v3M15 6v1.5M18 6v3" />
          </svg>
        </button>
      </div>

      {/* Zoom Controls */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button 
          style={smallButtonStyle} 
          onClick={() => setZoom(zoom - 0.1)}
          disabled={zoom <= 0.1}
          title="Zoom Out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35M8 11h6" />
          </svg>
        </button>
        <span style={{ 
          fontSize: 12, 
          color: '#374151', 
          minWidth: 50, 
          textAlign: 'center',
          fontWeight: 500,
        }}>
          {Math.round(zoom * 100)}%
        </span>
        <button 
          style={smallButtonStyle} 
          onClick={() => setZoom(zoom + 0.1)}
          disabled={zoom >= 5}
          title="Zoom In"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
          </svg>
        </button>
        <button 
          style={smallButtonStyle} 
          onClick={resetView}
          title="Reset View (100%)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0M12 8v4M12 16h.01" />
          </svg>
        </button>
      </div>

      {/* Selection Info */}
      <div style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>
        {hasSelection 
          ? `${selectedElementIds.length} element${selectedElementIds.length > 1 ? 's' : ''} selected`
          : 'No selection'
        }
      </div>
    </div>
  );
});
