/**
 * Grid Editor Panel - Visual grid template builder
 */

import React, { memo, useCallback, useState } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState, StyleProperties } from '@builder/core';

const GRID_PRESETS = [
  { name: '2 Columns', columns: '1fr 1fr', rows: 'auto' },
  { name: '3 Columns', columns: '1fr 1fr 1fr', rows: 'auto' },
  { name: '4 Columns', columns: 'repeat(4, 1fr)', rows: 'auto' },
  { name: '2x2 Grid', columns: '1fr 1fr', rows: '1fr 1fr' },
  { name: '3x3 Grid', columns: 'repeat(3, 1fr)', rows: 'repeat(3, 1fr)' },
  { name: 'Sidebar Left', columns: '250px 1fr', rows: 'auto' },
  { name: 'Sidebar Right', columns: '1fr 250px', rows: 'auto' },
  { name: 'Holy Grail', columns: '200px 1fr 200px', rows: 'auto 1fr auto' },
];

export const GridEditorPanel = memo(function GridEditorPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;

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

  if (!selectedElement) {
    return null;
  }

  const style = selectedElement.style;
  const isGrid = style.display === 'grid' || style.display === 'inline-grid';

  const enableGrid = () => {
    saveHistory();
    updateElementStyle(selectedElement.id, {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'auto',
      gap: 16,
    });
  };

  if (!isGrid) {
    return (
      <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
        <button
          style={{
            width: '100%',
            padding: '12px',
            border: '2px dashed #e5e7eb',
            borderRadius: 8,
            backgroundColor: '#f9fafb',
            color: '#6b7280',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onClick={enableGrid}
        >
          <span>⊞</span>
          Enable Grid Layout
        </button>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'monospace',
  };

  const presetStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    fontSize: 11,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  // Parse grid template for visualization
  const columns = (style.gridTemplateColumns || '').split(' ').filter(Boolean);
  const rows = (style.gridTemplateRows || '').split(' ').filter(Boolean);

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
          Grid Editor
        </span>
        <button
          style={{
            padding: '4px 8px',
            border: '1px solid #dc2626',
            borderRadius: 4,
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            fontSize: 10,
            cursor: 'pointer',
          }}
          onClick={() => updateStyle({ display: 'block' })}
        >
          Remove Grid
        </button>
      </div>

      {/* Visual Grid Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: style.gridTemplateColumns || 'auto',
          gridTemplateRows: style.gridTemplateRows || 'auto',
          gap: 4,
          padding: 8,
          backgroundColor: '#f3f4f6',
          borderRadius: 8,
          marginBottom: 12,
          minHeight: 80,
        }}
      >
        {Array.from({ length: Math.max(columns.length * Math.max(rows.length, 1), 1) }).map((_, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#dbeafe',
              border: '1px dashed #3b82f6',
              borderRadius: 4,
              minHeight: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: '#3b82f6',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Presets */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Presets</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {GRID_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset.name}
              style={presetStyle}
              onClick={() =>
                updateStyle({
                  gridTemplateColumns: preset.columns,
                  gridTemplateRows: preset.rows,
                })
              }
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Input */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Columns</div>
        <input
          type="text"
          style={inputStyle}
          value={style.gridTemplateColumns || ''}
          onChange={(e) => updateStyle({ gridTemplateColumns: e.target.value })}
          placeholder="e.g. 1fr 1fr 1fr"
        />
        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
          Use: 1fr, px, %, auto, minmax(), repeat()
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Rows</div>
        <input
          type="text"
          style={inputStyle}
          value={style.gridTemplateRows || ''}
          onChange={(e) => updateStyle({ gridTemplateRows: e.target.value })}
          placeholder="e.g. auto 1fr auto"
        />
      </div>

      {/* Gap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Row Gap</div>
          <input
            type="number"
            style={{ ...inputStyle, fontFamily: 'inherit' }}
            value={style.rowGap ?? style.gap ?? 0}
            onChange={(e) => updateStyle({ rowGap: Number(e.target.value) })}
          />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Column Gap</div>
          <input
            type="number"
            style={{ ...inputStyle, fontFamily: 'inherit' }}
            value={style.columnGap ?? style.gap ?? 0}
            onChange={(e) => updateStyle({ columnGap: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
});
