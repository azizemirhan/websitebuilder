/**
 * Preview Panel - Full page preview with responsive toggle
 */

import React, { memo, useState, useMemo } from 'react';
import { useCanvasStore, useResponsiveStore } from '@builder/core';
import { generateHTMLDocument } from '@builder/core';

export const PreviewPanel = memo(function PreviewPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const rootElementIds = useCanvasStore((state) => state.rootElementIds);
  const activeBreakpoint = useResponsiveStore((state) => state.activeBreakpoint);
  const getActiveBreakpointWidth = useResponsiveStore((state) => state.getActiveBreakpointWidth);
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const deviceWidths = {
    desktop: 1280,
    tablet: 768,
    mobile: 375,
  };

  // Generate preview HTML
  const previewHTML = useMemo(() => {
    if (rootElementIds.length === 0) return '';
    
    const { html, css } = generateHTMLDocument(elements, rootElementIds, {
      title: 'Önizleme',
      useClasses: true,
    });
    
    // Inline the CSS in the HTML
    return html.replace(
      '<link rel="stylesheet" href="styles.css">',
      `<style>${css}</style>`
    );
  }, [elements, rootElementIds]);

  const handleOpenInNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(previewHTML);
      newWindow.document.close();
    }
  };

  if (rootElementIds.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
        Önizleme
      </div>

      {/* Preview Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #3b82f6',
            borderRadius: 8,
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onClick={() => setIsPreviewOpen(true)}
        >
          👁️ Önizle
        </button>
        <button
          style={{
            padding: '10px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            backgroundColor: '#fff',
            fontSize: 12,
            cursor: 'pointer',
          }}
          onClick={handleOpenInNewTab}
          title="Yeni sekmede aç"
        >
          ↗️
        </button>
      </div>

      {/* Mini Preview */}
      <div
        style={{
          width: '100%',
          height: 150,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#f9fafb',
        }}
      >
        <iframe
          srcDoc={previewHTML}
          style={{
            width: '400%',
            height: '400%',
            border: 'none',
            transform: 'scale(0.25)',
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
          title="Mini Preview"
        />
      </div>

      {/* Full Preview Modal */}
      {isPreviewOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Preview Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: '#1f2937',
            borderBottom: '1px solid #374151',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                <button
                  key={device}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: 6,
                    backgroundColor: previewDevice === device ? '#3b82f6' : 'transparent',
                    color: previewDevice === device ? '#fff' : '#9ca3af',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                  onClick={() => setPreviewDevice(device)}
                >
                  {device === 'desktop' && '🖥️'}
                  {device === 'tablet' && '📱'}
                  {device === 'mobile' && '📲'}
                  {' '}
                  {device === 'desktop' ? 'Masaüstü' : device === 'tablet' ? 'Tablet' : 'Mobil'}
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 6,
                  backgroundColor: '#10b981',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onClick={handleOpenInNewTab}
              >
                ↗️ Yeni Sekmede Aç
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 6,
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕ Kapat
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            overflow: 'auto',
          }}>
            <div
              style={{
                width: deviceWidths[previewDevice],
                height: '100%',
                backgroundColor: '#fff',
                borderRadius: previewDevice !== 'desktop' ? 20 : 0,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                transition: 'width 0.3s ease',
              }}
            >
              <iframe
                srcDoc={previewHTML}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="Full Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
