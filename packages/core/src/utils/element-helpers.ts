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

/**
 * Element ağacını yeni ID'lerle yeniden oluştur
 * Bu işlem, şablonları import ederken ID çakışmalarını önler
 */
export const regenerateElementTree = (
  elements: Record<string, Element>,
  rootIds: string[]
): { elements: Record<string, Element>; rootIds: string[] } => {
  const newElements: Record<string, Element> = {};
  const newRootIds: string[] = [];
  const idMap: Record<string, string> = {};

  // 1. Yeni ID'leri oluştur ve map'le
  // Sadece ilgili root'ların altındaki elementleri işle
  const processForIds = (id: string) => {
    const oldEl = elements[id];
    if (!oldEl) return;

    // Basit bir ID üreticisi (nanoid dependency'si eklememek için)
    // Core paketinde nanoid varsa o da kullanılabilir ama bu yeterli
    const newId = `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    idMap[id] = newId;

    if (oldEl.children) {
      oldEl.children.forEach(childId => processForIds(childId));
    }
  };

  rootIds.forEach(id => processForIds(id));

  // 2. Elementleri yeni ID'lerle oluştur ve parent/child ilişkilerini güncelle
  const processForConstruction = (oldId: string, newParentId: string | null) => {
    const oldEl = elements[oldId];
    if (!oldEl) return;

    const newId = idMap[oldId];
    if (!newId) return; // Should not happen if step 1 worked

    const newChildrenIds = (oldEl.children || [])
      .map(childId => idMap[childId])
      .filter(Boolean); // Filter out undefined if mapping failed somehow

    const newEl: Element = {
      ...oldEl,
      id: newId,
      parentId: newParentId,
      children: newChildrenIds,
      style: { ...oldEl.style },
      props: oldEl.props ? { ...oldEl.props } : {},
    } as unknown as Element;

    newElements[newId] = newEl;

    if (oldEl.children) {
      oldEl.children.forEach(childId => processForConstruction(childId, newId));
    }
  };

  rootIds.forEach(oldRootId => {
    const newRootId = idMap[oldRootId];
    if (newRootId) {
      newRootIds.push(newRootId);
      processForConstruction(oldRootId, null);
    }
  });

  return { elements: newElements, rootIds: newRootIds };
};
