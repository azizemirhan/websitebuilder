/**
 * Container Renderer - Box/div element renderer with full CSS support
 */

import React, { memo } from "react";
import type { ContainerElement } from "@builder/core";

interface ContainerRendererProps {
  element: ContainerElement;
  children?: React.ReactNode;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const ContainerRenderer = memo(function ContainerRenderer({
  element,
  children,
  isSelected,
  isHovered,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}: ContainerRendererProps) {
  const { style } = element;

  // Default to relative for imported elements (flow layout)
  // Use absolute for manually created elements (canvas positioning)
  const position = style.position || "relative";
  
  const containerStyle: React.CSSProperties = {
    // Layout Mode
    position,
    boxSizing: "border-box",
    
    // Dimensions - support both number (px) and string (%, auto, calc)
    width: style.width,
    height: style.height,
    minWidth: style.minWidth,
    maxWidth: style.maxWidth,
    minHeight: style.minHeight,
    maxHeight: style.maxHeight,
    
    // Position - only apply for absolute/fixed positioned elements
    ...(position === 'absolute' || position === 'fixed' ? {
      top: style.top,
      left: style.left,
      right: style.right,
      bottom: style.bottom,
    } : {}),
    
    // Display & Flex Container
    display: style.display,
    flexDirection: style.flexDirection,
    flexWrap: style.flexWrap,
    justifyContent: style.justifyContent,
    alignItems: style.alignItems,
    alignContent: style.alignContent,
    gap: style.gap,
    rowGap: style.rowGap,
    columnGap: style.columnGap,
    
    // Flex Item
    flexGrow: style.flexGrow,
    flexShrink: style.flexShrink,
    flexBasis: style.flexBasis,
    alignSelf: style.alignSelf,
    order: style.order,
    
    // Grid Container
    gridTemplateColumns: style.gridTemplateColumns,
    gridTemplateRows: style.gridTemplateRows,
    gridAutoColumns: style.gridAutoColumns,
    gridAutoRows: style.gridAutoRows,
    gridAutoFlow: style.gridAutoFlow,
    
    // Grid Item
    gridColumn: style.gridColumn,
    gridRow: style.gridRow,
    
    // Padding
    padding: style.padding,
    paddingTop: style.paddingTop,
    paddingRight: style.paddingRight,
    paddingBottom: style.paddingBottom,
    paddingLeft: style.paddingLeft,
    
    // Margin (essential for document flow)
    margin: style.margin,
    marginTop: style.marginTop,
    marginRight: style.marginRight,
    marginBottom: style.marginBottom,
    marginLeft: style.marginLeft,
    
    // Background
    backgroundColor: style.backgroundColor,
    background: style.background,
    backgroundImage: style.backgroundImage,
    backgroundSize: style.backgroundSize,
    backgroundPosition: style.backgroundPosition,
    backgroundRepeat: style.backgroundRepeat,
    
    // Border
    border: style.border,
    borderWidth: style.borderWidth,
    borderTopWidth: style.borderTopWidth,
    borderRightWidth: style.borderRightWidth,
    borderBottomWidth: style.borderBottomWidth,
    borderLeftWidth: style.borderLeftWidth,
    borderColor: style.borderColor,
    borderTopColor: style.borderTopColor,
    borderRightColor: style.borderRightColor,
    borderBottomColor: style.borderBottomColor,
    borderLeftColor: style.borderLeftColor,
    borderStyle: style.borderStyle,
    borderRadius: style.borderRadius,
    borderTopLeftRadius: style.borderTopLeftRadius,
    borderTopRightRadius: style.borderTopRightRadius,
    borderBottomRightRadius: style.borderBottomRightRadius,
    borderBottomLeftRadius: style.borderBottomLeftRadius,
    
    // Effects
    boxShadow: style.boxShadow,
    filter: style.filter,
    backdropFilter: style.backdropFilter,
    opacity: style.opacity,
    mixBlendMode: style.mixBlendMode,
    
    // Transform
    transform: style.transform,
    transformOrigin: style.transformOrigin,
    transition: style.transition,
    
    // Other
    overflow: style.overflow,
    zIndex: style.zIndex,
    cursor: element.locked ? "not-allowed" : style.cursor || "default",
    visibility: element.hidden ? "hidden" : "visible",
    color: style.color,
    
    // Selection indicator
    outline: isSelected
      ? "2px solid #2563eb"
      : isHovered
      ? "1px solid #60a5fa"
      : "none",
    outlineOffset: "-1px",
  };

  return (
    <div
      data-element-id={element.id}
      style={containerStyle}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
});
