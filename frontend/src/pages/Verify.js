import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #4f46e5 100%)';

function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState('code');
  const [verificationCode, setVerificationCode] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code) {
      setVerificationCode(code);
      setTimeout(() => verifyCodeFromURL(code), 500);
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
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const glassCard = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(14px)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem',
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    color: 'white',
    outline: 'none',
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.875rem',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.95))',
    color: 'white',
    border: '1px solid rgba(191, 219, 254, 0.5)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: bgGradient }}>
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        {/* Header */}
        <section style={{ ...glassCard, textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            Verify Video Authenticity
          </h1>
          <p style={{ color: 'rgba(226, 232, 240, 0.9)', fontSize: '1rem' }}>
            Check if a video has been tampered with using Rendr verification
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid rgba(148, 163, 184, 0.5)',
              borderRadius: '0.5rem',
              color: 'rgba(226, 232, 240, 0.9)',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            ← Back to Dashboard
          </button>
        </section>

        {/* Mode Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '0.5rem',
            padding: '0.25rem',
          }}>
            <button
              onClick={() => setMode('code')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                background: mode === 'code' ? 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.95))' : 'transparent',
                color: 'white',
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
                background: mode === 'deep' ? 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.95))' : 'transparent',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Deep Verify (Upload)
            </button>
          </div>
        </div>

        {/* Verification Form */}
        <div style={glassCard}>
          {mode === 'code' ? (
            <form onSubmit={handleCodeVerification}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: 'rgba(226, 232, 240, 0.9)', marginBottom: '0.5rem' }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="RND-ABC123"
                  style={inputStyle}
                  required
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'rgba(156, 163, 175, 0.9)' }}>
                  Enter the verification code that was provided with the video
                </p>
              </div>

              <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleDeepVerification}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: 'rgba(226, 232, 240, 0.9)', marginBottom: '0.5rem' }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="RND-ABC123"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: 'rgba(226, 232, 240, 0.9)', marginBottom: '0.5rem' }}>
                  Upload Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  style={inputStyle}
                  required
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'rgba(156, 163, 175, 0.9)' }}>
                  Upload the video file to compare with the original signature
                </p>
              </div>

              <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Analyzing...' : 'Verify Video'}
              </button>
            </form>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            ...glassCard,
            marginTop: '1.5rem',
            background: 'rgba(127, 29, 29, 0.4)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
          }}>
            <strong style={{ color: '#fca5a5' }}>Error:</strong>
            <span style={{ color: 'rgba(254, 226, 226, 0.9)', marginLeft: '0.5rem' }}>{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ ...glassCard, marginTop: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: result.result === 'authentic' ? 'rgba(34, 197, 94, 0.3)' : result.result === 'not_found' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(251, 191, 36, 0.3)',
                marginBottom: '1rem',
                border: `2px solid ${result.result === 'authentic' ? 'rgba(34, 197, 94, 0.6)' : result.result === 'not_found' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(251, 191, 36, 0.6)'}`,
              }}>
                <span style={{ fontSize: '2.5rem' }}>
                  {result.result === 'authentic' ? '✓' : result.result === 'not_found' ? '✗' : '⚠'}
                </span>
              </div>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: result.result === 'authentic' ? '#86efac' : result.result === 'not_found' ? '#fca5a5' : '#fbbf24',
                marginBottom: '0.5rem'
              }}>
                {result.result === 'authentic' ? 'Video Verified' : 
                 result.result === 'not_found' ? 'Not Found' : 
                 'Tampering Detected'}
              </h2>
            </div>

            {result.similarity_score !== undefined && result.similarity_score !== null && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#22d3ee' }}>
                  {typeof result.similarity_score === 'number' ? result.similarity_score.toFixed(1) : result.similarity_score}%
                </div>
                <div style={{ color: 'rgba(156, 163, 175, 0.9)', fontSize: '0.875rem' }}>
                  Similarity Score
                </div>
              </div>
            )}

            {result.analysis && (
              <div style={{
                padding: '1rem',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(148, 163, 184, 0.2)',
              }}>
                <strong style={{ color: 'rgba(226, 232, 240, 0.9)' }}>Analysis:</strong>
                <p style={{ marginTop: '0.5rem', color: 'rgba(156, 163, 175, 0.9)' }}>{result.analysis}</p>
              </div>
            )}

            {/* Blockchain Verification Badge */}
            {result.metadata?.blockchain_verified && (
              <div style={{
                background: 'rgba(120, 53, 15, 0.4)',
                border: '1px solid rgba(251, 191, 36, 0.5)',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⛓️</div>
                <div style={{ fontWeight: '700', color: '#fbbf24', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  Blockchain Verified
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(254, 243, 199, 0.9)', marginBottom: '1rem' }}>
                  Permanent proof stored on Polygon blockchain
                </div>
                {result.metadata.blockchain_tx && (
                  <div style={{ fontSize: '0.75rem', color: 'rgba(254, 243, 199, 0.8)', fontFamily: 'monospace' }}>
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
                      background: 'rgba(251, 191, 36, 0.3)',
                      color: '#fbbf24',
                      textDecoration: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      border: '1px solid rgba(251, 191, 36, 0.5)',
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
                background: 'rgba(30, 58, 138, 0.3)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👤</div>
                <div style={{ fontWeight: '700', color: '#60a5fa', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                  Created by {result.creator.display_name}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(191, 219, 254, 0.9)', marginBottom: '1rem' }}>
                  @{result.creator.username}
                </div>
                <a
                  href={result.creator.profile_url}
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.95))',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    border: '1px solid rgba(191, 219, 254, 0.5)',
                  }}
                >
                  View Creator's Portfolio →
                </a>
              </div>
            )}

            {/* Video Metadata */}
            {result.metadata && Object.keys(result.metadata).length > 0 && (
              <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.3)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '1rem', color: 'rgba(226, 232, 240, 0.9)' }}>Video Metadata</h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {result.metadata.source && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Source:</span>
                      <span style={{ fontWeight: '500', color: 'white' }}>
                        {result.metadata.source === 'bodycam' ? 'Rendr Bodycam' : 'Rendr Studio'}
                      </span>
                    </div>
                  )}
                  {result.metadata.captured_at && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Captured:</span>
                      <span style={{ fontWeight: '500', color: 'white' }}>
                        {new Date(result.metadata.captured_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {result.metadata.duration_seconds !== undefined && result.metadata.duration_seconds !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'rgba(156, 163, 175, 0.9)' }}>Duration:</span>
                      <span style={{ fontWeight: '500', color: 'white' }}>
                        {typeof result.metadata.duration_seconds === 'number' ? result.metadata.duration_seconds.toFixed(1) : result.metadata.duration_seconds}s
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
          ...glassCard,
          marginTop: '2rem',
          background: 'radial-gradient(circle at top left, rgba(59,130,246,0.2), rgba(15,23,42,0.9))',
          border: '1px solid rgba(59, 130, 246, 0.4)',
        }}>
          <h3 style={{ fontWeight: '600', color: '#60a5fa', marginBottom: '0.75rem' }}>
            How Verification Works
          </h3>
          <ul style={{ color: 'rgba(191, 219, 254, 0.9)', fontSize: '0.875rem', paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Quick Verify:</strong> Enter a verification code to check if a video exists in our database
            </li>
            <li>
              <strong>Deep Verify:</strong> Upload a video file to compare its fingerprint with the original and detect any tampering
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default Verify;
