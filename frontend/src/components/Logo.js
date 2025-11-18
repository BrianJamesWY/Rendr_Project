import React from 'react';

const Logo = ({ size = 'large' }) => {
  const sizes = {
    small: {
      container: '60px',
      star: '40px',
      text: '1.5rem',
      tagline: '0.75rem'
    },
    medium: {
      container: '80px',
      star: '60px',
      text: '2rem',
      tagline: '0.875rem'
    },
    large: {
      container: '100px',
      star: '80px',
      text: '2.5rem',
      tagline: '1rem'
    }
  };

  const s = sizes[size] || sizes.large;

  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      {/* Checkstar Logo */}
      <div style={{
        width: s.container,
        height: s.container,
        margin: '0 auto 1rem',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg 
          viewBox="0 0 24 24" 
          style={{
            width: s.star,
            height: s.star,
            fill: '#667eea'
          }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <div style={{
          position: 'absolute',
          fontSize: `calc(${s.star} * 0.5)`,
          fontWeight: 'bold',
          color: 'white',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          ✓
        </div>
      </div>

      {/* Rendr Text */}
      <div style={{
        fontSize: s.text,
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: '0.5rem',
        letterSpacing: '-0.02em'
      }}>
        Rendr
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: s.tagline,
        color: '#6b7280',
        fontWeight: '500',
        fontStyle: 'italic'
      }}>
        Bringing Truth Back to Content
      </div>
    </div>
  );
};

export default Logo;
