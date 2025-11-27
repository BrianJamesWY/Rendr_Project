import React from 'react';

const Logo = ({ size = 'large', style = {}, onClick }) => {
  const sizes = {
    small: { width: '32px', height: '32px', fontSize: '14px' },
    medium: { width: '48px', height: '48px', fontSize: '18px' },
    large: { width: '56px', height: '56px', fontSize: '22px' },
    xlarge: { width: '72px', height: '72px', fontSize: '28px' }
  };

  const currentSize = sizes[size] || sizes.large;

  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        cursor: onClick ? 'pointer' : 'default',
        ...style 
      }}
    >
      <svg 
        viewBox="0 0 32 32" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: currentSize.width, height: currentSize.height, flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path d="M16 2 L19.5 12 L30 12 L21.5 19 L25 29 L16 22 L7 29 L10.5 19 L2 12 L12.5 12 Z" fill="url(#starGradient)"/>
        <path d="M12 16 L15 19 L21 13" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ 
        fontSize: currentSize.fontSize, 
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '0.5px'
      }}>
        RENDR
      </span>
    </div>
  );
};

export default Logo;