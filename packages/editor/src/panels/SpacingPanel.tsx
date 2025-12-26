/**
 * Spacing Panel - Visual box model editor for margin/padding
 */

import React, { memo, useCallback, useState } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState, StyleProperties } from '@builder/core';

const SPACING_PRESETS = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64];

export const SpacingPanel = memo(function SpacingPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  const [linkPadding, setLinkPadding] = useState(true);
  const [linkMargin, setLinkMargin] = useState(true);

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
    width: 36,
    height: 24,
    textAlign: 'center',
    border: '1px solid #e5e7eb',
    borderRadius: 4,
    fontSize: 11,
    padding: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: '#9ca3af',
    textTransform: 'uppercase',
  };

  const linkButtonStyle = (active: boolean): React.CSSProperties => ({
    width: 20,
    height: 20,
    border: 'none',
    borderRadius: 4,
    backgroundColor: active ? '#dbeafe' : 'transparent',
    color: active ? '#3b82f6' : '#9ca3af',
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const handlePaddingChange = (side: 'Top' | 'Right' | 'Bottom' | 'Left', value: number) => {
    if (linkPadding) {
      updateStyle({
        paddingTop: value,
        paddingRight: value,
        paddingBottom: value,
        paddingLeft: value,
      });
    } else {
      updateStyle({ [`padding${side}`]: value } as Partial<StyleProperties>);
    }
  };

  const handleMarginChange = (side: 'Top' | 'Right' | 'Bottom' | 'Left', value: number) => {
    if (linkMargin) {
      updateStyle({
        marginTop: value,
        marginRight: value,
        marginBottom: value,
        marginLeft: value,
      });
    } else {
      updateStyle({ [`margin${side}`]: value } as Partial<StyleProperties>);
    }
  };

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
        Spacing
      </div>

      {/* Box Model Visualization */}
      <div
        style={{
          position: 'relative',
          padding: 16,
          backgroundColor: '#fef3c7',
          borderRadius: 8,
          marginBottom: 12,
        }}
      >
        <div style={{ position: 'absolute', top: 2, left: 4, ...labelStyle }}>MARGIN</div>
        
        {/* Margin inputs */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <input
            type="number"
            style={inputStyle}
            value={style.marginTop || 0}
            onChange={(e) => handleMarginChange('Top', Number(e.target.value))}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="number"
            style={inputStyle}
            value={style.marginLeft || 0}
            onChange={(e) => handleMarginChange('Left', Number(e.target.value))}
          />
          
          {/* Padding Box */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#bbf7d0',
              borderRadius: 6,
              padding: 12,
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', top: 2, left: 4, ...labelStyle }}>PADDING</div>
            
            {/* Padding inputs */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <input
                type="number"
                style={inputStyle}
                value={style.paddingTop || 0}
                onChange={(e) => handlePaddingChange('Top', Number(e.target.value))}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="number"
                style={inputStyle}
                value={style.paddingLeft || 0}
                onChange={(e) => handlePaddingChange('Left', Number(e.target.value))}
              />
              
              {/* Content Box */}
              <div
                style={{
                  flex: 1,
                  height: 32,
                  backgroundColor: '#93c5fd',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: '#1e40af',
                  fontWeight: 600,
                }}
              >
                CONTENT
              </div>
              
              <input
                type="number"
                style={inputStyle}
                value={style.paddingRight || 0}
                onChange={(e) => handlePaddingChange('Right', Number(e.target.value))}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <input
                type="number"
                style={inputStyle}
                value={style.paddingBottom || 0}
                onChange={(e) => handlePaddingChange('Bottom', Number(e.target.value))}
              />
            </div>
          </div>
          
          <input
            type="number"
            style={inputStyle}
            value={style.marginRight || 0}
            onChange={(e) => handleMarginChange('Right', Number(e.target.value))}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <input
            type="number"
            style={inputStyle}
            value={style.marginBottom || 0}
            onChange={(e) => handleMarginChange('Bottom', Number(e.target.value))}
          />
        </div>
      </div>

      {/* Link Toggles */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <button
          style={linkButtonStyle(linkPadding)}
          onClick={() => setLinkPadding(!linkPadding)}
          title={linkPadding ? 'Unlink padding sides' : 'Link padding sides'}
        >
          🔗
        </button>
        <button
          style={linkButtonStyle(linkMargin)}
          onClick={() => setLinkMargin(!linkMargin)}
          title={linkMargin ? 'Unlink margin sides' : 'Link margin sides'}
        >
          🔗
        </button>
      </div>

      {/* Quick Presets */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Quick Padding</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {SPACING_PRESETS.slice(0, 6).map((val) => (
            <button
              key={val}
              style={{
                padding: '4px 8px',
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                backgroundColor: '#fff',
                fontSize: 11,
                cursor: 'pointer',
              }}
              onClick={() => updateStyle({
                paddingTop: val,
                paddingRight: val,
                paddingBottom: val,
                paddingLeft: val,
              })}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
