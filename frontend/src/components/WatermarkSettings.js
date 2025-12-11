import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function WatermarkSettings({ user, onUpdate }) {
  const [position, setPosition] = useState('left');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('rendr_token');
  
  const tier = user?.premium_tier || 'free';
  
  const positions = {
    left: { label: 'Left Side', icon: '⬅️', available: ['free', 'pro', 'enterprise'] },
    right: { label: 'Right Side', icon: '➡️', available: ['pro', 'enterprise'] },
    top: { label: 'Top', icon: '⬆️', available: ['pro', 'enterprise'] },
    bottom: { label: 'Bottom', icon: '⬇️', available: ['pro', 'enterprise'] }
  };

  useEffect(() => {
    setPosition(user?.watermark_position || 'left');
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${BACKEND_URL}/api/@/watermark-settings`,
        null,
        { 
          params: { position },
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      alert('✅ Watermark position updated! New uploads will use this position.');
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update watermark');
    }
    setLoading(false);
  };

  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
        💧 Watermark Settings
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
        Your videos will include a vertical watermark with the Rendr logo and your username
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
          Watermark Position
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {Object.entries(positions).map(([key, pos]) => {
            const isAvailable = pos.available.includes(tier);
            const isSelected = position === key;
            
            return (
              <button
                key={key}
                onClick={() => isAvailable && setPosition(key)}
                disabled={!isAvailable || loading}
                style={{
                  padding: '1rem',
                  background: isSelected ? '#eff6ff' : '#f9fafb',
                  border: `2px solid ${isSelected ? '#667eea' : '#e5e7eb'}`,
                  borderRadius: '0.5rem',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  opacity: isAvailable ? 1 : 0.5,
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{pos.icon}</div>
                <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151' }}>
                  {pos.label}
                </div>
                {!isAvailable && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: '#fbbf24',
                    color: 'white',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.625rem',
                    fontWeight: '600'
                  }}>
                    PRO
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {tier === 'free' && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#1e40af' }}>
            💡 <strong>Upgrade to Pro</strong> to choose watermark position (right, top, or bottom)
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </button>

      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem' }}>
        Note: Watermark is applied during video upload. Already uploaded videos keep their original watermark.
      </p>
    </div>
  );
}

export default WatermarkSettings;
