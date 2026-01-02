/**
 * Pre-built Templates - Ready-to-use templates that can be imported directly
 */

import type { TemplateKit } from '../template-kit';

/**
 * All pre-built templates (empty - templates were removed)
 */
export const prebuiltTemplates: TemplateKit[] = [];

/**
 * Get a pre-built template by ID
 */
export function getPrebuiltTemplate(id: string): TemplateKit | undefined {
    return prebuiltTemplates.find(t => t.id === id);
}

/**
 * Get all pre-built templates
 */
export function getAllPrebuiltTemplates(): TemplateKit[] {
    return prebuiltTemplates;
}
