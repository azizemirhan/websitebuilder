/**
 * Transform Panel - Rotate, Scale, Skew controls
 */

import React, { memo, useCallback, useState } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState } from '@builder/core';

interface TransformValues {
  rotate: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  translateX: number;
  translateY: number;
}

const parseTransform = (transformStr: string): TransformValues => {
  const defaults: TransformValues = { rotate: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, translateX: 0, translateY: 0 };
  if (!transformStr || transformStr === 'none') return defaults;

  const rotateMatch = transformStr.match(/rotate\(([-\d.]+)deg\)/);
  const scaleMatch = transformStr.match(/scale\(([-\d.]+),?\s*([-\d.]+)?\)/);
  const skewMatch = transformStr.match(/skew\(([-\d.]+)deg,?\s*([-\d.]+)?deg?\)/);
  const translateMatch = transformStr.match(/translate\(([-\d.]+)px,?\s*([-\d.]+)?px?\)/);

  return {
    rotate: rotateMatch ? parseFloat(rotateMatch[1]) : 0,
    scaleX: scaleMatch ? parseFloat(scaleMatch[1]) : 1,
    scaleY: scaleMatch && scaleMatch[2] ? parseFloat(scaleMatch[2]) : (scaleMatch ? parseFloat(scaleMatch[1]) : 1),
    skewX: skewMatch ? parseFloat(skewMatch[1]) : 0,
    skewY: skewMatch && skewMatch[2] ? parseFloat(skewMatch[2]) : 0,
    translateX: translateMatch ? parseFloat(translateMatch[1]) : 0,
    translateY: translateMatch && translateMatch[2] ? parseFloat(translateMatch[2]) : 0,
  };
};

const transformToString = (t: TransformValues): string => {
  const parts: string[] = [];
  if (t.translateX !== 0 || t.translateY !== 0) parts.push(`translate(${t.translateX}px, ${t.translateY}px)`);
  if (t.rotate !== 0) parts.push(`rotate(${t.rotate}deg)`);
  if (t.scaleX !== 1 || t.scaleY !== 1) parts.push(`scale(${t.scaleX}, ${t.scaleY})`);
  if (t.skewX !== 0 || t.skewY !== 0) parts.push(`skew(${t.skewX}deg, ${t.skewY}deg)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
};

const TRANSITION_PRESETS = [
  { name: 'None', value: 'none' },
  { name: 'Fast', value: 'all 0.15s ease' },
  { name: 'Normal', value: 'all 0.3s ease' },
  { name: 'Slow', value: 'all 0.5s ease' },
  { name: 'Bounce', value: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  { name: 'Smooth', value: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
];

export const TransformPanel = memo(function TransformPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  const [linkScale, setLinkScale] = useState(true);

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
  const transform = parseTransform(style.transform || '');

  const updateTransform = (updates: Partial<TransformValues>) => {
    saveHistory();
    const newTransform = { ...transform, ...updates };
    if (linkScale && 'scaleX' in updates) {
      newTransform.scaleY = updates.scaleX!;
    }
    if (linkScale && 'scaleY' in updates) {
      newTransform.scaleX = updates.scaleY!;
    }
    updateElementStyle(selectedElement.id, { transform: transformToString(newTransform) });
  };

  const resetTransform = () => {
    saveHistory();
    updateElementStyle(selectedElement.id, { transform: 'none' });
  };

  const sliderStyle: React.CSSProperties = {
    width: '100%',
    accentColor: '#3b82f6',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 4,
    fontSize: 12,
    textAlign: 'center',
  };

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
          Transform
        </span>
        <button
          style={{
            padding: '4px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            backgroundColor: '#fff',
            fontSize: 10,
            cursor: 'pointer',
          }}
          onClick={resetTransform}
        >
          Reset
        </button>
      </div>

      {/* Rotate */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
          <span>🔄 Rotate</span>
          <span>{transform.rotate}°</span>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          value={transform.rotate}
          onChange={(e) => updateTransform({ rotate: Number(e.target.value) })}
          style={sliderStyle}
        />
      </div>

      {/* Scale */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#6b7280' }}>📐 Scale</span>
          <button
            style={{
              padding: '2px 6px',
              border: 'none',
              borderRadius: 4,
              backgroundColor: linkScale ? '#dbeafe' : 'transparent',
              color: linkScale ? '#3b82f6' : '#9ca3af',
              fontSize: 10,
              cursor: 'pointer',
            }}
            onClick={() => setLinkScale(!linkScale)}
          >
            🔗
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2, textAlign: 'center' }}>X</div>
            <input
              type="number"
              step="0.1"
              style={inputStyle}
              value={transform.scaleX}
              onChange={(e) => updateTransform({ scaleX: Number(e.target.value) })}
            />
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2, textAlign: 'center' }}>Y</div>
            <input
              type="number"
              step="0.1"
              style={inputStyle}
              value={transform.scaleY}
              onChange={(e) => updateTransform({ scaleY: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Skew */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>↗️ Skew</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2, textAlign: 'center' }}>X°</div>
            <input
              type="range"
              min="-45"
              max="45"
              value={transform.skewX}
              onChange={(e) => updateTransform({ skewX: Number(e.target.value) })}
              style={sliderStyle}
            />
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2, textAlign: 'center' }}>Y°</div>
            <input
              type="range"
              min="-45"
              max="45"
              value={transform.skewY}
              onChange={(e) => updateTransform({ skewY: Number(e.target.value) })}
              style={sliderStyle}
            />
          </div>
        </div>
      </div>

      {/* Transform Origin */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>⊙ Origin</div>
        <select
          style={{ ...inputStyle, cursor: 'pointer', textAlign: 'left' }}
          value={style.transformOrigin || 'center'}
          onChange={(e) => {
            saveHistory();
            updateElementStyle(selectedElement.id, { transformOrigin: e.target.value });
          }}
        >
          <option value="center">Center</option>
          <option value="top left">Top Left</option>
          <option value="top center">Top Center</option>
          <option value="top right">Top Right</option>
          <option value="center left">Center Left</option>
          <option value="center right">Center Right</option>
          <option value="bottom left">Bottom Left</option>
          <option value="bottom center">Bottom Center</option>
          <option value="bottom right">Bottom Right</option>
        </select>
      </div>

      {/* Transition */}
      <div>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>⏱️ Transition</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {TRANSITION_PRESETS.map((preset) => (
            <button
              key={preset.name}
              style={{
                padding: '6px 10px',
                border: '1px solid',
                borderColor: style.transition === preset.value ? '#3b82f6' : '#e5e7eb',
                borderRadius: 6,
                backgroundColor: style.transition === preset.value ? '#dbeafe' : '#fff',
                color: style.transition === preset.value ? '#1d4ed8' : '#374151',
                fontSize: 10,
                cursor: 'pointer',
              }}
              onClick={() => {
                saveHistory();
                updateElementStyle(selectedElement.id, { transition: preset.value });
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
