import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Trash2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/api';
import AlertModal from './AlertModal';
import ConfirmationModal from './ConfirmationModal';

export default function ViewRequestDetailsModal({ isOpen, onClose, requestId }) {
  const navigate = useNavigate();
  const [requestDetails, setRequestDetails] = useState(null);
  const [fileRequests, setFileRequests] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileRequest, setSelectedFileRequest] = useState(null);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [additionalFilesToUpload, setAdditionalFilesToUpload] = useState([]);
  const [error, setError] = useState(null);

  // Modal states
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen && requestId) {
      fetchRequestDetails();
    }
  }, [isOpen, requestId]);

  const fetchRequestDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch request details
      const requestResponse = await apiService.getRequestById(requestId);
      if (requestResponse.success) {
        setRequestDetails(requestResponse.data.request);
        setUploadedFiles(requestResponse.data.files || []);
      }

      // Fetch file requests for this request
      const fileRequestsResponse = await apiService.getFileRequestsByRequest(requestId);
      if (fileRequestsResponse.success) {
        setFileRequests(fileRequestsResponse.fileRequests || []);
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      setError('Failed to load request details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event, isAdditional = false) => {
    const files = Array.from(event.target.files).filter(
      file => file.type === 'application/pdf'
    );
    if (files.length > 0) {
      if (isAdditional) {
        // Append to existing additional files instead of replacing
        setAdditionalFilesToUpload(prev => [...prev, ...files]);
      } else {
        // Append to file request files instead of replacing
        setFilesToUpload(prev => [...prev, ...files]);
      }
    } else {
      setAlertConfig({
        isOpen: true,
        type: 'warning',
        title: 'Invalid File Type',
        message: 'Please select PDF files only',
        onConfirm: () => setAlertConfig({ ...alertConfig, isOpen: false })
      });
    }
  };

  const removeFile = (index, isAdditional = false) => {
    if (isAdditional) {
      setAdditionalFilesToUpload(prev => prev.filter((_, i) => i !== index));
    } else {
      setFilesToUpload(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = async (fileRequestId = null, isAdditional = false) => {
    const filesToProcess = isAdditional ? additionalFilesToUpload : filesToUpload;

    if (filesToProcess.length === 0) {
      setAlertConfig({
        isOpen: true,
        type: 'warning',
        title: 'No Files Selected',
        message: 'Please select files to upload',
        onConfirm: () => setAlertConfig({ ...alertConfig, isOpen: false })
      });
      return;
    }

    try {
      setIsUploading(true);

      // Upload each file
      const uploadedFileIds = [];
      for (const file of filesToProcess) {
        const uploadResponse = await apiService.uploadRequestFile(requestId, file);
        if (uploadResponse.success) {
          uploadedFileIds.push(uploadResponse.data.fileId);
        }
      }

      // If this is in response to a file request, mark it as fulfilled
      if (fileRequestId) {
        await apiService.respondToFileRequest(fileRequestId, uploadedFileIds);
      }

      // Reset and refresh
      if (isAdditional) {
        setAdditionalFilesToUpload([]);
      } else {
        setFilesToUpload([]);
      }
      setSelectedFileRequest(null);
      await fetchRequestDetails();

      setAlertConfig({
        isOpen: true,
        type: 'success',
        title: 'Upload Successful',
        message: 'Files uploaded successfully!',
        onConfirm: () => setAlertConfig({ ...alertConfig, isOpen: false })
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload files. Please try again.',
        onConfirm: () => setAlertConfig({ ...alertConfig, isOpen: false })
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRequest = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDelete(false);

    try {
      await apiService.deleteRequest(requestId);
      setAlertConfig({
        isOpen: true,
        type: 'success',
        title: 'Request Deleted',
        message: 'Your request has been deleted successfully.',
        onConfirm: () => {
          onClose();
          navigate('/executive-employee-dashboard');
        }
      });
    } catch (error) {
      console.error('Error deleting request:', error);
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Deletion Failed',
        message: error.message || 'Failed to delete request. It may have already been claimed by HR.',
        onConfirm: () => setAlertConfig({ ...alertConfig, isOpen: false })
      });
    }
  };

  const isEditable = requestDetails?.assigned_hr_id === null;
  const pendingFileRequests = fileRequests.filter(fr => fr.status === 'pending');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center rounded-t-lg">
          <h2 className="text-2xl font-bold">Request Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchRequestDetails}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Request Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Request ID:</span>
                  <span className="ml-2 text-gray-900">{requestDetails?.request_number || requestDetails?.id}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Type:</span>
                  <span className="ml-2 text-gray-900">
                    {requestDetails?.request_type === 'letter_of_approval' ? 'Letter of Approval' : 'Letter of Authorization'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className="ml-2 capitalize text-gray-900">
                    {requestDetails?.current_status === 'hr_processing' ? 'Human Resource Review' :
                     requestDetails?.current_status === 'benefits_review' ? 'Benefits Officer Review' :
                     requestDetails?.current_status === 'welfare_review' ? 'Division Head Review' :
                     requestDetails?.current_status?.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(requestDetails?.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending File Requests Alert */}
            {pendingFileRequests.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-start">
                  <AlertCircle className="text-yellow-600 mr-3 flex-shrink-0" size={24} />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                      Additional Files Requested
                    </h4>
                    {pendingFileRequests.map((fileRequest) => (
                      <div key={fileRequest.id} className="mb-4 p-3 bg-white rounded border border-yellow-200">
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-semibold">From:</span> {fileRequest.requested_by_first_name} {fileRequest.requested_by_last_name} (
                          {fileRequest.requested_by_role === 'hr_personnel' ? 'Human Resource Personnel' :
                           fileRequest.requested_by_role === 'benefits_officer' ? 'Benefits Officer' :
                           fileRequest.requested_by_role === 'welfare_head' ? 'Division Head' :
                           fileRequest.requested_by_role?.replace('_', ' ')})
                        </p>
                        <p className="text-sm text-gray-700 mb-3">
                          <span className="font-semibold">Message:</span> {fileRequest.message}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          Requested on: {new Date(fileRequest.created_at).toLocaleDateString()}
                        </p>

                        {/* File Upload Section */}
                        <div className="mt-3 space-y-3">
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf"
                              multiple
                              onChange={(e) => handleFileSelect(e, false)}
                              id={`file-upload-request-${fileRequest.id}`}
                              className="hidden"
                            />
                            <label
                              htmlFor={`file-upload-request-${fileRequest.id}`}
                              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 cursor-pointer transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                            >
                              <FileText size={18} />
                              Add Files (PDF only)
                            </label>
                          </div>
                          {filesToUpload.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-gray-700">Selected Files:</p>
                              {filesToUpload.map((file, index) => (
                                <div key={index} className="flex items-center justify-between gap-2 text-sm bg-green-50 px-3 py-2 rounded-lg">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText size={16} className="text-green-700 flex-shrink-0" />
                                    <span className="font-medium text-green-700 truncate">{file.name}</span>
                                  </div>
                                  <button
                                    onClick={() => removeFile(index, false)}
                                    className="p-1 hover:bg-red-100 rounded-full transition flex-shrink-0"
                                    title="Remove file"
                                  >
                                    <Trash2 size={14} className="text-red-600" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={() => handleFileUpload(fileRequest.id, false)}
                            disabled={isUploading || filesToUpload.length === 0}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <Upload size={18} />
                            {isUploading ? 'Uploading...' : 'Upload Files'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Upload Additional Files (only if editable) */}
            {isEditable && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Upload className="text-blue-600" size={20} />
                  Upload Additional Files
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  You can upload additional files to your request before it is claimed by HR.
                </p>
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={(e) => handleFileSelect(e, true)}
                      id="file-upload-additional"
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload-additional"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 cursor-pointer transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                    >
                      <FileText size={18} />
                      Add Files (PDF only)
                    </label>
                  </div>
                  {additionalFilesToUpload.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700">Selected Files:</p>
                      {additionalFilesToUpload.map((file, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 text-sm bg-green-50 px-3 py-2 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText size={16} className="text-green-700 flex-shrink-0" />
                            <span className="font-medium text-green-700 truncate">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile(index, true)}
                            className="p-1 hover:bg-red-100 rounded-full transition flex-shrink-0"
                            title="Remove file"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => handleFileUpload(null, true)}
                    disabled={isUploading || additionalFilesToUpload.length === 0}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    {isUploading ? 'Uploading...' : 'Upload Files'}
                  </button>
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Uploaded Files</h3>
              {uploadedFiles.length === 0 ? (
                <p className="text-gray-500 text-sm">No files uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="text-blue-600" size={20} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.original_filename}</p>
                          <p className="text-xs text-gray-500">
                            {file.submission_type === 'initial_submission' ? 'Initial Submission' : 'Additional Files'}
                            {' • '}
                            Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              {isEditable && (
                <button
                  onClick={handleDeleteRequest}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Request
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
      />

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmDelete}
        title="Delete Request"
        message="Are you sure you want to delete this request? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
