import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #4f46e5 100%)';

function Plans() {
  const navigate = useNavigate();
  
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
      color: '#94a3b8',
      borderColor: 'rgba(148, 163, 184, 0.5)',
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
      cta: 'Coming Soon',
      color: '#8b5cf6',
      borderColor: 'rgba(139, 92, 246, 0.6)',
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
      cta: 'Coming Soon',
      color: '#22d3ee',
      borderColor: 'rgba(34, 211, 238, 0.6)',
    }
  ];

  const glassCard = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(14px)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  };

  return (
    <div style={{ minHeight: '100vh', background: bgGradient }}>
      <div style={{ padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
              Choose Your Plan
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(226, 232, 240, 0.9)', maxWidth: '600px', margin: '0 auto' }}>
              Start free and upgrade as you grow. All plans include our core verification technology.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                marginTop: '1.5rem',
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

          {/* Plans Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {plans.map((plan, index) => (
              <div 
                key={index}
                style={{
                  ...glassCard,
                  border: plan.popular ? `2px solid ${plan.borderColor}` : `1px solid ${plan.borderColor}`,
                  position: 'relative',
                  transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: plan.popular ? `0 12px 40px rgba(139, 92, 246, 0.3)` : glassCard.boxShadow,
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                    color: 'white',
                    padding: '0.4rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                  }}>
                    🔥 COMING SOON
                  </div>
                )}

                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: plan.color,
                  marginBottom: '0.5rem',
                  marginTop: plan.popular ? '0.75rem' : '0'
                }}>
                  {plan.name}
                </h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span style={{ fontSize: '1rem', color: 'rgba(156, 163, 175, 0.9)', marginLeft: '0.25rem' }}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  marginBottom: '2rem',
                  minHeight: '260px'
                }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ 
                      padding: '0.6rem 0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      color: 'rgba(226, 232, 240, 0.9)',
                      fontSize: '0.9rem'
                    }}>
                      <span style={{ color: plan.color, fontSize: '1rem', flexShrink: 0 }}>✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Free' ? '/dashboard' : '/pricing'}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.875rem',
                    background: plan.name === 'Free' 
                      ? 'rgba(148, 163, 184, 0.2)' 
                      : `linear-gradient(135deg, ${plan.color}dd, ${plan.color}99)`,
                    color: 'white',
                    textAlign: 'center',
                    textDecoration: 'none',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    transition: 'all 0.2s',
                    border: `1px solid ${plan.borderColor}`,
                  }}
                  onClick={(e) => {
                    if (plan.name === 'Free') {
                      e.preventDefault();
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
            ...glassCard,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>
              Frequently Asked Questions
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontWeight: '600', color: '#a78bfa', marginBottom: '0.5rem' }}>
                  Can I upgrade or downgrade anytime?
                </h3>
                <p style={{ color: 'rgba(226, 232, 240, 0.8)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the end of your billing cycle.
                </p>
              </div>

              <div>
                <h3 style={{ fontWeight: '600', color: '#22d3ee', marginBottom: '0.5rem' }}>
                  What payment methods do you accept?
                </h3>
                <p style={{ color: 'rgba(226, 232, 240, 0.8)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  We accept all major credit cards, PayPal, and cryptocurrency payments for annual plans.
                </p>
              </div>

              <div>
                <h3 style={{ fontWeight: '600', color: '#fbbf24', marginBottom: '0.5rem' }}>
                  Is there a free trial for paid plans?
                </h3>
                <p style={{ color: 'rgba(226, 232, 240, 0.8)', fontSize: '0.9rem', lineHeight: 1.6 }}>
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
