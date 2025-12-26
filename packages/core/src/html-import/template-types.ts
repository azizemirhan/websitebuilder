/**
 * Template Types - Schema for HTML templates
 */

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'color' | 'image' | 'number';
  defaultValue: string;
  description?: string;
}

export interface SectionDefinition {
  id: string;
  name: string;
  selector: string;
  type: 'header' | 'hero' | 'features' | 'products' | 'testimonials' | 'cta' | 'footer' | 'custom';
  editable: boolean;
  variables?: TemplateVariable[];
}

export interface TemplateFiles {
  html: string;
  css: string;
  js?: string;
  assets?: string[];
}

export interface TemplateSchema {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category: 'ecommerce' | 'landing' | 'portfolio' | 'blog' | 'business' | 'other';
  tags: string[];
  author?: string;
  version?: string;
  createdAt: string;
  updatedAt: string;
  files: TemplateFiles;
  sections: SectionDefinition[];
  variables: TemplateVariable[];
}

export interface TemplatePreview {
  id: string;
  name: string;
  thumbnail?: string;
  category: TemplateSchema['category'];
  tags: string[];
}

// Built-in templates metadata
export const TEMPLATE_CATEGORIES = [
  { id: 'ecommerce', name: 'E-Ticaret', icon: '🛒' },
  { id: 'landing', name: 'Landing Page', icon: '🚀' },
  { id: 'portfolio', name: 'Portfolyo', icon: '🎨' },
  { id: 'blog', name: 'Blog', icon: '📝' },
  { id: 'business', name: 'Kurumsal', icon: '🏢' },
  { id: 'other', name: 'Diğer', icon: '📄' },
] as const;
