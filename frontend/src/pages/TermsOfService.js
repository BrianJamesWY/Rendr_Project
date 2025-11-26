import React from 'react';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';

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
            Last Updated: November 24, 2024
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto 4rem', padding: '0 1rem' }}>
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', lineHeight: '1.8' }}>
          
          <div style={{ background: '#fef3c7', borderLeft: '4px solid #f59e0b', padding: '1rem', marginBottom: '2rem', borderRadius: '4px' }}>
            <p style={{ color: '#92400e', margin: 0 }}>
              <strong>Important:</strong> Please read these Terms of Service carefully before using Rendr. By accessing or using our platform, you agree to be bound by these terms.
            </p>
          </div>

          <h2 style={{ fontSize: '1.75rem', color: '#667eea', marginTop: '2rem', marginBottom: '1rem', borderLeft: '4px solid #667eea', paddingLeft: '1rem' }}>1. Acceptance of Terms</h2>
          <p>Welcome to Rendr! By creating an account, accessing, or using Rendr (the &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Platform.</p>
          <p>These Terms constitute a legally binding agreement between you and Rendr (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We reserve the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified Terms.</p>

          <h2 style={{ fontSize: '1.75rem', color: '#667eea', marginTop: '2rem', marginBottom: '1rem', borderLeft: '4px solid #667eea', paddingLeft: '1rem' }}>2. Description of Service</h2>
          <p>Rendr is a video authentication and verification platform that allows users to:</p>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>Upload videos and receive blockchain-based verification codes</li>
            <li>Create public showcases to display verified content</li>
            <li>Create premium subscription-based content folders (for Pro and Enterprise users)</li>
            <li>Subscribe to premium content created by other users</li>
            <li>Verify the authenticity of videos using DCT-domain watermarking technology</li>
          </ul>

          <h2 style={{ fontSize: '1.75rem', color: '#667eea', marginTop: '2rem', marginBottom: '1rem', borderLeft: '4px solid #667eea', paddingLeft: '1rem' }}>3. Account Types & Eligibility</h2>
          
          <h3 style={{ fontSize: '1.25rem', color: '#764ba2', marginTop: '1.5rem', marginBottom: '0.75rem' }}>3.1 Eligibility</h3>
          <p>You must be at least 18 years old to use Rendr. By creating an account, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.</p>

          <h3 style={{ fontSize: '1.25rem', color: '#764ba2', marginTop: '1.5rem', marginBottom: '0.75rem' }}>3.2 Account Types</h3>
          <p>Rendr offers three account tiers:</p>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li><strong>Free:</strong> Basic video verification and showcase features. Limited to 10 verified videos.</li>
            <li><strong>Pro ($9.99/month):</strong> Unlimited verified videos, premium folder creation (up to 3), advanced showcase customization, and ability to earn revenue from subscriptions.</li>
            <li><strong>Enterprise ($49.99/month):</strong> All Pro features plus unlimited premium folders, enhanced revenue share (85% vs 80%), custom domain support, and priority support.</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', color: '#764ba2', marginTop: '1.5rem', marginBottom: '0.75rem' }}>3.3 Account Responsibilities</h3>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must notify us immediately of any unauthorized access</li>
            <li>You may not share your account with others</li>
            <li>You may not create multiple accounts to circumvent limitations</li>
          </ul>

          <h2 style={{ fontSize: '1.75rem', color: '#667eea', marginTop: '2rem', marginBottom: '1rem', borderLeft: '4px solid #667eea', paddingLeft: '1rem' }}>4. Content & Intellectual Property</h2>

          <h3 style={{ fontSize: '1.25rem', color: '#764ba2', marginTop: '1.5rem', marginBottom: '0.75rem' }}>4.1 Your Content</h3>
          <p>You retain all ownership rights to the content you upload to Rendr ("Your Content"). By uploading content, you grant Rendr a worldwide, non-exclusive, royalty-free license to:</p>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>Store, process, and display Your Content</li>
            <li>Generate verification codes and watermarks</li>
            <li>Distribute Your Content to users who have access rights (through premium subscriptions or public showcases)</li>
            <li>Create thumbnails and previews of Your Content</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', color: '#764ba2', marginTop: '1.5rem', marginBottom: '0.75rem' }}>4.2 Prohibited Content</h3>
          <p>You may not upload content that:</p>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>Violates any law or regulation</li>
            <li>Infringes on intellectual property rights of others</li>
            <li>Contains child sexual abuse material (CSAM)</li>
            <li>Contains non-consensual intimate imagery</li>
            <li>Promotes violence, terrorism, or hate speech</li>
            <li>Contains malware or viruses</li>
            <li>Is fraudulent, deceptive, or misleading</li>
          </ul>

          <h2 style={{ fontSize: '1.75rem', color: '#667eea', marginTop: '2rem', marginBottom: '1rem', borderLeft: '4px solid #667eea', paddingLeft: '1rem' }}>5. Premium Subscriptions & Payments</h2>

          <h3 style={{ fontSize: '1.25rem', color: '#764ba2', marginTop: '1.5rem', marginBottom: '0.75rem' }}>5.1 Creator Subscriptions (Pro/Enterprise)</h3>
          <p>Pro and Enterprise accounts are billed monthly via Stripe. By subscribing, you authorize Rendr to charge your payment method:</p>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>On the date you subscribe (initial charge)</li>
            <li>Monthly on the same date thereafter (recurring charges)</li>
            <li>All charges are in US dollars (USD)</li>
            <li>Prices are subject to change with 30 days notice</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', color: '#764ba2', marginTop: '1.5rem', marginBottom: '0.75rem' }}>5.2 Premium Folder Subscriptions (Viewers)</h3>
          <p>Users may subscribe to premium content folders created by Pro and Enterprise creators:</p>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>Subscription prices are set by the creator</li>
            <li>Billing occurs monthly on the date of subscription</li>
            <li>Access is immediate upon successful payment</li>
            <li>Subscriptions renew automatically unless cancelled</li>
            <li>Cancellation takes effect at the end of the current billing period</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', color: '#764ba2', marginTop: '1.5rem', marginBottom: '0.75rem' }}>5.3 Revenue Share (Creator Earnings)</h3>
          <p>Creators who sell premium content subscriptions earn a percentage of subscription revenue:</p>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li><strong>Pro creators:</strong> 80% of subscription price (Rendr keeps 20%)</li>
            <li><strong>Enterprise creators:</strong> 85% of subscription price (Rendr keeps 15%)</li>
            <li>Payouts are processed via Stripe Connect</li>
            <li>Payout schedule is set in your Stripe account (weekly or monthly)</li>
            <li>Minimum payout threshold: $10</li>
          </ul>

          <h2 style={{ fontSize: '1.75rem', color: '#667eea', marginTop: '2rem', marginBottom: '1rem', borderLeft: '4px solid #667eea', paddingLeft: '1rem' }}>6. Refunds & Cancellations</h2>

          <h3 style={{ fontSize: '1.25rem', color: '#764ba2', marginTop: '1.5rem', marginBottom: '0.75rem' }}>6.1 Creator Subscription Refunds</h3>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>Pro/Enterprise subscriptions have a 7-day money-back guarantee</li>
            <li>Request refund within 7 days of initial charge for full refund</li>
            <li>No refunds for partial months after 7 days</li>
            <li>You may cancel anytime to stop future charges</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', color: '#764ba2', marginTop: '1.5rem', marginBottom: '0.75rem' }}>6.2 Premium Content Subscription Refunds</h3>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>No refunds once content has been accessed</li>
            <li>Technical issues preventing access: Full refund available</li>
            <li>You may cancel anytime, but no partial month refunds</li>
            <li>Access continues through end of billing period after cancellation</li>
          </ul>
          <p>See our complete <Link to="/refunds" style={{ color: '#667eea' }}>Refund Policy</Link> for details.</p>

          <h2 style={{ fontSize: '1.75rem', color: '#667eea', marginTop: '2rem', marginBottom: '1rem', borderLeft: '4px solid #667eea', paddingLeft: '1rem' }}>7. User Conduct</h2>
          <p>You agree NOT to:</p>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Upload prohibited content (see section 4.2)</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Attempt to hack, reverse engineer, or compromise the Platform</li>
            <li>Use bots, scripts, or automation without permission</li>
            <li>Spam or send unsolicited communications</li>
            <li>Manipulate verification systems</li>
            <li>Create fake accounts or impersonate others</li>
            <li>Share account credentials</li>
          </ul>

          <h2 style={{ fontSize: '1.75rem', color: '#667eea', marginTop: '2rem', marginBottom: '1rem', borderLeft: '4px solid #667eea', paddingLeft: '1rem' }}>8. Termination</h2>
          <p>We may suspend or terminate your account if you violate these Terms. Upon termination, your access to the Platform will cease, and we may delete your content after 30 days.</p>

          <h2 style={{ fontSize: '1.75rem', color: '#667eea', marginTop: '2rem', marginBottom: '1rem', borderLeft: '4px solid #667eea', paddingLeft: '1rem' }}>9. Disclaimers</h2>
          <p>THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not warrant that the Platform will be uninterrupted or error-free.</p>

          <h2 style={{ fontSize: '1.75rem', color: '#667eea', marginTop: '2rem', marginBottom: '1rem', borderLeft: '4px solid #667eea', paddingLeft: '1rem' }}>10. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.</p>

          <h2 style={{ fontSize: '1.75rem', color: '#667eea', marginTop: '2rem', marginBottom: '1rem', borderLeft: '4px solid #667eea', paddingLeft: '1rem' }}>11. Governing Law</h2>
          <p>These Terms are governed by the laws of the State of Wyoming, United States. Any legal action must be brought in the courts located in Basin, Wyoming.</p>

          <div style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: '8px', marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>12. Contact Us</h2>
            <p>If you have questions about these Terms, please contact us:</p>
            <ul style={{ marginLeft: '2rem', listStyle: 'none' }}>
              <li><strong>Email:</strong> <a href="mailto:support@rendr.com" style={{ color: '#667eea' }}>support@rendr.com</a></li>
              <li><strong>Website:</strong> <Link to="/contact" style={{ color: '#667eea' }}>rendr.com/contact</Link></li>
            </ul>
          </div>

          <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb', textAlign: 'center', color: '#6b7280' }}>
            <p>&copy; 2024 Rendr. All rights reserved.</p>
            <p style={{ marginTop: '0.5rem' }}>
              <Link to="/privacy" style={{ color: '#667eea', marginRight: '1rem' }}>Privacy Policy</Link>
              <Link to="/refunds" style={{ color: '#667eea', marginRight: '1rem' }}>Refund Policy</Link>
              <Link to="/contact" style={{ color: '#667eea' }}>Contact</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;