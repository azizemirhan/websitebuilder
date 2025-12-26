/**
 * Flex Item Panel - Controls for flex children
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState, StyleProperties } from '@builder/core';

export const FlexItemPanel = memo(function FlexItemPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  
  // Check if parent is flex container
  const parentElement = selectedElement?.parentId ? elements[selectedElement.parentId] : null;
  const parentIsFlex = parentElement?.style.display === 'flex' || parentElement?.style.display === 'inline-flex';

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

  const updateStyle = useCallback((style: Partial<StyleProperties>) => {
    if (!selectedElement) return;
    saveHistory();
    updateElementStyle(selectedElement.id, style);
  }, [selectedElement, updateElementStyle, saveHistory]);

  if (!selectedElement || !parentIsFlex) {
    return null;
  }

  const style = selectedElement.style;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 13,
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  };

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
        Flex Item
      </div>

      {/* Flex Grow / Shrink / Basis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        <div>
          <div style={labelStyle}>Grow</div>
          <input
            type="number"
            style={inputStyle}
            value={style.flexGrow ?? 0}
            onChange={(e) => updateStyle({ flexGrow: Number(e.target.value) })}
            min={0}
          />
        </div>
        <div>
          <div style={labelStyle}>Shrink</div>
          <input
            type="number"
            style={inputStyle}
            value={style.flexShrink ?? 1}
            onChange={(e) => updateStyle({ flexShrink: Number(e.target.value) })}
            min={0}
          />
        </div>
        <div>
          <div style={labelStyle}>Basis</div>
          <input
            type="number"
            style={inputStyle}
            value={typeof style.flexBasis === 'number' ? style.flexBasis : 0}
            onChange={(e) => updateStyle({ flexBasis: Number(e.target.value) || 'auto' })}
            placeholder="auto"
          />
        </div>
      </div>

      {/* Align Self */}
      <div style={{ marginBottom: 12 }}>
        <div style={labelStyle}>Align Self</div>
        <select
          style={selectStyle}
          value={style.alignSelf || 'auto'}
          onChange={(e) => updateStyle({ alignSelf: e.target.value as StyleProperties['alignSelf'] })}
        >
          <option value="auto">Auto</option>
          <option value="flex-start">Start</option>
          <option value="center">Center</option>
          <option value="flex-end">End</option>
          <option value="stretch">Stretch</option>
          <option value="baseline">Baseline</option>
        </select>
      </div>

      {/* Order */}
      <div>
        <div style={labelStyle}>Order</div>
        <input
          type="number"
          style={inputStyle}
          value={style.order ?? 0}
          onChange={(e) => updateStyle({ order: Number(e.target.value) })}
        />
      </div>
    </div>
  );
});
