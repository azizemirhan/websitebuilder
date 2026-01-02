/**
 * Canvas Store - Ana canvas state management
 * Zustand + Immer kullanarak immutable state updates
 */

import { nanoid } from 'nanoid';
import { produce } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Element, CanvasState, StyleProperties, ElementType } from '../types';

interface CanvasStore extends CanvasState {
  // Element Operations
  addElement: (element: Partial<Element>, parentId?: string | null) => string;
  updateElement: (id: string, updates: Partial<Element>) => void;
  updateElementStyle: (id: string, style: Partial<StyleProperties>) => void;
  updateElementProps: (id: string, props: Record<string, any>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => string | null;

  // Hierarchy Operations
  moveElement: (id: string, newParentId: string | null, index?: number) => void;
  reorderElement: (id: string, newIndex: number) => void;

  // Selection Operations
  selectElement: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  selectMultiple: (ids: string[]) => void;

  // Hover State
  setHoveredElement: (id: string | null) => void;

  // Utility
  getElementById: (id: string) => Element | undefined;
  getSelectedElements: () => Element[];
  clearCanvas: () => void;
  
  // Grid Operations
  generateGridCells: (gridContainerId: string) => void;

  // Import
  importElements: (elements: Record<string, Element>, rootIds: string[]) => void;
}

const createDefaultElement = (
  type: ElementType,
  name?: string,
  style?: Partial<StyleProperties>
): Partial<Element> => {
  const defaults: Record<ElementType, Partial<Element>> = {
    container: {
      type: 'container',
      name: name || 'Container',
      style: {
        position: 'absolute',
        top: 100,
        left: 100,
        width: 300,
        height: 200,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        ...style,
      },
      props: { 
        tag: 'div',
        containerType: 'flex',
        direction: 'column', // Sıralı aşağı doğru
        justifyContent: 'center', // Dikey ortalı
        alignItems: 'center', // Yatay ortalı
        gap: 16,
        flexWrap: 'nowrap',
        widthMode: 'full',
        gridGap: 20, // Grid için default gap
      },
    },
    text: {
      type: 'text',
      name: name || 'Text',
      style: {
        position: 'absolute',
        top: 100,
        left: 100,
        fontSize: 16,
        color: '#000000',
        ...style,
      },
      props: {
        content: 'Text Content',
        tag: 'p',
      },
    },
    button: {
      type: 'button',
      name: name || 'Button',
      style: {
        position: 'absolute',
        top: 100,
        left: 100,
        width: 120,
        height: 40,
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        borderRadius: 6,
        fontSize: 14,
        ...style,
      },
      props: {
        text: 'Button',
      },
    },
    image: {
      type: 'image',
      name: name || 'Image',
      style: {
        position: 'absolute',
        top: 100,
        left: 100,
        width: 200,
        height: 200,
        backgroundColor: '#e5e7eb',
        ...style,
      },
      props: {
        src: '',
        alt: 'Image',
        objectFit: 'cover',
      },
    },
    input: {
      type: 'input',
      name: name || 'Input',
      style: {
        position: 'absolute',
        top: 100,
        left: 100,
        width: 200,
        height: 40,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        border: '1px solid #d1d5db',
        fontSize: 14,
        paddingLeft: 12,
        paddingRight: 12,
        ...style,
      },
      props: {
        placeholder: 'Enter text...',
        inputType: 'text',
      },
    },
    icon: {
      type: 'icon',
      name: name || 'Icon',
      style: {
        position: 'absolute',
        top: 100,
        left: 100,
        width: 24,
        height: 24,
        color: '#000000',
        ...style,
      },
      props: {
        iconName: 'star',
        strokeWidth: 2,
      },
    },
    slider: {
      type: 'slider',
      name: name || 'Slider',
      style: {
        position: 'relative',
        width: '100%',
        height: 600,
        ...style,
      },
      props: {
        slides: [
          {
            id: 'slide-1',
            backgroundColor: '#1a1a2e',
            label: 'Yeni Koleksiyon',
            title: 'Slider',
            titleHighlight: 'Örneği',
            description: 'Bu bir örnek slider içeriğidir.',
            buttons: [{ text: 'Keşfet', variant: 'primary' }],
          },
        ],
        autoPlay: true,
        interval: 6000,
        showDots: true,
        showArrows: true,
      },
    },
    menu: {
      type: 'menu',
      name: name || 'Menü',
      style: {
        position: 'relative',
        width: '100%',
        height: 'auto',
        minHeight: 40,
        padding: '8px 16px',
        display: 'flex',
        ...style,
      },
      props: {
        menuId: null,
        layout: 'horizontal',
        showSubmenuIndicator: true,
        dropdownOpenAs: 'hover',
      },
    },
  };

  return defaults[type] || defaults.container;
};

export const useCanvasStore = create<CanvasStore>()(
  immer((set, get) => ({
    // Initial State
    elements: {},
    rootElementIds: [],
    selectedElementIds: [],
    hoveredElementId: null,

    // Add Element
    addElement: (elementData, parentId = null) => {
      const id = nanoid();
      
      // AUTO-LAYOUT LOGIC FOR ROOT CONTAINERS
      let smartStyle: Partial<StyleProperties> = {};
      
      if (!parentId && elementData.type === 'container') {
        const state = get();
        // Find the lowest element on the canvas
        let maxBottom = 0;
        state.rootElementIds.forEach(rootId => {
          const el = state.elements[rootId];
          const top = parseInt(String(el.style.top || 0));
          const height = parseInt(String(el.style.height || 200));
          if (!isNaN(top) && !isNaN(height)) {
            maxBottom = Math.max(maxBottom, top + height);
          }
        });

        smartStyle = {
          position: 'absolute',
          left: 0,
          top: maxBottom > 0 ? maxBottom : 0, // Stack below the last element
          width: '100%',
          height: 'auto', // Hug content
          minHeight: '50px', // Drop target visibility
          padding: '10px',
          display: 'flex', // Ensure flex context for standard containers
        };
      }

      const defaultElement = createDefaultElement(
        elementData.type || 'container',
        elementData.name,
        { ...elementData.style, ...smartStyle }
      );

      const element: Element = {
        id,
        children: [],
        parentId,
        ...defaultElement,
        ...elementData,
        style: { ...defaultElement.style, ...elementData.style, ...smartStyle } // Ensure smartStyle wins
      } as Element;

      set((state) => {
        state.elements[id] = element;

        if (parentId && state.elements[parentId]) {
          state.elements[parentId].children.push(id);
          
          // Child Layout Logic:
          // If parent is a Container (Grid Cell or Normal Container), enforce relative flow layout
          const parent = state.elements[parentId];
          if (parent.type === 'container') {
             state.elements[id].style = {
               ...state.elements[id].style,
               position: 'relative',
               width: '100%',
               maxWidth: '100%',
               boxSizing: 'border-box',
               left: 'auto',
               top: 'auto',
               marginTop: 0,
               marginBottom: 0
             };
          }

        } else {
          state.rootElementIds.push(id);
        }
      });

      return id;
    },

    // Update Element
    updateElement: (id, updates) => {
      set((state) => {
        if (state.elements[id]) {
          Object.assign(state.elements[id], updates);
        }
      });
    },

    // Update Element Style
    updateElementStyle: (id, styleUpdates) => {
      set((state) => {
        if (state.elements[id]) {
          state.elements[id].style = {
            ...state.elements[id].style,
            ...styleUpdates,
          };
        }
      });
    },

    // Update Element Props
    updateElementProps: (id, propsUpdates) => {
      set((state) => {
        if (state.elements[id]) {
          state.elements[id].props = {
            ...state.elements[id].props,
            ...propsUpdates,
          };
        }
      });
    },

    // Delete Element
    deleteElement: (id) => {
      set((state) => {
        const element = state.elements[id];
        if (!element) return;

        // Remove from parent's children
        if (element.parentId && state.elements[element.parentId]) {
          const parent = state.elements[element.parentId];
          parent.children = parent.children.filter((childId) => childId !== id);
        } else {
          state.rootElementIds = state.rootElementIds.filter((rootId) => rootId !== id);
        }

        // Recursively delete children
        const deleteRecursive = (elementId: string) => {
          const el = state.elements[elementId];
          if (el) {
            el.children.forEach(deleteRecursive);
            delete state.elements[elementId];
          }
        };
        deleteRecursive(id);

        // Clear from selection
        state.selectedElementIds = state.selectedElementIds.filter((selId) => selId !== id);
        if (state.hoveredElementId === id) {
          state.hoveredElementId = null;
        }
      });
    },

    // Duplicate Element
    duplicateElement: (id) => {
      const element = get().elements[id];
      if (!element) return null;

      let newRootId: string | null = null;

      const duplicateRecursive = (el: Element, newParentId: string | null): string => {
        const newId = nanoid();
        const newElement: Element = {
          ...el,
          id: newId,
          name: `${el.name} Copy`,
          parentId: newParentId,
          children: [],
          style: {
            ...el.style,
            // Type guard: only add offset for numeric values
            left: typeof el.style.left === 'number' ? el.style.left + 20 : el.style.left,
            top: typeof el.style.top === 'number' ? el.style.top + 20 : el.style.top,
          },
        };

        set((state) => {
          state.elements[newId] = newElement;
        });

        // Duplicate children
        el.children.forEach((childId) => {
          const childElement = get().elements[childId];
          if (childElement) {
            const newChildId = duplicateRecursive(childElement, newId);
            set((state) => {
              state.elements[newId].children.push(newChildId);
            });
          }
        });

        return newId;
      };

      newRootId = duplicateRecursive(element, element.parentId);

      set((state) => {
        if (element.parentId && state.elements[element.parentId]) {
          state.elements[element.parentId].children.push(newRootId!);
        } else {
          state.rootElementIds.push(newRootId!);
        }
      });

      return newRootId;
    },

    // Move Element
    moveElement: (id, newParentId, index) => {
      set((state) => {
        const element = state.elements[id];
        if (!element) return;

        const oldParentId = element.parentId;

        // Same parent, just reordering
        if (oldParentId === newParentId) {
          if (newParentId && state.elements[newParentId]) {
            const children = state.elements[newParentId].children;
            const oldIndex = children.indexOf(id);
            if (oldIndex !== -1 && index !== undefined) {
              children.splice(oldIndex, 1);
              children.splice(index, 0, id);
            }
          } else {
            const oldIndex = state.rootElementIds.indexOf(id);
            if (oldIndex !== -1 && index !== undefined) {
              state.rootElementIds.splice(oldIndex, 1);
              state.rootElementIds.splice(index, 0, id);
            }
          }
          return;
        }

        // Remove from old parent
        if (oldParentId && state.elements[oldParentId]) {
          state.elements[oldParentId].children = state.elements[oldParentId].children.filter(
            (childId) => childId !== id
          );
        } else {
          state.rootElementIds = state.rootElementIds.filter((rootId) => rootId !== id);
        }

        // Add to new parent
        element.parentId = newParentId;
        if (newParentId && state.elements[newParentId]) {
          if (index !== undefined) {
            state.elements[newParentId].children.splice(index, 0, id);
          } else {
            state.elements[newParentId].children.push(id);
          }
        } else {
          if (index !== undefined) {
            state.rootElementIds.splice(index, 0, id);
          } else {
            state.rootElementIds.push(id);
          }
        }
      });
    },

    // Reorder Element
    reorderElement: (id, newIndex) => {
      const element = get().elements[id];
      if (!element) return;

      get().moveElement(id, element.parentId, newIndex);
    },

    // Select Element
    selectElement: (id, multiSelect = false) => {
      set((state) => {
        if (!state.elements[id]) return;

        if (multiSelect) {
          if (state.selectedElementIds.includes(id)) {
            state.selectedElementIds = state.selectedElementIds.filter((i) => i !== id);
          } else {
            state.selectedElementIds.push(id);
          }
        } else {
          state.selectedElementIds = [id];
        }
      });
    },

    // Clear Selection
    clearSelection: () => {
      set((state) => {
        state.selectedElementIds = [];
      });
    },

    // Select Multiple
    selectMultiple: (ids) => {
      set((state) => {
        state.selectedElementIds = ids.filter((id) => state.elements[id]);
      });
    },

    // Set Hovered Element
    setHoveredElement: (id) => {
      set((state) => {
        state.hoveredElementId = id;
      });
    },

    // Get Element By ID
    getElementById: (id) => {
      return get().elements[id];
    },

    // Get Selected Elements
    getSelectedElements: () => {
      const state = get();
      return state.selectedElementIds
        .map((id) => state.elements[id])
        .filter(Boolean);
    },

    // Clear Canvas
    clearCanvas: () => {
      set((state) => {
        state.elements = {};
        state.rootElementIds = [];
        state.selectedElementIds = [];
        state.hoveredElementId = null;
      });
    },
    
    // Generate Grid Cells - Her grid hücresi için child container oluştur
    generateGridCells: (gridContainerId) => {
      const gridContainer = get().elements[gridContainerId];
      if (!gridContainer || gridContainer.type !== 'container') return;
      if (gridContainer.props?.containerType !== 'grid') return;
      
      const cols = gridContainer.props?.gridTemplateColumns || 'repeat(3, 1fr)';
      const rows = gridContainer.props?.gridTemplateRows || 'repeat(3, 1fr)'; // Default 3 satır
      
      const colMatch = cols.match(/repeat\((\d+),/);
      const rowMatch = rows.match(/repeat\((\d+),/);
      const columnCount = colMatch ? parseInt(colMatch[1]) : 3;
      const rowCount = rowMatch ? parseInt(rowMatch[1]) : 3;
      
      // Mevcut grid cell'leri bul
      const existingCells = Object.values(get().elements).filter(
        el => el.parentId === gridContainerId && el.props?.isGridCell
      );
      
      const totalCells = columnCount * rowCount;
      
      set((state) => {
        // Yeni cell'ler oluştur
        for (let row = 1; row <= rowCount; row++) {
          for (let col = 1; col <= columnCount; col++) {
            // Zaten varsa skip
            const existing = existingCells.find(
              c => c.props?.gridPosition?.row === row && 
                   c.props?.gridPosition?.column === col
            );
            if (existing) continue;
            
            // Yeni cell container oluştur
            const cellId = nanoid();
            const newCell: any = {
              id: cellId,
              type: 'container',
              name: `Cell ${row}-${col}`,
              parentId: gridContainerId,
              children: [],
              props: {
                tag: 'div',
                isGridCell: true,
                gridPosition: { row, column: col }
              },
              style: {
                position: 'relative',
                gridColumn: `${col}`, // String olarak (önemli)
                gridRow: `${row}`,    // String olarak (önemli)
                width: '100%',
                height: '100%',
                minHeight: '100%', // Row height kadar uzasın
                minWidth: 0,       // Grid taşmasını önle
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: 8,
                backgroundColor: 'rgba(240, 245, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              },
              locked: false,
              hidden: false,
            };
            
            state.elements[cellId] = newCell;
            
            // Parent'ın children'ına ekle
            if (!state.elements[gridContainerId].children.includes(cellId)) {
              state.elements[gridContainerId].children.push(cellId);
            }
          }
        }
        
        // Fazla cell'leri sil
        if (existingCells.length > totalCells) {
          const cellsToRemove = existingCells.slice(totalCells);
          cellsToRemove.forEach(cell => {
            // Cell'i ve içindeki tüm elementleri sil
            const deleteRecursive = (elementId: string) => {
              const element = state.elements[elementId];
              if (!element) return;
              
              // Children'ı önce sil
              element.children.forEach(childId => deleteRecursive(childId));
              
              // Parent'tan kaldır
              if (element.parentId) {
                const parent = state.elements[element.parentId];
                if (parent) {
                  parent.children = parent.children.filter(id => id !== elementId);
                }
              }
              
              // Root'tan kaldır
              state.rootElementIds = state.rootElementIds.filter(id => id !== elementId);
              
              // Element'i sil
              delete state.elements[elementId];
            };
            
            deleteRecursive(cell.id);
          });
        }
      });
    },

    // Import Elements (for HTML import)
    importElements: (elements, rootIds) => {
      set((state) => {
        // Merge imported elements with existing elements
        Object.entries(elements).forEach(([id, element]) => {
          state.elements[id] = element;
        });

        // Add root IDs to canvas root
        rootIds.forEach((id) => {
          if (!state.rootElementIds.includes(id)) {
            state.rootElementIds.push(id);
          }
        });
      });
    },
  }))
);
