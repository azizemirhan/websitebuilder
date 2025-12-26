/**
 * Create Component Modal - Convert selection to component
 */

import React, { memo, useState, useCallback } from 'react';
import { useComponentStore, useCanvasStore } from '@builder/core';

interface CreateComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = ['Layout', 'Navigation', 'Forms', 'Content', 'Custom'];

export const CreateComponentModal = memo(function CreateComponentModal({ isOpen, onClose }: CreateComponentModalProps) {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const createComponent = useComponentStore((state) => state.createComponent);
  const linkInstance = useComponentStore((state) => state.linkInstance);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Custom');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const handleCreate = useCallback(() => {
    if (!name.trim() || selectedIds.length === 0) return;
    
    // Get selected elements and their children
    const selectedElements: Record<string, typeof elements[string]> = {};
    const rootId = selectedIds[0];
    
    const collectElements = (id: string) => {
      const element = elements[id];
      if (element) {
        selectedElements[id] = element;
        element.children.forEach(collectElements);
      }
    };
    
    selectedIds.forEach(collectElements);
    
    // Create the component
    const componentId = createComponent(name.trim(), selectedElements, rootId, category);
    
    // Update component with additional metadata
    useComponentStore.getState().updateComponent(componentId, {
      description: description.trim() || undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    
    // Link the original selection as an instance
    linkInstance(rootId, componentId);
    
    // Reset and close
    setName('');
    setDescription('');
    setTags('');
    onClose();
  }, [name, category, description, tags, selectedIds, elements, createComponent, linkInstance, onClose]);

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 400,
          backgroundColor: '#fff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
            Create Component
          </div>
          <button
            style={{
              width: 32,
              height: 32,
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: 20,
              cursor: 'pointer',
              color: '#6b7280',
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          {selectedIds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#6b7280' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👆</div>
              <div>Select elements first to create a component</div>
            </div>
          ) : (
            <>
              <div style={{ 
                padding: 12, 
                backgroundColor: '#f0fdf4', 
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 13,
                color: '#166534',
              }}>
                ✓ {selectedIds.length} element(s) selected
              </div>

              {/* Name */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Component Name *
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Button, Card, Header..."
                  autoFocus
                />
              </div>

              {/* Category */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Category
                </label>
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Description
                </label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this component do?"
                />
              </div>

              {/* Tags */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="button, primary, cta"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
        }}>
          <button
            style={{
              padding: '10px 20px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              backgroundColor: '#fff',
              fontSize: 14,
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 8,
              backgroundColor: name.trim() && selectedIds.length > 0 ? '#3b82f6' : '#e5e7eb',
              color: name.trim() && selectedIds.length > 0 ? '#fff' : '#9ca3af',
              fontSize: 14,
              fontWeight: 500,
              cursor: name.trim() && selectedIds.length > 0 ? 'pointer' : 'not-allowed',
            }}
            onClick={handleCreate}
            disabled={!name.trim() || selectedIds.length === 0}
          >
            Create Component
          </button>
        </div>
      </div>
    </div>
  );
});
