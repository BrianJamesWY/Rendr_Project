import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';

const BACKEND_URL = 'https://videoproof-1.preview.emergentagent.com';

function Verify() {
  const location = useLocation();
  const [mode, setMode] = useState('code'); // 'code' or 'deep'
  const [verificationCode, setVerificationCode] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for code in URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code) {
      setVerificationCode(code);
      // Auto-verify if code is in URL
      setTimeout(() => {
        verifyCodeFromURL(code);
      }, 500);
    }
  }, [location]);

  const verifyCodeFromURL = async (code) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/verify/code`, {
        verification_code: code
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/verify/code`, {
        verification_code: verificationCode
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeepVerification = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('video_file', videoFile);
    formData.append('verification_code', verificationCode);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/verify/deep`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="verify" />
      
      <div style={{ padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            Verify Video Authenticity
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Check if a video has been tampered with using Rendr verification
          </p>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.25rem' }}>
            <button
              onClick={() => setMode('code')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                background: mode === 'code' ? '#2563eb' : 'transparent',
                color: mode === 'code' ? 'white' : '#374151',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Quick Verify (Code)
            </button>
            <button
              onClick={() => setMode('deep')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                background: mode === 'deep' ? '#2563eb' : 'transparent',
                color: mode === 'deep' ? 'white' : '#374151',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Deep Verify (Upload File)
            </button>
          </div>
        </div>

        {/* Verification Form */}
        <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
          {mode === 'code' ? (
            <form onSubmit={handleCodeVerification}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="RND-ABC123"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  required
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  Enter the verification code that was provided with the video
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: loading ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleDeepVerification}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="RND-ABC123"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Upload Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  required
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  Upload the video file to compare with the original signature
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: loading ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? 'Analyzing...' : 'Verify Video'}
              </button>
            </form>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '0.5rem',
            color: '#991b1b'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{
            marginTop: '1.5rem',
            padding: '2rem',
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: result.result === 'authentic' ? '#d1fae5' : result.result === 'not_found' ? '#fee2e2' : '#fef3c7',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '2.5rem' }}>
                  {result.result === 'authentic' ? '✓' : result.result === 'not_found' ? '✗' : '⚠'}
                </span>
              </div>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: result.result === 'authentic' ? '#065f46' : result.result === 'not_found' ? '#991b1b' : '#92400e',
                marginBottom: '0.5rem'
              }}>
                {result.result === 'authentic' ? 'Video Verified' : 
                 result.result === 'not_found' ? 'Not Found' : 
                 'Tampering Detected'}
              </h2>
            </div>

            {result.similarity_score !== undefined && result.similarity_score !== null && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {typeof result.similarity_score === 'number' ? result.similarity_score.toFixed(1) : result.similarity_score}%
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Similarity Score
                </div>
              </div>
            )}

            {result.analysis && (
              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <strong style={{ color: '#374151' }}>Analysis:</strong>
                <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>{result.analysis}</p>
              </div>
            )}

            {/* Blockchain Verification Badge */}
            {result.metadata?.blockchain_verified && (
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '2px solid #f59e0b',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⛓️</div>
                <div style={{ fontWeight: '700', color: '#92400e', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  Blockchain Verified
                </div>
                <div style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '1rem' }}>
                  Permanent proof stored on Polygon blockchain
                </div>
                {result.metadata.blockchain_tx && (
                  <div style={{ fontSize: '0.75rem', color: '#92400e', fontFamily: 'monospace' }}>
                    TX: {result.metadata.blockchain_tx.substring(0, 10)}...{result.metadata.blockchain_tx.substring(result.metadata.blockchain_tx.length - 8)}
                  </div>
                )}
                {result.metadata.blockchain_explorer && (
                  <a
                    href={result.metadata.blockchain_explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '0.75rem',
                      padding: '0.5rem 1rem',
                      background: '#f59e0b',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    View on Polygonscan →
                  </a>
                )}
              </div>
            )}

            {/* Creator Info */}
            {result.creator && (
              <div style={{
                background: '#eff6ff',
                border: '2px solid #bfdbfe',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👤</div>
                <div style={{ fontWeight: '700', color: '#1e40af', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  Created by {result.creator.display_name}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1e3a8a', marginBottom: '1rem' }}>
                  @{result.creator.username}
                </div>
                <a
                  href={result.creator.profile_url}
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: '#2563eb',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  View Creator's Portfolio →
                </a>
              </div>
            )}

            {/* Video Metadata */}
            {result.metadata && Object.keys(result.metadata).length > 0 && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Video Metadata</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {result.metadata.source && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Source:</span>
                      <span style={{ fontWeight: '500', color: '#111827' }}>
                        {result.metadata.source === 'bodycam' ? 'Rendr Bodycam' : 'Rendr Studio'}
                      </span>
                    </div>
                  )}
                  {result.metadata.captured_at && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Captured:</span>
                      <span style={{ fontWeight: '500', color: '#111827' }}>
                        {new Date(result.metadata.captured_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {result.metadata.duration_seconds !== undefined && result.metadata.duration_seconds !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6b7280' }}>Duration:</span>
                      <span style={{ fontWeight: '500', color: '#111827' }}>
                        {typeof result.metadata.duration_seconds === 'number' ? result.metadata.duration_seconds.toFixed(1) : result.metadata.duration_seconds}s
                      </span>
                    </div>
                  )}
                  {result.metadata.blockchain_verified === false && (
                    <div style={{
                      background: '#fef2f2',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      marginTop: '0.5rem'
                    }}>
                      <span style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                        ℹ️ This video was verified before blockchain integration
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: '#eff6ff',
          borderRadius: '0.75rem',
          border: '1px solid #bfdbfe'
        }}>
          <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem' }}>
            How Verification Works
          </h3>
          <ul style={{ color: '#1e3a8a', fontSize: '0.875rem', paddingLeft: '1.25rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Quick Verify:</strong> Enter a verification code to check if a video exists in our database
            </li>
            <li>
              <strong>Deep Verify:</strong> Upload a video file to compare its fingerprint with the original and detect any tampering
            </li>
          </ul>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Verify;
