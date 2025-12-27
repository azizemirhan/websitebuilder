/**
 * HTML Parser - Parse HTML string to DOM tree and extract structure
 */

export interface ParsedElement {
  tagName: string;
  id: string;
  classNames: string[];
  attributes: Record<string, string>;
  inlineStyles: Record<string, string>;
  textContent: string;
  children: ParsedElement[];
  originalElement?: Element;
}

export interface ParsedDocument {
  elements: ParsedElement[];
  styleTags: string[];
  linkTags: string[];
  title: string;
  meta: Record<string, string>;
}

/**
 * Parse HTML string into a structured ParsedDocument
 */
export function parseHTML(html: string): ParsedDocument {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Extract title
  const title = doc.querySelector('title')?.textContent || 'Untitled';
  
  // Extract meta tags
  const meta: Record<string, string> = {};
  doc.querySelectorAll('meta').forEach((metaEl) => {
    const name = metaEl.getAttribute('name') || metaEl.getAttribute('property');
    const content = metaEl.getAttribute('content');
    if (name && content) {
      meta[name] = content;
    }
  });
  
  // Extract style tags
  const styleTags: string[] = [];
  doc.querySelectorAll('style').forEach((styleEl) => {
    if (styleEl.textContent) {
      styleTags.push(styleEl.textContent);
    }
  });
  
  // Extract link tags (external CSS)
  const linkTags: string[] = [];
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((linkEl) => {
    const href = linkEl.getAttribute('href');
    if (href) {
      linkTags.push(href);
    }
  });
  
  // Parse body elements
  const bodyElements = parseElements(doc.body);
  
  return {
    elements: bodyElements,
    styleTags,
    linkTags,
    title,
    meta,
  };
}

/**
 * Recursively parse DOM elements into ParsedElement structure
 */
function parseElements(parent: Element): ParsedElement[] {
  const result: ParsedElement[] = [];
  
  Array.from(parent.children).forEach((el) => {
    // Skip script, style, and other non-visual elements
    if (shouldSkipElement(el)) return;
    
    const parsed = parseElement(el);
    result.push(parsed);
  });
  
  return result;
}

/**
 * Parse a single DOM element
 */
function parseElement(el: Element): ParsedElement {
  const tagName = el.tagName.toLowerCase();
  const id = el.id || '';
  const classNames = Array.from(el.classList);
  
  // Extract all attributes
  const attributes: Record<string, string> = {};
  Array.from(el.attributes).forEach((attr) => {
    if (attr.name !== 'style' && attr.name !== 'class' && attr.name !== 'id') {
      attributes[attr.name] = attr.value;
    }
  });
  
  // Extract inline styles
  const inlineStyles = parseInlineStyles(el.getAttribute('style') || '');
  
  // Get direct text content (not from children)
  let textContent = '';
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        textContent += (textContent ? ' ' : '') + text;
      }
    }
  });
  
  // Parse children recursively
  const children = parseElements(el);
  
  return {
    tagName,
    id,
    classNames,
    attributes,
    inlineStyles,
    textContent,
    children,
    originalElement: el,
  };
}

/**
 * Parse inline style string into key-value pairs
 */
function parseInlineStyles(styleStr: string): Record<string, string> {
  const styles: Record<string, string> = {};
  
  if (!styleStr) return styles;
  
  // Split by semicolon and parse each property
  styleStr.split(';').forEach((declaration) => {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex > 0) {
      const property = declaration.substring(0, colonIndex).trim();
      const value = declaration.substring(colonIndex + 1).trim();
      if (property && value) {
        // Convert to camelCase for JS compatibility
        const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        styles[camelProperty] = value;
      }
    }
  });
  
  return styles;
}

/**
 * Check if element should be skipped during parsing
 */
function shouldSkipElement(el: Element): boolean {
  const tagName = el.tagName.toLowerCase();
  const skipTags = ['script', 'style', 'link', 'meta', 'noscript', 'template'];
  return skipTags.includes(tagName);
}

/**
 * Get element type based on tag name and attributes
 */
export function detectElementType(parsed: ParsedElement): 'container' | 'text' | 'button' | 'image' | 'input' | 'link' {
  const { tagName, classNames, children, textContent } = parsed;

  // Image
  if (tagName === 'img') {
    return 'image';
  }

  // Input elements
  if (['input', 'textarea', 'select'].includes(tagName)) {
    return 'input';
  }

  // Button (including button-like elements)
  if (tagName === 'button') {
    return 'button';
  }

  // Links processing
  if (tagName === 'a') {
    // Check if link has complex content (images, divs, etc.)
    // If it has children that are NOT text-formatting tags, treat as container
    const hasComplexChildren = children.some(child =>
      !['span', 'b', 'i', 'u', 'strong', 'em', 'small', 'br'].includes(child.tagName.toLowerCase())
    );

    if (hasComplexChildren) {
      return 'container'; // Complex links (like logos, cards) must be containers
    }

    // Otherwise check for button classes
    const hasButtonClass = classNames.some((cls) =>
      cls.includes('btn') || cls.includes('button') || cls.includes('cta')
    );
    if (hasButtonClass) {
      return 'button';
    }

    // Default links (nav items etc) - might be text or button
    return 'link';
  }

  // Text elements
  const textTags = ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'strong', 'em', 'small'];
  const inlineTags = ['span', 'b', 'i', 'u', 'strong', 'em', 'small', 'br', 'a'];

  if (textTags.includes(tagName)) {
    // If text element has block children (non-inline elements), it must be a container
    const hasBlockChildren = children.some(c =>
      !inlineTags.includes(c.tagName.toLowerCase())
    );

    if (hasBlockChildren) {
      return 'container';
    }

    return 'text';
  }

  // Container heuristics for divs/sections/etc
  // If element has no text content and has children, it's likely a layout container
  if (['div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside'].includes(tagName)) {
    return 'container';
  }

  // Default to container for unknown elements
  return 'container';
}

/**
 * Flatten nested elements into a flat list with parent references
 */
export function flattenElements(
  elements: ParsedElement[],
  parentId: string | null = null
): Array<ParsedElement & { parentId: string | null; depth: number }> {
  const result: Array<ParsedElement & { parentId: string | null; depth: number }> = [];
  
  function traverse(els: ParsedElement[], parent: string | null, depth: number) {
    els.forEach((el, index) => {
      const elementId = el.id || `${parent || 'root'}-${index}`;
      result.push({ ...el, parentId: parent, depth });
      traverse(el.children, elementId, depth + 1);
    });
  }
  
  traverse(elements, parentId, 0);
  return result;
}

/**
 * Get statistics about parsed document
 */
export function getParseStats(doc: ParsedDocument): {
  totalElements: number;
  byTagName: Record<string, number>;
  maxDepth: number;
  hasExternalCSS: boolean;
  hasInlineCSS: boolean;
} {
  const byTagName: Record<string, number> = {};
  let maxDepth = 0;
  let totalElements = 0;
  let hasInlineCSS = false;
  
  function traverse(els: ParsedElement[], depth: number) {
    els.forEach((el) => {
      totalElements++;
      byTagName[el.tagName] = (byTagName[el.tagName] || 0) + 1;
      maxDepth = Math.max(maxDepth, depth);
      
      if (Object.keys(el.inlineStyles).length > 0) {
        hasInlineCSS = true;
      }
      
      traverse(el.children, depth + 1);
    });
  }
  
  traverse(doc.elements, 0);
  
  return {
    totalElements,
    byTagName,
    maxDepth,
    hasExternalCSS: doc.linkTags.length > 0,
    hasInlineCSS,
  };
}
