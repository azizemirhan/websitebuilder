/**
 * Toast Container - Renders toast notifications
 */

import React, { memo } from 'react';
import { useToastStore, ToastType } from '@builder/core';

const getToastStyles = (type: ToastType): React.CSSProperties => {
  const colors = {
    success: { bg: '#10b981', border: '#059669' },
    error: { bg: '#ef4444', border: '#dc2626' },
    warning: { bg: '#f59e0b', border: '#d97706' },
    info: { bg: '#3b82f6', border: '#2563eb' },
  };
  
  const { bg, border } = colors[type];
  
  return {
    backgroundColor: bg,
    borderLeft: `4px solid ${border}`,
    color: '#ffffff',
    padding: '12px 16px',
    borderRadius: 6,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 14,
    fontWeight: 500,
    animation: 'slideIn 0.2s ease',
  };
};

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const ToastContainer = memo(function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 10002,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={getToastStyles(toast.type)}
            onClick={() => removeToast(toast.id)}
            role="alert"
            aria-live="polite"
          >
            <span style={{ fontSize: 18 }}>{icons[toast.type]}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  );
});
