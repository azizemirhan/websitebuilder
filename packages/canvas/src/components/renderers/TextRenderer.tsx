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
    // Default to relative for imported elements (flow layout)
    position: style.position || 'relative',
    top: style.top,
    left: style.left,
    width: style.width,
    height: style.height,
    minWidth: style.minWidth,
    maxWidth: style.maxWidth,
    color: style.color || '#000000',
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textAlign: style.textAlign,
    textDecoration: style.textDecoration,
    textTransform: style.textTransform,
    backgroundColor: style.backgroundColor,
    background: style.background,
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
    display: style.display,
    opacity: style.opacity,
    cursor: element.locked ? 'not-allowed' : style.cursor || 'default',
    visibility: element.hidden ? 'hidden' : 'visible',
    boxSizing: 'border-box',
    outline: isSelected
      ? '2px solid #2563eb'
      : isHovered
        ? '1px solid #60a5fa'
        : 'none',
    outlineOffset: '-1px',
    whiteSpace: style.whiteSpace || 'pre-wrap',
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
