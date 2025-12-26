/**
 * Element Templates - Pre-built element configurations
 */

import type { ElementType, StyleProperties } from '../types';

export interface ElementTemplate {
  id: string;
  name: string;
  category: 'layout' | 'content' | 'form' | 'media';
  type: ElementType;
  style: Partial<StyleProperties>;
  props?: Record<string, unknown>;
  icon?: string;
}

export const elementTemplates: ElementTemplate[] = [
  // Layout
  {
    id: 'container-default',
    name: 'Container',
    category: 'layout',
    type: 'container',
    style: { width: 300, height: 200, backgroundColor: '#f3f4f6', borderRadius: 8 },
  },
  {
    id: 'container-card',
    name: 'Card',
    category: 'layout',
    type: 'container',
    style: { 
      width: 320, 
      height: 200, 
      backgroundColor: '#ffffff', 
      borderRadius: 12,
    },
  },
  {
    id: 'container-section',
    name: 'Section',
    category: 'layout',
    type: 'container',
    style: { 
      width: 800, 
      height: 400, 
      backgroundColor: '#f9fafb',
    },
  },
  
  // Content
  {
    id: 'text-heading',
    name: 'Heading',
    category: 'content',
    type: 'text',
    style: { fontSize: 32, fontWeight: 700, color: '#111827' },
    props: { content: 'Heading', tag: 'h1' },
  },
  {
    id: 'text-subheading',
    name: 'Subheading',
    category: 'content',
    type: 'text',
    style: { fontSize: 20, fontWeight: 600, color: '#374151' },
    props: { content: 'Subheading', tag: 'h2' },
  },
  {
    id: 'text-paragraph',
    name: 'Paragraph',
    category: 'content',
    type: 'text',
    style: { fontSize: 16, color: '#4b5563' },
    props: { content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', tag: 'p' },
  },
  
  // Form
  {
    id: 'button-primary',
    name: 'Primary Button',
    category: 'form',
    type: 'button',
    style: { 
      backgroundColor: '#3b82f6', 
      color: '#ffffff', 
      borderRadius: 8,
      fontWeight: 600,
      width: 120,
      height: 44,
    },
    props: { text: 'Click Me' },
  },
  {
    id: 'button-secondary',
    name: 'Secondary Button',
    category: 'form',
    type: 'button',
    style: { 
      backgroundColor: '#ffffff', 
      color: '#374151', 
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      width: 120,
      height: 44,
    },
    props: { text: 'Learn More' },
  },
  {
    id: 'input-text',
    name: 'Text Input',
    category: 'form',
    type: 'input',
    style: { 
      width: 280, 
      height: 44, 
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    props: { placeholder: 'Enter text...', inputType: 'text' },
  },
  
  // Media
  {
    id: 'image-placeholder',
    name: 'Image',
    category: 'media',
    type: 'image',
    style: { 
      width: 300, 
      height: 200, 
      borderRadius: 8,
    },
    props: { src: '', alt: 'Image' },
  },
];

export const getTemplatesByCategory = (category: string): ElementTemplate[] => {
  return elementTemplates.filter((t) => t.category === category);
};

export const getTemplateById = (id: string): ElementTemplate | undefined => {
  return elementTemplates.find((t) => t.id === id);
};
