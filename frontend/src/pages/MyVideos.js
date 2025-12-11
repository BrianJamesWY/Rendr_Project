import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

const BACKEND_URL = 'https://verify-video.preview.emergentagent.com';

function MyVideos() {
  console.log('MyVideos BACKEND_URL:', BACKEND_URL);
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Social media platforms
  const socialPlatforms = [
    { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
    { id: 'facebook', name: 'Facebook', icon: '👥', color: '#1877F2' }
  ];

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading videos from:', `${BACKEND_URL}/api/videos/user/list`);
      console.log('Loading folders from:', `${BACKEND_URL}/api/folders`);
      
      const [videosRes, foldersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/videos/user/list`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/folders/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setVideos(Array.isArray(videosRes.data) ? videosRes.data : videosRes.data.videos || []);
      setFolders(Array.isArray(foldersRes.data) ? foldersRes.data : foldersRes.data.folders || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await axios.post(
        `${BACKEND_URL}/api/folders/`,
        { folder_name: newFolderName, description: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewFolderName('');
      setShowNewFolderModal(false);
      loadData();
    } catch (err) {
      alert('Failed to create folder: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleRenameFolder = async () => {
    if (!newFolderName.trim() || !currentFolder) return;
    
    try {
      await axios.put(
        `${BACKEND_URL}/api/folders/${currentFolder.folder_id}`,
        { folder_name: newFolderName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewFolderName('');
      setCurrentFolder(null);
      setShowRenameFolderModal(false);
      loadData();
    } catch (err) {
      alert('Failed to rename folder: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Delete this folder? Videos will not be deleted.')) return;
    
    try {
      await axios.delete(`${BACKEND_URL}/api/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadData();
    } catch (err) {
      alert('Failed to delete folder: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditVideo = (video) => {
    setCurrentVideo(video);
    setShowEditVideoModal(true);
  };

  const filteredVideos = selectedFolder === 'all' 
    ? videos 
    : videos.filter(v => v.folder_id === selectedFolder);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', height: '56px', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <Logo size="medium" />
        </Link>
        <h1 style={{ fontSize: '18px', fontWeight: '600', marginLeft: '24px' }}>My Videos</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>>
          <Link to="/upload" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Upload Video</Link>
          <Link to="/dashboard" style={{ padding: '8px 16px', background: 'white', color: '#667eea', border: '1px solid #667eea', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Back to Dashboard</Link>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'flex', gap: '24px' }}>
        {/* Left Sidebar - Folders */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Folders</h2>
              <button onClick={() => setShowNewFolderModal(true)} style={{ padding: '4px 12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>+ New</button>
            </div>

            {/* All Videos */}
            <div 
              onClick={() => setSelectedFolder('all')}
              style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', background: selectedFolder === 'all' ? 'rgba(102, 126, 234, 0.1)' : 'transparent', color: selectedFolder === 'all' ? '#667eea' : '#374151', fontWeight: selectedFolder === 'all' ? '600' : '400', fontSize: '14px', marginBottom: '8px', transition: 'all 0.2s' }}
            >
              📂 All Videos ({videos.length})
            </div>

            {/* Social Media Folders */}
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginTop: '16px', marginBottom: '8px', textTransform: 'uppercase' }}>Social Media</div>
            {socialPlatforms.map(platform => (
              <div 
                key={platform.id}
                onClick={() => setSelectedFolder(platform.id)}
                style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', background: selectedFolder === platform.id ? 'rgba(102, 126, 234, 0.1)' : 'transparent', color: selectedFolder === platform.id ? '#667eea' : '#374151', fontWeight: selectedFolder === platform.id ? '600' : '400', fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
              >
                <span>{platform.icon}</span>
                <span>{platform.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#6b7280' }}>({videos.filter(v => v.social_folders?.includes(platform.id)).length})</span>
              </div>
            ))}

            {/* Custom Folders */}
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginTop: '16px', marginBottom: '8px', textTransform: 'uppercase' }}>My Folders</div>
            {folders.map(folder => (
              <div key={folder.folder_id} style={{ marginBottom: '4px' }}>
                <div
                  onClick={() => setSelectedFolder(folder.folder_id)}
                  style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', background: selectedFolder === folder.folder_id ? 'rgba(102, 126, 234, 0.1)' : 'transparent', color: selectedFolder === folder.folder_id ? '#667eea' : '#374151', fontWeight: selectedFolder === folder.folder_id ? '600' : '400', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
                >
                  <span>📁 {folder.folder_name}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentFolder(folder); setNewFolderName(folder.folder_name); setShowRenameFolderModal(true); }} style={{ padding: '2px 6px', background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.folder_id); }} style={{ padding: '2px 6px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
            {folders.length === 0 && (
              <div style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '12px' }}>No folders yet</div>
            )}
          </div>
        </div>

        {/* Main Content - Videos Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
            Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {filteredVideos.map(video => (
              <div key={video.video_id} onClick={() => handleEditVideo(video)} style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #e5e5e5' }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#e5e5e5' }}>
                  {video.thumbnail_url ? (
                    <img src={`${BACKEND_URL}${video.thumbnail_url}`} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🎬</div>
                  )}
                  {video.on_showcase && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(102, 126, 234, 0.9)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>ON SHOWCASE</div>
                  )}
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title || 'Untitled'}</div>
                  <div style={{ fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#667eea', marginBottom: '8px' }}>{video.verification_code}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{new Date(video.captured_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📹</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No videos here yet</div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Upload your first video to get started</div>
              <Link to="/upload" style={{ display: 'inline-block', padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>Upload Video</Link>
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Logo size="small" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>New Folder</h3>
            </div>
            <input 
              type="text" 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              style={{ width: '100%', padding: '12px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowNewFolderModal(false); setNewFolderName(''); }} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateFolder} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {showRenameFolderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Logo size="small" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>Rename Folder</h3>
            </div>
            <input 
              type="text" 
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              style={{ width: '100%', padding: '12px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}
              onKeyPress={(e) => e.key === 'Enter' && handleRenameFolder()}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowRenameFolderModal(false); setNewFolderName(''); setCurrentFolder(null); }} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleRenameFolder} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Rename</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {showEditVideoModal && currentVideo && (
        <EditVideoModal 
          video={currentVideo}
          folders={folders}
          socialPlatforms={socialPlatforms}
          onClose={() => { setShowEditVideoModal(false); setCurrentVideo(null); }}
          onSave={loadData}
          token={token}
        />
      )}
    </div>
  );
}

// Edit Video Modal Component
function EditVideoModal({ video, folders, socialPlatforms, onClose, onSave, token }) {
  const [title, setTitle] = useState(video.title || '');
  const [description, setDescription] = useState(video.description || '');
  const [folderId, setFolderId] = useState(video.folder_id || '');
  const [onShowcase, setOnShowcase] = useState(video.on_showcase || false);
  const [socialFolders, setSocialFolders] = useState(video.social_folders || []);
  const [socialLinks, setSocialLinks] = useState(video.social_links || [{ platform: '', url: '' }]);
  const [saving, setSaving] = useState(false);

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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <Logo size="small" />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>Edit Video Details</h3>
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

export default MyVideos;
