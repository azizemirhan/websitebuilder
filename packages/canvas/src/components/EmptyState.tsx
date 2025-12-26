/**
 * Empty State - Shown when canvas is empty
 */

import React, { memo } from 'react';

interface EmptyStateProps {
  onAddElement: (type: 'container' | 'text' | 'button') => void;
}

export const EmptyState = memo(function EmptyState({ onAddElement }: EmptyStateProps) {
  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '20px 24px',
    border: '2px dashed #d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: 120,
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: '#6b7280',
      }}
    >
      <div
        style={{
          fontSize: 48,
          marginBottom: 16,
          opacity: 0.5,
        }}
      >
        🎨
      </div>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: '#374151',
          marginBottom: 8,
        }}
      >
        Canvas Boş
      </h2>
      <p
        style={{
          fontSize: 14,
          color: '#6b7280',
          marginBottom: 24,
          maxWidth: 300,
        }}
      >
        Tasarımınıza başlamak için aşağıdan bir element ekleyin veya toolbar'ı kullanın.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
        }}
      >
        <button
          style={buttonStyle}
          onClick={() => onAddElement('container')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.backgroundColor = '#eff6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          aria-label="Container ekle"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          <span style={{ fontWeight: 500, color: '#374151' }}>Container</span>
        </button>
        <button
          style={buttonStyle}
          onClick={() => onAddElement('text')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.backgroundColor = '#eff6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          aria-label="Text ekle"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <path d="M4 7V4h16v3M9 20h6M12 4v16" />
          </svg>
          <span style={{ fontWeight: 500, color: '#374151' }}>Text</span>
        </button>
        <button
          style={buttonStyle}
          onClick={() => onAddElement('button')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.backgroundColor = '#eff6ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          aria-label="Button ekle"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
          </svg>
          <span style={{ fontWeight: 500, color: '#374151' }}>Button</span>
        </button>
      </div>
    </div>
  );
});
