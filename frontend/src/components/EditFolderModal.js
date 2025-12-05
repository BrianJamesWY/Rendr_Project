import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DirectoryTree from './DirectoryTree';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function EditFolderModal({ folder, onClose, onSave }) {
  const [folderName, setFolderName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [backgroundType, setBackgroundType] = useState('solid');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [gradientStart, setGradientStart] = useState('#667eea');
  const [gradientEnd, setGradientEnd] = useState('#764ba2');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const thumbnailInputRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (folder) {
      setFolderName(folder.name || '');
      setDescription(folder.description || '');
      setThumbnailUrl(folder.thumbnail || '');
      
      const bg = folder.background || {};
      setBackgroundType(bg.type || 'solid');
      setBackgroundColor(bg.color || '#ffffff');
      setGradientStart(bg.gradientStart || '#667eea');
      setGradientEnd(bg.gradientEnd || '#764ba2');
      setBackgroundImageUrl(bg.imageUrl || '');
    }
  }, [folder]);

  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `${BACKEND_URL}/api/folders/${folder.id}/thumbnail`,
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

  const handleBackgroundImageUpload = async (file) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        `${BACKEND_URL}/api/folders/${folder.id}/background`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setBackgroundImageUrl(response.data.background_url);
      setUploading(false);
    } catch (error) {
      console.error('Background upload failed:', error);
      alert('Failed to upload background image');
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updateData = {
        folder_name: folderName,
        description: description,
        thumbnail_url: thumbnailUrl,
        background: {
          type: backgroundType,
          color: backgroundColor,
          gradientStart: gradientStart,
          gradientEnd: gradientEnd,
          imageUrl: backgroundImageUrl
        }
      };
      
      await axios.put(
        `${BACKEND_URL}/api/folders/${folder.id}`,
        updateData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      onSave(updateData);
      onClose();
    } catch (error) {
      console.error('Error saving folder:', error);
      alert('Failed to save folder changes');
    }
  };

  const getBackgroundPreview = () => {
    switch (backgroundType) {
      case 'solid':
        return { background: backgroundColor };
      case 'gradient':
        return { background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` };
      case 'image':
        return backgroundImageUrl 
          ? { backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: '#f0f0f0' };
      default:
        return { background: '#ffffff' };
    }
  };

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
              Edit Folder Details
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
          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
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
              placeholder="Enter folder description"
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

          {/* Folder Background */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Folder Background (on Showcase)
            </label>
            
            {/* Background Type Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {['solid', 'gradient', 'image'].map(type => (
                <button
                  key={type}
                  onClick={() => setBackgroundType(type)}
                  style={{
                    padding: '8px 16px',
                    background: backgroundType === type ? '#667eea' : '#f0f0f0',
                    color: backgroundType === type ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textTransform: 'capitalize',
                    fontWeight: backgroundType === type ? '600' : '400'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Solid Color */}
            {backgroundType === 'solid' && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  style={{ width: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            )}

            {/* Gradient */}
            {backgroundType === 'gradient' && (
              <div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', width: '80px' }}>Start Color:</label>
                  <input
                    type="color"
                    value={gradientStart}
                    onChange={(e) => setGradientStart(e.target.value)}
                    style={{ width: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={gradientStart}
                    onChange={(e) => setGradientStart(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px', width: '80px' }}>End Color:</label>
                  <input
                    type="color"
                    value={gradientEnd}
                    onChange={(e) => setGradientEnd(e.target.value)}
                    style={{ width: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={gradientEnd}
                    onChange={(e) => setGradientEnd(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Image */}
            {backgroundType === 'image' && (
              <div>
                <input
                  type="text"
                  value={backgroundImageUrl}
                  onChange={(e) => setBackgroundImageUrl(e.target.value)}
                  placeholder="Enter image URL"
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
                <button
                  onClick={() => backgroundInputRef.current?.click()}
                  style={{
                    padding: '10px 20px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Upload Image
                </button>
                <input
                  ref={backgroundInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleBackgroundImageUpload(file);
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {/* Background Preview */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '13px', marginBottom: '6px', color: '#666' }}>Preview:</div>
              <div
                style={{
                  height: '80px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  ...getBackgroundPreview()
                }}
              />
            </div>
          </div>

          {/* Directory Tree */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Folder Location
            </label>
            <DirectoryTree
              username={localStorage.getItem('rendr_username')}
              selectedItemId={folder?.id}
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

export default EditFolderModal;
