/**
 * Pre-built Templates - Ready-to-use templates that can be imported directly
 */

import type { TemplateKit } from '../template-kit';

// Import JSON templates
import announcementBarJson from './nextcommerce-announcement-bar.json';
import headerJson from './nextcommerce-header.json';
import heroJson from './nextcommerce-hero.json';

// Type assertion for JSON imports
export const nextcommerceAnnouncementBar = announcementBarJson as unknown as TemplateKit;
export const nextcommerceHeader = headerJson as unknown as TemplateKit;
export const nextcommerceHero = heroJson as unknown as TemplateKit;

/**
 * All pre-built templates
 */
export const prebuiltTemplates: TemplateKit[] = [
    nextcommerceAnnouncementBar,
    nextcommerceHeader,
    nextcommerceHero,
];

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
