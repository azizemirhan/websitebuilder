/**
 * Effects Library Panel - Pre-made effect presets
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState, StyleProperties } from '@builder/core';

interface EffectPreset {
  name: string;
  category: 'glass' | 'neumorphism' | 'material' | 'glow';
  styles: Partial<StyleProperties>;
}

const EFFECT_PRESETS: EffectPreset[] = [
  // Glassmorphism
  {
    name: 'Glass Light',
    category: 'glass',
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(10px)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderStyle: 'solid',
    },
  },
  {
    name: 'Glass Dark',
    category: 'glass',
    styles: {
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(10px)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderStyle: 'solid',
    },
  },
  {
    name: 'Frosted',
    category: 'glass',
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderRadius: 20,
    },
  },
  // Neumorphism
  {
    name: 'Neu Light',
    category: 'neumorphism',
    styles: {
      backgroundColor: '#e0e5ec',
      borderRadius: 20,
      boxShadow: '9px 9px 16px #a3b1c6, -9px -9px 16px #ffffff',
    },
  },
  {
    name: 'Neu Dark',
    category: 'neumorphism',
    styles: {
      backgroundColor: '#2d3436',
      borderRadius: 20,
      boxShadow: '9px 9px 16px #1e2324, -9px -9px 16px #3c4a48',
    },
  },
  {
    name: 'Neu Pressed',
    category: 'neumorphism',
    styles: {
      backgroundColor: '#e0e5ec',
      borderRadius: 20,
      boxShadow: 'inset 6px 6px 12px #a3b1c6, inset -6px -6px 12px #ffffff',
    },
  },
  // Material
  {
    name: 'Elevation 1',
    category: 'material',
    styles: {
      backgroundColor: '#ffffff',
      borderRadius: 4,
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    },
  },
  {
    name: 'Elevation 3',
    category: 'material',
    styles: {
      backgroundColor: '#ffffff',
      borderRadius: 4,
      boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    },
  },
  {
    name: 'Elevation 5',
    category: 'material',
    styles: {
      backgroundColor: '#ffffff',
      borderRadius: 4,
      boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    },
  },
  // Glow
  {
    name: 'Blue Glow',
    category: 'glow',
    styles: {
      backgroundColor: '#3b82f6',
      borderRadius: 12,
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
    },
  },
  {
    name: 'Purple Glow',
    category: 'glow',
    styles: {
      backgroundColor: '#8b5cf6',
      borderRadius: 12,
      boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)',
    },
  },
  {
    name: 'Green Glow',
    category: 'glow',
    styles: {
      backgroundColor: '#10b981',
      borderRadius: 12,
      boxShadow: '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)',
    },
  },
];

export const EffectsLibraryPanel = memo(function EffectsLibraryPanel() {
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

  const applyEffect = (preset: EffectPreset) => {
    if (!selectedElement) return;
    saveHistory();
    updateElementStyle(selectedElement.id, preset.styles);
  };

  if (!selectedElement) {
    return (
      <div style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>
        Select an element to apply effects
      </div>
    );
  }

  const categories = ['glass', 'neumorphism', 'material', 'glow'] as const;
  const categoryLabels = {
    glass: '🪟 Glassmorphism',
    neumorphism: '🔘 Neumorphism',
    material: '📦 Material',
    glow: '✨ Glow',
  };

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
        Effects Library
      </div>

      {categories.map((category) => (
        <div key={category} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#374151', marginBottom: 8, fontWeight: 500 }}>
            {categoryLabels[category]}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {EFFECT_PRESETS.filter((p) => p.category === category).map((preset) => (
              <button
                key={preset.name}
                style={{
                  padding: 8,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => applyEffect(preset)}
                title={preset.name}
              >
                <div
                  style={{
                    width: '100%',
                    height: 32,
                    borderRadius: preset.styles.borderRadius || 4,
                    backgroundColor: preset.styles.backgroundColor as string,
                    boxShadow: preset.styles.boxShadow,
                    backdropFilter: preset.styles.backdropFilter,
                    border: preset.styles.borderWidth 
                      ? `${preset.styles.borderWidth}px ${preset.styles.borderStyle} ${preset.styles.borderColor}`
                      : undefined,
                  }}
                />
                <div style={{ fontSize: 9, color: '#6b7280', marginTop: 4, textAlign: 'center' }}>
                  {preset.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
