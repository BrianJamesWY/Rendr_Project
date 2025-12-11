import React from 'react';
import { Link } from 'react-router-dom';

const DashboardStats = ({ videos, folders, user, analytics }) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {/* Total Videos */}
        <div style={{ 
          background: 'white', 
          borderRadius: '0.75rem', 
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Total Videos
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
            {videos.length}
          </div>
        </div>
        
        {/* Folders */}
        <div style={{ 
          background: 'white', 
          borderRadius: '0.75rem', 
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Folders
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {folders.length}
          </div>
        </div>
        
        {/* Username */}
        <div style={{ 
          background: 'white', 
          borderRadius: '0.75rem', 
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Username
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
            @{user?.username}
          </div>
        </div>
        
        {/* Account Tier */}
        <Link 
          to="/plans"
          style={{
            display: 'block',
            background: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textDecoration: 'none',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Account Tier
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b', textTransform: 'capitalize' }}>
            {user?.premium_tier || 'Free'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667eea', marginTop: '0.5rem', fontWeight: '600' }}>
            View Plans →
          </div>
        </Link>

        {/* Showcase Editor */}
        <Link 
          to="/editor"
          style={{
            display: 'block',
            background: 'white', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            textDecoration: 'none',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Showcase Editor
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
            🎨
          </div>
          <div style={{ fontSize: '0.75rem', color: '#667eea', marginTop: '0.5rem', fontWeight: '600' }}>
            Customize →
          </div>
        </Link>
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
            📊 Analytics (Last 30 Days)
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Page Views</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{analytics.total_page_views}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Showcase visits</div>
            </div>

            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Video Views</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{analytics.total_video_views}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Individual videos</div>
            </div>

            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Social Clicks</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{analytics.social_link_clicks}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Links followed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
