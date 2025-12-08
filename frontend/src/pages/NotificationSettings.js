import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';
import Navigation from '../components/Navigation';

const BACKEND_URL = 'https://videoproof-1.preview.emergentagent.com';

function NotificationSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  
  // Notification settings
  const [notificationPreference, setNotificationPreference] = useState('email');
  const [phone, setPhone] = useState('');
  const [smsOptedIn, setSmsOptedIn] = useState(true);
  const [videoLengthThreshold, setVideoLengthThreshold] = useState(30);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadSettings();
  }, [token]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data;
      setUser(userData);
      
      // Set form values from user data
      setNotificationPreference(userData.notification_preference || 'email');
      setPhone(userData.phone || '');
      setSmsOptedIn(userData.sms_opted_in !== false);
      setVideoLengthThreshold(userData.notify_video_length_threshold || 30);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await axios.put(
        `${BACKEND_URL}/api/users/notification-settings`,
        {
          notification_preference: notificationPreference,
          phone: phone || null,
          sms_opted_in: smsOptedIn,
          notify_video_length_threshold: parseInt(videoLengthThreshold)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert('Notification settings saved successfully!');
      setSaving(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ color: '#6b7280' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '2rem 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          <Logo size="medium" />
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginTop: '1rem' }}>
            Notification Settings
          </h1>
          <p style={{ fontSize: '1rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Configure how and when you receive notifications
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          
          {/* Notification Method */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              📧 Notification Method
            </label>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
              Choose how you'd like to receive notifications when your videos finish processing
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['email', 'sms', 'both', 'none'].map((option) => (
                <label
                  key={option}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    border: notificationPreference === option ? '2px solid #667eea' : '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: notificationPreference === option ? '#f0f4ff' : 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (notificationPreference !== option) {
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (notificationPreference !== option) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="notification_preference"
                    value={option}
                    checked={notificationPreference === option}
                    onChange={(e) => setNotificationPreference(e.target.value)}
                    style={{ marginRight: '0.75rem', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>
                      {option === 'both' ? 'Email & SMS' : option === 'none' ? 'No Notifications' : option}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {option === 'email' && 'Receive notifications via email only'}
                      {option === 'sms' && 'Receive notifications via SMS only (requires phone number)'}
                      {option === 'both' && 'Receive notifications via both email and SMS'}
                      {option === 'none' && 'Don\'t send me any notifications'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Phone Number (show if SMS selected) */}
          {(notificationPreference === 'sms' || notificationPreference === 'both') && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                📱 Phone Number
              </label>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
                Enter your phone number in international format (e.g., +1234567890)
              </p>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace'
                }}
              />
              
              {/* SMS Opt-in */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '1rem',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={smsOptedIn}
                  onChange={(e) => setSmsOptedIn(e.target.checked)}
                  style={{ marginRight: '0.5rem', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  I consent to receive SMS notifications. Standard message rates may apply.
                </span>
              </label>
            </div>
          )}

          {/* Video Length Threshold */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              ⏱️ Notification Threshold
            </label>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
              Only notify me when videos longer than this duration (in seconds) finish processing
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={videoLengthThreshold}
                onChange={(e) => setVideoLengthThreshold(e.target.value)}
                style={{ flex: 1 }}
              />
              <div
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f3f4f6',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  color: '#111827',
                  minWidth: '80px',
                  textAlign: 'center'
                }}
              >
                {videoLengthThreshold}s
              </div>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              {videoLengthThreshold < 30 && 'Notify for all videos'}
              {videoLengthThreshold >= 30 && videoLengthThreshold < 60 && 'Notify for videos 30+ seconds'}
              {videoLengthThreshold >= 60 && videoLengthThreshold < 180 && 'Notify for videos 1+ minutes'}
              {videoLengthThreshold >= 180 && 'Notify for long videos only'}
            </div>
          </div>

          {/* Info Box */}
          <div
            style={{
              background: '#f0f9ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '2rem'
            }}
          >
            <div style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600', marginBottom: '0.5rem' }}>
              ℹ️ About Notifications
            </div>
            <ul style={{ fontSize: '0.75rem', color: '#1e3a8a', margin: 0, paddingLeft: '1.5rem' }}>
              <li>Video processing notifications are sent when upload is complete</li>
              <li>Expiration warnings are sent 2 hours before videos are deleted</li>
              <li>SMS notifications require a valid phone number and opt-in consent</li>
              <li style={{ color: '#dc2626', fontWeight: '600', marginTop: '0.5rem' }}>
                ⚠️ Note: SMS service is currently in mock mode (console logging only)
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: saving ? '#9ca3af' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = '#5568d3';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = '#667eea';
                }
              }}
            >
              {saving ? 'Saving...' : '💾 Save Settings'}
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Current Tier Info */}
        <div
          style={{
            marginTop: '1.5rem',
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            📊 Your Current Plan
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Tier</div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>
                {user?.premium_tier || 'Free'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Storage Duration</div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                {user?.premium_tier === 'enterprise' ? 'Unlimited' : user?.premium_tier === 'pro' ? '7 days' : '24 hours'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Notifications</div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
                {user?.premium_tier === 'enterprise' ? 'Email + SMS + Priority' : user?.premium_tier === 'pro' ? 'Email + SMS' : 'Email only'}
              </div>
            </div>
          </div>
          
          {user?.premium_tier === 'free' && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '0.5rem' }}>
              <a
                href="/pricing"
                style={{
                  fontSize: '0.75rem',
                  color: '#2563eb',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                💎 Upgrade to Pro or Enterprise for SMS notifications →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;
