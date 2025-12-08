import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';

const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active_count: 0,
    monthly_total: 0,
    videos_accessible: 0
  });
  const BACKEND_URL = 'https://videoproof-1.preview.emergentagent.com';

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // TODO: Fetch subscriptions from backend
        const response = await axios.get(
          `${BACKEND_URL}/api/subscriptions/my`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSubscriptions(response.data.subscriptions || []);
        setStats(response.data.stats || {
          active_count: 0,
          monthly_total: 0,
          videos_accessible: 0
        });
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err);
        // Mock empty state
        setSubscriptions([]);
        setStats({ active_count: 0, monthly_total: 0, videos_accessible: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [BACKEND_URL]);

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription? You\'ll still have access until the end of your billing period.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/subscriptions/${subscriptionId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh subscriptions
      window.location.reload();
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
              My Premium Subscriptions
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              Manage your active subscriptions and billing
            </p>
          </div>
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

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.5rem' }}>
              {stats.active_count}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Subscriptions
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
              ${stats.monthly_total}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monthly Total
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.5rem' }}>
              {stats.videos_accessible}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Videos Accessible
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
            Active Subscriptions
          </h2>

          {loading ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>Loading your subscriptions...</p>
          ) : subscriptions.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                      {sub.creator_name} - {sub.folder_name}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      ${sub.price}/month • {sub.video_count} videos
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      Next billing: {new Date(sub.next_billing_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link
                      to={`/@${sub.creator_username}`}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'white',
                        color: '#667eea',
                        border: '1px solid #667eea',
                        borderRadius: '0.375rem',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleCancelSubscription(sub.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'white',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                No Active Subscriptions
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Browse creator showcases to find premium content to subscribe to.
              </p>
              <Link
                to="/dashboard"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Explore Content
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySubscriptions;