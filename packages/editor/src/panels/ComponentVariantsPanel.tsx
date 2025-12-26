/**
 * Component Variants Panel - Manage component variants
 */

import React, { memo, useState, useCallback } from 'react';
import { useComponentStore, useCanvasStore, useHistoryStore, CanvasState, StyleProperties } from '@builder/core';

export const ComponentVariantsPanel = memo(function ComponentVariantsPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  const instances = useComponentStore((state) => state.instances);
  const components = useComponentStore((state) => state.components);
  const addVariant = useComponentStore((state) => state.addVariant);
  const deleteVariant = useComponentStore((state) => state.deleteVariant);
  const updateVariant = useComponentStore((state) => state.updateVariant);
  
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState('');
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

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

  // Check if selected element is part of a component (either master or instance)
  const isMasterComponent = selectedElement && !instance;
  const componentId = instance?.componentId;
  
  if (!component && !isMasterComponent) {
    return null;
  }

  const displayComponent = component;
  if (!displayComponent) return null;

  const handleAddVariant = () => {
    if (!newVariantName.trim() || !displayComponent) return;
    
    addVariant(displayComponent.id, {
      name: newVariantName.trim(),
      styleOverrides: {},
      propsOverrides: {},
    });
    
    setNewVariantName('');
    setIsAddingVariant(false);
  };

  const handleDeleteVariant = (variantId: string) => {
    if (!displayComponent) return;
    if (confirm('Delete this variant?')) {
      deleteVariant(displayComponent.id, variantId);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 12,
  };

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
          Variants ({displayComponent.variants.length})
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
          onClick={() => setIsAddingVariant(true)}
        >
          + Add
        </button>
      </div>

      {/* Add Variant Form */}
      {isAddingVariant && (
        <div style={{ 
          padding: 12, 
          backgroundColor: '#f9fafb', 
          borderRadius: 8, 
          marginBottom: 12,
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ marginBottom: 8 }}>
            <input
              type="text"
              style={inputStyle}
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              placeholder="Variant name (e.g., Hover, Active)"
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              style={{
                padding: '6px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                backgroundColor: '#fff',
                fontSize: 11,
                cursor: 'pointer',
              }}
              onClick={() => setIsAddingVariant(false)}
            >
              Cancel
            </button>
            <button
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 4,
                backgroundColor: '#3b82f6',
                color: '#fff',
                fontSize: 11,
                cursor: 'pointer',
              }}
              onClick={handleAddVariant}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Variants List */}
      {displayComponent.variants.length === 0 ? (
        <div style={{ 
          padding: 24, 
          textAlign: 'center', 
          color: '#9ca3af',
          fontSize: 12,
          backgroundColor: '#f9fafb',
          borderRadius: 8,
        }}>
          No variants yet.
          <br />
          Add variants for different states (hover, active, etc.)
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Default */}
          <div
            style={{
              padding: 12,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              backgroundColor: !instance?.variantId ? '#eff6ff' : '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: !instance?.variantId ? '#3b82f6' : '#e5e7eb',
                }} />
                <span style={{ fontSize: 12, fontWeight: 500 }}>Default</span>
              </div>
              <span style={{ fontSize: 10, color: '#9ca3af' }}>Base</span>
            </div>
          </div>

          {/* Custom Variants */}
          {displayComponent.variants.map((variant) => (
            <div
              key={variant.id}
              style={{
                padding: 12,
                border: '1px solid',
                borderColor: instance?.variantId === variant.id ? '#3b82f6' : '#e5e7eb',
                borderRadius: 8,
                backgroundColor: instance?.variantId === variant.id ? '#eff6ff' : '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: instance?.variantId === variant.id ? '#3b82f6' : '#e5e7eb',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{variant.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    style={{
                      padding: '2px 6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: 10,
                      cursor: 'pointer',
                      color: '#6b7280',
                    }}
                    onClick={() => setEditingVariantId(variant.id)}
                  >
                    ✏️
                  </button>
                  <button
                    style={{
                      padding: '2px 6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: 10,
                      cursor: 'pointer',
                      color: '#dc2626',
                    }}
                    onClick={() => handleDeleteVariant(variant.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* Variant Description */}
              {variant.description && (
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>
                  {variant.description}
                </div>
              )}
              
              {/* Override count */}
              {Object.keys(variant.styleOverrides).length > 0 && (
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                  {Object.keys(variant.styleOverrides).length} style overrides
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
