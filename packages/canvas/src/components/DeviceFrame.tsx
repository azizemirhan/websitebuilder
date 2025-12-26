/**
 * Device Frame - Device preview wrapper with frame
 */

import React, { memo, ReactNode } from 'react';

export type DeviceType = 'none' | 'iphone' | 'ipad' | 'macbook';

interface DeviceFrameProps {
  device: DeviceType;
  children: ReactNode;
}

const DEVICE_SPECS: Record<DeviceType, { width: number; height: number; padding: number; borderRadius: number }> = {
  none: { width: 0, height: 0, padding: 0, borderRadius: 0 },
  iphone: { width: 375, height: 812, padding: 12, borderRadius: 40 },
  ipad: { width: 768, height: 1024, padding: 20, borderRadius: 20 },
  macbook: { width: 1280, height: 800, padding: 8, borderRadius: 8 },
};

export const DeviceFrame = memo(function DeviceFrame({ device, children }: DeviceFrameProps) {
  if (device === 'none') {
    return <>{children}</>;
  }

  const spec = DEVICE_SPECS[device];

  return (
    <div
      style={{
        position: 'relative',
        padding: spec.padding,
        backgroundColor: device === 'macbook' ? '#1f1f1f' : '#1a1a1a',
        borderRadius: spec.borderRadius,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Notch for iPhone */}
      {device === 'iphone' && (
        <div
          style={{
            position: 'absolute',
            top: spec.padding,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 150,
            height: 30,
            backgroundColor: '#1a1a1a',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            zIndex: 10,
          }}
        />
      )}
      
      {/* Camera for MacBook */}
      {device === 'macbook' && (
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 8,
            height: 8,
            backgroundColor: '#333',
            borderRadius: '50%',
          }}
        />
      )}
      
      {/* Screen */}
      <div
        style={{
          width: spec.width,
          height: spec.height,
          backgroundColor: '#ffffff',
          borderRadius: device === 'iphone' ? spec.borderRadius - 8 : 4,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
      
      {/* Home indicator for iPhone */}
      {device === 'iphone' && (
        <div
          style={{
            position: 'absolute',
            bottom: spec.padding + 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 134,
            height: 5,
            backgroundColor: '#666',
            borderRadius: 3,
          }}
        />
      )}
    </div>
  );
});
