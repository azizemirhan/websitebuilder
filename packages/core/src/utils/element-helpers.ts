/**
 * Element Helper Functions
 */

import type { Element, StyleProperties } from '../types';

/**
 * Style properties'i CSS string'e çevir
 */
export const styleToCss = (style: StyleProperties): React.CSSProperties => {
  const cssProps: Record<string, string | number> = {};

  Object.entries(style).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // Number values'a px ekle (bazı propertyler hariç)
    const numericPropertiesWithoutPx = ['opacity', 'zIndex', 'fontWeight', 'lineHeight'];
    
    if (typeof value === 'number' && !numericPropertiesWithoutPx.includes(key)) {
      cssProps[key] = `${value}px`;
    } else {
      cssProps[key] = value as string | number;
    }
  });

  return cssProps as React.CSSProperties;
};

/**
 * Element tree'yi depth-first traverse et
 */
export const traverseElements = (
  elements: Record<string, Element>,
  rootIds: string[],
  callback: (element: Element, depth: number) => void
): void => {
  const traverse = (id: string, depth: number) => {
    const element = elements[id];
    if (!element) return;

    callback(element, depth);
    element.children.forEach((childId) => traverse(childId, depth + 1));
  };

  rootIds.forEach((id) => traverse(id, 0));
};

/**
 * Bir element'in tüm ancestor'larını getir
 */
export const getAncestors = (
  elements: Record<string, Element>,
  elementId: string
): Element[] => {
  const ancestors: Element[] = [];
  let currentId: string | null = elementId;

  while (currentId) {
    const el: Element | undefined = elements[currentId];
    if (!el) break;
    
    if (el.parentId) {
      const parent = elements[el.parentId];
      if (parent) {
        ancestors.push(parent);
      }
    }
    currentId = el.parentId;
  }

  return ancestors;
};

/**
 * Bir element'in tüm descendant'larını getir
 */
export const getDescendants = (
  elements: Record<string, Element>,
  elementId: string
): Element[] => {
  const descendants: Element[] = [];
  
  const collectDescendants = (id: string) => {
    const el = elements[id];
    if (!el) return;

    el.children.forEach((childId) => {
      const child = elements[childId];
      if (child) {
        descendants.push(child);
        collectDescendants(childId);
      }
    });
  };

  collectDescendants(elementId);
  return descendants;
};

/**
 * Element'in sibling'larını getir
 */
export const getSiblings = (
  elements: Record<string, Element>,
  rootElementIds: string[],
  elementId: string
): Element[] => {
  const el = elements[elementId];
  if (!el) return [];

  const siblingIds = el.parentId
    ? elements[el.parentId]?.children || []
    : rootElementIds;

  return siblingIds
    .filter((id) => id !== elementId)
    .map((id) => elements[id])
    .filter(Boolean);
};

/**
 * Deep clone element (ve children)
 */
export const deepCloneElement = (
  element: Element,
  generateNewId: () => string
): Element => {
  // Clone with type assertion to avoid the complex union type issues
  const cloned = {
    ...element,
    id: generateNewId(),
    children: [], // Children ayrı clone edilecek
    style: { ...element.style },
    props: element.props ? { ...element.props } : undefined,
  };
  
  return cloned as Element;
};
