/**
 * Code Generator - Convert canvas elements to HTML/CSS/React code
 */

import type { Element, StyleProperties } from '../types';

// Style property to CSS property mapping (partial - not all properties need mapping)
const styleToCss: Partial<Record<keyof StyleProperties, string>> = {
  width: 'width',
  height: 'height',
  backgroundColor: 'background-color',
  color: 'color',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  fontFamily: 'font-family',
  padding: 'padding',
  margin: 'margin',
  borderRadius: 'border-radius',
  borderWidth: 'border-width',
  borderColor: 'border-color',
  borderStyle: 'border-style',
  position: 'position',
  top: 'top',
  left: 'left',
  right: 'right',
  bottom: 'bottom',
  display: 'display',
  flexDirection: 'flex-direction',
  justifyContent: 'justify-content',
  alignItems: 'align-items',
  gap: 'gap',
  flexWrap: 'flex-wrap',
  gridTemplateColumns: 'grid-template-columns',
  gridTemplateRows: 'grid-template-rows',
  zIndex: 'z-index',
  opacity: 'opacity',
  overflow: 'overflow',
  textAlign: 'text-align',
  lineHeight: 'line-height',
  boxShadow: 'box-shadow',
  cursor: 'cursor',
  // Extended properties
  flexGrow: 'flex-grow',
  flexShrink: 'flex-shrink',
  flexBasis: 'flex-basis',
  alignSelf: 'align-self',
  order: 'order',
  alignContent: 'align-content',
  columnGap: 'column-gap',
  rowGap: 'row-gap',
  gridAutoFlow: 'grid-auto-flow',
  gridColumn: 'grid-column',
  gridRow: 'grid-row',
  minWidth: 'min-width',
  maxWidth: 'max-width',
  minHeight: 'min-height',
  maxHeight: 'max-height',
  borderTopLeftRadius: 'border-top-left-radius',
  borderTopRightRadius: 'border-top-right-radius',
  borderBottomRightRadius: 'border-bottom-right-radius',
  borderBottomLeftRadius: 'border-bottom-left-radius',
  borderTopWidth: 'border-top-width',
  borderRightWidth: 'border-right-width',
  borderBottomWidth: 'border-bottom-width',
  borderLeftWidth: 'border-left-width',
  borderTopColor: 'border-top-color',
  borderRightColor: 'border-right-color',
  borderBottomColor: 'border-bottom-color',
  borderLeftColor: 'border-left-color',
  background: 'background',
  backgroundImage: 'background-image',
  backgroundSize: 'background-size',
  backgroundPosition: 'background-position',
  backgroundRepeat: 'background-repeat',
  filter: 'filter',
  backdropFilter: 'backdrop-filter',
  mixBlendMode: 'mix-blend-mode',
  transform: 'transform',
  transformOrigin: 'transform-origin',
  transition: 'transition',
  letterSpacing: 'letter-spacing',
  wordSpacing: 'word-spacing',
  textDecoration: 'text-decoration',
  textTransform: 'text-transform',
  textShadow: 'text-shadow',
  whiteSpace: 'white-space',
};

// Icon SVG paths for code generation
const ICON_SVG_PATHS: Record<string, string> = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  cart: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  'arrow-left': '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
  'chevron-up': '<polyline points="18 15 12 9 6 15"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
};

// Generate SVG string for an icon
const generateIconSVG = (iconName: string, strokeWidth: number = 2): string => {
  const path = ICON_SVG_PATHS[iconName] || ICON_SVG_PATHS['star'];
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%">${path}</svg>`;
};

// Convert style value to CSS string
const formatStyleValue = (key: keyof StyleProperties, value: unknown): string => {
  if (value === undefined || value === null) return '';

  // Add px to numeric values where appropriate
  const numericProps = ['width', 'height', 'top', 'left', 'right', 'bottom', 'padding',
    'margin', 'fontSize', 'borderRadius', 'borderWidth', 'gap', 'letterSpacing',
    'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'borderTopWidth', 'borderRightWidth',
    'borderBottomWidth', 'borderLeftWidth', 'borderTopLeftRadius', 'borderTopRightRadius',
    'borderBottomRightRadius', 'borderBottomLeftRadius'];

  if (typeof value === 'number' && numericProps.includes(key)) {
    return `${value}px`;
  }

  return String(value);
};

// Generate inline CSS string from style properties
export const generateInlineCSS = (style: StyleProperties): string => {
  const cssLines: string[] = [];

  Object.entries(style).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const cssKey = styleToCss[key as keyof StyleProperties];
    if (cssKey) {
      const formattedValue = formatStyleValue(key as keyof StyleProperties, value);
      if (formattedValue) {
        cssLines.push(`${cssKey}: ${formattedValue};`);
      }
    }
  });

  return cssLines.join(' ');
};

// Generate CSS class from style properties
export const generateCSSClass = (className: string, style: StyleProperties, indent = ''): string => {
  const cssLines: string[] = [];

  Object.entries(style).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const cssKey = styleToCss[key as keyof StyleProperties];
    if (cssKey) {
      const formattedValue = formatStyleValue(key as keyof StyleProperties, value);
      if (formattedValue) {
        cssLines.push(`${indent}  ${cssKey}: ${formattedValue};`);
      }
    }
  });

  return `${indent}.${className} {\n${cssLines.join('\n')}\n${indent}}`;
};

// Generate HTML from element tree
export const generateHTML = (
  element: Element,
  elements: Record<string, Element>,
  options: { useClasses?: boolean; indent?: number } = {}
): string => {
  const { useClasses = false, indent = 0 } = options;
  const indentStr = '  '.repeat(indent);
  const className = `element-${element.id.slice(0, 8)}`;

  let tag = 'div';
  let attributes = '';
  let content = '';

  // Determine tag and attributes based on element type
  switch (element.type) {
    case 'text':
      tag = 'p';
      content = (element.props as { content?: string })?.content || 'Text';
      break;
    case 'button':
      tag = 'button';
      content = (element.props as { text?: string })?.text || 'Button';
      break;
    case 'image':
      tag = 'img';
      attributes = ` src="${element.props?.src || '/placeholder.jpg'}" alt="${element.props?.alt || 'Image'}"`;
      break;
    case 'input':
      tag = 'input';
      attributes = ` type="${element.props?.inputType || 'text'}" placeholder="${element.props?.placeholder || ''}"`;
      break;
    case 'icon':
      // Generate inline SVG for icons
      const iconName = element.props?.iconName || 'star';
      const strokeWidth = element.props?.strokeWidth || 2;
      const svgContent = generateIconSVG(iconName, strokeWidth);
      const iconInlineStyle = generateInlineCSS(element.style);
      return `${indentStr}<div style="${iconInlineStyle}">${svgContent}</div>`;
    case 'container':
    default:
      tag = 'div';
      break;
  }

  // Add class or inline style
  if (useClasses) {
    attributes += ` class="${className}"`;
  } else {
    const inlineStyle = generateInlineCSS(element.style);
    if (inlineStyle) {
      attributes += ` style="${inlineStyle}"`;
    }
  }

  // Self-closing tags
  if (['img', 'input'].includes(tag)) {
    return `${indentStr}<${tag}${attributes} />`;
  }

  // Generate children HTML
  const childrenHTML = element.children
    .map(childId => elements[childId])
    .filter(Boolean)
    .map(child => generateHTML(child, elements, { useClasses, indent: indent + 1 }))
    .join('\n');

  if (childrenHTML) {
    return `${indentStr}<${tag}${attributes}>\n${childrenHTML}\n${indentStr}</${tag}>`;
  } else if (content) {
    return `${indentStr}<${tag}${attributes}>${content}</${tag}>`;
  } else {
    return `${indentStr}<${tag}${attributes}></${tag}>`;
  }
};

// Generate complete HTML document
export const generateHTMLDocument = (
  elements: Record<string, Element>,
  rootIds: string[],
  options: { title?: string; useClasses?: boolean } = {}
): { html: string; css: string } => {
  const { title = 'Exported Page', useClasses = true } = options;

  // Generate CSS if using classes
  let css = '';
  if (useClasses) {
    const cssBlocks: string[] = [];

    const generateElementCSS = (element: Element) => {
      const className = `element-${element.id.slice(0, 8)}`;
      cssBlocks.push(generateCSSClass(className, element.style));
      element.children.forEach(childId => {
        const child = elements[childId];
        if (child) generateElementCSS(child);
      });
    };

    rootIds.forEach(id => {
      const element = elements[id];
      if (element) generateElementCSS(element);
    });

    css = cssBlocks.join('\n\n');
  }

  // Generate body HTML
  const bodyContent = rootIds
    .map(id => elements[id])
    .filter(Boolean)
    .map(el => generateHTML(el, elements, { useClasses, indent: 2 }))
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${useClasses ? '<link rel="stylesheet" href="styles.css">' : ''}
</head>
<body>
${bodyContent}
</body>
</html>`;

  return { html, css };
};

// Generate React component
export const generateReactComponent = (
  element: Element,
  elements: Record<string, Element>,
  componentName: string = 'MyComponent'
): string => {
  const indent = '  ';

  // Collect all unique class names
  const classNames = new Set<string>();
  const collectClassNames = (el: Element) => {
    classNames.add(`element-${el.id.slice(0, 8)}`);
    el.children.forEach(childId => {
      const child = elements[childId];
      if (child) collectClassNames(child);
    });
  };
  collectClassNames(element);

  // Generate JSX
  const generateJSX = (el: Element, indentLevel: number): string => {
    const ind = indent.repeat(indentLevel);
    const className = `element-${el.id.slice(0, 8)}`;

    let tag = 'div';
    let props = `className={styles.${className.replace(/-/g, '_')}}`;
    let content = '';

    switch (el.type) {
      case 'text':
        tag = 'p';
        content = (el.props as { content?: string })?.content || 'Text';
        break;
      case 'button':
        tag = 'button';
        content = (el.props as { text?: string })?.text || 'Button';
        break;
      case 'image':
        tag = 'img';
        props += ` src="${el.props?.src || '/placeholder.jpg'}" alt="${el.props?.alt || 'Image'}"`;
        break;
      case 'input':
        tag = 'input';
        props += ` type="${el.props?.inputType || 'text'}" placeholder="${el.props?.placeholder || ''}"`;
        break;
      case 'icon':
        // For React, we'd ideally use a React icon component
        // For now, embed SVG directly
        const iconName = el.props?.iconName || 'star';
        const strokeWidth = el.props?.strokeWidth || 2;
        return `${ind}<div ${props} dangerouslySetInnerHTML={{__html: \`${generateIconSVG(iconName, strokeWidth)}\`}} />`;
    }

    if (['img', 'input'].includes(tag)) {
      return `${ind}<${tag} ${props} />`;
    }

    const childrenJSX = el.children
      .map(childId => elements[childId])
      .filter(Boolean)
      .map(child => generateJSX(child, indentLevel + 1))
      .join('\n');

    if (childrenJSX) {
      return `${ind}<${tag} ${props}>\n${childrenJSX}\n${ind}</${tag}>`;
    } else if (content) {
      return `${ind}<${tag} ${props}>{${JSON.stringify(content)}}</${tag}>`;
    } else {
      return `${ind}<${tag} ${props} />`;
    }
  };

  // Generate CSS module
  const cssModule: string[] = [];
  const generateCSSModule = (el: Element) => {
    const className = `element-${el.id.slice(0, 8)}`.replace(/-/g, '_');
    cssModule.push(generateCSSClass(className, el.style));
    el.children.forEach(childId => {
      const child = elements[childId];
      if (child) generateCSSModule(child);
    });
  };
  generateCSSModule(element);

  const jsx = generateJSX(element, 2);

  return `import React from 'react';
import styles from './${componentName}.module.css';

export const ${componentName} = () => {
  return (
${jsx}
  );
};

export default ${componentName};

/* === ${componentName}.module.css === */
/*
${cssModule.join('\n\n')}
*/`;
};

// Export utilities
export const downloadFile = (content: string, filename: string, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadZip = async (files: { name: string; content: string }[]) => {
  // Simple implementation without external deps - creates a basic download
  // For production, use JSZip library
  files.forEach(file => {
    downloadFile(file.content, file.name);
  });
};
