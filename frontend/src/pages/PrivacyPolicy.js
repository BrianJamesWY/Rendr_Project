import React from 'react';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';

const PrivacyPolicy = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3rem 0', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <Logo size="large" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginTop: '2rem', marginBottom: '0.5rem' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
            Last Updated: November 22, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto 4rem', padding: '0 1rem' }}>
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', lineHeight: '1.8' }}>
          
          <div style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '1rem', marginBottom: '2rem' }}>
            <p style={{ color: '#1e40af', margin: 0 }}>
              <strong>Your Privacy Matters:</strong> This Privacy Policy explains how Rendr collects, uses, shares, and protects your personal information. We are committed to transparency and compliance with privacy laws including GDPR and CCPA.
            </p>
          </div>

          <h2>1. Information We Collect</h2>
          <h3>1.1 Information You Provide</h3>
          <p>When you use Rendr, you may provide us with:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email, username, password</li>
            <li><strong>Profile Information:</strong> Display name, bio, profile picture, social links</li>
            <li><strong>Payment Information:</strong> Credit card details, billing address (handled by Stripe)</li>
            <li><strong>Content:</strong> Videos, thumbnails, descriptions</li>
            <li><strong>Communications:</strong> Support emails, feedback</li>
          </ul>

          <h3>1.2 Information Collected Automatically</h3>
          <p>When you use Rendr, we automatically collect:</p>
          <ul>
            <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent, features used, videos viewed</li>
            <li><strong>Cookies:</strong> See section 6 for cookie details</li>
            <li><strong>Log Data:</strong> Server logs including access times and errors</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide Services: Video verification, storage, showcase display, payment processing</li>
            <li>Improve Platform: Analyze usage, fix bugs, develop new features</li>
            <li>Communicate: Send receipts, notifications, updates, support responses</li>
            <li>Security: Detect fraud, prevent abuse, enforce Terms of Service</li>
            <li>Legal Compliance: Comply with laws, respond to legal requests</li>
            <li>Marketing: Send promotional emails (you can opt out)</li>
          </ul>

          <h2>3. How We Share Your Information</h2>
          <h3>3.1 Service Providers</h3>
          <p>We share information with third parties who help us operate:</p>
          <ul>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>Cloud Hosting:</strong> Store data and content</li>
            <li><strong>Email Service:</strong> Send emails</li>
            <li><strong>Analytics:</strong> Understand usage (anonymized when possible)</li>
          </ul>

          <h3>3.2 Public Information</h3>
          <p>The following information is public by default:</p>
          <ul>
            <li>Your username and display name</li>
            <li>Your profile picture and bio</li>
            <li>Your showcase page and public videos</li>
            <li>Video verification codes (anyone can verify)</li>
            <li>Social media links you choose to display</li>
          </ul>

          <h2>4. Your Privacy Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
          </ul>

          <h3>4.1 EU/EEA Users (GDPR Rights)</h3>
          <p>EU/EEA users have additional rights including the right to object to processing, restrict processing, and withdraw consent.</p>

          <h3>4.2 California Users (CCPA Rights)</h3>
          <p>California residents have the right to know what personal information we collect, access that information, request deletion, and opt out of "sale" of personal information. <strong>Note: We do NOT sell personal information.</strong></p>

          <h2>5. Data Security</h2>
          <p>We implement security measures including:</p>
          <ul>
            <li>HTTPS encryption for data in transit</li>
            <li>Encryption at rest for sensitive data</li>
            <li>Limited employee access to personal data</li>
            <li>Security monitoring and logging</li>
            <li>We never see your credit card details (Stripe handles all payment processing)</li>
          </ul>

          <h2>6. Cookies and Tracking</h2>
          <p>We use essential cookies to keep you logged in and remember settings. We also use analytics cookies (Google Analytics) to understand platform usage. You can control cookies through our cookie banner and browser settings.</p>

          <h2>7. Data Retention</h2>
          <p>We retain your information for as long as your account is active or as needed to provide services. When you delete your account:</p>
          <ul>
            <li><strong>Immediate:</strong> Account becomes inaccessible</li>
            <li><strong>30 days:</strong> Most data is deleted from active systems</li>
            <li><strong>90 days:</strong> Data is deleted from backups</li>
          </ul>

          <h2>8. Children's Privacy</h2>
          <p>Rendr is not intended for children under 18. We do not knowingly collect information from children under 18.</p>

          <h2>9. International Data Transfers</h2>
          <p>Rendr is based in the United States. If you access Rendr from outside the US, your information may be transferred to, stored in, and processed in the US.</p>

          <h2>10. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes by updating the "Last Updated" date and posting notice on the platform.</p>

          <h2>11. Contact Us</h2>
          <p>For privacy questions or to exercise your rights, contact us:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:privacy@rendr.com" style={{ color: '#667eea' }}>privacy@rendr.com</a></li>
            <li><strong>Support:</strong> <a href="mailto:support@rendr.com" style={{ color: '#667eea' }}>support@rendr.com</a></li>
            <li><strong>Contact Form:</strong> <a href="/contact" style={{ color: '#667eea' }}>rendr.com/contact</a></li>
            <li><strong>Mail:</strong> Rendr Privacy Team, Basin, WY 82410</li>
          </ul>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;