import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Dashboard() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('rendr_token');
  const username = localStorage.getItem('rendr_username');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Get user info
      const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(userRes.data);
      
      // Get videos
      const videosRes = await axios.get(`${BACKEND_URL}/api/videos/user/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setVideos(videosRes.data.videos);
      
      // Get folders (optional - don't fail if this errors)
      try {
        const foldersRes = await axios.get(`${BACKEND_URL}/api/folders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFolders(foldersRes.data || []);
      } catch (folderErr) {
        console.log('Folders not loaded:', folderErr);
        setFolders([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rendr_token');
    localStorage.removeItem('rendr_username');
    navigate('/CreatorLogin');
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

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="dashboard" />
      
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '2rem 0',
        marginBottom: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <Logo size="small" />
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginTop: '1rem' }}>
            Creator Dashboard
          </h1>
          <p style={{ fontSize: '1rem', color: '#6b7280' }}>
            Welcome back, {user?.display_name}!
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Total Videos
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
              {videos.length}
            </div>
          </div>
          
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Folders
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {folders.length}
            </div>
          </div>
          
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Username
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
              @{user?.username}
            </div>
          </div>
          
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Account Tier
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b', textTransform: 'capitalize' }}>
              {user?.premium_tier || 'Free'}
            </div>
          </div>
        </div>
      </div>

      {/* Videos List */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 2rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
          Your Videos
        </h2>
        
        {videos.length === 0 ? (
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            padding: '3rem', 
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
            <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1rem' }}>
              No videos yet
            </p>
            <Link 
              to="/upload"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600'
              }}
            >
              Upload Your First Video
            </Link>
          </div>
        ) : (
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            {videos.map((video, index) => (
              <div 
                key={video.video_id}
                style={{ 
                  padding: '1rem',
                  borderBottom: index < videos.length - 1 ? '1px solid #e5e7eb' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                {/* Thumbnail */}
                <div style={{ 
                  width: '100px', 
                  height: '75px', 
                  background: '#e5e7eb',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {video.thumbnail_url ? (
                    <img 
                      src={`${BACKEND_URL}${video.thumbnail_url}`}
                      alt={video.verification_code}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      🎬
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: 'bold', 
                    color: '#2563eb',
                    fontFamily: 'monospace',
                    marginBottom: '0.25rem'
                  }}>
                    {video.verification_code}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {new Date(video.captured_at).toLocaleString()} • {video.source === 'bodycam' ? 'Rendr Bodycam' : 'Rendr Studio'}
                  </div>
                  {video.has_blockchain && (
                    <div style={{ 
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      ⛓️ Blockchain Verified
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link 
                    to={`/verify?code=${video.verification_code}`}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#2563eb',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Folders Section (Future Enhancement) */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
          Folders
        </h2>
        
        <div style={{ 
          background: 'white', 
          borderRadius: '0.75rem', 
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ color: '#6b7280' }}>
            Folder management coming soon! You can organize your videos into collections.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
