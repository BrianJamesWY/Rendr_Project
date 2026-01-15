// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext } from 'react-beautiful-dnd';
import Navigation from '../components/Navigation';
import QuotaIndicator from '../components/QuotaIndicator';
import DashboardUI from '../components/DashboardUI';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Dashboard() {
  const navigate = useNavigate();

  // Core data
  const [videos, setVideos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showcaseFolders, setShowcaseFolders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [user, setUser] = useState(null);

  // Selection and view
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'folder'

  // Modals
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showQuickCreateFolder, setShowQuickCreateFolder] = useState(false);
  const [showFolderManagement, setShowFolderManagement] = useState(false);

  // Folder fields
  const [editingFolder, setEditingFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [folderIconEmoji, setFolderIconEmoji] = useState('📁');
  const [folderColor, setFolderColor] = useState('#667eea');
  const [showOnShowcase, setShowOnShowcase] = useState(true);

  // Video edit fields
  const [videoDescription, setVideoDescription] = useState('');
  const [videoExternalLink, setVideoExternalLink] = useState('');
  const [videoPlatform, setVideoPlatform] = useState('');
  const [videoTags, setVideoTags] = useState('Rendr');
  const [videoShowcaseFolder, setVideoShowcaseFolder] = useState('');

  // Status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('rendr_token');
  const username = localStorage.getItem('rendr_username');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // User
      const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);

      // Videos
      const videosRes = await axios.get(`${BACKEND_URL}/api/videos/user/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(Array.isArray(videosRes.data) ? videosRes.data : videosRes.data.videos || []);

      // Folders (soft fail)
      try {
        const foldersRes = await axios.get(`${BACKEND_URL}/api/folders/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFolders(foldersRes.data || []);
      } catch (folderErr) {
        console.log('Folders not loaded:', folderErr);
        setFolders([]);
      }

      // Showcase folders (soft fail)
      try {
        const showcaseFoldersRes = await axios.get(`${BACKEND_URL}/api/showcase-folders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShowcaseFolders(showcaseFoldersRes.data || []);
      } catch (showcaseFolderErr) {
        console.log('Showcase folders not loaded:', showcaseFolderErr);
        setShowcaseFolders([]);
      }

      // Analytics (soft fail)
      try {
        const analyticsRes = await axios.get(
          `${BACKEND_URL}/api/analytics/dashboard?days=30`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  const handleLogout = () => {
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
      const tagsArray = videoTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      await axios.put(
        `${BACKEND_URL}/api/videos/${editingVideo.video_id}/metadata`,
        {
          description: videoDescription,
          external_link: videoExternalLink,
          platform: videoPlatform,
          tags: tagsArray,
          showcase_folder_id: videoShowcaseFolder || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      setEditingVideo(null);
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
          color: folderColor,
          is_public: showOnShowcase,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowQuickCreateFolder(false);
      setNewFolderName('');
      setNewFolderDescription('');
      setFolderIconEmoji('📁');
      setFolderColor('#667eea');
      setShowOnShowcase(true);
      loadDashboard();
      setVideoShowcaseFolder(response.data.folder_id);
      alert('✅ Folder created successfully!');
    } catch (err) {
      alert(
        '❌ Failed to create folder: ' +
          (err.response?.data?.detail || 'Unknown error')
      );
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
          color: folderColor,
          is_public: showOnShowcase,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingFolder(null);
      setNewFolderName('');
      setNewFolderDescription('');
      setFolderIconEmoji('📁');
      setFolderColor('#667eea');
      setShowOnShowcase(true);
      loadDashboard();
      alert('✅ Folder updated successfully!');
    } catch (err) {
      alert(
        '❌ Failed to update folder: ' +
          (err.response?.data?.detail || 'Unknown error')
      );
    }
  };

  const deleteShowcaseFolder = async (folderId) => {
    if (
      !window.confirm(
        'Delete this folder? Videos will remain but will be unassigned.'
      )
    ) {
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
      alert(
        '❌ Failed to delete folder: ' +
          (err.response?.data?.detail || 'Unknown error')
      );
    }
  };

  const canCreateFolder = () => {
    const tier = user?.premium_tier || 'free';
    if (tier === 'free') {
      return folders.length < 3;
    }
    return true;
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    if (!canCreateFolder()) {
      alert(
        'Free tier limited to 3 folders. Upgrade to Pro for unlimited folders!'
      );
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/folders/`,
        {
          folder_name: newFolderName,
          description: newFolderDescription,
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

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'FOLDER') {
      const reorderedFolders = Array.from(showcaseFolders);
      const [removed] = reorderedFolders.splice(source.index, 1);
      reorderedFolders.splice(destination.index, 0, removed);
      setShowcaseFolders(reorderedFolders);

      try {
        const folder_orders = reorderedFolders.map((folder, index) => ({
          folder_id: folder.folder_id,
          order: index,
        }));

        await axios.put(
          `${BACKEND_URL}/api/showcase-folders/reorder`,
          { folder_orders },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Failed to reorder folders:', err);
        loadDashboard();
      }
    } else if (type === 'VIDEO' && selectedFolderId) {
      const folderVideos = videos.filter(
        (v) => v.showcase_folder_id === selectedFolderId
      );
      const reorderedVideos = Array.from(folderVideos);
      const [removed] = reorderedVideos.splice(source.index, 1);
      reorderedVideos.splice(destination.index, 0, removed);

      const updatedVideos = videos.map((v) => {
        const index = reorderedVideos.findIndex(
          (rv) => rv.video_id === v.video_id
        );
        if (index !== -1) {
          return { ...v, folder_video_order: index };
        }
        return v;
      });
      setVideos(updatedVideos);

      try {
        const video_orders = reorderedVideos.map((video, index) => ({
          video_id: video.video_id,
          order: index,
        }));

        await axios.put(
          `${BACKEND_URL}/api/showcase-folders/${selectedFolderId}/reorder-videos`,
          { video_orders },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Failed to reorder videos:', err);
        loadDashboard();
      }
    }
  };

  // Simple derived chart data for the glassmorphic chart
  const chartData = analytics?.daily_views
    ? analytics.daily_views.map((d) => d.count || 0)
    : Array.from({ length: 15 }, (_, i) => 20 + i * 2);

  // Simple derived "activities" from latest videos
  const activities = videos
    .slice()
    .sort(
      (a, b) =>
        new Date(b.captured_at).getTime() -
        new Date(a.captured_at).getTime()
    )
    .slice(0, 5)
    .map((video, idx) => ({
      id: video.video_id || `video-${idx}`,
      type: video.has_blockchain ? 'verification' : 'upload',
      user: user?.display_name || user?.username || 'You',
      action: video.has_blockchain ? 'verified video' : 'uploaded video',
      code: video.verification_code,
      time: new Date(video.captured_at).toLocaleDateString(),
      status: 'success',
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-200">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-200">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <DashboardUI
          // core data
          user={user}
          videos={videos}
          folders={folders}
          showcaseFolders={showcaseFolders}
          analytics={analytics}
          loading={loading}
          error={error}
          chartData={chartData}
          activities={activities}
          BACKEND_URL={BACKEND_URL}
          username={username}

          // view / selection
          viewMode={viewMode}
          selectedFolderId={selectedFolderId}

          // modals
          showMoveModal={showMoveModal}
          showEditModal={showEditModal}
          showCreateFolderModal={showCreateFolderModal}
          showQuickCreateFolder={showQuickCreateFolder}
          showFolderManagement={showFolderManagement}
          selectedVideo={selectedVideo}
          editingVideo={editingVideo}
          editingFolder={editingFolder}

          // folder fields
          newFolderName={newFolderName}
          newFolderDescription={newFolderDescription}
          folderIconEmoji={folderIconEmoji}
          folderColor={folderColor}
          showOnShowcase={showOnShowcase}

          // video edit fields
          videoDescription={videoDescription}
          videoExternalLink={videoExternalLink}
          videoPlatform={videoPlatform}
          videoTags={videoTags}
          videoShowcaseFolder={videoShowcaseFolder}

          // navigation callbacks
          onGoDashboard={() => navigate('/dashboard')}
          onGoUpload={() => navigate('/upload')}
          onGoVerify={() => navigate('/verify')}
          onGoSettings={() => navigate('/settings')}
          onGoShowcase={() => navigate(`/@${user?.username}`)}
          onGoShowcaseEditor={() => navigate('/showcase-editor')}
          onGoPlans={() => navigate('/plans')}
          onGoBounties={() => navigate('/bounties')}
          onGoAnalytics={() => navigate('/analytics')}
          onLogout={handleLogout}

          // library / modal callbacks
          onOpenFolderManagement={() => setShowFolderManagement(true)}
          onCloseFolderManagement={() => {
            setShowFolderManagement(false);
            setEditingFolder(null);
            setNewFolderName('');
            setNewFolderDescription('');
          }}
          onOpenVideoEdit={openEditModal}
          onOpenMoveModal={(video) => {
            setSelectedVideo(video);
            setShowMoveModal(true);
          }}
          onCloseMoveModal={() => {
            setShowMoveModal(false);
            setSelectedVideo(null);
          }}
          onOpenCreateFolderModal={() => setShowCreateFolderModal(true)}
          onCloseCreateFolderModal={() => {
            setShowCreateFolderModal(false);
            setNewFolderName('');
            setNewFolderDescription('');
          }}
          onOpenQuickCreateFolder={() => setShowQuickCreateFolder(true)}
          onCloseQuickCreateFolder={() => {
            setShowQuickCreateFolder(false);
            setNewFolderName('');
            setNewFolderDescription('');
          }}
          onStartEditFolder={(folder) => {
            setEditingFolder(folder);
            setNewFolderName(folder.folder_name);
            setNewFolderDescription(folder.description || '');
            setFolderIconEmoji(folder.icon_emoji || '📁');
            setFolderColor(folder.color || '#667eea');
            setShowOnShowcase(folder.is_public !== false);
          }}

          // actions
          onSaveVideoMetadata={saveVideoMetadata}
          onCreateFolder={createFolder}
          onCreateQuickShowcaseFolder={createQuickShowcaseFolder}
          onUpdateShowcaseFolder={updateShowcaseFolder}
          onDeleteShowcaseFolder={deleteShowcaseFolder}
          onMoveVideoToFolder={moveVideoToFolder}

          // setters for simple form controls
          setNewFolderName={setNewFolderName}
          setNewFolderDescription={setNewFolderDescription}
          setFolderIconEmoji={setFolderIconEmoji}
          setFolderColor={setFolderColor}
          setShowOnShowcase={setShowOnShowcase}
          setVideoDescription={setVideoDescription}
          setVideoExternalLink={setVideoExternalLink}
          setVideoPlatform={setVideoPlatform}
          setVideoTags={setVideoTags}
          setVideoShowcaseFolder={setVideoShowcaseFolder}
          setViewMode={setViewMode}
          setSelectedFolderId={setSelectedFolderId}
        >
          {/* QuotaIndicator stays from old dashboard */}
          <div className="max-w-5xl mx-auto mt-4 px-4">
            <QuotaIndicator user={user} />
          </div>
        </DashboardUI>
      </DragDropContext>
    </>
  );
}

export default Dashboard;
