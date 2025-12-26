/**
 * Align Panel - Alignment and distribution tools
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState } from '@builder/core';

export const AlignPanel = memo(function AlignPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElementStyle = useCanvasStore((state) => state.updateElementStyle);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const saveHistory = useCallback(() => {
    const state = useCanvasStore.getState();
    const snapshot: CanvasState = {
      elements: state.elements,
      rootElementIds: state.rootElementIds,
      selectedElementIds: state.selectedElementIds,
      hoveredElementId: state.hoveredElementId,
    };
    addToHistory(snapshot);
  }, [addToHistory]);

  const getSelectedElements = useCallback(() => {
    return selectedIds.map((id) => elements[id]).filter(Boolean);
  }, [selectedIds, elements]);

  const alignLeft = useCallback(() => {
    const els = getSelectedElements();
    if (els.length < 2) return;
    saveHistory();
    const minLeft = Math.min(...els.map((el) => el.style.left || 0));
    els.forEach((el) => updateElementStyle(el.id, { left: minLeft }));
  }, [getSelectedElements, updateElementStyle, saveHistory]);

  const alignCenter = useCallback(() => {
    const els = getSelectedElements();
    if (els.length < 2) return;
    saveHistory();
    const centers = els.map((el) => (el.style.left || 0) + (el.style.width || 0) / 2);
    const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
    els.forEach((el) => {
      const newLeft = avgCenter - (el.style.width || 0) / 2;
      updateElementStyle(el.id, { left: newLeft });
    });
  }, [getSelectedElements, updateElementStyle, saveHistory]);

  const alignRight = useCallback(() => {
    const els = getSelectedElements();
    if (els.length < 2) return;
    saveHistory();
    const maxRight = Math.max(...els.map((el) => (el.style.left || 0) + (el.style.width || 0)));
    els.forEach((el) => {
      updateElementStyle(el.id, { left: maxRight - (el.style.width || 0) });
    });
  }, [getSelectedElements, updateElementStyle, saveHistory]);

  const alignTop = useCallback(() => {
    const els = getSelectedElements();
    if (els.length < 2) return;
    saveHistory();
    const minTop = Math.min(...els.map((el) => el.style.top || 0));
    els.forEach((el) => updateElementStyle(el.id, { top: minTop }));
  }, [getSelectedElements, updateElementStyle, saveHistory]);

  const alignMiddle = useCallback(() => {
    const els = getSelectedElements();
    if (els.length < 2) return;
    saveHistory();
    const middles = els.map((el) => (el.style.top || 0) + (el.style.height || 0) / 2);
    const avgMiddle = middles.reduce((a, b) => a + b, 0) / middles.length;
    els.forEach((el) => {
      const newTop = avgMiddle - (el.style.height || 0) / 2;
      updateElementStyle(el.id, { top: newTop });
    });
  }, [getSelectedElements, updateElementStyle, saveHistory]);

  const alignBottom = useCallback(() => {
    const els = getSelectedElements();
    if (els.length < 2) return;
    saveHistory();
    const maxBottom = Math.max(...els.map((el) => (el.style.top || 0) + (el.style.height || 0)));
    els.forEach((el) => {
      updateElementStyle(el.id, { top: maxBottom - (el.style.height || 0) });
    });
  }, [getSelectedElements, updateElementStyle, saveHistory]);

  const distributeH = useCallback(() => {
    const els = getSelectedElements();
    if (els.length < 3) return;
    saveHistory();
    const sorted = [...els].sort((a, b) => (a.style.left || 0) - (b.style.left || 0));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalWidth = (last.style.left || 0) - (first.style.left || 0);
    const spacing = totalWidth / (sorted.length - 1);
    sorted.forEach((el, i) => {
      if (i > 0 && i < sorted.length - 1) {
        updateElementStyle(el.id, { left: (first.style.left || 0) + spacing * i });
      }
    });
  }, [getSelectedElements, updateElementStyle, saveHistory]);

  const distributeV = useCallback(() => {
    const els = getSelectedElements();
    if (els.length < 3) return;
    saveHistory();
    const sorted = [...els].sort((a, b) => (a.style.top || 0) - (b.style.top || 0));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalHeight = (last.style.top || 0) - (first.style.top || 0);
    const spacing = totalHeight / (sorted.length - 1);
    sorted.forEach((el, i) => {
      if (i > 0 && i < sorted.length - 1) {
        updateElementStyle(el.id, { top: (first.style.top || 0) + spacing * i });
      }
    });
  }, [getSelectedElements, updateElementStyle, saveHistory]);

  const isDisabled = selectedIds.length < 2;
  const isDistributeDisabled = selectedIds.length < 3;

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
  };

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <h3 style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
        Align & Distribute
      </h3>
      
      {/* Align */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <button style={buttonStyle} onClick={alignLeft} disabled={isDisabled} title="Align Left" aria-label="Align Left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <line x1="4" y1="4" x2="4" y2="20" />
            <rect x="8" y="6" width="12" height="4" />
            <rect x="8" y="14" width="8" height="4" />
          </svg>
        </button>
        <button style={buttonStyle} onClick={alignCenter} disabled={isDisabled} title="Align Center" aria-label="Align Center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <line x1="12" y1="4" x2="12" y2="20" />
            <rect x="6" y="6" width="12" height="4" />
            <rect x="8" y="14" width="8" height="4" />
          </svg>
        </button>
        <button style={buttonStyle} onClick={alignRight} disabled={isDisabled} title="Align Right" aria-label="Align Right">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <line x1="20" y1="4" x2="20" y2="20" />
            <rect x="4" y="6" width="12" height="4" />
            <rect x="8" y="14" width="8" height="4" />
          </svg>
        </button>
        <button style={buttonStyle} onClick={alignTop} disabled={isDisabled} title="Align Top" aria-label="Align Top">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <line x1="4" y1="4" x2="20" y2="4" />
            <rect x="6" y="8" width="4" height="12" />
            <rect x="14" y="8" width="4" height="8" />
          </svg>
        </button>
        <button style={buttonStyle} onClick={alignMiddle} disabled={isDisabled} title="Align Middle" aria-label="Align Middle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <line x1="4" y1="12" x2="20" y2="12" />
            <rect x="6" y="6" width="4" height="12" />
            <rect x="14" y="8" width="4" height="8" />
          </svg>
        </button>
        <button style={buttonStyle} onClick={alignBottom} disabled={isDisabled} title="Align Bottom" aria-label="Align Bottom">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <line x1="4" y1="20" x2="20" y2="20" />
            <rect x="6" y="4" width="4" height="12" />
            <rect x="14" y="8" width="4" height="8" />
          </svg>
        </button>
      </div>
      
      {/* Distribute */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button 
          style={{ ...buttonStyle, opacity: isDistributeDisabled ? 0.5 : 1, cursor: isDistributeDisabled ? 'not-allowed' : 'pointer' }} 
          onClick={distributeH} 
          disabled={isDistributeDisabled} 
          title="Distribute Horizontally"
          aria-label="Distribute Horizontally"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <rect x="2" y="8" width="4" height="8" />
            <rect x="10" y="8" width="4" height="8" />
            <rect x="18" y="8" width="4" height="8" />
          </svg>
        </button>
        <button 
          style={{ ...buttonStyle, opacity: isDistributeDisabled ? 0.5 : 1, cursor: isDistributeDisabled ? 'not-allowed' : 'pointer' }} 
          onClick={distributeV} 
          disabled={isDistributeDisabled} 
          title="Distribute Vertically"
          aria-label="Distribute Vertically"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <rect x="8" y="2" width="8" height="4" />
            <rect x="8" y="10" width="8" height="4" />
            <rect x="8" y="18" width="8" height="4" />
          </svg>
        </button>
      </div>
    </div>
  );
});
