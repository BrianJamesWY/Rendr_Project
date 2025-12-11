import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://verifyvideos.preview.emergentagent.com';

/**
 * Quota Indicator Component
 * Displays user's current video storage usage and limits
 */
const QuotaIndicator = ({ user }) => {
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuota();
  }, []);

  const loadQuota = async () => {
    try {
      const token = localStorage.getItem('rendr_token');
      const response = await axios.get(`${BACKEND_URL}/api/users/quota`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuota(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load quota:', error);
      setLoading(false);
    }
  };

  if (loading || !quota) {
    return null;
  }

  const { active_videos, video_limit, tier, storage_used_mb, storage_limit_gb } = quota;
  const isUnlimited = video_limit === -1;
  const percentUsed = isUnlimited ? 0 : (active_videos / video_limit) * 100;
  const isNearLimit = percentUsed >= 80;
  const isAtLimit = percentUsed >= 100;

  const getTierColor = () => {
    switch (tier) {
      case 'pro':
        return '#10b981';
      case 'enterprise':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getTierLabel = () => {
    switch (tier) {
      case 'pro':
        return 'Pro';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: isAtLimit ? '2px solid #ef4444' : isNearLimit ? '2px solid #f59e0b' : 'none'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Video Storage
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            {isUnlimited ? (
              <span>♾️ Unlimited</span>
            ) : (
              <span>
                {active_videos} / {video_limit}
              </span>
            )}
          </div>
        </div>
        
        {/* Tier Badge */}
        <div
          style={{
            background: getTierColor(),
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {getTierLabel()}
        </div>
      </div>

      {/* Progress Bar (only for non-unlimited) */}
      {!isUnlimited && (
        <div>
          <div
            style={{
              width: '100%',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '9999px',
              overflow: 'hidden',
              marginBottom: '0.5rem'
            }}
          >
            <div
              style={{
                width: `${Math.min(percentUsed, 100)}%`,
                height: '100%',
                background: isAtLimit
                  ? '#ef4444'
                  : isNearLimit
                  ? '#f59e0b'
                  : getTierColor(),
                transition: 'width 0.3s ease, background 0.3s ease'
              }}
            />
          </div>

          {/* Status Message */}
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {isAtLimit ? (
              <span style={{ color: '#ef4444', fontWeight: '600' }}>
                ⚠️ Quota reached. Delete old videos or upgrade.
              </span>
            ) : isNearLimit ? (
              <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                ⚠️ {video_limit - active_videos} videos remaining
              </span>
            ) : (
              <span>{video_limit - active_videos} videos remaining</span>
            )}
          </div>
        </div>
      )}

      {/* Upgrade CTA (only for free/pro) */}
      {tier !== 'enterprise' && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#f0f9ff',
            borderRadius: '0.5rem',
            border: '1px solid #bfdbfe'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.5rem' }}>
            💎 Want more storage?
          </div>
          <a
            href="/pricing"
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              color: '#2563eb',
              fontWeight: '600',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            {tier === 'free' ? 'Upgrade to Pro (100 videos) →' : 'Upgrade to Enterprise (unlimited) →'}
          </a>
        </div>
      )}

      {/* Storage Info */}
      {storage_used_mb !== undefined && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
          Storage used: {storage_used_mb.toFixed(2)} MB
          {storage_limit_gb && ` / ${storage_limit_gb} GB`}
        </div>
      )}
    </div>
  );
};

export default QuotaIndicator;
