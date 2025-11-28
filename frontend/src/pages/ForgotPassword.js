import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = 'https://rendr-revamp.preview.emergentagent.com';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/password/request-reset`,
        null,
        { params: { email } }
      );
      
      setResetLink(response.data.reset_link);
      alert('Reset link generated! (Check console in production)');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || 'Failed to request reset'));
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', maxWidth: '400px', width: '90%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Reset Password</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Enter your email to receive a reset link</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '1rem'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: loading ? 'wait' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {resetLink && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#eff6ff', borderRadius: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Dev Mode: <a href={resetLink} style={{ color: '#667eea' }}>Click here to reset</a></p>
          </div>
        )}

        <Link to="/CreatorLogin" style={{ display: 'block', textAlign: 'center', color: '#667eea', fontSize: '0.875rem', marginTop: '1rem' }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
