import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Pathway() {
  const [authenticated, setAuthenticated] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [logs, setLogs] = useState({});
  const [collections, setCollections] = useState([]);
  const [impersonatedToken, setImpersonatedToken] = useState(null);
  
  // Database query
  const [dbCollection, setDbCollection] = useState('');
  const [dbQuery, setDbQuery] = useState('{}');
  const [dbResults, setDbResults] = useState(null);
  
  // Action states
  const [actionMessage, setActionMessage] = useState('');

  const getAuthPayload = useCallback(() => ({ key: localStorage.getItem('pw_key') || accessKey }), [accessKey]);

  const authenticate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${BACKEND_URL}/api/pw/auth`, { key: accessKey });
      if (res.data.status === 'authenticated') {
        setAuthenticated(true);
        localStorage.setItem('pw_key', accessKey);
        loadAllData();
      }
    } catch (err) {
      setError('Access denied');
    }
    setLoading(false);
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    const key = localStorage.getItem('pw_key') || accessKey;
    
    try {
      const [statsRes, usersRes, collectionsRes] = await Promise.all([
        axios.post(`${BACKEND_URL}/api/pw/stats/realtime`, { key }),
        axios.post(`${BACKEND_URL}/api/pw/users/list`, { key }),
        axios.post(`${BACKEND_URL}/api/pw/database/collections`, { key })
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setCollections(collectionsRes.data.collections || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  }, [accessKey]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/pw/videos/all`, getAuthPayload());
      setVideos(res.data.videos || []);
    } catch (err) {
      console.error('Failed to load videos:', err);
    }
    setLoading(false);
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/pw/logs/system`, { ...getAuthPayload(), lines: 200 });
      setLogs(res.data.logs || {});
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
    setLoading(false);
  };

  const impersonateUser = async (userId, username) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/pw/users/impersonate`, {
        ...getAuthPayload(),
        user_id: userId
      });
      setImpersonatedToken(res.data.token);
      setActionMessage(`Now impersonating ${username}. Token copied!`);
      navigator.clipboard.writeText(res.data.token);
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionMessage('Failed to impersonate user');
    }
  };

  const changeTier = async (userId, newTier) => {
    try {
      await axios.post(`${BACKEND_URL}/api/pw/users/tier`, {
        ...getAuthPayload(),
        user_id: userId,
        tier: newTier
      });
      setActionMessage(`Tier changed to ${newTier}`);
      loadAllData();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionMessage('Failed to change tier');
    }
  };

  const banUser = async (userId, action, duration = 7) => {
    try {
      await axios.post(`${BACKEND_URL}/api/pw/users/ban`, {
        ...getAuthPayload(),
        user_id: userId,
        action: action,
        duration_days: duration
      });
      setActionMessage(`User ${action === 'ban' ? 'permanently banned' : action === 'temp_ban' ? 'temporarily banned' : 'unbanned'}`);
      loadAllData();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionMessage('Failed to perform ban action');
    }
  };

  const runDatabaseQuery = async (collection = null) => {
    const targetCollection = collection || dbCollection;
    if (!targetCollection) {
      setDbResults({ error: 'Please select a collection' });
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/pw/database/query`, {
        ...getAuthPayload(),
        collection: targetCollection,
        query: JSON.parse(dbQuery),
        limit: 50
      });
      setDbResults(res.data);
    } catch (err) {
      setDbResults({ error: err.message });
    }
    setLoading(false);
  };

  const selectCollection = (collectionName) => {
    setDbCollection(collectionName);
    setDbQuery('{}');
    setActiveTab('database');
    // Auto-run query when selecting collection
    setTimeout(() => runDatabaseQuery(collectionName), 100);
  };

  const useImpersonatedToken = () => {
    if (impersonatedToken) {
      localStorage.setItem('token', impersonatedToken);
      window.open('/dashboard', '_blank');
    }
  };

  // Check for stored key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('pw_key');
    if (storedKey) {
      setAccessKey(storedKey);
      axios.post(`${BACKEND_URL}/api/pw/auth`, { key: storedKey })
        .then(res => {
          if (res.data.status === 'authenticated') {
            setAuthenticated(true);
            loadAllData();
          }
        })
        .catch(() => localStorage.removeItem('pw_key'));
    }
  }, [loadAllData]);

  // Login screen - disguised as 404
  if (!authenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0a0a0a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <div style={{ fontSize: '1.5rem', color: '#444', marginBottom: '0.5rem' }}>404</div>
          <div style={{ fontSize: '0.875rem', color: '#333', marginBottom: '2rem' }}>
            The page you're looking for doesn't exist.
          </div>
          <input
            type="password"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && authenticate()}
            placeholder=""
            style={{
              width: '200px',
              padding: '0.5rem',
              background: '#111',
              border: '1px solid #222',
              color: '#0f0',
              fontFamily: 'monospace',
              marginBottom: '1rem',
              outline: 'none',
              opacity: 0.3
            }}
            onFocus={(e) => e.target.style.opacity = 1}
            onBlur={(e) => e.target.style.opacity = accessKey ? 1 : 0.3}
          />
          {error && <div style={{ color: '#f00', fontSize: '0.75rem' }}>{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a0a 100%)', 
      color: '#0f0', 
      fontFamily: 'monospace',
      fontSize: '0.875rem'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'rgba(255,0,0,0.1)', 
        borderBottom: '2px solid #f00',
        padding: '1rem 2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.625rem', color: '#f00', marginBottom: '0.25rem' }}>
              PATHWAY ACTIVE - NO TRACE
            </div>
            <h1 style={{ fontSize: '1.5rem', color: '#0f0', margin: 0 }}>
              CONTROL CENTER
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {actionMessage && (
              <div style={{ color: '#0ff', padding: '0.5rem 1rem', background: 'rgba(0,255,255,0.1)', borderRadius: '4px' }}>
                {actionMessage}
              </div>
            )}
            <button
              onClick={() => { localStorage.removeItem('pw_key'); setAuthenticated(false); }}
              style={{ padding: '0.5rem 1rem', background: '#f00', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              EXIT
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          {['overview', 'users', 'videos', 'database', 'logs'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'videos') loadVideos();
                if (tab === 'logs') loadLogs();
              }}
              style={{
                padding: '0.5rem 1rem',
                background: activeTab === tab ? '#f00' : 'transparent',
                color: activeTab === tab ? '#000' : '#0f0',
                border: `1px solid ${activeTab === tab ? '#f00' : '#0f0'}`,
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1800px', margin: '0 auto' }}>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div>
            <h2 style={{ color: '#0f0', marginBottom: '1.5rem' }}>REAL-TIME STATS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <StatBox title="TOTAL USERS" value={stats.users?.total} sub={`Enterprise: ${stats.users?.enterprise} | Pro: ${stats.users?.pro}`} />
              <StatBox title="BANNED USERS" value={stats.users?.banned} color="#f00" />
              <StatBox title="TOTAL VIDEOS" value={stats.videos?.total} sub={`Premium: ${stats.videos?.premium}`} />
              <StatBox title="VERIFIED" value={stats.videos?.verified} sub={`C2PA: ${stats.videos?.with_c2pa}`} color="#0ff" />
              <StatBox title="SECURITY BLOCKS" value={stats.security?.duplicate_attempts} color="#ff0" />
              <StatBox title="ACTIVE BANS" value={(stats.security?.temp_bans || 0) + (stats.security?.perm_bans || 0)} color="#f00" />
            </div>
            
            {/* Quick Actions */}
            <h3 style={{ color: '#f00', marginTop: '2rem', marginBottom: '1rem' }}>QUICK ACTIONS</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <ActionButton onClick={loadAllData} label="REFRESH ALL" />
              <ActionButton onClick={() => setActiveTab('users')} label="MANAGE USERS" />
              <ActionButton onClick={() => { setActiveTab('videos'); loadVideos(); }} label="VIEW ALL VIDEOS" />
              <ActionButton onClick={() => { setActiveTab('logs'); loadLogs(); }} label="SYSTEM LOGS" />
            </div>

            {/* Collections Overview */}
            <h3 style={{ color: '#0f0', marginTop: '2rem', marginBottom: '1rem' }}>DATABASE COLLECTIONS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
              {collections.map(c => (
                <div 
                  key={c.name} 
                  style={{ 
                    padding: '0.75rem', 
                    background: 'rgba(0,255,0,0.05)', 
                    border: '1px solid #0f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => selectCollection(c.name)}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,255,0,0.2)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,255,0,0.05)'; }}
                >
                  <div style={{ fontWeight: 'bold' }}>{c.name}</div>
                  <div style={{ fontSize: '1.25rem', color: '#0ff' }}>{c.documents}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#0f0', margin: 0 }}>ALL USERS ({users.length})</h2>
              <ActionButton onClick={loadAllData} label="REFRESH" />
            </div>
            
            {impersonatedToken && (
              <div style={{ 
                background: 'rgba(255,0,255,0.2)', 
                border: '2px solid #f0f', 
                padding: '1rem', 
                marginBottom: '1rem',
                borderRadius: '4px'
              }}>
                <div style={{ color: '#f0f', fontWeight: 'bold', marginBottom: '0.5rem' }}>IMPERSONATION TOKEN READY</div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
                  {impersonatedToken.substring(0, 50)}...
                </div>
                <button 
                  onClick={useImpersonatedToken}
                  style={{ padding: '0.5rem 1rem', background: '#f0f', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  OPEN DASHBOARD AS USER
                </button>
              </div>
            )}
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #0f0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#0f0' }}>USERNAME</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#0f0' }}>EMAIL</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#0f0' }}>TIER</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#0f0' }}>ROLES</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#0f0' }}>VIDEOS</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#0f0' }}>STATUS</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#0f0' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id || user.user_id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '0.75rem', color: '#0ff' }}>{user.username}</td>
                      <td style={{ padding: '0.75rem', color: '#888' }}>{user.email}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <select 
                          value={user.premium_tier || user.tier || 'free'}
                          onChange={(e) => changeTier(user._id || user.user_id, e.target.value)}
                          style={{ 
                            background: '#111', 
                            color: user.premium_tier === 'enterprise' ? '#f0f' : user.premium_tier === 'pro' ? '#ff0' : '#0f0',
                            border: '1px solid #333',
                            padding: '0.25rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="free">FREE</option>
                          <option value="pro">PRO</option>
                          <option value="enterprise">ENTERPRISE</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#888' }}>
                        {(user.roles || []).join(', ') || 'creator'}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', color: '#0ff' }}>{user.video_count || 0}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {user.ban_status ? (
                          <span style={{ color: '#f00' }}>BANNED</span>
                        ) : (
                          <span style={{ color: '#0f0' }}>ACTIVE</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <MiniButton onClick={() => impersonateUser(user._id || user.user_id, user.username)} label="IMPERSONATE" title="Login as user" />
                          {user.ban_status ? (
                            <MiniButton onClick={() => banUser(user._id || user.user_id, 'unban')} label="UNBAN" title="Unban" color="#0f0" />
                          ) : (
                            <>
                              <MiniButton onClick={() => banUser(user._id || user.user_id, 'temp_ban', 7)} label="TEMP" title="Temp Ban" color="#ff0" />
                              <MiniButton onClick={() => banUser(user._id || user.user_id, 'ban')} label="PERM" title="Perm Ban" color="#f00" />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#0f0', margin: 0 }}>ALL VIDEOS ({videos.length}) - INCLUDING PREMIUM</h2>
              <ActionButton onClick={loadVideos} label="REFRESH" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {videos.map(video => (
                <div key={video.video_id || video._id} style={{ 
                  background: 'rgba(0,255,0,0.05)', 
                  border: `1px solid ${video.is_premium ? '#f0f' : '#0f0'}`,
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  {video.thumbnail_url && (
                    <img 
                      src={`${BACKEND_URL}${video.thumbnail_url}`} 
                      alt="" 
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold', color: '#0ff', marginBottom: '0.5rem' }}>
                      {video.title || 'Untitled'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>
                      Code: {video.verification_code}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>
                      Owner: {video.owner?.username || 'Unknown'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {video.is_premium && <span style={{ background: '#f0f', color: '#000', padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 'bold' }}>PREMIUM</span>}
                      <span style={{ background: '#0f0', color: '#000', padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 'bold' }}>{(video.owner?.tier || 'free').toUpperCase()}</span>
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <a 
                        href={`${BACKEND_URL}/api/videos/stream/${video.video_id || video._id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#0ff', textDecoration: 'none', fontSize: '0.75rem' }}
                      >
                        PLAY VIDEO (BYPASS ALL)
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div>
            <h2 style={{ color: '#0f0', marginBottom: '1.5rem' }}>DIRECT DATABASE ACCESS</h2>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={dbCollection}
                onChange={(e) => setDbCollection(e.target.value)}
                style={{ 
                  padding: '0.5rem', 
                  background: '#111', 
                  color: '#0f0', 
                  border: '1px solid #0f0',
                  minWidth: '200px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Collection</option>
                {collections.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.documents})</option>
                ))}
              </select>
              
              <input
                type="text"
                value={dbQuery}
                onChange={(e) => setDbQuery(e.target.value)}
                placeholder='Query JSON: {}'
                style={{ 
                  padding: '0.5rem', 
                  background: '#111', 
                  color: '#0f0', 
                  border: '1px solid #0f0',
                  flex: 1,
                  minWidth: '300px'
                }}
              />
              
              <ActionButton onClick={() => runDatabaseQuery()} label="EXECUTE QUERY" />
            </div>
            
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1rem' }}>
              Examples: {'{}'} (all) | {'{"username": "BrianJames"}'} | {'{"premium_tier": "enterprise"}'}
            </div>
            
            {dbResults && (
              <div style={{ background: '#111', border: '1px solid #333', padding: '1rem', borderRadius: '4px', overflow: 'auto', maxHeight: '600px' }}>
                {dbResults.error ? (
                  <div style={{ color: '#f00' }}>Error: {dbResults.error}</div>
                ) : (
                  <>
                    <div style={{ marginBottom: '0.5rem', color: '#0ff' }}>
                      Found {dbResults.total_matches} documents, showing {dbResults.returned}
                    </div>
                    <pre style={{ color: '#0f0', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(dbResults.results, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#0f0', margin: 0 }}>REAL-TIME SYSTEM LOGS</h2>
              <ActionButton onClick={loadLogs} label="REFRESH" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <LogPanel title="BACKEND OUTPUT" logs={logs.backend_out} />
              <LogPanel title="BACKEND ERRORS" logs={logs.backend_err} color="#f00" />
              <LogPanel title="FRONTEND OUTPUT" logs={logs.frontend_out} />
              <LogPanel title="FRONTEND ERRORS" logs={logs.frontend_err} color="#f00" />
            </div>
          </div>
        )}

        {loading && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#000', padding: '2rem', border: '2px solid #0f0', zIndex: 1000 }}>
            <div style={{ color: '#0f0' }}>LOADING...</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatBox({ title, value, sub, color = '#0f0' }) {
  return (
    <div style={{ 
      background: 'rgba(0,255,0,0.05)', 
      border: `2px solid ${color}`,
      padding: '1.5rem',
      borderRadius: '4px'
    }}>
      <div style={{ fontSize: '0.75rem', color, marginBottom: '0.5rem', fontWeight: 'bold' }}>{title}</div>
      <div style={{ fontSize: '2rem', color, fontWeight: 'bold' }}>{value ?? 0}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>{sub}</div>}
    </div>
  );
}

function ActionButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.75rem 1.5rem',
        background: 'transparent',
        color: '#0f0',
        border: '2px solid #0f0',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        transition: 'all 0.2s'
      }}
      onMouseOver={(e) => { e.target.style.background = '#0f0'; e.target.style.color = '#000'; }}
      onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#0f0'; }}
    >
      {label}
    </button>
  );
}

function MiniButton({ onClick, label, title, color = '#0ff' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: '0.25rem 0.5rem',
        background: 'transparent',
        color,
        border: `1px solid ${color}`,
        cursor: 'pointer',
        fontSize: '0.7rem',
        fontFamily: 'monospace'
      }}
    >
      {label}
    </button>
  );
}

function LogPanel({ title, logs, color = '#0f0' }) {
  return (
    <div style={{ 
      background: '#111', 
      border: `1px solid ${color}`,
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div style={{ background: 'rgba(0,255,0,0.1)', padding: '0.5rem 1rem', borderBottom: `1px solid ${color}` }}>
        <span style={{ color, fontWeight: 'bold' }}>{title}</span>
      </div>
      <div style={{ 
        padding: '1rem', 
        maxHeight: '300px', 
        overflow: 'auto',
        fontSize: '0.625rem',
        lineHeight: '1.4'
      }}>
        {(logs || []).map((line, i) => (
          <div key={i} style={{ color: line?.includes?.('error') || line?.includes?.('Error') ? '#f00' : '#888' }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pathway;
