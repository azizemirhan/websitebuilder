/**
 * Template Browser Panel - Browse and load template sections
 */

import React, { memo, useState, useRef } from 'react';
import { useTemplateStore, useCanvasStore, importTemplateKitJSON, useToastStore, regenerateElementTree, useThemeStore, themeColors, type TemplateSection } from '@builder/core';

export const TemplateBrowserPanel = memo(function TemplateBrowserPanel() {
  // Access the store function directly, not inside selector
  const getAllTemplates = useTemplateStore((state) => state.getAllTemplates);
  const addTemplate = useTemplateStore((state) => state.addTemplate);
  const removeTemplate = useTemplateStore((state) => state.removeTemplate);
  
  // Get templates by calling the function
  const templates = getAllTemplates();

  const importElements = useCanvasStore((state) => state.importElements);
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  const [activeTab, setActiveTab] = useState<'all' | 'sections'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const template = importTemplateKitJSON(content);

      if (template) {
        addTemplate(template);
        useToastStore.getState().addToast(`Template yüklendi: ${template.name}`, 'success');
      } else {
        useToastStore.getState().addToast('Geçersiz template dosyası', 'error');
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  };

  const handleAddSection = (section: TemplateSection) => {
    // Import logic with ID regeneration
    const { elements, rootIds } = regenerateElementTree(section.elements, section.rootElementIds);

    importElements(elements, rootIds);
    useToastStore.getState().addToast('Bölüm canvasa eklendi', 'success');
  };

  const handleDeleteTemplate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
      removeTemplate(id);
    }
  };

  // Filter logic
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: colors.surface }}>
      {/* Header */}
      <div style={{ padding: 16, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            Şablonlar
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>+</span> Yükle
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Şablon ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            fontSize: 13,
            outline: 'none',
            backgroundColor: colors.surface,
            color: colors.text,
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {filteredTemplates.length === 0 ? (
          <div style={{
            padding: 32,
            textAlign: 'center',
            color: colors.textMuted,
            fontSize: 13,
          }}>
            {templates.length === 0 ? (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
                <div>Henüz şablon yok</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>
                  JSON dosyası yükleyerek başlayın
                </div>
              </>
            ) : (
              <div>Aradığınız şablon bulunamadı</div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: colors.surface,
                }}
              >
                {/* Template Header */}
                <div
                  onClick={() => setExpandedTemplateId(
                    expandedTemplateId === template.id ? null : template.id
                  )}
                  style={{
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: expandedTemplateId === template.id ? colors.surfaceHover : colors.surface,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: '#e0e7ff',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 600,
                    }}>
                      {template.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                        {template.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>
                        {template.sections.length} bölüm
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={(e) => handleDeleteTemplate(e, template.id)}
                      style={{
                        padding: 6,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#9ca3af',
                        fontSize: 14,
                      }}
                    >
                      🗑️
                    </button>
                    <div style={{
                      transform: expandedTemplateId === template.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      fontSize: 12,
                      color: '#6b7280',
                    }}>
                      ▼
                    </div>
                  </div>
                </div>

                {/* Sections List */}
                {expandedTemplateId === template.id && (
                  <div style={{ borderTop: `1px solid ${colors.border}`, backgroundColor: colors.surfaceHover, padding: 8 }}>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {template.sections.map((section) => (
                        <div
                          key={section.id}
                          style={{
                            padding: 12,
                            backgroundColor: colors.surface,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>
                              {section.name}
                            </div>
                            <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                              {section.sectionType.toUpperCase()}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddSection(section)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: colors.surface,
                              border: `1px solid ${colors.border}`,
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 500,
                              color: colors.text,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <span>+</span> Ekle
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
