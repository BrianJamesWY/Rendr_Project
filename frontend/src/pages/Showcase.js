import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Social media platform icons and colors
const SOCIAL_PLATFORMS = {
  instagram: { icon: '📷', color: '#E4405F', label: 'Instagram' },
  tiktok: { icon: '🎵', color: '#000000', label: 'TikTok' },
  youtube: { icon: '▶️', color: '#FF0000', label: 'YouTube' },
  twitter: { icon: '🐦', color: '#1DA1F2', label: 'Twitter/X' },
  facebook: { icon: '👥', color: '#1877F2', label: 'Facebook' },
};

function Showcase() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username) {
      loadShowcase();
      trackPageView();
    }
  }, [username]);

  const trackPageView = async () => {
    try {
      const cleanUsername = username.replace(/^@/, '');
      await axios.post(`${BACKEND_URL}/api/analytics/track/page-view`, null, {
        params: { username: cleanUsername }
      });
    } catch (err) {
      // Silently fail - don't disrupt user experience
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

  const loadShowcase = async () => {
    try {
      setLoading(true);
      
      const cleanUsername = username.replace(/^@/, '');
      
      const profileRes = await axios.get(`${BACKEND_URL}/api/@/${cleanUsername}`);
      setProfile(profileRes.data);
      
      const videosRes = await axios.get(`${BACKEND_URL}/api/@/${cleanUsername}/videos`);
      setVideos(videosRes.data);
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Creator not found');
      setLoading(false);
    }
  };

  // Group videos by platform or collection/folder
  const groupedVideos = {};
  const organizeByPlatform = profile?.showcase_settings?.organizeByPlatform !== false;
  
  videos.forEach(video => {
    if (organizeByPlatform && video.platform) {
      // Split multiple platforms and add video to each
      const platforms = video.platform.split(',').map(p => p.trim());
      platforms.forEach(platform => {
        if (platform) {
          if (!groupedVideos[platform]) {
            groupedVideos[platform] = [];
          }
          groupedVideos[platform].push(video);
        }
      });
    } else if (video.folder_name) {
      // Group by folder only if folder exists
      if (!groupedVideos[video.folder_name]) {
        groupedVideos[video.folder_name] = [];
      }
      groupedVideos[video.folder_name].push(video);
    }
    // Skip videos without platform or folder (don't show "Uncategorized")
  });

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
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
          <h1 style={{ fontSize: '2rem', color: '#111827', marginBottom: '0.5rem' }}>Creator Not Found</h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error}</p>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
            ← Go Home
          </Link>
        </div>
      </div>
    );
  }

  const collectionLabel = profile.collection_label || 'Collections';

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="showcase" />
      
      {/* Header/Profile Section */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          {profile.profile_picture && (
            <img 
              src={`${BACKEND_URL}${profile.profile_picture}`}
              alt={profile.display_name}
              style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                marginBottom: '1rem',
                border: '4px solid #2563eb'
              }}
            />
          )}
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            {profile.display_name}
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1rem' }}>
            @{profile.username}
          </p>
          
          {profile.bio && (
            <p style={{ fontSize: '1rem', color: '#374151', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
              {profile.bio}
            </p>
          )}
          
          {/* Social Media Links */}
          {profile.social_media_links && profile.social_media_links.length > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem', 
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              {profile.social_media_links.map((link, index) => {
                const platformKey = link.platform.toLowerCase();
                const platformInfo = SOCIAL_PLATFORMS[platformKey] || { 
                  icon: '🔗', 
                  color: '#667eea', 
                  label: link.custom_name || link.platform 
                };
                
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackSocialClick(link.platform)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.25rem',
                      background: 'white',
                      border: `2px solid ${platformInfo.color}`,
                      borderRadius: '9999px',
                      color: platformInfo.color,
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = platformInfo.color;
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = platformInfo.color;
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{platformInfo.icon}</span>
                    {platformInfo.label}
                  </a>
                );
              })}
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2563eb' }}>
                {profile.total_videos}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Verified Videos</div>
            </div>
            
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981' }}>
                {new Date(profile.joined_at).getFullYear()}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Joined</div>
            </div>
          </div>
        </div>
      </div>

      {/* Collections/Videos Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        {Object.keys(groupedVideos).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
            <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
              No verified videos yet
            </p>
          </div>
        ) : (
          Object.keys(groupedVideos).map(folderName => {
            const platformInfo = SOCIAL_PLATFORMS[folderName.toLowerCase()];
            const isPlatformFolder = !!platformInfo;
            
            // Get social media link for this platform
            const platformLink = profile?.social_media_links?.find(
              link => link.platform.toLowerCase() === folderName.toLowerCase()
            );
            
            return (
            <div key={folderName} style={{ marginBottom: '3rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid #e5e7eb'
              }}>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {isPlatformFolder && <span style={{ fontSize: '1.75rem' }}>{platformInfo.icon}</span>}
                  {folderName}
                </h2>
                
                {platformLink && profile?.showcase_settings?.showFolderLinks && (
                  <a
                    href={platformLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackSocialClick(folderName)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: isPlatformFolder ? platformInfo.color : '#667eea',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    View All on {folderName} →
                  </a>
                )}
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '1.5rem' 
              }}>
                {groupedVideos[folderName].map(video => (
                  <div 
                    key={video.video_id}
                    style={{
                      background: 'white',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {/* Thumbnail */}
                    <div style={{ 
                      width: '100%', 
                      height: '200px', 
                      background: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {video.thumbnail_url ? (
                        <img 
                          src={`${BACKEND_URL}${video.thumbnail_url}`}
                          alt={video.verification_code}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '3rem' }}>🎬</span>
                      )}
                    </div>
                    
                    {/* Video Info */}
                    <div style={{ padding: '1rem' }}>
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: 'bold', 
                        color: '#2563eb',
                        marginBottom: '0.5rem',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}>
                        {video.verification_code}
                      </div>
                      
                      {video.description && (
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#374151', 
                          marginBottom: '0.75rem',
                          lineHeight: '1.5'
                        }}>
                          {video.description}
                        </p>
                      )}
                      
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                        {new Date(video.captured_at).toLocaleDateString()} at {new Date(video.captured_at).toLocaleTimeString()}
                      </div>
                      
                      {video.external_link && (
                        <a 
                          href={video.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            background: '#667eea',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#5568d3'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}
                        >
                          {video.platform ? `View on ${video.platform}` : 'View Original'}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Showcase;
