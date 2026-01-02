/**
 * Menu Renderer - Renders navigation menu from CMS with dropdown submenus and mega menus
 */

import React, { memo, useEffect, useState } from 'react';
import { MenuElement, cmsService, Menu, MenuItem, useThemeStore, themeColors, useCanvasStore, useSettingsStore } from '@builder/core';
import { ContainerRenderer } from './ContainerRenderer';
import { ElementRenderer } from '../ElementRenderer';

interface MenuRendererProps {
  element: MenuElement;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isPreview?: boolean;
}

export const MenuRenderer = memo(function MenuRenderer({
  element,
  isSelected,
  isHovered,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  isPreview,
}: MenuRendererProps) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);

  // Get canvas elements for mega menu containers
  const elements = useCanvasStore((state) => state.elements);
  const zoom = useSettingsStore((state) => state.zoom);

  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  const { 
    menuId, 
    layout = 'horizontal', 
    showSubmenuIndicator = true,
    dropdownOpenAs = 'hover',
    submenuStyle = {},
    itemStyle = {},
    megaMenuBindings = {},
    megaMenuPosition = 'full-width'
  } = element.props;

  // We rely on the user's designed position (e.g. container style top/margin) for full-width menus
  // This respects the "Design Fidelity" request.
  // No dynamic calculation needed.

  // Default submenu styles
  const submenuDefaults = {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: 8,
    minWidth: 180,
    itemPadding: '8px 16px',
    itemHoverBg: colors.primary + '15',
    itemHoverColor: colors.primary,
    fontSize: 13,
    fontWeight: 400,
    animation: 'fade' as const,
  };

  const mergedSubmenuStyle = { ...submenuDefaults, ...submenuStyle };

  // Fetch menu data when menuId changes
  useEffect(() => {
    if (!menuId) {
      setMenu(null);
      return;
    }

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await cmsService.getMenuWithItems(menuId);
        setMenu(data);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
        setError('Menü yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [menuId]);

  // Compute styles
  const containerStyle: React.CSSProperties = {
    ...element.style,
    display: layout === 'horizontal' ? 'flex' : 'block',
    flexDirection: layout === 'horizontal' ? 'row' : 'column',
    gap: itemStyle.gap ?? (layout === 'horizontal' ? 24 : 8),
    alignItems: layout === 'horizontal' ? 'center' : 'stretch',
    // Selection indicator removed - handled by ElementControls overlay
    cursor: 'pointer',
    minHeight: 40,
    padding: element.style.padding || '8px 16px',
    // position: 'relative', // Removed to allow full-width mega menus to span the parent (e.g. Header)
  };

  const menuItemStyle: React.CSSProperties = {
    color: element.style.color || colors.text,
    fontSize: element.style.fontSize || 14,
    fontWeight: element.style.fontWeight || 500,
    textDecoration: 'none',
    cursor: 'pointer',
    padding: itemStyle.padding || (layout === 'vertical' ? '8px 0' : '8px 12px'),
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    borderRadius: itemStyle.borderRadius ?? 4,
    transition: 'all 0.15s ease',
  };

  // Submenu dropdown style
  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: layout === 'horizontal' ? '100%' : 0,
    left: layout === 'horizontal' ? 0 : '100%',
    marginTop: layout === 'horizontal' ? 8 : 0,
    marginLeft: layout === 'horizontal' ? 0 : 8,
    backgroundColor: mergedSubmenuStyle.backgroundColor,
    borderRadius: mergedSubmenuStyle.borderRadius,
    border: `${mergedSubmenuStyle.borderWidth}px solid ${mergedSubmenuStyle.borderColor}`,
    boxShadow: mergedSubmenuStyle.boxShadow,
    padding: mergedSubmenuStyle.padding,
    minWidth: mergedSubmenuStyle.minWidth,
    zIndex: 1000,
    opacity: 1,
    animation: mergedSubmenuStyle.animation === 'fade' ? 'menuFadeIn 0.15s ease' : 
               mergedSubmenuStyle.animation === 'slide' ? 'menuSlideIn 0.15s ease' : 'none',
  };

  // Mega menu container style
  const megaMenuStyle: React.CSSProperties = {
    position: megaMenuPosition === 'full-width' ? 'fixed' : 'absolute',
    top: megaMenuPosition === 'full-width' ? 0 : '100%', // Full width starts at canvas 0 (design fidelity)
    left: 0,
    right: megaMenuPosition === 'full-width' ? 0 : undefined,
    width: megaMenuPosition === 'full-width' ? '100%' : undefined,
    height: megaMenuPosition === 'full-width' ? 0 : undefined, // Allow overflow to show content at designed position
    overflow: megaMenuPosition === 'full-width' ? 'visible' : undefined,
    minWidth: megaMenuPosition === 'full-width' ? '100%' : 300,
    marginTop: megaMenuPosition === 'full-width' ? 0 : 8,
    zIndex: 1001,
    animation: 'menuFadeIn 0.2s ease',
  };

  // Submenu item style
  const submenuItemStyle: React.CSSProperties = {
    padding: mergedSubmenuStyle.itemPadding,
    fontSize: mergedSubmenuStyle.fontSize,
    fontWeight: mergedSubmenuStyle.fontWeight,
    color: colors.text,
    cursor: 'pointer',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.15s ease',
  };

  // Render submenu item
  const renderSubmenuItem = (item: MenuItem) => {
    return (
      <div
        key={item.id}
        style={submenuItemStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = mergedSubmenuStyle.itemHoverBg || '';
          e.currentTarget.style.color = mergedSubmenuStyle.itemHoverColor || '';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = colors.text;
        }}
      >
        {item.title}
      </div>
    );
  };

  // Render mega menu container
  const renderMegaMenu = (containerId: string) => {
    const container = elements[containerId];
    if (!container || container.type !== 'container') return null;

    return (
      <div style={megaMenuStyle}>
        <ContainerRenderer
          element={container as any}
          isSelected={false}
          isHovered={false}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
        >
          {container.children.map((childId) => (
            <ElementRenderer key={childId} elementId={childId} isPreview={isPreview} />
          ))}
        </ContainerRenderer>
      </div>
    );
  };

  // Render menu item with dropdown or mega menu
  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const megaMenuContainerId = megaMenuBindings[item.id];
    const hasMegaMenu = !!megaMenuContainerId && !!elements[megaMenuContainerId];
    const isOpen = hoveredItemId === item.id;
    const showIndicator = showSubmenuIndicator && (hasChildren || hasMegaMenu);
    
    const isFullWidthMegaMenu = hasMegaMenu && megaMenuPosition === 'full-width';

    return (
      <div 
        key={item.id} 
        data-menu-item-id={item.id}
        style={{ position: isFullWidthMegaMenu ? 'static' : 'relative' }}
        onMouseEnter={() => dropdownOpenAs === 'hover' && setHoveredItemId(item.id)}
        onMouseLeave={() => dropdownOpenAs === 'hover' && setHoveredItemId(null)}
      >
        <div
          style={{
            ...menuItemStyle,
            ...(hasMegaMenu ? { position: 'relative' } : {}),
          }}
          onMouseEnter={(e) => {
            if (itemStyle.hoverBg) e.currentTarget.style.backgroundColor = itemStyle.hoverBg;
            if (itemStyle.hoverColor) e.currentTarget.style.color = itemStyle.hoverColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = element.style.color || colors.text;
          }}
          onClick={() => dropdownOpenAs === 'click' && setHoveredItemId(isOpen ? null : item.id)}
        >
          {item.title}
          {/* Mega Menu Badge */}
          {hasMegaMenu && (
            <span style={{
              fontSize: 9,
              backgroundColor: colors.primary,
              color: 'white',
              padding: '2px 4px',
              borderRadius: 3,
              marginLeft: 4,
              fontWeight: 600,
            }}>
              MEGA
            </span>
          )}
          {showIndicator && (
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ 
                marginLeft: 4,
                transform: layout === 'horizontal' ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.15s ease'
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
        
        {/* Mega Menu or Regular Dropdown */}
        {isOpen && hasMegaMenu && renderMegaMenu(megaMenuContainerId)}
        
        {/* Regular Dropdown Submenu */}
        {isOpen && !hasMegaMenu && hasChildren && (
          <div style={dropdownStyle}>
            {item.children?.filter(child => child.is_active !== false).map(renderSubmenuItem)}
          </div>
        )}
      </div>
    );
  };

  // CSS animations for dropdown
  const animationStyles = `
    @keyframes menuFadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes menuSlideIn {
      from { opacity: 0; transform: translateX(-8px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `;

  // Placeholder state when no menu selected
  if (!menuId) {
    return (
      <div
        data-element-id={element.id}
        style={{
          ...containerStyle,
          backgroundColor: colors.surface,
          border: `2px dashed ${colors.border}`,
          justifyContent: 'center',
          color: colors.textMuted,
          fontSize: 13,
        }}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        Menü seçin...
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div
        data-element-id={element.id}
        style={{
          ...containerStyle,
          justifyContent: 'center',
          color: colors.textMuted,
        }}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        Yükleniyor...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        data-element-id={element.id}
        style={{
          ...containerStyle,
          justifyContent: 'center',
          color: colors.danger,
        }}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {error}
      </div>
    );
  }

  // No items
  if (!menu?.items || menu.items.length === 0) {
    return (
      <div
        data-element-id={element.id}
        style={{
          ...containerStyle,
          justifyContent: 'center',
          color: colors.textMuted,
          fontStyle: 'italic',
        }}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        Menü boş: {menu?.name}
      </div>
    );
  }

  // Render menu items with dropdowns and mega menus
  return (
    <>
      <style>{animationStyles}</style>
      <nav
        data-element-id={element.id}
        style={containerStyle}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {menu.items
          .filter(item => (item.is_active !== false) && item.parent_id === null)
          .sort((a, b) => a.order_index - b.order_index)
          .map(item => renderMenuItem(item))}
      </nav>
    </>
  );
});
