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
    minWidth: style.minWidth,
    maxWidth: style.maxWidth,
    minHeight: style.minHeight,
    maxHeight: style.maxHeight,
    backgroundColor: style.backgroundColor,
    background: style.background,
    backgroundImage: style.backgroundImage,
    backgroundSize: style.backgroundSize,
    backgroundPosition: style.backgroundPosition,
    backgroundRepeat: style.backgroundRepeat,
    color: style.color,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight || 500,
    borderRadius: style.borderRadius,
    border: style.border || 'none',
    borderWidth: style.borderWidth,
    borderColor: style.borderColor,
    borderStyle: style.borderStyle,
    padding: style.padding,
    paddingTop: style.paddingTop,
    paddingRight: style.paddingRight,
    paddingBottom: style.paddingBottom,
    paddingLeft: style.paddingLeft,
    margin: style.margin,
    marginTop: style.marginTop,
    marginRight: style.marginRight,
    marginBottom: style.marginBottom,
    marginLeft: style.marginLeft,
    opacity: style.opacity,
    cursor: element.locked ? 'not-allowed' : style.cursor || 'pointer',
    visibility: element.hidden ? 'hidden' : 'visible',
    boxSizing: 'border-box',
    display: style.display || 'flex',
    flexDirection: style.flexDirection,
    justifyContent: style.justifyContent || 'center',
    alignItems: style.alignItems || 'center',
    gap: style.gap,
    transform: style.transform,
    transition: style.transition,
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
