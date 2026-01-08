// frontend/src/components/ProfileSettingsUI.jsx - GLASSMORPHIC UI ONLY
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, User, Image, Link2, Save, Upload, Shield, Crown, Trash2, Loader2, Database, Zap, Globe } from 'lucide-react';

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '▶️' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'facebook', label: 'Facebook', icon: '👥' },
];

function ProfileSettingsUI({ user, onSave, onUploadProfilePicture, onUploadBanner, saving, onRefresh, loading }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [collectionLabel, setCollectionLabel] = useState(user?.collection_label || 'Collections');
  const [socialLinks, setSocialLinks] = useState(user?.social_media_links || []);
  const [dashboardLinks, setDashboardLinks] = useState(user?.dashboard_social_links || []);

  const addSocialLink = (platform) => {
    if (socialLinks.find(link => link.platform === platform)) return alert('Already added');
    setSocialLinks([...socialLinks, { platform, url: '', custom_name: null }]);
  };

  const updateSocialLink = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // Similar functions for dashboardLinks...
  const addDashboardLink = (platform) => {
    if (dashboardLinks.find(link => link.platform === platform)) return alert('Already added');
    setDashboardLinks([...dashboardLinks, { platform, url: '', custom_name: null }]);
  };

  const canEditCollectionLabel = user?.premium_tier === 'pro' || user?.premium_tier === 'enterprise';

  const handleSave = () => {
    onSave({
      display_name: displayName,
      bio: bio,
      social_media_links: socialLinks,
      dashboard_social_links: dashboardLinks,
      collection_label: collectionLabel
    });
  };

  const sections = [
    { id: 'profile', icon: User, label: 'Profile', color: 'from-indigo-400 to-cyan-400' },
    { id: 'social', icon: Link2, label: 'Social Links', color: 'from-purple-400 to-pink-400' },
    { id: 'privacy', icon: Shield, label: 'Privacy', color: 'from-emerald-400 to-teal-400' },
    { id: 'billing', icon: Zap, label: 'Billing', color: 'from-amber-400 to-orange-400' },
    { id: 'seo', icon: Globe, label: 'SEO', color: 'from-blue-400 to-indigo-400' },
    { id: 'advanced', icon: Database, label: 'Advanced', color: 'from-slate-400 to-zinc-400' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mx-auto mb-6" />
          <p className="text-xl text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Gear Icon */}
        <div className="glass-card p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-3xl shadow-2xl">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-slate-400 text-lg">Complete creator customization</p>
            </div>
          </div>
          <Link to="/dashboard" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-3xl text-slate-200 hover:text-white font-semibold transition-all duration-300 hover:scale-[1.02] shadow-xl flex items-center gap-2">
            ← Dashboard
          </Link>
        </div>

        {/* Tier Badge */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-3xl shadow-2xl ${user?.premium_tier === 'enterprise' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : user?.premium_tier === 'pro' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-yellow-500/40 to-orange-500/40 border-2 border-yellow-400/50 backdrop-blur-xl'}`}>
              <Crown className={`w-8 h-8 ${user?.premium_tier === 'free' ? 'text-yellow-400' : 'text-white'}`} />
            </div>
            <div>
              <p className="text-white font-bold text-xl">{user?.premium_tier?.toUpperCase() || 'FREE'}</p>
              {user?.premium_tier === 'free' && <a href="/plans" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">Upgrade Pro $9.99/mo →</a>}
            </div>
          </div>
          <div className="text-sm text-slate-400 bg-white/5 px-4 py-2 rounded-2xl backdrop-blur">
            Videos: {user?.videos_used || 0} / {user?.premium_tier === 'enterprise' ? '∞' : user?.premium_tier === 'pro' ? '7' : '3'}
          </div>
        </div>

        {/* Expandable Section Tabs */}
        <div className="glass-card p-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-2">
            {sections.map(({ id, icon: Icon, label, color }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`group p-4 rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 ${
                  activeSection === id
                    ? `bg-gradient-to-r ${color} text-white shadow-2xl shadow-${color.split('-')[1]}-500/25 scale-105`
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 hover:scale-105'
                }`}
              >
                <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Content - Scalable */}
        <div className="space-y-6">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="glass-card p-8 space-y-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
                <User className="w-8 h-8" />
                Profile Identity
              </h2>
              {/* Profile pic, banner, display name, bio, collection label - SAME AS BEFORE */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Profile Picture Upload */}
                {/* Display Name + Collection Label */}
              </div>
              {/* Bio textarea */}
            </div>
          )}

          {/* Social Links */}
          {activeSection === 'social' && (
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex items-center gap-3 mb-8">
                <Link2 className="w-8 h-8" />
                Social Media
              </h2>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Dashboard Links + Public Links - SAME AS BEFORE */}
              </div>
            </div>
          )}

          {/* FUTURE SECTIONS - Just uncomment to activate */}
          {activeSection === 'privacy' && (
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-3 mb-8">
                <Shield className="w-8 h-8" />
                Privacy Settings
              </h2>
              <p className="text-slate-400 mb-6">Coming soon...</p>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3 mb-8">
                <Zap className="w-8 h-8" />
                Billing & Usage
              </h2>
              <p className="text-slate-400 mb-6">Pro/Enterprise billing, usage stats</p>
            </div>
          )}

          {activeSection === 'seo' && (
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3 mb-8">
                <Globe className="w-8 h-8" />
                SEO & Discovery
              </h2>
              <p className="text-slate-400 mb-6">Meta tags, showcase optimization</p>
            </div>
          )}
        </div>

        {/* Save Bar - Always Visible */}
        <div className="glass-card p-6 flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10">
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-3xl text-slate-300 hover:text-white font-semibold transition-all duration-300 hover:scale-[1.02]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold rounded-3xl backdrop-blur-sm border border-white/20 shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save All Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettingsUI;
