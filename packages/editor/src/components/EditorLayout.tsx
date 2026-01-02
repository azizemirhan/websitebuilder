/**
 * Editor Layout - Main 3-column editor layout
 */

import React, { memo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CanvasRenderer } from '@builder/canvas';
import { useResponsiveStore, useCanvasStore, cmsService, useThemeStore, themeColors, useSettingsStore } from '@builder/core';
import { Toolbar } from './Toolbar';
import { Ruler } from './Ruler';
import { ToastContainer } from './ToastContainer';
import { BreakpointBar } from './BreakpointBar';
import { ErrorBoundary } from './ErrorBoundary';
import { CreateComponentModal } from './CreateComponentModal';
import { ExportModal } from './ExportModal';
import { ImportModal } from './ImportModal';
import { 
  LayersPanel, 
  PropertiesPanel, 
  InteractionsPanel,
  AlignPanel, 
  LayoutPanel,
  ConstraintsPanel,
  SpacingPanel,
  AutoLayoutPanel,
  FlexItemPanel,
  GridEditorPanel,
  BorderPanel,
  MultipleShadowPanel,
  GradientPanel,
  FiltersPanel,
  EffectsLibraryPanel,
  TransformPanel,
  TypographyPanel,
  TextShadowPanel,
  DesignTokensPanel,
  ComponentLibraryPanel,
  ComponentInstancePanel,
  ComponentVariantsPanel,
  ComponentPropsEditorPanel,
  ComponentStatesPanel,
  ComponentDiffPanel,
  ComponentUsagePanel,
  ComponentExportPanel,
  CodeViewerPanel,
  PreviewPanel,
  TemplateBrowserPanel,
  MenuPropertiesPanel,
} from '../panels';
import { useKeyboardShortcuts } from '../hooks';

export const EditorLayout = memo(function EditorLayout() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();
  
  // Get responsive breakpoint width
  const getActiveBreakpointWidth = useResponsiveStore((state) => state.getActiveBreakpointWidth);
  const canvasWidth = getActiveBreakpointWidth();
  
  // Modal state
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [leftPanelTab, setLeftPanelTab] = useState<'layers' | 'components' | 'templates'>('layers');
  const [pageLoading, setPageLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('');
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  // Settings
  const showRulers = useSettingsStore((state) => state.showRulers);
  const zoom = useSettingsStore((state) => state.zoom);

  // Ruler Scroll Sync
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPos({ x: e.currentTarget.scrollLeft, y: e.currentTarget.scrollTop });
  };

  // Load page data on mount
  useEffect(() => {  
    const loadPageData = async () => {
      if (!pageId) {
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        console.log('[EditorLayout] Loading page:', pageId);
        const page = await cmsService.loadPage(pageId);
        console.log('[EditorLayout] Page loaded:', page);
        setPageTitle(page.title || 'Untitled');
        
        // Load editor data if available
        if (page.editor_data) {
          console.log('[EditorLayout] Editor data found:', page.editor_data);
          const { elements, rootElementIds } = page.editor_data;
          
          // Check if we have actual content
          const hasElements = elements && Object.keys(elements).length > 0;
          const hasRootIds = rootElementIds && rootElementIds.length > 0;
          
          console.log('[EditorLayout] Has elements:', hasElements, 'Has root IDs:', hasRootIds);
          
          if (hasElements || hasRootIds) {
            console.log('[EditorLayout] Restoring canvas state...');
            useCanvasStore.setState({
              elements: elements || {},
              rootElementIds: rootElementIds || [],
            });
          } else {
            console.log('[EditorLayout] No content to restore, keeping current state');
          }
        } else {
          console.log('[EditorLayout] No editor_data in page');
        }
      } catch (error) {
        console.error('Failed to load page:', error);
        alert('Sayfa yüklenirken hata oluştu');
      } finally {
        setPageLoading(false);
      }
    };

    loadPageData();
  }, [pageId]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px',
    border: 'none',
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
    backgroundColor: 'transparent',
    color: active ? '#3b82f6' : colors.textMuted,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: colors.background,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: colors.text,
    }}>
      {pageLoading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: 16,
          color: '#6b7280',
        }}>
          Sayfa yükleniyor...
        </div>
      ) : (
        <>
          {/* Top Toolbar */}
          <Toolbar 
            onCreateComponent={() => setShowComponentModal(true)} 
            onExport={() => setShowExportModal(true)}
            onImport={() => setShowImportModal(true)}
            pageId={pageId}
            pageTitle={pageTitle}
            onBackToDashboard={() => navigate('/')}
          />
          
          {/* Breakpoint Bar */}
      <BreakpointBar />
      
      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Left Panel - Layers / Components / Templates */}
        <div style={{ 
          width: 300, 
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: colors.surface,
          borderRight: `1px solid ${colors.border}`,
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}` }}>
            <button style={tabStyle(leftPanelTab === 'layers')} onClick={() => setLeftPanelTab('layers')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              Katmanlar
            </button>
            <button style={tabStyle(leftPanelTab === 'components')} onClick={() => setLeftPanelTab('components')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Bileşenler
            </button>
            <button style={tabStyle(leftPanelTab === 'templates')} onClick={() => setLeftPanelTab('templates')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              Şablonlar
            </button>
          </div>
          
          {/* Panel Content */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {leftPanelTab === 'layers' && (
              <>
                <LayersPanel />
                <DesignTokensPanel />
              </>
            )}
            {leftPanelTab === 'components' && (
              <>
                <ComponentLibraryPanel />
                <ComponentExportPanel />
              </>
            )}
            {leftPanelTab === 'templates' && (
              <ErrorBoundary>
                <TemplateBrowserPanel />
              </ErrorBoundary>
            )}
          </div>
        </div>
        
        {/* Center - Canvas */}
        {showRulers ? (
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '20px 1fr',
            gridTemplateRows: '20px 1fr',
            overflow: 'hidden',
            backgroundColor: colors.surface, 
          }}>
            {/* Corner */}
            <div style={{ gridColumn: '1', gridRow: '1', backgroundColor: colors.surface, borderRight: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}`, zIndex: 20 }} />
            
            {/* Top Ruler */}
            <div style={{ gridColumn: '2', gridRow: '1', overflow: 'hidden' }}>
              <Ruler orientation="horizontal" scale={zoom} scrollOffset={scrollPos.x} />
            </div>

            {/* Left Ruler */}
            <div style={{ gridColumn: '1', gridRow: '2', overflow: 'hidden' }}>
              <Ruler orientation="vertical" scale={zoom} scrollOffset={scrollPos.y} />
            </div>

            {/* Canvas Area with Scroll */}
            <div 
              style={{
                gridColumn: '2',
                gridRow: '2',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: 40,
                overflow: 'auto',
                backgroundColor: resolvedTheme === 'dark' ? '#1a1a2e' : '#e5e7eb',
              }}
              onScroll={handleScroll}
            >
              <CanvasRenderer width={canvasWidth} height={800} />
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: 40,
            overflow: 'auto',
            backgroundColor: resolvedTheme === 'dark' ? '#1a1a2e' : '#e5e7eb',
          }}>
            <CanvasRenderer width={canvasWidth} height={800} />
          </div>
        )}
        
        {/* Right Panel - Reorganized for Usability */}
        <div style={{ 
          width: 320, 
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'auto',
          backgroundColor: colors.surface,
          borderLeft: `1px solid ${colors.border}`,
        }}>
          {/* Priority 1: Spacing & Layout */}
          <SpacingPanel />
          <AutoLayoutPanel />
          <LayoutPanel />
          <ConstraintsPanel />
          <AlignPanel />
          
          {/* Priority 2: Typography & Appearance */}
          <TypographyPanel />
          <BorderPanel />
          <GradientPanel />
          <MultipleShadowPanel />
          <FiltersPanel />
          <TransformPanel />
          <TextShadowPanel />
          
          {/* Priority 3: Interactions */}
          <InteractionsPanel />
          
          {/* Menu Properties (shows when menu element selected) */}
          <MenuPropertiesPanel />
          
          {/* Priority 4: Preview & Code */}
          <PreviewPanel />
          <CodeViewerPanel />
          
          {/* Advanced (Component System) - Hidden by default for simpler UI */}
          {/* <ComponentInstancePanel />
          <ComponentDiffPanel />
          <ComponentVariantsPanel />
          <ComponentStatesPanel />
          <ComponentPropsEditorPanel />
          <ComponentUsagePanel />
          <EffectsLibraryPanel />
          <GridEditorPanel />
          <FlexItemPanel /> */}
          
          {/* Properties (fallback) */}
          <PropertiesPanel />
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Modals */}
      <CreateComponentModal 
        isOpen={showComponentModal} 
        onClose={() => setShowComponentModal(false)} 
      />
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
      <ImportModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
      />
        </>
      )}
    </div>
  );
});
