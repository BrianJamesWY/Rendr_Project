import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #4f46e5 100%)';

function CreatorLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        username,
        password
      });

      localStorage.setItem('rendr_token', response.data.token);
      localStorage.setItem('rendr_username', response.data.username);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        email,
        password,
        display_name: displayName,
        username
      });

      localStorage.setItem('rendr_token', response.data.token);
      localStorage.setItem('rendr_username', response.data.username);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const glassCard = {
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(16px)',
    borderRadius: '1.25rem',
    padding: '2.5rem',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
    width: '100%',
    maxWidth: '420px',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem',
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    color: 'white',
    outline: 'none',
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.875rem',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.95))',
    color: 'white',
    border: '1px solid rgba(191, 219, 254, 0.5)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: bgGradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={glassCard}>
        {/* Logo and Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}>
            RENDR
          </div>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: 'white',
            marginBottom: '0.25rem'
          }}>
            Creator Portal
          </h2>
          <p style={{ color: 'rgba(156, 163, 175, 0.9)', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Welcome back!' : 'Create your creator account'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(15, 23, 42, 0.6)', 
          borderRadius: '0.5rem', 
          padding: '0.25rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(148, 163, 184, 0.2)',
        }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: mode === 'login' ? 'linear-gradient(135deg, rgba(59,130,246,0.8), rgba(139,92,246,0.8))' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Login
          </button>
          <button
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: mode === 'register' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(127, 29, 29, 0.4)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '0.5rem',
            color: '#fca5a5',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {/* Forms */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: 'rgba(226, 232, 240, 0.9)', 
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={inputStyle}
                placeholder="YourUsername"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: 'rgba(226, 232, 240, 0.9)', 
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: '3rem' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(156, 163, 175, 0.9)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    padding: '0.25rem'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...buttonStyle, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/forgot-password" style={{ color: '#8b5cf6', fontSize: '0.875rem', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: 'rgba(226, 232, 240, 0.9)', 
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                style={inputStyle}
                placeholder="John Doe"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: 'rgba(226, 232, 240, 0.9)', 
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                required
                style={inputStyle}
                placeholder="YourUsername"
              />
              <p style={{ fontSize: '0.7rem', color: 'rgba(156, 163, 175, 0.8)', marginTop: '0.25rem' }}>
                Your public URL: rendrtruth.com/@{username || 'YourUsername'}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: 'rgba(226, 232, 240, 0.9)', 
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: 'rgba(226, 232, 240, 0.9)', 
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  style={{ ...inputStyle, paddingRight: '3rem' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(156, 163, 175, 0.9)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    padding: '0.25rem'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: 'rgba(226, 232, 240, 0.9)', 
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ 
                ...buttonStyle, 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(16, 185, 129, 0.95))',
                boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
                opacity: loading ? 0.6 : 1 
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: 'rgba(156, 163, 175, 0.9)', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CreatorLogin;
