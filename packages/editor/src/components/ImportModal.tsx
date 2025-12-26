/**
 * Template Converter Modal - Convert HTML/CSS to TemplateJSON
 */

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useToastStore, convertToTemplateKit, exportTemplateKitJSON, type TemplateKit } from '@builder/core';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'processing' | 'success';

export const ImportModal = memo(function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [convertedTemplate, setConvertedTemplate] = useState<TemplateKit | null>(null);
  
  const reset = useCallback(() => {
    setStep('upload');
    setHtmlContent('');
    setCssContent('');
    setFileName('');
    setConvertedTemplate(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleHTMLUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setHtmlContent(event.target?.result as string || '');
    };
    reader.readAsText(file);
  }, []);

  const handleCSSUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setCssContent(prev => prev + '\n' + (event.target?.result as string || ''));
      useToastStore.getState().addToast(`CSS dosyası eklendi: ${file.name}`, 'success');
    };
    reader.readAsText(file);
  }, []);

  const handleConvert = useCallback(() => {
    if (!htmlContent) return;

    setStep('processing');
    
    // Small delay to show processing state
    setTimeout(() => {
      const result = convertToTemplateKit(htmlContent, cssContent, {
        name: fileName.replace('.html', '') || 'New Template',
        splitSections: true, 
      });

      if (result.success && result.templateKit) {
        setConvertedTemplate(result.templateKit);
        setStep('success');
        useToastStore.getState().addToast('Dönüştürme başarılı!', 'success');
      } else {
        setStep('upload');
        useToastStore.getState().addToast('Dönüştürme hatası: ' + result.errors.join(', '), 'error');
      }
    }, 500);
  }, [htmlContent, cssContent, fileName]);

  const handleDownload = useCallback(() => {
    if (!convertedTemplate) return;

    const json = exportTemplateKitJSON(convertedTemplate);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${convertedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    useToastStore.getState().addToast('Template indirildi', 'success');
    handleClose();
  }, [convertedTemplate, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: 600,
          backgroundColor: '#fff',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '24px 32px', 
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              🛠️ Template Converter
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
              HTML/CSS to JSON Template Kit
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 36,
              height: 36,
              border: '1px solid #e5e7eb',
              backgroundColor: '#fff',
              borderRadius: 10,
              fontSize: 20,
              cursor: 'pointer',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 32, overflowY: 'auto' }}>
          
          {step === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* HTML Upload */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  1. HTML Dosyası
                </label>
                <div 
                  style={{
                    border: '2px dashed #e5e7eb',
                    borderRadius: 12,
                    padding: 32,
                    textAlign: 'center',
                    backgroundColor: htmlContent ? '#f0fdf4' : '#f9fafb',
                    borderColor: htmlContent ? '#86efac' : '#e5e7eb',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <input
                    type="file"
                    accept=".html,.htm"
                    onChange={handleHTMLUpload}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ fontSize: 32, marginBottom: 12 }}>
                    {htmlContent ? '📄' : '📄'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#4b5563' }}>
                    {htmlContent ? fileName : 'Click or drop HTML file here'}
                  </div>
                  {htmlContent && (
                    <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
                       Yüklendi ({htmlContent.length} bytes)
                    </div>
                  )}
                </div>
              </div>

              {/* CSS Upload */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  2. CSS Dosyaları (Opsiyonel)
                </label>
                <div 
                  style={{
                    border: '2px dashed #e5e7eb',
                    borderRadius: 12,
                    padding: 24,
                    textAlign: 'center',
                    backgroundColor: cssContent ? '#eff6ff' : '#f9fafb',
                    borderColor: cssContent ? '#93c5fd' : '#e5e7eb',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <input
                    type="file"
                    accept=".css"
                    onChange={handleCSSUpload}
                    multiple
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#4b5563' }}>
                    {cssContent ? '➕ CSS Eklendi (Daha fazla eklemek için tıkla)' : 'Click to add CSS files'}
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={handleConvert}
                disabled={!htmlContent}
                style={{
                  marginTop: 8,
                  width: '100%',
                  padding: '14px',
                  backgroundColor: htmlContent ? '#2563eb' : '#e5e7eb',
                  color: htmlContent ? '#fff' : '#9ca3af',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: htmlContent ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s',
                }}
              >
                Analiz Et ve Dönüştür →
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ 
                width: 48, 
                height: 48, 
                border: '4px solid #e5e7eb',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                margin: '0 auto 24px',
                animation: 'spin 1s linear infinite',
              }} />
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>Dönüştürülüyor...</h3>
              <p style={{ color: '#6b7280' }}>Elementler analiz ediliyor ve template formatına çevriliyor.</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {step === 'success' && convertedTemplate && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
              <h3 style={{ fontSize: 24, marginBottom: 8, color: '#111827' }}>Hazır!</h3>
              <p style={{ color: '#6b7280', marginBottom: 32 }}>
                Template başarıyla oluşturuldu.
              </p>

              <div style={{ 
                backgroundColor: '#f3f4f6', 
                borderRadius: 12, 
                padding: 20, 
                textAlign: 'left',
                marginBottom: 32,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sections</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{convertedTemplate.sections.length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Template Name</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{convertedTemplate.name}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={reset}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  Yeni Dönüştürme
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#16a34a',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span>⬇️</span> JSON İndir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Helper functions
function countElements(elements: { children: unknown[] }[]): number {
  let count = 0;
  function traverse(els: { children: unknown[] }[]) {
    els.forEach((el) => {
      count++;
      traverse(el.children as { children: unknown[] }[]);
    });
  }
  traverse(elements);
  return count;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addElementRecursively(
  element: any,
  allElements: Record<string, any>,
  addElement: (type: string, parentId?: string) => string
) {
  // Note: Canvas store needs direct element injection
  // This is a placeholder - full implementation would use a different approach
  console.log('Importing element:', element.id, element.type);
}

