import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Showcase.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Showcase() {
  const { username } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('videos');
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [premiumFolders, setPremiumFolders] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

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
      console.log('Analytics tracking failed');
    }
  };

  const initializeShowcase = async () => {
    try {
      setLoading(true);
      const cleanUsername = username.replace(/^@/, '');
      
      console.log('Loading showcase for:', cleanUsername);
      
      // Fetch profile data
      const profileRes = await axios.get(`${BACKEND_URL}/api/@/${cleanUsername}`);
      console.log('Profile loaded:', profileRes.data);
      setProfile(profileRes.data);
      
      // Fetch videos
      const videosRes = await axios.get(`${BACKEND_URL}/api/@/${cleanUsername}/videos`);
      console.log('Videos loaded:', videosRes.data?.length);
      setVideos(videosRes.data || []);
      
      // Fetch premium folders - filter by username since _id not in response
      try {
        const foldersRes = await axios.get(`${BACKEND_URL}/api/premium-folders`);
        const userFolders = foldersRes.data.filter(f => f.creator_username === cleanUsername);
        console.log('Premium folders loaded:', userFolders.length);
        setPremiumFolders(userFolders || []);
      } catch (err) {
        console.log('No premium folders:', err.message);
        setPremiumFolders([]);
      }
      
      // Track page view
      trackPageView(cleanUsername);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading showcase:', err);
      setError(err.response?.data?.detail || 'Creator not found');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered, username:', username);
    if (username) {
      initializeShowcase();
    } else {
      console.error('No username found in URL params');
      setError('Invalid showcase URL');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

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
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to start subscription');
    }
  };

  const handleVideoClick = (videoId) => {
    navigate(`/verify?code=${videoId}`);
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    // Placeholder for community post functionality
    const newPostObj = {
      id: Date.now(),
      author: profile?.display_name || profile?.username,
      content: newPost,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0
    };

    setCommunityPosts([newPostObj, ...communityPosts]);
    setNewPost('');
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    // Placeholder for contact message functionality
    alert('Message sent! (This is a placeholder)');
    setContactForm({ name: '', email: '', message: '' });
  };

  const shareShowcase = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.display_name}'s Showcase`,
          url: url
        });
      } catch (err) {
        console.log('Share failed');
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
      </div>
    );
  }

  const stats = profile?.stats || {};
  const socialLinks = profile?.social_links || {};

  return (
    <div className="showcase-container-new">
      {/* Navbar */}
      <nav className="showcase-navbar">
        <div className="nav-brand">
          <span className="brand-icon">⭐</span>
          <span className="brand-name">RENDR</span>
        </div>
        <div className="nav-actions">
          <button className="subscribe-btn primary-gradient" onClick={() => alert('Subscribe feature coming soon!')}>
            Subscribe
          </button>
        </div>
      </nav>

      {/* Header Section */}
      <header className="header-section">
        <div className="header-content">
          <div className="profile-left-section">
            <img 
              src={profile?.profile_picture || '/default-avatar.png'} 
              alt={profile?.display_name}
              className="profile-pic-large"
            />
          </div>
          <div className="profile-info">
            <h1 className="display-name">
              {profile?.display_name || profile?.username}
              <span className="verification-badge">Creator</span>
            </h1>
            <p className="username">@{profile?.username}</p>
            <p className="bio">{profile?.bio || 'Content creator on RENDR'}</p>
            
            {/* Social Links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="social-links">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      onClick={() => trackSocialClick(platform)}
                    >
                      {platform === 'instagram' && '📷'}
                      {platform === 'tiktok' && '🎵'}
                      {platform === 'youtube' && '▶️'}
                      {platform === 'twitter' && '🐦'}
                      {platform === 'facebook' && '👥'}
                    </a>
                  )
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-value">{stats.videos || videos.length}</div>
                <div className="stat-label">Videos</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{premiumFolders.length}</div>
                <div className="stat-label">Folders</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.views || 0}</div>
                <div className="stat-label">Views</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="nav-tabs">
        <div className="tabs-container">
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
          <button
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="content-wrapper">
        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="tab-content active">
            <div className="video-controls">
              <h2>All Videos ({videos.length})</h2>
            </div>
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
                      className="video-thumbnail"
                    />
                    <div className="play-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                  </div>
                  <div className="video-info-compact">
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
          <div className="tab-content active">
            <h2>Premium Content</h2>
            <div className="folders-grid">
              {premiumFolders.map(folder => (
                <div key={folder.folder_id} className="folder-card premium-folder">
                  <div className="folder-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <span className="folder-icon">🔒</span>
                  </div>
                  <div className="folder-content">
                    <h3 className="folder-name">{folder.name}</h3>
                    <p className="folder-description">{folder.description}</p>
                    <div className="folder-price">
                      ${(folder.price_cents / 100).toFixed(2)}/{folder.billing_period || 'month'}
                    </div>
                    <div className="folder-stats">
                      <span>{folder.video_count || 0} videos</span>
                      <span>{folder.subscriber_count || 0} subscribers</span>
                    </div>
                    <button
                      className="subscribe-btn primary-gradient"
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
          <div className="tab-content active">
            <div className="about-content">
              <div className="about-main">
                <h2>About {profile?.display_name}</h2>
                <p className="about-bio">{profile?.bio || 'Content creator on RENDR'}</p>
                
                <h3>Contact</h3>
                <form className="message-form" onSubmit={handleContactSubmit}>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="form-input"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="form-input"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      placeholder="Your Message"
                      className="form-textarea"
                      rows="4"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="send-btn primary-gradient">
                    Send Message
                  </button>
                </form>
              </div>
              <div className="about-sidebar">
                <div className="sidebar-card">
                  <h4>Verified Creator</h4>
                  <p className="verified-badge">✓ Verified on RENDR</p>
                </div>
                <div className="sidebar-card">
                  <h4>Share Profile</h4>
                  <button className="share-btn" onClick={shareShowcase}>
                    Share Showcase
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="tab-content active">
            <h2>Community</h2>
            <div className="community-feed">
              <div className="post-composer">
                <textarea
                  placeholder="Share an update with your community..."
                  className="post-input"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows="3"
                ></textarea>
                <button onClick={handlePostUpdate} className="post-btn primary-gradient">
                  Post Update
                </button>
              </div>

              <div className="posts-list">
                {communityPosts.length === 0 && (
                  <div className="empty-state">
                    <p>No posts yet. Be the first to share something!</p>
                  </div>
                )}
                {communityPosts.map(post => (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <img src={profile?.profile_picture || '/default-avatar.png'} alt="Author" className="post-avatar" />
                      <div>
                        <div className="post-author">{post.author}</div>
                        <div className="post-time">{new Date(post.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="post-content">{post.content}</div>
                    <div className="post-actions">
                      <button className="post-action-btn">👍 {post.likes}</button>
                      <button className="post-action-btn">💬 {post.comments}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="tab-content active">
            <h2>Upcoming Schedule</h2>
            <div className="schedule-calendar">
              <div className="upcoming-list">
                {scheduleItems.length === 0 && (
                  <div className="empty-state">
                    <p>No scheduled events yet</p>
                  </div>
                )}
                {scheduleItems.map(item => (
                  <div key={item.id} className="schedule-item">
                    <div className="schedule-date">{item.date}</div>
                    <div className="schedule-details">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <div className="tab-content active">
            <h2>Merch Store</h2>
            <div className="store-section">
              <div className="store-grid">
                {products.length === 0 && (
                  <div className="empty-state">
                    <p>No products available yet</p>
                  </div>
                )}
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <h4>{product.name}</h4>
                    <p className="product-price">${product.price}</p>
                    <button className="add-to-cart-btn primary-gradient">Add to Cart</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="tab-content active">
            <h2>Analytics</h2>
            <div className="analytics-grid">
              <div className="stat-card">
                <h4>Total Views</h4>
                <div className="stat-value-large">{stats.views || 0}</div>
              </div>
              <div className="stat-card">
                <h4>Total Videos</h4>
                <div className="stat-value-large">{videos.length}</div>
              </div>
              <div className="stat-card">
                <h4>Subscribers</h4>
                <div className="stat-value-large">{stats.subscribers || 0}</div>
              </div>
              <div className="stat-card">
                <h4>Premium Folders</h4>
                <div className="stat-value-large">{premiumFolders.length}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Showcase;
