/**
 * Properties Panel - Style inspector for selected elements
 */

import React, { memo, useCallback, useState, useEffect } from 'react';
import { useCanvasStore, Element, StyleProperties, SlideData, useThemeStore, themeColors } from '@builder/core';
import { SlideEditorModal } from '../components/SlideEditorModal';
import { ContainerPropertiesPanel } from './ContainerPropertiesPanel';

interface NumberInputProps {
  label: string;
  value: number | string | undefined;
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
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  // Convert string | number | undefined to display string
  const displayValue = value !== undefined ? String(value) : '';
  const [localValue, setLocalValue] = useState(displayValue);

  useEffect(() => {
    setLocalValue(displayValue);
  }, [displayValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    const num = parseFloat(localValue);
    if (!isNaN(num)) {
      onChange(num);
    } else {
      setLocalValue(displayValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>{label}</label>
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
          border: `1px solid ${colors.border}`,
          borderRadius: 4,
          fontSize: 13,
          width: '100%',
          boxSizing: 'border-box',
          backgroundColor: colors.surface,
          color: colors.text,
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
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="color"
          value={value || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 32,
            height: 32,
            padding: 0,
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            cursor: 'pointer',
            backgroundColor: 'transparent',
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
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            fontSize: 13,
            backgroundColor: colors.surface,
            color: colors.text,
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
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>{label}</label>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: '6px 8px',
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            fontSize: 13,
            minHeight: 60,
            resize: 'vertical',
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: '6px 8px',
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            fontSize: 13,
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />
      )}
    </div>
  );
});

const SectionTitle = memo(function SectionTitle({ title }: { title: string }) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  return (
    <div style={{
      fontSize: 12,
      fontWeight: 600,
      color: colors.text,
      padding: '12px 0 8px',
      borderTop: `1px solid ${colors.border}`,
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

  // Slide editor modal state
  const [isSlideEditorOpen, setIsSlideEditorOpen] = useState(false);

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

  const handleSaveSlides = useCallback((slides: SlideData[]) => {
    if (selectedElement) {
      updateElementProps(selectedElement.id, { slides });
    }
  }, [selectedElement, updateElementProps]);

  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  if (!selectedElement) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: colors.surface,
        borderLeft: `1px solid ${colors.border}`,
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${colors.border}`,
          fontWeight: 600,
          fontSize: 13,
          color: colors.text,
        }}>
          Properties
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
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
      backgroundColor: colors.surface,
      borderLeft: `1px solid ${colors.border}`,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
        fontWeight: 600,
        fontSize: 13,
        color: colors.text,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          backgroundColor: colors.primary + '20', // 20% opacity using hex
          color: colors.primary,
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

        {/* Container-specific props */}
        {selectedElement.type === 'container' && (
          <>
            <SectionTitle title="Container Layout" />
            <ContainerPropertiesPanel element={selectedElement} />
          </>
        )}

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

        {/* Slider specific section */}
        {selectedElement.type === 'slider' && (
          <>
            <SectionTitle title="Slider" />

            {/* Slide count display */}
            <div style={{
              padding: 12,
              backgroundColor: colors.surface, 
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  {selectedElement.props?.slides?.length || 0} Slayt
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                  Düzenlemek için butona tıklayın
                </div>
              </div>
            </div>

            {/* Edit Slides Button */}
            <button
              onClick={() => setIsSlideEditorOpen(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: colors.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 12,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Slaytları Düzenle
            </button>

            {/* Slider Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>Auto-play</label>
                <select
                  value={selectedElement.props?.autoPlay ? 'true' : 'false'}
                  onChange={(e) => handlePropsChange('autoPlay', e.target.value === 'true')}
                  style={{
                    padding: '6px 8px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    fontSize: 13,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="true">Açık</option>
                  <option value="false">Kapalı</option>
                </select>
              </div>
              <NumberInput
                label="Süre (ms)"
                value={selectedElement.props?.interval || 6000}
                onChange={(v) => handlePropsChange('interval', v)}
                min={1000}
                step={500}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>Ok Göster</label>
                <select
                  value={selectedElement.props?.showArrows ? 'true' : 'false'}
                  onChange={(e) => handlePropsChange('showArrows', e.target.value === 'true')}
                  style={{
                    padding: '6px 8px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    fontSize: 13,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="true">Evet</option>
                  <option value="false">Hayır</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>Nokta Göster</label>
                <select
                  value={selectedElement.props?.showDots ? 'true' : 'false'}
                  onChange={(e) => handlePropsChange('showDots', e.target.value === 'true')}
                  style={{
                    padding: '6px 8px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    fontSize: 13,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="true">Evet</option>
                  <option value="false">Hayır</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Slide Editor Modal */}
      {isSlideEditorOpen && selectedElement.type === 'slider' && (
        <SlideEditorModal
          slides={selectedElement.props?.slides || []}
          onSave={handleSaveSlides}
          onClose={() => setIsSlideEditorOpen(false)}
        />
      )}
    </div>
  );
});

