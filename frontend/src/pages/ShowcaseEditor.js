// frontend/src/pages/ShowcaseEditor.js - YOUR EXACT LOGIC (Container only)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ShowcaseEditorUI from '../components/ShowcaseEditorUI.jsx';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// YOUR EXACT FONTS - preserved
const FREE_FONTS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Playfair Display', 'Merriweather', 'Nunito', 'PT Sans', 'Ubuntu', 'Oswald', 'Quicksand', 'Work Sans'];
const PRO_FONTS = ['Bebas Neue', 'Crimson Text', 'DM Sans', 'Fira Sans', 'IBM Plex Sans', 'Karla', 'Libre Baskerville', 'Manrope', 'Noto Sans', 'Source Sans Pro', 'Space Grotesk', 'Archivo', 'Bitter', 'Josefin Sans', 'Mukta', 'Cabin', 'Dosis', 'Exo', 'Hind', 'Inconsolata', 'Lobster', 'Pacifico', 'Righteous', 'Rubik', 'Titillium Web', 'Varela Round', 'Yanone Kaffeesatz', 'Zilla Slab', 'Asap', 'Barlow', 'Comfortaa', 'Dancing Script', 'EB Garamond', 'Fjalla One', 'Gothic A1', 'Heebo', 'Indie Flower', 'Jost', 'Kanit', 'Lexend', 'Libre Franklin', 'Nanum Gothic', 'Oxygen', 'Prompt', 'Questrial', 'Rajdhani', 'Saira', 'Tajawal', 'Urbanist', 'Vollkorn'];

function ShowcaseEditor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // YOUR EXACT STATE - 100% preserved
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [showcaseFolders, setShowcaseFolders] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoDescription, setVideoDescription] = useState('');
  const [videoExternalLink, setVideoExternalLink] = useState('');
  const [videoPlatform, setVideoPlatform] = useState('');
  const [videoTags, setVideoTags] = useState('Rendr');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  
  // YOUR EXACT SETTINGS - every single field preserved
  const [settings, setSettings] = useState({
    theme: 'modern', backgroundColor: '#ffffff', backgroundImage: null, backgroundImageOpacity: 100,
    gradientEnabled: false, gradientColor1: '#667eea', gradientColor2: '#764ba2', gradientDirection: 'to right',
    layout: 'grid', gridColumns: 3, cardSpacing: 'medium', showFeaturedSection: false, organizeByPlatform: true,
    showFolderLinks: false, folderLinkPosition: 'below', fontFamily: 'Inter', headingSize: 'large', bodySize: 'medium',
    customHeadingSize: null, customBodySize: null, lineHeight: 'normal', letterSpacing: 'normal',
    primaryColor: '#667eea', textColor: '#111827', secondaryTextColor: '#6b7280', buttonColor: '#667eea',
    buttonHoverColor: '#5568d3', cardBackgroundColor: '#ffffff', animationsEnabled: false, hoverEffect: 'none',
    cardShadow: 'medium', borderRadius: 'medium', showVerificationCodes: true, showDates: true, showDescriptions: true,
    showTags: true, showFolderHeaders: true, buttonStyle: 'rounded', buttonSize: 'medium', profilePictureSize: 'large',
    profilePictureBorder: true, collectionHeaderStyle: 'bold', collectionDivider: true, customSocialButtons: false,
    socialButtonStyle: 'default', socialButtonBackground: null
  });

  const token = localStorage.getItem('rendr_token');

  // YOUR EXACT useEffect + loadData - NO CHANGES
  useEffect(() => {
    if (!token) return navigate('/CreatorLogin');
    loadData();
  }, [token, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userRes, videosRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BACKEND_URL}/api/videos/user/list`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setUser(userRes.data);
      setVideos(videosRes.data.videos || []);
      
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
    setLoading(false);
  };

  // YOUR EXACT FUNCTIONS - IDENTICAL
  const openEditModal = useCallback((video) => {
    setEditingVideo(video);
    setVideoDescription(video.description || '');
    setVideoExternalLink(video.external_link || '');
    setVideoPlatform(video.platform || '');
    setVideoTags(video.tags ? video.tags.join(', ') : 'Rendr');
    setShowEditModal(true);
  }, []);

  const saveVideoMetadata = useCallback(async () => {
    try {
      const tagsArray = videoTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await axios.put(`${BACKEND_URL}/api/videos/${editingVideo.video_id}/metadata`, {
        description: videoDescription, external_link: videoExternalLink, platform: videoPlatform, tags: tagsArray
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowEditModal(false);
      loadData();
      alert('✅ Video updated successfully!');
    } catch (err) {
      alert('❌ Failed to update video');
    }
  }, [videoDescription, videoExternalLink, videoPlatform, videoTags, editingVideo, token]);

  const createShowcaseFolder = useCallback(async () => {
    if (!newFolderName.trim()) return alert('Please enter a folder name');
    try {
      await axios.post(`${BACKEND_URL}/api/showcase-folders`, {
        folder_name: newFolderName, description: newFolderDescription
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowCreateFolderModal(false);
      setNewFolderName(''); setNewFolderDescription('');
      loadData();
      alert('✅ Showcase folder created!');
    } catch (err) {
      alert('❌ Failed to create folder');
    }
  }, [newFolderName, newFolderDescription, token]);

  const saveSettings = useCallback(async () => {
    setSaving(true);
    try {
      await axios.put(`${BACKEND_URL}/api/@/profile`, { showcase_settings: settings }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Showcase settings saved!');
    } catch (err) {
      alert('❌ Failed to save settings');
    }
    setSaving(false);
  }, [settings, token]);

  // YOUR EXACT THEMES - preserved
  const themes = {
    modern: { name: 'Modern', backgroundColor: '#ffffff', textColor: '#111827', primaryColor: '#667eea', cardBackgroundColor: '#f9fafb' },
    minimal: { name: 'Minimal', backgroundColor: '#fafafa', textColor: '#1a1a1a', primaryColor: '#000000', cardBackgroundColor: '#ffffff' },
    bold: { name: 'Bold', backgroundColor: '#1a1a1a', textColor: '#ffffff', primaryColor: '#ff6b6b', cardBackgroundColor: '#2d2d2d' },
    creative: { name: 'Creative', backgroundColor: '#fff7ed', textColor: '#7c2d12', primaryColor: '#f97316', cardBackgroundColor: '#ffffff' },
    professional: { name: 'Professional', backgroundColor: '#f8fafc', textColor: '#1e293b', primaryColor: '#0f172a', cardBackgroundColor: '#ffffff' },
    ocean: { name: 'Ocean', backgroundColor: '#e0f2fe', textColor: '#0c4a6e', primaryColor: '#0284c7', cardBackgroundColor: '#ffffff' },
    sunset: { name: 'Sunset', backgroundColor: '#fef3c7', textColor: '#78350f', primaryColor: '#f59e0b', cardBackgroundColor: '#ffffff' },
    forest: { name: 'Forest', backgroundColor: '#d1fae5', textColor: '#065f46', primaryColor: '#10b981', cardBackgroundColor: '#ffffff' }
  };

  const isPro = user?.premium_tier === 'pro' || user?.premium_tier === 'enterprise';

  if (loading) return <ShowcaseEditorUI loading={true} />;

  return (
    <ShowcaseEditorUI
      user={user}
      videos={videos}
      folders={showcaseFolders}
      settings={settings}
      onUpdateSettings={setSettings}
      onSaveSettings={saveSettings}
      onOpenEditModal={openEditModal}
      editingVideo={editingVideo}
      videoDescription={videoDescription}
      videoExternalLink={videoExternalLink}
      videoPlatform={videoPlatform}
      videoTags={videoTags}
      onUpdateVideo={(key, value) => {
        if (key === 'description') setVideoDescription(value);
        if (key === 'externalLink') setVideoExternalLink(value);
        if (key === 'platform') setVideoPlatform(value);
        if (key === 'tags') setVideoTags(value);
      }}
      onSaveVideo={saveVideoMetadata}
      showEditModal={showEditModal}
      onCloseEditModal={() => setShowEditModal(false)}
      showCreateFolderModal={showCreateFolderModal}
      newFolderName={newFolderName}
      newFolderDescription={newFolderDescription}
      onUpdateFolder={(key, value) => {
        if (key === 'name') setNewFolderName(value);
        if (key === 'description') setNewFolderDescription(value);
      }}
      onCreateFolder={createShowcaseFolder}
      onCloseCreateFolder={() => setShowCreateFolderModal(false)}
      themes={themes}
      isPro={isPro}
      saving={saving}
      onRefresh={loadData}
      FREE_FONTS={FREE_FONTS}
      PRO_FONTS={PRO_FONTS}
    />
  );
}

export default ShowcaseEditor;
