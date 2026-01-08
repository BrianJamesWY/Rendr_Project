// frontend/src/components/LandingPageUI.jsx - GLASSMORPHIC MASTERPIECE
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, PlayCircle, Zap, ShieldCheck, Database, Target, UploadCloud, 
  Globe, Crown, Film, Users, Award, ArrowRight, ChevronDown 
} from 'lucide-react';
import Logo from '../Logo.jsx';

const LandingPageUI = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { 
      icon: Shield, 
      title: 'Steganographic Watermarking', 
      desc: 'Invisible DCT-domain watermarks embedded directly into video pixels. Impossible to remove without destroying content.',
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      icon: ShieldCheck, 
      title: 'Blockchain Verification', 
      desc: 'Immutable proof of authenticity with tamper-proof timestamps. Optional blockchain registration.',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      icon: Zap, 
      title: 'Instant Verification', 
      desc: 'QR codes & unique verification codes. Verify authenticity in seconds from any device.',
      color: 'from-indigo-500 to-cyan-500'
    },
    { 
      icon: Database, 
      title: 'Creator Showcase', 
      desc: "World's first customizable creator portfolio. Organize by platform, topic, date, or any way you want.",
      color: 'from-orange-500 to-red-500'
    },
    { 
      icon: Target, 
      title: 'Bounty System', 
      desc: 'Crowdsource deepfake detection. Earn rewards for protecting content authenticity.',
      color: 'from-amber-500 to-yellow-500'
    },
    { 
      icon: Crown, 
      title: 'Pro Tiers', 
      desc: 'Free, Pro ($9.99), Enterprise. Unlimited videos, private showcases, advanced analytics.',
      color: 'from-rose-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 overflow-x-hidden">
      {/* Glass Nav */}
      <nav className={`glass-card-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl ${
        scrolled ? 'shadow-2xl border-white/20 py-3' : 'border-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo size="large" />
          <div className="hidden md:flex items-center gap-8">
            <Link to="#features" className="text-slate-300 hover:text-white font-medium transition-colors">Features</Link>
            <Link to="#how-it-works" className="text-slate-300 hover:text-white font-medium transition-colors">How It Works</Link>
            <Link to="/plans" className="text-slate-300 hover:text-white font-medium transition-colors">Pricing</Link>
            <Link to="/CreatorLogin" className="glass-button-primary px-6 py-2.5 rounded-2xl font-semibold hover:scale-[1.02] transition-all">
              Get Started
            </Link>
          </div>
          <button className="md:hidden p-2 glass-button-secondary rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-100 bg-clip-text text-transparent leading-tight mb-8 animate-float">
              Truth in Every
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">Pixel</span>
            </h1>
            <p className="text-2xl md:text-3xl text-slate-200 mb-12 leading-relaxed max-w-2xl mx-auto opacity-90 animate-fade-in-up">
              Invisible steganographic watermarking stops deepfakes dead. Verify authenticity instantly. 
              <span className="block mt-4 text-emerald-300 font-semibold">World's first creator showcase.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Link to="/CreatorLogin" className="hero-button-primary group">
                <span>🚀 Start Free Trial</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform ml-2 inline" />
              </Link>
              <Link to="#features" className="hero-button-secondary group">
                <PlayCircle className="w-7 h-7 inline mr-3 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Link>
            </div>

            <div className="flex items-center justify-center gap-12 mb-24 flex-wrap">
              <div className="glass-badge text-center">
                <div className="text-3xl mb-2">⛓️</div>
                <div className="font-bold text-white">Blockchain</div>
                <div className="text-slate-300 text-sm">Verified</div>
              </div>
              <div className="glass-badge text-center">
                <div className="text-3xl mb-2">🔒</div>
                <div className="font-bold text-white">Patent</div>
                <div className="text-slate-300 text-sm">Pending</div>
              </div>
              <div className="glass-badge text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="font-bold text-white">Instant</div>
                <div className="text-slate-300 text-sm">Verification</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/2 right-10 animate-pulse-slow opacity-20">
          <div className="w-72 h-72 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-20 left-20 animate-float-slow opacity-20">
          <div className="w-96 h-96 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-6xl font-black bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent mb-6">
              Why Creators Choose Rendr
            </h2>
            <p className="text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The only platform that combines invisible watermarking, blockchain proof, and creator showcases.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={feature.title}
                className="glass-card-features group hover:scale-[1.02] transition-all duration-500 cursor-pointer"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-all duration-300 ${
                  feature.color
                }`}>
                  <feature.icon className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed text-lg opacity-90">{feature.desc}</p>
                {hoveredFeature === i && (
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/90 to-transparent rounded-3xl flex items-end p-8">
                    <div className="text-white font-bold text-sm tracking-wider uppercase animate-pulse">
                      World's First
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-gradient-to-r from-slate-900/50 to-indigo-950/50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-center">
          <div className="glass-stat">
            <div className="text-5xl font-black text-emerald-400 mb-4">10M+</div>
            <div className="text-slate-300 font-semibold text-lg">Videos Verified</div>
          </div>
          <div className="glass-stat">
            <div className="text-5xl font-black text-purple-400 mb-4">50K+</div>
            <div className="text-slate-300 font-semibold text-lg">Creators Trust Us</div>
          </div>
          <div className="glass-stat">
            <div className="text-5xl font-black text-cyan-400 mb-4">99.9%</div>
            <div className="text-slate-300 font-semibold text-lg">Watermark Success</div>
          </div>
          <div className="glass-stat">
            <div className="text-5xl font-black text-amber-400 mb-4">0.2s</div>
            <div className="text-slate-300 font-semibold text-lg">Avg Verify Time</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="glass-card-hero mb-12 p-16">
            <h2 className="text-6xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-8">
              Ready to Fight Deepfakes?
            </h2>
            <p className="text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join the creators revolutionizing content authenticity. Free trial, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/CreatorLogin" className="hero-button-primary text-xl py-8 px-12">
                Start Protecting Content Now
              </Link>
              <Link to="/plans" className="hero-button-secondary text-xl py-8 px-12">
                Compare All Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-card-footer py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <Logo size="large" />
              <p className="text-slate-400 mt-6 leading-relaxed max-w-md">
                The world's first video verification platform with creator showcases. 
                Patent-pending steganographic watermarking.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-6">Product</h4>
              <div className="space-y-3 text-slate-400">
                <Link to="/plans" className="hover:text-white transition-colors">Pricing</Link>
                <Link to="/showcase" className="hover:text-white transition-colors">Showcase</Link>
                <Link to="/verify" className="hover:text-white transition-colors">Verify</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-6">Company</h4>
              <div className="space-y-3 text-slate-400">
                <Link to="/about" className="hover:text-white transition-colors">About</Link>
                <Link to="/careers" className="hover:text-white transition-colors">Careers</Link>
                <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-6">Legal</h4>
              <div className="space-y-3 text-slate-400">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-12 text-center text-slate-500">
            <p>&copy; 2026 Rendr. Patent Pending. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
        .glass-card-nav {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-card-features {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3rem 2.5rem;
          border-radius: 3rem;
          position: relative;
          overflow: hidden;
        }
        .glass-card-hero {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 3rem;
        }
        .glass-card-footer {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 3rem 3rem 0 0;
        }
        .glass-stat {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3rem 2rem;
          border-radius: 2.5rem;
        }
        .glass-badge {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 2rem 1.5rem;
          border-radius: 2rem;
          backdrop-filter: blur(20px);
        }
        .hero-button-primary {
          @apply bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl px-12 py-6 rounded-3xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.05] transition-all duration-300 flex items-center gap-3 font-[600];
        }
        .hero-button-secondary {
          @apply bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 text-white font-semibold px-12 py-6 rounded-3xl shadow-xl hover:shadow-white/20 hover:scale-[1.05] transition-all duration-300 flex items-center gap-3;
        }
        .glass-button-primary {
          @apply bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300;
        }
        .glass-button-secondary {
          @apply bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-slate-200 hover:text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-300;
        }
      `}</style>
    </div>
  );
};

export default LandingPageUI;
