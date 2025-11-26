import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Navigation */}
      <nav style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Logo size="small" />
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#features" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>Features</a>
            <a href="#how-it-works" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>How It Works</a>
            <Link to="/plans" style={{ color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>Pricing</Link>
            <Link to="/CreatorLogin" style={{ 
              padding: '0.625rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600'
            }}>Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '6rem 1rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            lineHeight: '1.2'
          }}>
            Bringing Truth Back to Content
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1rem',
            opacity: 0.95
          }}>
            Combat deepfakes and misinformation with Rendr's revolutionary video verification platform.
          </p>
          <p style={{ 
            fontSize: '1.125rem', 
            marginBottom: '3rem',
            opacity: 0.9
          }}>
            Powered by DCT-domain steganographic watermarking technology.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/CreatorLogin" style={{
              padding: '1rem 2.5rem',
              background: 'white',
              color: '#667eea',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1.125rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              🚀 Start Free Trial
            </Link>
            <a href="#how-it-works" style={{
              padding: '1rem 2.5rem',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1.125rem'
            }}>
              📺 Watch Demo
            </a>
          </div>
          <p style={{ marginTop: '3rem', fontSize: '0.875rem', opacity: 0.8 }}>
            Trusted by content creators worldwide
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div style={{ 
        background: '#f9fafb',
        padding: '2rem 1rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
            <div style={{ fontWeight: '600', color: '#111827' }}>Secure</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⛓️</div>
            <div style={{ fontWeight: '600', color: '#111827' }}>Blockchain Verified</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
            <div style={{ fontWeight: '600', color: '#111827' }}>Patent Pending</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={{ padding: '6rem 1rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#111827'
          }}>
            Why Choose Rendr?
          </h2>
          <p style={{ 
            textAlign: 'center', 
            color: '#6b7280', 
            fontSize: '1.25rem',
            marginBottom: '4rem'
          }}>
            The most advanced video verification platform designed to protect content authenticity
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                Steganographic Watermarking
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Invisible DCT-domain watermarks embedded directly into your video content, impossible to remove or forge.
              </p>
            </div>

            <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛓️</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                Blockchain Verification
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Optional blockchain registration for immutable proof of authenticity with tamper-proof timestamps.
              </p>
            </div>

            <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                Instant Verification
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Verify any video in seconds using our QR code system or unique verification codes. Fast, simple, reliable.
              </p>
            </div>

            <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                Multiple Sources
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Support for bodycam footage, studio recordings, mobile uploads, and more. Works with any video format.
              </p>
            </div>

            <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                Analytics Dashboard
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Track your verified videos, monitor verification attempts, and analyze viewer trust metrics.
              </p>
            </div>

            <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                Flexible Tiers
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                From free trials to enterprise solutions. Choose the plan that fits your content creation needs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" style={{ padding: '6rem 1rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            textAlign: 'center',
            marginBottom: '4rem',
            color: '#111827'
          }}>
            How Rendr Works
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>1</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                Upload Your Video
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Upload your video content from any source - bodycam, studio, mobile device, or screen recording.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>2</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                Automatic Watermarking
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Our system embeds invisible steganographic watermarks and generates unique verification codes.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>3</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                Share & Verify
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Share your verified videos with confidence. Anyone can verify authenticity using your unique code or QR.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Link to="/CreatorLogin" style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1.125rem',
              display: 'inline-block'
            }}>
              Get Started Today
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ 
        padding: '6rem 1rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Ready to Protect Your Content?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '3rem', opacity: 0.95 }}>
            Join thousands of creators who trust Rendr to verify their content authenticity.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/CreatorLogin" style={{
              padding: '1rem 2.5rem',
              background: 'white',
              color: '#667eea',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1.125rem'
            }}>
              🚀 Start Free Trial
            </Link>
            <Link to="/plans" style={{
              padding: '1rem 2.5rem',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1.125rem'
            }}>
              💎 View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#111827', color: 'white', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/plans" style={{ color: '#9ca3af', textDecoration: 'none' }}>Pricing</Link>
                <a href="#features" style={{ color: '#9ca3af', textDecoration: 'none' }}>Features</a>
                <Link to="/help" style={{ color: '#9ca3af', textDecoration: 'none' }}>Help Center</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</Link>
                <Link to="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy</Link>
                <Link to="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Resources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/help" style={{ color: '#9ca3af', textDecoration: 'none' }}>Documentation</Link>
                <Link to="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Support</Link>
              </div>
            </div>
          </div>
          <div style={{ 
            borderTop: '1px solid #374151',
            paddingTop: '2rem',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            <p>&copy; 2025 Rendr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;