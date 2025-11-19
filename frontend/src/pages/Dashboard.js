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
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
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

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('rendr_token');
      localStorage.removeItem('rendr_username');
      navigate('/CreatorLogin');
    }
  };

  const moveVideoToFolder = async (videoId, folderId) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/videos/${videoId}/folder?folder_id=${folderId || ''}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reload videos
      loadDashboard();
      setShowMoveModal(false);
      setSelectedVideo(null);
    } catch (err) {
      alert('Failed to move video');
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
          
          <Link 
            to="/plans"
            style={{
              display: 'block',
              background: 'white', 
              borderRadius: '0.75rem', 
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              textDecoration: 'none',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Account Tier
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b', textTransform: 'capitalize' }}>
              {user?.premium_tier || 'Free'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#667eea', marginTop: '0.5rem', fontWeight: '600' }}>
              View Plans →
            </div>
          </Link>
        </div>
      </div>

      {/* Folder Management & Videos */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            Video Library
          </h2>
          <button
            onClick={() => alert('Create new folder feature coming soon!')}
            style={{
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + New Folder
          </button>
        </div>

        {/* Social Media Quick Folders */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[
            { name: 'Instagram', icon: '📷', color: '#E4405F' },
            { name: 'TikTok', icon: '🎵', color: '#000000' },
            { name: 'YouTube', icon: '▶️', color: '#FF0000' },
            { name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
            { name: 'Default', icon: '📁', color: '#667eea' }
          ].map(platform => (
            <div
              key={platform.name}
              style={{
                background: 'white',
                borderRadius: '0.75rem',
                padding: '1rem',
                textAlign: 'center',
                cursor: 'pointer',
                border: '2px solid #e5e7eb',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = platform.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => alert(`${platform.name} folder - Coming soon!`)}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{platform.icon}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                {platform.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                0 videos
              </div>
            </div>
          ))}
        </div>
        
        {/* Videos Grid */}
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
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
              Upload your first verified video to get started!
            </p>
            <Link 
              to="/upload"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Upload Video
            </Link>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {videos.map(video => (
              <div 
                key={video.video_id}
                style={{
                  background: 'white',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Thumbnail */}
                <div style={{ 
                  width: '100%', 
                  height: '180px', 
                  background: '#e5e7eb',
                  position: 'relative',
                  overflow: 'hidden'
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
                      fontSize: '3rem'
                    }}>
                      🎬
                    </div>
                  )}
                  
                  {/* Blockchain Badge Overlay */}
                  {video.has_blockchain && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(254, 243, 199, 0.95)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#92400e',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      ⛓️ Verified
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div style={{ padding: '1rem' }}>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: 'bold', 
                    color: '#667eea',
                    fontFamily: 'monospace',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.05em'
                  }}>
                    {video.verification_code}
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280',
                    marginBottom: '0.75rem'
                  }}>
                    {new Date(video.captured_at).toLocaleDateString()} at {new Date(video.captured_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#9ca3af',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {video.source === 'bodycam' ? '📱 Bodycam' : '💻 Studio'}
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setSelectedVideo(video);
                        setShowMoveModal(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      📁 Move
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(video.verification_code);
                        alert('Code copied!');
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      📋 Copy Code
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Move to Folder Modal */}
      {showMoveModal && selectedVideo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Move Video
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Move <strong>{selectedVideo.verification_code}</strong> to:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {folders.map(folder => (
                <button
                  key={folder.folder_id}
                  onClick={() => moveVideoToFolder(selectedVideo.video_id, folder.folder_id)}
                  style={{
                    padding: '1rem',
                    background: '#f3f4f6',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.background = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                >
                  📁 {folder.folder_name}
                </button>
              ))}
              
              <button
                onClick={() => moveVideoToFolder(selectedVideo.video_id, null)}
                style={{
                  padding: '1rem',
                  background: '#f3f4f6',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                📂 Uncategorized
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowMoveModal(false);
                setSelectedVideo(null);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
