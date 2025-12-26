/**
 * Constraints Panel - Figma-style constraint editor
 */

import React, { memo, useCallback } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState } from '@builder/core';

type ConstraintH = 'left' | 'right' | 'left-right' | 'center' | 'scale';
type ConstraintV = 'top' | 'bottom' | 'top-bottom' | 'center' | 'scale';

interface Constraints {
  horizontal: ConstraintH;
  vertical: ConstraintV;
}

export const ConstraintsPanel = memo(function ConstraintsPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElement = useCanvasStore((state) => state.updateElement);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;

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

  if (!selectedElement) {
    return null;
  }

  // Get constraints from element props or defaults
  const constraints: Constraints = (selectedElement.props as { constraints?: Constraints })?.constraints || {
    horizontal: 'left',
    vertical: 'top',
  };

  const setConstraints = (newConstraints: Partial<Constraints>) => {
    saveHistory();
    updateElement(selectedElement.id, {
      props: {
        ...(selectedElement.props || {}),
        constraints: { ...constraints, ...newConstraints },
      },
    } as Parameters<typeof updateElement>[1]);
  };

  const lineStyle = (active: boolean): React.CSSProperties => ({
    backgroundColor: active ? '#3b82f6' : '#d1d5db',
    transition: 'background-color 0.15s ease',
  });

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    width: 32,
    height: 24,
    border: '1px solid',
    borderColor: active ? '#3b82f6' : '#e5e7eb',
    backgroundColor: active ? '#dbeafe' : '#ffffff',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 600,
    color: active ? '#1d4ed8' : '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
        Constraints
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Visual Constraint Box */}
        <div
          style={{
            position: 'relative',
            width: 80,
            height: 80,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            backgroundColor: '#f9fafb',
          }}
        >
          {/* Center element */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 24,
              height: 24,
              backgroundColor: '#3b82f6',
              borderRadius: 4,
            }}
          />

          {/* Top line */}
          <div
            style={{
              ...lineStyle(constraints.vertical === 'top' || constraints.vertical === 'top-bottom'),
              position: 'absolute',
              top: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 2,
              height: constraints.vertical === 'top' || constraints.vertical === 'top-bottom' ? 14 : 8,
              cursor: 'pointer',
            }}
            onClick={() => setConstraints({ vertical: constraints.vertical === 'top' ? 'center' : 'top' })}
          />

          {/* Bottom line */}
          <div
            style={{
              ...lineStyle(constraints.vertical === 'bottom' || constraints.vertical === 'top-bottom'),
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 2,
              height: constraints.vertical === 'bottom' || constraints.vertical === 'top-bottom' ? 14 : 8,
              cursor: 'pointer',
            }}
            onClick={() => setConstraints({ vertical: constraints.vertical === 'bottom' ? 'center' : 'bottom' })}
          />

          {/* Left line */}
          <div
            style={{
              ...lineStyle(constraints.horizontal === 'left' || constraints.horizontal === 'left-right'),
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: constraints.horizontal === 'left' || constraints.horizontal === 'left-right' ? 14 : 8,
              height: 2,
              cursor: 'pointer',
            }}
            onClick={() => setConstraints({ horizontal: constraints.horizontal === 'left' ? 'center' : 'left' })}
          />

          {/* Right line */}
          <div
            style={{
              ...lineStyle(constraints.horizontal === 'right' || constraints.horizontal === 'left-right'),
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: constraints.horizontal === 'right' || constraints.horizontal === 'left-right' ? 14 : 8,
              height: 2,
              cursor: 'pointer',
            }}
            onClick={() => setConstraints({ horizontal: constraints.horizontal === 'right' ? 'center' : 'right' })}
          />
        </div>

        {/* Dropdowns */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Horizontal</div>
            <select
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                fontSize: 12,
              }}
              value={constraints.horizontal}
              onChange={(e) => setConstraints({ horizontal: e.target.value as ConstraintH })}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="left-right">Left & Right</option>
              <option value="center">Center</option>
              <option value="scale">Scale</option>
            </select>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Vertical</div>
            <select
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                fontSize: 12,
              }}
              value={constraints.vertical}
              onChange={(e) => setConstraints({ vertical: e.target.value as ConstraintV })}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="top-bottom">Top & Bottom</option>
              <option value="center">Center</option>
              <option value="scale">Scale</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
});
