/**
 * Context Menu - Right-click popup menu
 */

import React, { memo, useCallback, useState, useEffect } from 'react';
import { useCanvasStore, useHistoryStore, useClipboardStore, CanvasState, Element } from '@builder/core';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const ContextMenu = memo(function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const elements = useCanvasStore((state) => state.elements);
  const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);
  const deleteElement = useCanvasStore((state) => state.deleteElement);
  const duplicateElement = useCanvasStore((state) => state.duplicateElement);
  const updateElement = useCanvasStore((state) => state.updateElement);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  const selectMultiple = useCanvasStore((state) => state.selectMultiple);
  const addElement = useCanvasStore((state) => state.addElement);
  
  const addToHistory = useHistoryStore((state) => state.addToHistory);
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

  const selectedElement = selectedElementIds.length === 1 ? elements[selectedElementIds[0]] : null;

  const handleCopy = useCallback(() => {
    const selectedElements = selectedElementIds
      .map((id) => elements[id])
      .filter(Boolean) as Element[];
    copyElements(selectedElements);
    onClose();
  }, [selectedElementIds, elements, copyElements, onClose]);

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
          left: (el.style.left || 0) + 20,
          top: (el.style.top || 0) + 20,
        },
        props: el.props,
      } as Parameters<typeof addElement>[0]);
      newIds.push(newId);
    });
    
    if (newIds.length > 0) {
      selectMultiple(newIds);
    }
    onClose();
  }, [copiedElements, addElement, selectMultiple, saveHistory, onClose]);

  const handleDuplicate = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    saveHistory();
    const newIds: string[] = [];
    selectedElementIds.forEach((id) => {
      const newId = duplicateElement(id);
      if (newId) newIds.push(newId);
    });
    if (newIds.length > 0) {
      selectMultiple(newIds);
    }
    onClose();
  }, [selectedElementIds, duplicateElement, selectMultiple, saveHistory, onClose]);

  const handleDelete = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    saveHistory();
    selectedElementIds.forEach((id) => deleteElement(id));
    clearSelection();
    onClose();
  }, [selectedElementIds, deleteElement, clearSelection, saveHistory, onClose]);

  const handleToggleLock = useCallback(() => {
    if (!selectedElement) return;
    saveHistory();
    updateElement(selectedElement.id, { locked: !selectedElement.locked });
    onClose();
  }, [selectedElement, updateElement, saveHistory, onClose]);

  const handleToggleHide = useCallback(() => {
    if (!selectedElement) return;
    saveHistory();
    updateElement(selectedElement.id, { hidden: !selectedElement.hidden });
    onClose();
  }, [selectedElement, updateElement, saveHistory, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: y,
    left: x,
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    padding: '6px 0',
    minWidth: 180,
    zIndex: 10000,
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px',
    fontSize: 13,
    color: '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.1s',
  };

  const disabledStyle: React.CSSProperties = {
    ...itemStyle,
    color: '#9ca3af',
    cursor: 'not-allowed',
  };

  const separatorStyle: React.CSSProperties = {
    height: 1,
    backgroundColor: '#e5e7eb',
    margin: '6px 0',
  };

  const shortcutStyle: React.CSSProperties = {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#9ca3af',
  };

  return (
    <div style={menuStyle} onClick={(e) => e.stopPropagation()}>
      <div 
        style={selectedElementIds.length > 0 ? itemStyle : disabledStyle}
        onClick={selectedElementIds.length > 0 ? handleCopy : undefined}
        onMouseEnter={(e) => selectedElementIds.length > 0 && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span>Copy</span>
        <span style={shortcutStyle}>Ctrl+C</span>
      </div>
      <div 
        style={copiedElements.length > 0 ? itemStyle : disabledStyle}
        onClick={copiedElements.length > 0 ? handlePaste : undefined}
        onMouseEnter={(e) => copiedElements.length > 0 && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span>Paste</span>
        <span style={shortcutStyle}>Ctrl+V</span>
      </div>
      <div 
        style={selectedElementIds.length > 0 ? itemStyle : disabledStyle}
        onClick={selectedElementIds.length > 0 ? handleDuplicate : undefined}
        onMouseEnter={(e) => selectedElementIds.length > 0 && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span>Duplicate</span>
        <span style={shortcutStyle}>Ctrl+D</span>
      </div>
      
      <div style={separatorStyle} />
      
      {selectedElement && (
        <>
          <div 
            style={itemStyle}
            onClick={handleToggleLock}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span>{selectedElement.locked ? 'Unlock' : 'Lock'}</span>
          </div>
          <div 
            style={itemStyle}
            onClick={handleToggleHide}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span>{selectedElement.hidden ? 'Show' : 'Hide'}</span>
          </div>
          <div style={separatorStyle} />
        </>
      )}
      
      <div 
        style={selectedElementIds.length > 0 ? { ...itemStyle, color: '#ef4444' } : disabledStyle}
        onClick={selectedElementIds.length > 0 ? handleDelete : undefined}
        onMouseEnter={(e) => selectedElementIds.length > 0 && (e.currentTarget.style.backgroundColor = '#fef2f2')}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span>Delete</span>
        <span style={shortcutStyle}>Del</span>
      </div>
    </div>
  );
});
