import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Logo from '../components/Logo';

const BACKEND_URL = 'https://verifyvideos.preview.emergentagent.com';

function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/analytics/public`);
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'white' }}>
        <Logo size="medium" />
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginTop: '2rem', marginBottom: '1rem' }}>
          Platform Analytics
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>
          Real-time metrics from the Rendr verification platform
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        
        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
              Total Users
            </div>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.5rem' }}>
              {stats?.users?.total || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
              {stats?.growth?.users_this_month || 0} this month
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
              Videos Verified
            </div>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
              {stats?.videos?.total || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
              {stats?.growth?.videos_this_month || 0} this month
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
              Blockchain Verified
            </div>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
              {stats?.videos?.blockchain_verified || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {stats?.videos?.total ? Math.round((stats.videos.blockchain_verified / stats.videos.total) * 100) : 0}% of total
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
              Verification Attempts
            </div>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.5rem' }}>
              {stats?.verifications?.total || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
              {stats?.growth?.verifications_this_month || 0} this month
            </div>
          </div>
        </div>

        {/* User Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
              User Distribution
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280', fontWeight: '600' }}>Free Tier</span>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{stats?.users?.free || 0}</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '9999px', height: '12px', overflow: 'hidden' }}>
                <div style={{
                  background: '#10b981',
                  height: '100%',
                  width: `${stats?.users?.total ? (stats.users.free / stats.users.total) * 100 : 0}%`,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280', fontWeight: '600' }}>Pro Tier</span>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{stats?.users?.pro || 0}</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '9999px', height: '12px', overflow: 'hidden' }}>
                <div style={{
                  background: '#f59e0b',
                  height: '100%',
                  width: `${stats?.users?.total ? (stats.users.pro / stats.users.total) * 100 : 0}%`,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280', fontWeight: '600' }}>Enterprise</span>
                <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>{stats?.users?.enterprise || 0}</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '9999px', height: '12px', overflow: 'hidden' }}>
                <div style={{
                  background: '#8b5cf6',
                  height: '100%',
                  width: `${stats?.users?.total ? (stats.users.enterprise / stats.users.total) * 100 : 0}%`,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
              Engagement Metrics
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Avg Videos per Creator</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                  {stats?.engagement?.avg_videos_per_user?.toFixed(1) || '0.0'}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Active Creators (uploaded this month)</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {stats?.engagement?.active_creators || 0}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Interested Parties</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {stats?.users?.interested_parties || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Source Breakdown */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
            Video Sources
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📱</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.25rem' }}>
                {stats?.videos?.bodycam || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Rendr Bodycam</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💻</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.25rem' }}>
                {stats?.videos?.studio || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Rendr Studio</div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '2rem', color: 'white', opacity: 0.8 }}>
        <p>Real-time data from Rendr verification platform</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default Analytics;
