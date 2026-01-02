/**
 * Text Renderer - Text/heading element renderer
 */

import React, { memo } from 'react';
import type { TextElement } from '@builder/core';
import { useResponsiveStore, getResponsiveStyles } from '@builder/core';

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
  const { props } = element;
  
  // Get active breakpoint for responsive styling
  const activeBreakpoint = useResponsiveStore((state) => state.activeBreakpoint);
  
  // Compute responsive styles based on active breakpoint
  const style = getResponsiveStyles(
    element.style,
    element.responsiveStyles,
    activeBreakpoint
  );

  const position = style.position || 'relative';

  const textStyle: React.CSSProperties = {
    // Position
    position,
    // Only apply positioning for absolute/fixed
    ...(position === 'absolute' || position === 'fixed' ? {
      top: style.top,
      left: style.left,
      right: style.right,
      bottom: style.bottom,
    } : {}),
    // Dimensions
    width: style.width,
    height: style.height,
    minWidth: style.minWidth,
    maxWidth: style.maxWidth,
    // Typography
    color: style.color || '#000000',
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textAlign: style.textAlign,
    textDecoration: style.textDecoration,
    textTransform: style.textTransform,
    // Background
    backgroundColor: style.backgroundColor,
    background: style.background,
    // Spacing
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
    // Layout
    display: style.display,
    flexDirection: style.flexDirection,
    justifyContent: style.justifyContent,
    alignItems: style.alignItems,
    gap: style.gap,
    // Effects
    opacity: style.opacity,
    zIndex: style.zIndex,
    // Other
    cursor: element.locked ? 'not-allowed' : style.cursor || 'default',
    visibility: element.hidden ? 'hidden' : 'visible',
    boxSizing: style.boxSizing || 'border-box',
    // Selection indicator removed - handled by ElementControls overlay
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
      dangerouslySetInnerHTML={{ __html: props.content }}
    />
  );
});
