/**
 * Tooltip Component - Hover hints with keyboard shortcuts
 */

import React, { memo, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  shortcut?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export const Tooltip = memo(function Tooltip({
  content,
  shortcut,
  position = 'top',
  children,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, 500); // 500ms delay
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    
    let x = rect.left + rect.width / 2;
    let y = rect.top;
    
    switch (position) {
      case 'top':
        y = rect.top - 8;
        break;
      case 'bottom':
        y = rect.bottom + 8;
        break;
      case 'left':
        x = rect.left - 8;
        y = rect.top + rect.height / 2;
        break;
      case 'right':
        x = rect.right + 8;
        y = rect.top + rect.height / 2;
        break;
    }
    
    setCoords({ x, y });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10001,
    backgroundColor: '#1f2937',
    color: '#ffffff',
    padding: '6px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    pointerEvents: 'none',
    opacity: isVisible ? 1 : 0,
    transform: position === 'top' 
      ? `translate(-50%, -100%) translateY(${isVisible ? 0 : 4}px)`
      : position === 'bottom'
      ? `translate(-50%, 0) translateY(${isVisible ? 0 : -4}px)`
      : position === 'left'
      ? `translate(-100%, -50%) translateX(${isVisible ? 0 : 4}px)`
      : `translate(0, -50%) translateX(${isVisible ? 0 : -4}px)`,
    transition: 'opacity 0.15s ease, transform 0.15s ease',
    left: coords.x,
    top: coords.y,
  };

  const shortcutStyle: React.CSSProperties = {
    marginLeft: 8,
    padding: '2px 4px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    fontSize: 10,
    fontFamily: 'monospace',
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </div>
      {isVisible && (
        <div ref={tooltipRef} style={tooltipStyle}>
          {content}
          {shortcut && <span style={shortcutStyle}>{shortcut}</span>}
        </div>
      )}
    </>
  );
});
