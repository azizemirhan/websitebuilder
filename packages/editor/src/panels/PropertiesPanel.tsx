/**
 * Properties Panel - Style inspector for selected elements
 */

import React, { memo, useCallback, useState, useEffect } from 'react';
import { useCanvasStore, Element, StyleProperties } from '@builder/core';

interface NumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const NumberInput = memo(function NumberInput({ 
  label, 
  value, 
  onChange, 
  min, 
  max,
  step = 1,
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(String(value ?? ''));
  
  useEffect(() => {
    setLocalValue(String(value ?? ''));
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };
  
  const handleBlur = () => {
    const num = parseFloat(localValue);
    if (!isNaN(num)) {
      onChange(num);
    } else {
      setLocalValue(String(value ?? ''));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</label>
      <input
        type="number"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        step={step}
        style={{
          padding: '6px 8px',
          border: '1px solid #e5e7eb',
          borderRadius: 4,
          fontSize: 13,
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
});

interface ColorInputProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

const ColorInput = memo(function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="color"
          value={value || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 32,
            height: 32,
            padding: 0,
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          style={{
            flex: 1,
            padding: '6px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            fontSize: 13,
          }}
        />
      </div>
    </div>
  );
});

interface TextInputProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  multiline?: boolean;
}

const TextInput = memo(function TextInput({ label, value, onChange, multiline }: TextInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</label>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: '6px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            fontSize: 13,
            minHeight: 60,
            resize: 'vertical',
          }}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: '6px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            fontSize: 13,
          }}
        />
      )}
    </div>
  );
});

const SectionTitle = memo(function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{
      fontSize: 12,
      fontWeight: 600,
      color: '#374151',
      padding: '12px 0 8px',
      borderTop: '1px solid #e5e7eb',
      marginTop: 8,
    }}>
      {title}
    </div>
  );
});

export const PropertiesPanel = memo(function PropertiesPanel() {
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const elements = useCanvasStore((state) => state.elements);
  const updateElement = useCanvasStore((state) => state.updateElement);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const updateElementProps = useCanvasStore((state) => state.updateElementProps);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;

  const handleStyleChange = useCallback((property: keyof StyleProperties, value: any) => {
    if (selectedElement) {
      updateElementStyle(selectedElement.id, { [property]: value });
    }
  }, [selectedElement, updateElementStyle]);

  const handleNameChange = useCallback((name: string) => {
    if (selectedElement) {
      updateElement(selectedElement.id, { name });
    }
  }, [selectedElement, updateElement]);

  const handlePropsChange = useCallback((key: string, value: any) => {
    if (selectedElement) {
      updateElementProps(selectedElement.id, { [key]: value });
    }
  }, [selectedElement, updateElementProps]);

  if (!selectedElement) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e5e7eb',
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: 600,
          fontSize: 13,
          color: '#1f2937',
        }}>
          Properties
        </div>
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: 13,
          textAlign: 'center',
          padding: 16,
        }}>
          {selectedIds.length > 1 
            ? 'Multiple elements selected'
            : 'Select an element to edit'
          }
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff',
      borderLeft: '1px solid #e5e7eb',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        fontWeight: 600,
        fontSize: 13,
        color: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ 
          backgroundColor: '#e0e7ff', 
          color: '#3b82f6', 
          padding: '2px 6px', 
          borderRadius: 4,
          fontSize: 11,
          textTransform: 'capitalize',
        }}>
          {selectedElement.type}
        </span>
        Properties
      </div>
      
      {/* Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {/* Name */}
        <TextInput
          label="Name"
          value={selectedElement.name}
          onChange={handleNameChange}
        />
        
        {/* Position */}
        <SectionTitle title="Position" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <NumberInput
            label="X"
            value={selectedElement.style.left}
            onChange={(v) => handleStyleChange('left', v)}
          />
          <NumberInput
            label="Y"
            value={selectedElement.style.top}
            onChange={(v) => handleStyleChange('top', v)}
          />
        </div>
        
        {/* Size */}
        <SectionTitle title="Size" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <NumberInput
            label="Width"
            value={selectedElement.style.width}
            onChange={(v) => handleStyleChange('width', v)}
            min={0}
          />
          <NumberInput
            label="Height"
            value={selectedElement.style.height}
            onChange={(v) => handleStyleChange('height', v)}
            min={0}
          />
        </div>
        
        {/* Appearance */}
        <SectionTitle title="Appearance" />
        <ColorInput
          label="Background"
          value={selectedElement.style.backgroundColor}
          onChange={(v) => handleStyleChange('backgroundColor', v)}
        />
        
        {selectedElement.type === 'text' && (
          <ColorInput
            label="Text Color"
            value={selectedElement.style.color}
            onChange={(v) => handleStyleChange('color', v)}
          />
        )}
        
        <NumberInput
          label="Border Radius"
          value={selectedElement.style.borderRadius}
          onChange={(v) => handleStyleChange('borderRadius', v)}
          min={0}
        />
        
        <NumberInput
          label="Opacity"
          value={selectedElement.style.opacity !== undefined ? selectedElement.style.opacity * 100 : 100}
          onChange={(v) => handleStyleChange('opacity', v / 100)}
          min={0}
          max={100}
          step={5}
        />
        
        {/* Element-specific props */}
        {selectedElement.type === 'text' && (
          <>
            <SectionTitle title="Text Content" />
            <TextInput
              label="Content"
              value={selectedElement.props?.content}
              onChange={(v) => handlePropsChange('content', v)}
              multiline
            />
            <NumberInput
              label="Font Size"
              value={selectedElement.style.fontSize}
              onChange={(v) => handleStyleChange('fontSize', v)}
              min={8}
            />
          </>
        )}
        
        {selectedElement.type === 'button' && (
          <>
            <SectionTitle title="Button" />
            <TextInput
              label="Text"
              value={selectedElement.props?.text}
              onChange={(v) => handlePropsChange('text', v)}
            />
            <ColorInput
              label="Text Color"
              value={selectedElement.style.color}
              onChange={(v) => handleStyleChange('color', v)}
            />
          </>
        )}
        
        {selectedElement.type === 'image' && (
          <>
            <SectionTitle title="Image" />
            <TextInput
              label="Image URL"
              value={selectedElement.props?.src}
              onChange={(v) => handlePropsChange('src', v)}
            />
            <TextInput
              label="Alt Text"
              value={selectedElement.props?.alt}
              onChange={(v) => handlePropsChange('alt', v)}
            />
          </>
        )}
        
        {selectedElement.type === 'input' && (
          <>
            <SectionTitle title="Input" />
            <TextInput
              label="Placeholder"
              value={selectedElement.props?.placeholder}
              onChange={(v) => handlePropsChange('placeholder', v)}
            />
          </>
        )}
      </div>
    </div>
  );
});
