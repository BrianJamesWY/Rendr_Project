import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #4f46e5 100%)';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const toggleFaq = (id) => setOpenFaq(openFaq === id ? null : id);

  const categories = [
    { id: 'getting-started', icon: '🚀', title: 'Getting Started', subtitle: 'New to Rendr? Learn the basics' },
    { id: 'verification', icon: '✅', title: 'Video Verification', subtitle: 'How verification works' },
    { id: 'billing', icon: '💰', title: 'Billing & Payments', subtitle: 'Subscriptions, refunds, earnings' },
    { id: 'premium', icon: '🎬', title: 'Premium Content', subtitle: 'Creating and subscribing' }
  ];

  const faqs = {
    'getting-started': [
      { id: 'what-is-rendr', question: 'What is Rendr?', answer: 'Rendr is a video authentication platform that uses blockchain technology and DCT-domain watermarking to verify video authenticity. When you upload a video, we generate a unique verification code that proves the video hasn\'t been altered since upload.' },
      { id: 'create-account', question: 'How do I create an account?', answer: 'Click "Sign Up" in the top right corner, enter your email and create a password. You\'ll receive a verification email - click the link to activate your account.' },
      { id: 'account-tiers', question: 'What are the different account tiers?', answer: 'Free: 10 verified videos, basic showcase\nPro ($9.99/mo): Unlimited videos, premium folders, 80% revenue share\nEnterprise ($49.99/mo): Everything in Pro plus custom domain, 85% revenue share' }
    ],
    'verification': [
      { id: 'how-verification-works', question: 'How does video verification work?', answer: 'We use DCT-domain steganographic watermarking to embed an invisible watermark into the video file. We then generate a blockchain hash and create a unique verification code. Anyone can use this code to verify the video hasn\'t been altered.' },
      { id: 'verify-video', question: 'How do I verify a video?', answer: '1. Find the verification code on the video\n2. Go to rendr.com/verify\n3. Enter the code\n4. Upload or provide the video file\n5. We\'ll tell you if it matches the original' },
      { id: 'supported-formats', question: 'What video formats are supported?', answer: 'We support MP4, MOV, AVI, and WebM formats. Maximum file size is 2GB for Free tier, 10GB for Pro/Enterprise.' }
    ],
    'billing': [
      { id: 'payment-methods', question: 'What payment methods do you accept?', answer: 'We accept all major credit and debit cards through Stripe. We do not store your card information.' },
      { id: 'update-payment', question: 'How do I update my payment method?', answer: 'Go to Settings → Billing and click "Update Payment Method."' },
      { id: 'payment-fails', question: 'What happens if my payment fails?', answer: 'Stripe will automatically retry. We\'ll email you to update your payment method. If it continues to fail, your subscription will be cancelled.' }
    ],
    'premium': [
      { id: 'create-premium', question: 'How do I create a premium folder?', answer: '1. Upgrade to Pro or Enterprise\n2. Connect your Stripe account\n3. Go to Showcase Editor → Premium tab\n4. Set name, description, price\n5. Assign videos and publish!' },
      { id: 'earnings', question: 'How much can I earn?', answer: 'Pro tier: 80% of subscription revenue\nEnterprise tier: 85% of subscription revenue' },
      { id: 'payouts', question: 'When do I receive payouts?', answer: 'Payouts are processed through Stripe weekly or monthly. Minimum payout is $10.' }
    ]
  };

  const glassCard = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(14px)',
    borderRadius: '1rem',
    padding: '1.5rem',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  };

  return (
    <div style={{ minHeight: '100vh', background: bgGradient }}>
      {/* Header */}
      <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
          Help Center
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(226, 232, 240, 0.9)' }}>
          Find answers to your questions about Rendr
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: '1px solid rgba(148, 163, 184, 0.5)',
            borderRadius: '0.5rem',
            color: 'rgba(226, 232, 240, 0.9)',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Categories */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                ...glassCard,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: activeCategory === cat.id ? '2px solid rgba(139, 92, 246, 0.6)' : glassCard.border,
                boxShadow: activeCategory === cat.id ? '0 12px 40px rgba(139, 92, 246, 0.3)' : glassCard.boxShadow,
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>{cat.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(156, 163, 175, 0.9)' }}>{cat.subtitle}</div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>
          Frequently Asked Questions
        </h2>

        <div style={{ ...glassCard, padding: 0, overflow: 'hidden' }}>
          {faqs[activeCategory]?.map((faq, index) => (
            <div key={faq.id} style={{ borderBottom: index < faqs[activeCategory].length - 1 ? '1px solid rgba(148, 163, 184, 0.2)' : 'none' }}>
              <button
                onClick={() => toggleFaq(faq.id)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'white'
                }}
              >
                {faq.question}
                <span style={{ fontSize: '1.25rem', color: '#8b5cf6', transition: 'transform 0.2s', transform: openFaq === faq.id ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openFaq === faq.id && (
                <div style={{ padding: '0 1.5rem 1.25rem', color: 'rgba(156, 163, 175, 0.9)', lineHeight: '1.6', whiteSpace: 'pre-line', fontSize: '0.9rem' }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{
          background: 'radial-gradient(circle at top left, rgba(139,92,246,0.4), rgba(15,23,42,0.9))',
          borderRadius: '1rem',
          padding: '2.5rem',
          textAlign: 'center',
          border: '1px solid rgba(139, 92, 246, 0.4)',
        }}>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem' }}>
            Still have questions?
          </h3>
          <p style={{ fontSize: '1rem', color: 'rgba(226, 232, 240, 0.9)', marginBottom: '1.5rem' }}>
            We're here to help! Get in touch with our support team.
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.95))',
              color: 'white',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              textDecoration: 'none',
              border: '1px solid rgba(191, 219, 254, 0.5)',
            }}
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
