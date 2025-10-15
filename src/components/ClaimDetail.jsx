import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Trash2, Calendar, DollarSign, MapPin, Phone, Mail, FileText, AlertCircle, Home, Wrench } from 'lucide-react';

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
      const data = await response.json();
      setClaim(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching claim:', error);
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/claims/${id}/files`);
      const data = await response.json();
      setFiles(Array.isArray(data) ? data : []);
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
      const response = await fetch(`${API_URL}/api/files/${fileId}`);
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
      await fetch(`${API_URL}/api/files/${fileId}`, {
        method: 'DELETE',
      });
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!claim) {
    return <div className="flex justify-center items-center h-64">Claim not found</div>;
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Claims
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Claim {claim.claim_number || claim.id}
          </h1>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              {claim.status || 'new'}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {claim.priority || 'normal'} priority
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Policyholder Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Policyholder Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">NAME</p>
                  <p className="font-medium text-gray-900">{claim.insured_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">POLICY NUMBER</p>
                  <p className="font-medium text-gray-900">{claim.policy_number || 'N/A'}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-blue-600">{claim.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{claim.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loss Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Loss Information</h2>
              
              <div className="flex items-start gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">LOSS ADDRESS</p>
                  <p className="font-medium text-gray-900">{claim.loss_address || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Loss Date</p>
                    <p className="font-medium text-gray-900">{formatDate(claim.date_of_loss)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Estimated Loss</p>
                    <p className="font-medium text-green-600">{formatCurrency(claim.estimated_loss)}</p>
                  </div>
                </div>
              </div>

              {claim.cause_of_loss && (
                <div className="mt-4 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">CAUSE OF LOSS</p>
                    <p className="font-medium text-gray-900">{claim.cause_of_loss}</p>
                  </div>
                </div>
              )}

              {claim.property_type && (
                <div className="mt-4 flex items-start gap-2">
                  <Home className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">PROPERTY TYPE</p>
                    <p className="font-medium text-gray-900">{claim.property_type}</p>
                  </div>
                </div>
              )}

              {claim.loss_description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">LOSS DESCRIPTION</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{claim.loss_description}</p>
                </div>
              )}

              {claim.damage_description && (
                <div className="mt-4 flex items-start gap-2">
                  <Wrench className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">DAMAGE DESCRIPTION</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{claim.damage_description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Documents & Files */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Documents & Files</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="mb-3"
                />
                <button
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>

              {files.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No files uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{file.filename}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(file.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(file.id, file.filename)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Assignment & Metadata */}
          <div className="space-y-6">
            {/* Claim Assignment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Claim Assignment</h2>
              
              {claim.tracking_number && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">TRACKING NUMBER</p>
                  <p className="font-medium text-gray-900">Carrier Claim Number: {claim.tracking_number}</p>
                </div>
              )}

              {claim.ia_firm_file_number && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">IA FIRM FILE #</p>
                  <p className="font-medium text-gray-900">Claim File Number: {claim.ia_firm_file_number}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">ASSIGNED TO</p>
                <p className="font-medium text-gray-900">{claim.assigned_to || 'Unassigned'}</p>
              </div>

              {claim.report_date && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">REPORT DATE</p>
                  <p className="font-medium text-gray-900">{formatDate(claim.report_date)}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">CREATED</p>
                <p className="font-medium text-gray-900">{formatDate(claim.created_at)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">LAST UPDATED</p>
                <p className="font-medium text-gray-900">{formatDate(claim.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimDetail;