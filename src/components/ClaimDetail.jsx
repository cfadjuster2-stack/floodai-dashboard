// ClaimDetail.jsx - Save this as src/components/ClaimDetail.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Trash2, File, Calendar, MapPin, Phone, Mail, DollarSign } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ClaimDetail({ claimId, onBack }) {
  const [claim, setClaim] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchClaimDetails();
    fetchFiles();
  }, [claimId]);

  const fetchClaimDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/claims/${claimId}`);
      const data = await response.json();
      if (data.success) {
        setClaim(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching claim:', error);
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/claims/${claimId}/files`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_URL}/api/claims/${claimId}/files`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        alert(`${selectedFiles.length} file(s) uploaded successfully!`);
        setSelectedFiles([]);
        fetchFiles();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (fileId, filename) => {
    window.open(`${API_URL}/api/claims/${claimId}/files/${fileId}`, '_blank');
  };

  const handleDelete = async (fileId, filename) => {
    if (!window.confirm(`Delete ${filename}?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/claims/${claimId}/files/${fileId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert('File deleted');
        fetchFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading claim details...</div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Claim not found</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: 'white',
              color: '#333',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '16px'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back to Claims
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
            Claim {claim.claim_number}
          </h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{
              padding: '6px 12px',
              backgroundColor: claim.claim_status === 'new' ? '#fff9c4' : '#c8e6c9',
              color: claim.claim_status === 'new' ? '#f57c00' : '#2e7d32',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {claim.claim_status}
            </span>
            <span style={{
              padding: '6px 12px',
              backgroundColor: claim.priority === 'high' ? '#ffcdd2' : '#e1bee7',
              color: claim.priority === 'high' ? '#c62828' : '#6a1b9a',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {claim.priority} priority
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Left Column - Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Policyholder Information */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
                Policyholder Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Name</div>
                  <div style={{ fontSize: '16px', color: '#333' }}>{claim.policyholder_name || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Policy Number</div>
                  <div style={{ fontSize: '16px', color: '#333' }}>{claim.policy_number || 'N/A'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail style={{ width: '16px', height: '16px', color: '#666' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Email</div>
                    <div style={{ fontSize: '14px', color: '#2196f3' }}>{claim.policyholder_email || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone style={{ width: '16px', height: '16px', color: '#666' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Phone</div>
                    <div style={{ fontSize: '14px', color: '#333' }}>{claim.policyholder_phone || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loss Information */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
                Loss Information
              </h2>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <MapPin style={{ width: '16px', height: '16px', color: '#666', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Loss Address</div>
                    <div style={{ fontSize: '16px', color: '#333' }}>
                      {claim.loss_address || 'N/A'}
                      {claim.loss_city && `, ${claim.loss_city}`}
                      {claim.loss_state && `, ${claim.loss_state}`}
                      {claim.loss_zip && ` ${claim.loss_zip}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar style={{ width: '16px', height: '16px', color: '#666' }} />
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Loss Date</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{formatDate(claim.loss_date)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign style={{ width: '16px', height: '16px', color: '#666' }} />
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Estimated Loss</div>
                      <div style={{ fontSize: '16px', color: '#4caf50', fontWeight: '600' }}>
                        {formatCurrency(claim.estimated_loss_amount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Files Section */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
                Documents & Files
              </h2>

              {/* Upload Area */}
              <div style={{ marginBottom: '24px', padding: '20px', border: '2px dashed #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}
                />
                {selectedFiles.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      {selectedFiles.length} file(s) selected:
                    </div>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={{ fontSize: '13px', color: '#333', marginLeft: '16px' }}>
                        • {file.name} ({formatFileSize(file.size)})
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: selectedFiles.length === 0 ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <Upload style={{ width: '16px', height: '16px' }} />
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>

              {/* Files List */}
              {files.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  No files uploaded yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {files.map(file => (
                    <div
                      key={file.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: '#fafafa'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <File style={{ width: '24px', height: '24px', color: '#2196f3' }} />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            {file.filename}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {formatFileSize(file.file_size)} • Uploaded {formatDate(file.uploaded_at)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleDownload(file.id, file.original_filename)}
                          style={{
                            padding: '8px',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Download"
                        >
                          <Download style={{ width: '16px', height: '16px', color: '#2196f3' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id, file.original_filename)}
                          style={{
                            padding: '8px',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Delete"
                        >
                          <Trash2 style={{ width: '16px', height: '16px', color: '#f44336' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Claim Assignment Details */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
                Claim Assignment
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {claim.tracking_number && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Tracking Number</div>
                    <div style={{ fontSize: '16px', color: '#333' }}>{claim.tracking_number}</div>
                  </div>
                )}
                {claim.edn && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>EDN</div>
                    <div style={{ fontSize: '16px', color: '#333' }}>{claim.edn}</div>
                  </div>
                )}
                {claim.date_assigned && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Date Assigned</div>
                    <div style={{ fontSize: '16px', color: '#333' }}>{formatDate(claim.date_assigned)}</div>
                  </div>
                )}
                {claim.ia_firm_file_number && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>IA Firm File #</div>
                    <div style={{ fontSize: '16px', color: '#333' }}>{claim.ia_firm_file_number}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Assigned To</div>
                  <div style={{ fontSize: '16px', color: '#333' }}>
                    {claim.assigned_adjuster_initials || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Report Date</div>
                  <div style={{ fontSize: '16px', color: '#333' }}>{formatDate(claim.report_date)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Created</div>
                  <div style={{ fontSize: '16px', color: '#333' }}>{formatDate(claim.created_at)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Last Updated</div>
                  <div style={{ fontSize: '16px', color: '#333' }}>{formatDate(claim.updated_at)}</div>
                </div>
              </div>
            </div>

            {/* Coverage Information */}
            {(claim.building_coverage || claim.contents_coverage || claim.mortgagee_name) && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
                  Coverage
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {claim.building_coverage && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Building Coverage</div>
                      <div style={{ fontSize: '16px', color: '#4caf50', fontWeight: '600' }}>{formatCurrency(claim.building_coverage)}</div>
                    </div>
                  )}
                  {claim.contents_coverage && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Contents Coverage</div>
                      <div style={{ fontSize: '16px', color: '#4caf50', fontWeight: '600' }}>{formatCurrency(claim.contents_coverage)}</div>
                    </div>
                  )}
                  {claim.building_deductible && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Building Deductible</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{formatCurrency(claim.building_deductible)}</div>
                    </div>
                  )}
                  {claim.contents_deductible && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Contents Deductible</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{formatCurrency(claim.contents_deductible)}</div>
                    </div>
                  )}
                  {claim.mortgagee_name && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Mortgagee</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{claim.mortgagee_name}</div>
                      {claim.mortgagee_address && (
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{claim.mortgagee_address}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Building Information */}
            {(claim.building_type || claim.flood_zone || claim.construction_type) && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
                  Building Info
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {claim.building_type && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Building Type</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{claim.building_type}</div>
                    </div>
                  )}
                  {claim.occupancy && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Occupancy</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{claim.occupancy}</div>
                    </div>
                  )}
                  {claim.construction_type && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Construction</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{claim.construction_type}</div>
                    </div>
                  )}
                  {claim.foundation && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Foundation</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{claim.foundation}</div>
                    </div>
                  )}
                  {claim.flood_zone && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Flood Zone</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{claim.flood_zone}</div>
                    </div>
                  )}
                  {claim.number_of_floors && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Floors</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{claim.number_of_floors}</div>
                    </div>
                  )}
                  {claim.date_of_construction && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '600' }}>Built</div>
                      <div style={{ fontSize: '16px', color: '#333' }}>{formatDate(claim.date_of_construction)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            {claim.activities && claim.activities.length > 0 && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#333' }}>
                  Activity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {claim.activities.map(activity => (
                    <div key={activity.id} style={{ paddingLeft: '16px', borderLeft: '2px solid #e0e0e0' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                        {activity.description}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {formatDate(activity.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimDetail;