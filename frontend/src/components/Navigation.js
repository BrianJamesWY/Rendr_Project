import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Navigation = ({ currentPage = '' }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const BACKEND_URL = 'https://rendr-revamp.preview.emergentagent.com';

  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rendr_token');
    localStorage.removeItem('rendr_username');
    navigate('/creator-login');
  };

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        {/* Logo on the left */}
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <Logo size="medium" />
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {token && (
            <>
              <Link 
                to="/dashboard" 
                style={{ 
                  color: currentPage === 'dashboard' ? '#667eea' : '#6b7280',
                  textDecoration: 'none',
                  fontWeight: currentPage === 'dashboard' ? '600' : '500'
                }}
              >
                Dashboard
              </Link>
              <Link 
                to="/upload" 
                style={{ 
                  color: currentPage === 'upload' ? '#667eea' : '#6b7280',
                  textDecoration: 'none',
                  fontWeight: currentPage === 'upload' ? '600' : '500'
                }}
              >
                Upload
              </Link>
              <Link 
                to="/earnings" 
                style={{ 
                  color: currentPage === 'earnings' ? '#667eea' : '#6b7280',
                  textDecoration: 'none',
                  fontWeight: currentPage === 'earnings' ? '600' : '500'
                }}
              >
                Earnings
              </Link>
              <Link 
                to="/bounties" 
                style={{ 
                  color: currentPage === 'bounties' ? '#667eea' : '#6b7280',
                  textDecoration: 'none',
                  fontWeight: currentPage === 'bounties' ? '600' : '500'
                }}
              >
                Bounties
              </Link>
              {user && (
                <Link 
                  to={`/@${user.username}`}
                  style={{ 
                    color: '#6b7280',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  My Showcase
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  color: '#374151'
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
