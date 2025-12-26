/**
 * Export Modal - Export options and download
 */

import React, { memo, useState, useCallback } from 'react';
import { useCanvasStore, useToastStore } from '@builder/core';
import { generateHTMLDocument, generateReactComponent, downloadFile } from '@builder/core';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'html' | 'html-css' | 'react';

export const ExportModal = memo(function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const elements = useCanvasStore((state) => state.elements);
  const rootElementIds = useCanvasStore((state) => state.rootElementIds);
  
  const [format, setFormat] = useState<ExportFormat>('html-css');
  const [projectName, setProjectName] = useState('my-project');
  const [minify, setMinify] = useState(false);
  const [cssPrefix, setCssPrefix] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (rootElementIds.length === 0) {
      useToastStore.getState().addToast('Canvas boş, export edilecek element yok', 'warning');
      return;
    }
    
    setIsExporting(true);
    
    try {
      if (format === 'html' || format === 'html-css') {
        const { html, css } = generateHTMLDocument(elements, rootElementIds, {
          title: projectName,
          useClasses: format === 'html-css',
        });
        
        // Download HTML
        downloadFile(html, `${projectName}.html`, 'text/html');
        
        // Download CSS if separate
        if (format === 'html-css' && css) {
          setTimeout(() => {
            downloadFile(css, 'styles.css', 'text/css');
          }, 100);
        }
        
        useToastStore.getState().addToast('HTML dışa aktarıldı!', 'success');
      } else if (format === 'react') {
        // Export each root element as a React component
        rootElementIds.forEach((id, index) => {
          const element = elements[id];
          if (element) {
            const componentName = `Component${index + 1}`;
            const code = generateReactComponent(element, elements, componentName);
            downloadFile(code, `${componentName}.tsx`, 'text/typescript');
          }
        });
        
        useToastStore.getState().addToast('React bileşenleri dışa aktarıldı!', 'success');
      }
      
      onClose();
    } catch (error) {
      useToastStore.getState().addToast('Dışa aktarma başarısız', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [elements, rootElementIds, format, projectName, onClose]);

  if (!isOpen) return null;

  const formatOptions = [
    { id: 'html', label: 'HTML (Inline Styles)', icon: '📄', desc: 'Tek dosya, inline style' },
    { id: 'html-css', label: 'HTML + CSS', icon: '🎨', desc: 'Ayrı CSS dosyası' },
    { id: 'react', label: 'React Component', icon: '⚛️', desc: 'JSX + CSS Modules' },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 480,
          backgroundColor: '#fff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
            🚀 Kod Dışa Aktar
          </div>
          <button
            style={{
              width: 32,
              height: 32,
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: 20,
              cursor: 'pointer',
              color: '#6b7280',
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          {/* Format Selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              Format
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {formatOptions.map((opt) => (
                <button
                  key={opt.id}
                  style={{
                    padding: 12,
                    border: '2px solid',
                    borderColor: format === opt.id ? '#3b82f6' : '#e5e7eb',
                    borderRadius: 10,
                    backgroundColor: format === opt.id ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: 'left',
                  }}
                  onClick={() => setFormat(opt.id as ExportFormat)}
                >
                  <span style={{ fontSize: 24 }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Project Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Proje Adı
            </label>
            <input
              type="text"
              style={inputStyle}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-project"
            />
          </div>

          {/* Options */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              Seçenekler
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: '#374151',
              }}>
                <input
                  type="checkbox"
                  checked={minify}
                  onChange={(e) => setMinify(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#3b82f6' }}
                />
                Minify (Sıkıştır)
              </label>
            </div>
          </div>

          {/* Stats */}
          <div style={{ 
            padding: 12, 
            backgroundColor: '#f9fafb', 
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'space-around',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>
                {Object.keys(elements).length}
              </div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>Element</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>
                {rootElementIds.length}
              </div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>Root</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '16px 24px', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
        }}>
          <button
            style={{
              padding: '10px 20px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              backgroundColor: '#fff',
              fontSize: 14,
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            İptal
          </button>
          <button
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: 8,
              backgroundColor: isExporting ? '#9ca3af' : '#3b82f6',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? '⏳ Dışa aktarılıyor...' : '📥 Dışa Aktar'}
          </button>
        </div>
      </div>
    </div>
  );
});
