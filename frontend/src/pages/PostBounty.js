import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import axios from 'axios';

const BACKEND_URL = 'https://rendr-revamp.preview.emergentagent.com';

function PostBounty() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/creator-login');
      return;
    }
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/videos/user/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(response.data || []);
    } catch (err) {
      console.error('Failed to load videos:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(
        `${BACKEND_URL}/api/bounties`,
        {
          video_id: selectedVideo,
          title: title,
          description: description,
          reward_amount: parseFloat(rewardAmount)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Bounty posted successfully!');
      navigate('/bounties');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post bounty');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation currentPage="bounties" />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Post a Bounty
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
          Offer a reward to find your stolen content
        </p>

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {error && (
            <div style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '0.5rem', marginBottom: '1.5rem', color: '#991b1b' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Select Video
            </label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value="">Choose a video...</option>
              {videos.map(video => (
                <option key={video.video_id} value={video.video_id}>
                  {video.verification_code} - {video.title || 'Untitled'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Bounty Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Find my stolen workout video"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="4"
              placeholder="Describe where you've seen your content stolen, what platforms to check, etc."
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

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Reward Amount ($)
            </label>
            <input
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              required
              min="1"
              step="0.01"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Minimum $1. You'll be charged when the bounty is verified.
            </p>
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
              {loading ? 'Posting...' : 'Post Bounty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostBounty;
