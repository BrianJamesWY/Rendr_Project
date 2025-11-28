import React from 'react';
import Logo from './Logo';

function VideoDetailsModal({ video, onClose }) {
  const socialLinks = video.social_links || [];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <Logo size="small" />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>Video Details</h3>
        </div>

        {/* Thumbnail */}
        {video.thumbnail_url && (
          <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
            <img 
              src={video.thumbnail_url} 
              alt={video.title || 'Video'}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        )}

        {/* Title */}
        {video.title && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{video.title}</h4>
          </div>
        )}

        {/* Verification Code */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '6px' }}>
            <span style={{ fontFamily: '"Courier New", monospace', fontSize: '14px', fontWeight: '600', color: '#667eea' }}>{video.verification_code}</span>
          </div>
        </div>

        {/* Description */}
        {video.description && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>{video.description}</p>
          </div>
        )}

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase' }}>Watch This Video On:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {socialLinks.map((link, index) => {
                const platformIcons = {
                  youtube: '▶️',
                  tiktok: '🎵',
                  instagram: '📷',
                  twitter: '🐦',
                  facebook: '👥'
                };
                const platformNames = {
                  youtube: 'YouTube',
                  tiktok: 'TikTok',
                  instagram: 'Instagram',
                  twitter: 'Twitter',
                  facebook: 'Facebook'
                };
                
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', borderRadius: '8px', textDecoration: 'none', transition: 'transform 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontSize: '24px' }}>{platformIcons[link.platform] || '🔗'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>Take me to {platformNames[link.platform] || link.platform}</div>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>Watch this video</div>
                    </div>
                    <span style={{ fontSize: '20px' }}>→</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {socialLinks.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>No social media links available for this video</p>
          </div>
        )}

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 24px', background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default VideoDetailsModal;
