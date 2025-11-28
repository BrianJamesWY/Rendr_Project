import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

const BACKEND_URL = 'https://rendr-revamp.preview.emergentagent.com';

function Dashboard() {
  console.log('Dashboard BACKEND_URL:', BACKEND_URL);
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const token = localStorage.getItem('token');

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
    loadDashboard();
  }, [token]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(userRes.data);
      
      const videosRes = await axios.get(`${BACKEND_URL}/api/videos/user/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setVideos(Array.isArray(videosRes.data) ? videosRes.data : videosRes.data.videos || []);

      // Load folders for the edit modal
      try {
        console.log('Loading folders from:', `${BACKEND_URL}/api/folders/`);
        const foldersRes = await axios.get(`${BACKEND_URL}/api/folders/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Folders API response:', foldersRes.data);
        const foldersList = Array.isArray(foldersRes.data) ? foldersRes.data : foldersRes.data.folders || [];
        console.log('Folders loaded:', foldersList.length, foldersList);
        setFolders(foldersList);
      } catch (foldersErr) {
        console.error('Failed to load folders:', foldersErr);
        console.error('Error details:', foldersErr.response?.data);
        setFolders([]);
      }

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

  const handleEditVideo = (video) => {
    setCurrentVideo(video);
    setShowEditVideoModal(true);
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
      loadDashboard();
    } catch (err) {
      alert('Failed to create folder: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('rendr_username');
      navigate('/CreatorLogin');
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

  const topVideos = analytics?.top_videos || [];

  return (
    <div style={{ margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', background: '#f9f9f9', color: '#030303' }}>
      {/* Compact Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', height: '56px', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Logo size="medium" />
          </Link>
          
          <nav style={{ display: 'flex', gap: '4px' }}>
            <Link to="/dashboard" style={{ padding: '8px 12px', color: '#030303', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', background: '#e5e5e5' }}>Dashboard</Link>
            <Link to="/analytics" style={{ padding: '8px 12px', color: '#606060', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', transition: 'background 0.2s' }}>Analytics</Link>
            <Link to="/upload" style={{ padding: '8px 12px', color: '#606060', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', transition: 'background 0.2s' }}>Videos</Link>
            <Link to="/showcase-editor" style={{ padding: '8px 12px', color: '#606060', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', transition: 'background 0.2s' }}>Showcase Editor</Link>
            <Link to="/bounties" style={{ padding: '8px 12px', color: '#606060', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', transition: 'background 0.2s' }}>Bounties</Link>
            <Link to="/earnings" style={{ padding: '8px 12px', color: '#606060', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', transition: 'background 0.2s' }}>Monetization</Link>
            <Link to="/settings" style={{ padding: '8px 12px', color: '#606060', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderRadius: '4px', transition: 'background 0.2s' }}>Settings</Link>
          </nav>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to={`/@${user?.username}`} style={{ padding: '8px 14px', fontSize: '14px', fontWeight: '500', borderRadius: '18px', border: '1px solid #d0d0d0', cursor: 'pointer', textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s', background: 'white', color: '#667eea' }}>View Showcase</Link>
          <Link to="/upload" style={{ padding: '8px 14px', fontSize: '14px', fontWeight: '500', borderRadius: '18px', border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>Upload Video</Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '4px' }}>Welcome back, {user?.display_name || user?.username}</h1>
          <p style={{ fontSize: '14px', color: '#606060' }}>Here's what's happening with your videos today</p>
        </div>
        
        {/* Stats - One Row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', minHeight: '88px' }}>
            <div style={{ fontSize: '13px', color: '#606060', marginBottom: '8px' }}>Total Videos</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#030303' }}>{videos.length}</div>
            <div style={{ fontSize: '12px', color: '#667eea', marginTop: '4px' }}>+{videos.filter(v => {
              const date = new Date(v.captured_at);
              const now = new Date();
              const diffTime = Math.abs(now - date);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 30;
            }).length} this month</div>
          </div>
          <div style={{ flex: 1, background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', minHeight: '88px' }}>
            <div style={{ fontSize: '13px', color: '#606060', marginBottom: '8px' }}>Verifications</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#030303' }}>{analytics?.total_video_views || 0}</div>
            <div style={{ fontSize: '12px', color: '#667eea', marginTop: '4px' }}>+18%</div>
          </div>
          <div style={{ flex: 1, background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', minHeight: '88px' }}>
            <div style={{ fontSize: '13px', color: '#606060', marginBottom: '8px' }}>Total Views</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#030303' }}>{analytics?.total_page_views || 0}</div>
            <div style={{ fontSize: '12px', color: '#667eea', marginTop: '4px' }}>+24%</div>
          </div>
          <div style={{ flex: 1, background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', minHeight: '88px' }}>
            <div style={{ fontSize: '13px', color: '#606060', marginBottom: '8px' }}>Monthly Earnings</div>
            <div style={{ fontSize: '28px', fontWeight: '600', color: '#030303' }}>$0</div>
            <div style={{ fontSize: '12px', color: '#667eea', marginTop: '4px' }}>Coming soon</div>
          </div>
        </div>
        
        {/* Bounty CTA */}
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', padding: '20px', marginBottom: '24px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>🎯 Protect Your Content with Bounties</div>
              <div style={{ fontSize: '14px', opacity: 0.95, marginBottom: '12px' }}>892 hunters are ready to find stolen copies of your videos. You only pay if theft is found.</div>
              <div style={{ display: 'flex', gap: '24px', fontSize: '13px', opacity: 0.9 }}>
                <span>✓ 3.2 day avg discovery</span>
                <span>✓ 94% success rate</span>
                <span>✓ Only pay when found</span>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link to="/bounties/post" style={{ display: 'inline-block', padding: '12px 24px', background: 'white', color: '#667eea', fontWeight: '600', fontSize: '15px', borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Post Bounty</Link>
              <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.9 }}>Starting at $25</div>
            </div>
          </div>
        </div>
        
        {/* Platforms - One Row */}
        <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#030303' }}>Connected Platforms</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '24px' }}>▶️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#030303' }}>YouTube</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>42 videos · 2.8K clicks</div>
              </div>
            </div>
            <div style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '24px' }}>🎵</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#030303' }}>TikTok</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>38 videos · 2.1K clicks</div>
              </div>
            </div>
            <div style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '24px' }}>📷</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#030303' }}>Instagram</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>28 videos · 1.4K clicks</div>
              </div>
            </div>
            <div style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '24px' }}>𝕏</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#030303' }}>Twitter</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>19 videos · 847 clicks</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          {/* Left Column */}
          <div>
            {/* Chart */}
            <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Performance</h2>
                <select style={{ padding: '6px 10px', border: '1px solid #d0d0d0', borderRadius: '4px', fontSize: '13px', background: 'white', cursor: 'pointer' }}>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <div style={{ height: '200px', background: '#f9f9f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#909090', fontSize: '13px' }}>Views & Verifications Chart</div>
            </div>
            
            {/* Recent Videos */}
            <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Videos</h2>
                <Link to="/my-videos" style={{ fontSize: '13px', color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>View All →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {videos.slice(0, 5).map((video, index) => (
                  <div key={video.video_id} style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s', ':hover': { background: '#f9f9f9' } }} onClick={() => handleEditVideo(video)}>
                    <div style={{ width: '120px', height: '68px', background: '#e5e5e5', borderRadius: '4px', flexShrink: 0, overflow: 'hidden' }}>
                      {video.thumbnail_url ? (
                        <img src={`${BACKEND_URL}${video.thumbnail_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🎬</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#030303', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title || 'Untitled Video'}</div>
                      <div style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', fontWeight: '600', color: '#667eea', marginBottom: '4px' }}>{video.verification_code}</div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#606060' }}>
                        <span>{video.folder_id ? '📁 In Folder' : '📂 No Folder'}</span>
                        <span>Uploaded {new Date(video.captured_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {videos.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#909090', fontSize: '14px' }}>
                    <p style={{ marginBottom: '12px' }}>No videos uploaded yet</p>
                    <Link to="/upload" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>Upload your first video →</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div>
            {/* Quick Stats */}
            <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Quick Stats</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#606060' }}>Premium Subscribers</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#606060' }}>Premium Folders</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#606060' }}>Followers</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#606060' }}>Storage Used</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{videos.length} videos</span>
                </div>
              </div>
            </div>

            {/* Folders Widget */}
            <div style={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Folders {console.log('Rendering folders widget, count:', folders.length)}</h2>
                <button onClick={() => setShowNewFolderModal(true)} style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>+ New</button>
              </div>
              
              {folders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                  {folders.slice(0, 5).map(folder => {
                    const folderVideos = videos.filter(v => v.folder_id === folder.folder_id);
                    return (
                      <div key={folder.folder_id} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => navigate('/my-videos', { state: { selectedFolder: folder.folder_id } })}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>📁</span>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{folder.folder_name}</span>
                          </div>
                          <span style={{ fontSize: '12px', color: '#667eea', fontWeight: '600' }}>{folderVideos.length}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#909090', fontSize: '13px' }}>
                  No folders yet. Create one to organize your videos!
                </div>
              )}
              
              <Link to="/my-videos" style={{ display: 'block', marginTop: '12px', fontSize: '13px', color: '#667eea', textDecoration: 'none', fontWeight: '500', textAlign: 'center' }}>View All →</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Video Modal */}
      {showEditVideoModal && currentVideo && (
        <EditVideoModal 
          video={currentVideo}
          folders={folders}
          socialPlatforms={socialPlatforms}
          onClose={() => { setShowEditVideoModal(false); setCurrentVideo(null); }}
          onSave={loadDashboard}
          onFolderCreated={loadDashboard}
          token={token}
        />
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <Logo size="small" />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>Create New Folder</h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>Folder Name</label>
              <input 
                type="text" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                placeholder="Enter folder name"
                autoFocus
                style={{ width: '100%', padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowNewFolderModal(false); setNewFolderName(''); }} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateFolder} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Edit Video Modal Component
function EditVideoModal({ video, folders, socialPlatforms, onClose, onSave, token, onFolderCreated }) {
  const [title, setTitle] = useState(video.title || '');
  const [description, setDescription] = useState(video.description || '');
  const [folderId, setFolderId] = useState(video.folder_id || '');
  const [onShowcase, setOnShowcase] = useState(video.on_showcase || false);
  const [socialFolders, setSocialFolders] = useState(video.social_folders || []);
  const [socialLinks, setSocialLinks] = useState(video.social_links || [{ platform: '', url: '' }]);
  const [saving, setSaving] = useState(false);
  const [showInlineFolderCreate, setShowInlineFolderCreate] = useState(false);
  const [inlineFolderName, setInlineFolderName] = useState('');
  const [localFolders, setLocalFolders] = useState(folders);

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

  const handleCreateInlineFolder = async () => {
    if (!inlineFolderName.trim()) return;
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/folders/`,
        { folder_name: inlineFolderName, description: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Add new folder to local list
      const newFolder = { 
        folder_id: response.data.folder_id || response.data.id,
        folder_name: inlineFolderName 
      };
      setLocalFolders([...localFolders, newFolder]);
      setFolderId(newFolder.folder_id);
      setShowInlineFolderCreate(false);
      setInlineFolderName('');
      
      // Notify parent Dashboard to refresh folders
      if (onFolderCreated) {
        onFolderCreated();
      }
    } catch (err) {
      alert('Failed to create folder: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        title,
        description,
        folder_id: folderId || null,
        on_showcase: onShowcase,
        social_folders: socialFolders,
        social_links: socialLinks.filter(l => l.url)
      };
      
      console.log('Saving video with data:', updateData);
      
      await axios.put(
        `${BACKEND_URL}/api/videos/${video.video_id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Video saved successfully');
      onSave();
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
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
          {!showInlineFolderCreate ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select value={folderId} onChange={(e) => {
                if (e.target.value === '__create_new__') {
                  setShowInlineFolderCreate(true);
                  setInlineFolderName('');
                } else {
                  setFolderId(e.target.value);
                }
              }} style={{ flex: 1, padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}>
                <option value="">No Folder</option>
                {localFolders.map(f => (
                  <option key={f.folder_id} value={f.folder_id}>{f.folder_name}</option>
                ))}
                <option value="__create_new__" style={{ color: '#667eea', fontWeight: '500' }}>+ Create New Folder</option>
              </select>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={inlineFolderName}
                onChange={(e) => setInlineFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
                style={{ flex: 1, padding: '10px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px' }}
              />
              <button onClick={handleCreateInlineFolder} style={{ padding: '10px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Create</button>
              <button onClick={() => setShowInlineFolderCreate(false)} style={{ padding: '10px 16px', background: '#e5e5e5', color: '#666', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
            </div>
          )}
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

export default Dashboard;