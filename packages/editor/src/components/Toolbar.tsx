/**
 * Toolbar - Top toolbar with element actions
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, useHistoryStore, useSettingsStore, CanvasState, useThemeStore, themeColors } from '@builder/core';

interface ToolbarProps {
  onCreateComponent?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  pageId?: string;
  pageTitle?: string;
  onBackToDashboard?: () => void;
}

export const Toolbar = memo(function Toolbar({ 
  onCreateComponent, 
  onExport, 
  onImport, 
  pageId, 
  pageTitle, 
  onBackToDashboard 
}: ToolbarProps) {
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
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

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

  // Theme-aware colors
  const colors = themeColors[resolvedTheme];

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  const themedButtonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  const disabledStyle: React.CSSProperties = {
    ...themedButtonStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...themedButtonStyle,
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: `1px solid ${colors.primaryHover}`,
  };

  const dangerButtonStyle: React.CSSProperties = {
    ...themedButtonStyle,
    backgroundColor: colors.danger,
    color: '#ffffff',
    border: `1px solid ${colors.dangerHover}`,
  };

  const toggleButtonStyle = (active: boolean): React.CSSProperties => ({
    ...themedButtonStyle,
    backgroundColor: active ? colors.primary : colors.surface,
    color: active ? '#ffffff' : colors.text,
    border: active ? `1px solid ${colors.primaryHover}` : `1px solid ${colors.border}`,
  });

  const smallButtonStyle: React.CSSProperties = {
    ...themedButtonStyle,
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
      backgroundColor: colors.surface,
      borderBottom: `1px solid ${colors.border}`,
      flexWrap: 'wrap',
    }}>
      {/* Back to Dashboard Button */}
      {onBackToDashboard && (
        <button
          onClick={onBackToDashboard}
          style={{
            ...themedButtonStyle,
            marginRight: 12,
          }}
          title="Panele Dön"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Panele Dön
        </button>
      )}
      
      {/* Page Title */}
      {pageTitle && (
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: colors.text,
          marginRight: 12,
          padding: '8px 0',
        }}>
          {pageTitle}
        </div>
      )}

      {/* Undo/Redo Section */}
      <div style={{ display: 'flex', gap: 4, borderRight: `1px solid ${colors.border}`, paddingRight: 12 }}>
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
      <div style={{ display: 'flex', gap: 4, borderRight: `1px solid ${colors.border}`, paddingRight: 12 }}>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
        )}
      </div>

      {/* Z-Index Controls */}
      <div style={{ display: 'flex', gap: 4, borderRight: `1px solid ${colors.border}`, paddingRight: 12 }}>
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

      {/* Quick Layout Controls - NEW */}
      {hasSingleSelection && elements[selectedElementIds[0]]?.type === 'container' && (
        <div style={{ display: 'flex', gap: 4, borderRight: `1px solid ${colors.border}`, paddingRight: 12, alignItems: 'center' }}>
          {/* Direction Toggle */}
          <button 
            style={toggleButtonStyle((elements[selectedElementIds[0]]?.props as any)?.direction === 'row')} 
            onClick={() => {
              saveHistory();
              useCanvasStore.getState().updateElementProps(selectedElementIds[0], { direction: 'row' });
            }}
            title="Row Direction"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button 
            style={toggleButtonStyle((elements[selectedElementIds[0]]?.props as any)?.direction === 'column')} 
            onClick={() => {
              saveHistory();
              useCanvasStore.getState().updateElementProps(selectedElementIds[0], { direction: 'column' });
            }}
            title="Column Direction"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
          
          {/* Divider */}
          <div style={{ width: 1, height: 20, backgroundColor: colors.border, margin: '0 4px' }} />
          
          {/* Justify Content */}
          <button 
            style={toggleButtonStyle((elements[selectedElementIds[0]]?.props as any)?.justifyContent === 'flex-start')} 
            onClick={() => {
              saveHistory();
              useCanvasStore.getState().updateElementProps(selectedElementIds[0], { justifyContent: 'flex-start' });
            }}
            title="Justify Start"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="4" height="16" rx="1" />
              <rect x="10" y="7" width="4" height="10" rx="1" />
              <rect x="16" y="10" width="4" height="4" rx="1" />
            </svg>
          </button>
          <button 
            style={toggleButtonStyle((elements[selectedElementIds[0]]?.props as any)?.justifyContent === 'center')} 
            onClick={() => {
              saveHistory();
              useCanvasStore.getState().updateElementProps(selectedElementIds[0], { justifyContent: 'center' });
            }}
            title="Justify Center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="7" width="4" height="10" rx="1" />
              <rect x="10" y="4" width="4" height="16" rx="1" />
              <rect x="16" y="7" width="4" height="10" rx="1" />
            </svg>
          </button>
          <button 
            style={toggleButtonStyle((elements[selectedElementIds[0]]?.props as any)?.justifyContent === 'flex-end')} 
            onClick={() => {
              saveHistory();
              useCanvasStore.getState().updateElementProps(selectedElementIds[0], { justifyContent: 'flex-end' });
            }}
            title="Justify End"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="10" width="4" height="4" rx="1" />
              <rect x="10" y="7" width="4" height="10" rx="1" />
              <rect x="16" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
          <button 
            style={toggleButtonStyle((elements[selectedElementIds[0]]?.props as any)?.justifyContent === 'space-between')} 
            onClick={() => {
              saveHistory();
              useCanvasStore.getState().updateElementProps(selectedElementIds[0], { justifyContent: 'space-between' });
            }}
            title="Space Between"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="4" height="16" rx="1" />
              <rect x="16" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
        </div>
      )}

      {/* Grid & Snap Toggles */}
      <div style={{ display: 'flex', gap: 4, borderRight: `1px solid ${colors.border}`, paddingRight: 12 }}>
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
          color: colors.text, 
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

      {/* Import Button */}
      {onImport && (
        <button
          style={{
            marginLeft: 8,
            padding: '8px 16px',
            border: 'none',
            borderRadius: 8,
            backgroundColor: '#8b5cf6',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          onClick={onImport}
          title="HTML Dosyası İçe Aktar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          İçe Aktar
        </button>
      )}

      {/* Export Button */}
      {onExport && (
        <button
          style={{
            marginLeft: 8,
            padding: '8px 16px',
            border: 'none',
            borderRadius: 8,
            backgroundColor: '#10b981',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          onClick={onExport}
          title="Kodu Dışa Aktar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Dışa Aktar
        </button>
      )}

      {/* Dark Mode Toggle */}
      <button
        style={{
          marginLeft: 8,
          padding: '8px 12px',
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          backgroundColor: colors.surface,
          color: colors.text,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
        onClick={toggleTheme}
        title={resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      >
        {resolvedTheme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </button>

      {/* Selection Info */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
         <div style={{ fontSize: 12, color: colors.textMuted }}>
           {hasSelection 
             ? `${selectedElementIds.length} element${selectedElementIds.length > 1 ? 's' : ''} selected`
             : 'No selection'
           }
         </div>

         {/* Save Button (API Test) */}
         <SaveButton pageId={pageId} />
      </div>
    </div>
  );
});

// Simple internal component for Save logic
function SaveButton({ pageId }: { pageId?: string }) {
  const [loading, setLoading] = React.useState(false);
  const importCmsService = async () => {
      // Import from core package entry point
      const { cmsService } = await import('@builder/core');
      return cmsService;
  };

  const handleSave = async () => {
    if (!pageId) {
      alert('Sayfa ID bulunamadı');
      return;
    }
    
    setLoading(true);
    try {
      const service = await importCmsService();
      const result = await service.savePage(pageId);
      console.log('Save Result:', result);
      alert('Sayfa kaydedildi! (Detaylar için konsolu kontrol edin)');
    } catch (err) {
      console.error(err);
      alert('Kaydetme başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      style={{
        padding: '8px 16px',
        border: 'none',
        borderRadius: 8,
        backgroundColor: loading ? '#93c5fd' : '#2563eb',
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
        cursor: loading ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
      title="Save to CMS (Mock)"
    >
      {loading ? 'Saving...' : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Kaydet
        </>
      )}
    </button>
  );
}
