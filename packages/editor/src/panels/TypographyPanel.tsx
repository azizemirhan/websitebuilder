/**
 * Typography Panel - Font and text controls
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState, StyleProperties } from '@builder/core';

const FONT_FAMILIES = [
  { name: 'System', value: 'system-ui, -apple-system, sans-serif' },
  { name: 'Inter', value: '"Inter", sans-serif' },
  { name: 'Roboto', value: '"Roboto", sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Poppins', value: '"Poppins", sans-serif' },
  { name: 'Montserrat', value: '"Montserrat", sans-serif' },
  { name: 'Playfair', value: '"Playfair Display", serif' },
  { name: 'Merriweather', value: '"Merriweather", serif' },
  { name: 'Mono', value: '"JetBrains Mono", monospace' },
];

const FONT_WEIGHTS = [
  { name: 'Thin', value: 100 },
  { name: 'Light', value: 300 },
  { name: 'Regular', value: 400 },
  { name: 'Medium', value: 500 },
  { name: 'SemiBold', value: 600 },
  { name: 'Bold', value: 700 },
  { name: 'ExtraBold', value: 800 },
  { name: 'Black', value: 900 },
];

export const TypographyPanel = memo(function TypographyPanel() {
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 12,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
  };

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px',
    border: '1px solid',
    borderColor: active ? '#3b82f6' : '#e5e7eb',
    backgroundColor: active ? '#dbeafe' : '#fff',
    color: active ? '#1d4ed8' : '#374151',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
  });

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
        Typography
      </div>

      {/* Font Family */}
      <div style={{ marginBottom: 12 }}>
        <div style={labelStyle}>Font Family</div>
        <select
          style={{ ...inputStyle, cursor: 'pointer' }}
          value={style.fontFamily || 'system-ui, -apple-system, sans-serif'}
          onChange={(e) => updateStyle({ fontFamily: e.target.value })}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.name} value={font.value}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      {/* Size & Weight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div>
          <div style={labelStyle}>Size (px)</div>
          <input
            type="number"
            style={inputStyle}
            value={style.fontSize || 16}
            onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
          />
        </div>
        <div>
          <div style={labelStyle}>Weight</div>
          <select
            style={{ ...inputStyle, cursor: 'pointer' }}
            value={style.fontWeight || 400}
            onChange={(e) => updateStyle({ fontWeight: Number(e.target.value) })}
          >
            {FONT_WEIGHTS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Line Height & Letter Spacing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div>
          <div style={labelStyle}>Line Height</div>
          <input
            type="number"
            step="0.1"
            style={inputStyle}
            value={style.lineHeight || 1.5}
            onChange={(e) => updateStyle({ lineHeight: Number(e.target.value) })}
          />
        </div>
        <div>
          <div style={labelStyle}>Letter Spacing</div>
          <input
            type="number"
            step="0.1"
            style={inputStyle}
            value={style.letterSpacing || 0}
            onChange={(e) => updateStyle({ letterSpacing: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Text Align */}
      <div style={{ marginBottom: 12 }}>
        <div style={labelStyle}>Alignment</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['left', 'center', 'right', 'justify'] as const).map((align) => (
            <button
              key={align}
              style={toggleStyle(style.textAlign === align)}
              onClick={() => updateStyle({ textAlign: align })}
            >
              {align === 'left' && '⬅'}
              {align === 'center' && '⏺'}
              {align === 'right' && '➡'}
              {align === 'justify' && '☰'}
            </button>
          ))}
        </div>
      </div>

      {/* Text Transform */}
      <div style={{ marginBottom: 12 }}>
        <div style={labelStyle}>Transform</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['none', 'uppercase', 'lowercase', 'capitalize'] as const).map((transform) => (
            <button
              key={transform}
              style={toggleStyle(style.textTransform === transform)}
              onClick={() => updateStyle({ textTransform: transform })}
            >
              {transform === 'none' && 'Aa'}
              {transform === 'uppercase' && 'AA'}
              {transform === 'lowercase' && 'aa'}
              {transform === 'capitalize' && 'Aa'}
            </button>
          ))}
        </div>
      </div>

      {/* Text Decoration */}
      <div>
        <div style={labelStyle}>Decoration</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['none', 'underline', 'line-through'] as const).map((decoration) => (
            <button
              key={decoration}
              style={{
                ...toggleStyle(style.textDecoration === decoration),
                textDecoration: decoration !== 'none' ? decoration : 'none',
              }}
              onClick={() => updateStyle({ textDecoration: decoration })}
            >
              {decoration === 'none' && 'None'}
              {decoration === 'underline' && 'U'}
              {decoration === 'line-through' && 'S'}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div style={{ marginTop: 12 }}>
        <div style={labelStyle}>Color</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="color"
            value={style.color || '#000000'}
            onChange={(e) => updateStyle({ color: e.target.value })}
            style={{ width: 40, height: 36, padding: 2, border: '1px solid #e5e7eb', borderRadius: 4 }}
          />
          <input
            type="text"
            style={{ ...inputStyle, flex: 1 }}
            value={style.color || '#000000'}
            onChange={(e) => updateStyle({ color: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
});
