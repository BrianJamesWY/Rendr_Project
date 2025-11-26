import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    // TODO: Integrate with backend API
    // For now, simulate submission
    setTimeout(() => {
      setStatus('success');
      setIsSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Hide success message after 5 seconds
      setTimeout(() => setStatus(null), 5000);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Support',
      content: 'support@rendr.com',
      link: 'mailto:support@rendr.com',
      subtitle: 'Response time: 24-48 hours'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      content: 'Monday-Friday, 9am-5pm EST',
      subtitle: 'Coming soon!',
      disabled: true
    },
    {
      icon: '📖',
      title: 'Help Center',
      content: 'Browse FAQs and guides',
      link: '/help',
      subtitle: 'Find answers to common questions'
    },
    {
      icon: '🐛',
      title: 'Report a Bug',
      content: 'Use the form or email us',
      subtitle: 'We fix bugs quickly!'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '4rem 0', marginBottom: '3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <Logo size="large" />
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>
            Contact Us
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)' }}>
            Have a question or need help? We're here for you.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 4rem' }}>
        {/* Contact Methods */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          {contactMethods.map((method, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '0.75rem',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                opacity: method.disabled ? 0.6 : 1,
                cursor: method.link && !method.disabled ? 'pointer' : 'default',
                transition: 'transform 0.2s'
              }}
              onClick={() => {
                if (method.link && !method.disabled) {
                  if (method.link.startsWith('mailto:')) {
                    window.location.href = method.link;
                  } else {
                    window.location.href = method.link;
                  }
                }
              }}
              onMouseEnter={(e) => {
                if (method.link && !method.disabled) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (method.link && !method.disabled) {
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{method.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                {method.title}
              </h3>
              <p style={{ color: method.link ? '#667eea' : '#6b7280', marginBottom: '0.5rem', fontWeight: method.link ? '600' : 'normal' }}>
                {method.content}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{method.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Business Inquiries */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', marginBottom: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            Business Inquiries
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            For partnerships, press, or business inquiries:
          </p>
          <a
            href="mailto:business@rendr.com"
            style={{
              color: '#667eea',
              fontWeight: '600',
              fontSize: '1.125rem',
              textDecoration: 'none'
            }}
          >
            business@rendr.com
          </a>
        </div>

        {/* Contact Form */}
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            Send us a message
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>We'll get back to you as soon as possible</p>

          {/* Status Messages */}
          {status === 'success' && (
            <div style={{ background: '#d1fae5', border: '1px solid #10b981', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem', color: '#065f46' }}>
              <strong>✓</strong> Message sent! We'll respond within 24-48 hours.
            </div>
          )}
          {status === 'error' && (
            <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem', color: '#991b1b' }}>
              <strong>✗</strong> Something went wrong. Please try again.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Your Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Your Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Subject *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  background: 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Select a subject...</option>
                <option value="billing">Billing & Payments</option>
                <option value="technical">Technical Support</option>
                <option value="account">Account Issues</option>
                <option value="refund">Refund Request</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="abuse">Report Abuse</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) e.currentTarget.style.transform = 'none';
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;