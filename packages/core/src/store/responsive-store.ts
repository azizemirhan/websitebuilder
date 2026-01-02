/**
 * Responsive Store - Breakpoint and responsive layout management
 */

import { create } from 'zustand';
import type { StyleProperties, ResponsiveStyleOverrides } from '../types';

export type BreakpointName = 'mobile' | 'tablet' | 'desktop';

export interface Breakpoint {
  name: BreakpointName;
  label: string;
  width: number;
  icon: string;
}

export const BREAKPOINTS: Breakpoint[] = [
  { name: 'mobile', label: 'Mobile', width: 375, icon: '📱' },
  { name: 'tablet', label: 'Tablet', width: 768, icon: '📲' },
  { name: 'desktop', label: 'Desktop', width: 1440, icon: '🖥️' },
];

interface ResponsiveStore {
  activeBreakpoint: BreakpointName;
  previewMode: boolean;
  previewDevice: 'none' | 'iphone' | 'ipad' | 'macbook';
  
  setActiveBreakpoint: (breakpoint: BreakpointName) => void;
  togglePreviewMode: () => void;
  setPreviewDevice: (device: 'none' | 'iphone' | 'ipad' | 'macbook') => void;
  
  getActiveBreakpointWidth: () => number;
  getBreakpoint: (name: BreakpointName) => Breakpoint;
}

export const useResponsiveStore = create<ResponsiveStore>((set, get) => ({
  activeBreakpoint: 'desktop',
  previewMode: false,
  previewDevice: 'none',
  
  setActiveBreakpoint: (breakpoint) => set({ activeBreakpoint: breakpoint }),
  
  togglePreviewMode: () => set((state) => ({ previewMode: !state.previewMode })),
  
  setPreviewDevice: (device) => set({ previewDevice: device }),
  
  getActiveBreakpointWidth: () => {
    const bp = BREAKPOINTS.find((b) => b.name === get().activeBreakpoint);
    return bp?.width || 1440;
  },
  
  getBreakpoint: (name) => {
    return BREAKPOINTS.find((b) => b.name === name) || BREAKPOINTS[2];
  },
}));

/**
 * Get responsive styles for an element at a specific breakpoint
 */
export const getResponsiveStyles = (
  baseStyles: StyleProperties,
  overrides: ResponsiveStyleOverrides | undefined,
  breakpoint: BreakpointName
): StyleProperties => {
  if (!overrides) return baseStyles;
  
  // Apply mobile styles first (mobile-first approach)
  let computedStyles = { ...baseStyles };
  
  if (breakpoint === 'mobile' && overrides.mobile) {
    computedStyles = { ...computedStyles, ...overrides.mobile };
  } else if (breakpoint === 'tablet') {
    if (overrides.mobile) computedStyles = { ...computedStyles, ...overrides.mobile };
    if (overrides.tablet) computedStyles = { ...computedStyles, ...overrides.tablet };
  } else if (breakpoint === 'desktop') {
    if (overrides.mobile) computedStyles = { ...computedStyles, ...overrides.mobile };
    if (overrides.tablet) computedStyles = { ...computedStyles, ...overrides.tablet };
    if (overrides.desktop) computedStyles = { ...computedStyles, ...overrides.desktop };
  }
  
  return computedStyles;
};
