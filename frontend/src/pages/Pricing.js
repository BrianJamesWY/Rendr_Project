import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState('');
  const [billingInterval, setBillingInterval] = useState('monthly');
  const token = localStorage.getItem('token');

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      features: [
        '✓ 3 Folders',
        '✓ Unlimited Videos',
        '✓ Basic Showcase Page',
        '✓ Standard Verification',
        '✗ Custom Branding',
        '✗ Advanced Analytics',
        '✗ Priority Support'
      ]
    },
    pro: {
      name: 'Pro',
      price: { monthly: 9.99, yearly: 99.99 },
      planIds: { monthly: 'pro_monthly', yearly: 'pro_yearly' },
      features: [
        '✓ Unlimited Folders',
        '✓ Unlimited Videos',
        '✓ Custom Showcase Themes',
        '✓ Profile Picture & Banner',
        '✓ Advanced Analytics',
        '✓ Remove Watermarks',
        '✓ Priority Support'
      ],
      popular: true
    },
    enterprise: {
      name: 'Enterprise',
      price: { monthly: 49.99, yearly: 499.99 },
      planIds: { monthly: 'enterprise_monthly', yearly: 'enterprise_yearly' },
      features: [
        '✓ Everything in Pro',
        '✓ Nested Folders',
        '✓ Custom Folder Styling',
        '✓ Drag & Drop Organization',
        '✓ White Label Options',
        '✓ API Access',
        '✓ Dedicated Support'
      ]
    }
  };

  const handleFreePlan = () => {
    // Free tier goes to signup page
    navigate('/creator-login');
  };

  const handleSubscribe = async (planId) => {
    if (!token) {
      // For paid plans, go to signup with return url
      navigate('/creator-login?redirect=pricing');
      return;
    }

    setLoading(planId);

    try {
      const originUrl = window.location.origin;
      const response = await axios.post(
        `${BACKEND_URL}/api/payments/create-checkout-session`,
        null,
        {
          params: { plan_id: planId, origin_url: originUrl },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.assign(response.data.url);
      }
    } catch (err) {
      alert('Failed to start checkout: ' + (err.response?.data?.detail || err.message));
      setLoading('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="pricing" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            Choose Your Plan
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
            Unlock powerful features to showcase your verified content
          </p>

          {/* Billing Toggle */}
          <div style={{
            display: 'inline-flex',
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '0.75rem',
            padding: '0.375rem'
          }}>
            <button
              onClick={() => setBillingInterval('monthly')}
              style={{
                padding: '0.5rem 1.5rem',
                background: billingInterval === 'monthly' ? '#667eea' : 'transparent',
                color: billingInterval === 'monthly' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              style={{
                padding: '0.5rem 1.5rem',
                background: billingInterval === 'yearly' ? '#667eea' : 'transparent',
                color: billingInterval === 'yearly' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Yearly <span style={{ fontSize: '0.875rem' }}>(Save 17%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                border: plan.popular ? '3px solid #667eea' : '2px solid #e5e7eb',
                position: 'relative',
                boxShadow: plan.popular ? '0 10px 40px rgba(102, 126, 234, 0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
                transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#667eea',
                  color: 'white',
                  padding: '0.25rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  Most Popular
                </div>
              )}

              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                {plan.name}
              </h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827' }}>
                  ${plan.price[billingInterval]}
                </span>
                <span style={{ fontSize: '1rem', color: '#6b7280' }}>
                  {key === 'free' ? '' : `/${billingInterval === 'monthly' ? 'mo' : 'yr'}`}
                </span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={{
                    padding: '0.75rem 0',
                    color: feature.startsWith('✗') ? '#9ca3af' : '#374151',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    {feature}
                  </li>
                ))}
              </ul>

              {key === 'free' ? (
                <button
                  onClick={handleFreePlan}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Get Started Free
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.planIds[billingInterval])}
                  disabled={loading === plan.planIds[billingInterval]}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: plan.popular ? '#667eea' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: loading === plan.planIds[billingInterval] ? 'wait' : 'pointer',
                    opacity: loading === plan.planIds[billingInterval] ? 0.7 : 1
                  }}
                >
                  {loading === plan.planIds[billingInterval] ? 'Processing...' : 'Subscribe Now'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pricing;
