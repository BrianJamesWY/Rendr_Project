import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function VideoProcessingStatus({ videoId, onComplete }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId) return;

    let pollInterval;

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${BACKEND_URL}/api/videos/${videoId}/status`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setStatus(response.data);
        setLoading(false);

        // Stop polling if complete
        if (response.data.stage === 'complete' || response.data.stage === 'error') {
          clearInterval(pollInterval);
          if (onComplete) {
            onComplete(response.data);
          }
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch status');
        setLoading(false);
        clearInterval(pollInterval);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 2 seconds
    pollInterval = setInterval(checkStatus, 2000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [videoId, onComplete]);

  if (loading && !status) {
    return (
      <div style={{
        padding: '1.5rem',
        background: '#f9fafb',
        borderRadius: '0.75rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Checking processing status...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '1.5rem',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '0.75rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
        <div style={{ color: '#991b1b', fontSize: '0.875rem' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!status) return null;

  const progress = status.progress || 0;
  const isComplete = status.stage === 'complete';
  const hasError = status.stage === 'error';

  return (
    <div style={{
      padding: '1.5rem',
      background: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '0.75rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>
          {isComplete ? '✅ Processing Complete' : 
           hasError ? '❌ Processing Error' : 
           '⚙️ Processing Video...'}
        </h3>
        <span style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: isComplete ? '#10b981' : '#667eea'
        }}>
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '12px',
        background: '#e5e7eb',
        borderRadius: '6px',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: isComplete ? 'linear-gradient(90deg, #10b981, #059669)' :
                      hasError ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
                      'linear-gradient(90deg, #667eea, #764ba2)',
          transition: 'width 0.5s ease'
        }} />
      </div>

      {/* Status Message */}
      <div style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        marginBottom: '1rem'
      }}>
        {status.message || 'Processing...'}
      </div>

      {/* Verification Layers Checklist */}
      {status.verification_layers && status.verification_layers.length > 0 && (
        <div style={{
          background: '#f9fafb',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginTop: '1rem'
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Verification Layers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {status.verification_layers.map((layer, index) => (
              layer && (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8125rem',
                  color: '#374151'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: isComplete ? '#10b981' : '#667eea'
                  }}>
                    {isComplete ? '✓' : '○'}
                  </span>
                  {layer}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* ETA */}
      {status.eta && !isComplete && !hasError && (
        <div style={{
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: '#9ca3af',
          textAlign: 'center'
        }}>
          Estimated time: {status.eta}
        </div>
      )}
    </div>
  );
}

export default VideoProcessingStatus;
