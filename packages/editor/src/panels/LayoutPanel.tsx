/**
 * Layout Panel - Flexbox and Grid layout controls
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState, StyleProperties, useThemeStore, themeColors } from '@builder/core';

export const LayoutPanel = memo(function LayoutPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

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
    return (
      <div style={{ padding: 16, color: colors.textMuted, fontSize: 13 }}>
        Select an element to edit its layout
      </div>
    );
  }

  const style = selectedElement.style;
  const isFlexContainer = style.display === 'flex' || style.display === 'inline-flex';
  const isGridContainer = style.display === 'grid' || style.display === 'inline-grid';

  const sectionStyle: React.CSSProperties = {
    padding: 16,
    borderBottom: `1px solid ${colors.border}`,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 13,
    backgroundColor: colors.surface,
    color: colors.text,
    cursor: 'pointer',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: 4,
  };

  const toggleButtonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px',
    border: '1px solid',
    borderColor: active ? colors.primary : colors.border,
    borderRadius: 6,
    backgroundColor: active ? colors.primary : colors.surface,
    color: active ? '#ffffff' : colors.text,
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 13,
    backgroundColor: colors.surface,
    color: colors.text,
  };

  return (
    <div style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}` }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: colors.text, margin: 0 }}>Layout</h3>
      </div>

      {/* Display Type */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Display</div>
        <select
          style={selectStyle}
          value={style.display || 'block'}
          onChange={(e) => updateStyle({ display: e.target.value as StyleProperties['display'] })}
        >
          <option value="block">Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
          <option value="inline-block">Inline Block</option>
          <option value="inline-flex">Inline Flex</option>
          <option value="none">None</option>
        </select>
      </div>

      {/* Flexbox Controls */}
      {isFlexContainer && (
        <>
          {/* Direction */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Direction</div>
            <div style={buttonGroupStyle}>
              {(['row', 'column', 'row-reverse', 'column-reverse'] as const).map((dir) => (
                <button
                  key={dir}
                  style={toggleButtonStyle(style.flexDirection === dir)}
                  onClick={() => updateStyle({ flexDirection: dir })}
                  title={dir}
                >
                  {dir === 'row' && '→'}
                  {dir === 'column' && '↓'}
                  {dir === 'row-reverse' && '←'}
                  {dir === 'column-reverse' && '↑'}
                </button>
              ))}
            </div>
          </div>

          {/* Wrap */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Wrap</div>
            <div style={buttonGroupStyle}>
              {(['nowrap', 'wrap', 'wrap-reverse'] as const).map((wrap) => (
                <button
                  key={wrap}
                  style={toggleButtonStyle(style.flexWrap === wrap)}
                  onClick={() => updateStyle({ flexWrap: wrap })}
                >
                  {wrap}
                </button>
              ))}
            </div>
          </div>

          {/* Justify Content */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Justify Content</div>
            <select
              style={selectStyle}
              value={style.justifyContent || 'flex-start'}
              onChange={(e) => updateStyle({ justifyContent: e.target.value as StyleProperties['justifyContent'] })}
            >
              <option value="flex-start">Start</option>
              <option value="flex-end">End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          {/* Align Items */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Align Items</div>
            <select
              style={selectStyle}
              value={style.alignItems || 'stretch'}
              onChange={(e) => updateStyle({ alignItems: e.target.value as StyleProperties['alignItems'] })}
            >
              <option value="flex-start">Start</option>
              <option value="flex-end">End</option>
              <option value="center">Center</option>
              <option value="stretch">Stretch</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>

          {/* Gap */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Gap</div>
            <input
              type="number"
              style={inputStyle}
              value={style.gap || 0}
              onChange={(e) => updateStyle({ gap: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
        </>
      )}

      {/* Grid Controls */}
      {isGridContainer && (
        <>
          {/* Columns */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Columns</div>
            <input
              type="text"
              style={inputStyle}
              value={style.gridTemplateColumns || ''}
              onChange={(e) => updateStyle({ gridTemplateColumns: e.target.value })}
              placeholder="e.g. 1fr 1fr 1fr"
            />
          </div>

          {/* Rows */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Rows</div>
            <input
              type="text"
              style={inputStyle}
              value={style.gridTemplateRows || ''}
              onChange={(e) => updateStyle({ gridTemplateRows: e.target.value })}
              placeholder="e.g. auto auto"
            />
          </div>

          {/* Grid Gap */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Gap</div>
            <input
              type="number"
              style={inputStyle}
              value={style.gap || 0}
              onChange={(e) => updateStyle({ gap: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
        </>
      )}
    </div>
  );
});
