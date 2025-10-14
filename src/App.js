import React, { useState, useEffect } from 'react';
import { Search, Home, AlertCircle, DollarSign, Clock, CheckCircle } from 'lucide-react';

// Add this constant at the top - uses environment variable or defaults to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClaims: 0,
    rcTotal: 0,
    paidTotal: 0,
    avgDaysToClose: 0
  });

  // Fetch claims - UPDATED TO USE API_URL
  useEffect(() => {
    fetch(`${API_URL}/api/claims`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClaims(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching claims:', err);
        setLoading(false);
      });
  }, []);

  // Fetch stats - UPDATED TO USE API_URL
  useEffect(() => {
    fetch(`${API_URL}/api/claims/stats`)
      .then(res => res.json())
     .then(data => {
      if (data.success) {
    setStats({
      totalClaims: parseInt(data.data.total_claims) || 0,
      rcTotal: parseFloat(data.data.total_estimated_loss) || 0,
      paidTotal: 0, // Not available in current backend
      avgDaysToClose: 0 // Not available in current backend
    });
  }
})
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, Icon, color }) => (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{title}</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</p>
        </div>
        <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: '#e3f2fd' }}>
          <Icon style={{ width: '24px', height: '24px', color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>FloodAI Claims Dashboard</h1>
          <p style={{ fontSize: '14px', color: '#666' }}>Hurricane Helene - 2024</p>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', gap: '32px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 12px',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid #2196f3' : '2px solid transparent',
              background: 'none',
              color: activeTab === 'overview' ? '#2196f3' : '#666',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <Home style={{ width: '16px', height: '16px' }} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 12px',
              border: 'none',
              borderBottom: activeTab === 'claims' ? '2px solid #2196f3' : '2px solid transparent',
              background: 'none',
              color: activeTab === 'claims' ? '#2196f3' : '#666',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <AlertCircle style={{ width: '16px', height: '16px' }} />
            Claims
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {activeTab === 'overview' && (
          <div>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <StatCard title="Total Claims" value={stats.totalClaims} Icon={Home} color="#2196f3" />
              <StatCard title="RC Total" value={formatCurrency(stats.rcTotal)} Icon={DollarSign} color="#4caf50" />
              <StatCard title="Total Paid" value={formatCurrency(stats.paidTotal)} Icon={CheckCircle} color="#9c27b0" />
              <StatCard title="Avg Days" value={stats.avgDaysToClose} Icon={Clock} color="#ff9800" />
            </div>

            {/* Success Message */}
            <div style={{ backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '8px', padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2e7d32', marginBottom: '8px' }}>
                🎉 Dashboard is Live!
              </h3>
              <p style={{ color: '#2e7d32' }}>
                Your FloodAI dashboard is showing real data from {stats.totalClaims} claims worth {formatCurrency(stats.rcTotal)}!
              </p>
            </div>
          </div>
        )}

        {activeTab === 'claims' && (
          <div>
            {/* Search */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px', marginBottom: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '10px', width: '20px', height: '20px', color: '#999' }} />
                <input
                  type="text"
                  placeholder="Search by file # or insured name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Claims Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f5f5f5' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>File #</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Insured</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Adjuster</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>RC</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {claims
                    .filter(claim => 
                      claim.policyholder_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      claim.claim_number?.includes(searchTerm)
                    )
                    .map((claim, index) => (
                      <tr key={claim.id} style={{ borderTop: index > 0 ? '1px solid #eee' : 'none' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#2196f3' }}>{claim.claim_number}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{claim.policyholder_name || 'N/A'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          <span style={{ padding: '4px 8px', backgroundColor: '#e1bee7', color: '#6a1b9a', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                            {claim.assigned_adjuster_initials || 'Unassigned'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          <span style={{ padding: '4px 8px', backgroundColor: claim.claim_status === 'approved' ? '#c8e6c9' : '#fff9c4', color: claim.claim_status === 'approved' ? '#2e7d32' : '#f57c00', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                            {claim.claim_status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{claim.rc ? formatCurrency(claim.rc) : '$0'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{claim.paid ? formatCurrency(claim.paid) : '$0'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;