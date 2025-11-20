import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../components/Logo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [interestedParties, setInterestedParties] = useState([]);
  const [bulkEmails, setBulkEmails] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats'); // stats, users, logs, interested, import
  const token = localStorage.getItem('rendr_token');

  useEffect(() => {
    if (!token) {
      navigate('/CreatorLogin');
      return;
    }
    loadAdminData();
  }, [token]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, usersRes, logsRes, interestedRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/ceo-access-b7k9m2x/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/ceo-access-b7k9m2x/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/ceo-access-b7k9m2x/logs?limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/ceo-access-b7k9m2x/interested-parties`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
      setInterestedParties(interestedRes.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied. CEO only.');
      } else {
        setError(err.response?.data?.detail || 'Failed to load admin data');
      }
      setLoading(false);
    }
  };

  const upgradeTier = async (userId, tier) => {
    if (!window.confirm(`Upgrade user to ${tier}?`)) return;

    try {
      await axios.put(
        `${BACKEND_URL}/api/ceo-access-b7k9m2x/users/${userId}/tier?tier=${tier}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`User upgraded to ${tier}!`);
      loadAdminData();
    } catch (err) {
      alert('Failed to upgrade user');
    }
  };

  const impersonateUser = async (userId) => {
    if (!window.confirm('Impersonate this user? This action is logged.')) return;

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/ceo-access-b7k9m2x/impersonate/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Save impersonation token and flag
      localStorage.setItem('rendr_token', response.data.token);
      localStorage.setItem('rendr_impersonating', 'true');
      localStorage.setItem('rendr_original_token', token);
      
      alert(`Now viewing as: ${response.data.user.username}`);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to impersonate user');
    }
  };

  const exitImpersonation = () => {
    const originalToken = localStorage.getItem('rendr_original_token');
    if (originalToken) {
      localStorage.setItem('rendr_token', originalToken);
      localStorage.removeItem('rendr_impersonating');
      localStorage.removeItem('rendr_original_token');
      navigate('/admin');
      window.location.reload();
    }
  };

  const toggleInterestedParty = async (userId, currentState) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/ceo-access-b7k9m2x/users/${userId}/interested?interested=${!currentState}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadAdminData();
    } catch (err) {
      alert('Failed to update interested party status');
    }
  };

  const bulkImport = async () => {
    if (!bulkEmails.trim()) {
      alert('Please enter email addresses');
      return;
    }

    const emails = bulkEmails.split('\n').filter(e => e.trim());
    
    if (!window.confirm(`Import ${emails.length} users?`)) return;

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/bulk-import`,
        emails,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      
      alert(`Imported: ${response.data.imported}\nSkipped: ${response.data.skipped}${response.data.errors.length > 0 ? `\nErrors: ${response.data.errors.length}` : ''}`);
      setBulkEmails('');
      loadAdminData();
    } catch (err) {
      alert('Failed to import users');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading admin panel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', color: '#ef4444', marginBottom: '1rem' }}>🚫 {error}</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isImpersonating = localStorage.getItem('rendr_impersonating') === 'true';

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div style={{
          background: '#fef2f2',
          borderBottom: '2px solid #ef4444',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <span style={{ color: '#991b1b', fontWeight: 'bold', marginRight: '1rem' }}>
            🕵️ IMPERSONATING USER
          </span>
          <button
            onClick={exitImpersonation}
            style={{
              padding: '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Exit Impersonation
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#111827', color: 'white', padding: '2rem 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                🔐 CEO Admin Dashboard
              </h1>
              <p style={{ opacity: 0.8 }}>Full platform control & user management</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back to My Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', gap: '2rem' }}>
          {['stats', 'users', 'interested', 'import', 'logs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid #667eea' : '3px solid transparent',
                color: activeTab === tab ? '#667eea' : '#6b7280',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'interested' ? 'Interested Parties' : tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Users</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea' }}>{stats.users.total}</div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Free Tier</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.users.free}</div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Pro Tier</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.users.pro}</div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Enterprise</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.users.enterprise}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Videos</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea' }}>{stats.videos.total}</div>
              </div>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Blockchain Verified</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.videos.blockchain_verified}</div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Username</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Tier</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Videos</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Joined</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => 
                    !search || 
                    u.username.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase())
                  ).map((user, index) => (
                    <tr key={user.user_id} style={{ borderBottom: index < users.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: '1rem' }}>@{user.username}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: user.premium_tier === 'enterprise' ? '#f3e8ff' : user.premium_tier === 'pro' ? '#fef3c7' : '#dbeafe',
                          color: user.premium_tier === 'enterprise' ? '#6b21a8' : user.premium_tier === 'pro' ? '#92400e' : '#1e40af'
                        }}>
                          {user.premium_tier.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{user.video_count}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <select
                            onChange={(e) => upgradeTier(user.user_id, e.target.value)}
                            defaultValue=""
                            style={{
                              padding: '0.25rem 0.5rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem'
                            }}
                          >
                            <option value="" disabled>Upgrade...</option>
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                          <button
                            onClick={() => impersonateUser(user.user_id)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            🕵️ View As
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Interested Parties Tab */}
        {activeTab === 'interested' && (
          <div>
            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📬 Interested Parties List</h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Users flagged for email campaigns and product updates</p>
              
              {interestedParties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No interested parties yet. Add users from the Users tab.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {interestedParties.map(party => (
                    <div 
                      key={party.user_id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          @{party.username}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {party.email}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                          Added: {new Date(party.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleInterestedParty(party.user_id, true)}
                        style={{
                          padding: '0.5rem 1rem',
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
          </div>
        )}

        {/* Bulk Import Tab */}
        {activeTab === 'import' && (
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📤 Bulk User Import</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Import users from RSVP lists or email campaigns</p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Email Addresses (one per line)
              </label>
              <textarea
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                placeholder="user1@example.com\nuser2@example.com\nuser3@example.com"
                rows={10}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={bulkImport}
                disabled={!bulkEmails.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: bulkEmails.trim() ? '#667eea' : '#e5e7eb',
                  color: bulkEmails.trim() ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: bulkEmails.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Import Users
              </button>
              <button
                onClick={() => setBulkEmails('')}
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
                Clear
              </button>
            </div>
            
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              background: '#f0f9ff', 
              border: '1px solid #bae6fd',
              borderRadius: '0.5rem' 
            }}>
              <div style={{ fontSize: '0.875rem', color: '#0c4a6e', fontWeight: '600', marginBottom: '0.5rem' }}>
                ℹ️ Import Details:
              </div>
              <ul style={{ fontSize: '0.875rem', color: '#075985', margin: 0, paddingLeft: '1.25rem' }}>
                <li>Users will be created with temporary passwords</li>
                <li>Usernames will be auto-generated from email addresses</li>
                <li>Existing users will be skipped automatically</li>
                <li>A welcome email will be sent to all new users (if configured)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Admin Action Logs</h2>
            {logs.map((log, index) => (
              <div key={log._id} style={{
                padding: '1rem',
                borderBottom: index < logs.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#111827', marginBottom: '0.25rem' }}>
                  <strong>{log.action}</strong> - @{log.target_username}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {new Date(log.timestamp).toLocaleString()}
                  {log.old_tier && log.new_tier && (
                    <span> - Changed from {log.old_tier} to {log.new_tier}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
