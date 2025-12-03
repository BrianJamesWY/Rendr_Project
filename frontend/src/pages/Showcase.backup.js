import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';

const BACKEND_URL = 'https://vidauth-app.preview.emergentagent.com';

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
  const [showcaseFolders, setShowcaseFolders] = useState([]);
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
      
      // Load showcase folders for this user
      try {
        const foldersRes = await axios.get(`${BACKEND_URL}/api/@/${cleanUsername}/showcase-folders`);
        setShowcaseFolders(foldersRes.data || []);
      } catch (folderErr) {
        console.log('No showcase folders loaded');
        setShowcaseFolders([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Creator not found');
      setLoading(false);
    }
  };

  // Group videos by showcase folders
  const groupedVideos = {};
  
  // Filter to only show public folders on showcase
  const publicFolders = showcaseFolders.filter(folder => folder.is_public !== false);
  
  // Create folder groups from public showcase folders only
  publicFolders.forEach(folder => {
    groupedVideos[folder.folder_id] = {
      folderName: folder.folder_name,
      description: folder.description,
      videos: []
    };
  });
  
  // Assign videos to their folders
  videos.forEach(video => {
    if (video.showcase_folder_id && groupedVideos[video.showcase_folder_id]) {
      groupedVideos[video.showcase_folder_id].videos.push(video);
    }
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
      <div style={{ 
        background: profile.banner_image ? `url(${BACKEND_URL}${profile.banner_image})` : 'white',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid #e5e7eb',
        position: 'relative'
      }}>
        {/* Overlay for better text readability */}
        {profile.banner_image && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)'
          }} />
        )}
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', padding: '3rem 1rem', position: 'relative', zIndex: 1 }}>
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
                border: '4px solid #2563eb',
                boxShadow: profile.banner_image ? '0 4px 6px rgba(0,0,0,0.3)' : 'none'
              }}
            />
          )}
          
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: profile.banner_image ? '#ffffff' : '#111827', 
            marginBottom: '0.5rem',
            textShadow: profile.banner_image ? '0 2px 4px rgba(0,0,0,0.8)' : 'none'
          }}>
            {profile.display_name}
          </h1>
          
          <p style={{ 
            fontSize: '1.25rem', 
            color: profile.banner_image ? '#e5e7eb' : '#6b7280', 
            marginBottom: '1rem',
            textShadow: profile.banner_image ? '0 1px 2px rgba(0,0,0,0.8)' : 'none'
          }}>
            @{profile.username}
          </p>
          
          {profile.bio && (
            <p style={{ 
              fontSize: '1rem', 
              color: profile.banner_image ? '#ffffff' : '#374151', 
              maxWidth: '600px', 
              margin: '0 auto 1.5rem',
              textShadow: profile.banner_image ? '0 1px 2px rgba(0,0,0,0.8)' : 'none'
            }}>
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
              No videos in folders yet
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
              Videos must be added to showcase folders to appear here
            </p>
          </div>
        ) : (
          Object.keys(groupedVideos).map(folderId => {
            const folderData = groupedVideos[folderId];
            
            // Skip empty folders
            if (!folderData.videos || folderData.videos.length === 0) {
              return null;
            }
            
            return (
            <div key={folderId} style={{ marginBottom: '4rem' }}>
              {/* Large Folder Header Card */}
              <div style={{ 
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: `3px solid ${folderData.color || '#667eea'}`
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.5rem'
                }}>
                  <div style={{ 
                    fontSize: '4rem',
                    flexShrink: 0
                  }}>
                    {folderData.icon_emoji || '📁'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ 
                      fontSize: '2rem', 
                      fontWeight: 'bold', 
                      color: folderData.color || '#111827',
                      marginBottom: '0.5rem'
                    }}>
                      {folderData.folderName}
                    </h2>
                    {folderData.description && (
                      <p style={{ 
                        fontSize: '1rem', 
                        color: '#6b7280',
                        margin: 0,
                        marginBottom: '0.75rem'
                      }}>
                        {folderData.description}
                      </p>
                    )}
                    <div style={{
                      display: 'inline-block',
                      padding: '0.5rem 1.25rem',
                      background: folderData.color || '#667eea',
                      color: 'white',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {folderData.videos.length} {folderData.videos.length === 1 ? 'video' : 'videos'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Smaller Video Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                {folderData.videos.map(video => (
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
                    {/* Smaller Thumbnail */}
                    <div style={{ 
                      width: '100%', 
                      height: '140px', 
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
                        <span style={{ fontSize: '2rem' }}>🎬</span>
                      )}
                    </div>
                    
                    {/* Compact Video Info */}
                    <div style={{ padding: '0.75rem' }}>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 'bold', 
                        color: '#2563eb',
                        marginBottom: '0.5rem',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}>
                        {video.verification_code}
                      </div>

                      {/* Source Badge */}
                      <div style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        background: video.source === 'bodycam' ? '#fef3c7' : '#dbeafe',
                        color: video.source === 'bodycam' ? '#92400e' : '#1e40af',
                        borderRadius: '0.375rem',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem'
                      }}>
                        {video.source === 'bodycam' ? '📱 BodyCam' : '💻 Studio'}
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
                      
                      {video.tags && video.tags.length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>
                            Tags:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                            {video.tags.map((tag, idx) => (
                              <span 
                                key={idx}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  background: '#f3f4f6',
                                  color: '#374151',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
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
