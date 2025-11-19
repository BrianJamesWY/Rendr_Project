import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Google Fonts list for free tier
const FREE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
  'Poppins', 'Raleway', 'Playfair Display', 'Merriweather', 
  'Nunito', 'PT Sans', 'Ubuntu', 'Oswald', 'Quicksand', 'Work Sans'
];

// Pro fonts (additional 50 popular ones)
const PRO_FONTS = [
  'Bebas Neue', 'Crimson Text', 'DM Sans', 'Fira Sans', 'IBM Plex Sans',
  'Karla', 'Libre Baskerville', 'Manrope', 'Noto Sans', 'Source Sans Pro',
  'Space Grotesk', 'Archivo', 'Bitter', 'Josefin Sans', 'Mukta',
  'Cabin', 'Dosis', 'Exo', 'Hind', 'Inconsolata',
  'Lobster', 'Pacifico', 'Righteous', 'Rubik', 'Titillium Web',
  'Varela Round', 'Yanone Kaffeesatz', 'Zilla Slab', 'Asap', 'Barlow',
  'Comfortaa', 'Dancing Script', 'EB Garamond', 'Fjalla One', 'Gothic A1',
  'Heebo', 'Indie Flower', 'Jost', 'Kanit', 'Lexend',
  'Libre Franklin', 'Nanum Gothic', 'Oxygen', 'Prompt', 'Questrial',
  'Rajdhani', 'Saira', 'Tajawal', 'Urbanist', 'Vollkorn'
];

function ShowcaseEditor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [showcaseFolders, setShowcaseFolders] = useState([]);
  const [activeTab, setActiveTab] = useState('appearance');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  
  // Edit video modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoDescription, setVideoDescription] = useState('');
  const [videoExternalLink, setVideoExternalLink] = useState('');
  const [videoPlatform, setVideoPlatform] = useState('');
  const [videoTags, setVideoTags] = useState('Rendr');
  
  // Folder management
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'modern',
    backgroundColor: '#ffffff',
    backgroundImage: null,
    backgroundImageOpacity: 100,
    gradientEnabled: false,
    gradientColor1: '#667eea',
    gradientColor2: '#764ba2',
    gradientDirection: 'to right',
    
    // Layout
    layout: 'grid',
    gridColumns: 3,
    cardSpacing: 'medium',
    showFeaturedSection: false,
    organizeByPlatform: true,
    
    // Folders/Collections
    showFolderLinks: false,
    folderLinkPosition: 'below',
    
    // Typography
    fontFamily: 'Inter',
    headingSize: 'large',
    bodySize: 'medium',
    customHeadingSize: null,
    customBodySize: null,
    lineHeight: 'normal',
    letterSpacing: 'normal',
    
    // Colors
    primaryColor: '#667eea',
    textColor: '#111827',
    secondaryTextColor: '#6b7280',
    buttonColor: '#667eea',
    buttonHoverColor: '#5568d3',
    cardBackgroundColor: '#ffffff',
    
    // Effects (Pro)
    animationsEnabled: false,
    hoverEffect: 'none',
    cardShadow: 'medium',
    borderRadius: 'medium',
    
    // Content
    showVerificationCodes: true,
    showDates: true,
    showDescriptions: true,
    showTags: true,
    showFolderHeaders: true,
    
    // Button Styles
    buttonStyle: 'rounded',
    buttonSize: 'medium',
    
    // Profile
    profilePictureSize: 'large',
    profilePictureBorder: true,
    
    // Collections
    collectionHeaderStyle: 'bold',
    collectionDivider: true,
    
    // Social Media Buttons (Pro)
    customSocialButtons: false,
    socialButtonStyle: 'default',
    socialButtonBackground: null
  });

  const token = localStorage.getItem('rendr_token');
  const username = localStorage.getItem('rendr_username');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const [userRes, videosRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/videos/user/list`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUser(userRes.data);
      setVideos(videosRes.data.videos || []);
      
      // Load showcase-specific folders
      try {
        const foldersRes = await axios.get(`${BACKEND_URL}/api/showcase-folders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShowcaseFolders(foldersRes.data || []);
      } catch (err) {
        console.log('No showcase folders yet');
        setShowcaseFolders([]);
      }
      
      if (userRes.data.showcase_settings) {
        setSettings({ ...settings, ...userRes.data.showcase_settings });
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
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
          tags: tagsArray
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      loadData();
      alert('✅ Video updated successfully!');
    } catch (err) {
      alert('❌ Failed to update video');
    }
  };

  const createShowcaseFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/showcase-folders`,
        {
          folder_name: newFolderName,
          description: newFolderDescription
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCreateFolderModal(false);
      setNewFolderName('');
      setNewFolderDescription('');
      loadData();
      alert('✅ Showcase folder created!');
    } catch (err) {
      alert('❌ Failed to create folder');
    }
  };

  const saveSettings = async () => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/@/profile`,
        { showcase_settings: settings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Showcase settings saved!');
    } catch (err) {
      alert('❌ Failed to save settings');
    }
  };

  const resetSettings = () => {
    if (window.confirm('Reset all settings to default?')) {
      setSettings({
        theme: 'modern',
        backgroundColor: '#ffffff',
        layout: 'grid',
        gridColumns: 3,
        fontFamily: 'Inter',
        primaryColor: '#667eea',
        textColor: '#111827',
        buttonStyle: 'rounded',
        showVerificationCodes: true,
        showDates: true
      });
    }
  };

  const isPro = user?.premium_tier === 'pro' || user?.premium_tier === 'enterprise';

  // Predefined themes
  const themes = {
    modern: {
      name: 'Modern',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      primaryColor: '#667eea',
      cardBackgroundColor: '#f9fafb'
    },
    minimal: {
      name: 'Minimal',
      backgroundColor: '#fafafa',
      textColor: '#1a1a1a',
      primaryColor: '#000000',
      cardBackgroundColor: '#ffffff'
    },
    bold: {
      name: 'Bold',
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      primaryColor: '#ff6b6b',
      cardBackgroundColor: '#2d2d2d'
    },
    creative: {
      name: 'Creative',
      backgroundColor: '#fff7ed',
      textColor: '#7c2d12',
      primaryColor: '#f97316',
      cardBackgroundColor: '#ffffff'
    },
    professional: {
      name: 'Professional',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      primaryColor: '#0f172a',
      cardBackgroundColor: '#ffffff'
    },
    ocean: {
      name: 'Ocean',
      backgroundColor: '#e0f2fe',
      textColor: '#0c4a6e',
      primaryColor: '#0284c7',
      cardBackgroundColor: '#ffffff'
    },
    sunset: {
      name: 'Sunset',
      backgroundColor: '#fef3c7',
      textColor: '#78350f',
      primaryColor: '#f59e0b',
      cardBackgroundColor: '#ffffff'
    },
    forest: {
      name: 'Forest',
      backgroundColor: '#d1fae5',
      textColor: '#065f46',
      primaryColor: '#10b981',
      cardBackgroundColor: '#ffffff'
    }
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    setSettings({
      ...settings,
      theme: themeName,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      primaryColor: theme.primaryColor,
      cardBackgroundColor: theme.cardBackgroundColor
    });
  };

  const renderSettingsPanel = () => {
    return (
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'appearance', icon: '🎨', label: 'Appearance' },
            { id: 'layout', icon: '📐', label: 'Layout' },
            { id: 'typography', icon: '🔤', label: 'Typography' },
            { id: 'effects', icon: '✨', label: 'Effects', pro: true },
            { id: 'content', icon: '🎯', label: 'Content' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.pro && !isPro}
              style={{
                padding: '0.5rem 1rem',
                background: activeTab === tab.id ? '#667eea' : '#f3f4f6',
                color: activeTab === tab.id ? '#fff' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: tab.pro && !isPro ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                opacity: tab.pro && !isPro ? 0.5 : 1
              }}
            >
              {tab.icon} {tab.label} {tab.pro && !isPro && '🔒'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'layout' && renderLayoutTab()}
          {activeTab === 'typography' && renderTypographyTab()}
          {activeTab === 'effects' && renderEffectsTab()}
          {activeTab === 'content' && renderContentTab()}
        </div>
      </div>
    );
  };

  const renderAppearanceTab = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>🎨 Appearance</h3>
      
      {/* Theme Presets */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Quick Themes</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {Object.keys(themes).map(themeName => (
            <button
              key={themeName}
              onClick={() => applyTheme(themeName)}
              style={{
                padding: '0.75rem',
                border: settings.theme === themeName ? '2px solid #667eea' : '1px solid #e5e7eb',
                borderRadius: '6px',
                background: themes[themeName].backgroundColor,
                color: themes[themeName].textColor,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: settings.theme === themeName ? '600' : '400'
              }}
            >
              {themes[themeName].name}
            </button>
          ))}
        </div>
      </div>

      {/* Background Color */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Background Color</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
            style={{ width: '50px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={settings.backgroundColor}
            onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
        </div>
      </div>

      {/* Gradient Options (Pro) */}
      {isPro && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.gradientEnabled}
                onChange={(e) => setSettings({ ...settings, gradientEnabled: e.target.checked })}
              />
              <span style={{ fontWeight: '600' }}>Enable Gradient Background</span>
            </label>
          </div>

          {settings.gradientEnabled && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Gradient Color 1</label>
                <input
                  type="color"
                  value={settings.gradientColor1}
                  onChange={(e) => setSettings({ ...settings, gradientColor1: e.target.value })}
                  style={{ width: '100%', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Gradient Color 2</label>
                <input
                  type="color"
                  value={settings.gradientColor2}
                  onChange={(e) => setSettings({ ...settings, gradientColor2: e.target.value })}
                  style={{ width: '100%', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Direction</label>
                <select
                  value={settings.gradientDirection}
                  onChange={(e) => setSettings({ ...settings, gradientDirection: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                >
                  <option value="to right">Left to Right</option>
                  <option value="to left">Right to Left</option>
                  <option value="to bottom">Top to Bottom</option>
                  <option value="to top">Bottom to Top</option>
                  <option value="to bottom right">Diagonal ↘</option>
                  <option value="to top right">Diagonal ↗</option>
                </select>
              </div>
            </>
          )}
        </>
      )}

      {/* Primary Color */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Primary/Accent Color</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="color"
            value={settings.primaryColor}
            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
            style={{ width: '50px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={settings.primaryColor}
            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
        </div>
      </div>

      {/* Card Background */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Card Background Color</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="color"
            value={settings.cardBackgroundColor}
            onChange={(e) => setSettings({ ...settings, cardBackgroundColor: e.target.value })}
            style={{ width: '50px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={settings.cardBackgroundColor}
            onChange={(e) => setSettings({ ...settings, cardBackgroundColor: e.target.value })}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
        </div>
      </div>

      {/* Custom Social Buttons (Pro) */}
      {isPro && (
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Social Media Button Customization</h4>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
            <input
              type="checkbox"
              checked={settings.customSocialButtons}
              onChange={(e) => setSettings({ ...settings, customSocialButtons: e.target.checked })}
            />
            <span style={{ fontWeight: '600' }}>Enable Custom Social Buttons</span>
          </label>

          {settings.customSocialButtons && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Button Style</label>
                <select
                  value={settings.socialButtonStyle}
                  onChange={(e) => setSettings({ ...settings, socialButtonStyle: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                >
                  <option value="default">Default (Platform Colors)</option>
                  <option value="minimal">Minimal (Outlined)</option>
                  <option value="solid">Solid Color</option>
                  <option value="gradient">Gradient</option>
                  <option value="image">Custom Background Image</option>
                </select>
              </div>

              {settings.socialButtonStyle === 'image' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Background Image URL
                  </label>
                  <input
                    type="text"
                    value={settings.socialButtonBackground || ''}
                    onChange={(e) => setSettings({ ...settings, socialButtonBackground: e.target.value })}
                    placeholder="https://example.com/button-bg.jpg"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Upload your image to a hosting service and paste the URL here
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!isPro && (
        <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '6px', fontSize: '0.875rem', marginTop: '1rem' }}>
          <strong>⭐ Pro Features:</strong><br/>
          • Gradient backgrounds<br/>
          • Background images<br/>
          • Custom hover colors<br/>
          • Custom social media buttons<br/>
          • Advanced color controls
        </div>
      )}
    </div>
  );

  const renderLayoutTab = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>📐 Layout</h3>
      
      {/* Layout Style */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Layout Style</label>
        <select
          value={settings.layout}
          onChange={(e) => setSettings({ ...settings, layout: e.target.value })}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        >
          <option value="grid">Grid View</option>
          <option value="list">List View</option>
          {isPro && <option value="masonry">Masonry Grid (Pro)</option>}
          {isPro && <option value="magazine">Magazine Style (Pro)</option>}
        </select>
      </div>

      {/* Grid Columns */}
      {settings.layout === 'grid' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
            Grid Columns: {settings.gridColumns}
          </label>
          <input
            type="range"
            min="2"
            max={isPro ? "6" : "4"}
            value={settings.gridColumns}
            onChange={(e) => setSettings({ ...settings, gridColumns: parseInt(e.target.value) })}
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {isPro ? 'Pro: Up to 6 columns' : 'Free: Up to 4 columns'}
          </div>
        </div>
      )}

      {/* Card Spacing */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Card Spacing</label>
        <select
          value={settings.cardSpacing}
          onChange={(e) => setSettings({ ...settings, cardSpacing: e.target.value })}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        >
          <option value="tight">Tight</option>
          <option value="medium">Medium</option>
          <option value="relaxed">Relaxed</option>
          {isPro && <option value="custom">Custom (Pro)</option>}
        </select>
      </div>

      {/* Featured Section (Pro) */}
      {isPro && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.showFeaturedSection}
              onChange={(e) => setSettings({ ...settings, showFeaturedSection: e.target.checked })}
            />
            <span style={{ fontWeight: '600' }}>Show Featured Videos Section</span>
          </label>
        </div>
      )}

      {/* Border Radius */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Card Corner Radius</label>
        <select
          value={settings.borderRadius}
          onChange={(e) => setSettings({ ...settings, borderRadius: e.target.value })}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        >
          <option value="none">Sharp (0px)</option>
          <option value="small">Small (4px)</option>
          <option value="medium">Medium (8px)</option>
          <option value="large">Large (12px)</option>
          <option value="xlarge">Extra Large (16px)</option>
        </select>
      </div>

      {/* Profile Picture Size */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Profile Picture Size</label>
        <select
          value={settings.profilePictureSize}
          onChange={(e) => setSettings({ ...settings, profilePictureSize: e.target.value })}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        >
          <option value="small">Small (80px)</option>
          <option value="medium">Medium (100px)</option>
          <option value="large">Large (120px)</option>
          <option value="xlarge">Extra Large (150px)</option>
        </select>
      </div>

      {/* Video Organization */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Video Organization</h4>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
          <input
            type="checkbox"
            checked={settings.organizeByPlatform}
            onChange={(e) => setSettings({ ...settings, organizeByPlatform: e.target.checked })}
          />
          <span>Auto-organize videos by platform</span>
        </label>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '1.5rem', marginBottom: '1rem' }}>
          Videos will be grouped into Instagram, TikTok, YouTube, etc. folders
        </div>

        {isPro && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
              <input
                type="checkbox"
                checked={settings.showFolderLinks}
                onChange={(e) => setSettings({ ...settings, showFolderLinks: e.target.checked })}
              />
              <span>Show links in collection headers (Pro)</span>
            </label>
            
            {settings.showFolderLinks && (
              <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Link Position
                </label>
                <select
                  value={settings.folderLinkPosition}
                  onChange={(e) => setSettings({ ...settings, folderLinkPosition: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem' }}
                >
                  <option value="below">Below Collection Name</option>
                  <option value="inline">Inline with Name</option>
                  <option value="button">As Button</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderTypographyTab = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>🔤 Typography</h3>
      
      {/* Font Family */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
          Font Family {!isPro && '(15 Free Fonts)'}
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontFamily: settings.fontFamily }}
        >
          <optgroup label="Free Fonts">
            {FREE_FONTS.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
            ))}
          </optgroup>
          {isPro && (
            <optgroup label="Pro Fonts">
              {PRO_FONTS.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Heading Size */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Heading Size</label>
        <select
          value={settings.headingSize}
          onChange={(e) => setSettings({ ...settings, headingSize: e.target.value })}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="xlarge">Extra Large</option>
          {isPro && <option value="custom">Custom Size (Pro)</option>}
        </select>
      </div>

      {/* Body Text Size */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Body Text Size</label>
        <select
          value={settings.bodySize}
          onChange={(e) => setSettings({ ...settings, bodySize: e.target.value })}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          {isPro && <option value="custom">Custom Size (Pro)</option>}
        </select>
      </div>

      {/* Text Color */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Text Color</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="color"
            value={settings.textColor}
            onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
            style={{ width: '50px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={settings.textColor}
            onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          />
        </div>
      </div>

      {/* Pro Typography Features */}
      {isPro && (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Line Height</label>
            <select
              value={settings.lineHeight}
              onChange={(e) => setSettings({ ...settings, lineHeight: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
            >
              <option value="tight">Tight (1.2)</option>
              <option value="normal">Normal (1.5)</option>
              <option value="relaxed">Relaxed (1.75)</option>
              <option value="loose">Loose (2)</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Letter Spacing</label>
            <select
              value={settings.letterSpacing}
              onChange={(e) => setSettings({ ...settings, letterSpacing: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
            >
              <option value="tight">Tight (-0.05em)</option>
              <option value="normal">Normal (0)</option>
              <option value="wide">Wide (0.05em)</option>
              <option value="wider">Wider (0.1em)</option>
            </select>
          </div>
        </>
      )}

      {!isPro && (
        <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '6px', fontSize: '0.875rem' }}>
          <strong>⭐ Pro Features:</strong><br/>
          • 900+ Google Fonts<br/>
          • Custom font sizes<br/>
          • Line height control<br/>
          • Letter spacing control
        </div>
      )}
    </div>
  );

  const renderEffectsTab = () => {
    if (!isPro) {
      return (
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>✨ Effects (Pro Only)</h3>
          <div style={{ padding: '2rem', background: '#fef3c7', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Upgrade to Pro</h4>
            <p style={{ marginBottom: '1rem', color: '#78350f' }}>
              Unlock animations, hover effects, and advanced visual controls
            </p>
            <Link
              to="/plans"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#f59e0b',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600'
              }}
            >
              View Plans
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>✨ Effects & Animations</h3>
        
        {/* Enable Animations */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.animationsEnabled}
              onChange={(e) => setSettings({ ...settings, animationsEnabled: e.target.checked })}
            />
            <span style={{ fontWeight: '600' }}>Enable Animations</span>
          </label>
        </div>

        {/* Hover Effect */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Card Hover Effect</label>
          <select
            value={settings.hoverEffect}
            onChange={(e) => setSettings({ ...settings, hoverEffect: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          >
            <option value="none">None</option>
            <option value="lift">Lift Up</option>
            <option value="scale">Scale</option>
            <option value="glow">Glow</option>
            <option value="border">Border Highlight</option>
          </select>
        </div>

        {/* Card Shadow */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Card Shadow</label>
          <select
            value={settings.cardShadow}
            onChange={(e) => setSettings({ ...settings, cardShadow: e.target.value })}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
          >
            <option value="none">None</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra Large</option>
          </select>
        </div>

        {/* Button Hover Color */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Button Hover Color</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="color"
              value={settings.buttonHoverColor}
              onChange={(e) => setSettings({ ...settings, buttonHoverColor: e.target.value })}
              style={{ width: '50px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={settings.buttonHoverColor}
              onChange={(e) => setSettings({ ...settings, buttonHoverColor: e.target.value })}
              style={{ flex: 1, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderContentTab = () => (
    <div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>🎯 Content Display</h3>
      
      {/* Show/Hide Options */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
          <input
            type="checkbox"
            checked={settings.showVerificationCodes}
            onChange={(e) => setSettings({ ...settings, showVerificationCodes: e.target.checked })}
          />
          <span>Show Verification Codes</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
          <input
            type="checkbox"
            checked={settings.showDates}
            onChange={(e) => setSettings({ ...settings, showDates: e.target.checked })}
          />
          <span>Show Upload Dates</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
          <input
            type="checkbox"
            checked={settings.showDescriptions}
            onChange={(e) => setSettings({ ...settings, showDescriptions: e.target.checked })}
          />
          <span>Show Video Descriptions</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
          <input
            type="checkbox"
            checked={settings.showTags}
            onChange={(e) => setSettings({ ...settings, showTags: e.target.checked })}
          />
          <span>Show Tags</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
          <input
            type="checkbox"
            checked={settings.showFolderHeaders}
            onChange={(e) => setSettings({ ...settings, showFolderHeaders: e.target.checked })}
          />
          <span>Show Collection/Folder Headers</span>
        </label>
      </div>

      {/* Button Style */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Button Style</label>
        <select
          value={settings.buttonStyle}
          onChange={(e) => setSettings({ ...settings, buttonStyle: e.target.value })}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        >
          <option value="rounded">Rounded</option>
          <option value="pill">Pill (Fully Rounded)</option>
          <option value="square">Square</option>
          <option value="outlined">Outlined</option>
        </select>
      </div>

      {/* Button Size */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Button Size</label>
        <select
          value={settings.buttonSize}
          onChange={(e) => setSettings({ ...settings, buttonSize: e.target.value })}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* Collection Header Style */}
      {settings.showFolderHeaders && (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Collection Header Style</label>
            <select
              value={settings.collectionHeaderStyle}
              onChange={(e) => setSettings({ ...settings, collectionHeaderStyle: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
            >
              <option value="bold">Bold</option>
              <option value="underline">Underlined</option>
              <option value="uppercase">Uppercase</option>
              <option value="accent">Accent Color</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.collectionDivider}
                onChange={(e) => setSettings({ ...settings, collectionDivider: e.target.checked })}
              />
              <span>Show Divider Line</span>
            </label>
          </div>
        </>
      )}
    </div>
  );

  const getBackgroundStyle = () => {
    if (settings.gradientEnabled && isPro) {
      return {
        background: `linear-gradient(${settings.gradientDirection}, ${settings.gradientColor1}, ${settings.gradientColor2})`
      };
    }
    return { background: settings.backgroundColor };
  };

  const getBorderRadiusValue = () => {
    const values = { none: '0', small: '4px', medium: '8px', large: '12px', xlarge: '16px' };
    return values[settings.borderRadius] || '8px';
  };

  const getCardShadowValue = () => {
    const values = {
      none: 'none',
      small: '0 1px 2px rgba(0,0,0,0.05)',
      medium: '0 4px 6px rgba(0,0,0,0.1)',
      large: '0 10px 15px rgba(0,0,0,0.1)',
      xlarge: '0 20px 25px rgba(0,0,0,0.15)'
    };
    return values[settings.cardShadow] || values.medium;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="editor" />

      {/* Top Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>🎨 Showcase Editor</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Customize your portfolio</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPreviewDevice(previewDevice === 'desktop' ? 'mobile' : 'desktop')}
              style={{
                padding: '0.75rem 1.25rem',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {previewDevice === 'desktop' ? '📱 Mobile' : '💻 Desktop'}
            </button>
            
            <button
              onClick={resetSettings}
              style={{
                padding: '0.75rem 1.25rem',
                background: '#fee2e2',
                color: '#991b1b',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔄 Reset
            </button>

            <button
              onClick={saveSettings}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              💾 Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem', maxWidth: '1800px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem' }}>
          
          {/* Settings Panel */}
          {renderSettingsPanel()}

          {/* Preview Panel */}
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
            <div style={{ marginBottom: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
              👁️ Live Preview ({previewDevice === 'desktop' ? 'Desktop' : 'Mobile'})
            </div>

            {/* Preview Container */}
            <div style={{
              ...getBackgroundStyle(),
              borderRadius: '12px',
              padding: '2rem',
              minHeight: '600px',
              maxWidth: previewDevice === 'mobile' ? '375px' : '100%',
              margin: '0 auto',
              fontFamily: settings.fontFamily,
              color: settings.textColor
            }}>
              {/* Profile Section */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: settings.profilePictureSize === 'small' ? '80px' : settings.profilePictureSize === 'medium' ? '100px' : settings.profilePictureSize === 'large' ? '120px' : '150px',
                  height: settings.profilePictureSize === 'small' ? '80px' : settings.profilePictureSize === 'medium' ? '100px' : settings.profilePictureSize === 'large' ? '120px' : '150px',
                  borderRadius: '50%',
                  background: '#e5e7eb',
                  margin: '0 auto 1rem',
                  border: settings.profilePictureBorder ? `4px solid ${settings.primaryColor}` : 'none'
                }} />
                
                <h1 style={{ 
                  fontSize: settings.headingSize === 'small' ? '1.5rem' : settings.headingSize === 'medium' ? '2rem' : settings.headingSize === 'large' ? '2.5rem' : '3rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {user?.display_name || 'Your Name'}
                </h1>
                
                <p style={{ fontSize: settings.bodySize === 'small' ? '0.875rem' : settings.bodySize === 'medium' ? '1rem' : '1.125rem', color: settings.secondaryTextColor }}>
                  @{username}
                </p>
              </div>

              {/* Video Grid */}
              {settings.showFolderHeaders && (
                <div style={{ 
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: settings.collectionDivider ? `2px solid ${settings.primaryColor}` : 'none'
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: settings.collectionHeaderStyle === 'bold' ? 'bold' : '600',
                    textDecoration: settings.collectionHeaderStyle === 'underline' ? 'underline' : 'none',
                    textTransform: settings.collectionHeaderStyle === 'uppercase' ? 'uppercase' : 'none',
                    color: settings.collectionHeaderStyle === 'accent' ? settings.primaryColor : settings.textColor
                  }}>
                    My Videos
                  </h2>
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: settings.layout === 'list' ? '1fr' : `repeat(${previewDevice === 'mobile' ? 1 : Math.min(settings.gridColumns, 3)}, 1fr)`,
                gap: settings.cardSpacing === 'tight' ? '0.75rem' : settings.cardSpacing === 'medium' ? '1.25rem' : settings.cardSpacing === 'relaxed' ? '2rem' : '2.5rem'
              }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: settings.cardBackgroundColor,
                      borderRadius: getBorderRadiusValue(),
                      overflow: 'hidden',
                      boxShadow: getCardShadowValue(),
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ 
                      width: '100%', 
                      height: '200px', 
                      background: '#e5e7eb' 
                    }} />
                    
                    <div style={{ padding: '1rem' }}>
                      {settings.showVerificationCodes && (
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontFamily: 'monospace', color: settings.primaryColor }}>
                          ABC123XYZ
                        </div>
                      )}
                      
                      {settings.showDescriptions && (
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          Video description goes here...
                        </p>
                      )}
                      
                      {settings.showTags && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.25rem 0.5rem', 
                            background: settings.primaryColor, 
                            color: '#fff', 
                            borderRadius: '4px' 
                          }}>
                            Rendr
                          </span>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.25rem 0.5rem', 
                            background: '#e5e7eb', 
                            color: '#374151', 
                            borderRadius: '4px' 
                          }}>
                            Truth
                          </span>
                        </div>
                      )}
                      
                      {settings.showDates && (
                        <div style={{ fontSize: '0.75rem', color: settings.secondaryTextColor }}>
                          Jan {i}, 2025
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ShowcaseEditor;
