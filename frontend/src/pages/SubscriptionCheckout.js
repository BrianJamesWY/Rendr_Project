import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';

const SubscriptionCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [folderDetails, setFolderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    loadFolderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFolderDetails = async () => {
    const folderId = searchParams.get('folder');
    
    if (!folderId) {
      setError('No folder specified');
      setLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${BACKEND_URL}/api/premium-folders/${folderId}/public`);
      // const data = await response.json();
      
      // Mock data for now
      setFolderDetails({
        id: folderId,
        creatorName: 'BrianJames',
        creatorTitle: 'Content Creator',
        icon: '🔒',
        name: 'Premium Videos',
        description: 'Exclusive content with blockchain verification',
        videoCount: 15,
        subscriberCount: 47,
        priceCents: 999
      });
    } catch (err) {
      console.error('Error loading folder:', err);
      setError('Failed to load folder details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // TODO: Implement Stripe payment flow
      // Step 1: Create subscription intent on backend
      // Step 2: Confirm payment with Stripe
      // Step 3: Redirect to success page
      
      // Temporary redirect for now
      setTimeout(() => {
        navigate(`/subscription-success?folder=${folderDetails.id}`);
      }, 2000);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  if (!folderDetails) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <p style={{ color: '#ef4444' }}>Folder not found</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem' }}>
      {/* Logo at top */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Logo size="small" />
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        
        {/* Left Column: Folder Details */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#111827' }}>Subscribe to Premium Content</h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.95rem' }}>Get instant access to exclusive verified videos</p>

          {/* Creator Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: '700' }}>
              {folderDetails.creatorName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{folderDetails.creatorName}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{folderDetails.creatorTitle}</p>
            </div>
          </div>

          {/* Folder Info */}
          <div style={{ border: '2px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>{folderDetails.icon}</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{folderDetails.name}</div>
            </div>
            <p style={{ color: '#374151', marginBottom: '1rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {folderDetails.description}
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                <span>🎬</span>
                <span>{folderDetails.videoCount} videos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                <span>👥</span>
                <span>{folderDetails.subscriberCount} subscribers</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <h3 style={{ marginBottom: '1rem' }}>What You&apos;ll Get:</h3>
          <ul style={{ listStyle: 'none', margin: '1.5rem 0', padding: 0 }}>
            {[
              'Instant access to all premium videos',
              'New videos added regularly',
              'Full HD quality streaming',
              'Blockchain-verified authenticity',
              'Cancel anytime, no questions asked',
              'Support independent content creators'
            ].map((benefit, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', padding: '0.75rem 0', borderBottom: idx < 5 ? '1px solid #e5e7eb' : 'none' }}>
                <span style={{ color: '#10b981', fontSize: '1.25rem', flexShrink: 0 }}>✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Payment Form */}
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', padding: '2rem' }}>
          {/* Price */}
          <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: '2rem', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              ${(folderDetails.priceCents / 100).toFixed(2)}
            </div>
            <div style={{ fontSize: '1.25rem', opacity: 0.9 }}>per month</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '1rem' }}>
              Cancel anytime • First charge today
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="you@example.com"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="John Doe"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Card Information</label>
              <div id="card-element" style={{ padding: '1rem', border: '2px solid #d1d5db', borderRadius: '8px', background: '#f9fafb' }}>
                {/* Stripe Card Element will be mounted here */}
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Card payment processing will be integrated with Stripe</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: processing ? 'not-allowed' : 'pointer',
                border: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginBottom: '1rem',
                opacity: processing ? 0.6 : 1
              }}
            >
              {processing ? '⏳ Processing...' : '🔒 Subscribe Now'}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'white',
                color: '#374151',
                border: '2px solid #d1d5db',
                fontSize: '1rem'
              }}
            >
              ← Back to Showcase
            </button>

            <div style={{ textAlign: 'center', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb', marginTop: '1.5rem' }}>
              <div style={{ color: '#6b7280', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span>🔒</span>
                <span>Secure payment powered by Stripe</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;