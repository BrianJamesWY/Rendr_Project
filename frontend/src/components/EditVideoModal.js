import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DirectoryTree from './DirectoryTree';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function EditVideoModal({ video, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState([{ platform: '', url: '' }]);
  const [customPlatforms, setCustomPlatforms] = useState([]);
  const [newPlatformName, setNewPlatformName] = useState('');
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedTreeItem, setSelectedTreeItem] = useState(null);
  const [showOnShowcase, setShowOnShowcase] = useState(false);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const thumbnailInputRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (video) {
      setTitle(video.title || '');
      setDescription(video.description || '');
      setThumbnailUrl(video.thumbnail_url || '');
      setSocialLinks(video.social_links || [{ platform: '', url: '' }]);
      setShowOnShowcase(video.on_showcase || false);
      setSelectedFolderId(video.folder_id || '');
    }
    loadFolders();
  }, [video]);

  const loadFolders = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/folders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFolders(Array.isArray(response.data) ? response.data : response.data.folders || []);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `${BACKEND_URL}/api/videos/${video.video_id}/thumbnail`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setThumbnailUrl(response.data.thumbnail_url);
      setUploading(false);
    } catch (error) {
      console.error('Thumbnail upload failed:', error);
      alert('Failed to upload thumbnail');
      setUploading(false);
    }
  };

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: '', url: '' }]);
  };

  const handleRemoveSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleUpdateSocialLink = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const handleAddCustomPlatform = () => {
    if (!newPlatformName.trim()) return;
    
    setCustomPlatforms([...customPlatforms, { id: newPlatformName.toLowerCase().replace(/\s+/g, '-'), name: newPlatformName }]);
    setNewPlatformName('');
    setShowAddPlatform(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(video.verification_code);
    alert('Verification code copied to clipboard!');
  };

  const handleDeleteVideo = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${BACKEND_URL}/api/videos/${video.video_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setDeleting(false);
      setShowDeleteConfirm(false);
      onSave(); // Refresh the parent list
      onClose(); // Close the modal
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video: ' + (error.response?.data?.detail || error.message));
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    try {
      // Use folder from dropdown, or from tree selection as fallback
      const folderId = selectedFolderId || (selectedTreeItem?.type === 'folder' ? selectedTreeItem.id : video?.folder_id);
      
      const updateData = {
        title,
        description,
        thumbnail_url: thumbnailUrl,
        social_links: socialLinks.filter(l => l.url),
        folder_id: folderId || null,
        on_showcase: showOnShowcase,
        showcase_folder_id: showOnShowcase ? folderId : null
      };
      
      await axios.put(
        `${BACKEND_URL}/api/videos/${video.video_id}`,
        updateData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Failed to save video changes');
    }
  };

  const defaultPlatforms = [
    { id: 'youtube', name: 'YouTube', icon: '📺' },
    { id: 'facebook', name: 'Facebook', icon: '👍' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' }
  ];

  const allPlatforms = [...defaultPlatforms, ...customPlatforms];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        {/* Header with CheckStar Logo */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              ✓
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              Edit Video Details
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              padding: '0 8px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Verification Code */}
          <div style={{ marginBottom: '20px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Verification Code</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#667eea', fontFamily: 'monospace' }}>
                  {video?.verification_code || 'N/A'}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                style={{
                  padding: '8px 16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Copy Code
              </button>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Thumbnail */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Thumbnail
            </label>
            <input
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="Enter thumbnail URL"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '10px',
                boxSizing: 'border-box'
              }}
            />
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#667eea'; }}
              onDragLeave={(e) => { e.currentTarget.style.borderColor = '#ddd'; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#ddd';
                const file = e.dataTransfer.files[0];
                if (file) handleThumbnailUpload(file);
              }}
              style={{
                border: '2px dashed #ddd',
                borderRadius: '6px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#fafafa',
                transition: 'all 0.3s'
              }}
            >
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="Thumbnail preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px' }} />
              ) : (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {uploading ? 'Uploading...' : 'Click or drag & drop image here'}
                  </div>
                </div>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleThumbnailUpload(file);
                }}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Social Media Links
            </label>
            {socialLinks.map((link, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <select
                  value={link.platform}
                  onChange={(e) => {
                    if (e.target.value === '__add_custom__') {
                      setShowAddPlatform(true);
                    } else {
                      handleUpdateSocialLink(index, 'platform', e.target.value);
                    }
                  }}
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '13px',
                    minWidth: '150px'
                  }}
                >
                  <option value="">Select Platform</option>
                  {allPlatforms.map(p => (
                    <option key={p.id} value={p.id}>{p.icon ? `${p.icon} ` : ''}{p.name}</option>
                  ))}
                  <option value="__add_custom__" style={{ color: '#667eea', fontWeight: '500' }}>+ Add Site</option>
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleUpdateSocialLink(index, 'url', e.target.value)}
                  placeholder="https://..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                />
                <button
                  onClick={() => handleRemoveSocialLink(index)}
                  style={{
                    padding: '8px 12px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={handleAddSocialLink}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: '1px dashed #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                width: '100%',
                color: '#666'
              }}
            >
              + Add Link
            </button>
          </div>

          {/* Add Custom Platform Modal */}
          {showAddPlatform && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '400px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Add Custom Platform</h3>
                <input
                  type="text"
                  value={newPlatformName}
                  onChange={(e) => setNewPlatformName(e.target.value)}
                  placeholder="Platform name (e.g., Vimeo, Rumble)"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '16px',
                    boxSizing: 'border-box'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomPlatform()}
                />
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowAddPlatform(false)}
                    style={{
                      padding: '8px 16px',
                      background: '#f0f0f0',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomPlatform}
                    style={{
                      padding: '8px 16px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Folder Location - Dropdown Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Folder Location
            </label>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">No Folder (Unsorted)</option>
              {folders.map(folder => (
                <option key={folder.folder_id} value={folder.folder_id}>
                  📁 {folder.folder_name}
                </option>
              ))}
            </select>
            <div style={{ 
              marginTop: '8px', 
              fontSize: '12px', 
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>💡</span>
              <span>Select a folder to organize your video</span>
            </div>
          </div>

          {/* Show on Showcase Checkbox */}
          <div style={{ 
            marginBottom: '20px',
            padding: '16px',
            background: showOnShowcase ? 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)' : '#f9fafb',
            borderRadius: '10px',
            border: showOnShowcase ? '2px solid #667eea' : '1px solid #e5e7eb',
            transition: 'all 0.3s ease'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              <div style={{
                position: 'relative',
                width: '24px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={showOnShowcase}
                  onChange={(e) => setShowOnShowcase(e.target.checked)}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    zIndex: 1
                  }}
                />
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: showOnShowcase ? '2px solid #667eea' : '2px solid #d1d5db',
                  background: showOnShowcase ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {showOnShowcase && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path 
                        d="M2 7L5.5 10.5L12 4" 
                        stroke="white" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <span style={{ 
                  fontWeight: '600', 
                  fontSize: '15px',
                  color: showOnShowcase ? '#4f46e5' : '#374151'
                }}>
                  Show on Showcase
                </span>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '13px', 
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>
                  {showOnShowcase 
                    ? 'This video will appear on your public showcase in the selected folder'
                    : 'Enable to display this video on your public showcase page'
                  }
                </p>
              </div>
              {showOnShowcase && (
                <div style={{
                  marginLeft: 'auto',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Visible
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* Delete Button - Left Side */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '10px 20px',
              background: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🗑️ Delete Video
          </button>

          {/* Cancel and Save Buttons - Right Side */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#666'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: '#dc2626' }}>
                Delete Video?
              </h3>
              <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
                This will permanently delete <strong>"{video?.title || video?.verification_code}"</strong>. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  style={{
                    padding: '10px 24px',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: deleting ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVideo}
                  disabled={deleting}
                  style={{
                    padding: '10px 24px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: deleting ? 0.5 : 1
                  }}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditVideoModal;