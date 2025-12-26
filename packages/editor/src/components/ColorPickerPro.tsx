/**
 * Color Picker Pro - Advanced color picker with HSL/RGB/HEX modes
 */

import React, { memo, useState, useCallback } from 'react';

interface ColorPickerProProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

type ColorMode = 'hex' | 'rgb' | 'hsl';

interface RGBColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface HSLColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

// Color conversion utilities
const hexToRgb = (hex: string): RGBColor => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: result[4] ? parseInt(result[4], 16) / 255 : 1,
  } : { r: 0, g: 0, b: 0, a: 1 };
};

const rgbToHex = (rgb: RGBColor): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const alpha = rgb.a < 1 ? toHex(Math.round(rgb.a * 255)) : '';
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}${alpha}`;
};

const rgbToHsl = (rgb: RGBColor): HSLColor => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100), a: rgb.a };
};

const hslToRgb = (hsl: HSLColor): RGBColor => {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: hsl.a };
};

export const ColorPickerPro = memo(function ColorPickerPro({ value, onChange, label }: ColorPickerProProps) {
  const [mode, setMode] = useState<ColorMode>('hex');
  const [showPicker, setShowPicker] = useState(false);
  const [colorHistory, setColorHistory] = useState<string[]>([]);

  const rgb = hexToRgb(value);
  const hsl = rgbToHsl(rgb);

  const addToHistory = (color: string) => {
    setColorHistory((prev) => {
      const filtered = prev.filter((c) => c !== color);
      return [color, ...filtered].slice(0, 8);
    });
  };

  const handleChange = useCallback((newColor: string) => {
    onChange(newColor);
  }, [onChange]);

  const handleBlur = () => {
    addToHistory(value);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #e5e7eb',
    borderRadius: 4,
    fontSize: 12,
    textAlign: 'center',
  };

  const modeButtonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '4px 8px',
    border: 'none',
    backgroundColor: active ? '#3b82f6' : '#f3f4f6',
    color: active ? '#fff' : '#6b7280',
    fontSize: 10,
    fontWeight: 600,
    cursor: 'pointer',
    borderRadius: 4,
  });

  return (
    <div style={{ marginBottom: 12 }}>
      {label && <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>{label}</div>}
      
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Color Preview */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            backgroundColor: value,
            border: '1px solid rgba(0,0,0,0.1)',
            cursor: 'pointer',
            position: 'relative',
            backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                             linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                             linear-gradient(45deg, transparent 75%, #ccc 75%), 
                             linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          }}
          onClick={() => setShowPicker(!showPicker)}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: value,
              borderRadius: 5,
            }}
          />
        </div>

        {/* Native color picker */}
        <input
          type="color"
          value={value.slice(0, 7)}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
          id={`color-picker-${label}`}
        />
        
        {/* Hex/RGB/HSL Input */}
        <div style={{ flex: 1 }}>
          {mode === 'hex' && (
            <input
              type="text"
              style={inputStyle}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
            />
          )}
          {mode === 'rgb' && (
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="number"
                style={{ ...inputStyle, padding: '4px' }}
                value={rgb.r}
                min={0}
                max={255}
                onChange={(e) => handleChange(rgbToHex({ ...rgb, r: Number(e.target.value) }))}
              />
              <input
                type="number"
                style={{ ...inputStyle, padding: '4px' }}
                value={rgb.g}
                min={0}
                max={255}
                onChange={(e) => handleChange(rgbToHex({ ...rgb, g: Number(e.target.value) }))}
              />
              <input
                type="number"
                style={{ ...inputStyle, padding: '4px' }}
                value={rgb.b}
                min={0}
                max={255}
                onChange={(e) => handleChange(rgbToHex({ ...rgb, b: Number(e.target.value) }))}
              />
            </div>
          )}
          {mode === 'hsl' && (
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="number"
                style={{ ...inputStyle, padding: '4px' }}
                value={hsl.h}
                min={0}
                max={360}
                onChange={(e) => handleChange(rgbToHex(hslToRgb({ ...hsl, h: Number(e.target.value) })))}
              />
              <input
                type="number"
                style={{ ...inputStyle, padding: '4px' }}
                value={hsl.s}
                min={0}
                max={100}
                onChange={(e) => handleChange(rgbToHex(hslToRgb({ ...hsl, s: Number(e.target.value) })))}
              />
              <input
                type="number"
                style={{ ...inputStyle, padding: '4px' }}
                value={hsl.l}
                min={0}
                max={100}
                onChange={(e) => handleChange(rgbToHex(hslToRgb({ ...hsl, l: Number(e.target.value) })))}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        <button style={modeButtonStyle(mode === 'hex')} onClick={() => setMode('hex')}>HEX</button>
        <button style={modeButtonStyle(mode === 'rgb')} onClick={() => setMode('rgb')}>RGB</button>
        <button style={modeButtonStyle(mode === 'hsl')} onClick={() => setMode('hsl')}>HSL</button>
      </div>

      {/* Alpha Slider */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>
          <span>Opacity</span>
          <span>{Math.round(rgb.a * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={rgb.a * 100}
          onChange={(e) => handleChange(rgbToHex({ ...rgb, a: Number(e.target.value) / 100 }))}
          style={{ width: '100%', accentColor: '#3b82f6' }}
        />
      </div>

      {/* Color History */}
      {colorHistory.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Recent</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {colorHistory.map((color, i) => (
              <div
                key={i}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: color,
                  border: '1px solid rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                }}
                onClick={() => handleChange(color)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
