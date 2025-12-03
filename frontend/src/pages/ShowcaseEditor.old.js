import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';

const BACKEND_URL = 'https://vidauth-app.preview.emergentagent.com';

function ShowcaseEditor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [settings, setSettings] = useState({
    layout: 'grid',
    thumbnailSize: 'medium',
    showCodes: true,
    showDates: true,
    theme: 'light',
    customColor: '#667eea',
    bio: ''
  });
  const [previewMode, setPreviewMode] = useState(false);
  const token = localStorage.getItem('rendr_token');
  const username = localStorage.getItem('rendr_username');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const [userRes, videosRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/videos/user/list`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUser(userRes.data);
      setVideos(videosRes.data.videos || []);
      
      // Load existing showcase settings if available
      if (userRes.data.showcase_settings) {
        setSettings({ ...settings, ...userRes.data.showcase_settings });
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const saveSettings = async () => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/users/profile`,
        { showcase_settings: settings, bio: settings.bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Showcase settings saved!');
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const themes = {
    light: { bg: '#ffffff', text: '#111827', card: '#f9fafb' },
    dark: { bg: '#111827', text: '#ffffff', card: '#1f2937' },
    blue: { bg: '#dbeafe', text: '#1e3a8a', card: '#bfdbfe' },
    purple: { bg: '#f3e8ff', text: '#6b21a8', card: '#e9d5ff' },
    green: { bg: '#d1fae5', text: '#065f46', card: '#a7f3d0' }
  };

  const currentTheme = themes[settings.theme] || themes.light;

  const thumbnailSizes = {
    small: '150px',
    medium: '200px',
    large: '280px'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="editor" />

      <div style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                🎨 Showcase Editor
              </h1>
              <p style={{ color: '#6b7280' }}>Customize how your portfolio looks to visitors</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                to={`/@${username}`}
                target="_blank"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600'
                }}
              >
                🔗 View Live Showcase
              </Link>
              
              <button
                onClick={saveSettings}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                💾 Save Changes
              </button>
            </div>
          </div>

          {/* Split View */}
          <div style={{ display: 'grid', gridTemplateColumns: previewMode ? '1fr' : '400px 1fr', gap: '2rem' }}>
            
            {/* Settings Panel */}
            {!previewMode && (
              <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', height: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
                  Settings
                </h2>

                {/* Bio */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Bio
                  </label>
                  <textarea
                    value={settings.bio}
                    onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                    maxLength={250}
                    placeholder="Tell visitors about yourself..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {settings.bio.length}/250 characters
                  </div>
                </div>

                {/* Layout */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Layout
                  </label>
                  <select
                    value={settings.layout}
                    onChange={(e) => setSettings({ ...settings, layout: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                  </select>
                </div>

                {/* Thumbnail Size */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Thumbnail Size
                  </label>
                  <select
                    value={settings.thumbnailSize}
                    onChange={(e) => setSettings({ ...settings, thumbnailSize: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  >
                    <option value="small">Small (150px)</option>
                    <option value="medium">Medium (200px)</option>
                    <option value="large">Large (280px)</option>
                  </select>
                </div>

                {/* Theme */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Theme (Free)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {Object.keys(themes).map(themeName => (
                      <button
                        key={themeName}
                        onClick={() => setSettings({ ...settings, theme: themeName })}
                        style={{
                          padding: '0.75rem',
                          border: settings.theme === themeName ? '2px solid #667eea' : '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          background: themes[themeName].bg,
                          color: themes[themeName].text,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          fontWeight: settings.theme === themeName ? '600' : '400'
                        }}
                      >
                        {themeName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pro Features */}
                <div style={{ 
                  background: '#fef3c7', 
                  border: '2px solid #f59e0b',
                  borderRadius: '0.75rem', 
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>⭐</span> Pro Features
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '0.75rem' }}>
                    • Custom colors & fonts<br/>
                    • Remove Rendr branding<br/>
                    • Custom watermark position<br/>
                    • Analytics dashboard
                  </div>
                  <Link
                    to="/plans"
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      background: '#f59e0b',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    Upgrade to Pro
                  </Link>
                </div>

                {/* Display Options */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.showCodes}
                      onChange={(e) => setSettings({ ...settings, showCodes: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.9375rem' }}>Show verification codes</span>
                  </label>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.showDates}
                      onChange={(e) => setSettings({ ...settings, showDates: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.9375rem' }}>Show upload dates</span>
                  </label>
                </div>
              </div>
            )}

            {/* Live Preview */}
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
                  👁️ Live Preview
                </h2>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {previewMode ? '← Back to Editor' : '🖥️ Full Preview'}
                </button>
              </div>

              {/* Preview Content */}
              <div style={{
                background: currentTheme.bg,
                color: currentTheme.text,
                borderRadius: '0.75rem',
                padding: '2rem',
                minHeight: '600px'
              }}>
                {/* Profile Section */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {user?.display_name || 'Your Name'}
                  </h1>
                  <p style={{ opacity: 0.8, marginBottom: '1rem' }}>@{username}</p>
                  {settings.bio && (
                    <p style={{ maxWidth: '600px', margin: '0 auto', opacity: 0.9 }}>
                      {settings.bio}
                    </p>
                  )}
                </div>

                {/* Videos */}
                <div style={{
                  display: settings.layout === 'grid' ? 'grid' : 'flex',
                  flexDirection: settings.layout === 'list' ? 'column' : undefined,
                  gridTemplateColumns: settings.layout === 'grid' ? `repeat(auto-fill, minmax(${thumbnailSizes[settings.thumbnailSize]}, 1fr))` : undefined,
                  gap: '1rem'
                }}>
                  {videos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                      Your videos will appear here
                    </div>
                  ) : (
                    videos.slice(0, 6).map(video => (
                      <div
                        key={video.video_id}
                        style={{
                          background: currentTheme.card,
                          borderRadius: '0.75rem',
                          overflow: 'hidden',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {/* Thumbnail */}
                        <div style={{
                          width: '100%',
                          height: settings.layout === 'grid' ? thumbnailSizes[settings.thumbnailSize] : '120px',
                          background: '#e5e7eb'
                        }}>
                          {video.thumbnail_url && (
                            <img
                              src={`${BACKEND_URL}${video.thumbnail_url}`}
                              alt="Video"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ padding: '1rem' }}>
                          {settings.showCodes && (
                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                              {video.verification_code}
                            </div>
                          )}
                          {settings.showDates && (
                            <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                              {new Date(video.captured_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowcaseEditor;
