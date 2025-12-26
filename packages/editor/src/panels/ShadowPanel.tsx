/**
 * Shadow Panel - Box shadow editor with multiple shadows
 */

import React, { memo, useCallback, useState } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState } from '@builder/core';

interface Shadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

const SHADOW_PRESETS: { name: string; shadow: string }[] = [
  { name: 'None', shadow: 'none' },
  { name: 'SM', shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  { name: 'MD', shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  { name: 'LG', shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
  { name: 'XL', shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
  { name: '2XL', shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
];

const parseShadow = (shadowStr: string): Shadow => {
  const defaultShadow: Shadow = { x: 0, y: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.1)', inset: false };
  if (!shadowStr || shadowStr === 'none') return defaultShadow;
  
  const inset = shadowStr.includes('inset');
  const parts = shadowStr.replace('inset', '').trim().split(/\s+/);
  
  return {
    x: parseInt(parts[0]) || 0,
    y: parseInt(parts[1]) || 0,
    blur: parseInt(parts[2]) || 0,
    spread: parseInt(parts[3]) || 0,
    color: parts.slice(4).join(' ') || 'rgba(0,0,0,0.1)',
    inset,
  };
};

const shadowToString = (shadow: Shadow): string => {
  const { x, y, blur, spread, color, inset } = shadow;
  return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}`;
};

export const ShadowPanel = memo(function ShadowPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  const [showEditor, setShowEditor] = useState(false);

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

  if (!selectedElement) {
    return null;
  }

  const style = selectedElement.style;
  const currentShadow = parseShadow(style.boxShadow || '');

  const updateShadow = (updates: Partial<Shadow>) => {
    saveHistory();
    const newShadow = { ...currentShadow, ...updates };
    updateElementStyle(selectedElement.id, { boxShadow: shadowToString(newShadow) });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 4,
    fontSize: 12,
  };

  const presetStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 10px',
    border: '1px solid',
    borderColor: active ? '#3b82f6' : '#e5e7eb',
    borderRadius: 6,
    backgroundColor: active ? '#dbeafe' : '#ffffff',
    fontSize: 11,
    cursor: 'pointer',
  });

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
          Shadow
        </span>
        <button
          style={{
            padding: '4px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            backgroundColor: showEditor ? '#f3f4f6' : '#fff',
            fontSize: 10,
            cursor: 'pointer',
          }}
          onClick={() => setShowEditor(!showEditor)}
        >
          {showEditor ? 'Presets' : 'Custom'}
        </button>
      </div>

      {/* Shadow Preview */}
      <div
        style={{
          width: '100%',
          height: 60,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          boxShadow: style.boxShadow || 'none',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#9ca3af',
        }}
      >
        Preview
      </div>

      {showEditor ? (
        /* Custom Editor */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>X</div>
              <input
                type="number"
                style={inputStyle}
                value={currentShadow.x}
                onChange={(e) => updateShadow({ x: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Y</div>
              <input
                type="number"
                style={inputStyle}
                value={currentShadow.y}
                onChange={(e) => updateShadow({ y: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Blur</div>
              <input
                type="number"
                style={inputStyle}
                value={currentShadow.blur}
                onChange={(e) => updateShadow({ blur: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Spread</div>
              <input
                type="number"
                style={inputStyle}
                value={currentShadow.spread}
                onChange={(e) => updateShadow({ spread: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Color</div>
              <input
                type="text"
                style={inputStyle}
                value={currentShadow.color}
                onChange={(e) => updateShadow({ color: e.target.value })}
                placeholder="rgba(0,0,0,0.1)"
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Inset</div>
              <button
                style={{
                  ...inputStyle,
                  backgroundColor: currentShadow.inset ? '#dbeafe' : '#fff',
                  color: currentShadow.inset ? '#3b82f6' : '#6b7280',
                  cursor: 'pointer',
                }}
                onClick={() => updateShadow({ inset: !currentShadow.inset })}
              >
                {currentShadow.inset ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Presets */
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {SHADOW_PRESETS.map((preset) => (
            <button
              key={preset.name}
              style={presetStyle(style.boxShadow === preset.shadow)}
              onClick={() => {
                saveHistory();
                updateElementStyle(selectedElement.id, { boxShadow: preset.shadow });
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
