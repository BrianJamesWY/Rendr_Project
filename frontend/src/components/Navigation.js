import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = ({ currentPage }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('rendr_token');
  const username = localStorage.getItem('rendr_username');

  const handleLogout = () => {
    localStorage.removeItem('rendr_token');
    localStorage.removeItem('rendr_username');
    navigate('/CreatorLogin');
  };

  const navStyle = {
    background: 'white',
    borderBottom: '2px solid #e5e7eb',
    padding: '1rem 0',
    marginBottom: '2rem'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const linkStyle = {
    padding: '0.5rem 1rem',
    textDecoration: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    transition: 'all 0.2s'
  };

  const activeLinkStyle = {
    ...linkStyle,
    background: '#667eea',
    color: 'white'
  };

  const inactiveLinkStyle = {
    ...linkStyle,
    background: '#f3f4f6',
    color: '#374151'
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer'
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {token ? (
            <>
              <Link 
                to="/dashboard" 
                style={currentPage === 'dashboard' ? activeLinkStyle : inactiveLinkStyle}
              >
                📊 Dashboard
              </Link>
              
              <Link 
                to="/upload" 
                style={currentPage === 'upload' ? activeLinkStyle : inactiveLinkStyle}
              >
                ⬆️ Upload
              </Link>
              
              <Link 
                to={`/@${username}`}
                style={currentPage === 'showcase' ? activeLinkStyle : inactiveLinkStyle}
              >
                🎨 My Showcase
              </Link>
              
              <Link 
                to="/verify" 
                style={currentPage === 'verify' ? activeLinkStyle : inactiveLinkStyle}
              >
                ✅ Verify
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/" 
                style={currentPage === 'home' ? activeLinkStyle : inactiveLinkStyle}
              >
                🏠 Home
              </Link>
              
              <Link 
                to="/verify" 
                style={currentPage === 'verify' ? activeLinkStyle : inactiveLinkStyle}
              >
                ✅ Verify
              </Link>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {token ? (
            <button onClick={handleLogout} style={buttonStyle}>
              Logout
            </button>
          ) : (
            <Link to="/CreatorLogin" style={activeLinkStyle}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
