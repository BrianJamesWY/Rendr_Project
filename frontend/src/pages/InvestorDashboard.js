import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function InvestorDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/creator-login');
      return;
    }
    
    loadData();
  }, [token, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load investor analytics
      const analyticsRes = await axios.get(`${BACKEND_URL}/api/admin/investor/dashboard?days=30`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(analyticsRes.data);
      
      // Load system diagnostics
      try {
        const diagRes = await axios.get(`${BACKEND_URL}/api/diagnostics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDiagnostics(diagRes.data);
      } catch (diagError) {
        console.warn('Diagnostics not available:', diagError);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      if (error.response?.status === 403) {
        setError('Access denied: Investor access required');
      } else {
        setError('Failed to load analytics data');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <div style={{ color: '#6b7280' }}>Loading investor dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Navigation />
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <div style={{ color: '#ef4444', fontSize: '1.25rem', marginBottom: '1rem' }}>{error}</div>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            This page requires investor or admin access.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3rem 0 2rem', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
            📊 Investor Dashboard
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
            Real-time platform metrics, growth indicators, and system health
          </p>
          
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
            {['overview', 'growth', 'system', 'security'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: activeTab === tab ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid white' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {tab === 'system' ? '🔧 System Health' : 
                 tab === 'security' ? '🔒 Security' :
                 tab === 'growth' ? '📈 Growth' : '📊 Overview'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto 3rem', padding: '0 1rem' }}>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <MetricCard
                icon="👥"
                title="Total Users"
                value={analytics.users.total.toLocaleString()}
                change={`+${analytics.users.new} new (${analytics.users.growth_rate}%)`}
                positive={true}
              />
              <MetricCard
                icon="🎥"
                title="Total Videos"
                value={analytics.videos.total.toLocaleString()}
                change={`+${analytics.videos.new} new (${analytics.videos.growth_rate}%)`}
                positive={true}
              />
              <MetricCard
                icon="✓"
                title="Verifications"
                value={analytics.verifications.total.toLocaleString()}
                change={`${analytics.verifications.recent} recent`}
                positive={true}
              />
              <MetricCard
                icon="🔒"
                title="Security Rate"
                value={`${(100 - analytics.security.blocked_attempts_percentage).toFixed(1)}%`}
                change={`${analytics.security.duplicate_attempts} blocked`}
                positive={true}
              />
            </div>

            {/* Tier Distribution */}
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
                💎 User Tier Distribution
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {Object.entries(analytics.tier_distribution).map(([tier, count]) => (
                  <div key={tier} style={{ textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                      {tier === 'enterprise' ? '👑' : tier === 'pro' ? '⭐' : '🆓'}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize' }}>
                      {tier}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Growth Tab */}
        {activeTab === 'growth' && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
              📈 Daily Upload Trends (Last 7 Days)
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Date</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>Uploads</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.daily_upload_trend.map((day, index) => (
                    <tr key={day.date} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem', color: '#374151' }}>{day.date}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#111827' }}>{day.uploads}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {index > 0 && (
                          <span style={{ 
                            color: day.uploads > analytics.daily_upload_trend[index - 1].uploads ? '#10b981' : '#ef4444',
                            fontSize: '1.25rem'
                          }}>
                            {day.uploads > analytics.daily_upload_trend[index - 1].uploads ? '↗' : 
                             day.uploads < analytics.daily_upload_trend[index - 1].uploads ? '↘' : '→'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && diagnostics && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <SystemHealthCard
                title="Backend API"
                status={diagnostics.backend?.status || 'unknown'}
                details={`Uptime: ${diagnostics.backend?.uptime || 'N/A'}`}
              />
              <SystemHealthCard
                title="Database"
                status={diagnostics.mongodb?.status || 'unknown'}
                details={`${diagnostics.mongodb?.databases || 0} databases`}
              />
              <SystemHealthCard
                title="Redis Queue"
                status={diagnostics.redis?.status || 'unknown'}
                details={`${diagnostics.redis?.workers || 0} workers active`}
              />
            </div>

            {diagnostics.videos && (
              <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
                  📊 Storage & Performance
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <StatBox label="Total Videos" value={diagnostics.videos.total_videos || 0} />
                  <StatBox label="Verified" value={diagnostics.videos.verified_count || 0} />
                  <StatBox label="Avg Duration" value={`${diagnostics.videos.avg_duration || 0}s`} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
              🔒 Security Metrics
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <SecurityCard
                icon="🚫"
                label="Duplicate Attempts Blocked"
                value={analytics.security.duplicate_attempts}
                color="#ef4444"
              />
              <SecurityCard
                icon="✅"
                label="Legitimate Uploads"
                value={analytics.videos.total - analytics.security.duplicate_attempts}
                color="#10b981"
              />
              <SecurityCard
                icon="🎯"
                label="Detection Accuracy"
                value={`${analytics.security.blocked_attempts_percentage.toFixed(1)}%`}
                color="#667eea"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ icon, title, value, change, positive }) {
  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>{value}</div>
      <div style={{ fontSize: '0.8125rem', color: positive ? '#10b981' : '#6b7280', fontWeight: '500' }}>
        {change}
      </div>
    </div>
  );
}

function SystemHealthCard({ title, status, details }) {
  const statusColors = {
    healthy: '#10b981',
    operational: '#10b981',
    degraded: '#f59e0b',
    down: '#ef4444',
    unknown: '#6b7280'
  };
  
  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>{title}</h3>
        <div style={{ 
          width: '12px', 
          height: '12px', 
          borderRadius: '50%', 
          background: statusColors[status.toLowerCase()] || statusColors.unknown 
        }} />
      </div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize' }}>
        {status}
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.5rem' }}>
        {details}
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
      <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        {label}
      </div>
    </div>
  );
}

function SecurityCard({ icon, label, value, color }) {
  return (
    <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color, marginBottom: '0.5rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
        {label}
      </div>
    </div>
  );
}

export default InvestorDashboard;
