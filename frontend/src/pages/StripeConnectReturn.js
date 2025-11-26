import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';
import axios from 'axios';

const StripeConnectReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const token = localStorage.getItem('rendr_token');
        if (!token) {
          navigate('/creator-login');
          return;
        }

        // Check connection status from backend
        const response = await axios.get(
          `${BACKEND_URL}/api/stripe/connect/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.connected && response.data.details_submitted) {
          setStatus('success');
          setMessage('Your Stripe account has been successfully connected!');

          // Redirect to earnings dashboard after 3 seconds
          setTimeout(() => {
            navigate('/earnings');
          }, 3000);
        } else if (response.data.connected && !response.data.details_submitted) {
          setStatus('error');
          setMessage('Stripe onboarding is incomplete. Please complete the setup process.');
        } else {
          setStatus('error');
          setMessage('Connection was cancelled or failed.');
        }
      } catch (err) {
        console.error('Stripe verification error:', err);
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Failed to verify Stripe connection.');
      }
    };

    verifyConnection();
  }, [searchParams, navigate, BACKEND_URL]);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '6rem 1rem', textAlign: 'center' }}>
        <Logo size="medium" />

        {status === 'loading' && (
          <div style={{ marginTop: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              Verifying Connection...
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              Please wait while we verify your Stripe account connection.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ marginTop: '3rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '1rem' }}>
              Connection Successful!
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '2rem' }}>
              {message}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Redirecting to your earnings dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ marginTop: '3rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>❌</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '1rem' }}>
              Connection Failed
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '2rem' }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/stripe-connect')}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '0.875rem 2rem',
                  background: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StripeConnectReturn;