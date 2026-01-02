/**
 * Template Converter - Convert HTML/CSS to Template Kit JSON
 */

import { parseHTML, type ParsedElement, type ParsedDocument, detectElementType } from '../html-import/html-parser';
import { parseCSS, computeElementStyles, resolveVariables, type ExtractedStyles } from '../html-import/css-extractor';
import type { Element, StyleProperties, ElementType } from '../types/element';
import {
  type TemplateKit,
  type TemplateSection,
  type ConversionResult,
  createEmptyTemplateKit,
  generateSectionId,
  detectSectionType,
} from './template-kit';

function generateElementId(): string {
  return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface ConverterOptions {
  name: string;
  category?: 'ecommerce' | 'landing' | 'portfolio' | 'blog' | 'business' | 'agency' | 'saas' | 'other';
  splitSections?: boolean;
}

/**
 * Convert HTML + CSS to a Template Kit
 */
export function convertToTemplateKit(
  html: string,
  css: string = '',
  options: ConverterOptions
): ConversionResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let totalElements = 0;
  let skippedElements = 0;

  try {
    // Parse HTML - returns ParsedDocument
    const parsedDoc = parseHTML(html);
    if (parsedDoc.elements.length === 0) {
      return {
        success: false,
        errors: ['No elements found in HTML'],
        warnings: [],
        stats: { totalElements: 0, sections: 0, skipped: 0 },
      };
    }

    // Combine CSS from parsed doc and provided CSS
    let fullCSS = css;
    if (parsedDoc.styleTags.length > 0) {
      fullCSS = parsedDoc.styleTags.join('\n') + '\n' + css;
    }

    // Extract CSS rules
    const extractedStyles = parseCSS(fullCSS);

    // Create template kit
    const templateKit = createEmptyTemplateKit(options.name, options.category || 'other');

    // Process elements into sections
    if (options.splitSections) {
      // Each top-level element becomes a section
      parsedDoc.elements.forEach((parsed, index) => {
        const section = processSection(parsed, extractedStyles, index);
        if (section) {
          templateKit.sections.push(section);
          totalElements += Object.keys(section.elements).length;
        }
      });
    } else {
      // All elements in one section
      const allElements: Record<string, Element> = {};
      const rootIds: string[] = [];

      parsedDoc.elements.forEach((parsed) => {
        const result = processElement(parsed, extractedStyles, null, allElements, []);
        if (result) {
          rootIds.push(result);
        }
      });
      totalElements = Object.keys(allElements).length;

      if (rootIds.length > 0) {
        templateKit.sections.push({
          id: generateSectionId(),
          name: 'Main Section',
          sectionType: 'custom',
          elements: allElements,
          rootElementIds: rootIds,
        });
      }
    }

    return {
      success: true,
      templateKit,
      errors,
      warnings,
      stats: {
        totalElements,
        sections: templateKit.sections.length,
        skipped: skippedElements,
      },
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Conversion failed: ${error}`],
      warnings,
      stats: { totalElements, sections: 0, skipped: skippedElements },
    };
  }
}

/**
 * Process a top-level element into a section
 */
function processSection(
  parsed: ParsedElement,
  extractedStyles: ExtractedStyles,
  index: number
): TemplateSection | null {
  const elements: Record<string, Element> = {};
  const rootId = processElement(parsed, extractedStyles, null, elements, []);

  if (!rootId) return null;

  const sectionType = detectSectionType(parsed.tagName, parsed.classNames);
  const name = generateSectionName(parsed, sectionType, index);

  return {
    id: generateSectionId(),
    name,
    sectionType,
    elements,
    rootElementIds: [rootId],
  };
}

/**
 * Generate a readable section name
 */
function generateSectionName(parsed: ParsedElement, sectionType: string, index: number): string {
  if (parsed.classNames.length > 0) {
    const mainClass = parsed.classNames[0];
    return mainClass
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (sectionType !== 'custom') {
    return sectionType.charAt(0).toUpperCase() + sectionType.slice(1);
  }

  return `Section ${index + 1}`;
}

/**
 * Map element type from parsed HTML
 * Enhanced with CSS-based detection for better accuracy
 */
function mapElementType(parsed: ParsedElement, computedStyles?: Record<string, string>): ElementType {
  const detected = detectElementType(parsed);

  // Check CSS for layout hints
  if (computedStyles) {
    const display = computedStyles.display;
    const hasLayoutDisplay = display === 'flex' || display === 'grid' || display === 'inline-flex' || display === 'inline-grid';

    // If element has flex/grid display, it's definitely a container
    if (hasLayoutDisplay && detected !== 'image' && detected !== 'input') {
      return 'container';
    }
  }

  // If explicitly detected as 'link' (simple text link), map to 'text' for now.
  // Complex links (logos etc) are already detected as 'container' in the parser.
  if (detected === 'link') {
    // Better to map simple links to text than buttons, to avoid "Button" box styling
    return 'text';
  }

  return detected as ElementType;
}



// ... (other imports)

// ...

/**
 * Convert CSS properties to StyleProperties
 */
function cssToStyleProperties(
  cssProps: Record<string, string>,
  variables: Record<string, string>
): StyleProperties {
  const style: StyleProperties = {};

  // CSS property mappings - keys are camelCase (as returned by parseProperties)
  const mappings: Record<string, keyof StyleProperties> = {
    'width': 'width',
    'height': 'height',
    'minWidth': 'minWidth',
    'maxWidth': 'maxWidth',
    'minHeight': 'minHeight',
    'maxHeight': 'maxHeight',
    'backgroundColor': 'backgroundColor',
    'background': 'background',
    'backgroundImage': 'backgroundImage',
    'backgroundSize': 'backgroundSize',
    'backgroundPosition': 'backgroundPosition',
    'backgroundRepeat': 'backgroundRepeat',
    'color': 'color',
    'fontSize': 'fontSize',
    'fontWeight': 'fontWeight',
    'fontFamily': 'fontFamily',
    'fontStyle': 'fontStyle',
    'lineHeight': 'lineHeight',
    'letterSpacing': 'letterSpacing',
    'padding': 'padding',
    'paddingTop': 'paddingTop',
    'paddingRight': 'paddingRight',
    'paddingBottom': 'paddingBottom',
    'paddingLeft': 'paddingLeft',
    'margin': 'margin',
    'marginTop': 'marginTop',
    'marginRight': 'marginRight',
    'marginBottom': 'marginBottom',
    'marginLeft': 'marginLeft',
    'borderRadius': 'borderRadius',
    'borderTopLeftRadius': 'borderTopLeftRadius',
    'borderTopRightRadius': 'borderTopRightRadius',
    'borderBottomLeftRadius': 'borderBottomLeftRadius',
    'borderBottomRightRadius': 'borderBottomRightRadius',
    'display': 'display',
    'flexDirection': 'flexDirection',
    'justifyContent': 'justifyContent',
    'alignItems': 'alignItems',
    'gap': 'gap',
    'rowGap': 'rowGap',
    'columnGap': 'columnGap',
    'position': 'position',
    'top': 'top',
    'left': 'left',
    'right': 'right',
    'bottom': 'bottom',
    'zIndex': 'zIndex',
    'opacity': 'opacity',
    'boxShadow': 'boxShadow',
    'border': 'border',
    'borderWidth': 'borderWidth',
    'borderStyle': 'borderStyle',
    'borderColor': 'borderColor',
    'borderTop': 'borderTop',
    'borderRight': 'borderRight',
    'borderBottom': 'borderBottom',
    'borderLeft': 'borderLeft',
    'overflow': 'overflow',
    'overflowX': 'overflowX',
    'overflowY': 'overflowY',
    'textAlign': 'textAlign',
    'transform': 'transform',
    'transition': 'transition',
    'flex': 'flex',
    'flexWrap': 'flexWrap',
    'flexGrow': 'flexGrow',
    'flexShrink': 'flexShrink',
    'flexBasis': 'flexBasis',
    'alignSelf': 'alignSelf',
    'justifySelf': 'justifySelf',
    'objectFit': 'objectFit',
    'objectPosition': 'objectPosition',
    'cursor': 'cursor',
    'whiteSpace': 'whiteSpace',
    'textTransform': 'textTransform',
    'textDecoration': 'textDecoration',
    'boxSizing': 'boxSizing',
    'gridTemplateColumns': 'gridTemplateColumns',
    'gridTemplateRows': 'gridTemplateRows',
    'gridColumn': 'gridColumn',
    'gridRow': 'gridRow',
  };

  Object.entries(cssProps).forEach(([prop, value]) => {
    // Resolve CSS variables using the robust resolver from css-extractor
    const resolvedValue = resolveVariables(value, variables);

    const styleKey = mappings[prop];
    if (styleKey) {
      // Parse numeric values
      if (['width', 'height', 'top', 'left', 'right', 'bottom', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'].includes(styleKey)) {
        if (resolvedValue.endsWith('px')) {
          (style as any)[styleKey] = parseFloat(resolvedValue);
        } else {
          (style as any)[styleKey] = resolvedValue; // Keep %, auto, calc, variables etc.
        }
      } else if (prop === 'font-size' && resolvedValue.endsWith('px')) {
        style.fontSize = parseFloat(resolvedValue);
      } else if (prop === 'opacity') {
        style.opacity = parseFloat(resolvedValue);
      } else if (prop === 'z-index') {
        style.zIndex = parseInt(resolvedValue);
      } else {
        (style as any)[styleKey] = resolvedValue;
      }
    }
  });

  return style;
}

/**
 * Get deep text content from an element and its children
 */
function getDeepTextContent(parsed: ParsedElement): string {
  if (parsed.textContent) return parsed.textContent;

  let text = '';
  // Traverse children to find text
  parsed.children.forEach(child => {
    // If child is a text node (handled by parser as textContent on the child itself if it was a text node, but here children are elements)
    // The parser puts text nodes into textContent.
    // We need to recursively extract text from children elements (like span, b, i)
    text += getDeepTextContent(child) + ' ';
  });

  return text.trim();
}

/**
 * Extract element props based on type
 */
function extractElementProps(parsed: ParsedElement, type: ElementType): Record<string, any> {
  switch (type) {
    case 'text':
      return {
        content: getDeepTextContent(parsed) || 'Text',
        tag: parsed.tagName as any,
      };
    case 'button':
      // For buttons (and links mapped to buttons), get the full text content including children
      return {
        text: getDeepTextContent(parsed) || 'Button',
        variant: 'solid', // Default variant
      };
    case 'image':
      return {
        src: parsed.attributes.src || '',
        alt: parsed.attributes.alt || '',
      };
    case 'input':
      return {
        placeholder: parsed.attributes.placeholder || '',
        inputType: parsed.attributes.type || 'text',
      };
    default:
      return {};
  }
}

/**
 * Process a single element and its children
 */
function processElement(
  parsed: ParsedElement,
  extractedStyles: ExtractedStyles,
  parentId: string | null,
  elements: Record<string, Element>,
  parentChain: Array<{ tagName: string; id: string; classNames: string[] }>
): string | null {
  // Skip certain elements
  if (['script', 'style', 'meta', 'link', 'head'].includes(parsed.tagName.toLowerCase())) {
    return null;
  }

  const id = generateElementId();

  // Compute styles from CSS rules with parent chain support
  const computedCSS = computeElementStyles(
    {
      tagName: parsed.tagName,
      id: parsed.id,
      classNames: parsed.classNames,
      inlineStyles: parsed.inlineStyles,
    },
    extractedStyles,
    parentChain
  );

  // Determine element type with CSS-based hints
  const type = mapElementType(parsed, computedCSS);

  // Convert to StyleProperties
  const style = cssToStyleProperties(computedCSS, extractedStyles.variables);

  // Build canvas style with flow layout defaults
  // Set defaults BEFORE spreading style so CSS values take precedence
  const canvasStyle: StyleProperties = {
    // Defaults
    position: 'relative',
    display: 'block',
    boxSizing: 'border-box',
    // Spread actual styles - these will override defaults
    ...style,
  };

  // Create new parent chain for children (add current element)
  const newParentChain = [
    {
      tagName: parsed.tagName,
      id: parsed.id,
      classNames: parsed.classNames,
    },
    ...parentChain,
  ];

  // Process children with updated parent chain
  const childIds: string[] = [];
  parsed.children.forEach((child) => {
    const childId = processElement(child, extractedStyles, id, elements, newParentChain);
    if (childId) {
      childIds.push(childId);
    }
  });

  // Extract props
  const props = extractElementProps(parsed, type);

  // Create element name
  const name = getElementName(parsed, type);

  // Create element
  const element: Element = {
    id,
    type,
    name,
    style: canvasStyle,
    props,
    children: childIds,
    parentId,
  } as Element;

  elements[id] = element;
  return id;
}

/**
 * Generate element name
 */
function getElementName(parsed: ParsedElement, type: string): string {
  if (parsed.id) {
    return parsed.id.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  if (parsed.classNames.length > 0) {
    const name = parsed.classNames[0]
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return name.substring(0, 30);
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Export template kit to JSON string
 */
export function exportTemplateKitJSON(templateKit: TemplateKit): string {
  return JSON.stringify(templateKit, null, 2);
}

/**
 * Import template kit from JSON string
 */
export function importTemplateKitJSON(json: string): TemplateKit | null {
  try {
    return JSON.parse(json) as TemplateKit;
  } catch {
    return null;
  }
}
