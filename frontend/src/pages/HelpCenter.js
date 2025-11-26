import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';

const HelpCenter = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const categories = [
    { id: 'getting-started', icon: '🚀', title: 'Getting Started', subtitle: 'New to Rendr? Learn the basics' },
    { id: 'verification', icon: '✅', title: 'Video Verification', subtitle: 'How verification works' },
    { id: 'billing', icon: '💰', title: 'Billing & Payments', subtitle: 'Subscriptions, refunds, earnings' },
    { id: 'premium', icon: '🎬', title: 'Premium Content', subtitle: 'Creating and subscribing' }
  ];

  const faqs = {
    'getting-started': [
      {
        id: 'what-is-rendr',
        question: 'What is Rendr?',
        answer: 'Rendr is a video authentication platform that uses blockchain technology and DCT-domain watermarking to verify video authenticity. When you upload a video, we generate a unique verification code that proves the video hasn\'t been altered since upload. This helps combat deepfakes and misinformation.'
      },
      {
        id: 'create-account',
        question: 'How do I create an account?',
        answer: 'Click "Sign Up" in the top right corner, enter your email and create a password. You\'ll receive a verification email - click the link to activate your account. Then you can start uploading and verifying videos immediately!'
      },
      {
        id: 'account-tiers',
        question: 'What are the different account tiers?',
        answer: '**Free:** 10 verified videos, basic showcase, public folders only\n\n**Pro ($9.99/mo):** Unlimited videos, up to 3 premium folders, earn 80% from subscriptions\n\n**Enterprise ($49.99/mo):** Everything in Pro plus unlimited premium folders, 85% revenue share, hosted video, custom domain'
      }
    ],
    'verification': [
      {
        id: 'how-verification-works',
        question: 'How does video verification work?',
        answer: 'When you upload a video, we use DCT-domain steganographic watermarking to embed an invisible watermark into the video file. We then generate a blockchain hash and create a unique verification code (e.g., RN4X-8K2L). Anyone can use this code to verify the video hasn\'t been altered since you uploaded it.'
      },
      {
        id: 'verify-video',
        question: 'How do I verify a video?',
        answer: '1. Find the verification code (looks like RN4X-8K2L) on the video or showcase\n2. Go to rendr.com/verify\n3. Enter the code\n4. Upload or provide the video file\n5. We\'ll tell you if it matches the original (verified) or has been modified'
      },
      {
        id: 'supported-formats',
        question: 'What video formats are supported?',
        answer: 'We support MP4, MOV, AVI, and WebM formats. Maximum file size is 2GB for Free tier, 10GB for Pro/Enterprise. Videos must be at least 3 seconds long.'
      }
    ],
    'billing': [
      {
        id: 'payment-methods',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through Stripe. We do not store your card information - all payments are securely processed by Stripe.'
      },
      {
        id: 'update-payment',
        question: 'How do I update my payment method?',
        answer: 'Go to Settings → Billing and click "Update Payment Method." You can add a new card or update your existing card information.'
      },
      {
        id: 'payment-fails',
        question: 'What happens if my payment fails?',
        answer: 'If a payment fails, Stripe will automatically retry several times over the next few days. We\'ll email you to update your payment method. If payment continues to fail, your subscription will be cancelled and access will end.'
      }
    ],
    'premium': [
      {
        id: 'create-premium',
        question: 'How do I create a premium folder?',
        answer: '1. Upgrade to Pro or Enterprise\n2. Connect your Stripe account (Settings → Payment Account)\n3. Go to Showcase Editor → Premium tab\n4. Click "Create Premium Folder"\n5. Set name, description, price, and preview videos\n6. Assign videos to your premium folder\n7. Publish!'
      },
      {
        id: 'earnings',
        question: 'How much can I earn from premium folders?',
        answer: '**Pro tier:** You keep 80% of subscription revenue (we keep 20%)\n**Enterprise tier:** You keep 85% of subscription revenue (we keep 15%)\n\nExample: If you charge $9.99/month and have 50 subscribers, you earn $399.60/month (Pro) or $424.58/month (Enterprise).'
      },
      {
        id: 'payouts',
        question: 'When do I receive payouts?',
        answer: 'Payouts are processed through Stripe based on your chosen schedule (weekly or monthly). You\'ll receive earnings directly to your bank account. Minimum payout is $10.'
      }
    ]
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '4rem 0', marginBottom: '3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <Logo size="large" />
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>
            Help Center
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)' }}>
            Find answers to your questions about Rendr
          </p>
        </div>
      </div>

      {/* Categories */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                background: activeCategory === cat.id ? '#667eea' : 'white',
                color: activeCategory === cat.id ? 'white' : '#111827',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeCategory === cat.id ? '0 10px 30px rgba(102, 126, 234, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                transform: activeCategory === cat.id ? 'translateY(-2px)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== cat.id) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat.id) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{cat.title}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>{cat.subtitle}</div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>
          Frequently Asked Questions
        </h2>

        <div style={{ background: 'white', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {faqs[activeCategory]?.map((faq, index) => (
            <div key={faq.id} style={{ borderBottom: index < faqs[activeCategory].length - 1 ? '1px solid #e5e7eb' : 'none' }}>
              <button
                onClick={() => toggleFaq(faq.id)}
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827'
                }}
              >
                {faq.question}
                <span style={{ fontSize: '1.5rem', color: '#667eea', transition: 'transform 0.2s', transform: openFaq === faq.id ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openFaq === faq.id && (
                <div style={{ padding: '0 1.5rem 1.5rem', color: '#6b7280', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 3rem', padding: '0 1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '0.75rem', padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
            Still have questions?
          </h3>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
            We're here to help! Get in touch with our support team.
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: 'white',
              color: '#667eea',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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