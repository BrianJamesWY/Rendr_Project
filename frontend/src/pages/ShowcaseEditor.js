import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function ShowcaseEditor() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Profile settings
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [showCreatorBadge, setShowCreatorBadge] = useState(true);
  
  // Header design
  const [bannerType, setBannerType] = useState('gradient');
  const [gradientStart, setGradientStart] = useState('#667eea');
  const [gradientEnd, setGradientEnd] = useState('#764ba2');
  const [bannerImage, setBannerImage] = useState('');
  
  // Social links
  const [socialLinks, setSocialLinks] = useState([
    { platform: 'YouTube', url: '', icon: '📹' },
    { platform: 'TikTok', url: '', icon: '🎵' },
    { platform: 'Instagram', url: '', icon: '📷' },
    { platform: 'Twitter', url: '', icon: '🐦' },
    { platform: 'LinkedIn', url: '', icon: '💼' }
  ]);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadEditorData();
  }, [token]);

  const loadEditorData = async () => {
    try {
      setLoading(true);
      const userRes = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(userRes.data);
      setDisplayName(userRes.data.display_name || '');
      setUsername(userRes.data.username || '');
      setBio(userRes.data.bio || '');
      
      // Load social links if available
      if (userRes.data.social_media_links) {
        const loadedLinks = userRes.data.social_media_links.map(link => ({
          platform: link.platform,
          url: link.url,
          icon: getPlatformIcon(link.platform)
        }));
        setSocialLinks(loadedLinks);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load editor data:', err);
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      'youtube': '📹',
      'tiktok': '🎵',
      'instagram': '📷',
      'twitter': '🐦',
      'linkedin': '💼',
      'facebook': '👥'
    };
    return icons[platform.toLowerCase()] || '🔗';
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  const handleSave = async () => {
    try {
      // Save showcase settings
      await axios.put(
        `${BACKEND_URL}/api/users/profile`,
        {
          display_name: displayName,
          bio: bio,
          social_media_links: socialLinks.filter(link => link.url)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setHasUnsavedChanges(false);
      alert('✅ Changes saved successfully!');
    } catch (err) {
      alert('❌ Failed to save changes: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleExit = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to exit?')) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'Custom', url: '', icon: '🔗' }]);
    setHasUnsavedChanges(true);
  };

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const updateSocialLink = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
    setHasUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>Loading editor...</div>
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif', background: '#f9fafb', color: '#1f2937', height: '100vh', overflow: 'hidden' }}>
      {/* Top Navigation */}
      <nav style={{ height: '60px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Logo size="medium" />
          <h1 style={{ fontSize: '20px', fontWeight: '700', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Showcase Editor
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={handleExit} style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', background: '#f3f4f6', color: '#1f2937' }}>
            ← Back to Dashboard
          </button>
          <button onClick={() => window.open(`/@${user?.username}`, '_blank')} style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', background: '#f3f4f6', color: '#1f2937' }}>
            👁️ Preview
          </button>
          <button onClick={handleSave} style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
            💾 Save Changes{hasUnsavedChanges ? '*' : ''}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)', marginTop: '60px' }}>
        {/* Editor Panel (Left) */}
        <div style={{ width: '420px', background: 'white', borderRight: '1px solid #e5e7eb', overflowY: 'auto', flexShrink: 0 }}>
          
          {/* Profile Information */}
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <div 
              onClick={() => toggleSection('profile')}
              style={{ padding: '16px 20px', background: activeSection === 'profile' ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))' : '#f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', transition: 'background 0.2s' }}
            >
              <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', borderRadius: '6px', fontSize: '12px' }}>👤</span>
                Profile Information
              </div>
              <span style={{ width: '20px', height: '20px', transition: 'transform 0.2s', transform: activeSection === 'profile' ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
            </div>
            {activeSection === 'profile' && (
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>Display Name</label>
                  <input 
                    type="text" 
                    value={displayName} 
                    onChange={(e) => { setDisplayName(e.target.value); setHasUnsavedChanges(true); }}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', transition: 'all 0.2s', background: 'white' }}
                    placeholder="Your name"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>Username</label>
                  <input 
                    type="text" 
                    value={username} 
                    disabled
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: '#f9fafb', color: '#6b7280' }}
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>rendr.io/@{username}</div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>Bio</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => { setBio(e.target.value); setHasUnsavedChanges(true); }}
                    rows={3}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Tell viewers about yourself..."
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>Show Creator Badge</span>
                    <input 
                      type=\"checkbox\" 
                      checked={showCreatorBadge} 
                      onChange={(e) => { setShowCreatorBadge(e.target.checked); setHasUnsavedChanges(true); }}
                      style={{ width: '48px', height: '24px' }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Header Design */}
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <div 
              onClick={() => toggleSection('header')}
              style={{ padding: '16px 20px', background: activeSection === 'header' ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))' : '#f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', borderRadius: '6px', fontSize: '12px' }}>🎨</span>
                Header Design
              </div>
              <span style={{ width: '20px', height: '20px', transition: 'transform 0.2s', transform: activeSection === 'header' ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
            </div>
            {activeSection === 'header' && (
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>Banner Background</label>
                  <select value={bannerType} onChange={(e) => { setBannerType(e.target.value); setHasUnsavedChanges(true); }} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', background: 'white' }}>
                    <option value="gradient">Gradient</option>
                    <option value="image">Custom Image</option>
                  </select>
                </div>

                {bannerType === 'gradient' && (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>Start Color</label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input 
                          type="color" 
                          value={gradientStart} 
                          onChange={(e) => { setGradientStart(e.target.value); setHasUnsavedChanges(true); }}
                          style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', padding: '4px' }}
                        />
                        <input 
                          type="text" 
                          value={gradientStart} 
                          onChange={(e) => { setGradientStart(e.target.value); setHasUnsavedChanges(true); }}
                          style={{ flex: 1, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>End Color</label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input 
                          type="color" 
                          value={gradientEnd} 
                          onChange={(e) => { setGradientEnd(e.target.value); setHasUnsavedChanges(true); }}
                          style={{ width: '48px', height: '48px', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', padding: '4px' }}
                        />
                        <input 
                          type="text" 
                          value={gradientEnd} 
                          onChange={(e) => { setGradientEnd(e.target.value); setHasUnsavedChanges(true); }}
                          style={{ flex: 1, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <div 
              onClick={() => toggleSection('social')}
              style={{ padding: '16px 20px', background: activeSection === 'social' ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))' : '#f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', borderRadius: '6px', fontSize: '12px' }}>🔗</span>
                Social Links
              </div>
              <span style={{ width: '20px', height: '20px', transition: 'transform 0.2s', transform: activeSection === 'social' ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
            </div>
            {activeSection === 'social' && (
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                  {socialLinks.map((link, index) => (
                    <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                      <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
                        {link.icon}
                      </span>
                      <input 
                        type="text" 
                        value={link.url} 
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        placeholder={`${link.platform} URL`}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                      />
                      <button onClick={() => removeSocialLink(index)} style={{ color: '#ef4444', cursor: 'pointer', padding: '4px', background: 'none', border: 'none', fontSize: '16px' }}>✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={addSocialLink} style={{ width: '100%', padding: '12px', border: '2px dashed #e5e7eb', borderRadius: '8px', background: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>+</span> Add Social Link
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Preview Panel (Right) */}
        <div style={{ flex: 1, background: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ height: '48px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '0 24px' }}>
            <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '4px', borderRadius: '8px' }}>
              <button onClick={() => setPreviewDevice('desktop')} style={{ padding: '6px 12px', background: previewDevice === 'desktop' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'none', border: 'none', color: previewDevice === 'desktop' ? 'white' : '#6b7280', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                💻 Desktop
              </button>
              <button onClick={() => setPreviewDevice('tablet')} style={{ padding: '6px 12px', background: previewDevice === 'tablet' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'none', border: 'none', color: previewDevice === 'tablet' ? 'white' : '#6b7280', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                📱 Tablet
              </button>
              <button onClick={() => setPreviewDevice('mobile')} style={{ padding: '6px 12px', background: previewDevice === 'mobile' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'none', border: 'none', color: previewDevice === 'mobile' ? 'white' : '#6b7280', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                📲 Mobile
              </button>
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', padding: '6px 12px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              rendr.io/@{username}
            </div>
          </div>
          <div style={{ height: 'calc(100% - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: '24px' }}>
            <div style={{ 
              width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%', 
              height: previewDevice === 'mobile' ? '667px' : previewDevice === 'tablet' ? '1024px' : '100%',
              maxHeight: '100%',
              background: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
              overflow: 'hidden', 
              transition: 'all 0.3s' 
            }}>
              <iframe 
                src={`/@${username}`} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Showcase Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowcaseEditor;
