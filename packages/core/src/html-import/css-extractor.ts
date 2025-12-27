/**
 * CSS Extractor - Parse CSS from various sources and match to elements
 */

export interface CSSRule {
  selector: string;
  properties: Record<string, string>;
  specificity: number;
  source: 'inline' | 'internal' | 'external';
}

export interface ExtractedStyles {
  rules: CSSRule[];
  variables: Record<string, string>;
  keyframes: Record<string, string>;
  mediaQueries: Record<string, CSSRule[]>;
  fontFaces: string[];
}

/**
 * Parse CSS string and extract rules
 */
export function parseCSS(cssText: string, source: 'internal' | 'external' = 'internal'): ExtractedStyles {
  const rules: CSSRule[] = [];
  const variables: Record<string, string> = {};
  const keyframes: Record<string, string> = {};
  const mediaQueries: Record<string, CSSRule[]> = {};
  const fontFaces: string[] = [];

  // Remove comments
  const cleanCSS = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

  // Extract CSS variables from :root
  const varMatch = cleanCSS.match(/:root\s*\{([^}]+)\}/);
  if (varMatch) {
    const varDeclarations = varMatch[1];
    const varRegex = /--([\w-]+)\s*:\s*([^;]+)/g;
    let match;
    while ((match = varRegex.exec(varDeclarations)) !== null) {
      variables[`--${match[1]}`] = match[2].trim();
    }
  }

  // Extract @keyframes
  const keyframeRegex = /@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\}\s*\}/g;
  let keyframeMatch;
  while ((keyframeMatch = keyframeRegex.exec(cleanCSS)) !== null) {
    keyframes[keyframeMatch[1]] = keyframeMatch[2];
  }

  // Extract @font-face
  const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
  let fontMatch;
  while ((fontMatch = fontFaceRegex.exec(cleanCSS)) !== null) {
    fontFaces.push(fontMatch[1]);
  }

  // Extract @media queries
  const mediaRegex = /@media\s*([^{]+)\{([\s\S]*?)\}\s*\}/g;
  let mediaMatch;
  while ((mediaMatch = mediaRegex.exec(cleanCSS)) !== null) {
    const query = mediaMatch[1].trim();
    const mediaRules = parseRules(mediaMatch[2], source);
    mediaQueries[query] = mediaRules;
  }

  // Remove @rules before parsing regular rules
  const cleanedForRules = cleanCSS
    .replace(/@keyframes[\s\S]*?\}\s*\}/g, '')
    .replace(/@font-face\s*\{[^}]+\}/g, '')
    .replace(/@media[\s\S]*?\}\s*\}/g, '')
    .replace(/@import[^;]+;/g, '')
    .replace(/:root\s*\{[^}]+\}/g, '');

  // Parse regular rules
  const regularRules = parseRules(cleanedForRules, source);
  rules.push(...regularRules);

  return {
    rules,
    variables,
    keyframes,
    mediaQueries,
    fontFaces,
  };
}

/**
 * Parse CSS rules from a block
 */
function parseRules(cssBlock: string, source: 'internal' | 'external'): CSSRule[] {
  const rules: CSSRule[] = [];

  // Match selector { properties }
  const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(cssBlock)) !== null) {
    const selectors = match[1].trim();
    const propertiesBlock = match[2].trim();

    // Handle multiple selectors (comma separated)
    const selectorList = selectors.split(',').map(s => s.trim()).filter(Boolean);

    // Parse properties
    const properties = parseProperties(propertiesBlock);

    // Create rule for each selector
    selectorList.forEach(selector => {
      if (selector && Object.keys(properties).length > 0) {
        rules.push({
          selector,
          properties,
          specificity: calculateSpecificity(selector),
          source,
        });
      }
    });
  }

  return rules;
}

/**
 * Parse CSS property declarations
 */
/**
 * Parse CSS property declarations safely handling quotes and parentheses
 */
function parseProperties(block: string): Record<string, string> {
  const properties: Record<string, string> = {};

  let currentProp = '';
  let currentValue = '';
  let inProp = true; // true = parsing property name, false = parsing value
  let buffer = '';
  let quote: string | null = null;
  let parenLevel = 0;

  for (let i = 0; i < block.length; i++) {
    const char = block[i];

    // Handle quotes
    if (quote) {
      buffer += char;
      if (char === quote && block[i - 1] !== '\\') {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      buffer += char;
      continue;
    }

    // Handle parentheses
    if (char === '(') {
      parenLevel++;
      buffer += char;
      continue;
    }

    if (char === ')') {
      if (parenLevel > 0) parenLevel--;
      buffer += char;
      continue;
    }

    // Parse delimiter
    if (inProp && char === ':') {
      currentProp = buffer.trim();
      buffer = '';
      inProp = false;
      continue;
    }

    if (!inProp && char === ';' && parenLevel === 0) {
      currentValue = buffer.trim();

      // Save property
      if (currentProp && currentValue) {
        // Handle !important
        currentValue = currentValue.replace(/\s*!important\s*$/, '');

        // Convert to camelCase
        const camelProperty = currentProp.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        properties[camelProperty] = currentValue;
      }

      buffer = '';
      currentProp = '';
      currentValue = '';
      inProp = true;
      continue;
    }

    buffer += char;
  }

  // Handle last property if no trailing semicolon
  if (!inProp && buffer.trim()) {
    currentValue = buffer.trim();
    if (currentProp && currentValue) {
      currentValue = currentValue.replace(/\s*!important\s*$/, '');
      const camelProperty = currentProp.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      properties[camelProperty] = currentValue;
    }
  }

  return properties;
}

/**
 * Calculate CSS specificity for a selector
 * Returns a number for easy comparison
 */
function calculateSpecificity(selector: string): number {
  // Count IDs (a)
  const ids = (selector.match(/#[\w-]+/g) || []).length;

  // Count classes, attributes, pseudo-classes (b)
  const classes = (selector.match(/\.[\w-]+/g) || []).length;
  const attributes = (selector.match(/\[[^\]]+\]/g) || []).length;
  const pseudoClasses = (selector.match(/:[\w-]+(?!\()/g) || []).length;
  const b = classes + attributes + pseudoClasses;

  // Count elements, pseudo-elements (c)
  const elements = (selector.match(/(?:^|[\s+>~])[\w]+/g) || []).length;
  const pseudoElements = (selector.match(/::[\w-]+/g) || []).length;
  const c = elements + pseudoElements;

  // Return combined specificity (id * 100 + class * 10 + element)
  return ids * 100 + b * 10 + c;
}

/**
 * Match CSS rules to an element based on selector
 */
export function matchRulesToElement(
  element: { tagName: string; id: string; classNames: string[]; attributes?: Record<string, string> },
  rules: CSSRule[]
): CSSRule[] {
  const matched: CSSRule[] = [];

  rules.forEach(rule => {
    if (selectorMatches(element, rule.selector)) {
      matched.push(rule);
    }
  });

  // Sort by specificity (higher = more important)
  matched.sort((a, b) => a.specificity - b.specificity);

  return matched;
}

/**
 * Check if a simple selector matches an element
 * Supports: tag, .class, #id, [attr], tag.class, tag#id
 */
function selectorMatches(
  element: { tagName: string; id: string; classNames: string[]; attributes?: Record<string, string> },
  selector: string
): boolean {
  // Simplify: only check the last part of complex selectors
  const parts = selector.split(/[\s>+~]/).filter(Boolean);
  const lastPart = parts[parts.length - 1] || '';

  if (!lastPart) return false;

  // Check tag name - only if selector starts with a letter (not . or #)
  const tagMatch = lastPart.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
  if (tagMatch) {
    // Selector specifies a tag, must match
    if (tagMatch[1].toLowerCase() !== element.tagName.toLowerCase()) {
      return false;
    }
  }

  // Check ID
  const idMatch = lastPart.match(/#([\w-]+)/);
  if (idMatch) {
    if (idMatch[1] !== element.id) {
      return false;
    }
  }

  // Check classes - ALL specified classes must be present
  const classMatches = lastPart.match(/\.([\w-]+)/g);
  if (classMatches) {
    for (const classMatch of classMatches) {
      const className = classMatch.substring(1);
      if (!element.classNames.includes(className)) {
        return false;
      }
    }
  }

  // If selector only has tag/class/id, at least one should match
  // For class-only selectors, classMatches must exist and all matched
  if (!tagMatch && !idMatch && !classMatches) {
    return false;
  }

  // Check attributes
  const attrMatches = lastPart.match(/\[([\w-]+)(?:="([^"]*)")?\]/g);
  if (attrMatches && element.attributes) {
    for (const attrMatch of attrMatches) {
      const attrParsed = attrMatch.match(/\[([\w-]+)(?:="([^"]*)")?\]/);
      if (attrParsed) {
        const attrName = attrParsed[1];
        const attrValue = attrParsed[2];
        if (attrValue !== undefined) {
          if (element.attributes[attrName] !== attrValue) {
            return false;
          }
        } else if (!(attrName in element.attributes)) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Merge multiple CSS property objects (later values override earlier)
 */
export function mergeStyles(...styleSets: Record<string, string>[]): Record<string, string> {
  const merged: Record<string, string> = {};

  styleSets.forEach(styles => {
    Object.assign(merged, styles);
  });

  return merged;
}

/**
 * Compute final styles for an element
 */
export function computeElementStyles(
  element: { tagName: string; id: string; classNames: string[]; inlineStyles: Record<string, string> },
  extractedStyles: ExtractedStyles
): Record<string, string> {
  // Get matching rules sorted by specificity
  const matchedRules = matchRulesToElement(element, extractedStyles.rules);

  // Start with matched rules (lower specificity first)
  const baseStyles = matchedRules.reduce((acc, rule) => {
    return { ...acc, ...rule.properties };
  }, {} as Record<string, string>);

  // Inline styles have highest priority
  return mergeStyles(baseStyles, element.inlineStyles);
}

/**
 * Resolve CSS variables in a value
 */
export function resolveVariables(value: string, variables: Record<string, string>): string {
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\s*\)/g, (_, varName, fallback) => {
    return variables[varName] || fallback || '';
  });
}
