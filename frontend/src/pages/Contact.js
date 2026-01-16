import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #4f46e5 100%)';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    setTimeout(() => {
      setStatus('success');
      setIsSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(null), 5000);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const glassCard = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(14px)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    color: 'white',
    outline: 'none',
  };

  const contactMethods = [
    { icon: '📧', title: 'Email Support', content: 'support@rendr.com', link: 'mailto:support@rendr.com', subtitle: 'Response time: 24-48 hours' },
    { icon: '💬', title: 'Live Chat', content: 'Monday-Friday, 9am-5pm EST', subtitle: 'Coming soon!', disabled: true },
    { icon: '📖', title: 'Help Center', content: 'Browse FAQs and guides', link: '/help', subtitle: 'Find answers to common questions' },
    { icon: '🐛', title: 'Report a Bug', content: 'Use the form or email us', subtitle: 'We fix bugs quickly!' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: bgGradient }}>
      {/* Header */}
      <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
          Contact Us
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(226, 232, 240, 0.9)' }}>
          Have a question or need help? We're here for you.
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {/* Contact Methods */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {contactMethods.map((method, index) => (
            <div
              key={index}
              style={{
                ...glassCard,
                textAlign: 'center',
                opacity: method.disabled ? 0.6 : 1,
                cursor: method.link && !method.disabled ? 'pointer' : 'default',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              onClick={() => {
                if (method.link && !method.disabled) {
                  if (method.link.startsWith('mailto:')) {
                    window.location.href = method.link;
                  } else {
                    navigate(method.link);
                  }
                }
              }}
              onMouseEnter={(e) => {
                if (method.link && !method.disabled) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (method.link && !method.disabled) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                }
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{method.icon}</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
                {method.title}
              </h3>
              <p style={{ color: method.link ? '#8b5cf6' : 'rgba(156, 163, 175, 0.9)', marginBottom: '0.25rem', fontWeight: method.link ? '600' : 'normal' }}>
                {method.content}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(156, 163, 175, 0.7)' }}>{method.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Business Inquiries */}
        <div style={{ ...glassCard, marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem' }}>
            Business Inquiries
          </h3>
          <p style={{ color: 'rgba(156, 163, 175, 0.9)', marginBottom: '0.5rem' }}>
            For partnerships, press, or business inquiries:
          </p>
          <a href="mailto:business@rendr.com" style={{ color: '#8b5cf6', fontWeight: '600', fontSize: '1.125rem', textDecoration: 'none' }}>
            business@rendr.com
          </a>
        </div>

        {/* Contact Form */}
        <div style={glassCard}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
            Send us a message
          </h2>
          <p style={{ color: 'rgba(156, 163, 175, 0.9)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>We'll get back to you as soon as possible</p>

          {status === 'success' && (
            <div style={{
              background: 'rgba(6, 78, 59, 0.4)',
              border: '1px solid rgba(34, 197, 94, 0.5)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#86efac'
            }}>
              <strong>✓</strong> Message sent! We'll respond within 24-48 hours.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: 'rgba(226, 232, 240, 0.9)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Your Name *
              </label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: 'rgba(226, 232, 240, 0.9)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Your Email *
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: 'rgba(226, 232, 240, 0.9)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Subject *
              </label>
              <select name="subject" value={formData.subject} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="" style={{ background: '#0f172a' }}>Select a subject...</option>
                <option value="billing" style={{ background: '#0f172a' }}>Billing & Payments</option>
                <option value="technical" style={{ background: '#0f172a' }}>Technical Support</option>
                <option value="account" style={{ background: '#0f172a' }}>Account Issues</option>
                <option value="bug" style={{ background: '#0f172a' }}>Bug Report</option>
                <option value="feature" style={{ background: '#0f172a' }}>Feature Request</option>
                <option value="other" style={{ background: '#0f172a' }}>Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: 'rgba(226, 232, 240, 0.9)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.95))',
                color: 'white',
                border: '1px solid rgba(191, 219, 254, 0.5)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
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
