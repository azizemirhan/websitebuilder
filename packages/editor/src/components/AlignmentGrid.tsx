/**
 * Alignment Grid - Visual 3x3 alignment selector like Figma
 */

import React, { memo } from 'react';

interface AlignmentGridProps {
  justifyContent: string;
  alignItems: string;
  onChange: (justify: string, align: string) => void;
}

const JUSTIFY_MAP: Record<number, string> = {
  0: 'flex-start',
  1: 'center',
  2: 'flex-end',
};

const ALIGN_MAP: Record<number, string> = {
  0: 'flex-start',
  1: 'center',
  2: 'flex-end',
};

const REVERSE_JUSTIFY: Record<string, number> = {
  'flex-start': 0,
  'center': 1,
  'flex-end': 2,
  'space-between': 1,
  'space-around': 1,
  'space-evenly': 1,
};

const REVERSE_ALIGN: Record<string, number> = {
  'flex-start': 0,
  'center': 1,
  'flex-end': 2,
  'stretch': 1,
  'baseline': 0,
};

export const AlignmentGrid = memo(function AlignmentGrid({
  justifyContent,
  alignItems,
  onChange,
}: AlignmentGridProps) {
  const activeCol = REVERSE_JUSTIFY[justifyContent] ?? 0;
  const activeRow = REVERSE_ALIGN[alignItems] ?? 0;

  const cellStyle = (row: number, col: number): React.CSSProperties => {
    const isActive = row === activeRow && col === activeCol;
    return {
      width: 24,
      height: 24,
      border: '1px solid',
      borderColor: isActive ? '#3b82f6' : '#d1d5db',
      backgroundColor: isActive ? '#3b82f6' : '#ffffff',
      borderRadius: 4,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s ease',
    };
  };

  const dotStyle = (row: number, col: number): React.CSSProperties => {
    const isActive = row === activeRow && col === activeCol;
    return {
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: isActive ? '#ffffff' : '#9ca3af',
    };
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 24px)',
        gridTemplateRows: 'repeat(3, 24px)',
        gap: 4,
        padding: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        width: 'fit-content',
      }}
    >
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <div
            key={`${row}-${col}`}
            style={cellStyle(row, col)}
            onClick={() => onChange(JUSTIFY_MAP[col], ALIGN_MAP[row])}
            title={`${ALIGN_MAP[row]} / ${JUSTIFY_MAP[col]}`}
          >
            <div style={dotStyle(row, col)} />
          </div>
        ))
      )}
    </div>
  );
});
