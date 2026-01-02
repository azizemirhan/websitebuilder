/**
 * Auto-layout Panel - Figma-style auto-layout controls
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState, StyleProperties, useThemeStore, themeColors } from '@builder/core';
import { AlignmentGrid } from '../components/AlignmentGrid';

type SizingMode = 'fixed' | 'hug' | 'fill';

export const AutoLayoutPanel = memo(function AutoLayoutPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const updateElement = useCanvasStore((state) => state.updateElement);
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
    return null;
  }

  const style = selectedElement.style;
  const isAutoLayout = style.display === 'flex';
  const autoLayoutProps = (selectedElement.props as { autoLayout?: { widthMode: SizingMode; heightMode: SizingMode } })?.autoLayout;

  const enableAutoLayout = () => {
    saveHistory();
    updateElementStyle(selectedElement.id, {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    });
    updateElement(selectedElement.id, {
      props: {
        ...(selectedElement.props || {}),
        autoLayout: { widthMode: 'fixed', heightMode: 'hug' },
      },
    } as Parameters<typeof updateElement>[1]);
  };

  const disableAutoLayout = () => {
    saveHistory();
    updateElementStyle(selectedElement.id, {
      display: 'block',
    });
  };

  const setSizingMode = (axis: 'width' | 'height', mode: SizingMode) => {
    saveHistory();
    const newAutoLayout = {
      widthMode: autoLayoutProps?.widthMode || 'fixed',
      heightMode: autoLayoutProps?.heightMode || 'hug',
      [axis === 'width' ? 'widthMode' : 'heightMode']: mode,
    };
    updateElement(selectedElement.id, {
      props: {
        ...(selectedElement.props || {}),
        autoLayout: newAutoLayout,
      },
    } as Parameters<typeof updateElement>[1]);
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px 4px',
    border: '1px solid',
    borderColor: active ? colors.primary : colors.border,
    backgroundColor: active ? colors.primary : colors.surface,
    color: active ? '#ffffff' : colors.text,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
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
    <div style={{ padding: 16, borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase' }}>
          Auto Layout
        </span>
        <button
          style={{
            padding: '4px 12px',
            border: '1px solid',
            borderColor: isAutoLayout ? '#dc2626' : '#3b82f6',
            backgroundColor: isAutoLayout ? '#fef2f2' : '#eff6ff',
            color: isAutoLayout ? '#dc2626' : '#3b82f6',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onClick={isAutoLayout ? disableAutoLayout : enableAutoLayout}
        >
          {isAutoLayout ? 'Remove' : 'Add +'}
        </button>
      </div>

      {isAutoLayout && (
        <>
          {/* Direction & Alignment */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Direction & Alignment</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {/* Direction buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  style={{
                    ...buttonStyle(style.flexDirection === 'row'),
                    flexDirection: 'row',
                    padding: 8,
                  }}
                  onClick={() => updateStyle({ flexDirection: 'row' })}
                  title="Horizontal"
                >
                  →
                </button>
                <button
                  style={{
                    ...buttonStyle(style.flexDirection === 'column'),
                    flexDirection: 'row',
                    padding: 8,
                  }}
                  onClick={() => updateStyle({ flexDirection: 'column' })}
                  title="Vertical"
                >
                  ↓
                </button>
              </div>

              {/* Alignment Grid */}
              <AlignmentGrid
                justifyContent={style.justifyContent || 'flex-start'}
                alignItems={style.alignItems || 'flex-start'}
                onChange={(justify, align) =>
                  updateStyle({
                    justifyContent: justify as StyleProperties['justifyContent'],
                    alignItems: align as StyleProperties['alignItems'],
                  })
                }
              />
            </div>
          </div>

          {/* Gap / Spacing */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Spacing Between Items</div>
            <input
              type="number"
              style={inputStyle}
              value={style.gap || 0}
              onChange={(e) => updateStyle({ gap: Number(e.target.value) })}
              placeholder="0"
            />
          </div>

          {/* Sizing Mode */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Width Sizing</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['fixed', 'hug', 'fill'] as const).map((mode) => (
                <button
                  key={mode}
                  style={buttonStyle(autoLayoutProps?.widthMode === mode)}
                  onClick={() => setSizingMode('width', mode)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {mode === 'fixed' && <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="12" x2="21" y2="12" /></>}
                    {mode === 'hug' && <><path d="M8 3v5a4 4 0 008 0V3M8 21v-5a4 4 0 018 0v5" /></>}
                    {mode === 'fill' && <><line x1="4" y1="12" x2="20" y2="12" /><polyline points="8 8 4 12 8 16" /><polyline points="16 8 20 12 16 16" /></>}
                  </svg>
                  <span>{mode === 'fixed' ? 'Fixed' : mode === 'hug' ? 'Hug' : 'Fill'}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Height Sizing</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['fixed', 'hug', 'fill'] as const).map((mode) => (
                <button
                  key={mode}
                  style={buttonStyle(autoLayoutProps?.heightMode === mode)}
                  onClick={() => setSizingMode('height', mode)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {mode === 'fixed' && <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" /></>}
                    {mode === 'hug' && <><path d="M3 8h5a4 4 0 010 8H3M21 8h-5a4 4 0 000 8h5" /></>}
                    {mode === 'fill' && <><line x1="12" y1="4" x2="12" y2="20" /><polyline points="8 8 12 4 16 8" /><polyline points="8 16 12 20 16 16" /></>}
                  </svg>
                  <span>{mode === 'fixed' ? 'Fixed' : mode === 'hug' ? 'Hug' : 'Fill'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Padding */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Padding</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              <input
                type="number"
                style={{ ...inputStyle, fontSize: 11, padding: 6, textAlign: 'center' }}
                value={style.paddingTop || 0}
                onChange={(e) => updateStyle({ paddingTop: Number(e.target.value) })}
                title="Top"
              />
              <input
                type="number"
                style={{ ...inputStyle, fontSize: 11, padding: 6, textAlign: 'center' }}
                value={style.paddingRight || 0}
                onChange={(e) => updateStyle({ paddingRight: Number(e.target.value) })}
                title="Right"
              />
              <input
                type="number"
                style={{ ...inputStyle, fontSize: 11, padding: 6, textAlign: 'center' }}
                value={style.paddingBottom || 0}
                onChange={(e) => updateStyle({ paddingBottom: Number(e.target.value) })}
                title="Bottom"
              />
              <input
                type="number"
                style={{ ...inputStyle, fontSize: 11, padding: 6, textAlign: 'center' }}
                value={style.paddingLeft || 0}
                onChange={(e) => updateStyle({ paddingLeft: Number(e.target.value) })}
                title="Left"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
});
