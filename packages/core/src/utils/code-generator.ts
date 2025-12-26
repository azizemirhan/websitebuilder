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
