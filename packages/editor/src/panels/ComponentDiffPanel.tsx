/**
 * Component Diff Panel - Show differences between instance and master
 */

import React, { memo, useState } from 'react';
import { useComponentStore, useCanvasStore, useHistoryStore, CanvasState, StyleProperties } from '@builder/core';

export const ComponentDiffPanel = memo(function ComponentDiffPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  const instances = useComponentStore((state) => state.instances);
  const components = useComponentStore((state) => state.components);
  const resetOverride = useComponentStore((state) => state.resetOverride);
  const updateComponent = useComponentStore((state) => state.updateComponent);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  const instance = selectedElement ? instances[selectedElement.id] : null;
  const component = instance ? components[instance.componentId] : null;

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['style']));

  if (!component || !instance || !selectedElement) {
    return null;
  }

  const overrides = instance.overrides[selectedElement.id];
  if (!overrides || Object.keys(overrides).length === 0) {
    return null;
  }

  const masterElement = component.elements[component.rootElementId];
  const styleOverrides = overrides.style || {};
  const propOverrides = overrides.props || {};
  
  const styleDiffs = Object.entries(styleOverrides).map(([key, value]) => ({
    property: key,
    instanceValue: value,
    masterValue: masterElement?.style?.[key as keyof StyleProperties],
  }));

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const handleResetProperty = (property: string) => {
    addToHistory({
      elements: useCanvasStore.getState().elements,
      rootElementIds: useCanvasStore.getState().rootElementIds,
      selectedElementIds: useCanvasStore.getState().selectedElementIds,
      hoveredElementId: useCanvasStore.getState().hoveredElementId,
    });
    
    // Reset the specific style property
    if (masterElement) {
      const masterValue = masterElement.style?.[property as keyof StyleProperties];
      updateElementStyle(selectedElement.id, { [property]: masterValue });
    }
  };

  const handlePushToMaster = (property: string, value: unknown) => {
    if (!confirm('Bu değişikliği master bileşene uygulamak istiyor musunuz? Tüm instance\'lar etkilenecek.')) return;
    
    // Update master component with this style
    const updatedElements = { ...component.elements };
    if (updatedElements[component.rootElementId]) {
      updatedElements[component.rootElementId] = {
        ...updatedElements[component.rootElementId],
        style: {
          ...updatedElements[component.rootElementId].style,
          [property]: value,
        },
      };
    }
    
    updateComponent(component.id, { elements: updatedElements });
  };

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef3c7' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#92400e', textTransform: 'uppercase' }}>
          Farklar ({styleDiffs.length})
        </span>
        <button
          style={{
            padding: '4px 8px',
            border: '1px solid #f59e0b',
            borderRadius: 4,
            backgroundColor: '#fff',
            color: '#92400e',
            fontSize: 10,
            cursor: 'pointer',
          }}
          onClick={() => resetOverride(instance.elementId, selectedElement.id)}
        >
          Tümünü Sıfırla
        </button>
      </div>

      {/* Style Diffs */}
      {styleDiffs.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button
            style={{
              width: '100%',
              padding: 8,
              border: '1px solid #fcd34d',
              borderRadius: 6,
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => toggleGroup('style')}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: '#92400e' }}>
              🎨 Stil Değişiklikleri ({styleDiffs.length})
            </span>
            <span>{expandedGroups.has('style') ? '▼' : '▶'}</span>
          </button>
          
          {expandedGroups.has('style') && (
            <div style={{ marginTop: 8 }}>
              {styleDiffs.map(({ property, instanceValue, masterValue }) => (
                <div
                  key={property}
                  style={{
                    padding: 10,
                    backgroundColor: '#fff',
                    border: '1px solid #fcd34d',
                    borderRadius: 6,
                    marginBottom: 4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                      {property}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        style={{
                          padding: '3px 6px',
                          border: '1px solid #e5e7eb',
                          borderRadius: 4,
                          backgroundColor: '#fff',
                          fontSize: 9,
                          cursor: 'pointer',
                        }}
                        onClick={() => handleResetProperty(property)}
                        title="Master değerine dön"
                      >
                        ↩️ Sıfırla
                      </button>
                      <button
                        style={{
                          padding: '3px 6px',
                          border: '1px solid #10b981',
                          borderRadius: 4,
                          backgroundColor: '#ecfdf5',
                          fontSize: 9,
                          cursor: 'pointer',
                          color: '#059669',
                        }}
                        onClick={() => handlePushToMaster(property, instanceValue)}
                        title="Bu değeri master'a uygula"
                      >
                        ↗️ Master'a Uygula
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    {/* Master Value */}
                    <div style={{ flex: 1, padding: 8, backgroundColor: '#fee2e2', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#dc2626', marginBottom: 2 }}>Master</div>
                      <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#111827' }}>
                        {String(masterValue ?? 'undefined')}
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>→</div>
                    
                    {/* Instance Value */}
                    <div style={{ flex: 1, padding: 8, backgroundColor: '#dcfce7', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#16a34a', marginBottom: 2 }}>Instance</div>
                      <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#111827' }}>
                        {String(instanceValue)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
