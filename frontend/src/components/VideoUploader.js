import React, { useState, useCallback, useRef } from 'react';
import { Upload, CheckCircle, Clock, Mail, Bell, X, Film, Shield } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Professional Video Upload Component
 * 
 * Features:
 * - Drag & drop upload with progress
 * - Immediate watermarked video return
 * - "Notify me when verified" option
 * - Clean, minimal design
 * - No waiting for verification - async in background
 */
function VideoUploader({ onUploadComplete, onClose }) {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, processing, complete, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    // Accept any video file - no type or size restrictions
    // The backend will handle any video format via FFmpeg
    
    setError(null);
    setUploadState('uploading');
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('video_file', file);
      formData.append('notify_on_complete', notifyEmail.toString());

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
          
          // Switch to processing state when upload is complete
          if (progress === 100) {
            setUploadState('processing');
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          setUploadResult(result);
          
          // Check if this is a duplicate video
          if (result.duplicate_detected || result.status === 'duplicate') {
            setUploadState('duplicate');
          } else {
            setUploadState('complete');
          }
          
          if (onUploadComplete) {
            onUploadComplete(result);
          }
        } else {
          const error = JSON.parse(xhr.responseText);
          setError(error.detail || 'Upload failed');
          setUploadState('error');
        }
      });

      xhr.addEventListener('error', () => {
        setError('Network error. Please try again.');
        setUploadState('error');
      });

      xhr.open('POST', `${BACKEND_URL}/api/videos/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (err) {
      setError(err.message || 'Upload failed');
      setUploadState('error');
    }
  };

  const resetUpload = () => {
    setUploadState('idle');
    setUploadProgress(0);
    setUploadResult(null);
    setError(null);
  };

  // Idle State - Drag & Drop Zone
  if (uploadState === 'idle') {
    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload Video</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center
            transition-all duration-300 ease-out
            ${dragActive 
              ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className={`
            w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
            transition-all duration-300
            ${dragActive ? 'bg-indigo-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}
          `}>
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <p className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? 'Drop your video here' : 'Drag & drop your video'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or
          </p>
          
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Choose Video File
          </button>
          
          <p className="text-xs text-gray-400 mt-4">
            All video formats supported • No size limit
          </p>
        </div>

        {/* Notification Preference */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Email me when verification is complete
              </span>
            </div>
          </label>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Uploading State
  if (uploadState === 'uploading') {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Upload className="w-10 h-10 text-white animate-bounce" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Uploading your video...
        </h3>
        <p className="text-gray-500 mb-6">
          Please don't close this window
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Uploading</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Processing State
  if (uploadState === 'processing') {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Processing your video...
        </h3>
        <p className="text-gray-500 mb-6">
          Applying watermark and generating verification code
        </p>

        {/* Processing Steps */}
        <div className="max-w-sm mx-auto space-y-3 text-left">
          {['Applying watermark', 'Generating verification code', 'Creating thumbnail'].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              </div>
              <span className="text-sm text-gray-600">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Complete State
  if (uploadState === 'complete' && uploadResult) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Video Ready!
          </h3>
          <p className="text-gray-500">
            Your watermarked video is ready to download
          </p>
        </div>

        {/* Verification Code Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-2 text-indigo-200 text-sm mb-2">
            <Shield className="w-4 h-4" />
            <span>Verification Code</span>
          </div>
          <p className="text-3xl font-mono font-bold tracking-wider">
            {uploadResult.verification_code}
          </p>
        </div>

        {/* Download Button */}
        <a
          href={`${BACKEND_URL}${uploadResult.download_url}`}
          download
          className="block w-full py-4 px-6 bg-gray-900 hover:bg-gray-800 text-white text-center font-semibold rounded-xl transition-colors mb-4"
        >
          <Film className="w-5 h-5 inline-block mr-2" />
          Download Watermarked Video
        </a>

        {/* Background Verification Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Full verification in progress
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Your video will appear in your dashboard once fully verified.
                {notifyEmail && " We'll email you when it's ready."}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={resetUpload}
            className="flex-1 py-3 px-6 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Upload Another
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  // Error State
  if (uploadState === 'error') {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <X className="w-12 h-12 text-red-500" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Upload Failed
        </h3>
        <p className="text-gray-500 mb-6">
          {error || 'Something went wrong. Please try again.'}
        </p>

        <button
          onClick={resetUpload}
          className="py-3 px-8 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
}

export default VideoUploader;
