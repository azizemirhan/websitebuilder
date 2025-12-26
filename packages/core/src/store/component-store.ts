/**
 * Component Store - Master components and instances management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import type { Element, StyleProperties } from '../types';

export interface ComponentVariant {
  id: string;
  name: string;
  description?: string;
  styleOverrides: Partial<StyleProperties>;
  propsOverrides: Record<string, unknown>;
}

export interface MasterComponent {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  
  // The element tree for this component
  rootElementId: string;
  elements: Record<string, Element>;
  
  // Variants
  variants: ComponentVariant[];
  defaultVariantId?: string;
  
  // Props schema
  props: ComponentProp[];
}

export interface ComponentProp {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select';
  defaultValue: unknown;
  options?: string[]; // For select type
}

export interface ComponentInstance {
  elementId: string;
  componentId: string;
  variantId?: string;
  
  // Overridden properties (element id -> overrides)
  overrides: Record<string, {
    style?: Partial<StyleProperties>;
    props?: Record<string, unknown>;
  }>;
  
  // Component prop values
  propValues: Record<string, unknown>;
}

interface ComponentStore {
  // Master components library
  components: Record<string, MasterComponent>;
  
  // Instances in the canvas
  instances: Record<string, ComponentInstance>;
  
  // Component CRUD
  createComponent: (name: string, elements: Record<string, Element>, rootId: string, category?: string) => string;
  updateComponent: (id: string, updates: Partial<MasterComponent>) => void;
  deleteComponent: (id: string) => void;
  
  // Instance operations
  createInstance: (componentId: string, position: { x: number; y: number }) => { elementId: string; elements: Record<string, Element> };
  linkInstance: (elementId: string, componentId: string) => void;
  unlinkInstance: (elementId: string) => void;
  
  // Overrides
  setOverride: (instanceId: string, elementId: string, overrides: { style?: Partial<StyleProperties>; props?: Record<string, unknown> }) => void;
  resetOverride: (instanceId: string, elementId: string, property?: string) => void;
  resetAllOverrides: (instanceId: string) => void;
  
  // Variants
  addVariant: (componentId: string, variant: Omit<ComponentVariant, 'id'>) => string;
  updateVariant: (componentId: string, variantId: string, updates: Partial<ComponentVariant>) => void;
  deleteVariant: (componentId: string, variantId: string) => void;
  setInstanceVariant: (instanceId: string, variantId: string) => void;
  
  // Props
  addProp: (componentId: string, prop: Omit<ComponentProp, 'id'>) => string;
  updateProp: (componentId: string, propId: string, updates: Partial<ComponentProp>) => void;
  deleteProp: (componentId: string, propId: string) => void;
  setInstancePropValue: (instanceId: string, propId: string, value: unknown) => void;
  
  // Queries
  getComponent: (id: string) => MasterComponent | undefined;
  getInstance: (elementId: string) => ComponentInstance | undefined;
  getComponentsByCategory: (category: string) => MasterComponent[];
  searchComponents: (query: string) => MasterComponent[];
}

const generateId = () => `comp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Deep clone elements for instance
const cloneElements = (
  elements: Record<string, Element>,
  rootId: string,
  position: { x: number; y: number }
): { elements: Record<string, Element>; rootId: string } => {
  const idMap: Record<string, string> = {};
  const newElements: Record<string, Element> = {};
  
  // First pass: create ID mapping
  Object.keys(elements).forEach((id) => {
    idMap[id] = `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  });
  
  // Second pass: clone with new IDs
  Object.entries(elements).forEach(([id, element]) => {
    const newId = idMap[id];
    const isRoot = id === rootId;
    
    newElements[newId] = {
      ...element,
      id: newId,
      style: {
        ...element.style,
        ...(isRoot ? { left: position.x, top: position.y } : {}),
      },
      children: element.children.map((childId) => idMap[childId] || childId),
      parentId: element.parentId ? (idMap[element.parentId] || null) : null,
    };
  });
  
  return { elements: newElements, rootId: idMap[rootId] };
};

export const useComponentStore = create<ComponentStore>()(
  persist(
    (set, get) => ({
      components: {},
      instances: {},

      createComponent: (name, elements, rootId, category = 'Custom') => {
        const id = generateId();
        const now = Date.now();
        
        set(produce((state: ComponentStore) => {
          state.components[id] = {
            id,
            name,
            category,
            tags: [],
            createdAt: now,
            updatedAt: now,
            rootElementId: rootId,
            elements: { ...elements },
            variants: [],
            props: [],
          };
        }));
        
        return id;
      },

      updateComponent: (id, updates) => {
        set(produce((state: ComponentStore) => {
          if (state.components[id]) {
            Object.assign(state.components[id], updates, { updatedAt: Date.now() });
          }
        }));
      },

      deleteComponent: (id) => {
        set(produce((state: ComponentStore) => {
          delete state.components[id];
          // Remove all instances of this component
          Object.keys(state.instances).forEach((instanceId) => {
            if (state.instances[instanceId].componentId === id) {
              delete state.instances[instanceId];
            }
          });
        }));
      },

      createInstance: (componentId, position) => {
        const component = get().components[componentId];
        if (!component) return { elementId: '', elements: {} };
        
        const { elements, rootId } = cloneElements(component.elements, component.rootElementId, position);
        
        set(produce((state: ComponentStore) => {
          state.instances[rootId] = {
            elementId: rootId,
            componentId,
            overrides: {},
            propValues: {},
          };
        }));
        
        return { elementId: rootId, elements };
      },

      linkInstance: (elementId, componentId) => {
        set(produce((state: ComponentStore) => {
          state.instances[elementId] = {
            elementId,
            componentId,
            overrides: {},
            propValues: {},
          };
        }));
      },

      unlinkInstance: (elementId) => {
        set(produce((state: ComponentStore) => {
          delete state.instances[elementId];
        }));
      },

      setOverride: (instanceId, elementId, overrides) => {
        set(produce((state: ComponentStore) => {
          if (state.instances[instanceId]) {
            state.instances[instanceId].overrides[elementId] = {
              ...state.instances[instanceId].overrides[elementId],
              ...overrides,
            };
          }
        }));
      },

      resetOverride: (instanceId, elementId) => {
        set(produce((state: ComponentStore) => {
          if (state.instances[instanceId]) {
            delete state.instances[instanceId].overrides[elementId];
          }
        }));
      },

      resetAllOverrides: (instanceId) => {
        set(produce((state: ComponentStore) => {
          if (state.instances[instanceId]) {
            state.instances[instanceId].overrides = {};
          }
        }));
      },

      addVariant: (componentId, variant) => {
        const id = `var-${Date.now()}`;
        set(produce((state: ComponentStore) => {
          if (state.components[componentId]) {
            state.components[componentId].variants.push({ ...variant, id });
          }
        }));
        return id;
      },

      updateVariant: (componentId, variantId, updates) => {
        set(produce((state: ComponentStore) => {
          if (state.components[componentId]) {
            const variant = state.components[componentId].variants.find((v) => v.id === variantId);
            if (variant) Object.assign(variant, updates);
          }
        }));
      },

      deleteVariant: (componentId, variantId) => {
        set(produce((state: ComponentStore) => {
          if (state.components[componentId]) {
            state.components[componentId].variants = state.components[componentId].variants.filter(
              (v) => v.id !== variantId
            );
          }
        }));
      },

      setInstanceVariant: (instanceId, variantId) => {
        set(produce((state: ComponentStore) => {
          if (state.instances[instanceId]) {
            state.instances[instanceId].variantId = variantId;
          }
        }));
      },

      addProp: (componentId, prop) => {
        const id = `prop-${Date.now()}`;
        set(produce((state: ComponentStore) => {
          if (state.components[componentId]) {
            state.components[componentId].props.push({ ...prop, id });
          }
        }));
        return id;
      },

      updateProp: (componentId, propId, updates) => {
        set(produce((state: ComponentStore) => {
          if (state.components[componentId]) {
            const prop = state.components[componentId].props.find((p) => p.id === propId);
            if (prop) Object.assign(prop, updates);
          }
        }));
      },

      deleteProp: (componentId, propId) => {
        set(produce((state: ComponentStore) => {
          if (state.components[componentId]) {
            state.components[componentId].props = state.components[componentId].props.filter(
              (p) => p.id !== propId
            );
          }
        }));
      },

      setInstancePropValue: (instanceId, propId, value) => {
        set(produce((state: ComponentStore) => {
          if (state.instances[instanceId]) {
            state.instances[instanceId].propValues[propId] = value;
          }
        }));
      },

      getComponent: (id) => get().components[id],
      
      getInstance: (elementId) => get().instances[elementId],
      
      getComponentsByCategory: (category) => 
        Object.values(get().components).filter((c) => c.category === category),
      
      searchComponents: (query) => {
        const q = query.toLowerCase();
        return Object.values(get().components).filter(
          (c) => c.name.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))
        );
      },
    }),
    {
      name: 'component-library',
    }
  )
);
