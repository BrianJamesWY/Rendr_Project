import React, { useRef, useEffect, useState } from 'react';

const BACKEND_URL = 'https://rendr-verify-1.preview.emergentagent.com';

function VideoPlayer({ videoId, thumbnail, title, onClose, isAuthenticated = false }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const streamUrl = isAuthenticated 
    ? `${BACKEND_URL}/api/videos/${videoId}/stream`
    : `${BACKEND_URL}/api/videos/watch/${videoId}`;

  useEffect(() => {
    const video = videoRef.current;
    
    const handleLoadedMetadata = () => {
      setLoading(false);
    };

    const handleError = (e) => {
      console.error('Video error:', e);
      setError('Failed to load video');
      setLoading(false);
    };

    if (video) {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>✕</button>
        
        {loading && (
          <div style={styles.loading}>Loading video...</div>
        )}
        
        {error && (
          <div style={styles.error}>{error}</div>
        )}
        
        <video
          ref={videoRef}
          controls
          autoPlay
          style={styles.video}
          poster={thumbnail}
        >
          <source src={streamUrl} type="video/mp4" />
          Your browser doesn't support video playback.
        </video>
        
        {title && (
          <div style={styles.title}>{title}</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    position: 'relative',
    width: '90%',
    maxWidth: '1200px',
    backgroundColor: '#1f2937',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    maxHeight: '80vh',
    display: 'block',
  },
  title: {
    padding: '15px',
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    fontSize: '18px',
  },
  error: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#ef4444',
    fontSize: '18px',
  },
};

export default VideoPlayer;
