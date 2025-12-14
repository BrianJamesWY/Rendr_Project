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
  const thumbnailInputRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (video) {
      setTitle(video.title || '');
      setDescription(video.description || '');
      setThumbnailUrl(video.thumbnail_url || '');
      setSocialLinks(video.social_links || [{ platform: '', url: '' }]);
      setShowOnShowcase(video.on_showcase || false);
    }
  }, [video]);

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

  const handleSave = async () => {
    try {
      const folderId = selectedTreeItem?.type === 'folder' ? selectedTreeItem.id : video?.folder_id;
      
      const updateData = {
        title,
        description,
        thumbnail_url: thumbnailUrl,
        social_links: socialLinks.filter(l => l.url),
        folder_id: folderId,
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

          {/* Directory Tree */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Folder Location
            </label>
            <DirectoryTree
              username={localStorage.getItem('rendr_username')}
              selectedItemId={selectedTreeItem?.id || video?.folder_id}
              onItemSelect={setSelectedTreeItem}
              containerHeight="300px"
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
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
    </div>
  );
}

export default EditVideoModal;