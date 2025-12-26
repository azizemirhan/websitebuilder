/**
 * Container Renderer - Box/div element renderer
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

  const containerStyle: React.CSSProperties = {
    position: style.position || "absolute",
    top: style.top,
    left: style.left,
    width: style.width,
    height: style.height,
    backgroundColor: style.backgroundColor,
    borderRadius: style.borderRadius,
    border: style.border,
    borderWidth: style.borderWidth,
    borderColor: style.borderColor,
    borderStyle: style.borderStyle,
    padding: style.padding,
    paddingTop: style.paddingTop,
    paddingRight: style.paddingRight,
    paddingBottom: style.paddingBottom,
    paddingLeft: style.paddingLeft,
    opacity: style.opacity,
    overflow: style.overflow,
    zIndex: style.zIndex,
    display: style.display,
    flexDirection: style.flexDirection,
    justifyContent: style.justifyContent,
    alignItems: style.alignItems,
    gap: style.gap,
    cursor: element.locked ? "not-allowed" : "default",
    visibility: element.hidden ? "hidden" : "visible",
    boxSizing: "border-box",
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
