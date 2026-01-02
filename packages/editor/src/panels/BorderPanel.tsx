/**
 * Border Panel - Advanced border controls with per-corner radius
 */

import React, { memo, useCallback, useState } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState, StyleProperties, useThemeStore, themeColors } from '@builder/core';

export const BorderPanel = memo(function BorderPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];
  
  const [linkRadius, setLinkRadius] = useState(true);

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
    padding: '6px 8px',
    border: `1px solid ${colors.border}`,
    borderRadius: 4,
    fontSize: 12,
    textAlign: 'center',
    backgroundColor: colors.surface,
    color: colors.text,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  };

  const handleRadiusChange = (corner: string, value: number) => {
    if (linkRadius) {
      updateStyle({
        borderRadius: value,
        borderTopLeftRadius: value,
        borderTopRightRadius: value,
        borderBottomRightRadius: value,
        borderBottomLeftRadius: value,
      });
    } else {
      updateStyle({ [corner]: value } as Partial<StyleProperties>);
    }
  };

  return (
    <div style={{ padding: 16, borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, marginBottom: 12, textTransform: 'uppercase' }}>
        Border
      </div>

      {/* Border Radius */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: colors.textMuted }}>Corner Radius</span>
          <button
            style={{
              width: 24,
              height: 24,
              border: 'none',
              borderRadius: 4,
              backgroundColor: linkRadius ? colors.primary + '20' : 'transparent',
              color: linkRadius ? colors.primary : colors.textMuted,
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            onClick={() => setLinkRadius(!linkRadius)}
            title={linkRadius ? 'Unlink corners' : 'Link corners'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
        </div>
        
        {/* Visual Corner Editor */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 60px 1fr',
          gridTemplateRows: '1fr 40px 1fr',
          gap: 4,
          alignItems: 'center',
        }}>
          {/* Top Left */}
          <div style={{ textAlign: 'right' }}>
            <input
              type="number"
              style={{ ...inputStyle, width: 50 }}
              value={style.borderTopLeftRadius ?? style.borderRadius ?? 0}
              onChange={(e) => handleRadiusChange('borderTopLeftRadius', Number(e.target.value))}
            />
          </div>
          <div />
          {/* Top Right */}
          <div>
            <input
              type="number"
              style={{ ...inputStyle, width: 50 }}
              value={style.borderTopRightRadius ?? style.borderRadius ?? 0}
              onChange={(e) => handleRadiusChange('borderTopRightRadius', Number(e.target.value))}
            />
          </div>
          
          {/* Preview Box */}
          <div />
          <div
            style={{
              width: 60,
              height: 40,
              border: `2px solid ${colors.primary}`,
              borderRadius: `${style.borderTopLeftRadius ?? style.borderRadius ?? 0}px ${style.borderTopRightRadius ?? style.borderRadius ?? 0}px ${style.borderBottomRightRadius ?? style.borderRadius ?? 0}px ${style.borderBottomLeftRadius ?? style.borderRadius ?? 0}px`,
              backgroundColor: colors.surface,
            }}
          />
          <div />
          
          {/* Bottom Left */}
          <div style={{ textAlign: 'right' }}>
            <input
              type="number"
              style={{ ...inputStyle, width: 50 }}
              value={style.borderBottomLeftRadius ?? style.borderRadius ?? 0}
              onChange={(e) => handleRadiusChange('borderBottomLeftRadius', Number(e.target.value))}
            />
          </div>
          <div />
          {/* Bottom Right */}
          <div>
            <input
              type="number"
              style={{ ...inputStyle, width: 50 }}
              value={style.borderBottomRightRadius ?? style.borderRadius ?? 0}
              onChange={(e) => handleRadiusChange('borderBottomRightRadius', Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Border Width & Color */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div>
          <div style={labelStyle}>Width</div>
          <input
            type="number"
            style={inputStyle}
            value={style.borderWidth || 0}
            onChange={(e) => updateStyle({ borderWidth: Number(e.target.value) })}
          />
        </div>
        <div>
          <div style={labelStyle}>Color</div>
          <input
            type="color"
            style={{ ...inputStyle, padding: 2, height: 32 }}
            value={style.borderColor || '#000000'}
            onChange={(e) => updateStyle({ borderColor: e.target.value })}
          />
        </div>
      </div>

      {/* Border Style */}
      <div>
        <div style={labelStyle}>Style</div>
        <select
          style={{ ...inputStyle, textAlign: 'left', cursor: 'pointer' }}
          value={style.borderStyle || 'solid'}
          onChange={(e) => updateStyle({ borderStyle: e.target.value as StyleProperties['borderStyle'] })}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="none">None</option>
        </select>
      </div>
    </div>
  );
});
