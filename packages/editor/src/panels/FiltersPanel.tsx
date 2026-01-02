/**
 * Filters Panel - CSS filters and blend modes
 */

import React, { memo, useCallback, useState } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState, StyleProperties, useThemeStore, themeColors } from '@builder/core';

interface FilterValues {
  blur: number;
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  hueRotate: number;
}

const BLEND_MODES: StyleProperties['mixBlendMode'][] = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'difference', 'exclusion',
];

const parseFilters = (filterStr: string): FilterValues => {
  const defaults: FilterValues = { blur: 0, brightness: 100, contrast: 100, saturate: 100, grayscale: 0, hueRotate: 0 };
  if (!filterStr || filterStr === 'none') return defaults;

  const blurMatch = filterStr.match(/blur\((\d+)px\)/);
  const brightnessMatch = filterStr.match(/brightness\((\d+)%\)/);
  const contrastMatch = filterStr.match(/contrast\((\d+)%\)/);
  const saturateMatch = filterStr.match(/saturate\((\d+)%\)/);
  const grayscaleMatch = filterStr.match(/grayscale\((\d+)%\)/);
  const hueRotateMatch = filterStr.match(/hue-rotate\((\d+)deg\)/);

  return {
    blur: blurMatch ? parseInt(blurMatch[1]) : 0,
    brightness: brightnessMatch ? parseInt(brightnessMatch[1]) : 100,
    contrast: contrastMatch ? parseInt(contrastMatch[1]) : 100,
    saturate: saturateMatch ? parseInt(saturateMatch[1]) : 100,
    grayscale: grayscaleMatch ? parseInt(grayscaleMatch[1]) : 0,
    hueRotate: hueRotateMatch ? parseInt(hueRotateMatch[1]) : 0,
  };
};

const filtersToString = (filters: FilterValues): string => {
  const parts: string[] = [];
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
  if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturate !== 100) parts.push(`saturate(${filters.saturate}%)`);
  if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.hueRotate > 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
};

export const FiltersPanel = memo(function FiltersPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;

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

  if (!selectedElement) {
    return null;
  }

  const style = selectedElement.style;
  const filters = parseFilters(style.filter || '');

  const updateFilter = (key: keyof FilterValues, value: number) => {
    saveHistory();
    const newFilters = { ...filters, [key]: value };
    updateElementStyle(selectedElement.id, { filter: filtersToString(newFilters) });
  };

  const resetFilters = () => {
    saveHistory();
    updateElementStyle(selectedElement.id, { filter: 'none' });
  };

  const sliderStyle: React.CSSProperties = {
    width: '100%',
    accentColor: colors.primary,
  };

  return (
    <div style={{ padding: 16, borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase' }}>
          Filters & Effects
        </span>
        <button
          style={{
            padding: '4px 8px',
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            backgroundColor: colors.surface,
            fontSize: 10,
            cursor: 'pointer',
            color: colors.textMuted,
          }}
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* Blur */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
          <span>Blur</span>
          <span>{filters.blur}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={filters.blur}
          onChange={(e) => updateFilter('blur', Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Brightness */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
          <span>Brightness</span>
          <span>{filters.brightness}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          value={filters.brightness}
          onChange={(e) => updateFilter('brightness', Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Contrast */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
          <span>Contrast</span>
          <span>{filters.contrast}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          value={filters.contrast}
          onChange={(e) => updateFilter('contrast', Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Saturate */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
          <span>Saturation</span>
          <span>{filters.saturate}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          value={filters.saturate}
          onChange={(e) => updateFilter('saturate', Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      {/* Opacity */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>
          <span>Opacity</span>
          <span>{Math.round((style.opacity ?? 1) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={(style.opacity ?? 1) * 100}
          onChange={(e) => {
            saveHistory();
            updateElementStyle(selectedElement.id, { opacity: Number(e.target.value) / 100 });
          }}
          style={sliderStyle}
        />
      </div>

      {/* Blend Mode */}
      <div>
        <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>Blend Mode</div>
        <select
          style={{
            width: '100%',
            padding: '8px 10px',
            border: `1px solid ${colors.border}`,
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
            backgroundColor: colors.surface,
            color: colors.text,
          }}
          value={style.mixBlendMode || 'normal'}
          onChange={(e) => {
            saveHistory();
            updateElementStyle(selectedElement.id, { mixBlendMode: e.target.value as StyleProperties['mixBlendMode'] });
          }}
        >
          {BLEND_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});
