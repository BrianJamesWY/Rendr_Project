// frontend/src/components/DashboardUI.jsx
import React from 'react';
import {
  Bell,
  ChevronRight,
  Video,
  Users,
  Shield,
  TrendingUp,
  Activity,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

// Glassmorphic card component
const GlassCard = ({ children, className = '' }) => (
  <div
    className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl hover:bg-white/[0.07] transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

// Stat card component
const StatCard = ({ icon: Icon, label, value, trend, accentColor = 'cyan' }) => {
  const glowColors = {
    cyan: 'shadow-cyan-500/20 hover:shadow-cyan-500/40',
    purple: 'shadow-purple-500/20 hover:shadow-purple-500/40',
    green: 'shadow-green-500/20 hover:shadow-green-500/40',
    blue: 'shadow-blue-500/20 hover:shadow-blue-500/40',
  };

  const accentColors = {
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
  };

  return (
    <GlassCard className={`p-5 ${glowColors[accentColor]} hover:shadow-xl`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 ${accentColors[accentColor]}`} />
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">
              {label}
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{value}</div>
          {trend && (
            <div
              className={`text-xs flex items-center gap-1 ${
                trend.positive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              <TrendingUp
                className={`w-3 h-3 ${trend.positive ? '' : 'rotate-180'}`}
              />
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

// Mini chart component
const MiniChart = ({ data, color = 'cyan' }) => {
  const colorMap = {
    cyan: 'stroke-cyan-400',
    purple: 'stroke-purple-400',
    blue: 'stroke-blue-400',
  };

  if (!data || data.length < 2) {
    return <div className="w-full h-16" />;
  }

  const maxVal = Math.max(...data, 1);
  
  return (
    <svg className="w-full h-16" viewBox="0 0 100 40" preserveAspectRatio="none">
      <polyline
        fill="none"
        className={`${colorMap[color]} opacity-60`}
        strokeWidth="2"
        points={data
          .map((val, i) => `${(i / (data.length - 1)) * 100},${40 - (val / maxVal) * 35}`)
          .join(' ')}
      />
    </svg>
  );
};

export default function DashboardUI(props) {
  const {
    // Core data
    user,
    videos,
    folders,
    analytics,
    error,
    chartData,
    activities,

    // Callbacks for navigation
    onGoDashboard,
    onGoUpload,
    onGoVerify,
    onGoSettings,
    onGoShowcase,
    onGoShowcaseEditor,
    onGoPlans,
    onGoBounties,
    onGoAnalytics,
    onLogout,

    // Children (for QuotaIndicator or additional sections)
    children,
  } = props;

  const totalVideos = videos?.length || 0;
  const folderCount = folders?.length || 0;
  const verifications =
    analytics?.total_page_views != null
      ? analytics.total_page_views
      : totalVideos;
  const revenueDisplay = '$0';

  const displayName = user?.display_name || user?.username || 'Creator';
  const tier = (user?.premium_tier || 'free')
    .charAt(0)
    .toUpperCase() + (user?.premium_tier || 'free').slice(1);

  const trends = {
    videos: { positive: true, value: '+0%' },
    users: { positive: true, value: '+0%' },
    verifications: { positive: true, value: '+0%' },
    revenue: { positive: true, value: '+0%' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Top Navigation Bar */}
      <header className="bg-slate-950/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={onGoDashboard}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RENDR Studio</span>
            </button>
            <nav className="hidden md:flex items-center gap-1">
              <button
                type="button"
                onClick={onGoDashboard}
                className="px-3 py-1.5 text-sm text-white bg-white/10 rounded-md font-medium"
              >
                Overview
              </button>
              <button
                type="button"
                onClick={onGoDashboard}
                className="px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-all"
              >
                Videos
              </button>
              <button
                type="button"
                onClick={onGoBounties}
                className="px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-all"
              >
                Bounties
              </button>
              <button
                type="button"
                onClick={onGoAnalytics}
                className="px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-all"
              >
                Analytics
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {displayName}
                </div>
                <div className="text-xs text-white/60">{tier}</div>
                <div className="flex gap-2 mt-1 justify-end">
                  <button
                    type="button"
                    onClick={onGoSettings}
                    className="text-[11px] text-cyan-300 hover:text-cyan-200 underline"
                  >
                    Profile Settings
                  </button>
                  <button
                    type="button"
                    onClick={onGoShowcase}
                    className="text-[11px] text-purple-300 hover:text-purple-200 underline"
                  >
                    View Showcase
                  </button>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
                <button type="button" onClick={onLogout}>
                  ⏻
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-white/10 bg-slate-950/20 backdrop-blur-sm min-h-[calc(100vh-73px)]">
          <div className="p-4 space-y-6">
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-3">
                Main
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={onGoDashboard}
                  className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-md text-sm font-medium w-full text-left"
                >
                  <Activity className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={onGoDashboard}
                  className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-md text-sm transition-all w-full text-left"
                >
                  <Video className="w-4 h-4" />
                  <span>Videos</span>
                </button>
                <button
                  type="button"
                  onClick={onGoShowcaseEditor}
                  className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-md text-sm transition-all w-full text-left"
                >
                  <Shield className="w-4 h-4" />
                  <span>Showcase Editor</span>
                </button>
              </nav>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-3">
                Analytics
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={onGoVerify}
                  className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-md text-sm transition-all w-full text-left"
                >
                  <Shield className="w-4 h-4" />
                  <span>Verifications</span>
                </button>
                <button
                  type="button"
                  onClick={onGoAnalytics}
                  className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-md text-sm transition-all w-full text-left"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Analytics</span>
                </button>
                <button
                  type="button"
                  onClick={onGoPlans}
                  className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-md text-sm transition-all w-full text-left"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Plans / Upgrade</span>
                </button>
              </nav>
            </div>
            <GlassCard className="p-4">
              <div className="text-xs font-semibold text-white/60 mb-3">
                System Status
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Uptime</span>
                  <span className="text-xs font-mono text-green-400">
                    99.9%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Queue</span>
                  <span className="text-xs font-mono text-cyan-400">
                    12 jobs
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Storage</span>
                  <span className="text-xs font-mono text-purple-400">
                    2.4 TB
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        </aside>

        {/* Main Dashboard Area */}
        <main className="flex-1 p-6 max-w-[1800px]">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Video}
              label="Total Videos"
              value={totalVideos.toString()}
              trend={trends.videos}
              accentColor="cyan"
            />
            <StatCard
              icon={Users}
              label="Folders"
              value={folderCount.toString()}
              trend={trends.users}
              accentColor="purple"
            />
            <StatCard
              icon={Shield}
              label="Verifications"
              value={verifications.toString()}
              trend={trends.verifications}
              accentColor="blue"
            />
            <StatCard
              icon={DollarSign}
              label="Revenue (30d)"
              value={revenueDisplay}
              trend={trends.revenue}
              accentColor="green"
            />
          </div>

          {/* Chart + Quick Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Verification Chart */}
            <GlassCard className="xl:col-span-2 p-5 shadow-cyan-500/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Verification Activity
                  </h2>
                  <p className="text-xs text-white/60 mt-1">
                    Recent verification traffic
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-all">
                    24h
                  </button>
                  <button className="px-3 py-1.5 text-xs text-white bg-white/10 rounded-md">
                    7d
                  </button>
                  <button className="px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-all">
                    30d
                  </button>
                </div>
              </div>
              <div className="relative h-48">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent rounded-lg" />
                <MiniChart data={chartData} color="cyan" />
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-white/40 px-2">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs text-white/60">Verifications</span>
                  <span className="text-xs font-mono text-white">
                    {verifications}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-xs text-white/60">Deep Scans</span>
                  <span className="text-xs font-mono text-white">342</span>
                </div>
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard className="p-5 shadow-purple-500/10">
              <h2 className="text-lg font-bold text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onGoUpload}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/20 rounded-lg text-white text-sm font-medium transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-cyan-400" />
                    Upload Video
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                </button>
                <button
                  type="button"
                  onClick={onGoVerify}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    Verify Code
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                </button>
                <button
                  type="button"
                  onClick={onGoShowcaseEditor}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    Customize Showcase
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                </button>
                <button
                  type="button"
                  onClick={onGoPlans}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    View Plans / Upgrade
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                </button>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/60">
                    System Health
                  </span>
                  <span className="text-xs font-mono text-green-400">
                    {error ? 'Degraded' : 'Optimal'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      error ? 'w-[65%] bg-yellow-400' : 'w-[95%] bg-gradient-to-r from-green-500 to-cyan-500'
                    } rounded-full`}
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Quota / extras from container */}
          {children}

          {/* Recent Activity */}
          <GlassCard className="mt-6 p-5 shadow-blue-500/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Recent Activity
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Latest verified and uploaded videos
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {activities && activities.length > 0 ? (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/[0.07] border border-white/10 rounded-lg transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.status === 'success'
                            ? 'bg-green-500/20 text-green-400'
                            : activity.status === 'processing'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {activity.status === 'success' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : activity.status === 'processing' ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium">
                          <span className="text-white/80">
                            {activity.user}
                          </span>{' '}
                          <span className="text-white/60">
                            {activity.action}
                          </span>
                        </div>
                        <div className="text-xs text-white/40 mt-0.5 font-mono">
                          {activity.code}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/40 font-mono">
                        {activity.time}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-white/40 text-center py-6">
                  No recent activity yet.
                </div>
              )}
            </div>
          </GlassCard>

          {/* Backend Status */}
          {error && (
            <GlassCard className="mt-6 p-6 border-yellow-500/20 shadow-yellow-500/10">
              <div className="flex items-center gap-3 text-yellow-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm mb-1">
                    Backend Status
                  </div>
                  <div className="text-xs">{error}</div>
                </div>
              </div>
            </GlassCard>
          )}
        </main>
      </div>
    </div>
  );
}
