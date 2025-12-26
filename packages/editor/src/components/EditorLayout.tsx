/**
 * Editor Layout - Main 3-column editor layout
 */

import React, { memo, useState } from 'react';
import { CanvasRenderer } from '@builder/canvas';
import { useResponsiveStore } from '@builder/core';
import { Toolbar } from './Toolbar';
import { ToastContainer } from './ToastContainer';
import { BreakpointBar } from './BreakpointBar';
import { CreateComponentModal } from './CreateComponentModal';
import { 
  LayersPanel, 
  PropertiesPanel, 
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
} from '../panels';
import { useKeyboardShortcuts } from '../hooks';

export const EditorLayout = memo(function EditorLayout() {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();
  
  // Get responsive breakpoint width
  const getActiveBreakpointWidth = useResponsiveStore((state) => state.getActiveBreakpointWidth);
  const canvasWidth = getActiveBreakpointWidth();
  
  // Modal state
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [leftPanelTab, setLeftPanelTab] = useState<'layers' | 'components'>('layers');

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px',
    border: 'none',
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
    backgroundColor: 'transparent',
    color: active ? '#3b82f6' : '#6b7280',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    }}>
      {/* Top Toolbar */}
      <Toolbar onCreateComponent={() => setShowComponentModal(true)} />
      
      {/* Breakpoint Bar */}
      <BreakpointBar />
      
      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Left Panel - Layers / Components */}
        <div style={{ 
          width: 300, 
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <button style={tabStyle(leftPanelTab === 'layers')} onClick={() => setLeftPanelTab('layers')}>
              📑 Katmanlar
            </button>
            <button style={tabStyle(leftPanelTab === 'components')} onClick={() => setLeftPanelTab('components')}>
              🧩 Bileşenler
            </button>
          </div>
          
          {/* Panel Content */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {leftPanelTab === 'layers' ? (
              <>
                <LayersPanel />
                <DesignTokensPanel />
              </>
            ) : (
              <>
                <ComponentLibraryPanel />
                <ComponentExportPanel />
              </>
            )}
          </div>
        </div>
        
        {/* Center - Canvas */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          overflow: 'auto',
          backgroundColor: '#e5e7eb',
        }}>
          <CanvasRenderer width={canvasWidth} height={800} />
        </div>
        
        {/* Right Panel - All Pro Panels */}
        <div style={{ 
          width: 360, 
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'auto',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #e5e7eb',
        }}>
          {/* Component Panels (conditional) */}
          <ComponentInstancePanel />
          <ComponentDiffPanel />
          <ComponentVariantsPanel />
          <ComponentStatesPanel />
          <ComponentPropsEditorPanel />
          <ComponentUsagePanel />
          
          {/* Layout */}
          <AutoLayoutPanel />
          <GridEditorPanel />
          <FlexItemPanel />
          <ConstraintsPanel />
          <SpacingPanel />
          <LayoutPanel />
          <AlignPanel />
          
          {/* Appearance */}
          <TransformPanel />
          <BorderPanel />
          <MultipleShadowPanel />
          <GradientPanel />
          <FiltersPanel />
          <EffectsLibraryPanel />
          
          {/* Typography */}
          <TypographyPanel />
          <TextShadowPanel />
          
          {/* Properties */}
          <PropertiesPanel />
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Create Component Modal */}
      <CreateComponentModal 
        isOpen={showComponentModal} 
        onClose={() => setShowComponentModal(false)} 
      />
    </div>
  );
});
