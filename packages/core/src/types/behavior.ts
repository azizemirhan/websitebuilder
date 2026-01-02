/**
 * Behavior Types - Declarative interactivity definitions for elements
 */

/**
 * Trigger types for behaviors
 */
export type BehaviorTrigger = 
  | 'click'
  | 'hover'
  | 'hover-start'
  | 'hover-end'
  | 'scroll'
  | 'scroll-into-view'
  | 'load'
  | 'resize'
  | 'focus'
  | 'blur';

/**
 * Target element selector types
 */
export type TargetSelector = 
  | string                    // Element ID
  | 'self'                    // The element itself
  | 'parent'                  // Parent element
  | 'children'                // All children
  | `#${string}`             // ID selector
  | `.${string}`;            // Class selector (for future use)

/**
 * Behavior action types
 */
export type BehaviorAction =
  | { type: 'toggle-visibility'; target: TargetSelector }
  | { type: 'show'; target: TargetSelector }
  | { type: 'hide'; target: TargetSelector }
  | { type: 'toggle-class'; target: TargetSelector; className: string }
  | { type: 'add-class'; target: TargetSelector; className: string }
  | { type: 'remove-class'; target: TargetSelector; className: string }
  | { type: 'set-state'; key: string; value: any }
  | { type: 'toggle-state'; key: string }
  | { type: 'navigate'; url: string; newTab?: boolean }
  | { type: 'scroll-to'; target: TargetSelector; offset?: number }
  | { type: 'open-modal'; modalId: string }
  | { type: 'close-modal' }
  | { type: 'submit-form'; formId?: string }
  | { type: 'custom'; handler: string; payload?: Record<string, any> };

/**
 * Condition for visibility or behavior execution
 */
export interface VisibilityCondition {
  /** Breakpoint-based visibility */
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
  
  /** Minimum viewport width (px) */
  minWidth?: number;
  
  /** Maximum viewport width (px) */
  maxWidth?: number;
  
  /** State-based visibility */
  state?: {
    key: string;
    value: any;
    operator?: 'equals' | 'not-equals' | 'contains' | 'greater' | 'less';
  };
  
  /** Scroll position condition */
  scrollY?: {
    min?: number;
    max?: number;
  };
  
  /** Combine multiple conditions */
  and?: VisibilityCondition[];
  or?: VisibilityCondition[];
  not?: VisibilityCondition;
}

/**
 * Single behavior definition
 */
export interface ElementBehavior {
  /** What triggers this behavior */
  trigger: BehaviorTrigger;
  
  /** What action to perform */
  action: BehaviorAction;
  
  /** Optional condition for when to execute */
  condition?: VisibilityCondition;
  
  /** Prevent default browser behavior */
  preventDefault?: boolean;
  
  /** Stop event propagation */
  stopPropagation?: boolean;
}

/**
 * Preset behavior shortcuts for common patterns
 */
export type BehaviorPreset =
  | 'toggle-mobile-menu'
  | 'toggle-search'
  | 'toggle-cart'
  | 'close-mobile-menu'
  | 'close-search'
  | 'close-cart'
  | 'sticky-header'
  | 'scroll-to-top'
  | 'smooth-scroll';

/**
 * Resolve preset to actual behaviors
 */
export function resolveBehaviorPreset(preset: BehaviorPreset): ElementBehavior[] {
  const presets: Record<BehaviorPreset, ElementBehavior[]> = {
    'toggle-mobile-menu': [
      { trigger: 'click', action: { type: 'toggle-state', key: 'mobileMenuOpen' } }
    ],
    'toggle-search': [
      { trigger: 'click', action: { type: 'toggle-state', key: 'searchOpen' } }
    ],
    'toggle-cart': [
      { trigger: 'click', action: { type: 'toggle-state', key: 'cartOpen' } }
    ],
    'close-mobile-menu': [
      { trigger: 'click', action: { type: 'set-state', key: 'mobileMenuOpen', value: false } }
    ],
    'close-search': [
      { trigger: 'click', action: { type: 'set-state', key: 'searchOpen', value: false } }
    ],
    'close-cart': [
      { trigger: 'click', action: { type: 'set-state', key: 'cartOpen', value: false } }
    ],
    'sticky-header': [
      { 
        trigger: 'scroll', 
        action: { type: 'add-class', target: 'self', className: 'is-sticky' },
        condition: { scrollY: { min: 50 } }
      },
      {
        trigger: 'scroll',
        action: { type: 'remove-class', target: 'self', className: 'is-sticky' },
        condition: { scrollY: { max: 49 } }
      }
    ],
    'scroll-to-top': [
      { trigger: 'click', action: { type: 'scroll-to', target: 'body', offset: 0 } }
    ],
    'smooth-scroll': [
      { trigger: 'click', action: { type: 'scroll-to', target: 'self' }, preventDefault: true }
    ]
  };
  
  return presets[preset] || [];
}

/**
 * Behaviors configuration for an element
 * Can be array of behaviors or preset shortcuts
 */
export type ElementBehaviors = ElementBehavior[] | BehaviorPreset;
