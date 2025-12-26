/**
 * Component Instance Panel - Instance controls and overrides
 */

import React, { memo, useCallback } from 'react';
import { useComponentStore, useCanvasStore, useHistoryStore, CanvasState } from '@builder/core';

export const ComponentInstancePanel = memo(function ComponentInstancePanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  const instances = useComponentStore((state) => state.instances);
  const components = useComponentStore((state) => state.components);
  const unlinkInstance = useComponentStore((state) => state.unlinkInstance);
  const resetAllOverrides = useComponentStore((state) => state.resetAllOverrides);
  const setInstanceVariant = useComponentStore((state) => state.setInstanceVariant);

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

  if (!selectedElement || !instance || !component) {
    return null;
  }

  const overrideCount = Object.keys(instance.overrides).length;

  const handleDetach = () => {
    if (confirm('Detach this instance? It will no longer be linked to the master component.')) {
      unlinkInstance(selectedElement.id);
    }
  };

  const handleResetOverrides = () => {
    if (confirm('Reset all overrides to the master component state?')) {
      saveHistory();
      resetAllOverrides(selectedElement.id);
    }
  };

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef3c7' }}>
      {/* Instance Badge */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8,
        marginBottom: 12,
      }}>
        <div style={{
          padding: '4px 8px',
          backgroundColor: '#f59e0b',
          color: '#fff',
          fontSize: 10,
          fontWeight: 600,
          borderRadius: 4,
        }}>
          INSTANCE
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>
          {component.name}
        </div>
      </div>

      {/* Linked Component Info */}
      <div style={{
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1px solid #fcd34d',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
          Linked to master component
        </div>
        
        {/* Variants Selector */}
        {component.variants.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Variant</div>
            <select
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
              }}
              value={instance.variantId || ''}
              onChange={(e) => setInstanceVariant(selectedElement.id, e.target.value)}
            >
              <option value="">Default</option>
              {component.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Override Status */}
        {overrideCount > 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 11, color: '#92400e' }}>
              {overrideCount} override(s)
            </span>
            <button
              style={{
                padding: '4px 8px',
                border: 'none',
                backgroundColor: '#f59e0b',
                color: '#fff',
                fontSize: 10,
                borderRadius: 4,
                cursor: 'pointer',
              }}
              onClick={handleResetOverrides}
            >
              Reset
            </button>
          </div>
        )}

        {/* Component Props */}
        {component.props.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>Properties</div>
            {component.props.map((prop) => (
              <div key={prop.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#374151', marginBottom: 4 }}>{prop.name}</div>
                {prop.type === 'string' && (
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                    value={(instance.propValues[prop.id] as string) || (prop.defaultValue as string) || ''}
                    onChange={(e) => {
                      saveHistory();
                      useComponentStore.getState().setInstancePropValue(selectedElement.id, prop.id, e.target.value);
                    }}
                  />
                )}
                {prop.type === 'boolean' && (
                  <button
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 4,
                      backgroundColor: (instance.propValues[prop.id] ?? prop.defaultValue) ? '#dbeafe' : '#fff',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      saveHistory();
                      const currentValue = instance.propValues[prop.id] ?? prop.defaultValue;
                      useComponentStore.getState().setInstancePropValue(selectedElement.id, prop.id, !currentValue);
                    }}
                  >
                    {(instance.propValues[prop.id] ?? prop.defaultValue) ? 'ON' : 'OFF'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            backgroundColor: '#fff',
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onClick={() => {/* TODO: Go to master */}}
        >
          Go to Master
        </button>
        <button
          style={{
            padding: '10px 16px',
            border: '1px solid #dc2626',
            borderRadius: 6,
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onClick={handleDetach}
        >
          Detach
        </button>
      </div>
    </div>
  );
});
