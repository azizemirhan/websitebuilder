/**
 * PagesDashboard - Sayfa yönetim paneli
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cmsService, Page, useThemeStore, themeColors } from '@builder/core';
import { PageCard } from '../components/PageCard';

export const PagesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  // Load pages
  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await cmsService.listPages();
      setPages(data);
    } catch (error) {
      console.error('Failed to load pages:', error);
      alert('Sayfalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) {
      alert('Lütfen sayfa başlığı girin');
      return;
    }

    try {
      const newPage = await cmsService.createPage(newPageTitle);
      setPages([...pages, newPage]);
      setShowCreateModal(false);
      setNewPageTitle('');
      // Navigate to editor
      navigate(`/editor/${newPage.id}`);
    } catch (error) {
      console.error('Failed to create page:', error);
      alert('Sayfa oluşturulurken hata oluştu');
    }
  };

  const handleEditPage = (pageId: number) => {
    navigate(`/editor/${pageId}`);
  };

  const handleDeletePage = async (pageId: number) => {
    try {
      await cmsService.deletePage(pageId);
      setPages(pages.filter(p => p.id !== pageId));
    } catch (error) {
      console.error('Failed to delete page:', error);
      alert('Sayfa silinirken hata oluştu');
    }
  };

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || page.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: colors.text,
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        padding: '20px 40px',
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: colors.text }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, verticalAlign: 'middle' }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Sayfalarım
          </h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/menus')}
              style={{
                padding: '10px 20px',
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                backgroundColor: colors.surface,
                color: colors.text,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              Menüler
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: 8,
                backgroundColor: colors.primary,
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Yeni Sayfa
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '20px 40px',
      }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Sayfa ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          />

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{
              padding: '10px 16px',
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontSize: 14,
              backgroundColor: colors.surface,
              color: colors.text,
              cursor: 'pointer',
            }}
          >
            <option value="all">Tüm Sayfalar</option>
            <option value="draft">Taslaklar</option>
            <option value="published">Yayında</option>
          </select>
        </div>

        {/* Pages Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>
            Yükleniyor...
          </div>
        ) : filteredPages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>
            {searchQuery || filterStatus !== 'all' 
              ? 'Sonuç bulunamadı' 
              : 'Henüz sayfa oluşturmadınız. "Yeni Sayfa" butonuna tıklayarak başlayın!'
            }
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {filteredPages.map(page => (
              <PageCard
                key={page.id}
                page={page}
                onEdit={handleEditPage}
                onDelete={handleDeletePage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 32,
              width: '100%',
              maxWidth: 500,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              border: `1px solid ${colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: 0, marginBottom: 20, fontSize: 20, fontWeight: 700, color: colors.text }}>
              Yeni Sayfa Oluştur
            </h2>
            <input
              type="text"
              placeholder="Sayfa başlığı..."
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreatePage();
              }}
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                fontSize: 14,
                marginBottom: 20,
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPageTitle('');
                }}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                İptal
              </button>
              <button
                onClick={handleCreatePage}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
