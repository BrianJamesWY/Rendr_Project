import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = 'https://verifyvideos.preview.emergentagent.com';

  useEffect(() => {
    const loadData = async () => {
      const folderId = searchParams.get('folder');

      if (!folderId) {
        console.error('No folder ID provided');
        setLoading(false);
        return;
      }

      try {
        const nextBillingDate = new Date();
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        setSubscriptionDetails({
          folderName: 'Premium Videos',
          creatorName: 'BrianJames',
          creatorUsername: 'brianjames',
          priceCents: 999,
          nextBillingDate: nextBillingDate.toISOString(),
          receiptUrl: '#',
          folderId: folderId
        });
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', width: '100%', background: 'white', borderRadius: '16px', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', padding: '3rem', textAlign: 'center' }}>
        
        {/* Logo */}
        <Logo size="large" />

        {/* Success Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          margin: '2rem auto',
          background: '#10b981',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
          color: 'white',
          animation: 'scaleIn 0.5s ease-out'
        }}>
          🎉
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#111827' }}>
          Subscription Successful!
        </h1>
        <p style={{ color: '#374151', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
          You now have full access to <strong>{subscriptionDetails?.folderName || 'Premium Content'}</strong>. Your first payment has been processed.
        </p>

        {/* Info Box */}
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
          {[
            { label: 'Subscription', value: `${subscriptionDetails?.creatorName} - ${subscriptionDetails?.folderName}` },
            { label: 'Amount', value: `$${((subscriptionDetails?.priceCents || 0) / 100).toFixed(2)}/month` },
            { label: 'Next Billing Date', value: subscriptionDetails?.nextBillingDate ? new Date(subscriptionDetails.nextBillingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
            { label: 'Receipt', value: <a href={subscriptionDetails?.receiptUrl || '#'} style={{ color: '#667eea' }}>View Receipt</a> }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: idx < 3 ? '1px solid #e5e7eb' : 'none' }}>
              <span style={{ color: '#6b7280', fontWeight: '600' }}>{item.label}</span>
              <span style={{ color: '#111827' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>What&apos;s Next?</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Access all premium videos in your subscribed folder',
              'New content will be added regularly and you\'ll have instant access',
              'Manage your subscription anytime from "My Subscriptions" page',
              'Cancel anytime with no penalties or hidden fees'
            ].map((step, idx) => (
              <li key={idx} style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <div style={{ background: '#667eea', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.875rem', flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <div>{step}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
          <Link
            to={`/showcase/${subscriptionDetails?.creatorUsername}`}
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            🎬 View Premium Content
          </Link>
          <Link
            to="/my-subscriptions"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'white',
              color: '#374151',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            📋 Manage Subscriptions
          </Link>
        </div>
      </div>

      <style>
        {`
          @keyframes scaleIn {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default SubscriptionSuccess;