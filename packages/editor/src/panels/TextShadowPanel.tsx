/**
 * Text Shadow Panel - Text shadow editor
 */

import React, { memo, useCallback, useState } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState, useThemeStore, themeColors } from '@builder/core';

interface TextShadowValues {
  x: number;
  y: number;
  blur: number;
  color: string;
}

const TEXT_SHADOW_PRESETS = [
  { name: 'None', value: 'none' },
  { name: 'Subtle', value: '0 1px 2px rgba(0,0,0,0.1)' },
  { name: 'Medium', value: '0 2px 4px rgba(0,0,0,0.15)' },
  { name: 'Strong', value: '0 4px 8px rgba(0,0,0,0.2)' },
  { name: 'Glow White', value: '0 0 10px rgba(255,255,255,0.8)' },
  { name: 'Glow Blue', value: '0 0 10px rgba(59,130,246,0.8)' },
  { name: 'Hard', value: '2px 2px 0 rgba(0,0,0,0.3)' },
  { name: 'Long', value: '4px 4px 0 rgba(0,0,0,0.15)' },
];

const parseTextShadow = (shadowStr: string): TextShadowValues => {
  if (!shadowStr || shadowStr === 'none') return { x: 0, y: 2, blur: 4, color: 'rgba(0,0,0,0.1)' };
  
  const parts = shadowStr.trim().split(/\s+/);
  return {
    x: parseInt(parts[0]) || 0,
    y: parseInt(parts[1]) || 0,
    blur: parseInt(parts[2]) || 0,
    color: parts.slice(3).join(' ') || 'rgba(0,0,0,0.1)',
  };
};

const textShadowToString = (shadow: TextShadowValues): string => {
  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`;
};

export const TextShadowPanel = memo(function TextShadowPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  const [showCustom, setShowCustom] = useState(false);

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

  // Only show for text elements
  if (!selectedElement || selectedElement.type !== 'text') {
    return null;
  }

  const style = selectedElement.style;
  const shadow = parseTextShadow(style.textShadow || '');

  const updateShadow = (updates: Partial<TextShadowValues>) => {
    saveHistory();
    const newShadow = { ...shadow, ...updates };
    updateElementStyle(selectedElement.id, { textShadow: textShadowToString(newShadow) });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    border: `1px solid ${colors.border}`,
    borderRadius: 4,
    fontSize: 12,
    textAlign: 'center',
    backgroundColor: colors.surface,
    color: colors.text,
  };

  return (
    <div style={{ padding: 16, borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase' }}>
          Text Shadow
        </span>
        <button
          style={{
            padding: '4px 8px',
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            backgroundColor: showCustom ? colors.primary + '20' : colors.surface,
            fontSize: 10,
            cursor: 'pointer',
            color: showCustom ? colors.primary : colors.textMuted,
          }}
          onClick={() => setShowCustom(!showCustom)}
        >
          {showCustom ? 'Presets' : 'Custom'}
        </button>
      </div>

      {/* Preview */}
      <div
        style={{
          padding: 16,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: style.color || colors.text,
            textShadow: style.textShadow || 'none',
          }}
        >
          Preview Text
        </span>
      </div>

      {showCustom ? (
        /* Custom Editor */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>X</div>
              <input
                type="number"
                style={inputStyle}
                value={shadow.x}
                onChange={(e) => updateShadow({ x: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Y</div>
              <input
                type="number"
                style={inputStyle}
                value={shadow.y}
                onChange={(e) => updateShadow({ y: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>Blur</div>
              <input
                type="number"
                style={inputStyle}
                value={shadow.blur}
                onChange={(e) => updateShadow({ blur: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>Color</div>
            <input
              type="text"
              style={inputStyle}
              value={shadow.color}
              onChange={(e) => updateShadow({ color: e.target.value })}
              placeholder="rgba(0,0,0,0.1)"
            />
          </div>
        </div>
      ) : (
        /* Presets */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {TEXT_SHADOW_PRESETS.map((preset) => (
            <button
              key={preset.name}
              style={{
                padding: 10,
                border: '1px solid',
                borderColor: style.textShadow === preset.value ? colors.primary : colors.border,
                borderRadius: 8,
                backgroundColor: style.textShadow === preset.value ? colors.primary + '20' : colors.surface,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => {
                saveHistory();
                updateElementStyle(selectedElement.id, { textShadow: preset.value });
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  textShadow: preset.value,
                  color: colors.text,
                }}
              >
                Aa
              </span>
              <div style={{ fontSize: 9, color: colors.textMuted, marginTop: 4 }}>{preset.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
