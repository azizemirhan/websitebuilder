/**
 * Component Usage Panel - Find all usages and bulk operations
 */

import React, { memo, useMemo } from 'react';
import { useComponentStore, useCanvasStore } from '@builder/core';

export const ComponentUsagePanel = memo(function ComponentUsagePanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const selectElement = useCanvasStore((state) => state.selectElement);
  
  const instances = useComponentStore((state) => state.instances);
  const components = useComponentStore((state) => state.components);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  const instance = selectedElement ? instances[selectedElement.id] : null;
  const component = instance ? components[instance.componentId] : null;

  // Find all instances of this component
  const componentInstances = useMemo(() => {
    if (!component) return [];
    
    return Object.values(instances).filter(inst => inst.componentId === component.id);
  }, [component, instances]);

  // Calculate usage statistics
  const stats = useMemo(() => {
    if (!component) return null;
    
    const totalInstances = componentInstances.length;
    const instancesWithOverrides = componentInstances.filter(
      inst => Object.keys(inst.overrides).length > 0
    ).length;
    const variantUsage: Record<string, number> = {};
    
    componentInstances.forEach(inst => {
      const variantId = inst.variantId || 'default';
      variantUsage[variantId] = (variantUsage[variantId] || 0) + 1;
    });
    
    return {
      totalInstances,
      instancesWithOverrides,
      variantUsage,
    };
  }, [component, componentInstances]);

  if (!component) {
    return null;
  }

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
        Kullanım İstatistikleri
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        <div style={{
          padding: 12,
          backgroundColor: '#eff6ff',
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
            {stats?.totalInstances || 0}
          </div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Toplam Instance</div>
        </div>
        
        <div style={{
          padding: 12,
          backgroundColor: '#fef3c7',
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>
            {stats?.instancesWithOverrides || 0}
          </div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Override'lı</div>
        </div>
      </div>

      {/* Variant Usage */}
      {component.variants.length > 0 && stats && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>Varyant Kullanımı</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{
              padding: 8,
              backgroundColor: '#f9fafb',
              borderRadius: 6,
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 11, color: '#374151' }}>Varsayılan</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6' }}>
                {stats.variantUsage['default'] || 0}
              </span>
            </div>
            {component.variants.map(variant => (
              <div
                key={variant.id}
                style={{
                  padding: 8,
                  backgroundColor: '#f9fafb',
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 11, color: '#374151' }}>{variant.name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6' }}>
                  {stats.variantUsage[variant.id] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instance List */}
      <div>
        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>
          Instance Listesi ({componentInstances.length})
        </div>
        <div style={{ maxHeight: 200, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {componentInstances.map((inst, index) => {
            const element = elements[inst.elementId];
            const hasOverrides = Object.keys(inst.overrides).length > 0;
            
            return (
              <button
                key={inst.elementId}
                style={{
                  padding: 10,
                  border: '1px solid',
                  borderColor: inst.elementId === selectedElement?.id ? '#3b82f6' : '#e5e7eb',
                  borderRadius: 6,
                  backgroundColor: inst.elementId === selectedElement?.id ? '#eff6ff' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onClick={() => selectElement(inst.elementId)}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: '#111827' }}>
                    Instance #{index + 1}
                  </div>
                  <div style={{ fontSize: 9, color: '#6b7280' }}>
                    {element?.style.left || 0}x{element?.style.top || 0}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {hasOverrides && (
                    <span style={{
                      padding: '2px 6px',
                      backgroundColor: '#fef3c7',
                      borderRadius: 4,
                      fontSize: 9,
                      color: '#92400e',
                    }}>
                      Override
                    </span>
                  )}
                  {inst.variantId && (
                    <span style={{
                      padding: '2px 6px',
                      backgroundColor: '#dbeafe',
                      borderRadius: 4,
                      fontSize: 9,
                      color: '#1d4ed8',
                    }}>
                      {component.variants.find(v => v.id === inst.variantId)?.name}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
