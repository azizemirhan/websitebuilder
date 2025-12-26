/**
 * Button Renderer - Button element renderer
 */

import React, { memo } from 'react';
import type { ButtonElement } from '@builder/core';

interface ButtonRendererProps {
  element: ButtonElement;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const ButtonRenderer = memo(function ButtonRenderer({
  element,
  isSelected,
  isHovered,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}: ButtonRendererProps) {
  const { style, props } = element;

  const buttonStyle: React.CSSProperties = {
    position: style.position || 'absolute',
    top: style.top,
    left: style.left,
    width: style.width,
    height: style.height,
    backgroundColor: style.backgroundColor || '#3b82f6',
    color: style.color || '#ffffff',
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight || 500,
    borderRadius: style.borderRadius,
    border: style.border || 'none',
    borderWidth: style.borderWidth,
    borderColor: style.borderColor,
    borderStyle: style.borderStyle,
    padding: style.padding,
    opacity: style.opacity,
    cursor: element.locked ? 'not-allowed' : 'pointer',
    visibility: element.hidden ? 'hidden' : 'visible',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: isSelected 
      ? '2px solid #2563eb' 
      : isHovered 
        ? '1px solid #60a5fa' 
        : 'none',
    outlineOffset: '-1px',
  };

  return (
    <button
      data-element-id={element.id}
      style={buttonStyle}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      type="button"
    >
      {props.text}
    </button>
  );
});
