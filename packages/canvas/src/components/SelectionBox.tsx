/**
 * Selection Box - Visual selection overlay for selected elements
 */

import React, { memo } from 'react';
import type { Element } from '@builder/core';

interface SelectionBoxProps {
  element: Element;
}

export const SelectionBox = memo(function SelectionBox({ element }: SelectionBoxProps) {
  const { style } = element;

  const boxStyle: React.CSSProperties = {
    position: 'absolute',
    top: style.top,
    left: style.left,
    width: style.width,
    height: style.height,
    border: '2px solid #2563eb',
    borderRadius: style.borderRadius,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  };

  return <div style={boxStyle} />;
});
