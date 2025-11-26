import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const NotFound = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <Logo size="medium" />
        <div style={{ fontSize: '8rem', fontWeight: 'bold', color: '#667eea', marginTop: '2rem', marginBottom: '1rem' }}>
          404
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              padding: '0.875rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            ← Back to Home
          </Link>
          <Link
            to="/dashboard"
            style={{
              padding: '0.875rem 2rem',
              background: 'white',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            Go to Dashboard
          </Link>
        </div>
        <p style={{ marginTop: '3rem', color: '#9ca3af', fontSize: '0.875rem' }}>
          Need help? <Link to="/contact" style={{ color: '#667eea', textDecoration: 'underline' }}>Contact Support</Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;