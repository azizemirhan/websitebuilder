/**
 * Input Renderer - Input element renderer
 */

import React, { memo } from 'react';
import type { InputElement } from '@builder/core';

interface InputRendererProps {
  element: InputElement;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const InputRenderer = memo(function InputRenderer({
  element,
  isSelected,
  isHovered,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}: InputRendererProps) {
  const { style, props } = element;

  const containerStyle: React.CSSProperties = {
    position: style.position || 'absolute',
    top: style.top,
    left: style.left,
    width: style.width,
    height: style.height,
    outline: isSelected 
      ? '2px solid #2563eb' 
      : isHovered 
        ? '1px solid #60a5fa' 
        : 'none',
    outlineOffset: '-1px',
    visibility: element.hidden ? 'hidden' : 'visible',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: style.backgroundColor || '#ffffff',
    color: style.color || '#000000',
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    borderRadius: style.borderRadius,
    border: style.border || '1px solid #d1d5db',
    paddingLeft: style.paddingLeft,
    paddingRight: style.paddingRight,
    opacity: style.opacity,
    boxSizing: 'border-box',
    cursor: element.locked ? 'not-allowed' : 'text',
  };

  return (
    <div
      data-element-id={element.id}
      style={containerStyle}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <input
        type={props.inputType || 'text'}
        placeholder={props.placeholder}
        defaultValue={props.value}
        style={inputStyle}
        readOnly
      />
    </div>
  );
});
