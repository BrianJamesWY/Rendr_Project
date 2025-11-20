import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../components/Navigation';
import WatermarkSettings from '../components/WatermarkSettings';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'facebook', label: 'Facebook', icon: '👥' },
];

function ProfileSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [collectionLabel, setCollectionLabel] = useState('Collections');
  const [socialLinks, setSocialLinks] = useState([]); // Showcase links (public profiles)
  const [dashboardLinks, setDashboardLinks] = useState([]); // Dashboard links (logged-in accounts)
  const [customPlatforms, setCustomPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('rendr_token');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadProfile();
  }, [token]);

  const loadProfile = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setDisplayName(res.data.display_name || '');
      setBio(res.data.bio || '');
      
      // Get full profile with social links
      const profileRes = await axios.get(`${BACKEND_URL}/api/@/${res.data.username}`);
      setSocialLinks(profileRes.data.social_media_links || []);
      setDashboardLinks(res.data.dashboard_social_links || []);
      setCollectionLabel(profileRes.data.collection_label || 'Collections');
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${BACKEND_URL}/api/@/profile`,
        {
          display_name: displayName,
          bio: bio,
          social_media_links: socialLinks,
          dashboard_social_links: dashboardLinks,
          collection_label: collectionLabel
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.detail || 'Unknown error'));
    }
    setSaving(false);
  };

  const addSocialLink = (platform) => {
    if (socialLinks.find(link => link.platform === platform)) {
      alert('This platform is already added');
      return;
    }
    setSocialLinks([...socialLinks, { platform, url: '', custom_name: null }]);
  };

  const updateSocialLink = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const addDashboardLink = (platform) => {
    if (dashboardLinks.find(link => link.platform === platform)) {
      alert('This platform is already added');
      return;
    }
    setDashboardLinks([...dashboardLinks, { platform, url: '', custom_name: null }]);
  };

  const updateDashboardLink = (index, field, value) => {
    const updated = [...dashboardLinks];
    updated[index][field] = value;
    setDashboardLinks(updated);
  };

  const removeDashboardLink = (index) => {
    setDashboardLinks(dashboardLinks.filter((_, i) => i !== index));
  };

  const addCustomPlatform = () => {
    const name = prompt('Enter custom platform name:');
    if (!name) return;
    
    if (user?.premium_tier === 'free') {
      alert('Custom platforms are only available for Pro and Enterprise tiers');
      return;
    }
    
    setSocialLinks([...socialLinks, { 
      platform: name.toLowerCase().replace(/\s+/g, '_'), 
      url: '', 
      custom_name: name 
    }]);
  };

  const canEditCollectionLabel = user?.premium_tier === 'pro' || user?.premium_tier === 'enterprise';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="settings" />
      
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>
            Profile Settings
          </h1>
          <Link 
            to="/dashboard"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Basic Info */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Basic Information</h2>
          
          {/* Banner Image (Pro/Enterprise) */}
          {(user?.premium_tier === 'pro' || user?.premium_tier === 'enterprise') && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                🎨 Showcase Banner Image (Pro)
              </label>
              {user?.banner_image && (
                <img 
                  src={`${BACKEND_URL}${user.banner_image}`}
                  alt="Banner"
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
                />
              )}
              <input
                type="file"
                accept="image/*"
                id="banner-upload"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      const res = await axios.post(`${BACKEND_URL}/api/@/upload-banner`, formData, {
                        headers: { 
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'multipart/form-data'
                        }
                      });
                      alert('✅ Banner image updated!');
                      loadProfile();
                    } catch (err) {
                      alert('❌ Failed to upload: ' + (err.response?.data?.detail || 'Unknown error'));
                    }
                  }
                }}
              />
              <label 
                htmlFor="banner-upload"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: '#0ea5e9',
                  color: 'white',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Upload Banner
              </label>
              <p style={{ fontSize: '0.75rem', color: '#0c4a6e', marginTop: '0.5rem' }}>
                Recommended: Wide image, at least 1200x300px. Displays behind your profile on showcase page.
              </p>
            </div>
          )}

          {/* Profile Picture */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Profile Picture</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {user?.profile_picture && (
                <img 
                  src={`${BACKEND_URL}${user.profile_picture}`}
                  alt="Profile"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="profile-pic-upload"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const res = await axios.post(`${BACKEND_URL}/api/@/upload-profile-picture`, formData, {
                          headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                          }
                        });
                        alert('✅ Profile picture updated!');
                        loadProfile();
                      } catch (err) {
                        alert('❌ Failed to upload: ' + (err.response?.data?.detail || 'Unknown error'));
                      }
                    }
                  }}
                />
                <label 
                  htmlFor="profile-pic-upload"
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: '#667eea',
                    color: 'white',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Upload Picture
                </label>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Recommended: Square image, at least 400x400px
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
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
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
              placeholder="Tell visitors about yourself..."
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              Collection Label
              {!canEditCollectionLabel && (
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#9ca3af', marginLeft: '0.5rem' }}>
                  (Pro/Enterprise only)
                </span>
              )}
            </label>
            <input
              type="text"
              value={collectionLabel}
              onChange={(e) => setCollectionLabel(e.target.value)}
              disabled={!canEditCollectionLabel}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                background: canEditCollectionLabel ? 'white' : '#f9fafb',
                cursor: canEditCollectionLabel ? 'text' : 'not-allowed'
              }}
              placeholder="Collections, Stories, Topics, etc."
            />
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Customize how your video groups are labeled on your showcase page
            </p>
          </div>
        </div>

        {/* Dashboard Social Media Links (Logged-in accounts) */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>🔗 Dashboard Social Media Links</h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Links to your logged-in social media accounts (only visible to you on dashboard)
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addDashboardLink(e.target.value);
                  e.target.value = '';
                }
              }}
              style={{
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              <option value="">+ Add Platform</option>
              {SOCIAL_PLATFORMS.map(p => (
                <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
              ))}
            </select>
          </div>

          {dashboardLinks.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
              No dashboard links added yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dashboardLinks.map((link, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                  <div style={{ flex: '0 0 150px' }}>
                    <input
                      type="text"
                      value={link.platform}
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        background: '#e5e7eb',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateDashboardLink(index, 'url', e.target.value)}
                      placeholder="https://instagram.com/accounts/login"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeDashboardLink(index)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Showcase Social Media Links (Public profiles) */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>👥 Showcase Social Media Links</h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            Public links to your social media profiles (visible to visitors on your showcase page)
          </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addSocialLink(e.target.value);
                    e.target.value = '';
                  }
                }}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">+ Add Platform</option>
                {SOCIAL_PLATFORMS.map(p => (
                  <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
                ))}
              </select>
              {(user?.premium_tier === 'pro' || user?.premium_tier === 'enterprise') && (
                <button
                  onClick={addCustomPlatform}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + Custom
                </button>
              )}
            </div>

          {socialLinks.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
              No social media links added yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {socialLinks.map((link, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                  <div style={{ flex: '0 0 150px' }}>
                    <input
                      type="text"
                      value={link.custom_name || link.platform}
                      disabled={!link.custom_name}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        background: link.custom_name ? 'white' : '#e5e7eb',
                        fontWeight: '600'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      placeholder="https://instagram.com/yourusername"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeSocialLink(index)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: '#fee2e2',
                      color: '#991b1b',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Watermark Settings */}
        <WatermarkSettings user={user} onUpdate={loadProfile} />

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={saveProfile}
            disabled={saving}
            style={{
              padding: '0.75rem 1.5rem',
              background: saving ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
