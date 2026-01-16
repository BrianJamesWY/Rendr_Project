import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #4f46e5 100%)';

function Analytics() {
  const navigate = useNavigate();
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

  const glassCard = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(14px)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bgGradient }}>
      {/* Header */}
      <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
          Platform Analytics
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(226, 232, 240, 0.9)' }}>
          Real-time metrics from the Rendr verification platform
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: '1px solid rgba(148, 163, 184, 0.5)',
            borderRadius: '0.5rem',
            color: 'rgba(226, 232, 240, 0.9)',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        
        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ ...glassCard, textAlign: 'center', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(156, 163, 175, 0.9)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.1em' }}>
              Total Users
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.25rem' }}>
              {stats?.users?.total || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#22d3ee', fontWeight: '600' }}>
              +{stats?.growth?.users_this_month || 0} this month
            </div>
          </div>

          <div style={{ ...glassCard, textAlign: 'center', borderLeft: '4px solid #22d3ee' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(156, 163, 175, 0.9)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.1em' }}>
              Videos Verified
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#22d3ee', marginBottom: '0.25rem' }}>
              {stats?.videos?.total || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#22d3ee', fontWeight: '600' }}>
              +{stats?.growth?.videos_this_month || 0} this month
            </div>
          </div>

          <div style={{ ...glassCard, textAlign: 'center', borderLeft: '4px solid #fbbf24' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(156, 163, 175, 0.9)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.1em' }}>
              Blockchain Verified
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '0.25rem' }}>
              {stats?.videos?.blockchain_verified || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(156, 163, 175, 0.9)' }}>
              {stats?.videos?.total ? Math.round((stats.videos.blockchain_verified / stats.videos.total) * 100) : 0}% of total
            </div>
          </div>

          <div style={{ ...glassCard, textAlign: 'center', borderLeft: '4px solid #34d399' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(156, 163, 175, 0.9)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.1em' }}>
              Verification Attempts
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#34d399', marginBottom: '0.25rem' }}>
              {stats?.verifications?.total || 0}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#22d3ee', fontWeight: '600' }}>
              +{stats?.growth?.verifications_this_month || 0} this month
            </div>
          </div>
        </div>

        {/* User Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={glassCard}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
              User Distribution
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'rgba(156, 163, 175, 0.9)', fontWeight: '600' }}>Free Tier</span>
                <span style={{ fontWeight: 'bold', color: '#34d399' }}>{stats?.users?.free || 0}</span>
              </div>
              <div style={{ background: 'rgba(148, 163, 184, 0.2)', borderRadius: '9999px', height: '10px', overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #34d399, #22d3ee)',
                  height: '100%',
                  width: `${stats?.users?.total ? (stats.users.free / stats.users.total) * 100 : 0}%`,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'rgba(156, 163, 175, 0.9)', fontWeight: '600' }}>Pro Tier</span>
                <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{stats?.users?.pro || 0}</span>
              </div>
              <div style={{ background: 'rgba(148, 163, 184, 0.2)', borderRadius: '9999px', height: '10px', overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                  height: '100%',
                  width: `${stats?.users?.total ? (stats.users.pro / stats.users.total) * 100 : 0}%`,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'rgba(156, 163, 175, 0.9)', fontWeight: '600' }}>Enterprise</span>
                <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>{stats?.users?.enterprise || 0}</span>
              </div>
              <div style={{ background: 'rgba(148, 163, 184, 0.2)', borderRadius: '9999px', height: '10px', overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #a78bfa, #8b5cf6)',
                  height: '100%',
                  width: `${stats?.users?.total ? (stats.users.enterprise / stats.users.total) * 100 : 0}%`,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          </div>

          <div style={glassCard}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
              Engagement Metrics
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(156, 163, 175, 0.9)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Videos per Creator</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {stats?.engagement?.avg_videos_per_user?.toFixed(1) || '0.0'}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(156, 163, 175, 0.9)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Creators (this month)</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22d3ee' }}>
                  {stats?.engagement?.active_creators || 0}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(156, 163, 175, 0.9)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interested Parties</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>
                  {stats?.users?.interested_parties || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Source Breakdown */}
        <div style={glassCard}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
            Video Sources
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📱</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a78bfa', marginBottom: '0.25rem' }}>
                {stats?.videos?.bodycam || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(156, 163, 175, 0.9)' }}>Rendr Bodycam</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💻</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22d3ee', marginBottom: '0.25rem' }}>
                {stats?.videos?.studio || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(156, 163, 175, 0.9)' }}>Rendr Studio</div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(156, 163, 175, 0.8)' }}>
        <p>Real-time data from Rendr verification platform</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default Analytics;
