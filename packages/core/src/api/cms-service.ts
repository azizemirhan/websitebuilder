// import axios from 'axios';
import { useCanvasStore } from '../store/canvas-store';
import { useBehaviorStore } from '../store/behavior-store';
import { generateHTMLDocument } from '../utils/code-generator';


const API_BASE_URL = (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_API_URL : undefined) || 'http://localhost:8000/api';
const USE_MOCK = false; // Real API enabled

// Page type definition
export interface Page {
  id: number;
  title: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  thumbnail?: string;
  editor_data?: any;
  compiled_html?: any;
  editor_assets?: any;
}

// Menu type definitions
export interface MenuItem {
  id: number;
  menu_id: number;
  parent_id: number | null;
  title: string;
  url: string | null;
  target: '_self' | '_blank';
  icon?: string | null;
  order_index: number;
  is_active?: boolean;
  children?: MenuItem[];
}

export interface Menu {
  id: number;
  name: string;
  location: string | null;
  created_at: string;
  updated_at: string;
  items?: MenuItem[];
}

// Mock pages storage (in-memory for now)
let mockPages: Page[] = [
  {
    id: 1,
    title: 'Ana Sayfa',
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    editor_data: { elements: {}, rootElementIds: [] },
  },
  {
    id: 2,
    title: 'Hakkımızda',
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    editor_data: { elements: {}, rootElementIds: [] },
  },
  {
    id: 3,
    title: 'İletişim',
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    editor_data: { elements: {}, rootElementIds: [] },
  },
];

let nextPageId = 4;

export const cmsService = {
  /**
   * List all pages
   */
  listPages: async (): Promise<Page[]> => {
    if (USE_MOCK) {
      console.log('[Mock] Listing all pages...');
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...mockPages];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/builder/pages`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Failed to list pages:', error);
      throw error;
    }
  },

  /**
   * Create a new page
   */
  createPage: async (title: string, template?: string): Promise<Page> => {
    if (USE_MOCK) {
      console.log(`[Mock] Creating page: ${title}`);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newPage: Page = {
        id: nextPageId++,
        title,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        editor_data: { elements: {}, rootElementIds: [] },
      };
      
      mockPages.push(newPage);
      return newPage;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/builder/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, template }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Failed to create page:', error);
      throw error;
    }
  },

  /**
   * Delete a page
   */
  deletePage: async (pageId: number): Promise<void> => {
    if (USE_MOCK) {
      console.log(`[Mock] Deleting page ${pageId}...`);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      mockPages = mockPages.filter(p => p.id !== pageId);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/builder/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Network response was not ok');
    } catch (error) {
      console.error('Failed to delete page:', error);
      throw error;
    }
  },

  /**
    * Load a page from the CMS
    */
  loadPage: async (pageId: string | number) => {
    if (USE_MOCK) {
        console.log(`[Mock] Loading page ${pageId}...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const page = mockPages.find(p => p.id === Number(pageId));
        if (page) {
          return page;
        }
        
        return {
            id: pageId,
            title: 'Mock Page',
            editor_data: { elements: {}, rootElementIds: [] },
            editor_assets: { css: '', js: '' }
        };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/builder/pages/${pageId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Failed to load page:', error);
      throw error;
    }
  },

  /**
    * Save the current editor state to the CMS
    */
  savePage: async (pageId: string | number) => {
    try {
      // 1. Get State
      const elements = useCanvasStore.getState().elements;
      const rootElementIds = useCanvasStore.getState().rootElementIds;

      const editorData = {
        elements,
        rootElementIds
      };

      // 2. Generate HTML
      const compiledHtml = generateHTMLDocument(elements, rootElementIds, { 
        // options
      });

      // 3. Prepare Payload
      const payload = {
        editor_data: editorData,
        compiled_html: compiledHtml,
        editor_assets: {
             css: '', // If we have separate CSS generation
             js: ''
        },
        editor_mode: 'website_builder',
        updated_at: new Date().toISOString(),
      };

      if (USE_MOCK) {
          console.log(`[Mock] Saving page ${pageId}...`);
          console.log('[Mock] Payload:', payload);
          await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
          
          // Update mock page
          const pageIdNum = Number(pageId);
          console.log('[Mock] Looking for page ID:', pageIdNum, 'Type:', typeof pageIdNum);
          const pageIndex = mockPages.findIndex(p => p.id === pageIdNum);
          console.log('[Mock] Found page at index:', pageIndex);
          
          if (pageIndex !== -1) {
            console.log('[Mock] Updating page at index', pageIndex);
            console.log('[Mock] Before update:', mockPages[pageIndex]);
            mockPages[pageIndex] = {
              ...mockPages[pageIndex],
              editor_data: editorData,
              compiled_html: compiledHtml,
              updated_at: new Date().toISOString(),
            };
            console.log('[Mock] After update:', mockPages[pageIndex]);
          } else {
            console.warn('[Mock] Page not found in mockPages array!');
          }
          
          return { message: 'Mock save successful', id: pageId };
      }

      // 4. Send
      const response = await fetch(`${API_BASE_URL}/builder/pages/${pageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Failed to save page:', error);
      throw error;
    }
  },

  /**
   * List all menus
   */
  listMenus: async (): Promise<Menu[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/builder/menus`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Failed to list menus:', error);
      throw error;
    }
  },

  /**
   * Get a menu with its items
   */
  getMenuWithItems: async (menuId: number): Promise<Menu> => {
    try {
      const response = await fetch(`${API_BASE_URL}/builder/menus/${menuId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Failed to get menu:', error);
      throw error;
    }
  }
};

