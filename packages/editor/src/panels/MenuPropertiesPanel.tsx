/**
 * Menu Properties Panel - Settings for Menu element with submenu and mega menu styling
 */

import React, { memo, useState, useEffect, useCallback } from 'react';
import { useCanvasStore, useHistoryStore, CanvasState, cmsService, Menu, MenuItem, useThemeStore, themeColors } from '@builder/core';

export const MenuPropertiesPanel = memo(function MenuPropertiesPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedIds = useCanvasStore((state) => state.selectedElementIds);
  const updateElement = useCanvasStore((state) => state.updateElement);
  const addToHistory = useHistoryStore((state) => state.addToHistory);

  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  // Menu list state
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;
  const isMenuElement = selectedElement?.type === 'menu';

  // Load menus from backend
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const data = await cmsService.listMenus();
        setMenus(data);
      } catch (error) {
        console.error('Failed to load menus:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isMenuElement) {
      fetchMenus();
    }
  }, [isMenuElement]);

  // Load selected menu details
  const props = isMenuElement ? (selectedElement?.props as any) || {} : {};
  
  useEffect(() => {
    const fetchMenuDetails = async () => {
      if (props.menuId) {
        try {
          const data = await cmsService.getMenuWithItems(props.menuId);
          setMenu(data);
        } catch (error) {
          console.error('Failed to load menu details:', error);
        }
      } else {
        setMenu(null);
      }
    };
    
    if (isMenuElement && props.menuId) {
      fetchMenuDetails();
    }
  }, [isMenuElement, props.menuId]);

  const saveHistory = useCallback(() => {
    const state = useCanvasStore.getState();
    const snapshot: CanvasState = {
      elements: state.elements,
      rootElementIds: state.rootElementIds,
      selectedElementIds: state.selectedElementIds,
      hoveredElementId: state.hoveredElementId,
    };
    addToHistory(snapshot);
  }, [addToHistory]);

  if (!isMenuElement || !selectedElement) {
    return null;
  }

  const submenuStyle = props.submenuStyle || {};
  const itemStyle = props.itemStyle || {};

  const handleChange = (key: string, value: any) => {
    saveHistory();
    updateElement(selectedElement.id, {
      props: {
        ...props,
        [key]: value,
      },
    } as any);
  };

  const handleSubmenuStyleChange = (key: string, value: any) => {
    saveHistory();
    updateElement(selectedElement.id, {
      props: {
        ...props,
        submenuStyle: {
          ...submenuStyle,
          [key]: value,
        },
      },
    } as any);
  };

  const handleItemStyleChange = (key: string, value: any) => {
    saveHistory();
    updateElement(selectedElement.id, {
      props: {
        ...props,
        itemStyle: {
          ...itemStyle,
          [key]: value,
        },
      },
    } as any);
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    display: 'block',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 13,
    backgroundColor: colors.surface,
    color: colors.text,
    cursor: 'pointer',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 10px',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 12,
    backgroundColor: colors.surface,
    color: colors.text,
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '6px 10px',
    border: `1px solid ${active ? colors.primary : colors.border}`,
    borderRadius: 6,
    backgroundColor: active ? colors.primary + '20' : colors.surface,
    color: active ? colors.primary : colors.text,
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  });

  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    cursor: 'pointer',
    borderTop: `1px solid ${colors.border}`,
    marginTop: 12,
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Get containers for mega menu binding
  const containers = Object.values(elements).filter(
    el => el.type === 'container' && el.id !== selectedElement?.id
  );

  return (
    <div style={{ padding: 16, borderBottom: `1px solid ${colors.border}` }}>
      <div style={{ 
        fontSize: 11, 
        fontWeight: 600, 
        color: colors.textMuted, 
        marginBottom: 16, 
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        Menü Ayarları
      </div>

      {/* Menu Selection */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Menü Seç</label>
        <select
          value={props.menuId || ''}
          onChange={(e) => handleChange('menuId', e.target.value ? parseInt(e.target.value) : null)}
          style={selectStyle}
          disabled={loading}
        >
          <option value="">-- Menü seçin --</option>
          {menus.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} {m.location && `(${m.location})`}
            </option>
          ))}
        </select>
      </div>

      {/* Layout */}
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Yön</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            style={buttonStyle(props.layout === 'horizontal' || !props.layout)}
            onClick={() => handleChange('layout', 'horizontal')}
          >
            ↔ Yatay
          </button>
          <button
            style={buttonStyle(props.layout === 'vertical')}
            onClick={() => handleChange('layout', 'vertical')}
          >
            ↕ Dikey
          </button>
        </div>
      </div>

      {/* Dropdown Behavior */}
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Alt Menü Açılışı</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            style={buttonStyle(props.dropdownOpenAs === 'hover' || !props.dropdownOpenAs)}
            onClick={() => handleChange('dropdownOpenAs', 'hover')}
          >
            Hover
          </button>
          <button
            style={buttonStyle(props.dropdownOpenAs === 'click')}
            onClick={() => handleChange('dropdownOpenAs', 'click')}
          >
            Click
          </button>
        </div>
      </div>

      {/* Submenu Indicator */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={props.showSubmenuIndicator !== false}
            onChange={(e) => handleChange('showSubmenuIndicator', e.target.checked)}
            style={{ accentColor: colors.primary }}
          />
          <span>Alt menü göstergesi</span>
        </label>
      </div>

      {/* ============== MEGA MENU SECTION ============== */}
      <div style={sectionHeaderStyle} onClick={() => toggleSection('mega')}>
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.text, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 9,
            backgroundColor: colors.primary,
            color: 'white',
            padding: '2px 5px',
            borderRadius: 3,
            fontWeight: 700,
          }}>
            MEGA
          </span>
          Mega Menü
        </span>
        <svg 
          width="12" height="12" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2"
          style={{ transform: expandedSection === 'mega' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expandedSection === 'mega' && (
        <div style={{ paddingTop: 12 }}>
          <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>
            Menü öğelerine tasarladığınız container'ları bağlayarak mega menü oluşturun.
          </div>
          
          {/* Visibility Toggle */}
          <div style={{ marginBottom: 16, padding: 8, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 6 }}>
             <label style={{ ...labelStyle, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: colors.text }}>
              <input
                type="checkbox"
                checked={!!props.showMegaMenuContainers}
                onChange={(e) => handleChange('showMegaMenuContainers', e.target.checked)}
                style={{ accentColor: colors.primary }}
              />
              <span>Mega Menüleri Göster (Düzenle)</span>
            </label>
            <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4, marginLeft: 20 }}>
              Mega menü container'larını canvas üzerinde görünür yapar.
            </div>
          </div>
          
          {/* Position Mode */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Mega Menü Konumu</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                style={buttonStyle(props.megaMenuPosition === 'below' || !props.megaMenuPosition)}
                onClick={() => handleChange('megaMenuPosition', 'below')}
              >
                Altında
              </button>
              <button
                style={buttonStyle(props.megaMenuPosition === 'full-width')}
                onClick={() => handleChange('megaMenuPosition', 'full-width')}
              >
                Tam Genişlik
              </button>
            </div>
          </div>

          {/* Menu Item -> Container Bindings */}
          {menu?.items && menu.items.filter(item => item.parent_id === null).length > 0 ? (
            <div style={{ marginTop: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 8 }}>Menü Öğesi → Container</label>
              {menu.items
                .filter(item => (item.is_active !== false) && item.parent_id === null)
                .sort((a, b) => a.order_index - b.order_index)
                .map(item => {
                  const megaMenuBindings = props.megaMenuBindings || {};
                  const boundContainerId = megaMenuBindings[item.id];
                  
                  return (
                    <div key={item.id} style={{ 
                      marginBottom: 8, 
                      padding: 8, 
                      backgroundColor: boundContainerId ? colors.primary + '10' : colors.surface,
                      borderRadius: 6,
                      border: `1px solid ${boundContainerId ? colors.primary : colors.border}`,
                    }}>
                      <div style={{ 
                        fontSize: 12, 
                        fontWeight: 600, 
                        color: colors.text,
                        marginBottom: 6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        {item.title}
                        {boundContainerId && (
                          <span style={{
                            fontSize: 9,
                            backgroundColor: colors.primary,
                            color: 'white',
                            padding: '1px 4px',
                            borderRadius: 3,
                          }}>
                            MEGA
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <select
                          value={boundContainerId || ''}
                          onChange={(e) => {
                            const newBindings = { ...megaMenuBindings };
                            if (e.target.value) {
                              newBindings[item.id] = e.target.value;
                            } else {
                              delete newBindings[item.id];
                            }
                            handleChange('megaMenuBindings', newBindings);
                          }}
                          style={{ ...selectStyle, fontSize: 11, padding: '6px 8px', flex: 1 }}
                        >
                          <option value="">-- Container Seç --</option>
                          {containers.map(container => (
                            <option key={container.id} value={container.id}>
                              {container.name || `Container (${container.id.slice(0, 6)})`}
                            </option>
                          ))}
                        </select>
                        {/* Edit Button */}
                        {boundContainerId && (
                          <button
                            onClick={() => {
                                // Select the container to edit it
                                const selectElement = useCanvasStore.getState().selectElement;
                                selectElement(boundContainerId, false);
                                
                                // Also auto-enable showing containers if easier
                                if (!props.showMegaMenuContainers) {
                                  handleChange('showMegaMenuContainers', true);
                                }
                            }}
                            style={{
                                padding: '6px 12px',
                                border: `1px solid ${colors.primary}`,
                                borderRadius: 6,
                                backgroundColor: colors.primary,
                                color: 'white',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}
                            title="Container'ı düzenle"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              
              {containers.length === 0 && (
                <div style={{ 
                  fontSize: 11, 
                  color: colors.textMuted, 
                  padding: 12, 
                  backgroundColor: colors.surface,
                  borderRadius: 6,
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}>
                  Mega menü için önce bir Container elementi ekleyin.
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              fontSize: 11, 
              color: colors.textMuted, 
              padding: 12, 
              backgroundColor: colors.surface,
              borderRadius: 6,
              textAlign: 'center',
            }}>
              Önce bir menü seçin.
            </div>
          )}
        </div>
      )}

      {/* ============== SUBMENU STYLING SECTION ============== */}
      <div style={sectionHeaderStyle} onClick={() => toggleSection('submenu')}>
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>
          Alt Menü Stilleri
        </span>
        <svg 
          width="12" height="12" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2"
          style={{ transform: expandedSection === 'submenu' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expandedSection === 'submenu' && (
        <div style={{ paddingTop: 12 }}>
          {/* Background Color */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Arkaplan Rengi</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="color"
                value={submenuStyle.backgroundColor || colors.surface}
                onChange={(e) => handleSubmenuStyleChange('backgroundColor', e.target.value)}
                style={{ width: 40, height: 32, padding: 0, border: `1px solid ${colors.border}`, borderRadius: 4 }}
              />
              <input
                type="text"
                value={submenuStyle.backgroundColor || ''}
                onChange={(e) => handleSubmenuStyleChange('backgroundColor', e.target.value)}
                placeholder="#ffffff"
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </div>

          {/* Border Radius */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Köşe Yuvarlaklığı</label>
            <input
              type="number"
              value={submenuStyle.borderRadius ?? 8}
              onChange={(e) => handleSubmenuStyleChange('borderRadius', parseInt(e.target.value))}
              style={inputStyle}
              min={0}
              max={32}
            />
          </div>

          {/* Shadow */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Gölge</label>
            <input
              type="text"
              value={submenuStyle.boxShadow || '0 4px 12px rgba(0,0,0,0.15)'}
              onChange={(e) => handleSubmenuStyleChange('boxShadow', e.target.value)}
              placeholder="0 4px 12px rgba(0,0,0,0.15)"
              style={inputStyle}
            />
          </div>

          {/* Animation */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Animasyon</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                style={buttonStyle(submenuStyle.animation === 'fade' || !submenuStyle.animation)}
                onClick={() => handleSubmenuStyleChange('animation', 'fade')}
              >
                Fade
              </button>
              <button
                style={buttonStyle(submenuStyle.animation === 'slide')}
                onClick={() => handleSubmenuStyleChange('animation', 'slide')}
              >
                Slide
              </button>
              <button
                style={buttonStyle(submenuStyle.animation === 'none')}
                onClick={() => handleSubmenuStyleChange('animation', 'none')}
              >
                Yok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============== MENU ITEM STYLING SECTION ============== */}
      <div style={sectionHeaderStyle} onClick={() => toggleSection('items')}>
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>
          Menü Öğe Stilleri
        </span>
        <svg 
          width="12" height="12" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2"
          style={{ transform: expandedSection === 'items' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expandedSection === 'items' && (
        <div style={{ paddingTop: 12 }}>
          {/* Gap */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Öğeler Arası Boşluk (px)</label>
            <input
              type="number"
              value={itemStyle.gap ?? 24}
              onChange={(e) => handleItemStyleChange('gap', parseInt(e.target.value))}
              style={inputStyle}
              min={0}
              max={60}
            />
          </div>

          {/* Hover Colors */}
          <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Hover Arkaplan</label>
              <input
                type="color"
                value={itemStyle.hoverBg || '#f3f4f6'}
                onChange={(e) => handleItemStyleChange('hoverBg', e.target.value)}
                style={{ width: '100%', height: 32, padding: 0, border: `1px solid ${colors.border}`, borderRadius: 4 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Hover Rengi</label>
              <input
                type="color"
                value={itemStyle.hoverColor || colors.primary}
                onChange={(e) => handleItemStyleChange('hoverColor', e.target.value)}
                style={{ width: '100%', height: 32, padding: 0, border: `1px solid ${colors.border}`, borderRadius: 4 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      {props.menuId && (
        <div style={{ 
          marginTop: 16,
          padding: 12,
          backgroundColor: colors.primary + '10',
          borderRadius: 8,
          fontSize: 12,
          color: colors.text,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Seçili: {menus.find(m => m.id === props.menuId)?.name}
          </div>
          <div style={{ color: colors.textMuted }}>
            Menü içeriklerini düzenlemek için Menüler sayfasını kullanın.
          </div>
        </div>
      )}
    </div>
  );
});
