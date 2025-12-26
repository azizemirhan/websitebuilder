/**
 * Clipboard Store - Copy/Paste functionality
 */

import { create } from 'zustand';
import type { Element } from '../types';

interface ClipboardStore {
  copiedElements: Element[];
  
  copyElements: (elements: Element[]) => void;
  clearClipboard: () => void;
  hasClipboard: () => boolean;
}

export const useClipboardStore = create<ClipboardStore>((set, get) => ({
  copiedElements: [],
  
  copyElements: (elements) => {
    // Deep clone elements for clipboard
    const cloned = elements.map((el) => ({
      ...el,
      style: { ...el.style },
      props: el.props ? { ...el.props } : undefined,
      children: [...el.children],
    }));
    set({ copiedElements: cloned as Element[] });
  },
  
  clearClipboard: () => set({ copiedElements: [] }),
  
  hasClipboard: () => get().copiedElements.length > 0,
}));
