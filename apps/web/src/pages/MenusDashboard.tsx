import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Menu {
  id: number;
  name: string;
  location: string | null;
  itemCount?: number;
  created_at: string;
  updated_at: string;
}

export function MenusDashboard() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuLocation, setNewMenuLocation] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/builder/menus');
      if (!response.ok) throw new Error('Failed to load menus');
      const data = await response.json();
      setMenus(data);
    } catch (error) {
      console.error('Error loading menus:', error);
      alert('Menüler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async () => {
    if (!newMenuName.trim()) {
      alert('Menü adı gerekli');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('http://localhost:8000/api/builder/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMenuName,
          location: newMenuLocation || null
        })
      });

      if (!response.ok) throw new Error('Failed to create menu');
      
      const newMenu = await response.json();
      setShowCreateModal(false);
      setNewMenuName('');
      setNewMenuLocation('');
      navigate(`/menus/${newMenu.id}`);
    } catch (error) {
      console.error('Error creating menu:', error);
      alert('Menü oluşturulurken hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteMenu = async (id: number, name: string) => {
    if (!confirm(`"${name}" menüsünü silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/builder/menus/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete menu');
      
      await loadMenus();
    } catch (error) {
      console.error('Error deleting menu:', error);
      alert('Menü silinirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div>Menüler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24 
      }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Menüler</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + Yeni Menü
        </button>
      </div>

      {/* Menu Grid */}
      {menus.length === 0 ? (
        <div style={{
          padding: 60,
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: 8,
          border: '2px dashed #e5e7eb'
        }}>
          <div style={{ fontSize: 16, color: '#6b7280', marginBottom: 16 }}>
            Henüz menü oluşturulmamış
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            İlk Menüyü Oluştur
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20
        }}>
          {menus.map(menu => (
            <div
              key={menu.id}
              style={{
                padding: 20,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
              onClick={() => navigate(`/menus/${menu.id}`)}
            >
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                  {menu.name}
                </h3>
                {menu.location && (
                  <div style={{ 
                    marginTop: 4, 
                    fontSize: 12, 
                    color: '#6b7280',
                    textTransform: 'capitalize'
                  }}>
                    📍 {menu.location}
                  </div>
                )}
              </div>
              
              <div style={{ 
                fontSize: 13, 
                color: '#9ca3af',
                marginBottom: 12
              }}>
                {menu.itemCount || 0} öğe
              </div>

              <div style={{ 
                display: 'flex', 
                gap: 8,
                paddingTop: 12,
                borderTop: '1px solid #f3f4f6'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/menus/${menu.id}`);
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Düzenle
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMenu(menu.id, menu.name);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 24,
            width: '100%',
            maxWidth: 500
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 600 }}>
              Yeni Menü Oluştur
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                Menü Adı *
              </label>
              <input
                type="text"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder="Örn: Ana Menü"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                Konum
              </label>
              <select
                value={newMenuLocation}
                onChange={(e) => setNewMenuLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 14
                }}
              >
                <option value="">Seçiniz...</option>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewMenuName('');
                  setNewMenuLocation('');
                }}
                disabled={creating}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: creating ? 'not-allowed' : 'pointer'
                }}
              >
                İptal
              </button>
              <button
                onClick={handleCreateMenu}
                disabled={creating}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: creating ? 'not-allowed' : 'pointer',
                  opacity: creating ? 0.6 : 1
                }}
              >
                {creating ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
