import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function SystemDiagnostics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('rendr_username');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadDiagnostics();
  }, [token]);

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      
      // Get full health check
      const healthRes = await axios.get(`${BACKEND_URL}/api/health/full`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHealthData(healthRes.data);
      
      // Get video diagnostics for current user
      if (username) {
        const videoRes = await axios.get(`${BACKEND_URL}/api/diagnostics/videos/${username}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setVideoData(videoRes.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Diagnostics load error:', err);
      setError(err.response?.data?.detail || 'Failed to load diagnostics');
      setLoading(false);
    }
  };

  const runSystemTest = async () => {
    try {
      setTestResults(null);
      const testRes = await axios.post(`${BACKEND_URL}/api/diagnostics/test-video-flow`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTestResults(testRes.data);
    } catch (err) {
      setError('Test failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>Loading diagnostics...</div>
      </div>
    );
  }

  if (error && !healthData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#991b1b', marginBottom: '1rem' }}>{error}</p>
          <button onClick={loadDiagnostics} style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', background: '#f9f9f9', color: '#030303', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <Logo size="medium" />
        </Link>
        <Link to="/dashboard" style={{ padding: '8px 16px', color: '#667eea', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
          ← Back to Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>System Diagnostics</h1>
        <p style={{ fontSize: '14px', color: '#606060', marginBottom: '32px' }}>Complete system health check and troubleshooting</p>

        {/* Overall Status */}
        <div style={{ 
          background: healthData?.status === 'healthy' ? '#d1fae5' : '#fee2e2', 
          border: `2px solid ${healthData?.status === 'healthy' ? '#10b981' : '#ef4444'}`,
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ fontSize: '48px' }}>{healthData?.status === 'healthy' ? '✅' : '⚠️'}</div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
              System Status: {healthData?.status?.toUpperCase() || 'UNKNOWN'}
            </h2>
            <p style={{ fontSize: '14px', color: '#606060' }}>Last checked: {new Date(healthData?.timestamp).toLocaleString()}</p>
          </div>
        </div>

        {/* Services Status */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e5e5' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Services Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {healthData?.services && Object.entries(healthData.services).map(([service, status]) => (
              <div key={service} style={{ padding: '16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{status === 'working' || status === 'connected' || status === 'available' ? '✅' : '❌'}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>{service}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#606060', fontFamily: 'monospace' }}>{status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Stats */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e5e5' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>System Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>
                {healthData?.stats?.total_users || 0}
              </div>
              <div style={{ fontSize: '13px', color: '#606060' }}>Total Users</div>
            </div>
            <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#15803d', marginBottom: '4px' }}>
                {healthData?.stats?.total_videos || 0}
              </div>
              <div style={{ fontSize: '13px', color: '#606060' }}>Total Videos</div>
            </div>
            <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde047' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#a16207', marginBottom: '4px' }}>
                {healthData?.stats?.total_folders || 0}
              </div>
              <div style={{ fontSize: '13px', color: '#606060' }}>Total Folders</div>
            </div>
          </div>
        </div>

        {/* System Resources */}
        {healthData?.system && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e5e5' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>System Resources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px' }}>Memory Usage:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '200px', height: '8px', background: '#e5e5e5', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${healthData.system.memory_used_percent}%`, 
                      height: '100%', 
                      background: healthData.system.memory_used_percent > 80 ? '#ef4444' : healthData.system.memory_used_percent > 60 ? '#f59e0b' : '#10b981',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '50px' }}>{healthData.system.memory_used_percent}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px' }}>Disk Usage:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '200px', height: '8px', background: '#e5e5e5', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${healthData.system.disk_used_percent}%`, 
                      height: '100%', 
                      background: healthData.system.disk_used_percent > 80 ? '#ef4444' : healthData.system.disk_used_percent > 60 ? '#f59e0b' : '#10b981',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '50px' }}>{healthData.system.disk_used_percent}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #e5e5e5' }}>
                <span style={{ fontSize: '14px' }}>Python Version:</span>
                <span style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'monospace' }}>{healthData.system.python_version}</span>
              </div>
            </div>
          </div>
        )}

        {/* Video Diagnostics */}
        {videoData && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e5e5e5' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Video Diagnostics for @{videoData.username}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{videoData.total_videos}</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>Total Videos</div>
              </div>
              <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{videoData.videos_on_showcase}</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>On Showcase</div>
              </div>
              <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{videoData.videos_with_issues}</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>With Issues</div>
              </div>
              <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{videoData.premium_tier}</div>
                <div style={{ fontSize: '12px', color: '#606060' }}>Tier</div>
              </div>
            </div>

            {videoData.all_issues && videoData.all_issues.length > 0 && videoData.all_issues[0] !== "No issues found" && (
              <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#991b1b' }}>Issues Found:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#991b1b' }}>
                  {videoData.all_issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #e5e5e5' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Code</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Title</th>
                    <th style={{ padding: '10px', textAlign: 'center', fontWeight: '600' }}>Showcase</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {videoData.video_analysis?.map((video, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px', color: '#667eea', fontWeight: '600' }}>
                        {video.verification_code || 'N/A'}
                      </td>
                      <td style={{ padding: '10px' }}>{video.title}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {video.on_showcase ? '✅' : '❌'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        {video.issues[0] === "No issues detected" ? (
                          <span style={{ color: '#10b981', fontWeight: '500' }}>✅ OK</span>
                        ) : (
                          <span style={{ color: '#ef4444', fontSize: '12px' }}>{video.issues.join(', ')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Test Video Flow */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e5e5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>System Tests</h3>
            <button 
              onClick={runSystemTest}
              style={{ 
                padding: '10px 20px', 
                background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >
              Run Tests
            </button>
          </div>

          {testResults && (
            <div style={{ padding: '16px', background: testResults.overall_status === 'pass' ? '#d1fae5' : '#fee2e2', borderRadius: '8px', border: `1px solid ${testResults.overall_status === 'pass' ? '#10b981' : '#ef4444'}` }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Overall: {testResults.overall_status === 'pass' ? '✅ PASS' : '❌ FAIL'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {Object.entries(testResults.test_results).map(([test, result]) => (
                  <div key={test} style={{ padding: '12px', background: 'white', borderRadius: '6px', fontSize: '13px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {result.status === 'pass' ? '✅' : '❌'} {test.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#606060', fontFamily: 'monospace' }}>
                      {JSON.stringify(result, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button 
            onClick={loadDiagnostics}
            style={{ 
              padding: '12px 32px', 
              background: 'white', 
              border: '2px solid #667eea', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#667eea', 
              cursor: 'pointer' 
            }}
          >
            🔄 Refresh Diagnostics
          </button>
        </div>
      </main>
    </div>
  );
}

export default SystemDiagnostics;
