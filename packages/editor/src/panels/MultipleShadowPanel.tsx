/**
 * Advanced Shadow Panel - Multiple shadow layers support
 */

import React, { memo, useCallback, useState } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState } from '@builder/core';

interface ShadowLayer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

const parseShadows = (shadowStr: string): ShadowLayer[] => {
  if (!shadowStr || shadowStr === 'none') return [];
  
  const shadows: ShadowLayer[] = [];
  // Split by comma but respect rgba() parentheses
  const parts = shadowStr.match(/(?:inset\s+)?[-\d.]+px\s+[-\d.]+px\s+[-\d.]+px(?:\s+[-\d.]+px)?\s+[^,]+/g);
  
  if (parts) {
    parts.forEach((part, i) => {
      const inset = part.includes('inset');
      const vals = part.replace('inset', '').trim().split(/\s+/);
      shadows.push({
        id: `${Date.now()}-${i}`,
        x: parseInt(vals[0]) || 0,
        y: parseInt(vals[1]) || 0,
        blur: parseInt(vals[2]) || 0,
        spread: parseInt(vals[3]) || 0,
        color: vals.slice(4).join(' ') || 'rgba(0,0,0,0.1)',
        inset,
      });
    });
  }
  
  return shadows.length > 0 ? shadows : [{
    id: `${Date.now()}`,
    x: 0, y: 4, blur: 8, spread: 0,
    color: 'rgba(0,0,0,0.1)',
    inset: false,
  }];
};

const shadowsToString = (shadows: ShadowLayer[]): string => {
  if (shadows.length === 0) return 'none';
  return shadows.map((s) => 
    `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
  ).join(', ');
};

export const MultipleShadowPanel = memo(function MultipleShadowPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
  const shadows = parseShadows(style.boxShadow || '');

  const updateShadows = (newShadows: ShadowLayer[]) => {
    saveHistory();
    updateElementStyle(selectedElement.id, { boxShadow: shadowsToString(newShadows) });
  };

  const updateShadow = (id: string, updates: Partial<ShadowLayer>) => {
    const newShadows = shadows.map((s) => s.id === id ? { ...s, ...updates } : s);
    updateShadows(newShadows);
  };

  const addShadow = () => {
    const newShadow: ShadowLayer = {
      id: `${Date.now()}`,
      x: 0, y: 8, blur: 16, spread: 0,
      color: 'rgba(0,0,0,0.1)',
      inset: false,
    };
    updateShadows([...shadows, newShadow]);
    setExpandedId(newShadow.id);
  };

  const removeShadow = (id: string) => {
    updateShadows(shadows.filter((s) => s.id !== id));
  };

  const moveShadow = (id: string, direction: 'up' | 'down') => {
    const index = shadows.findIndex((s) => s.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === shadows.length - 1)) return;
    
    const newShadows = [...shadows];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newShadows[index], newShadows[targetIndex]] = [newShadows[targetIndex], newShadows[index]];
    updateShadows(newShadows);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 6px',
    border: '1px solid #e5e7eb',
    borderRadius: 4,
    fontSize: 11,
    textAlign: 'center',
  };

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
          Shadows ({shadows.length})
        </span>
        <button
          style={{
            padding: '4px 8px',
            border: '1px solid #3b82f6',
            borderRadius: 4,
            backgroundColor: '#eff6ff',
            color: '#3b82f6',
            fontSize: 10,
            cursor: 'pointer',
          }}
          onClick={addShadow}
        >
          + Add
        </button>
      </div>

      {/* Preview */}
      <div
        style={{
          width: '100%',
          height: 60,
          backgroundColor: '#ffffff',
          borderRadius: 12,
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

      {/* Shadow Layers */}
      {shadows.map((shadow, index) => (
        <div
          key={shadow.id}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            marginBottom: 8,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: expandedId === shadow.id ? '#f9fafb' : '#fff',
              cursor: 'pointer',
            }}
            onClick={() => setExpandedId(expandedId === shadow.id ? null : shadow.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor: shadow.color,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              />
              <span style={{ fontSize: 11, color: '#374151' }}>
                {shadow.inset ? 'Inset' : 'Drop'} Shadow {index + 1}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                style={{ padding: 2, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 10 }}
                onClick={(e) => { e.stopPropagation(); moveShadow(shadow.id, 'up'); }}
              >
                ↑
              </button>
              <button
                style={{ padding: 2, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 10 }}
                onClick={(e) => { e.stopPropagation(); moveShadow(shadow.id, 'down'); }}
              >
                ↓
              </button>
              <button
                style={{ padding: 2, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 10, color: '#dc2626' }}
                onClick={(e) => { e.stopPropagation(); removeShadow(shadow.id); }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Expanded Controls */}
          {expandedId === shadow.id && (
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2 }}>X</div>
                  <input
                    type="number"
                    style={inputStyle}
                    value={shadow.x}
                    onChange={(e) => updateShadow(shadow.id, { x: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2 }}>Y</div>
                  <input
                    type="number"
                    style={inputStyle}
                    value={shadow.y}
                    onChange={(e) => updateShadow(shadow.id, { y: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2 }}>Blur</div>
                  <input
                    type="number"
                    style={inputStyle}
                    value={shadow.blur}
                    onChange={(e) => updateShadow(shadow.id, { blur: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2 }}>Spread</div>
                  <input
                    type="number"
                    style={inputStyle}
                    value={shadow.spread}
                    onChange={(e) => updateShadow(shadow.id, { spread: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  style={{ ...inputStyle, flex: 1 }}
                  value={shadow.color}
                  onChange={(e) => updateShadow(shadow.id, { color: e.target.value })}
                  placeholder="rgba(0,0,0,0.1)"
                />
                <button
                  style={{
                    padding: '4px 8px',
                    border: '1px solid',
                    borderColor: shadow.inset ? '#3b82f6' : '#e5e7eb',
                    backgroundColor: shadow.inset ? '#dbeafe' : '#fff',
                    borderRadius: 4,
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => updateShadow(shadow.id, { inset: !shadow.inset })}
                >
                  Inset
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});
