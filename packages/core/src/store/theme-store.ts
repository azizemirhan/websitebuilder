/**
 * Theme Store - Dark mode and theme management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      resolvedTheme: 'light',
      
      setTheme: (theme) => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        set({ theme, resolvedTheme: resolved });
        
        // Apply to document
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', resolved);
          document.documentElement.classList.toggle('dark', resolved === 'dark');
        }
      },
      
      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next = current === 'light' ? 'dark' : 'light';
        set({ theme: next, resolvedTheme: next });
        
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', next);
          document.documentElement.classList.toggle('dark', next === 'dark');
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Color tokens for theming
export const themeColors = {
  light: {
    background: '#f3f4f6',
    surface: '#ffffff',
    surfaceHover: '#f9fafb',
    border: '#e5e7eb',
    borderActive: '#3b82f6',
    text: '#111827',
    textMuted: '#6b7280',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    success: '#10b981',
    warning: '#f59e0b',
  },
  dark: {
    background: '#111827',
    surface: '#1f2937',
    surfaceHover: '#374151',
    border: '#374151',
    borderActive: '#3b82f6',
    text: '#f9fafb',
    textMuted: '#9ca3af',
    primary: '#3b82f6',
    primaryHover: '#60a5fa',
    danger: '#ef4444',
    dangerHover: '#f87171',
    success: '#10b981',
    warning: '#f59e0b',
  },
};
