import React from 'react';
import { Link } from 'react-router-dom';

const bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #4f46e5 100%)';

const NotFound = () => {
  const glassCard = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(14px)',
    borderRadius: '1.25rem',
    padding: '3rem',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '90%',
  };

  return (
    <div style={{ minHeight: '100vh', background: bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={glassCard}>
        <div style={{
          fontSize: '2rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1.5rem',
        }}>
          RENDR
        </div>
        <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '1rem' }}>
          404
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem' }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: '1rem', color: 'rgba(156, 163, 175, 0.9)', marginBottom: '2rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              padding: '0.875rem 2rem',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.95))',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              border: '1px solid rgba(191, 219, 254, 0.5)',
            }}
          >
            ← Back to Home
          </Link>
          <Link
            to="/dashboard"
            style={{
              padding: '0.875rem 2rem',
              background: 'rgba(15, 23, 42, 0.6)',
              color: 'rgba(226, 232, 240, 0.9)',
              border: '1px solid rgba(148, 163, 184, 0.4)',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            Go to Dashboard
          </Link>
        </div>
        <p style={{ marginTop: '2rem', color: 'rgba(156, 163, 175, 0.7)', fontSize: '0.875rem' }}>
          Need help? <Link to="/contact" style={{ color: '#8b5cf6', textDecoration: 'underline' }}>Contact Support</Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
