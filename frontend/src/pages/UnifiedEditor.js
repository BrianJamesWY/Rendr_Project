import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import DirectoryTree from '../components/DirectoryTree';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function UnifiedEditor() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [devicePreview, setDevicePreview] = useState('desktop');
  const [loading, setLoading] = useState(true);
  
  // File upload refs
  const profilePicRef = useRef(null);
  const bannerRef = useRef(null);
  const bgImageRef = useRef(null);
  
  // Profile & Banner state
  const [profilePic, setProfilePic] = useState('');
  const [profileShape, setProfileShape] = useState('circle');
  const [profileEffect, setProfileEffect] = useState('none');
  const [profileBorder, setProfileBorder] = useState('0');
  const [borderColor, setBorderColor] = useState('#667eea');
  const [bannerImage, setBannerImage] = useState('');
  const [socialLinks, setSocialLinks] = useState([
    { platform: 'Twitter', url: '', icon: '🐦' },
    { platform: 'Instagram', url: '', icon: '📷' },
    { platform: 'YouTube', url: '', icon: '📺' },
    { platform: 'TikTok', url: '', icon: '🎵' }
  ]);
  const [bioText, setBioText] = useState('');

  // Load existing profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const username = localStorage.getItem('rendr_username');
      console.log('[EDITOR] Checking username:', username);
      
      if (!username) {
        console.error('[EDITOR] No username in localStorage');
        setLoading(false);
        return;
      }
      
      console.log('[EDITOR] Fetching profile for:', username);
      const response = await axios.get(`${BACKEND_URL}/api/@/${username}`);
      const profile = response.data;
      
      console.log('[EDITOR] Loaded profile data:', profile);
      console.log('[EDITOR] Profile shape from API:', profile.profile_shape);
      
      // Load existing data
      if (profile.profile_picture) {
        console.log('[EDITOR] Setting profile pic:', profile.profile_picture);
        setProfilePic(profile.profile_picture);
      }
      if (profile.banner_image) {
        console.log('[EDITOR] Setting banner:', profile.banner_image);
        setBannerImage(profile.banner_image);
      }
      if (profile.profile_shape) {
        console.log('[EDITOR] Setting shape to:', profile.profile_shape);
        setProfileShape(profile.profile_shape);
      }
      if (profile.profile_effect) setProfileEffect(profile.profile_effect);
      if (profile.profile_border) setProfileBorder(profile.profile_border);
      if (profile.border_color) setBorderColor(profile.border_color);
      if (profile.bio) setBioText(profile.bio);
      if (profile.social_media_links && profile.social_media_links.length > 0) {
        setSocialLinks(profile.social_media_links);
      }
      
      console.log('[EDITOR] All data loaded, profileShape state is now:', profile.profile_shape);
      setLoading(false);
    } catch (err) {
      console.error('[EDITOR] Error loading profile:', err);
      setLoading(false);
    }
  };

  // Page Design state
  const [selectedPage, setSelectedPage] = useState('showcase');
  const [selectedLayout, setSelectedLayout] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [bgType, setBgType] = useState('gradient');
  const [bgImage, setBgImage] = useState('');
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [primaryColor, setPrimaryColor] = useState('#667eea');
  const [secondaryColor, setSecondaryColor] = useState('#764ba2');

  // Folders & Content state
  const [selectedTreeItem, setSelectedTreeItem] = useState(null);
  const [contentName, setContentName] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [accessLevel, setAccessLevel] = useState('Public (Free)');

  // Premium Pricing state
  const [tiers, setTiers] = useState([
    { name: 'Basic Tier', price: '4.99', description: 'Access to basic content library, new videos weekly' },
    { name: 'Standard Tier', price: '9.99', description: 'All basic content + exclusive videos + early access + Discord community' },
    { name: 'Premium Tier', price: '19.99', description: 'Everything + personal interaction + custom content requests + monthly live streams' }
  ]);

  // Store state
  const [products, setProducts] = useState([
    { name: 'T-Shirt', price: '24.99', icon: '👕' },
    { name: 'Cap', price: '19.99', icon: '🧢' },
    { name: 'Mug', price: '14.99', icon: '☕' }
  ]);

  // Bounty state
  const [bountyActive, setBountyActive] = useState(true);
  const [bountyAmount, setBountyAmount] = useState(50);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile & Banner', emoji: '👤' },
    { id: 'design', label: 'Page Design', emoji: '🎨' },
    { id: 'folders', label: 'Folders & Content', emoji: '📁' },
    { id: 'premium', label: 'Premium Pricing', emoji: '💎' },
    { id: 'store', label: 'Store Management', emoji: '🛍️' },
    { id: 'bounty', label: 'Bounty System', emoji: '🎯' }
  ];

  const layouts = [
    { id: 0, preview: 'grid-4' },
    { id: 1, preview: 'sidebar-left' },
    { id: 2, preview: 'sidebar-right' },
    { id: 3, preview: 'split' },
    { id: 4, preview: 'grid-3' },
    { id: 5, preview: 'featured' },
    { id: 6, preview: 'hero' },
    { id: 7, preview: 'masonry' }
  ];

  const templates = [
    { id: 'modern', name: 'Modern', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { id: 'dark', name: 'Dark', gradient: '#1f2937' },
    { id: 'light', name: 'Light', gradient: '#f9fafb' },
    { id: 'vibrant', name: 'Vibrant', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' }
  ];

  const patterns = [
    { id: 0, style: 'repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 10px, white 10px, white 20px)' },
    { id: 1, style: 'radial-gradient(circle, #e5e7eb 20%, transparent 20%)' },
    { id: 2, style: 'repeating-linear-gradient(0deg, #f3f4f6, #f3f4f6 1px, white 1px, white 10px)' },
    { id: 3, style: 'conic-gradient(from 45deg, #f3f4f6, white, #f3f4f6)' }
  ];

  const handleFileUpload = (ref) => {
    ref.current?.click();
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`${BACKEND_URL}/api/users/profile`, {
        profile_picture: profilePic,
        profile_shape: profileShape,
        profile_effect: profileEffect,
        profile_border: profileBorder,
        border_color: borderColor,
        banner_image: bannerImage,
        social_media_links: socialLinks,
        bio: bioText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Profile saved successfully! Check your showcase page.');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert(`Error: ${err.response?.data?.detail || 'Failed to save profile'}`);
    }
  };

  const getProfileShapeStyle = () => {
    const baseStyle = {
      width: '100px',
      height: '100px',
      backgroundImage: profilePic ? `url(${profilePic})` : 'none',
      backgroundColor: profilePic ? 'transparent' : '#f3f4f6',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      margin: '-50px auto 20px auto',
      border: `${profileBorder}px solid ${borderColor}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    const effectStyle = getProfileEffectClass();

    switch(profileShape) {
      case 'circle':
        return { ...baseStyle, ...effectStyle, borderRadius: '50%' };
      case 'square':
        return { ...baseStyle, ...effectStyle, borderRadius: '0' };
      case 'rounded':
        return { ...baseStyle, ...effectStyle, borderRadius: '12px' };
      case 'hexagon':
        return { ...baseStyle, ...effectStyle, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' };
      case 'diamond':
        return { 
          ...baseStyle, 
          ...effectStyle, 
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          transform: 'none'
        };
      default:
        return { ...baseStyle, ...effectStyle, borderRadius: '50%' };
    }
  };

  const getProfileEffectClass = () => {
    switch(profileEffect) {
      case 'shadow-sm':
        return { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
      case 'shadow-lg':
        return { boxShadow: '0 10px 25px rgba(0,0,0,0.3)' };
      case 'glow':
        return { boxShadow: `0 0 20px ${borderColor}` };
      default:
        return {};
    }
  };

  const getBackgroundStyle = () => {
    switch(bgType) {
      case 'solid':
        return { background: primaryColor };
      case 'gradient':
        return { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` };
      case 'image':
        return { 
          backgroundImage: bgImage ? `url(${bgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      case 'pattern':
        return { background: patterns[selectedPattern]?.style };
      default:
        return { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="editor" />
      
      {/* Hidden file inputs */}
      <input type="file" ref={profilePicRef} onChange={handleProfilePicChange} accept="image/*" style={{ display: 'none' }} />
      <input type="file" ref={bannerRef} onChange={handleBannerChange} accept="image/*" style={{ display: 'none' }} />
      <input type="file" ref={bgImageRef} onChange={handleBgImageChange} accept="image/*" style={{ display: 'none' }} />
      
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '2rem 0', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              background: 'white', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              ✨
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>
                RENDR Editor
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
                Complete Content Management System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: 'white', borderBottom: '2px solid #e5e7eb' }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 2rem',
          display: 'flex', 
          gap: '0.5rem',
          overflowX: 'auto'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
                color: activeTab === tab.id ? '#667eea' : '#6b7280',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                fontSize: '0.875rem'
              }}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '450px 1fr', gap: '2rem' }}>
        
        {/* Left Panel */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxHeight: '85vh', overflowY: 'auto' }}>
          
          {/* Profile & Banner Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                Profile & Banner Settings
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Customize your profile picture and banner image
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Profile Picture
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleFileUpload(profilePicRef)}
                    style={{
                      width: '60px',
                      height: '60px',
                      background: profilePic ? `url(${profilePic})` : '#f3f4f6',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      border: '2px dashed #d1d5db',
                      cursor: 'pointer'
                    }}>
                    {!profilePic && '👤'}
                  </button>
                  <input 
                    type="url" 
                    value={profilePic}
                    onChange={(e) => setProfilePic(e.target.value)}
                    placeholder="Or paste image URL"
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Shape</label>
                <select value={profileShape} onChange={(e) => setProfileShape(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  <option value="circle">Circle</option>
                  <option value="square">Square</option>
                  <option value="rounded">Rounded Square</option>
                  <option value="hexagon">Hexagon</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Effects</label>
                <select value={profileEffect} onChange={(e) => setProfileEffect(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  <option value="none">None</option>
                  <option value="shadow-sm">Small Shadow</option>
                  <option value="shadow-lg">Large Shadow</option>
                  <option value="glow">Glow Effect</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Border</label>
                <select value={profileBorder} onChange={(e) => setProfileBorder(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  <option value="0">No Border</option>
                  <option value="2">Thin (2px)</option>
                  <option value="4">Medium (4px)</option>
                  <option value="6">Thick (6px)</option>
                  <option value="8">Extra Thick (8px)</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Color:</label>
                  <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} style={{ width: '50px', height: '40px', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer' }} />
                  <input type="text" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem', fontSize: '0.875rem' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Banner Image</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button onClick={() => handleFileUpload(bannerRef)} style={{ width: '60px', height: '60px', background: bannerImage ? `url(${bannerImage})` : '#f3f4f6', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '2px dashed #d1d5db', cursor: 'pointer' }}>
                    {!bannerImage && '🖼️'}
                  </button>
                  <input type="url" value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} placeholder="Or paste image URL" style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Social Media Links</label>
                {socialLinks.map((link, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <input type="url" value={link.url} onChange={(e) => { const newLinks = [...socialLinks]; newLinks[index].url = e.target.value; setSocialLinks(newLinks); }} placeholder={`${link.platform} URL`} style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
                    <div style={{ width: '45px', height: '45px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', border: '1px solid #e5e7eb' }}>{link.icon}</div>
                  </div>
                ))}
                <button onClick={() => setSocialLinks([...socialLinks, { platform: 'Custom', url: '', icon: '🔗' }])} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>+ Add Another Social Link</button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Bio Text</label>
                <textarea rows="4" value={bioText} onChange={(e) => setBioText(e.target.value)} placeholder="Tell your audience about yourself..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'inherit' }} />
              </div>

              <button onClick={handleSaveProfile} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>💾 Save Changes</button>
            </div>
          )}

          {/* Page Design Tab */}
          {activeTab === 'design' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>Page Design & Layout</h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>Customize layout, colors, and visual effects</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Select Page to Edit</label>
                <select value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  <option value="showcase">Showcase Page</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="premium">Premium Content</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Page Layout</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {layouts.map((layout, idx) => (
                    <div key={idx} onClick={() => setSelectedLayout(idx)} style={{ aspectRatio: '1', border: selectedLayout === idx ? '2px solid #667eea' : '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer', padding: '0.25rem', background: 'white' }}>
                      <div style={{ width: '100%', height: '100%', background: '#f3f4f6', borderRadius: '0.25rem' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Quick Templates</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {templates.map(template => (
                    <div key={template.id} onClick={() => { setSelectedTemplate(template.id); if (template.id === 'modern') { setPrimaryColor('#667eea'); setSecondaryColor('#764ba2'); } }} style={{ cursor: 'pointer', borderRadius: '0.5rem', overflow: 'hidden', border: selectedTemplate === template.id ? '2px solid #667eea' : '1px solid #e5e7eb' }}>
                      <div style={{ height: '60px', background: template.gradient }} />
                      <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500' }}>{template.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Background Type</label>
                <select value={bgType} onChange={(e) => setBgType(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  <option value="solid">Solid Color</option>
                  <option value="gradient">Gradient</option>
                  <option value="image">Image</option>
                  <option value="pattern">Pattern</option>
                </select>
              </div>

              {bgType === 'solid' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Solid Color</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: '50px', height: '50px', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer' }} />
                    <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
                  </div>
                </div>
              )}

              {bgType === 'gradient' && (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Primary Color</label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: '50px', height: '50px', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer' }} />
                      <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Secondary Color</label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ width: '50px', height: '50px', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer' }} />
                      <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
                    </div>
                  </div>
                </>
              )}

              {bgType === 'image' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Background Image</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button onClick={() => handleFileUpload(bgImageRef)} style={{ width: '60px', height: '60px', background: bgImage ? `url(${bgImage})` : '#f3f4f6', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '2px dashed #d1d5db', cursor: 'pointer' }}>
                      {!bgImage && '🖼️'}
                    </button>
                    <input type="url" value={bgImage} onChange={(e) => setBgImage(e.target.value)} placeholder="Or paste image URL" style={{ flex: 1, padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
                  </div>
                </div>
              )}

              {bgType === 'pattern' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Select Pattern</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {patterns.map((pattern, idx) => (
                      <div key={idx} onClick={() => setSelectedPattern(idx)} style={{ aspectRatio: '1', background: pattern.style, border: selectedPattern === idx ? '2px solid #667eea' : '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer', backgroundSize: '10px 10px' }} />
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => alert('Design saved!')} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>💾 Save Design</button>
            </div>
          )}

          {/* Folders Tab */}
          {activeTab === 'folders' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>Folders & Content</h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>Organize your videos and folders</p>
              
              {/* Directory Tree - No Folder Icons */}
              <div style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', background: '#fafafa' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }}>
                  Content Structure
                </label>
                <DirectoryTree
                  username={localStorage.getItem('rendr_username')}
                  selectedItemId={selectedTreeItem?.id}
                  onItemSelect={(item) => {
                    setSelectedTreeItem(item);
                    if (item) {
                      setContentName(item.name || item.title || '');
                      setContentDescription(item.description || '');
                      setAccessLevel(item.access_level || 'Public (Free)');
                    }
                  }}
                  onTreeUpdate={loadProfile}
                  containerHeight="300px"
                  showLayoutToggle={false}
                />
              </div>
              
              {/* Name Field (below tree) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Name
                </label>
                <input 
                  type="text" 
                  value={contentName}
                  onChange={(e) => setContentName(e.target.value)}
                  placeholder={selectedTreeItem ? "Enter name" : "Select an item from the tree above"}
                  disabled={!selectedTreeItem}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem', 
                    fontSize: '0.875rem',
                    background: selectedTreeItem ? 'white' : '#f9fafb',
                    cursor: selectedTreeItem ? 'text' : 'not-allowed'
                  }} 
                />
              </div>
              
              {/* Description Field (above name as per requirement) */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Description
                </label>
                <textarea 
                  value={contentDescription}
                  onChange={(e) => setContentDescription(e.target.value)}
                  placeholder={selectedTreeItem ? "Enter description" : "Select an item from the tree above"}
                  disabled={!selectedTreeItem}
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem', 
                    fontSize: '0.875rem',
                    background: selectedTreeItem ? 'white' : '#f9fafb',
                    cursor: selectedTreeItem ? 'text' : 'not-allowed',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }} 
                />
              </div>
              
              {/* Access Level Dropdown */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Access Level
                </label>
                <select 
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  disabled={!selectedTreeItem}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem', 
                    fontSize: '0.875rem',
                    background: selectedTreeItem ? 'white' : '#f9fafb',
                    cursor: selectedTreeItem ? 'pointer' : 'not-allowed'
                  }}
                >
                  <option>Public (Free)</option>
                  <option>Subscribers Only</option>
                  <option>Premium Tier 1 ($4.99)</option>
                  <option>Premium Tier 2 ($9.99)</option>
                  <option>Premium Tier 3 ($19.99)</option>
                </select>
              </div>
              
              {/* Save Button */}
              <button 
                onClick={async () => {
                  if (!selectedTreeItem) {
                    alert('Please select an item from the tree first');
                    return;
                  }
                  
                  try {
                    const token = localStorage.getItem('token');
                    const updateData = {
                      name: contentName,
                      description: contentDescription,
                      access_level: accessLevel
                    };
                    
                    const endpoint = selectedTreeItem.type === 'folder' 
                      ? `/api/folders/${selectedTreeItem.id}`
                      : `/api/videos/${selectedTreeItem.id}`;
                    
                    await axios.put(`${BACKEND_URL}${endpoint}`, updateData, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    alert('Changes saved successfully!');
                    loadProfile();
                  } catch (error) {
                    console.error('Save error:', error);
                    alert('Failed to save changes');
                  }
                }}
                disabled={!selectedTreeItem}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  background: selectedTreeItem ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#d1d5db',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.5rem', 
                  fontWeight: '600', 
                  cursor: selectedTreeItem ? 'pointer' : 'not-allowed', 
                  fontSize: '1rem'
                }}
              >
                💾 Save Changes
              </button>
            </div>
          )}

          {/* Premium Pricing Tab */}
          {activeTab === 'premium' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>Premium Content Pricing</h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>Set up subscription tiers and pricing</p>
              {tiers.map((tier, idx) => (
                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <input type="text" value={tier.name} onChange={(e) => { const newTiers = [...tiers]; newTiers[idx].name = e.target.value; setTiers(newTiers); }} style={{ flex: 1, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem', marginRight: '0.5rem' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>$</span>
                      <input type="number" value={tier.price} onChange={(e) => { const newTiers = [...tiers]; newTiers[idx].price = e.target.value; setTiers(newTiers); }} style={{ width: '80px', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }} />
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>/month</span>
                    </div>
                  </div>
                  <textarea rows="2" value={tier.description} onChange={(e) => { const newTiers = [...tiers]; newTiers[idx].description = e.target.value; setTiers(newTiers); }} placeholder="What's included..." style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem', fontSize: '0.875rem', fontFamily: 'inherit' }} />
                </div>
              ))}
              <button onClick={() => setTiers([...tiers, { name: 'New Tier', price: '0.00', description: '' }])} style={{ width: '100%', padding: '0.5rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem' }}>+ Add Another Tier</button>
              <button onClick={() => alert('Pricing saved!')} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>💾 Save Pricing</button>
            </div>
          )}

          {/* Store Management Tab */}
          {activeTab === 'store' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>Store Management</h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>Manage your merchandise and digital products</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {products.map((product, idx) => (
                  <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{product.icon}</div>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{product.name}</div>
                    <div style={{ color: '#667eea', fontWeight: 'bold' }}>${product.price}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Product Name</label>
                <input type="text" placeholder="Enter product name" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Price</label>
                <input type="number" placeholder="0.00" step="0.01" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Category</label>
                <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  <option>Apparel</option>
                  <option>Accessories</option>
                  <option>Digital Downloads</option>
                  <option>Prints</option>
                </select>
              </div>
              <button onClick={() => alert('Product saved!')} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>💾 Save Product</button>
            </div>
          )}

          {/* Bounty System Tab */}
          {activeTab === 'bounty' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>Bounty System</h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>Reward users who find your stolen content</p>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={bountyActive} onChange={(e) => setBountyActive(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: '600', fontSize: '1rem' }}>Bounty System Active</span>
                </label>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Reward Amount: ${bountyAmount}</label>
                <input type="range" min="5" max="500" value={bountyAmount} onChange={(e) => setBountyAmount(e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Amount paid per verified stolen content report</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Bounty Duration</label>
                <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  <option>24 hours</option>
                  <option>48 hours</option>
                  <option>1 week</option>
                  <option>2 weeks</option>
                  <option>1 month</option>
                  <option>Permanent</option>
                </select>
              </div>
              <button onClick={() => alert('Bounty settings saved!')} style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>💾 Save Settings</button>
            </div>
          )}
          
        </div>

        {/* Right Panel - Live Preview */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>Live Preview</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>See your changes in real-time</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
            {['desktop', 'tablet', 'mobile'].map(device => (
              <button key={device} onClick={() => setDevicePreview(device)} style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: devicePreview === device ? '3px solid #667eea' : '3px solid transparent', color: devicePreview === device ? '#667eea' : '#6b7280', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                {device === 'desktop' && '🖥️'} {device === 'tablet' && '📱'} {device === 'mobile' && '📲'} {device}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', background: '#f9fafb', borderRadius: '0.5rem', minHeight: '600px' }}>
            {/* Folders Tab - Show selected item preview */}
            {activeTab === 'folders' && selectedTreeItem ? (
              <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden', width: '100%', maxWidth: '600px', padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      background: selectedTreeItem.type === 'folder' ? '#667eea' : '#764ba2',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      {selectedTreeItem.type === 'folder' ? '📁' : '🎥'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>
                        {selectedTreeItem.type === 'folder' ? 'Folder Preview' : 'Video Preview'}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>
                        {contentName || selectedTreeItem.name || selectedTreeItem.title || 'Untitled'}
                      </div>
                    </div>
                  </div>
                  
                  {selectedTreeItem.type === 'video' && selectedTreeItem.thumbnail_path && (
                    <div style={{ 
                      width: '100%', 
                      height: '250px', 
                      background: `url(${BACKEND_URL}${selectedTreeItem.thumbnail_path}) center/cover`,
                      borderRadius: '8px',
                      marginBottom: '12px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {selectedTreeItem.verification_code || 'N/A'}
                      </div>
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        {selectedTreeItem.video_metadata?.duration ? `${Math.round(selectedTreeItem.video_metadata.duration)}s` : 'Video'}
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '6px' }}>Description</div>
                  <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                    {contentDescription || selectedTreeItem.description || 'No description provided.'}
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '6px' }}>Access Level</div>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '6px 12px', 
                    background: accessLevel === 'Public (Free)' ? '#e0f2fe' : '#fef3c7',
                    color: accessLevel === 'Public (Free)' ? '#0369a1' : '#92400e',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {accessLevel}
                  </div>
                </div>
                
                {selectedTreeItem.type === 'video' && (
                  <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>Video Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#999' }}>Resolution:</span>{' '}
                        <span style={{ fontWeight: '600' }}>{selectedTreeItem.video_metadata?.resolution || 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#999' }}>FPS:</span>{' '}
                        <span style={{ fontWeight: '600' }}>{selectedTreeItem.video_metadata?.fps || 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#999' }}>Format:</span>{' '}
                        <span style={{ fontWeight: '600' }}>MP4</span>
                      </div>
                      <div>
                        <span style={{ color: '#999' }}>Status:</span>{' '}
                        <span style={{ fontWeight: '600', color: '#10b981' }}>✓ Verified</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'folders' ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#999',
                fontSize: '16px'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📂</div>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>No Item Selected</div>
                <div style={{ fontSize: '14px', textAlign: 'center', maxWidth: '300px' }}>
                  Select a folder or video from the directory tree to see a live preview here
                </div>
              </div>
            ) : (
              /* Profile preview for other tabs */
              <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden', width: devicePreview === 'mobile' ? '375px' : devicePreview === 'tablet' ? '768px' : '100%', maxWidth: '100%' }}>
                <div style={{ height: '150px', ...getBackgroundStyle(), backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={getProfileShapeStyle()}>
                    {!profilePic && <span style={{ fontSize: '2rem' }}>👤</span>}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Your Name</h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>{bioText || 'Your bio text will appear here...'}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                    {socialLinks.filter(link => link.url).map((link, index) => (
                      <span key={index} style={{ fontSize: '24px' }}>{link.icon}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default UnifiedEditor;
