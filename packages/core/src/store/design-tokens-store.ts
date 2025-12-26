/**
 * Design Tokens Store - Color palette and typography presets
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ColorToken {
  id: string;
  name: string;
  value: string;
}

export interface TypographyToken {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
}

interface DesignTokensStore {
  colors: ColorToken[];
  typography: TypographyToken[];
  
  addColor: (name: string, value: string) => void;
  updateColor: (id: string, updates: Partial<ColorToken>) => void;
  removeColor: (id: string) => void;
  
  addTypography: (token: Omit<TypographyToken, 'id'>) => void;
  updateTypography: (id: string, updates: Partial<TypographyToken>) => void;
  removeTypography: (id: string) => void;
}

const DEFAULT_COLORS: ColorToken[] = [
  { id: 'c1', name: 'Primary', value: '#3b82f6' },
  { id: 'c2', name: 'Secondary', value: '#8b5cf6' },
  { id: 'c3', name: 'Success', value: '#10b981' },
  { id: 'c4', name: 'Warning', value: '#f59e0b' },
  { id: 'c5', name: 'Error', value: '#ef4444' },
  { id: 'c6', name: 'Gray 100', value: '#f3f4f6' },
  { id: 'c7', name: 'Gray 500', value: '#6b7280' },
  { id: 'c8', name: 'Gray 900', value: '#111827' },
];

const DEFAULT_TYPOGRAPHY: TypographyToken[] = [
  { id: 't1', name: 'Heading 1', fontFamily: 'Inter', fontSize: 48, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 },
  { id: 't2', name: 'Heading 2', fontFamily: 'Inter', fontSize: 36, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.3 },
  { id: 't3', name: 'Heading 3', fontFamily: 'Inter', fontSize: 24, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
  { id: 't4', name: 'Body Large', fontFamily: 'Inter', fontSize: 18, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0 },
  { id: 't5', name: 'Body', fontFamily: 'Inter', fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
  { id: 't6', name: 'Body Small', fontFamily: 'Inter', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
  { id: 't7', name: 'Caption', fontFamily: 'Inter', fontSize: 12, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0.2 },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useDesignTokensStore = create<DesignTokensStore>()(
  persist(
    (set) => ({
      colors: DEFAULT_COLORS,
      typography: DEFAULT_TYPOGRAPHY,

      addColor: (name, value) =>
        set((state) => ({
          colors: [...state.colors, { id: generateId(), name, value }],
        })),

      updateColor: (id, updates) =>
        set((state) => ({
          colors: state.colors.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      removeColor: (id) =>
        set((state) => ({
          colors: state.colors.filter((c) => c.id !== id),
        })),

      addTypography: (token) =>
        set((state) => ({
          typography: [...state.typography, { ...token, id: generateId() }],
        })),

      updateTypography: (id, updates) =>
        set((state) => ({
          typography: state.typography.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      removeTypography: (id) =>
        set((state) => ({
          typography: state.typography.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'design-tokens',
    }
  )
);
