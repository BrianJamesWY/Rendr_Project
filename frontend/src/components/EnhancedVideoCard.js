import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://rendr-revamp.preview.emergentagent.com';

/**
 * Enhanced Video Card Component
 * Features:
 * - Expiration countdown badge
 * - Download button
 * - Tier indicator
 * - Watermark verification badge
 */
const EnhancedVideoCard = ({ video, onEdit, onMove, user }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);

  useEffect(() => {
    if (video.storage?.expires_at) {
      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [video.storage?.expires_at]);

  const updateTimeRemaining = () => {
    if (!video.storage?.expires_at) return;

    const expiresAt = new Date(video.storage.expires_at);
    const now = new Date();
    const diff = expiresAt - now;

    if (diff <= 0) {
      setTimeRemaining('Expired');
      setIsExpiringSoon(true);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Mark as expiring soon if less than 2 hours
    setIsExpiringSoon(hours < 2);

    if (hours < 1) {
      setTimeRemaining(`${minutes}m`);
    } else if (hours < 24) {
      setTimeRemaining(`${hours}h`);
    } else {
      const days = Math.floor(hours / 24);
      setTimeRemaining(`${days}d`);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadProgress(0);
      const token = localStorage.getItem('rendr_token');
      
      const response = await axios.get(
        `${BACKEND_URL}/api/videos/${video.video_id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setDownloadProgress(percentCompleted);
          }
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${video.verification_code}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setDownloadProgress(null);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download video. Please try again.');
      setDownloadProgress(null);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'pro': return '#10b981';
      case 'enterprise': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'pro': return 'Pro';
      case 'enterprise': return 'Enterprise';
      default: return 'Free';
    }
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        position: 'relative'
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
      <div
        onClick={onEdit}
        style={{
          width: '100%',
          height: '180px',
          background: '#e5e7eb',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
      >
        {video.thumbnail_url ? (
          <img
            src={`${BACKEND_URL}${video.thumbnail_url}`}
            alt={video.verification_code}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem'
            }}
          >
            🎬
          </div>
        )}

        {/* Tier Badge */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: getTierColor(video.storage?.tier),
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.625rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {getTierLabel(video.storage?.tier)}
        </div>

        {/* Expiration Badge */}
        {timeRemaining && video.storage?.expires_at && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: isExpiringSoon
                ? 'rgba(239, 68, 68, 0.95)'
                : 'rgba(59, 130, 246, 0.95)',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {isExpiringSoon ? '⚠️' : '⏰'} {timeRemaining}
          </div>
        )}

        {/* Unlimited Storage Badge */}
        {video.storage?.tier === 'enterprise' && !video.storage?.expires_at && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(245, 158, 11, 0.95)',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            ♾️ Unlimited
          </div>
        )}

        {/* Blockchain Badge */}
        {video.has_blockchain && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'rgba(254, 243, 199, 0.95)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#92400e',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            ⛓️ Verified
          </div>
        )}
      </div>

      {/* Video Info */}
      <div style={{ padding: '1rem' }}>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#667eea',
            fontFamily: 'monospace',
            marginBottom: '0.5rem',
            letterSpacing: '0.05em'
          }}
        >
          {video.verification_code}
        </div>

        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>
          {new Date(video.captured_at).toLocaleDateString()}
        </div>

        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
          {video.source === 'bodycam' ? '📱 Bodycam' : '💻 Studio'}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
          {/* Primary Actions Row */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleDownload}
              disabled={downloadProgress !== null}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: downloadProgress !== null ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: downloadProgress !== null ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (downloadProgress === null) {
                  e.currentTarget.style.background = '#059669';
                }
              }}
              onMouseLeave={(e) => {
                if (downloadProgress === null) {
                  e.currentTarget.style.background = '#10b981';
                }
              }}
            >
              {downloadProgress !== null ? `${downloadProgress}%` : '⬇️ Download'}
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
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#5568d3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#667eea';
              }}
            >
              📋 Copy
            </button>
          </div>

          {/* Secondary Actions Row */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onMove}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
            >
              📁 Move
            </button>

            <button
              onClick={onEdit}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoCard;
