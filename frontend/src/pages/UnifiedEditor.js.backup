import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

const BACKEND_URL = 'https://vidauth-app.preview.emergentagent.com';

function UnifiedEditor() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [devicePreview, setDevicePreview] = useState('desktop');

  const tabs = [
    { id: 'profile', label: '👤 Profile & Banner', emoji: '👤' },
    { id: 'design', label: '🎨 Page Design', emoji: '🎨' },
    { id: 'folders', label: '📁 Folders & Content', emoji: '📁' },
    { id: 'premium', label: '💎 Premium Pricing', emoji: '💎' },
    { id: 'store', label: '🛍️ Store Management', emoji: '🛍️' },
    { id: 'bounty', label: '🎯 Bounty System', emoji: '🎯' },
    { id: 'analytics', label: '📊 Analytics', emoji: '📊' }
  ];

  const getPreviewClass = () => {
    if (devicePreview === 'tablet') return 'max-w-[768px]';
    if (devicePreview === 'mobile') return 'max-w-[375px]';
    return 'w-full';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="editor" />
      
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '2rem 0', 
        marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
            ✨ RENDR Editor
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
            Complete Content Management System
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: 'white', borderBottom: '2px solid #e5e7eb', marginBottom: '2rem' }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 2rem',
          display: 'flex', 
          gap: '1rem',
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
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40% 1fr', gap: '2rem' }}>
          
          {/* Left Panel - Controls */}
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxHeight: '80vh', overflowY: 'auto' }}>
            
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
                  <input 
                    type="url" 
                    placeholder="Paste image URL here"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    API: POST /api/upload/profile-image
                  </p>
                </div>

                {/* Shape */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Shape
                  </label>
                  <select style={{
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

                {/* Banner Image */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Banner Image
                  </label>
                  <input 
                    type="url" 
                    placeholder="Paste image URL here"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Social Links */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Social Media Links
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['Twitter', 'Instagram', 'YouTube', 'TikTok'].map(platform => (
                      <div key={platform} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="url" 
                          placeholder={`${platform} URL`}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <button style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 1rem',
                    background: '#f3f4f6',
                    border: 'none',
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

                <button style={{
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
                  <select style={{
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
                  <select style={{
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
                  <input 
                    type="color" 
                    defaultValue="#667eea"
                    style={{
                      width: '100%',
                      height: '50px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Secondary Color */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Secondary Color
                  </label>
                  <input 
                    type="color" 
                    defaultValue="#764ba2"
                    style={{
                      width: '100%',
                      height: '50px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <button style={{
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

            {/* Folders & Content Tab */}
            {activeTab === 'folders' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                  Folder Management
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                  Organize your content into folders
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    📁 New Folder
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    🗑️ Delete
                  </button>
                </div>

                {/* Folder Tree */}
                <div style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem', 
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                    📁 All Videos
                  </div>
                  <div style={{ paddingLeft: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem', cursor: 'pointer' }}>🎬 Tutorials</div>
                    <div style={{ marginBottom: '0.5rem', cursor: 'pointer' }}>🎥 Behind Scenes</div>
                    <div style={{ marginBottom: '0.5rem', cursor: 'pointer' }}>💎 Premium Content</div>
                    <div style={{ marginBottom: '0.5rem', cursor: 'pointer' }}>📚 Courses</div>
                  </div>
                </div>

                {/* Folder Details */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Folder Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter folder name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Access Level
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <option>Public (Free)</option>
                    <option>Subscribers Only</option>
                    <option>Premium Tier 1 ($4.99)</option>
                    <option>Premium Tier 2 ($9.99)</option>
                    <option>Premium Tier 3 ($19.99)</option>
                  </select>
                </div>

                <button style={{
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
                  💾 Save Folder
                </button>
              </div>
            )}

            {/* Premium Pricing Tab */}
            {activeTab === 'premium' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                  Premium Content Pricing
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                  Set up subscription tiers and pricing
                </p>

                {/* Basic Tier */}
                <div style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem', 
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <input 
                      type="text" 
                      defaultValue="Basic Tier"
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        marginRight: '0.5rem'
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>$</span>
                      <input 
                        type="number" 
                        defaultValue="4.99"
                        style={{
                          width: '80px',
                          padding: '0.5rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem'
                        }}
                      />
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>/month</span>
                    </div>
                  </div>
                  <textarea 
                    rows="2"
                    placeholder="What's included..."
                    defaultValue="Access to basic content library"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem'
                }}>
                  + Add Another Tier
                </button>

                <button style={{
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
                  💾 Save Pricing
                </button>
              </div>
            )}

            {/* Store Management Tab */}
            {activeTab === 'store' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                  Store Management
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                  Manage your merchandise and digital products
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Product Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter product name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Price
                  </label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Category
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <option>Apparel</option>
                    <option>Accessories</option>
                    <option>Digital Downloads</option>
                    <option>Prints</option>
                  </select>
                </div>

                <button style={{
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
                  💾 Save Product
                </button>
              </div>
            )}

            {/* Bounty System Tab */}
            {activeTab === 'bounty' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                  Bounty System
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                  Reward users who find your stolen content
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Bounty Status
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="checkbox" id="bountyActive" defaultChecked />
                    <label htmlFor="bountyActive" style={{ fontWeight: '600', fontSize: '1rem' }}>
                      Bounty System Active
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Reward Amount: $50
                  </label>
                  <input 
                    type="range" 
                    min="5"
                    max="500"
                    defaultValue="50"
                    style={{
                      width: '100%'
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Amount paid per verified stolen content report
                  </p>
                </div>

                <button style={{
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
                  💾 Save Settings
                </button>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                  Analytics Dashboard
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.875rem' }}>
                  Track your content performance and revenue
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    background: '#f3f4f6', 
                    borderRadius: '0.5rem', 
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>24.8K</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Total Views</div>
                  </div>
                  <div style={{ 
                    background: '#f3f4f6', 
                    borderRadius: '0.5rem', 
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>892</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Subscribers</div>
                  </div>
                  <div style={{ 
                    background: '#f3f4f6', 
                    borderRadius: '0.5rem', 
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>$4,567</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Revenue</div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Panel - Preview */}
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
              minHeight: '500px'
            }}>
              <div className={getPreviewClass()} style={{
                background: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                width: '100%'
              }}>
                {/* Mock Preview Content */}
                <div style={{ height: '150px', background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    background: '#f3f4f6', 
                    borderRadius: '50%', 
                    margin: '-50px auto 1.5rem',
                    border: '4px solid white'
                  }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Your Name</h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Your bio text will appear here...</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '2rem' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        aspectRatio: '16/9',
                        background: '#f3f4f6',
                        borderRadius: '0.5rem'
                      }} />
                    ))}
                  </div>
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
