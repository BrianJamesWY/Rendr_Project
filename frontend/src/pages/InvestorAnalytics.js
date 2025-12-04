import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';
import Navigation from '../components/Navigation';

const BACKEND_URL = 'https://rendr-video-trust.preview.emergentagent.com';

function InvestorAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    
    loadAnalytics();
  }, [token, navigate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/ceo-access-b7k9m2x/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError('Failed to load analytics data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <div style={{ color: '#6b7280' }}>Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Navigation />
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <div style={{ color: '#ef4444', fontSize: '1.25rem', marginBottom: '1rem' }}>{error || 'No data available'}</div>
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

  const { platform, users, videos, storage, engagement } = analytics;

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3rem 0', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <Logo size="small" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginTop: '1rem', marginBottom: '0.5rem' }}>
            📊 Investor Analytics
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)' }}>
            Real-time platform metrics and growth indicators
          </p>
        </div>
      </div>

      {/* Key Platform Metrics */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {/* Total Users */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #667eea' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>TOTAL USERS</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.5rem' }}>
              {platform.total_users.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
              +{users.growth_rate}% this month
            </div>
          </div>

          {/* Total Videos */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #10b981' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>TOTAL VIDEOS</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
              {platform.total_videos.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#667eea', fontWeight: '600' }}>
              {videos.average_per_user.toFixed(1)} avg per user
            </div>
          </div>

          {/* Active Users */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #f59e0b' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>ACTIVE USERS (30D)</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
              {platform.active_users_30d.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
              {((platform.active_users_30d / platform.total_users) * 100).toFixed(1)}% engagement
            </div>
          </div>

          {/* Storage Used */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #8b5cf6' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>STORAGE USED</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.5rem' }}>
              {storage.total_gb.toFixed(1)} GB
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
              {storage.avg_per_video_mb.toFixed(1)} MB avg/video
            </div>
          </div>
        </div>

        {/* User Distribution by Tier */}
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
          💎 User Distribution by Tier
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {/* Free Tier */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Free Tier</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>24hr storage</div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6b7280' }}>
                {users.by_tier.free}
              </div>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${(users.by_tier.free / platform.total_users) * 100}%`, 
                height: '100%', 
                background: '#6b7280' 
              }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              {((users.by_tier.free / platform.total_users) * 100).toFixed(1)}% of users
            </div>
          </div>

          {/* Pro Tier */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Pro Tier</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>7 day storage</div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                {users.by_tier.pro}
              </div>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${(users.by_tier.pro / platform.total_users) * 100}%`, 
                height: '100%', 
                background: '#10b981' 
              }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              {((users.by_tier.pro / platform.total_users) * 100).toFixed(1)}% of users
            </div>
          </div>

          {/* Enterprise Tier */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Enterprise Tier</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Unlimited storage</div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {users.by_tier.enterprise}
              </div>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${(users.by_tier.enterprise / platform.total_users) * 100}%`, 
                height: '100%', 
                background: '#f59e0b' 
              }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              {((users.by_tier.enterprise / platform.total_users) * 100).toFixed(1)}% of users
            </div>
          </div>
        </div>

        {/* Video Analytics */}
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
          🎬 Video Analytics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>Bodycam Videos</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
              {videos.by_source.bodycam.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {((videos.by_source.bodycam / platform.total_videos) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>Studio Videos</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {videos.by_source.studio.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {((videos.by_source.studio / platform.total_videos) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>Blockchain Verified</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {videos.blockchain_verified.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {((videos.blockchain_verified / platform.total_videos) * 100).toFixed(1)}% verified
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>Uploads Today</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {videos.uploaded_today.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {videos.uploaded_this_week} this week
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
          📈 Engagement Metrics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>Showcase Page Views</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
              {engagement.showcase_views.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem', fontWeight: '600' }}>
              +{engagement.showcase_views_growth}% growth
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>Video Downloads</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {engagement.video_downloads.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {engagement.avg_downloads_per_video.toFixed(1)} avg per video
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>Social Media Clicks</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {engagement.social_media_clicks.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              From showcase pages
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>Avg Session Duration</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {engagement.avg_session_minutes.toFixed(1)}m
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Per user visit
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: '0.75rem', 
          padding: '3rem', 
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
            Platform Growing Strong 🚀
          </h3>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Rendr is building the future of content verification with blockchain technology and tiered storage solutions.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.75rem 2rem',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/@BrianJames'}
              style={{
                padding: '0.75rem 2rem',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              View Public Showcase →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '2rem 0', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            © 2025 Rendr. Bringing Truth Back to Content.
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvestorAnalytics;
