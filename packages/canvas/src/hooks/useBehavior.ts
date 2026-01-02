/**
 * useBehavior Hook - Applies behaviors and visibility to elements
 */

import { useCallback, useMemo } from 'react';
import { 
  useBehaviorStore, 
  useResponsiveStore,
  type Element,
  type ElementBehavior,
  type BehaviorAction,
  resolveBehaviorPreset
} from '@builder/core';

export interface UseBehaviorResult {
  /** Event handlers to apply to the element */
  handlers: {
    onClick?: (e: React.MouseEvent) => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
  };
  
  /** Whether the element should be visible */
  isVisible: boolean;
  
  /** Dynamic classes from behaviors */
  behaviorClasses: string[];
}

/**
 * Hook to process element behaviors and return handlers + visibility
 */
export function useBehavior(element: Element): UseBehaviorResult {
  const behaviorStore = useBehaviorStore();
  const activeBreakpoint = useResponsiveStore((state) => state.activeBreakpoint);
  
  // Get behaviors from element (resolve presets if needed)
  const behaviors = useMemo((): ElementBehavior[] => {
    // First check for preset shortcut
    if (element.behaviorPreset) {
      return resolveBehaviorPreset(element.behaviorPreset);
    }
    
    // Then check for behaviors array or preset string
    if (!element.behaviors) return [];
    
    if (typeof element.behaviors === 'string') {
      return resolveBehaviorPreset(element.behaviors);
    }
    
    return element.behaviors;
  }, [element.behaviors, element.behaviorPreset]);
  
  // Execute a behavior action
  const executeAction = useCallback((action: BehaviorAction) => {
    switch (action.type) {
      case 'toggle-visibility':
        if (action.target === 'self') {
          behaviorStore.toggleElement(element.id);
        } else {
          behaviorStore.toggleElement(action.target);
        }
        break;
        
      case 'show':
        if (action.target === 'self') {
          behaviorStore.showElement(element.id);
        } else {
          behaviorStore.showElement(action.target);
        }
        break;
        
      case 'hide':
        if (action.target === 'self') {
          behaviorStore.hideElement(element.id);
        } else {
          behaviorStore.hideElement(action.target);
        }
        break;
        
      case 'toggle-class':
        if (action.target === 'self') {
          behaviorStore.toggleClass(element.id, action.className);
        } else {
          behaviorStore.toggleClass(action.target, action.className);
        }
        break;
        
      case 'add-class':
        if (action.target === 'self') {
          behaviorStore.addClass(element.id, action.className);
        } else {
          behaviorStore.addClass(action.target, action.className);
        }
        break;
        
      case 'remove-class':
        if (action.target === 'self') {
          behaviorStore.removeClass(element.id, action.className);
        } else {
          behaviorStore.removeClass(action.target, action.className);
        }
        break;
        
      case 'set-state':
        behaviorStore.setState(action.key, action.value);
        break;
        
      case 'toggle-state':
        // Handle common toggles
        switch (action.key) {
          case 'mobileMenuOpen':
            behaviorStore.toggleMobileMenu();
            break;
          case 'searchOpen':
            behaviorStore.toggleSearch();
            break;
          case 'cartOpen':
            behaviorStore.toggleCart();
            break;
          default:
            behaviorStore.toggleState(action.key);
        }
        break;
        
      case 'navigate':
        if (action.newTab) {
          window.open(action.url, '_blank');
        } else {
          window.location.href = action.url;
        }
        break;
        
      case 'scroll-to':
        const targetEl = action.target === 'self' 
          ? document.querySelector(`[data-element-id="${element.id}"]`)
          : action.target === 'body' || action.target === 'top'
            ? document.body
            : document.querySelector(`[data-element-id="${action.target}"]`);
        
        if (targetEl) {
          const offset = action.offset || 0;
          const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        break;
        
      case 'open-modal':
        behaviorStore.openModal(action.modalId);
        break;
        
      case 'close-modal':
        behaviorStore.closeModal();
        break;
        
      case 'custom':
        // Custom handlers can be registered elsewhere
        console.log('Custom behavior:', action.handler, action.payload);
        break;
    }
  }, [behaviorStore, element.id]);
  
  // Check if behavior condition is met
  const checkCondition = useCallback((behavior: ElementBehavior): boolean => {
    if (!behavior.condition) return true;
    return behaviorStore.checkVisibility(behavior.condition);
  }, [behaviorStore]);
  
  // Create event handlers from behaviors
  const handlers = useMemo(() => {
    const result: UseBehaviorResult['handlers'] = {};
    
    // Group behaviors by trigger
    const clickBehaviors = behaviors.filter(b => b.trigger === 'click');
    const hoverStartBehaviors = behaviors.filter(b => b.trigger === 'hover' || b.trigger === 'hover-start');
    const hoverEndBehaviors = behaviors.filter(b => b.trigger === 'hover-end');
    
    if (clickBehaviors.length > 0) {
      result.onClick = (e: React.MouseEvent) => {
        for (const behavior of clickBehaviors) {
          if (checkCondition(behavior)) {
            if (behavior.preventDefault) e.preventDefault();
            if (behavior.stopPropagation) e.stopPropagation();
            executeAction(behavior.action);
          }
        }
      };
    }
    
    if (hoverStartBehaviors.length > 0) {
      result.onMouseEnter = (e: React.MouseEvent) => {
        for (const behavior of hoverStartBehaviors) {
          if (checkCondition(behavior)) {
            executeAction(behavior.action);
          }
        }
      };
    }
    
    if (hoverEndBehaviors.length > 0) {
      result.onMouseLeave = (e: React.MouseEvent) => {
        for (const behavior of hoverEndBehaviors) {
          if (checkCondition(behavior)) {
            executeAction(behavior.action);
          }
        }
      };
    }
    
    return result;
  }, [behaviors, checkCondition, executeAction]);
  
  // Check visibility
  const isVisible = useMemo(() => {
    // First check if element is hidden by behavior store
    if (behaviorStore.isElementHidden(element.id)) {
      return false;
    }
    
    // Then check visibility condition
    if (element.visibility) {
      return behaviorStore.checkVisibility(element.visibility);
    }
    
    return true;
  }, [behaviorStore, element.id, element.visibility]);
  
  // Get dynamic classes
  const behaviorClasses = useMemo(() => {
    return behaviorStore.getClasses(element.id);
  }, [behaviorStore, element.id]);
  
  return {
    handlers,
    isVisible,
    behaviorClasses,
  };
}

/**
 * Hook to initialize behavior store listeners
 */
export function useBehaviorInit() {
  // This would be called once in CanvasRenderer or similar
  // to set up scroll and resize listeners
}
