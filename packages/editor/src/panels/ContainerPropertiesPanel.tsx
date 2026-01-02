/**
 * Container Properties Panel - Container elementleri için özel ayarlar paneli
 */

import React from 'react';
import type { ContainerElement } from '@builder/core';
import { useCanvasStore, useThemeStore, themeColors } from '@builder/core';

interface ContainerPropertiesPanelProps {
  element: ContainerElement;
}

export const ContainerPropertiesPanel: React.FC<ContainerPropertiesPanelProps> = ({ element }) => {
  const updateElementProps = useCanvasStore((state) => state.updateElementProps);
  const generateGridCells = useCanvasStore((state) => state.generateGridCells);
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  const updateProp = (key: string, value: any) => {
    updateElementProps(element.id, { [key]: value });
    
    // Grid boyutu değiştiyse cell'leri yeniden oluştur
    if (key === 'gridTemplateColumns' || key === 'gridTemplateRows' || key === 'containerType') {
      setTimeout(() => {
        generateGridCells(element.id);
      }, 100);
    }
  };

  const props = element.props || {};
  
  // Theme-aware button style
  const buttonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px 12px',
    border: `2px solid ${active ? colors.primary : colors.border}`,
    borderRadius: 6,
    backgroundColor: active ? colors.primary : colors.surface,
    color: active ? '#ffffff' : colors.textMuted,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  });
  
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 8,
    color: colors.text,
  };

  return (
    <div className="container-properties" style={{ padding: '16px 0' }}>
      {/* Container Type */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>
          Container Tipi
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => updateProp('containerType', 'flex')}
            style={buttonStyle(props.containerType === 'flex' || !props.containerType)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Flexbox
          </button>
          <button
            onClick={() => {
              // Atomik olarak tüm grid değerlerini set et (Undefined durumunu önle)
              updateElementProps(element.id, {
                containerType: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                gridGap: 20
              });
              
              // Grid cell'leri oluştur (Kısa timeout yeterli çünkü props set edildi)
              setTimeout(() => {
                generateGridCells(element.id);
              }, 50);
            }}
            style={buttonStyle(props.containerType === 'grid')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Grid
          </button>
        </div>
      </div>

      {/* Flexbox Controls */}
      {(props.containerType === 'flex' || !props.containerType) && (
        <>
          {/* Direction */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              Direction
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => updateProp('direction', 'row')}
                style={buttonStyle(props.direction === 'row' || !props.direction)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Row
              </button>
              <button
                onClick={() => updateProp('direction', 'column')}
                style={buttonStyle(props.direction === 'column')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
                Column
              </button>
            </div>
          </div>

          {/* Justify Content */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              Justify Content
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { value: 'flex-start', label: 'Start' },
                { value: 'center', label: 'Center' },
                { value: 'flex-end', label: 'End' },
                { value: 'space-between', label: 'Between' },
                { value: 'space-around', label: 'Around' },
                { value: 'space-evenly', label: 'Evenly' },
              ].map(({ value, label }) => {
                const isActive = props.justifyContent === value || (!props.justifyContent && value === 'flex-start');
                return (
                  <button
                    key={value}
                    onClick={() => updateProp('justifyContent', value)}
                    title={label}
                    style={{
                      padding: '8px 6px',
                      border: `2px solid ${isActive ? colors.primary : colors.border}`,
                      borderRadius: 6,
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      color: isActive ? '#ffffff' : colors.textMuted,
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Align Items */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              Align Items
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { value: 'flex-start', label: 'Start' },
                { value: 'center', label: 'Center' },
                { value: 'flex-end', label: 'End' },
                { value: 'stretch', label: 'Stretch' },
              ].map(({ value, label }) => {
                const isActive = props.alignItems === value || (!props.alignItems && value === 'flex-start');
                return (
                  <button
                    key={value}
                    onClick={() => updateProp('alignItems', value)}
                    title={label}
                    style={{
                      padding: '8px 6px',
                      border: `2px solid ${isActive ? colors.primary : colors.border}`,
                      borderRadius: 6,
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      color: isActive ? '#ffffff' : colors.textMuted,
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {value === 'flex-start' && <path d="M4 6h16M4 12h10M4 18h16" />}
                      {value === 'center' && <path d="M4 6h16M7 12h10M4 18h16" />}
                      {value === 'flex-end' && <path d="M4 6h16M10 12h10M4 18h16" />}
                      {value === 'stretch' && <path d="M4 4h16v16H4z" />}
                    </svg>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gap */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              Gap
            </label>
            <input
              type="number"
              value={props.gap || 0}
              onChange={(e) => updateProp('gap', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                fontSize: 13,
                boxSizing: 'border-box',
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            />
          </div>

          {/* Wrap */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              Wrap
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => updateProp('flexWrap', 'nowrap')}
                style={buttonStyle(props.flexWrap === 'nowrap' || !props.flexWrap)}
              >
                No Wrap
              </button>
              <button
                onClick={() => updateProp('flexWrap', 'wrap')}
                style={buttonStyle(props.flexWrap === 'wrap')}
              >
                Wrap
              </button>
            </div>
          </div>
        </>
      )}

      {/* Grid Controls */}
      {props.containerType === 'grid' && (
        <>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              Sütun Sayısı
            </label>
            <input
              type="number"
              value={(() => {
                const cols = props.gridTemplateColumns || 'repeat(3, 1fr)';
                const match = cols.match(/repeat\((\d+),/);
                return match ? match[1] : '3';
              })()}
              onChange={(e) => {
                const count = parseInt(e.target.value) || 1;
                updateProp('gridTemplateColumns', `repeat(${count}, 1fr)`);
              }}
              min={1}
              max={12}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                fontSize: 13,
                boxSizing: 'border-box',
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            />
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
              {props.gridTemplateColumns || 'repeat(3, 1fr)'}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              Satır Sayısı
            </label>
            <select
              value={props.gridTemplateRows || 'repeat(3, 1fr)'}
              onChange={(e) => updateProp('gridTemplateRows', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                fontSize: 13,
                boxSizing: 'border-box',
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            >
              <option value="repeat(2, 1fr)">2 Satır</option>
              <option value="repeat(3, 1fr)">3 Satır</option>
              <option value="repeat(4, 1fr)">4 Satır</option>
              <option value="repeat(5, 1fr)">5 Satır</option>
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              Grid Gap
            </label>
            <input
              type="number"
              value={typeof props.gridGap === 'number' ? props.gridGap : 20}
              onChange={(e) => updateProp('gridGap', parseInt(e.target.value) || 20)}
              min={0}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                fontSize: 13,
                boxSizing: 'border-box',
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            />
          </div>
        </>
      )}

      {/* Width Mode */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>
          Width Mode
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => updateProp('widthMode', 'full')}
            style={buttonStyle(props.widthMode === 'full' || !props.widthMode)}
          >
            Full
          </button>
          <button
            onClick={() => updateProp('widthMode', 'boxed')}
            style={buttonStyle(props.widthMode === 'boxed')}
          >
            Boxed
          </button>
        </div>
      </div>

      {/* Max Width (only for boxed) */}
      {props.widthMode === 'boxed' && (
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>
            Max Width
          </label>
          <input
            type="number"
            value={props.maxWidth || 1200}
            onChange={(e) => updateProp('maxWidth', parseInt(e.target.value) || 1200)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              fontSize: 13,
              boxSizing: 'border-box',
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          />
        </div>
      )}
    </div>
  );
};
