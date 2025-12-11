import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import VideoUploader from '../components/VideoUploader';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Upload Page - Professional Video Upload Experience
 * 
 * Features:
 * - Drag & drop upload
 * - Progress tracking
 * - Immediate watermarked video return
 * - "Notify me when verified" option
 * - Clean, minimal design
 */
function Upload() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleQuickLogin = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        username: 'BrianJames',
        password: 'Brian123!'
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error('Login failed:', err);
      // Try alternate credentials
      try {
        const response2 = await axios.post(`${BACKEND_URL}/api/auth/login`, {
          username: 'testcreator',
          password: 'test123'
        });
        if (response2.data.token) {
          localStorage.setItem('token', response2.data.token);
          setIsLoggedIn(true);
        }
      } catch (err2) {
        console.error('Fallback login also failed:', err2);
      }
    }
  };

  const handleUploadComplete = (result) => {
    console.log('Upload complete:', result);
    // Could navigate to dashboard or show success
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Upload Video
          </h1>
          <p className="text-gray-600 text-lg">
            Get your video verified with our multi-layer authentication system
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {isLoggedIn ? (
            <VideoUploader 
              onUploadComplete={handleUploadComplete}
            />
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6">
                You need to log in to upload videos.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={handleQuickLogin}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
                >
                  Quick Login (Test Account)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Watermark Protection</h3>
            <p className="text-sm text-gray-600">
              Your verification code is embedded directly into the video as a permanent watermark.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Multi-Layer Verification</h3>
            <p className="text-sm text-gray-600">
              8 verification layers including SHA-256, perceptual hashes, and Merkle tree proof.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Download</h3>
            <p className="text-sm text-gray-600">
              Get your watermarked video immediately. Full verification happens in the background.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Upload;
