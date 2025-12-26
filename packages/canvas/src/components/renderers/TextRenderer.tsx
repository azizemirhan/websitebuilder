/**
 * Text Renderer - Text/heading element renderer
 */

import React, { memo } from 'react';
import type { TextElement } from '@builder/core';

interface TextRendererProps {
  element: TextElement;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const TextRenderer = memo(function TextRenderer({
  element,
  isSelected,
  isHovered,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}: TextRendererProps) {
  const { style, props } = element;

  const textStyle: React.CSSProperties = {
    position: style.position || 'absolute',
    top: style.top,
    left: style.left,
    width: style.width,
    height: style.height,
    color: style.color || '#000000',
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    textAlign: style.textAlign,
    backgroundColor: style.backgroundColor,
    padding: style.padding,
    paddingTop: style.paddingTop,
    paddingRight: style.paddingRight,
    paddingBottom: style.paddingBottom,
    paddingLeft: style.paddingLeft,
    margin: 0,
    opacity: style.opacity,
    cursor: element.locked ? 'not-allowed' : 'default',
    visibility: element.hidden ? 'hidden' : 'visible',
    boxSizing: 'border-box',
    outline: isSelected 
      ? '2px solid #2563eb' 
      : isHovered 
        ? '1px solid #60a5fa' 
        : 'none',
    outlineOffset: '-1px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  const Tag = props.tag || 'p';

  return (
    <Tag
      data-element-id={element.id}
      style={textStyle}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {props.content}
    </Tag>
  );
});
