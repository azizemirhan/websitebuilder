import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Page {
  id: number;
  title: string;
}

interface MenuItem {
  id: number;
  menu_id: number;
  parent_id: number | null;
  title: string;
  url: string | null;
  type: 'page' | 'custom' | 'category';
  page_id: number | null;
  target: string;
  css_classes: string | null;
  order_index: number;
  children?: MenuItem[];
  page?: { id: number; title: string };
}

interface Menu {
  id: number;
  name: string;
  location: string | null;
  items?: MenuItem[];
}

// Sortable Menu Item Component
function SortableMenuItem({ 
  item, 
  depth = 0,
  onEdit,
  onDelete,
  onUpdateParent,
  editingItem,
  expandedItems,
  onToggleExpand
}: {
  item: MenuItem;
  depth?: number;
  onEdit: (id: number, updates: Partial<MenuItem>) => void;
  onDelete: (id: number) => void;
  onUpdateParent: (itemId: number, newParentId: number | null) => void;
  editingItem: number | null;
  expandedItems: Set<number>;
  onToggleExpand: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isExpanded = expandedItems.has(item.id);
  const hasChildren = item.children && item.children.length > 0;
  const isEditing = editingItem === item.id;

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        marginLeft: depth * 20,
        marginBottom: 8,
      }}>
        <div style={{
          padding: '12px',
          backgroundColor: '#fff',
          border: isDragging ? '2px solid #3b82f6' : '1px solid #e5e7eb',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            style={{
              cursor: 'grab',
              padding: '4px 8px',
              fontSize: 16,
              color: '#9ca3af',
            }}
          >
            ⋮⋮
          </div>

          {/* Expand/Collapse */}
          {hasChildren && (
            <button
              onClick={() => onToggleExpand(item.id)}
              style={{
                padding: 4,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: '#6b7280',
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}

          {/* Title */}
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <input
                type="text"
                defaultValue={item.title}
                onBlur={(e) => onEdit(item.id, { title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onEdit(item.id, { title: e.currentTarget.value });
                  }
                }}
                autoFocus
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  border: '1px solid #3b82f6',
                  borderRadius: 4,
                  fontSize: 14,
                }}
              />
            ) : (
              <div style={{ fontSize: 14, fontWeight: 500 }}>{item.title}</div>
            )}
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {item.url || '—'}
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={() => onEdit(item.id, {})}
            style={{
              padding: '4px 8px',
              border: '1px solid #e5e7eb',
              borderRadius: 4,
              fontSize: 12,
              cursor: 'pointer',
              backgroundColor: '#fff',
            }}
          >
            Düzenle
          </button>
          <button
            onClick={() => onDelete(item.id)}
            style={{
              padding: '4px 8px',
              border: '1px solid #fee2e2',
              borderRadius: 4,
              fontSize: 12,
              cursor: 'pointer',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
            }}
          >
            Sil
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div style={{ marginTop: 8 }}>
            <SortableContext
              items={item.children!.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {item.children!.map(child => (
                <SortableMenuItem
                  key={child.id}
                  item={child}
                  depth={depth + 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onUpdateParent={onUpdateParent}
                  editingItem={editingItem}
                  expandedItems={expandedItems}
                  onToggleExpand={onToggleExpand}
                />
              ))}
            </SortableContext>
          </div>
        )}
      </div>
    </div>
  );
}

export function MenuEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [menu, setMenu] = useState<Menu | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Left panel state
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [customLinkTitle, setCustomLinkTitle] = useState('');
  const [customLinkUrl, setCustomLinkUrl] = useState('');
  
  // Right panel state
  const [items, setItems] = useState<MenuItem[]>([]);
  const [flatItems, setFlatItems] = useState<MenuItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [editingItem, setEditingItem] = useState<number | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    // Flatten items for drag and drop
    const flatten = (items: MenuItem[]): MenuItem[] => {
      const result: MenuItem[] = [];
      items.forEach(item => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          result.push(...flatten(item.children));
        }
      });
      return result;
    };
    setFlatItems(flatten(items));
  }, [items]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load menu
      const menuRes = await fetch(`http://localhost:8000/api/builder/menus/${id}`);
      if (!menuRes.ok) throw new Error('Failed to load menu');
      const menuData = await menuRes.json();
      setMenu(menuData);
      setItems(menuData.items || []);
      
      // Load pages
      const pagesRes = await fetch('http://localhost:8000/api/builder/pages');
      if (!pagesRes.ok) throw new Error('Failed to load pages');
      const pagesData = await pagesRes.json();
      setPages(pagesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPages = async () => {
    if (selectedPages.length === 0) {
      alert('Lütfen en az bir sayfa seçin');
      return;
    }

    try {
      for (const pageId of selectedPages) {
        const page = pages.find(p => p.id === pageId);
        if (!page) continue;

        const response = await fetch(`http://localhost:8000/api/builder/menus/${id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: page.title,
            type: 'page',
            page_id: pageId,
            url: `/${page.title.toLowerCase().replace(/\s+/g, '-')}`
          })
        });

        if (!response.ok) throw new Error('Failed to add page');
      }

      setSelectedPages([]);
      await loadData();
    } catch (error) {
      console.error('Error adding pages:', error);
      alert('Sayfa eklenirken hata oluştu');
    }
  };

  const handleAddCustomLink = async () => {
    if (!customLinkTitle.trim() || !customLinkUrl.trim()) {
      alert('Başlık ve URL gerekli');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/builder/menus/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customLinkTitle,
          url: customLinkUrl,
          type: 'custom'
        })
      });

      if (!response.ok) throw new Error('Failed to add custom link');

      setCustomLinkTitle('');
      setCustomLinkUrl('');
      await loadData();
    } catch (error) {
      console.error('Error adding custom link:', error);
      alert('Link eklenirken hata oluştu');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Bu menü öğesini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/builder/menu-items/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete item');

      await loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Öğe silinirken hata oluştu');
    }
  };

  const handleUpdateItem = async (itemId: number, updates: Partial<MenuItem>) => {
    if (Object.keys(updates).length === 0) {
      setEditingItem(itemId);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/builder/menu-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update item');

      await loadData();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Öğe güncellenirken hata oluştu');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeItem = flatItems.find(item => item.id === active.id);
    const overItem = flatItems.find(item => item.id === over.id);

    if (!activeItem || !overItem) return;

    console.log('Drag:', activeItem.title, '→', overItem.title);
    console.log('Active parent:', activeItem.parent_id, 'Over parent:', overItem.parent_id);

    // Eğer aynı parent'a sahiplerse, sadece sıralama yap
    if (activeItem.parent_id === overItem.parent_id) {
      console.log('Same parent - reordering');
      
      // Aynı seviyedeki itemleri al
      const siblings = flatItems.filter(item => item.parent_id === activeItem.parent_id);
      const oldIndex = siblings.findIndex(item => item.id === active.id);
      const newIndex = siblings.findIndex(item => item.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return;
      
      // Yeni sıralamayı hesapla
      const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex);
      
      // Her item için yeni order_index'i güncelle
      try {
        for (let i = 0; i < reorderedSiblings.length; i++) {
          await fetch(`http://localhost:8000/api/builder/menu-items/${reorderedSiblings[i].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_index: i })
          });
        }
        
        await loadData();
      } catch (error) {
        console.error('Error reordering items:', error);
        alert('Sıralama sırasında hata oluştu');
      }
    } else {
      // Farklı parent - parent değiştir
      console.log('Different parent - changing parent');
      
      try {
        const response = await fetch(`http://localhost:8000/api/builder/menu-items/${activeItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parent_id: overItem.parent_id
          })
        });

        if (!response.ok) throw new Error('Failed to update item');

        // Eğer yeni parent varsa, onu expand et
        if (overItem.parent_id) {
          setExpandedItems(prev => new Set([...prev, overItem.parent_id!]));
        }
        
        await loadData();
      } catch (error) {
        console.error('Error updating item parent:', error);
        alert('Öğe taşınırken hata oluştu');
      }
    }
  };

  const toggleExpand = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        Yükleniyor...
      </div>
    );
  }

  if (!menu) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        Menü bulunamadı
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/menus')}
            style={{
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            ← Geri
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            {menu.name}
          </h1>
          {menu.location && (
            <span style={{
              padding: '4px 8px',
              backgroundColor: '#f3f4f6',
              borderRadius: 4,
              fontSize: 12,
              color: '#6b7280'
            }}>
              {menu.location}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>
          💡 Menü öğelerini sürükleyerek alt menü oluşturabilirsiniz
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: 24, padding: 24, maxWidth: 1400, margin: '0 auto' }}>
        {/* Left Panel - Add Items */}
        <div style={{ width: 300, flexShrink: 0 }}>
          {/* Add Pages */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            marginBottom: 16
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: 600,
              fontSize: 14
            }}>
              Sayfalar
            </div>
            <div style={{ padding: 16, maxHeight: 300, overflowY: 'auto' }}>
              {pages.map(page => (
                <label
                  key={page.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 0',
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPages.includes(page.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPages([...selectedPages, page.id]);
                      } else {
                        setSelectedPages(selectedPages.filter(id => id !== page.id));
                      }
                    }}
                  />
                  {page.title}
                </label>
              ))}
            </div>
            <div style={{ padding: 16, borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={handleAddPages}
                disabled={selectedPages.length === 0}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 6,
                  backgroundColor: selectedPages.length > 0 ? '#3b82f6' : '#e5e7eb',
                  color: selectedPages.length > 0 ? '#fff' : '#9ca3af',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: selectedPages.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                Menüye Ekle
              </button>
            </div>
          </div>

          {/* Add Custom Link */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: 600,
              fontSize: 14
            }}>
              Özel Link
            </div>
            <div style={{ padding: 16 }}>
              <input
                type="text"
                placeholder="Link Başlığı"
                value={customLinkTitle}
                onChange={(e) => setCustomLinkTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 14,
                  marginBottom: 12,
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="text"
                placeholder="URL"
                value={customLinkUrl}
                onChange={(e) => setCustomLinkUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 14,
                  marginBottom: 12,
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={handleAddCustomLink}
                disabled={!customLinkTitle.trim() || !customLinkUrl.trim()}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 6,
                  backgroundColor: (customLinkTitle.trim() && customLinkUrl.trim()) ? '#3b82f6' : '#e5e7eb',
                  color: (customLinkTitle.trim() && customLinkUrl.trim()) ? '#fff' : '#9ca3af',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: (customLinkTitle.trim() && customLinkUrl.trim()) ? 'pointer' : 'not-allowed'
                }}
              >
                Menüye Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Menu Structure with Drag & Drop */}
        <div style={{ flex: 1 }}>
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 16
          }}>
            <div style={{
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid #e5e7eb'
            }}>
              Menü Yapısı
            </div>

            {items.length === 0 ? (
              <div style={{
                padding: 40,
                textAlign: 'center',
                color: '#6b7280',
                fontSize: 14
              }}>
                Henüz menü öğesi eklenmemiş. Sol panelden sayfa veya özel link ekleyin.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map(item => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      onEdit={handleUpdateItem}
                      onDelete={handleDeleteItem}
                      onUpdateParent={() => {}}
                      editingItem={editingItem}
                      expandedItems={expandedItems}
                      onToggleExpand={toggleExpand}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
