/**
 * Settings Store - Editor settings and preferences
 */

import { create } from 'zustand';

interface SettingsStore {
  // Grid Settings
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapThreshold: number;
  
  // Zoom/Pan
  zoom: number;
  panX: number;
  panY: number;
  
  // Guides
  showSmartGuides: boolean;
  showRulers: boolean;
  
  // Actions
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
  toggleSmartGuides: () => void;
  toggleRulers: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  // Grid defaults
  showGrid: true,
  gridSize: 20,
  snapToGrid: true,
  snapThreshold: 5,
  
  // Zoom defaults
  zoom: 1,
  panX: 0,
  panY: 0,
  
  // Guides defaults
  showSmartGuides: true,
  showRulers: false,
  
  // Actions
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  setGridSize: (size) => set({ gridSize: size }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),
  toggleSmartGuides: () => set((state) => ({ showSmartGuides: !state.showSmartGuides })),
  toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),
}));

/**
 * Snap value to grid
 */
export const snapToGridValue = (value: number, gridSize: number, threshold: number): number => {
  const remainder = value % gridSize;
  if (remainder < threshold) {
    return value - remainder;
  }
  if (gridSize - remainder < threshold) {
    return value + (gridSize - remainder);
  }
  return value;
};
