import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const BACKEND_URL = 'https://rendr-video-trust.preview.emergentagent.com';

function UnifiedEditor() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [devicePreview, setDevicePreview] = useState('desktop');
  
  // File upload refs
  const profilePicRef = useRef(null);
  const bannerRef = useRef(null);
  const socialIconRefs = useRef([]);
  
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

  // Page Design state
  const [selectedPage, setSelectedPage] = useState('showcase');
  const [bgType, setBgType] = useState('gradient');
  const [primaryColor, setPrimaryColor] = useState('#667eea');
  const [secondaryColor, setSecondaryColor] = useState('#764ba2');

  const tabs = [
    { id: 'profile', label: 'Profile & Banner', emoji: '👤' },
    { id: 'design', label: 'Page Design', emoji: '🎨' },
    { id: 'folders', label: 'Folders & Content', emoji: '📁' },
    { id: 'premium', label: 'Premium Pricing', emoji: '💎' },
    { id: 'store', label: 'Store Management', emoji: '🛍️' },
    { id: 'bounty', label: 'Bounty System', emoji: '🎯' },
    { id: 'analytics', label: 'Analytics', emoji: '📊' }
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

  const handleSocialIconChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newLinks = [...socialLinks];
        newLinks[index].icon = '📷'; // Could show uploaded image here
        setSocialLinks(newLinks);
      };
      reader.readAsDataURL(file);
    }
  };

  const getProfileShapeStyle = () => {
    const baseStyle = {
      width: '100px',
      height: '100px',
      background: profilePic ? `url(${profilePic})` : '#f3f4f6',
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
        return { ...baseStyle, ...effectStyle, transform: 'rotate(45deg)' };
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

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="editor" />
      
      {/* Hidden file inputs */}
      <input type="file" ref={profilePicRef} onChange={handleProfilePicChange} accept="image/*" style={{ display: 'none' }} />
      <input type="file" ref={bannerRef} onChange={handleBannerChange} accept="image/*" style={{ display: 'none' }} />
      {socialLinks.map((_, index) => (
        <input 
          key={index}
          type="file" 
          ref={el => socialIconRefs.current[index] = el} 
          onChange={(e) => handleSocialIconChange(index, e)} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />
      ))}
      
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

              {/* Profile Picture */}
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
                      background: '#f3f4f6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      border: '2px dashed #d1d5db',
                      cursor: 'pointer'
                    }}>
                    👤
                  </button>
                  <input 
                    type="url" 
                    value={profilePic}
                    onChange={(e) => setProfilePic(e.target.value)}
                    placeholder="Or paste image URL here"
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

              {/* Shape */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Shape
                </label>
                <select 
                  value={profileShape}
                  onChange={(e) => setProfileShape(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                  <option value="circle">Circle</option>
                  <option value="square">Square</option>
                  <option value="rounded">Rounded Square</option>
                  <option value="hexagon">Hexagon</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>

              {/* Effects */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Effects
                </label>
                <select 
                  value={profileEffect}
                  onChange={(e) => setProfileEffect(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                  <option value="none">None</option>
                  <option value="shadow-sm">Small Shadow</option>
                  <option value="shadow-lg">Large Shadow</option>
                  <option value="glow">Glow Effect</option>
                </select>
              </div>

              {/* Border */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Border
                </label>
                <select 
                  value={profileBorder}
                  onChange={(e) => setProfileBorder(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    marginBottom: '0.75rem'
                  }}>
                  <option value="0">No Border</option>
                  <option value="2">Thin (2px)</option>
                  <option value="4">Medium (4px)</option>
                  <option value="6">Thick (6px)</option>
                  <option value="8">Extra Thick (8px)</option>
                </select>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Border Color:</label>
                  <input 
                    type="color" 
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    style={{
                      width: '50px',
                      height: '40px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  />
                  <input 
                    type="text" 
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {/* Banner Image */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Banner Image
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleFileUpload(bannerRef)}
                    style={{
                      width: '60px',
                      height: '60px',
                      background: '#f3f4f6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      border: '2px dashed #d1d5db',
                      cursor: 'pointer'
                    }}>
                    🖼️
                  </button>
                  <input 
                    type="url" 
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="Or paste image URL here"
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

              {/* Social Media Links */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Social Media Links
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {socialLinks.map((link, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="url" 
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...socialLinks];
                          newLinks[index].url = e.target.value;
                          setSocialLinks(newLinks);
                        }}
                        placeholder={`${link.platform} URL`}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem'
                        }}
                      />
                      <button
                        onClick={() => handleFileUpload(socialIconRefs.current[index])}
                        style={{
                          width: '45px',
                          height: '45px',
                          background: '#f3f4f6',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          border: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }}>
                        {link.icon}
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setSocialLinks([...socialLinks, { platform: 'Custom', url: '', icon: '🔗' }])}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 1rem',
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                  + Add Another Social Link
                </button>
              </div>

              {/* Bio */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Bio Text
                </label>
                <textarea 
                  rows="4"
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Tell your audience about yourself..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button 
                onClick={() => alert('Profile settings saved! (Backend integration pending)')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}>
                💾 Save Changes
              </button>
            </div>
          )}

          {/* Page Design Tab */}
          {activeTab === 'design' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                Page Design & Layout
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Customize layout, colors, and visual effects
              </p>

              {/* Page Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Select Page to Edit
                </label>
                <select 
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                  <option value="showcase">Showcase Page</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="premium">Premium Content</option>
                </select>
              </div>

              {/* Background Type */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Background Type
                </label>
                <select 
                  value={bgType}
                  onChange={(e) => setBgType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                  <option value="solid">Solid Color</option>
                  <option value="gradient">Gradient</option>
                  <option value="image">Image</option>
                  <option value="pattern">Pattern</option>
                </select>
              </div>

              {/* Primary Color */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Primary Color
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{
                      width: '50px',
                      height: '50px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  />
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
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

              {/* Secondary Color */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Secondary Color
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{
                      width: '50px',
                      height: '50px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  />
                  <input 
                    type="text" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
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

              <button 
                onClick={() => alert('Design settings saved!')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}>
                💾 Save Design
              </button>
            </div>
          )}

          {/* Other tabs - simplified for now */}
          {!['profile', 'design'].includes(activeTab) && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>{tabs.find(t => t.id === activeTab)?.emoji}</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <p style={{ fontSize: '0.875rem' }}>This section is under development</p>
              <p style={{ fontSize: '0.75rem', marginTop: '1rem' }}>Backend integration in progress</p>
            </div>
          )}
          
        </div>

        {/* Right Panel - Live Preview */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
              Live Preview
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              See your changes in real-time
            </p>
          </div>

          {/* Device Preview Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
            {['desktop', 'tablet', 'mobile'].map(device => (
              <button
                key={device}
                onClick={() => setDevicePreview(device)}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: devicePreview === device ? '3px solid #667eea' : '3px solid transparent',
                  color: devicePreview === device ? '#667eea' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textTransform: 'capitalize'
                }}
              >
                {device === 'desktop' && '🖥️'} {device === 'tablet' && '📱'} {device === 'mobile' && '📲'} {device}
              </button>
            ))}
          </div>

          {/* Preview Area */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            padding: '2rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            minHeight: '600px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              width: devicePreview === 'mobile' ? '375px' : devicePreview === 'tablet' ? '768px' : '100%',
              maxWidth: '100%'
            }}>
              {/* Banner */}
              <div style={{ 
                height: '150px', 
                background: bannerImage ? `url(${bannerImage})` : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              
              {/* Content */}
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                {/* Profile Picture */}
                <div style={getProfileShapeStyle()}>
                  {!profilePic && <span style={{ fontSize: '2rem' }}>👤</span>}
                </div>
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Your Name
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {bioText || 'Your bio text will appear here...'}
                </p>
                
                {/* Social Links */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                  {socialLinks.filter(link => link.url).map((link, index) => (
                    <span key={index} style={{ fontSize: '24px' }}>{link.icon}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UnifiedEditor;
