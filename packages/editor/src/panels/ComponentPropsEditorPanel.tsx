/**
 * Component Props Editor Panel - Visual props management
 */

import React, { memo, useState } from 'react';
import { useComponentStore, useCanvasStore } from '@builder/core';

type PropType = 'string' | 'number' | 'boolean' | 'color' | 'select';

export const ComponentPropsEditorPanel = memo(function ComponentPropsEditorPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  
  const instances = useComponentStore((state) => state.instances);
  const components = useComponentStore((state) => state.components);
  const addProp = useComponentStore((state) => state.addProp);
  const updateProp = useComponentStore((state) => state.updateProp);
  const deleteProp = useComponentStore((state) => state.deleteProp);
  
  const [isAddingProp, setIsAddingProp] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<PropType>('string');
  const [newPropDefault, setNewPropDefault] = useState('');
  const [newPropOptions, setNewPropOptions] = useState('');
  const [editingPropId, setEditingPropId] = useState<string | null>(null);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  const instance = selectedElement ? instances[selectedElement.id] : null;
  const component = instance ? components[instance.componentId] : null;

  if (!component) {
    return null;
  }

  const handleAddProp = () => {
    if (!newPropName.trim()) return;
    
    let defaultValue: unknown = newPropDefault;
    if (newPropType === 'number') defaultValue = Number(newPropDefault) || 0;
    if (newPropType === 'boolean') defaultValue = newPropDefault === 'true';
    
    addProp(component.id, {
      name: newPropName.trim(),
      type: newPropType,
      defaultValue,
      options: newPropType === 'select' ? newPropOptions.split(',').map(o => o.trim()) : undefined,
    });
    
    setNewPropName('');
    setNewPropDefault('');
    setNewPropOptions('');
    setIsAddingProp(false);
  };

  const handleDeleteProp = (propId: string) => {
    if (confirm('Bu prop silinsin mi?')) {
      deleteProp(component.id, propId);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 12,
  };

  const typeIcons: Record<PropType, string> = {
    string: '📝',
    number: '🔢',
    boolean: '✅',
    color: '🎨',
    select: '📋',
  };

  return (
    <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
          Bileşen Özellikleri ({component.props.length})
        </span>
        <button
          style={{
            padding: '4px 8px',
            border: '1px solid #3b82f6',
            borderRadius: 4,
            backgroundColor: '#eff6ff',
            color: '#3b82f6',
            fontSize: 10,
            cursor: 'pointer',
          }}
          onClick={() => setIsAddingProp(true)}
        >
          + Ekle
        </button>
      </div>

      {/* Add Prop Form */}
      {isAddingProp && (
        <div style={{ 
          padding: 12, 
          backgroundColor: '#f9fafb', 
          borderRadius: 8, 
          marginBottom: 12,
          border: '1px solid #e5e7eb',
        }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Özellik Adı</div>
            <input
              type="text"
              style={inputStyle}
              value={newPropName}
              onChange={(e) => setNewPropName(e.target.value)}
              placeholder="örn: buttonText, isDisabled"
              autoFocus
            />
          </div>
          
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Tür</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {(['string', 'number', 'boolean', 'color', 'select'] as PropType[]).map((type) => (
                <button
                  key={type}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid',
                    borderColor: newPropType === type ? '#3b82f6' : '#e5e7eb',
                    borderRadius: 6,
                    backgroundColor: newPropType === type ? '#dbeafe' : '#fff',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                  onClick={() => setNewPropType(type)}
                >
                  {typeIcons[type]} {type}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Varsayılan Değer</div>
            {newPropType === 'boolean' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{
                    ...inputStyle,
                    backgroundColor: newPropDefault === 'true' ? '#dbeafe' : '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => setNewPropDefault('true')}
                >
                  ✅ True
                </button>
                <button
                  style={{
                    ...inputStyle,
                    backgroundColor: newPropDefault === 'false' ? '#dbeafe' : '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => setNewPropDefault('false')}
                >
                  ❌ False
                </button>
              </div>
            ) : newPropType === 'color' ? (
              <input
                type="color"
                style={{ ...inputStyle, height: 40, padding: 4 }}
                value={newPropDefault || '#000000'}
                onChange={(e) => setNewPropDefault(e.target.value)}
              />
            ) : (
              <input
                type={newPropType === 'number' ? 'number' : 'text'}
                style={inputStyle}
                value={newPropDefault}
                onChange={(e) => setNewPropDefault(e.target.value)}
                placeholder={newPropType === 'number' ? '0' : 'varsayılan değer'}
              />
            )}
          </div>
          
          {newPropType === 'select' && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Seçenekler (virgülle ayır)</div>
              <input
                type="text"
                style={inputStyle}
                value={newPropOptions}
                onChange={(e) => setNewPropOptions(e.target.value)}
                placeholder="seçenek1, seçenek2, seçenek3"
              />
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              style={{
                padding: '6px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                backgroundColor: '#fff',
                fontSize: 11,
                cursor: 'pointer',
              }}
              onClick={() => setIsAddingProp(false)}
            >
              İptal
            </button>
            <button
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 4,
                backgroundColor: '#3b82f6',
                color: '#fff',
                fontSize: 11,
                cursor: 'pointer',
              }}
              onClick={handleAddProp}
            >
              Oluştur
            </button>
          </div>
        </div>
      )}

      {/* Props List */}
      {component.props.length === 0 ? (
        <div style={{ 
          padding: 24, 
          textAlign: 'center', 
          color: '#9ca3af',
          fontSize: 12,
          backgroundColor: '#f9fafb',
          borderRadius: 8,
        }}>
          Henüz özellik yok.
          <br />
          <span style={{ fontSize: 11 }}>Bileşeninize dinamik özellikler ekleyin.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {component.props.map((prop) => (
            <div
              key={prop.id}
              style={{
                padding: 12,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                backgroundColor: editingPropId === prop.id ? '#f9fafb' : '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{typeIcons[prop.type]}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{prop.name}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>
                      {prop.type} · varsayılan: {String(prop.defaultValue)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                    onClick={() => setEditingPropId(editingPropId === prop.id ? null : prop.id)}
                  >
                    ✏️
                  </button>
                  <button
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: 12,
                      cursor: 'pointer',
                      color: '#dc2626',
                    }}
                    onClick={() => handleDeleteProp(prop.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* Editing Form */}
              {editingPropId === prop.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Varsayılan Değer</div>
                    <input
                      type={prop.type === 'number' ? 'number' : 'text'}
                      style={inputStyle}
                      value={String(prop.defaultValue)}
                      onChange={(e) => {
                        let value: unknown = e.target.value;
                        if (prop.type === 'number') value = Number(e.target.value);
                        if (prop.type === 'boolean') value = e.target.value === 'true';
                        updateProp(component.id, prop.id, { defaultValue: value });
                      }}
                    />
                  </div>
                  {prop.type === 'select' && prop.options && (
                    <div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Seçenekler</div>
                      <input
                        type="text"
                        style={inputStyle}
                        value={prop.options.join(', ')}
                        onChange={(e) => {
                          updateProp(component.id, prop.id, { 
                            options: e.target.value.split(',').map(o => o.trim()) 
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
