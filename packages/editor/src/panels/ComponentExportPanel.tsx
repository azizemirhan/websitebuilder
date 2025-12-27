/**
 * Component Export Panel - Export/Import components
 */

import React, { memo, useCallback, useRef } from 'react';
import { useComponentStore, useCanvasStore, useToastStore } from '@builder/core';

export const ComponentExportPanel = memo(function ComponentExportPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);

  const instances = useComponentStore((state) => state.instances);
  const components = useComponentStore((state) => state.components);
  const createComponent = useComponentStore((state) => state.createComponent);
  const updateComponent = useComponentStore((state) => state.updateComponent);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  const instance = selectedElement ? instances[selectedElement.id] : null;
  const component = instance ? components[instance.componentId] : null;

  const handleExportComponent = useCallback(() => {
    if (!component) return;

    const exportData = {
      version: '1.0',
      type: 'component',
      exportedAt: new Date().toISOString(),
      component: {
        name: component.name,
        description: component.description,
        category: component.category,
        tags: component.tags,
        elements: component.elements,
        rootElementId: component.rootElementId,
        variants: component.variants,
        props: component.props,
      },
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.name.toLowerCase().replace(/\s+/g, '-')}.component.json`;
    a.click();

    URL.revokeObjectURL(url);
    useToastStore.getState().addToast(`"${component.name}" dışa aktarıldı`, 'success');
  }, [component]);

  const handleExportAllComponents = useCallback(() => {
    const allComponents = Object.values(components);
    if (allComponents.length === 0) {
      useToastStore.getState().addToast('Dışa aktarılacak bileşen yok', 'warning');
      return;
    }

    const exportData = {
      version: '1.0',
      type: 'component-library',
      exportedAt: new Date().toISOString(),
      components: allComponents.map(comp => ({
        name: comp.name,
        description: comp.description,
        category: comp.category,
        tags: comp.tags,
        elements: comp.elements,
        rootElementId: comp.rootElementId,
        variants: comp.variants,
        props: comp.props,
      })),
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'component-library.json';
    a.click();

    URL.revokeObjectURL(url);
    useToastStore.getState().addToast(`${allComponents.length} bileşen dışa aktarıldı`, 'success');
  }, [components]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        // Check if it's a template kit
        if (data.sections && data.elements === undefined && data.component === undefined) {
          useToastStore.getState().addToast('Bu dosya bir Şablon (Template). Lütfen "Şablonlar" panelinden yükleyin.', 'warning', 5000);
          e.target.value = '';
          return;
        }

        if (data.type === 'component') {
          // Import single component
          const comp = data.component;
          const id = createComponent(comp.name, comp.elements, comp.rootElementId, comp.category);
          updateComponent(id, {
            description: comp.description,
            tags: comp.tags,
            variants: comp.variants,
            props: comp.props,
          });
          useToastStore.getState().addToast(`"${comp.name}" içe aktarıldı`, 'success');
        } else if (data.type === 'component-library') {
          // Import multiple components
          data.components.forEach((comp: typeof data.component) => {
            const id = createComponent(comp.name, comp.elements, comp.rootElementId, comp.category);
            updateComponent(id, {
              description: comp.description,
              tags: comp.tags,
              variants: comp.variants,
              props: comp.props,
            });
          });
          useToastStore.getState().addToast(`${data.components.length} bileşen içe aktarıldı`, 'success');
        } else {
          useToastStore.getState().addToast('Geçersiz dosya formatı', 'error');
        }
      } catch (err) {
        useToastStore.getState().addToast('Dosya okunamadı', 'error');
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  }, [createComponent, updateComponent]);

  const componentCount = Object.keys(components).length;

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 12, textTransform: 'uppercase' }}>
        Dışa / İçe Aktar
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.component.json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Export Current Component */}
      {component && (
        <button
          style={{
            width: '100%',
            padding: 12,
            border: '1px solid #10b981',
            borderRadius: 8,
            backgroundColor: '#ecfdf5',
            color: '#059669',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onClick={handleExportComponent}
        >
          📤 "{component.name}" Dışa Aktar
        </button>
      )}

      {/* Export All */}
      <button
        style={{
          width: '100%',
          padding: 12,
          border: '1px solid #3b82f6',
          borderRadius: 8,
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          fontSize: 12,
          fontWeight: 500,
          cursor: componentCount > 0 ? 'pointer' : 'not-allowed',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: componentCount > 0 ? 1 : 0.5,
        }}
        onClick={handleExportAllComponents}
        disabled={componentCount === 0}
      >
        📦 Tüm Kütüphaneyi Dışa Aktar ({componentCount})
      </button>

      {/* Import */}
      <button
        style={{
          width: '100%',
          padding: 12,
          border: '1px solid #8b5cf6',
          borderRadius: 8,
          backgroundColor: '#f5f3ff',
          color: '#6d28d9',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        onClick={handleImportClick}
      >
        📥 Bileşen İçe Aktar
      </button>

      {/* Info */}
      <div style={{
        marginTop: 12,
        padding: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 6,
        fontSize: 10,
        color: '#6b7280',
        lineHeight: 1.5,
      }}>
        💡 Bileşenlerinizi JSON formatında dışa aktarabilir ve başka projelere aktarabilirsiniz.
      </div>
    </div>
  );
});
