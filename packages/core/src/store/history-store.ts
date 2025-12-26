/**
 * History Store - Undo/Redo functionality
 */

import { create } from 'zustand';
import { CanvasState } from '../types';

interface HistoryStore {
  past: CanvasState[];
  future: CanvasState[];
  maxHistory: number;
  
  addToHistory: (state: CanvasState) => void;
  undo: (getCurrentState: () => CanvasState, applyState: (state: CanvasState) => void) => void;
  redo: (getCurrentState: () => CanvasState, applyState: (state: CanvasState) => void) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],
  maxHistory: MAX_HISTORY,

  addToHistory: (state) => {
    set((prev) => ({
      past: [...prev.past, state].slice(-MAX_HISTORY),
      future: [],
    }));
  },

  undo: (getCurrentState, applyState) => {
    const { past } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const currentState = getCurrentState();

    set((state) => ({
      past: newPast,
      future: [currentState, ...state.future].slice(0, MAX_HISTORY),
    }));

    applyState(previous);
  },

  redo: (getCurrentState, applyState) => {
    const { future } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const currentState = getCurrentState();

    set((state) => ({
      past: [...state.past, currentState].slice(-MAX_HISTORY),
      future: newFuture,
    }));

    applyState(next);
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  
  clearHistory: () => {
    set({
      past: [],
      future: [],
    });
  },
}));
