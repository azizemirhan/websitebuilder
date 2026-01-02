/**
 * Behavior Store - Global state management for element behaviors
 */

import { create } from 'zustand';
import { useResponsiveStore } from './responsive-store';
import type { VisibilityCondition } from '../types/behavior';

/**
 * UI State managed by the behavior store
 */
export interface BehaviorState {
  // Common UI states
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  cartOpen: boolean;
  
  // Active modal
  activeModal: string | null;
  
  // Scroll position
  scrollY: number;
  
  // Viewport width
  viewportWidth: number;
  
  // Custom state map for template-specific states
  customState: Record<string, any>;
  
  // Hidden elements (by ID)
  hiddenElements: Set<string>;
  
  // Active classes on elements
  elementClasses: Record<string, Set<string>>;
}

export interface BehaviorActions {
  // Common toggles
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  toggleCart: () => void;
  
  closeMobileMenu: () => void;
  closeSearch: () => void;
  closeCart: () => void;
  closeAllOverlays: () => void;
  
  // Modal actions
  openModal: (id: string) => void;
  closeModal: () => void;
  
  // Generic state management
  setState: (key: string, value: any) => void;
  toggleState: (key: string) => void;
  getState: (key: string) => any;
  
  // Element visibility
  showElement: (id: string) => void;
  hideElement: (id: string) => void;
  toggleElement: (id: string) => void;
  isElementHidden: (id: string) => boolean;
  
  // Element classes
  addClass: (elementId: string, className: string) => void;
  removeClass: (elementId: string, className: string) => void;
  toggleClass: (elementId: string, className: string) => void;
  hasClass: (elementId: string, className: string) => boolean;
  getClasses: (elementId: string) => string[];
  
  // Scroll tracking
  updateScrollY: (scrollY: number) => void;
  
  // Viewport tracking
  updateViewportWidth: (width: number) => void;
  
  // Check visibility condition
  checkVisibility: (condition: VisibilityCondition) => boolean;
}

export type BehaviorStore = BehaviorState & BehaviorActions;

export const useBehaviorStore = create<BehaviorStore>((set, get) => ({
  // Initial state
  mobileMenuOpen: false,
  searchOpen: false,
  cartOpen: false,
  activeModal: null,
  scrollY: 0,
  viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1440,
  customState: {},
  hiddenElements: new Set(),
  elementClasses: {},
  
  // Common toggles
  toggleMobileMenu: () => set((state) => ({ 
    mobileMenuOpen: !state.mobileMenuOpen,
    // Close other overlays when opening mobile menu
    searchOpen: state.mobileMenuOpen ? state.searchOpen : false,
    cartOpen: state.mobileMenuOpen ? state.cartOpen : false,
  })),
  
  toggleSearch: () => set((state) => ({ 
    searchOpen: !state.searchOpen,
    mobileMenuOpen: state.searchOpen ? state.mobileMenuOpen : false,
  })),
  
  toggleCart: () => set((state) => ({ 
    cartOpen: !state.cartOpen,
    mobileMenuOpen: state.cartOpen ? state.mobileMenuOpen : false,
    searchOpen: state.cartOpen ? state.searchOpen : false,
  })),
  
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  
  closeAllOverlays: () => set({
    mobileMenuOpen: false,
    searchOpen: false,
    cartOpen: false,
    activeModal: null,
  }),
  
  // Modal actions
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  
  // Generic state management
  setState: (key, value) => set((state) => {
    // Handle top-level UI states
    if (key === 'mobileMenuOpen') return { mobileMenuOpen: value };
    if (key === 'searchOpen') return { searchOpen: value };
    if (key === 'cartOpen') return { cartOpen: value };
    
    // Default to customState
    return {
      customState: { ...state.customState, [key]: value }
    };
  }),
  
  toggleState: (key) => set((state) => ({
    customState: { 
      ...state.customState, 
      [key]: !state.customState[key] 
    }
  })),
  
  getState: (key) => get().customState[key],
  
  // Element visibility
  showElement: (id) => set((state) => {
    const newHidden = new Set(state.hiddenElements);
    newHidden.delete(id);
    return { hiddenElements: newHidden };
  }),
  
  hideElement: (id) => set((state) => {
    const newHidden = new Set(state.hiddenElements);
    newHidden.add(id);
    return { hiddenElements: newHidden };
  }),
  
  toggleElement: (id) => set((state) => {
    const newHidden = new Set(state.hiddenElements);
    if (newHidden.has(id)) {
      newHidden.delete(id);
    } else {
      newHidden.add(id);
    }
    return { hiddenElements: newHidden };
  }),
  
  isElementHidden: (id) => get().hiddenElements.has(id),
  
  // Element classes
  addClass: (elementId, className) => set((state) => {
    const current = state.elementClasses[elementId] || new Set();
    const newSet = new Set(current);
    newSet.add(className);
    return { 
      elementClasses: { ...state.elementClasses, [elementId]: newSet } 
    };
  }),
  
  removeClass: (elementId, className) => set((state) => {
    const current = state.elementClasses[elementId];
    if (!current) return state;
    const newSet = new Set(current);
    newSet.delete(className);
    return { 
      elementClasses: { ...state.elementClasses, [elementId]: newSet } 
    };
  }),
  
  toggleClass: (elementId, className) => set((state) => {
    const current = state.elementClasses[elementId] || new Set();
    const newSet = new Set(current);
    if (newSet.has(className)) {
      newSet.delete(className);
    } else {
      newSet.add(className);
    }
    return { 
      elementClasses: { ...state.elementClasses, [elementId]: newSet } 
    };
  }),
  
  hasClass: (elementId, className) => {
    const classes = get().elementClasses[elementId];
    return classes ? classes.has(className) : false;
  },
  
  getClasses: (elementId) => {
    const classes = get().elementClasses[elementId];
    return classes ? Array.from(classes) : [];
  },
  
  // Scroll tracking
  updateScrollY: (scrollY) => set({ scrollY }),
  
  // Viewport tracking
  updateViewportWidth: (width) => set({ viewportWidth: width }),
  
  // Check visibility condition
  checkVisibility: (condition) => {
    const state = get();
    
    // Breakpoint check
    if (condition.breakpoint) {
      // Use responsive store width for consistent behavior with canvas settings
      const width = useResponsiveStore.getState().getActiveBreakpointWidth();
      switch (condition.breakpoint) {
        case 'mobile':
          if (width >= 768) return false;
          break;
        case 'tablet':
          if (width < 768 || width >= 1024) return false;
          break;
        case 'desktop':
          if (width < 1024) return false;
          break;
      }
    }
    
    // Min/max width check
    if (condition.minWidth !== undefined || condition.maxWidth !== undefined) {
      // Use active breakpoint width for responsive checks
      const width = useResponsiveStore.getState().getActiveBreakpointWidth();
      
      if (condition.minWidth !== undefined && width < condition.minWidth) {
        return false;
      }
      if (condition.maxWidth !== undefined && width > condition.maxWidth) {
        return false;
      }
    }
    
    // Scroll position check
    if (condition.scrollY) {
      if (condition.scrollY.min !== undefined && state.scrollY < condition.scrollY.min) {
        return false;
      }
      if (condition.scrollY.max !== undefined && state.scrollY > condition.scrollY.max) {
        return false;
      }
    }
    
    // State check
    if (condition.state) {
      const { key, value, operator = 'equals' } = condition.state;
      
      // Check common states first
      let stateValue: any;
      switch (key) {
        case 'mobileMenuOpen':
          stateValue = state.mobileMenuOpen;
          break;
        case 'searchOpen':
          stateValue = state.searchOpen;
          break;
        case 'cartOpen':
          stateValue = state.cartOpen;
          break;
        default:
          stateValue = state.customState[key];
      }
      
      switch (operator) {
        case 'equals':
          if (stateValue !== value) return false;
          break;
        case 'not-equals':
          if (stateValue === value) return false;
          break;
        case 'contains':
          if (!String(stateValue).includes(String(value))) return false;
          break;
        case 'greater':
          if (stateValue <= value) return false;
          break;
        case 'less':
          if (stateValue >= value) return false;
          break;
      }
    }
    
    // AND conditions
    if (condition.and) {
      for (const cond of condition.and) {
        if (!state.checkVisibility(cond)) return false;
      }
    }
    
    // OR conditions
    if (condition.or) {
      let anyMatch = false;
      for (const cond of condition.or) {
        if (state.checkVisibility(cond)) {
          anyMatch = true;
          break;
        }
      }
      if (!anyMatch) return false;
    }
    
    // NOT condition
    if (condition.not) {
      if (state.checkVisibility(condition.not)) return false;
    }
    
    return true;
  },
}));

/**
 * Initialize behavior store with scroll and resize listeners
 */
export function initBehaviorStore(): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const store = useBehaviorStore.getState();
  
  // Initial values
  store.updateScrollY(window.scrollY);
  store.updateViewportWidth(window.innerWidth);
  
  // Scroll listener
  const handleScroll = () => {
    store.updateScrollY(window.scrollY);
  };
  
  // Resize listener
  const handleResize = () => {
    store.updateViewportWidth(window.innerWidth);
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });
  
  // Cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
  };
}
