import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';
import axios from 'axios';

const Explore = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const BACKEND_URL = 'https://rendr-revamp.preview.emergentagent.com';

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        // TODO: Implement backend endpoint
        const response = await axios.get(`${BACKEND_URL}/api/explore/creators`, {
          params: { tier: filterTier, sort: sortBy, search: searchQuery }
        });
        setCreators(response.data.creators || []);
      } catch (err) {
        console.error('Failed to fetch creators:', err);
        // Mock data for now
        setCreators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [BACKEND_URL, filterTier, sortBy, searchQuery]);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3rem 0', marginBottom: '3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <Logo size="large" />
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', marginTop: '2rem' }}>
            Explore Creators
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)' }}>
            Discover verified content from creators worldwide
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 4rem' }}>
        {/* Search & Filters */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            {/* Search */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Search Creators
              </label>
              <input
                type="text"
                placeholder="Search by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filter by Tier */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Filter
              </label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="all">All Creators</option>
                <option value="premium">Premium Content</option>
                <option value="pro">Pro Tier</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Joined</option>
                <option value="subscribers">Most Subscribers</option>
                <option value="videos">Most Videos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
          {loading ? 'Loading creators...' : `${creators.length} creators found`}
        </div>

        {/* Creators Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: '#9ca3af' }}>Loading...</p>
          </div>
        ) : creators.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {creators.map((creator) => (
              <div
                key={creator.id}
                style={{
                  background: 'white',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                {/* Banner */}
                <div style={{ height: '100px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />

                {/* Profile */}
                <div style={{ padding: '1.5rem', marginTop: '-50px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#fff',
                    border: '4px solid white',
                    marginBottom: '1rem',
                    backgroundImage: creator.profileImage ? `url(${creator.profileImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: '#667eea'
                  }}>
                    {!creator.profileImage && '👤'}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                    {creator.displayName || creator.username}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    @{creator.username}
                  </p>

                  {creator.bio && (
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                      {creator.bio.length > 100 ? creator.bio.substring(0, 100) + '...' : creator.bio}
                    </p>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                        {creator.videoCount || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Videos</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                        {creator.premiumFolders || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Premium</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>
                        {creator.subscribers || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Subscribers</div>
                    </div>
                  </div>

                  <Link
                    to={`/@${creator.username}`}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '0.5rem',
                      textAlign: 'center',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    View Showcase
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '0.75rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
              No Creators Found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => { setSearchQuery(''); setFilterTier('all'); }}
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
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;