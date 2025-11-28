import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Verify from "./pages/Verify";
import Upload from "./pages/Upload";
import Showcase from "./pages/Showcase";
import CreatorLogin from "./pages/CreatorLogin";
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Admin from "./pages/Admin";
import ShowcaseEditor from "./pages/ShowcaseEditor";
import ProfileSettings from "./pages/ProfileSettings";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotificationSettings from "./pages/NotificationSettings";
import InvestorAnalytics from "./pages/InvestorAnalytics";
import HelpCenter from "./pages/HelpCenter";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import StripeConnect from "./pages/StripeConnect";
import StripeConnectReturn from "./pages/StripeConnectReturn";
import Earnings from "./pages/Earnings";
import MySubscriptions from "./pages/MySubscriptions";
import LandingPage from "./pages/LandingPage";
import TermsOfService from "./pages/TermsOfService";
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";
import Bounties from "./pages/Bounties";
import PostBounty from "./pages/PostBounty";
import ClaimBounty from "./pages/ClaimBounty";
import MyVideos from "./pages/MyVideos";
import Logo from "./components/Logo";
import CookieConsent from "./components/CookieConsent";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem'
    }}>
      <Logo size="large" />
      
      <div style={{ 
        maxWidth: '600px', 
        textAlign: 'center',
        marginTop: '2rem'
      }}>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '1rem'
        }}>
          Welcome to Rendr
        </h2>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Revolutionary video verification platform using blockchain technology to authenticate content and detect tampering.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/CreatorLogin"
            style={{
              padding: '0.875rem 1.5rem',
              background: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
            }}
          >
            Creator Login
          </a>
          
          <a 
            href="/verify"
            style={{
              padding: '0.875rem 1.5rem',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              border: '2px solid #667eea'
            }}
          >
            Verify Video
          </a>
          
          <a 
            href="/upload"
            style={{
              padding: '0.875rem 1.5rem',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              border: '2px solid #667eea'
            }}
          >
            Upload Video
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/CreatorLogin" element={<CreatorLogin />} />
          <Route path="/creator-login" element={<CreatorLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/ceo-access-b7k9m2x" element={<Admin />} />
          <Route path="/showcase-editor" element={<ShowcaseEditor />} />
          <Route path="/settings" element={<ProfileSettings />} />
          <Route path="/notification-settings" element={<NotificationSettings />} />
          <Route path="/analytics" element={<InvestorAnalytics />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/stripe-connect" element={<StripeConnect />} />
          <Route path="/stripe-connect/return" element={<StripeConnectReturn />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/my-subscriptions" element={<MySubscriptions />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/subscription-checkout" element={<SubscriptionCheckout />} />
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/refunds" element={<RefundPolicy />} />
          <Route path="/bounties" element={<Bounties />} />
          <Route path="/bounties/post" element={<PostBounty />} />
          <Route path="/bounties/:bountyId/claim" element={<ClaimBounty />} />
          <Route path="/@:username" element={<Showcase />} />
          <Route path="/:username" element={<Showcase />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsent />
      </BrowserRouter>
    </div>
  );
}

export default App;
