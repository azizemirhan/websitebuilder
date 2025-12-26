/**
 * Smart Guides - Dynamic alignment guide lines
 */

import React, { memo, useMemo } from 'react';
import { useCanvasStore, useSettingsStore, Element } from '@builder/core';

interface GuideLines {
  vertical: number[];
  horizontal: number[];
}

// Helper to safely get numeric value from string | number | undefined
const getNumericValue = (value: number | string | undefined, fallback = 0): number => {
  if (value === undefined) return fallback;
  if (typeof value === 'number') return value;
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
};

export const SmartGuides = memo(function SmartGuides() {
  const showSmartGuides = useSettingsStore((state) => state.showSmartGuides);
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);

  const guides = useMemo(() => {
    if (!showSmartGuides || selectedIds.length !== 1) {
      return { vertical: [], horizontal: [] };
    }

    const selectedElement = elements[selectedIds[0]];
    if (!selectedElement) return { vertical: [], horizontal: [] };

    const selectedLeft = getNumericValue(selectedElement.style.left);
    const selectedTop = getNumericValue(selectedElement.style.top);
    const selectedWidth = getNumericValue(selectedElement.style.width);
    const selectedHeight = getNumericValue(selectedElement.style.height);
    const selectedRight = selectedLeft + selectedWidth;
    const selectedBottom = selectedTop + selectedHeight;
    const selectedCenterX = selectedLeft + selectedWidth / 2;
    const selectedCenterY = selectedTop + selectedHeight / 2;

    const threshold = 3;
    const vertical: number[] = [];
    const horizontal: number[] = [];

    Object.values(elements).forEach((el) => {
      if (el.id === selectedIds[0]) return;

      const left = getNumericValue(el.style.left);
      const top = getNumericValue(el.style.top);
      const width = getNumericValue(el.style.width);
      const height = getNumericValue(el.style.height);
      const right = left + width;
      const bottom = top + height;
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      // Vertical alignment (left, center, right)
      if (Math.abs(selectedLeft - left) < threshold) vertical.push(left);
      if (Math.abs(selectedLeft - right) < threshold) vertical.push(right);
      if (Math.abs(selectedRight - left) < threshold) vertical.push(left);
      if (Math.abs(selectedRight - right) < threshold) vertical.push(right);
      if (Math.abs(selectedCenterX - centerX) < threshold) vertical.push(centerX);

      // Horizontal alignment (top, center, bottom)
      if (Math.abs(selectedTop - top) < threshold) horizontal.push(top);
      if (Math.abs(selectedTop - bottom) < threshold) horizontal.push(bottom);
      if (Math.abs(selectedBottom - top) < threshold) horizontal.push(top);
      if (Math.abs(selectedBottom - bottom) < threshold) horizontal.push(bottom);
      if (Math.abs(selectedCenterY - centerY) < threshold) horizontal.push(centerY);
    });

    return {
      vertical: [...new Set(vertical)],
      horizontal: [...new Set(horizontal)],
    };
  }, [elements, selectedIds, showSmartGuides]);

  if (guides.vertical.length === 0 && guides.horizontal.length === 0) {
    return null;
  }

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {guides.vertical.map((x, i) => (
        <line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2="100%"
          stroke="#f43f5e"
          strokeWidth="1"
          strokeDasharray="4 2"
        />
      ))}
      {guides.horizontal.map((y, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2="100%"
          y2={y}
          stroke="#f43f5e"
          strokeWidth="1"
          strokeDasharray="4 2"
        />
      ))}
    </svg>
  );
});
