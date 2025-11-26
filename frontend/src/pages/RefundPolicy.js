import React from 'react';
import Navigation from '../components/Navigation';
import Logo from '../components/Logo';

const RefundPolicy = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3rem 0', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <Logo size="large" />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginTop: '2rem', marginBottom: '0.5rem' }}>
            Refund Policy
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
            Last Updated: November 22, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto 4rem', padding: '0 1rem' }}>
        <div style={{ background: 'white', borderRadius: '0.75rem', padding: '3rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', lineHeight: '1.8' }}>
          
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
            At Rendr, we want you to be completely satisfied with our service. This Refund Policy explains when refunds are available and how to request one.
          </p>

          <h2>1. Rendr Subscription Refunds (Pro & Enterprise)</h2>
          <h3>1.1 7-Day Money-Back Guarantee</h3>
          <p>If you're not satisfied with your Pro or Enterprise subscription, you can request a full refund within <strong>7 days</strong> of your initial purchase.</p>
          <ul>
            <li><strong>Eligible:</strong> First-time subscribers to Pro or Enterprise tiers</li>
            <li><strong>Timeline:</strong> Request must be made within 7 days of initial charge</li>
            <li><strong>Process:</strong> Contact support@rendr.com with your account email and reason for refund</li>
            <li><strong>Refund:</strong> Full refund to original payment method within 5-10 business days</li>
          </ul>

          <h3>1.2 Subsequent Billing Periods</h3>
          <p>After the first 7 days, subscriptions are <strong>non-refundable</strong>. However, you can:</p>
          <ul>
            <li>Cancel anytime from your account settings</li>
            <li>Continue using the service until the end of your current billing period</li>
            <li>You won't be charged for the next billing period after cancellation</li>
          </ul>

          <h3>1.3 Annual Subscriptions</h3>
          <p>Annual subscriptions follow the same 7-day money-back guarantee. After 7 days, annual subscriptions are non-refundable, but you can cancel to prevent auto-renewal.</p>

          <h2>2. Premium Content Subscriptions (Created by Other Users)</h2>
          <h3>2.1 No Refunds After Access</h3>
          <p>When you subscribe to another creator's premium content, refunds are <strong>not available</strong> if you have:</p>
          <ul>
            <li>Accessed any premium video in the subscription</li>
            <li>Downloaded any premium content</li>
            <li>Held the subscription for more than 48 hours</li>
          </ul>

          <h3>2.2 Refund Exceptions</h3>
          <p>Refunds may be issued in cases of:</p>
          <ul>
            <li><strong>Technical Issues:</strong> You were charged but couldn't access the content due to our system error</li>
            <li><strong>Fraudulent Charges:</strong> Unauthorized charges to your account</li>
            <li><strong>Duplicate Charges:</strong> You were charged twice for the same subscription</li>
            <li><strong>Creator Removed Content:</strong> Creator deleted premium folder before you could access it</li>
          </ul>

          <h3>2.3 Cancellation</h3>
          <p>You can cancel creator subscriptions anytime. You'll continue to have access until the end of your current billing period.</p>

          <h2>3. One-Time Purchases (Pay-Per-Verification)</h2>
          <p>One-time verification purchases are <strong>non-refundable</strong> once the verification process is complete. Refunds may be issued if:</p>
          <ul>
            <li>Verification failed due to system error (not user error)</li>
            <li>You were charged but verification was not processed</li>
            <li>Technical issue prevented verification completion</li>
          </ul>

          <h2>4. How to Request a Refund</h2>
          <h3>Step 1: Contact Support</h3>
          <p>Email <a href="mailto:support@rendr.com" style={{ color: '#667eea', fontWeight: '600' }}>support@rendr.com</a> with:</p>
          <ul>
            <li>Your account email address</li>
            <li>Transaction ID or invoice number</li>
            <li>Reason for refund request</li>
            <li>Any supporting documentation (screenshots if technical issue)</li>
          </ul>

          <h3>Step 2: Review Process</h3>
          <p>We will review your request within <strong>2-3 business days</strong> and respond with:</p>
          <ul>
            <li>Approval: Refund will be processed</li>
            <li>Additional Information Needed: We may ask for more details</li>
            <li>Denial: Explanation of why refund cannot be issued</li>
          </ul>

          <h3>Step 3: Refund Processing</h3>
          <p>If approved:</p>
          <ul>
            <li>Refund initiated within 1-2 business days</li>
            <li>Credit appears on your payment method within 5-10 business days</li>
            <li>Confirmation email sent when refund is processed</li>
          </ul>

          <h2>5. Chargebacks</h2>
          <p><strong>Please contact us before filing a chargeback!</strong></p>
          <p>If you file a chargeback without contacting us first:</p>
          <ul>
            <li>Your account may be immediately suspended</li>
            <li>You may lose access to all content and services</li>
            <li>Future signups may be blocked</li>
          </ul>
          <p>We want to resolve issues directly. Most problems can be solved by contacting support.</p>

          <h2>6. Exceptions & Special Circumstances</h2>
          <h3>6.1 Extenuating Circumstances</h3>
          <p>In rare cases of serious extenuating circumstances (medical emergency, death of subscriber, etc.), we may issue refunds outside this policy at our discretion. Contact support with documentation.</p>

          <h3>6.2 Creator Payout Impact</h3>
          <p>If you receive a refund for a creator subscription:</p>
          <ul>
            <li>Creator will not receive payout for that subscription</li>
            <li>If creator was already paid, refund may come from Rendr</li>
            <li>Creators are notified of refunded subscriptions</li>
          </ul>

          <h2>7. Free Tier</h2>
          <p>The Free tier has no charges, so no refunds are applicable. You can delete your account anytime from account settings.</p>

          <h2>8. Changes to This Refund Policy</h2>
          <p>We may update this Refund Policy from time to time. Continued use of Rendr after changes constitutes acceptance of the updated policy.</p>

          <h2>9. Contact Information</h2>
          <p>For refund requests or questions about this policy:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:support@rendr.com" style={{ color: '#667eea' }}>support@rendr.com</a></li>
            <li><strong>Subject Line:</strong> "Refund Request - [Your Account Email]"</li>
            <li><strong>Contact Form:</strong> <a href="/contact" style={{ color: '#667eea' }}>rendr.com/contact</a></li>
          </ul>

          <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', borderLeft: '4px solid #667eea' }}>
            <p style={{ margin: 0, fontWeight: '600' }}>Need Help?</p>
            <p style={{ margin: '0.5rem 0 0 0' }}>We're here to help resolve any issues. Contact our support team at support@rendr.com before requesting a refund - we can often solve problems quickly!</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;