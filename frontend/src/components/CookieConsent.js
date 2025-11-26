import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
    // In production, disable non-essential cookies here
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(17, 24, 39, 0.98)',
      color: 'white',
      padding: '1.5rem',
      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      animation: 'slideUp 0.3s ease-out'
    }}>
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            🍪 We use cookies
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#d1d5db', lineHeight: '1.5' }}>
            We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic. By clicking "Accept," you agree to our website's cookie use as described in our{' '}
            <a href="/privacy" style={{ color: '#667eea', textDecoration: 'underline' }}>Privacy Policy</a>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleDecline}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#5568d3';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#667eea';
            }}
          >
            Accept All Cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
