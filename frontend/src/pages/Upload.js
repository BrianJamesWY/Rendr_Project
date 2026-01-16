import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Glassmorphic styles
const bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #4f46e5 100%)';

function Upload() {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState(null);
  const [source, setSource] = useState('studio');
  const [folderId, setFolderId] = useState('');
  const [folders, setFolders] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rendr_token'));

  useEffect(() => {
    if (token) {
      loadFolders();
    }
  }, [token]);

  const loadFolders = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/folders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFolders(response.data);
      const defaultFolder = response.data.find(f => f.folder_name === 'Default');
      if (defaultFolder) {
        setFolderId(defaultFolder.folder_id);
      }
    } catch (err) {
      console.error('Failed to load folders', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!token) {
      setError('Please log in first');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('video_file', videoFile);
    formData.append('source', source);
    if (folderId) {
      formData.append('folder_id', folderId);
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/videos/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        }
      );

      if (response.data.duplicate_detected) {
        setResult({ ...response.data, isDuplicate: true });
      } else {
        setResult(response.data);
      }
      setVideoFile(null);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleQuickLogin = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        username: 'test',
        password: 'Test123!'
      });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('rendr_token', newToken);
      setError(null);
    } catch (err) {
      setError('Login failed. Please register first.');
    }
  };

  // Glassmorphic card style
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
    padding: '1rem',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.95))',
    color: 'white',
    border: '1px solid rgba(191, 219, 254, 0.5)',
    borderRadius: '0.75rem',
    fontSize: '1.125rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: bgGradient }}>
      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        {/* Header */}
        <section style={{ ...glassCard, marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            Upload Video
          </h1>
          <p style={{ color: 'rgba(226, 232, 240, 0.9)', fontSize: '1rem' }}>
            Upload your video to get verified with blockchain proof
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

        {/* Login prompt if not logged in */}
        {!token && (
          <div style={glassCard}>
            <p style={{ color: 'rgba(226, 232, 240, 0.8)', marginBottom: '1rem' }}>
              You need to log in to upload videos.
            </p>
            <button onClick={handleQuickLogin} style={buttonStyle}>
              Quick Login (Test Account)
            </button>
          </div>
        )}

        {/* Upload form */}
        {token && !result && (
          <form onSubmit={handleUpload} style={glassCard}>
            
            {/* Video file input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: 'rgba(226, 232, 240, 0.9)', marginBottom: '0.5rem' }}>
                Select Video File
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={inputStyle}
                disabled={uploading}
              />
              {videoFile && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'rgba(156, 163, 175, 0.9)' }}>
                  Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Folder selection */}
            {folders.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: 'rgba(226, 232, 240, 0.9)', marginBottom: '0.5rem' }}>
                  Save to Folder
                </label>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  disabled={uploading}
                >
                  {folders.map(folder => (
                    <option key={folder.folder_id} value={folder.folder_id} style={{ background: '#0f172a' }}>
                      {folder.folder_name} ({folder.video_count} videos)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Upload button */}
            <button
              type="submit"
              style={{
                ...buttonStyle,
                opacity: uploading || !videoFile ? 0.6 : 1,
                cursor: uploading || !videoFile ? 'not-allowed' : 'pointer',
              }}
              disabled={uploading || !videoFile}
            >
              {uploading ? `Uploading... ${progress}%` : 'Upload & Verify'}
            </button>

            {/* Progress bar */}
            {uploading && (
              <div style={{ width: '100%', height: '8px', background: 'rgba(148, 163, 184, 0.3)', borderRadius: '4px', overflow: 'hidden', marginTop: '1rem' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', width: `${progress}%`, transition: 'width 0.3s' }} />
              </div>
            )}
          </form>
        )}

        {/* Error message */}
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

        {/* Success result */}
        {result && !result.isDuplicate && (
          <div style={{
            ...glassCard,
            background: 'rgba(6, 78, 59, 0.4)',
            border: '1px solid rgba(34, 197, 94, 0.5)',
            textAlign: 'center',
          }}>
            <h2 style={{ color: '#86efac', fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              ✓ Video Verified!
            </h2>
            
            <p style={{ color: 'rgba(187, 247, 208, 0.9)', marginBottom: '0.5rem' }}>Your verification code:</p>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#22d3ee',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '0.5rem',
              margin: '1rem 0',
              letterSpacing: '0.1em',
              fontFamily: 'monospace',
            }}>
              {result.verification_code}
            </div>
            
            <p style={{ color: 'rgba(187, 247, 208, 0.8)', fontSize: '0.875rem', marginTop: '1rem' }}>
              Save this code! Anyone can use it to verify your video.
            </p>

            {result.blockchain_tx && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(251, 191, 36, 0.2)',
                  color: '#fbbf24',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                }}>
                  ⛓️ Blockchain Verified
                </div>
                <p style={{ color: 'rgba(187, 247, 208, 0.8)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  Transaction: {result.blockchain_tx.substring(0, 10)}...{result.blockchain_tx.substring(result.blockchain_tx.length - 8)}
                </p>
                {result.blockchain_explorer && (
                  <a 
                    href={result.blockchain_explorer} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#22d3ee', fontSize: '0.875rem' }}
                  >
                    View on Polygonscan →
                  </a>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setResult(null);
                setProgress(0);
              }}
              style={{ ...buttonStyle, marginTop: '1.5rem', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.95))' }}
            >
              Upload Another Video
            </button>
          </div>
        )}

        {/* Duplicate Detection Warning */}
        {result && result.isDuplicate && (
          <div style={{
            ...glassCard,
            background: result.is_owner ? 'rgba(120, 53, 15, 0.4)' : 'rgba(127, 29, 29, 0.4)',
            border: `1px solid ${result.is_owner ? 'rgba(251, 191, 36, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {result.is_owner ? '⚠️' : '🚨'}
            </div>
            
            <h2 style={{
              color: result.is_owner ? '#fbbf24' : '#fca5a5',
              fontSize: '1.75rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              {result.is_owner ? 'Duplicate Upload' : 'Video Already Verified'}
            </h2>

            {result.is_owner ? (
              <>
                <p style={{ color: 'rgba(254, 243, 199, 0.9)', marginBottom: '1rem' }}>
                  You already uploaded this video!
                </p>
                <p style={{ color: 'rgba(254, 243, 199, 0.8)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Original upload: {new Date(result.original_upload_date).toLocaleString()}
                </p>
              </>
            ) : (
              <>
                <p style={{ color: 'rgba(254, 226, 226, 0.9)', marginBottom: '1rem' }}>
                  This video has already been verified by <strong>{result.original_owner}</strong>
                </p>
                <p style={{ color: 'rgba(254, 226, 226, 0.8)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Original upload: {new Date(result.original_upload_date).toLocaleString()}
                </p>
              </>
            )}

            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#22d3ee',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '0.5rem',
              margin: '1rem 0',
              letterSpacing: '0.1em',
              fontFamily: 'monospace',
            }}>
              {result.verification_code}
            </div>

            <button
              onClick={() => {
                setResult(null);
                setProgress(0);
              }}
              style={buttonStyle}
            >
              {result.is_owner ? 'Upload Different Video' : 'Go Back'}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

export default Upload;
