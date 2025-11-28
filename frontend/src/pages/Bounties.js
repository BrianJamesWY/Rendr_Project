import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';

const BACKEND_URL = 'https://rendr-revamp.preview.emergentagent.com';

function Bounties() {
  const [bounties, setBounties] = useState([]);
  const [myBounties, setMyBounties] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'mine'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadBounties();
    if (token) {
      loadMyBounties();
    }
  }, []);

  const loadBounties = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/bounties?status=active`);
      setBounties(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load bounties:', err);
      setLoading(false);
    }
  };

  const loadMyBounties = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/bounties/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyBounties(response.data || []);
    } catch (err) {
      console.error('Failed to load my bounties:', err);
    }
  };

  const handleClaimBounty = (bountyId) => {
    if (!token) {
      navigate('/creator-login');
      return;
    }
    navigate(`/bounties/${bountyId}/claim`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="bounties" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            🎯 Content Theft Bounties
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Help creators find their stolen content and earn rewards
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {token && (
            <Link
              to="/bounties/post"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              + Post Bounty
            </Link>
          )}
        </div>

        {/* Tabs */}
        {token && (
          <div style={{ borderBottom: '2px solid #e5e7eb', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '1rem 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'all' ? '3px solid #667eea' : '3px solid transparent',
                  color: activeTab === 'all' ? '#667eea' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                All Bounties ({bounties.length})
              </button>
              <button
                onClick={() => setActiveTab('mine')}
                style={{
                  padding: '1rem 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'mine' ? '3px solid #667eea' : '3px solid transparent',
                  color: activeTab === 'mine' ? '#667eea' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                My Bounties ({myBounties.length})
              </button>
            </div>
          </div>
        )}

        {/* Bounties List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Loading bounties...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {(activeTab === 'all' ? bounties : myBounties).map(bounty => (
              <div
                key={bounty.bounty_id}
                style={{
                  background: 'white',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                        {bounty.title}
                      </h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        background: bounty.status === 'active' ? '#dcfce7' : bounty.status === 'claimed' ? '#fef3c7' : '#dbeafe',
                        color: bounty.status === 'active' ? '#166534' : bounty.status === 'claimed' ? '#92400e' : '#1e40af'
                      }}>
                        {bounty.status}
                      </span>
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                      {bounty.description}
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      <span>📹 Video: {bounty.video_code}</span>
                      <span>👤 By @{bounty.creator_username}</span>
                      <span>📅 {new Date(bounty.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
                      ${bounty.reward_amount.toFixed(2)}
                    </div>
                    {bounty.status === 'active' && activeTab === 'all' && (
                      <button
                        onClick={() => handleClaimBounty(bounty.bounty_id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Claim Bounty
                      </button>
                    )}
                    {activeTab === 'mine' && bounty.status === 'claimed' && (
                      <Link
                        to={`/bounties/${bounty.bounty_id}/verify`}
                        style={{
                          display: 'inline-block',
                          padding: '0.5rem 1rem',
                          background: '#f59e0b',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: '600'
                        }}
                      >
                        Review Claim
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(activeTab === 'all' ? bounties : myBounties).length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '0.75rem' }}>
                <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                  {activeTab === 'all' ? 'No active bounties available' : 'You haven\'t posted any bounties yet'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bounties;
