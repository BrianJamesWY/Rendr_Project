import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function CEOBackdoor() {
  const navigate = useNavigate();
  const [ceoData, setCeoData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/creator-login');
      return;
    }
    
    loadCEOData();
  }, [token, navigate]);

  const loadCEOData = async () => {
    try {
      setLoading(true);
      
      // Load CEO dashboard
      const ceoRes = await axios.get(`${BACKEND_URL}/api/admin/ceo/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCeoData(ceoRes.data);
      
      // Load system diagnostics
      try {
        const diagRes = await axios.get(`${BACKEND_URL}/api/diagnostics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSystemHealth(diagRes.data);
      } catch (err) {
        console.warn('Diagnostics unavailable');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load CEO data:', error);
      if (error.response?.status === 403) {
        setError('🔒 Access Denied - CEO access required');
      } else {
        setError('Failed to load CEO data');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <div style={{ color: '#00ff00', fontFamily: 'monospace' }}>LOADING CLASSIFIED DATA...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⛔</div>
          <div style={{ color: '#ff0000', fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'monospace' }}>
            {error}
          </div>
          <div style={{ color: '#666', marginBottom: '2rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
            This page is restricted to CEO level access only.<br/>
            All unauthorized access attempts are logged and monitored.
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#ff0000',
              color: 'white',
              border: '2px solid #ff0000',
              borderRadius: '4px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            EXIT
          </button>
        </div>
      </div>
    );
  }

  if (!ceoData) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#00ff00', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(180deg, #1a0000 0%, #000 100%)', 
        borderBottom: '2px solid #ff0000',
        padding: '1.5rem 0'
      }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#ff0000', marginBottom: '0.5rem' }}>
                ⚠️ CLASSIFIED - CEO EYES ONLY ⚠️
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff00', margin: 0 }}>
                🔐 RENDR MASTER CONTROL
              </h1>
              <div style={{ fontSize: '0.875rem', color: '#00ff00', opacity: 0.7, marginTop: '0.5rem' }}>
                System Administrator Dashboard // Full Platform Access
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: '#ff0000',
                border: '1px solid #ff0000',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            >
              EXIT
            </button>
          </div>
          
          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
            {['overview', 'moderation', 'system', 'database', 'security'].map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                style={{
                  padding: '0.5rem 1rem',
                  background: activeSection === section ? '#ff0000' : 'transparent',
                  color: activeSection === section ? '#000' : '#00ff00',
                  border: '1px solid ' + (activeSection === section ? '#ff0000' : '#00ff00'),
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  fontWeight: activeSection === section ? 'bold' : 'normal',
                  textTransform: 'uppercase'
                }}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '2rem auto', padding: '0 2rem' }}>
        
        {/* Overview */}
        {activeSection === 'overview' && (
          <>
            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <MetricCard 
                label="TOTAL USERS"
                value={ceoData.users?.total || 0}
                subtext={`+${ceoData.users?.new || 0} new (${ceoData.users?.growth_rate || 0}% growth)`}
                status="operational"
              />
              <MetricCard 
                label="TOTAL VIDEOS"
                value={ceoData.videos?.total || 0}
                subtext={`+${ceoData.videos?.new || 0} new (${ceoData.videos?.growth_rate || 0}% growth)`}
                status="operational"
              />
              <MetricCard 
                label="VERIFICATIONS"
                value={ceoData.verifications?.total || 0}
                subtext={`${ceoData.verifications?.recent || 0} recent`}
                status="operational"
              />
              <MetricCard 
                label="SECURITY RATE"
                value={`${(100 - (ceoData.security?.blocked_attempts_percentage || 0)).toFixed(1)}%`}
                subtext={`${ceoData.security?.duplicate_attempts || 0} threats blocked`}
                status="secure"
              />
            </div>

            {/* Tier Distribution */}
            <DataTable 
              title="USER TIER DISTRIBUTION"
              data={Object.entries(ceoData.tier_distribution || {}).map(([tier, count]) => ({
                tier: tier.toUpperCase(),
                count,
                percentage: ((count / ceoData.users?.total) * 100).toFixed(1)
              }))}
              columns={['TIER', 'COUNT', 'PERCENTAGE']}
            />
          </>
        )}

        {/* Moderation */}
        {activeSection === 'moderation' && ceoData.ceo_metrics && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatusCard
                label="USERS WITH STRIKES"
                value={ceoData.ceo_metrics.moderation?.users_with_strikes || 0}
                color="#ffff00"
              />
              <StatusCard
                label="TEMP BANNED"
                value={ceoData.ceo_metrics.moderation?.temp_banned || 0}
                color="#ff9900"
              />
              <StatusCard
                label="PERM BANNED"
                value={ceoData.ceo_metrics.moderation?.perm_banned || 0}
                color="#ff0000"
              />
            </div>

            {/* Top Creators */}
            {ceoData.ceo_metrics.top_creators && (
              <div style={{ background: '#0a0a0a', border: '1px solid #00ff00', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#00ff00' }}>
                  TOP CREATORS
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #333' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00ff00' }}>RANK</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00ff00' }}>USERNAME</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#00ff00' }}>TIER</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', color: '#00ff00' }}>VIDEOS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ceoData.ceo_metrics.top_creators.map((creator, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                        <td style={{ padding: '0.75rem', color: '#00ff00' }}>#{i + 1}</td>
                        <td style={{ padding: '0.75rem', color: '#00ff00' }}>{creator.username}</td>
                        <td style={{ padding: '0.75rem', color: '#00ff00', textTransform: 'uppercase' }}>
                          {creator.tier}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#00ff00' }}>
                          {creator.video_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* System Health */}
        {activeSection === 'system' && systemHealth && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <SystemCard
                title="BACKEND API"
                status={systemHealth.backend?.status || 'unknown'}
                data={[
                  { label: 'Status', value: systemHealth.backend?.status || 'N/A' },
                  { label: 'Uptime', value: systemHealth.backend?.uptime || 'N/A' }
                ]}
              />
              <SystemCard
                title="MONGODB"
                status={systemHealth.mongodb?.status || 'unknown'}
                data={[
                  { label: 'Status', value: systemHealth.mongodb?.status || 'N/A' },
                  { label: 'Databases', value: systemHealth.mongodb?.databases || 'N/A' }
                ]}
              />
              <SystemCard
                title="REDIS QUEUE"
                status={systemHealth.redis?.status || 'unknown'}
                data={[
                  { label: 'Status', value: systemHealth.redis?.status || 'N/A' },
                  { label: 'Workers', value: systemHealth.redis?.workers || 'N/A' }
                ]}
              />
            </div>

            {/* C2PA & Blockchain Adoption */}
            {ceoData.ceo_metrics?.system_health && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <AdoptionCard
                  title="C2PA ADOPTION"
                  total={ceoData.ceo_metrics.system_health.c2pa_adoption?.total || 0}
                  percentage={ceoData.ceo_metrics.system_health.c2pa_adoption?.percentage || 0}
                />
                <AdoptionCard
                  title="BLOCKCHAIN ADOPTION"
                  total={ceoData.ceo_metrics.system_health.blockchain_adoption?.total || 0}
                  percentage={ceoData.ceo_metrics.system_health.blockchain_adoption?.percentage || 0}
                />
              </div>
            )}
          </>
        )}

        {/* Database */}
        {activeSection === 'database' && systemHealth?.mongodb && (
          <div style={{ background: '#0a0a0a', border: '1px solid #00ff00', borderRadius: '8px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#00ff00' }}>
              DATABASE STATUS
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <DataPoint label="Status" value={systemHealth.mongodb.status || 'N/A'} />
              <DataPoint label="Databases" value={systemHealth.mongodb.databases || 'N/A'} />
              <DataPoint label="Collections" value="8 active" />
              <DataPoint label="Total Videos" value={ceoData.videos?.total || 0} />
              <DataPoint label="Total Users" value={ceoData.users?.total || 0} />
              <DataPoint label="Expired Videos" value={ceoData.ceo_metrics?.system_health?.expired_videos || 0} />
            </div>
          </div>
        )}

        {/* Security */}
        {activeSection === 'security' && (
          <div style={{ background: '#0a0a0a', border: '1px solid #ff0000', borderRadius: '8px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#ff0000' }}>
              SECURITY OVERVIEW
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <SecurityMetric
                label="Duplicate Attempts Blocked"
                value={ceoData.security?.duplicate_attempts || 0}
                color="#ff0000"
              />
              <SecurityMetric
                label="Active Bans (Temp)"
                value={ceoData.ceo_metrics?.moderation?.temp_banned || 0}
                color="#ff9900"
              />
              <SecurityMetric
                label="Active Bans (Perm)"
                value={ceoData.ceo_metrics?.moderation?.perm_banned || 0}
                color="#ff0000"
              />
              <SecurityMetric
                label="Users with Strikes"
                value={ceoData.ceo_metrics?.moderation?.users_with_strikes || 0}
                color="#ffff00"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ label, value, subtext, status }) {
  const statusColors = {
    operational: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    secure: '#00ffff'
  };
  
  return (
    <div style={{ 
      background: '#0a0a0a', 
      border: `2px solid ${statusColors[status]}`,
      borderRadius: '8px', 
      padding: '1.5rem'
    }}>
      <div style={{ fontSize: '0.75rem', color: statusColors[status], marginBottom: '0.5rem', fontWeight: 'bold' }}>
        {label}
      </div>
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: statusColors[status], marginBottom: '0.5rem' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#666' }}>
        {subtext}
      </div>
    </div>
  );
}

function StatusCard({ label, value, color }) {
  return (
    <div style={{ background: '#0a0a0a', border: `1px solid ${color}`, borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', fontWeight: 'bold', color, marginBottom: '0.5rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.875rem', color }}>
        {label}
      </div>
    </div>
  );
}

function SystemCard({ title, status, data }) {
  const statusColor = status === 'healthy' || status === 'operational' ? '#00ff00' : 
                     status === 'degraded' ? '#ffff00' : '#ff0000';
  
  return (
    <div style={{ background: '#0a0a0a', border: `1px solid ${statusColor}`, borderRadius: '8px', padding: '1.5rem' }}>
      <h4 style={{ fontSize: '1rem', color: statusColor, marginBottom: '1rem', fontWeight: 'bold' }}>
        {title}
      </h4>
      {data.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#666' }}>{item.label}:</span>
          <span style={{ color: '#00ff00' }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function AdoptionCard({ title, total, percentage }) {
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #00ff00', borderRadius: '8px', padding: '1.5rem' }}>
      <h4 style={{ fontSize: '1rem', color: '#00ff00', marginBottom: '1rem' }}>{title}</h4>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff00', marginBottom: '0.5rem' }}>
        {total.toLocaleString()}
      </div>
      <div style={{ fontSize: '1.25rem', color: '#00ffff' }}>
        {percentage}% of total
      </div>
    </div>
  );
}

function DataPoint({ label, value }) {
  return (
    <div style={{ padding: '1rem', background: '#000', border: '1px solid #333', borderRadius: '4px' }}>
      <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff00' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function SecurityMetric({ label, value, color }) {
  return (
    <div style={{ padding: '1.5rem', background: '#000', border: `2px solid ${color}`, borderRadius: '4px', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color, marginBottom: '0.5rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.875rem', color }}>
        {label}
      </div>
    </div>
  );
}

function DataTable({ title, data, columns }) {
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #00ff00', borderRadius: '8px', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#00ff00' }}>{title}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333' }}>
            {columns.map(col => (
              <th key={col} style={{ padding: '0.75rem', textAlign: 'left', color: '#00ff00' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
              <td style={{ padding: '0.75rem', color: '#00ff00' }}>{row.tier}</td>
              <td style={{ padding: '0.75rem', color: '#00ff00' }}>{row.count}</td>
              <td style={{ padding: '0.75rem', color: '#00ff00' }}>{row.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CEOBackdoor;
