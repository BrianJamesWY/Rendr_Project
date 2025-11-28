import React, { useState } from 'react';
import axios from 'axios';
import Logo from './Logo';
import VideoPlayer from './VideoPlayer';

const BACKEND_URL = 'https://rendr-revamp.preview.emergentagent.com';

function EditVideoModal({ video, folders, socialPlatforms, onClose, onSave, token }) {
  const [title, setTitle] = useState(video.title || '');
  const [description, setDescription] = useState(video.description || '');
  const [folderId, setFolderId] = useState(video.folder_id || '');
  const [onShowcase, setOnShowcase] = useState(video.on_showcase || false);
  const [socialFolders, setSocialFolders] = useState(video.social_folders || []);
  const [socialLinks, setSocialLinks] = useState(video.social_links || [{ platform: '', url: '' }]);
  const [saving, setSaving] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const handleToggleSocialFolder = (platformId) => {
    if (socialFolders.includes(platformId)) {
      setSocialFolders(socialFolders.filter(p => p !== platformId));
    } else {
      setSocialFolders([...socialFolders, platformId]);
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

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await axios.put(
        `${BACKEND_URL}/api/videos/${video.video_id}`,
        {
          title,
          description,
          folder_id: folderId || null,
          on_showcase: onShowcase,
          social_folders: socialFolders,
          social_links: socialLinks.filter(l => l.url)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onSave();
      onClose();
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.detail || err.message));
      setSaving(false);
    }
  };

  return (
    <>
      {showVideoPlayer && (
        <VideoPlayer
          videoId={video.video_id}
          thumbnail={video.thumbnail_url}
          title={title || video.title}
          onClose={() => setShowVideoPlayer(false)}
          isAuthenticated={true}
        />
      )}
      
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Logo size="small" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>Edit Video Details</h3>
            </div>
            <button
              onClick={() => setShowVideoPlayer(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ▶️ Play Video
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Folder</label>
          <select value={folderId} onChange={(e) => setFolderId(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}>
            <option value="">No Folder</option>
            {folders.map(f => (
              <option key={f.folder_id} value={f.folder_id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={onShowcase}
              onChange={(e) => setOnShowcase(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Show on Showcase</span>
          </label>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Social Media Platforms</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {socialPlatforms.map(platform => (
              <label key={platform.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: '8px', cursor: 'pointer', background: socialFolders.includes(platform.id) ? 'rgba(102, 126, 234, 0.1)' : 'white' }}>
                <input 
                  type="checkbox" 
                  checked={socialFolders.includes(platform.id)}
                  onChange={() => handleToggleSocialFolder(platform.id)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>{platform.icon}</span>
                <span style={{ fontSize: '13px' }}>{platform.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Social Media Links</label>
          {socialLinks.map((link, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <select 
                value={link.platform}
                onChange={(e) => handleUpdateSocialLink(index, 'platform', e.target.value)}
                style={{ padding: '8px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '13px' }}
              >
                <option value="">Select Platform</option>
                {socialPlatforms.map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
              <input 
                type="url" 
                value={link.url}
                onChange={(e) => handleUpdateSocialLink(index, 'url', e.target.value)}
                placeholder="https://..."
                style={{ flex: 1, padding: '8px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '13px' }}
              />
              <button onClick={() => handleRemoveSocialLink(index)} style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✕</button>
            </div>
          ))}
          <button onClick={handleAddSocialLink} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', width: '100%' }}>+ Add Link</button>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button onClick={onClose} disabled={saving} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

export default EditVideoModal;
