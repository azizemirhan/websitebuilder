/**
 * Image Renderer - Image element renderer
 */

import React, { memo } from 'react';
import type { ImageElement } from '@builder/core';
import { useResponsiveStore, getResponsiveStyles } from '@builder/core';

interface ImageRendererProps {
  element: ImageElement;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const ImageRenderer = memo(function ImageRenderer({
  element,
  isSelected,
  isHovered,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}: ImageRendererProps) {
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

  const containerStyle: React.CSSProperties = {
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
    minHeight: style.minHeight,
    maxHeight: style.maxHeight,
    // Spacing
    margin: style.margin,
    marginTop: style.marginTop,
    marginRight: style.marginRight,
    marginBottom: style.marginBottom,
    marginLeft: style.marginLeft,
    padding: style.padding,
    // Visual
    backgroundColor: style.backgroundColor,
    borderRadius: style.borderRadius,
    border: style.border,
    opacity: style.opacity,
    zIndex: style.zIndex,
    overflow: style.overflow || 'hidden',
    cursor: element.locked ? 'not-allowed' : style.cursor || 'default',
    visibility: element.hidden ? 'hidden' : 'visible',
    boxSizing: 'border-box',
    // Layout
    display: style.display,
    alignItems: style.alignItems,
    justifyContent: style.justifyContent,
    objectFit: style.objectFit,
    // Selection indicator removed - handled by ElementControls overlay
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: props.objectFit || 'cover',
  };

  return (
    <div
      data-element-id={element.id}
      style={containerStyle}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {props.src ? (
        <img src={props.src} alt={props.alt || ''} style={imageStyle} />
      ) : (
        <div style={{
          color: '#9ca3af',
          fontSize: 14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
          <span>No image</span>
        </div>
      )}
    </div>
  );
});
