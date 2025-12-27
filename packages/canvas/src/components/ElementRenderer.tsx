/**
 * Element Renderer - Factory component for rendering elements by type
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, Element } from '@builder/core';
import {
  ContainerRenderer,
  TextRenderer,
  ButtonRenderer,
  ImageRenderer,
  InputRenderer,
  IconRenderer,
  SliderRenderer,
} from './renderers';

interface ElementRendererProps {
  elementId: string;
}

export const ElementRenderer = memo(function ElementRenderer({
  elementId
}: ElementRendererProps) {
  const element = useCanvasStore((state) => state.elements[elementId]);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const hoveredId = useCanvasStore((state) => state.hoveredElementId);
  const setHoveredElement = useCanvasStore((state) => state.setHoveredElement);

  const isSelected = selectedIds.includes(elementId);
  const isHovered = hoveredId === elementId && !isSelected;

  // Mouse down is now handled by CanvasRenderer for drag support
  // We just need to pass the data-element-id attribute
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't stop propagation - let CanvasRenderer handle selection and drag
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!element?.locked) {
      setHoveredElement(elementId);
    }
  }, [elementId, element?.locked, setHoveredElement]);

  const handleMouseLeave = useCallback(() => {
    setHoveredElement(null);
  }, [setHoveredElement]);

  if (!element || element.hidden) return null;

  const commonProps = {
    isSelected,
    isHovered,
    onMouseDown: handleMouseDown,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };

  // Render children for container elements
  const renderChildren = () => {
    if (element.children.length === 0) return null;
    return element.children.map((childId) => (
      <ElementRenderer key={childId} elementId={childId} />
    ));
  };

  switch (element.type) {
    case 'container':
      return (
        <ContainerRenderer element={element} {...commonProps}>
          {renderChildren()}
        </ContainerRenderer>
      );
    case 'text':
      return <TextRenderer element={element} {...commonProps} />;
    case 'button':
      return <ButtonRenderer element={element} {...commonProps} />;
    case 'image':
      return <ImageRenderer element={element} {...commonProps} />;
    case 'input':
      return <InputRenderer element={element} {...commonProps} />;
    case 'icon':
      return <IconRenderer element={element} {...commonProps} />;
    case 'slider':
      return <SliderRenderer element={element} {...commonProps} />;
    default:
      console.warn(`Unknown element type: ${(element as Element).type}`);
      return null;
  }
});
