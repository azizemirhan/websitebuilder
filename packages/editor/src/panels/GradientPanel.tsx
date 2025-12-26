/**
 * Gradient Panel - Linear and radial gradient editor
 */

import React, { memo, useCallback, useState } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState } from '@builder/core';

type GradientType = 'none' | 'linear' | 'radial';

interface GradientStop {
  color: string;
  position: number;
}

const GRADIENT_PRESETS = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Fire', value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
  { name: 'Sky', value: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)' },
  { name: 'Night', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
];

export const GradientPanel = memo(function GradientPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<GradientStop[]>([
    { color: '#3b82f6', position: 0 },
    { color: '#8b5cf6', position: 100 },
  ]);

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

  const applyGradient = () => {
    saveHistory();
    const stopsStr = stops.map((s) => `${s.color} ${s.position}%`).join(', ');
    const gradient = gradientType === 'linear'
      ? `linear-gradient(${angle}deg, ${stopsStr})`
      : `radial-gradient(circle, ${stopsStr})`;
    updateElementStyle(selectedElement.id, { background: gradient });
  };

  const clearGradient = () => {
    saveHistory();
    updateElementStyle(selectedElement.id, { background: undefined });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 4,
    fontSize: 12,
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px',
    border: '1px solid',
    borderColor: active ? '#3b82f6' : '#e5e7eb',
    backgroundColor: active ? '#dbeafe' : '#fff',
    color: active ? '#1d4ed8' : '#374151',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
  });

  const gradientPreview = gradientType === 'linear'
    ? `linear-gradient(${angle}deg, ${stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`
    : `radial-gradient(circle, ${stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`;

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
        Background / Gradient
      </div>

      {/* Type Toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <button style={buttonStyle(gradientType === 'linear')} onClick={() => setGradientType('linear')}>
          Linear
        </button>
        <button style={buttonStyle(gradientType === 'radial')} onClick={() => setGradientType('radial')}>
          Radial
        </button>
      </div>

      {/* Preview */}
      <div
        style={{
          width: '100%',
          height: 60,
          borderRadius: 8,
          background: gradientPreview,
          marginBottom: 12,
        }}
      />

      {/* Angle (for linear) */}
      {gradientType === 'linear' && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Angle: {angle}°</div>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      )}

      {/* Color Stops */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Color Stops</div>
        {stops.map((stop, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <input
              type="color"
              value={stop.color}
              onChange={(e) => {
                const newStops = [...stops];
                newStops[i].color = e.target.value;
                setStops(newStops);
              }}
              style={{ width: 40, height: 32, padding: 2, border: '1px solid #e5e7eb', borderRadius: 4 }}
            />
            <input
              type="number"
              value={stop.position}
              onChange={(e) => {
                const newStops = [...stops];
                newStops[i].position = Number(e.target.value);
                setStops(newStops);
              }}
              style={{ ...inputStyle, flex: 1 }}
              min={0}
              max={100}
            />
            <span style={{ fontSize: 11, color: '#9ca3af', alignSelf: 'center' }}>%</span>
          </div>
        ))}
        <button
          style={{ ...inputStyle, marginTop: 4, cursor: 'pointer', color: '#3b82f6' }}
          onClick={() => setStops([...stops, { color: '#ffffff', position: 50 }])}
        >
          + Add Stop
        </button>
      </div>

      {/* Apply Button */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            borderRadius: 6,
            backgroundColor: '#3b82f6',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onClick={applyGradient}
        >
          Apply Gradient
        </button>
        <button
          style={{
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            backgroundColor: '#fff',
            color: '#6b7280',
            fontSize: 12,
            cursor: 'pointer',
          }}
          onClick={clearGradient}
        >
          Clear
        </button>
      </div>

      {/* Presets */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Presets</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {GRADIENT_PRESETS.map((preset) => (
            <button
              key={preset.name}
              style={{
                padding: 8,
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                background: preset.value,
                color: '#fff',
                fontSize: 10,
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                cursor: 'pointer',
              }}
              onClick={() => {
                saveHistory();
                updateElementStyle(selectedElement.id, { background: preset.value });
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
