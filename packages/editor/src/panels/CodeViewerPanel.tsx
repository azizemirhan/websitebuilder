/**
 * Code Viewer Panel - Live HTML/CSS preview with syntax highlighting
 */

import React, { memo, useState, useMemo } from 'react';
import { useCanvasStore } from '@builder/core';
import { generateHTML, generateCSSClass, generateReactComponent } from '@builder/core';

type CodeTab = 'html' | 'css' | 'react';

export const CodeViewerPanel = memo(function CodeViewerPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const rootElementIds = useCanvasStore((state) => state.rootElementIds);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  
  const [activeTab, setActiveTab] = useState<CodeTab>('html');
  const [copied, setCopied] = useState(false);

  // Get selected element or first root element
  const targetElement = useMemo(() => {
    if (selectedIds.length === 1) {
      return elements[selectedIds[0]];
    }
    if (rootElementIds.length > 0) {
      return elements[rootElementIds[0]];
    }
    return null;
  }, [elements, rootElementIds, selectedIds]);

  // Generate code
  const code = useMemo(() => {
    if (!targetElement) return { html: '', css: '', react: '' };
    
    const html = generateHTML(targetElement, elements, { useClasses: false, indent: 0 });
    
    // Generate CSS
    const cssBlocks: string[] = [];
    const generateElementCSS = (element: typeof targetElement) => {
      if (!element) return;
      const className = `element-${element.id.slice(0, 8)}`;
      cssBlocks.push(generateCSSClass(className, element.style));
      element.children.forEach(childId => {
        const child = elements[childId];
        if (child) generateElementCSS(child);
      });
    };
    generateElementCSS(targetElement);
    const css = cssBlocks.join('\n\n');
    
    // Generate React
    const react = generateReactComponent(targetElement, elements, 'MyComponent');
    
    return { html, css, react };
  }, [targetElement, elements]);

  const handleCopy = async () => {
    let textToCopy = '';
    if (activeTab === 'html') textToCopy = code.html;
    if (activeTab === 'css') textToCopy = code.css;
    if (activeTab === 'react') textToCopy = code.react;
    
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px',
    border: 'none',
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
    backgroundColor: 'transparent',
    color: active ? '#3b82f6' : '#6b7280',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  });

  if (!targetElement) {
    return (
      <div style={{ padding: 16, color: '#6b7280', fontSize: 13, textAlign: 'center' }}>
        Element seçin veya ekleyin
      </div>
    );
  }

  return (
    <div style={{ borderBottom: '1px solid #e5e7eb' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        <button style={tabStyle(activeTab === 'html')} onClick={() => setActiveTab('html')}>
          HTML
        </button>
        <button style={tabStyle(activeTab === 'css')} onClick={() => setActiveTab('css')}>
          CSS
        </button>
        <button style={tabStyle(activeTab === 'react')} onClick={() => setActiveTab('react')}>
          React
        </button>
      </div>

      {/* Code Display */}
      <div style={{ position: 'relative' }}>
        {/* Copy Button */}
        <button
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '6px 12px',
            border: 'none',
            borderRadius: 6,
            backgroundColor: copied ? '#10b981' : '#3b82f6',
            color: '#fff',
            fontSize: 11,
            fontWeight: 500,
            cursor: 'pointer',
            zIndex: 10,
          }}
          onClick={handleCopy}
        >
          {copied ? '✓ Kopyalandı' : '📋 Kopyala'}
        </button>

        {/* Code Block */}
        <pre
          style={{
            margin: 0,
            padding: 16,
            paddingTop: 40,
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            fontSize: 11,
            lineHeight: 1.6,
            fontFamily: 'Monaco, Consolas, monospace',
            overflow: 'auto',
            maxHeight: 300,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <code>
            {activeTab === 'html' && code.html}
            {activeTab === 'css' && code.css}
            {activeTab === 'react' && code.react}
          </code>
        </pre>
      </div>
    </div>
  );
});
