/**
 * Template Kit Types - JSON schema for reusable template kits
 */

import type { Element } from '../types/element';

/**
 * Template Kit - A collection of reusable sections
 */
export interface TemplateKit {
  id: string;
  name: string;
  description?: string;
  version: string;
  author?: string;
  category: TemplateCategory;
  tags?: string[];
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  sections: TemplateSection[];
}

export type TemplateCategory = 
  | 'ecommerce' 
  | 'landing' 
  | 'portfolio' 
  | 'blog' 
  | 'business'
  | 'agency'
  | 'saas'
  | 'other';

/**
 * Template Section - A single importable section (e.g., Hero, Header, Footer)
 */
export interface TemplateSection {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  sectionType: SectionType;
  elements: Record<string, Element>;
  rootElementIds: string[];
}

export type SectionType =
  | 'header'
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'cta'
  | 'footer'
  | 'gallery'
  | 'contact'
  | 'about'
  | 'team'
  | 'faq'
  | 'blog'
  | 'products'
  | 'custom';

/**
 * Template metadata for store listing
 */
export interface TemplateMetadata {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  thumbnail?: string;
  sectionCount: number;
  tags?: string[];
  author?: string;
}

/**
 * Conversion result from HTML to Template Kit
 */
export interface ConversionResult {
  success: boolean;
  templateKit?: TemplateKit;
  errors: string[];
  warnings: string[];
  stats: {
    totalElements: number;
    sections: number;
    skipped: number;
  };
}

/**
 * Generate unique template ID
 */
export function generateTemplateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique section ID
 */
export function generateSectionId(): string {
  return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create empty template kit
 */
export function createEmptyTemplateKit(name: string, category: TemplateCategory = 'other'): TemplateKit {
  const now = new Date().toISOString();
  return {
    id: generateTemplateId(),
    name,
    version: '1.0.0',
    category,
    createdAt: now,
    updatedAt: now,
    sections: [],
  };
}

/**
 * Detect section type from element name/class
 */
export function detectSectionType(name: string, classNames: string[] = []): SectionType {
  const lowerName = name.toLowerCase();
  const classStr = classNames.join(' ').toLowerCase();
  
  if (lowerName.includes('header') || classStr.includes('header')) return 'header';
  if (lowerName.includes('hero') || classStr.includes('hero')) return 'hero';
  if (lowerName.includes('footer') || classStr.includes('footer')) return 'footer';
  if (lowerName.includes('feature') || classStr.includes('feature')) return 'features';
  if (lowerName.includes('testimonial') || classStr.includes('testimonial')) return 'testimonials';
  if (lowerName.includes('pricing') || classStr.includes('pricing')) return 'pricing';
  if (lowerName.includes('cta') || classStr.includes('cta')) return 'cta';
  if (lowerName.includes('gallery') || classStr.includes('gallery')) return 'gallery';
  if (lowerName.includes('contact') || classStr.includes('contact')) return 'contact';
  if (lowerName.includes('about') || classStr.includes('about')) return 'about';
  if (lowerName.includes('team') || classStr.includes('team')) return 'team';
  if (lowerName.includes('faq') || classStr.includes('faq')) return 'faq';
  if (lowerName.includes('blog') || classStr.includes('blog')) return 'blog';
  if (lowerName.includes('product') || classStr.includes('product')) return 'products';
  
  return 'custom';
}
