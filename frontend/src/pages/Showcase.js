import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './NewShowcase.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function NewShowcase() {
  const { username } = useParams();
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState('videos');
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [premiumFolders, setPremiumFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username) {
      loadShowcase();
    }
  }, [username]);

  const loadShowcase = async () => {
    try {
      setLoading(true);
      const cleanUsername = username.replace(/^@/, '');
      
      // Load profile
      const profileRes = await axios.get(`${BACKEND_URL}/api/@/${cleanUsername}`);
      setProfile(profileRes.data);
      
      // Load videos
      const videosRes = await axios.get(`${BACKEND_URL}/api/@/${cleanUsername}/videos`);
      setVideos(videosRes.data || []);
      
      // Load premium folders
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const foldersRes = await axios.get(`${BACKEND_URL}/api/premium-folders`, { headers });
        // Filter by creator username
        const userFolders = foldersRes.data.filter(f => 
          f.creator_username === cleanUsername || f.creator_id === profileRes.data.id
        );
        setPremiumFolders(userFolders || []);
      } catch (err) {
        console.log('Premium folders not available');
        setPremiumFolders([]);
      }
      
      // Track page view
      trackPageView(cleanUsername);
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Creator not found');
      setLoading(false);
    }
  };

  const trackPageView = async (cleanUsername) => {
    try {
      await axios.post(`${BACKEND_URL}/api/analytics/track/page-view`, null, {
        params: { username: cleanUsername }
      });
    } catch (err) {
      console.log('Analytics tracking failed');
    }
  };

  const trackSocialClick = async (platform) => {
    try {
      const cleanUsername = username.replace(/^@/, '');
      await axios.post(`${BACKEND_URL}/api/analytics/track/social-click`, null, {
        params: { username: cleanUsername, platform }
      });
    } catch (err) {
      console.log('Social tracking failed');
    }
  };

  const handleSubscribeToFolder = async (folderId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/creator-login');
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/stripe/subscribe`,
        {
          folder_id: folderId,
          success_url: `${window.location.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: window.location.href
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start subscription');
    }
  };

  const handleVideoClick = (verificationCode) => {
    navigate(`/verify?code=${verificationCode}`);
  };

  const shareShowcase = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.display_name || profile?.username}'s Showcase`,
          url: url
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="showcase-loading">
        <div className="loading-spinner"></div>
        <p>Loading showcase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="showcase-error">
        <h2>Creator Not Found</h2>
        <p>{error}</p>
        <Link to="/explore">Browse Creators</Link>
      </div>
    );
  }

  const socialLinks = profile?.social_media_links || [];
  const stats = {
    videos: videos.length,
    folders: premiumFolders.length,
    views: profile?.total_videos || 0
  };

  return (
    <div className="new-showcase-container">
      {/* Navbar */}
      <nav className="showcase-nav">
        <div className="nav-brand">
          <span className="brand-icon">⭐</span>
          <span className="brand-name">RENDR</span>
        </div>
        <div className="nav-actions">
          <button className="btn-subscribe" onClick={() => alert('Subscribe feature coming soon!')}>
            Subscribe
          </button>
        </div>
      </nav>

      {/* Header/Hero Section */}
      <header className="showcase-header">
        <div className="header-content">
          <div className="profile-section">
            <img 
              src={profile?.profile_picture || '/default-avatar.png'} 
              alt={profile?.display_name || profile?.username}
              className="profile-pic"
            />
          </div>
          <div className="profile-info">
            <h1 className="display-name">
              {profile?.display_name || profile?.username}
              <span className="verified-badge">✓ Creator</span>
            </h1>
            <p className="username">@{profile?.username}</p>
            <p className="bio">{profile?.bio || 'Content creator on RENDR'}</p>
            
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="social-links">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    onClick={() => trackSocialClick(link.platform)}
                  >
                    {link.platform === 'instagram' && '📷'}
                    {link.platform === 'tiktok' && '🎵'}
                    {link.platform === 'youtube' && '▶️'}
                    {link.platform === 'twitter' && '🐦'}
                    {link.platform === 'facebook' && '👥'}
                  </a>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="stats-row">
              <div className="stat">
                <div className="stat-value">{stats.videos}</div>
                <div className="stat-label">Videos</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.folders}</div>
                <div className="stat-label">Premium</div>
              </div>
              <div className="stat">
                <div className="stat-value">{stats.views}</div>
                <div className="stat-label">Views</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
          <button
            className={`tab ${activeTab === 'premium' ? 'active' : ''}`}
            onClick={() => setActiveTab('premium')}
          >
            Premium
          </button>
          <button
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={`tab ${activeTab === 'community' ? 'active' : ''}`}
            onClick={() => setActiveTab('community')}
          >
            Community
          </button>
          <button
            className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
          <button
            className={`tab ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            Store
          </button>
        </div>
      </div>

      {/* Content Area */}
      <main className="showcase-content">
        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="tab-content">
            <h2>All Videos ({videos.length})</h2>
            <div className="videos-grid">
              {videos.map(video => (
                <div
                  key={video.video_id}
                  className="video-card"
                  onClick={() => handleVideoClick(video.verification_code)}
                >
                  <div className="thumbnail-wrapper">
                    <img
                      src={video.thumbnail_url || '/default-thumbnail.png'}
                      alt={video.title || 'Video'}
                      className="thumbnail"
                    />
                    <div className="play-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                  </div>
                  <div className="video-info">
                    <span className="rendr-code">{video.verification_code}</span>
                  </div>
                </div>
              ))}
            </div>
            {videos.length === 0 && (
              <div className="empty-state">
                <p>No videos yet</p>
              </div>
            )}
          </div>
        )}

        {/* Premium Tab */}
        {activeTab === 'premium' && (
          <div className="tab-content">
            <h2>Premium Content</h2>
            <div className="folders-grid">
              {premiumFolders.map(folder => (
                <div key={folder.folder_id} className="folder-card">
                  <div className="folder-header">
                    <span className="folder-icon">🔒</span>
                  </div>
                  <div className="folder-body">
                    <h3>{folder.name}</h3>
                    <p>{folder.description}</p>
                    <div className="folder-price">
                      ${(folder.price_cents / 100).toFixed(2)}/month
                    </div>
                    <div className="folder-stats">
                      <span>{folder.video_count || 0} videos</span>
                      <span>{folder.subscriber_count || 0} subscribers</span>
                    </div>
                    <button
                      className="btn-subscribe-folder"
                      onClick={() => handleSubscribeToFolder(folder.folder_id)}
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {premiumFolders.length === 0 && (
              <div className="empty-state">
                <p>No premium content available yet</p>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="tab-content">
            <div className="about-grid">
              <div className="about-main">
                <h2>About {profile?.display_name || profile?.username}</h2>
                <p className="about-bio">{profile?.bio || 'Content creator on RENDR'}</p>
              </div>
              <div className="about-sidebar">
                <div className="sidebar-card">
                  <h4>✓ Verified Creator</h4>
                  <p>Verified on RENDR</p>
                </div>
                <div className="sidebar-card">
                  <button className="btn-share" onClick={shareShowcase}>
                    Share Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="tab-content">
            <h2>Community</h2>
            <div className="empty-state">
              <p>Community features coming soon!</p>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="tab-content">
            <h2>Upcoming Schedule</h2>
            <div className="empty-state">
              <p>No scheduled events yet</p>
            </div>
          </div>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <div className="tab-content">
            <h2>Store</h2>
            <div className="empty-state">
              <p>Store coming soon!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default NewShowcase;
