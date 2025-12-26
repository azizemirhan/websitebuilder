/**
 * Breakpoint Bar - Device size selector
 */

import React, { memo } from 'react';
import { useResponsiveStore, BREAKPOINTS, BreakpointName } from '@builder/core';

export const BreakpointBar = memo(function BreakpointBar() {
  const activeBreakpoint = useResponsiveStore((state) => state.activeBreakpoint);
  const setActiveBreakpoint = useResponsiveStore((state) => state.setActiveBreakpoint);
  const previewMode = useResponsiveStore((state) => state.previewMode);
  const togglePreviewMode = useResponsiveStore((state) => state.togglePreviewMode);

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    border: '1px solid',
    borderColor: active ? '#3b82f6' : '#e5e7eb',
    borderRadius: 6,
    backgroundColor: active ? '#dbeafe' : '#ffffff',
    color: active ? '#1d4ed8' : '#374151',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '8px 16px',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {BREAKPOINTS.map((bp) => (
        <button
          key={bp.name}
          style={buttonStyle(activeBreakpoint === bp.name)}
          onClick={() => setActiveBreakpoint(bp.name)}
          title={`${bp.label} (${bp.width}px)`}
          aria-label={`Switch to ${bp.label} view`}
        >
          <span>{bp.icon}</span>
          <span>{bp.label}</span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>{bp.width}px</span>
        </button>
      ))}
      
      <div style={{ width: 1, height: 24, backgroundColor: '#e5e7eb', margin: '0 8px' }} />
      
      <button
        style={{
          ...buttonStyle(previewMode),
          gap: 4,
        }}
        onClick={togglePreviewMode}
        title="Toggle Preview Mode"
        aria-label="Toggle preview mode"
      >
        <span>{previewMode ? '🎬' : '✏️'}</span>
        <span>{previewMode ? 'Preview' : 'Edit'}</span>
      </button>
    </div>
  );
});
