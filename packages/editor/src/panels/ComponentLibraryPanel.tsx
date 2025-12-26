/**
 * Component Library Panel - Browse and use components
 */

import React, { memo, useState, useCallback } from 'react';
import { useComponentStore, useCanvasStore, useHistoryStore, CanvasState } from '@builder/core';

const CATEGORIES = ['All', 'Layout', 'Navigation', 'Forms', 'Content', 'Custom'];

export const ComponentLibraryPanel = memo(function ComponentLibraryPanel() {
  const components = useComponentStore((state) => state.components);
  const createInstance = useComponentStore((state) => state.createInstance);
  const deleteComponent = useComponentStore((state) => state.deleteComponent);
  
  const addElement = useCanvasStore((state) => state.addElement);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
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

  const componentList = Object.values(components);
  
  const filteredComponents = componentList.filter((comp) => {
    const matchesCategory = activeCategory === 'All' || comp.category === activeCategory;
    const matchesSearch = !searchQuery || 
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddInstance = (componentId: string) => {
    saveHistory();
    const { elements } = createInstance(componentId, { x: 100, y: 100 });
    
    // Add all elements to canvas
    Object.values(elements).forEach((element) => {
      addElement(element);
    });
  };

  const handleDeleteComponent = (componentId: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      deleteComponent(componentId);
    }
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    border: 'none',
    backgroundColor: active ? '#3b82f6' : 'transparent',
    color: active ? '#fff' : '#6b7280',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 6,
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
          🧩 Components
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 12,
          }}
        />
        
        {/* Categories */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              style={tabStyle(activeCategory === cat)}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {filteredComponents.length === 0 ? (
          <div style={{ 
            padding: 32, 
            textAlign: 'center', 
            color: '#9ca3af',
            fontSize: 13,
          }}>
            {componentList.length === 0 ? (
              <>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
                <div>No components yet</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>
                  Select elements and create a component
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                <div>No components found</div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {filteredComponents.map((comp) => (
              <div
                key={comp.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setExpandedId(expandedId === comp.id ? null : comp.id)}
              >
                {/* Preview */}
                <div
                  style={{
                    height: 80,
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}
                  >
                    🧩
                  </div>
                </div>
                
                {/* Info */}
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                    {comp.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#6b7280' }}>
                    {comp.category} · {comp.variants.length} variants
                  </div>
                  
                  {/* Expanded Actions */}
                  {expandedId === comp.id && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 4 }}>
                      <button
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: 'none',
                          borderRadius: 6,
                          backgroundColor: '#3b82f6',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddInstance(comp.id);
                        }}
                      >
                        + Add
                      </button>
                      <button
                        style={{
                          padding: '8px',
                          border: '1px solid #e5e7eb',
                          borderRadius: 6,
                          backgroundColor: '#fff',
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteComponent(comp.id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
