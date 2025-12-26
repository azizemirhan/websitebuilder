/**
 * Component States Panel - Interactive state management (hover, active, etc.)
 */

import React, { memo, useState, useCallback } from 'react';
import { useComponentStore, useCanvasStore, useHistoryStore, CanvasState, StyleProperties } from '@builder/core';

type ComponentState = 'default' | 'hover' | 'active' | 'focus' | 'disabled';

const STATE_INFO: Record<ComponentState, { label: string; icon: string; color: string }> = {
  default: { label: 'Varsayılan', icon: '⬜', color: '#6b7280' },
  hover: { label: 'Hover', icon: '👆', color: '#3b82f6' },
  active: { label: 'Active', icon: '✋', color: '#10b981' },
  focus: { label: 'Focus', icon: '🎯', color: '#8b5cf6' },
  disabled: { label: 'Disabled', icon: '🚫', color: '#9ca3af' },
};

export const ComponentStatesPanel = memo(function ComponentStatesPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  const instances = useComponentStore((state) => state.instances);
  const components = useComponentStore((state) => state.components);
  const addVariant = useComponentStore((state) => state.addVariant);
  const updateVariant = useComponentStore((state) => state.updateVariant);
  const setInstanceVariant = useComponentStore((state) => state.setInstanceVariant);
  
  const [activeState, setActiveState] = useState<ComponentState>('default');
  const [previewState, setPreviewState] = useState<ComponentState | null>(null);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  const instance = selectedElement ? instances[selectedElement.id] : null;
  const component = instance ? components[instance.componentId] : null;

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

  if (!component) {
    return null;
  }

  // Find or create state variants
  const getStateVariant = (state: ComponentState) => {
    return component.variants.find(v => v.name.toLowerCase() === state);
  };

  const handleCreateState = (state: ComponentState) => {
    if (state === 'default') return;
    
    const existingVariant = getStateVariant(state);
    if (existingVariant) return;
    
    addVariant(component.id, {
      name: state,
      description: `${STATE_INFO[state].label} durumu`,
      styleOverrides: {},
      propsOverrides: {},
    });
  };

  const handleApplyStateStyle = (style: Partial<StyleProperties>) => {
    if (activeState === 'default' || !selectedElement) return;
    
    const variant = getStateVariant(activeState);
    if (variant) {
      updateVariant(component.id, variant.id, {
        styleOverrides: { ...variant.styleOverrides, ...style },
      });
    }
  };

  const handlePreviewState = (state: ComponentState) => {
    if (!instance) return;
    setPreviewState(state);
    
    const variant = getStateVariant(state);
    if (variant) {
      setInstanceVariant(instance.elementId, variant.id);
    } else {
      setInstanceVariant(instance.elementId, '');
    }
  };

  const stateButtonStyle = (state: ComponentState, isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 8px',
    border: '2px solid',
    borderColor: isActive ? STATE_INFO[state].color : '#e5e7eb',
    borderRadius: 8,
    backgroundColor: isActive ? `${STATE_INFO[state].color}15` : '#fff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
        Bileşen Durumları
      </div>

      {/* State Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginBottom: 16 }}>
        {(Object.keys(STATE_INFO) as ComponentState[]).map((state) => {
          const variant = getStateVariant(state);
          const isCreated = state === 'default' || !!variant;
          
          return (
            <button
              key={state}
              style={stateButtonStyle(state, activeState === state)}
              onClick={() => {
                if (!isCreated) {
                  handleCreateState(state);
                }
                setActiveState(state);
              }}
              onMouseEnter={() => handlePreviewState(state)}
              onMouseLeave={() => handlePreviewState('default')}
            >
              <span style={{ fontSize: 16 }}>{STATE_INFO[state].icon}</span>
              <span style={{ fontSize: 9, color: STATE_INFO[state].color, fontWeight: 500 }}>
                {STATE_INFO[state].label}
              </span>
              {!isCreated && (
                <span style={{ fontSize: 8, color: '#9ca3af' }}>+ Ekle</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Style Presets */}
      {activeState !== 'default' && (
        <div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>
            {STATE_INFO[activeState].label} için hızlı stiller
          </div>
          
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {activeState === 'hover' && (
              <>
                <button
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleApplyStateStyle({ opacity: 0.8 })}
                >
                  Opaklık -20%
                </button>
                <button
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleApplyStateStyle({ transform: 'scale(1.05)' })}
                >
                  Büyüt
                </button>
                <button
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleApplyStateStyle({ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' })}
                >
                  Gölge Ekle
                </button>
              </>
            )}
            
            {activeState === 'active' && (
              <>
                <button
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleApplyStateStyle({ transform: 'scale(0.95)' })}
                >
                  Küçült
                </button>
                <button
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleApplyStateStyle({ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' })}
                >
                  İç Gölge
                </button>
              </>
            )}
            
            {activeState === 'focus' && (
              <>
                <button
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleApplyStateStyle({ boxShadow: '0 0 0 3px rgba(59,130,246,0.3)' })}
                >
                  Focus Ring
                </button>
                <button
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleApplyStateStyle({ borderColor: '#3b82f6' })}
                >
                  Border Rengi
                </button>
              </>
            )}
            
            {activeState === 'disabled' && (
              <>
                <button
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleApplyStateStyle({ opacity: 0.5 })}
                >
                  Opaklık 50%
                </button>
                <button
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleApplyStateStyle({ filter: 'grayscale(100%)' })}
                >
                  Gri Ton
                </button>
                <button
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    backgroundColor: '#fff',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleApplyStateStyle({ cursor: 'not-allowed' })}
                >
                  Cursor: Not-allowed
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview Info */}
      {previewState && previewState !== 'default' && (
        <div style={{
          marginTop: 12,
          padding: 8,
          backgroundColor: `${STATE_INFO[previewState].color}15`,
          borderRadius: 6,
          fontSize: 10,
          color: STATE_INFO[previewState].color,
          textAlign: 'center',
        }}>
          {STATE_INFO[previewState].label} önizlemesi
        </div>
      )}
    </div>
  );
});
