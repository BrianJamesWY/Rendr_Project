import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';

const BACKEND_URL = 'https://videoproof-1.preview.emergentagent.com';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('No payment session found');
      setStatus('error');
      return;
    }

    if (!token) {
      navigate('/CreatorLogin');
      return;
    }

    checkPaymentStatus(sessionId);
  }, [searchParams, token, navigate]);

  const checkPaymentStatus = async (sessionId, attempt = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000; // 2 seconds

    if (attempt >= maxAttempts) {
      setError('Payment verification timed out. Please check your dashboard.');
      setStatus('error');
      return;
    }

    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/payments/checkout-status/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;

      if (data.payment_status === 'paid') {
        setPaymentInfo(data);
        setStatus('success');
        // Refresh user data in local storage
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
        return;
      } else if (data.status === 'expired') {
        setError('Payment session expired. Please try again.');
        setStatus('error');
        return;
      }

      // If payment is still pending, continue polling
      setStatus('processing');
      setTimeout(() => checkPaymentStatus(sessionId, attempt + 1), pollInterval);
    } catch (err) {
      console.error('Payment status check error:', err);
      setError(err.response?.data?.detail || 'Failed to verify payment');
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '4rem 1rem',
        textAlign: 'center'
      }}>
        {status === 'checking' || status === 'processing' ? (
          <div>
            <div style={{
              width: '80px',
              height: '80px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#667eea',
              borderRadius: '50%',
              margin: '0 auto 2rem',
              animation: 'spin 1s linear infinite'
            }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              Verifying Payment...
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              Please wait while we confirm your payment
            </p>
          </div>
        ) : status === 'success' ? (
          <div>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              fontSize: '3rem'
            }}>
              ✓
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              Payment Successful!
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '1rem' }}>
              Your subscription has been activated
            </p>
            {paymentInfo && (
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                marginBottom: '2rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>New Tier</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea', textTransform: 'capitalize' }}>
                  {paymentInfo.tier}
                </div>
              </div>
            )}
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Redirecting to dashboard in 3 seconds...
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              fontSize: '3rem'
            }}>
              ✕
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              Payment Issue
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '2rem' }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/pricing')}
              style={{
                padding: '0.75rem 2rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Back to Pricing
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PaymentSuccess;
