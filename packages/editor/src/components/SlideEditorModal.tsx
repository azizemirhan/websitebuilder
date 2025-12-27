/**
 * Slide Editor Modal - Full-screen modal for editing slider slides
 */

import React, { memo, useState, useCallback, useEffect } from 'react';
import type { SlideData } from '@builder/core';

interface SlideEditorModalProps {
    slides: SlideData[];
    onSave: (slides: SlideData[]) => void;
    onClose: () => void;
}

// Icon components
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

export const SlideEditorModal = memo(function SlideEditorModal({
    slides: initialSlides,
    onSave,
    onClose,
}: SlideEditorModalProps) {
    const [slides, setSlides] = useState<SlideData[]>(initialSlides);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    // Ensure active index is valid
    useEffect(() => {
        if (activeSlideIndex >= slides.length && slides.length > 0) {
            setActiveSlideIndex(slides.length - 1);
        }
    }, [slides.length, activeSlideIndex]);

    const activeSlide = slides[activeSlideIndex];

    const handleAddSlide = useCallback(() => {
        const randomId = Math.random().toString(36).substr(2, 6) + Date.now().toString(36).substr(-4);
        const newSlide: SlideData = {
            id: `slide-${randomId}`,
            backgroundColor: '#1a1a2e',
            label: 'Yeni Slayt',
            title: 'Başlık',
            titleHighlight: 'Vurgulu Kısım',
            description: 'Slayt açıklaması buraya gelecek.',
            buttons: [{ text: 'BUTON', variant: 'primary' }],
        };
        setSlides([...slides, newSlide]);
        setActiveSlideIndex(slides.length);
    }, [slides]);

    const handleDeleteSlide = useCallback((index: number) => {
        if (slides.length <= 1) return; // Keep at least one slide
        const newSlides = slides.filter((_, i) => i !== index);
        setSlides(newSlides);
        if (activeSlideIndex >= newSlides.length) {
            setActiveSlideIndex(newSlides.length - 1);
        }
    }, [slides, activeSlideIndex]);

    const updateSlide = useCallback((field: keyof SlideData, value: unknown) => {
        setSlides(prev => prev.map((slide, i) =>
            i === activeSlideIndex ? { ...slide, [field]: value } : slide
        ));
    }, [activeSlideIndex]);

    const handleSave = useCallback(() => {
        onSave(slides);
        onClose();
    }, [slides, onSave, onClose]);

    // Styles
    const modalOverlayStyle: React.CSSProperties = {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    };

    const modalContentStyle: React.CSSProperties = {
        width: '90%',
        maxWidth: 1200,
        height: '85vh',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    };

    const headerStyle: React.CSSProperties = {
        padding: '16px 24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f9fafb',
    };

    const bodyStyle: React.CSSProperties = {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
    };

    const sidebarStyle: React.CSSProperties = {
        width: 260,
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
    };

    const mainStyle: React.CSSProperties = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    };

    const slideListStyle: React.CSSProperties = {
        flex: 1,
        overflow: 'auto',
        padding: 12,
    };

    const slideItemStyle = (isActive: boolean): React.CSSProperties => ({
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: isActive ? '#2563eb' : '#f3f4f6',
        color: isActive ? '#ffffff' : '#374151',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    });

    const slideThumbStyle: React.CSSProperties = {
        width: 48,
        height: 32,
        borderRadius: 4,
        backgroundColor: '#1a1a2e',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexShrink: 0,
    };

    const formContainerStyle: React.CSSProperties = {
        flex: 1,
        overflow: 'auto',
        padding: 24,
    };

    const inputGroupStyle: React.CSSProperties = {
        marginBottom: 20,
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: 13,
        fontWeight: 600,
        color: '#374151',
        marginBottom: 6,
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: 8,
        fontSize: 14,
        outline: 'none',
    };

    const textareaStyle: React.CSSProperties = {
        ...inputStyle,
        minHeight: 80,
        resize: 'vertical' as const,
    };

    const buttonRowStyle: React.CSSProperties = {
        display: 'flex',
        gap: 12,
        padding: '16px 24px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
    };

    const btnStyle = (primary: boolean): React.CSSProperties => ({
        padding: '10px 24px',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 14,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: primary ? '#2563eb' : '#e5e7eb',
        color: primary ? '#ffffff' : '#374151',
    });

    if (!activeSlide) return null;

    return (
        <div style={modalOverlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                            🖼️ Slayt Editörü
                        </span>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>
                            {slides.length} slayt
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: 8,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            borderRadius: 8,
                        }}
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Body */}
                <div style={bodyStyle}>
                    {/* Sidebar - Slide List */}
                    <div style={sidebarStyle}>
                        <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                            <button
                                onClick={handleAddSlide}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    backgroundColor: '#10b981',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                }}
                            >
                                <PlusIcon /> Yeni Slayt Ekle
                            </button>
                        </div>

                        <div style={slideListStyle}>
                            {slides.map((slide, index) => (
                                <div
                                    key={slide.id}
                                    style={slideItemStyle(index === activeSlideIndex)}
                                    onClick={() => setActiveSlideIndex(index)}
                                >
                                    <div
                                        style={{
                                            ...slideThumbStyle,
                                            backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
                                        }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {slide.title || `Slayt ${index + 1}`}
                                        </div>
                                        <div style={{
                                            fontSize: 11,
                                            opacity: 0.7,
                                        }}>
                                            {slide.label || 'Etiket yok'}
                                        </div>
                                    </div>
                                    {slides.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSlide(index);
                                            }}
                                            style={{
                                                padding: 6,
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                opacity: 0.6,
                                                color: index === activeSlideIndex ? '#ffffff' : '#ef4444',
                                            }}
                                        >
                                            <TrashIcon />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main - Form */}
                    <div style={mainStyle}>
                        <div style={formContainerStyle}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, color: '#111827' }}>
                                Slayt {activeSlideIndex + 1} Özellikleri
                            </h3>

                            {/* Background Image */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Arkaplan Görseli (URL)</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={activeSlide.backgroundImage || ''}
                                    onChange={(e) => updateSlide('backgroundImage', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            {/* Background Color */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Arkaplan Rengi</label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <input
                                        type="color"
                                        value={activeSlide.backgroundColor || '#1a1a2e'}
                                        onChange={(e) => updateSlide('backgroundColor', e.target.value)}
                                        style={{ width: 48, height: 38, padding: 2, border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        style={{ ...inputStyle, flex: 1 }}
                                        value={activeSlide.backgroundColor || ''}
                                        onChange={(e) => updateSlide('backgroundColor', e.target.value)}
                                        placeholder="#1a1a2e"
                                    />
                                </div>
                            </div>

                            {/* Label */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Etiket (Badge)</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={activeSlide.label || ''}
                                    onChange={(e) => updateSlide('label', e.target.value)}
                                    placeholder="YENİ KOLEKSİYON"
                                />
                            </div>

                            {/* Title */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Başlık</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={activeSlide.title || ''}
                                    onChange={(e) => updateSlide('title', e.target.value)}
                                    placeholder="Ana Başlık"
                                />
                            </div>

                            {/* Title Highlight */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Vurgulu Alt Başlık (İtalik)</label>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={activeSlide.titleHighlight || ''}
                                    onChange={(e) => updateSlide('titleHighlight', e.target.value)}
                                    placeholder="Aksesuarlar"
                                />
                            </div>

                            {/* Description */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Açıklama</label>
                                <textarea
                                    style={textareaStyle}
                                    value={activeSlide.description || ''}
                                    onChange={(e) => updateSlide('description', e.target.value)}
                                    placeholder="Slayt açıklaması..."
                                />
                            </div>

                            {/* Buttons Section */}
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Butonlar</label>
                                {(activeSlide.buttons || []).map((btn, btnIdx) => (
                                    <div key={btnIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                        <input
                                            type="text"
                                            style={{ ...inputStyle, flex: 1 }}
                                            value={btn.text}
                                            onChange={(e) => {
                                                const newButtons = [...(activeSlide.buttons || [])];
                                                newButtons[btnIdx] = { ...btn, text: e.target.value };
                                                updateSlide('buttons', newButtons);
                                            }}
                                            placeholder="Buton metni"
                                        />
                                        <select
                                            style={{ ...inputStyle, width: 120 }}
                                            value={btn.variant}
                                            onChange={(e) => {
                                                const newButtons = [...(activeSlide.buttons || [])];
                                                newButtons[btnIdx] = { ...btn, variant: e.target.value as 'primary' | 'outline' };
                                                updateSlide('buttons', newButtons);
                                            }}
                                        >
                                            <option value="primary">Primary</option>
                                            <option value="outline">Outline</option>
                                        </select>
                                        <button
                                            onClick={() => {
                                                const newButtons = (activeSlide.buttons || []).filter((_, i) => i !== btnIdx);
                                                updateSlide('buttons', newButtons);
                                            }}
                                            style={{
                                                padding: '8px 12px',
                                                background: '#fee2e2',
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                                color: '#dc2626',
                                            }}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newButtons = [...(activeSlide.buttons || []), { text: 'BUTON', variant: 'primary' as const }];
                                        updateSlide('buttons', newButtons);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#f3f4f6',
                                        border: '1px dashed #9ca3af',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        color: '#6b7280',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                >
                                    <PlusIcon /> Buton Ekle
                                </button>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div style={buttonRowStyle}>
                            <button style={btnStyle(false)} onClick={onClose}>
                                İptal
                            </button>
                            <button style={btnStyle(true)} onClick={handleSave}>
                                💾 Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
