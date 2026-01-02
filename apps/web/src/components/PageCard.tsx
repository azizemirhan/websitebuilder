/**
 * PageCard - Tek bir sayfayı temsil eden kart bileşeni
 */

import React from 'react';
import { Page, useThemeStore, themeColors } from '@builder/core';

interface PageCardProps {
  page: Page;
  onEdit: (pageId: number) => void;
  onDelete: (pageId: number) => void;
}

export const PageCard: React.FC<PageCardProps> = ({ page, onEdit, onDelete }) => {
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        border: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Thumbnail Placeholder */}
      <div
        style={{
          width: '100%',
          height: 160,
          backgroundColor: colors.background,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>

      {/* Page Info */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: colors.text,
            marginBottom: 4,
          }}
        >
          {page.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 4,
              backgroundColor: page.status === 'published' ? '#d1fae5' : '#fef3c7',
              color: page.status === 'published' ? '#065f46' : '#92400e',
            }}
          >
            {page.status === 'published' ? 'Yayında' : 'Taslak'}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: colors.textMuted }}>
          Güncelleme: {formatDate(page.updated_at)}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(page.id);
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: 'none',
            borderRadius: 6,
            backgroundColor: colors.primary,
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Düzenle
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`"${page.title}" sayfasını silmek istediğinize emin misiniz?`)) {
              onDelete(page.id);
            }
          }}
          style={{
            padding: '8px 12px',
            border: `1px solid ${colors.border}`,
            borderRadius: 6,
            backgroundColor: colors.surface,
            color: colors.danger,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};
