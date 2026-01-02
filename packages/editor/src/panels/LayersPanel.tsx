/**
 * Layers Panel - Element tree view
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, Element, useThemeStore, themeColors } from '@builder/core';

interface LayerItemProps {
  elementId: string;
  depth: number;
}

const LayerItem = memo(function LayerItem({ elementId, depth }: LayerItemProps) {
  const element = useCanvasStore((state) => state.elements[elementId]);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const selectElement = useCanvasStore((state) => state.selectElement);
  const updateElement = useCanvasStore((state) => state.updateElement);
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

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
          backgroundColor: isSelected ? colors.primary : 'transparent',
          borderLeft: isSelected ? '2px solid ' + colors.primary : '2px solid transparent',
          fontSize: 13,
          color: isSelected ? '#ffffff' : (element.hidden ? colors.textMuted : colors.text),
        }}
      >
        {/* Expand/Collapse (future) */}
        {element.children.length > 0 && (
          <span style={{ fontSize: 10, color: colors.textMuted }}>
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
            color: colors.text,
          }}
          title={element.locked ? 'Unlock' : 'Lock'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {element.locked ? (
              <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>
            ) : (
              <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 019.9-1" /></>
            )}
          </svg>
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
            color: colors.text,
          }}
          title={element.hidden ? 'Show' : 'Hide'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {element.hidden ? (
              <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
            ) : (
              <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
            )}
          </svg>
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
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: colors.surface,
      borderRight: `1px solid ${colors.border}`,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
        fontWeight: 600,
        fontSize: 13,
        color: colors.text,
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
            color: colors.textMuted,
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
