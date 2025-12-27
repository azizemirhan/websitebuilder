/**
 * Icon Renderer - Renders predefined SVG icons
 */

import React, { memo } from "react";
import type { IconElement } from "@builder/core";

interface IconRendererProps {
    element: IconElement;
    isSelected: boolean;
    isHovered: boolean;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

// Predefined SVG icon paths (stroke-based, 24x24 viewBox)
const ICON_PATHS: Record<string, React.ReactNode> = {
    search: (
        <>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </>
    ),
    user: (
        <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </>
    ),
    heart: (
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    ),
    cart: (
        <>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </>
    ),
    menu: (
        <>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </>
    ),
    close: (
        <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </>
    ),
    plus: (
        <>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </>
    ),
    minus: <line x1="5" y1="12" x2="19" y2="12" />,
    check: <polyline points="20 6 9 17 4 12" />,
    "arrow-left": (
        <>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </>
    ),
    "arrow-right": (
        <>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </>
    ),
    "chevron-down": <polyline points="6 9 12 15 18 9" />,
    "chevron-up": <polyline points="18 15 12 9 6 15" />,
    star: (
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
    trash: (
        <>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </>
    ),
    edit: (
        <>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </>
    ),
    eye: (
        <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    share: (
        <>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </>
    ),
};

export const IconRenderer = memo(function IconRenderer({
    element,
    isSelected,
    isHovered,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
}: IconRendererProps) {
    const { style, props } = element;
    const iconName = props?.iconName || "search";
    const strokeWidth = props?.strokeWidth || 2;

    const iconStyle: React.CSSProperties = {
        // Layout
        position: style.position || "relative",
        boxSizing: "border-box",

        // Dimensions
        width: style.width || 24,
        height: style.height || 24,

        // Display
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        // Visual
        color: style.color || "currentColor",
        opacity: style.opacity,
        cursor: element.locked ? "not-allowed" : style.cursor || "default",
        visibility: element.hidden ? "hidden" : "visible",

        // Selection indicator
        outline: isSelected
            ? "2px solid #2563eb"
            : isHovered
                ? "1px solid #60a5fa"
                : "none",
        outlineOffset: "-1px",
    };

    const iconPath = ICON_PATHS[iconName];

    return (
        <div
            data-element-id={element.id}
            style={iconStyle}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    width: "100%",
                    height: "100%",
                }}
            >
                {iconPath || ICON_PATHS.search}
            </svg>
        </div>
    );
});
