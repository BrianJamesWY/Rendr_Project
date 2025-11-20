import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Navigation from '../components/Navigation';

function Plans() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Unlimited video uploads',
        'Basic video verification',
        'Perceptual hash fingerprinting',
        'Public showcase page',
        'Default watermark (left side)',
        'Video thumbnail extraction',
        'Folder organization'
      ],
      cta: 'Current Plan',
      color: '#6b7280'
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      features: [
        'Everything in Free, plus:',
        'Custom watermark positioning',
        'Private video section',
        'Custom branding on watermark',
        'Blockchain verification priority',
        'Advanced analytics',
        'Monetization tools'
      ],
      cta: 'Subscribe Now',
      color: '#667eea',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$49.99',
      period: '/month',
      features: [
        'Everything in Pro, plus:',
        'Video storage on our servers',
        'Custom storage limits',
        'API access',
        'White-label solutions',
        'Dedicated support',
        'Custom integrations'
      ],
      cta: 'Subscribe Now',
      color: '#10b981'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Navigation currentPage="plans" />
      
      <div style={{ padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Logo size="medium" />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem', marginTop: '2rem' }}>
              Choose Your Plan
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Start free and upgrade as you grow. All plans include our core verification technology.
            </p>
          </div>

          {/* Plans Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {plans.map((plan, index) => (
              <div 
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '2rem',
                  boxShadow: plan.popular ? '0 20px 25px -5px rgba(102, 126, 234, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: plan.popular ? '3px solid #667eea' : 'none',
                  position: 'relative',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.2s'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#667eea',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    🔥 COMING SOON
                  </div>
                )}

                <h3 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 'bold', 
                  color: plan.color,
                  marginBottom: '0.5rem',
                  marginTop: plan.popular ? '1rem' : '0'
                }}>
                  {plan.name}
                </h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#111827' }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span style={{ fontSize: '1rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                      /{plan.period}
                    </span>
                  )}
                </div>

                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  marginBottom: '2rem',
                  minHeight: '280px'
                }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ 
                      padding: '0.75rem 0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      color: '#374151',
                      fontSize: '0.9375rem'
                    }}>
                      <span style={{ color: plan.color, fontSize: '1.25rem', flexShrink: 0 }}>✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Free' ? '/dashboard' : '#'}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '1rem',
                    background: plan.name === 'Free' ? '#f3f4f6' : plan.color,
                    color: plan.name === 'Free' ? '#374151' : 'white',
                    textAlign: 'center',
                    textDecoration: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    transition: 'all 0.2s'
                  }}
                  onClick={(e) => {
                    if (plan.name !== 'Free') {
                      e.preventDefault();
                      alert('Coming soon! We\'ll notify you when this plan launches.');
                    }
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div style={{ 
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>
              Frequently Asked Questions
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                  Can I upgrade or downgrade anytime?
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                  Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the end of your billing cycle.
                </p>
              </div>

              <div>
                <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                  What payment methods do you accept?
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                  We accept all major credit cards, PayPal, and cryptocurrency payments for annual plans.
                </p>
              </div>

              <div>
                <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                  Is there a free trial for paid plans?
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                  Our Free plan lets you experience core features indefinitely. When paid plans launch, we'll offer a 14-day trial.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Plans;
