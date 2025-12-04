import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';
import axios from 'axios';

const StripeConnect = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const BACKEND_URL = 'https://rendr-video-trust.preview.emergentagent.com';

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/creator-login');
        return;
      }

      const originUrl = window.location.origin;
      
      // Call backend to create Stripe Connect account link
      const response = await axios.post(
        `${BACKEND_URL}/api/stripe/connect/onboard`,
        {
          return_url: `${originUrl}/stripe-connect/return`,
          refresh_url: `${originUrl}/stripe-connect`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.onboarding_url) {
        // Redirect to Stripe onboarding
        window.location.assign(response.data.onboarding_url);
      }
    } catch (err) {
      console.error('Stripe Connect error:', err);
      setError(err.response?.data?.detail || 'Failed to connect Stripe account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Logo size="medium" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem' }}>
            Connect Your Payment Account
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
            Start earning money from your premium content
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginRight: '1.5rem' }}>💰</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                Why Connect Stripe?
              </h2>
              <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                To receive payments from your premium subscribers, you need to connect a Stripe account.
                This allows us to securely transfer your earnings directly to your bank account.
              </p>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', marginRight: '0.75rem', fontSize: '1.25rem' }}>✓</span>
                  <div>
                    <strong style={{ color: '#111827' }}>Automatic Payouts:</strong>{' '}
                    <span style={{ color: '#6b7280' }}>Receive earnings weekly or monthly</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', marginRight: '0.75rem', fontSize: '1.25rem' }}>✓</span>
                  <div>
                    <strong style={{ color: '#111827' }}>Secure Payments:</strong>{' '}
                    <span style={{ color: '#6b7280' }}>Bank-level security for all transactions</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', marginRight: '0.75rem', fontSize: '1.25rem' }}>✓</span>
                  <div>
                    <strong style={{ color: '#111827' }}>Keep 80-85%:</strong>{' '}
                    <span style={{ color: '#6b7280' }}>You earn the majority of subscription revenue</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', marginRight: '0.75rem', fontSize: '1.25rem' }}>✓</span>
                  <div>
                    <strong style={{ color: '#111827' }}>Full Control:</strong>{' '}
                    <span style={{ color: '#6b7280' }}>Manage your payouts in Stripe dashboard</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', marginRight: '0.75rem', fontSize: '1.25rem' }}>✓</span>
                  <div>
                    <strong style={{ color: '#111827' }}>Tax Documents:</strong>{' '}
                    <span style={{ color: '#6b7280' }}>Automatic 1099 forms for US creators</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>⚠️</span>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#92400e', marginBottom: '0.75rem' }}>
                What You'll Need
              </h3>
              <ul style={{ color: '#92400e', lineHeight: '1.8', paddingLeft: '1.25rem', margin: 0 }}>
                <li>Government-issued ID (driver's license or passport)</li>
                <li>Social Security Number or EIN (for US creators)</li>
                <li>Bank account information</li>
                <li>Business details (if applicable)</li>
              </ul>
              <p style={{ color: '#92400e', marginTop: '0.75rem', fontSize: '0.875rem', fontStyle: 'italic' }}>
                Process takes about 5-10 minutes
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '0.75rem', padding: '1rem', marginBottom: '2rem', color: '#991b1b' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            to="/dashboard"
            style={{
              padding: '0.875rem 1.5rem',
              background: 'white',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            ← Back to Dashboard
          </Link>
          <button
            onClick={handleConnect}
            disabled={isLoading}
            style={{
              padding: '0.875rem 2rem',
              background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.transform = 'none';
            }}
          >
            {isLoading ? 'Connecting...' : '🔗 Connect Stripe Account'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#9ca3af', fontSize: '0.875rem' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            Powered by <strong style={{ color: '#667eea' }}>Stripe</strong>
          </p>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span>🔒</span> Your information is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default StripeConnect;