/**
 * Component Library Panel - Browse and use components
 */

import React, { memo, useState, useCallback } from 'react';
import { useComponentStore, useCanvasStore, useHistoryStore, CanvasState, useThemeStore, themeColors } from '@builder/core';

const CATEGORIES = ['All', 'Layout', 'Navigation', 'Forms', 'Content', 'Custom'];

export const ComponentLibraryPanel = memo(function ComponentLibraryPanel() {
  const components = useComponentStore((state) => state.components);
  const createInstance = useComponentStore((state) => state.createInstance);
  const deleteComponent = useComponentStore((state) => state.deleteComponent);
  
  const addElement = useCanvasStore((state) => state.addElement);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];
  
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
    backgroundColor: active ? colors.primary : 'transparent',
    color: active ? '#ffffff' : colors.textMuted,
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 6,
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: 16, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          Components
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
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 12,
            backgroundColor: colors.surface,
            color: colors.text,
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
        
        {/* ADDED: Standard Widgets Section */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 8, paddingLeft: 4 }}>
            TEMEL (Sürükle Bırak)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[
              { type: 'container', label: 'Container', iconSvg: '<rect x="3" y="3" width="18" height="18" rx="2" />' },
              { type: 'text', label: 'Text', iconSvg: '<path d="M4 7V4h16v3M9 20h6M12 4v16" />' },
              { type: 'button', label: 'Button', iconSvg: '<rect x="2" y="6" width="20" height="12" rx="2" />' },
              { type: 'image', label: 'Image', iconSvg: '<rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />' },
              { type: 'input', label: 'Input', iconSvg: '<rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h10" />' },
              { type: 'menu', label: 'Menü', iconSvg: '<line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />' },
            ].map((widget) => (
              <div
                key={widget.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({
                    type: 'new_element',
                    elementType: widget.type,
                    name: widget.label
                  }));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  cursor: 'grab',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.1s ease',
                  userSelect: 'none'
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = colors.primary)}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = colors.border)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="1.5" dangerouslySetInnerHTML={{ __html: widget.iconSvg }} />
                <div style={{ fontSize: 12, fontWeight: 500, color: colors.text }}>{widget.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Existing User Components */}
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 8, paddingLeft: 4 }}>
          KAYDEDİLENLER
        </div>

        {filteredComponents.length === 0 ? (
          <div style={{ 
            padding: 32, 
            textAlign: 'center', 
            color: colors.textMuted,
            fontSize: 13,
          }}>
            {componentList.length === 0 ? (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
                </svg>
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
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: colors.surface,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setExpandedId(expandedId === comp.id ? null : comp.id)}
              >
                {/* Preview */}
                <div
                  style={{
                    height: 80,
                    backgroundColor: colors.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: colors.border,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.textMuted,
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M12 18v-6" />
                      <path d="M9 15h6" />
                    </svg>
                  </div>
                </div>
                
                {/* Info */}
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                    {comp.name}
                  </div>
                  <div style={{ fontSize: 10, color: colors.textMuted }}>
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
                          backgroundColor: colors.primary,
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
                          border: `1px solid ${colors.border}`,
                          borderRadius: 6,
                          backgroundColor: colors.surface,
                          fontSize: 11,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.textMuted
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteComponent(comp.id);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
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
