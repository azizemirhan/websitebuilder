/**
 * Layers Panel - Element tree view
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, Element } from '@builder/core';

interface LayerItemProps {
  elementId: string;
  depth: number;
}

const LayerItem = memo(function LayerItem({ elementId, depth }: LayerItemProps) {
  const element = useCanvasStore((state) => state.elements[elementId]);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const selectElement = useCanvasStore((state) => state.selectElement);
  const updateElement = useCanvasStore((state) => state.updateElement);

  const isSelected = selectedIds.includes(elementId);
  const isExpanded = true; // Could be state later

  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(elementId, e.shiftKey);
  }, [elementId, selectElement]);

  const handleToggleLock = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(elementId, { locked: !element?.locked });
  }, [elementId, element?.locked, updateElement]);

  const handleToggleHidden = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(elementId, { hidden: !element?.hidden });
  }, [elementId, element?.hidden, updateElement]);

  if (!element) return null;

  const typeIcon: Record<string, string> = {
    container: '⬛',
    text: 'T',
    button: '⏹',
    image: '🖼',
    input: '▭',
  };

  return (
    <>
      <div
        onClick={handleSelect}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 8px',
          paddingLeft: 8 + depth * 16,
          cursor: 'pointer',
          backgroundColor: isSelected ? '#e0e7ff' : 'transparent',
          borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
          fontSize: 13,
          color: element.hidden ? '#9ca3af' : '#374151',
        }}
      >
        {/* Expand/Collapse (future) */}
        {element.children.length > 0 && (
          <span style={{ fontSize: 10, color: '#9ca3af' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        
        {/* Type icon */}
        <span style={{ fontSize: 12, width: 16, textAlign: 'center' }}>
          {typeIcon[element.type] || '□'}
        </span>
        
        {/* Name */}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {element.name}
        </span>
        
        {/* Lock button */}
        <button
          onClick={handleToggleLock}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            opacity: element.locked ? 1 : 0.3,
            fontSize: 12,
            padding: 2,
          }}
          title={element.locked ? 'Unlock' : 'Lock'}
        >
          {element.locked ? '🔒' : '🔓'}
        </button>
        
        {/* Visibility button */}
        <button
          onClick={handleToggleHidden}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            opacity: element.hidden ? 0.5 : 1,
            fontSize: 12,
            padding: 2,
          }}
          title={element.hidden ? 'Show' : 'Hide'}
        >
          {element.hidden ? '👁️‍🗨️' : '👁️'}
        </button>
      </div>
      
      {/* Children */}
      {isExpanded && element.children.map((childId) => (
        <LayerItem key={childId} elementId={childId} depth={depth + 1} />
      ))}
    </>
  );
});

export const LayersPanel = memo(function LayersPanel() {
  const rootElementIds = useCanvasStore((state) => state.rootElementIds);
  const clearSelection = useCanvasStore((state) => state.clearSelection);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e5e7eb',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        fontWeight: 600,
        fontSize: 13,
        color: '#1f2937',
      }}>
        Layers
      </div>
      
      {/* Layer list */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto',
          padding: '8px 0',
        }}
        onClick={() => clearSelection()}
      >
        {rootElementIds.length === 0 ? (
          <div style={{ 
            padding: 16, 
            textAlign: 'center', 
            color: '#9ca3af',
            fontSize: 13,
          }}>
            No elements yet.<br />
            Add elements from the toolbar.
          </div>
        ) : (
          rootElementIds.map((id) => (
            <LayerItem key={id} elementId={id} depth={0} />
          ))
        )}
      </div>
    </div>
  );
});
