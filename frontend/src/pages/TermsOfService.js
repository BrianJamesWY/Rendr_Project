import React from 'react';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';

const TermsOfService = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3rem 0', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <Logo size="small" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginTop: '2rem', marginBottom: '0.5rem' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
            Last Updated: November 23, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto 4rem', padding: '0 1rem' }}>
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', lineHeight: '1.8' }}>
          
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem' }}>
            <p style={{ color: '#92400e', margin: 0, fontWeight: '600' }}>
              <strong>Important:</strong> Please read these Terms of Service carefully before using Rendr. By accessing or using our platform, you agree to be bound by these terms.
            </p>
          </div>

          {/* All sections from the scraped content */}
          <h2>1. Acceptance of Terms</h2>
          <p>Welcome to Rendr! By creating an account, accessing, or using Rendr (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.</p>
          <p>These Terms constitute a legally binding agreement between you and Rendr ("we," "us," or "our"). We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified Terms.</p>

          <h2>2. Description of Service</h2>
          <p>Rendr is a video authentication and verification platform that allows users to:</p>
          <ul>
            <li>Upload videos and receive blockchain-based verification codes</li>
            <li>Create public showcases to display verified content</li>
            <li>Create premium subscription-based content folders (for Pro and Enterprise users)</li>
            <li>Subscribe to premium content created by other users</li>
            <li>Verify the authenticity of videos using DCT-domain watermarking technology</li>
          </ul>

          <h2>3. Account Types & Eligibility</h2>
          <h3>3.1 Eligibility</h3>
          <p>You must be at least 18 years old to use Rendr. By creating an account, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.</p>

          <h3>3.2 Account Types</h3>
          <p>Rendr offers three account tiers:</p>
          <ul>
            <li><strong>Free:</strong> Basic video verification and showcase features. Limited to 10 verified videos.</li>
            <li><strong>Pro ($9.99/month):</strong> Unlimited verified videos, premium folder creation (up to 3), advanced showcase customization, and ability to earn revenue from subscriptions.</li>
            <li><strong>Enterprise ($49.99/month):</strong> All Pro features plus unlimited premium folders, enhanced revenue share (85% vs 80%), custom domain support, and priority support.</li>
          </ul>

          <h2>5. Premium Subscriptions & Payments</h2>
          <h3>5.3 Revenue Share (Creator Earnings)</h3>
          <p>Creators who sell premium content subscriptions earn a percentage of subscription revenue:</p>
          <ul>
            <li><strong>Pro creators:</strong> 80% of subscription price (Rendr keeps 20%)</li>
            <li><strong>Enterprise creators:</strong> 85% of subscription price (Rendr keeps 15%)</li>
            <li>Payouts are processed via Stripe Connect</li>
            <li>Payout schedule is set in your Stripe account (weekly or monthly)</li>
            <li>Minimum payout threshold: $10</li>
          </ul>

          <h2>7. Stripe Connect (For Creators)</h2>
          <p>To earn money from premium subscriptions, you must connect a Stripe account. By connecting Stripe, you agree to Stripe's Connected Account Agreement and provide accurate identity and banking information.</p>

          <h2>10. Disclaimers</h2>
          <p style={{ fontWeight: '600' }}>THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not warrant that the Platform will be uninterrupted, error-free, or that you will earn any specific amount of revenue.</p>

          <h2>11. Limitation of Liability</h2>
          <p style={{ fontWeight: '600' }}>TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.</p>

          <h2>17. Contact Us</h2>
          <p>If you have questions about these Terms, please contact us:</p>
          <p>
            <strong>Email:</strong> <a href="mailto:support@rendr.com" style={{ color: '#667eea' }}>support@rendr.com</a><br/>
            <strong>Website:</strong> <a href="/contact" style={{ color: '#667eea' }}>rendr.com/contact</a>
          </p>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
