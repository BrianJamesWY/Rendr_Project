import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
              {/* CheckStar Logo for authentic results - RENDR Blue/Indigo */}
              {result.result === 'authentic' ? (
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    {/* Star shape - RENDR Indigo/Blue */}
                    <path d="M50 10 L61 39 L92 39 L67 58 L78 87 L50 68 L22 87 L33 58 L8 39 L39 39 Z" 
                          fill="#6366f1" 
                          stroke="#4f46e5" 
                          strokeWidth="2"/>
                    {/* Checkmark */}
                    <path d="M35 50 L45 60 L65 40" 
                          fill="none" 
                          stroke="white" 
                          strokeWidth="6" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"/>
                  </svg>
                </div>
              ) : (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: result.result === 'not_found' ? '#fee2e2' : '#fef3c7',
                  marginBottom: '1rem'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>
                    {result.result === 'not_found' ? '✗' : '⚠'}
                  </span>
                </div>
              )}
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

            {/* Action Buttons - Take me to Video & Creator */}
            {(result.creator || (result.social_media_links && result.social_media_links.length > 0)) && (
              <div style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                {/* Take me to the Video */}
                {result.social_media_links && result.social_media_links.length > 0 && (
                  <>
                    <p style={{ 
                      color: '#111827', 
                      fontSize: '1rem', 
                      fontWeight: '700', 
                      marginBottom: '0.75rem',
                      textAlign: 'left'
                    }}>
                      Take me to the Video
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {result.social_media_links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem 1.25rem',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '0.9375rem',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{link.icon || '🎥'}</span>
                            <span>Watch on {link.platform || 'Platform'}</span>
                          </div>
                          <span style={{ fontSize: '1.25rem' }}>→</span>
                        </a>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Take me to the Creator */}
                {result.creator && (
                  <>
                    <p style={{ 
                      color: '#111827', 
                      fontSize: '1rem', 
                      fontWeight: '700', 
                      marginBottom: '0.75rem',
                      textAlign: 'left'
                    }}>
                      Take me to the Creator
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      {result.creator.profile_pic ? (
                        <img 
                          src={`${BACKEND_URL}${result.creator.profile_pic}`}
                          alt={result.creator.display_name}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #667eea'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {result.creator.display_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                          {result.creator.display_name}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                          @{result.creator.username}
                        </div>
                      </div>
                    </div>
                    
                    <a
                      href={result.creator.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.9375rem',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>👤</span>
                        <span>View {result.creator.display_name}'s Showcase</span>
                      </div>
                      <span style={{ fontSize: '1.25rem' }}>→</span>
                    </a>
                  </>
                )}
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
