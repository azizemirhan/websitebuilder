/**
 * Breakpoint Bar - Device size selector
 */

import React, { memo } from 'react';
import { useResponsiveStore, BREAKPOINTS, BreakpointName, useThemeStore, themeColors } from '@builder/core';

export const BreakpointBar = memo(function BreakpointBar() {
  const activeBreakpoint = useResponsiveStore((state) => state.activeBreakpoint);
  const setActiveBreakpoint = useResponsiveStore((state) => state.setActiveBreakpoint);
  const previewMode = useResponsiveStore((state) => state.previewMode);
  const togglePreviewMode = useResponsiveStore((state) => state.togglePreviewMode);
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    border: '1px solid',
    borderColor: active ? colors.primary : colors.border,
    borderRadius: 6,
    backgroundColor: active ? colors.primary : colors.surface,
    color: active ? '#ffffff' : colors.text,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  // Device icons as SVG
  const deviceIcons: Record<string, React.ReactNode> = {
    mobile: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    tablet: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    desktop: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '8px 16px',
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
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
          {deviceIcons[bp.name] || <span>{bp.icon}</span>}
        </button>
      ))}
      
      <div style={{ width: 1, height: 24, backgroundColor: colors.border, margin: '0 8px' }} />
      
      <button
        style={buttonStyle(previewMode)}
        onClick={togglePreviewMode}
        title="Toggle Preview Mode"
        aria-label="Toggle preview mode"
      >
        {previewMode ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        )}
      </button>
    </div>
  );
});
