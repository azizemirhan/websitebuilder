/**
 * History Types - Undo/Redo sistemi için
 */

import { CanvasState } from './element';

export interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

export type HistoryAction = 
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'ADD_TO_HISTORY'; state: CanvasState }
  | { type: 'CLEAR_HISTORY' };
