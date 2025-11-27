import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';

const Earnings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Check Stripe Connect status
        const stripeStatus = await axios.get(
          `${BACKEND_URL}/api/stripe/connect/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const connected = stripeStatus.data.charges_enabled && stripeStatus.data.payouts_enabled;
        setIsConnected(connected);

        // Fetch premium folders for earnings breakdown
        const foldersRes = await axios.get(
          `${BACKEND_URL}/api/premium-folders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setEarnings({
          stripe_connected: connected,
          stripe_account_id: stripeStatus.data.account_id,
          monthly_revenue: 0, // TODO: Calculate from subscriptions
          active_subscribers: 0, // TODO: Calculate from subscriptions
          creator_share: 0,
          lifetime_earnings: 0,
          premium_folders: foldersRes.data || [],
          next_payout_amount: 0,
          next_payout_date: null,
          recent_payouts: []
        });
      } catch (err) {
        console.error('Failed to fetch earnings:', err);
        // Initialize with empty data
        setEarnings({
          stripe_connected: false,
          monthly_revenue: 0,
          active_subscribers: 0,
          creator_share: 0,
          lifetime_earnings: 0,
          premium_folders: [],
          next_payout_amount: 0,
          next_payout_date: null,
          recent_payouts: []
        });
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [BACKEND_URL]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Navigation />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827' }}>
            Premium Subscription Earnings
          </h1>
          <Link
            to="/dashboard"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            ← Back
          </Link>
        </div>

        <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '3rem' }}>
          Track your revenue from premium content subscriptions
        </p>

        {/* Stripe Connection Required */}
        {!isConnected && (
          <div style={{ background: '#fffbeb', border: '2px solid #fbbf24', borderRadius: '0.75rem', padding: '2rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>🔗</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
                  Connect Payment Account Required
                </h3>
                <p style={{ color: '#92400e', marginBottom: '1rem' }}>
                  To start earning from premium folders, you need to connect your Stripe account.
                </p>
                <Link
                  to="/stripe-connect"
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: '#f59e0b',
                    color: 'white',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  Connect Now →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>This Month&apos;s Revenue</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.25rem' }}>
              ${earnings?.monthly_revenue || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#10b981' }}>↑ 0%</div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Active Subscribers</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.25rem' }}>
              {earnings?.active_subscribers || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>+0 this month</div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Your Share (80-85%)</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.25rem' }}>
              ${earnings?.creator_share || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>This month</div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Lifetime Earnings</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.25rem' }}>
              ${earnings?.lifetime_earnings || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>All time</div>
          </div>
        </div>

        {/* Premium Folders */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Premium Folders</h2>
            <Link
              to="/showcase-editor?tab=premium"
              style={{
                padding: '0.625rem 1.25rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              ➕ Create New Folder
            </Link>
          </div>

          {earnings?.premium_folders && earnings.premium_folders.length > 0 ? (
            <div>Premium folders list here</div>
          ) : (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
              No premium folders yet. Create one to start earning!
            </p>
          )}
        </div>

        {/* Payouts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Next Payout</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
              ${earnings?.next_payout_amount?.toFixed(2) || '0.00'}
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Next payout: {earnings?.next_payout_date || 'No payout scheduled'}
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Recent Payouts</h3>
            {earnings?.recent_payouts && earnings.recent_payouts.length > 0 ? (
              <div>Payout history here</div>
            ) : (
              <p style={{ color: '#9ca3af' }}>No payouts yet</p>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Transaction History</h2>
          
          {earnings?.transactions && earnings.transactions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '1rem 0.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Amount</th>
                    <th style={{ textAlign: 'right', padding: '1rem 0.5rem', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.transactions.map((transaction, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem 0.5rem', color: '#111827', fontSize: '0.875rem' }}>
                        {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: transaction.type === 'subscription' ? '#dbeafe' : '#fef3c7',
                          color: transaction.type === 'subscription' ? '#1e40af' : '#92400e'
                        }}>
                          {transaction.type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                        {transaction.description}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: '#10b981', fontSize: '0.875rem', fontWeight: '600', textAlign: 'right' }}>
                        +${transaction.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: transaction.status === 'completed' ? '#d1fae5' : '#fef3c7',
                          color: transaction.status === 'completed' ? '#065f46' : '#92400e'
                        }}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <p style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#6b7280' }}>No transactions yet</p>
              <p style={{ fontSize: '0.875rem' }}>Your transaction history will appear here once you start earning from premium subscriptions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;