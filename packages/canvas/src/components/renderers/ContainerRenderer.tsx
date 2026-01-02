/**
 * Container Renderer - Box/div element renderer with full CSS support
 */

import React, { memo, useCallback } from "react";
import type { ContainerElement } from "@builder/core";
import { useResponsiveStore, getResponsiveStyles } from "@builder/core";
import { useBehavior } from "../../hooks/useBehavior";

interface ContainerRendererProps {
  element: ContainerElement;
  children?: React.ReactNode;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isHighlighted?: boolean; // Drop target highlight
  isDragging?: boolean; // Currently being dragged
}

export const ContainerRenderer = memo(function ContainerRenderer({
  element,
  children,
  isSelected,
  isHovered,
  onMouseDown,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  isHighlighted = false,
  isDragging = false,
}: ContainerRendererProps) {
  // Get active breakpoint for responsive styling
  const activeBreakpoint = useResponsiveStore((state) => state.activeBreakpoint);
  
  // Compute responsive styles based on active breakpoint
  // Compute responsive styles based on active breakpoint
  const baseStyle = getResponsiveStyles(
    element.style,
    element.responsiveStyles,
    activeBreakpoint
  );

  // Force specific styles for Grid Cells (Children of Grid)
  const isGridCell = element.props?.isGridCell;
  const style = {
    ...baseStyle,
    ...(isGridCell ? {
      width: '100%',
      height: '100%',
      minWidth: 0, // Critical for grid overflow
      position: 'relative',
      // Ensure grid placement is preserved even if stripped elsewhere
      gridColumn: element.style.gridColumn || baseStyle.gridColumn,
      gridRow: element.style.gridRow || baseStyle.gridRow,
    } : {})
  };

  // Get behavior handlers and visibility
  const { handlers, isVisible, behaviorClasses } = useBehavior(element);

  // Helper to conditionally include style properties (only if defined)
  const pick = <T extends Record<string, any>>(obj: T): Partial<T> => {
    const result: Partial<T> = {};
    for (const key in obj) {
      if (obj[key] !== undefined && obj[key] !== null) {
        result[key] = obj[key];
      }
    }
    return result;
  };

  // Default to relative for imported elements (flow layout)
  const position = style.position || "relative";
  const isAbsoluteOrFixed = position === 'absolute' || position === 'fixed';
  const isGridContainer = element.props?.containerType === 'grid';

  // Fallback for Grid Rows - Avoid 'auto' collapsing
  const getGridTemplateRows = () => {
    const propsRows = element.props?.gridTemplateRows;
    const styleRows = style.gridTemplateRows;
    const finalRows = propsRows || styleRows;
    
    // Safety: If grid and rows is 'auto' (empty), default to repeat(3, 1fr)
    if (isGridContainer && (!finalRows || finalRows === 'auto')) {
      return 'repeat(3, 1fr)';
    }
    return finalRows;
  };

  const containerStyle: React.CSSProperties = {
    // Layout Mode
    position,
    boxSizing: "border-box",

    // Spread only defined properties
    ...pick({
      // Dimensions
      width: style.width,
      height: style.height,
      minWidth: style.minWidth,
      maxWidth: style.maxWidth,
      minHeight: style.minHeight,
      maxHeight: style.maxHeight,

      // Position (only for absolute/fixed)
      ...(isAbsoluteOrFixed ? {
        top: style.top,
        left: style.left,
        right: style.right,
        bottom: style.bottom,
      } : {}),

      // Display & Flex Container - PROPS OVERRIDE
      display: isGridContainer ? 'grid' : (style.display || 'flex'),
      flexDirection: element.props?.direction || style.flexDirection,
      flexWrap: element.props?.flexWrap || style.flexWrap,
      justifyContent: element.props?.justifyContent || style.justifyContent,
      alignItems: element.props?.alignItems || style.alignItems,
      alignContent: style.alignContent,
      gap: isGridContainer 
        ? (element.props?.gridGap || 0) 
        : (element.props?.gap || style.gap),
      rowGap: style.rowGap,
      columnGap: style.columnGap,

      // Flex Item
      flexGrow: style.flexGrow,
      flexShrink: style.flexShrink,
      flexBasis: style.flexBasis,
      alignSelf: style.alignSelf,
      order: style.order,

      // Grid Container - PROPS OVERRIDE
      gridTemplateColumns: element.props?.gridTemplateColumns || style.gridTemplateColumns,
      gridTemplateRows: getGridTemplateRows(),
      gridAutoColumns: style.gridAutoColumns,
      gridAutoRows: style.gridAutoRows,
      gridAutoFlow: style.gridAutoFlow,

      // Grid Item
      gridColumn: style.gridColumn,
      gridRow: style.gridRow,
      
      // Force grid area if column/row set
      ...(style.gridColumn && style.gridRow ? {
        gridArea: `${style.gridRow} / ${style.gridColumn} / auto / auto`
      } : {}),

      // Padding
      padding: style.padding,
      paddingTop: style.paddingTop,
      paddingRight: style.paddingRight,
      paddingBottom: style.paddingBottom,
      paddingLeft: style.paddingLeft,

      // Margin
      margin: style.margin,
      marginTop: style.marginTop,
      marginRight: style.marginRight,
      marginBottom: style.marginBottom,
      marginLeft: style.marginLeft,

      // Background
      background: style.background,
      backgroundColor: style.backgroundColor,
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
      borderTop: style.borderTop,
      borderRight: style.borderRight,
      borderBottom: style.borderBottom,
      borderLeft: style.borderLeft,
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
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      zIndex: style.zIndex,
      color: style.color,
    }),

    // WIDTH MODE OVERRIDE (YENİ)
    ...(element.props?.widthMode === 'full' ? {
      width: '100%',
      maxWidth: 'none',
    } : element.props?.widthMode === 'boxed' ? {
      width: '100%',
      maxWidth: element.props?.maxWidth || 1200,
      marginLeft: 'auto',
      marginRight: 'auto',
    } : {}),

    // Cursor and visibility (always applied)
    cursor: element.locked ? "not-allowed" : (isSelected || isHovered ? "grab" : style.cursor || "default"),
    visibility: element.hidden ? "hidden" : "visible",

    // Drop target highlight (replaces direct DOM manipulation)
    ...(isHighlighted ? {
      outline: '4px dashed #3b82f6',
      outlineOffset: '4px',
    } : {}),

    // Drag state opacity (replaces direct DOM manipulation)
    ...(isDragging ? {
      opacity: 0.6,
      transform: `${style.transform || ''} scale(0.98)`, // Slight scale down for better feedback
      transition: 'opacity 0.15s ease, transform 0.15s ease',
    } : {}),

    // Smooth transitions for better UX
    ...(!isDragging && !isHighlighted ? {
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    } : {}),

    // Selection indicator removed - now handled by ElementControls overlay
    // This prevents z-index conflicts with control buttons
  };

  // Handle combined mouse down (selection + behavior)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    onMouseDown(e);
    if (handlers.onClick) {
      handlers.onClick(e);
    }
  }, [onMouseDown, handlers.onClick]);

  // Hide element if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-element-id={element.id}
      style={{
        ...containerStyle,
      }}
      className={behaviorClasses.join(' ') || undefined}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      onMouseEnter={(e) => {
        onMouseEnter();
        if (handlers.onMouseEnter) handlers.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        onMouseLeave();
        if (handlers.onMouseLeave) handlers.onMouseLeave(e);
      }}
    >
      {/* Children - Doğrudan render */}
      {children}
    </div>
  );
});

