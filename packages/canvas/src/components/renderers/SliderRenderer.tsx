/**
 * Slider Renderer - Interactive slider/carousel component
 */

import React, { memo, useState, useEffect, useCallback } from "react";
import type { SliderElement, SlideData } from "@builder/core";

interface SliderRendererProps {
    element: SliderElement;
    isSelected: boolean;
    isHovered: boolean;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

// Arrow icons as inline SVG
const ArrowLeft = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const ArrowRight = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
        <path d="M9 18l6-6-6-6" />
    </svg>
);

export const SliderRenderer = memo(function SliderRenderer({
    element,
    isSelected,
    isHovered,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
}: SliderRendererProps) {
    const { style, props } = element;
    const slides = props?.slides || [];
    const autoPlay = props?.autoPlay ?? true;
    const interval = props?.interval ?? 6000;
    const showDots = props?.showDots ?? true;
    const showArrows = props?.showArrows ?? true;

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-play effect
    useEffect(() => {
        if (!autoPlay || isPaused || slides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, interval);

        return () => clearInterval(timer);
    }, [autoPlay, interval, isPaused, slides.length]);

    const goToSlide = useCallback((index: number) => {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        setCurrentSlide(index);
    }, [slides.length]);

    const handlePrev = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        goToSlide(currentSlide - 1);
    }, [currentSlide, goToSlide]);

    const handleNext = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        goToSlide(currentSlide + 1);
    }, [currentSlide, goToSlide]);

    const handleDotClick = useCallback((index: number) => (e: React.MouseEvent) => {
        e.stopPropagation();
        goToSlide(index);
    }, [goToSlide]);

    // Container style
    const containerStyle: React.CSSProperties = {
        position: style.position || "relative",
        width: style.width || "100%",
        height: style.height || 600,
        overflow: "hidden",
        boxSizing: "border-box",
        // Selection indicator removed - handled by ElementControls overlay
    };

    // Slide style
    const getSlideStyle = (slide: SlideData, index: number): React.CSSProperties => ({
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: index === currentSlide ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
        backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
        backgroundColor: slide.backgroundColor || "#1a1a2e",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        zIndex: index === currentSlide ? 1 : 0,
    });

    // Overlay style - matches original CSS
    const overlayStyle: React.CSSProperties = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(to right, rgba(26,26,46,0.85), rgba(26,26,46,0.4) 50%, transparent)",
        zIndex: 1,
    };

    // Content container style - matches original CSS
    const contentStyle: React.CSSProperties = {
        position: "relative",
        zIndex: 2,
        padding: "32px 24px",
        maxWidth: 600,
        color: "#ffffff",
    };

    // Button styles
    const primaryBtnStyle: React.CSSProperties = {
        display: "inline-block",
        padding: "14px 32px",
        backgroundColor: "#e94560",
        color: "#ffffff",
        borderRadius: 4,
        fontWeight: 600,
        fontSize: 14,
        textDecoration: "none",
        marginRight: 12,
        cursor: "pointer",
        border: "none",
    };

    const outlineBtnStyle: React.CSSProperties = {
        display: "inline-block",
        padding: "14px 32px",
        backgroundColor: "transparent",
        color: "#ffffff",
        borderRadius: 4,
        fontWeight: 600,
        fontSize: 14,
        textDecoration: "none",
        border: "2px solid #ffffff",
        cursor: "pointer",
    };

    // Navigation button style
    const navBtnStyle: React.CSSProperties = {
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        width: 50,
        height: 50,
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.2)",
        border: "none",
        color: "#ffffff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        backdropFilter: "blur(4px)",
    };

    // Dots container style
    const dotsContainerStyle: React.CSSProperties = {
        position: "absolute",
        bottom: 30,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 12,
        zIndex: 10,
    };

    // Dot style
    const getDotStyle = (index: number): React.CSSProperties => ({
        width: index === currentSlide ? 32 : 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: index === currentSlide ? "#ffffff" : "rgba(255,255,255,0.4)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "none",
    });

    if (slides.length === 0) {
        return (
            <div
                data-element-id={element.id}
                style={{
                    ...containerStyle,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1a1a2e",
                    color: "#ffffff",
                }}
                onMouseDown={onMouseDown}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
                    <p style={{ opacity: 0.7 }}>Slider - Slide ekleyin</p>
                </div>
            </div>
        );
    }

    return (
        <div
            data-element-id={element.id}
            style={containerStyle}
            onMouseDown={onMouseDown}
            onMouseEnter={() => {
                onMouseEnter();
                setIsPaused(true);
            }}
            onMouseLeave={() => {
                onMouseLeave();
                setIsPaused(false);
            }}
        >
            {/* Slides */}
            {slides.map((slide, index) => (
                <div key={slide.id} style={getSlideStyle(slide, index)}>
                    {/* Overlay */}
                    <div style={overlayStyle} />

                    {/* Content */}
                    <div style={contentStyle}>
                        {/* Label */}
                        {slide.label && (
                            <span
                                style={{
                                    display: "inline-block",
                                    padding: "8px 16px",
                                    backgroundColor: "#e94560",
                                    color: "#ffffff",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: 1,
                                    borderRadius: 4,
                                    marginBottom: 24,
                                }}
                            >
                                {slide.label}
                            </span>
                        )}

                        {/* Title */}
                        {(slide.title || slide.titleHighlight) && (
                            <h2
                                style={{
                                    fontSize: 56,
                                    fontWeight: 700,
                                    lineHeight: 1.1,
                                    marginBottom: 20,
                                    fontFamily: "'Outfit', sans-serif",
                                }}
                            >
                                {slide.title}
                                {slide.titleHighlight && (
                                    <>
                                        <br />
                                        <em style={{ fontFamily: "'Playfair Display', serif", color: "#e94560" }}>
                                            {slide.titleHighlight}
                                        </em>
                                    </>
                                )}
                            </h2>
                        )}

                        {/* Description */}
                        {slide.description && (
                            <p
                                style={{
                                    fontSize: 18,
                                    opacity: 0.9,
                                    marginBottom: 32,
                                    maxWidth: 500,
                                }}
                            >
                                {slide.description}
                            </p>
                        )}

                        {/* Buttons */}
                        {slide.buttons && slide.buttons.length > 0 && (
                            <div style={{ display: "flex", gap: 12 }}>
                                {slide.buttons.map((btn, btnIndex) => (
                                    <button
                                        key={btnIndex}
                                        style={btn.variant === "primary" ? primaryBtnStyle : outlineBtnStyle}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {btn.text}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            {showArrows && slides.length > 1 && (
                <>
                    <button style={{ ...navBtnStyle, left: 20 }} onClick={handlePrev}>
                        <ArrowLeft />
                    </button>
                    <button style={{ ...navBtnStyle, right: 20 }} onClick={handleNext}>
                        <ArrowRight />
                    </button>
                </>
            )}

            {/* Dots */}
            {showDots && slides.length > 1 && (
                <div style={dotsContainerStyle}>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            style={getDotStyle(index)}
                            onClick={handleDotClick(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});
