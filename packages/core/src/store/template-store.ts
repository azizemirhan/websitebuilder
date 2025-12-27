/**
 * Template Store - Manage loaded template kits
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TemplateKit, TemplateSection } from '../templates/template-kit';
import { prebuiltTemplates } from '../templates/prebuilt';

interface TemplateStoreState {
  templates: TemplateKit[];

  // Actions
  addTemplate: (template: TemplateKit) => void;
  removeTemplate: (templateId: string) => void;
  getTemplate: (templateId: string) => TemplateKit | undefined;
  getSection: (templateId: string, sectionId: string) => TemplateSection | undefined;
  getAllTemplates: () => TemplateKit[];
}

export const useTemplateStore = create<TemplateStoreState>()(
  persist(
    (set, get) => ({
      templates: [],

      addTemplate: (template) => {
        set((state) => {
          // Check if already exists
          const exists = state.templates.some((t) => t.id === template.id);
          if (exists) {
            return {
              templates: state.templates.map((t) =>
                t.id === template.id ? template : t
              ),
            };
          }
          return { templates: [...state.templates, template] };
        });
      },

      removeTemplate: (templateId) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== templateId),
        }));
      },

      getTemplate: (templateId) => {
        // Check prebuilt templates first
        const prebuilt = prebuiltTemplates.find((t) => t.id === templateId);
        if (prebuilt) return prebuilt;
        return get().templates.find((t) => t.id === templateId);
      },

      getSection: (templateId, sectionId) => {
        const template = get().getTemplate(templateId);
        return template?.sections.find((s) => s.id === sectionId);
      },

      getAllTemplates: () => {
        // Combine prebuilt templates with user-added templates
        return [...prebuiltTemplates, ...get().templates];
      },
    }),
    {
      name: 'builder-templates',
      partialize: (state) => ({ templates: state.templates }),
    }
  )
);
