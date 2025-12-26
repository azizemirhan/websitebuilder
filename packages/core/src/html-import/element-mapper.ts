/**
 * Element Mapper - Convert parsed HTML elements to Canvas Elements
 */

import type { Element, ElementType, StyleProperties } from '../types';
import type { ParsedElement } from './html-parser';
import { detectElementType } from './html-parser';
import type { ExtractedStyles } from './css-extractor';
import { computeElementStyles, resolveVariables } from './css-extractor';

let elementIdCounter = 0;

function generateElementId(): string {
  return `imported-${Date.now()}-${++elementIdCounter}`;
}

/**
 * CSS property to StyleProperties mapping
 */
const cssToStyleMap: Record<string, keyof StyleProperties> = {
  width: 'width',
  height: 'height',
  minWidth: 'minWidth',
  maxWidth: 'maxWidth',
  minHeight: 'minHeight',
  maxHeight: 'maxHeight',
  backgroundColor: 'backgroundColor',
  background: 'background',
  backgroundImage: 'backgroundImage',
  backgroundSize: 'backgroundSize',
  backgroundPosition: 'backgroundPosition',
  backgroundRepeat: 'backgroundRepeat',
  color: 'color',
  fontSize: 'fontSize',
  fontWeight: 'fontWeight',
  fontFamily: 'fontFamily',
  lineHeight: 'lineHeight',
  letterSpacing: 'letterSpacing',
  textAlign: 'textAlign',
  textDecoration: 'textDecoration',
  textTransform: 'textTransform',
  padding: 'padding',
  paddingTop: 'paddingTop',
  paddingRight: 'paddingRight',
  paddingBottom: 'paddingBottom',
  paddingLeft: 'paddingLeft',
  margin: 'margin',
  marginTop: 'marginTop',
  marginRight: 'marginRight',
  marginBottom: 'marginBottom',
  marginLeft: 'marginLeft',
  border: 'border',
  borderWidth: 'borderWidth',
  borderColor: 'borderColor',
  borderStyle: 'borderStyle',
  borderRadius: 'borderRadius',
  borderTopLeftRadius: 'borderTopLeftRadius',
  borderTopRightRadius: 'borderTopRightRadius',
  borderBottomRightRadius: 'borderBottomRightRadius',
  borderBottomLeftRadius: 'borderBottomLeftRadius',
  display: 'display',
  position: 'position',
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
  zIndex: 'zIndex',
  flexDirection: 'flexDirection',
  justifyContent: 'justifyContent',
  alignItems: 'alignItems',
  flexWrap: 'flexWrap',
  gap: 'gap',
  flexGrow: 'flexGrow',
  flexShrink: 'flexShrink',
  flexBasis: 'flexBasis',
  alignSelf: 'alignSelf',
  gridTemplateColumns: 'gridTemplateColumns',
  gridTemplateRows: 'gridTemplateRows',
  columnGap: 'columnGap',
  rowGap: 'rowGap',
  opacity: 'opacity',
  overflow: 'overflow',
  boxShadow: 'boxShadow',
  textShadow: 'textShadow',
  transform: 'transform',
  transition: 'transition',
  filter: 'filter',
  backdropFilter: 'backdropFilter',
  cursor: 'cursor',
};

/**
 * Convert CSS computed styles to StyleProperties
 */
function cssToStyleProperties(
  cssStyles: Record<string, string>,
  variables: Record<string, string> = {}
): Partial<StyleProperties> {
  const style: Partial<StyleProperties> = {};
  
  Object.entries(cssStyles).forEach(([cssProp, value]) => {
    const styleProp = cssToStyleMap[cssProp];
    if (styleProp && value) {
      // Resolve CSS variables
      const resolvedValue = resolveVariables(value, variables);
      
      // Convert to appropriate type
      const converted = convertCSSValue(styleProp, resolvedValue);
      if (converted !== undefined) {
        (style as Record<string, unknown>)[styleProp] = converted;
      }
    }
  });
  
  return style;
}

/**
 * Convert CSS value to appropriate JS type
 */
function convertCSSValue(property: keyof StyleProperties, value: string): string | number | undefined {
  if (!value || value === 'initial' || value === 'inherit' || value === 'unset') {
    return undefined;
  }
  
  // Properties that should be numbers
  const numericProperties = [
    'zIndex', 'opacity', 'flexGrow', 'flexShrink', 'order',
  ];
  
  if (numericProperties.includes(property)) {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }
  
  // Properties that might be px values but can be numbers
  const dimensionProperties = [
    'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
    'top', 'right', 'bottom', 'left',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'borderWidth', 'borderRadius', 'gap', 'columnGap', 'rowGap',
    'fontSize', 'lineHeight', 'letterSpacing',
  ];
  
  if (dimensionProperties.includes(property)) {
    // Keep as string if it has units other than px, or is complex
    if (value.includes('%') || value.includes('em') || value.includes('rem') || 
        value.includes('vh') || value.includes('vw') || value.includes('calc') ||
        value.includes('auto')) {
      return value;
    }
    
    // Convert px to number
    const pxMatch = value.match(/^(-?\d+(?:\.\d+)?)px$/);
    if (pxMatch) {
      return parseFloat(pxMatch[1]);
    }
    
    // Plain number
    const num = parseFloat(value);
    if (!isNaN(num) && value === String(num)) {
      return num;
    }
  }
  
  return value;
}

/**
 * Map parsed element to canvas Element type
 */
function mapElementType(parsed: ParsedElement): ElementType {
  const detected = detectElementType(parsed);
  
  switch (detected) {
    case 'text':
      return 'text';
    case 'button':
      return 'button';
    case 'image':
      return 'image';
    case 'input':
      return 'input';
    case 'link':
      return 'button'; // Treat links as buttons for now
    default:
      return 'container';
  }
}

/**
 * Extract element-specific props
 */
function extractElementProps(parsed: ParsedElement, type: ElementType): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  
  switch (type) {
    case 'text':
      props.content = parsed.textContent || 'Text';
      props.tag = getTextTag(parsed.tagName);
      break;
    case 'button':
      props.text = parsed.textContent || 'Button';
      break;
    case 'image':
      props.src = parsed.attributes.src || '';
      props.alt = parsed.attributes.alt || '';
      break;
    case 'input':
      props.inputType = parsed.attributes.type || 'text';
      props.placeholder = parsed.attributes.placeholder || '';
      break;
  }
  
  return props;
}

/**
 * Get text tag from HTML tag name
 */
function getTextTag(tagName: string): 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' {
  const validTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'];
  return validTags.includes(tagName) ? tagName as 'p' : 'p';
}

export interface MappedElement {
  element: Element;
  originalClasses: string[];
  originalId: string;
  depth: number;
}

export interface ImportResult {
  elements: Record<string, Element>;
  rootElementIds: string[];
  stats: {
    totalImported: number;
    byType: Record<ElementType, number>;
    skipped: number;
  };
}

/**
 * Convert parsed elements to canvas elements
 */
export function mapParsedToCanvas(
  parsedElements: ParsedElement[],
  extractedStyles: ExtractedStyles,
  parentId: string | null = null
): ImportResult {
  const elements: Record<string, Element> = {};
  const rootElementIds: string[] = [];
  const stats = {
    totalImported: 0,
    byType: {} as Record<ElementType, number>,
    skipped: 0,
  };
  
  function processElement(parsed: ParsedElement, depth: number): string | null {
    // Skip elements that are too deep or have no content
    if (depth > 20) {
      stats.skipped++;
      return null;
    }
    
    const type = mapElementType(parsed);
    const id = generateElementId();
    
    // Compute styles
    const computedCSS = computeElementStyles(
      {
        tagName: parsed.tagName,
        id: parsed.id,
        classNames: parsed.classNames,
        inlineStyles: parsed.inlineStyles,
      },
      extractedStyles
    );
    
    // Convert to StyleProperties
    const style = cssToStyleProperties(computedCSS, extractedStyles.variables);
    
    // Determine display mode from CSS - use 'relative' for flow elements
    // Imported HTML elements should use document flow (position: relative)
    // Unless explicitly set to absolute/fixed in CSS
    const canvasStyle: StyleProperties = {
      position: style.position || 'relative',
      display: style.display || 'block',
      // Pass all CSS values directly - StyleProperties now supports string | number
      ...style,
    };
    
    // Process children first
    const childIds: string[] = [];
    parsed.children.forEach((child) => {
      const childId = processElement(child, depth + 1);
      if (childId) {
        childIds.push(childId);
      }
    });
    
    // Extract props
    const props = extractElementProps(parsed, type);
    
    // Create canvas element
    const element = {
      id,
      type,
      name: getElementName(parsed, type),
      style: canvasStyle,
      props,
      children: childIds,
      parentId: null,
      locked: false,
    } as Element;
    
    elements[id] = element;
    stats.totalImported++;
    stats.byType[type] = (stats.byType[type] || 0) + 1;
    
    return id;
  }
  
  // Process all root elements
  parsedElements.forEach((parsed) => {
    const id = processElement(parsed, 0);
    if (id) {
      rootElementIds.push(id);
    }
  });
  
  // Set parent IDs
  Object.values(elements).forEach((el) => {
    el.children.forEach((childId) => {
      if (elements[childId]) {
        elements[childId].parentId = el.id;
      }
    });
  });
  
  return {
    elements,
    rootElementIds,
    stats,
  };
}

/**
 * Generate a readable name for the element
 */
function getElementName(parsed: ParsedElement, type: ElementType): string {
  // Use class name if available
  if (parsed.classNames.length > 0) {
    const mainClass = parsed.classNames[0]
      .replace(/^ncd-/, '') // Remove prefix
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return mainClass;
  }
  
  // Use ID if available
  if (parsed.id) {
    return parsed.id
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  
  // Use tag name
  const typeNames: Record<ElementType, string> = {
    container: 'Container',
    text: 'Text',
    button: 'Button',
    image: 'Image',
    input: 'Input',
  };
  
  return typeNames[type] || 'Element';
}

/**
 * Import HTML string directly to canvas elements
 */
export function importHTML(
  html: string,
  css: string = ''
): ImportResult {
  // This will be called from the import system
  // For now, return empty result - full implementation uses parseHTML + parseCSS
  const { parseHTML } = require('./html-parser');
  const { parseCSS } = require('./css-extractor');
  
  const parsedDoc = parseHTML(html);
  
  // Combine all CSS sources
  let allCSS = css;
  parsedDoc.styleTags.forEach((styleContent: string) => {
    allCSS += '\n' + styleContent;
  });
  
  const extractedStyles = parseCSS(allCSS);
  
  return mapParsedToCanvas(parsedDoc.elements, extractedStyles);
}
