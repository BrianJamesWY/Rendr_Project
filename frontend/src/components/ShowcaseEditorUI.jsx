// frontend/src/components/ShowcaseEditorUI.jsx - YOUR LOGIC + GLASSMORPHIC UI
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Palette, Grid3X3, Type, Folder, Zap, Crown, Save, Loader2, Monitor, Smartphone, Play, Hash, Tag, Eye, Copy, Film, Youtube, Instagram, Tiktok } from 'lucide-react';

function ShowcaseEditorUI({
  user, videos, folders, settings, onUpdateSettings, onSaveSettings, onOpenEditModal,
  editingVideo, videoDescription, videoExternalLink, videoPlatform, videoTags,
  onUpdateVideo, onSaveVideo, showEditModal, onCloseEditModal, showCreateFolderModal,
  newFolderName, newFolderDescription, onUpdateFolder, onCreateFolder, onCloseCreateFolder,
  themes, isPro, saving, onRefresh, FREE_FONTS, PRO_FONTS, loading
}) {
  const [activeTab, setActiveTab] = useState('appearance');
  const [previewDevice, setPreviewDevice] = useState('desktop');

  const updateSetting = (key, value) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    onUpdateSettings({
      ...settings,
      theme: themeName,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      primaryColor: theme.primaryColor,
      cardBackgroundColor: theme.cardBackgroundColor
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-8">
        <div className="glass-card p-12 text-center max-w-md">
          <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Showcase Editor</h2>
          <p className="text-slate-400">Loading your videos and settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="glass-card p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Showcase Editor
              </h1>
              <p className="text-slate-400 text-lg">World's first creator portfolio builder</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/dashboard" className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-slate-200 hover:text-white font-semibold transition-all duration-300 hover:scale-[1.02] shadow-xl flex items-center gap-2">
              ← Dashboard
            </Link>
            <button onClick={onRefresh} className="px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-xl border border-indigo-400/30 rounded-2xl text-indigo-200 hover:text-white font-semibold transition-all duration-300 hover:scale-[1.02] shadow-xl flex items-center gap-2">
              <Film className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Tier Status */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-3xl shadow-2xl ${isPro ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-yellow-500/40 to-orange-500/40 border-2 border-yellow-400/50 backdrop-blur-xl'}`}>
              <Crown className={`w-8 h-8 ${isPro ? 'text-white' : 'text-yellow-400'}`} />
            </div>
            <div>
              <p className="text-white font-bold text-xl">{user?.premium_tier?.toUpperCase() || 'FREE'}</p>
              {!isPro && <a href="/plans" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold mt-1 inline-block">Unlock Pro Features →</a>}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
            <Monitor className={`w-4 h-4 ${previewDevice === 'desktop' ? 'text-indigo-400' : 'text-slate-400'}`} onClick={() => setPreviewDevice('desktop')} className="cursor-pointer hover:scale-110 transition-transform" />
            <Smartphone className={`w-5 h-5 ${previewDevice === 'mobile' ? 'text-indigo-400' : 'text-slate-400'}`} onClick={() => setPreviewDevice('mobile')} className="cursor-pointer hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Main Editor Layout */}
        <div className="grid lg:grid-cols-5 gap-8 h-[85vh]">
          {/* Left: Tabs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-bold text-white text-xl mb-6 flex items-center gap-3">
                <Palette className="w-6 h-6" />
                Editor Tabs
              </h3>
              {[
                { id: 'appearance', icon: Palette, label: 'Appearance', pro: false },
                { id: 'layout', icon: Grid3X3, label: 'Layout', pro: false },
                { id: 'typography', icon: Type, label: 'Typography', pro: false },
                { id: 'content', icon: Play, label: 'Content', pro: false },
                { id: 'folders', icon: Folder, label: 'Folders', pro: false },
                { id: 'effects', icon: Zap, label: 'Effects', pro: true }
              ].map(({ id, icon: Icon, label, pro }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  disabled={pro && !isPro}
                  className={`w-full p-4 rounded-2xl flex items-center gap-3 mb-3 transition-all group hover:scale-[1.02] ${
                    activeTab === id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  } ${pro && !isPro ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">{label}</span>
                  {pro && !isPro && <span className="ml-auto text-xs bg-purple-500/20 px-2 py-1 rounded-full">Pro</span>}
                </button>
              ))}
            </div>

            {/* Quick Themes */}
            <div className="glass-card p-6">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Themes
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                {Object.keys(themes).map(themeName => (
                  <button
                    key={themeName}
                    onClick={() => applyTheme(themeName)}
                    className={`p-3 rounded-xl transition-all hover:scale-105 shadow-lg ${
                      settings.theme === themeName 
                        ? 'ring-4 ring-indigo-400/50 shadow-indigo-500/25 scale-105' 
                        : 'hover:shadow-xl'
                    }`}
                    style={{
                      background: themes[themeName].backgroundColor,
                      color: themes[themeName].textColor
                    }}
                  >
                    <div className="text-xs font-bold capitalize mb-1">{themes[themeName].name}</div>
                    <div className="w-full h-8 rounded-lg" style={{ 
                      background: `linear-gradient(45deg, ${themes[themeName].primaryColor}, ${themes[themeName].cardBackgroundColor})`,
                      opacity: 0.7 
                    }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Live Preview */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white text-xl flex items-center gap-3">
                  <Eye className="w-6 h-6" />
                  Live Preview
                </h3>
                <div className={`px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm border ${
                  settings.layout === 'grid' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' :
                  settings.layout === 'list' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' :
                  'bg-purple-500/20 text-purple-200 border-purple-400/30'
                }`}>
                  {settings.layout} {settings.gridColumns} columns
                </div>
              </div>
              
              {/* Preview Frame */}
              <div className={`flex-1 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 relative ${
                previewDevice === 'mobile' ? 'w-80 h-[500px] mx-auto border-8 border-slate-800/50' : 'h-[550px]'
              }`} 
                style={{
                  background: settings.gradientEnabled 
                    ? `linear-gradient(${settings.gradientDirection}, ${settings.gradientColor1}, ${settings.gradientColor2})` 
                    : settings.backgroundColor
                }}
              >
                <div className="p-8 h-full flex flex-col font-[Inter]" style={{ fontFamily: settings.fontFamily }}>
                  {/* Profile Header */}
                  <div className="text-center mb-12">
                    <div className="w-28 h-28 bg-gradient-to-br from-white/30 to-white/10 rounded-full mx-auto mb-6 border-4 border-white/40 shadow-2xl" 
                         style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} />
                    <h1 className="text-4xl font-bold mb-2" style={{ color: settings.textColor }}>
                      {user?.display_name || 'Creator Name'}
                    </h1>
                    <p className="text-xl opacity-80" style={{ color: settings.secondaryTextColor || settings.textColor }}>
                      Verified Collection • {videos.length} Videos
                    </p>
                  </div>

                  {/* Video Grid Preview */}
                  <div className={`grid ${settings.layout === 'grid' ? `grid-cols-${settings.gridColumns}` : 'grid-cols-1'} gap-6 flex-1`}>
                    {videos.slice(0, settings.gridColumns * 2 || 6).map((video, i) => (
                      <div key={video.video_id || i}
                           className="group cursor-pointer rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all duration-300 h-64 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/30 hover:border-white/50"
                           style={{ 
                             backgroundColor: settings.cardBackgroundColor,
                             boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                           }}
                           onClick={() => onOpenEditModal(video)}
                      >
                        <div className="h-4/5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 flex items-center justify-center group-hover:opacity-90 transition-all">
                          <Play className="w-16 h-16 text-white/90 group-hover:scale-110 transition-transform" />
                          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                            {video.platform || 'Rendr'}
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold mb-2 truncate" style={{ color: settings.textColor }}>
                            {video.title || 'Video Title'}
                          </h4>
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-indigo-500/30 rounded-full text-xs font-semibold" 
                                  style={{ color: settings.primaryColor, backgroundColor: `${settings.primaryColor}20` }}>
                              Rendr Verified
                            </span>
                            {video.tags?.slice(0,2).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-white/20 rounded-full text-xs opacity-80" 
                                    style={{ color: settings.textColor }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Tab Content */}
            <div className="glass-card p-6 h-96 overflow-y-auto">
              <h4 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                {activeTab === 'appearance' && <Palette className="w-5 h-5" />}
                {activeTab === 'layout' && <Grid3X3 className="w-5 h-5" />}
                {activeTab === 'typography' && <Type className="w-5 h-5" />}
                {activeTab === 'content' && <Play className="w-5 h-5" />}
                {activeTab === 'folders' && <Folder className="w-5 h-5" />}
                {activeTab === 'effects' && <Zap className="w-5 h-5" />}
                {['appearance', 'layout', 'typography', 'content', 'folders', 'effects'][activeTab]} Settings
              </h4>

              {/* Appearance Tab Example */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Background Color</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        value={settings.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        className="w-14 h-14 rounded-2xl border-2 border-white/30 cursor-pointer hover:border-white/50 shadow-lg"
                      />
                      <input 
                        type="text" 
                        value={settings.backgroundColor}
                        onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                        className="flex-1 p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur text-white placeholder-slate-400 font-mono"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Primary Color</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="w-14 h-14 rounded-2xl border-2 border-white/30 cursor-pointer hover:border-white/50 shadow-lg"
                      />
                      <input 
                        type="text" 
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="flex-1 p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur text-white placeholder-slate-400 font-mono"
                      />
                    </div>
                  </div>

                  {isPro && (
                    <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl">
                      <label className="flex items-center gap-3 mb-3">
                        <input 
                          type="checkbox" 
                          checked={settings.gradientEnabled}
                          onChange={(e) => updateSetting('gradientEnabled', e.target.checked)}
                          className="w-5 h-5 text-purple-500 rounded border-white/30"
                        />
                        <span className="text-white font-semibold">Pro: Gradient Background</span>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="glass-card p-6 pt-8 border-t border-white/10 space-y-3">
              <button 
                onClick={onRefresh}
                className="w-full p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-slate-200 hover:text-white font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 shadow-xl"
              >
                <Film className="w-5 h-5" />
                Refresh Videos & Folders
              </button>
              <button 
                onClick={onSaveSettings}
                disabled={saving}
                className="w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'Saving...' : 'Save All Showcase Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Modals - YOUR EXACT MODAL LOGIC + Glass Design */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex items-center gap-3">
                  <Film className="w-9 h-9" />
                  Edit Video Metadata
                </h2>
                <button onClick={onCloseEditModal} className="p-2 hover:bg-white/10 rounded-2xl transition-all">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Youtube className="w-4 h-4" />
                    Platform
                  </label>
                  <select 
                    value={videoPlatform} 
                    onChange={(e) => onUpdateVideo('platform', e.target.value)}
                    className="w-full p-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur text-white placeholder-slate-400"
                  >
                    <option value="">Select Platform</option>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter/X</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Video Description</label>
                  <textarea
                    value={videoDescription}
                    onChange={(e) => onUpdateVideo('description', e.target.value)}
                    rows={3}
                    className="w-full p-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur text-white placeholder-slate-400 resize-vertical"
                    placeholder="Describe this verified video..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    External Link
                  </label>
                  <input
                    type="url"
                    value={videoExternalLink}
                    onChange={(e) => onUpdateVideo('externalLink', e.target.value)}
                    className="w-full p-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur text-white placeholder-slate-400"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Tags
                    </label>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(videoTags);
                        alert('Tags copied!');
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-xl text-indigo-200 text-xs font-semibold transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                  <input
                    type="text"
                    value={videoTags}
                    onChange={(e) => onUpdateVideo('tags', e.target.value)}
                    placeholder="Rendr, TruthContent, Verified"
                    className="w-full p-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur text-white placeholder-slate-400"
                  />
                </div>

                <div className="flex gap-4 pt-6 border-t border-white/10">
                  <button
                    onClick={onCloseEditModal}
                    className="flex-1 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-slate-300 hover:text-white font-semibold transition-all duration-300 hover:scale-[1.02]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSaveVideo}
                    className="flex-1 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Save Video Metadata
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Folder Modal - similar glassmorphic treatment */}
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card max-w-md w-full p-8 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  New Showcase Folder
                </h2>
                <button onClick={onCloseCreateFolder} className="p-2 hover:bg-white/10 rounded-2xl transition-all">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Folder Name</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => onUpdateFolder('name', e.target.value)}
                    className="w-full p-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur text-white placeholder-slate-400"
                    placeholder="Travel Videos, Product Reviews..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                  <textarea
                    value={newFolderDescription}
                    onChange={(e) => onUpdateFolder('description', e.target.value)}
                    rows={3}
                    className="w-full p-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur text-white placeholder-slate-400 resize-vertical"
                    placeholder="Describe this collection..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={onCloseCreateFolder}
                    className="flex-1 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-slate-300 hover:text-white font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onCreateFolder}
                    className="flex-1 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-indigo-500/25 transition-all"
                  >
                    Create Folder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowcaseEditorUI;
