import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Showcase() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShowcase();
  }, [username]);

  const loadShowcase = async () => {
    try {
      setLoading(true);
      
      // Get profile
      const profileRes = await axios.get(`${BACKEND_URL}/api/@/${username}`);
      setProfile(profileRes.data);
      
      // Get videos
      const videosRes = await axios.get(`${BACKEND_URL}/api/@/${username}/videos`);
      setVideos(videosRes.data);
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Creator not found');
      setLoading(false);
    }
  };

  // Group videos by folder
  const groupedVideos = {};
  videos.forEach(video => {
    const folderName = video.folder_name || 'Uncategorized';
    if (!groupedVideos[folderName]) {
      groupedVideos[folderName] = [];
    }
    groupedVideos[folderName].push(video);
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

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
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

      {/* Videos Grid Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        {Object.keys(groupedVideos).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
            <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
              No verified videos yet
            </p>
          </div>
        ) : (
          Object.keys(groupedVideos).map(folderName => (
            <div key={folderName} style={{ marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#111827', 
                marginBottom: '1.5rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid #e5e7eb'
              }}>
                {folderName}
              </h2>
              
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
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
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
                        fontSize: '1.125rem', 
                        fontWeight: 'bold', 
                        color: '#2563eb',
                        marginBottom: '0.5rem',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}>
                        {video.verification_code}
                      </div>
                      
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {new Date(video.captured_at).toLocaleDateString()} at {new Date(video.captured_at).toLocaleTimeString()}
                      </div>
                      
                      <Link 
                        to={`/verify?code=${video.verification_code}`}
                        style={{
                          display: 'inline-block',
                          marginTop: '0.75rem',
                          padding: '0.5rem 1rem',
                          background: '#2563eb',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
                      >
                        Verify Video
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Showcase;
