import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';
import VideoPlayer from '../components/VideoPlayer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Showcase() {
  const { username } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('videos');
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [showcaseFolders, setShowcaseFolders] = useState([]);
  const [premiumFolders, setPremiumFolders] = useState([]);
  const [premiumVideos, setPremiumVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const socialPlatforms = [
    { id: 'all', name: 'All', icon: '🎬' },
    { id: 'youtube', name: 'YouTube', icon: '▶️' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'facebook', name: 'Facebook', icon: '👥' }
  ];

  useEffect(() => {
    if (username) {
      loadShowcase();
    }
  }, [username, selectedPlatform]);

  const loadShowcase = async () => {
    try {
      setLoading(true);
      const cleanUsername = username.replace(/^@/, '');
      
      const profileRes = await axios.get(`${BACKEND_URL}/api/@/${cleanUsername}`);
      setProfile(profileRes.data);
      
      const videosRes = await axios.get(`${BACKEND_URL}/api/@/${cleanUsername}/videos`, {
        params: selectedPlatform !== 'all' ? { platform: selectedPlatform } : {}
      });
      setVideos(videosRes.data || []);

      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const showcaseRes = await axios.get(`${BACKEND_URL}/api/showcase-folders`, { 
          headers,
          params: { username: cleanUsername }
        });
        setShowcaseFolders(showcaseRes.data || []);
      } catch (err) {
        console.log('Showcase folders not available');
        setShowcaseFolders([]);
      }
      
      // Load premium videos (pro/enterprise tier only)
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const premiumRes = await axios.get(`${BACKEND_URL}/api/@/${cleanUsername}/premium-videos`, { headers });
        setPremiumVideos(premiumRes.data || []);
      } catch (err) {
        console.log('Premium content not available');
        setPremiumVideos([]);
      }
      
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#6b7280' }}>Loading showcase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Creator Not Found</h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error}</p>
          <Link to="/explore" style={{ color: '#667eea', textDecoration: 'underline' }}>Browse Creators</Link>
        </div>
      </div>
    );
  }

  const socialLinks = profile?.social_media_links || [];
  const stats = {
    videos: videos.length,
    folders: showcaseFolders.length,
    views: profile?.total_videos || 0
  };

  return (
    <>
      {showVideoModal && selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo.video_id}
          thumbnail={selectedVideo.thumbnail_url}
          title={selectedVideo.title}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }}
          isAuthenticated={false}
        />
      )}
      
      <div style={{ margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', background: '#f8f9fa', color: '#030303', lineHeight: 1.5 }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        
        {/* Navigation Bar */}
      <nav style={{ background: 'white', padding: '12px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <Logo size="medium" />
        </Link>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {localStorage.getItem('token') && (
            <Link to="/dashboard" style={{ padding: '8px 20px', background: 'white', color: '#667eea', border: '1px solid #667eea', borderRadius: '8px', fontSize: '14px', fontWeight: '600', textDecoration: 'none', display: 'inline-block' }}>
              Back to Dashboard
            </Link>
          )}
          <button style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: 'auto' }}>
            Subscribe
          </button>
        </div>
      </nav>

      {/* Header Section with LARGE LEFT Profile */}
      <header style={{ 
        background: profile?.banner_image ? `url(${profile.banner_image})` : 'linear-gradient(135deg, #667eea, #764ba2)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '50px 24px', 
        color: 'white', 
        position: 'relative', 
        minHeight: '300px' 
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '50px' }}>
          <div style={{ flexShrink: 0 }}>
            <img 
              src={profile?.profile_picture || 'https://via.placeholder.com/240/667eea/ffffff?text=Profile'} 
              alt="Profile" 
              style={{ 
                width: '240px', 
                height: '240px', 
                borderRadius: profile?.profile_shape === 'circle' ? '50%' : 
                             profile?.profile_shape === 'square' ? '0' : 
                             profile?.profile_shape === 'rounded' ? '24px' : '50%',
                clipPath: profile?.profile_shape === 'hexagon' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' :
                         profile?.profile_shape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none',
                border: `${profile?.profile_border || '6'}px solid ${profile?.border_color || 'white'}`, 
                background: 'white', 
                objectFit: 'cover', 
                boxShadow: profile?.profile_effect === 'shadow-lg' ? '0 10px 40px rgba(0, 0, 0, 0.4)' :
                          profile?.profile_effect === 'shadow-sm' ? '0 4px 8px rgba(0, 0, 0, 0.2)' :
                          profile?.profile_effect === 'glow' ? `0 0 30px ${profile?.border_color || '#667eea'}` :
                          '0 6px 30px rgba(0, 0, 0, 0.3)',
                display: 'block', 
                aspectRatio: '1 / 1', 
                flexShrink: 0 
              }}
            />
          </div>
          
          <div style={{ flexGrow: 1, textAlign: 'center', paddingRight: '240px' }}>
            <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              {profile?.display_name || profile?.username}
              <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                ✓ Creator
              </span>
            </h1>
            <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '16px' }}>@{profile?.username}</div>
            <p style={{ fontSize: '16px', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 24px', opacity: 0.95 }}>
              {profile?.bio || 'Content creator on RENDR'}
            </p>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', justifyContent: 'center' }}>
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackSocialClick(link.platform)}
                    style={{ width: '66px', height: '66px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s', border: '3px solid rgba(255, 255, 255, 0.3)', overflow: 'hidden', position: 'relative', background: 'rgba(255, 255, 255, 0.1)', fontSize: '30px' }}
                  >
                    {link.platform === 'instagram' && '📷'}
                    {link.platform === 'tiktok' && '🎵'}
                    {link.platform === 'youtube' && '▶️'}
                    {link.platform === 'twitter' && '🐦'}
                    {link.platform === 'facebook' && '👥'}
                    {!['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'].includes(link.platform) && '🔗'}
                  </a>
                ))}
              </div>
            )}

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '32px', fontSize: '14px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '24px', fontWeight: '700' }}>{stats.videos}</span>
                <span style={{ fontSize: '14px', opacity: 0.9 }}>Videos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '24px', fontWeight: '700' }}>{stats.folders}</span>
                <span style={{ fontSize: '14px', opacity: 0.9 }}>Folders</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '24px', fontWeight: '700' }}>{stats.views}</span>
                <span style={{ fontSize: '14px', opacity: 0.9 }}>Views</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e5e5', position: 'sticky', top: '56px', zIndex: 100, boxShadow: '0 1px 0 rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', padding: '0 24px', gap: '2px' }}>
          <button onClick={() => setActiveTab('videos')} style={{ padding: '14px 18px', background: activeTab === 'videos' ? 'rgba(102, 126, 234, 0.1)' : 'none', border: 'none', fontSize: '14px', fontWeight: '500', color: activeTab === 'videos' ? '#667eea' : '#606060', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'videos' ? '3px solid #667eea' : 'none' }}>
            Videos
          </button>
          <button onClick={() => setActiveTab('premium')} style={{ padding: '14px 18px', background: activeTab === 'premium' ? 'rgba(102, 126, 234, 0.1)' : 'none', border: 'none', fontSize: '14px', fontWeight: '500', color: activeTab === 'premium' ? '#667eea' : '#606060', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'premium' ? '3px solid #667eea' : 'none' }}>
            Premium Videos
          </button>
          <button onClick={() => setActiveTab('schedule')} style={{ padding: '14px 18px', background: activeTab === 'schedule' ? 'rgba(102, 126, 234, 0.1)' : 'none', border: 'none', fontSize: '14px', fontWeight: '500', color: activeTab === 'schedule' ? '#667eea' : '#606060', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'schedule' ? '3px solid #667eea' : 'none' }}>
            Schedule
          </button>
          <button onClick={() => setActiveTab('community')} style={{ padding: '14px 18px', background: activeTab === 'community' ? 'rgba(102, 126, 234, 0.1)' : 'none', border: 'none', fontSize: '14px', fontWeight: '500', color: activeTab === 'community' ? '#667eea' : '#606060', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'community' ? '3px solid #667eea' : 'none' }}>
            Community
          </button>
          <button onClick={() => setActiveTab('store')} style={{ padding: '14px 18px', background: activeTab === 'store' ? 'rgba(102, 126, 234, 0.1)' : 'none', border: 'none', fontSize: '14px', fontWeight: '500', color: activeTab === 'store' ? '#667eea' : '#606060', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'store' ? '3px solid #667eea' : 'none' }}>
            Store
          </button>
          <button onClick={() => setActiveTab('about')} style={{ padding: '14px 18px', background: activeTab === 'about' ? 'rgba(102, 126, 234, 0.1)' : 'none', border: 'none', fontSize: '14px', fontWeight: '500', color: activeTab === 'about' ? '#667eea' : '#606060', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'about' ? '3px solid #667eea' : 'none' }}>
            About
          </button>
          <button onClick={() => setActiveTab('contact')} style={{ padding: '14px 18px', background: activeTab === 'contact' ? 'rgba(102, 126, 234, 0.1)' : 'none', border: 'none', fontSize: '14px', fontWeight: '500', color: activeTab === 'contact' ? '#667eea' : '#606060', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'contact' ? '3px solid #667eea' : 'none' }}>
            Contact
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* All Videos Tab */}
        {activeTab === 'videos' && (
          <div>
            {/* Sorting Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ fontSize: '14px', color: '#606060', fontWeight: '500' }}>Sort by:</label>
                <select style={{ padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '14px', background: 'white', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <option value="recent">Most Recent</option>
                  <option value="views">Most Views</option>
                  <option value="oldest">Oldest First</option>
                </select>
                
                <label style={{ fontSize: '14px', color: '#606060', fontWeight: '500', marginLeft: '12px' }}>Platform:</label>
                <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '14px', background: 'white', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  {socialPlatforms.map(platform => (
                    <option key={platform.id} value={platform.id}>{platform.icon} {platform.name}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '8px 12px', background: '#667eea', color: 'white', border: '1px solid #667eea', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' }}>Grid</button>
                <button style={{ padding: '8px 12px', background: 'white', color: '#030303', border: '1px solid #e5e5e5', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' }}>List</button>
              </div>
            </div>
            
            {/* Videos Grid - EXTREMELY COMPACT */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '32px' }}>
              {videos.map(video => (
                <div key={video.video_id} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => { setSelectedVideo(video); setShowVideoModal(true); }}>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#e5e5e5', borderRadius: '4px', overflow: 'hidden' }}>
                    <img 
                      src={video.thumbnail_url ? `${BACKEND_URL}${video.thumbnail_url}` : 'https://via.placeholder.com/320x180/667eea/ffffff?text=Video'}
                      alt="Video"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', pointerEvents: 'none' }}
                    />
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s', pointerEvents: 'none' }}>
                      <div style={{ width: '24px', height: '24px', background: 'rgba(0, 0, 0, 0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transform: 'scale(0.8)', transition: 'all 0.3s', color: 'white', fontSize: '12px', pointerEvents: 'none' }}>▶</div>
                    </div>
                  </div>
                  <div style={{ paddingTop: '6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '500', color: '#030303', lineHeight: 1.2, marginBottom: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {video.title || 'Video'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#606060', lineHeight: 1.2 }}>
                      <div style={{ marginBottom: '1px' }}>{video.view_count || 0} views</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        <span style={{ color: '#667eea', fontWeight: '600' }}>{video.verification_code}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {videos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px', color: '#6b7280' }}>
                <p>No videos yet</p>
              </div>
            )}

            {/* Load More */}
            {videos.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <button style={{ padding: '10px 32px', background: 'white', border: '2px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#030303', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Load More Videos
                </button>
              </div>
            )}
          </div>
        )}

        {/* Premium Videos Tab */}
        {activeTab === 'premium' && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
              Premium Content
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {premiumVideos.map(video => (
                <div 
                  key={video.video_id} 
                  style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onClick={() => {
                    setSelectedVideo(video);
                    setShowVideoModal(true);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ 
                    position: 'relative', 
                    paddingBottom: '56.25%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        style={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    ) : (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '48px'
                      }}>
                        🎥
                      </div>
                    )}
                    
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      ▶️
                    </div>
                    
                    {video.verification_code && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {video.verification_code}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ 
                      fontSize: '15px', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {video.title || 'Untitled Video'}
                    </h4>
                    
                    {video.description && (
                      <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {video.description}
                      </p>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      <span>{video.storage?.tier || 'free'}</span>
                      <span>{new Date(video.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {premiumVideos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
                <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No Premium Content Yet</p>
                <p style={{ fontSize: '14px' }}>This creator hasn't uploaded any premium videos</p>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div style={{ display: 'grid', gridTemplateColumns: '65% 35%', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ background: 'white', padding: '28px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#030303' }}>About {profile?.display_name || profile?.username}</h2>
              <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#606060' }}>{profile?.bio || 'Content creator on RENDR'}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>✓ Verified Creator</h4>
                <p style={{ fontSize: '14px', color: '#606060' }}>Verified on RENDR</p>
              </div>
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Community</h2>
            <p style={{ color: '#6b7280' }}>Community features coming soon!</p>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Upcoming Schedule</h2>
            <p style={{ color: '#6b7280' }}>No scheduled events yet</p>
          </div>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Store</h2>
            <p style={{ color: '#6b7280' }}>Store coming soon!</p>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Get in Touch</h2>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#030303' }}>Your Name</label>
                <input type="text" placeholder="Enter your name" style={{ width: '100%', padding: '12px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#030303' }}>Your Email</label>
                <input type="email" placeholder="your@email.com" style={{ width: '100%', padding: '12px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#030303' }}>Message</label>
                <textarea placeholder="Your message..." rows="5" style={{ width: '100%', padding: '12px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', resize: 'vertical', minHeight: '120px' }}></textarea>
              </div>
              <button style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                Send Message
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Visitor Video Details Modal */}
      {showVideoModal && selectedVideo && (
        <VisitorVideoModal 
          video={selectedVideo}
          socialPlatforms={socialPlatforms}
          onClose={() => { setShowVideoModal(false); setSelectedVideo(null); }}
        />
      )}
    </div>
    </>
  );
}

// Visitor Video Modal Component
function VisitorVideoModal({ video, socialPlatforms, onClose }) {
  const getPlatformInfo = (platformId) => {
    return socialPlatforms.find(p => p.id === platformId) || { name: platformId, icon: '🔗' };
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Logo size="small" />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>Video Details</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        {/* Video Player */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
          <video 
            controls
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
            poster={video.thumbnail_url ? `${BACKEND_URL}${video.thumbnail_url}` : undefined}
          >
            <source src={`${BACKEND_URL}/api/videos/watch/${video.video_id}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Info */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{video.title || 'Untitled Video'}</h4>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', fontWeight: '600', color: '#667eea', marginBottom: '8px' }}>
            Verification: {video.verification_code}
          </div>
          {video.description && (
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', marginBottom: '16px' }}>{video.description}</p>
          )}
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Uploaded {new Date(video.captured_at).toLocaleDateString()}
          </div>
        </div>

        {/* Social Media Links */}
        {video.social_links && video.social_links.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Watch this video on:</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {video.social_links.filter(link => link.url).map((link, index) => {
                const platformInfo = getPlatformInfo(link.platform);
                return (
                  <a 
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '12px 16px', 
                      background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                      color: 'white', 
                      borderRadius: '8px', 
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{platformInfo.icon}</span>
                    <span style={{ flex: 1 }}>Take me to {platformInfo.name}</span>
                    <span>→</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {(!video.social_links || video.social_links.length === 0) && (
          <div style={{ textAlign: 'center', padding: '20px', background: '#f9fafb', borderRadius: '8px', color: '#6b7280', fontSize: '14px' }}>
            No social media links available for this video
          </div>
        )}
      </div>
    </div>
  );
}

export default Showcase;
