import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Dashboard() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadDashboard();
  }, [token]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(userRes.data);
      
      const videosRes = await axios.get(`${BACKEND_URL}/api/videos/user/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setVideos(Array.isArray(videosRes.data) ? videosRes.data : videosRes.data.videos || []);

      try {
        const analyticsRes = await axios.get(`${BACKEND_URL}/api/analytics/dashboard?days=30`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(analyticsRes.data);
      } catch (analyticsErr) {
        console.error('Failed to load analytics:', analyticsErr);
        setAnalytics(null);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('rendr_username');
      navigate('/CreatorLogin');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#991b1b', marginBottom: '1rem' }}>{error}</p>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  const topVideos = analytics?.top_videos || [];

  return (
    <div style={{ margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', background: '#f9f9f9', color: '#030303' }}>
      {/* Compact Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', height: '56px', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Logo size="medium" />
          </Link>
          
          <nav style={{ display: 'flex', gap: '4px' }}>
            <Link to="/dashboard" style={{ padding: '8px 12px', color: '#030303', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', background: '#e5e5e5' }}>Dashboard</Link>
            <Link to="/analytics" style={{ padding: '8px 12px', color: '#606060', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', transition: 'background 0.2s' }}>Analytics</Link>
            <Link to="/upload" style={{ padding: '8px 12px', color: '#606060', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', transition: 'background 0.2s' }}>Videos</Link>
            <Link to="/bounties" style={{ padding: '8px 12px', color: '#606060', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', transition: 'background 0.2s' }}>Bounties</Link>
            <Link to="/earnings" style={{ padding: '8px 12px', color: '#606060', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', transition: 'background 0.2s' }}>Monetization</Link>
            <Link to="/settings" style={{ padding: '8px 12px', color: '#606060', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', transition: 'background 0.2s' }}>Settings</Link>
          </nav>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to={`/@${user?.username}`} style={{ padding: '8px 14px', fontSize: '14px', fontWeight: '500', borderRadius: '18px', border: '1px solid #d0d0d0', cursor: 'pointer', textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s', background: 'white', color: '#667eea' }}>View Showcase</Link>
          <Link to="/upload" style={{ padding: '8px 14px', fontSize: '14px', fontWeight: '500', borderRadius: '18px', border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>Upload Video</Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '4px' }}>Welcome back, {user?.display_name || user?.username}</h1>
          <p style={{ fontSize: '14px', color: '#606060' }}>Here's what's happening with your videos today</p>
        </div>
        
        {/* Stats - One Row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', minHeight: '88px' }}>
            <div style={{ fontSize: '13px', color: '#606060', marginBottom: '8px' }}>Total Videos</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#030303' }}>{videos.length}</div>
            <div style={{ fontSize: '12px', color: '#667eea', marginTop: '4px' }}>+{videos.filter(v => {
              const date = new Date(v.captured_at);
              const now = new Date();
              const diffTime = Math.abs(now - date);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 30;
            }).length} this month</div>
          </div>
          <div style={{ flex: 1, background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', minHeight: '88px' }}>
            <div style={{ fontSize: '13px', color: '#606060', marginBottom: '8px' }}>Verifications</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#030303' }}>{analytics?.total_video_views || 0}</div>
            <div style={{ fontSize: '12px', color: '#667eea', marginTop: '4px' }}>+18%</div>
          </div>
          <div style={{ flex: 1, background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', minHeight: '88px' }}>
            <div style={{ fontSize: '13px', color: '#606060', marginBottom: '8px' }}>Total Views</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#030303' }}>{analytics?.total_page_views || 0}</div>
            <div style={{ fontSize: '12px', color: '#667eea', marginTop: '4px' }}>+24%</div>
          </div>
          <div style={{ flex: 1, background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', minHeight: '88px' }}>
            <div style={{ fontSize: '13px', color: '#606060', marginBottom: '8px' }}>Monthly Earnings</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#030303' }}>$0</div>
            <div style={{ fontSize: '12px', color: '#667eea', marginTop: '4px' }}>Coming soon</div>
          </div>
        </div>
        
        {/* Bounty CTA */}
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', padding: '20px', marginBottom: '24px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>🎯 Protect Your Content with Bounties</div>
              <div style={{ fontSize: '14px', opacity: 0.95, marginBottom: '12px' }}>892 hunters are ready to find stolen copies of your videos. You only pay if theft is found.</div>
              <div style={{ display: 'flex', gap: '24px', fontSize: '13px', opacity: 0.9 }}>
                <span>✓ 3.2 day avg discovery</span>
                <span>✓ 94% success rate</span>
                <span>✓ Only pay when found</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link to="/bounties/post" style={{ display: 'inline-block', padding: '12px 24px', background: 'white', color: '#667eea', fontWeight: '600', fontSize: '15px', borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Post Bounty</Link>
              <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.9 }}>Starting at $25</div>
            </div>
          </div>
        </div>
        
        {/* Platforms - One Row */}
        <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#030303' }}>Connected Platforms</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '24px' }}>▶️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#030303' }}>YouTube</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>42 videos · 2.8K clicks</div>
              </div>
            </div>
            <div style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '24px' }}>🎵</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#030303' }}>TikTok</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>38 videos · 2.1K clicks</div>
              </div>
            </div>
            <div style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '24px' }}>📷</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#030303' }}>Instagram</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>28 videos · 1.4K clicks</div>
              </div>
            </div>
            <div style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '24px' }}>𝕏</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#030303' }}>Twitter</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>19 videos · 847 clicks</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          {/* Left Column */}
          <div>
            {/* Chart */}
            <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Performance</h2>
                <select style={{ padding: '6px 10px', border: '1px solid #d0d0d0', borderRadius: '4px', fontSize: '13px', background: 'white', cursor: 'pointer' }}>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <div style={{ height: '200px', background: '#f9f9f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#909090', fontSize: '13px' }}>Views & Verifications Chart</div>
            </div>
            
            {/* Recent Videos */}
            <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Videos</h2>
                <Link to="/my-videos" style={{ fontSize: '13px', color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>View All →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {videos.slice(0, 5).map((video, index) => (
                  <div key={video.video_id} style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', ':hover': { background: '#f9f9f9' } }} onClick={() => navigate(`/my-videos`)}>
                    <div style={{ width: '120px', height: '68px', background: '#e5e5e5', borderRadius: '4px', flexShrink: 0, overflow: 'hidden' }}>
                      {video.thumbnail_url ? (
                        <img src={`${BACKEND_URL}${video.thumbnail_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎬</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#030303', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title || 'Untitled Video'}</div>
                      <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', fontWeight: '600', color: '#667eea', marginBottom: '4px' }}>{video.verification_code}</div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#606060' }}>
                        <span>{video.folder_id ? '📁 In Folder' : '📂 No Folder'}</span>
                        <span>Uploaded {new Date(video.captured_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {videos.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#909090', fontSize: '14px' }}>
                    <p style={{ marginBottom: '12px' }}>No videos uploaded yet</p>
                    <Link to="/upload" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>Upload your first video →</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Quick Stats</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', color: '#606060' }}>Premium Subscribers</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', color: '#606060' }}>Premium Folders</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', color: '#606060' }}>Followers</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', color: '#606060' }}>Storage Used</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{videos.length} videos</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;