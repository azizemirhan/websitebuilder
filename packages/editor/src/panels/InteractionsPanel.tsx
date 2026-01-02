import React, { useState } from 'react';
import { useCanvasStore, useBehaviorStore, ElementBehavior, BehaviorTrigger, BehaviorAction, useThemeStore, themeColors } from '@builder/core';

export const InteractionsPanel = () => {
  const selectedElementId = useCanvasStore((state) => state.selectedElementIds[0]);
  const element = useCanvasStore((state) => 
    selectedElementId ? state.elements[selectedElementId] : null
  );
  const updateElement = useCanvasStore((state) => state.updateElement);
  
  // Theme
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const colors = themeColors[resolvedTheme];

  const [isAdding, setIsAdding] = useState(false);
  const [newTrigger, setNewTrigger] = useState<BehaviorTrigger>('click');
  const [newActionType, setNewActionType] = useState<BehaviorAction['type']>('toggle-visibility');
  const [newTarget, setNewTarget] = useState('');

  if (!element) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center" style={{ color: colors.textMuted }}>
        <div className="mb-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        </div>
        <p className="text-sm">Etkileşim eklemek için<br/>bir element seçin.</p>
      </div>
    );
  }

  const behaviors = (Array.isArray(element.behaviors) ? element.behaviors : []) as ElementBehavior[];

  const handleAddBehavior = () => {
    const newBehavior: ElementBehavior = {
      trigger: newTrigger,
      action: {
        type: newActionType,
        target: newTarget || 'self',
        key: newActionType === 'toggle-state' || newActionType === 'set-state' ? newTarget : undefined
      } as any
    };

    const updatedBehaviors = [...behaviors, newBehavior];
    updateElement(element.id, { behaviors: updatedBehaviors });
    setIsAdding(false);
    setNewTarget('');
  };

  const removeBehavior = (index: number) => {
    const updatedBehaviors = [...behaviors];
    updatedBehaviors.splice(index, 1);
    updateElement(element.id, { behaviors: updatedBehaviors });
  };

  return (
    <div className="flex flex-col p-4 space-y-6">
      <div className="border-b pb-4" style={{ borderColor: colors.border }}>
        <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Etkileşimler</h3>
        <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Element davranışlarını yönetin.</p>
      </div>
      
      {/* Visibility Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>Görünürlük</h4>
        <div className="flex items-center justify-between p-3 border rounded-lg shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <span className="text-sm" style={{ color: colors.text }}>Görünür</span>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                    type="checkbox" 
                    name="toggle" 
                    id="toggle" 
                    checked={!element.visibility?.breakpoint}
                    onChange={() => {
                        // Toggle logic would go here
                    }}
                    className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full cursor-pointer" style={{ backgroundColor: colors.border }}></label>
            </div>
        </div>
      </div>

      {/* Behaviors List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
              Davranışlar <span className="ml-1 py-0.5 px-2 rounded-full text-[10px]" style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>{behaviors.length}</span>
            </h4>
            {!isAdding && (
              <button 
                  onClick={() => setIsAdding(true)}
                  className="text-xs font-medium px-2 py-1 rounded transition-colors"
                  style={{ color: colors.primary }}
              >
                  + Yeni Ekle
              </button>
            )}
        </div>

        {behaviors.length === 0 && !isAdding && (
          <div className="text-center p-4 border-2 border-dashed rounded-lg" style={{ borderColor: colors.border }}>
            <span className="text-sm" style={{ color: colors.textMuted }}>Henüz davranış eklenmemiş</span>
          </div>
        )}

        <div className="space-y-2">
          {behaviors.map((behavior, idx) => (
              <div key={idx} className="group relative p-3 border rounded-lg shadow-sm transition-colors" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                  <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
                        {behavior.trigger === 'click' ? 'Tıklama' : 
                         behavior.trigger === 'hover' ? 'Hover' : behavior.trigger}
                      </span>
                      <button 
                        onClick={() => removeBehavior(idx)} 
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        style={{ color: colors.textMuted }}
                        title="Sil"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                  </div>
                  <div className="text-xs break-all" style={{ color: colors.textMuted }}>
                      <span className="font-medium" style={{ color: colors.text }}>
                        {behavior.action.type === 'toggle-state' ? 'Durum Değiştir' :
                         behavior.action.type === 'set-state' ? 'Durum Ayarla' :
                         behavior.action.type === 'toggle-visibility' ? 'Görünürlük' :
                         behavior.action.type}
                      </span>
                      <span className="mx-1" style={{ color: colors.textMuted }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block' }}>
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </span>
                      <span className="font-mono px-1 rounded" style={{ backgroundColor: colors.border }}>
                        {behavior.action.type === 'set-state' || behavior.action.type === 'toggle-state' 
                            ? behavior.action.key
                            : (behavior.action as any).target || 'self'}
                      </span>
                  </div>
              </div>
          ))}
        </div>
      </div>

      {/* Add New Behavior Form */}
      {isAdding && (
        <div className="p-4 border rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <h5 className="text-xs font-semibold uppercase" style={{ color: colors.text }}>Yeni Davranış</h5>
            
            <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: colors.text }}>Tetikleyici</label>
                <select 
                    value={newTrigger} 
                    onChange={(e) => setNewTrigger(e.target.value as any)}
                    className="block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }}
                >
                    <option value="click">Tıklama (Click)</option>
                    <option value="hover">Üzerine Gelme (Hover)</option>
                    <option value="scroll">Kaydırma (Scroll)</option>
                </select>
            </div>
            
            <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: colors.text }}>Aksiyon</label>
                <select 
                    value={newActionType} 
                    onChange={(e) => setNewActionType(e.target.value as any)}
                    className="block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }}
                >
                    <option value="toggle-visibility">Görünürlük Değiştir</option>
                    <option value="toggle-state">Durum Değiştir (Toggle)</option>
                    <option value="set-state">Durum Ayarla</option>
                    <option value="navigate">Linke Git</option>
                    <option value="scroll-to">Elemente Kaydır</option>
                    <option value="open-modal">Modal Aç</option>
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: colors.text }}>Hedef (ID veya Key)</label>
                <input 
                    type="text" 
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder={newActionType.includes('state') ? 'mobileMenuOpen' : 'self'}
                    className="block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono placeholder:font-sans"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }}
                />
                <p className="text-[10px]" style={{ color: colors.textMuted }}>
                  {newActionType.includes('state') 
                    ? 'Değiştirilecek state değişkeninin adı' 
                    : 'Hedef elementin ID\'si veya "self"'}
                </p>
            </div>

            <div className="flex gap-2 pt-2">
                <button 
                    onClick={handleAddBehavior}
                    disabled={!newTarget && !newActionType.includes('scroll-to')}
                    className="flex-1 text-white text-sm font-medium rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ backgroundColor: colors.primary }}
                >
                    Ekle
                </button>
                <button 
                    onClick={() => {
                      setIsAdding(false);
                      setNewTarget('');
                    }}
                    className="flex-1 text-sm font-medium border rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }}
                >
                    İptal
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
