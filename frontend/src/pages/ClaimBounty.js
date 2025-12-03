import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';

const BACKEND_URL = 'https://vidauth-app.preview.emergentagent.com';

function ClaimBounty() {
  const { bountyId } = useParams();
  const [bounty, setBounty] = useState(null);
  const [stolenUrl, setStolenUrl] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/creator-login');
      return;
    }
    loadBounty();
  }, [bountyId]);

  const loadBounty = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/bounties/${bountyId}`);
      setBounty(response.data);
    } catch (err) {
      setError('Failed to load bounty');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(
        `${BACKEND_URL}/api/bounties/${bountyId}/claim`,
        {
          stolen_content_url: stolenUrl,
          details: details
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Claim submitted successfully! Awaiting verification.');
      navigate('/bounties');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit claim');
      setLoading(false);
    }
  };

  if (!bounty) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Navigation currentPage="bounties" />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem', textAlign: 'center' }}>
          <p>Loading bounty...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="bounties" />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Claim Bounty
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
          Submit evidence of stolen content
        </p>

        {/* Bounty Info */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{bounty.title}</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{bounty.description}</p>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: '#6b7280' }}>
            <span>💰 Reward: ${bounty.reward_amount.toFixed(2)}</span>
            <span>📹 Video: {bounty.video_code}</span>
            <span>👤 By @{bounty.creator_username}</span>
          </div>
        </div>

        {/* Claim Form */}
        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {error && (
            <div style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '0.5rem', marginBottom: '1.5rem', color: '#991b1b' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Stolen Content URL *
            </label>
            <input
              type="url"
              value={stolenUrl}
              onChange={(e) => setStolenUrl(e.target.value)}
              required
              placeholder="https://example.com/stolen-video"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Additional Details *
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              rows="6"
              placeholder="Explain how you found it, why you believe it's stolen content, timestamp comparisons, etc."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/bounties')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#374151'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: loading ? '#d1d5db' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClaimBounty;
