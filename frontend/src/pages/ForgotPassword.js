import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #4f46e5 100%)';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/password/request-reset`,
        null,
        { params: { email } }
      );
      
      setResetLink(response.data.reset_link);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to request reset');
    }
    setLoading(false);
  };

  const glassCard = {
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(16px)',
    borderRadius: '1.25rem',
    padding: '2.5rem',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
    maxWidth: '420px',
    width: '90%',
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
    marginBottom: '1rem',
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
    marginBottom: '1rem',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgGradient, padding: '2rem' }}>
      <div style={glassCard}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
          }}>
            RENDR
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>Reset Password</h1>
          <p style={{ color: 'rgba(156, 163, 175, 0.9)', fontSize: '0.9rem' }}>Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(127, 29, 29, 0.4)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '0.5rem',
            color: '#fca5a5',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ ...buttonStyle, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {resetLink && (
          <div style={{
            padding: '1rem',
            background: 'rgba(30, 58, 138, 0.3)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
          }}>
            <p style={{ fontSize: '0.875rem', color: 'rgba(191, 219, 254, 0.9)' }}>
              Reset link generated! <a href={resetLink} style={{ color: '#60a5fa' }}>Click here to reset</a>
            </p>
          </div>
        )}

        <Link to="/CreatorLogin" style={{ display: 'block', textAlign: 'center', color: '#8b5cf6', fontSize: '0.875rem' }}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
