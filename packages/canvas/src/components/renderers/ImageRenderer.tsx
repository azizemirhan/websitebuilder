/**
 * Image Renderer - Image element renderer
 */

import React, { memo } from 'react';
import type { ImageElement } from '@builder/core';

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
  const { style, props } = element;

  const containerStyle: React.CSSProperties = {
    position: style.position || 'absolute',
    top: style.top,
    left: style.left,
    width: style.width,
    height: style.height,
    backgroundColor: style.backgroundColor || '#e5e7eb',
    borderRadius: style.borderRadius,
    border: style.border,
    opacity: style.opacity,
    overflow: 'hidden',
    cursor: element.locked ? 'not-allowed' : 'default',
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
