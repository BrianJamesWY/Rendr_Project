import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// ============================================
// STYLES - Easy to change colors/fonts/spacing
// ============================================
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: '#f9fafb',
    padding: '3rem 1rem'
  },
  container: {
    maxWidth: '700px',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '1.125rem'
  },
  card: {
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    marginBottom: '1.5rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
    fontSize: '0.9375rem'
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'border-color 0.2s'
  },
  select: {
    width: '100%',
    padding: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    background: 'white',
    cursor: 'pointer'
  },
  button: {
    width: '100%',
    padding: '1rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1.125rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  buttonDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '1rem'
  },
  progressFill: {
    height: '100%',
    background: '#2563eb',
    transition: 'width 0.3s'
  },
  successCard: {
    background: '#d1fae5',
    border: '2px solid #10b981',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center'
  },
  successTitle: {
    color: '#065f46',
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
  },
  successText: {
    color: '#047857',
    fontSize: '1rem',
    marginBottom: '0.5rem'
  },
  codeDisplay: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2563eb',
    padding: '1rem',
    background: 'white',
    borderRadius: '0.5rem',
    margin: '1rem 0',
    letterSpacing: '0.1em'
  },
  blockchainBadge: {
    display: 'inline-block',
    background: '#fef3c7',
    color: '#92400e',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginTop: '1rem'
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  errorCard: {
    background: '#fef2f2',
    border: '2px solid #fca5a5',
    borderRadius: '1rem',
    padding: '1rem',
    color: '#991b1b',
    marginTop: '1rem'
  }
};

// ============================================
// COMPONENT - Upload logic and UI
// ============================================
function Upload() {
  // State management
  const [videoFile, setVideoFile] = useState(null);
  const [source, setSource] = useState('studio');
  const [folderId, setFolderId] = useState('');
  const [folders, setFolders] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rendr_token'));

  // Load folders when token is available
  React.useEffect(() => {
    if (token) {
      loadFolders();
    }
  }, [token]);

  const loadFolders = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/folders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFolders(response.data);
      // Set default folder as default selection
      const defaultFolder = response.data.find(f => f.folder_name === 'Default');
      if (defaultFolder) {
        setFolderId(defaultFolder.folder_id);
      }
    } catch (err) {
      console.error('Failed to load folders', err);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setError(null);
      setResult(null);
    }
  };

  // Handle upload
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

      // Check if duplicate detected
      if (response.data.duplicate_detected) {
        setResult({
          ...response.data,
          isDuplicate: true
        });
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

  // Quick login for testing (remove in production)
  const handleQuickLogin = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: 'test@rendr.com',
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

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Upload Video</h1>
          <p style={styles.subtitle}>Upload your video to get verified with blockchain proof</p>
        </div>

        {/* Login prompt if not logged in */}
        {!token && (
          <div style={styles.card}>
            <p style={{color: '#6b7280', marginBottom: '1rem'}}>
              You need to log in to upload videos.
            </p>
            <button 
              onClick={handleQuickLogin}
              style={styles.button}
            >
              Quick Login (Test Account)
            </button>
          </div>
        )}

        {/* Upload form */}
        {token && !result && (
          <form onSubmit={handleUpload} style={styles.card}>
            
            {/* Video file input */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={styles.input}
                disabled={uploading}
              />
              {videoFile && (
                <p style={{marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280'}}>
                  Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Source selection */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Video Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={styles.select}
                disabled={uploading}
              >
                <option value="bodycam">Rendr Bodycam</option>
                <option value="studio">Rendr Studio</option>
              </select>
            </div>

            {/* Upload button */}
            <button
              type="submit"
              style={{...styles.button, ...(uploading ? styles.buttonDisabled : {})}}
              disabled={uploading || !videoFile}
            >
              {uploading ? `Uploading... ${progress}%` : 'Upload & Verify'}
            </button>

            {/* Progress bar */}
            {uploading && (
              <div style={styles.progressBar}>
                <div style={{...styles.progressFill, width: `${progress}%`}} />
              </div>
            )}
          </form>
        )}

        {/* Error message */}
        {error && (
          <div style={styles.errorCard}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Success result */}
        {result && !result.isDuplicate && (
          <div style={styles.successCard}>
            <h2 style={styles.successTitle}>✓ Video Verified!</h2>
            
            <p style={styles.successText}>Your verification code:</p>
            <div style={styles.codeDisplay}>{result.verification_code}</div>
            
            <p style={{...styles.successText, fontSize: '0.875rem', marginTop: '1rem'}}>
              Save this code! Anyone can use it to verify your video.
            </p>

            {/* Blockchain info */}
            {result.blockchain_tx && (
              <div style={{marginTop: '1.5rem'}}>
                <div style={styles.blockchainBadge}>
                  ⛓️ Blockchain Verified
                </div>
                <p style={{...styles.successText, marginTop: '0.5rem', fontSize: '0.875rem'}}>
                  Transaction: {result.blockchain_tx.substring(0, 10)}...{result.blockchain_tx.substring(result.blockchain_tx.length - 8)}
                </p>
                {result.blockchain_explorer && (
                  <a 
                    href={result.blockchain_explorer} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    View on Polygonscan →
                  </a>
                )}
              </div>
            )}

            {/* Upload another button */}
            <button
              onClick={() => {
                setResult(null);
                setProgress(0);
              }}
              style={{...styles.button, marginTop: '1.5rem', background: '#10b981'}}
            >
              Upload Another Video
            </button>
          </div>
        )}

        {/* Duplicate Detection Warning */}
        {result && result.isDuplicate && (
          <div style={{
            background: result.is_owner ? '#fef3c7' : '#fef2f2',
            border: `2px solid ${result.is_owner ? '#f59e0b' : '#ef4444'}`,
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {result.is_owner ? '⚠️' : '🚨'}
            </div>
            
            <h2 style={{
              color: result.is_owner ? '#92400e' : '#991b1b',
              fontSize: '1.75rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              {result.is_owner ? 'Duplicate Upload' : 'Video Already Verified'}
            </h2>

            {result.is_owner ? (
              <>
                <p style={{ color: '#78350f', marginBottom: '1rem' }}>
                  You already uploaded this video!
                </p>
                <p style={{ color: '#78350f', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Original upload: {new Date(result.original_upload_date).toLocaleString()}
                </p>
              </>
            ) : (
              <>
                <p style={{ color: '#7f1d1d', marginBottom: '1rem' }}>
                  This video has already been verified by <strong>{result.original_owner}</strong>
                </p>
                <p style={{ color: '#7f1d1d', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Original upload: {new Date(result.original_upload_date).toLocaleString()}
                </p>
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginTop: '1rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{ color: '#991b1b', fontSize: '0.875rem', fontWeight: '600' }}>
                    🔒 {result.security_alert}
                  </p>
                </div>
              </>
            )}

            <div style={styles.codeDisplay}>{result.verification_code}</div>
            
            <p style={{
              color: result.is_owner ? '#78350f' : '#7f1d1d',
              fontSize: '0.875rem',
              marginTop: '1rem'
            }}>
              {result.is_owner 
                ? 'Use your original verification code above'
                : 'This is the original verification code for this video'}
            </p>

            {result.blockchain_tx && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '0.5rem'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}>
                  Blockchain proof exists from original upload
                </p>
                <p style={{ fontSize: '0.75rem', color: '#92400e', fontFamily: 'monospace' }}>
                  {result.blockchain_tx.substring(0, 10)}...{result.blockchain_tx.substring(result.blockchain_tx.length - 8)}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setResult(null);
                setProgress(0);
              }}
              style={{
                ...styles.button,
                marginTop: '1.5rem',
                background: result.is_owner ? '#10b981' : '#6b7280'
              }}
            >
              {result.is_owner ? 'Upload Different Video' : 'Go Back'}
            </button>
          </div>
        )}

        {/* Info box */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#eff6ff',
          borderRadius: '0.75rem',
          border: '1px solid #bfdbfe'
        }}>
          <h3 style={{color: '#1e40af', marginBottom: '0.75rem', fontWeight: '600'}}>
            How It Works
          </h3>
          <ul style={{color: '#1e3a8a', fontSize: '0.875rem', paddingLeft: '1.25rem', lineHeight: '1.6'}}>
            <li>Your video is analyzed and a unique fingerprint is created</li>
            <li>The fingerprint is stored on the Polygon blockchain (permanent proof)</li>
            <li>You receive a verification code that anyone can check</li>
            <li>Videos are not stored on our servers (only the fingerprint)</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default Upload;
