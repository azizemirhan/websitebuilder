/**
 * Design Tokens Panel - Color palette and typography tokens picker
 */

import React, { memo, useState } from 'react';
import { useDesignTokensStore, ColorToken, TypographyToken } from '@builder/core';
import { useCanvasStore, useHistoryStore, CanvasState } from '@builder/core';

export const DesignTokensPanel = memo(function DesignTokensPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  const colors = useDesignTokensStore((state) => state.colors);
  const typography = useDesignTokensStore((state) => state.typography);
  const addColor = useDesignTokensStore((state) => state.addColor);
  
  const [activeTab, setActiveTab] = useState<'colors' | 'typography'>('colors');
  const [newColorName, setNewColorName] = useState('');
  const [newColorValue, setNewColorValue] = useState('#000000');

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;

  const saveHistory = () => {
    const state = useCanvasStore.getState();
    const snapshot: CanvasState = {
      elements: state.elements,
      rootElementIds: state.rootElementIds,
      selectedElementIds: state.selectedElementIds,
      hoveredElementId: state.hoveredElementId,
    };
    addToHistory(snapshot);
  };

  const applyColor = (color: string, property: 'backgroundColor' | 'color' | 'borderColor') => {
    if (!selectedElement) return;
    saveHistory();
    updateElementStyle(selectedElement.id, { [property]: color });
  };

  const applyTypography = (token: TypographyToken) => {
    if (!selectedElement) return;
    saveHistory();
    updateElementStyle(selectedElement.id, {
      fontFamily: token.fontFamily,
      fontSize: token.fontSize,
      fontWeight: token.fontWeight,
      lineHeight: token.lineHeight,
      letterSpacing: token.letterSpacing,
    });
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px',
    border: 'none',
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
    backgroundColor: 'transparent',
    color: active ? '#3b82f6' : '#6b7280',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  });

  return (
    <div style={{ borderBottom: '1px solid #e5e7eb' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        <button style={tabStyle(activeTab === 'colors')} onClick={() => setActiveTab('colors')}>
          🎨 Colors
        </button>
        <button style={tabStyle(activeTab === 'typography')} onClick={() => setActiveTab('typography')}>
          📝 Typography
        </button>
      </div>

      <div style={{ padding: 16 }}>
        {activeTab === 'colors' ? (
          <>
            {/* Color Palette */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>Click to apply as:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {colors.map((color) => (
                  <div key={color.id} style={{ position: 'relative' }}>
                    <div
                      style={{
                        width: '100%',
                        paddingTop: '100%',
                        backgroundColor: color.value,
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      onClick={() => applyColor(color.value, 'backgroundColor')}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        applyColor(color.value, 'color');
                      }}
                      title={`${color.name}\nLeft: Background\nRight: Text`}
                    />
                    <div style={{ fontSize: 9, color: '#6b7280', textAlign: 'center', marginTop: 4 }}>
                      {color.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Color */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="color"
                value={newColorValue}
                onChange={(e) => setNewColorValue(e.target.value)}
                style={{ width: 40, height: 32, padding: 2, border: '1px solid #e5e7eb', borderRadius: 4 }}
              />
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Color name"
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
              <button
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: 4,
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (newColorName) {
                    addColor(newColorName, newColorValue);
                    setNewColorName('');
                  }
                }}
              >
                Add
              </button>
            </div>
          </>
        ) : (
          /* Typography Tokens */
          <div>
            {typography.map((token) => (
              <button
                key={token.id}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  backgroundColor: '#fff',
                  marginBottom: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onClick={() => applyTypography(token)}
              >
                <div
                  style={{
                    fontFamily: token.fontFamily,
                    fontSize: Math.min(token.fontSize, 24),
                    fontWeight: token.fontWeight,
                    lineHeight: 1.2,
                    marginBottom: 4,
                  }}
                >
                  {token.name}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>
                  {token.fontFamily} · {token.fontSize}px · {token.fontWeight}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
