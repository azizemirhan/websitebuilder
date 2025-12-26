/**
 * Canvas Persistence - Save and load canvas state
 */

import { useCanvasStore } from '../store/canvas-store';
import type { CanvasState, Element } from '../types';
import { toast } from '../store/toast-store';

export interface SavedCanvas {
  version: string;
  createdAt: string;
  name: string;
  elements: Record<string, Element>;
  rootElementIds: string[];
}

/**
 * Export canvas to JSON
 */
export const exportCanvas = (name: string = 'Untitled'): string => {
  const state = useCanvasStore.getState();
  
  const savedCanvas: SavedCanvas = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    name,
    elements: state.elements,
    rootElementIds: state.rootElementIds,
  };
  
  return JSON.stringify(savedCanvas, null, 2);
};

/**
 * Download canvas as JSON file
 */
export const downloadCanvas = (filename: string = 'canvas'): void => {
  const json = exportCanvas(filename);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast.success('Canvas exported successfully!');
};

/**
 * Import canvas from JSON string
 */
export const importCanvas = (jsonString: string): boolean => {
  try {
    const savedCanvas: SavedCanvas = JSON.parse(jsonString);
    
    // Validate
    if (!savedCanvas.version || !savedCanvas.elements || !savedCanvas.rootElementIds) {
      throw new Error('Invalid canvas format');
    }
    
    // Apply to store
    useCanvasStore.setState({
      elements: savedCanvas.elements,
      rootElementIds: savedCanvas.rootElementIds,
      selectedElementIds: [],
      hoveredElementId: null,
    });
    
    toast.success(`Canvas "${savedCanvas.name}" loaded!`);
    return true;
  } catch (error) {
    toast.error('Failed to import canvas. Invalid format.');
    console.error('Import error:', error);
    return false;
  }
};

/**
 * Load canvas from file input
 */
export const loadCanvasFromFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        resolve(importCanvas(content));
      } else {
        resolve(false);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file.');
      resolve(false);
    };
    reader.readAsText(file);
  });
};

/**
 * Save to localStorage
 */
export const saveToLocalStorage = (key: string = 'canvas-autosave'): void => {
  const json = exportCanvas('Autosave');
  try {
    localStorage.setItem(key, json);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

/**
 * Load from localStorage
 */
export const loadFromLocalStorage = (key: string = 'canvas-autosave'): boolean => {
  try {
    const json = localStorage.getItem(key);
    if (json) {
      return importCanvas(json);
    }
    return false;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return false;
  }
};

/**
 * Clear canvas
 */
export const clearCanvas = (): void => {
  useCanvasStore.getState().clearCanvas();
  toast.info('Canvas cleared.');
};
