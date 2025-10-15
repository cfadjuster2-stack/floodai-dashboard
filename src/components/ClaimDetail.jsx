import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Trash2, Calendar, DollarSign, MapPin, Phone, Mail, FileText, AlertCircle, Home, Wrench, Building2, Layers } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://floodai-production.up.railway.app';

function ClaimDetail({ claimId, onBack }) {
  const id = claimId;
  const [claim, setClaim] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchClaimDetails();
    fetchFiles();
  }, [id]);

  const fetchClaimDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/claims/${id}`);
      const result = await response.json();
      setClaim(result.data || result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching claim:', error);
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/claims/${id}/files`);
      const result = await response.json();
      setFiles(result.data || result);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
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
      await fetch(`${API_URL}/api/claims/${id}/files`, {
        method: 'POST',
        body: formData,
      });
      setSelectedFiles([]);
      fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await fetch(`${API_URL}/api/claims/${id}/files/${fileId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await fetch(`${API_URL}/api/claims/${id}/files/${fileId}`, {
        method: 'DELETE',
      });
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>Loading...</div>;
  }

  if (!claim) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>Claim not found</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#666',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '24px',
            fontSize: '14px'
          }}
        >
          <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '8px' }} />
          Back to Claims
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '12px' }}>
            Claim {claim.claim_number || `FL-2025-${String(claim.id).padStart(5, '0')}`}
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ padding: '6px 12px', backgroundColor: '#fff9c4', color: '#f57c00', borderRadius: '16px', fontSize: '13px', fontWeight: '500' }}>
              {claim.status || 'new'}
            </span>
            <span style={{ padding: '6px 12px', backgroundColor: '#e1bee7', color: '#6a1b9a', borderRadius: '16px', fontSize: '13px', fontWeight: '500' }}>
              {claim.priority || 'normal'} priority
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Policyholder Information */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Policyholder Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>NAME</p>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>{claim.policyholder_name || claim.insured_name || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>POLICY NUMBER</p>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>{claim.policy_number || 'N/A'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <Mail style={{ width: '20px', height: '20px', color: '#999', marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Email</p>
                    <p style={{ fontSize: '14px', color: '#2196f3' }}>{claim.policyholder_email || claim.email || 'N/A'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <Phone style={{ width: '20px', height: '20px', color: '#999', marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Phone</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{claim.policyholder_phone || claim.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loss Information */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Loss Information</h2>
              
              <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '20px' }}>
                <MapPin style={{ width: '20px', height: '20px', color: '#999', marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>LOSS ADDRESS</p>
                  <p style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>{claim.loss_address || 'N/A'}</p>
                  {(claim.loss_city || claim.loss_state || claim.loss_zip) && (
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      {claim.loss_city}, {claim.loss_state} {claim.loss_zip}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <Calendar style={{ width: '20px', height: '20px', color: '#999', marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Loss Date</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{formatDate(claim.loss_date || claim.date_of_loss)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <DollarSign style={{ width: '20px', height: '20px', color: '#999', marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Estimated Loss</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#4caf50' }}>{formatCurrency(claim.estimated_loss_amount || claim.estimated_loss)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage Information */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Coverage & Deductibles</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#1976d2', marginBottom: '6px', fontWeight: '600' }}>BUILDING COVERAGE</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565c0' }}>{formatCurrency(claim.building_coverage)}</p>
                  <p style={{ fontSize: '12px', color: '#1976d2', marginTop: '8px' }}>Deductible: {formatCurrency(claim.building_deductible)}</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#7b1fa2', marginBottom: '6px', fontWeight: '600' }}>CONTENTS COVERAGE</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#6a1b9a' }}>{formatCurrency(claim.contents_coverage)}</p>
                  <p style={{ fontSize: '12px', color: '#7b1fa2', marginTop: '8px' }}>Deductible: {formatCurrency(claim.contents_deductible)}</p>
                </div>
              </div>

              {claim.mortgagee_name && (
                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: '600' }}>MORTGAGEE</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{claim.mortgagee_name}</p>
                  {claim.mortgagee_address && (
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{claim.mortgagee_address}</p>
                  )}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Property Details</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {claim.building_type && (
                  <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                    <Building2 style={{ width: '18px', height: '18px', color: '#999', marginTop: '2px' }} />
                    <div>
                      <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>BUILDING TYPE</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{claim.building_type}</p>
                    </div>
                  </div>
                )}
                {claim.occupancy && (
                  <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                    <Home style={{ width: '18px', height: '18px', color: '#999', marginTop: '2px' }} />
                    <div>
                      <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>OCCUPANCY</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{claim.occupancy}</p>
                    </div>
                  </div>
                )}
                {claim.foundation && (
                  <div>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>FOUNDATION</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{claim.foundation}</p>
                  </div>
                )}
                {claim.construction_type && (
                  <div>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>CONSTRUCTION TYPE</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{claim.construction_type}</p>
                  </div>
                )}
                {claim.flood_zone && (
                  <div>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>FLOOD ZONE</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#d32f2f', backgroundColor: '#ffebee', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>{claim.flood_zone}</p>
                  </div>
                )}
                {claim.number_of_floors && (
                  <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                    <Layers style={{ width: '18px', height: '18px', color: '#999', marginTop: '2px' }} />
                    <div>
                      <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>NUMBER OF FLOORS</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{claim.number_of_floors}</p>
                    </div>
                  </div>
                )}
                {claim.date_of_construction && (
                  <div>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>DATE OF CONSTRUCTION</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{formatDate(claim.date_of_construction)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents & Files */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Documents & Files</h2>
              
              <div style={{ border: '2px dashed #ddd', borderRadius: '8px', padding: '24px', marginBottom: '20px', backgroundColor: '#fafafa' }}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ marginBottom: '12px', fontSize: '14px' }}
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: uploading || selectedFiles.length === 0 ? '#ccc' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: uploading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <Upload style={{ width: '16px', height: '16px' }} />
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>

              {files.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '32px 0', fontSize: '14px' }}>No files uploaded yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {files.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText style={{ width: '20px', height: '20px', color: '#999' }} />
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{file.filename}</p>
                          <p style={{ fontSize: '12px', color: '#999' }}>
                            {new Date(file.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleDownload(file.id, file.filename)}
                          style={{
                            padding: '8px',
                            color: '#2196f3',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Download style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          style={{
                            padding: '8px',
                            color: '#f44336',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Assignment & Metadata */}
          <div>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Claim Assignment</h2>
              
              {claim.tracking_number && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>TRACKING NUMBER</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Carrier Claim Number: {claim.tracking_number}</p>
                </div>
              )}

              {claim.ia_firm_file_number && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>IA FIRM FILE #</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Claim File Number: {claim.ia_firm_file_number}</p>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>ASSIGNED TO</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{claim.assigned_to || claim.assigned_adjuster_initials || 'Unassigned'}</p>
              </div>

              {claim.date_assigned && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>DATE ASSIGNED</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{formatDate(claim.date_assigned)}</p>
                </div>
              )}

              {claim.report_date && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>REPORT DATE</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{formatDate(claim.report_date)}</p>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>CREATED</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{formatDate(claim.created_at)}</p>
              </div>

              <div>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>LAST UPDATED</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{formatDate(claim.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimDetail;