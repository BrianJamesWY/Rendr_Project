import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Logo from '../components/Logo';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Dashboard() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showcaseFolders, setShowcaseFolders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showQuickCreateFolder, setShowQuickCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoDescription, setVideoDescription] = useState('');
  const [videoExternalLink, setVideoExternalLink] = useState('');
  const [videoPlatform, setVideoPlatform] = useState('');
  const [videoTags, setVideoTags] = useState('Rendr');
  const [videoShowcaseFolder, setVideoShowcaseFolder] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [showFolderManagement, setShowFolderManagement] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderIconEmoji, setFolderIconEmoji] = useState('📁');
  const [folderColor, setFolderColor] = useState('#667eea');

  const [viewMode, setViewMode] = useState('all'); // 'all' or 'folder'
  const token = localStorage.getItem('rendr_token');
  const username = localStorage.getItem('rendr_username');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadDashboard();
  }, [token]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Get user info
      const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(userRes.data);
      
      // Get videos
      const videosRes = await axios.get(`${BACKEND_URL}/api/videos/user/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setVideos(videosRes.data.videos);
      
      // Get folders (optional - don't fail if this errors)
      try {
        const foldersRes = await axios.get(`${BACKEND_URL}/api/folders/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFolders(foldersRes.data || []);
      } catch (folderErr) {
        console.log('Folders not loaded:', folderErr);
        setFolders([]);
      }

      // Get showcase folders
      try {
        const showcaseFoldersRes = await axios.get(`${BACKEND_URL}/api/showcase-folders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setShowcaseFolders(showcaseFoldersRes.data || []);
      } catch (showcaseFolderErr) {
        console.log('Showcase folders not loaded:', showcaseFolderErr);
        setShowcaseFolders([]);
      }

      // Load analytics
      try {
        const analyticsRes = await axios.get(`${BACKEND_URL}/api/analytics/dashboard?days=30`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(analyticsRes.data);
      } catch (analyticsErr) {
        console.error('Failed to load analytics:', analyticsErr);
        setAnalytics(null);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('rendr_token');
      localStorage.removeItem('rendr_username');
      navigate('/CreatorLogin');
    }
  };

  const moveVideoToFolder = async (videoId, folderId) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/videos/${videoId}/folder?folder_id=${folderId || ''}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reload videos
      loadDashboard();
      setShowMoveModal(false);
      setSelectedVideo(null);
    } catch (err) {
      alert('Failed to move video');
    }
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setVideoShowcaseFolder(video.showcase_folder_id || '');
    setVideoDescription(video.description || '');
    setVideoExternalLink(video.external_link || '');
    setVideoPlatform(video.platform || '');
    setVideoTags(video.tags ? video.tags.join(', ') : 'Rendr');
    setShowEditModal(true);
  };

  const saveVideoMetadata = async () => {
    try {
      const tagsArray = videoTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await axios.put(
        `${BACKEND_URL}/api/videos/${editingVideo.video_id}/metadata`,
        {
          description: videoDescription,
          external_link: videoExternalLink,
          platform: videoPlatform,
          tags: tagsArray,
          showcase_folder_id: videoShowcaseFolder || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      loadDashboard();
      alert('Video updated successfully!');
    } catch (err) {
      alert('Failed to update video');
    }
  };

  const createQuickShowcaseFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/showcase-folders`,
        {
          folder_name: newFolderName,
          description: newFolderDescription,
          icon_emoji: folderIconEmoji,
          color: folderColor
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowQuickCreateFolder(false);
      setNewFolderName('');
      setNewFolderDescription('');
      setFolderIconEmoji('📁');
      setFolderColor('#667eea');
      loadDashboard();
      // Set the newly created folder as selected
      setVideoShowcaseFolder(response.data.folder_id);
      alert('✅ Folder created successfully!');
    } catch (err) {
      alert('❌ Failed to create folder: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const updateShowcaseFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    try {
      await axios.put(
        `${BACKEND_URL}/api/showcase-folders/${editingFolder.folder_id}`,
        {
          folder_name: newFolderName,
          description: newFolderDescription,
          icon_emoji: folderIconEmoji,
          color: folderColor
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingFolder(null);
      setNewFolderName('');
      setNewFolderDescription('');
      setFolderIconEmoji('📁');
      setFolderColor('#667eea');
      loadDashboard();
      alert('✅ Folder updated successfully!');
    } catch (err) {
      alert('❌ Failed to update folder: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const deleteShowcaseFolder = async (folderId) => {
    if (!window.confirm('Delete this folder? Videos will remain but will be unassigned.')) {
      return;
    }

    try {
      await axios.delete(
        `${BACKEND_URL}/api/showcase-folders/${folderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadDashboard();
      alert('✅ Folder deleted successfully!');
    } catch (err) {
      alert('❌ Failed to delete folder: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const canCreateFolder = () => {
    const tier = user?.premium_tier || 'free';
    if (tier === 'free') {
      return folders.length < 3;
    }
    return true; // Pro and Enterprise unlimited
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    if (!canCreateFolder()) {
      alert('Free tier limited to 3 folders. Upgrade to Pro for unlimited folders!');
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/folders/`,
        {
          folder_name: newFolderName,
          description: newFolderDescription
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateFolderModal(false);
      setNewFolderName('');
      setNewFolderDescription('');
      loadDashboard();
      alert('Folder created successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create folder');
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, type } = result;

    // Dropped outside
    if (!destination) return;

    // No movement
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (type === 'FOLDER') {
      // Reordering folders
      const reorderedFolders = Array.from(showcaseFolders);
      const [removed] = reorderedFolders.splice(source.index, 1);
      reorderedFolders.splice(destination.index, 0, removed);

      // Update state immediately for smooth UX
      setShowcaseFolders(reorderedFolders);

      // Save to backend
      try {
        const folder_orders = reorderedFolders.map((folder, index) => ({
          folder_id: folder.folder_id,
          order: index
        }));

        await axios.put(
          `${BACKEND_URL}/api/showcase-folders/reorder`,
          { folder_orders },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Failed to reorder folders:', err);
        loadDashboard(); // Revert on error
      }
    } else if (type === 'VIDEO' && selectedFolderId) {
      // Reordering videos within a folder
      const folderVideos = videos.filter(v => v.showcase_folder_id === selectedFolderId);
      const reorderedVideos = Array.from(folderVideos);
      const [removed] = reorderedVideos.splice(source.index, 1);
      reorderedVideos.splice(destination.index, 0, removed);

      // Update video order in state
      const updatedVideos = videos.map(v => {
        const index = reorderedVideos.findIndex(rv => rv.video_id === v.video_id);
        if (index !== -1) {
          return { ...v, folder_video_order: index };
        }
        return v;
      });
      setVideos(updatedVideos);

      // Save to backend
      try {
        const video_orders = reorderedVideos.map((video, index) => ({
          video_id: video.video_id,
          order: index
        }));

        await axios.put(
          `${BACKEND_URL}/api/showcase-folders/${selectedFolderId}/reorder-videos`,
          { video_orders },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Failed to reorder videos:', err);
        loadDashboard(); // Revert on error
      }
    }
  };


  if (loading) {
    return (

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#991b1b', marginBottom: '1rem' }}>{error}</p>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="dashboard" />
      
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '2rem 0',
        marginBottom: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <Logo size="small" />
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginTop: '1rem' }}>
            Creator Dashboard
          </h1>
          <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1rem' }}>
            Welcome back, {user?.display_name}!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <Link
              to="/settings"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              ⚙️ Profile Settings
            </Link>
            <Link
              to={`/@${user?.username}`}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              👁️ View Showcase
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Total Videos
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
              {videos.length}
            </div>
          </div>
          
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Folders
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {folders.length}
            </div>
          </div>
          
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Username
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
              @{user?.username}
            </div>
          </div>
          
          <Link 
            to="/plans"
            style={{
              display: 'block',
              background: 'white', 
              borderRadius: '0.75rem', 
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              textDecoration: 'none',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Account Tier
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b', textTransform: 'capitalize' }}>
              {user?.premium_tier || 'Free'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#667eea', marginTop: '0.5rem', fontWeight: '600' }}>
              View Plans →
            </div>
          </Link>

          <Link 
            to="/showcase-editor"
            style={{
              display: 'block',
              background: 'white', 
              borderRadius: '0.75rem', 
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              textDecoration: 'none',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Showcase Editor
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
              🎨
            </div>
            <div style={{ fontSize: '0.75rem', color: '#667eea', marginTop: '0.5rem', fontWeight: '600' }}>
              Customize →
            </div>
          </Link>
        </div>
      </div>



      {/* Analytics Section */}
      {analytics && (
        <div style={{ maxWidth: '1200px', margin: '2rem auto 3rem', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
            📊 Analytics (Last 30 Days)
          </h2>
          
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Page Views</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{analytics.total_page_views}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Showcase visits</div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Video Views</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>{analytics.total_video_views}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Individual videos viewed</div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Social Clicks</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{analytics.total_social_clicks}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Links followed</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Top Videos */}
            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>🔥 Top Videos</h3>
              {analytics.top_videos && analytics.top_videos.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analytics.top_videos.map((video, index) => (
                    <div key={video.video_id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#6b7280', width: '24px' }}>{index + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', fontFamily: 'monospace' }}>{video.verification_code}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{video.view_count} views</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
                  No video views yet
                </p>
              )}
            </div>

            {/* Social Click Breakdown */}
            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>🔗 Social Media Clicks</h3>
              {analytics.social_click_breakdown && analytics.social_click_breakdown.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analytics.social_click_breakdown.map((item) => (
                    <div key={item.platform} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{item.platform}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#667eea' }}>{item.click_count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
                  No social clicks yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Folder Management & Videos */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
              {viewMode === 'all' ? 'All Videos' : selectedFolderId ? showcaseFolders.find(f => f.folder_id === selectedFolderId)?.folder_name : 'Video Library'}
            </h2>
            {viewMode === 'folder' && (
              <button
                onClick={() => { setViewMode('all'); setSelectedFolderId(null); }}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                ← Back to All Videos
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFolderManagement(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📁 Folders ({showcaseFolders.length})
          </button>
        </div>

        {/* Quick Links to Social Media (Logged-in accounts) */}
        {user?.dashboard_social_links && user.dashboard_social_links.length > 0 ? (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
              🔗 Your Social Media Accounts
            </h3>
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {user.dashboard_social_links.map((link, idx) => {
                const platformLoggedInUrls = {
                  'instagram': 'https://www.instagram.com/accounts/login/',
                  'tiktok': 'https://www.tiktok.com/login',
                  'youtube': 'https://studio.youtube.com/',
                  'twitter': 'https://twitter.com/home',
                  'facebook': 'https://www.facebook.com/'
                };
                
                const loggedInUrl = platformLoggedInUrls[link.platform?.toLowerCase()] || link.url;
                
                return (
                  <a
                    key={idx}
                    href={loggedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: '#374151',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    {link.platform} →
                  </a>
                );
              })}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
              Quick links to your logged-in social media accounts
            </p>
          </div>
        ) : (
          <div style={{ 
            marginBottom: '2rem', 
            padding: '1rem', 
            background: '#eff6ff', 
            border: '1px solid #bfdbfe', 
            borderRadius: '0.5rem' 
          }}>
            <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
              💡 <strong>No Dashboard Social Links Yet:</strong> Please add your "Creator - Logged In Social Media Links" in <Link to="/settings" style={{ color: '#667eea', textDecoration: 'underline', fontWeight: '600' }}>Profile Settings</Link> for quick access to your logged-in social media accounts (Instagram Studio, TikTok Creator Portal, etc.)
            </p>
          </div>
        )}

        {/* Folder Cards - With Drag & Drop */}
        {viewMode === 'all' && showcaseFolders.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Your Showcase Folders
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1rem' }}>
              💡 Drag folders to reorder them on your showcase page
            </p>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="folders" direction="horizontal" type="FOLDER">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                      gap: '1rem',
                      background: snapshot.isDraggingOver ? '#f3f4f6' : 'transparent',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      transition: 'background 0.2s'
                    }}
                  >
                    {showcaseFolders.map((folder, index) => {
                      const folderVideos = videos.filter(v => v.showcase_folder_id === folder.folder_id);
                      return (
                        <Draggable key={folder.folder_id} draggableId={folder.folder_id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => { setSelectedFolderId(folder.folder_id); setViewMode('folder'); }}
                              style={{
                                ...provided.draggableProps.style,
                                background: 'white',
                                border: snapshot.isDragging ? `2px solid ${folder.color || '#667eea'}` : '2px solid #e5e7eb',
                                borderRadius: '0.75rem',
                                padding: '1.5rem',
                                cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                boxShadow: snapshot.isDragging ? '0 10px 30px rgba(0,0,0,0.2)' : 'none'
                              }}
                            >
                              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{folder.icon_emoji || '📁'}</div>
                              <div style={{ fontWeight: '600', color: folder.color || '#111827', marginBottom: '0.25rem' }}>
                                {folder.folder_name}
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                {folderVideos.length} {folderVideos.length === 1 ? 'video' : 'videos'}
                                {folder.subfolder_count > 0 && ` • ${folder.subfolder_count} subfolders`}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            padding: '3rem', 
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
            <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '1rem' }}>
              No videos yet
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
              Upload your first verified video to get started!
            </p>
            <Link 
              to="/upload"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Upload Video
            </Link>
          </div>
        ) : (
          <>
            {viewMode === 'folder' && (
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1rem' }}>
                💡 Drag videos to reorder them within this folder
              </p>
            )}
            {viewMode === 'folder' ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="videos" type="VIDEO">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem',
                        background: snapshot.isDraggingOver ? '#f3f4f6' : 'transparent',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        transition: 'background 0.2s'
                      }}
                    >
                      {videos
                        .filter(video => video.showcase_folder_id === selectedFolderId)
                        .sort((a, b) => (a.folder_video_order || 999) - (b.folder_video_order || 999))
                        .map((video, index) => {
                          const videoFolder = showcaseFolders.find(f => f.folder_id === video.showcase_folder_id);
                          return (
                            <Draggable key={video.video_id} draggableId={video.video_id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    background: 'white',
                                    borderRadius: '0.75rem',
                                    overflow: 'hidden',
                                    boxShadow: snapshot.isDragging ? '0 10px 30px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    cursor: snapshot.isDragging ? 'grabbing' : 'default'
                                  }}
                                >
                                  <div {...provided.dragHandleProps} style={{ cursor: 'grab', padding: '0.5rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
                                    ⋮⋮ Drag to reorder
                                  </div>
                                  
                                  {/* Thumbnail */}
                                  <div 
                                    onClick={() => openEditModal(video)}
                                    style={{ 
                                      width: '100%', 
                                      height: '180px', 
                                      background: '#e5e7eb',
                                      position: 'relative',
                                      overflow: 'hidden',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {video.thumbnail_url ? (
                                      <img 
                                        src={`${BACKEND_URL}${video.thumbnail_url}`}
                                        alt={video.verification_code}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                                        🎬
                                      </div>
                                    )}
                                    {video.has_blockchain && (
                                      <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'rgba(254, 243, 199, 0.95)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: '#92400e'
                                      }}>
                                        ⛓️ Verified
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Video Info */}
                                  <div style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#667eea', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                                      {video.verification_code}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                                      {new Date(video.captured_at).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                                      {video.source === 'bodycam' ? '📱 Bodycam' : '💻 Studio'}
                                    </div>
                                    {videoFolder && (
                                      <div style={{ fontSize: '0.75rem', color: '#059669', background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', marginBottom: '1rem', display: 'inline-block' }}>
                                        📁 {videoFolder.folder_name}
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                      <button onClick={() => { setSelectedVideo(video); setShowMoveModal(true); }} style={{ flex: 1, padding: '0.5rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
                                        📁 Move
                                      </button>
                                      <button onClick={() => { navigator.clipboard.writeText(video.verification_code); alert('Code copied!'); }} style={{ flex: 1, padding: '0.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
                                        📋 Copy Code
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {videos
                  .map(video => {
                    const videoFolder = showcaseFolders.find(f => f.folder_id === video.showcase_folder_id);
                    return (
              <div 
                key={video.video_id}
                style={{
                  background: 'white',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Thumbnail - Clickable to edit */}
                <div 
                  onClick={() => openEditModal(video)}
                  style={{ 
                    width: '100%', 
                    height: '180px', 
                    background: '#e5e7eb',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.querySelector('.edit-overlay').style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.querySelector('.edit-overlay').style.opacity = '0';
                  }}
                >
                  {video.thumbnail_url ? (
                    <img 
                      src={`${BACKEND_URL}${video.thumbnail_url}`}
                      alt={video.verification_code}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '3rem'
                    }}>
                      🎬
                    </div>
                  )}
                  <div 
                    className="edit-overlay"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      pointerEvents: 'none'
                    }}
                  >
                    <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>✏️</span>
                  </div>
                  
                  {/* Blockchain Badge Overlay */}
                  {video.has_blockchain && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(254, 243, 199, 0.95)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#92400e',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      ⛓️ Verified
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div style={{ padding: '1rem' }}>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: 'bold', 
                    color: '#667eea',
                    fontFamily: 'monospace',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.05em'
                  }}>
                    {video.verification_code}
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280',
                    marginBottom: '0.75rem'
                  }}>
                    {new Date(video.captured_at).toLocaleDateString()} at {new Date(video.captured_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#9ca3af',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {video.source === 'bodycam' ? '📱 Bodycam' : '💻 Studio'}
                  </div>
                  
                  {/* Folder Badge */}
                  {videoFolder ? (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#059669',
                      background: '#d1fae5',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      marginBottom: '1rem',
                      display: 'inline-block'
                    }}>
                      📁 {videoFolder.folder_name}
                    </div>
                  ) : (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      background: '#fee2e2',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      marginBottom: '1rem',
                      display: 'inline-block'
                    }}>
                      ⚠️ Not in folder
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setSelectedVideo(video);
                        setShowMoveModal(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      📁 Move
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(video.verification_code);
                        alert('Code copied!');
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      📋 Copy Code
                    </button>
                  </div>
                </div>
              </div>
            );
              })}
          </div>
            )}
          </>
        )}
      </div>

      {/* Move to Folder Modal */}
      {showMoveModal && selectedVideo && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              📁 Organize Video
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              Video: <strong>{selectedVideo.verification_code}</strong>
            </p>
            {selectedVideo.showcase_folder_id && (
              <p style={{ fontSize: '0.875rem', color: '#059669', marginBottom: '1.5rem', background: '#d1fae5', padding: '0.5rem', borderRadius: '0.375rem' }}>
                Currently in: <strong>{showcaseFolders.find(f => f.folder_id === selectedVideo.showcase_folder_id)?.folder_name || 'Unknown'}</strong>
              </p>
            )}
            {!selectedVideo.showcase_folder_id && (
              <p style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '1.5rem', background: '#fee2e2', padding: '0.5rem', borderRadius: '0.375rem' }}>
                ⚠️ Not in any showcase folder (won't appear on public page)
              </p>
            )}
            
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
              Move to showcase folder:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {showcaseFolders.map(folder => {
                const isCurrentFolder = selectedVideo.showcase_folder_id === folder.folder_id;
                return (
                  <button
                    key={folder.folder_id}
                    onClick={async () => {
                      try {
                        await axios.put(
                          `${BACKEND_URL}/api/videos/${selectedVideo.video_id}/metadata`,
                          { showcase_folder_id: folder.folder_id },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setShowMoveModal(false);
                        loadDashboard();
                        alert('✅ Video moved successfully!');
                      } catch (err) {
                        alert('❌ Failed to move video');
                      }
                    }}
                    style={{
                      padding: '1rem',
                      background: isCurrentFolder ? '#eff6ff' : '#f3f4f6',
                      border: isCurrentFolder ? '2px solid #667eea' : '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentFolder) {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.background = '#eff6ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentFolder) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = '#f3f4f6';
                      }
                    }}
                  >
                    📁 {folder.folder_name}
                    {isCurrentFolder && (
                      <span style={{ 
                        position: 'absolute', 
                        right: '1rem', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        fontSize: '0.75rem',
                        color: '#667eea'
                      }}>
                        ✓ Current
                      </span>
                    )}
                  </button>
                );
              })}
              
              <button
                onClick={async () => {
                  try {
                    await axios.put(
                      `${BACKEND_URL}/api/videos/${selectedVideo.video_id}/metadata`,
                      { showcase_folder_id: null },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setShowMoveModal(false);
                    loadDashboard();
                    alert('✅ Video removed from folder');
                  } catch (err) {
                    alert('❌ Failed to update video');
                  }
                }}
                style={{
                  padding: '1rem',
                  background: '#fee2e2',
                  border: '2px solid #fecaca',
                  borderRadius: '0.5rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#dc2626'
                }}
              >
                🗑️ Remove from folder (won't show on showcase)
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowMoveModal(false);
                setSelectedVideo(null);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {showEditModal && editingVideo && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Edit Video Details
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: '600' }}>
                  Description
                </label>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(videoDescription);
                    alert('Description copied!');
                  }}
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copy
                </button>
              </div>
              <textarea
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                rows={3}
                placeholder="Describe this video..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                External Link (Instagram, TikTok, etc.)
              </label>
              <input
                type="url"
                value={videoExternalLink}
                onChange={(e) => setVideoExternalLink(e.target.value)}
                placeholder="https://instagram.com/p/..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Platform(s) - Select Multiple
              </label>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Hold Ctrl (Cmd on Mac) to select multiple platforms
              </div>
              <select
                multiple
                value={videoPlatform ? videoPlatform.split(',') : []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                  setVideoPlatform(selected.join(','));
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  minHeight: '120px'
                }}
              >
                <option value="Instagram">📷 Instagram</option>
                <option value="TikTok">🎵 TikTok</option>
                <option value="YouTube">▶️ YouTube</option>
                <option value="Twitter">🐦 Twitter/X</option>
                <option value="Facebook">👥 Facebook</option>
              </select>
              {videoPlatform && (
                <div style={{ fontSize: '0.875rem', color: '#667eea', marginTop: '0.5rem', fontWeight: '600' }}>
                  Selected: {videoPlatform}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: '600' }}>
                  Tags (comma-separated)
                </label>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(videoTags);
                    alert('Tags copied!');
                  }}
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copy
                </button>
              </div>
              <input
                type="text"
                value={videoTags}
                onChange={(e) => setVideoTags(e.target.value)}
                placeholder="Rendr, MyTopic, TruthContent"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Rendr tag is automatically added to all videos
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: '600' }}>
                  📁 Showcase Folder
                </label>
                <button
                  onClick={() => setShowQuickCreateFolder(true)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + New Folder
                </button>
              </div>
              <select
                value={videoShowcaseFolder}
                onChange={(e) => setVideoShowcaseFolder(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  background: 'white'
                }}
              >
                <option value="">No Folder (Not visible on showcase)</option>
                {showcaseFolders.map(folder => (
                  <option key={folder.folder_id} value={folder.folder_id}>
                    {folder.folder_name}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Videos must be in a showcase folder to appear on your public page
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingVideo(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveVideoMetadata}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Create New Folder
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Folder Name
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., Instagram Posts, YouTube Series"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Description (optional)
              </label>
              <textarea
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                rows={2}
                placeholder="Describe this collection..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            {user?.premium_tier === 'free' && (
              <div style={{
                padding: '0.75rem',
                background: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                <strong>Free Tier:</strong> {folders.length}/3 folders used. 
                <Link to="/plans" style={{ color: '#667eea', fontWeight: '600', marginLeft: '0.5rem' }}>
                  Upgrade for unlimited →
                </Link>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setNewFolderName('');
                  setNewFolderDescription('');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Management Modal */}
      {showFolderManagement && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                📁 Manage Folders
              </h2>
              <button
                onClick={() => { setShowFolderManagement(false); setEditingFolder(null); setNewFolderName(''); setNewFolderDescription(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Create/Edit Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                editingFolder ? updateShowcaseFolder() : createQuickShowcaseFolder();
              }}
              style={{ marginBottom: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                {editingFolder ? 'Edit Folder' : 'Create New Folder'}
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., My Best Work"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Description (optional)
                </label>
                <textarea
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief description..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Folder Icon
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['📁', '🎬', '🎥', '📹', '🎞️', '⭐', '🔥', '💎', '🎯', '🚀', '💼', '📱', '🎨', '🎵', '🏆'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFolderIconEmoji(emoji)}
                      style={{
                        padding: '0.5rem',
                        fontSize: '1.5rem',
                        background: folderIconEmoji === emoji ? '#667eea' : 'white',
                        border: '2px solid ' + (folderIconEmoji === emoji ? '#667eea' : '#e5e7eb'),
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  Folder Color
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFolderColor(color)}
                      style={{
                        width: '40px',
                        height: '40px',
                        background: color,
                        border: '3px solid ' + (folderColor === color ? '#000' : 'transparent'),
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {editingFolder && (
                  <button
                    onClick={() => { setEditingFolder(null); setNewFolderName(''); setNewFolderDescription(''); }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  {editingFolder ? 'Update Folder' : 'Create Folder'}
                </button>
              </div>
            </form>

            {/* Folders List */}
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
              Your Folders ({showcaseFolders.length})
            </h3>

            {showcaseFolders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                No folders yet. Create one above!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {showcaseFolders.map(folder => {
                  const folderVideos = videos.filter(v => v.showcase_folder_id === folder.folder_id);
                  return (
                    <div 
                      key={folder.folder_id}
                      style={{
                        padding: '1rem',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          📁 {folder.folder_name}
                        </div>
                        {folder.description && (
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            {folder.description}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          {folderVideos.length} {folderVideos.length === 1 ? 'video' : 'videos'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setEditingFolder(folder);
                            setNewFolderName(folder.folder_name);
                            setNewFolderDescription(folder.description || '');
                            setFolderIconEmoji(folder.icon_emoji || '📁');
                            setFolderColor(folder.color || '#667eea');
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            color: '#374151'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteShowcaseFolder(folder.folder_id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            color: '#dc2626'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showQuickCreateFolder && (
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
          zIndex: 1001
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '450px',
            width: '90%'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              📁 Create Showcase Folder
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              This folder will be visible on your public showcase page
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Folder Name
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., My Best Work, Travel Videos"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Description (optional)
              </label>
              <textarea
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                rows={2}
                placeholder="Brief description..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowQuickCreateFolder(false);
                  setNewFolderName('');
                  setNewFolderDescription('');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={createQuickShowcaseFolder}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
